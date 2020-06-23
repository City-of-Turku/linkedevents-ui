import 'src/assets/additional_css/bootstrap.custom.min.css';
import 'src/assets/main.scss';
import '@city-assets/main.scss';


import PropTypes from 'prop-types';

import React from 'react'
import {connect} from 'react-redux'

import Headerbar from 'src/components/Header'
import Footer from 'src/components/Footer/Footer';
import SkipLink from 'src/components/SkipLink'
import {ThemeProvider, Paper} from '@material-ui/core';
import {Helmet} from 'react-helmet';

import {injectIntl, FormattedMessage} from 'react-intl'

import {fetchLanguages as fetchLanguagesAction, fetchKeywordSets as fetchKeywordSetsAction} from '../../actions/editor'
import {fetchUser as fetchUserAction} from '../../actions/user'

import {cancelAction, doAction} from 'src/actions/app'

import {HelMaterialTheme} from 'src/themes/material-ui'
import Notifications from '../Notification'
import {MuiPickersUtilsProvider} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment';
import moment from 'moment'
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';
import CookieBar from '../../components/CookieBar/CookieBar';

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
    }

    componentDidUpdate(prevProps) {
        // fetch user if user doesnt exist yet or new user is not same as previous one
        if(this.props.auth.user && this.props.auth.user !== prevProps.auth.user) {
            this.props.fetchUser(this.props.auth.user.profile.sub);
        }
    }
    getModalCloseButton() {
        return (
            <Button onClick={() => this.props.dispatch(cancelAction())}><span className="glyphicon glyphicon-remove" /></Button>
        );
    }

    render() {
        const closebtn = this.getModalCloseButton();

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
                        Ota yhteyttä <a href="mailto:matias.peltonen@turku.fi">Matias Peltoseen</a> saadaksesi oikeudet
                        muokata yksikkösi tapahtumia.</p>
                        <p>Jos olet jo saanut käyttöoikeudet, kirjautumisesi saattaa olla vanhentunut. Kokeile sivun
                        päivittämistä (F5) ja kirjautumista uudestaan.</p>
                    </Paper>
            }
        }
        return (
            <ThemeProvider theme={HelMaterialTheme}>
                <MuiPickersUtilsProvider utils={LocalizedUtils}>
                    <div className='main-wrapper'>
                       
                        <Helmet>
                            <html lang={this.props.intl.locale} />
                        </Helmet>
                        <SkipLink />
                        <header>
                            <Headerbar />
                        </header>
                        {organization_missing_msg}
                        <Notifications flashMsg={this.props.app.flashMsg} />
                        <main id="main-content" className="content">
                            {this.props.children}
                        </main>
                        <Notifications flashMsg={this.props.app.flashMsg} />
                        <Modal
                            size='lg'
                            isOpen={!!this.props.app.confirmAction}
                            onClose={() => this.props.dispatch(cancelAction())}
                            className='ConfirmationModal'
                        >
                            <ModalHeader tag='h1' close={closebtn}>
                                {confirmMsg}
                            </ModalHeader>
                            <ModalBody>
                                <p><strong>{additionalMsg}</strong></p>
                                <div dangerouslySetInnerHTML={getMarkup()}/>
                            </ModalBody>
                            <ModalFooter>
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
                            </ModalFooter>
                        </Modal>
                        {appSettings.show_cookie_bar && <CookieBar />}
                        <Footer />
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
    auth : PropTypes.object,
    fetchUser: PropTypes.func,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user,
    app: state.app,
    auth: state.auth,
})

const mapDispatchToProps = (dispatch) => ({
    fetchKeywordSets: () => dispatch(fetchKeywordSetsAction()),
    fetchLanguages:() => dispatch(fetchLanguagesAction()),
    do: (data) => dispatch(doAction(data)),
    cancel: () => dispatch(cancelAction()),
    fetchUser: (id) => dispatch(fetchUserAction(id)),
})

export {App as UnconnectedApp};
export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(App))
