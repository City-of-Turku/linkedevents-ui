import React from 'react';
import {shallow} from 'enzyme';
import {UnconnectedImageGallery} from './ImageGallery';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Button} from 'reactstrap';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    openEditModal: false,
    openOrgModal: false,
    fetchDefaults: true,
    editor: {
        values: '',
    },
    images: {
        defaultImages: null,
    },
    fetchUserImages: jest.fn(),
}


describe('ImageGallery', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedImageGallery {...defaultProps} {...props}/>, {context: {intl}});
    }
    describe('render', () => {
        test('contains Buttons with correct props', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            const element = wrapper.find(Button)
            expect(element).toHaveLength(2);
            expect(element.at(0).prop('onClick')).toBe(instance.toggleEditModal);
            expect(element.at(1).prop('onClick')).toBe(instance.toggleOrgModal);
        });

        test('first Button toggles openEditModal state', () => {
            const wrapper = getWrapper();
            const element = wrapper.find(Button).at(0)
            expect(element).toHaveLength(1);
            expect(wrapper.state('openEditModal')).toBe(false);
            element.simulate('click')
            expect(wrapper.state('openEditModal')).toBe(true);
        });

        test('second Button toggles openOrgModal state', () => {
            const wrapper = getWrapper();
            const element = wrapper.find(Button).at(1)
            expect(element).toHaveLength(1);
            expect(wrapper.state('openOrgModal')).toBe(false);
            element.simulate('click')
            expect(wrapper.state('openOrgModal')).toBe(true);
        });

        test('correct amount of FormattedMessages', () => {
            const element = getWrapper().find(FormattedMessage);
            expect(element).toHaveLength(4);
        })
    })
});
