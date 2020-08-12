import './index.scss';
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';


// Accessibility texts fetched from .md files.
function getContent(language) {
    if (language === 'fi') { 
        return require('@city-assets/md/accessibility-content.fi.md');}
    if (language === 'en') { 
        return require('@city-assets/md/accessibility-content.en.md');}
    if (language === 'sv') { 
        return require('@city-assets/md/accessibility-content.sv.md');}
    return require('src/assets/default/assets/md/accessibility-content.fi.md');
}

class Accessibility extends React.Component {
    render() {
        const content = getContent(this.props.locale);
        return (
            <div className='container accessibility-page' dangerouslySetInnerHTML={{__html: content}}/>
        )
    }
}

Accessibility.propTypes = {
    locale: PropTypes.string,
};

const mapStateToProps = (state) => ({
    locale: state.userLocale.locale,
});

export default connect(mapStateToProps)(Accessibility)
