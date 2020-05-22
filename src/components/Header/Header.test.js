import React from 'react';
import {shallow} from 'enzyme';
import {Button} from 'reactstrap';

import {mockUser} from '__mocks__/mockData';
import {UnconnectedHeaderBar, NavLinks} from './index';
import LanguageSelector from './LanguageSelector';
import constants from '../../constants';
const {APPLICATION_SUPPORT_TRANSLATION} = constants;
const LanguageOptions = APPLICATION_SUPPORT_TRANSLATION.map(item => ({
    label: item.toUpperCase(),
    value: item,
}));
import userManager from '../../utils/userManager'
userManager.settings.authority = 'test authority'


describe('components/Header/index', () => {

    const defaultProps = {
        user: mockUser,
        routerPush: () => {},
        setLocale: () => {},
        isOpen: false,
        showModerationLink: false,
        userLocale: {locale: 'fi'},
        location: window.location,
        clearUserData: () => {},
        auth: {user: {id_token: 'test-id-token'}},
    }
    const userAdmin = {
        displayName: 'Matti Meikäläinen',
        userType: 'admin',
        organizationsWithRegularUsers: ['jokuOrganisaatio'],
    }
    describe('HeaderBar', () => {
        function getWrapper(props) {
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
                    const loginButton = wrapper.find('.bar__login-and-language').find(Button);
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
                    const logoutButton = wrapper.find('.bar__login-and-language').find(Button);
                    expect(logoutButton).toHaveLength(1);
                    logoutButton.prop('onClick')();
                    expect(handleLogoutClick).toHaveBeenCalled();
                });
            });
            describe('componentDidMount', () => {
                test('state.showModerationLink is true if user is admin and part of organization', () => {
                    const element = getWrapper({user: userAdmin});
                    expect(element.state('showModerationLink')).toBe(true);
                });
            });
            describe('render', () => {
                test('contains LanguageSelector with correct props', () => {
                    const element = getWrapper().find(LanguageSelector);
                    expect(element.prop('languages')).toEqual(LanguageOptions);
                    expect(element.prop('userLocale')).toEqual(defaultProps.userLocale);
                    expect(element.prop('changeLanguage')).toBeDefined();
                })
            });
            describe('NavLinks props', () => {
                test('NavLinks', () => {
                    const element = getWrapper({user: userAdmin}).find(NavLinks);
                    expect(element.prop('showModerationLink')).toBe(true)
                })
            })
        });
    });
    const defaultNavProps = {
        showModerationLink: false,
        toMainPage: () => null,
        toSearchPage: () => null,
        toHelpPage: () => null,
        toModerationPage: () => null,
    }
    describe('NavLinks', () => {
        function getWrapper(props) {
            return shallow(<NavLinks {...defaultNavProps} {...props}/>);
        }
        test('renders with default props', () => {
            const element = getWrapper().find(Button);
            expect(element).toHaveLength(3);
            expect(element.at(0).prop('onClick')).toEqual(defaultNavProps.toMainPage);
            expect(element.at(1).prop('onClick')).toEqual(defaultNavProps.toSearchPage);
            expect(element.at(2).prop('onClick')).toEqual(defaultNavProps.toHelpPage);
        });
        // eslint-disable-next-line indent
        test('renders additional Button when showModerationLink is true', () => {
            const element = getWrapper({showModerationLink: true}).find(Button);
            expect(element).toHaveLength(4);
            expect(element.at(3).prop('onClick')).toEqual(defaultNavProps.toModerationPage);
        })
    })
})
