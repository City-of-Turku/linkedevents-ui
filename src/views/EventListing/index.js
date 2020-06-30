import React from 'react'
import {connect} from 'react-redux'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import {login as loginAction} from 'src/actions/user.js'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import {isNull, get} from 'lodash'
import constants from '../../constants'
import {getSortDirection} from '../../utils/table'
import EventTable from '../../components/EventTable/EventTable'
import {getOrganizationMembershipIds} from '../../utils/user'

import {Label, Input} from 'reactstrap';

const {USER_TYPE, TABLE_DATA_SHAPE, PUBLICATION_STATUS} = constants


export class EventListing extends React.Component {

    state = {
        showCreatedByUser: false,
        tableData: {
            events: [],
            count: null,
            paginationPage: 0,
            pageSize: 25,
            fetchComplete: true,
            sortBy: 'last_modified_time',
            sortDirection: 'desc',
        },
    }

    componentDidMount() {
        const {user} = this.props

        if (!isNull(user) && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchTableData()
        }
    }

    componentDidUpdate(prevProps) {
        const {user} = this.props
        const oldUser = prevProps.user

        // fetch data if user logged in
        if (isNull(oldUser) && user && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchTableData()
        }
    }

    /**
     * Fetches the table data
     */
    fetchTableData = async () => {
        const queryParams = this.getDefaultEventQueryParams()

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Handles table column sort changes
     * @param columnName    The column that should be sorted
     */
    handleSortChange = async (columnName) => {
        const {sortBy, sortDirection} = this.state.tableData
        const updatedSortDirection = getSortDirection(sortBy, columnName, sortDirection)
        const queryParams = this.getDefaultEventQueryParams()
        queryParams.setSort(columnName, updatedSortDirection)

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: 0,
                    sortBy: columnName,
                    sortDirection: updatedSortDirection,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Handles table pagination page changes
     * @param event
     * @param newPage   The new page number
     */
    handlePageChange = async (event, newPage) => {
        const queryParams = this.getDefaultEventQueryParams()
        queryParams.page = newPage + 1

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: newPage,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Handles table page size changes
     * @param   event   Page size selection event data
     */
    handlePageSizeChange = async (event) => {
        const pageSize = event.target.value
        const queryParams = this.getDefaultEventQueryParams()
        queryParams.page_size = pageSize

        this.setLoading(false)

        try {
            const response = await fetchEvents(queryParams)

            this.setState(state => ({
                tableData: {
                    ...state.tableData,
                    events: response.data.data,
                    count: response.data.meta.count,
                    paginationPage: 0,
                    pageSize: pageSize,
                },
            }))
        } finally {
            this.setLoading(true)
        }
    }

    /**
     * Toggles whether only events created by the user should be show
     * @param   event   onChange event
     */
    toggleUserEvents = (event) => {
        const showCreatedByUser = event.target.checked
        this.setState({showCreatedByUser}, this.fetchTableData)
    }

    /**
     * Sets the loading state
     * @param fetchComplete Whether the fetch has completed
     */
    setLoading = (fetchComplete) => {
        this.setState(state => ({
            tableData: {
                ...state.tableData,
                fetchComplete,
            },
        }))
    }

    getPublicationStatus = () => {
        const {user} = this.props

        if (!user.userType) {
            return null
        }
        if (user.userType === USER_TYPE.ADMIN) {
            return PUBLICATION_STATUS.PUBLIC
        }
        if (user.userType === USER_TYPE.REGULAR) {
            return null
        }
    }

    /**
     * Return the default query params to use when fetching event data
     * @returns {EventQueryParams}
     */
    getDefaultEventQueryParams = () => {
        const {user} = this.props
        const {showCreatedByUser, tableData: {sortBy, sortDirection, pageSize}} = this.state
        const userType = get(user, 'userType')
        const publisher = userType === USER_TYPE.ADMIN && !showCreatedByUser
            ? getOrganizationMembershipIds(user)
            : null
        const useCreatedBy = userType === USER_TYPE.REGULAR || showCreatedByUser

        const queryParams = new EventQueryParams()
        queryParams.super_event = 'none'
        queryParams.publication_status = this.getPublicationStatus()
        queryParams.setPublisher(publisher)
        queryParams.page_size = pageSize
        queryParams.setSort(sortBy, sortDirection)
        queryParams.show_all = userType === USER_TYPE.REGULAR ? true : null
        queryParams.admin_user = userType === USER_TYPE.ADMIN ? true : null
        queryParams.created_by = useCreatedBy ? 'me' : null

        return queryParams
    }

    render() {
        const {user} = this.props;
        const {
            showCreatedByUser,
            tableData: {
                events,
                fetchComplete,
                count,
                pageSize,
                paginationPage,
                sortBy,
                sortDirection,
            },
        } = this.state;
        const header = <h1><FormattedMessage id={`${appSettings.ui_mode}-management`}/></h1>
        const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR

        if (!user) {
            return (
                <div className="container">
                    {header}
                    <p>
                        <a style={{cursor: 'pointer'}} onClick={() => this.props.login()}>
                            <FormattedMessage id="login" />
                        </a>
                        {' '}<FormattedMessage id="events-management-prompt" /></p>
                </div>);
        }

        return (
            <div className="container">
                {header}
                <p>
                    {isRegularUser
                        ? <FormattedMessage id="events-management-description-regular-user"/>
                        : <FormattedMessage id="events-management-description"/>
                    }
                </p>
                {!isRegularUser &&
                <div className='user-events-toggle'>
                    <Input
                        id='user-events-toggle'
                        type='checkbox'
                        color="primary"
                        onChange={this.toggleUserEvents}
                        checked={showCreatedByUser}
                    />
                    <Label htmlFor='user-events-toggle'> 
                        {<FormattedMessage id={'user-events-toggle'} />}</Label>
                         
                </div>
                }
                <EventTable
                    events={events}
                    user={user}
                    fetchComplete={fetchComplete}
                    count={count}
                    pageSize={pageSize}
                    paginationPage={paginationPage}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    handlePageChange={this.handlePageChange}
                    handlePageSizeChange={this.handlePageSizeChange}
                    handleSortChange={this.handleSortChange}
                />
            </div>
        )
    }
}

EventListing.propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    showCreatedByUser: PropTypes.bool,
    tableData: TABLE_DATA_SHAPE,
}

const mapStateToProps = (state) => ({
    user: state.user,
})

const mapDispatchToProps = (dispatch) => ({
    login: () => dispatch(loginAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(EventListing);
