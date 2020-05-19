import './index.scss';

import React from 'react';
import PropTypes from 'prop-types';

import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {withRouter} from 'react-router';

import {clearUserData as clearUserDataAction} from 'src/actions/user.js';
import {setLocale as setLocaleAction} from 'src/actions/userLocale';
import LanguageSelector from './LanguageSelector';
import {FormattedMessage} from 'react-intl';
import constants from '../../constants';
//Updated Nav from Material UI to Reactstrap based on Open design
import {Collapse, Navbar, NavbarToggler, Nav, NavbarBrand, Button} from 'reactstrap';
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
                <Navbar className='bar'>
                    <NavbarBrand className='bar__logo' href='/' aria-label='Logo' />
                    <Nav className='ml-auto'>
                        <div className='bar__login-and-language'>
                            <div className='language-selector'>
                                <LanguageSelector
                                    languages={this.getLanguageOptions()}
                                    userLocale={userLocale}
                                    changeLanguage={this.changeLanguage}
                                />
                            </div>
                            {user ? (
                                <Button onClick={this.handleLogoutClick}>{user.displayName}</Button>
                            ) : (
                                <Button onClick={this.handleLoginClick}>
                                    <span className='glyphicon glyphicon-user'></span>
                                    <FormattedMessage id='login' />
                                </Button>
                            )}
                        </div>
                    </Nav>
                </Navbar>

                <Navbar className='linked-events-bar' expand='lg'>
                    <NavbarBrand
                        className='linked-events-bar__logo'
                        onClick={() => routerPush('/')}
                        aria-label='Home'>
                        <FormattedMessage id={`linked-${appSettings.ui_mode}`} />
                    </NavbarBrand>
                    <NavbarToggler onClick={this.toggle} />
                    <Collapse isOpen={this.state.isOpen} navbar>
                        <div className='linked-events-bar__links'>
                            <div className='linked-events-bar__links__list'>
                                <NavLinks
                                    showModerationLink={showModerationLink}
                                    toMainPage={toMainPage}
                                    toSearchPage={toSearchPage}
                                    toHelpPage={toHelpPage}
                                    toModerationPage={toModerationPage}
                                />
                            </div>
                            <Nav className='ml-auto' navbar>
                                {!isInsideForm && (
                                    <Button
                                        className='linked-events-bar__links__create-events'
                                        onClick={() => routerPush('/event/create/new')}>
                                        <span className='glyphicon glyphicon-plus'></span>
                                        <FormattedMessage id={`create-${appSettings.ui_mode}`} />
                                    </Button>
                                )}
                            </Nav>
                        </div>
                    </Collapse>
                </Navbar>
            </div>
        );
    }
}
/**
 * Returns the page links, if showModeration is true then the link to the moderation page is rendered aswell.
 */
export const NavLinks = (props) => {
    const {showModerationLink, toMainPage, toSearchPage, toHelpPage, toModerationPage} = props;

    return (
        <React.Fragment>
            <Button onClick={toMainPage}>
                <FormattedMessage id={`${appSettings.ui_mode}-management`} />
            </Button>
            <Button onClick={toSearchPage}>
                <FormattedMessage id={`search-${appSettings.ui_mode}`} />
            </Button>
            <Button onClick={toHelpPage}>
                {' '}
                <FormattedMessage id='more-info' />
            </Button>
            {showModerationLink && (
                <Button
                    //Added classNames for moderation-link, now applies className "moderator true" when state true for scss-rule color.
                    className={classNames('moderator', {true: showModerationLink})}
                    onClick={toModerationPage}>
                    <FormattedMessage id='moderation-page' />
                </Button>
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
