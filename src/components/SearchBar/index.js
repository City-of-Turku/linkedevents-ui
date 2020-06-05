import './index.scss';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {FormattedMessage, injectIntl} from 'react-intl';
import HelDatePicker from '../HelFormFields/HelDatePicker';
import {Button, Form, FormGroup} from 'reactstrap';

const handleKeyPress = (event, startDate, endDate, onFormSubmit, setSearchQuery) => {
    if (event.key === 'Enter') {
        const searchQuery = event.target.value;

        onFormSubmit(searchQuery, startDate, endDate);
        setSearchQuery(searchQuery);
    }
};

const SearchBar = ({intl, onFormSubmit}) => {
    const [startDate, setStartDate] = useState(moment());
    const [endDate, setEndDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className='search-bar'>
            <div className='search-bar--dates'>
                <label className='search-bar--label'>
                    <FormattedMessage id='pick-time-range' />
                </label>
                <HelDatePicker
                    name='startDate'
                    placeholder={intl.formatMessage({id: 'search-date-placeholder'})}
                    defaultValue={startDate}
                    onChange={setStartDate}
                    maxDate={endDate ? endDate : undefined}
                />
                <span
                    className='glyphicon glyphicon-minus search-bar--icon'
                    aria-hidden='true'></span>
                <HelDatePicker
                    name='endDate'
                    placeholder={intl.formatMessage({id: 'search-date-placeholder'})}
                    defaultValue={endDate}
                    onChange={setEndDate}
                    minDate={startDate ? startDate : undefined}
                />
            </div>
            <div className='search-bar--input event-input'>
                <Form>
                    <input
                        aria-hidden='true'
                        className='hidden'
                        onInput={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) =>
                            handleKeyPress(e, startDate, endDate, onFormSubmit, setSearchQuery)
                        }
                    />
                    <FormGroup>
                        <label>{intl.formatMessage({id: 'event-name-or-place'})}</label>
                        <input
                            className='event-search-bar'
                            type='text'
                            autoFocus
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) =>
                                handleKeyPress(e, startDate, endDate, onFormSubmit, setSearchQuery)
                            }
                        />
                    </FormGroup>
                </Form>
                <Button
                    disabled={searchQuery.length === 0}
                    variant='contained'
                    color='primary'
                    onClick={() => onFormSubmit(searchQuery, startDate, endDate)}>
                    <FormattedMessage id='search-event-button' />
                </Button>
            </div>
        </div>
    );
};

SearchBar.propTypes = {
    onFormSubmit: PropTypes.func,
    intl: PropTypes.object,
};

export default injectIntl(SearchBar);
