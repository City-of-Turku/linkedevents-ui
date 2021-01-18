import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {UnconnectedNotifications} from '../index'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('Notifications', () => {
    const defaultProps = {}

    const flashMsg = {
        action: undefined,
        data: {sticky: true},
        msg: 'editor-authorization-required',
        sticky: true,
        style: 'error',
    }

    function getWrapper(props) {
        return shallow(<UnconnectedNotifications {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('when flash message is defined', () => {
        test('renders div', () => {
            const isSticky =  flashMsg && flashMsg.sticky
            const duration = isSticky ? null : 7000
            const div = getWrapper({flashMsg}).find('div')
            expect(div).toHaveLength(1)
            expect(div.prop('open')).toBe(!!flashMsg)
            expect(div.prop('autohideduration')).toBe(duration)
            expect(div.prop('onClose')).toBeDefined()
        })

        test('renders paragraph', () => {
            const paragraph = getWrapper({flashMsg}).find('p')
            expect(paragraph).toHaveLength(1)
            expect(paragraph.prop('className')).toBe('text-center')
            expect(paragraph.prop('role')).toBe('alert')
            expect(paragraph.text()).toBe('<FormattedMessage />')
        })
    })

    describe('when flash message is not defined', () => {
        test('doesnt render div', () => {
            const div = getWrapper().find('div')
            expect(div).toHaveLength(0)
        })

        test('doesnt render paragraph', () => {
            const paragraph = getWrapper().find('p')
            expect(paragraph).toHaveLength(0)
        })
    })

    describe('shouldComponentUpdate', () => {
        test('returns true when props have changed', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            expect(instance.shouldComponentUpdate({flashMsg})).toBe(true)
        })

        test('returns false when props have not changed', () => {
            const wrapper = getWrapper({flashMsg})
            const instance = wrapper.instance()
            expect(instance.shouldComponentUpdate({flashMsg})).toBe(false)
        })
    })
})
