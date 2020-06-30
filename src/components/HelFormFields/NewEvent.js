import './NewEvent.scss'
import PropTypes from 'prop-types';
import React from 'react'
import CustomDateTimeField from '../CustomFormFields/CustomDateTimeField';
import {connect} from 'react-redux'
import {deleteSubEvent as deleteSubEventAction} from 'src/actions/editor'
import {IconButton, withStyles} from '@material-ui/core'
import {Delete} from '@material-ui/icons'
import {FormattedMessage} from 'react-intl'

const DeleteButton = withStyles(theme => ({
    root: {
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        transform: `translateX(calc(-1.2em - ${theme.spacing(1)}px))`,
        '& svg': {
            height: '1.2em',
            width: '1.2em',
        },
    },
}))(IconButton)

const NewEvent = ({event, eventKey, errors, deleteSubEvent}) => (
    <div className="new-sub-event">
        <div className="new-sub-event--inputs">
            <CustomDateTimeField
                id={'start_time' + eventKey}
                name="start_time"
                label={<FormattedMessage  id="event-starting-datetime" />}
                defaultValue={event.start_time}
                eventKey={eventKey}
                validationErrors={errors['start_time']}
            />
            <CustomDateTimeField
                disablePast
                id={'end_time' + eventKey}
                name="end_time"
                label={<FormattedMessage  id="event-ending-datetime" />}
                defaultValue={event.end_time}
                eventKey={eventKey}
                validationErrors={errors['end_time']}
            />
        </div>
        <DeleteButton
            className="new-sub-event--delete"
            color="secondary"
            onClick={() => deleteSubEvent(eventKey)}
        >
            <Delete/>
        </DeleteButton>
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
