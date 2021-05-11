import React from 'react'
import {shallow} from 'enzyme'
import moment from 'moment'

import {UnconnectedCustomDateTimeField} from '../CustomDateTimeField';
import CustomDatePicker from '../CustomDatePicker';
import ValidationNotification from 'src/components/ValidationNotification'


describe('CustomDateTimeField', () => {
    const defaultProps = {
        id: 'test-id',
        setData: () => {},
        updateSubEvent: () => {},
        name: 'test-name',
        eventKey: 'test-event-key',
        defaultValue: moment('2020-03-25').toString(),
        setDirtyState: () => {},
        label: 'test-label',
        validationErrors: {error: 'test-error'},
        disabled: false,
        disablePast: false,
        minDate: moment('2020-03-23'),
        maxDate: moment('2020-04-23'),
    }

    function getWrapper(props) {
        return shallow(<UnconnectedCustomDateTimeField {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        test('CustomDatePicker with correct props', () => {
            const datePicker = getWrapper().find(CustomDatePicker)
            expect(datePicker).toHaveLength(1)
            expect(datePicker.prop('id')).toBe(defaultProps.id)
            expect(datePicker.prop('type')).toBe('date-time')
            expect(datePicker.prop('name')).toBe(defaultProps.name)
            expect(datePicker.prop('label')).toBe(defaultProps.label)
            expect(datePicker.prop('disabled')).toBe(defaultProps.disabled)
            expect(datePicker.prop('disablePast')).toBe(defaultProps.disablePast)
            expect(datePicker.prop('defaultValue')).toBe(defaultProps.defaultValue)
            expect(datePicker.prop('onChange')).toBeDefined()
            expect(datePicker.prop('minDate')).toBe(defaultProps.minDate)
            expect(datePicker.prop('maxDate')).toBe(defaultProps.maxDate)
            expect(datePicker.prop('required')).toBe(false)
        })

        test('ValidationNotification with correct props', () => {
            const ValidationNotifications = getWrapper().find(ValidationNotification)
            expect(ValidationNotifications).toHaveLength(1)
            expect(ValidationNotifications.prop('anchor')).toBe(null)
            expect(ValidationNotifications.prop('className')).toBe('validation-notification')
            expect(ValidationNotifications.prop('validationErrors')).toBe(defaultProps.validationErrors)
        })
    })
})
