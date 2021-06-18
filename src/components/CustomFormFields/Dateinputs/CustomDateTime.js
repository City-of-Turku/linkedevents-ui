import React from 'react'
import DatePicker, {registerLocale} from 'react-datepicker'
import PropTypes from 'prop-types'
import {FormGroup, Label, Input} from 'reactstrap'
import 'react-datepicker/dist/react-datepicker.css'
import './CustomDateTime.scss'
import DatePickerButton from './DatePickerButton'
import moment from 'moment'
import {FormattedMessage} from 'react-intl'
import fi from 'date-fns/locale/fi'
import sv from 'date-fns/locale/sv'
import {connect} from 'react-redux'
import {setData as setDataAction, updateSubEvent as updateSubEventAction} from 'src/actions/editor'
import {roundDateToCorrectUnit, getCorrectInputLabel, getCorrectMinDate, getDatePickerOpenDate, convertDateToLocaleString, getDateFormat} from './utils/datetime'
import ValidationNotification from 'src/components/ValidationNotification'


class CustomDateTime extends React.Component {
    constructor(props){
        super(props)
        const {defaultValue} = this.props

        registerLocale('fi', fi)
        registerLocale('sv', sv)

        this.state = {
            dateInputValue: defaultValue ? convertDateToLocaleString(defaultValue, 'date') : '',
            timeInputValue: defaultValue ? convertDateToLocaleString(defaultValue, 'time') : '',
        }

        this.handleInputChangeDate = this.handleInputChangeDate.bind(this)
        this.handleInputChangeTime = this.handleInputChangeTime.bind(this)
        this.handleInputBlur = this.handleInputBlur.bind(this)
        this.handleDateTimePickerChange = this.handleDateTimePickerChange.bind(this)
        this.handleDataUpdate = this.handleDataUpdate.bind(this)
        this.validateDate = this.validateDate.bind(this)

        this.firstInput = React.createRef()
    }
    
    static contextTypes = {
        intl: PropTypes.object,
    }

    handleInputChangeDate(event){
        this.setState({dateInputValue: event.target.value, showValidationError: false})
    }

    handleInputChangeTime(event){
        this.setState({timeInputValue: event.target.value, showValidationError: false})
    }

    handleInputBlur(){
        const {dateInputValue, timeInputValue} = this.state
        if(!dateInputValue && !timeInputValue){
            this.setState({showValidationError: false})
        }
        this.handleDataUpdate(dateInputValue, timeInputValue)
    }

    handleDateTimePickerChange(value, type){
        const convertedValue = convertDateToLocaleString(value, type)
        if(type === 'date'){
            this.setState({dateInputValue: convertedValue})
            this.handleDataUpdate(convertedValue, this.state.timeInputValue)
        }
        if(type === 'time') {
            this.setState({timeInputValue: convertedValue})
            this.handleDataUpdate(this.state.dateInputValue, convertedValue)
        }
    }
       
    handleDataUpdate(date, time){
        const {setData, setDirtyState, updateSubEvent, minDate, eventKey, name} = this.props;
        let formattedDatetime = undefined
        if(date && time){
            // combine date and time into single datetime which is used in upper scope
            const datetimeString = `${date} ${time}`
            const datetime = roundDateToCorrectUnit(moment(datetimeString, getDateFormat('date-time'), true), 'date-time')
            if(this.validateDate(datetime, minDate)){
                formattedDatetime = moment(datetime).tz('Europe/Helsinki').utc().toISOString()                
            }
        }
        if(eventKey){
            updateSubEvent(formattedDatetime, name, eventKey)
        }
        else{
            setData({[name]: formattedDatetime})
        }
        setDirtyState()
    }

    validateDate(date, minDate){
        if(!moment(date, getDateFormat('date-time'), true).isValid()){
            this.setState({
                validationErrorText: <FormattedMessage id="invalid-date-time-format" />,
                showValidationError: true,
            })
            return false
        }
        if(minDate){
            if(moment(date).isBefore(minDate)){
                this.setState({
                    validationErrorText: <FormattedMessage id="validation-afterStartTimeAndInFuture" />,
                    showValidationError: true,
                })
                return false
            }
        }

        this.setState({
            showValidationError: false,
        })
        return true
    }

    componentDidMount(){
        if(this.props.setInitialFocus){
            this.firstInput.current.focus()
        }
    }

    componentDidUpdate(prevProps) {
        // Update validation if min or max date changes and dateInputValue and timeInputValue are not empty
        const {minDate, maxDate} = this.props
        const {dateInputValue, timeInputValue} = this.state
        if (minDate !== prevProps.minDate || maxDate !== prevProps.maxDate) {
            if(dateInputValue && timeInputValue) {
                const datetimeString = `${this.state.dateInputValue} ${this.state.timeInputValue}`
                this.validateDate(moment(datetimeString, getDateFormat('date-time'), true), minDate)
            }
        }
        if (prevProps.defaultValue !== this.props.defaultValue) {
            this.setState({
                dateInputValue: this.props.defaultValue ? convertDateToLocaleString(this.props.defaultValue, 'date') : dateInputValue,
                timeInputValue: this.props.defaultValue ? convertDateToLocaleString(this.props.defaultValue, 'time') : timeInputValue,
            })
        }
    }


    render() {
        const {labelDate, labelTime, name, id, defaultValue, minDate, maxDate, disabled, required, intl, validationErrors} = this.props
        const {dateInputValue, timeInputValue, showValidationError, validationErrorText} = this.state
        const inputErrorId = 'date-input-error__' + id
        const dateFieldId = `${id}-date-field`
        const timeFieldId = `${id}-time-field`
        const validDate = moment(dateInputValue, 'D.M.YYYY', true).isValid()
        const validTime = moment(timeInputValue, 'H.mm', true).isValid()

        return (
            <div>
                <div className="custom-date-time-input">
                    <FormGroup>
                        <Label for={dateFieldId}>{getCorrectInputLabel(labelDate)}{required ? '*' : ''}</Label>
                        <div className="input-and-button"  ref={ref => this.containerRef = ref}>
                            <div className='input-wrapper'>
                                <DatePicker
                                    id={dateFieldId + '-button'}
                                    disabled={disabled}
                                    onChange={(value) => this.handleDateTimePickerChange(value, 'date')}
                                    customInput={<DatePickerButton type={'date'} intl={intl} disabled={disabled} />}
                                    locale={this.context.intl.locale}
                                    openToDate={getDatePickerOpenDate(defaultValue, minDate)}
                                    minDate={getCorrectMinDate(minDate)}
                                    maxDate={maxDate && new Date(maxDate)}
                                    showPopperArrow={true}
                                    popperPlacement={'bottom-end'}
                                    popperModifiers={{
                                        preventOverflow: {
                                            enabled: true,
                                            escapeWithReference: false,
                                            boundariesElement: 'viewport',
                                        },
                                    }}
                                />
                                <Input
                                    aria-describedby={showValidationError ? inputErrorId : undefined}
                                    aria-invalid={showValidationError}
                                    invalid={dateInputValue ? false : Array.isArray(validationErrors)}
                                    type="text"
                                    name={name}
                                    id={dateFieldId}
                                    value={dateInputValue ? dateInputValue : ''}
                                    onChange={this.handleInputChangeDate}
                                    onBlur={this.handleInputBlur}
                                    disabled={disabled}
                                    aria-required={required}
                                    innerRef={this.firstInput}
                                />
                                {validationErrors && !validDate &&
                                <div className='validation-notification'/>
                                }
                            </div>
                            <ValidationNotification
                                anchor={this.containerRef}
                                validationErrors={dateInputValue ? undefined : validationErrors}
                                className='validation-dateTime' 
                            />
                        </div>
                    </FormGroup>
                    <FormGroup>
                        <Label for={timeFieldId}>{getCorrectInputLabel(labelTime)}{required ? '*' : ''}</Label>
                        <div className="input-and-button"  ref={ref => this.containerRef = ref}>
                            <div className='input-wrapper'>
                                <DatePicker
                                    id={timeFieldId + '-button'}
                                    disabled={disabled}
                                    onChange={(value) => this.handleDateTimePickerChange(value, 'time')}
                                    customInput={<DatePickerButton type={'time'} intl={intl} disabled={disabled} />}
                                    locale={this.context.intl.locale}
                                    showTimeSelect
                                    showTimeSelectOnly
                                    timeIntervals={15}
                                    timeCaption={<FormattedMessage id='time' />}
                                    timeFormat="HH.mm"
                                    showPopperArrow={true}
                                    popperPlacement={'bottom-end'}
                                    popperModifiers={{
                                        preventOverflow: {
                                            enabled: true,
                                            escapeWithReference: false,
                                            boundariesElement: 'viewport',
                                        },
                                    }}
                                />
                                <Input
                                    aria-describedby={showValidationError ? inputErrorId : undefined}
                                    aria-invalid={showValidationError}
                                    invalid={timeInputValue ? false : Array.isArray(validationErrors)}
                                    type="text"
                                    name={name}
                                    id={timeFieldId}
                                    value={timeInputValue ? timeInputValue : ''}
                                    onChange={this.handleInputChangeTime}
                                    onBlur={this.handleInputBlur}
                                    disabled={disabled}
                                    aria-required={required}
                                />
                                {validationErrors && !validTime &&
                                <div className='validation-notification'/>
                                }
                            </div>
                            <ValidationNotification
                                anchor={this.containerRef}
                                validationErrors={timeInputValue ? undefined : validationErrors}
                                className='validation-dateTime' 
                            />
                        </div>
                    </FormGroup>
                </div>
                {showValidationError && 
                        <p id={inputErrorId} role="alert" className="date-input-error">{validationErrorText}</p>}
            </div>
        )
    }
}

CustomDateTime.propTypes = {
    labelDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    labelTime: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    onChange: PropTypes.func,
    maxDate: PropTypes.object,
    minDate: PropTypes.object,
    disablePast: PropTypes.bool,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    setDirtyState: PropTypes.func,
    setData: PropTypes.func,
    setInitialFocus: PropTypes.bool,
    updateSubEvent: PropTypes.func,
    eventKey: PropTypes.string,
    intl: PropTypes.object,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
};

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
    updateSubEvent: (value, property, eventKey) => dispatch(updateSubEventAction(value, property, eventKey)),
})
export {CustomDateTime as UnconnectedCustomDateTime}
export default connect(null, mapDispatchToProps)(CustomDateTime)
