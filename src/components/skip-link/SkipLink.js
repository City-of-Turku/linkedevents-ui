import './index.scss';
import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

//Jump to #main-content div in order to skip Navigation
class SkipLink extends React.Component {
    render() {
        return (
            <div className='skiplink-shortcut'>
                <a
                    className='visually-hidden skip-link'
                    aria-label={this.context.intl.formatMessage({id: `skiplink-shortcut`})}
                    href='#main-content'
                >
                    <FormattedMessage id='skiplink-shortcut' />
                </a>
            </div>
        );
    }
}
SkipLink.contextTypes = {
    intl: PropTypes.object,
}
export default SkipLink;
