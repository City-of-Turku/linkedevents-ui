import React from 'react';
import {shallow} from 'enzyme';
import {Button} from 'reactstrap';

import {mockUser} from '__mocks__/mockData';
import {UnconnectedHeaderBar} from './index';

import userManager from '../../utils/userManager'
userManager.settings.authority = 'test authority'


describe('components/Header/index', () => {

    function getWrapper(props) {
        const defaultProps = {
            user: mockUser,
            //routerPush: () => {},
            userLocale: {locale: 'fi'},
            //setLocale: () => {},
            location: window.location,
            //navBarOpen: false,
            //showModerationLink: false,
            clearUserData: () => {},
            auth: {user: {id_token: 'test-id-token'}},
        }        
        return shallow(<UnconnectedHeaderBar {...defaultProps} {...props}/>)
    }

    describe('handleLoginClick', () => {
        test('calls usermanager.signinRedirect with correct params', () => {
            const instance = getWrapper().instance();
            const spy = jest.spyOn(userManager, 'signinRedirect');
            const expectedParams = {
                data: {
                    redirectUrl: '/',
                },
                extraQueryParams: {
                    ui_locales: instance.props.userLocale.locale,
                },
            }
            instance.handleLoginClick();

            expect(spy).toHaveBeenCalled();
            expect(spy.mock.calls[0][0]).toEqual(expectedParams);
        });
    });

    describe('handleLogoutClick', () => {
        test('calls clearUserData, removeUser and signoutRedirect with correct params', () => {
            const clearUserData = jest.fn();
            const instance = getWrapper({clearUserData}).instance();
            const signoutRedirectSpy = jest.spyOn(userManager, 'signoutRedirect');
            const removeUserSpy = jest.spyOn(userManager, 'removeUser');
            const expectedParams = {
                id_token_hint: instance.props.auth.user.id_token,
            };
            instance.handleLogoutClick();

            expect(clearUserData).toHaveBeenCalled();
            expect(removeUserSpy).toHaveBeenCalled();
            expect(signoutRedirectSpy).toHaveBeenCalled();
            expect(signoutRedirectSpy.mock.calls[0][0]).toEqual(expectedParams);
        });
    });

    describe('Button functions', () => {
        describe('Login button', () => {
            test('calls handleLoginClick', () => {
                const user = undefined;
                const wrapper = getWrapper({user});
                const handleLoginClick = jest.fn();
                wrapper.instance().handleLoginClick = handleLoginClick;
                wrapper.instance().forceUpdate(); // update to register mocked function
                const loginButton = wrapper.find('.helsinki-bar__login-button').find(Button);
                expect(loginButton).toHaveLength(1);
                loginButton.prop('onClick')();
                expect(handleLoginClick).toHaveBeenCalled();
            });
        });
    
        describe('Logout button', () => {
            test('calls handleLogoutClick', () => {
                const wrapper = getWrapper();
                const handleLogoutClick = jest.fn();
                wrapper.instance().handleLogoutClick = handleLogoutClick;
                wrapper.instance().forceUpdate(); // update to register mocked function
                const logoutButton = wrapper.find('.helsinki-bar__login-button').find(Button);
                expect(logoutButton).toHaveLength(1);
                logoutButton.prop('onClick')();
                expect(handleLogoutClick).toHaveBeenCalled();
            });
        });
    });
});
