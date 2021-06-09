import React from 'react';
import {shallow} from 'enzyme';
import AsyncSelect from 'react-select/async'
import {HelSelectStyles, HelSelectTheme} from '../../../themes/react-select'
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedUmbrellaSelector} from '../UmbrellaSelector/UmbrellaSelector';
import UmbrellaRadio from '../UmbrellaSelector/UmbrellaRadio';
import {setData, clearValue} from '../../../actions/editor'
import constants from '../../../constants'
import {mockUserEvents} from '__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()
const mockEvent = mockUserEvents[0];

const store = {
    getState: () => (
        {
            router: {
                location: {
                    pathname: '/event/create/new',
                },
            },
        }
    ),
};

const defaultProps = {
    event: {},
    editor: {
        values: {
            sub_events: {},
            super_event: '',
            super_event_type: '',
        },
    },
    intl,
}

describe('UmbrellaSelector', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedUmbrellaSelector {...defaultProps} {...props} />, {context: {intl, store, dispatch}});
    }

    describe('renders', () => {
        describe('components', () => {
            describe('UmbrellaRadios', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    const radioElements = wrapper.find(UmbrellaRadio)
                    const elementIds = ['event-is-independent', 'event-is-umbrella', 'event-has-umbrella']
                    const elementValues = ['is_independent', 'is_umbrella', 'has_umbrella']
                    const {isUmbrellaEvent, hasUmbrellaEvent} = instance.state;
                    const elementStates = [!isUmbrellaEvent && !hasUmbrellaEvent, isUmbrellaEvent, hasUmbrellaEvent]
                    expect(radioElements).toHaveLength(3)
                    radioElements.forEach((radio, index) => {
                        expect(radio.prop('handleCheck')).toBe(instance.handleCheck);
                        expect(radio.prop('messageID')).toBe(elementIds[index]);
                        expect(radio.prop('value')).toBe(elementValues[index]);
                        expect(radio.prop('aria-label')).toBe(intl.formatMessage({id: elementIds[index]}))
                        expect(radio.prop('disabled')).toBe(instance.getDisabledState(elementValues[index]))
                        expect(radio.prop('checked')).toBe(elementStates[index])
                    })
                })
            })
            describe('AsyncSelect', () => {
                test('correct props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance();
                    wrapper.setState({hasUmbrellaEvent: true})
                    const component = wrapper.find(AsyncSelect)
                    expect(component).toHaveLength(1)
                    expect(component.prop('isClearable')).toBe(true)
                    expect(component.prop('loadOptions')).toBe(instance.getOptions)
                    expect(component.prop('placeholder')).toBe(intl.formatMessage({id: 'select'}))
                    expect(component.prop('onFocus')).toBe(instance.hideSelectTip)
                    expect(component.prop('onChange')).toBe(instance.handleChange)
                    expect(component.prop('filterOption')).toBeDefined()
                    expect(component.prop('styles')).toBe(HelSelectStyles)
                    expect(component.prop('theme')).toBe(HelSelectTheme)
                    expect(component.prop('loadingMessage')).toBeDefined()
                    expect(component.prop('noOptionsMessage')).toBeDefined()
                })
            })
        })
    })
    describe('methods', () => {
        describe('handleChange', () => {
            let wrapper;

            beforeEach(() => {
                wrapper = getWrapper();
                dispatch.mockClear()
            });

            const event = (string) => ({target: {value: string}});
            test('correct selected event', () => {
                const data = {super_event: {'@id': mockEvent.value}, sub_event_type: constants.SUB_EVENT_TYPE_UMBRELLA}
                wrapper.instance().handleCheck(event('has_umbrella'));
                expect(wrapper.state('hasUmbrellaEvent')).toBe(true);
                wrapper.instance().handleChange(data)
                expect(wrapper.state('selectedUmbrellaEvent')).toEqual(data);
                expect(dispatch.mock.calls.length).toBe(2);
                expect(dispatch.mock.calls[1][0]).toEqual(setData(data));
            })
        })
        describe('handleCheck', () => {
            let wrapper;

            beforeEach(() => {
                wrapper = getWrapper();
                dispatch.mockClear()
            });

            const event = (string) => ({target: {value: string}});
            test('is_umbrella', () => {
                const expectedData = {super_event_type: 'umbrella'}
                const expectedClear = ['super_event','sub_event_type']

                expect(wrapper.state('isUmbrellaEvent')).toBe(false);
                wrapper.instance().handleCheck(event('is_umbrella'));
                expect(wrapper.state('isUmbrellaEvent')).toBe(true);
                expect(dispatch.mock.calls.length).toBe(2);
                expect(dispatch.mock.calls[0][0]).toEqual(setData(expectedData));
                expect(dispatch.mock.calls[1][0]).toEqual(clearValue(expectedClear));
            })
            test('has_umbrella', () => {

                expect(wrapper.state('hasUmbrellaEvent')).toBe(false);
                wrapper.instance().handleCheck(event('has_umbrella'));
                expect(wrapper.state('hasUmbrellaEvent')).toBe(true);
            })
            test('is_independent', () => {
                const data = {super_event_type: 'umbrella'}
                const expectedValue = ['super_event', 'sub_event_type']
                wrapper.instance().handleCheck(event('is_umbrella'));
                expect(dispatch.mock.calls[0][0]).toEqual(setData(data));

                wrapper.instance().handleCheck(event('is_independent'));
                expect(dispatch.mock.calls[1][0]).toEqual(clearValue(expectedValue));
                expect(dispatch.mock.calls.length).toBe(3);
            })
            test('is_independent sets other states false', () => {
                wrapper.instance().setState({hasUmbrellaEvent: true})
                expect(wrapper.state('hasUmbrellaEvent')).toBe(true);
                wrapper.instance().handleCheck(event('is_independent'));
                expect(wrapper.state('hasUmbrellaEvent')).toBe(false);

                wrapper.instance().setState({isUmbrellaEvent: true})
                expect(wrapper.state('isUmbrellaEvent')).toBe(true);
                wrapper.instance().handleCheck(event('is_independent'));
                expect(wrapper.state('isUmbrellaEvent')).toBe(false);
            })
        })
    })
})

