import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {CookieBarWithoutIntl} from '../CookieBar';


describe('src/components/cookieBar/CookieBar', () => {
    const testMessages = mapValues(fiMessages, (value) => value);
    const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
    const {intl} = intlProvider.getChildContext();

    function getWrapper() {
        return shallow(<CookieBarWithoutIntl intl={intl}/>)
    }

    test('renders CookieBar with correct props', () => {
        const wrapper = getWrapper()
        expect(wrapper).toHaveLength(1);
        expect(wrapper.prop('buttonId')).toBe('cookie-accept-button');
        expect(wrapper.prop('buttonText')).toEqual(intl.formatMessage({id: 'cookieBar.accept'}));
        expect(wrapper.prop('contentClasses')).toBe('cookie-content');
        expect(wrapper.prop('declineButtonId')).toBe('cookie-decline-button');
        expect(wrapper.prop('declineButtonText')).toEqual(intl.formatMessage({id: 'cookieBar.decline.text'}));
        expect(wrapper.prop('disableStyles')).toBe(true);
        expect(wrapper.prop('enableDeclineButton')).toBe(true);
        expect(wrapper.prop('onDecline')).toBeDefined();
        expect(wrapper.prop('expires')).toBe(90);
        expect(wrapper.prop('setDeclineCookie')).toBe(false);
        expect(wrapper.prop('flipButtons')).toBe(true);
        expect(wrapper.contains(intl.formatMessage({id: 'cookieBar.description'}))).toBe(true);
    });

    test('renders link to cookie policy with correct props', () => {
        const policyLink = getWrapper().find('a');
        expect(policyLink.length).toBe(1);
        expect(policyLink.prop('id')).toBe('cookiebar-link');
        expect(policyLink.prop('href')).toEqual(intl.formatMessage({id: 'cookieBar.link.url'}));
        expect(policyLink.text()).toEqual(intl.formatMessage({id: 'cookieBar.link.text'}));
    });
});
