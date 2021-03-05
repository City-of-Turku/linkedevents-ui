import React from 'react';
import {shallow} from 'enzyme';
import {FormattedMessage} from 'react-intl';
import LoginNotification from './LoginNotification';

describe('LoginNotification', () => {
    const defaultProps = {};

    function getWrapper(props) {
        return shallow(<LoginNotification {...defaultProps} {...props} />);
    }

    describe('renders', () => {
        test('alert div contains correct props', () => {
            const element = getWrapper().find('div');
            expect(element).toHaveLength(1);
            expect(element.prop('className')).toBe('alert alert-danger');
            expect(element.prop('role')).toBe('alert');
        });
        test('button contains correct props', () => {
            const button = getWrapper().find('button');
            expect(button).toHaveLength(1);
            expect(button.prop('className')).toBe('btn-link alert-link underline');
            expect(button.prop('rel')).toBe('external');
            expect(button.prop('role')).toBe('link');
        });
        test('finds 3 FormattedMessages', () => {
            const message = getWrapper().find(FormattedMessage);
            expect(message).toHaveLength(3);
            expect(message.at(0).prop('id')).toBe('login-warning');
            expect(message.at(1).prop('id')).toBe('login-warning1');
            expect(message.at(2).prop('id')).toBe('login-warning2');
        });
    });
});
