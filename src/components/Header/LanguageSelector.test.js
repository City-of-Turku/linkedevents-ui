import React from 'react';
import {shallow} from 'enzyme';
import LanguageSelector from './LanguageSelector';

const defaultProps = {
    languages: [
        {
            label: 'fi',
        },
        {
            label: 'en',
        },
        {
            label: 'sv',
        },
    ],
    userLocale: {
        locale: 'fi',
    },
    changeLanguage : () => null,
};

describe('languageSelector', () => {
    function getWrapper(props) {
        return shallow(<LanguageSelector {...defaultProps} {...props} />)
    }
    describe('acutal test', () => {
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
