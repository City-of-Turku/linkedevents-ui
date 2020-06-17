import React from 'react';
import PublisherCell from '../PublisherCell';
import {shallow} from 'enzyme';

const defaultProps = {
    publisher: 'Publisher Organization',
    createdBy: 'Erkki Esimerkki - erkki.e@esimerkki.fi',
    eventName: 'Exemplary Event Name',
};



describe('PublisherCell', () => {
    function getWrapper(props) {
        return shallow(<PublisherCell {...defaultProps} {...props}/>)
    }

    describe('methods', () => {

        describe('getEventCreator', () => {
            test('when createdBy exists', () => {
                const instance = getWrapper().instance();
                const returnResult = instance.getEventCreator();
                expect(returnResult.creator).toEqual('Erkki Esimerkki - ');
                expect(returnResult.email).toEqual('erkki.e@esimerkki.fi');
            });
            test('when createdBy doesnt exist', () => {
                const instance = getWrapper({createdBy: null}).instance();
                const returnResult = instance.getEventCreator();
                expect(returnResult.creator).toBe(null);
                expect(returnResult.email).toBe(null);
            });
        });

        describe('getEmail', () => {
            test('work correctly', () => {
                const instance = getWrapper().instance();
                const returnResult = instance.getEmail('erkki.e@esimerkki.fi',defaultProps.eventName);
                expect(returnResult).toBeDefined();
            });
        });
    });
    describe('renders', () => {
        function mockCreator() {
            const searchKey = ' - ';
            const splitCreator = defaultProps.createdBy.split(searchKey);

            return {creator: splitCreator[0] += searchKey, email: splitCreator[1]}
        }
        test('correctly based on props', () => {
            const element = getWrapper().find('span');
            const mockCreate = mockCreator();
            const expectedResult = `${defaultProps.publisher}${mockCreate.creator}${mockCreate.email}`;
            expect(element.text()).toEqual(expectedResult);
        });
    });
});
