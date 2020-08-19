import {HelLabeledCheckboxGroup, HelSelect} from '../index'
import {FormattedMessage} from 'react-intl'
import SelectedKeywords from '../../SelectedKeywords/SelectedKeywords'
import React, {useEffect, useState} from 'react'
import {SideField} from '../../FormFields'
import {get, isNil, uniqBy} from 'lodash'
import {mapKeywordSetToForm} from '../../../utils/apiDataMapping'
import {setData as setDataAction} from '../../../actions/editor'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {CopyToClipboard} from 'react-copy-to-clipboard'

const handleKeywordChange = (checkedOptions, keywords, mainCategoryOptions, setData) => {
    if (isNil(checkedOptions)) {
        return
    }

    let updatedKeywords
    if (Array.isArray(checkedOptions)) {
        const mainCategoryValues = mainCategoryOptions.map(item => item.value)
        const mappedMainCategoryKeywords = mainCategoryOptions.filter(item => checkedOptions.includes(item.value))
        const nonMainCategoryKeywords = keywords.filter(item => !mainCategoryValues.includes(item.value))

        updatedKeywords = uniqBy([...mappedMainCategoryKeywords, ...nonMainCategoryKeywords], 'value')
    } else {
        updatedKeywords = uniqBy([...keywords, checkedOptions], 'value')
    }

    setData({keywords: updatedKeywords})
}

const handleKeywordDelete = (deletedItem, keywords, setData) => {
    const updatedSelectedKeywords = keywords
        .filter(item => item.value !== deletedItem.value)

    setData({keywords: updatedSelectedKeywords})
}

const getKeywordIds = (keywords) => keywords
    .filter(item => item)
    .map(item => {
        const value = item.value
        const searchKey = 'keyword/'
        const startIndex = value.indexOf(searchKey) + searchKey.length
        const endIndex = value.length - 1

        return value.substring(startIndex, endIndex)
    })
    .join()

const HelKeywordSelector = ({intl, editor, setDirtyState, setData, currentLocale}) => {
    const [isRemoteEvent, toggleIsRemoteEvent] = useState(false);
    const {values, keywordSets, validationErrors} = editor
    let keywords = get(values, 'keywords', [])
    const mainCategoryOptions = mapKeywordSetToForm(keywordSets, 'turku:topics', currentLocale)
    const parsedMainCategoryOptions = mainCategoryOptions.map(item => ({label: item.label, value: item.value}))
    const remoteParticipationKeyword = mainCategoryOptions.find(keyword => keyword['value'].includes('yso:p26626'))

    /**
     * if location is now virtual:public, push remoteParticipationKeyword onto keywords array and set isRemoteEvent to true.
     */
    if (remoteParticipationKeyword
        && !isRemoteEvent
        && values['location']
        && values['location']['id'] === 'virtual:public'
        && !keywords.find(keyword => keyword['value'].includes('yso:p26626'))) {
        keywords.push(remoteParticipationKeyword) && toggleIsRemoteEvent(true)
    }

    /**
     * if location was previously virtual and now either event.location doesnt exist or the location.id is not virtual:public
     * -> some other location was selected or location was removed
     */
    if (remoteParticipationKeyword && isRemoteEvent && (!values['location'] || values['location']['id'] !== 'virtual:public')) {
        toggleIsRemoteEvent(false)
    }

    /**
     * All values in keywords are set as checked, remoteParticipationKeyword is pushed to the array before this runs. see above.
     */
    const handleRemoteKeywordChange = () => {
        if (remoteParticipationKeyword && values['location'] && values['location']['id'] === 'virtual:public') {
            handleKeywordChange(keywords.map(key => key.value), keywords, mainCategoryOptions, setData)
        }
    }
    /**
     * handleRemoteKeywordChange is called if 'isRemoteEvent' changes.
     */
    useEffect(() => {
        handleRemoteKeywordChange(isRemoteEvent)
    },[isRemoteEvent])


    return (
        <React.Fragment>
            <SideField>
                <p className="tip">
                    <FormattedMessage id="editor-tip-hel-main-category"/>
                </p>
            </SideField>
            <HelLabeledCheckboxGroup
                groupLabel={<FormattedMessage id="main-categories"/>}
                selectedValues={keywords}
                name="keywords"
                validationErrors={validationErrors['keywords']}
                itemClassName="col-md-12 col-lg-6"
                options={parsedMainCategoryOptions}
                setDirtyState={setDirtyState}
                customOnChangeHandler={(checkedOptions) => {
                    handleKeywordChange(checkedOptions, keywords, mainCategoryOptions, setData)
                }}
                currentLocale={currentLocale}
            />
            <SideField>
                <p className="tip">
                    <FormattedMessage id="editor-tip-keywords"/>
                </p>
            </SideField>
            <div className="col-sm-6 hel-select">
                <HelSelect
                    legend={intl.formatMessage({id: 'event-keywords'})}
                    name="keywords"
                    resource="keyword"
                    setDirtyState={setDirtyState}
                    customOnChangeHandler={(selectedOption) =>
                        handleKeywordChange(selectedOption, keywords, mainCategoryOptions, setData)
                    }
                    currentLocale={currentLocale}
                />
                <CopyToClipboard text={values['keywords'] ? getKeywordIds(keywords) : ''}>
                    <button type='button' className="clipboard-copy-button btn btn-default" aria-label={intl.formatMessage({id: 'copy-keyword-to-clipboard'})}>
                        <span className="glyphicon glyphicon-duplicate" aria-hidden="true"></span>
                        <p hidden>duplicate</p>
                    </button>
                </CopyToClipboard>
                <SelectedKeywords
                    selectedKeywords={keywords}
                    onDelete={(deletedItem) => handleKeywordDelete(deletedItem, keywords, setData)}
                    locale={currentLocale}
                    intl={intl}
                />
            </div>

        </React.Fragment>
    )
}

HelKeywordSelector.propTypes = {
    intl: PropTypes.object,
    setData: PropTypes.func,
    setDirtyState: PropTypes.func,
    editor: PropTypes.object,
    currentLocale: PropTypes.string,
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})

export default connect(null, mapDispatchToProps)(HelKeywordSelector)
