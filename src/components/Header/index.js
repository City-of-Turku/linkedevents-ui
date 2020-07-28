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
//Updated Nav from Material UI to Reactstrap based on Open design
import {Collapse, Navbar, NavbarToggler, Nav, NavItem, NavLink, NavbarBrand, Button} from 'reactstrap';
//Citylogo can now be used from scss
//import cityOfHelsinkiLogo from '../../assets/images/helsinki-logo.svg'
import {hasOrganizationWithRegularUsers} from '../../utils/user';
import {get} from 'lodash';
import moment from 'moment';
import * as momentTimezone from 'moment-timezone';
import classNames from 'classnames';
import userManager from '../../utils/userManager';

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

    render() {
        const {user, userLocale, routerPush, location} = this.props;
        const {showModerationLink} = this.state;

        const toMainPage = () => routerPush('/');
        const toSearchPage = () => routerPush('/search');
        const toHelpPage = () => routerPush('/help');
        const toModerationPage = () => routerPush('/moderation');

        const isInsideForm = location.pathname.startsWith('/event/create/new');

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

                <Navbar role='navigation' className='linked-events-bar' expand='lg'>
                    <NavbarBrand
                        href='#'
                        className='linked-events-bar__logo'
                        onClick={this.onLinkToMainPage}
                        aria-label={this.context.intl.formatMessage({id: `linked-${appSettings.ui_mode}`})}>
                        <FormattedMessage id={`linked-${appSettings.ui_mode}`} />
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <div className='linked-events-bar__links'>
                            <div className='linked-events-bar__links__list'>
                                <NavItem>
                                    <NavLink
                                        tabIndex='0'
                                        active={location.pathname === '/'}
                                        href='#'
                                        onClick={toMainPage}>
                                        <FormattedMessage id={`${appSettings.ui_mode}-management`} />
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        tabIndex='0'
                                        active={location.pathname === '/search'}
                                        href='#'
                                        onClick={toSearchPage}>
                                        <FormattedMessage id={`search-${appSettings.ui_mode}`} />
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink
                                        tabIndex='0'
                                        active={location.pathname === '/help'}
                                        href='#'
                                        onClick={toHelpPage}>
                                        {' '}
                                        <FormattedMessage id='more-info' />
                                    </NavLink>
                                </NavItem>
                                {showModerationLink && (
                                    <NavItem>
                                        <NavLink
                                            tabIndex='0'
                                            //Added classNames for moderation-link, now applies className "moderator true" when state true for scss-rule color.
                                            href='#'
                                            className={classNames('moderator', {true: showModerationLink})}
                                            onClick={toModerationPage}>
                                            <FormattedMessage id='moderation-page' />
                                        </NavLink>
                                    </NavItem>
                                )}
                                {/* <NavLinks
                                    showModerationLink={showModerationLink}
                                    toMainPage={toMainPage}
                                    toSearchPage={toSearchPage}
                                    toHelpPage={toHelpPage}
                                    toModerationPage={toModerationPage}
                               /> */}
                            </div>
                            {!isInsideForm && (
                                <NavItem className='linked-events-bar__links__create-event'>
                                    <NavLink
                                        tabIndex='0'
                                        active={window.location.pathname === '/event/create/new'}
                                        href='#'
                                        className='linked-events-bar__links__create-events ml-auto'
                                        onClick={() => routerPush('/event/create/new')}>
                                        <span aria-hidden className='glyphicon glyphicon-plus'></span>
                                        <FormattedMessage id={`create-${appSettings.ui_mode}`} />
                                    </NavLink>
                                </NavItem>
                            )}

                        </div>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}
/**
 * Returns the page links, if showModeration is true then the link to the moderation page is rendered aswell.
 */ /*
export const NavLinks = (props) => {
    const {showModerationLink, toMainPage, toSearchPage, toHelpPage, toModerationPage} = props;

    return (
        <React.Fragment>
            <NavItem>
                <NavLink
                    active={window.location.pathname === '/'}
                    href='#'
                    onClick={toMainPage}>
                    <FormattedMessage id={`${appSettings.ui_mode}-management`} />
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink
                    active={window.location.pathname === '/search'}
                    href='#'
                    onClick={toSearchPage}>
                    <FormattedMessage id={`search-${appSettings.ui_mode}`} />
                </NavLink>
            </NavItem>
            <NavItem>
                <NavLink
                    active={window.location.pathname === '/help'}
                    href='#'
                    onClick={toHelpPage}>
                    {' '}
                    <FormattedMessage id='more-info' />
                </NavLink>
            </NavItem>
            {showModerationLink && (
                <NavItem>
                    <NavLink
                    //Added classNames for moderation-link, now applies className "moderator true" when state true for scss-rule color.
                        href='#'
                        className={classNames('moderator', {true: showModerationLink})}
                        onClick={toModerationPage}>
                        <FormattedMessage id='moderation-page' />
                    </NavLink>
                </NavItem>
            )}
        </React.Fragment>
    );
};

NavLinks.propTypes = {
    showModerationLink: PropTypes.bool,
    toMainPage: PropTypes.func,
    toSearchPage: PropTypes.func,
    toHelpPage: PropTypes.func,
    toModerationPage: PropTypes.func,
};
*/
// Adds dispatch to this.props for calling actions, add user from store to props
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
