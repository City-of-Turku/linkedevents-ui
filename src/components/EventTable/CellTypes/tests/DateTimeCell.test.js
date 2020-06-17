import React from 'react';
import DateTimeCell from '../DateTimeCell';
import {shallow} from 'enzyme';
import moment from 'moment';
import {mockUserEvents} from '__mocks__/mockData';

const mockEvent = mockUserEvents[0];
mockEvent.start_time = '2020-01-31T11:13:00';
mockEvent.end_time = '2020-02-10T11:13:00';
mockEvent.last_modified_time = '2020-01-29T09:00:00';
mockEvent.date_published = '2020-01-30T10:00:00';

const defaultProps = {
    event: mockEvent,
    start: false,
    end: false,
    time: false,
    lastModified: false,
    datePublished: false,
};

describe('DateTimeCell', () => {
    function getWrapper(props) {
        return shallow(<DateTimeCell {...defaultProps} {...props}/>)
    }
    const startTime = moment(mockEvent.start_time).format('DD.M.YYYY');
    const endTime = moment(mockEvent.end_time).format('DD.M.YYYY');

    describe('methods', () => {

        test('getStartTime works correctly', () => {
            const element = getWrapper({start: true});
            const instance = element.instance();
            const returnValue = instance.getStartTime();
            expect(returnValue).toEqual(startTime);
        });

        test('getEndTime works correctly', () => {
            const element = getWrapper({end: true});
            const instance = element.instance();
            const returnValue = instance.getEndTime();
            expect(returnValue).toEqual(endTime);
        });

        test('getTime works correctly', () => {
            const instance = getWrapper().instance();
            const returnDate = instance.getTime(false, mockEvent.start_time);
            expect(returnDate).toEqual(startTime);
            const returnDateTime = instance.getTime(true, mockEvent.start_time);
            expect(returnDateTime).toEqual(moment(mockEvent.start_time).format('DD.M.YYYY HH:mm'));
        })
    });

    test('renders with default props, all false', () => {
        const element = getWrapper();
        expect(element.find('td.date-time')).toHaveLength(1);
        expect(element.find('span')).toHaveLength(0);
    });

    describe('start and/or end cell', () => {


        test('renders correct span element when start: true', () => {
            const element = getWrapper({start: true});
            expect(element.find('span')).toHaveLength(1);
            expect(element.find('span').text()).toEqual(startTime);
        });
        test('renders correct span element when end: true', () => {
            const element = getWrapper({end: true});
            expect(element.find('span')).toHaveLength(1);
            expect(element.find('span').text()).toEqual(endTime);
        });

        test('renders correct span elements when both are true', () => {
            const element = getWrapper({start: true, end: true});
            const spanElements = element.find('span');
            expect(spanElements).toHaveLength(2);
            expect(spanElements.first().text()).toEqual(startTime);
            // when startTime: true, endTime is formatted like ' - 31.2.2020'
            expect(spanElements.last().text()).toEqual(' - ' + endTime);
        });
    });

    describe('lastModified/datePublished', () => {
        const modifiedTime = moment(mockEvent.last_modified_time).format('DD.M.YYYY HH:mm');
        const publishedTime = moment(mockEvent.date_published).format('DD.M.YYYY HH:mm');

        test('renders correct span when lastModified', () => {
            const element = getWrapper({lastModified: true, time: true});
            expect(element.find('span').text()).toEqual(modifiedTime);
        });
        test('renders correct span when datePublished', () => {
            const element = getWrapper({datePublished: true, time: true});
            expect(element.find('span').text()).toEqual(publishedTime);
        });
    });
});
