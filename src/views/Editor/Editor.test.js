import configureStore from 'redux-mock-store';
import React from 'react';
import thunk from 'redux-thunk';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {Button} from 'reactstrap';
import {Helmet} from 'react-helmet';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

// these 2 mocks are for the EventMap component
jest.mock(
    '@city-i18n/localization.json',
    () => ({
        mapPosition: [60.451744, 22.266601],
    }),
    {virtual: true}
);

jest.mock(
    '@city-assets/urls.json',
    () => ({
        rasterMapTiles: 'this is a url to the maptiles',
    }),
    {virtual: true}
);

import {EditorPage} from './index';
import {mockUser, mockEditorNewEvent, mockEditorExistingEvent} from '../../../__mocks__/mockData';

const mockStore = configureStore([thunk]);
const initialStoreNewEvent = {
    user: mockUser,
    editor: mockEditorNewEvent,
};
const initialStoreExistingEvent = {
    user: mockUser,
    editor: mockEditorExistingEvent,
};

describe('Editor Snapshot', () => {
    it('should render view correctly when new event', () => {
        const componentProps = {
            match: {
                params: {
                    action: 'create',
                    eventId: 'new?_k=dn954b',
                },
            },
            app: {
                flashMsg: null,
                confirmAction: null,
            },
            setFlashMsg: jest.fn(),
            setEditorAuthFlashMsg: jest.fn(),
            intl: {
                formatMessage: jest.fn(),
            },
            ...initialStoreNewEvent,
        }; // Props which are added to component
        const wrapper = shallow(<EditorPage {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly when editing existing event', () => {
        const componentProps = {
            match: {
                params: {
                    action: 'update',
                    eventId: 'helsinki:afqxukccli',
                },
            },
            app: {
                flashMsg: null,
                confirmAction: null,
            },
            setFlashMsg: jest.fn(),
            setEditorAuthFlashMsg: jest.fn(),
            intl: {
                formatMessage: jest.fn(),
            },
            ...initialStoreExistingEvent,
        }; // Props which are added to component
        const wrapper = shallow(<EditorPage {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly when creating new event from existing one', () => {
        const componentProps = {
            match: {
                params: {
                    action: 'create',
                    eventId: 'new?_k=dn954b',
                },
            },
            app: {
                flashMsg: null,
                confirmAction: null,
            },
            setFlashMsg: jest.fn(),
            setEditorAuthFlashMsg: jest.fn(),
            intl: {
                formatMessage: jest.fn(),
            },
            ...initialStoreExistingEvent,
        }; // Props which are added to component
        const wrapper = shallow(<EditorPage {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    const defaultProps = {
        intl,
    };

    function getWrapper(props) {
        return shallow(<EditorPage {...defaultProps} {...componentProps} {...props} />, {context: {intl}});
    }
    const componentProps = {
        match: {
            params: {
                action: 'create',
                eventId: 'new?_k=dn954b',
            },
        },
        app: {
            flashMsg: null,
            confirmAction: null,
        },
        setFlashMsg: jest.fn(),
        setEditorAuthFlashMsg: jest.fn(),
        intl: {
            formatMessage: jest.fn(),
        },
        ...initialStoreExistingEvent,
    };
    test('correct amount of FormattedMessages', () => {
        const element = getWrapper().find(FormattedMessage);
        expect(element).toHaveLength(1);
    });
    test('react-helmet is defined and gets title prop', () => {
        const wrapper = getWrapper().find(Helmet);
        const pageTitle = wrapper.prop('title');
        expect(wrapper).toBeDefined();
        expect(pageTitle).toBeDefined();
        expect(pageTitle).toHaveLength(24);
    });
    test('Button toggles showPreviewEventModal state', () => {
        const wrapper = getWrapper();
        const element = wrapper.find(Button);
        expect(wrapper.state('showPreviewEventModal')).toBe(false);
        element.simulate('click');
        expect(wrapper.state('showPreviewEventModal')).toBe(true);
    });
});
