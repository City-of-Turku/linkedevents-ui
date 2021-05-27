import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {getBadge} from 'src/utils/helpers';
import {getEventName} from 'src/utils/events';
import constants from '../../../constants';
import getContentLanguages from 'src/utils/language'
import {Badge} from 'reactstrap';
class NameCell extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * Returns object containing event status
     * @returns {{umbrella: boolean, series: boolean, draft: boolean, cancelled: boolean, postponed: boolean}}
     */
    getEventStatus() {
        const {event, isSuperEvent, superEventType} = this.props;

        return {
            draft: event.publication_status === constants.PUBLICATION_STATUS.DRAFT,
            cancelled: event.event_status === constants.EVENT_STATUS.CANCELLED,
            postponed: event.event_status === constants.EVENT_STATUS.POSTPONED,
            umbrella: isSuperEvent  && superEventType === constants.SUPER_EVENT_TYPE_UMBRELLA,
            series: isSuperEvent && superEventType === constants.SUPER_EVENT_TYPE_RECURRING,
        };
    }

    render() {
        const {
            event,
            nestLevel,
            isSuperEvent,
            hasSubEvents,
            showSubEvents,
            toggleSubEvent,
        } = this.props;
        const locale = this.context.intl.locale;
        const eventStatus = this.getEventStatus();
        const name = getEventName(event, locale);
        
        const inLanguages = getContentLanguages(event);
        const eventLanguages = inLanguages.map((in_languages, index) => {
            return(
                <Badge className='languageBadge' role='img' aria-label={this.context.intl.formatMessage({id: `language-label.${in_languages}`})} key={index}>
                    {in_languages}
                </Badge>)});

        const indentationStyle = {
            paddingLeft: `${nestLevel * 24}px`,
            fontWeight: nestLevel === 1 && isSuperEvent ? 'bold' : 'normal',
        };

        return (
            <td style={indentationStyle}>
                <div className='nameCell'>
                    {isSuperEvent && hasSubEvents &&
                    <button
                        aria-label={this.context.intl.formatMessage({id:`eventable-expand`})}
                        className='sub-event-toggle tag-space'
                        onClick={toggleSubEvent}
                    >
                        {showSubEvents ?
                            <span className='glyphicon glyphicon-chevron-down' />
                            :
                            <span className='glyphicon glyphicon-chevron-right' />
                        }
                    </button>
                    }
                    {eventStatus.postponed && getBadge('postponed')}
                    {eventStatus.cancelled && getBadge('cancelled')}
                    {eventStatus.draft && getBadge('draft')}
                    {eventStatus.umbrella && getBadge('umbrella')}
                    {eventStatus.series && getBadge('series')}
                    {eventLanguages}
                    <Link to={`/event/${event.id}`}>{name}</Link>
                </div>
            </td>
        );
    }
}

NameCell.propTypes = {
    event: PropTypes.object,
    nestLevel: PropTypes.number,
    isSuperEvent: PropTypes.bool,
    superEventType: PropTypes.oneOf([
        constants.SUPER_EVENT_TYPE_RECURRING,
        constants.SUPER_EVENT_TYPE_UMBRELLA,
    ]),
    hasSubEvents: PropTypes.bool,
    showSubEvents: PropTypes.bool,
    toggleSubEvent: PropTypes.func,
};
NameCell.contextTypes = {
    intl: PropTypes.object,
}

export default NameCell;
