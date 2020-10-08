import React from 'react';
import {UnconnectedFooter} from './Footer';
import {shallow} from 'enzyme';
import {Link} from 'react-router-dom';
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';

const testMessages = mapValues(fiMessages, (value) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    intl,
    showReportForm: false,
    closeReportForm: false,
};

describe('Footer', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedFooter {...props} {...defaultProps} />);
    }
    describe('renderer', () => {
        test('Formatted message length', () => {
            const wrapper = getWrapper().find(FormattedMessage);
            expect(wrapper).toHaveLength(6);
        });

        test('Correct props for Link', () => {
            const wrapper = getWrapper().find(Link);
            expect(wrapper).toHaveLength(1);
            expect(wrapper.prop('to')).toBe('/accessibility');
            expect(wrapper.prop('aria-label')).toBe(intl.formatMessage({id: 'footer-accessibility'}));
        });

        test('Correct props for button', () => {
            const wrapper = getWrapper();
            const instance = wrapper.instance();
            const button = wrapper.find('button');
            expect(button).toHaveLength(1);
            expect(button.prop('aria-label')).toBe(intl.formatMessage({id: 'reportmodal-button'}));
            expect(button.prop('onClick')).toBe(instance.showReportForm);
        });

        test('Toggle show report forms state', () => {
            const wrapper = getWrapper();
            const button = wrapper.find('button');
            expect(wrapper.state('reporting')).toBe(false);
            button.simulate('click');
            expect(wrapper.state('reporting')).toBe(true);
        });

        test('Correct <a> element prop', () => {
            const wrapper = getWrapper().find('a');
            expect(wrapper.prop('href')).toBe(intl.formatMessage({id: 'footer-link'}));
        });
    });
});
