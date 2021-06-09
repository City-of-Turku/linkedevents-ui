import {
    setData,
    updateSubEvent,
    deleteSubEvent,
    sortSubEvents,
    setEventData,
    setOfferData,
    addOffer,
    clearValue,
    setFreeOffers,
    setLanguages,
    deleteOffer,
    clearData} from './editor';
import constants from '../constants.js'
import {mockUserEvents, mockLanguages} from '__mocks__/mockData';
const mockEvent = mockUserEvents[0];

const {
    EDITOR_SETDATA,
    EDITOR_UPDATE_SUB_EVENT,
    EDITOR_DELETE_SUB_EVENT,
    EDITOR_SORT_SUB_EVENTS,
    EDITOR_ADD_OFFER,
    EDITOR_CLEAR_VALUE,
    EDITOR_SET_FREE_OFFERS,
    EDITOR_SETLANGUAGES,
    EDITOR_DELETE_OFFER,
    EDITOR_CLEARDATA} = constants

describe('actions/editor', () => {
    describe('setData', () => {
        test('return object with correct type & values', () => {
            const expectedResult = {type: EDITOR_SETDATA, values: mockEvent};
            expect(setData(mockEvent)).toEqual(expectedResult);
        });
    });

    describe('updateSubEvent', () => {
        test('return object with correct type, value, property and eventKey', () => {
            const expectedResult  = {type: EDITOR_UPDATE_SUB_EVENT, value: 'foo', property: 'bar', eventKey: 1}
            expect(updateSubEvent('foo', 'bar', 1)).toEqual(expectedResult);
        });
    });

    describe('deleteSubEvent', () => {
        test('return object with correct type & event', () => {
            const expectedResult  = {type: EDITOR_DELETE_SUB_EVENT, event: mockEvent}
            expect(deleteSubEvent(mockEvent)).toEqual(expectedResult);
        });
    });

    describe('sortSubEvents', () => {
        test('return object with correct type', () => {
            const expectedResult  = {type: EDITOR_SORT_SUB_EVENTS}
            expect(sortSubEvents()).toEqual(expectedResult);
        });
    });

    describe('setEventData', () => {
        test('return object with correct type, key, values & event', () => {
            const expectedResult  = {type: EDITOR_SETDATA, key: 1, values: mockEvent, event: true}
            expect(setEventData(mockEvent, 1)).toEqual(expectedResult);
        });
    });

    describe('setOfferData', () => {
        test('return object with correct type, key, values & offer', () => {
            const expectedResult  = {type: constants.EDITOR_SETDATA, key: 1, values: mockEvent, offer: true}
            expect(setOfferData(mockEvent, 1)).toEqual(expectedResult);
        });
    });

    describe('addOffer', () => {
        test('return object with correct type & values', () => {
            const expectedResult  = {type: EDITOR_ADD_OFFER, values: mockEvent}
            expect(addOffer(mockEvent)).toEqual(expectedResult);
        });
    });

    describe('deleteOffer', () => {
        test('return object with correct type & offerKey', () => {
            const expectedResult  = {type: EDITOR_DELETE_OFFER, offerKey: 1}
            expect(deleteOffer(1)).toEqual(expectedResult);
        });
    });

    describe('clearValue', () => {
        test('return object with correct type & values for clearing', () => {
            const stringValues = 'testvalue'
            const expectedResult  = {type: EDITOR_CLEAR_VALUE, values: stringValues}
            expect(clearValue(stringValues)).toEqual(expectedResult);
        });
    });

    describe('setFreeOffers', () => {
        test('return object with correct type & isFree', () => {
            const expectedResult  = {type: EDITOR_SET_FREE_OFFERS, isFree: true}
            expect(setFreeOffers(true)).toEqual(expectedResult);
        });
    });

    describe('setLanguages', () => {
        test('return object with correct type & languages', () => {
            const expectedResult  = {type: EDITOR_SETLANGUAGES, languages: mockLanguages}
            expect(setLanguages(mockLanguages)).toEqual(expectedResult);
        });
    });
    describe('clearData', () => {
        test('clears all data', () => {
            const expectedResult  = {type: EDITOR_CLEARDATA}
            expect(clearData(mockEvent)).toEqual(expectedResult);
        });
    });
});
