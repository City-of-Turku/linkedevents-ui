import {HelLabeledCheckboxGroup, HelSelect} from '../index'
import {FormattedMessage} from 'react-intl'
import SelectedKeywords from '../../SelectedKeywords/SelectedKeywords'
import React from 'react'
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

const HelKeywordSelector = ({intl, editor, setDirtyState, setData}) => {
    const {values, keywordSets, validationErrors} = editor
    const keywords = get(values, 'keywords', [])
    // Changed keywordSets to be compatible with Turku's backend.
    const mainCategoryOptions = mapKeywordSetToForm(keywordSets, 'turku:topics')
    // Internet location automatically implies "remote participation"
    const remoteParticipationKeyword = mainCategoryOptions.find(keyword => keyword['value'].includes('yso:p26626'))
    if (remoteParticipationKeyword
        && values['location']
        // Changed keywordSets to be compatible with Turku's backend.
        && values['location']['id'] == 'turku:internet'
        && !keywords.find(keyword => keyword['value'].includes('yso:p26626'))) {
        keywords.push(remoteParticipationKeyword)
    }

    return (
        <React.Fragment>
            <HelLabeledCheckboxGroup
                groupLabel={<FormattedMessage id="main-categories"/>}
                selectedValues={keywords}
                name="keywords"
                validationErrors={validationErrors['keywords']}
                itemClassName="col-md-12 col-lg-6"
                options={mainCategoryOptions}
                setDirtyState={setDirtyState}
                customOnChangeHandler={(checkedOptions) => handleKeywordChange(checkedOptions, keywords, mainCategoryOptions, setData)}
            />
            <SideField>
                <p className="tip">
                    <FormattedMessage id="editor-tip-hel-main-category"/>
                </p>
            </SideField>
            <div className="col-sm-6 hel-select">
                <HelSelect
                    legend={intl.formatMessage({id: 'event-keywords'})}
                    name="keywords"
                    resource="keyword"
                    setDirtyState={setDirtyState}
                    customOnChangeHandler={(selectedOption) => handleKeywordChange(selectedOption, keywords, mainCategoryOptions, setData)}
                />
                <CopyToClipboard text={values['keywords'] ? getKeywordIds(keywords) : ''}>
                    <button type='button' className="clipboard-copy-button btn btn-default" title={intl.formatMessage({id: 'copy-to-clipboard'})}>
                        <span className="glyphicon glyphicon-duplicate" aria-hidden="true"></span>
                    </button>
                </CopyToClipboard>
                <SelectedKeywords
                    selectedKeywords={keywords}
                    onDelete={(deletedItem) => handleKeywordDelete(deletedItem, keywords, setData)}
                />
            </div>
            <SideField>
                <p className="tip">
                    <FormattedMessage id="editor-tip-keywords"/>
                </p>
            </SideField>
        </React.Fragment>
    )
}

HelKeywordSelector.propTypes = {
    intl: PropTypes.object,
    setData: PropTypes.func,
    setDirtyState: PropTypes.func,
    editor: PropTypes.object,
}

const mapDispatchToProps = (dispatch) => ({
    setData: (value) => dispatch(setDataAction(value)),
})

export default connect(null, mapDispatchToProps)(HelKeywordSelector)
