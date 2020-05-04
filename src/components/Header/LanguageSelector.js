import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

class LanguageSelector extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
        };
    }

    toggle(e) {
        e.preventDefault();
        this.setState({isOpen: !this.state.isOpen});
    }

    handleLanguageChange(lang, e) {
        e.preventDefault();
        this.props.changeLanguage(lang);
        this.setState({isOpen: false})

    }

    isActiveLanguage(language) {
        const {userLocale} = this.props;
        return language.label === userLocale.locale.toUpperCase();
    }

    render() {
        const {userLocale} = this.props;
        const activeLocale = userLocale.locale.toUpperCase();
        return (
            <div style={{display: 'flex', flexDirection: 'column', color: 'white', fontWeight: 'bold',  padding: '.375rem .75rem', alignItems: 'center'}}>
                <div className="currentLanguage" style={{paddingTop: '0.375rem', paddingBottom: '0.375rem'}}>
                    <a href="#" onClick={this.toggle}>{activeLocale}
                        <span className="caret"></span>
                    </a>
                </div>
                <ul className={classNames('language', {open: this.state.isOpen})}>
                    {this.props.languages.map((language, index) => {
                        return (
                            <li key={index} className={classNames('language-item',{active: this.isActiveLanguage(language)})}>
                                <a onClick={this.handleLanguageChange.bind(this, language)} href="#">{language.label}</a>
                            </li>
                        )
                    })}
                </ul>
            </div>
        )
    }
}

LanguageSelector.propTypes = {
    languages: PropTypes.array,
    userLocale: PropTypes.object,
    changeLanguage: PropTypes.func,
}
export default LanguageSelector;
