import React from 'react';
import userManager from '../../../utils/userManager';
import {FormattedMessage} from 'react-intl';

function LoginNotification() {
    const handleLoginClick = () => {
        userManager.signinRedirect({
            data: {
                redirectUrl: window.location.pathname,
            },
        });
    };
    return (
        <div className='alert alert-danger' role='alert'>
            <FormattedMessage id='login-warning' />
            <button onClick={handleLoginClick} className='btn-link alert-link underline' rel='external' role='link'>
                <FormattedMessage id='login-warning1' />
            </button>
            <FormattedMessage id='login-warning2' />
        </div>
    );
}

export default LoginNotification;
