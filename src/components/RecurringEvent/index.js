import './RecurringEvent.scss'
import PropTypes from 'prop-types';
import React from 'react'
import moment from 'moment-timezone'
import {isNil, isEmpty} from 'lodash'
import DayCheckbox from './DayCheckbox'
import {Button, Modal, ModalHeader, ModalBody} from 'reactstrap';
import {setEventData, sortSubEvents} from 'src/actions/editor'
import validationRules from 'src/validation/validationRules'
import ValidationNotification from 'src/components/ValidationNotification'
import constants from '../../constants'
import CustomDatePicker from '../CustomFormFields/Dateinputs/CustomDatePicker'
import {
    FormattedMessage,
    injectIntl,
    intlShape,
} from 'react-intl'
import classNames from 'classnames';

//Changed Material UI Dialog & Button to Reactstrap Modal & Button
//Added isOpen prop for Modal & const closebtn for ModalHeaders close-attribute
//Added row-color className to {days} row for city_theme

const {VALIDATION_RULES, GENERATE_LIMIT} = constants

class RecurringEvent extends React.Component {

    static contextTypes = {
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    }

    static propTypes = {
        values: PropTypes.object,
        toggle: PropTypes.func,
        validationErrors: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]),
        formType: PropTypes.string,
        isOpen: PropTypes.bool,
        intl: intlShape,
    }

    constructor (props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onCheckboxChange = this.onCheckboxChange.bind(this)
        this.weekIntervalChange = this.weekIntervalChange.bind(this)
        this.onTimeChange = this.onTimeChange.bind(this)

        this.repetitionRef = React.createRef()
        this.playDateRef = React.createRef()
        this.startDateRef = React.createRef()
        this.startTimeRef = React.createRef()
        this.endDateRef = React.createRef()

        const {start_time, end_time} = props.values
        const dateInvalid = (date) => isEmpty(date) || !moment(date).isValid()

        this.state = {
            subEvents: {overMaxAmount: false, newSubCount: 0, existingSubCount: this.getExistingSubCount(props.values)},
            weekInterval: 1,
            daysSelected: {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false,
            },
            recurringStartDate: dateInvalid(start_time) ? null : moment(start_time).add(1, 'weeks'),
            recurringStartTime: dateInvalid(start_time) ? null : moment(start_time),
            recurringEndDate: dateInvalid(end_time) ? null : moment(end_time).add(2, 'weeks'),
            recurringEndTime: dateInvalid(end_time) ? null : moment(end_time),
            errors: {
                weekInterval: null,
                daysSelected: null,
                recurringStartDate: null,
                recurringEndDate: null,
            },
        }
    }

    clearErrors = () => {
        this.setState({
            errors: {
                weekInterval: null,
                daysSelected: null,
                recurringStartDate: null,
                recurringEndDate: null,
            },
        })
    }

    onChange (type, value) {
        this.clearErrors()
        this.setState({
            [type]: value,
        })
    }
    onTimeChange (name, time) {
        this.clearErrors()
        this.setState({
            [name]: time,
        })
    }

    /**
     * Get amount of sub events that have start_time defined
     * @param values data of sub_events
     * @returns number
     */
    getExistingSubCount(values) {
        let count = 0
        for (const event in values.sub_events) {
            if (values.sub_events[event].start_time) {

                count += 1
            }
        }
        return count;
    }

    generateEvents = (counter = false) => {
        const {
            recurringStartDate,
            recurringStartTime,
            recurringEndDate,
            recurringEndTime,
            daysSelected,
            weekInterval,
            subEvents,
        } = this.state
        const errors = this.getValidationErrors()

        // handle validation errors
        if (errors.length > 0) {
            this.setState(state => ({
                errors: errors
                    .reduce((acc, error) =>
                        ({...acc, [error.key]: error.rule}), {...state.errors}),
            }))
            // if no validation errors, format datetime
        } else {
            if (recurringStartDate && recurringEndDate && weekInterval > 0) {
                const days = Object.keys(daysSelected)
                    .reduce((acc, key) =>
                        daysSelected[key]
                            ? {...acc, [key]: key}
                            : acc, {})
                const dayCodes = {
                    monday: 1,
                    tuesday: 2,
                    wednesday: 3,
                    thursday: 4,
                    friday: 5,
                    saturday: 6,
                    sunday: 7,
                }
                let eventLength
                if (recurringEndTime) {
                    eventLength = moment(recurringEndTime).diff(recurringStartTime, 'minutes')
                }

                const formattedRecurringStartTime = {
                    hours: recurringStartTime ? recurringStartTime.hours() : 0,
                    minutes: recurringStartTime ? recurringStartTime.minutes() : 0,
                }
                const formattedRecurringEndTime = {
                    hours: recurringEndTime ? recurringEndTime.hours() : 0,
                    minutes: recurringEndTime ? recurringEndTime.minutes() : 0,
                }

                let count = 1
                let newSubEvents = []

                for (const key in days) {
                    if (days.hasOwnProperty(key)) {
                        const day = dayCodes[days[key]]
                        // find the first valid matching weekday
                        let firstMatchWeekday
                        const recurrenceStart = moment(recurringStartDate).subtract(1, 'day').endOf('day')
                        const recurrenceEnd = moment(recurringEndDate).endOf('day')
                        for (let i = 0; i <= weekInterval; i++) {
                            const startDateWeekday = moment(recurringStartDate).isoWeekday(day + i * 7)
                            if (startDateWeekday.isBetween(recurrenceStart, recurrenceEnd)) {
                                firstMatchWeekday = startDateWeekday
                                break
                            }
                        }
                        // calculate all the following weekdays using weekInterval as step
                        for (
                            let matchWeekday = firstMatchWeekday;
                            matchWeekday.isBetween(recurrenceStart, recurrenceEnd);
                            matchWeekday = matchWeekday.add(weekInterval, 'week')
                        ) {
                            let obj = {}
                            const key = Object.keys(this.props.values.sub_events).length + count
                            count += 1
                            const startTime = matchWeekday.hours(formattedRecurringStartTime.hours).minutes(formattedRecurringStartTime.minutes)
                            let endTime
                            if (recurringEndTime) {
                                endTime = Object.assign({}, startTime)
                                endTime = moment(endTime).add(eventLength, 'minutes').hours(formattedRecurringEndTime.hours).minutes(recurringEndTime.minutes)
                            }

                            obj[key] = {
                                start_time: moment.tz(startTime, 'Europe/Helsinki').utc().toISOString(),
                                end_time: endTime ? moment.tz(endTime, 'Europe/Helsinki').utc().toISOString() : undefined,
                            }

                            newSubEvents.push([obj, key]);
                        }
                    }
                }

                const SubEventsLeft = GENERATE_LIMIT.EVENT_LENGTH - subEvents.existingSubCount
                if (counter) {
                    this.setState({
                        subEvents: {
                            ...this.state.subEvents,
                            overMaxAmount: newSubEvents.length > SubEventsLeft,
                            newSubCount: newSubEvents.length},
                    }
                    )
                    return;
                }

                if (!subEvents.overMaxAmount) {
                    for (const event of newSubEvents) {
                        this.context.dispatch(setEventData(event[0],event[1]));
                    }
                    this.props.toggle()
                    this.context.dispatch(sortSubEvents())
                }
            }
        }
    }
    getValidationErrors = () => {
        const {
            recurringStartDate,
            recurringEndDate,
            daysSelected,
            weekInterval,
        } = this.state
        const endDateTestObject = {
            type: 'end_date',
            start_time: !isNil(recurringStartDate) ? moment(recurringStartDate).format('YYYY-MM-DD') : recurringStartDate,
            end_time: !isNil(recurringEndDate) ? moment(recurringEndDate).subtract(1, 'day').format('YYYY-MM-DD') : recurringEndDate,
        }
        const intervalTestObject = {
            type: 'day_within_interval',
            daysSelected,
            start_day_index: moment(recurringStartDate).weekday(),
            end_day_index: moment(recurringEndDate).weekday(),
        }

        return [
            this.validate('weekInterval', VALIDATION_RULES.IS_MORE_THAN_ONE, weekInterval),
            this.validate('daysSelected', VALIDATION_RULES.AT_LEAST_ONE_IS_TRUE, daysSelected),
            this.validate('daysSelected', VALIDATION_RULES.DAY_WITHIN_INTERVAL, intervalTestObject),
            this.validate('recurringStartDate', VALIDATION_RULES.REQUIRED, recurringStartDate),
            this.validate('recurringEndDate', VALIDATION_RULES.REQUIRED, recurringEndDate),
            this.validate('recurringEndDate', VALIDATION_RULES.AFTER_START_TIME, endDateTestObject),
        ]
            .filter(item => !item.passed)
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.shouldUpdate(prevState) ) {
            this.generateEvents(true)
        }
    }

    shouldUpdate(prevState) {
        const {recurringStartDate, recurringEndDate, weekInterval, daysSelected} = this.state
        const StartDate = prevState.recurringStartDate !== recurringStartDate
        const EndDate = prevState.recurringEndDate !== recurringEndDate
        const DaysSelected = prevState.daysSelected !== daysSelected
        const WeekInterval = prevState.weekInterval !== weekInterval
        if (recurringStartDate && recurringEndDate) {
            return StartDate || EndDate || DaysSelected || WeekInterval
        }
    }

    validate = (key, type, value) => {
        const {recurringStartDate, recurringEndDate} = this.state

        if (value && value.type === 'end_date') {
            return {
                key,
                rule: type,
                passed: validationRules[type](value, value.end_time),
            }
        } else if (value && value.type === 'day_within_interval') {
            return {
                key,
                rule: type,
                passed: validationRules[type](value, moment(recurringEndDate).diff(recurringStartDate, 'days')),
            }
        } else if (typeof validationRules[type] === 'function') {
            return {
                key,
                rule: type,
                passed: validationRules[type](null, value),
            }
        }

        return {}
    }
    onCheckboxChange (key, value) {
        this.clearErrors()
        const newDays = Object.assign({}, this.state.daysSelected, {[key]: value})
        this.setState({daysSelected: newDays})
    }
    weekIntervalChange (event) {
        this.setState({weekInterval: event.target.value})
    }
    generateCheckboxes (days) {
        const dayElements = []
        for (const key in days) {
            if(days.hasOwnProperty(key)) {
                dayElements.push(<DayCheckbox key={key} day={key} onChange={this.onCheckboxChange} defaultChecked={days[key]}/>)
            }
        }
        return dayElements
    }
    UNSAFE_componentWillMount() {
        if(this.props.values.start_time) {
            let newDays = Object.assign({}, this.state.daysSelected)
            for(const key in newDays) {
                if(newDays.hasOwnProperty(key)) {
                    if(key == moment(this.props.values.start_time).locale('en').format('dddd').toLowerCase()){
                        newDays[key] = true
                    }
                }
            }
            this.setState({daysSelected: newDays})
        }
    }

    render() {
        const {recurringStartDate, recurringEndDate, errors, subEvents} = this.state
        const {intl} = this.props
        const SubEventsLeft = GENERATE_LIMIT.EVENT_LENGTH - subEvents.existingSubCount
        const days = this.generateCheckboxes(this.state.daysSelected)
        const closebtn = <Button onClick={this.props.toggle} aria-label={this.context.intl.formatMessage({id: `close-recurring-modal`})}><span className="glyphicon glyphicon-remove"></span></Button>
        return (
            <Modal
                className='recurringEvent'
                size='xl'
                isOpen={this.props.isOpen}
                toggle={this.props.toggle}
            >
                <ModalHeader tag='h1' close={closebtn}>
                    <FormattedMessage id="event-add-recurring"/>
                </ModalHeader>
                <ModalBody>
                    <div className="row">
                        <div className="col-xs-12 col-sm-12">
                            <FormattedMessage id="repetition-interval-label">{txt => <h2>{txt}</h2>}</FormattedMessage>
                            <div className="repetition-count" ref={this.repetitionRef}>
                                <label htmlFor="repeated">
                                    <FormattedMessage id="repeated" />
                                    <input
                                        aria-label={intl.formatMessage({id: 'repeated'}) + this.state.weekInterval + intl.formatMessage({id: 'repetition-interval'})}
                                        id="repeated"
                                        value={this.state.weekInterval}
                                        onFocus={event => event.target.select()}
                                        onBlur={() => this.clearErrors()}
                                        onChange={this.weekIntervalChange}
                                    />
                                    <FormattedMessage id='repetition-interval'/>
                                </label>
                                <ValidationNotification
                                    className='validation-notification modal-notification' 
                                    anchor={this.repetitionRef.current}
                                    validationErrors={errors['weekInterval'] && [errors['weekInterval']]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xs-12 col-sm-12">
                            <div
                                ref={this.playDateRef}
                                style={{
                                    display: 'inline-block',
                                    marginTop: '16px',
                                }}
                            >
                                <FormattedMessage id="play-date-label">{txt => <h3>{txt}</h3>}</FormattedMessage>
                            </div>
                            <ValidationNotification
                                className='validation-notification modal-notification' 
                                anchor={this.playDateRef.current}
                                validationErrors={errors['daysSelected'] && [errors['daysSelected']]}
                            />
                        </div>
                    </div>
                    <div className="row row-color">
                        { days }
                    </div>

                    <div className="row">
                        <div className="col-xs-12 col-sm-6">
                            <CustomDatePicker
                                id="recurringStartDate"
                                name="recurringStartDate"
                                label={
                                    <span ref={this.startDateRef}>
                                        <FormattedMessage  id="repetition-begin" />
                                    </span>
                                }
                                defaultValue={recurringStartDate}
                                maxDate={recurringEndDate ? moment(recurringEndDate) : undefined}
                                onChange={(value) => this.onChange('recurringStartDate', value)}
                            />
                            <ValidationNotification
                                className='validation-notification modal-notification' 
                                anchor={this.startDateRef.current}
                                validationErrors={errors['recurringStartDate'] && [errors['recurringStartDate']]}
                            />
                        </div>
                        <div className="col-xs-12 col-sm-6">
                            <CustomDatePicker
                                id="recurringEndDate"
                                name="recurringEndDate"
                                label={
                                    <span ref={this.endDateRef}>
                                        <FormattedMessage  id="repetition-end" />
                                    </span>
                                }
                                defaultValue={recurringEndDate}
                                disablePast
                                minDate={recurringStartDate ? moment(recurringStartDate) : undefined}
                                onChange={(value) => this.onChange('recurringEndDate', value)}
                            />
                            <ValidationNotification
                                className='validation-notification modal-notification' 
                                anchor={this.endDateRef.current}
                                validationErrors={errors['recurringEndDate'] && [errors['recurringEndDate']]}
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xs-12 col-sm-6">
                            <CustomDatePicker
                                type={'time'}
                                id="recurringStartTime"
                                name="recurringStartTime"
                                label={
                                    <span ref={this.startTimeRef}>
                                        <FormattedMessage  id="repetition-start-time" />
                                    </span>
                                }
                                defaultValue={this.state.recurringStartTime}
                                onChange={(value) => this.onTimeChange('recurringStartTime', value)}
                            />
                            <ValidationNotification
                                className='validation-notification modal-notification' 
                                anchor={this.startTimeRef.current}
                                validationErrors={errors['recurringStartTime'] && [errors['recurringStartTime']]}
                            />
                        </div>
                        <div className="col-xs-6 col-sm-6">
                            <CustomDatePicker
                                type={'time'}
                                id="recurringEndTime"
                                name="recurringEndTime"
                                label={<FormattedMessage  id="repetition-end-time" />}
                                defaultValue={this.state.recurringEndTime}
                                onChange={(value) => this.onTimeChange('recurringEndTime', value)}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div role="progressbar" aria-valuemax={SubEventsLeft} aria-valuenow={subEvents.newSubCount} className={classNames('tip', {'error': subEvents.overMaxAmount})}>
                            <p role='status' className='count-message'>
                                {!subEvents.overMaxAmount
                                    ?
                                    <FormattedMessage id='event-add-recurring-limit' values={{count: SubEventsLeft, subEventcount: subEvents.newSubCount}} />
                                    :
                                    <FormattedMessage id='event-add-recurring-error' values={{count: SubEventsLeft, subEventcount: subEvents.newSubCount}} />
                                }
                            </p>
                        </div>
                        <div className="col-xs-12 col-sm-12">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => this.generateEvents()}
                                style={{margin: '16px 0px 16px 0px'}}
                                disabled={subEvents.overMaxAmount}
                            >
                                <span className="glyphicon glyphicon-plus"></span>
                                <FormattedMessage id="add-more"/>
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        )
    }
}
export {RecurringEvent as RecurringEventWithoutIntl}
export default injectIntl(RecurringEvent)
