import './index.scss'

import React from 'react'
import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import PropTypes from 'prop-types'

import {setFlashMsg as setFlashMsgAction} from '../../actions/app'

import CONSTANTS from '../../constants'

class EventCreated extends React.Component {

    componentDidMount() {
        const {match, routerPush} = this.props

        if (match.params.action !== CONSTANTS.EVENT_CREATION.UPDATE) {
            routerPush(`/event/${this.props.match.params.eventId}`)
        }
    }
    render() {
        return (
            <div>
                <h1>Loading</h1>
            </div>
        )
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
