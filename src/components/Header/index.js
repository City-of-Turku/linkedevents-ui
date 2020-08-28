import './index.scss';

import React from 'react';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {withRouter} from 'react-router';

import {clearUserData as clearUserDataAction} from 'src/actions/user.js';
import {setLocale as setLocaleAction} from 'src/actions/userLocale';
import LanguageSelector from './LanguageSelector';
import LogoutDropdown from './LogoutDropdown';
import {FormattedMessage} from 'react-intl';
import constants from '../../constants';

import {Collapse, Navbar, NavbarToggler, Nav, NavItem, NavLink, NavbarBrand, Button} from 'reactstrap';
//Citylogo can now be used from scss
//import cityOfHelsinkiLogo from '../../assets/images/helsinki-logo.svg'
import {hasOrganizationWithRegularUsers} from '../../utils/user';
import {get} from 'lodash';
import moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import userManager from '../../utils/userManager';
import {saveLocaleToLocalStorage} from '../../utils/locale';   

const {USER_TYPE, APPLICATION_SUPPORT_TRANSLATION} = constants;

class HeaderBar extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            showModerationLink: false,
        };
    }
    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    componentDidMount() {
        const {user} = this.props;

        if (user) {
            const showModerationLink =
                get(user, 'userType') === USER_TYPE.ADMIN && hasOrganizationWithRegularUsers(user);
            this.setState({showModerationLink});
        }
    }

    componentDidUpdate(prevProps, prevState, prevContext) {
        const {user} = this.props;
        const oldUser = prevProps.user;

        if (oldUser !== user) {
            const showModerationLink =
                get(user, 'userType') === USER_TYPE.ADMIN && hasOrganizationWithRegularUsers(user);
            this.setState({showModerationLink});
        }
    }

    getLanguageOptions = () =>
        APPLICATION_SUPPORT_TRANSLATION.map((item) => ({
            label: item.toUpperCase(),
            value: item,
        }));

    changeLanguage = (selectedOption) => {
        this.props.setLocale(selectedOption.value);
        moment.locale(selectedOption.value);
        momentTimezone.locale(selectedOption.value);
        saveLocaleToLocalStorage(selectedOption.value);
    };

    handleLoginClick = () => {
        userManager.signinRedirect({
            data: {
                redirectUrl: window.location.pathname,
            },
            extraQueryParams: {
                ui_locales: this.props.userLocale.locale, // set auth service language for user
            },
        });
    };

    handleLogoutClick = () => {
        // clear user data in redux store
        this.props.clearUserData();

        // passing id token hint skips logout confirm on tunnistamo's side
        userManager.signoutRedirect({id_token_hint: this.props.auth.user.id_token});
        userManager.removeUser();
    };

    //Event handler for MainPage routerPush
    onLinkToMainPage = (e) => {
        const {routerPush} = this.props;
        e.preventDefault();
        routerPush('/');
    };

    isActivePath(pathname){
        return pathname === this.props.location.pathname
    }

    handleOnClick = (url) => {
        const {routerPush} = this.props;
        if (this.state.isOpen) {
            this.setState({isOpen: false});
            routerPush(url);
        }
        else {
            routerPush(url);
        }
    }

    render() {
        const {user, userLocale, routerPush, location} = this.props;
        const {showModerationLink} = this.state;

        return (
            <div className='main-navbar'>
                <Navbar role='navigation' className='bar'>
                    <NavbarBrand className='bar__logo' href='#' onClick={this.onLinkToMainPage} aria-label={this.context.intl.formatMessage({id: `navbar.brand`})} />
                    <div className='bar__login-and-language'>
                        <div className='language-selector'>
                            <LanguageSelector
                                languages={this.getLanguageOptions()}
                                userLocale={userLocale}
                                changeLanguage={this.changeLanguage}
                            />
                        </div>
                        {user ? (
                            <div className='logoutdropdown-selector'>
                                <LogoutDropdown user={user} logout={this.handleLogoutClick} />
                            </div>
                        ) : (
                            <Button role='link' onClick={this.handleLoginClick}>
                                <span className='glyphicon glyphicon-user'></span>
                                <FormattedMessage id='login' />
                            </Button>
                        )}
                    </div>
                </Navbar>

                <Navbar role='navigation' className='linked-events-bar' expand='xl'>
                    <NavbarBrand
                        href='#'
                        className='linked-events-bar__logo'
                        onClick={this.onLinkToMainPage}
                        aria-label={this.context.intl.formatMessage({id: `linked-${appSettings.ui_mode}`})}>
                        <FormattedMessage id={`linked-${appSettings.ui_mode}`} />
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <ul className='linked-events-bar__links'>
                            <NavItem>
                                <NavLink
                                    active={this.isActivePath('/')}
                                    href='#'
                                    onClick={() => this.handleOnClick('/')}>
                                    <FormattedMessage id={`${appSettings.ui_mode}-management`} />
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={this.isActivePath('/search')}
                                    href='#'
                                    onClick={() => this.handleOnClick('/search')}>
                                    <FormattedMessage id={`search-${appSettings.ui_mode}`} />
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    active={this.isActivePath('/help')}
                                    href='#'
                                    onClick={() => this.handleOnClick('/help')}>
                                    {' '}
                                    <FormattedMessage id='more-info' />
                                </NavLink>
                            </NavItem>
                            {showModerationLink && (
                                <NavItem>
                                    <NavLink
                                        active={this.isActivePath('/moderation')}
                                        href='#'
                                        className='moderator'
                                        onClick={() => this.handleOnClick('/moderation')}>
                                        <FormattedMessage id='moderation-page' />
                                    </NavLink>
                                </NavItem>
                            )}
                            <NavItem className='linked-events-bar__links__create-event  ml-auto'>
                                <NavLink
                                    active={this.isActivePath('/event/create/new')}
                                    href='#'
                                    className='linked-events-bar__links__create-events'
                                    onClick={() => this.handleOnClick('/event/create/new')}>
                                    <span aria-hidden className='glyphicon glyphicon-plus'></span>
                                    <FormattedMessage id={`create-${appSettings.ui_mode}`} />
                                </NavLink>
                            </NavItem>
                        </ul>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}

HeaderBar.propTypes = {
    user: PropTypes.object,
    routerPush: PropTypes.func,
    userLocale: PropTypes.object,
    setLocale: PropTypes.func,
    location: PropTypes.object,
    showModerationLink: PropTypes.bool,
    type: PropTypes.string,
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    clearUserData: PropTypes.func,
    auth: PropTypes.object,
};

HeaderBar.contextTypes = {
    intl: PropTypes.object,
}
const mapStateToProps = (state) => ({
    user: state.user,
    userLocale: state.userLocale,
    auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
    setLocale: (locale) => dispatch(setLocaleAction(locale)),
    clearUserData: () => dispatch(clearUserDataAction()),
});

export {HeaderBar as UnconnectedHeaderBar};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderBar));
