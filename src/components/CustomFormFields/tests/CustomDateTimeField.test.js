import React from 'react'
import {shallow} from 'enzyme'
import moment from 'moment'

import {UnconnectedCustomDateTimeField} from '../CustomDateTimeField';
import CustomDatePicker from '../CustomDatePicker';
import ValidationPopover from 'src/components/ValidationPopover'


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

        test('ValidationPopover with correct props', () => {
            const validationPopover = getWrapper().find(ValidationPopover)
            expect(validationPopover).toHaveLength(1)
            expect(validationPopover.prop('anchor')).toBe(null)
            expect(validationPopover.prop('placement')).toBe('right')
            expect(validationPopover.prop('validationErrors')).toBe(defaultProps.validationErrors)
        })
    })
})
