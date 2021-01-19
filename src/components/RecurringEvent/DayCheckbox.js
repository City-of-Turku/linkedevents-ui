import PropTypes from 'prop-types';
import React from 'react';
import HelCheckbox from 'src/components/HelFormFields/HelCheckbox.js';
import {FormattedMessage} from 'react-intl';

const DayCheckbox = (props) => {
    const {day, onChange, defaultChecked} = props;

    const changePasser = (event, value) => {
        onChange(day, value);
    };

    return (
        <div className='col-xs-12 col-md-6'>
            <HelCheckbox
                fieldID={day}
                className='recurring-day'
                onChange={changePasser}
                defaultChecked={defaultChecked}
                label={<FormattedMessage id={day} />}
            />
        </div>
    );
};

DayCheckbox.propTypes = {
    day: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    defaultChecked: PropTypes.bool,
    id: PropTypes.string,
    fieldID: PropTypes.string,
};

export default DayCheckbox;
