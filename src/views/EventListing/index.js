import './index.scss'
import React from 'react'
import {connect} from 'react-redux'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import {isNull, get} from 'lodash'
import constants from '../../constants'
import {getSortDirection} from '../../utils/table'
import EventTable from '../../components/EventTable/EventTable'
import {getOrganizationMembershipIds} from '../../utils/user'
import userManager from '../../utils/userManager';
import {Helmet} from 'react-helmet';
import {Label, Input} from 'reactstrap';

const {USER_TYPE, TABLE_DATA_SHAPE, PUBLICATION_STATUS} = constants


export class EventListing extends React.Component {

    state = {
        showCreatedByUser: false,
        showContentLanguage: '',
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

    componentDidUpdate(prevProps, prevState) {
        const {user} = this.props
        const oldUser = prevProps.user

        // fetch data if user logged in
        if (isNull(oldUser) && user && !isNull(getOrganizationMembershipIds(user))) {
            this.fetchTableData()
        }
        if (prevState.showContentLanguage !== this.state.showContentLanguage) {
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
        this.setState(state => ({
            showCreatedByUser: showCreatedByUser,
            tableData: {
                ...state.tableData,
                paginationPage: 0,
            }}),
        this.fetchTableData
        )};
        


    /**
     * Toggles whether events based on language should be shown
     * @param event 
     */
    toggleEventLanguages = (event) => {
        const contentLanguage = event.target.value === 'all' ? '' : event.target.value;
        this.setState(state => ({
            showContentLanguage: contentLanguage,
            tableData: {
                ...state.tableData,
                paginationPage: 0,
            },
        }));
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
        const useCreatedBy = userType === USER_TYPE.REGULAR && USER_TYPE.PUBLIC || showCreatedByUser

        const queryParams = new EventQueryParams()
        queryParams.super_event = 'none'
        queryParams.publication_status = this.getPublicationStatus()
        queryParams.setPublisher(publisher)
        queryParams.page_size = pageSize
        queryParams.setSort(sortBy, sortDirection)
        queryParams.show_all = userType === USER_TYPE.REGULAR ? true : null
        queryParams.admin_user = userType === USER_TYPE.ADMIN ? true : null
        queryParams.created_by = useCreatedBy ? 'me' : null
        if (user.userType === 'public') {
            queryParams.created_by = 'me'
        } else {
            queryParams.created_by = useCreatedBy ? 'me' : null
        }
        if (this.state.showContentLanguage) {
            queryParams.language = this.state.showContentLanguage
        }
        return queryParams
    }
    
    handleLoginClick = () => {
        userManager.signinRedirect({
            data: {
                redirectUrl: window.location.pathname,
            },
        });
    };

    render() {
        const {user} = this.props;
        const {intl} = this.context;
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
        // Defined React Helmet title with intl
        const pageTitle = `Linkedevents - ${intl.formatMessage({id: `${appSettings.ui_mode}-management`})}`
        const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
        const isPublicUser = get(user, 'userType') === USER_TYPE.PUBLIC

        if (!user) {
            return (
                <div className="container">
                    <Helmet title={pageTitle}/>
                    {header}
                    <p>
                        <button className='btn-link underline' rel='external' role='link' onClick={this.handleLoginClick}>
                            <FormattedMessage id="login" />
                        </button>
                        <FormattedMessage id="events-management-prompt" /></p>
                </div>);
        }
        return (
            <div className="container">
                <Helmet title={pageTitle} />
                {header}
                {isPublicUser 
                    ?
                    <p>
                        <FormattedMessage id="events-management-description-public-user"/>
                    </p>
                    :
                    <p>
                        {isRegularUser
                            ? <FormattedMessage id="events-management-description-regular-user"/>
                            : <FormattedMessage id="events-management-description"/>
                        }
                    </p>
                }
                {!isRegularUser &&
                <div className='row event-settings'>
                    {!isPublicUser &&
                    <div className='col-sm-6'>
                        <div className='custom-control custom-checkbox user-events-toggle'>
                            <input
                                className='custom-control-input'
                                id='user-events-toggle'
                                type='checkbox'
                                color="primary"
                                onChange={this.toggleUserEvents}
                                checked={showCreatedByUser}
                            />
                            <label className='custom-control-label' htmlFor='user-events-toggle'>
                                {<FormattedMessage id={'user-events-toggle'} />}
                            </label>
                        </div>
                    </div>
                    }
                    <div className='col-sm-6 radios'>
                        <div className='row'>
                            <FormattedMessage id='filter-event-languages'/>
                        </div>
                        <div className='row'>
                            <div className='col-sm-12'>
                                <div className='custom-control custom-radio'>
                                    <input
                                        className='custom-control-input'
                                        id='all'
                                        name='radiogroup'
                                        type='radio'
                                        value='all'
                                        onChange={this.toggleEventLanguages}
                                        defaultChecked
                                    />
                                    <label className='custom-control-label' htmlFor='all'>
                                        <FormattedMessage id='filter-event-all'/>
                                    </label>
                                </div>
                                <div className='custom-control custom-radio'>
                                    <input
                                        className='custom-control-input'
                                        id='fi'
                                        name='radiogroup'
                                        type='radio'
                                        value='fi'
                                        onChange={this.toggleEventLanguages}
                                    />
                                    <label className='custom-control-label' htmlFor='fi'>
                                        <div className='filter-desktop'><FormattedMessage id='filter-event-fi'/></div>
                                        <div className='filter-mobile'><FormattedMessage id='filter-event-fi-mobile'/></div>
                                    </label>
                                </div>
                                <div className='custom-control custom-radio'>
                                    <input
                                        className='custom-control-input'
                                        id='sv'
                                        name='radiogroup'
                                        type='radio'
                                        value='sv'
                                        onChange={this.toggleEventLanguages}
                                    />
                                    <label className='custom-control-label' htmlFor='sv'>
                                        <div className='filter-desktop'><FormattedMessage id='filter-event-sv'/></div>
                                        <div className='filter-mobile'><FormattedMessage id='filter-event-sv-mobile'/></div>
                                    </label>
                                </div>
                                <div className='custom-control custom-radio'>
                                    <input
                                        className='custom-control-input'
                                        id='en'
                                        name='radiogroup'
                                        type='radio'
                                        value='en'
                                        onChange={this.toggleEventLanguages}
                                    />
                                    <label className='custom-control-label' htmlFor='en'>
                                        <div className='filter-desktop'><FormattedMessage id='filter-event-en'/></div>
                                        <div className='filter-mobile'><FormattedMessage id='filter-event-en-mobile'/></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                }
                <EventTable
                    events={events}
                    user={user}
                    fetchComplete={fetchComplete}
                    count={count}
                    pageSize={parseInt(pageSize)}
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
    showCreatedByUser: PropTypes.bool,
    tableData: TABLE_DATA_SHAPE,
}

EventListing.contextTypes = {
    intl: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user,
})

export default connect(mapStateToProps)(EventListing);
