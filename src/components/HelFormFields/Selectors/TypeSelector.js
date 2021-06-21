import PropTypes from 'prop-types';
import React from 'react'
import {setData, clearValue} from '../../../actions/editor'
import {FormattedMessage, injectIntl} from 'react-intl'
import {get, isNull, isUndefined} from 'lodash'
import SelectorRadio from './SelectorRadio';

import constants from '../../../constants'
import {getFirstMultiLanguageFieldValue} from '../../../utils/helpers';


class TypeSelector extends React.Component {

    state = {
        isCreateView: false,
        type: '',
    }

    componentDidMount() {
        this.handleMount()
    }

    componentDidUpdate(prevProps, prevState) {
        this.handleUpdate(prevState)
    }


    handleMount = () => {
        const {event:{type_id}} = this.props
        const editedEventIsAnTypeEvent = type_id === 1
        const editedEventIsAnTypeCourse = type_id === 2
        const editedEventIsAnTypeHobby = type_id === 3
        let type = ''
        if (editedEventIsAnTypeEvent) {
            type = 'event'
        }
        if (editedEventIsAnTypeCourse) {
            type = 'courses'
        }
        if (editedEventIsAnTypeHobby) {
            type = 'hobby'
        }
        this.setState({type: type})
    }
    /**
     * Handles the updating of the state based on changes.
     * @param prevState Previous state
     */
    handleUpdate = (prevState = {}) => {
        const {type, isCreateView} = this.state
        const {router} = this.context.store.getState()

        const {editor: {values}, event} = this.props

        // object containing the updated states
        let stateToSet = {}

        // whether we are creating a new event. used to help determine the radio disabled state
        const updatedIsCreateView = get(router, ['location' ,'pathname'], '').includes('/event/create/new')
        const superEventIsNotNull = get(event, 'super_event_type') !== null
        const editedEventIsAnTypeEvent = get(event, 'type_id') === 1
        const editedEventIsAnTypeCourse = get(event, 'type_id') === 2
        const editedEventIsAnTypeHobby = get(event, 'type_id') === 3
        // update the isCreateView according to whether we're creating a new event or updating an existing one
        if (updatedIsCreateView !== isCreateView) {
            stateToSet.isCreateView = updatedIsCreateView
        }
        console.log(superEventIsNotNull, 'superevent')
        console.log(updatedIsCreateView, 'createview')
        if(updatedIsCreateView && superEventIsNotNull && type === '') {
            stateToSet.type = 'event'
            this.context.dispatch(setData({type_id: 1}))
        }

        if (!updatedIsCreateView
            && editedEventIsAnTypeEvent
        ) {
            stateToSet.type = 'event'
        }
        if (!updatedIsCreateView
            && editedEventIsAnTypeCourse) {
            stateToSet.type = 'courses'
        }
        if (!updatedIsCreateView
            && editedEventIsAnTypeHobby
        ) {
            stateToSet.type = 'hobby'
        }

        if (Object.keys(stateToSet).length > 0 && type === '') {
            this.setState({...prevState,...stateToSet})
        }
    }


    /**
     * Handles radio changes
     * 'event'
     * if value === 'event', set state.isUmbrellaEvent: true, state.hasUmbrellaEvent: false and set empty obj to state.selectedUmbrellaEvent.
     * finally dispatch setData(super_event_type: 'umbrella') and clearValue( 'super_event','sub_event_type')
     *
     * 'courses'
     * if value === 'has_umbrella', set state.hasUmbrellaEvent: true, state.isUmbrellaEvent: false
     * if event.super_event_type !== 'recurring', dispatch clearValue('sub_event_type')
     *
     * 'hobby'
     * if value === 'is_independent', set state.isUmbrellaEvent & state.hasUmbrellaEvent: false and set empty obj to state.selectedUmbrellaEvent
     * if event.super_event_type !== 'recurring', dispatch clearValue('super_event', 'sub_event_type')
     * else dispatch clearValue('super_event_type')
     * @param event Event
     */
    handleCheck = event => {
        const {value} = event.target
        const {editor: {values}} = this.props
        let states = {}
        const typeId = {}
        if (value === 'event') {
            states = {type: 'event'};
            typeId.type_id = 1
        }
        else if (value === 'courses') {
            states = {type: 'courses'};
            typeId.type_id = 2
        }
        else if (value === 'hobby') {
            states = {type: 'hobby'};
            typeId.type_id = 3
        }
        this.context.dispatch(setData(typeId))
        this.setState(states);
    }


    render() {
        const {type, isCreateView} = this.state
        const {event} = this.props

        return (
            <div className="type-row row">
                <div className="col-sm-6">
                    <div className='custom-control-radio'>
                        <SelectorRadio
                            aria-label='Tapahtuma'
                            value='event'
                            checked={type === 'event'}
                            handleCheck={this.handleCheck}
                            messageID='Tapahtuma'
                            disabled={!isCreateView}
                            name='TypeGroup'
                        >

                        </SelectorRadio>
                        <SelectorRadio
                            aria-label='Kurssi'
                            value='courses'
                            checked={type === 'courses'}
                            disabled={!isCreateView}
                            handleCheck={this.handleCheck}
                            messageID='Kurssi'
                            name='TypeGroup'
                        >
                        </SelectorRadio>

                        <SelectorRadio
                            aria-label='Harrastus'
                            value='hobby'
                            checked={type === 'hobby'}
                            disabled={!isCreateView}
                            handleCheck={this.handleCheck}
                            messageID='Harrastus'
                            name='TypeGroup'
                        >
                        </SelectorRadio>
                    </div>
                </div>
            </div>
        )
    }
}

TypeSelector.propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
    editor: PropTypes.object,
    event: PropTypes.object,
    isCreateView: PropTypes.bool,
    isUmbrellaEvent: PropTypes.bool,
    hasUmbrellaEvent: PropTypes.bool,
    editedEventIsSubEvent: PropTypes.bool,
}

TypeSelector.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    store: PropTypes.object,
};
export {TypeSelector as UnconnectedTypeSelector}
export default injectIntl(TypeSelector)
