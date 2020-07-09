import React from 'react';
import {shallow} from 'enzyme';
import {IntlProvider} from 'react-intl';
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
import {Map, TileLayer, FeatureGroup, Marker} from 'react-leaflet';
import {LatLng} from 'leaflet';

jest.mock('@city-i18n/localization.json', () => ({
    mapPosition: [60.451744, 22.266601],
}),{virtual: true});

jest.mock('@city-assets/urls.json', () => ({
    rasterMapTiles: 'this is a url to the maptiles',
}),{virtual: true});


import EventMap from './EventMap';

const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();

const defaultProps = {
    position: {
        type: 'Point',
        coordinates: [60.161616, 22.202020],
    },
}

const initialState = {
    width: '100%',
    height: '300px',
};

describe('Map', () => {

    function getWrapper(props) {
        return shallow(<EventMap {...defaultProps} {...props} />, {context: {intl}});
    }
    describe('renders', () => {
        describe('components', () => {
            const wrapper = getWrapper();
            const mapElement = wrapper.find(Map);
            const tileLayerElement = wrapper.find(TileLayer);
            const featureGroupElement = wrapper.find(FeatureGroup);
            const markerElement = wrapper.find(Marker);
            const markerPosition = new LatLng(defaultProps.position.coordinates[1], defaultProps.position.coordinates[0]);

            test('correct amount', () => {
                expect(mapElement).toHaveLength(1);
                expect(tileLayerElement).toHaveLength(1);
                expect(featureGroupElement).toHaveLength(1);
                expect(markerElement).toHaveLength(1);
            });

            test('with correct props', () => {
                expect(mapElement.prop('center')).toEqual([60.451744, 22.266601]);
                expect(mapElement.prop('style')).toEqual(initialState);
                expect(mapElement.prop('zoom')).toBeDefined();
                expect(tileLayerElement.prop('url')).toEqual('this is a url to the maptiles');
                expect(markerElement.prop('position')).toEqual(markerPosition);
            });
        });
        describe('when !content, position = null', () => {
            test('renders error text', () => {
                const wrapper = getWrapper({position: null});
                const mapElement = wrapper.find(Map);
                const errorText = wrapper.find('p');

                expect(mapElement).toHaveLength(0);
                expect(errorText).toHaveLength(1);
                expect(errorText.text()).toBeDefined();
            });
        });
    });
});
