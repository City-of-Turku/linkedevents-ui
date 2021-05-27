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
                const wrapper = getWrapper();
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
                expect(wrapper.state('subEvents')['overMaxAmount']).toBe(true)
                expect(wrapper.state('subEvents')['newSubCount']).toBe(137)

                expect(dispatch).toHaveBeenCalledTimes(0)
            })
            test('generateEvents dispatches', () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                const StartDate = moment('2021-02-12T00:00:00Z')
                const StartTime = moment('2021-02-12T09:30:00Z')
                const EndDate = moment('2021-02-23T00:00:00Z')
                const EndTime = moment('2021-02-23T14:30:00Z')

                for (const day in mockDays) {
                    instance.onCheckboxChange(day, mockDays[day]);
                }
                expect(wrapper.state('daysSelected')).toEqual(mockDays)

                instance.onChange('recurringStartDate', StartDate)
                instance.onChange('recurringStartTime', StartTime)
                instance.onChange('recurringEndDate', EndDate)
                instance.onChange('recurringEndTime', EndTime)
                instance.generateEvents()
                expect(wrapper.state('subEvents')['overMaxAmount']).toBe(false)
                expect(wrapper.state('subEvents')['newSubCount']).toBe(8)

                // ordered by day, all mondays, all tuesdays etc..
                const eventTimes = [
                    {[1]: {start_time: '2021-02-15T09:30:00.000Z', end_time: '2021-02-26T14:30:00.000Z'}}, // mon
                    {[2]: {start_time: '2021-02-22T09:30:00.000Z', end_time: '2021-03-05T14:30:00.000Z'}}, // mon
                    {[3]: {start_time: '2021-02-16T09:30:00.000Z', end_time: '2021-02-27T14:30:00.000Z'}}, // tues
                    {[4]: {start_time: '2021-02-23T09:30:00.000Z', end_time: '2021-03-06T14:30:00.000Z'}}, // tues
                    {[5]: {start_time: '2021-02-17T09:30:00.000Z', end_time: '2021-02-28T14:30:00.000Z'}}, // wed
                    {[6]: {start_time: '2021-02-18T09:30:00.000Z', end_time: '2021-03-01T14:30:00.000Z'}}, // thurs
                    {[7]: {start_time: '2021-02-12T09:30:00.000Z', end_time: '2021-02-23T14:30:00.000Z'}}, // fri
                    {[8]: {start_time: '2021-02-19T09:30:00.000Z', end_time: '2021-03-02T14:30:00.000Z'}}, // fri
                ]

                const setEventDataCount = wrapper.state().subEvents['newSubCount']
                for (let i = 0; i < setEventDataCount; i++) {
                    expect(dispatch).toHaveBeenNthCalledWith(i + 1,setEventData(eventTimes[i],i + 1))
                }
                expect(dispatch).toHaveBeenNthCalledWith(9,{'type': 'EDITOR_SORT_SUB_EVENTS'})
                expect(dispatch).toHaveBeenCalledTimes(9)
            })
            test('generateEvents overMaxAmount & newSubCount-states change', () => {
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
                expect(wrapper.state('subEvents')['overMaxAmount']).toBe(true)
                expect(wrapper.state('subEvents')['newSubCount']).toBe(137)

                instance.onChange('recurringEndDate', EndDateChange)

                expect(wrapper.state('subEvents')['overMaxAmount']).toBe(false)
                expect(wrapper.state('subEvents')['newSubCount']).toBe(31)
            })
        })
    });
});
