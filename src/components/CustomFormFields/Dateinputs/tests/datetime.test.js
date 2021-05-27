import React from 'react'
import moment from 'moment'
import {FormattedMessage} from 'react-intl'
import {
    convertDateToLocaleString,
    getCorrectInputLabel,
    getCorrectMinDate,
    getDateFormat,
    getDatePickerOpenDate,
    roundDateToCorrectUnit,
} from '../utils/datetime'

describe('utils/datetime', () => {
    describe('convertDateToLocaleString', () => {
        const date = moment('2020-03-23 10:15')
        test('returns correct string when date type is date', () => {
            const dateType = 'date'
            expect(convertDateToLocaleString(date, dateType)).toBe('23.3.2020')
        })

        test('returns correct string when date type is date-time', () => {
            const dateType = 'date-time'
            expect(convertDateToLocaleString(date, dateType)).toBe('23.3.2020 10.15')
        })

        test('returns correct string when date type is time', () => {
            const dateType = 'time'
            expect(convertDateToLocaleString(date, dateType)).toBe('10.15')
        })

        test('returns correct string when date type is not date, date-time or time', () => {
            const dateType = null
            expect(convertDateToLocaleString(date, dateType)).toBe('23.3.2020')
        })

        test('returns correct string when given date is not valid', () => {
            expect(convertDateToLocaleString(null, null)).toBe('Invalid date')
        })
    })

    describe('getDateFormat', () => {
        describe('returns correct date format string', () => {
            test('when dateType is date', () => {
                expect(getDateFormat('date')).toBe('D.M.YYYY')
            })
            test('when dateType is time', () => {
                expect(getDateFormat('time')).toBe('H.mm')
            })
            test('when dateType is date-time', () => {
                expect(getDateFormat('date-time')).toBe('D.M.YYYY H.mm')
            })
            test('when dateType is not date, time or date-time', () => {
                expect(getDateFormat()).toBe('D.M.YYYY')
            })
        })
    })

    describe('roundDateToCorrectUnit', () => {
        const date = moment('2020-02-08 09:30:26')
        test('returns date rounded to days when dateType is date', () => {
            const dateType = 'date'
            const expectedDate = date.startOf('day')
            expect(roundDateToCorrectUnit(date, dateType)).toEqual(expectedDate)
        })

        test('returns date rounded to minutes when dateType is time', () => {
            const dateType = 'time'
            const expectedDate = date.startOf('minute')
            expect(roundDateToCorrectUnit(date, dateType)).toEqual(expectedDate)
        })

        test('returns date rounded to minutes when dateType is date-time', () => {
            const dateType = 'date-time'
            const expectedDate = date.startOf('minute')
            expect(roundDateToCorrectUnit(date, dateType)).toEqual(expectedDate)
        })

        test('returns date rounded to days when dateType is not date, time or date-time', () => {
            const dateType = 'date-time'
            const expectedDate = date.startOf('minute')
            expect(roundDateToCorrectUnit(date, dateType)).toEqual(expectedDate)
        })
    })

    describe('getCorrectInputLabel', () => {
        test('returns undefined if label is empty', () => {
            expect(getCorrectInputLabel(undefined)).toBe(undefined)
        })

        test('returns given label back if label is object', () => {
            const label = <FormattedMessage id={'test'} />
            expect(getCorrectInputLabel(label)).toBe(label)
        })

        test('returns <FormattedMessage/> if label is not empty and is not object', () => {
            expect(getCorrectInputLabel('test')).toEqual(<FormattedMessage id={'test'} />)
        })
    })

    describe('getCorrectMinDate', () => {
        test('returns undefined when minDate and disablePast are falsy', () => {
            const minDate = undefined
            const disablePast = false
            expect(getCorrectMinDate(minDate, disablePast)).toBe(undefined)
        })

        test('returns date minDate when disablePast is falsy and minDate is defined', () => {
            const minDate = moment('2020-03-22')
            const disablePast = false
            expect(getCorrectMinDate(minDate, disablePast)).toEqual(minDate.toDate())
        })

        test('returns date minDate when disablePast is true and minDate is after now', () => {
            const minDate = moment().add(1, 'day')
            const disablePast = true
            expect(getCorrectMinDate(minDate, disablePast)).toEqual(minDate.toDate())
        })

        test('retuns current date when disablePast is true and minDate is before now', () => {
            const minDate = moment().subtract(1, 'day')
            const disablePast = true
            const returnValue = getCorrectMinDate(minDate, disablePast)
            expect(moment(returnValue).startOf('hour').toString()).toEqual(moment().startOf('hour').toString())
        })

        test('retuns current date when disablePast is true and minDate is undefined', () => {
            const minDate = undefined
            const disablePast = true
            const returnValue = getCorrectMinDate(minDate, disablePast)
            expect(moment(returnValue).startOf('hour').toString()).toEqual(moment().startOf('hour').toString())
        })
    })

    describe('getDatePickerOpenDate', () => {
        test('returns defaultValue if it is defined', () => {
            const defaultValue = moment()
            const minDate = defaultValue.subtract(1, 'days');
            expect(getDatePickerOpenDate(defaultValue, minDate)).toEqual(new Date(defaultValue))
        })

        test('returns minDate if it is defined and defaultValue is not defined', () => {
            const defaultValue = undefined
            const minDate = moment()
            expect(getDatePickerOpenDate(defaultValue, minDate)).toEqual(new Date(minDate))
        })

        test('returns new date if defaultValue and minDate are not defined', () => {
            const defaultValue = undefined
            const minDate = undefined
            expect(getDatePickerOpenDate(defaultValue, minDate)).toEqual(
                new Date(roundDateToCorrectUnit(moment()))
            )
        })
    })
})
