import './HelCheckbox.scss'

import React from 'react'
import PropTypes from 'prop-types';
import {setData} from '../../actions/editor'
//Replaced Material-ui CheckBox for a reactstrap implementation. - Turku

class HelCheckbox extends React.Component {
    constructor(props) {
        super(props)
       
        this.handleCheck = this.handleCheck.bind(this)
    }
    
    handleCheck (event) {
        let newValue = event.target.checked

        if(this.props.name) {
            let obj = {}
            obj[this.props.name] = newValue
            this.context.dispatch(setData(obj))
        }

        if(typeof this.props.onChange === 'function') {
            this.props.onChange(event, newValue)
        }
    }

    getValidationErrors() {
        return []
    }

    noValidationErrors() {
        return true
    }

    getValue() {
        return this.checkboxRef.value
    }

    render() {
        let {required, label, name, defaultChecked} = this.props
       
        if(required) {
            if(typeof label === 'string') {
                label += ' *'
            }
            if(typeof label === 'object') {
                label = (<span>{label} *</span>)
            }
           
        }
        const {fieldID} = this.props

        return (
            <div className='price-info-checkbox'>
                <label className='price-label' htmlFor={fieldID}>
                    <input
                        className='checkbox'
                        type='checkbox'
                        ref={ref => this.checkboxRef = ref}
                        name={name}
                        onChange={this.handleCheck}
                        checked={defaultChecked}
                        id={fieldID}
                    />{label}
                </label>
            </div>
            
        )
    }
}


HelCheckbox.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
}

HelCheckbox.propTypes = {
    name: PropTypes.string,
    onChange: PropTypes.func,
    required: PropTypes.bool,
    label: PropTypes.object,
    defaultChecked: PropTypes.bool,
    id: PropTypes.string,
    fieldID: PropTypes.string,

}

export default HelCheckbox
