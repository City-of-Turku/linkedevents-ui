require('./moderation.scss')
import React from 'react'
import PropTypes from 'prop-types'
import {Button} from 'reactstrap';
import {Helmet} from 'react-helmet';

import {FormattedMessage, injectIntl} from 'react-intl'
import EventTable from '../../components/EventTable/EventTable'
import {connect} from 'react-redux'
import {isNull, zipObject, uniq, set} from 'lodash'
import constants from '../../constants'
import {
    appendEventDataWithSubEvents,
    EventQueryParams,
    fetchEvents,
    getEventDataFromIds,
    getEventsWithSubEvents,
    getSuperEventId,
} from '../../utils/events'
import {getSelectedRows, getSortColumnName, getSortDirection} from '../../utils/table'
import showConfirmationModal from '../../utils/confirm'
import {confirmAction, setFlashMsg as setFlashMsgAction} from '../../actions/app'
import {hasOrganizationWithRegularUsers} from '../../utils/user'
import {push} from 'connected-react-router'

const {TABLE_DATA_SHAPE, PUBLICATION_STATUS} = constants

export class Moderation extends React.Component {

    state = {
        draftData: {
            events: [],
            count: null,
            paginationPage: 0,
            pageSize: 10,
            fetchComplete: true,
            sortBy: 'last_modified_time',
            sortDirection: 'desc',
            tableColumns: ['checkbox', 'name', 'publisher', 'event_time', 'last_modified_time', 'validation'],
            selectedRows: [],
            invalidRows: [],
        },
        publishedData: {
            events: [],
            count: null,
            paginationPage: 0,
            pageSize: 10,
            fetchComplete: true,
            sortBy: 'date_published',
            sortDirection: 'desc',
            tableColumns: ['name', 'publisher', 'event_time', 'date_published'],
        },
    }

    componentDidMount() {
        const {user} = this.props

        if (!isNull(user) && hasOrganizationWithRegularUsers(user)) {
            this.fetchTableData(['draft', 'published'])
        }
    }

    componentDidUpdate(prevProps) {
        const {user, routerPush} = this.props
        const oldUser = prevProps.user

        // redirect to home if user logged out
        if (isNull(user) && oldUser !== user) {
            routerPush('/')
        }
        // fetch data if user logged in
        if (isNull(oldUser) && user && hasOrganizationWithRegularUsers(user)) {
            this.fetchTableData(['draft', 'published'])
        }
    }

    /**
     * Fetches the data for the given table(s) and saves it to the state
     * @param tables    The table(s) that data should be fetched for
     */
    fetchTableData = async (tables) => {
        // promises containing the table data
        const fetchedData = tables.map(table => {
            const queryParams = this.getDefaultEventQueryParams(table)

            return fetchEvents(queryParams)
        })

        this.setLoading(false, tables)

        try {
            const values = await Promise.all(fetchedData)
            const tableKeys = tables.map(table => `${table}Data`)
            // map fetched data to the tables
            const tableData = zipObject(tableKeys, values)

            this.setState(state => Object.keys(tableData)
                .reduce((acc, key) => set(acc, key, {
                    ...state[key],
                    events: tableData[key].data.data,
                    count: tableData[key].data.meta.count,
                    selectedRows: [],
                }), {}))
        } finally {
            this.setLoading(true, tables)
        }
    }

    /**
     * Handles table row selection
     * @param checked   Whether the row was selected or de-selected
     * @param id        Event ID of the selected row
     * @param table     The table that the row was selected in
     * @param selectAll Whether all rows should be selected
     */
    handleRowSelect = (checked, id, table, selectAll = false) => {
        // set selected rows
        this.setState(state => {
            const tableData = state[`${table}Data`]
            const {invalidRows} = tableData
            const selectedRows = getSelectedRows(tableData, checked, id, table, selectAll, invalidRows)

            return {[`${table}Data`]: {
                ...tableData,
                selectedRows,
            }}
        })
    }

    /**
     * Handles invalid rows
     * @param event Event data
     * @param table The table that the invalid row is in
     */
    handleInvalidRows = (event, table) => {
        const {invalidRows} = this.state[`${table}Data`]
        let eventId = event.id
        const superEventId = getSuperEventId(event)

        if (superEventId) {
            // mark super event as invalid as a sub event has validation errors
            eventId = superEventId
        }

        if (!invalidRows.includes(eventId)) {
            this.setState(state => {
                const tableData = state[`${table}Data`]
                const updatedInvalidRows = uniq([...state[`${table}Data`].invalidRows, eventId])
                // un-select all invalid rows
                const updatedSelectedRows = state[`${table}Data`].selectedRows
                    .filter(id => !updatedInvalidRows.includes(id))

                return {[`${table}Data`]: {
                    ...tableData,
                    invalidRows: updatedInvalidRows,
                    selectedRows: updatedSelectedRows,
                }}
            })
        }
    }

    /**
     * Handles table column sort changes
     * @param columnName    The column that should be sorted
     * @param table         The table that the sorting was changed for
     */
    handleSortChange = async (columnName, table) => {
        const tableData = this.state[`${table}Data`]
        const oldSortBy = tableData.sortBy
        const oldSortDirection = tableData.sortDirection
        const sortBy = getSortColumnName(columnName)
        const sortDirection = getSortDirection(oldSortBy, columnName, oldSortDirection)
        const queryParams = this.getDefaultEventQueryParams(table)
        queryParams.setSort(sortBy, sortDirection)

        this.setLoading(false, [table])

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => {
                const tableData = {...state[`${table}Data`]}

                // reset invalid rows for draft table
                if (table === 'draft') {
                    tableData.invalidRows = []
                }

                return {[`${table}Data`]: {
                    ...tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    sortBy: columnName,
                    sortDirection: sortDirection,
                }}
            })
        } finally {
            this.setLoading(true, [table])
        }
    }

    /**
     * Handles table pagination page changes
     * @param event
     * @param newPage   The new page number
     * @param table     The table that the pagination page was changed for
     */
    handlePageChange = async (event, newPage, table) => {
        const queryParams = this.getDefaultEventQueryParams(table)
        queryParams.page = newPage + 1

        this.setLoading(false, [table])

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => {
                const tableData = {...state[`${table}Data`]}

                // reset invalid rows for draft table
                if (table === 'draft') {
                    tableData.invalidRows = []
                }

                return {[`${table}Data`]: {
                    ...tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: newPage,
                }}
            })
        } finally {
            this.setLoading(true, [table])
        }
    }

    /**
     * Handles table page size changes
     * @param   event   Page size selection event data
     * @param   table   The table that the page size was changed for
     */
    handlePageSizeChange = async (event, table) => {
        const pageSize = event.target.value
        const queryParams = this.getDefaultEventQueryParams(table)
        queryParams.page_size = pageSize

        this.setLoading(false, [table])

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => {
                const tableData = {...state[`${table}Data`]}

                // reset invalid rows for draft table
                if (table === 'draft') {
                    tableData.invalidRows = []
                }

                return {[`${table}Data`]: {
                    ...tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: 0,
                    pageSize: pageSize,
                }}
            })
        } finally {
            this.setLoading(true, [table])
        }
    }

    /**
     * Sets the loading state of the given tables
     * @param fetchComplete Whether the fetch has completed
     * @param tables        Tables for which the loading state should be updated
     */
    setLoading = (fetchComplete, tables) => {
        this.setState(state => tables
            .reduce((acc, table) => set(acc, `${table}Data`, {
                ...state[`${table}Data`],
                fetchComplete,
            }), {}))
    }

    /**
     * Returns the publication status for the given table
     * @param table
     * @returns {string}
     */
    getPublicationStatus = (table) => {
        if (table === 'draft') {
            return PUBLICATION_STATUS.DRAFT
        }
        if (table === 'published') {
            return  PUBLICATION_STATUS.PUBLIC
        }
    }

    /**
     * Return the default query params to use when fetching event data
     * @param table     The table to get the parameters for
     * @returns {EventQueryParams}
     */
    getDefaultEventQueryParams = (table) => {
        const {user: {organizationsWithRegularUsers}} = this.props
        const {pageSize, sortBy, sortDirection} = this.state[`${table}Data`]

        const queryParams = new EventQueryParams()
        queryParams.include = table === 'draft' ? 'keywords,sub_events' : null
        queryParams.admin_user = table === 'draft' ? true : null
        queryParams.super_event = 'none'
        queryParams.publication_status = this.getPublicationStatus(table)
        queryParams.setPublisher(organizationsWithRegularUsers)
        queryParams.page_size = pageSize
        queryParams.setSort(sortBy, sortDirection)

        return queryParams
    }

    /**
     * Returns an action button for the given type
     * @param table     The table to get the data for
     * @param action    Button action
     * @returns {Element}
     */
    getActionButton = (table, action) => {
        const {selectedRows} = this.state[`${table}Data`]
        let buttonColor = 'primary'

        if (action === 'delete') {
            buttonColor = 'secondary'
        }

        return <Button
            key={`${table}-${action}-button`}
            variant="contained"
            color={buttonColor}
            className="draft-actions--button"
            disabled={selectedRows.length === 0}
            onClick={() => this.runConfirmAction(table, action)}
        >
            {selectedRows.length > 1 &&
            <React.Fragment>
                <FormattedMessage id={`${action}-events-multi`}/>
                <span className="draft-actions--button-count">{`(${selectedRows.length})`}</span>
            </React.Fragment>
            }
            {selectedRows.length <= 1 &&
                <FormattedMessage id={`${action}-events`}/>
            }
        </Button>
    }

    /**
     * Opens a confirmation modal and runs the given action
     * @param table     The table to run the action for
     * @param action    Action to run
     */
    runConfirmAction = (table, action) => {
        const {confirm, intl, setFlashMsg} = this.props
        const tableData = this.state[`${table}Data`]
        const {events, selectedRows} = tableData
        const publicationStatus = this.getPublicationStatus(table)
        let eventData = getEventDataFromIds(selectedRows, events)

        // opens the confirm modal
        const doConfirm = (data) => {
            showConfirmationModal(data, action, confirm, intl, publicationStatus)
                .then(() => {
                    // we need to update the data of both tables if we published events
                    action === 'publish'
                        ? this.fetchTableData(['draft', 'published'])
                        : this.fetchTableData([table])
                    // show flash message after running action
                    setFlashMsg(`event-creation-${action}-success`, 'success')
                })
        }

        // get the id's of events that have sub events
        const eventsWithSubEvents = getEventsWithSubEvents(eventData)

        // we need to append sub event data to the event data if we're running actions for recurring / umbrella events
        eventsWithSubEvents.length > 0
            ? appendEventDataWithSubEvents(eventData, eventsWithSubEvents)
                .then((appendedData) => doConfirm(appendedData))
            : doConfirm(eventData)
    }

    render() {
        const {draftData, publishedData} = this.state
        const {user} = this.props
        const {intl} = this.context;
        const draftActionButtons = ['delete', 'publish']
        // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: 'moderation-page'})}`
        const moderationTables = [
            {
                name: 'draft',
                data: draftData,
            },
            {
                name: 'published',
                data: publishedData,
            },
        ]

        return (
            <div className="container">
                <Helmet title={pageTitle}/>
                <h1><FormattedMessage id="moderation-page"/></h1>
                {!user &&
                    <p><FormattedMessage id="login" /> <FormattedMessage id="events-management-prompt" /></p>
                }
                {user && moderationTables.map(table => (
                    <React.Fragment key={`${table.name}-table-fragment`}>
                        <h2><FormattedMessage id={`moderation-page-${table.name}-heading`} /></h2>
                        {table.name === 'published' &&
                            <p><FormattedMessage id="moderation-page-published-description" /></p>
                        }
                        <EventTable
                            tableName={table.name}
                            tableColumns={table.data.tableColumns}
                            events={table.data.events}
                            user={user}
                            fetchComplete={table.data.fetchComplete}
                            count={table.data.count}
                            pageSize={parseInt(table.data.pageSize)}
                            paginationPage={table.data.paginationPage}
                            sortBy={table.data.sortBy}
                            sortDirection={table.data.sortDirection}
                            selectedRows={table.name === 'draft' ? table.data.selectedRows : undefined}
                            invalidRows={table.name === 'draft' ? table.data.invalidRows : undefined}
                            handleRowSelect={this.handleRowSelect}
                            handleInvalidRows={this.handleInvalidRows}
                            handlePageChange={this.handlePageChange}
                            handlePageSizeChange={this.handlePageSizeChange}
                            handleSortChange={this.handleSortChange}
                        />
                        {table.name === 'draft' && table.data.events.length > 0 &&
                            <div className="draft-actions">
                                {draftActionButtons.map(action => this.getActionButton(table.name, action))}
                            </div>
                        }
                    </React.Fragment>
                ))}
            </div>
        )
    }
}

Moderation.propTypes = {
    user: PropTypes.object,
    confirm: PropTypes.func,
    routerPush: PropTypes.func,
    setFlashMsg: PropTypes.func,
    intl: PropTypes.object,
    draftData: TABLE_DATA_SHAPE,
    publishedData: TABLE_DATA_SHAPE,
}

Moderation.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user,
})

const mapDispatchToProps = (dispatch) => ({
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
    routerPush: (url) => dispatch(push(url)),
    setFlashMsg: (id, status) => dispatch(setFlashMsgAction(id, status)),
})

export {Moderation as UnconnectedModeration}
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(Moderation));
