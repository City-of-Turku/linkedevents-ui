import React from 'react';
import {shallow, mount} from 'enzyme';
import AsyncSelect from 'react-select/async'
import {HelSelectStyles, HelSelectTheme} from '../../../themes/react-select'
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedUmbrellaSelector} from '../UmbrellaSelector/UmbrellaSelector';
import UmbrellaRadio from '../UmbrellaSelector/UmbrellaRadio';
import {setData, clearValue} from '../../../actions/editor'
import constants from '../../../constants'

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()

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
    editor: {
        values: {
            sub_events: {},
            super_event: '',
            super_event_type: ''
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
                        expect(radio.prop('intl')).toBe(intl);
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
                    const Aselect = wrapper.find(AsyncSelect)
                    expect(Aselect).toHaveLength(1)
                    expect(Aselect.prop('isClearable')).toBe(true)
                    expect(Aselect.prop('loadOptions')).toBe(instance.getOptions)
                    expect(Aselect.prop('placeholder')).toBe(intl.formatMessage({id: 'select'}))
                    expect(Aselect.prop('onFocus')).toBe(instance.hideSelectTip)
                    expect(Aselect.prop('onChange')).toBe(instance.handleChange)
                    expect(Aselect.prop('filterOption')).toBeDefined()
                    expect(Aselect.prop('styles')).toBe(HelSelectStyles)
                    expect(Aselect.prop('theme')).toBe(HelSelectTheme)
                    expect(Aselect.prop('loadingMessage')).toBeDefined()
                    expect(Aselect.prop('noOptionsMessage')).toBeDefined()
                })
            })
            /*
            describe('FormattedMessages', () => {
                test('correct amount', () => {
                    const wrapper = getWrapper()
                    wrapper.setState({showSelectTip: true, editedEventIsSubEvent: true, superEventSuperEventType: constants.SUPER_EVENT_TYPE_RECURRING})
                    wrapper.setProps(defaultProps.editor.values.super_event = 'random id')
                    const formatted = wrapper.find(FormattedMessage)
                    expect(formatted).toHaveLength(5)
                })
            })
             */
        })
    })
    describe('methods', () => {
        describe('handleUpdate', () => {
            test('', () => {

            })
        })

        describe('handleChange', () => {
            test('', () => {

            })
        })
        describe('getDisabledState', () => {
            test('', () => {

            })
        })
        describe('handleCheck', () => {
            let wrapper;

            beforeEach(() => {
                wrapper = getWrapper();
                dispatch.mockClear()
            });

            const event = (string) => ({target: {value: string}});
            test('states', () => {
                const expectedData = {super_event_type: 'umbrella'}
                const expectedClear = 'super_event_type'
                expect(wrapper.state('isUmbrellaEvent')).toBe(false);
                wrapper.instance().handleCheck(event('is_umbrella'));
                expect(wrapper.state('isUmbrellaEvent')).toBe(true);
                expect(dispatch.mock.calls.length).toBe(2);
                expect(dispatch.mock.calls[0][0]).toEqual(setData(expectedData));

                wrapper.instance().handleCheck(event('has_umbrella'));
                expect(wrapper.state('isUmbrellaEvent')).toBe(false);
                expect(wrapper.state('hasUmbrellaEvent')).toBe(true);
                expect(dispatch.mock.calls.length).toBe(3);
                expect(dispatch.mock.calls[0][0]).toEqual(clearValue(expectedClear));
            })
            test('hasUmbrellaEvent', () => {
                const expectedValue = ['super_event', 'sub_event_type']
                wrapper.instance().handleCheck(event('has_umbrella'));
                expect(wrapper.state('hasUmbrellaEvent')).toBe(true);
                wrapper.instance().handleCheck(event('is_independent'));
                expect(wrapper.state('hasUmbrellaEvent')).toBe(false);
                expect(dispatch.mock.calls.length).toBe(3);
                expect(dispatch.mock.calls[0][0]).toEqual(clearValue(expectedValue));
            })
        })
    })
})
