import './UmbrellaRadio.scss'
import PropTypes from 'prop-types'
import React,{Fragment}  from 'react'
import {FormattedMessage} from 'react-intl';


const SelectorRadio = props => {
    const {checked, disabled, handleCheck, value, messageID, name} = props

    return (
        <Fragment>
            <div className='custom-control custom-radio'>
                <input
                    id={`${value}_label`}
                    className='custom-control-input'
                    type='radio'
                    name={name}
                    onChange={handleCheck}
                    checked={checked}
                    value={value}
                    disabled={disabled}
                />
                <label htmlFor={`${value}_label`} className='custom-control-label'>
                    <FormattedMessage id={messageID}/>
                </label>
            </div>
        </Fragment>
    )
}


SelectorRadio.propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    handleCheck: PropTypes.func,
    value: PropTypes.string,
    messageID: PropTypes.string,
    name: PropTypes.string,
}

export default SelectorRadio
