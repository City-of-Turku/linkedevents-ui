import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider,FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import {Button, Input} from 'reactstrap';
import {Link} from 'react-router-dom';
import classNames from 'classnames';

import fiMessages from 'src/i18n/fi.json';
import {UnconnectedEventActionButton} from '../EventActionButton'
import constants from '../../../constants';

const {PUBLICATION_STATUS, USER_TYPE} = constants;
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('EventActionButton', () => {
    const defaultProps = {
        intl,
        editor: {
            validationErrors: {},
        },
        user: {},
        confirm: () => {},
        action: 'update',
        confirmAction: true,
        customAction: () => {},
        event: {},
        eventIsPublished: false,
        loading: false,
        runAfterAction: () => {},
        subEvents: [],
    }

    function getWrapper(props) {
        return shallow(<UnconnectedEventActionButton {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('terms checkbox', () => {
        const user = {userType: USER_TYPE.REGULAR}
        const event = {publication_status: PUBLICATION_STATUS.PUBLIC}
        const action = 'update'
        describe('when user is regular user, button is save button and event isnt draft', () => {
            test('renders div', () => {
                const div = getWrapper({user, event, action}).find('div')
                expect(div).toHaveLength(1)
                expect(div.prop('className')).toBe('custom-control custom-checkbox')
            })

            test('renders Input', () => {
                const wrapper = getWrapper({user, event, action})
                const instance = wrapper.instance()
                const input = wrapper.find('input')
                expect(input).toHaveLength(1)
                expect(input.prop('type')).toBe('checkbox')
                expect(input.prop('checked')).toBe(instance.state.agreedToTerms)
                expect(input.prop('onChange')).toBe(instance.handleChange)
                expect(input.prop('id')).toBe('terms-agree')
            })

            test('renders label', () => {
                const label = getWrapper({user, event, action}).find('label')
                expect(label).toHaveLength(1)
                expect(label.prop('htmlFor')).toBe('terms-agree')
            })

            test('renders first FormattedMessage', () => {
                const formattedMessages = getWrapper({user, event, action}).find('label').find(FormattedMessage)
                expect(formattedMessages).toHaveLength(2)
                const formattedMessage = formattedMessages.first()
                expect(formattedMessage.prop('id')).toBe('terms-agree-text')
            })

            test('renders Link', () => {
                const link = getWrapper({user, event, action}).find(Link)
                expect(link).toHaveLength(1)
                expect(link.prop('to')).toBe('/terms')
                expect(link.prop('target')).toBe('_black')
            })

            test('renders second FormattedMessage', () => {
                const formattedMessage = getWrapper({user, event, action}).find(Link).find(FormattedMessage)
                expect(formattedMessage).toHaveLength(1)
                expect(formattedMessage.prop('id')).toBe('terms-agree-link')
            })
        })

        describe('when terms checkbox is not shown', () => {
            test('checkbox elements are not rendered', () => {
                const wrapper = getWrapper().find('terms-checkbox')
                expect(wrapper).toHaveLength(0)
            })
        })
    })

    describe('Button', () => {
        test('is rendered', () => {
            const button = getWrapper().find(Button)
            const expectedAriaLabeltext = 'Julkaise tapahtuma. Sinulla ei ole oikeuksia muokata tätä tapahtumaa.'
            expect(button).toHaveLength(1)
            expect(button.prop('aria-disabled')).toBe(true)
            expect(button.prop('aria-label')).toBe(expectedAriaLabeltext)
            expect(button.prop('id')).toBe(defaultProps.action)
            expect(button.prop('color')).toBe('secondary')
            expect(button.prop('className')).toBe(classNames(`editor-${defaultProps.action}-button`,{'disabled': true}))
            expect(button.prop('onClick')).toBeDefined()
            expect(button.prop('style')).toEqual({'cursor': 'not-allowed'})
        })
    })

    describe('functions', () => {
        describe('isSaveButton', () => {
            test('returns true when action is publish, update or update-draft', () => {
                const instance = getWrapper().instance()
                const saveActions = ['publish','update','update-draft']
                saveActions.forEach(action => {
                    expect(instance.isSaveButton(action)).toBe(true)
                });
            })

            test('returns false when action is not ublish, update or update-draft', () => {
                const instance = getWrapper().instance()
                expect(instance.isSaveButton('test-action')).toBe(false)
            })
        })

        describe('handleChange', () => {
            test('sets state agreedToTerms to and false', () => {
                const instance = getWrapper().instance()
                instance.state.agreedToTerms = false
                const event = {target: {checked: true}}
                instance.handleChange(event)
                expect(instance.state.agreedToTerms).toBe(true)
                event.target.checked = false
                instance.handleChange(event)
                expect(instance.state.agreedToTerms).toBe(false)
            })
        })
    })
})
