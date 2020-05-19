import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Close, Feedback} from '@material-ui/icons';
import {report} from '../../utils/raven_reporter';
import {HelMaterialTheme} from '../../themes/material-ui';
import {Dialog, DialogTitle, DialogContent, IconButton, TextField, withStyles} from '@material-ui/core';

const DebugDialogTitle = withStyles({
    root: {
        '& .MuiTypography-root': {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
        },
    },
})(DialogTitle);

const DebugReporterModal = ({showModal, close, sendReport}) => {
    const [value, setValue] = useState();

    return (
        <div id='debugreporterform'>
            <Dialog open={showModal} onClose={close} transitionDuration={0}>
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
                    <button onClick={() => sendReport(value)} style={{margin: '1rem 0 0'}}>
                        Lähetä raportti
                    </button>
                    <hr />
                    <small
                        style={{
                            display: 'block',
                            margin: '0 0 10px',
                        }}>
                        Sovelluksen versiotunniste:
                        <br />
                        {appSettings.commit_hash}
                    </small>
                </DialogContent>
            </Dialog>
        </div>
    );
};

DebugReporterModal.propTypes = {
    sendReport: PropTypes.func,
    showModal: PropTypes.bool,
    close: PropTypes.func,
};

class DebugHelper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {reporting: false};

        this.showReportForm = this.showReportForm.bind(this);
        this.closeReportForm = this.closeReportForm.bind(this);
        this.serializeState = this.serializeState.bind(this);
    }

    showReportForm() {
        this.setState({reporting: true});
    }

    closeReportForm() {
        this.setState({reporting: false});
    }

    serializeState(reportmsg) {
        this.closeReportForm();
        report(window.ARG, reportmsg, appSettings.commit_hash);

        window.setTimeout(() => alert('Raportti lähetetty, kiitoksia'), 100);
    }

    render() {
        return (
            <div>
                <DebugReporterModal
                    showModal={this.state.reporting}
                    close={this.closeReportForm}
                    sendReport={this.serializeState}
                />
                <div id='debughelper'>
                    <div id='debughelper_container'>
                        <button className='btn btn-default' aria-label='Feedback' onClick={this.showReportForm}>
                            <Feedback style={{marginLeft: HelMaterialTheme.spacing(1)}} />
                        </button>
                    </div>
                    <div id='slide'>
                        Jos tapahtumien hallinnassa tai syöttölomakkeen toiminnassa on virhe,
                        klikkaa {`"raportoi virhe"`}&#x2011;nappia, niin saamme virhetilanteesta
                        tiedon ja voimme tutkia asiaa.
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <div>
        <DebugHelper />
    </div>,
    document.getElementById('content')
);

export default DebugHelper;
