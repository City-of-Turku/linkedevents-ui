import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
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

    
    render() {
        const {user, logout} = this.props;
        return (
            <Fragment>
                <div onClick={this.toggle} ref={node => this.node = node} className='Logoutdrop'>
                    <a aria-haspopup="true" aria-label={this.context.intl.formatMessage({id: 'user'}) + (user.displayName) + this.context.intl.formatMessage({id: 'profile-menu'})} href="#">
                        {user.displayName}
                        <span className="caret"></span>
                    </a>
                </div>
                <ul role='menu' className={classNames('user-dropdown', {open: this.state.isOpen})}>
                    <li role="presentation" className="" onClick={logout}>
                        <a role="menuitem" aria-label={this.context.intl.formatMessage({id: `logout`})} href="#">
                            <FormattedMessage id='logout'>{txt => txt}</FormattedMessage>
                        </a>
                    </li>
                </ul>
            </Fragment>
        )
    }
}
LogoutDropdown.propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func,
};

LogoutDropdown.contextTypes = {
    intl: PropTypes.object,
}

export default LogoutDropdown;
