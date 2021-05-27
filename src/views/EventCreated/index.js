import './index.scss'

import React from 'react'
import {connect} from 'react-redux'
import {FormattedMessage} from 'react-intl'
import {push} from 'connected-react-router'
import PropTypes from 'prop-types'

import {setFlashMsg as setFlashMsgAction} from '../../actions/app'

import CONSTANTS from '../../constants'

class EventCreated extends React.Component {

    componentDidMount() {
        const {match, setFlashMsg, routerPush} = this.props

        if (match.params.action !== CONSTANTS.EVENT_CREATION.UPDATE) {
            let headerTranslationId = this.getEventHeaderTranslationId()
            setFlashMsg(headerTranslationId, CONSTANTS.EVENT_CREATION.SUCCESS)
            routerPush(`/event/${this.props.match.params.eventId}`)
        }
    }

    goToBrowsing() {
        this.props.routerPush(`/`)
    }

    getEventHeaderTranslationId() {
        const EVENT_CREATION = CONSTANTS.EVENT_CREATION

        let headerTranslationId

        switch(this.props.match.params.action) {
            case EVENT_CREATION.CREATE:
                headerTranslationId = EVENT_CREATION.CREATE_SUCCESS
                break;
            case EVENT_CREATION.UPDATE:
                headerTranslationId = EVENT_CREATION.UPDATE_SUCCESS
                break;
            case EVENT_CREATION.CANCEL:
                headerTranslationId = EVENT_CREATION.CANCEL_SUCCESS
                break;
            case EVENT_CREATION.DELETE:
                headerTranslationId = EVENT_CREATION.DELETE_SUCCESS
                break;
            case EVENT_CREATION.PUBLISH:
                headerTranslationId = EVENT_CREATION.PUBLISH_SUCCESS
                break;
            case EVENT_CREATION.SAVE_DRAFT:
                headerTranslationId = EVENT_CREATION.SAVE_DRAFT_SUCCESS
                break;
            case EVENT_CREATION.SAVE_PUBLIC:
                headerTranslationId = EVENT_CREATION.SAVE_PUBLIC_SUCCESS
                break;
            default:
                headerTranslationId = EVENT_CREATION.DEFAULT_SUCCESS

        }
        return headerTranslationId
    }

    render() {
        if(this.props.match.params.action === 'delete') {
            let headerTranslationId = this.getEventHeaderTranslationId()
            return (
                <div className="event-page">
                    <h1>
                        <FormattedMessage id={`${headerTranslationId}`} />
                    </h1>
                </div>
            )
        }
        else {
            return (<div>Loading</div>)
        }
    }
}

EventCreated.propTypes = {
    match: PropTypes.object,
    setFlashMsg: PropTypes.func,
    events: PropTypes.object,
    routerPush: PropTypes.func,
}

const mapStateToProps = (state) => ({
    events: state.events,
    routing: state.routing,
    user: state.user,
})

const mapDispatchToProps = (dispatch) => ({
    setFlashMsg: (id, status) => dispatch(setFlashMsgAction(id, status)),
    routerPush: (url) => dispatch(push(url)),
    
})

export default connect(mapStateToProps, mapDispatchToProps)(EventCreated)



