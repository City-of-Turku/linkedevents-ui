jest.mock('../../utils/events', () => {
    const EventQueryParams = jest.requireActual('../../utils/events');
    const eventAllLanguages = (num) => ({name: {fi: 'suomi', sv: 'svenska', en: 'english'}, id: num});
    const eventFinnishAndSwedish = (num) => ({name: {fi: 'suomi', sv: 'svenska'}, id: num});
    const eventFinnishAndEnglish = (num) => ({name: {fi: 'suomi', en: 'english'}, id: num});
    const eventSwedishAndEnglish = (num) => ({name: {sv: 'svenska', en: 'english'}, id: num});
    const eventsFinnishAndSwedish = [];
    const eventsFinnishAndEnglish = [];
    const eventsSwedishAndEnglish = [];
    const eventsAll = [];

    for (let i = 0; i < 10; i++) {
        eventsFinnishAndSwedish.push(eventFinnishAndSwedish(i + 1));
    }
    for (let i = 0; i < 10; i++) {
        eventsFinnishAndEnglish.push(eventFinnishAndEnglish(i + 22));
    }
    for (let i = 0; i < 10; i++) {
        eventsSwedishAndEnglish.push(eventSwedishAndEnglish(i + 44));
    }
    for (let i = 0; i < 10; i++) {
        eventsAll.push(eventAllLanguages(i + 66));
    }
    return {
        __esModule: true,
        ...EventQueryParams,
        fetchEvents: jest.fn().mockImplementation((foo) => {
            let events = [];
            if (foo.language !== 'null') {
                if (foo.language === 'fi') {
                    events = events.concat(eventsFinnishAndEnglish, eventsFinnishAndSwedish);
                }
                if (foo.language === 'sv') {
                    events = events.concat(eventsSwedishAndEnglish, eventsFinnishAndSwedish);
                }
                if (foo.language === 'en') {
                    events = events.concat(eventsFinnishAndEnglish, eventsSwedishAndEnglish);
                }
            } else {
                events = events.concat(eventsFinnishAndSwedish, eventsFinnishAndEnglish, eventsSwedishAndEnglish, eventsAll);
            }
            return new Promise((resolve, reject) => {
                resolve({
                    data: {
                        data: events,
                        meta: {
                            count: events.length,
                        },
                    },
                });
            });
        }),
    };
});

import configureStore from 'redux-mock-store';
import React from 'react';
import thunk from 'redux-thunk';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import {Input} from 'reactstrap';
import testReduxIntWrapper from '../../../__mocks__/testReduxIntWrapper';
import ConnectedEventListing, {EventListing} from './index';
import {mockCurrentTime, resetMockDate} from '../../../__mocks__/testMocks';
import {mockUserEvents, mockUser} from '../../../__mocks__/mockData';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Helmet} from 'react-helmet'

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

const mockUserAdmin = mockUser;
mockUserAdmin.userType = 'admin';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    user: mockUserAdmin,
    intl,
};

const defaultTableData = {
    events: [],
    count: null,
    fetchComplete: false,
    pageSize: 25,
    paginationPage: 0,
    sortBy: 'last_modified_time',
    sortDirection: 'desc',
};

describe('EventListing Snapshot', () => {
    let store;

    beforeEach(() => {
        mockCurrentTime('2018-11-10T12:00:00z');
    });

    afterEach(() => {
        resetMockDate();
    });

    it('should render view by default', () => {
        const componentProps = {
            login: jest.fn(),
            user: {},
        };
        const wrapper = shallow(<EventListing {...componentProps} />, {context: {intl}});
        expect(wrapper).toMatchSnapshot();
    });

    it('should render view correctly', () => {
        store = mockStore(initialStore);
        const componentProps = {
            login: jest.fn(),
        }; // Props which are added to component
        const wrapper = shallow(testReduxIntWrapper(store, <ConnectedEventListing {...componentProps} />));
        expect(wrapper).toMatchSnapshot();
    });
});

describe('EventListing', () => {
    function getWrapper(props) {
        return shallow(<EventListing {...defaultProps} {...props} />, {context: {intl}});
    }

    describe('render when not logged in', () => {
        const wrapper = getWrapper({user: null});
        const inputElements = wrapper.find(Input);
        const formattedMessages = wrapper.find(FormattedMessage);

        test('no radio-inputs without user permissions', () => {
            expect(inputElements).toHaveLength(0);
        });

        test('correct amount of FormattedMessages without user permissions', () => {
            expect(formattedMessages).toHaveLength(3);
        });
    });

    describe('render when logged in', () => {
        const wrapper = getWrapper();
        const formattedMessages = wrapper.find(FormattedMessage);
        const instance = wrapper.instance();

        test('contains radio-inputs with correct props', () => {
            const inputElements = wrapper.find('.col-sm-12').find('input');
            const eventLanguages = ['all', 'fi', 'sv', 'en'];
            expect(inputElements).toHaveLength(4);
            inputElements.forEach((element, index) => {
                expect(element.prop('value')).toBe(eventLanguages[index]);
                expect(element.prop('type')).toBe('radio');
                expect(element.prop('onChange')).toBe(instance.toggleEventLanguages);
            });
        });

        test('contains user-input with correct props', () => {
            const userInputElement = wrapper.find('.user-events-toggle').find('input');
            expect(userInputElement).toHaveLength(1);

            expect(userInputElement.prop('type')).toBe('checkbox');
            expect(userInputElement.prop('onChange')).toBe(instance.toggleUserEvents);
        });

        test('correct amount of FormattedMessages', () => {
            expect(formattedMessages).toHaveLength(11);
        });
    });

    describe('react-helmet', () => {
        const wrapper = getWrapper().find(Helmet);
        const pageTitle = wrapper.prop('title');
        test('react-helmet is defined and gets title prop', () => {
            expect(wrapper).toBeDefined();
            expect(pageTitle).toBe('Linkedevents - Tapahtumien hallinta');
        });
    });

    describe('methods', () => {
        describe('toggleUserEvents', () => {
            test('sets state for showCreatedByUser according to event.target.checked', () => {
                const wrapper = getWrapper();
                const checked = (bool) => ({target: {checked: bool}});

                expect(wrapper.state('showCreatedByUser')).toBe(false);
                wrapper.instance().toggleUserEvents(checked(true));
                expect(wrapper.state('showCreatedByUser')).toBe(true);
            });
        });

        describe('toggleEventLanguages', () => {
            const event = (lang) => ({target: {value: lang}});
            describe('sets values to state', () => {
                let wrapper;

                beforeEach(() => {
                    wrapper = getWrapper();
                });

                test('sets value for state.showContentLanguage to "" (empty string) if event.target.value === all', () => {
                    expect(wrapper.state('showContentLanguage')).toBe('');
                    wrapper.instance().toggleEventLanguages(event('all'));
                    expect(wrapper.state('showContentLanguage')).toBe('');
                });
                test('sets value for state.showContentLanguage according to event.target.value', () => {
                    expect(wrapper.state('showContentLanguage')).toBe('');
                    wrapper.instance().toggleEventLanguages(event('fi'));
                    expect(wrapper.state('showContentLanguage')).toBe('fi');
                });
                test('sets value for state.paginationPage to 0', () => {
                    const modifiedDefaultState = {...defaultTableData, paginationPage: 100};
                    wrapper.setState({tableData: modifiedDefaultState});
                    expect(wrapper.state('tableData').paginationPage).toBe(100);
                    wrapper.instance().toggleEventLanguages(event('all'));
                    expect(wrapper.state('tableData').paginationPage).toBe(0);
                });
            });
            describe('tableData.events are fetched according to showContentLanguage', () => {
                let wrapper;
                let instance;
                beforeEach(() => {
                    wrapper = getWrapper();
                    instance = wrapper.instance();
                });

                test('tableData.events have english content when showContentLanguage is set to en', async () => {
                    instance.toggleEventLanguages(event('en'));
                    const stateEvents = wrapper.state('tableData').events;
                    stateEvents.forEach((event) => {
                        expect(Object.keys(event.name)).toContain('en');
                    });
                });
                test('tableData.events have swedish content when showContentLanguage is set to sv', async () => {
                    instance.toggleEventLanguages(event('sv'));
                    const stateEvents = wrapper.state('tableData').events;
                    stateEvents.forEach((event) => {
                        expect(Object.keys(event.name)).toContain('sv');
                    });
                });
                test('tableData.events have finnish content when showContentLanguage is set to fi', async () => {
                    instance.toggleEventLanguages(event('fi'));
                    const stateEvents = wrapper.state('tableData').events;
                    stateEvents.forEach((event) => {
                        expect(Object.keys(event.name)).toContain('fi');
                    });
                });
            });
        });

        describe('handleSortChange', () => {
            test('changes sortDirection from desc -> asc', async () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                await instance.handleSortChange('end_time');
                expect(wrapper.state('tableData').sortDirection).toBe('desc');
                await instance.handleSortChange('end_time');
                expect(wrapper.state('tableData').sortDirection).toBe('asc');
            });
        });

        describe('handlePageChange', () => {
            test('changes tableData.paginationPage', async () => {
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                expect(wrapper.state('tableData').paginationPage).toBe(0);
                await instance.handlePageChange({}, 1);
                expect(wrapper.state('tableData').paginationPage).toBe(1);
                await instance.handlePageChange({}, 2);
                expect(wrapper.state('tableData').paginationPage).toBe(2);
            });
        });

        describe('handlePageSizeChange', () => {
            test('changes tableData.pageSize', async () => {
                const page = (pageSize) => ({target: {value: pageSize}});
                const wrapper = getWrapper();
                const instance = wrapper.instance();
                expect(wrapper.state('tableData').pageSize).toBe(25);
                await instance.handlePageSizeChange(page(10));
                expect(wrapper.state('tableData').pageSize).toBe(10);
                await instance.handlePageSizeChange(page(50));
                expect(wrapper.state('tableData').pageSize).toBe(50);
            });
        });
    });
});
