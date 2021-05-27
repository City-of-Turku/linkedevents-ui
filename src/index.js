import React from 'react'
import ReactDOM from 'react-dom'
import {Route} from 'react-router'
import {withRouter} from 'react-router-dom'
import {Provider, connect} from 'react-redux'
import {ConnectedRouter} from 'connected-react-router'
import {isIE, isLegacyEdge} from 'react-device-detect'

// Views
import App from './views/App'
import Editor from './views/Editor'
import Search from './views/Search'
import Help from './views/Help'
import Terms from './views/Terms/Terms'
import Event from './views/Event'
import EventCreated from './views/EventCreated'
import EventListingPage from './views/EventListing'
import ModerationPage from './views/Moderation/Moderation'
import Accessibility from './views/Accessibility'
import BrowserWarning from './views/Browser-Warning/BrowserWarning'
import HomePage from './views/HomePage/HomePage'

// Actors
import Validator from './actors/validator'

// JA addition
import Serializer from './actors/serializer';

// Translation
import IntlProviderWrapper from './components/IntlProviderWrapper'
import store, {history} from './store'
import moment from 'moment'
import * as momentTimezone from 'moment-timezone'

// Authentication
import userManager from './utils/userManager';
import {OidcProvider, processSilentRenew} from 'redux-oidc';
import LoginCallback from './views/Auth/LoginCallback'
import LogoutCallback from './views/Auth/LogoutCallback'

// Moment locale
moment.locale('fi')
momentTimezone.locale('fi')

// Setup actor for validation. Actor is a viewless component which can listen to store changes
// and send new actions accordingly. Bind the store as this for function
store.subscribe(_.bind(Validator, null, store))

// JA: Serializing state for debugging
store.subscribe(_.bind(Serializer, null, store));

const LayoutContainer = withRouter(connect()(App));

if (window.location.pathname === '/silent-renew') {
    processSilentRenew();
} else {
    ReactDOM.render(
        isIE || isLegacyEdge ? <BrowserWarning/> :
            <Provider store={store}>
                <OidcProvider store={store} userManager={userManager}>
                    <IntlProviderWrapper>
                        <ConnectedRouter history={history}>
                            <LayoutContainer>
                                <Route exact path="/" component={HomePage}/>
                                <Route exact path="/listing" component={EventListingPage}/>
                                <Route exact path="/event/:eventId" component={Event}/>
                                <Route exact path="/event/:action/:eventId" component={Editor}/>
                                <Route exact path="/event/:eventId/recurring/:action" component={Editor}/>
                                <Route exact path="/event/done/:action/:eventId" component={EventCreated}/>
                                <Route exact path="/search" component={Search}/>
                                <Route exact path="/help" component={Help}/>
                                <Route exact path="/terms" component={Terms}/>
                                <Route exact path="/moderation" component={ModerationPage}/>
                                <Route exact path="/accessibility" component={Accessibility}/>
                                <Route exact path="/callback" component={LoginCallback}/>
                                <Route exact path="/callback/logout" component={LogoutCallback}/>
                            </LayoutContainer>
                        </ConnectedRouter>
                    </IntlProviderWrapper>
                </OidcProvider>
            </Provider>,
        document.getElementById('content')
    )
}
