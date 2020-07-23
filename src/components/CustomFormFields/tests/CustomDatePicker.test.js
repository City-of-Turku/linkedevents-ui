import React from 'react'
import {shallow, mount} from 'enzyme';
import CustomDatePicker, {DatePickerButton} from '../CustomDatePicker';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Label, Input} from 'reactstrap';
import DatePicker from 'react-datepicker'
import moment from 'moment'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('CustomDatePicker', () => {
    const defaultProps = {
        label: 'search-date-label-start',
        name: 'test-name',
        id: 'test-id',
        defaultValue: undefined,
        onChange: () => {},
        maxDate: undefined,
        minDate: undefined,
        type: 'date',
        disablePast: false,
        disabled: false,
    }

    function getWrapper(props) {
        return shallow(<CustomDatePicker {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('renders', () => {
        test('label with correct props', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            const label = getWrapper({}).find(Label)
            expect(label).toHaveLength(1);
            expect(label.prop('for')).toBe(defaultProps.id)
            expect(label.prop('children')).toEqual(instance.getCorrectInputLabel(defaultProps.label))
        })

        describe('Input', () => {
            test('with default props', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const input = wrapper.find(Input)
                expect(input).toHaveLength(1);
                expect(input.prop('type')).toBe('text')
                expect(input.prop('name')).toBe(defaultProps.name)
                expect(input.prop('id')).toBe(defaultProps.id)
                expect(input.prop('value')).toBe(instance.state.inputValue)
                expect(input.prop('onChange')).toBe(instance.handleInputChange)
                expect(input.prop('onBlur')).toBe(instance.handleInputBlur)
                expect(input.prop('aria-describedby')).toBe(undefined)
                expect(input.prop('disabled')).toBe(defaultProps.disabled)
            })

            test('prop value is not empty when state.inputValue is defined', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance()
                const inputValue = '01.02'
                instance.setState({inputValue})
                const input = wrapper.find(Input)
                expect(input.prop('value')).toBe(inputValue)
            })

            test('prop aria-describedby is defined when state.showValidationError is true', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance()
                const showValidationError = true
                instance.setState({showValidationError})
                const input = wrapper.find(Input)
                expect(input.prop('aria-describedby')).toBe('date-input-error__' + defaultProps.id)
            })

            test('prop aria-invalid is equal to state.showValidationError', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance()
                const showValidationError = true
                instance.setState({showValidationError})
                const input = wrapper.find(Input)
                expect(input.prop('aria-invalid')).toBe(instance.state.showValidationError)
            })
        })

        describe('DatePicker', () => {
            test('with default props', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const datePicker = wrapper.find(DatePicker)
                expect(datePicker).toHaveLength(1);
                expect(datePicker.prop('disabled')).toBe(defaultProps.disabled)
                expect(datePicker.prop('openToDate')).toBeDefined()
                expect(datePicker.prop('onChange')).toBe(instance.handleDatePickerChange)
                expect(datePicker.prop('customInput')).toEqual(<DatePickerButton disabled={defaultProps.disabled}/>)
                expect(datePicker.prop('minDate')).toBe(instance.getCorrectMinDate(defaultProps.minDate))
                expect(datePicker.prop('maxDate')).toBe(undefined)
                expect(datePicker.prop('locale')).toBe(instance.context.intl.locale)
                expect(datePicker.prop('showTimeSelect')).toBe(false)
                expect(datePicker.prop('showTimeSelectOnly')).toBe(false)
                expect(datePicker.prop('timeIntervals')).toBe(15)
                expect(datePicker.prop('timeCaption')).toEqual(<FormattedMessage id='time' />)
                expect(datePicker.prop('timeFormat')).toBe('HH.mm')
                expect(datePicker.prop('showPopperArrow')).toBe(true)
                expect(datePicker.prop('popperPlacement')).toBe('bottom-end')
                expect(datePicker.prop('popperModifiers')).toEqual({
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
                expect(datePicker.prop('maxDate')).toEqual(maxDate.toDate())
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
        })
    })

    describe('functions', () => {
        describe('convertDateToLocaleString', () => {
            test('returns correct date string', () => {
                const date = moment('2020-03-23')
                const instance = getWrapper().instance()
                expect(instance.convertDateToLocaleString(date)).toBe('23.3.2020')
            })
        })

        describe('getDateFormat', () => {
            describe('returns correct date format string', () => {
                const instance = getWrapper().instance()

                test('when props.type is date', () => {
                    expect(instance.getDateFormat('date')).toBe('D.M.YYYY')
                })
                test('when props.type is time', () => {
                    expect(instance.getDateFormat('time')).toBe('H.mm')
                })
                test('when props.type is date-time', () => {
                    expect(instance.getDateFormat('date-time')).toBe('D.M.YYYY H.mm')
                })
                test('by default', () => {
                    expect(instance.getDateFormat()).toBe('D.M.YYYY')
                })
            })
        })

        describe('handleInputChange', () => {
            test('sets state.inputValue to correct value', () => {
                const instance = getWrapper().instance()
                const expectedValue = 'test-value'
                const event = {target: {value: expectedValue}}
                instance.handleInputChange(event)
                expect(instance.state.inputValue).toBe(expectedValue)
            })
        })

        describe('handleInputBlur', () => {
            const onChange = jest.fn()
            const instance = getWrapper({onChange}).instance()

            afterEach(() => {
                onChange.mockReset()
            })

            describe('when state.inputValue is not empty', () => {
                test('calls props.onChange when state.inputValue is valid', () => {
                    const testInput = '23.03.2020'
                    instance.state = {inputValue: testInput}
                    instance.handleInputBlur()
                    const expectedDate = instance.roundDateToCorrectUnit(
                        moment(testInput, instance.getDateFormat(defaultProps.type), true))
                    expect(onChange.mock.calls.length).toBe(1);
                    expect(onChange.mock.calls[0][0]).toEqual(expectedDate)
                })
    
                test('calls props.onChange when state.inputValue is not valid with correct params', () => {
                    const testInput = 'abc'
                    instance.state = {inputValue: testInput}
                    instance.handleInputBlur()
                    expect(onChange.mock.calls.length).toBe(1);
                    expect(onChange.mock.calls[0][0]).toBe(undefined)
                })
            })

            describe('when state.inputValue is empty', () => {
                test('sets state.showValidationError to false', () => {
                    instance.state = {showValidationError: true, inputValue: ''}
                    instance.handleInputBlur()
                    expect(instance.state.showValidationError).toBe(false)
                })

                test('calls props.onChange with arg undefined', () => {
                    const defaultValue = moment('2020-03-23')
                    const wrapper = getWrapper({defaultValue, onChange})
                    const instance = wrapper.instance();
                    instance.state = {inputValue: ''}
                    instance.handleInputBlur()
                    expect(onChange.mock.calls.length).toBe(1);
                    expect(onChange.mock.calls[0][0]).toBe(undefined)
                })

                test('doesnt call props.onChange if props.defaultValue is empty', () => {
                    const wrapper = getWrapper({onChange})
                    const instance = wrapper.instance();
                    instance.state = {inputValue: ''}
                    instance.handleInputBlur()
                    expect(onChange.mock.calls.length).toBe(0);
                })
            })
        })

        describe('handleDatePickerChange', () => {
            test('sets state.inputValue to correct value', () => {
                const instance = getWrapper().instance()
                const date = new Date()
                instance.handleDatePickerChange(date)
                expect(instance.state.inputValue).toBe(instance.convertDateToLocaleString(date))
            })

            test('calls props.onChange', () => {
                const onChange = jest.fn()
                const instance = getWrapper({onChange}).instance()
                const date = new Date()
                instance.handleDatePickerChange(date)
                expect(onChange.mock.calls.length).toBe(1);
                expect(onChange.mock.calls[0][0]).toEqual(
                    instance.roundDateToCorrectUnit(moment(date, instance.getDateFormat(instance.props.type))))
            })
        })

        describe('validateDate', () => {
            const instance = getWrapper().instance()

            test('sets correct state when date is not valid and returns false', () => {
                const date = instance.roundDateToCorrectUnit(moment('abc', instance.getDateFormat(defaultProps.type)))
                const returnValue = instance.validateDate(date, undefined)
                expect(instance.state.validationErrorText).toEqual(<FormattedMessage id="invalid-date-format" />)
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

        describe('getCorrectInputLabel', () => {
            const instance = getWrapper().instance()
            test('returns undefined if label is empty', () => {
                expect(instance.getCorrectInputLabel(undefined)).toBe(undefined)
            })

            test('returns given label back if label is object', () => {
                const label = <FormattedMessage id={'test'} />
                expect(instance.getCorrectInputLabel(label)).toBe(label)
            })

            test('returns formatted msg if label is not empty and is not object', () => {
                expect(instance.getCorrectInputLabel('test')).toEqual(<FormattedMessage id={'test'} />)
            })
        })

        describe('getCorrectMinDate', () => {
            const instance = getWrapper().instance()

            test('returns undefined when minDate and disablePast are falsy', () => {
                expect(instance.getCorrectMinDate()).toBe(undefined)
            })

            test('returns date minDate when disablePast is falsy and minDate is defined', () => {
                const minDate = moment('2020-03-22')
                expect(instance.getCorrectMinDate(minDate, false)).toEqual(minDate.toDate())
            })

            test('returns date minDate when disablePast is true and minDate is after now', () => {
                const minDate = moment().add(1, 'day')
                expect(instance.getCorrectMinDate(minDate, true)).toEqual(minDate.toDate())
            })

            test('retuns current date when disablePast is true and minDate is undefined or before now', () => {
                const minDate = moment().subtract(1, 'day')
                const returnValue = instance.getCorrectMinDate(minDate, true)
                expect(moment(returnValue).startOf('hour').toString()).toEqual(moment().startOf('hour').toString())
            })
        })

        describe('getDatePickerOpenDate', () => {
            const instance = getWrapper().instance()

            test('returns defaultValue if it is defined', () => {
                const defaultValue = moment()
                const minDate = defaultValue.subtract(1, 'days');
                expect(instance.getDatePickerOpenDate(defaultValue, minDate)).toEqual(new Date(defaultValue))
            })

            test('returns minDate if it is defined and defaultValue is not defined', () => {
                const defaultValue = undefined
                const minDate = moment()
                expect(instance.getDatePickerOpenDate(defaultValue, minDate)).toEqual(new Date(minDate))
            })

            test('returns new date if defaultValue and minDate are not defined', () => {
                const defaultValue = undefined
                const minDate = undefined
                expect(instance.getDatePickerOpenDate(defaultValue, minDate)).toEqual(
                    new Date(instance.roundDateToCorrectUnit(moment()))
                )
            })
        })

        describe('roundDateToCorrectUnit', () => {
            test('returns date rounded to days when props.type is date', () => {
                const instance = getWrapper({type: 'date'}).instance()
                const date = moment('2020-02-08 09:30:26')
                const expectedDate = moment('2020-02-08 09:30:26').startOf('day')
                expect(instance.roundDateToCorrectUnit(date)).toEqual(expectedDate)
            })

            test('returns date rounded to minutes when props.type is time', () => {
                const instance = getWrapper({type: 'time'}).instance()
                const date = moment('2020-02-08 09:30:26')
                const expectedDate = moment('2020-02-08 09:30:26').startOf('minute')
                expect(instance.roundDateToCorrectUnit(date)).toEqual(expectedDate)
            })

            test('returns date rounded to minutes when props.type is date-time', () => {
                const instance = getWrapper({type: 'date-time'}).instance()
                const date = moment('2020-02-08 09:30:26')
                const expectedDate = moment('2020-02-08 09:30:26').startOf('minute')
                expect(instance.roundDateToCorrectUnit(date)).toEqual(expectedDate)
            })
        })

        describe('componentDidUpdate', () => {
            const spy = jest.spyOn(CustomDatePicker.prototype, 'validateDate');

            beforeEach(() => {
                spy.mockClear()
            })
            
            describe('calls validateDate if state.inputValue is defined', () => {
                test('with correct params when inputValue is not valid', () => {
                    const wrapper = mount(<CustomDatePicker {...defaultProps} />, {context: {intl}});
                    const instance = wrapper.instance()
                    instance.state.inputValue = '123'
                    const minDate = moment('2020-03-23')
                    wrapper.setProps({minDate})
                    const expectedDate = moment(instance.state.inputValue, instance.getDateFormat(defaultProps.type), true)
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(JSON.stringify(spy.mock.calls[0][0])).toEqual(JSON.stringify(expectedDate))
                    expect(spy.mock.calls[0][1]).toBe(minDate)
                })

                test('with correct params when inputValue is valid', () => {
                    const wrapper = mount(<CustomDatePicker {...defaultProps} />, {context: {intl}});
                    const instance = wrapper.instance()
                    instance.state.inputValue = '20.5.2020'
                    const minDate = moment('2020-03-23')
                    wrapper.setProps({minDate})
                    const expectedDate = moment(instance.state.inputValue, instance.getDateFormat(defaultProps.type), true)
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(spy.mock.calls[0][0]).toEqual(expectedDate)
                    expect(spy.mock.calls[0][1]).toBe(minDate)
                })
            })

            test('doesnt call validateDate if state.inputValue is not defined', () => {
                const wrapper = mount(<CustomDatePicker {...defaultProps} />, {context: {intl}});
                const minDate = moment('2020-03-23')
                wrapper.setProps({minDate})
                expect(spy).toHaveBeenCalledTimes(0);
            })
        })
    })
})

describe('DatePickerButton', () => {
    test('renders with correct props', () => {
        const defaultProps = {
            onClick: () => {},
            disabled: false,
        }
        const wrapper = shallow(<DatePickerButton {...defaultProps} />, {context: {intl}})
        expect(wrapper.prop('disabled')).toBe(defaultProps.disabled)
        expect(wrapper.prop('aria-hidden')).toBe(true)
        expect(wrapper.prop('aria-label')).toBe(intl.formatMessage({id: 'date-picker-button-label'}))
        expect(wrapper.prop('tabIndex')).toBe(-1)
        expect(wrapper.prop('onClick')).toBe(defaultProps.onClick)
        expect(wrapper.prop('className')).toBe('glyphicon glyphicon-calendar custom-date-input__button')
    })
})
