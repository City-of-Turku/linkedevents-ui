import React from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';

class PublisherCell extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Returns object containing event creator name and email
     * @returns {{creator: null | string, email: null | string}}
     */
    getEventCreator() {
        const {createdBy} = this.props;
        let obj = {creator: null, email: null};
        if (!isNil(createdBy)) {
            const searchKey = ' - ';
            const splitCreator = createdBy.split(searchKey);
            obj = {
                creator: splitCreator[0] += searchKey,
                email: splitCreator[1],
            };
        }
        return obj;
    }

    /**
     * Returns <a> element to send email to event creator
     * @param {string} emailAddress
     * @param {string} eventName
     * @returns {*}
     */
    getEmail(emailAddress, eventName = '') {
        return (
            <a href={`mailto:${emailAddress}?subject=Tapahtumailmoituksesi ${eventName} vaatii toimenpiteitä`}>
                {emailAddress}
            </a>
        )
    }

    render() {
        const {
            publisher,
            eventName,
        } = this.props;

        const event = this.getEventCreator();

        return (
            <td className='publisher-cell'>
                <span>
                    {publisher}
                    {event.creator && event.email &&
                    <React.Fragment>
                        <br />
                        <small>
                            {event.creator}
                            {this.getEmail(event.email, eventName)}
                        </small>
                    </React.Fragment>
                    }
                </span>
            </td>
        );
    }
}

PublisherCell.propTypes = {
    publisher: PropTypes.string,
    createdBy: PropTypes.string,
    eventName: PropTypes.string,
};

export default PublisherCell
