import React from 'react';
import {shallow} from 'enzyme';

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

