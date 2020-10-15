import configureStore from 'redux-mock-store';
import React from 'react';
import thunk from 'redux-thunk';
import {shallow} from 'enzyme';
import renderer from 'react-test-renderer';
import {IntlProvider} from 'react-intl';
import {Helmet} from 'react-helmet';

import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper';
import {mockCurrentTime, resetMockDate} from '../../../__mocks__/testMocks';
import ConnectedModeration, {Moderation} from './Moderation';

import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const mockStore = configureStore([thunk]);
const initialStore = {
    user: {
        id: 'testuser',
        username: 'fooUser',
        provider: 'helsinki',
    },
    app: {
        flashMsg: null,
        confirmAction: null,
    },
};

const defaultProps = {
    intl,
};

describe('Moderation Snapshot', () => {
    let store;

    beforeEach(() => {
        mockCurrentTime('2018-11-10T12:00:00z');
    });

    afterEach(() => {
        resetMockDate();
    });

    it('should render view by default', () => {
        const componentProps = {
            confirm: jest.fn(),
            routerPush: jest.fn(),
            setFlashMsg: jest.fn(),
            user: {},
        };
        const wrapper = shallow(<Moderation {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly', () => {
        store = mockStore(initialStore);
        const componentProps = {
            confirm: jest.fn(),
            routerPush: jest.fn(),
            setFlashMsg: jest.fn(),
            user: {},
        };
        const componentToTest = <ConnectedModeration {...componentProps} />;
        const wrapper = renderer.create(testReduxIntWrapper(store, componentToTest));

        expect(wrapper).toMatchSnapshot();
    });
});
describe('Moderation', () => {
    function getWrapper(props) {
        return shallow(<Moderation {...defaultProps} {...props} />, {context: {intl}});
    }
    test('react-helmet is defined and gets title prop', () => {
        const wrapper = getWrapper().find(Helmet);
        const pageTitle = wrapper.prop('title');
        expect(wrapper).toBeDefined();
        expect(pageTitle).toBe('Linkedevents - Moderoi tapahtumia');
    });
});
