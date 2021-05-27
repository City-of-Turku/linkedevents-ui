import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider, FormattedMessage} from 'react-intl';
import EventGrid from '../../components/EventGrid'
import {UnconnectedHomePage} from './HomePage';
import {Button} from 'reactstrap'
import {mockUserEvents} from '../../../__mocks__/mockData'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

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

const defaultProps = {
    location: window.location,
    routerPush: () => {},
    handleRouterClick: () => {},
    locale: 'fi',
}

describe('Homepage', () => {
    function getWrapper(props) {
        return shallow(<UnconnectedHomePage {...defaultProps} {...props}/>, {context: {intl}});
    }

    describe('render', () => {
        describe('methods', () => {

            describe('componentDidUpdate', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance()
                const fetchDataSpy = jest.spyOn(instance, 'fetchTableData')
    
                afterEach(() => { fetchDataSpy.mockClear() })
                afterAll(() => { fetchDataSpy.mockRestore() })
    
                test('fetchTableData is called when locale prop changes', () => {
                    wrapper.setProps({locale: 'fi'})
                    wrapper.setProps({locale: 'en'})
                    expect(fetchDataSpy).toHaveBeenCalledTimes(1)
                })
    
                test('fetchTableData is not called when locale prop does not change', () => {
                    const locale = {locale: 'sv'}
                    wrapper.setProps(locale)
                    expect(fetchDataSpy).toHaveBeenCalledTimes(1)
                    fetchDataSpy.mockClear()
                    wrapper.setProps(locale)
                    expect(fetchDataSpy).toHaveBeenCalledTimes(0)
                })
                test('getIDref returns correct string', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    const button = wrapper.find(Button).at(1)
                    const expectedHref =  instance.getIDref(defaultProps.locale)
                    expect(expectedHref).toEqual(button.prop('href'))
                })
            })
        })

        describe('elements', () => {
            test('find EventGrid element with correct props', () => {
                const wrapper = getWrapper();
                const element = wrapper.find(EventGrid)
                expect(element).toHaveLength(1);
                expect(element.prop('homePage')).toBe(true);
                expect(element.prop('events')).toEqual([]);
            });

            test('correct Button elements', () => {
                const wrapper = getWrapper();
                const button = wrapper.find(Button)
                expect(button).toHaveLength(3)
                button.forEach((element) => {
                    expect(element.prop('onClick')).toBeDefined();
                    expect(element.prop('className')).toBe('btn');
                });
            });
            test('correct amount of formattedMessages', () => {
                const wrapper = getWrapper();
                const message = wrapper.find(FormattedMessage)
                expect(message).toHaveLength(9)
            })
        })
    })
})

