import React from 'react'
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';

import fiMessages from 'src/i18n/fi.json';
import {CollapseButtonWithoutIntl as  CollapseButton} from './CollapseButton';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('CollapseButton', () => {
    const defaultProps = {
        id: 'test-id',
        intl,
        isOpen: false,
        targetCollapseNameId: 'event-category-header',
        toggleHeader: () => {},
    }

    function getWrapper(props) {
        return shallow(<CollapseButton {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        describe('Button', () => {
            test('with correct default props', () => {
                const button = getWrapper()
                expect(button).toHaveLength(1)
                expect(button.prop('aria-expanded')).toBe(defaultProps.isOpen)
                expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'editor-headerbutton-expand'}) + ' '
                    + intl.formatMessage({id: defaultProps.targetCollapseNameId}))
                expect(button.prop('className')).toBe('headerbutton')
                expect(button.prop('color')).toBe('collapse')
                expect(button.prop('id')).toBe(defaultProps.id)
                expect(button.prop('onClick')).toBe(defaultProps.toggleHeader)
            })

            test('with correct aria-expanded and aria-label when isOpen is false', () => {
                const button = getWrapper({isOpen: false})
                expect(button).toHaveLength(1)
                expect(button.prop('aria-expanded')).toBe(false)
                expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'editor-headerbutton-expand'}) + ' '
                    + intl.formatMessage({id: defaultProps.targetCollapseNameId}))
            })

            test('with correct aria-expanded and aria-label when isOpen is true', () => {
                const button = getWrapper({isOpen: true})
                expect(button).toHaveLength(1)
                expect(button.prop('aria-expanded')).toBe(true)
                expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'editor-headerbutton-collapse'}) + ' '
                    + intl.formatMessage({id: defaultProps.targetCollapseNameId}))
            })

            test('with correct classnames when there are errors', () => {
                const validationErrorList = ['some-error']
                const button = getWrapper({validationErrorList})
                expect(button).toHaveLength(1)
                expect(button.prop('className')).toBe('headerbutton error')
            })

            test('with correct classnames when there are no errors', () => {
                const validationErrorList = []
                const button = getWrapper({validationErrorList})
                expect(button).toHaveLength(1)
                expect(button.prop('className')).toBe('headerbutton')
            })

            test('with correct aria-label when isRequired is false', () => {
                const button = getWrapper({isRequired: false})
                expect(button).toHaveLength(1)
                expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'editor-headerbutton-expand'}) + ' '
                    + intl.formatMessage({id: defaultProps.targetCollapseNameId}))
            })

            test('with correct aria-label when isRequired is true', () => {
                const button = getWrapper({isRequired: true})
                expect(button).toHaveLength(1)
                expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'editor-headerbutton-expand'}) + ' '
                    + intl.formatMessage({id: defaultProps.targetCollapseNameId}) + ' '
                    + intl.formatMessage({id: 'editor-expand-required'}))
            })
        })
        
        test('FormattedMessage with correct props', () => {
            const message = getWrapper().find(FormattedMessage)
            expect(message).toHaveLength(1)
            expect(message.prop('id')).toBe(defaultProps.targetCollapseNameId)
        })
        
        describe('icon span', () => {
            test('with correct props when isOpen is false', () => {
                const icon = getWrapper({isOpen: false}).find('span')
                expect(icon).toHaveLength(1)
                expect(icon.prop('aria-hidden')).toBe(true)
                expect(icon.prop('className')).toBe('glyphicon glyphicon-chevron-down')
            })

            test('with correct props when isOpen is true', () => {
                const icon = getWrapper({isOpen: true}).find('span')
                expect(icon).toHaveLength(1)
                expect(icon.prop('aria-hidden')).toBe(true)
                expect(icon.prop('className')).toBe('glyphicon glyphicon-chevron-up')
            })
        })
    })
})
