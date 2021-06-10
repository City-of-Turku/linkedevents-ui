import PropTypes from 'prop-types';
import React from 'react'
import AsyncSelect from 'react-select/async'
import {createFilter} from 'react-select'
import client from '../../../api/client'
import {setData, clearValue} from '../../../actions/editor'
import {FormattedMessage, injectIntl} from 'react-intl'
import {get, isNull, isUndefined} from 'lodash'
import UmbrellaRadio from './UmbrellaRadio';
import {Link} from 'react-router-dom'
import {getFirstMultiLanguageFieldValue, scrollToTop} from '../../../utils/helpers'
import constants from '../../../constants'
import {getSuperEventId} from '../../../utils/events'
import {HelSelectStyles, HelSelectTheme} from '../../../themes/react-select'

class UmbrellaSelector extends React.Component {

    state = {
        showSelectTip: true,
        isCreateView: false,
        isUmbrellaEvent: false,
        hasUmbrellaEvent: false,
        superEventSuperEventType: null,
        selectedUmbrellaEvent: {},
    }

    componentDidMount() {
        this.handleUpdate()
    }

    componentDidUpdate(prevProps, prevState) {
        this.handleUpdate(prevState)
    }

    /**
     * Returns the dropdown options for the select component based on given input
     * @param input Search text
     * @returns Dropdown options for the select component
     */
    async getOptions(input) {
        try {
            const response = await client.get('event', {super_event_type: 'umbrella', text: input})
            return response.data.data.map(item => ({label: getFirstMultiLanguageFieldValue(item.name), value: item['@id']}))
        } catch (error) {
            new Error(error)
        }
    }

    /**
     * Handles the updating of the state based on changes.
     * @param prevState Previous state
     */
    handleUpdate = (prevState = {}) => {
        const {isUmbrellaEvent, hasUmbrellaEvent, isCreateView, superEventSuperEventType} = this.state
        const {router} = this.context.store.getState()
        const {editor: {values}, event, superEvent} = this.props

        // object containing the updated states
        let stateToSet = {}

        // whether we are creating a new event. used to help determine the radio disabled state
        const updatedIsCreateView = get(router, ['location' ,'pathname'], '').includes('/event/create/new')
        // flag for whether the event being edited is an umbrella type event
        const editedEventIsAnUmbrellaEvent = get(event, 'super_event_type') === constants.SUPER_EVENT_TYPE_UMBRELLA
        // the type of the super event of the event that is being edited
        const updatedSuperEventType = get(superEvent, 'super_event_type', null)
        // flag for whether the super event of the event being edited is an umbrella type event
        const superEventIsAnUmbrellaEvent = superEventSuperEventType === constants.SUPER_EVENT_TYPE_UMBRELLA

        // set the type of the super event that the edited event belongs to
        if (updatedSuperEventType !== superEventSuperEventType) {
            stateToSet.superEventSuperEventType = updatedSuperEventType
        }
        // update the isCreateView according to whether we're creating a new event or updating an existing one
        if (updatedIsCreateView !== isCreateView) {
            stateToSet.isCreateView = updatedIsCreateView
        }
        // set the 'is_umbrella' radio as checked if:
        //  - the event being edited is an umbrella event
        //  - the form super event type value is not null (it's null if the user un-checks the 'is_umbrella' radio)
        if (!updatedIsCreateView
            && (editedEventIsAnUmbrellaEvent && !isNull(values.super_event_type))
            && prevState.isUmbrellaEvent === isUmbrellaEvent
            && isUmbrellaEvent !== editedEventIsAnUmbrellaEvent
        ) {
            stateToSet.isUmbrellaEvent = true
        }
        // uncheck 'is_umbrella' radio when the editor has multiple dates
        if (updatedIsCreateView
            && isUmbrellaEvent
            && Object.keys(values.sub_events).length > 0
        ) {
            stateToSet.isUmbrellaEvent = false
            this.context.dispatch(setData({super_event_type: null}))
        }
        // uncheck 'is_umbrella' radio, when switching from update to create
        if (updatedIsCreateView
            && isCreateView !== updatedIsCreateView
            && isUmbrellaEvent
            && prevState.isUmbrellaEvent === isUmbrellaEvent
        ) {
            stateToSet.isUmbrellaEvent = false
        }
        // set the 'has_umbrella' radio as checked, if:
        //  - the event being edited has a super event with the super event type 'umbrella'
        //  - the form super event value is not null (it's null if the user un-checks the 'has_umbrella' radio)
        if (!hasUmbrellaEvent
            && prevState.hasUmbrellaEvent === hasUmbrellaEvent
            && (superEventIsAnUmbrellaEvent && !isNull(values.super_event))
        ) {
            stateToSet = {
                ...stateToSet,
                hasUmbrellaEvent: true,
                selectedUmbrellaEvent: {
                    label: getFirstMultiLanguageFieldValue(superEvent.name),
                    value: superEvent['@id'],
                },
            }
        }
        // uncheck 'has_umbrella' radio and clear the selected umbrella event, when switching from update to create
        if (updatedIsCreateView
            && isCreateView !== updatedIsCreateView
            && hasUmbrellaEvent
            && prevState.hasUmbrellaEvent === hasUmbrellaEvent
        ) {
            stateToSet = {
                ...stateToSet,
                hasUmbrellaEvent: false,
                selectedUmbrellaEvent: {},
            }
        }

        // finally set the states if any of them need updating
        if (Object.keys(stateToSet).length > 0) {
            this.setState(stateToSet)
        }
    }

    /**
     * Handles radio changes
     * 'is_umbrella'
     * if value === 'is_umbrella', set state.isUmbrellaEvent: true, state.hasUmbrellaEvent: false and set empty obj to state.selectedUmbrellaEvent.
     * finally dispatch setData(super_event_type: 'umbrella') and clearValue( 'super_event','sub_event_type')
     *
     * 'has_umbrella'
     * if value === 'has_umbrella', set state.hasUmbrellaEvent: true, state.isUmbrellaEvent: false
     * if event.super_event_type !== 'recurring', dispatch clearValue('sub_event_type')
     *
     * 'is_independent'
     * if value === 'is_independent', set state.isUmbrellaEvent & state.hasUmbrellaEvent: false and set empty obj to state.selectedUmbrellaEvent
     * if event.super_event_type !== 'recurring', dispatch clearValue('super_event', 'sub_event_type')
     * else dispatch clearValue('super_event_type')
     * @param event Event
     */
    handleCheck = event => {
        const {value} = event.target
        const {editor: {values}} = this.props
        let states = {}
        let clearValues = []
        if (value === 'is_umbrella') {
            states = {isUmbrellaEvent: true, hasUmbrellaEvent: false, selectedUmbrellaEvent: {}};
            this.context.dispatch(setData({super_event_type: 'umbrella'}))
            clearValues.push('super_event','sub_event_type')
        }
        else if (value === 'has_umbrella') {
            states = {hasUmbrellaEvent: true, isUmbrellaEvent: false};
            if (values.super_event_type !== 'recurring') {
                clearValues.push('super_event_type')
            }
        }
        else if (value === 'is_independent') {
            states = {isUmbrellaEvent: false, hasUmbrellaEvent: false, selectedUmbrellaEvent: {}};
            if (values.super_event_type !== 'recurring') {
                clearValues.push('super_event_type')
            } else {
                clearValues.push('super_event', 'sub_event_type')
            }
        }
        this.setState(states);
        this.context.dispatch(clearValue(clearValues))
    }
    
    /**
     * Handles select changes
     * @param selectedEvent Data for the selected event
     * sub_event_type to umbrella as selected super event is umbrella
     */
        handleChange = selectedEvent => {
            if (isNull(selectedEvent)) {
                this.setState({
                    selectedUmbrellaEvent: {},
                })
                this.context.dispatch(clearValue(['super_event', 'sub_event_type']))
            } else {
                this.context.dispatch(setData({super_event: {'@id': selectedEvent.value}, sub_event_type: constants.SUB_EVENT_TYPE_UMBRELLA}))
                this.setState({selectedUmbrellaEvent: selectedEvent})
            }
        }

    /**
     * Returns the disabled state for the umbrella radios
     *
     * The 'is_independent' radio should be disabled when:
     *  - The event being edited is an umbrella event with sub events
     *  - The event being edited is an umbrella event
     *  - The event being edited is an sub event of a super (recurring) event
     *
     * The 'is_umbrella' radio should be disabled when:
     *  - The event being edited is an umbrella event with sub events
     *  - The event being edited is a sub event of an umbrella event
     *  - The event being edited is a super (recurring) event
     *  - The event being edited is a sub event of a super (recurring) event
     *  - When creating a new event and the form has more than one event date(sub events) defined for it
     *
     * The 'has_umbrella' radio should be disabled when:
     *  - The event being edited is an umbrella event
     *  - The event being edited is a sub event of a super (recurring) event
     *
     * @param value                  Value of the radio
     * @param editedEventIsSubEvent Whether the event being edited is a sub event
     * @returns {boolean}           Whether the radio should be disabled
     */
    getDisabledState = (value, editedEventIsSubEvent) => {
        const {isCreateView, superEventSuperEventType} = this.state
        const {event, editor: {values}} = this.props
        const editedEventIsAnUmbrellaEvent = get(event, 'super_event_type') === constants.SUPER_EVENT_TYPE_UMBRELLA
        const editedEventIsARecurringEvent = get(event, 'super_event_type') === constants.SUPER_EVENT_TYPE_RECURRING
        const editedEventHasSubEvents = get(event, 'sub_events', []).length > 0
        if (value === 'is_independent') {
            return isCreateView
                ? false
                : ((editedEventIsAnUmbrellaEvent && editedEventHasSubEvents && !isNull(values.super_event))
                    || editedEventIsAnUmbrellaEvent
                    || (editedEventIsSubEvent && !isNull(values.super_event)))
        }
        if (value === 'is_umbrella') {
            return isCreateView
                ? Object.keys(values.sub_events).length > 0
                : ((editedEventIsAnUmbrellaEvent && editedEventHasSubEvents && !isNull(values.super_event))
                    || editedEventIsARecurringEvent
                    || (editedEventIsSubEvent && !isNull(values.super_event)))
        }
        if (value === 'has_umbrella') {
            return isCreateView
                ? false
                : ((editedEventIsAnUmbrellaEvent && !isNull(values.super_event_type))
                    || superEventSuperEventType === constants.SUPER_EVENT_TYPE_RECURRING)
        }
    }

    /**
     * Hides the tip text below the select component
     */
    hideSelectTip = () => this.setState({showSelectTip: false})

    render() {
        const {showSelectTip, selectedUmbrellaEvent, isUmbrellaEvent, hasUmbrellaEvent, superEventSuperEventType} = this.state
        const {event} = this.props
        // the super event id of the event that is being edited
        const superEventId = getSuperEventId(event)
        // whether the event being edited is a sub event
        const editedEventIsSubEvent = !isUndefined(superEventId)

        return (
            <div className="row">
                <div className="col-sm-6">
                    <div className='custom-control-radio'>
                        <UmbrellaRadio
                            aria-label={this.context.intl.formatMessage({id: `event-is-independent`})}
                            value="is_independent"
                            checked={!isUmbrellaEvent && !hasUmbrellaEvent}
                            handleCheck={this.handleCheck}
                            messageID='event-is-independent'
                            disabled={this.getDisabledState('is_independent', editedEventIsSubEvent)}
                        >

                        </UmbrellaRadio>
                        <UmbrellaRadio
                            aria-label={this.context.intl.formatMessage({id: `event-is-umbrella`})}
                            value="is_umbrella"
                            checked={isUmbrellaEvent}
                            disabled={this.getDisabledState('is_umbrella', editedEventIsSubEvent)}
                            handleCheck={this.handleCheck}
                            messageID='event-is-umbrella'
                        >
                        </UmbrellaRadio>

                        <UmbrellaRadio
                            aria-label={this.context.intl.formatMessage({id: `event-has-umbrella`})}
                            value="has_umbrella"
                            checked={hasUmbrellaEvent}
                            disabled={this.getDisabledState('has_umbrella', editedEventIsSubEvent)}
                            handleCheck={this.handleCheck}
                            messageID='event-has-umbrella'
                        >
                        </UmbrellaRadio>
                    </div>
                    {hasUmbrellaEvent &&
                    <React.Fragment>
                        <AsyncSelect
                            isClearable
                            defaultOptions
                            value={selectedUmbrellaEvent}
                            loadOptions={this.getOptions}
                            onFocus={this.hideSelectTip}
                            onChange={this.handleChange}
                            placeholder={this.context.intl.formatMessage({id: 'select'})}
                            loadingMessage={() => this.context.intl.formatMessage({id: 'loading'})}
                            noOptionsMessage={() => this.context.intl.formatMessage({id: 'search-no-results'})}
                            filterOption={createFilter({ignoreAccents: false})}
                            styles={HelSelectStyles}
                            theme={HelSelectTheme}
                        />
                        {showSelectTip &&
                            <span><small><FormattedMessage id="event-has-umbrella-select-tip"/></small></span>
                        }
                    </React.Fragment>
                    }
                </div>
                {editedEventIsSubEvent && superEventId && superEventSuperEventType === constants.SUPER_EVENT_TYPE_RECURRING &&
                <div className="side-field-umbrella highlighted-block">
                    <React.Fragment>
                        <FormattedMessage id="editor-tip-umbrella-sub-event"/>
                        <Link
                            to={`/event/update/${superEventId}`}
                            onClick={scrollToTop}
                        >
                            <FormattedMessage id="editor-tip-umbrella-sub-event-link"/>.</Link>
                    </React.Fragment>
                </div>
                }
            </div>
        )
    }
}

UmbrellaSelector.propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    superEvent: PropTypes.object,
    showSelectTip: PropTypes.bool,
    isCreateView: PropTypes.bool,
    isUmbrellaEvent: PropTypes.bool,
    hasUmbrellaEvent: PropTypes.bool,
    editedEventIsSubEvent: PropTypes.bool,
    superEventSuperEventType: PropTypes.oneOf([
        constants.SUPER_EVENT_TYPE_RECURRING,
        constants.SUPER_EVENT_TYPE_UMBRELLA,
    ]),
    selectedUmbrellaEvent: PropTypes.shape({
        label: PropTypes.string,
        value: PropTypes.string,
    }),
}

UmbrellaSelector.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
};
export {UmbrellaSelector as UnconnectedUmbrellaSelector}
export default injectIntl(UmbrellaSelector)
