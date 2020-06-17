import React from 'react';
import NameCell from '../NameCell';
import {mockUserEvents} from '__mocks__/mockData';
import {shallow} from 'enzyme';
import {Link} from 'react-router-dom';


const mockEvent = mockUserEvents[0];
mockEvent.id = 'uniqueEventId';

const defaultProps = {
    event: mockEvent,
    nestLevel: 1,
    isSuperEvent: false,
    superEventType: null,
    hasSubEvents: false,
    showSubEvents: false,
    toggleSubEvent: jest.fn(),
}

describe('NameCell', () => {
    function getWrapper(props) {
        return shallow(<NameCell {...defaultProps} {...props}/>)
    }

    describe('methods', () => {
        const mockDraft = {
            publication_status: 'draft',
            event_status: 'EventPostponed',
        };

        test('getEventStatus return obj based on event status', () => {
            const element = getWrapper({event:mockDraft, isSuperEvent: true, superEventType: 'umbrella'});
            const instance = element.instance();
            const returnResult = instance.getEventStatus();
            expect(returnResult.draft).toBe(true);
            expect(returnResult.cancelled).toBe(false);
            expect(returnResult.postponed).toBe(true);
            expect(returnResult.umbrella).toBe(true);
            expect(returnResult.series).toBe(false);

        })
    })

    test('renders cell with no additional event.status', () => {
        const element = getWrapper();
        const linkElement = element.find(Link);
        expect(element).toHaveLength(1);
        expect(linkElement.prop('to')).toEqual(`/event/${mockEvent.id}`);
        expect(linkElement.children().text()).toEqual(mockEvent.name.fi);
    });

    describe('renders SuperEvent that has subEvents', () => {
        test('span with onClick', () => {
            const element = getWrapper({isSuperEvent: true, hasSubEvents: true}).find('span').first();
            expect(element).toHaveLength(1);
            expect(element.prop('onClick')).toEqual(defaultProps.toggleSubEvent);
        });

        test('when showSubEvents: false', () => {
            const element = getWrapper({isSuperEvent: true, hasSubEvents: true});
            const spanElements = element.find('span');
            expect(spanElements).toHaveLength(2);
            expect(spanElements.last().prop('className')).toContain('right');
        });
        test('when showSubEvents: true', () => {
            const element = getWrapper({isSuperEvent: true, hasSubEvents: true, showSubEvents: true});
            const spanElements = element.find('span');
            expect(spanElements).toHaveLength(2);
            expect(spanElements.last().prop('className')).toContain('down');
        });
    });
})
