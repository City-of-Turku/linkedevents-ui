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

    describe('functions', () => {
        describe('componentDidUpdate', () => {
            const wrapper = getWrapper()
            const instance = wrapper.instance()
            const fetchDataSpy = jest.spyOn(instance, 'fetchEventData')

            afterEach(() => { fetchDataSpy.mockClear() })
            afterAll(() => { fetchDataSpy.mockRestore() })

            test('fetchEventData is called when user prop changes', () => {
                wrapper.setProps({user: {id: '123abc'}})
                wrapper.setProps({user: {id: '567fgh'}})
                wrapper.setProps({user: null})
                expect(fetchDataSpy).toHaveBeenCalledTimes(3)
            })

            test('fetchEventData is not called when user prop does not change', () => {
                const user = {user: {id: '123abc'}}
                wrapper.setProps({user})
                expect(fetchDataSpy).toHaveBeenCalledTimes(1)
                fetchDataSpy.mockClear()
                wrapper.setProps({user})
                expect(fetchDataSpy).toHaveBeenCalledTimes(0)
            })
        })
    })
});
