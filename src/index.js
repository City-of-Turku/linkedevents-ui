import React from 'react'
import ReactDOM from 'react-dom'
import {Route} from 'react-router'
import {withRouter} from 'react-router-dom'
import {Provider, connect} from 'react-redux'
import {ConnectedRouter} from 'react-router-redux'

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
import DebugHelper from './components/helper/Helper'

// Actors
import Validator from './actors/validator'

// JA addition
import Serializer from './actors/serializer';

// translation
import IntlProviderWrapper from './components/IntlProviderWrapper'
import store, {history} from './store'
import moment from 'moment'
import * as momentTimezone from 'moment-timezone'

// Moment locale
moment.locale('fi')
momentTimezone.locale('fi')

// Setup actor for validation. Actor is a viewless component which can listen to store changes
// and send new actions accordingly. Bind the store as this for function
store.subscribe(_.bind(Validator, null, store))

// JA: Serializing state for debugging
store.subscribe(_.bind(Serializer, null, store));

const LayoutContainer = withRouter(connect()(App));

ReactDOM.render(
    <Provider store={store}>
        <IntlProviderWrapper>
            <ConnectedRouter history={history}>
                <LayoutContainer>
                    <Route exact path="/" component={EventListingPage}/>
                    <Route exact path="/event/:eventId" component={Event}/>
                    <Route exact path="/event/:action/:eventId" component={Editor}/>
                    <Route exact path="/event/done/:action/:eventId" component={EventCreated}/>
                    <Route exact path="/search" component={Search}/>
                    <Route exact path="/help" component={Help}/>
                    <Route exact path="/terms" component={Terms}/>
                    <Route exact path="/moderation" component={ModerationPage}/>
                    <Route path="/" component={DebugHelper}/>
                </LayoutContainer>
            </ConnectedRouter>
        </IntlProviderWrapper>
    </Provider>,
    document.getElementById('content')
)
