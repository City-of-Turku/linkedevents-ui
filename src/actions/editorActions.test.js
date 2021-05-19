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
    deleteOffer} from './editor';
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
    EDITOR_DELETE_OFFER} = constants

describe('actions/editor', () => {
    describe('setData', () => {
        test('return object with correct type & values', () => {
            const expectedResult = {type: EDITOR_SETDATA, values: mockEvent};
            const result = setData(mockEvent);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('updateSubEvent', () => {
        test('return object with correct type, value, property and eventKey', () => {
            const expectedResult  = {type: EDITOR_UPDATE_SUB_EVENT, value: 'foo', property: 'bar', eventKey: 1}
            const result = updateSubEvent('foo', 'bar', 1);
            expect(result).toEqual(expectedResult);
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
            const result = setEventData(mockEvent, 1);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('setOfferData', () => {
        test('return object with correct type, key, values & offer', () => {
            const expectedResult  = {type: constants.EDITOR_SETDATA, key: 1, values: mockEvent, offer: true}
            const result = setOfferData(mockEvent, 1);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('addOffer', () => {
        test('return object with correct type & values', () => {
            const expectedResult  = {type: EDITOR_ADD_OFFER, values: mockEvent}
            const result = addOffer(mockEvent);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('deleteOffer', () => {
        test('return object with correct type & offerKey', () => {
            const expectedResult  = {type: EDITOR_DELETE_OFFER, offerKey: 1}
            const result = deleteOffer(1);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('clearValue', () => {
        test('return object with correct type & values for clearing', () => {
            const stringValues = 'testvalue'
            const expectedResult  = {type: EDITOR_CLEAR_VALUE, values: stringValues}
            const result = clearValue(stringValues);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('setFreeOffers', () => {
        test('return object with correct type & isFree', () => {
            const expectedResult  = {type: EDITOR_SET_FREE_OFFERS, isFree: true}
            const result = setFreeOffers(true);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('setLanguages', () => {
        test('return object with correct type & languages', () => {
            const expectedResult  = {type: EDITOR_SETLANGUAGES, languages: mockLanguages}
            const result = setLanguages(mockLanguages);
            expect(result).toEqual(expectedResult);
        });
    });
});
