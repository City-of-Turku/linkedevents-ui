import './UmbrellaCheckbox.scss'
import PropTypes from 'prop-types'
import React,{Fragment}  from 'react'
//Replaced Material-ui CheckBox for a reactstrap implementation. - Turku
import {Label, Input, UncontrolledTooltip} from 'reactstrap';


const UmbrellaCheckbox = props => {
    const {intl, name, checked, disabled, handleCheck} = props
    const tooltipTitle = intl.formatMessage({id: `event-${name.replace('_', '-')}-tooltip`})

    return (
        <Fragment>
            <div className='UmbrellaCheckbox'>
                <label id={`${name}_label`} className='UmbrellaCheckbox'>
                    <input
                        className='UmbrellaCheckbox'
                        type='checkbox'
                        name={name}
                        onChange={handleCheck}
                        checked={checked}
                        disabled={disabled}
                    />{props.children}
                </label>
            </div>
            {disabled &&
                <UncontrolledTooltip placement="bottom" target={`${name}_label`} innerClassName='tooltip-disabled' hideArrow>
                    {tooltipTitle}
                </UncontrolledTooltip>
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
}

export default UmbrellaCheckbox
