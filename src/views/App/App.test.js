import React from 'react';
import {shallow} from 'enzyme';
import {checkCookieConsent} from '../../utils/cookieUtils';
jest.mock('../../utils/cookieUtils');
import {UnconnectedApp} from './';
import {mockUser} from '__mocks__/mockData';

jest.mock('@city-images/favicon.ico', () => ({
    eventsFavicon: 'favicon for the site',
}),{virtual: true});

describe('views/App/index', () => {

    function getWrapper(props) {
        const defaultProps = {
            intl: {locale: 'fi'},
            app: {confirmAction: {msg: 'test-confirm-msg'}},
            user: mockUser,
            //dispatch: () => {},
            fetchLanguages: () => {},
            fetchKeywordSets: () => {},
            fetchUser: () => {},
            location: window.location,
            authUser: {profile: {sub: 'test-sub'}},
        }
        return shallow(<UnconnectedApp {...defaultProps} {...props}/>)
    }

    describe('componentWillMount', () => {
        const fetchLanguagesMock = jest.fn();
        const fetchKeywordSetsMock = jest.fn();
        test('fetchLanguages is called', () => {
            const wrapper = getWrapper({fetchLanguages: fetchLanguagesMock});
            expect(fetchLanguagesMock).toHaveBeenCalled();
        });
        test('fetchKeywordSets is called', () => {

            const wrapper = getWrapper({fetchKeywordSets: fetchKeywordSetsMock});
            expect(fetchKeywordSetsMock).toHaveBeenCalled();
        });
        test('checkCookieConsent is called', () => {
            const wrapper = getWrapper();
            expect(checkCookieConsent).toHaveBeenCalled();
        });
    });

    describe('componentDidUpdate', () => {
        describe('calls fetchUser', () => {
            test('when props contains new auth.user', () => {
                const fetchUser = jest.fn();
                let auth = {};
                const wrapper = getWrapper({fetchUser, auth});
                auth = {user: {profile: {sub: 'new-test-sub'}}};
                wrapper.setProps({auth});
                expect(fetchUser).toHaveBeenCalled();
                expect(fetchUser.mock.calls[0][0]).toEqual(auth.user.profile.sub)
            });
        });

        describe('doesnt call fetchUser', () => {
            test('when props doesnt have a new auth.user', () => {
                const fetchUser = jest.fn();
                const wrapper = getWrapper({fetchUser});
                const auth = {};
                wrapper.setProps({auth});
                expect(fetchUser).not.toHaveBeenCalled();
            });
        });
    });
});

