import './HelVideoFields.scss'

import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl'
import {setData as setDataAction} from 'src/actions/editor'
import {HelTextField} from '../index'
import {SideField} from '../../FormFields'
import {connect} from 'react-redux'
import {IconButton, withStyles} from '@material-ui/core'
import constants from '../../../constants'
import {get, set, isEqual, isEmpty} from 'lodash'
import {Add, Delete} from '@material-ui/icons'
import {Button} from 'reactstrap';

const {VALIDATION_RULES, CHARACTER_LIMIT} = constants

const AddButton = withStyles(theme => ({
    root: {
        marginTop: theme.spacing(2),
    },
}))(Button)

const DeleteButton = withStyles(theme => ({
    root: {
        alignSelf: 'center',
        position: 'absolute',
        left: 0,
        transform: `translateX(calc(-1.2em - ${theme.spacing(3)}px))`,
        '& svg': {
            height: '1.2em',
            width: '1.2em',
        },
    },
}))(IconButton)

/**
 * Handle blur
 * @param state
 * @param setData
 * @param setDirtyState
 */
const handleBlur = (state, setData, setDirtyState) => {
    setData({videos: state})
    setDirtyState()
}

/**
 * Handle add
 * @param setState
 */
const handleAdd = (setState) =>
    setState(state => ([
        ...state,
        {
            name: '',
            url: '',
            alt_text: '',
        },
    ]))

/**
 * Handle delete
 * @param index
 * @param state
 * @param setData
 */
const handleDelete = (index, state, setData) =>
    setData({videos: state.filter((item, itemIndex) => itemIndex !== index)})

/**
 * Returns the validation props for the text field based on given key
 * @param key
 */
const getValidationProps = (key) => {
    if (key === 'url') {
        return {
            validations: [VALIDATION_RULES.IS_URL],
        }
    }
    if (key === 'name') {
        return {
            maxLength: CHARACTER_LIMIT.SHORT_STRING,
            validations: [VALIDATION_RULES.SHORT_STRING],
        }
    }
    if (key === 'alt_text') {
        return {
            maxLength: CHARACTER_LIMIT.MEDIUM_STRING,
            validations: [VALIDATION_RULES.MEDIUM_STRING],
        }
    }
}

const HelVideoFields = ({
    defaultValues,
    setData,
    validationErrors,
    setDirtyState = () => {},
}) => {
    const [state, setState] = useState([{
        name: '',
        url: '',
        alt_text: '',
    }])
    useEffect(() => {
        if (defaultValues && defaultValues.length > 0 && !isEqual(defaultValues, state)) {
            setState(defaultValues)
        }
    }, [defaultValues])

    return (
        <div className="row event-videos">
            <div className="col-xs-12 col-sm-6">
                {state.map((item, index) => (
                    <div
                        key={`video-field-${index}`}
                        className={`event-videos--item-container ${state.length > 1 ? 'indented' : ''}`}
                    >
                        <div className={'event-videos--item-inputs'}>
                            {Object.entries(item)
                                .map(([key, value]) => {
                                    const required = !Object.values(item).every(isEmpty)

                                    return (
                                        <HelTextField
                                            key={`${key}-video-field`}
                                            required={required}
                                            defaultValue={value}
                                            label={<FormattedMessage id={`event-video-${key}`}/>}
                                            validationErrors={get(validationErrors, ['videos', index, key], {})}
                                            onChange={e => setState(state => set(state, [index, key], e.target.value))}
                                            onBlur={() => handleBlur(state, setData, setDirtyState)}
                                            {...getValidationProps(key)}
                                        />
                                    )
                                })}
                        </div>
                        {state.length > 1 &&
                        <DeleteButton
                            color="secondary"
                            onClick={() => handleDelete(index, state, setData)}
                        >
                            <Delete/>
                        </DeleteButton>
                        }
                    </div>
                ))}
                {/*
                TODO: Uncomment the add button to support adding multiple video fields
                <AddButton
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<Add/>}
                    onClick={() => handleAdd(setState)}
                >
                    <FormattedMessage id="event-video-add"/>
                </AddButton>
                */}
            </div>
            <SideField>
                <div className="tip">
                    <p><FormattedMessage id="editor-tip-video"/></p>
                    <p><FormattedMessage id="editor-tip-video-fields"/></p>
                </div>
            </SideField>
        </div>
    )
}

HelVideoFields.propTypes = {
    setData: PropTypes.func,
    defaultValues: PropTypes.array,
    validationErrors: PropTypes.object,
    setDirtyState: PropTypes.func,
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})

export default connect(mapStateToProps, mapDispatchToProps)(HelVideoFields)
