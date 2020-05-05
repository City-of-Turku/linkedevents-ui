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

    componentDidMount() {
        document.addEventListener('click', this.handleClick, false);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick, false);
    }

    handleClick = (event) => {
        if (!this.node.contains(event.target)) {
            this.handleOutsideClick();
        }
    }

    handleOutsideClick() {
        if ( this.state.isOpen) {
            this.setState({isOpen: false});
        }
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

    

    /**
     * Returns true if language is same as current locale
     * @param {object} language
     * @return {boolean}
     */
    isActiveLanguage(language) {
        const {userLocale} = this.props;
        return language.label === userLocale.locale.toUpperCase();
    }

    render() {
        const {userLocale} = this.props;
        const activeLocale = userLocale.locale.toUpperCase();
        return (
            <React.Fragment>
                <span className="glyphicon glyphicon-globe" />
                <div ref={node => this.node = node} className='LanguageMain'>
                    <div className="currentLanguage">
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
            </React.Fragment>
        )
    }
}

LanguageSelector.propTypes = {
    languages: PropTypes.array,
    userLocale: PropTypes.object,
    changeLanguage: PropTypes.func,
}
export default LanguageSelector;
