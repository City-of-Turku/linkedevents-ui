import './index.scss';

import React from 'react';
import PropTypes from 'prop-types';


// Accessibility texts fetched from .md files.
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
