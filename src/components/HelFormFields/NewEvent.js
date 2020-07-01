import './NewEvent.scss'
import PropTypes from 'prop-types';
import React from 'react'
import CustomDateTimeField from '../CustomFormFields/CustomDateTimeField';
import {connect} from 'react-redux'
import {deleteSubEvent as deleteSubEventAction} from 'src/actions/editor'





const NewEvent = ({event, eventKey, errors, deleteSubEvent}) => (
    <div className="new-sub-event">
        <div className="new-sub-event--inputs">
            <CustomDateTimeField
                id={'start_time' + eventKey}
                name="start_time"
                label="event-starting-datetime"
                defaultValue={event.start_time}
                eventKey={eventKey}
                validationErrors={errors['start_time']}
            />
            <CustomDateTimeField
                disablePast
                id={'end_time' + eventKey}
                name="end_time"
                label="event-ending-datetime"
                defaultValue={event.end_time}
                eventKey={eventKey}
                validationErrors={errors['end_time']}
            />
        </div>
        <button
            className="new-sub-event--delete"
            onClick={() => deleteSubEvent(eventKey)}
        >
            <span className="glyphicon glyphicon-trash" aria-hidden="true"><p hidden>trash</p></span>
        </button>
        
    </div>
)

NewEvent.propTypes = {
    event: PropTypes.object.isRequired,
    eventKey: PropTypes.string.isRequired,
    errors: PropTypes.object,
    deleteSubEvent: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    deleteSubEvent: (eventKey) => dispatch(deleteSubEventAction(eventKey)),
})

export default connect(null, mapDispatchToProps)(NewEvent);
