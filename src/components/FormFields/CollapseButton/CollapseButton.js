import React from 'react'
import Button from 'reactstrap/lib/Button'
import classNames from 'classnames';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

/**
 * @param {object} props Component props
 * @prop {string} id element id
 * @prop {object} intl intl object
 * @prop {boolean} isOpen is collapsed element open
 * @prop {boolean} isRequired is controlled collapse section required
 * @prop {string} targetCollapseNameId collapse element's name id
 * @prop {func} toggleHeader onClick toggle function
 * @prop {array} validationErrorList array of errors
 * @returns {JSX.Element}
 */
function CollapseButton({id, intl, isOpen, isRequired, targetCollapseNameId, toggleHeader, validationErrorList}){
    // include error class if any validation error exists
    const showError = (validationError) => !!validationError

    const toggleMessageId = isOpen ? 'editor-headerbutton-collapse' : 'editor-headerbutton-expand'
    const toggleMessage = intl.formatMessage({id: toggleMessageId})
    const targetCollapseName = intl.formatMessage({id: targetCollapseNameId})
    const requiredMessage = isRequired ? ` ${intl.formatMessage({id: 'editor-expand-required'})}` : '' 

    return(
        <Button
            aria-expanded={isOpen}
            aria-label={`${toggleMessage} ${targetCollapseName}${requiredMessage}`}
            className={classNames('headerbutton', {'error': validationErrorList.some(showError)})}
            color='collapse'
            id={id}
            onClick={toggleHeader}
        >
            <FormattedMessage id={targetCollapseNameId}/>
            <span aria-hidden className={isOpen ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}/>
        </Button>
    )
}

CollapseButton.propTypes = {
    id: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
    isOpen: PropTypes.bool.isRequired,
    isRequired: PropTypes.bool,
    targetCollapseNameId: PropTypes.string.isRequired,
    toggleHeader: PropTypes.func.isRequired,
    validationErrorList: PropTypes.array,
}

CollapseButton.defaultProps = {
    isRequired: false,
    validationErrorList: [],
}

export {CollapseButton as CollapseButtonWithoutIntl}
export default injectIntl(CollapseButton)
