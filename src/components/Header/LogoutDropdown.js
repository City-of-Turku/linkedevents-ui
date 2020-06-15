import React from 'react';
import PropTypes from 'prop-types';
import userManager from '../../utils/userManager';
import {clearUserData as clearUserDataAction} from 'src/actions/user.js';
import {push} from 'react-router-redux';
import classNames from 'classnames';
import {FormattedMessage} from 'react-intl';


class LogoutDropdown extends React.Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
        };
    }
    componentDidMount() {
        document.addEventListener('click', this.handleClick, false);
        const {user} = this.props;
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
    handleLogoutClick = () => {
        // clear user data in redux store
        this.props.clearUserData();

        // passing id token hint skips logout confirm on tunnistamo's side
        userManager.signoutRedirect({id_token_hint: this.props.auth.user.id_token});
        userManager.removeUser();
    };

    
    render() {
        const {user, routerPush, location, logout} = this.props;
        return (
            <div>
                <div onClick={this.toggle} ref={node => this.node = node} className='Logoutdrop'>
                    <div className="logout">
                        <a aria-label="" href="#">
                            {user.displayName}
                            <span className="caret"></span>
                        </a>
                    </div>
                </div>
                <ul className={classNames('user-dropdown', {open: this.state.isOpen})}>
                    <li className="" onClick={logout}>
                        <a aria-label={this.context.intl.formatMessage({id: `logout`})} href="#"/>
                        <FormattedMessage id='logout' />
                    </li>
                </ul>
            </div>
        )
    }
}
LogoutDropdown.propTypes = {
    user: PropTypes.object,
    routerPush: PropTypes.func,
    location: PropTypes.object,
    type: PropTypes.string,
    tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    clearUserData: PropTypes.func,
    auth: PropTypes.object,
    logout: PropTypes.func,
};

LogoutDropdown.contextTypes = {
    intl: PropTypes.object,
}
/*
const mapStateToProps = (state) => ({
    user: state.user,
    userLocale: state.userLocale,
    auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
    clearUserData: () => dispatch(clearUserDataAction()),
});
*/
export default LogoutDropdown;
