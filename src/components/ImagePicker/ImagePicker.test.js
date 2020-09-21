import configureStore from 'redux-mock-store'
import React from 'react'
import {shallow} from 'enzyme'
import thunk from 'redux-thunk'
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Modal} from 'reactstrap';
import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper'

import ConnectedImagePicker, {ImagePicker} from './index'
import {mockUser, mockEditorExistingEvent, mockImages} from '__mocks__/mockData';

const testMessages = mapValues(fiMessages, (value, key) => value);

const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const mockStore = configureStore([thunk]);
const initialStore = {
    user: mockUser,
    editor: mockEditorExistingEvent,
    images: {
        isFetching: false,
        fetchComplete: false,
        items: mockImages,
        selected: {},
    },
};

describe('Image add form', () => {
    let store;

    it('ImagePicker component should render view by default', () => {
        const wrapper = shallow(<ImagePicker intl={intl}/>,{context: {intl}});
        expect(wrapper).toMatchSnapshot()
    })

    it('ImagePicker component should render correctly with data', () => {
        store = mockStore(initialStore);
        const componentProps = {
            dispatch: jest.fn(),
        };
        const wrapper = shallow(testReduxIntWrapper(store, <ConnectedImagePicker {...componentProps} />))
        expect(wrapper).toMatchSnapshot();
    })
})

const defaultProps = {
    values: {},
    toggle: () => null,
    validationErrors: [],
    formType: '',
    open: false,
    intl,
};

describe('ImagePicker', () => {
    function getWrapper(props) {
        return shallow(<ImagePicker {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('render', () => {
        test('contains Modal with correct props', () => {
            const element = getWrapper().find(Modal);
            expect(element).toHaveLength(1);
            expect(element.prop('isOpen')).toEqual(defaultProps.open);
        });
        /*
        test('Modal opening', () => {
            const element = getWrapper();
            expect(element.find(Modal).prop('open')).toEqual(false);
            element.setProps({open: true});
            expect(element.find(Modal).prop('open')).toEqual(true);
        }); */
        test('correct amount of FormattedMessages', () => {
            const element = getWrapper().find(FormattedMessage);
            expect(element).toHaveLength(2);
        })
    })
})
