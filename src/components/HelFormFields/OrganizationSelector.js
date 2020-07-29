import './OrganizationSelector.scss'
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {get} from 'lodash';
import {Input} from 'reactstrap'

function renderSelectOptions(options) {
    return(
        options.map((option, index) => {
            return(<option key={index} value={option.value}>{option.label}</option>)
        })
    )
}

const OrganizationSelector = ({formType, selectedOption, options, onChange}) => {
    const label = selectedOption.label ? selectedOption.label : ''

    return (
        <React.Fragment>
            <label className='event-publiser' htmlFor='event-publiser'>{<FormattedMessage id='event-publisher' />}</label>

            {formType === 'update' ? (
                <input
                    className='event-publiser-input'
                    id='event-publiser'
                    aria-disabled={true}
                    value={label}
                    readOnly
                />
            ) : options.length > 1 ? (
                <React.Fragment>
                    <Input
                        className="event-publiser-input"
                        id="event-publiser"
                        name="event-publiser"
                        onChange={onChange}
                        type="select"
                    >
                        {renderSelectOptions(options)}
                    </Input>
                </React.Fragment>
            ) : (
                <input
                    readOnly
                    className='event-publiser-input'
                    id='event-publiser'
                    aria-disabled={true}
                    value={get(options, '[0].label', '')}
                />
            )}
        </React.Fragment>
    );
};

OrganizationSelector.propTypes = {
    options: PropTypes.arrayOf(PropTypes.object),
    formType: PropTypes.oneOf(['update', 'create']),
    selectedOption: PropTypes.object,
    onChange: PropTypes.func,   
}
export default OrganizationSelector;
