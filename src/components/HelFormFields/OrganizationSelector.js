import './OrganizationSelector.scss'
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import Select from 'react-select';
import {get} from 'lodash';

const OrganizationSelector = ({formType, selectedOption, options, onChange}) => {
    const label = selectedOption.label ? selectedOption.label : ''
   
    return (
        <React.Fragment>
            <label className='event-publiser' tabIndex='0' htmlFor='event-publiser'>{<FormattedMessage id='event-publisher' />}</label>
            <input type='hidden' id='event-publiser'/>
            {formType === 'update' ? (
                <input
                    tabIndex='0'
                    className='event-publiser-input'
                    id='event-publiser'
                    type='disabled'
                    value={label}
                    aria-label={label}
                    read-only="true"
                />
            ) : options.length > 1 ? (
                <React.Fragment>
                    <Select
                        tabIndex='0'
                        isClearable={false}
                        defaultValue={options[0]}
                        onChange={onChange}
                        aria-label={label}
                        options={options}>
                        <options value={selectedOption} aria-label={label}>{options[0]}</options> 
                    </Select>
                </React.Fragment>
            ) : (
                <input
                    read-only="true"
                    aria-label={label}
                    tabIndex='0'
                    className='event-publiser-input'
                    id='event-publiser'
                    type='disabled'
                    onChange={onChange}
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
    intl: PropTypes.object,
   
}
export default OrganizationSelector;
