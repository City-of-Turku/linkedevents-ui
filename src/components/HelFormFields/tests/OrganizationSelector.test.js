import React from 'react';
import {shallow} from 'enzyme';
import {Input} from 'reactstrap';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import OrganizationSelector from '../OrganizationSelector';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const testOrgA = {value: 'a', label: 'a-label'}
const testOrgB = {value: 'b', label: 'b-label'}

const defaultProps = {
    options: [testOrgA],
    formType: 'create',
    selectedOption: {},
    onChange: () => {},
}

describe('OrganizationSelector', () => {
    function getWrapper(props) {
        return shallow(<OrganizationSelector {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('renders', () => {
        test('label', () => {
            const label = getWrapper().find('label')
            expect(label).toHaveLength(1)
            expect(label.prop('className')).toBe('event-publisher')
            expect(label.prop('htmlFor')).toBe('event-publisher')
            const message = label.find(FormattedMessage)
            expect(message).toHaveLength(1)
            expect(message.prop('id')).toBe('event-publisher')
        })

        describe('when form type is update', () => {
            test('input', () => {
                const formType = 'update'
                const selectedOption = testOrgB
                const input = getWrapper({formType, selectedOption}).find(Input)
                expect(input).toHaveLength(1)
                expect(input.prop('className')).toBe('event-publisher-input-disabled')
                expect(input.prop('id')).toBe('event-publisher')
                expect(input.prop('aria-disabled')).toBe(true)
                expect(input.prop('value')).toBe(testOrgB.label)
                expect(input.prop('readOnly')).toBe(true)
            })
        })

        describe('when form type is not update', () => {
            const options = [testOrgA, testOrgB]

            test('select input when there are more than one option', () => {
                const input = getWrapper({options}).find(Input)
                expect(input).toHaveLength(1)
                expect(input.prop('className')).toBe('event-publisher-input')
                expect(input.prop('id')).toBe('event-publisher')
                expect(input.prop('name')).toBe('event-publisher')
                expect(input.prop('onChange')).toBe(defaultProps.onChange)
                expect(input.prop('type')).toBe('select')
                const optionElements = input.find('option')
                expect(optionElements).toHaveLength(options.length)
                optionElements.forEach((element, index) => {
                    expect(element.prop('value')).toBe(options[index].value)
                    expect(element.text()).toBe(options[index].label)
                });
            })

            test('readonly input when there is only one option', () => {
                const input = getWrapper().find(Input)
                expect(input).toHaveLength(1)
                expect(input.prop('className')).toBe('event-publisher-input-disabled')
                expect(input.prop('id')).toBe('event-publisher')
                expect(input.prop('aria-disabled')).toBe(true)
                expect(input.prop('value')).toBe(defaultProps.options[0].label)
            })
        })
    })

    test('select onChange is called', () => {
        const options = [testOrgA, testOrgB]
        const onChange = jest.fn()
        const input = getWrapper({options, onChange}).find(Input)
        const event = {target: {value: testOrgB.value}}
        input.simulate('change', event)
        expect(onChange.mock.calls.length).toBe(1)
        expect(onChange.mock.calls[0][0]).toBe(event);
    })
})
