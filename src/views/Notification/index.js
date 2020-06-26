import './index.scss';
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'

import {FormattedMessage} from 'react-intl'


import {Jumbotron, Button, Label, Alert, Card} from 'reactstrap';

import {clearFlashMsg as clearFlashMsgAction} from 'src/actions/app.js'

class Notifications extends React.Component {

    shouldComponentUpdate(nextProps) {
        return !_.isEqual(nextProps, this.props)
    }

    render() {
        const {flashMsg, clearFlashMsg} = this.props
        let flashMsgSpan = ('')
        let isSticky =  flashMsg && flashMsg.sticky

        if(flashMsg && flashMsg.data.response && flashMsg.data.response.status == 400) {
            flashMsgSpan = _.values(_.omit(flashMsg.data, ['apiErrorMsg', 'response'])).join(' ')
            isSticky = true
        }
        else if(flashMsg && flashMsg.msg && flashMsg.msg.length) {
            flashMsgSpan = (<FormattedMessage id={flashMsg.msg} />)
        }

        let duration = isSticky ? null : 7000
        let closeFn = isSticky ? function() {} : () => clearFlashMsg()

        let actionLabel
        if (flashMsg && flashMsg.action) {
            if (flashMsg.action.label) {
                actionLabel = flashMsg.action.label
            } else if (flashMsg.action.labelId) {
                actionLabel = <FormattedMessage id={flashMsg.action.labelId}/>
            }
        }

        let actionFn = flashMsg && flashMsg.action && flashMsg.action.fn

        let actionButton = null
        if (actionLabel && actionFn) {
            actionButton = <Button key="snackActionButton" onClick={actionFn}>{actionLabel}</Button>
        }

        return (
            <React.Fragment>
                { flashMsgSpan &&
            <div className='notification'
                open={(!!flashMsg)}
                autohideduration={duration}
                onClose={closeFn}
            >
                <h6 className="text-center" >{flashMsgSpan}{[actionButton]}</h6>
            </div>
                }
            </React.Fragment>
        )
    }
}

Notifications.propTypes = {
    flashMsg: PropTypes.object,
    clearFlashMsg: PropTypes.func,
}

const mapDisPatchToProps = (dispatch) => ({
    clearFlashMsg: () => dispatch(clearFlashMsgAction()),
}) 
const mapStateToProps = () => ({})
// TODO: if leave null, react-intl not refresh. Replace this with better React context
export default connect(mapStateToProps, mapDisPatchToProps)(Notifications)
