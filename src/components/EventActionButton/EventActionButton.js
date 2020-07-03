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
        this.confirmEventAction = this.confirmEventAction.bind(this);
    }

    /**
     * Returns whether the button is a save button based on given action
     * @param {string} action
     * @returns {boolean}
     */
    isSaveButton(action) {
        return ['publish','update','update-draft'].includes(action)
    }

    /**
     * Opens a confirmation modal and runs the given action
     * @param props
     */
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

    /**
     * Toggle state agreedToTerms based on checkbox
     * @param event
     */
    handleChange = (event) => {
        this.setState({agreedToTerms: event.target.checked})
    }

    /**
     * Returns a Button element and depending on showTermsCheckbox an input element with a label
     * @param {boolean} showTermsCheckbox
     * @param {string} buttonLabel
     * @param {boolean} disabled
     * @returns {*}
     */
    getButton(showTermsCheckbox, buttonLabel, disabled) {
        const {action, confirmAction, customAction} = this.props;
        const color = 'secondary';
        /*
        color = this.getButtonColor(action), to get color based on action.
        The getButtonColor function is currently not in use and can be removed if deemed unnecessary.
        */

        return (
            <Fragment>
                {showTermsCheckbox &&
                <div className='terms-checkbox'>
                    <Input
                        type='checkbox'
                        checked={this.state.agreedToTerms}
                        onChange={this.handleChange}
                        id='terms-agree'
                    />
                    <label htmlFor='terms-agree'>
                        <FormattedMessage id={'terms-agree-text'}>{txt => txt}</FormattedMessage>
                        &nbsp;
                        <Link to={'/terms'} target='_black'>
                            <FormattedMessage id={'terms-agree-link'}>{txt => txt}</FormattedMessage>
                        </Link>
                    </label>
                </div>
                }
                <Button
                    disabled={disabled}
                    color={color}
                    className={`editor-${action}-button`}
                    onClick={() => confirmAction ? this.confirmEventAction : customAction()}
                >
                    <FormattedMessage id={buttonLabel}>{txt => txt}</FormattedMessage>
                </Button>
            </Fragment>
        )
    }

    /**
     * Return Button that has a tooltip
     * @see getButton
     * @param {string} explanationId
     * @param {boolean} showTermsCheckbox
     * @param {string} buttonLabel
     * @param {boolean} disabled
     * @returns {*}
     */
    getToolTip(explanationId,showTermsCheckbox, buttonLabel, disabled) {
        const {intl} = this.props;
        return (
            <Tooltip title={intl.formatMessage({id: explanationId})}>
                <span>
                    {this.getButton(showTermsCheckbox, buttonLabel, disabled)}
                </span>
            </Tooltip>
        )
    }

    /**
     * Returns string based on action
     * @param {string} action
     * @returns {string}
     */
    getButtonColor(action) {
        // this is not currently in use, see getButton() for further details
        if (action === 'publish' || action.includes('update') || action === 'edit') {
            return 'primary';
        } else if (action === 'cancel' || action === 'delete') {
            return 'secondary';
        } else {
            return 'default';
        }
    }

    render() {
        const {
            editor,
            user,
            action,
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


        const buttonLabel = customButtonLabel || getButtonLabel(action, isRegularUser, isDraft, eventIsPublished, formHasSubEvents);

        if (action === 'postpone' && isPostponed) {
            disabled = true;
        }

        return (
            <Fragment>
                {disabled && explanationId
                    ? this.getToolTip(explanationId, showTermsCheckbox,buttonLabel,disabled)
                    : this.getButton(showTermsCheckbox, buttonLabel,disabled)
                }
            </Fragment>
        )
    }
}

EventActionButton.defaultProps = {
    event: {},
    subEvents: [],
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
