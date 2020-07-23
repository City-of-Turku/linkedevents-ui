import React from 'react'
import DatePicker, {registerLocale} from 'react-datepicker'
import PropTypes from 'prop-types'
import {FormGroup, Label, Input, Button} from 'reactstrap'
import 'react-datepicker/dist/react-datepicker.css'
import './CustomDatePicker.scss'
import moment from 'moment'
import {FormattedMessage} from 'react-intl'
import fi from 'date-fns/locale/fi'
import sv from 'date-fns/locale/sv'


class CustomDatePicker extends React.Component {
    constructor(props){
        super(props)

        // add language support for date picker
        registerLocale('fi', fi)
        registerLocale('sv', sv)

        this.state = {
            inputValue: props.defaultValue ? this.convertDateToLocaleString(props.defaultValue) : '',
            showValidationError: false,
            validationErrorText: '',
        }

        this.convertDateToLocaleString = this.convertDateToLocaleString.bind(this)
        this.getDateFormat = this.getDateFormat.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleInputBlur = this.handleInputBlur.bind(this)
        this.handleDatePickerChange = this.handleDatePickerChange.bind(this)
        this.validateDate = this.validateDate.bind(this)
        this.getCorrectInputLabel = this.getCorrectInputLabel.bind(this)
        this.getCorrectMinDate = this.getCorrectMinDate.bind(this)
        this.roundDateToCorrectUnit = this.roundDateToCorrectUnit.bind(this)
        this.getDatePickerOpenDate = this.getDatePickerOpenDate.bind(this)
    }

    static contextTypes = {
        intl: PropTypes.object,
    }

    handleInputChange(event){
        this.setState({inputValue: event.target.value, showValidationError: false})
    }

    handleInputBlur(){
        const {minDate, onChange, defaultValue, type} = this.props
        const inputValue = this.state.inputValue

        if(inputValue){
            const date = this.roundDateToCorrectUnit(moment(inputValue, this.getDateFormat(type), true))
            if(this.validateDate(date, minDate)){
                onChange(date)
            }
            else{
                // update date even if it's invalid
                onChange(undefined)
            }
        }
        else{
            this.setState({showValidationError: false})

            // no need to update value if it's already empty
            if(defaultValue){
                onChange(undefined)
            }
        }
    }

    handleDatePickerChange(value){
        this.setState({inputValue: this.convertDateToLocaleString(value)})
        this.validateDate(value, this.props.minDate)
        const date = this.roundDateToCorrectUnit(moment(value, this.getDateFormat(this.props.type)))
        this.props.onChange(date)
    }

    /**
     * Checks that date is in valid format and after min date.
     * If validation error is found, sets correct validation error text,
     * marks validation error to be shown and returns false.
     * If no validation error is found, marks validation error not to be shown
     * and returns true.
     */
    validateDate(date, minDate){
        if(!moment(date,this.getDateFormat(this.props.type), true).isValid()){
            this.setState({
                validationErrorText: <FormattedMessage id="invalid-date-format" />,
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

    convertDateToLocaleString(date){
        return moment(date).format(this.getDateFormat(this.props.type));
    }

    getDateFormat(type){
        switch(type){
            case 'date':
                return 'D.M.YYYY'
            case 'time':
                return 'H.mm'
            case 'date-time':
                return 'D.M.YYYY H.mm'
            default:
                return 'D.M.YYYY'
        }
    }

    roundDateToCorrectUnit(date){
        switch(this.props.type){
            case 'time':
            case 'date-time':
                return date.startOf('minute')
            case 'date':
            default:
                return date.startOf('day')
        }
    }

    getCorrectInputLabel(label){
        if(!label)
            return undefined
        else if(typeof(label) === 'object')
            return label
        else
            return <FormattedMessage id={label} />
    }

    getCorrectMinDate(minDate, disablePast){
        if(!minDate && !disablePast)
            return undefined
        else if(!disablePast && minDate)
            return new Date(minDate)
        else if(disablePast && moment(minDate).isAfter(moment()))
            return new Date(minDate)
        else
            return new Date()
    }

    // returns the date DatePicker will show as selected when calendar is opened
    getDatePickerOpenDate(defaultValue, minDate){
        if(defaultValue)
            return new Date(defaultValue)
        else if(minDate)
            return new Date(minDate)
        else
            return new Date(this.roundDateToCorrectUnit(moment()))
    }

    componentDidUpdate(prevProps) {
        // Update validation if min or max date changes and state.inputValue is not empty
        const {minDate, maxDate, type} = this.props
        if (minDate !== prevProps.minDate || maxDate !== prevProps.maxDate) {
            if(this.state.inputValue) {
                this.validateDate(moment(this.state.inputValue, this.getDateFormat(type), true), minDate)
            }
        }
    }

    render(){
        const {label, name, id, defaultValue, minDate, maxDate, type, disabled} = this.props
        const inputValue = this.state.inputValue
        const inputErrorId = 'date-input-error__' + id
        return(
            <div className="custom-date-input">
                <FormGroup>
                    <Label for={id}>{this.getCorrectInputLabel(label)}</Label>
                    <div className="input-and-button">
                        <Input
                            aria-describedby={this.state.showValidationError ? inputErrorId : undefined}
                            aria-invalid={this.state.showValidationError}
                            type="text"
                            name={name}
                            id={id}
                            value={inputValue ? inputValue : ''}
                            onChange={this.handleInputChange}
                            onBlur={this.handleInputBlur}
                            disabled={disabled}
                        />
                        <DatePicker
                            disabled={disabled}
                            openToDate={this.getDatePickerOpenDate(defaultValue, minDate)}
                            onChange={this.handleDatePickerChange}
                            customInput={<DatePickerButton disabled={disabled}/>}
                            minDate={this.getCorrectMinDate(minDate)}
                            maxDate={maxDate && new Date(maxDate)}
                            locale={this.context.intl.locale}
                            showTimeSelect={type !== 'date'}
                            showTimeSelectOnly={type === 'time'}
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
                    </div>
                      
                    {this.state.showValidationError && 
                        <p id={inputErrorId} role="alert" className="date-input-error">{this.state.validationErrorText}</p>}
                </FormGroup>
            </div>
        )
    }
}

CustomDatePicker.defaultProps = {
    type: 'date',
    disablePast: false,
    disabled: false,
}

CustomDatePicker.propTypes = {
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    name: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    defaultValue: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    onChange: PropTypes.func.isRequired,
    maxDate: PropTypes.object,
    minDate: PropTypes.object,
    type: PropTypes.oneOf(['date', 'time', 'date-time']),
    disablePast: PropTypes.bool,
    disabled: PropTypes.bool,
};

class DatePickerButton extends React.Component{
    static contextTypes = {
        intl: PropTypes.object,
    }

    render(){
        const {onClick, disabled} = this.props
        return <Button
            disabled={disabled}
            aria-hidden
            aria-label={this.context.intl.formatMessage({id: 'date-picker-button-label'})}
            tabIndex={-1}
            onClick={onClick}
            className="glyphicon glyphicon-calendar custom-date-input__button">
        </Button>
    }
}

DatePickerButton.propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool,
}

export {DatePickerButton}

export default CustomDatePicker
