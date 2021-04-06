import React from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import moment from 'moment'
import PropTypes from 'prop-types'
import {FormattedMessage, injectIntl} from 'react-intl'
import {getBadge} from '../../utils/helpers'
import {getStringWithLocale} from 'src/utils/locale';
import defaultThumbnail from '../../assets/images/linked-event-white.png'

import constants from '../../constants'
import './index.scss'

/**
 * 
 * @param  props return elements with props.values based on conditionals
 * Can display virtual, physical or both in event
 * @returns [] elements
 */
const locationAndVirtual = (props) => {
    const location = getStringWithLocale(props.event.location, 'name', props.locale)
    const virtual =  props.event.virtualevent_url
    const content = []
    const virtualIcon = <span aria-hidden className='glyphicon glyphicon-globe' key={Math.random()}/>
    const locationIcon = <span aria-hidden className='glyphicon glyphicon-map-marker' key={Math.random()} />
    const wrapper = (...content) => {return (<div className='info' key={Math.random()}>{content}</div>) }

    if (location && virtual) {
        content.push(
            wrapper(
                virtualIcon,
                <FormattedMessage id='event-is-virtualandhaslocation' key={Math.random()}>{txt => <p>{txt}</p>}</FormattedMessage>
            )
        )
    }
    if (virtual && !location) {
        content.push(
            wrapper(
                virtualIcon,
                <FormattedMessage id='event-isvirtual' key={Math.random()}>{txt => <p>{txt}</p>}</FormattedMessage>
            )
        )
    }
    if (location) {
        content.push(wrapper(locationIcon, <p key={Math.random()}><FormattedMessage id='eventItem-location'/> {location}</p>))
    }
    return [...content]
}

const EventItem = (props) => {
    const name = getStringWithLocale(props.event, 'name', props.locale)
    const url = '/event/' + encodeURIComponent(props.event['id']) + '/'
    const image = props.event.images.length > 0 ? props.event.images[0].url : defaultThumbnail
    const thumbnailStyle = {
        backgroundImage: 'url(' + image + ')',
    }
    const getDay = props.event.start_time
    let convertedDate = ''
    if (getDay) {
        const date = getDay.split('T')
        convertedDate = date[0].split('-').reverse().join('.')
    }
    const getStartingDay = moment(props.event.start_time).local().format()
    let convertedStartingDate = ''
    if (getStartingDay) {
        const date = getStartingDay.split('T')
        convertedStartingDate = date[0].split('-').reverse().join('.')
    }
    const getEndingDay = props.event.end_time ? moment(props.event.end_time).local().format() : undefined
    let convertedEndingDate = ''
    if (getEndingDay) {
        const date = getEndingDay.split('T')
        convertedEndingDate = date[0].split('-').reverse().join('.')
    }
    let convertedStartingTime = ''
    if (getStartingDay) {
        const time = getStartingDay.split('T')
        convertedStartingTime = time[1].split('', 5)
    }
    let convertedEndingTime = ''
    if (getEndingDay) {
        const time = getEndingDay.split('T')
        convertedEndingTime = time[1].split('', 5)
    }

    let shortDescription = getStringWithLocale(props.event, 'short_description', props.locale)
    if (shortDescription && shortDescription.length > 120) {
        shortDescription = shortDescription.slice(0,120) + '..'
    }
    const isCancelled = props.event.event_status === constants.EVENT_STATUS.CANCELLED
    const isPostponed = props.event.event_status === constants.EVENT_STATUS.POSTPONED
    const VirtualAndLocationInfo = locationAndVirtual(props)

    //props.homePage used in homepage.js
    if (props.homePage) {
        return (
            <div className="row event-home-row" key={props.event['id']}>
                <div className='container-fluid'>
                    <div className='row'>
                        <div className="col-md-4 col-sm-12 event-item-home">
                            {isCancelled && getBadge('cancelled')}
                            {isPostponed && getBadge('postponed')}
                            <div className="thumbnail-home" style={thumbnailStyle}/>
                        </div>
                        <div className="col name-home">
                            <Link to={url}>
                                <h3> {name} </h3>
                            </Link>
                            {VirtualAndLocationInfo}
                            <div className='info'>
                                <span aria-hidden className='glyphicon glyphicon-calendar'/>
                                <p><FormattedMessage id='eventItem-date'/> {convertedStartingDate} - {convertedEndingDate}</p>
                            </div>
                            <div className='info'>
                                <span aria-hidden className='glyphicon glyphicon-time'/>
                                <p className="converted-day"><FormattedMessage id='eventItem-time'/> {convertedStartingTime} - {convertedEndingTime}</p>
                            </div>
                            <div className='info'>
                                <span aria-hidden className='glyphicon glyphicon-pencil'/>
                                <p className='shortDescription'><FormattedMessage id='eventItem-description'/> {shortDescription}</p>
                            </div>
                        </div>
                    </div>
                    <div className='event-border'/>
                </div>
            </div>
        )
    }
    else
        return (
            <div className="col-xs-12 col-md-6 col-lg-4" key={props.event['id']}>
                <Link className="event-item-link" to={url}>
                    <div className="event-item">
                        {isCancelled && getBadge('cancelled')}
                        {isPostponed && getBadge('postponed')}
                        <div className="thumbnail" style={thumbnailStyle}/>
                        <div className="name">
                            <span className="converted-day">{convertedDate}</span>
                            {name}
                        </div>

                    </div>
                </Link>
            </div>
        )
}

const EventGrid = (props) => (
    <div className="row event-grid">
        {props.events.map(event => <EventItem event={event} homePage={props.homePage} locale={props.locale} key={event.id}/>)}
    </div>
)

EventItem.defaultProps = {
    homePage: false,
};
EventItem.propTypes = {
    event: PropTypes.object,
}

EventGrid.propTypes = {
    events: PropTypes.array,
    homePage: PropTypes.bool,
    locale: PropTypes.string,
    intl: PropTypes.object,
}

export default connect()(EventGrid)
