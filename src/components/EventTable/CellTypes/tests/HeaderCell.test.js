import React from 'react';
import HeaderCell from '../HeaderCell';
import {Input} from 'reactstrap';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import mapValues from 'lodash/mapValues';

import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const defaultProps = {
    handleRowSelect: jest.fn(),
    handleSortChange: jest.fn(),
    name: 'checkbox',
    sortDirection: '',
    active: false,
    children: undefined,
    tableName: 'pöytäNimi',
};

describe('HeaderCell', () => {
    function getWrapper(props) {
        return shallow(<HeaderCell {...defaultProps} {...props}/>, {context: {intl}});
    }
    describe('checkbox element', () => {

        let element;
        beforeEach(() => {
            element = getWrapper();
        });

        test('renders', () => {
            const inputElement = element.find(Input);
            expect(element.find('th.checkbox')).toHaveLength(1);
            expect(inputElement).toHaveLength(1);
        });
        test('checked prop changes according to state.isChecked', () => {
            const instance = element.instance();
            expect(element.find(Input).prop('checked')).toBe(false);
            instance.handleRow();
            expect(element.find(Input).prop('checked')).toBe(true);
        });
    });

    describe('other element', () => {
        const childElement = React.createElement('p',null,'Julkaisija');

        test('renders', () => {
            const element = getWrapper({children: childElement, name: 'publisher'});
            expect(element.find('div').prop('onClick')).toBeDefined();
            expect(element.find('p')).toHaveLength(1);
            expect(element.find('p').text()).toBe('Julkaisija');
        });

        test('renders span element(arrow icons) according to sortDirection', () => {
            let element = getWrapper({children: childElement, name: 'publisher', active: true, sortDirection: 'asc'});
            expect(element.find('span.glyphicon-arrow-up')).toHaveLength(1);
            element = getWrapper({children: childElement, name: 'publisher', active: true, sortDirection: 'desc'});
            expect(element.find('span.glyphicon-arrow-down')).toHaveLength(1);
        });
    })

})
