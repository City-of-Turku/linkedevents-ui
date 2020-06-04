import React from 'react';
import {shallow, mount} from 'enzyme';
import RecurringEvent from './index';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import moment from 'moment';
import {Modal} from 'reactstrap';


const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const defaultProps = {
    values: {},
    toggle: () => null,
    validationErrors: [],
    formType: '',
    isOpen: false,
};

describe('RecurringEvent', () => {
    function getWrapper(props) {
        return shallow(<RecurringEvent {...defaultProps} {...props} />, {context: {intl}});
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
            expect(element).toHaveLength(6)
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
                wrapper = getWrapper();
                instance = wrapper.instance();
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
    });
});
