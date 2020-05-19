import './index.scss'

import React from 'react'
import {FormattedMessage} from 'react-intl'
import PropTypes from 'prop-types'
import EventGrid from '../../components/EventGrid'
import SearchBar from '../../components/SearchBar'
import {EventQueryParams, fetchEvents} from '../../utils/events'
//Replaced Material-ui Spinner for a Bootstrap implementation. - Turku
import Spinner from 'react-bootstrap/Spinner'

class SearchPage extends React.Component {

    state = {
        events: [],
        loading: false,
        searchExecuted: false,
    }

    searchEvents = async (searchQuery, startDate, endDate) => {
        if (!searchQuery && (!startDate || !endDate)) {
            return
        }

        this.setState({loading: true})

        const queryParams = new EventQueryParams()
        queryParams.page_size = 100
        queryParams.sort = 'start_time'
        queryParams.nocache = Date.now()
        queryParams.text = searchQuery
        if (startDate) queryParams.start = startDate.format('YYYY-MM-DD')
        if (endDate) queryParams.end = endDate.format('YYYY-MM-DD')

        try {
            const response = await fetchEvents(queryParams)
            this.setState({events: response.data.data, searchExecuted: true})
        } finally {
            this.setState({loading: false})
        }
    }

    getResults = () => {
        const {searchExecuted, events} = this.state

        return searchExecuted && !events.length > 0
            ? <div className="search-no-results"><FormattedMessage id="search-no-results"/></div>
            : <EventGrid events={events} />
    }

    render() {
        const {loading} = this.state

        return (
            <div className="container">
                <h1><FormattedMessage id={`search-${appSettings.ui_mode}`}/></h1>
                <p><FormattedMessage id="search-events-description"/></p>
                <SearchBar onFormSubmit={(query, start, end) => this.searchEvents(query, start, end)}/>
                {loading
                    ? <div className="search-loading-spinner"><Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner> </div>
                    : this.getResults()
                }
            </div>
        )
    }
}

SearchPage.propTypes = {
    events: PropTypes.array,
    loading: PropTypes.bool,
    searchExecuted: PropTypes.bool,
}

export default SearchPage
