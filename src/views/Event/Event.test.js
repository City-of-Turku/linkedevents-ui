import React from 'react';
import {UnconnectedEventPage} from './index.js';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import {Helmet} from 'react-helmet';

import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
};

describe('EventPage', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedEventPage {...defaultProps} {...props} />, {context: {intl}});
    }
    test('Check react-helmet title prop', () => {
        const wrapper = getWrapper().find(Helmet);
        const pageTitle = wrapper.prop('title');
        expect(pageTitle).toBe('Linkedevents - ');
    });
});
