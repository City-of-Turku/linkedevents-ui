import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedLanguageSelect} from '../HelLanguageSelect';
import {FormattedMessage} from 'react-intl';
import {setLanguages as setLanguageAction} from 'src/actions/editor.js';
jest.mock('../../../actions/editor');

const defaultProps = {
    setLanguages: () => {},
    onChange: () => {},
    options: [
        {value: 'fi', label: 'FI'},
        {value: 'sv', label: 'SV'},
        {value: 'en', label: 'EN'},
    ],
    checked: ['fi'],
};

describe('Language Select', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedLanguageSelect {...props} {...defaultProps} />);
    }

    describe('renderer', () => {
        test('number of divs', () => {
            const div = getWrapper().find('div');
            expect(div).toHaveLength(4);
            expect(div.at(0).prop('className')).toBe('language-selection');
            expect(div.at(1).prop('className')).toBe('custom-control custom-checkbox');
        });
        describe('input checkbox', () => {
            test('LanguageSelect input checkbox gets correct props', () => {
                const checkbox = getWrapper().find('input');
                expect(checkbox).toHaveLength(3);
                expect(checkbox.at(0).prop('className')).toBe('custom-control-input');
                expect(checkbox.at(0).prop('type')).toBe('checkbox');
                expect(checkbox.at(0).prop('id')).toBe('checkBox-fi');
                expect(checkbox.at(1).prop('id')).toBe('checkBox-sv');
                expect(checkbox.at(2).prop('id')).toBe('checkBox-en');
                expect(checkbox.at(0).prop('aria-checked')).toBe(true);
                expect(checkbox.at(1).prop('aria-checked')).toBe(false);
                expect(checkbox.at(2).prop('aria-checked')).toBe(false);
                expect(checkbox.at(0).prop('aria-disabled')).toBe(true);
                expect(checkbox.at(1).prop('aria-disabled')).toBe(false);
                expect(checkbox.at(2).prop('aria-disabled')).toBe(false);
            });
        });
        describe('label and FormattedMessage', () => {
            test('label gets correct props', () => {
                const label = getWrapper().find('label');
                expect(label).toHaveLength(3);
                expect(label.at(0).prop('className')).toBe('custom-control-label disabled');
                expect(label.at(0).prop('htmlFor')).toBe('checkBox-fi');
                expect(label.at(1).prop('htmlFor')).toBe('checkBox-sv');
                expect(label.at(2).prop('htmlFor')).toBe('checkBox-en');
            });
            test('renders a FormattedMessage', () => {
                const message = getWrapper().find(FormattedMessage);
                expect(message).toHaveLength(3);
                expect(message.at(0).prop('id')).toBe('FI');
                expect(message.at(1).prop('id')).toBe('SV');
                expect(message.at(2).prop('id')).toBe('EN');
            });
        });
    });
});
