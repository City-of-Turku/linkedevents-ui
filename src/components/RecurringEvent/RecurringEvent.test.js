import React from 'react';
import {shallow} from 'enzyme';
import {RecurringEventWithoutIntl} from './index'
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import moment from 'moment';
import {Modal} from 'reactstrap';
import {setEventData, sortSubEvents} from 'src/actions/editor'

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()
const defaultProps = {
    values: {
        sub_events: {},
    },
    toggle: () => null,
    validationErrors: [],
    formType: '',
    isOpen: false,
    intl,
}; 

describe('RecurringEvent', () => {
    function getWrapper(props) {
        return shallow(<RecurringEventWithoutIntl {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }
    describe('render', () => {
        test('contains Modal with correct props', () => {
            const element = getWrapper().find(Modal);
            expect(element).toHaveLength(1);
            expect(element.prop('toggle')).toEqual(defaultProps.toggle);
            expect(element.prop('isOpen')).toEqual(defaultProps.isOpen);
        })
        test('Modal opening', () => {
            const element = getWrapper();
            expect(element.find(Modal).prop('isOpen')).toEqual(false);
            element.setProps({isOpen: true});
            expect(element.find(Modal).prop('isOpen')).toEqual(true);
        });
        test('Correct amount of formattedMessages', () => {
            const element = getWrapper().find(FormattedMessage)
            expect(element).toHaveLength(7)
        })
    });
    describe('methods', () => {

        describe('onChange and onTimeChange', () => {
            let wrapper;
            let instance;
            let clearErrors;
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
                clearErrors = jest.fn();
                instance.clearErrors = clearErrors;
                instance.forceUpdate();
            });
            test('onChange, changes state according to parameters', () => {
                expect(wrapper.state('weekInterval')).toBe(1);
                instance.onChange('weekInterval', 5);
                expect(wrapper.state('weekInterval')).toBe(5);
                expect(clearErrors).toHaveBeenCalledTimes(1);
            });
            test('onTimeChange, changes state according to parameters', () => {
                expect(wrapper.state('recurringStartTime')).toBe(null);
                const today = moment();
                instance.onChange('recurringStartTime', today);
                expect(wrapper.state('recurringStartTime')).toBe(today);
                expect(clearErrors).toHaveBeenCalledTimes(1);
            });
        });

        describe('clearErrors', () => {
            let wrapper;
            let instance;
            const mockErrors = {
                weekInterval: 'error1',
                daysSelected: 'error2',
                recurringStartDate: 'error3',
                recurringEndDate: 'error4',
            };
            beforeEach(() => {
                wrapper = getWrapper();
                instance = wrapper.instance();
                wrapper.setState({errors: mockErrors});
            });
            test('changes state errors correctly', () => {
                expect(wrapper.state('errors')).toEqual(mockErrors);
                instance.clearErrors();
                expect(wrapper.state('errors')).not.toEqual(mockErrors);
            });
            test('to work when called by another method', () => {
                expect(wrapper.state('errors')).toEqual(mockErrors);
                instance.onChange('weekInterval', 5);
                expect(wrapper.state('errors')).not.toEqual(mockErrors);
            })
        });

        describe('weekIntervalChange', () => {
            test('changes state according to parameter', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const event = {
                    target: {
                        value: 10,
                    },
                };
                expect(wrapper.state('weekInterval')).toBe(1);
                instance.weekIntervalChange(event);
                expect(wrapper.state('weekInterval')).toBe(10);
            });
        });

        describe('onCheckboxChange', () => {
            let wrapper;
            let instance;
            wrapper = getWrapper();
            instance = wrapper.instance();
            const clearErrors = jest.fn();
            const mockDays = {
                monday: false,
                tuesday: false,
                wednesday: false,
                thursday: false,
                friday: false,
                saturday: false,
                sunday: false,
            };
            beforeEach(() => {
                instance.clearErrors = clearErrors;
                instance.forceUpdate();
            });
            test('changes state according to parameters', () => {
                instance.onCheckboxChange('monday',true);
                expect(wrapper.state('daysSelected')).toEqual({...mockDays, ...{monday: true}});
                instance.onCheckboxChange('friday',true);
                const twoDays = {
                    monday: true,
                    friday: true,
                };
                expect(wrapper.state('daysSelected')).toEqual({...mockDays, ...twoDays});
                expect(clearErrors).toHaveBeenCalledTimes(2);
            });
        });
        describe('generateEvents', () => {
            const mockDays = {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true,
                saturday: false,
                sunday: false,
            };
            test('generateEvents doesnt dispatch', () => {
                const wrapper = getWrapper({values: {sub_events: []}});
                const instance = wrapper.instance();
                const StartDateOver = moment('2021-02-12 00:00:00')
                const StartTimeOver = moment('2021-02-12 09:30:00')
                const EndDateOver = moment('2021-08-23 00:00:00')
                const EndTimeOver = moment('2021-08-23 14:30:00')

                for (const day in mockDays) {
                    instance.onCheckboxChange(day, mockDays[day]);
                }
                expect(wrapper.state('daysSelected')).toEqual(mockDays)

                instance.onChange('recurringStartDate', StartDateOver)
                instance.onChange('recurringStartTime', StartTimeOver)
                instance.onChange('recurringEndDate', EndDateOver)
                instance.onChange('recurringEndTime', EndTimeOver)
                
                instance.generateEvents()
                expect(wrapper.state('subEventLimit')['overLimit']).toBe(true)
                expect(wrapper.state('subEventLimit')['subEventAmount']).toBe(137)

                expect(dispatch).toHaveBeenCalledTimes(0)
            })
            test('generateEvents dispatches', () => {
                const wrapper = getWrapper({values: {sub_events: []}});
                const instance = wrapper.instance();
                const StartDate = moment('2021-02-12 00:00:00')
                const StartTime = moment('2021-02-12 09:30:00')
                const EndDate = moment('2021-02-23 00:00:00')
                const EndTime = moment('2021-02-23 14:30:00')

                for (const day in mockDays) {
                    instance.onCheckboxChange(day, mockDays[day]);
                }

                instance.onChange('recurringStartDate', StartDate)
                instance.onChange('recurringStartTime', StartTime)
                instance.onChange('recurringEndDate', EndDate)
                instance.onChange('recurringEndTime', EndTime)
                instance.generateEvents()
                expect(wrapper.state('subEventLimit')['overLimit']).toBe(false)
                expect(wrapper.state('subEventLimit')['subEventAmount']).toBe(8)

                let subEventKeys = Object.keys(defaultProps.values.sub_events)
                let key = subEventKeys.length > 0 ? Math.max.apply(null, subEventKeys) + 1 : 1
                const newEventObject = {[key]: {start_time: '2021-02-15T07:30:00.000Z' , end_time: '2021-02-26T12:30:00.000Z'}}
                const expectedValue = setEventData(newEventObject, key);
                expect(dispatch).toHaveBeenCalledWith(expectedValue)
                expect(dispatch).toHaveBeenCalledTimes(9)
            })
            test('generateEvents overLimit & subEventAmount-states change', () => {
                const wrapper = getWrapper({values: {sub_events: []}});
                const instance = wrapper.instance();
                const StartDateOver = moment('2021-02-12 00:00:00')
                const StartTimeOver = moment('2021-02-12 09:30:00')
                const EndDateOver = moment('2021-08-23 00:00:00')
                const EndTimeOver = moment('2021-08-23 14:30:00')
                const EndDateChange = moment('2021-03-26 00:00:00')

                for (const day in mockDays) {
                    instance.onCheckboxChange(day, mockDays[day]);
                }
                expect(wrapper.state('daysSelected')).toEqual(mockDays)

                instance.onChange('recurringStartDate', StartDateOver)
                instance.onChange('recurringStartTime', StartTimeOver)
                instance.onChange('recurringEndDate', EndDateOver)
                instance.onChange('recurringEndTime', EndTimeOver)
                
                instance.generateEvents()
                expect(wrapper.state('subEventLimit')['overLimit']).toBe(true)
                expect(wrapper.state('subEventLimit')['subEventAmount']).toBe(137)

                instance.onChange('recurringEndDate', EndDateChange)

                expect(wrapper.state('subEventLimit')['overLimit']).toBe(false)
                expect(wrapper.state('subEventLimit')['subEventAmount']).toBe(31)
            })
        })
    });
});
