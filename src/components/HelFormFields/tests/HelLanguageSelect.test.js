import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';
import {UnconnectedLanguageSelect} from '../HelLanguageSelect';

const defaultProps = {
    options: [
        {value: 'fi', label: 'FI'},
        {value: 'sv', label: 'SV'},
        {value: 'en', label: 'EN'},
    ],
    onChange: () => {},
    setLanguages: () => {},
    checked: ['fi'],
};

describe('HelLanguageSelect', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedLanguageSelect {...defaultProps} {...props} />);
    }

    describe('renderer', () => {
        const availableLanguages = ['fi', 'sv', 'en'];

        test('number of divs', () => {
            const div = getWrapper().find('div');
            expect(div).toHaveLength(4);
            expect(div.at(0).prop('className')).toBe('language-selection');
            expect(div.at(1).prop('className')).toBe('custom-control custom-checkbox');
        });
        describe('input checkbox', () => {
            test('LanguageSelect input checkbox gets correct props', () => {
                const activeLang = availableLanguages[Math.floor(Math.random() * availableLanguages.length)];
                const checkboxes = getWrapper({checked: [activeLang]}).find('input');

                expect(checkboxes).toHaveLength(3);
                checkboxes.forEach((checkbox, index) => {
                    expect(checkbox.prop('className')).toBe('custom-control-input');
                    expect(checkbox.prop('type')).toBe('checkbox');
                    expect(checkbox.prop('id')).toBe(`checkBox-${availableLanguages[index]}`);
                    if (availableLanguages[index] === activeLang) {
                        expect(checkbox.prop('aria-checked')).toBe(true);
                        expect(checkbox.prop('aria-disabled')).toBe(true);
                    } else {
                        expect(checkbox.prop('aria-checked')).toBe(false);
                        expect(checkbox.prop('aria-disabled')).toBe(false);
                    }
                });
            });
        });
        describe('label and FormattedMessage', () => {
            test('label gets correct props', () => {
                const activeLang = availableLanguages[Math.floor(Math.random() * availableLanguages.length)];
                const labels = getWrapper({checked: [activeLang]}).find('label');
                expect(labels).toHaveLength(3);
                labels.forEach((label, index) => {
                    expect(label.prop('htmlFor')).toBe(`checkBox-${availableLanguages[index]}`);
                    if (availableLanguages[index] === activeLang) {
                        expect(label.prop('className')).toBe('custom-control-label disabled');
                    } else {
                        expect(label.prop('className')).toBe('custom-control-label');
                    }
                });
            });
            test('renders a FormattedMessage', () => {
                const messages = getWrapper().find(FormattedMessage);
                expect(messages).toHaveLength(3);
                messages.forEach((message, index) => {
                    expect(message.prop('id')).toBe(availableLanguages[index].toUpperCase());
                });
            });
        });
    });
});
