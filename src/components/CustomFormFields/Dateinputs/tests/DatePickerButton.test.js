import {UnconnectedDatePickerButton} from '../DatePickerButton';
import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Button, UncontrolledTooltip} from 'reactstrap';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    disabled: false,
    onClick: () => {},
    intl,
}

function getWrapper(props) {
    return shallow(<UnconnectedDatePickerButton {...defaultProps} {...props} />, {intl: {intl}});
}

describe('DatePickerButton', () => {
    test('renders with correct props', () => {
        const wrapper = getWrapper()
        const button = wrapper.find(Button)
        expect(wrapper.find(Button)).toHaveLength(1)
        expect(button.prop('id')).toBe(defaultProps.id)
        expect(button.prop('disabled')).toBe(defaultProps.disabled)
        expect(button.prop('aria-hidden')).toBe(true)
        expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'date-picker-button-label'}))
        expect(button.prop('tabIndex')).toBe(-1)
        expect(button.prop('onClick')).toBe(defaultProps.onClick)
        expect(button.prop('className')).toBe('custom-date-input__button glyphicon glyphicon-calendar')
        const toolTip = wrapper.find(UncontrolledTooltip)
        expect(wrapper.find(UncontrolledTooltip)).toHaveLength(1)
        expect(toolTip.prop('placement')).toBe('top')
        expect(toolTip.prop('target')).toBe(defaultProps.id)
        expect(toolTip.prop('innerClassName')).toBe('tooltip-disabled')
        expect(toolTip.prop('hideArrow')).toBeDefined
    })
})
