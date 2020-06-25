import './UmbrellaCheckbox.scss'
import PropTypes from 'prop-types'
import React,{Fragment}  from 'react'
import {Tooltip} from '@material-ui/core'
//Replaced Material-ui CheckBox for a reactstrap implementation. - Turku
import {Label, Input} from 'reactstrap';


const UmbrellaCheckbox = props => {
    const {intl, name, checked, disabled, handleCheck, id} = props
    const tooltipTitle = intl.formatMessage({id: `event-${name.replace('_', '-')}-tooltip`})


    
    const getCheckbox = () => (
     
        <div className='UmbrellaCheckbox'>  
            <label htmlFor={id} className='UmbrellaCheckbox'>
                <input
                    className='UmbrellaCheckbox'
                    id={id}
                    type='checkbox'
                    name={name}
                    onChange={handleCheck}
                    checked={checked}
                    disabled={disabled} 
                />{props.children}
            </label>       
        </div>
    )

    return (
        <Fragment>
            {
                disabled
                    ? <Tooltip title={tooltipTitle}>
                        <span>{getCheckbox()}</span>
                    </Tooltip>
                    : getCheckbox()
            }
        </Fragment>
    )
        
}


UmbrellaCheckbox.propTypes = {
    children: PropTypes.element,
    intl: PropTypes.object,
    name: PropTypes.string,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    handleCheck: PropTypes.func,
    id: PropTypes.string,
}

export default UmbrellaCheckbox
