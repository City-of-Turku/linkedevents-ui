import './index.scss';

import {connect} from 'react-redux';
import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

function getContent(language) {
    if (language === 'fi') {
        return require('./content.fi.md');
    }
    if (language === 'sv') {
        return require('./content.sv.md');
    }
    if (language === 'en') {
        return require('./content.en.md');
    }
    return require('./content.fi.md');
}

class Accessibility extends React.Component {
    render() {
        const content = getContent(this.props.locale);
        return (
            <div className='accessibility-page'>
                <div className='accessibility-container' dangerouslySetInnerHTML={{__html: content}} />
            </div>

        )
    }
}

Accessibility.propTypes = {
    locale: PropTypes.string,
};

export default Accessibility;
