import {createAction} from 'redux-actions';
import {USER_EXPIRED} from 'redux-oidc';

import constants from '../constants';

import user from './user';

describe('reducers/user', () => {
    test('initial state is null', () => {
        expect(user(undefined, {})).toBeNull();
    });

    describe('actions', () => {
        describe('RECEIVE_USERDATA', () => {
            const receiveUserData = createAction(constants.RECEIVE_USERDATA);

            test('changes state if action payload exists with id', () => {
                const id = 'test-id'
                const action = receiveUserData({id});
                const initialState = null;
                const nextState = user(initialState, action);
                const expectedState = {id};
                expect(nextState).toEqual(expectedState);
            });

            test('doesnt change state if action payload doesnt exist', () => {
                const action = receiveUserData();
                const initialState = null;
                const nextState = user(initialState, action);
                const expectedState = initialState;
                expect(nextState).toEqual(expectedState);
            });

            test('doesnt change state if action payload id is missing', () => {
                const action = receiveUserData({testData: 'some data'});
                const initialState = null;
                const nextState = user(initialState, action);
                const expectedState = initialState;
                expect(nextState).toEqual(expectedState);
            });
        });

        describe('CLEAR_USERDATA', () => {
            test('sets state to be null', () => {
                const clearUserData = createAction(constants.CLEAR_USERDATA);
                const action = clearUserData();
                const initialState = {id: 'test-id'};
                const nextState = user(initialState, action);
                const expectedState = null;
                expect(nextState).toEqual(expectedState);
            });
        });
        describe('USER_EXPIRED', () => {
            test('sets state to be null', () => {
                const userExpired = createAction(USER_EXPIRED);
                const action = userExpired();
                const initialState = {id: 'test-id'};
                const nextState = user(initialState, action);
                const expectedState = null;
                expect(nextState).toEqual(expectedState);
            });
        });
    });
});
