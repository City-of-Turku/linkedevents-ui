import React from 'react';
import PropTypes from 'prop-types';
import {getDate, getDateTime} from 'src/utils/helpers';

class DateTimeCell extends React.Component {
    constructor(props) {
        super(props);

        this.getTime = this.getTime.bind(this);
    }

    /**
     * Returns event.start_time as a formatted str
     * @returns {string}
     */
    getStartTime() {
        const {start, event, time} = this.props;
        let startTime;
        if (start && event.start_time) {
            startTime = this.getTime(time, event.start_time);
        }
        return startTime;
    }

    /**
     * Returns event.end_time as a formatted str
     * @returns {string}
     */
    getEndTime() {
        const {end, event, time} = this.props;
        let endTime;
        if(end && event.end_time) {
            endTime = this.getTime(time, event.end_time);
        }
        return endTime;
    }

    /**
     * Returns a formatted date time str
     * @param {boolean} time
     * @param  {date } eventTime
     * @returns {string}
     */
    getTime(time, eventTime) {
        return time ? getDateTime(eventTime) : getDate(eventTime)
    }

    render() {
        const {datePublished, lastModified, event, time} = this.props;
        const startTime = this.getStartTime();
        const endTime = this.getEndTime();

        return (
            <td className='date-time'>
                {startTime &&
                <span>{startTime}</span>
                }
                {endTime &&
                <span>{`${startTime ? ' - ' : ''}${endTime}`}</span>
                }
                {lastModified && event.last_modified_time &&
                <span>
                    {this.getTime(time, event.last_modified_time)}
                </span>
                }
                {datePublished && event.date_published &&
                <span>
                    {this.getTime(time, event.date_published)}
                </span>
                }
            </td>
        );
    }
}

DateTimeCell.propTypes = {
    event: PropTypes.object,
    start: PropTypes.bool,
    end: PropTypes.bool,
    time: PropTypes.bool,
    lastModified: PropTypes.bool,
    datePublished: PropTypes.bool,
};

export default DateTimeCell
