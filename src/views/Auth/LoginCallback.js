import React from 'react';
import {connect} from 'react-redux';
import {CallbackComponent} from 'redux-oidc';
import PropTypes from 'prop-types';

import userManager from '../../utils/userManager';

class UnconnectedLoginCallback extends React.Component {
    constructor(props) {
        super(props);

        this.loginSuccessful = this.loginSuccessful.bind(this);
        this.loginUnsuccessful = this.loginUnsuccessful.bind(this);
    }

    loginSuccessful(user) {
        if (user.state) {
            this.props.history.push(user.state.redirectUrl);
        } else {
            this.props.history.push('/');
        }
    }

    loginUnsuccessful() {
        this.props.history.push('/');
    }

    render() {
        return (
            <CallbackComponent
                errorCallback={error => this.loginUnsuccessful(error)}
                successCallback={user => this.loginSuccessful(user)}
                userManager={userManager}
            >
                <div />
            </CallbackComponent>
        );
    }
}

UnconnectedLoginCallback.propTypes = {
    history: PropTypes.object.isRequired,
};

export {UnconnectedLoginCallback};
export default connect()(UnconnectedLoginCallback);
