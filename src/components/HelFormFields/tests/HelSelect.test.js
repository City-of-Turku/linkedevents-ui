import {mount} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import React from 'react'
import AsyncSelect from 'react-select/async'
import ValidationNotification from '../../ValidationNotification'
import {UnconnectedHelSelect} from '../HelSelect'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const dispatch = jest.fn()

const defaultProps = {
    intl,
    name: 'location',
    required: true,
    resource: 'place',
    validationErrors: undefined,
}

describe('HelSelect', () => {
    function getWrapper(props) {
        return mount(<UnconnectedHelSelect {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('renders', () => {
        describe('components', () => {
            describe('AsynchSelect', () => {
                test('find AsyncSelect', () => {
                    const wrapper = getWrapper()
                    const Select = wrapper.find(AsyncSelect)
                    expect(Select).toHaveLength(1)
                })
            })
            describe('validationNotification', () => {
                test('find validationNotification', () => {
                    const wrapper = getWrapper()
                    const notification = wrapper.find(ValidationNotification)
                    expect(notification).toHaveLength(1)
                })
            })
            describe('AsyncSelect input', () => {
                const wrapper = getWrapper()
                const selectInput = wrapper.find('input')
                test('find input inside HelSelects AsyncSelect', () => {
                    expect(selectInput).toHaveLength(1)
                })
                test('correct props on input', () => {
                    expect(selectInput.prop('type')).toBe('text')
                    expect(selectInput.prop('id')).toBe('react-select-2-input')
                    expect(selectInput.prop('aria-autocomplete')).toBe('list')
                    expect(selectInput.prop('aria-label')).toBe(intl.formatMessage({id: 'select'}))
                    expect(selectInput.prop('autoCapitalize')).toBe('none')
                })
            })
        })
    })
})
