import {receiveUserData, clearUserData} from './user';
import constants from '../constants.js'


const {RECEIVE_USERDATA, CLEAR_USERDATA} = constants

describe('actions/user', () => {
    describe('receiveUserData', () => {
        test('returns object with correct type and payload', () => {
            const data = {testData: 123};
            const expectedResult = {type: RECEIVE_USERDATA, payload: data};
            const result = receiveUserData(data);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('clearUserData', () => {
        test('returns object with correct type', () => {
            const expectedResult = {type: CLEAR_USERDATA};
            const result = clearUserData();
            expect(result).toEqual(expectedResult);
        });
    });
});
