import React from 'react';
import {shallow} from 'enzyme';
import LanguageSelector from './LanguageSelector';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const defaultProps = {
    languages: [
        {
            label: 'fi',
            value: 'fi',
        },
        {
            label: 'en',
            value: 'en',
        },
        {
            label: 'sv',
            value: 'sv',
        },
    ],
    userLocale: {
        locale: 'fi',
    },
    changeLanguage : () => null,
};
describe('languageSelector', () => {
    function getWrapper(props) {
        return shallow(<LanguageSelector {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('Testing locales shown', () => {
        test('is default locale', () => {
            const element = getWrapper().find('div');
            expect(element).toHaveLength(2);
            const sec = element.at(1).find('a');
            expect(sec.text()).toBe('FI');
        })

        test('activeLocale when en', () => {
            const element = getWrapper({userLocale:{locale:'en'}}).find('div').at(1).find('a');
            expect(element.text()).toBe('EN');
        })
    })

})
