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
import {IntlProvider, FormattedMessage} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Helmet} from 'react-helmet'
import {mockUserEvents} from '../../../__mocks__/mockData'

jest.mock('../../utils/events', () => (
    {
        ...(jest.requireActual('../../utils/events')),
        fetchEvents: jest.fn(() =>(
            new Promise((resolve) => {
                process.nextTick(() =>
                    resolve({data: {data: mockUserEvents}})
                );
            })
        )),
    }
))
import {EventQueryParams, fetchEvents} from '../../utils/events'

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

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
    intl,
}

describe('Search', () => {
    function getWrapper(props) {
        return shallow(<Search {...defaultProps} {...props}/>, {context: {intl}});
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
                expect(element).toHaveLength(4);
            });
            test('correct amount when !events & searchExecuted', () => {
                const element = getWrapper();
                element.setState({searchExecuted: true});
                const formattedMessages = element.find(FormattedMessage);
                expect(formattedMessages).toHaveLength(5);
            });
            test('correct amount when events & searchExecuted', () => {
                const element = getWrapper()
                element.setState({searchExecuted: true, events:['Tammi','Koivu']});
                const grid = element.find(EventGrid)
                expect(grid).toHaveLength(1);
                expect(grid.prop('events')).toEqual(element.state('events'));
            });
        });

        describe('react-helmet', () => {
            test('react-helmet is defined and gets title prop', () => {
                const wrapper = getWrapper().find(Helmet);
                const pageTitle = wrapper.prop('title');
                expect(wrapper).toBeDefined();
                expect(pageTitle).toBe('Linkedevents - Etsi tapahtumia');
            });
        });

        describe('correct count to search results FormattedMessage', () => {
            let element;
            
            beforeEach(() => {
                element = getWrapper();
            });
            test('when no results', () => {
                const resultCount = element.find(FormattedMessage).at(3);
                const count = element.state('events');
                expect(resultCount.prop('values')).toEqual({'count': count.length});
            });
            test('when results', () => {
                element.setState({events:['Tammi','Koivu']});
                const resultCount = element.find(FormattedMessage).at(3);
                const count = element.state('events');
                expect(resultCount.prop('values')).toEqual({'count': count.length});
            });
        });
    });

    describe('functions', () => {
        describe('searchEvents', () => {
            const searchQuery = 'testing'
            const startDate = undefined
            const endDate = undefined

            test('calls fetchEvents with correct parameters', () => {
                const date = new Date(`2021`)
                jest.spyOn(global.Date, 'now').mockImplementationOnce(() => date);
                const instance = getWrapper().instance()
                const queryParams = new EventQueryParams()
                queryParams.page_size = 100
                queryParams.sort = 'start_time'
                queryParams.nocache = date
                queryParams.text = searchQuery
                instance.searchEvents(searchQuery, startDate, endDate)
                expect(fetchEvents).toHaveBeenCalledTimes(1)
                expect(fetchEvents).toHaveBeenCalledWith(queryParams);
            })

            test('sets correct state values', async () => {
                const instance = getWrapper().instance()
                const initialState = {...instance.state}
                expect(instance.state.events).toStrictEqual(initialState.events)
                expect(instance.state.searchExecuted).toBe(initialState.loading)
                expect(instance.state.loading).toBe(initialState.searchExecuted)
                await instance.searchEvents(searchQuery, startDate, endDate)                
                expect(instance.state.events).toBe(mockUserEvents)
                expect(instance.state.searchExecuted).toBe(true)
                expect(instance.state.loading).toBe(false)
            })
        })
    })
})



