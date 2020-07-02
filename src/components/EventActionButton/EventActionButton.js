import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {FormattedMessage} from 'react-intl';
import {get} from 'lodash';
import {checkEventEditability} from '../../utils/checkEventEditability';
import constants from '../../constants';
import showConfirmationModal from '../../utils/confirm';
import {appendEventDataWithSubEvents, getEventsWithSubEvents} from '../../utils/events';
import {Tooltip} from '@material-ui/core';
//Replaced Material-ui Button for a Bootstrap implementation. - Turku
import {Button, Input} from 'reactstrap';
import {confirmAction} from '../../actions/app';
import {getButtonLabel} from '../../utils/helpers';
import {Link} from 'react-router-dom';

const {PUBLICATION_STATUS, EVENT_STATUS, USER_TYPE} = constants;

class EventActionButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            agreedToTerms: false,
        }
        this.handleChange = this.handleChange.bind(this);
    }

    isSaveButton(action) {
        return ['publish','update','update-draft'].includes(action)
    }

    confirmEventAction() {
        const {action, event, subEvents, confirm, runAfterAction, customAction, intl} = this.props;
        const eventData = [event, ...subEvents];

        const doConfirm = (data) => {
            showConfirmationModal(
                data,
                action,
                confirm,
                intl,
                event.publication_status,
                customAction)
                .then(() => runAfterAction(action, event))
        };

        const eventsWithSubEvents = getEventsWithSubEvents(eventData)
            .filter(eventId => eventId !== event.id);

        eventsWithSubEvents.length > 0 ?
            appendEventDataWithSubEvents(eventData, eventsWithSubEvents)
                .then((appendedData) => doConfirm(appendedData))
            : doConfirm(eventData)
    }

    handleChange = (event) => {
        this.setState({agreedToTerms: event.target.checked})
    }

    getButton(showTermsCheckbox, buttonLabel, disabled) {
        const {customAction, action} = this.props;

        return (
            <Fragment>
                {showTermsCheckbox &&
                <Fragment>
                    <label>
                        <FormattedMessage id={'terms-agree-text'}>{txt => txt}</FormattedMessage>
                        <Link to={'/terms'} target='_black'>
                            <FormattedMessage id={'terms-agree-link'}>{txt => txt}</FormattedMessage>
                        </Link>
                    </label>
                    <Input
                        type='checkbox'
                        checked={this.state.agreedToTerms}
                        onChange={this.handleChange}
                    />
                </Fragment>
                }
                <Button
                    color='secondary'
                    className={`editor-${action}-button`}
                    onClick={() => confirmAction ? this.confirmEventAction : customAction()}
                >
                    <FormattedMessage id={buttonLabel}>{txt => txt}</FormattedMessage>
                </Button>
            </Fragment>
        )
    }

    render() {
        const {
            intl,
            editor,
            user,
            action,
            confirmAction,
            customAction,
            customButtonLabel,
            event,
            eventIsPublished,
            loading,
        } = this.props;

        const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR;
        const formHasSubEvents = get(editor, ['values', 'sub_events'], []).length > 0;
        const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT;
        const isPostponed = get(event, 'event_status') === EVENT_STATUS.POSTPONED;
        const {editable, explanationId} = checkEventEditability(user, event, action, editor);
        const showTermsCheckbox = isRegularUser && this.isSaveButton(action) && !isDraft;
        let disabled = !editable || loading || (showTermsCheckbox && !this.state.agreedToTerms);

        let color = 'default';
        const buttonLabel = customButtonLabel || getButtonLabel(action, isRegularUser, isDraft, eventIsPublished, formHasSubEvents);

        if (action === 'publish' || action.includes('update') || action === 'edit') {
            color = 'primary';
        }
        if (action === 'cancel' || action === 'delete') {
            color = 'secondary';
        }
        if (action === 'postpone' && isPostponed) {
            disabled = true;
        }

        return (
            <Fragment>
                {(disabled && explanationId) &&
                    <Tooltip title={intl.formatMessage({id: explanationId})}>
                        <span>
                            {this.getButton(showTermsCheckbox, buttonLabel, disabled)}
                        </span>
                    </Tooltip>
                }
                {(!disabled && !explanationId) &&
                    <Fragment>
                        {this.getButton(showTermsCheckbox,buttonLabel, disabled)}
                    </Fragment>
                }
            </Fragment>
        )
    }
}

EventActionButton.propTypes = {
    intl: PropTypes.object,
    editor: PropTypes.object,
    user: PropTypes.object,
    confirm: PropTypes.func,
    action: PropTypes.string,
    confirmAction: PropTypes.bool,
    customAction: PropTypes.func,
    customButtonLabel: PropTypes.string,
    event: PropTypes.object,
    eventIsPublished: PropTypes.bool,
    loading: PropTypes.bool,
    runAfterAction: PropTypes.func,
    subEvents: PropTypes.array,
}

const mapStateToProps = (state) => ({
    editor: state.editor,
    user: state.user,
})

const mapDispatchToProps = (dispatch) => ({
    confirm: (msg, style, actionButtonLabel, data) => dispatch(confirmAction(msg, style, actionButtonLabel, data)),
})

export default connect(mapStateToProps, mapDispatchToProps)(EventActionButton)
