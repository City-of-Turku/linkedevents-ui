import {getFirstMultiLanguageFieldValue} from './helpers'
import {postponeEvents, cancelEvents, deleteEvents, mapSubEventDataToSuperEvents, publishEvents} from './events'
import constants from '../constants'
import moment from 'moment'
import {get, isUndefined, isNull, isNil} from 'lodash'

const {PUBLICATION_STATUS, SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA} = constants

/**
 * Used with the Array sort method to sort events according to start time.
 * @param a Event A data
 * @param b Event B data
 * @returns {number}
 */
export const compareDates = (a, b) => moment(a.start_time).unix() - moment(b.start_time).unix()

/**
 * Returns a string containing html markup that lists given sub events in an unsorted list
 * @param subEvents Sub event data
 * @returns {string}
 */
const getSubEventListing = (subEvents) =>
    `<ul>${subEvents
        // sort events by start time
        .sort(compareDates)
        .map((event => `<li>${getFirstMultiLanguageFieldValue(event.name)} ${!isNil(event.start_time) ? `(${moment(event.start_time).format('DD.MM.YYYY')})` : ''}</li>`))
        .join(' ')}
    </ul>`

/**
 * Returns a string containing html markup displaying the event hierarchy of all the given events
 * @param subEventsMappedToEvents   Array containing the events whose hierarchies should be returned
 * @param events                    Array containing data of all the events that are being modified
 * @param intl
 * @returns {string}
 */
const getEventListing = (subEventsMappedToEvents, events, intl) =>
    subEventsMappedToEvents
        // sort events by start time
        .sort(compareDates)
        .map(event => {
            const eventListing = []

            // returns the event label and super event type badge where appropriate
            const getEventLabel = (_event) => {
                return `
                    ${_event.super_event_type === SUPER_EVENT_TYPE_RECURRING ? `<span class="badge badge-success">${intl.formatMessage({id: 'series'})}</span>` : ''}
                    ${_event.super_event_type === SUPER_EVENT_TYPE_UMBRELLA ? `<span class="badge badge-info">${intl.formatMessage({id: 'umbrella'})}</span>` : ''}
                    ${_event.publication_status === PUBLICATION_STATUS.DRAFT ? `<span class="badge badge-warning">${intl.formatMessage({id: 'draft'})}</span>` : ''}
                    <strong>${getFirstMultiLanguageFieldValue(_event.name)}</strong> ${!isNil(_event.start_time) ? `(${moment(_event.start_time).format('DD.MM.YYYY')})` : ''}`
            }

            const getListing = (_event, topLevel = true) => {
                const hasSubEvents = get(_event, 'sub_events', []).length > 0
                const superEventUrl = get(_event, ['super_event', '@id'])
                const hasSuperEvent = !isUndefined(superEventUrl)
                const superEvent = events.find(item => item['@id'] === superEventUrl)
                const superEventType = superEvent ? superEvent.super_event_type : null

                if (hasSubEvents) {
                    // get label for top level events (umbrella & recurring), then recursively get the sub event listing
                    if (topLevel) {
                        // don't show default sub event listing for umbrella sub events as they might contain recurring events
                        const subEventHasSubEvents = !!_event.sub_events
                            .find(subEvent => get(subEvent, 'sub_events', []).length > 0)

                        eventListing.push(`
                            ${getEventLabel(_event)}
                            ${!subEventHasSubEvents ? getSubEventListing(_event.sub_events) : ''}
                        `)
                        // get listing for sub events
                        _event.sub_events.forEach(subEvent => getListing(subEvent, false))
                    // events that are not top level in the event hierarchy need to be wrapped in an <ul> for correct indentation
                    } else {
                        eventListing.push(`
                            <ul>
                                <li>${getEventLabel(_event)}</li>
                                ${getSubEventListing(_event.sub_events)}
                            </ul>
                        `)
                    }
                // wrap regular events that are sub events of umbrella events in an <ul>
                } else if (!hasSubEvents && superEventType === SUPER_EVENT_TYPE_UMBRELLA) {
                    eventListing.push(`<ul><li>${getEventLabel(_event)}</li></ul>`)
                // only show the label if the event is a regular event
                } else if (!hasSubEvents && (!hasSuperEvent || isNull(superEventType))) {
                    eventListing.push(getEventLabel(_event))
                }
            }

            getListing(event)
            return eventListing.join(' ')
        })
        .join('<hr>')

/**
 * Returns the additional markup for the confirmation dialog based on given action type
 * @param extraMessage  Any extra message that needs to be displayed before other warnings
 * @param action        Either 'update', 'publish', 'delete' or 'cancel'
 * @param intl          React Intl
 * @param events        Possible sub events for the event
 * @returns {string}    Markup for the confirmation dialog
 */
const getConfirmationMarkup = (extraMessage = null, action, intl, events = [])  => {
    const extraMessageText = extraMessage ? `<p><strong>${intl.formatMessage({id: extraMessage})}</strong></p>` : ''
    const warningText = `<p>${intl.formatMessage({id: `editor-${action}-warning`})}</p>`
    let extraWarningText = intl.formatMessage({id: `editor-${action}-extra-warning`})
    extraWarningText = extraWarningText === `editor-${action}-extra-warning` ? '' : `<p>${extraWarningText}</p>`

    const subEventsMappedToEvents = mapSubEventDataToSuperEvents(events)
    const eventListing = getEventListing(subEventsMappedToEvents, events, intl)

    return eventListing.length > 0
        ? `${extraMessageText}${warningText}${extraWarningText}${eventListing}`
        : `${extraMessageText}${warningText}`
}

/**
 * Displays a confirmation modal.
 * The modal texts and action that will be run are determined by the given parameters.
 * @param eventData             Event data
 * @param action                Action to run
 * @param confirm               Confirm method
 * @param intl                  React intl
 * @param publicationStatus     Publication status
 * @param customAction          Custom action to run
 * @returns {Promise}
 */
const showConfirmationModal = (
    eventData,
    action,
    confirm,
    intl,
    publicationStatus = PUBLICATION_STATUS.PUBLIC,
    customAction,
) => new Promise((resolve) => {
    const isDraft = publicationStatus === PUBLICATION_STATUS.DRAFT

    // set the modal texts based on the action to run
    const actionButtonLabel = `${action}-events`
    const message = isDraft
        ? `confirm-${action}-draft`
        : `confirm-${action}`
    const extraMessage = (action === 'cancel')
        ? `confirm-cancel-extra`
        : null
    const warningMessage = isDraft
        ? `${action}-draft`
        : action

    let modalStyle = 'message'

    if (action === 'cancel' || action === 'delete') {
        modalStyle = 'warning'
    }

    const confirmActionMapping = {
        publish() {
            resolve(publishEvents(eventData))
        },
        update() {
            console.warn(`action '${action}' is not implemented!`)
        },
        postpone() {
            resolve(postponeEvents(eventData))
        },
        cancel() {
            resolve(cancelEvents(eventData))
        },
        delete() {
            resolve(deleteEvents(eventData))
        },
    }

    confirm(
        message,
        modalStyle,
        actionButtonLabel,
        {
            action: customAction || confirmActionMapping[action],
            additionalMarkup: getConfirmationMarkup(extraMessage, warningMessage, intl, eventData),
        }
    )
})

export default showConfirmationModal
