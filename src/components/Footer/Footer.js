import React from 'react';
import './Footer.scss';

import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl'

class Footer extends React.Component {
    render(){
        return (
            <footer className='main-footer' aria-label='Footer'>
                <div className='footer-logo'></div>
                <div className='footer-list'>
                    <Link to='/accessibility' aria-label={this.context.intl.formatMessage({id:'footer-accessibility'})}>
                        <FormattedMessage id='footer-accessibility' />
                    </Link>
                    <div><FormattedMessage id={'footer-city'} /></div>
                    <div><FormattedMessage id={'footer-city1'} /></div>
                    <div><FormattedMessage id={'footer-city2'} /></div>
                </div>
                <a href='https://www.hel.fi/' rel="noopener noreferrer" target="_blank"><FormattedMessage id={'footer-city3'} /></a>
            </footer>
        );
    }
}

Footer.contextTypes = {
    intl: PropTypes.object,
}

export default injectIntl(Footer);
