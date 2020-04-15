import './index.scss'

import React from 'react'
import PropTypes from 'prop-types'

import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import {withRouter} from 'react-router'

import {login as loginAction, logout as logoutAction} from 'src/actions/user.js'
import {setLocale as setLocaleAction} from 'src/actions/userLocale'

import {FormattedMessage} from 'react-intl'

// Material-ui Components
// import {Button, Drawer, Hidden, makeStyles, Toolbar} from '@material-ui/core'
// import {Add, Menu, Language, Person} from '@material-ui/icons'
import Select from 'react-select'
import {Navbar, Nav, Button} from 'react-bootstrap';
import {Link} from 'react-router-dom'
import constants from '../../constants'

import cityOfHelsinkiLogo from '../../assets/images/helsinki-logo.svg'
import {hasOrganizationWithRegularUsers} from '../../utils/user'
import {get} from 'lodash'
import {HelSelectTheme, HelLanguageSelectStyles} from '../../themes/react-select'
import moment from 'moment'
import * as momentTimezone from 'moment-timezone'

const {USER_TYPE, APPLICATION_SUPPORT_TRANSLATION} = constants

class HeaderBar extends React.Component {
    state = {
        navBarOpen: false,
        showModerationLink: false,
    }

    componentDidMount() {
        const {user} = this.props

        if (user) {
            const showModerationLink = get(user, 'userType') === USER_TYPE.ADMIN && hasOrganizationWithRegularUsers(user)
            this.setState({showModerationLink})
        }
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        const {user} = this.props
        const oldUser = prevProps.user

        if (oldUser !== user) {
            const showModerationLink = get(user, 'userType') === USER_TYPE.ADMIN && hasOrganizationWithRegularUsers(user)
            this.setState({showModerationLink})
        }
    }

    getLanguageOptions = () =>
        APPLICATION_SUPPORT_TRANSLATION.map(item => ({
            label: item.toUpperCase(),
            value: item,
        }))

    changeLanguage = (selectedOption) => {
        this.props.setLocale(selectedOption.value)
        moment.locale(selectedOption.value)
        momentTimezone.locale(selectedOption.value)
    }

    toggleNavbar = () => {
        this.setState({navBarOpen: !this.state.navBarOpen});
    }

    getNavigateMobile = (navigate) => () => {
        navigate();
        this.toggleNavbar();
    }

    render() {
        const {user, userLocale, routerPush, logout, login, location} = this.props
        const {showModerationLink} = this.state

        const toMainPage = () => routerPush('/');
        const toSearchPage = () => routerPush('/search');
        const toHelpPage = () => routerPush('/help');
        const toModerationPage = () => routerPush('/moderation');

        const isInsideForm = location.pathname.startsWith('/event/create/new');

        return (
            <div className='main-navbar'>
                <Navbar className='bar'>
                    <div className="bar__logo">
                        <Link to='/'>
                            <img src={cityOfHelsinkiLogo} alt='City Logo' />
                        </Link>
                    </div>
                    <Nav className="mx-auto">
                        <div className='bar__login-button'>
                            <div className='bar__language-button'>
                                <div className='language-selector'>
                                    <Select
                                        isClearable={false}
                                        isSearchable={false}
                                        value={{
                                            label: userLocale.locale.toUpperCase(),
                                            value: userLocale.locale,
                                        }}
                                        options={this.getLanguageOptions()}
                                        onChange={this.changeLanguage}
                                        styles={HelLanguageSelectStyles}
                                    />
                                </div>
                            </div>
                            {user ? (
                                <Button className='btnlogin'
                                   
                                    onClick={() => logout()}>
                                    {user.displayName}
                                </Button>
                            ) : (
                                <Button className='btnlogin'
                                    onClick={() => login()}>
                                    <FormattedMessage id='login' />
                                </Button>
                            )}
                        </div>
                    </Nav>
                </Navbar>
        
                <Navbar className="linked-events-bar">
                    <div className="linked-events-bar__links">
                        <div className="linked-events-bar__links__list">
                            <NavLinks
                                showModerationLink={showModerationLink}
                                toMainPage={toMainPage}
                                toSearchPage={toSearchPage}
                                toHelpPage={toHelpPage}
                                toModerationPage={toModerationPage}
                            />
                            {!isInsideForm && (
                                <Button className='btn'
                                    onClick={() => routerPush('/event/create/new')}
                                >
                                    <FormattedMessage id={`create-${appSettings.ui_mode}`}/>
                                </Button> )}
                        </div>
                    </div>
                </Navbar>
            </div>
        )
    }
}

const NavLinks = (props) => {
    const {showModerationLink, toMainPage, toSearchPage, toHelpPage, toModerationPage} = props;
    const moderationStyles = showModerationLink && (theme => ({

    }))()

    return (
        <React.Fragment>
            <Button onClick={toMainPage}><FormattedMessage id={`${appSettings.ui_mode}-management`}/></Button>
            <Button onClick={toSearchPage}><FormattedMessage id={`search-${appSettings.ui_mode}`}/></Button>
            <Button onClick={toHelpPage}> <FormattedMessage id="more-info"/></Button>
            {showModerationLink &&
                <Button
                    onClick={toModerationPage}
                    classes={moderationStyles}
                >
                    <FormattedMessage id="moderation-page"/>
                </Button>
            }
        </React.Fragment>
    );
};

NavLinks.propTypes = {
    showModerationLink: PropTypes.bool,
    toMainPage: PropTypes.func,
    toSearchPage: PropTypes.func,
    toHelpPage: PropTypes.func,
    toModerationPage: PropTypes.func,
}

// Adds dispatch to this.props for calling actions, add user from store to props
HeaderBar.propTypes = {
    user: PropTypes.object,
    login: PropTypes.func,
    logout: PropTypes.func,
    routerPush: PropTypes.func,
    userLocale: PropTypes.object,
    setLocale: PropTypes.func,
    location: PropTypes.object,
    navBarOpen: PropTypes.bool,
    showModerationLink: PropTypes.bool,
}

const mapStateToProps = (state) => ({
    user: state.user,
    userLocale: state.userLocale,
})

const mapDispatchToProps = (dispatch) => ({
    login: () => dispatch(loginAction()),
    logout: () => dispatch(logoutAction()),
    routerPush: (url) => dispatch(push(url)),
    setLocale: (locale) => dispatch(setLocaleAction(locale)),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderBar))
