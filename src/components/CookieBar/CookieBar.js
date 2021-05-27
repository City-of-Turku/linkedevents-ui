import React from 'react'
import CookieConsent from 'react-cookie-consent'
import {injectIntl, intlShape} from 'react-intl'
import {addCookieScript} from '../../utils/cookieUtils';
import './CookieBar.scss'

function CookieBar(props) {
    const {intl} = props

    return (
        <CookieConsent
            buttonId="cookie-accept-button"
            buttonText={intl.formatMessage({id: 'cookieBar.accept'})}
            contentClasses="cookie-content"
            declineButtonId="cookie-decline-button"
            declineButtonText={intl.formatMessage({id: 'cookieBar.decline.text'})}
            disableStyles
            enableDeclineButton
            expires={90}
            onAccept={addCookieScript}
            setDeclineCookie
            flipButtons
        >
            {intl.formatMessage({id: 'cookieBar.description'})}
            <div>
                <a
                    id="cookiebar-link"
                    href={intl.formatMessage({id: 'cookieBar.link.url'})}
                >
                    {intl.formatMessage({id: 'cookieBar.link.text'})}
                </a>
            </div>
        </CookieConsent>
    );
}

CookieBar.propTypes = {
    intl: intlShape.isRequired,
}

export {CookieBar as CookieBarWithoutIntl}
export default injectIntl(CookieBar);
