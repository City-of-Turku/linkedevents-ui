import './index.scss'

import React from 'react'
import {connect} from 'react-redux'
import {FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {get, isNull} from 'lodash'
import PropTypes from 'prop-types'
import {Button} from 'reactstrap';
//Replaced Material-ui Spinner for a Bootstrap implementation. - Turku
import Spinner from 'react-bootstrap/Spinner'
import {Helmet} from 'react-helmet';

import {
    executeSendRequest as executeSendRequestAction,
    clearData as clearDataAction,
    setEditorAuthFlashMsg as setEditorAuthFlashMsgAction,
    setLanguages as setLanguageAction,
    setEventForEditing as setEventForEditingAction,
    setValidationErrors as setValidationErrorsAction,
} from '../../actions/editor'
import {confirmAction, clearFlashMsg as clearFlashMsgAction, setFlashMsg as setFlashMsgAction} from '../../actions/app'
import constants from '../../constants'
import FormFields from '../../components/FormFields/'
import {EventQueryParams, fetchEvent} from '../../utils/events'
import {push} from 'connected-react-router'
import moment from 'moment'
import {
    getOrganizationAncestors,
    getOrganizationMembershipIds,
    hasOrganizationWithRegularUsers,
} from '../../utils/user'
import EventActionButton from '../../components/EventActionButton/EventActionButton';
import {scrollToTop} from '../../utils/helpers'
import {doValidations} from '../../validation/validator'
import {mapAPIDataToUIFormat} from '../../utils/formDataMapping'
import getContentLanguages from '../../utils/language'
import Notifications from '../Notification'
import PreviewModal from '../../components/PreviewModal/PreviewModal'

const {PUBLICATION_STATUS, SUPER_EVENT_TYPE_UMBRELLA, USER_TYPE} = constants

// sentinel for authentication alert
let sentinel = true

export class EditorPage extends React.Component {

    state = {
        event: {},
        superEvent: {},
        subEvents: [],
        loading: false,
        isDirty: false,
        isRegularUser: false,
        showPreviewEventModal: false,
    }

    componentDidMount() {
        const {user, match, setFlashMsg, setEditorAuthFlashMsg} = this.props

        setEditorAuthFlashMsg()

        const params = get(match, 'params')
        const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
        const userHasOrganizations = !isNull(getOrganizationMembershipIds(user))

        this.setState({isRegularUser})

        if (user && !userHasOrganizations) {
            setFlashMsg('user-no-rights-create', 'error', {sticky: true})
        }
        if (params.action === 'update' && params.eventId) {
            this.fetchEventData()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const {event} = this.state

        const publisherId = get(event, 'publisher')
        const oldPublisherId = get(prevState, ['event', 'publisher'])
        const prevParams = get(prevProps, ['match', 'params'], {})
        const currParams = get(this.props, ['match', 'params'], {})

        // check if the editing mode or if the eventId params changed
        if (prevParams.action !== currParams.action || prevParams.eventId !== currParams.eventId) {
            if (currParams.action === 'update') {
                this.fetchEventData()
            } else {
                this.clearEventData()
                this.setState({
                    event: {},
                    superEvent: {},
                    subEvents: [],
                })
            }
        }

        if (publisherId && publisherId !== oldPublisherId) {
            getOrganizationAncestors(publisherId)
                .then(response => this.setState(state => ({
                    ...state,
                    event: {...state.event, publisherAncestors: response.data.data},
                })))
        }
    }

    componentWillUnmount() {
        this.props.clearFlashMsg()
        this.clearEventData()
    }

    /**
     * Fetches the event, sub event and super event data for the event that is being updated
     */
    fetchEventData = async () => {
        const {setEventForEditing} = this.props
        const eventId = get(this.props, ['match', 'params', 'eventId'])

        if (!eventId) {
            return
        }

        this.setState({loading: true})

        const queryParams = new EventQueryParams()
        queryParams.include = 'keywords,location,audience,in_language,external_links,image,sub_events'
        queryParams.nocache = moment().unix()

        try {
            const eventData = await fetchEvent(eventId, queryParams, true)
            const [event, subEvents, superEvent] = eventData

            this.setState({event, subEvents, superEvent})
            setEventForEditing(event)
        } finally {
            this.setState({loading: false})
        }
    }

    /**
     * Clears the editor data and the event, super event and sub events from the store
     */
    clearEventData = () => {
        const {clearData} = this.props
        clearData()
    }

    setDirtyState = () => {
        if (!this.state.isDirty) {
            this.setState({isDirty: true})
        }
    }

    eventIsPublished = () => {
        if (this.props.match.params.action !== 'update') {
            // we are not updating an existing event
            return false
        }
        let publicationStatus = get(this.props, 'editor.values.publication_status')
        if (!publicationStatus) {
            // if the field is missing, the user is not logged in, so the event is public
            return true
        }
        if (publicationStatus === PUBLICATION_STATUS.PUBLIC) {
            return true
        }
        // the publication status field exists and the event is not public
        return false
    }

    /**
     * Saves the editor changes
     */
    saveChanges = (isAdminDraft) => {
        const {subEvents, isRegularUser} = this.state
        const {match, editor: {values: formValues}, executeSendRequest} = this.props
        const updateExisting = get(match, ['params', 'action']) === 'update'
        const publicationStatus = (!isRegularUser && !isAdminDraft)
            ? PUBLICATION_STATUS.PUBLIC
            : PUBLICATION_STATUS.DRAFT

        this.setState({isDirty: false})
        executeSendRequest(formValues, updateExisting, publicationStatus, subEvents)
    }

    /**
     * Saves the editor changes to a draft event without publishing
     */
    saveChangesToDraft = () => {
        const {subEvents} = this.state
        const {editor: {values: formValues}, executeSendRequest} = this.props

        this.setState({isDirty: false})
        executeSendRequest(formValues, true, PUBLICATION_STATUS.DRAFT, subEvents)
    }

    /**
     * Navigates to the moderation page
     */
    navigateToModeration = () => {
        const {routerPush} = this.props
        routerPush('/moderation')
    }

    /**
     * Returns a button for the given action
     * @param action            Action to run
     * @param customAction      Custom action that should be run instead of the default one
     * @param confirm           Whether confirmation modal should be shown before running action
     * @param customButtonLabel ID of text to use as button label
     * @returns {*}
     */
    getActionButton = (action, customAction, confirm = true, customButtonLabel) => {
        const {event, subEvents} = this.state
        const eventIsPublished = this.eventIsPublished()
        const loading = this.state.loading || this.props.editor.loading
        const {intl} = this.props;

        return <EventActionButton
            action={action}
            confirmAction={confirm}
            customAction={customAction}
            customButtonLabel={customButtonLabel}
            event={event}
            eventIsPublished={eventIsPublished}
            loading={loading}
            runAfterAction={this.handleConfirmedAction}
            subEvents={subEvents}
            intl={intl}
        />
    }

    handleConfirmedAction = (action, event) => {
        const {routerPush, user} = this.props;
        const isDraft = event.publication_status === PUBLICATION_STATUS.DRAFT

        // navigate to moderation if an admin deleted a draft event, otherwise navigate to event listing
        if (action === 'delete') {
            if (isDraft && hasOrganizationWithRegularUsers(user)) {
                this.navigateToModeration();
            } else {
                routerPush('/')
            }
        }
        // navigate to event view after cancel action
        if (action === 'cancel') {
            routerPush(`/event/${event.id}`)
            scrollToTop()
        }
    }

    showPreviewEventModal() {
        this.setState({showPreviewEventModal: !this.state.showPreviewEventModal})
    }
    // Preview Modals button
    getPreviewButton () {
        const {intl} = this.props;
        return (
            <Button
                className='check-form-info'
                variant="contained"
                onClick={() => this.showPreviewEventModal()}
            >
                <FormattedMessage id='preview-event-button'>{txt =>txt}</FormattedMessage>
            </Button>
        )
    }

    validateEvent = () => {
        const {event} = this.state
        const {setValidationErrors, setFlashMsg, editor: {keywordSets}} = this.props
        const formattedEvent = mapAPIDataToUIFormat(event)
        const validationErrors = doValidations(formattedEvent, getContentLanguages(formattedEvent), PUBLICATION_STATUS.PUBLIC, keywordSets)

        Object.keys(validationErrors).length > 0
            ? setValidationErrors(validationErrors)
            : setFlashMsg('no-validation-errors', 'success')
    }

    render() {
        const {editor, user, match, intl} = this.props
        const {event, subEvents, superEvent, loading} = this.state
        const userType = user && user.userType
        const editMode = get(match, ['params', 'action'])
        const isUmbrellaEvent = get(editor, ['values', 'super_event_type']) === SUPER_EVENT_TYPE_UMBRELLA
        const isDraft = get(event, ['publication_status']) === PUBLICATION_STATUS.DRAFT
        const isAdminUser = userType === USER_TYPE.ADMIN
        const hasSubEvents = subEvents && subEvents.length > 0
        const headerTextId = editMode === 'update'
            ? 'edit-events'
            : 'create-events'
            // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: headerTextId})}`

        // TODO: fix flow for non-authorized users
        if (user && !user.organization && sentinel) {
            setTimeout(() => alert(intl.formatMessage({id:'editor-sentinel-alert'})), 1000);
            sentinel = false;
        }

        return (
            <React.Fragment>
                <div className="editor-page">
                    <Helmet title={pageTitle}/>
                    <div className="container header">
                        <div className="controls">
                            {isAdminUser && isDraft &&
                                <Button
                                    variant="contained"
                                    onClick={this.validateEvent}
                                    color="primary"
                                >
                                    {intl.formatMessage({id: 'validate-form'})}
                                </Button>
                            }
                            {/* Commented out since we decided that we wouldn't need this button - Turku

                             <Button
                                variant="contained"
                                onClick={this.clearEventData}
                                color="primary"
                                endIcon={<Close/>}
                            >
                                <FormattedMessage id="clear-form"/>
                            </Button> */}
                        </div>
                        <PreviewModal
                            toggle={() => this.showPreviewEventModal()}
                            isOpen={this.state.showPreviewEventModal}
                            editor={editor}
                            event={event}
                            superEvent={superEvent}
                            values={editor.values}
                        />
                    </div>

                    <div className="container mt-5 pt-3">
                        <FormFields
                            action={editMode}
                            editor={editor}
                            event={event}
                            superEvent={superEvent}
                            user={user}
                            setDirtyState={this.setDirtyState}
                            loading={loading}
                        />
                    </div>

                    <div className="editor-action-buttons">
                        {loading
                            ? <Spinner animation="border" role="status">
                                <span className="sr-only">Loading...</span>
                            </Spinner>
                            : <div className='buttons-group container'>
                                {editMode === 'update' && this.getActionButton('postpone')}
                                {editMode === 'update' && this.getActionButton('cancel')}
                                {editMode === 'update' && this.getActionButton('delete')}
                                {isDraft && hasOrganizationWithRegularUsers(user) &&
                                    this.getActionButton('return', this.navigateToModeration, false)
                                }
                                {
                                    // Button that opens a preview modal of the event
                                    this.getPreviewButton(
                                    )
                                }
                                {
                                    // button that saves changes to a draft without publishing
                                    // only shown to moderators
                                    isDraft && hasOrganizationWithRegularUsers(user) &&
                                    this.getActionButton(
                                        'update-draft',
                                        this.saveChangesToDraft,
                                        hasSubEvents && !isUmbrellaEvent,
                                        'event-action-save-draft-existing'
                                    )
                                }
                                {
                                    (isAdminUser && editMode === 'create') &&
                                    this.getActionButton(
                                        'create-admin-draft',
                                        () => this.saveChanges(true),
                                        hasSubEvents && !isUmbrellaEvent
                                    )
                                }
                                {
                                    // show confirmation modal when the updated event has sub events and isn't an umbrella event,
                                    // otherwise save directly
                                    this.getActionButton(
                                        'update',
                                        () => this.saveChanges(false),
                                        hasSubEvents && !isUmbrellaEvent
                                    )
                                }
                            </div>
                        }
                    </div>
                    <Notifications flashMsg={this.props.app.flashMsg} />
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user,
    app: state.app,
})

const mapDispatchToProps = (dispatch) => ({
    setEventForEditing: (eventId, user) => dispatch(setEventForEditingAction(eventId, user)),
    clearData: () => dispatch(clearDataAction()),
    setFlashMsg: (id, status, data) => dispatch(setFlashMsgAction(id, status, data)),
    setEditorAuthFlashMsg: () => dispatch(setEditorAuthFlashMsgAction()),
    setLanguages: (languages) => dispatch(setLanguageAction(languages)),
    setValidationErrors: (errors) => dispatch(setValidationErrorsAction(errors)),
    clearFlashMsg: () => dispatch(clearFlashMsgAction()),
    executeSendRequest: (formValues, updateExisting, publicationStatus, subEvents) =>
        dispatch(executeSendRequestAction(formValues, updateExisting, publicationStatus, subEvents)),
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
    routerPush: (url) => dispatch(push(url)),
})

EditorPage.propTypes = {
    match: PropTypes.object,
    intl: PropTypes.oneOfType([
        PropTypes.object,
        intlShape.isRequired,
    ]),
    editor: PropTypes.object,
    app: PropTypes.object,
    user: PropTypes.object,
    setEventForEditing: PropTypes.func,
    clearData: PropTypes.func,
    setFlashMsg: PropTypes.func,
    setEditorAuthFlashMsg: PropTypes.func,
    setLanguages: PropTypes.func,
    setValidationErrors: PropTypes.func,
    clearFlashMsg: PropTypes.func,
    executeSendRequest: PropTypes.func,
    confirm: PropTypes.func,
    routerPush: PropTypes.func,
    event: PropTypes.object,
    superEvent: PropTypes.object,
    subEvents: PropTypes.array,
    loading: PropTypes.bool,
    isDirty: PropTypes.bool,
    isRegularUser: PropTypes.bool,
}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EditorPage))
