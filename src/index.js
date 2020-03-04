import React, {useState} from 'react'
import ReactDOM from 'react-dom'
import {Route} from 'react-router'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'
import {Provider, connect} from 'react-redux'
import {ConnectedRouter} from 'react-router-redux'
import {Close, Feedback} from '@material-ui/icons'

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

// Actors
import Validator from './actors/validator'

// JA addition
import Serializer from './actors/serializer';
import {report} from './utils/raven_reporter';

// translation
import IntlProviderWrapper from './components/IntlProviderWrapper'
import store, {history} from './store'
import {HelMaterialTheme} from './themes/material-ui'
import {Dialog, DialogTitle, DialogContent, IconButton, TextField, withStyles} from '@material-ui/core'
import moment from 'moment'
import * as momentTimezone from 'moment-timezone'

// oidc
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
        <Provider store={store}>
            <OidcProvider store={store} userManager={userManager}>
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

const DebugDialogTitle = withStyles({
    root: {
        '& .MuiTypography-root': {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
        },
    },
})(DialogTitle)

const DebugReporterModal = ({showModal, close, sendReport}) => {
    const [value, setValue] = useState()

    return <div id="debugreporterform">
        <Dialog
            open={showModal}
            onClose={close}
            transitionDuration={0}
        >
            <DebugDialogTitle>
                Raportoi virhetilanne
                <IconButton onClick={() => close()}>
                    <Close />
                </IconButton>
            </DebugDialogTitle>
            <DialogContent>
                <TextField
                    multiline
                    fullWidth
                    value={value}
                    label={'Kuvaile ongelmaa halutessasi'}
                    style={{margin: 0}}
                    onChange={(event) => setValue(event.target.value)}
                />
                <button
                    onClick={() => sendReport(value)}
                    style={{margin: '1rem 0 0'}}
                >
                    Lähetä raportti
                </button>
                <hr/>
                <small style={{
                    display: 'block',
                    margin: '0 0 10px',
                }}>
                    Sovelluksen versiotunniste:<br />{appSettings.commit_hash}
                </small>
            </DialogContent>
        </Dialog>
    </div>
}

DebugReporterModal.propTypes = {
    sendReport: PropTypes.func,
    showModal: PropTypes.bool,
    close: PropTypes.func,
}

class DebugHelper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reporting: false}

        this.showReportForm = this.showReportForm.bind(this)
        this.closeReportForm = this.closeReportForm.bind(this)
        this.serializeState = this.serializeState.bind(this)
    }

    showReportForm() {
        this.setState({reporting: true})
    }

    closeReportForm() {
        this.setState({reporting: false})
    }

    serializeState(reportmsg) {
        this.closeReportForm();
        report(window.ARG, reportmsg, appSettings.commit_hash);

        window.setTimeout(
            () => alert('Raportti lähetetty, kiitoksia'),
            100);
    }

    render() {
        return <div>
            <DebugReporterModal showModal={this.state.reporting} close={this.closeReportForm} sendReport={this.serializeState} />
            <div id="debughelper">
                <div id="debughelper_container">
                    <button
                        className="btn btn-default"
                        onClick={this.showReportForm}
                    >
                        <Feedback style={{marginLeft: HelMaterialTheme.spacing(1)}}/>
                    </button>
                </div>
                <div id="slide">Jos tapahtumien hallinnassa tai syöttölomakkeen toiminnassa on virhe, klikkaa {`"raportoi virhe"`}&#x2011;nappia,
                    niin saamme virhetilanteesta tiedon ja voimme tutkia asiaa.</div>
            </div>
        </div>
    }

}

ReactDOM.render(
    <div>
        <DebugHelper />
    </div>,
    document.getElementById('debughelper'));
