import './index.scss';
import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import Popover from 'react-bootstrap/Popover'
import {FormattedMessage} from 'react-intl'
import {getCharacterLimitByRule} from '../../utils/helpers'

// Removed Material-Ui Popper since it's not very customizable through CSS.

const ValidationPopover =  ({
    validationErrors,
    anchor,
    index,
    inModal = false,
}) => {
    let errorMsg = null

    if(validationErrors && validationErrors[0]) {
        let errorText = null
        let textLimit = null
        if (typeof validationErrors[0] === 'object') {
            for (const object in validationErrors[0]) {
                if (validationErrors[0][object].key === index) {
                    errorText = `validation-${validationErrors[0][object].validation}`

                    // check if validation is text limiter
                    textLimit = getCharacterLimitByRule(validationErrors[0][object].validation)
                    if(textLimit) {
                        errorText = `validation-stringLimitReached`
                    }
                }
            }
        } else {
            errorText = `validation-${validationErrors[0]}`
            textLimit = getCharacterLimitByRule(validationErrors[0])
            if(textLimit) {
                errorText = `validation-stringLimitReached`
            }
        }
        if (errorText === null) {
            return (<React.Fragment />)
        }
        errorMsg = (<FormattedMessage className="msg" id={errorText} values={{limit: textLimit}}/>)
    } else {
        return (<React.Fragment />)
    }

    return (
        <Fragment>
            {anchor
                ? <Popover
                    open
                    className={`validation-popper ${inModal ? 'modal-popper' : ''}`}
                    anchor={anchor}>
                    { errorMsg }
                </Popover>
                : <React.Fragment />
            }
        </Fragment>
    )
}

ValidationPopover.propTypes = {
    validationErrors: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    anchor: PropTypes.object,
    index: PropTypes.string,
    placement: PropTypes.string,
    inModal: PropTypes.bool,
}

export default ValidationPopover
