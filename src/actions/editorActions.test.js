import {setData, updateSubEvent} from './editor';
import constants from '../constants.js'
import {mockUserEvents} from '__mocks__/mockData';
const mockEvent = mockUserEvents[0];

const {EDITOR_SETDATA, EDITOR_UPDATE_SUB_EVENT} = constants

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
});
