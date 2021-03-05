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
    changeLanguage: jest.fn(),
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
        });

        test('activeLocale when en', () => {
            const element = getWrapper({userLocale: {locale: 'en'}})
                .find('div')
                .at(1)
                .find('a');
            expect(element.text()).toBe('EN');
        });

        test('activeLocale when sv', () => {
            const element = getWrapper({userLocale: {locale: 'sv'}})
                .find('div')
                .at(1)
                .find('a');
            expect(element.text()).toBe('SV');
        });
    });
    describe('Function tests', () => {
        test('isOpen default state', () => {
            const element = getWrapper();
            expect(element.state('isOpen')).toBe(false);
        });
        test('<li> element gets correct props', () => {
            const element = getWrapper().find('li');
            expect(element).toHaveLength(3);
            const first = element.at(1);
            expect(first.prop('role')).toBe('presentation');
            expect(first.prop('onClick')).toBeDefined();
            expect(first.prop('className')).toBe('language-item');
        });
        test('click calls changeLanguage', () => {
            const wrapper = getWrapper();
            const spy = jest.spyOn(wrapper.instance().props,'changeLanguage');
            const liElement = wrapper.find('li').at(0);
            
            liElement.simulate('click', {preventDefault: () => {}});
            expect(spy).toHaveBeenCalled();
        });
    });
});
