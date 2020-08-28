import React from 'react';
import './Footer.scss';
import DebugReporterModal from '../helper/Helper'
import {report} from '../../utils/raven_reporter';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl';
import {Button, UncontrolledTooltip} from 'reactstrap';

class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reporting: false,
        };
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

    render(){

        return (
            <footer className='main-footer'>
                <div className='footer-logo'></div>
                <div className='footer-list'>
                    <Link to='/accessibility' aria-label={this.props.intl.formatMessage({id:'footer-accessibility'})}>
                        <FormattedMessage id='footer-accessibility' />
                    </Link>
                    <DebugReporterModal
                        showModal={this.state.reporting}
                        close={this.closeReportForm}
                        sendReport={this.serializeState}
                        intl={this.props.intl}
                    />
                    <Button
                        onClick={this.showReportForm}
                        role='link'
                    >
                        <FormattedMessage id='reportmodal-button' />
                    </Button>
                    <div><FormattedMessage id={'footer-city'} /></div>
                    <div><FormattedMessage id={'footer-city1'} /></div>
                    <div><FormattedMessage id={'footer-city2'} /></div>
                </div>
                <a href='https://www.hel.fi/' rel="noopener noreferrer" target="_blank"><FormattedMessage id={'footer-city3'} /></a>
            </footer>
        );
    }
}

Footer.propTypes = {
    intl: PropTypes.object,
}

export default injectIntl(Footer);
