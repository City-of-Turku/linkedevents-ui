import './HelLabeledCheckboxGroup.scss'

import PropTypes from 'prop-types';
import React, {useRef, Fragment} from 'react'
import {connect} from 'react-redux'
import {setData as setDataAction} from '../../actions/editor'
import ValidationNotification from '../ValidationNotification'
import classNames from 'classnames';

const handleChange = (refs, {options, name, customOnChangeHandler, setDirtyState, setData}) => {
    const checkedOptions = options
        .filter((option, index) => refs[`checkRef${index}`].checked)
        .map(checkedOption => checkedOption.value)

    // let the custom handler handle the change if given
    if (typeof customOnChangeHandler === 'function') {
        customOnChangeHandler(checkedOptions)
        // otherwise set data
    } else {
        if (name) {
            setData({[name]: checkedOptions})
        }
    }

    if (setDirtyState) {
        setDirtyState()
    }
}

const HelLabeledCheckboxGroup = (props) => {
    const {options, name, selectedValues, itemClassName, groupLabel, validationErrors} = props
    const refs = useRef({}).current;
    const labelRef = useRef(null);
    const checkedOptions = selectedValues.map(item => {
        return typeof item === 'object' && Object.keys(item).includes('value')
            ? item.value
            : item
    })

    return (
        <Fragment>
            <fieldset className="col-sm-6 checkbox-group">
                <h3>
                    <legend ref={labelRef}>
                        {groupLabel}
                    </legend>
                </h3>
                <div className={classNames(('row'), {'validation': validationErrors})}>
                    {options.map((item, index) => {
                        const checked = checkedOptions.includes(item.value)

                        return (
                            <div key={`hel-checkbox-${index}`} className={(itemClassName) + (' custom-control custom-checkbox')} >
                                {validationErrors &&
                                <div className='validation-notification' />
                                }
                                <input
                                    aria-label={item.label}
                                    className='custom-control-input checkboxes'
                                    type='checkbox'
                                    value={item.value}
                                    name={`${name}.${item.value}`}
                                    ref={ref => refs[`checkRef${index}`] = ref}
                                    checked={checked}
                                    onChange={() => handleChange(refs, props)}
                                    id={item.label}
                                />
                                <label htmlFor={item.label} className='custom-control-label'>{item.label}</label>
                            </div>
                        )
                    })}
                </div>
                <ValidationNotification
                    className='validation-checkboxes' 
                    anchor={labelRef.current}
                    validationErrors={validationErrors}
                />
            </fieldset>
        </Fragment>
    )
}

HelLabeledCheckboxGroup.defaultProps = {
    selectedValues: [],
}

HelLabeledCheckboxGroup.propTypes = {
    name: PropTypes.string,
    customOnChangeHandler: PropTypes.func,
    setData: PropTypes.func,
    setDirtyState: PropTypes.func,
    selectedValues: PropTypes.array,
    options: PropTypes.array,
    itemClassName: PropTypes.string,
    groupLabel: PropTypes.object,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})

export default connect(null, mapDispatchToProps)(HelLabeledCheckboxGroup)
