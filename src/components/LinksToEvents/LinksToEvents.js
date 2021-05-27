import './LinksToEvents.scss'

import React from 'react'
import PropTypes from 'prop-types'
import constants from '../../constants'
import {FormattedMessage} from 'react-intl'
import {Link} from 'react-router-dom'
import {getBadge, getFirstMultiLanguageFieldValue, scrollToTop} from '../../utils/helpers'
import moment from 'moment'
import {isNull, get} from 'lodash'
import {compareDates} from '../../utils/confirm'

const {
    EVENT_STATUS,
    PUBLICATION_STATUS,
    SUPER_EVENT_TYPE_RECURRING,
    SUPER_EVENT_TYPE_UMBRELLA,
} = constants



const getSuperEventLinks = (event, type) => (

    <React.Fragment>
        <p className="links-to-events--text">
            <FormattedMessage id={`super-event-of-${type}`} />
        </p>
        {event.sub_events.length > 0 &&
            <React.Fragment>
                <p className="links-to-events--text">
                    <FormattedMessage id={`sub-events-for-${type}`} />
                </p>
                {event.sub_events
                    // sort sub_events by start time
                    .sort(compareDates)
                    .map((subEvent => {
                        const isCancelled = subEvent.event_status === EVENT_STATUS.CANCELLED
                        const isRecurringEvent = subEvent.super_event_type === SUPER_EVENT_TYPE_RECURRING
                        const isDraft = subEvent.publication_status === PUBLICATION_STATUS.DRAFT

                        return (
                            <div key={subEvent.id}
                                className="links-to-events--link"
                            >
                                <Link
                                    to={`/event/${subEvent.id}`}
                                    onClick={scrollToTop}
                                >
                                    {isCancelled && getBadge('cancelled')}
                                    {isRecurringEvent && getBadge('series')}
                                    {isDraft && getBadge('draft')}
                                    <span>{getFirstMultiLanguageFieldValue(subEvent.name)} ({moment(subEvent.start_time).format('DD.MM.YYYY')})</span>
                                </Link>
                            </div>
                        )
                    }))}
            </React.Fragment>
        }
    </React.Fragment>
)

const getSubEventLinks = (type, superEventId, superEventName) => (
    <span className="links-to-events--text">
        <FormattedMessage id={`sub-event-of-${type}`} />
        <Link
            to={`/event/${superEventId}`}
            onClick={scrollToTop}
        >
            <span>{superEventName}</span>
        </Link>
    </span>
)

const LinksToEvents = ({event, superEvent}) => {
    const isUmbrellaEvent = event.super_event_type === SUPER_EVENT_TYPE_UMBRELLA
    const isRecurringEvent = event.super_event_type === SUPER_EVENT_TYPE_RECURRING
    const superEventIsUmbrellaEvent = !isNull(superEvent) && superEvent.super_event_type === SUPER_EVENT_TYPE_UMBRELLA
    const superEventIsRecurringEvent = !isNull(superEvent) && superEvent.super_event_type === SUPER_EVENT_TYPE_RECURRING
    const superEventId = !isNull(superEvent) && superEvent.id
    const superEventName = getFirstMultiLanguageFieldValue(get(superEvent, 'name'))

    return (
        <div className="links-to-events">
            {superEventIsUmbrellaEvent && superEventId && getSubEventLinks('umbrella', superEventId, superEventName)}
            {superEventIsRecurringEvent && superEventId && getSubEventLinks('series', superEventId, superEventName)}
            {isUmbrellaEvent && getSuperEventLinks(event, 'umbrella')}
            {isRecurringEvent && getSuperEventLinks(event, 'series')}
            {!isUmbrellaEvent && !isRecurringEvent && !superEventIsUmbrellaEvent && !superEventIsRecurringEvent &&
                <span  className="links-to-events--text">
                    <FormattedMessage id="no-links-to-events" />
                </span>
            }
        </div>
    )
}

LinksToEvents.propTypes = {
    event: PropTypes.object,
    superEvent: PropTypes.object,
}

export default LinksToEvents
