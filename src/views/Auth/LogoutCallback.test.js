import {shallow} from 'enzyme';
import React from 'react';

import {UnconnectedLogoutCallback as LogoutCallback} from './LogoutCallback';

describe('views/Auth/LoginCallback', () => {
    const history = {
        push: () => {},
    };

    function getWrapper(props) {
        const defaultProps = {
            history,
        };
        return shallow(<LogoutCallback {...defaultProps} {...props} />)
    }

    describe('renders', () => {
        test('SignoutCallbackComponent with correct props', () => {
            const callbackWrapper = getWrapper();
            expect(callbackWrapper.length).toBe(1);
            expect(callbackWrapper.prop('errorCallback')).toBeDefined();
            expect(callbackWrapper.prop('successCallback')).toBeDefined();
            expect(callbackWrapper.prop('userManager')).toBeDefined();
        });

        test('empty div', () => {
            const emptyDiv = getWrapper().find('div');
            expect(emptyDiv.length).toBe(1);
        })
    });

    describe('logoutSuccessful', () => {
        const historyMock = jest.spyOn(history, 'push');

        afterEach(() => {
            historyMock.mockReset();
        });

        test('calls browserHistory push with correct path', () => {
            const instance = getWrapper().instance();
            instance.logoutSuccessful();

            expect(historyMock.mock.calls.length).toBe(1);
            expect(historyMock.mock.calls[0][0]).toBe('/');
        });
    });

    describe('logoutUnsuccessful', () => {
        const historyMock = jest.spyOn(history, 'push');

        afterEach(() => {
            historyMock.mockReset();
        });

        test('calls browserHistory push with correct path', () => {
            const instance = getWrapper().instance();
            instance.logoutUnsuccessful();

            expect(historyMock.mock.calls.length).toBe(1);
            expect(historyMock.mock.calls[0][0]).toBe('/');
        });
    });
});
