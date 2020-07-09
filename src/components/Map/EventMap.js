import React from 'react';
import PropTypes from 'prop-types';
import Leaflet, {LatLng} from 'leaflet';
import {Map, TileLayer, FeatureGroup, Marker} from 'react-leaflet';
import leafletMarkerIcon from '../../../node_modules/leaflet/dist/images/marker-icon.png';
import leafletMarkerRetinaIcon from '../../../node_modules/leaflet/dist/images/marker-icon-2x.png';
import leafletMarkerShadow from '../../../node_modules/leaflet/dist/images/marker-shadow.png';
import localization from '@city-i18n/localization.json';
import urls from '@city-assets/urls.json';


class EventMap extends React.Component {
    constructor(props) {
        super(props);
        this.getCoordinates = this.getCoordinates.bind(this);
        this.updateDimensions = this.updateDimensions.bind(this);

        this.state = {
            width: '100%',
            height: '300px',
        }
    }

    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions)

    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions)
    }



    updateDimensions() {
        this.handleUpdateMapDimensions(this.props.mapContainer)
    }

    /**
     * Updates state values based on mapContainer ref.
     * This determines the height/width of the Map element.
     * @param mapContainer
     */
    handleUpdateMapDimensions = (mapContainer) => {
        if (mapContainer) {
            const {width, height} = mapContainer.getBoundingClientRect();
            if( width > 0 && height > 0) {
                this.setState({width: `${width}px`, height: `${height}px`})
            }
        }
    }

    /**
     * Returns array with a Marker element based on position.coordinates
     * @param {Object} position - Location object of the event
     * @param {string} position.type - marker type ie. Point
     * @param {number[]} position.coordinates - array with coordinates ie [60.451744, 22.266601]
     * @returns {Marker[]}
     */
    getCoordinates(position) {
        const content = [];
        if(position && position.type === 'Point') {
            const latLngs = new LatLng(position.coordinates[1], position.coordinates[0]);
            content.push(
                <Marker
                    position={latLngs}
                    key={Math.random()}
                    icon={new Leaflet.icon({
                        iconUrl: leafletMarkerIcon,
                        shadowUrl: leafletMarkerShadow,
                        iconRetinaUrl: leafletMarkerRetinaIcon,
                        iconSize: [25, 41],
                        iconAnchor: [13, 41],
                    })}
                />
            );

        }
        return content;
    }


    render() {
        const {position} = this.props;
        const content = position ? this.getCoordinates(position) : position;

        return (
            <div className='map-component'>
                {content &&
                    <Map center={localization.mapPosition} style={{...this.state}} zoom={10}>
                        <TileLayer
                            url={urls.rasterMapTiles}
                        />
                        <FeatureGroup
                            ref={(input) => {
                                if (!input) return;
                                const bounds = input.leafletElement.getBounds();
                                if (bounds.isValid()) {
                                    input.contextValue.map.fitBounds(bounds);
                                }
                            }}
                        >
                            <div>{content}</div>
                        </FeatureGroup>
                    </Map>
                }
                {!content &&
                    <p>{this.context.intl.formatMessage({id: 'event-location-map-error-missing-coordinates'})}</p>
                }
            </div>



        )
    }
}

EventMap.defaultProps = {
    position: null,
}

EventMap.contextTypes = {
    intl: PropTypes.object,
}

EventMap.propTypes = {
    position: PropTypes.object,
    mapContainer: PropTypes.any,
}

export default EventMap
