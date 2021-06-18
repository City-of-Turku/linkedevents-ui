import React, {Fragment} from 'react'
import {connect} from 'react-redux'
import EventDetails from 'src/components/EventDetails'
import moment from 'moment'
import PropTypes from 'prop-types'
import {FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {Button} from 'reactstrap';
import {Helmet} from 'react-helmet';
//Replaced Material-ui Spinner for a Bootstrap implementation. - Turku
import Spinner from 'react-bootstrap/Spinner'
import {push} from 'connected-react-router'
import {replaceData as replaceDataAction} from 'src/actions/editor.js'
import {confirmAction} from 'src/actions/app.js'
import {getStringWithLocale} from 'src/utils/locale'
import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping.js'
import client from '../../api/client'
import constants from 'src/constants'
import {get} from 'lodash'
import {EventQueryParams, fetchEvent} from '../../utils/events'
import {getBadge, scrollToTop} from '../../utils/helpers'

import './index.scss'
import EventActionButton from '../../components/EventActionButton/EventActionButton'
import {getOrganizationAncestors, hasOrganizationWithRegularUsers} from '../../utils/user'

const {
    USER_TYPE,
    PUBLICATION_STATUS,
    EVENT_STATUS,
    SUPER_EVENT_TYPE_UMBRELLA,
    SUPER_EVENT_TYPE_RECURRING,
} = constants

class EventPage extends React.Component {

    state = {
        event: {},
        superEvent: {},
        subEvents: [],
        // loading is true initially because we always fetch event data when the component is mounted
        loading: true,
        publisher: null,
    }

    componentDidMount() {
        this.fetchEventData()
    }

    componentDidUpdate(prevProps, prevState) {
        const {event} = this.state

        const publisherId = get(event, 'publisher')
        const oldPublisherId = get(prevState, ['event', 'publisher'])
        const eventId = get(this.props.match, ['params', 'eventId'])
        const oldEventId = get(prevProps, ['match', 'params', 'eventId'])

        if (eventId !== oldEventId) {
            this.fetchEventData()
        }

        // refresh event data when user changes to handle data behind permissions
        if (prevProps.user !== this.props.user){
            this.fetchEventData()
        }

        if (publisherId && publisherId !== oldPublisherId) {
            client.get(`organization/${publisherId}`)
                .then(response => this.setState({publisher: response.data}))
            getOrganizationAncestors(publisherId)
                .then(response => this.setState(state => ({
                    ...state,
                    event: {...state.event, publisherAncestors: response.data.data},
                })))
        }
    }

    /**
     * Fetches the event, sub event and super event data
     */
    fetchEventData = async () => {
        const eventId = get(this.props, ['match', 'params', 'eventId'])

        if (!eventId) {
            return
        }

        this.setState({loading: true})

        const queryParams = new EventQueryParams()
        queryParams.include = 'keywords,location,audience,in_language,external_links,sub_events'

        try {
            const eventData = await fetchEvent(eventId, queryParams, true)
            const [event, subEvents, superEvent] = eventData

            this.setState({event, subEvents, superEvent})
        } finally {
            this.setState({loading: false})
        }
    }

    /**
     * Opens the editor with the event data in given mode
     * @param mode  Whether event is copied as a template or being updated. Can be 'copy', 'update' or 'add'
     */
    openEventInEditor = (mode = 'update') => {
        const {replaceData, routerPush} = this.props
        const {event} = this.state
        let route;
        if (mode === 'addRecurring') {
            route = `${event.id}/recurring/add/`
            
        } else if (mode === 'copy') {
            route =  'create/new'
        } else {
            route = `update/${event.id}` 
        }
        if (mode === 'addRecurring') {
            replaceData(event, true)
        } else {
            replaceData(event)  
        }
        routerPush(`/event/${route}`)
        scrollToTop()
    }

    /**
     * Returns the publisher & creator info text
     * @returns {null|*}
     */
    getPublishedText = () => {
        const {event, publisher} = this.state

        if (!publisher) {
            return null
        }

        const createdBy = get(event, 'created_by')
        const publishedAt = moment(event.last_modified_time).format('D.M.YYYY HH:mm')
        let creator, email

        if (createdBy) {
            [creator, email] = createdBy.split(' - ')
        }

        return (
            <span>
                <FormattedMessage id="event-publisher-info" values={{publisher: publisher.name}}/>
                {creator && email &&
                    <React.Fragment>
                        <span> | {creator} | </span>
                        <a href={`mailto:${email}`}>{email}</a>
                    </React.Fragment>
                }
                <span> | {publishedAt}</span>
            </span>
        )
    }

    /**
     * Returns a div containing all the action buttons for the view
     * @returns {*}
     */
    getEventActions = () => {
        const {user} = this.props
        const {event, loading} = this.state
        const userType = get(user, 'userType')
        const isDraft = event.publication_status === PUBLICATION_STATUS.DRAFT
        const isAdmin = userType === USER_TYPE.ADMIN
        const isRecurring = event.super_event_type === SUPER_EVENT_TYPE_RECURRING
        const editEventButton = this.getActionButton('edit', this.openEventInEditor, false)
        const addRecurringButton = this.getActionButton('add', () => this.openEventInEditor('addRecurring'), false)
        const publishEventButton = this.getActionButton('publish')
        const postponeEventButton = this.getActionButton('postpone')
        const cancelEventButton = this.getActionButton('cancel')
        const deleteEventButton = this.getActionButton('delete')

        return <div className="event-actions">
            <div className="cancel-delete-btn">
                {postponeEventButton}
                {cancelEventButton}
                {deleteEventButton}
            </div>
            <div className="edit-copy-btn">
                {isAdmin && isDraft && publishEventButton}
                {editEventButton}
                {isRecurring && addRecurringButton}
                <Button
                    variant="contained"
                    disabled={loading || !user}
                    onClick={() => this.openEventInEditor('copy')}
                >
                    {user
                        ? <FormattedMessage id="copy-event-to-draft">{txt =>txt}</FormattedMessage>
                        : <FormattedMessage id='user-no-rights-copy'>{txt => txt}</FormattedMessage>
                    }
                </Button>
            </div>
        </div>
    }

    /**
     * Returns a button for the given action
     * @param action        Action to run
     * @param customAction  Custom action that should be run instead of the default one
     * @param confirm       Whether confirmation modal should be shown before running action
     * @returns {*}
     */
    getActionButton = (action, customAction, confirm = true) => {
        const {event, subEvents, loading} = this.state
        const {intl} = this.props;

        return <EventActionButton
            action={action}
            confirmAction={confirm}
            customAction={customAction}
            event={event}
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
                routerPush('/moderation')
            } else {
                routerPush('/')
            }
        }
        // re-fetch event data after cancel, postpone or publish action
        if (action === 'cancel' || action === 'publish' ||  action === 'postpone' ) {
            this.fetchEventData()
        }
    }

    render() {
        const {event, superEvent, loading, publisher} = this.state
        const {editor} = this.props

        const formattedEvent = mapAPIDataToUIFormat(this.state.event)
        const isUmbrellaEvent = event.super_event_type === SUPER_EVENT_TYPE_UMBRELLA
        const isRecurringEvent = event.super_event_type === SUPER_EVENT_TYPE_RECURRING
        const isDraft = event.publication_status === PUBLICATION_STATUS.DRAFT
        const isCancelled = event.event_status === EVENT_STATUS.CANCELLED
        const isPostponed = event.event_status === EVENT_STATUS.POSTPONED
        const publishedText = this.getPublishedText();
        // Defined React Helmet title with event name
        const pageTitle = `Linkedevents - ${getStringWithLocale(event, 'name')}`

        return (
            <Fragment>
                <div className="event-page container">
                    <Helmet title={pageTitle}/>
                    <header>
                        <h1>
                            {loading
                                ? <Spinner animation="border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </Spinner>
                                : getStringWithLocale(event, 'name')
                            }
                        </h1>
                        {!loading &&
                        <h2>
                            {isPostponed && getBadge('postponed', 'medium')}
                            {isCancelled && getBadge('cancelled', 'medium')}
                            {isDraft && getBadge('draft', 'medium')}
                            {isUmbrellaEvent && getBadge('umbrella', 'medium')}
                            {isRecurringEvent && getBadge('series', 'medium')}
                        </h2>
                        }
                    </header>
                    {this.getEventActions()}
                    <div className="published-information">
                        {publishedText}
                    </div>
                    <EventDetails
                        values={formattedEvent}
                        superEvent={superEvent}
                        rawData={event}
                        publisher={publisher}
                        editor={editor}
                    />
                </div>
                <div className='event-action-buttons'>
                    {this.getEventActions()}
                </div>
            </Fragment>
        )
    }
}

EventPage.propTypes = {
    intl: intlShape.isRequired,
    editor: PropTypes.object,
    user: PropTypes.object,
    match: PropTypes.object,
    events: PropTypes.object,
    superEvent: PropTypes.object,
    subEvents: PropTypes.object,
    loading: PropTypes.bool,
    replaceData: PropTypes.func,
    routerPush: PropTypes.func,
    confirm: PropTypes.func,
}

const mapStateToProps = (state) => ({
    user: state.user,
    editor: state.editor,
})

const mapDispatchToProps = (dispatch) => ({
    replaceData: (event, recurring) => dispatch(replaceDataAction(event, recurring)),
    routerPush: (url) => dispatch(push(url)),
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
})

export {EventPage as UnconnectedEventPage}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(EventPage))
