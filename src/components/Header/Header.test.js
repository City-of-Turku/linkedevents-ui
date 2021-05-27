import React from 'react';
import {shallow} from 'enzyme';
import {Button} from 'reactstrap';
import {NavLink} from 'react-router-dom'

import {mockUser} from '__mocks__/mockData';
import {UnconnectedHeaderBar} from './index';
import LanguageSelector from './LanguageSelector';
import constants from '../../constants';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
const {APPLICATION_SUPPORT_TRANSLATION} = constants;
const LanguageOptions = APPLICATION_SUPPORT_TRANSLATION.map(item => ({
    label: item.toUpperCase(),
    value: item,
}));
import userManager from '../../utils/userManager';
userManager.settings.authority = 'test authority';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

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
};
const userAdmin = {
    displayName: 'Matti Meikäläinen',
    userType: 'admin',
    organizationsWithRegularUsers: ['jokuOrganisaatio'],
};

describe('components/Header/index', () => {
    describe('HeaderBar', () => {
        function getWrapper(props) {
            return shallow(<UnconnectedHeaderBar {...defaultProps} {...props}/>, {context: {intl}});
        }

        describe('methods', () => {
            describe('componentDidMount', () => {
                test('state.showModerationLink is true if user is admin and part of organization', () => {
                    const element = getWrapper({user: userAdmin});
                    expect(element.state('showModerationLink')).toBe(true);
                });
            });

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
                    };
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

            describe('isActivePath', () => {
                test('returns true/false based on if given parameter === location.pathname', () => {
                    const wrapper = getWrapper({location:{pathname:'/'}});
                    const instance = wrapper.instance();
                    expect(instance.isActivePath('/')).toBe(true);
                    expect(instance.isActivePath('/help')).toBe(false);
                });
            });
        });

        describe('render', () => {
            test('contains LanguageSelector with correct props', () => {
                const element = getWrapper().find(LanguageSelector);
                expect(element.prop('languages')).toEqual(LanguageOptions);
                expect(element.prop('userLocale')).toEqual(defaultProps.userLocale);
                expect(element.prop('changeLanguage')).toBeDefined();
            });

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

            describe('NavLink', () => {
                test('render 4 NavLinks when user is not admin', () => {
                    const element = getWrapper();
                    const navLinks = element.find(NavLink);
                    expect(navLinks).toHaveLength(4);
                });

                test('render 5 NavLinks when user is admin', () => {
                    const element = getWrapper({user: userAdmin});
                    const navLinks = element.find(NavLink);
                    expect(navLinks).toHaveLength(5);
                });

                test('when user is admin, one of the NavLinks is to moderation', () => {
                    const element = getWrapper({user: userAdmin}).find(NavLink).filter('.moderator');
                    expect(element.prop('className')).toBe('nav-link moderator');
                });

                test('NavLink is active based on location.pathname prop',() => {
                    const element = getWrapper({location:{pathname:'/listing'}});
                    let navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(false);
                    expect(navLinks.at(2).prop('exact')).toBe(true);
                    expect(navLinks.at(3).prop('strict')).toBe(false);
                    element.setProps({location:{pathname:'/search'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(true);
                    expect(navLinks.at(2).prop('strict')).toBe(false);
                    expect(navLinks.at(3).prop('strict')).toBe(false);
                    element.setProps({location:{pathname:'/help'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(0).prop('strict')).toBe(false);
                    expect(navLinks.at(1).prop('strict')).toBe(false);
                    expect(navLinks.at(2).prop('strict')).toBe(false);
                    expect(navLinks.at(3).prop('strict')).toBe(true);
                });
            });
        });
    });
});

