  
import PropTypes from 'prop-types';
import React, {useRef} from 'react'
import moment from 'moment-timezone'
import {connect} from 'react-redux'
import {setData as setDataAction, updateSubEvent as updateSubEventAction} from 'src/actions/editor'
import ValidationNotification from 'src/components/ValidationNotification'
import {isNil} from 'lodash'
import CustomDatePicker from './CustomDatePicker';

const onChange = (
    value,
    name,
    eventKey,
    updateSubEvent,
    setData,
    setDirtyState = () => {}
) => {
    const formattedValue = !isNil(value)
        ? value.isValid()
            // if valid, convert to utc time and format to ISO string
            ? moment(value).tz('Europe/Helsinki').utc().toISOString()
            // use moment input value if the date is invalid
            : value.creationData().input
        : undefined

    eventKey
        ? updateSubEvent(formattedValue, name, eventKey)
        : setData({[name]: formattedValue})

    setDirtyState()
}

const CustomDateTimeField = ({
    id,
    name,
    eventKey,
    defaultValue,
    disabled,
    disablePast,
    label,
    validationErrors,
    setData,
    updateSubEvent,
    setDirtyState,
    minDate,
    maxDate,
    required,
}) => {
    const containerRef = useRef(null)

    return (
        <div ref={containerRef}>
            <CustomDatePicker
                id={id}
                type={'date-time'}
                name={name}
                label={label}
                disabled={disabled}
                disablePast={disablePast}
                defaultValue={defaultValue}
                onChange={value => onChange(value, name, eventKey, updateSubEvent, setData, setDirtyState)}
                minDate={minDate}
                maxDate={maxDate}
                required={required}
            />
            <ValidationNotification
                className='validation-notification' 
                anchor={containerRef.current}
                validationErrors={validationErrors}
            />
        </div>
    )
}

CustomDateTimeField.propTypes = {
    id: PropTypes.string.isRequired,
    setData: PropTypes.func,
    updateSubEvent: PropTypes.func,
    name: PropTypes.string.isRequired,
    eventKey: PropTypes.string,
    defaultValue: PropTypes.string,
    setDirtyState: PropTypes.func,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    disabled: PropTypes.bool,
    disablePast: PropTypes.bool,
    required: PropTypes.bool,
    minDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
    maxDate: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
    updateSubEvent: (value, property, eventKey) => dispatch(updateSubEventAction(value, property, eventKey)),
})

export {CustomDateTimeField as UnconnectedCustomDateTimeField}
export default connect(null, mapDispatchToProps)(CustomDateTimeField)
