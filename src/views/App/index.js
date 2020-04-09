import 'src/assets/additional_css/bootstrap.custom.min.css';
import 'src/assets/main.scss';

import PropTypes from 'prop-types';

import React from 'react'
import {connect} from 'react-redux'

import Headerbar from 'src/components/Header'
import {ThemeProvider, Button, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions} from '@material-ui/core';
import {Close} from '@material-ui/icons';

import {injectIntl, FormattedMessage} from 'react-intl'

import {fetchLanguages as fetchLanguagesAction, fetchKeywordSets as fetchKeywordSetsAction} from '../../actions/editor'
//import {retrieveUserFromSession as retrieveUserFromSessionAction} from '../../actions/user'

import {cancelAction, doAction} from 'src/actions/app'

import {HelMaterialTheme} from 'src/themes/material-ui'
import Notifications from '../Notification'
import {MuiPickersUtilsProvider} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment';
import moment from 'moment'

// localized moment utils
class LocalizedUtils extends MomentUtils {
    getDatePickerHeaderText(date) {
        return moment(date).format('DD.MM');
    }
    getDateTimePickerHeaderText(date) {
        return moment(date).format('DD.MM');
    }
}

class App extends React.Component {

    static propTypes = {
        children: PropTypes.node,
        fetchKeywordSets: PropTypes.func,
        cancel: PropTypes.func,
        do: PropTypes.func,
    };

    static childContextTypes = {
        muiTheme: PropTypes.object,
        intl: PropTypes.object,
        dispatch: PropTypes.func,
    };

    getChildContext() {
        return {
            muiTheme: HelMaterialTheme,
            dispatch: this.props.dispatch,
            intl: this.props.intl,
        }
    }

    UNSAFE_componentWillMount() {
        // fetch Hel.fi languages
        this.props.fetchLanguages()

        // Prefetch editor related hel.fi categories
        this.props.fetchKeywordSets()

        // Fetch userdata
        // this.props.retrieveUserFromSession() // ei haeta täällä
    }

    // käytetään uutta fetchUser funktiota oikeassa reactin lifecycle metodissa.

    render() {

        let confirmMsg = (<span/>)
        if(this.props.app.confirmAction && this.props.app.confirmAction.msg && this.props.app.confirmAction.msg.length) {
            confirmMsg = (<FormattedMessage id={this.props.app.confirmAction.msg} />)
        }

        let additionalMsg = ''
        if(this.props.app.confirmAction && this.props.app.confirmAction.data && this.props.app.confirmAction.data.additionalMsg) {
            additionalMsg = this.props.app.confirmAction.data.additionalMsg
        }

        let additionalMarkup = (<div/>)
        if(this.props.app.confirmAction && this.props.app.confirmAction.data && this.props.app.confirmAction.data.additionalMarkup) {
            additionalMarkup = this.props.app.confirmAction.data.additionalMarkup
        }
        const getMarkup = () => ({__html: additionalMarkup})

        const useWarningButtonStyle = this.props.app.confirmAction && this.props.app.confirmAction.style === 'warning'

        let actionButtonLabel = 'confirm'
        if(this.props.app.confirmAction && this.props.app.confirmAction.actionButtonLabel && this.props.app.confirmAction.actionButtonLabel.length > 0) {
            actionButtonLabel = this.props.app.confirmAction.actionButtonLabel;
        }
        let organization_missing_msg = null;
        if (this.props.user && !this.props.user.organization) {
            if (appSettings.ui_mode === 'courses') {
                organization_missing_msg =
                    <Paper
                        elevation={3}
                        style={{
                            margin: HelMaterialTheme.spacing(3),
                            padding: 16,
                        }}
                    >
                        <h4>Tervetuloa käyttämään Linked Coursesia, {this.props.user.displayName}!</h4>
                        <p>Sinulla ei ole vielä oikeutta hallinnoida yhdenkään yksikön kursseja.</p>
                        <p>Jos olet jo saanut käyttöoikeudet, kirjautumisesi saattaa olla vanhentunut. Kokeile sivun
                            päivittämistä (F5) ja kirjautumista uudestaan.</p>
                    </Paper>
            } else {
                organization_missing_msg =
                    <Paper
                        elevation={3}
                        style={{
                            margin: HelMaterialTheme.spacing(3),
                            padding: 16,
                        }}
                    >
                        <h4>Tervetuloa käyttämään Linked Eventsiä, {this.props.user.displayName}!</h4>
                        <p>Sinulla ei ole vielä oikeutta hallinnoida yhdenkään yksikön tapahtumia.
                            Ota yhteyttä <a href="mailto:aleksi.salonen@hel.fi">Aleksi Saloseen</a> saadaksesi oikeudet
                            muokata yksikkösi tapahtumia.</p>
                        <p>Jos olet jo saanut käyttöoikeudet, kirjautumisesi saattaa olla vanhentunut. Kokeile sivun
                            päivittämistä (F5) ja kirjautumista uudestaan.</p>
                    </Paper>
            }
        }
        return (
            <ThemeProvider theme={HelMaterialTheme}>
                <MuiPickersUtilsProvider utils={LocalizedUtils}>
                    <div>
                        <Headerbar />
                        {organization_missing_msg}
                        <div className="content">
                            {this.props.children}
                        </div>
                        <Notifications flashMsg={this.props.app.flashMsg} />
                        <Dialog
                            open={!!this.props.app.confirmAction}
                            onClose={() => this.props.dispatch(cancelAction())}
                            transitionDuration={0}
                        >
                            <DialogTitle>
                                {confirmMsg}
                                <IconButton onClick={() => this.props.dispatch(cancelAction())}>
                                    <Close />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                <p><strong>{additionalMsg}</strong></p>
                                <div dangerouslySetInnerHTML={getMarkup()}/>
                            </DialogContent>
                            <DialogActions>
                                <Button
                                    variant="contained"
                                    onClick={() => this.props.cancel()}
                                >
                                    <FormattedMessage id="cancel" />
                                </Button>
                                <Button
                                    variant="contained"
                                    color={useWarningButtonStyle ? 'secondary' : 'primary'}
                                    onClick={() => this.props.do(this.props.app.confirmAction.data)}
                                >
                                    <FormattedMessage id={actionButtonLabel} />
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </MuiPickersUtilsProvider>
            </ThemeProvider>
        )
    }
}

App.propTypes = {
    intl: PropTypes.object,
    app: PropTypes.object,
    user: PropTypes.object,
    dispatch: PropTypes.func,
    fetchLanguages: PropTypes.func,
    //retrieveUserFromSession: PropTypes.func,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user,
    app: state.app,
})

const mapDispatchToProps = (dispatch) => ({
    fetchKeywordSets: () => dispatch(fetchKeywordSetsAction()),
    fetchLanguages:() => dispatch(fetchLanguagesAction()),
    //retrieveUserFromSession: () => dispatch(retrieveUserFromSessionAction()),
    do: (data) => dispatch(doAction(data)),
    cancel: () => dispatch(cancelAction()),
})

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(App))
