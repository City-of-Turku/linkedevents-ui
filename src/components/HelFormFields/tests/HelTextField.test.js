import React from 'react';
import {shallow} from 'enzyme';
import HelTextField from '../HelTextField';
import {TextField} from '@material-ui/core';
import ValidationPopover from '../../ValidationPopover';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const defaultProps = {
    name: undefined,
    placeholder: 'placeholdervalue',
    defaultValue: 'oletusarvo',
    label: 'Otsikko',
    multiLine: false,
    required: true,
    disabled: undefined,
    validationErrors: undefined,

}

describe('HelTextField', () => {
    function getWrapper(props) {
        return shallow(<HelTextField {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('default renders', () => {
        test('correct components', () => {
            const elements = getWrapper();
            const textField = elements.find(TextField);
            const validationPopover = elements.find(ValidationPopover);
            expect(elements).toHaveLength(1);
            expect(textField).toHaveLength(1);
            expect(validationPopover).toHaveLength(1);
        });

        test('TextField with correct props', () => {
            const element = getWrapper();
            const textField = element.find(TextField);
            expect(textField.prop('fullWidth')).toBeDefined();
            expect(textField.prop('name')).toBe(defaultProps.name);
            expect(textField.prop('label')).toBe(defaultProps.label);
            expect(textField.prop('value')).toBe(element.state('value'));
            expect(textField.prop('required')).toBe(defaultProps.required);
            expect(textField.prop('placeholder')).toBe(defaultProps.placeholder);
            expect(textField.prop('disabled')).toBe(defaultProps.disabled);
            expect(textField.prop('onChange')).toBeDefined();
            expect(textField.prop('onBlur')).toBeDefined();
            expect(textField.prop('multiline')).toBe(defaultProps.multiLine);
            expect(textField.prop('inputRef')).toBeDefined();
            expect(textField.prop('helperText')).toBeUndefined();
            expect(textField.prop('InputLabelProps')).toEqual({focused: false, shrink: false, disableAnimation: true});
            expect(textField.prop('error')).toBe(element.state('error'));
        });

        test('ValidationPopover with correct props', () => {
            const element = getWrapper().find(ValidationPopover);
            expect(element.prop('index')).toBeUndefined();
            expect(element.prop('anchor')).toBeUndefined();
            expect(element.prop('validationErrors')).toBeUndefined();
        });
    });

    describe('renders a short description TextField', () => {
        const descriptionProps = {
            defaultValue: '',
            label: 'Lyhyt kuvaus',
            multiLine: true,
            validations: ['shortString'],
        };

        test('with correct props', () => {
            const element = getWrapper(descriptionProps);
            const textField = element.find(TextField);
            expect(textField.prop('multiline')).toBe(true);
            expect(textField.prop('helperText')).toBe('160 merkkiä jäljellä');
        });

        test('TextField props change according to state.value', () => {
            // Because this uses <shallow> we cant test for the
            // correct text after '0 merkkiä jäljellä'.
            // If we wanted to test that this should be rewritten with <mount>
            let element = getWrapper(descriptionProps);
            const instance = element.instance();
            expect(element.find(TextField).prop('helperText')).toBe('160 merkkiä jäljellä');
            instance.handleChange({target:{value:'kymmenenkö'}});
            expect(element.find(TextField).prop('helperText')).toBe('150 merkkiä jäljellä');
            instance.handleChange({
                target: {
                    value:'kymmenen..kymmenen..kymmenen..kymmenen..kymmenen..' +
                        'kymmenen..kymmenen..kymmenen..kymmenen..kymmenen..' +
                        'kymmenen..kymmenen..kymmenen..kymmenen..kymmenen..' +
                        'kymmenen..',
                },
            });
            expect(element.find(TextField).prop('helperText')).toBe('0 merkkiä jäljellä');
        });
    });
});
