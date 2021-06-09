import React from 'react';
import {shallow} from 'enzyme';
import UmbrellaRadio from '../UmbrellaSelector/UmbrellaRadio';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import PropTypes from 'prop-types';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();


const defaultProps = {
    messageID: '',
    handleCheck: () => {},
    value: '',
}


describe('UmbrellaRadio', () => {
    function getWrapper(props) {
        return shallow(<UmbrellaRadio {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('render', () => {
        describe('components', () => {
            test('Formattedmessage', () => {
                const wrapper = getWrapper()
                const messageElement = wrapper.find(FormattedMessage)
                expect(messageElement).toHaveLength(1)
            })
            test('input', () => {
                const wrapper = getWrapper()
                const inputElement = wrapper.find('input')
                expect(inputElement.prop('className')).toBe('custom-control-input')
                expect(inputElement.prop('type')).toBe('radio')
                expect(inputElement.prop('name')).toBe('umbrellaGroup')
                expect(inputElement.prop('value')).toBe('')
                expect(inputElement.prop('disabled')).toBe(undefined)
                expect(inputElement.prop('onChange')).toBe(defaultProps.handleCheck)
                expect(inputElement.prop('checked')).toBe(undefined)
                expect(inputElement.prop('id')).toBe(`${defaultProps.value}_label`)
            })
            test('label', () => {
                const wrapper = getWrapper()
                const labelElement = wrapper.find('label')
                expect(labelElement).toHaveLength(1)
                expect(labelElement.prop('htmlFor')).toBe(`${defaultProps.value}_label`)
                expect(labelElement.prop('className')).toBe('custom-control-label')
            })
        })
    })
})

