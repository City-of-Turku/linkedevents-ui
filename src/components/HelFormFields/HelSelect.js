import './HelSelect.scss'

import React, {Fragment, useRef} from 'react'
import PropTypes from 'prop-types';
import AsyncSelect from 'react-select/async'
import {createFilter} from 'react-select'
import {setData as setDataAction} from '../../actions/editor'
import {connect} from 'react-redux'
import {get, isNil} from 'lodash'
import ValidationPopover from '../ValidationPopover'
import client from '../../api/client'
import {injectIntl} from 'react-intl'
import {HelSelectTheme, HelSelectStyles} from '../../themes/react-select'

const HelSelect = ({
    intl,
    setData,
    isClearable,
    isMultiselect,
    name,
    setDirtyState,
    resource,
    legend,
    selectedValue,
    validationErrors,
    placeholderId,
    customOnChangeHandler,
})  => {
    const labelRef = useRef(null)

    const onChange = (value) => {
        // let the custom handler handle the change if given
        if (typeof customOnChangeHandler === 'function') {
            customOnChangeHandler(value)
        // otherwise set data
        } else {
            if (isNil(value)) {
                setData({[name]: null})
            } else {
                if (name === 'keywords') {
                    setData({[name]: value})
                }
                if (name === 'location') {
                    setData({[name]: {
                        name: {fi: value.label},
                        id: value.value,
                        '@id': value['@id'],
                    }})
                }
            }
        }

        if (setDirtyState) {
            setDirtyState()
        }
    }

    const getKeywordOptions = async (input) => {
        const queryParams = {
            show_all_keywords: 1,
            data_source: 'yso',
            text: input,
        }

        try {
            const response = await client.get(`${resource}`, queryParams)
            const options = response.data.data

            return options.map(item => ({
                value: item['@id'],
                label: item.name.fi,
                n_events: item.n_events,
            }))
        } catch (e) {
            throw Error(e)
        }
    }

    const getLocationOptions = async (input) => {
        const queryParams = {
            show_all_places: 1,
            text: input,
        }

        try {
            const response = await client.get(`${resource}`, queryParams)
            const options = response.data.data

            return options.map(item => {
                let label = get(item, ['name', 'fi'], '')

                if (item.data_source !== 'osoite' && item.street_address) {
                    label = `${label} (${item.street_address.fi})`
                }

                return {
                    label,
                    value: item.id,
                    '@id': `/v1/${resource}/${item.id}/`,
                    id: item.id,
                    n_events: item.n_events,
                }
            })
        } catch (e) {
            throw Error(e)

        }
    }

    const getOptions = async (input) => {
        if (name === 'keywords') {
            return getKeywordOptions(input)
        }
        if (name === 'location') {
            return getLocationOptions(input)
        }
    }

    const getDefaultValue = () => {
        if (!selectedValue || Object.keys(selectedValue).length === 0) {
            return null
        }
        if (name === 'keywords') {
            return selectedValue.map(item => ({label: item.label, value: item.value}))
        }
        if (name === 'location') {
            return ({
                label: selectedValue.name.fi,
                value: selectedValue.id,
            })
        }
    }

    const formatOption = (item) => (
        <React.Fragment>
            {item.label}
            {item && typeof item.n_events === 'number' &&
                <small>
                    <br/>
                    {intl.formatMessage(
                        {id: `format-select-count`},
                        {count: item.n_events}
                    )}
                </small>
            }
        </React.Fragment>
    )

    const filterOptions = (candidate, input) => {
        // no need to filter data returned by the api, text filter might have matched to non-displayed fields
        return true
    }

    return (
        <Fragment>
            <legend ref={labelRef}>
                {legend}
            </legend>
            <AsyncSelect
                isClearable={isClearable}
                isMulti={isMultiselect}
                value={getDefaultValue()}
                loadOptions={getOptions}
                onChange={onChange}
                placeholder={intl.formatMessage({id: placeholderId})}
                loadingMessage={() => intl.formatMessage({id: 'loading'})}
                noOptionsMessage={() => intl.formatMessage({id: 'search-no-results'})}
                filterOption={filterOptions}
                formatOptionLabel={formatOption}
                styles={HelSelectStyles}
                theme={HelSelectTheme}
            />
            <ValidationPopover
                anchor={labelRef.current}
                validationErrors={validationErrors}
            />
        </Fragment>
    )
}

HelSelect.defaultProps = {
    placeholderId: 'select',
    isClearable: true,
    isMultiselect: false,
}

HelSelect.propTypes = {
    intl: PropTypes.object,
    setData: PropTypes.func,
    name: PropTypes.string,
    isClearable: PropTypes.bool,
    isMultiselect: PropTypes.bool,
    setDirtyState: PropTypes.func,
    resource: PropTypes.string,
    legend: PropTypes.string,
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    selectedValue: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    placeholderId: PropTypes.string,
    customOnChangeHandler: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})

export default connect(null, mapDispatchToProps)(injectIntl(HelSelect))
