import './index.scss'

import React from 'react'
import PropTypes from 'prop-types'

import {connect} from 'react-redux'
import {push} from 'react-router-redux'
import {withRouter} from 'react-router'

import {clearUserData as clearUserDataAction} from 'src/actions/user.js'
import {setLocale as setLocaleAction} from 'src/actions/userLocale'

import {FormattedMessage} from 'react-intl'

// Material-ui Components
import Select from 'react-select'
import {Button, Drawer, Hidden, makeStyles, Toolbar} from '@material-ui/core'
import {Add, Menu, Language, Person} from '@material-ui/icons'

import {Link} from 'react-router-dom'
import constants from '../../constants'

import cityOfHelsinkiLogo from '../../assets/images/helsinki-logo.svg'
import {hasOrganizationWithRegularUsers} from '../../utils/user'
import {get} from 'lodash'
import {HelMaterialTheme} from '../../themes/material-ui'
import {HelSelectTheme, HelLanguageSelectStyles} from '../../themes/react-select'
import moment from 'moment'
import * as momentTimezone from 'moment-timezone'
import helBrandColors from '../../themes/hel/hel-brand-colors'
import userManager from '../../utils/userManager'

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

    handleLoginClick = () => {
        userManager.signinRedirect({
            data: {
                redirectUrl: window.location.pathname,
            },
            extraQueryParams: {
                ui_locales: this.props.userLocale.locale, // set auth service language for user
            },
        });
    }

    handleLogoutClick = () => {
        // clear user data in redux store
        this.props.clearUserData();
        
        // passing id token hint skips logout confirm on tunnistamo's side
        userManager.signoutRedirect({id_token_hint: this.props.auth.user.id_token});
        userManager.removeUser();
    }

    render() {
        const {user, userLocale, routerPush, location} = this.props
        const {showModerationLink} = this.state

        const toMainPage = () => routerPush('/');
        const toSearchPage = () => routerPush('/search');
        const toHelpPage = () => routerPush('/help');
        const toModerationPage = () => routerPush('/moderation');

        const isInsideForm = location.pathname.startsWith('/event/create/new');

        return (
            <div className="main-navbar">
                <Toolbar className="helsinki-bar">
                    <div className="helsinki-bar__logo">
                        <Link to="/">
                            <img src={cityOfHelsinkiLogo} alt="City Of Helsinki" />
                        </Link>
                    </div>
                    <div className="helsinki-bar__login-button">
                        <div className="helsinki-bar__language-button">
                            <div className="language-selector">
                                <Language className="language-icon"/>
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
                                    theme={HelSelectTheme}
                                />
                            </div>  
                        </div>
                        {user
                            ? <Button
                                style={{color: HelMaterialTheme.palette.primary.contrastText}}
                                onClick={this.handleLogoutClick}
                            >
                                {user.displayName}
                            </Button>
                            : <Button
                                style={{color: HelMaterialTheme.palette.primary.contrastText}}
                                startIcon={<Person/>}
                                onClick={this.handleLoginClick}
                            >
                                <FormattedMessage id="login"/>
                            </Button>}
                    </div>
                </Toolbar>
                
                <Toolbar className="linked-events-bar">
                    <div className="linked-events-bar__logo" onClick={() => routerPush('/')}><FormattedMessage id={`linked-${appSettings.ui_mode}`} /></div>
                    <div className="linked-events-bar__links">
                        <Hidden smDown>
                            <div className="linked-events-bar__links__list">
                                <NavLinks
                                    showModerationLink={showModerationLink}
                                    toMainPage={toMainPage}
                                    toSearchPage={toSearchPage}
                                    toHelpPage={toHelpPage}
                                    toModerationPage={toModerationPage}
                                />
                            </div>
                        </Hidden>
                        <div />
                        <div className="linked-events-bar__links__mobile">
                            {!isInsideForm && (
                                <Button
                                    variant="outlined"
                                    className="linked-events-bar__links__create-events"
                                    onClick={() => routerPush('/event/create/new')}
                                    startIcon={<Add/>}
                                >
                                    <FormattedMessage id={`create-${appSettings.ui_mode}`}/>
                                </Button>
                            )}
                            <Hidden mdUp>
                                <Menu className="linked-events-bar__icon" onClick={this.toggleNavbar} />
                                <Drawer anchor='right' open={this.state.navBarOpen} ModalProps={{onBackdropClick: this.toggleNavbar}}>
                                    <div className="menu-drawer-mobile">
                                        <NavLinks
                                            showModerationLink={showModerationLink}
                                            toMainPage={this.getNavigateMobile(toMainPage)}
                                            toSearchPage={this.getNavigateMobile(toSearchPage)}
                                            toHelpPage={this.getNavigateMobile(toHelpPage)}
                                            toModerationPage={this.getNavigateMobile(toModerationPage)}
                                        />
                                    </div> 
                                </Drawer>
                            </Hidden>
                        </div>
                    </div>
                </Toolbar>
            </div>
        )
    }
}

const NavLinks = (props) => {
    const {showModerationLink, toMainPage, toSearchPage, toHelpPage, toModerationPage} = props;
    const moderationStyles = showModerationLink && makeStyles(theme => ({
        root: {color: theme.palette.primary.main},
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
    routerPush: PropTypes.func,
    userLocale: PropTypes.object,
    setLocale: PropTypes.func,
    location: PropTypes.object,
    navBarOpen: PropTypes.bool,
    showModerationLink: PropTypes.bool,
    clearUserData: PropTypes.func,
    auth: PropTypes.object,
}

const mapStateToProps = (state) => ({
    user: state.user,
    userLocale: state.userLocale,
    auth: state.auth,
})

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
    setLocale: (locale) => dispatch(setLocaleAction(locale)),
    clearUserData: () => dispatch(clearUserDataAction()),
})

export {HeaderBar as UnconnectedHeaderBar};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderBar))
