import './UmbrellaRadio.scss'
import PropTypes from 'prop-types'
import React,{Fragment}  from 'react'
import {FormattedMessage} from 'react-intl';


const UmbrellaRadio = props => {
    const {checked, disabled, handleCheck, value, messageID} = props

    return (
        <Fragment>
            <div className='custom-control custom-radio'>
                <input
                    id={`${value}_label`}
                    className='custom-control-input'
                    type='radio'
                    name='umbrellaGroup'
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


UmbrellaRadio.propTypes = {
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    handleCheck: PropTypes.func,
    value: PropTypes.string,
    messageID: PropTypes.string,
}

export default UmbrellaRadio
