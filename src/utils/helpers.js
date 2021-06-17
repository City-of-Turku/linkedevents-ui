import './helpers.scss'
import {isArray, isNil, isNull, set, some, get, keys} from 'lodash';
import constants from '../constants'
import {FormattedMessage} from 'react-intl'
import React from 'react'
import moment from 'moment'

import Badge from 'react-bootstrap/Badge'

const {VALIDATION_RULES, CHARACTER_LIMIT} = constants

/**
 * Get text limit base on it's rule
 * @param {string} Rulename - Validation rule
 * @return {number} Character limit 
 * @return {null} Return false if they're not string count rules
 */
export const getCharacterLimitByRule = (ruleName) => {
    if(ruleName === VALIDATION_RULES.SHORT_STRING) {
        return CHARACTER_LIMIT.SHORT_STRING
    }
    if(ruleName === VALIDATION_RULES.MEDIUM_STRING) {
        return CHARACTER_LIMIT.MEDIUM_STRING
    }
    if(ruleName === VALIDATION_RULES.LONG_STRING) {
        return CHARACTER_LIMIT.LONG_STRING
    }
    return null
}

/**
 * Check if text input is reaching the limit
 * @param  {object || string } value
 * @param  {int} limit
 * @return {boolean} validation status
 */
export const textLimitValidator = (value, limit) => {
    if (typeof value === 'object') {
        return !some(value, item => !isNull(item) && item.length > limit)
    } else if (typeof value === 'string') {
        return value.length <= limit
    }
    return true
}

// set a property of an object to empty value based on its type
export const emptyField = (object, field) => {
    let value = object[field];
    const fieldValueType = isArray(value) ? 'array' : typeof value;
    
    switch (fieldValueType) {
        case 'array':
            value = []
            break
        case 'object':
            value = {}
            break
        case 'string':
        case 'number':
            value = ''
            break
        default:
    }

    return Object.assign({}, object, {[field]: value})
}

/**
 * Nullifies multi language fields based on selected languages
 * @param   {object}    formValues          form containing the multi language field that will be nullified
 * @param   {array}     contentLanguages    selected languages
 * @return  {boolean}                       nullified multi language fields for unselected languages
 */
export const nullifyMultiLanguageValues = (formValues, contentLanguages) => {
    const multiLanguageFields = ['name', 'description', 'short_description', 'provider', 'location_extra_info', 'info_url', 'offers']

    const nullifyField = value => Object.keys(value)
        .reduce((acc, key) => set(acc, key, contentLanguages.includes(key) ? value[key] : null), {})

    const multiLanguageValues = {}

    for (const field of multiLanguageFields) {
        const fieldValue = formValues[field];
        // some multi-language fields might not have a value
        if (isNil(fieldValue)) {
            continue
        }
        if (field === 'offers') {
            multiLanguageValues[field] = []
            // nullify multi-language fields for every offer
            fieldValue.forEach((offer, index) => {
                multiLanguageValues[field].push(offer)
                Object.keys(offer)
                    // filter out the is_free key
                    .filter(key => key !== 'is_free')
                    .forEach(key => multiLanguageValues[field][index][key] = !isNil(offer[key]) ? nullifyField(offer[key]) : null)
            })
            continue
        }
        multiLanguageValues[field] = nullifyField(fieldValue)
    }
    return multiLanguageValues
}

/**
 * Scrolls to the top of the page
 */
export const scrollToTop = ()  => window.scrollTo(0, 0)

/**
 * Returns the first defined value of a multi-language field
 * @param field             Multi-language field to get the value from
 * @param contentLanguages  Optional. If given, the value will only be looked for, for the given languages
 * @returns {string|undefined}
 */
export const getFirstMultiLanguageFieldValue = (field, contentLanguages = null) => {
    if (isNil(field)) {
        return undefined
    }
    return isArray(contentLanguages)
        ? get(field, keys(field).filter(key => contentLanguages.includes(key)).find(key => !isNil(field[key])), '')
        : get(field, keys(field).find(key => !isNil(field[key])), '')
}

/**
 * Returns a badge for the given type
 * @param type Type of the badge
 * @param size  Size of the badge
 * @returns {*}
 */
export const getBadge = (type, size = 'small') => {
    let badgeType = 'primary'

    switch (type) {
        case 'series':
            badgeType = 'success'
            break
        case 'umbrella':
            badgeType = 'info'
            break
        case 'draft':
            badgeType = 'warning'
            break
        case 'cancelled':
            badgeType = 'danger'
            break
    }

    return (
        <Badge
            className={`${type} `}
            pill 
            variant={type}>
            {<FormattedMessage id={type}/>}
        </Badge>
    )
}

/**
 * Returns a formatted date
 * @param date  Date to format
 * @returns {string}
 */
export const getDate = date => moment(date).format('D.M.YYYY')

/**
 * Returns a formatted date time
 * @param date  Date to format
 * @returns {string}
 */
export const getDateTime = date => moment(date).format('D.M.YYYY HH:mm')

/**
 * Returns the button label
 * @param action
 * @param isRegularUser
 * @param isDraft
 * @param eventIsPublished
 * @param formHasSubEvents
 * @returns {string}
 */
export const getButtonLabel = (
    action,
    isRegularUser,
    isDraft,
    eventIsPublished,
    formHasSubEvents
) => {
    let buttonLabel = `${action}-events`

    if (action === 'return') {
        buttonLabel = 'return-without-saving'
    }
    if (action === 'copy') {
        buttonLabel = 'copy-event-to-draft'
    }
    if (action === 'update') {
        buttonLabel = isRegularUser
            ? isDraft ? 'event-action-save-draft-existing' : 'event-action-save-draft-new'
            : eventIsPublished ? 'event-action-save-existing' : 'event-action-save-new'

        if (!eventIsPublished && formHasSubEvents) {
            buttonLabel = 'event-action-save-multiple'
        }
    }

    return buttonLabel
}
