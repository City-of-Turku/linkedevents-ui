import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {get, isEmpty, isUndefined} from 'lodash';
import constants from 'src/constants';
import NameCell from './CellTypes/NameCell';
import DateTimeCell from './CellTypes/DateTimeCell';
import PublisherCell from './CellTypes/PublisherCell';
import ValidationCell from './CellTypes/ValidationCell';
import CheckBoxCell from './CellTypes/CheckBoxCell';
import {getFirstMultiLanguageFieldValue} from 'src/utils/helpers';
import {EventQueryParams, fetchEvents} from 'src/utils/events';
import classNames from 'classnames';
import Spinner from 'react-bootstrap/Spinner';

const {USER_TYPE, SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA} = constants

class EventRow extends React.Component {

    state = {
        subEvents: [],
        showSubEvents: false,
        isSubEvent: false,
        isSuperEvent: false,
        superEventType: null,
        isFetching: false,
        rowInvalid: false,
    }

    componentDidMount() {
        const {event} = this.props
        const superEventType = event.super_event_type
        // whether the event is a super event
        const isSuperEvent = superEventType === SUPER_EVENT_TYPE_RECURRING
            || superEventType === SUPER_EVENT_TYPE_UMBRELLA
        // whether the event is a sub event
        const isSubEvent = !isUndefined(get(event, ['super_event', '@id']))

        this.setState({isSubEvent, isSuperEvent, superEventType})
    }

    toggleSubEvent = async () => {
        const {event, user} = this.props
        const {subEvents, showSubEvents, isSuperEvent} = this.state
        const userType = get(user, 'userType')

        if (
            !showSubEvents
            && isSuperEvent
            && isEmpty(subEvents)
        ) {
            this.setState({isFetching: true, showSubEvents: !showSubEvents})

            const queryParams = new EventQueryParams()
            queryParams.super_event = event.id
            queryParams.include = 'keywords'
            queryParams.show_all = userType === USER_TYPE.REGULAR ? true : null
            queryParams.admin_user = userType === USER_TYPE.ADMIN ? true : null

            try {
                const response = await fetchEvents(queryParams)
                this.setState({subEvents: response.data.data})
            } finally {
                this.setState({isFetching: false})
            }
        } else {
            this.setState({showSubEvents: !showSubEvents})
        }
    }

    /**
     * Handles invalid rows
     * @param eventId
     */
    handleInvalidRow = (eventId) => {
        const {event, tableName, handleInvalidRows} = this.props
        const {rowInvalid} = this.state

        if (eventId === event.id && !rowInvalid) {
            handleInvalidRows(event, tableName)
            this.setState({rowInvalid: true})
        }
    }

    getPublisherData = () => {
        const {event, user} = this.props
        const publisherId = get(event, ['publisher'], '')
        const publisher = get(user, ['adminOrganizationData', publisherId, 'name'], '')
        const createdBy = get(event, 'created_by', '')
        const eventName = getFirstMultiLanguageFieldValue(event.name)

        return {publisher, createdBy, eventName}
    }

    render() {
        const {
            event,
            nestLevel,
            tableName,
            tableColumns,
            selectedRows,
            invalidRows,
            handleRowSelect,
            superEventIsChecked,
        } = this.props

        const {
            subEvents,
            showSubEvents,
            isSubEvent,
            isSuperEvent,
            superEventType,
            isFetching,
            rowInvalid,
        } = this.state

        const hasSubEvents = get(event, 'sub_events', []).length > 0
        const shouldShow = showSubEvents && isSuperEvent
        const checked = isSubEvent
            ? superEventIsChecked
            : selectedRows.includes(event.id)
        const disabled = isSubEvent || rowInvalid || invalidRows.includes(event.id)

        return (
            <React.Fragment>
                <tr
                    className={classNames('MuiTableRow-root', {'Mui-selected': checked},{'sub-event-row': isSubEvent} )}
                >
                    {tableColumns.map((type, index) => {
                        if (type === 'checkbox') {
                            return <CheckBoxCell
                                key={`${event.id}-cell-${index}`}
                                checked={checked}
                                disabled={disabled}
                                tableName={tableName}
                                event={event}
                                onChange={handleRowSelect}
                            />

                        }
                        if (type === 'name') {
                            return <NameCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                nestLevel={nestLevel}
                                isSuperEvent={isSuperEvent}
                                superEventType={superEventType}
                                hasSubEvents={hasSubEvents}
                                showSubEvents={showSubEvents}
                                toggleSubEvent={this.toggleSubEvent}
                            />
                        }
                        if (type === 'publisher') {
                            return <PublisherCell
                                key={`${event.id}-cell-${index}`}
                                {...this.getPublisherData()}
                            />
                        }
                        if (type === 'start_time') {
                            return <DateTimeCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                start
                            />
                        }
                        if (type === 'end_time') {
                            return <DateTimeCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                end
                            />
                        }
                        if (type === 'last_modified_time') {
                            return <DateTimeCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                lastModified
                                time
                            />
                        }
                        if (type === 'date_published') {
                            return <DateTimeCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                datePublished
                                time
                            />
                        }
                        if (type === 'event_time') {
                            return <DateTimeCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                start
                                end
                            />
                        }
                        if (type === 'validation') {
                            return <ValidationCell
                                key={`${event.id}-cell-${index}`}
                                event={event}
                                handleInvalidRow={this.handleInvalidRow}
                            />
                        }
                    })}
                </tr>
                {shouldShow && (
                    isFetching
                        ? (
                            <tr className={tableColumns.includes('validation') ? 'loading-row validation' : 'loading-row'}>
                                {tableColumns.reduce((acc, column, index) => {
                                    const tableHasCheckboxColumn = tableColumns.includes('checkbox')
                                    const columnCount = tableColumns.length

                                    // add a placeholder cell with "checkbox" class for tables with a checkbox column
                                    if (column === 'checkbox') {
                                        return [...acc, <td key={`cell-placeholder-${index}`} className="checkbox" />]
                                    }
                                    // add loading spinner
                                    if (tableHasCheckboxColumn && acc.length === 1 || !tableHasCheckboxColumn && acc.length === 0) {
                                        return [...acc, <td key={`cell-placeholder-${index}`}> <Spinner animation="border" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </Spinner></td>]
                                    }
                                    // add empty cells to fill the row
                                    if (tableHasCheckboxColumn &&  index + 1 <= columnCount || !tableHasCheckboxColumn &&  index <= columnCount) {
                                        return [...acc, <td key={`cell-placeholder-${index}`} className="placeholder-cell" />]
                                    }
                                    return acc
                                }, [])}
                            </tr>
                        ) : (
                            <SubEventsTable
                                {...this.props}
                                subEvents={subEvents}
                                superEventIsChecked={checked}
                                // nest level is used to calculate the indentation for each level of recursion
                                nestLevel={nestLevel + 1}
                            />
                        )
                )}
            </React.Fragment>
        )
    }
}

// recursively render sub events of events
const SubEventsTable = props => {
    const {subEvents} = props;

    return (
        <React.Fragment>
            {subEvents.map(event => (
                <EventRow
                    {...props}
                    event={event}
                    key={event.id}
                />
            ))}
        </React.Fragment>
    )
}

SubEventsTable.propTypes = {
    subEvents: PropTypes.array,
    superEventIsChecked: PropTypes.bool,
    event: PropTypes.object,
    nestLevel: PropTypes.number,
}

EventRow.defaultProps = {
    nestLevel: 1,
    selectedRows: [],
    invalidRows: [],
}

EventRow.propTypes = {
    subEvents: PropTypes.array,
    showSubEvents: PropTypes.bool,
    isSubEvent: PropTypes.bool,
    isSuperEvent: PropTypes.bool,
    superEventType: PropTypes.oneOf([
        SUPER_EVENT_TYPE_RECURRING,
        SUPER_EVENT_TYPE_UMBRELLA,
    ]),
    isFetching: PropTypes.bool,
    rowInvalid: PropTypes.bool,
    nestLevel: PropTypes.number,
    event: PropTypes.object,
    tableName: PropTypes.string,
    tableColumns: PropTypes.arrayOf(PropTypes.oneOf(constants.TABLE_COLUMNS)),
    selectedRows: PropTypes.array,
    invalidRows: PropTypes.array,
    handleRowSelect: PropTypes.func,
    handleInvalidRows: PropTypes.func,
    user: PropTypes.object,
    superEventIsChecked: PropTypes.bool,
}

const mapStateToProps = (state) => ({
    user: state.user,
})

export default connect(mapStateToProps)(EventRow)
