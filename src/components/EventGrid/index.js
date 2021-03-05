import React from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import moment from 'moment'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import forEach from 'lodash/forEach'
import {getBadge} from '../../utils/helpers'

import defaultThumbnail from '../../assets/images/helsinki-coat-of-arms-white.png'

import constants from '../../constants'
import './index.scss'

const dateFormat = function (timeStr) {
    return timeStr ? moment(timeStr).format('YYYY-MM-DD') : ''
}

const getName = (event) => {
    const paths = [
        'name.fi',
        'name.en',
        'name.sv',
        'headline.fi',
        'headline.en',
        'headline.sv',
    ]

    let name
    forEach(paths, (path) => {
        name = get(event, path)

        // We found a name, exit forEach
        if (name) {
            return false
        }
    })

    if (name) {
        return name
    }

    // If we don't have a name at this point, try to find a translation/locale from name field.
    forEach(get(event, 'name', []), (item) => {
        name = item
        return false
    })

    if (name) {
        return name
    }

    // If name field didn't have any translation/locale, then try to find one in headline field.
    forEach(get(event, 'headline', []), (item) => {
        name = item
        return false
    })

    // If name still doesn't have a value, then return an empty string.
    return name ? name : ''
}

const EventItem = (props) => {
    const name = getName(props.event)
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
    const isCancelled = props.event.event_status === constants.EVENT_STATUS.CANCELLED
    const isPostponed = props.event.event_status === constants.EVENT_STATUS.POSTPONED

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
        {props.events.map(event => <EventItem event={event} key={event.id}/>)}
    </div>
)

EventItem.propTypes = {
    event: PropTypes.object,
}

EventGrid.propTypes = {
    events: PropTypes.array,
}

export default connect()(EventGrid)
