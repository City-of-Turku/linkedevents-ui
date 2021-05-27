import React from 'react'
import moment from 'moment'
import {FormattedMessage} from 'react-intl';

/**
 * Convert Date obj to a string based on given date type
 * @param {Date} date - date obj which is to be converted to string
 * @param {string} dateType - date, time or date-time
 */
export function convertDateToLocaleString(date, dateType){
    return moment(date).format(getDateFormat(dateType));
}

/**
 * Returns local date formatting string (e.g. D.M.YYYY)
 * based on given date type
 * @param {string} dateType - date, time or date-time
 */
export function getDateFormat(dateType){
    switch(dateType){
        case 'date':
            return 'D.M.YYYY'
        case 'time':
            return 'H.mm'
        case 'date-time':
            return 'D.M.YYYY H.mm'
        default:
            return 'D.M.YYYY'
    }
}

/**
 * Rounds given date to certain time unit based on given date type.
 * Time and date-time types are rounded to minutes and date type
 * is rounded to days.
 * @param {Moment} date - date which is to be rounded
 * @param {string} dateType - date, time or date-time
 */
export function roundDateToCorrectUnit(date, dateType){
    switch(dateType){
        case 'time':
        case 'date-time':
            return date.startOf('minute')
        case 'date':
        default:
            return date.startOf('day')
    }
}

/**
 * Returns a <FormattedMessage /> or undefined if given label is falsy.
 * @param {object|string} label - FormattedMessage or an id for FormattedMessage
 */
export function getCorrectInputLabel(label){
    if(!label)
        return undefined
    else if(typeof(label) === 'object')
        return label
    else
        return <FormattedMessage id={label} />
}

/**
 * Returns a min Date based on disablePast rule or undefined if minDate and disablePast
 * are not given or falsy. If disablePast is true, minDate cannot be in the past and
 * returned minDate will be current time or given minDate if it's not in the past.
 * If disablePast is false, given minDate will be retuned.
 * @param {Date} minDate - date to be set as min date if disabledPast rule allows it
 * @param {bool} disablePast - are past dates allowed to be min date
 */
export function getCorrectMinDate(minDate, disablePast){
    if(!minDate && !disablePast)
        return undefined
    else if(!disablePast && minDate)
        return new Date(minDate)
    else if(disablePast && moment(minDate).isAfter(moment()))
        return new Date(minDate)
    else
        return new Date()
}

/**
 * Returns the Date DatePicker will show as selected when calendar is opened.
 * @param {Date} currentValue - date value currently set for datepicker
 * @param {Date} minDate - minimum allowed date
 */
export function getDatePickerOpenDate(currentValue, minDate){
    if(currentValue)
        return new Date(currentValue)
    else if(minDate)
        return new Date(minDate)
    else
        return new Date(roundDateToCorrectUnit(moment()))
}
