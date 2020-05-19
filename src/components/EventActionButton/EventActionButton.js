import React, {useState,Fragment} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {get} from 'lodash'
import {checkEventEditability} from '../../utils/checkEventEditability'
import constants from '../../constants'
import showConfirmationModal from '../../utils/confirm'
import {appendEventDataWithSubEvents, getEventsWithSubEvents} from '../../utils/events'
import {Checkbox, FormControlLabel, Tooltip} from '@material-ui/core'
//Replaced Material-ui Spinner for a Bootstrap implementation. - Turku
import Spinner from 'react-bootstrap/Spinner'
import {confirmAction} from '../../actions/app'
import {getButtonLabel} from '../../utils/helpers'
import {Link} from 'react-router-dom'
import {Button} from 'reactstrap';

const {PUBLICATION_STATUS, EVENT_STATUS, USER_TYPE} = constants

/**
 * Returns whether the button is a save button based on given action
 * @param action
 * @returns {boolean}
 */
const isSaveButton = (action) => [
    'publish',
    'update',
    'update-draft',
].includes(action)

/**
 * Opens a confirmation modal and runs the given action
 * @param props
 */
const confirmEventAction = (props) => {
    const {action, event, subEvents, confirm, intl, runAfterAction, customAction} = props;
    const eventData = [event, ...subEvents]

    // opens the confirm modal
    const doConfirm = (data) => {
        showConfirmationModal(data, action, confirm, intl, event.publication_status, customAction)
            .then(() => runAfterAction(action, event))
    }

    // get the id's of events that have sub events
    // don't re-fetch sub event data for the event that the action is run for, as we already have it
    const eventsWithSubEvents = getEventsWithSubEvents(eventData)
        .filter(eventId => eventId !== event.id)

    // we need to append the event data with sub events of recurring events,
    // when we're running the action for an umbrella event
    eventsWithSubEvents.length > 0
        ? appendEventDataWithSubEvents(eventData, eventsWithSubEvents)
            .then((appendedData) => doConfirm(appendedData))
        : doConfirm(eventData)
}

const EventActionButton = (props) => {
    const {
        intl,
        editor,
        user,
        action,
        confirmAction,
        customAction,
        customButtonLabel,
        event,
        eventIsPublished,
        loading,
    } = props

    const [agreedToTerms, setAgreedToTerms] = useState(false)

    const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
    const formHasSubEvents = get(editor, ['values', 'sub_events'], []).length > 0
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isPostponed = get(event, 'event_status') === EVENT_STATUS.POSTPONED
    const {editable, explanationId} = checkEventEditability(user, event, action, editor)
    const showTermsCheckbox = isRegularUser && isSaveButton(action) && !isDraft
    let disabled = !editable || loading || (showTermsCheckbox && !agreedToTerms)

    let color = 'default'
    const buttonLabel = customButtonLabel || getButtonLabel(action, isRegularUser, isDraft, eventIsPublished, formHasSubEvents)

    if (action === 'publish' || action.includes('update') || action === 'edit') {
        color = 'primary'
    }
    if (action === 'cancel' || action === 'delete') {
        color = 'secondary'
    }

    if (action === 'postpone' && isPostponed) {
        disabled = true
    }

    const button =
        <Fragment>
            {showTermsCheckbox &&
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                        />
                    }
                    label={
                        <Fragment>
                            <FormattedMessage id={'terms-agree-text'} />
                            &nbsp;
                            <Link to={'/terms'} target="_blank">
                                <FormattedMessage id={'terms-agree-link'} />
                            </Link>
                        </Fragment>
                    }
                />
            }
            <Button
                variant="contained"
                disabled={disabled}
                endIcon={loading && isSaveButton(action) &&  
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>}
                className={`editor-${action}-button`}
                onClick={() => confirmAction ? confirmEventAction(props) : customAction()}
                color={color}
            >
                <FormattedMessage id={buttonLabel}/>
            </Button>
        </Fragment>

    return disabled && explanationId
        ? <Tooltip title={intl.formatMessage({id: explanationId})}>
            <span>{button}</span>
        </Tooltip>
        : button
}

EventActionButton.defaultProps = {
    event: {},
    subEvents: [],
}

EventActionButton.propTypes = {
    intl: intlShape.isRequired,
    editor: PropTypes.object,
    user: PropTypes.object,
    confirm: PropTypes.func,
    action: PropTypes.string,
    confirmAction: PropTypes.bool,
    customAction: PropTypes.func,
    customButtonLabel: PropTypes.string,
    event: PropTypes.object,
    eventIsPublished: PropTypes.bool,
    loading: PropTypes.bool,
    runAfterAction: PropTypes.func,
    subEvents: PropTypes.array,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user,
})

const mapDispatchToProps = (dispatch) => ({
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EventActionButton))
