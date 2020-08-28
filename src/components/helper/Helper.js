import './index.scss';

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {Button, Modal, ModalBody, ModalHeader, Input} from 'reactstrap';
import {FormattedMessage, injectIntl} from 'react-intl';


const DebugReporterModal = ({showModal, close, sendReport,intl}) => {
    const [value, setValue] = useState();
    const getCloseButton = () => {
        return (
            <Button
                className='icon-button'
                type='button'
                aria-label={intl.formatMessage({id: `close`})}
                onClick={() => close()}>
                <span className='glyphicon glyphicon-remove'></span>
            </Button>
        )
    }

    return (
        <div id='debugreporterform'>
            <Modal
                className='debugreporterform'
                size='s'
                role='dialog'
                aria-modal='true'
                isOpen={showModal}
                onClose={close}
            >
                <ModalHeader tag='h1' close={getCloseButton()}>
                    <FormattedMessage id='reportmodal-title'/>
                </ModalHeader>
                <ModalBody>
                    <p>
                        <FormattedMessage id="reportmodal-tooltip"/>
                    </p>
                    <hr aria-hidden />
                    <label htmlFor='reportfield'><FormattedMessage id='reportmodal-field'/></label>
                    <Input
                        id='reportfield'
                        type="textarea"
                        name="text"
                        multiline='true'
                        value={value}
                        style={{margin: 0}}
                        onChange={(event) => setValue(event.target.value)}
                    />
                    <Button onClick={() => sendReport(value)} style={{margin: '1rem 0 0'}}>
                        <FormattedMessage id='reportbutton-send'/>
                    </Button>
                    <hr aria-hidden />
                    <small
                        style={{
                            display: 'block',
                            margin: '0 0 10px',
                        }}>
                        <FormattedMessage id='reportmodal-version'/>
                        <br />
                        {appSettings.commit_hash}
                    </small>
                </ModalBody>
            </Modal>
        </div>
    );
};

DebugReporterModal.propTypes = {
    sendReport: PropTypes.func,
    showModal: PropTypes.bool,
    close: PropTypes.func,
    intl: PropTypes.object.isRequired,
};
export default injectIntl(DebugReporterModal);
/*
//
// DebugHelper moved to Footer
// Hard to use in mobile & has questionable accessibility
//
class DebugHelper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reporting: false,
            showModalTooltip: false,
        };
        this.handleButtonBlur = this.handleButtonBlur.bind(this)
        this.handleButtonFocus = this.handleButtonFocus.bind(this)
        this.showReportForm = this.showReportForm.bind(this);
        this.closeReportForm = this.closeReportForm.bind(this);
        this.serializeState = this.serializeState.bind(this);
    }
    

    showReportForm() {
        this.setState({reporting: true});
    }

    closeReportForm() {
        this.setState({reporting: false});
    }

    serializeState(reportmsg) {
        this.closeReportForm();
        report(window.ARG, reportmsg, appSettings.commit_hash);

        window.setTimeout(() => alert(this.props.intl.formatMessage({id: `reportmodal-sent`})), 100);
    }

    handleButtonFocus(){
        this.setState({showModalTooltip: true});
    }
    handleButtonBlur(){
        this.setState({showModalTooltip: false});
    }

    render() {
        return (
            <div>
                <DebugReporterModal
                    showModal={this.state.reporting}
                    close={this.closeReportForm}
                    sendReport={this.serializeState}
                    intl={this.props.intl}
                />
                <div id='debughelper'>
                    <div id='debughelper_container'>
                        <button className='btn btn-default'
                            onClick={this.showReportForm}
                            onBlur={this.handleButtonBlur}
                            onFocus={this.handleButtonFocus}
                            aria-labelledby='tooltip'
                        >
                            <span className='glyphicon glyphicon-exclamation-sign' style={{marginLeft: '8px'}}></span>
                        </button>
                    </div>
                    <div id='slide'className={this.state.showModalTooltip ? 'show-me' : undefined}>
                        <FormattedMessage id='reportmodal-tooltip'>{txt => <p id='tooltip'>{txt}</p>}</FormattedMessage>
                    </div>
                </div>
            </div>
        );
    }
}

DebugHelper.propTypes = {
    intl: PropTypes.object.isRequired,
};
DebugHelper.contextTypes = {
    intl: PropTypes.object,
};

export default injectIntl(DebugHelper);
*/

