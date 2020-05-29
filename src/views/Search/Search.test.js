import configureStore from 'redux-mock-store'
import React from 'react'
import thunk from 'redux-thunk'

import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper'
import Search from './index'
import SearchBar from 'src/components/SearchBar/index'
import EventGrid from 'src/components/EventGrid';
import {mockUser} from '__mocks__/mockData';
import {shallow} from 'enzyme'
import Spinner from 'react-bootstrap/Spinner'
import {FormattedMessage} from 'react-intl';

const mockStore = configureStore([thunk]);
const initialStore = {
    user: mockUser,
    events: {
        apiErrorMsg: null,
        isFetching: false,
        fetchComplete: false,
        items: [],
        eventError: null,
        eventsError: null,
    },
};

// mock moment to render search dates as expected
jest.mock('moment');

describe('Search Snapshot', () => {
    let store;

    it('should render view correctly', () => {
        const componentProps = {
            match: {
                params: {
                    action: 'search',
                },
            },
        } // Props which are added to component
        store = mockStore(initialStore);
        const componentToTest = <Search {...componentProps} />
        const wrapper = shallow(testReduxIntWrapper(store, componentToTest))

        expect(wrapper).toMatchSnapshot()

    })
})
const defaultProps = {

}
describe('Search', () => {
    function getWrapper(props) {
        return shallow(<Search {...defaultProps} {...props}/>);
    }
    describe('render', () => {

        test('SearchBar element', () => {
            const element = getWrapper().find(SearchBar);
            expect(element).toHaveLength(1);
            expect(element.props('onFormSubmit')).toBeDefined();
        });

        test('Spinner element when loading', () => {
            const element = getWrapper();
            element.setState({loading: true});
            const spinnerElement = element.find(Spinner);
            expect(spinnerElement).toHaveLength(1);
        });

        describe('FormattedMessages', () => {
            test('default amount', () => {
                const element = getWrapper().find(FormattedMessage);
                expect(element).toHaveLength(3);
            });
            test('correct amount when !events & searchExecuted', () => {
                const element = getWrapper();
                element.setState({searchExecuted: true});
                const formattedMessages = element.find(FormattedMessage);
                expect(formattedMessages).toHaveLength(4);
            });
            test('correct amount when events & searchExecuted', () => {
                const element = getWrapper()
                element.setState({searchExecuted: true, events:['Tammi','Koivu']});
                const grid = element.find(EventGrid)
                expect(grid).toHaveLength(1);
                expect(grid.prop('events')).toEqual(element.state('events'));
            });
        });

        describe('correct count to search results FormattedMessage', () => {
            let element;
            
            beforeEach(() => {
                element = getWrapper();
            });
            test('when no results', () => {
                const resultCount = element.find(FormattedMessage).at(2);
                const count = element.state('events');
                expect(resultCount.prop('values')).toEqual({'count': count.length});
            });
            test('when results', () => {
                element.setState({events:['Tammi','Koivu']});
                const resultCount = element.find(FormattedMessage).at(2);
                const count = element.state('events');
                expect(resultCount.prop('values')).toEqual({'count': count.length});
            });
        });
    });
})



