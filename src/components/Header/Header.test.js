import React from 'react';
import {shallow} from 'enzyme';
import {NavLink, Button} from 'reactstrap';

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
import userManager from '../../utils/userManager'
userManager.settings.authority = 'test authority'
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

describe('components/Header/index', () => {

    const defaultProps = {
        user: mockUser,
        active: false,
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
            return shallow(<UnconnectedHeaderBar {...defaultProps} {...props}/>, {context: {intl}});
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
            describe('UL with NavLinks', () => {
                test('Contains 5 NavLink when user is admin', () => {
                    const element = getWrapper({user: userAdmin});
                    const navLinks = element.find(NavLink);
                    expect(element.find('ul')).toHaveLength(1);
                    expect(navLinks).toHaveLength(5);
                })
            });
            describe('NavLink for moderation', () => {
                test('Displays moderator true-ClassName when admin at 3', () => {
                    const element = getWrapper({user: userAdmin}).find(NavLink);
                    expect(element.at(3).prop('className')).toBe('moderator true');
                });
            });
            describe('Active for NavLinks', () => {
                test('Displays active when path is active', () => {
                    const element = getWrapper();
                    element.setProps({location:{pathname:'/help'}});
                    let navLinks = element.find(NavLink);
                    expect(navLinks.at(1).prop('active')).toBe(false);
                    expect(navLinks.at(2).prop('active')).toBe(true);
                    element.setProps({location:{pathname:'/search'}});
                    navLinks = element.find(NavLink);
                    expect(navLinks.at(1).prop('active')).toBe(true);
                    expect(navLinks.at(2).prop('active')).toBe(false);
                });
            });
        });
    });
})

