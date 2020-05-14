import {shallow} from 'enzyme';
import React from 'react';

import {UnconnectedLoginCallback as LoginCallback} from './LoginCallback';

describe('views/Auth/LoginCallback', () => {
    const history = {
        push: () => {},
    };

    function getWrapper(props) {
        const defaultProps = {
            history,
        };
        return shallow(<LoginCallback {...defaultProps} {...props} />)
    }

    describe('renders', () => {
        test('CallbackComponent with correct props', () => {
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

    describe('loginSuccessful', () => {
        describe('calls browserHistory push with correct path', () => {
            const historyMock = jest.spyOn(history, 'push');

            afterEach(() => {
                historyMock.mockReset();
            });

            test('when user.state is defined', () => {                
                const instance = getWrapper().instance();
                const user = {state: {redirectUrl: '/test'}};
                instance.loginSuccessful(user);

                expect(historyMock.mock.calls.length).toBe(1);
                expect(historyMock.mock.calls[0][0]).toBe(user.state.redirectUrl);
            });
            test('when user.state is not defined', () => {
                const instance = getWrapper().instance();
                const user = {state: undefined};
                instance.loginSuccessful(user);

                expect(historyMock.mock.calls.length).toBe(1);
                expect(historyMock.mock.calls[0][0]).toBe('/');
            });
        });
    });

    describe('loginUnsuccessful', () => {
        const historyMock = jest.spyOn(history, 'push');

        afterEach(() => {
            historyMock.mockReset();
        });

        test('calls browserHistory push with correct path', () => {
            const instance = getWrapper().instance();
            instance.loginUnsuccessful();

            expect(historyMock.mock.calls.length).toBe(1);
            expect(historyMock.mock.calls[0][0]).toBe('/');
        });
    });
});
