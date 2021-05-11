import React from 'react'
import {shallow, mount} from 'enzyme';
import DatePickerButton from '../DatePickerButton'
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Label, Input} from 'reactstrap';
import DatePicker from 'react-datepicker'
import moment from 'moment'
import constants from '../../../../constants'
const {VALIDATION_RULES, CHARACTER_LIMIT} = constants
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
import {UnconnectedCustomDateTime} from '../CustomDateTime';
import {roundDateToCorrectUnit, getCorrectInputLabel, getCorrectMinDate, convertDateToLocaleString, getDateFormat, getDatePickerOpenDate} from '../utils/datetime'
import ValidationNotification from '../../../ValidationNotification';



const defaultProps = {
    id: 'test-id',
    setData: () => {},
    updateSubEvent: () => {},
    name: 'test-name',
    eventKey: 'test-event-key',
    defaultValue: moment('2020-03-25'),
    setDirtyState: () => {},
    labelDate: 'event-starting-datelabel',
    labelTime: 'event-starting-timelabel',
    validationErrors: {error: 'test-error'},
    disabled: false,
    disablePast: false,
    minDate: moment('2020-03-23'),
    maxDate: moment('2020-04-23'),
    getDateFormat: () => {},
    required: true,
    setInitialFocus: false,
}
const typeFieldId = ['-date-field', '-time-field']

function getWrapper(props) {
    return shallow(<UnconnectedCustomDateTime {...defaultProps} {...props} />, {context: {intl}});
}

describe('renders', () => {
    describe('label', () => {
        test('with correct props', () => {
            const wrapper = getWrapper();
            const label = wrapper.find(Label)
            expect(label).toHaveLength(2);
            label.forEach((element, index) => {
                expect(element.prop('for')).toBe(defaultProps.id + typeFieldId[index])
            })
        })
        test('with correct text when field is required', () => {
            const required = true
            const wrapper = getWrapper({required});
            const label = wrapper.find(Label)
            expect(label.at(0, 1).prop('children')).toEqual([getCorrectInputLabel(defaultProps.labelDate, defaultProps.labelTime), '*'])
        })
        test('with correct text when field is not required', () => {
            const required = false
            const wrapper = getWrapper({required});
            const label = wrapper.find(Label)
            expect(label.at(0,1).prop('children')).toEqual([getCorrectInputLabel(defaultProps.labelDate, defaultProps.labelTime), ''])
        })
    })

    describe('Input', () => {
        test('with default props', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            const input = wrapper.find(Input)
            expect(input).toHaveLength(2);
            input.forEach((element, index) => {
                expect(element.prop('type')).toBe('text')
                expect(element.prop('name')).toBe(defaultProps.name)
                expect(element.prop('onBlur')).toBe(instance.handleInputBlur)
                expect(element.prop('aria-describedby')).toBe(undefined)
                expect(element.prop('disabled')).toBe(defaultProps.disabled)
                expect(element.prop('aria-required')).toBe(defaultProps.required)
                expect(element.prop('id')).toBe(defaultProps.id + typeFieldId[index])
            });
            expect(input.at(0).prop('value')).toBe(instance.state.dateInputValue)
            expect(input.at(0).prop('onChange')).toBe(instance.handleInputChangeDate)
            expect(input.at(1).prop('value')).toBe(instance.state.timeInputValue)
            expect(input.at(1).prop('onChange')).toBe(instance.handleInputChangeTime)
        })

        test('prop date-value is not empty when state.dateInputValue is defined', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance()
            const dateInputValue = '01.02'
            instance.setState({dateInputValue})
            const input = wrapper.find(Input)
            expect(input.at(0).prop('value')).toBe(dateInputValue)
        })

        test('prop time-value is not empty when state.timeInputValue is defined', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance()
            const timeInputValue = '01.02'
            instance.setState({timeInputValue})
            const input = wrapper.find(Input)
            expect(input.at(1).prop('value')).toBe(timeInputValue)
        })

        test('prop aria-describedby is defined when state.showValidationError is true', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance()
            const showValidationError = true
            instance.setState({showValidationError})
            const input = wrapper.find(Input)
            expect(input.at(0,1).prop('aria-describedby')).toBe('date-input-error__' + defaultProps.id)
        })

        test('prop aria-invalid is equal to state.showValidationError', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance()
            const showValidationError = true
            instance.setState({showValidationError})
            const input = wrapper.find(Input)
            expect(input.at(0,1).prop('aria-invalid')).toBe(instance.state.showValidationError)
        })
    })

    describe('DatePickers', () => {
        const wrapper = getWrapper();
        const instance = wrapper.instance();
        const DatePickers = wrapper.find(DatePicker)

        test('contains two datepickers', () => {
            expect(DatePickers).toHaveLength(2)
        })

        test('for date with default props', () => {
            const dateDatePicker = wrapper.find(DatePicker).at(0)
            expect(dateDatePicker.prop('id')).toBe(defaultProps.id + '-date-field' + '-button')
            expect(dateDatePicker.prop('disabled')).toBe(defaultProps.disabled)
            expect(dateDatePicker.prop('openToDate')).toEqual(getDatePickerOpenDate(defaultProps.defaultValue))
            expect(dateDatePicker.prop('onChange')).toBeDefined()
            expect(dateDatePicker.prop('customInput')).toEqual(<DatePickerButton disabled={defaultProps.disabled} type={'date'}/>)
            expect(dateDatePicker.prop('minDate')).toEqual(getCorrectMinDate(defaultProps.minDate))
            expect(dateDatePicker.prop('maxDate')).toEqual(defaultProps.maxDate.toDate())
            expect(dateDatePicker.prop('locale')).toBe(instance.context.intl.locale)
            expect(dateDatePicker.prop('showPopperArrow')).toBe(true)
            expect(dateDatePicker.prop('popperPlacement')).toBe('bottom-end')
            expect(dateDatePicker.prop('popperModifiers')).toEqual({
                preventOverflow: {
                    enabled: true,
                    escapeWithReference: false,
                    boundariesElement: 'viewport',
                },
            })
        })

        test('for time with default props', () => {
            const timeDatePicker = wrapper.find(DatePicker).at(1)
            expect(timeDatePicker.prop('onChange')).toBeDefined()
            expect(timeDatePicker.prop('id')).toBe(defaultProps.id + '-time-field' + '-button')
            expect(timeDatePicker.prop('disabled')).toBe(defaultProps.disabled)
            expect(timeDatePicker.prop('customInput')).toEqual(<DatePickerButton disabled={defaultProps.disabled} type={'time'}/>)
            expect(timeDatePicker.prop('locale')).toBe(instance.context.intl.locale)
            expect(timeDatePicker.prop('showTimeSelect')).toBe(true)
            expect(timeDatePicker.prop('showTimeSelectOnly')).toBe(true)
            expect(timeDatePicker.prop('timeIntervals')).toBe(15)
            expect(timeDatePicker.prop('timeCaption')).toEqual(<FormattedMessage id='time' />)
            expect(timeDatePicker.prop('timeFormat')).toBe('HH.mm')
            expect(timeDatePicker.prop('showPopperArrow')).toBe(true)
            expect(timeDatePicker.prop('popperPlacement')).toBe('bottom-end')
            expect(timeDatePicker.prop('popperModifiers')).toEqual({
                preventOverflow: {
                    enabled: true,
                    escapeWithReference: false,
                    boundariesElement: 'viewport',
                },
            })
        })

        test('prop maxDate is correct Date when props.maxDate is defined', () => {
            const maxDate = moment('2020-04-23')
            const datePicker = getWrapper({maxDate}).find(DatePicker)
            expect(datePicker.at(0).prop('maxDate')).toEqual(maxDate.toDate())
        })
    })

    describe('validation error', () => {
        const id = 'date-input-error__' + defaultProps.id

        test('is shown when state.showValidationError is true', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            instance.setState({showValidationError: true, validationErrorText: 'test-error-msg'})
            const inputError = wrapper.find('#' + id)
            expect(inputError).toHaveLength(1)
            expect(inputError.prop('id')).toBe(id)
            expect(inputError.prop('role')).toBe('alert')
            expect(inputError.prop('className')).toBe('date-input-error')
            expect(inputError.text()).toBe(instance.state.validationErrorText)
        })

        test('is not shown when state.showValidationError is false', () => {
            const inputError = getWrapper().find('#' + id)
            expect(inputError).toHaveLength(0)
        })
        test('invalid-prop is true when validationErrors exists', () => {
            const validation = [VALIDATION_RULES.REQUIRED]
            const wrapper = getWrapper({validationErrors: validation});
            const Inputs = wrapper.find(Input)
            Inputs.forEach((element, index) => {
                expect(element.prop('invalid')).toBe(true)
            })
        })
        test('invalid-prop is false when validationErrors do not exist', () => {
            const wrapper = getWrapper();
            const Inputs = wrapper.find(Input)
            Inputs.forEach((element, index) => {
                expect(element.prop('invalid')).toBe(false)
            })
        })
    })
    describe('ValidationNotification', () => {
        test('component', () => {
            const wrapper = getWrapper({validationErrors: undefined});
            const notification = wrapper.find(ValidationNotification)
            notification.forEach((element, index) => {
                expect(element.prop('anchor')).toBe(undefined)
                expect(element.prop('validationErrors')).toBe(undefined)
                expect(element.prop('className')).toBe('validation-dateTime')
            })
        })
        test('find extra div with className validation-notification', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance();
            instance.setState({showValidationError: true, validationErrorText: 'test-error-msg'})
            const extraDiv = wrapper.find('.validation-notification')
            expect(extraDiv).toHaveLength(2)
        })
    })
})

describe('functions', () => {
    describe('handleInputChangeDate', () => {
        test('sets state.dateInputValue to correct value and showValidationError to false', () => {
            const instance = getWrapper().instance()
            instance.state.showValidationError = true
            const expectedValue = 'test-value-date'
            const event = {target: {value: expectedValue}}
            instance.handleInputChangeDate(event)
            expect(instance.state.dateInputValue).toBe(expectedValue)
            expect(instance.state.showValidationError).toBe(false)
        })
    })
    describe('handleInputChangeTime', () => {
        test('sets state.timeInputValue to correct value and showValidationError to false', () => {
            const instance = getWrapper().instance()
            instance.state.showValidationError = true
            const expectedValue = 'test-value-time'
            const event = {target: {value: expectedValue}}
            instance.handleInputChangeTime(event)
            expect(instance.state.timeInputValue).toBe(expectedValue)
            expect(instance.state.showValidationError).toBe(false)
        })
    })

    describe('handleInputBlur', () => {
        const instance = getWrapper().instance()
        
        test('sets state.showValidationError to false when dateInputValue and timeInputValue are empty', () => {
            instance.state.showValidationError = true
            instance.state.dateInputValue = ''
            instance.state.timeInputValue = ''
            instance.handleInputBlur()
            expect(instance.state.showValidationError).toBe(false)
        })
		
        test('doesnt set state.showValidationError to false when dateInputValue or timeInputValue is not empty', () => {
            instance.state.showValidationError = true
            instance.state.dateInputValue = '12'
            instance.state.timeInputValue = ''
            instance.handleInputBlur()
            expect(instance.state.showValidationError).toBe(true)
        })

        test('calls handleDataUpdate with correct parameters', () => {
            const spy = jest.spyOn(instance, 'handleDataUpdate');
            const expectedDate = '12'
            const expectedTime = '01.00'
            instance.state.dateInputValue = expectedDate
            instance.state.timeInputValue = expectedTime
            instance.handleInputBlur()
            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy.mock.calls[0][0]).toEqual(expectedDate)
            expect(spy.mock.calls[0][1]).toEqual(expectedTime)
        })
    })

    describe('handleDatePickerChange', () => {
        const instance = getWrapper().instance()
        const spy = jest.spyOn(instance, 'handleDataUpdate');

        afterEach(() => {
            spy.mockClear()
        })

        describe('when datepicker type is date', () => {
            test('sets state.dateInputValue to correct value', () => {
                const date = new Date()
                instance.handleDateTimePickerChange(date, 'date')
                expect(instance.state.dateInputValue).toBe(convertDateToLocaleString(date))
            })
            test('calls handleDataUpdate', () => {
                const date = new Date()
                const expectedDate = convertDateToLocaleString(date, 'date')
                const expectedTime = instance.state.timeInputValue
                instance.handleDateTimePickerChange(date, 'date')
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(expectedDate, expectedTime)
            })
        })

        describe('when datepicker type is time', () => {
            test('sets state.timeInputValue to correct value', () => {
                const date = new Date()
                instance.handleDateTimePickerChange(date, 'time')
                expect(instance.state.timeInputValue).toBe(convertDateToLocaleString(date, 'time'))
            })
            test('calls handleDataUpdate', () => {
                const date = new Date()
                const expectedDate = instance.state.dateInputValue
                const expectedTime =  convertDateToLocaleString(date, 'time')
                instance.handleDateTimePickerChange(date, 'time')
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith(expectedDate, expectedTime)
            })
        })
    })

    describe('validateDate', () => {
        const instance = getWrapper().instance()

        test('sets correct state when date is not valid and returns false', () => {
            const date = roundDateToCorrectUnit(moment('abc', getDateFormat(defaultProps.type)))
            const returnValue = instance.validateDate(date, undefined)
            expect(instance.state.validationErrorText).toEqual(<FormattedMessage id="invalid-date-time-format" />)
            expect(instance.state.showValidationError).toBe(true);
            expect(returnValue).toBe(false)
        })

        test('sets correct state when date is valid, minDate is defined and date is before minDate', () => {
            const date = moment('2020-03-21')
            const minDate = moment('2020-03-22')
            const returnValue = instance.validateDate(date, minDate)
            expect(instance.state.validationErrorText).toEqual(<FormattedMessage id="validation-afterStartTimeAndInFuture" />)
            expect(instance.state.showValidationError).toBe(true);
            expect(returnValue).toBe(false)
        })
            
        test('sets correct state and returns true if date is valid and not before minDate', () => {
            const date = moment('2020-03-23')
            const minDate = moment('2020-03-22')
            const returnValue = instance.validateDate(date, minDate)
            expect(instance.state.showValidationError).toBe(false);
            expect(returnValue).toBe(true)
        })
    })


    describe('getDatePickerOpenDate', () => {
        const instance = getWrapper().instance()

        test('returns defaultValue if it is defined', () => {
            const defaultValue = moment()
            const minDate = defaultValue.subtract(1, 'days');
            expect(getDatePickerOpenDate(defaultValue, minDate)).toEqual(new Date(defaultValue))
        })

        test('returns minDate if it is defined and defaultValue is not defined', () => {
            const defaultValue = undefined
            const minDate = moment()
            expect(getDatePickerOpenDate(defaultValue, minDate)).toEqual(new Date(minDate))
        })

        test('returns new date if defaultValue and minDate are not defined', () => {
            const defaultValue = undefined
            const minDate = undefined
            expect(getDatePickerOpenDate(defaultValue, minDate)).toEqual(
                new Date(roundDateToCorrectUnit(moment()))
            )
        })
    })

    describe('componentDidUpdate', () => {
        const spy = jest.spyOn(UnconnectedCustomDateTime.prototype, 'validateDate');

        beforeEach(() => {
            spy.mockClear()
        })
            
        test('calls validateDate if state.dateInputValue and state.timeInputValue are defined', () => {
            const wrapper = shallow(<UnconnectedCustomDateTime {...defaultProps} />, {context: {intl}});
            const instance = wrapper.instance()
            instance.state.dateInputValue = '123'
            instance.state.timeInputValue = '456'
            const minDate = moment('2020-03-23')
            wrapper.setProps({minDate})
            const expectedDate = moment(`${instance.state.dateInputValue} ${instance.state.timeInputValue}`,
                getDateFormat('date-time'), true)
            expect(spy).toHaveBeenCalledTimes(1);
            expect(JSON.stringify(spy.mock.calls[0][0])).toEqual(JSON.stringify(expectedDate))
            expect(spy.mock.calls[0][1]).toBe(minDate)
        })

        test('doesnt call validateDate if state.dateInputValue and state.timeInputValue are not defined', () => {
            const wrapper = shallow(<UnconnectedCustomDateTime {...defaultProps} />, {context: {intl}});
            const instance = wrapper.instance()
            instance.setState({dateInputValue: '', timeInputValue: ''})
            const minDate = moment('2020-03-23')
            wrapper.setProps({minDate})
            expect(spy).toHaveBeenCalledTimes(0);
        })
    })
})

