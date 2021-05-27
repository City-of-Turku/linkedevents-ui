import client from '../api/client'
import moment from 'moment'
import constants from '../constants'
import {get, isUndefined, set} from 'lodash'
import {getFirstMultiLanguageFieldValue} from './helpers'
import {eventIsEditable} from './checkEventEditability'
import {getStringWithLocale} from './locale'

const {PUBLICATION_STATUS, EVENT_STATUS} = constants

export class EventQueryParams {
    admin_user = null
    created_by = null
    end = null
    include = null
    nocache = null
    page = null
    page_size = null
    publication_status = null
    publisher = null
    show_all = null
    sort = null
    start = null
    super_event = null
    text = null
    language = null

    setPublisher (publisher) {
        this.publisher = publisher && publisher.join()
    }
    setSort(sortBy, sortDirection) {
        this.sort = sortDirection === 'desc' ? `-${sortBy}` : sortBy
    }
    get values() {
        return Object.keys(this)
            .filter(key => typeof this[key] !== 'function')
            .reduce((acc, key) => set(acc, key, this[key]), {})
    }
}

/**
 * Fetches event data based on given ID
 * @param eventId       ID of event to fetch
 * @param queryParams   EventQueryParams class object containing the query parameters for the request
 * @param fetchSuper    Whether super event data should be fetched for the given event
 * @returns {Promise<*>}    Returns a promise containing event, sub event and possibly super event data depending on given params
 */
export const fetchEvent = async (eventId, queryParams, fetchSuper = false) => {
    try {
        const eventResponse =  await client.get(`event/${eventId}`, queryParams.values)
        const event = eventResponse.data
        const subEvents = event.sub_events
        const superEventId = getSuperEventId(event)

        if (!fetchSuper) {
            return [event, subEvents]
        } else if (fetchSuper && superEventId) {
            const superEventResponse =  await client.get(`event/${superEventId}`, queryParams.values)
            const superEvent =  superEventResponse.data
            return [event, subEvents, superEvent]
        } else {
            return [event, subEvents, null]
        }
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Fetches events based on given parameters
 * @param queryParams   EventQueryParams class object containing the query parameters for the request
 * @returns {Promise<*>}
 */
export const fetchEvents = async (queryParams) => {
    try {
        return await client.get('event', queryParams.values)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Publishes given events
 * @param eventData  Event data
 * @returns {Promise}
 */
export const publishEvents = async (eventData) => {
    const updatedEventData = eventData
        .map(event => ({
            ...event,
            date_published: moment().utc().format(),
            publication_status: PUBLICATION_STATUS.PUBLIC,
        }))

    try {
        return await client.put('event', updatedEventData)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Deletes an event
 * @param eventId  ID of event that should be deleted
 * @returns {Promise}
 */
export const deleteEvent = async (eventData) => {
    try {
        return await client.delete(`event/${eventData.id}`)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Deletes given events
 * @param eventIds  List of ID's that should be deleted
 * @returns {Promise}
 */
export const deleteEvents = async (eventData) => Promise.all(eventData
    .filter(event => eventIsEditable(event)['editable'])
    .map(deleteEvent)
)

/**
 * Cancels given events
 * @param eventData  Data for the events that should be canceled
 * @returns {Promise}
 */
export const cancelEvents = async (eventData) => {
    const updatedEventData = eventData
        .filter(event => eventIsEditable(event)['editable'])
        .map(event => ({
            ...event,
            event_status: EVENT_STATUS.CANCELLED,
        }))

    try {
        return await client.put('event', updatedEventData)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Postpones given events
 * @param eventData  Data for the events that should be postponed
 * @returns {Promise}
 */
export const postponeEvents = async (eventData) => {
    const updatedEventData = eventData
        .filter(event => eventIsEditable(event)['editable'])
        .map(event => ({
            ...event,
            start_time: null,
            end_time: null,
        }))

    try {
        return await client.put('event', updatedEventData)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Returns the data for the given ID's
 * @param ids   ID's that the data is filtered based on
 * @param data  Data to be filtered
 * @returns {object[]}
 */
export const getEventDataFromIds = (ids, data) => data.filter(item => ids.includes(item.id))

/**
 * Returns the event id from given URL
 * @param url   URL to get the event ID from
 * @returns {string|undefined}    Event ID
 */
export const getEventIdFromUrl = url => {
    return typeof url === 'string'
        ? url.substring(url.indexOf('/event/') + '/event/'.length, url.lastIndexOf('/'))
        : undefined
}

/**
 * Returns the super event ID of the given event
 * @param event   Event to get the super event id for
 * @returns {string|undefined}    Super event ID
 */
export const getSuperEventId = event => getEventIdFromUrl(get(event, ['super_event', '@id']))

/**
 * Returns the sub event ID's for the given event
 * @param event   Event data
 * @returns {object[]}
 */
export const getSubEventIds = (event) => {
    const subEventUrls = get(event, 'sub_events', []).map(item => item['@id'])
    return subEventUrls.map(url => getEventIdFromUrl(url))
}

/**
 * Returns the ID's of events that have sub events
 * @param eventData   Event data
 * @returns {string[]}
 */
export const getEventsWithSubEvents = (eventData) => eventData
    .reduce((acc, event) => {
        const getSuperEventId = (_event) => {
            const subEvents = get(_event, 'sub_events', [])

            if (subEvents.length > 0) {
                acc.push(getEventIdFromUrl(_event['@id']))
                subEvents.forEach(getSuperEventId)
            }
        }

        getSuperEventId(event)
        return acc
    }, [])

/**
 * Appends the data of all the recurring/umbrella sub events to the given event data
 * @param eventData             Event data
 * @param eventsWithSubEvents   Array containing all the ID's of events in the event data that have sub events
 * @returns {Promise<object[]>}
 */
export const appendEventDataWithSubEvents = async (eventData, eventsWithSubEvents) => {
    const queryParams = new EventQueryParams()
    queryParams.super_event = eventsWithSubEvents.join()
    queryParams.show_all = true

    try {
        const response = await fetchEvents(queryParams)
        const subEventData = response.data.data

        return [...eventData, ...subEventData]
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Recursively maps sub event data to super events (umbrella & recurring)
 * @param eventData   Event data containing all the events
 * @returns {object[]}
 */
export const mapSubEventDataToSuperEvents = (eventData) => {
    // array containing ID's of sub events
    let subEvents = []

    return eventData
        .reduce((acc, event) => {
            const updatedEvent = {...event}

            const updateEvent = (_event, depth = 0, subEventIndex = 0, subEventIndexes = []) => {
                const subEventIds = getSubEventIds(_event)
                const hasSubEvents = get(_event, 'sub_events', []).length > 0

                if (hasSubEvents) {
                    // push sub event id's to the array, so that they can be filtered out later
                    subEvents.push(...subEventIds)
                    // sub event data that should be set
                    const subEventDataToSet = subEventIds
                        .map(subEventId => eventData.find(item => item.id === subEventId))
                        .filter(subEvent => !isUndefined(subEvent))

                    // we need to get the path to the event that we're updating if it isn't a top level sub event
                    if (depth > 0) {
                        subEventIndexes.push(subEventIndex)
                        // the path is built based on the sub event indexes. consider the following event structure:
                        // umbrella_event: {
                        //     sub_events: [
                        //         regular_event: {} (depth = 1, index = 0)
                        //         recurring_event: { (depth = 1, index = 1)
                        //             sub_events: [
                        //                 recurring_event: {...} (depth = 2, index = 0)
                        //                 regular_event: {...} (depth = 2, index = 1)
                        //             ]
                        //         }
                        //     ]
                        // }
                        // if we were to set the sub event data of the recurring event at depth 2,
                        // then subEventIndexes would be [1, 0] and the resulting path would be ['1', 'sub_events', '0', 'sub_events']
                        const path = subEventIndexes
                            .reduce((acc, index) => [...acc, `${index}`, 'sub_events'], [])

                        set(updatedEvent.sub_events, path, subEventDataToSet)
                    } else {
                        updatedEvent.sub_events = subEventDataToSet
                    }

                    // update sub events
                    _event.sub_events.forEach((subEvent, index) =>
                        updateEvent(subEvent, depth + 1, index, [...subEventIndexes]))
                }
            }

            updateEvent(event)
            return [...acc, updatedEvent]
        }, [])
        // filter out sub events from the event data
        .filter(event => !subEvents.includes(event.id))
}

/**
 * Returns the name of the event
 * @param {object} event
 * @param {string} locale
 * @returns {string|null}
 */
export const getEventName = (event, locale = 'fi') => {
    if (event.name ) {
        return getStringWithLocale(event,'name',locale)
    }
    else if (event.headline) {
        return getFirstMultiLanguageFieldValue(event.headline)
    }
    else {
        return null
    }
}
