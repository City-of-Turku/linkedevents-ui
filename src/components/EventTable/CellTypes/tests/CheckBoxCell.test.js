import React from 'react';
import CheckBoxCell from '../CheckBoxCell';
import {Input} from 'reactstrap';
import {shallow} from 'enzyme';

const defaultProps = {
    checked: false,
    disabled: false,
    onChange: jest.fn(),
    event: {},
    tableName: 'pöytäNimi',
};

describe('CheckBoxCell', () => {
    function getWrapper(props) {
        return shallow(<CheckBoxCell {...defaultProps} {...props}/>);
    }

    test('renders', () => {
        const element = getWrapper();
        const inputElement = element.find(Input);
        expect(inputElement).toHaveLength(1);
        expect(inputElement.prop('checked')).toEqual(defaultProps.checked);
        expect(inputElement.prop('type')).toBe('checkbox');
        expect(inputElement.prop('invalid')).toEqual(defaultProps.disabled);
        expect(inputElement.prop('onChange')).toBeDefined();
    })
})

