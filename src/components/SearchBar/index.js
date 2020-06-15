import './index.scss';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import {FormattedMessage, injectIntl} from 'react-intl';
import CustomDatePicker from '../CustomFormFields/CustomDatePicker'
import {Button, Form, FormGroup} from 'reactstrap';

const handleKeyPress = (event, startDate, endDate, onFormSubmit, setSearchQuery) => {
    if (event.key === 'Enter') {
        const searchQuery = event.target.value;

        onFormSubmit(searchQuery, startDate, endDate);
        setSearchQuery(searchQuery);
    }
};

const SearchBar = ({intl, onFormSubmit}) => {
    const [startDate, setStartDate] = useState(moment().startOf('day'));
    const [endDate, setEndDate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className='search-bar'>
            <div className='search-bar--dates'>
                <p className='search-bar--label'>
                    <FormattedMessage id='pick-time-range' />
                </p>
                <CustomDatePicker
                    id="startTime"
                    name="startTime"
                    label="search-date-label-start"
                    defaultValue={startDate}
                    onChange={setStartDate}
                    maxDate={endDate ? endDate : undefined}
                    type="date"
                />
                <CustomDatePicker 
                    id="endTime"
                    name="endTime"
                    label="search-date-label-end"
                    defaultValue={endDate}
                    onChange={setEndDate}
                    minDate={startDate ? startDate : undefined}
                    type="date"
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
