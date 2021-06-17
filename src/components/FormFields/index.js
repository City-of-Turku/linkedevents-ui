import './index.scss'

import PropTypes from 'prop-types';
import React from 'react'
import {FormattedMessage} from 'react-intl'
import CopyToClipboard from 'react-copy-to-clipboard'
import {
    MultiLanguageField,
    HelTextField,
    HelLabeledCheckboxGroup,
    HelLanguageSelect,
    HelSelect,
    HelOffersField,
    NewEvent,
    HelKeywordSelector,
} from 'src/components/HelFormFields'
import RecurringEvent from 'src/components/RecurringEvent'
import {Button, Form, FormGroup, Collapse, UncontrolledCollapse} from 'reactstrap';
import {mapKeywordSetToForm, mapLanguagesSetToForm} from '../../utils/apiDataMapping'
import {setEventData, setData, clearValue} from '../../actions/editor'
import {get, isNull, isString, pickBy} from 'lodash'
import API from '../../api'
import CONSTANTS from '../../constants'
import OrganizationSelector from '../HelFormFields/OrganizationSelector';
import UmbrellaSelector from '../HelFormFields/UmbrellaSelector/UmbrellaSelector'
import moment from 'moment'
import HelVideoFields from '../HelFormFields/HelVideoFields/HelVideoFields'
import CustomDateTime from '../CustomFormFields/Dateinputs/CustomDateTime'
import CustomDateTimeField from '../CustomFormFields/Dateinputs/CustomDateTimeField'
import EventMap from '../Map/EventMap';
import classNames from 'classnames';
import ImageGallery from '../ImageGallery/ImageGallery';
import CollapseButton from './CollapseButton/CollapseButton';
import HelCheckbox from '../HelFormFields/HelCheckbox';
import LoginNotification from './LoginNotification/LoginNotification'


let FormHeader = ({type = 'h3', messageID}) => {
    const headerElement = (content) => React.createElement(type, {className: 'col-sm-12'}, content)
    return(
        <div className="row">
            <FormattedMessage id={messageID}>{txt => headerElement(txt)}</FormattedMessage>
        </div>
    )
}
FormHeader.propTypes = {
    type: PropTypes.string,
    messageID: PropTypes.string,
}


export const SideField = (props) => (
    <div className='side-field col-sm-5'>
        <div className='tip' aria-label={props.label}>
            {props.children}
        </div>
    </div>
)

SideField.propTypes = {
    label: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
}

class FormFields extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectEventType: '',
            showNewEvents: true,
            showRecurringEvent: false,
            mapContainer: null,
            openMapContainer: false,
            availableLocales: [],
            headerPrices: false,
            headerSocials: false,
            headerCategories: false,
            headerInlanguage: false,
            headerCourses: false,
            headerLocationDate: false,
            headerImage: false,
            displayEvents: true,
        }

        this.handleOrganizationChange = this.handleOrganizationChange.bind(this)
        this.toggleHeader = this.toggleHeader.bind(this)
    }

    componentDidMount() {
        const {action, editor} = this.props;
        const availableLanguages = editor.languages;
        const availableLocales = availableLanguages.reduce((total, lang) => [...total, lang.id], []);
        // set default value for organization if user is creating new event
        if (action === 'create') {
            this.setDefaultOrganization()
        }

        this.setState({availableLocales: availableLocales});
    }

    /**
     * If event location was previously selected and then cleared/removed,
     * this toggles openMapContainer to false -> closes the Map component.
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.editor.values.location !== null && this.props.editor.values.location === null) {
            this.setState({openMapContainer: false});
        }
        if ((Object.keys(prevProps.editor.validationErrors).length === 0) && (Object.keys(this.props.editor.validationErrors).length > 0)) {
            this.setState({headerPrices: true, headerSocials: true, headerCategories: true, headerInlanguage: true, headerLocationDate: true, headerImage: true});
        }
        if (prevState.selectEventType === 'recurring' && Object.keys(this.props.editor.values.sub_events).length === 0) {
            this.toggleEventType({target: {value: 'single'}})
        }

    }

    handleSetMapContainer = (mapContainer) => {
        this.setState({mapContainer});
    }

    UNSAFE_componentWillReceiveProps() {
        this.forceUpdate()
    }

    shouldComponentUpdate() {
        return true
    }

    showRecurringEventDialog() {
        this.setState({showRecurringEvent: !this.state.showRecurringEvent})
    }

    // Replace with more proper functionality - preferably something that will hide the button if event length == 0.
    showEventList() {
        this.setState({displayEvents: !this.state.displayEvents})
    }

    showNewEventDialog() {
        this.setState({showNewEvents: !this.state.showNewEvents})
    }

    setDefaultOrganization = () => {
        const {user} = this.props;

        if (isNull(user)) {
            return
        }

        const userType = get(user, 'userType')
        const defaultOrganizationData = get(user, [`${userType}OrganizationData`, `${user.organization}`], {})

        this.context.dispatch(setData({organization: defaultOrganizationData.id}));
    }

    handleOrganizationChange(event){
        const {value} = event.target
        event.preventDefault()
        if(value){
            this.context.dispatch(setData({organization: value}))
        }
    }

    addNewEventDialog(recurring = false) {
        let subEventKeys = Object.keys(this.props.editor.values.sub_events)
        let key = subEventKeys.length > 0 ? Math.max.apply(null, subEventKeys) + 1 : 0
        const newEventObject = {[key]: {start_time: undefined}}
        this.context.dispatch(setEventData(newEventObject, key))
        if (recurring) {
            const newObj = {[key + 1]: {start_time: undefined}}
            this.context.dispatch(setEventData(newObj, key + 1))
        }
    }

    generateNewEventFields(events) {
        const {validationErrors} = this.props.editor;
        const subEventErrors = {...validationErrors.sub_events} || {}

        let newEvents = []
        const keys = Object.keys(events)
        const lastKey = keys[keys.length - 1]

        for (const key in events) {
            if (events.hasOwnProperty(key)) {
                newEvents.push(
                    <NewEvent
                        length={newEvents.length + 1}
                        key={key}
                        eventKey={key}
                        event={events[key]}
                        errors={subEventErrors[key] || {}}
                        setInitialFocus={key === lastKey ? true : false}
                        subErrors={this.props.editor.validationErrors}
                    />
                )
            }
        }

        return newEvents
    }

    trimmedDescription() {
        let descriptions = Object.assign({}, this.props.editor.values['description'])
        for (const lang in descriptions) {
            if (descriptions[lang] !== null) {
                descriptions[lang] = descriptions[lang].replace(/<\/p><p>/gi, '\n\n').replace(/<br\s*[\/]?>/gi, '\n').replace(/<p>/g, '').replace(/<\/p>/g, '').replace(/&amp;/g, '&')
            }
        }
        return descriptions
    }

    /**
     * If event location has been selected then openMapContainer state is toggled true/false
     */
    toggleMapContainer() {
        if(this.props.editor.values.location) {
            this.setState({openMapContainer: !this.state.openMapContainer})
        }
    }

    toggleHeader(e) {
        if (e.target.id) {
            this.setState({[e.target.id]: !this.state[e.target.id]})
        }
    }

    /**
     *  Change event type between single & recurring ->
     *  Depending on @params event, determine do we show start_time & end_time
     *  or sub_event related values
     */
    toggleEventType = (event) => {
        const type = event.target.value === 'single' ? '' : event.target.value;
        if (event.target.value === 'single') {
            this.context.dispatch(setData({sub_events: {}}))
        } else if (event.target.value === 'recurring' && !this.state.selectEventType) {
            this.context.dispatch(clearValue(['start_time', 'end_time']))
            this.addNewEventDialog(true)
        }
        this.setState({selectEventType: type});
    }

    /**
    * Check that sub_events has property 'start_time' & it's not undefined
    * @param sub_events value
    * @returns boolean
    */
    subEventsContainTime(sub_events) {
        let found = false;
        if (Object.keys(sub_events).length > 0) {
            for(const key in sub_events) {
                if (sub_events[key].hasOwnProperty('start_time') && sub_events[key].start_time !== undefined) {
                    found = true;
                }
            }
        }
        return found;
    }


    render() {
        // Changed keywordSets to be compatible with Turku's backend.
        const currentLocale = this.state.availableLocales.includes(this.context.intl.locale) ? this.context.intl.locale : 'fi';
        const helTargetOptions = mapKeywordSetToForm(this.props.editor.keywordSets, 'turku:audiences', currentLocale)
        const helEventLangOptions = mapLanguagesSetToForm(this.props.editor.languages, currentLocale)

        const {event, superEvent, user, editor} = this.props
        const {values, validationErrors, contentLanguages} = editor
        const formType = this.props.action
        const isSuperEvent = values.super_event_type === CONSTANTS.SUPER_EVENT_TYPE_RECURRING
        const isSuperEventDisable = values.super_event_type === CONSTANTS.SUPER_EVENT_TYPE_UMBRELLA
        const {VALIDATION_RULES, USER_TYPE} = CONSTANTS
        const addedEvents = pickBy(values.sub_events, event => !event['@id'])
        const newEvents = this.generateNewEventFields(addedEvents)
        const maxSubEventCount = CONSTANTS.GENERATE_LIMIT.EVENT_LENGTH
        const userType = get(user, 'userType')
        const isRegularUser = userType === USER_TYPE.REGULAR
        const organizationData = get(user, `${userType}OrganizationData`, {})
        const publisherOptions = Object.keys(organizationData)
            .map(id => ({label: organizationData[id].name, value: id}))
        const subTimeDisable = this.subEventsContainTime(values['sub_events'])
        const selectedPublisher = publisherOptions.find(option => option.value === values['organization']) || {};
        const position = this.props.editor.values.location ? this.props.editor.values.location.position : null;
        const headerTextId = formType === 'update'
            ? 'edit-events'
            : 'create-events'

        return (
            <div className='mainwrapper'>
                {!this.props.user &&
                <div className='row-loginwarning'>
                    <LoginNotification />
                </div>
                }
                <div className='row row-mainheader'>
                    <FormattedMessage id={headerTextId}>{txt => <h1>{txt}</h1>}</FormattedMessage>
                </div>
                <div className="row row-header">
                    <FormattedMessage id='event-add-newInfo'>{txt => <h2>{txt}</h2>}</FormattedMessage>
                    <SideField label={this.context.intl.formatMessage({id: 'event-required-help'})}>
                        <FormattedMessage id='editor-tip-required'/>
                    </SideField>
                </div>
                <FormHeader messageID='event-presented-in-languages'/>
                <FormHeader messageID='event-presented-in-languages2' type='h4'/>
                <div className="row contentlanguage-row">
                    <div className="col-sm-6 highlighted-block">
                        <HelLanguageSelect
                            options={API.eventInfoLanguages()}
                            checked={contentLanguages}
                        />
                    </div>
                </div>
                <FormHeader messageID='event-name-descriptions'/>
                <FormHeader messageID='event-name-descriptions-tip' type='h4'/>
                <div className="row event-row">
                    <div className="col-sm-6">
                        <MultiLanguageField
                            id='event-headline'
                            required={true}
                            multiLine={false}
                            label="event-headline"
                            ref='name'
                            name='name'
                            type='text'
                            validationErrors={validationErrors['name']}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            defaultValue={values['name']}
                            languages={this.props.editor.contentLanguages}
                            setDirtyState={this.props.setDirtyState}
                        />

                        <MultiLanguageField
                            id='event-short-description'
                            required={true} multiLine={true}
                            label="event-short-description"
                            ref="short_description"
                            name="short_description"
                            validationErrors={validationErrors['short_description']}
                            defaultValue={values['short_description']}
                            languages={this.props.editor.contentLanguages}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            setDirtyState={this.props.setDirtyState}
                            forceApplyToStore
                            type='textarea'
                        />
                        <MultiLanguageField
                            id='event-description'
                            multiLine={true}
                            label="event-description"
                            ref="description"
                            name="description"
                            validationErrors={validationErrors['description']}
                            defaultValue={this.trimmedDescription()}
                            languages={this.props.editor.contentLanguages}
                            validations={[VALIDATION_RULES.LONG_STRING]}
                            setDirtyState={this.props.setDirtyState}
                            type='textarea'
                        />
                        <OrganizationSelector
                            formType={formType}
                            options={publisherOptions}
                            selectedOption={selectedPublisher}
                            onChange={this.handleOrganizationChange}
                        />
                        <MultiLanguageField
                            id='event-provider-input'
                            required={false}
                            multiLine={false}
                            label="event-provider-input"
                            ref="provider"
                            name="provider"
                            validationErrors={validationErrors['provider']}
                            defaultValue={values['provider']}
                            validations={[VALIDATION_RULES.SHORT_STRING]}
                            languages={this.props.editor.contentLanguages}
                            setDirtyState={this.props.setDirtyState}
                            type='textarea'
                        />
                    </div>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerLocationDate'
                            isOpen={this.state.headerLocationDate}
                            targetCollapseNameId='event-locationDate-form-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[
                                validationErrors['start_time'],
                                validationErrors['virtualevent_url'], validationErrors['end_time'],
                                validationErrors['location'], validationErrors['location_extra_info'],
                                validationErrors['sub_events']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerLocationDate}>
                        <FormHeader messageID='event-location-form-header'/>
                        <div className="row location-row">
                            <SideField label={this.context.intl.formatMessage({id: 'event-location-fields-header-help'})}>
                                <p><FormattedMessage id="editor-tip-location"/></p>
                                <p><strong><FormattedMessage id="editor-tip-location-internet"/></strong></p>
                                <p><FormattedMessage id="editor-tip-location-not-found"/></p>
                            </SideField>
                            <div className="col-sm-6 hel-select">
                                <div>

                                    <HelCheckbox
                                        name='is_virtualevent'
                                        label={<FormattedMessage id='event-location-virtual'/>}
                                        fieldID='is_virtual'
                                        defaultChecked={values['is_virtualevent']}
                                    />
                                    <HelTextField
                                        validations={[VALIDATION_RULES.IS_URL]}
                                        id='event-location-virtual-url'
                                        ref="event-location-virtual-url"
                                        name="virtualevent_url"
                                        label={this.context.intl.formatMessage({id: 'event-location-virtual-url'})}
                                        validationErrors={validationErrors['virtualevent_url']}
                                        defaultValue={values['virtualevent_url']}
                                        setDirtyState={this.props.setDirtyState}
                                        forceApplyToStore
                                        type='url'
                                        required={values.is_virtualevent}
                                        disabled={!values.is_virtualevent}
                                    />
                                </div>
                                <HelSelect
                                    legend={this.context.intl.formatMessage({id: 'event-location'})}
                                    selectedValue={values['location']}
                                    ref="location"
                                    name="location"
                                    resource="place"
                                    validationErrors={validationErrors['location']}
                                    setDirtyState={this.props.setDirtyState}
                                    optionalWrapperAttributes={{className: 'location-select'}}
                                    currentLocale={currentLocale}
                                    required={!values.is_virtualevent}
                                />
                                <div className='map-button-container'>
                                    <Button
                                        title={position ? null : this.context.intl.formatMessage({id: 'event-location-button-tooltip'})}
                                        aria-pressed={this.state.openMapContainer}
                                        aria-disabled={!position}
                                        id='map-button'
                                        className={classNames('btn btn-link', {disabled: !position})}
                                        onClick={() => this.toggleMapContainer()}
                                    >
                                        <FormattedMessage id={'event-location-button'}>{txt => txt}</FormattedMessage>
                                        <span className={classNames(
                                            'glyphicon',
                                            {'glyphicon-triangle-bottom': this.state.openMapContainer},
                                            {'glyphicon-triangle-top': !this.state.openMapContainer})}
                                        />
                                    </Button>
                                </div>
                                <div aria-expanded={this.state.openMapContainer} className={classNames('map-container', {open: this.state.openMapContainer})} ref={this.handleSetMapContainer}>
                                    {this.state.openMapContainer &&
                                    <EventMap position={position} mapContainer={this.state.mapContainer}/>
                                    }
                                </div>

                                <Form>
                                    <FormGroup className='place-id'>
                                        <label>{this.context.intl.formatMessage({id: 'event-location-id'})}
                                            <span className="form-control" value={values['location'] && values['location'].id ? values['location'].id : ''}>
                                                {values['location'] && values['location'].id ? values['location'].id : ''}
                                            </span>
                                        </label>
                                    </FormGroup>

                                </Form>


                                <CopyToClipboard text={values['location'] ? values['location'].id : ''}>
                                    <button type='button' className="clipboard-copy-button btn btn-default" aria-label={this.context.intl.formatMessage({id: 'copy-location-to-clipboard'})}>
                                        <div hidden>.</div>
                                        <span className="glyphicon glyphicon-duplicate" aria-hidden="true">
                                        </span>
                                    </button>
                                </CopyToClipboard>
                                <MultiLanguageField
                                    id='event-location-additional-info'
                                    multiLine={true}
                                    label="event-location-additional-info"
                                    ref="location_extra_info"
                                    name="location_extra_info"
                                    validationErrors={validationErrors['location_extra_info']}
                                    validations={[VALIDATION_RULES.SHORT_STRING]}
                                    defaultValue={values['location_extra_info']}
                                    languages={this.props.editor.contentLanguages}
                                    setDirtyState={this.props.setDirtyState}
                                    type='textarea'
                                />
                            </div>
                        </div>
                        {formType === 'add' || !isRegularUser &&
                        <React.Fragment>
                            <FormHeader messageID='event-umbrella-header'/>
                            <div className="row umbrella-row">
                                <SideField label={this.context.intl.formatMessage({id: 'event-umbrella-help'})}>
                                    <p><FormattedMessage id="editor-tip-umbrella-selection"/></p>
                                    <p><FormattedMessage id="editor-tip-umbrella-selection1"/></p>
                                </SideField>
                                <div className="col-sm-6">
                                    <UmbrellaSelector editor={this.props.editor} event={event} superEvent={superEvent}/>
                                </div>
                            </div>
                        </React.Fragment>
                        }
                        <FormHeader messageID='event-datetime-form-header'/>
                        <div className='row date-row'>
                            <SideField label={this.context.intl.formatMessage({id: 'event-datetime-fields-header-help'})}>
                                <p><FormattedMessage id="editor-tip-time-start"/></p>
                                <p><FormattedMessage id="editor-tip-time-start-end"/></p>
                                <p><FormattedMessage id="editor-tip-time-type"/></p>
                                <p><FormattedMessage id="editor-tip-time-end"/></p>
                            </SideField>
                            <div className='col-sm-6'>
                                <div className='row radio-row'>
                                    <div className='custom-control custom-radio'>
                                        <input
                                            className='custom-control-input'
                                            id='single'
                                            name='radiogroup'
                                            type='radio'
                                            value='single'
                                            onChange={this.toggleEventType}
                                            checked={!this.state.selectEventType}
                                            disabled={
                                                formType === 'update' ||
                                                        formType === 'add' ||
                                                        isSuperEventDisable ||
                                                        isSuperEvent ||
                                                        subTimeDisable}
                                        />
                                        <label className='custom-control-label' htmlFor='single'>
                                            <FormattedMessage id='event-type-single'/>
                                        </label>
                                    </div>
                                    <div className='custom-control custom-radio'>
                                        <input
                                            className='custom-control-input'
                                            id='recurring'
                                            name='radiogroup'
                                            type='radio'
                                            value='recurring'
                                            checked={this.state.selectEventType}
                                            onChange={this.toggleEventType}
                                            disabled={formType === 'update' ||
                                                    formType === 'add' ||
                                                    isSuperEventDisable ||
                                                    isSuperEvent ||
                                                    values.start_time !== undefined}
                                        />
                                        <label className='custom-control-label' htmlFor='recurring'>
                                            <FormattedMessage id='event-type-recurring'/>
                                        </label>
                                    </div>
                                    { !['update', 'add'].includes(formType) && (subTimeDisable || values.start_time !== undefined) ?
                                        <div className='typetip'>
                                            <FormattedMessage id="editor-tip-eventtype-disable"/>
                                        </div>
                                        : null
                                    }
                                </div>
                                <FormHeader messageID='event-datetime-form-header2' type='h4'/>
                                {!this.state.selectEventType
                                    ?
                                    <div className='col-xs-12 col-sm-12'>
                                        <CustomDateTime
                                            id="start_time"
                                            name="start_time"
                                            labelDate={<FormattedMessage  id="event-starting-datelabel" />}
                                            labelTime={<FormattedMessage  id="event-starting-timelabel" />}
                                            defaultValue={values['start_time']}
                                            setDirtyState={this.props.setDirtyState}
                                            maxDate={values['end_time'] ? moment(values['end_time']) : undefined}
                                            required={true}
                                            disabled={formType === 'update' && isSuperEvent}
                                            validationErrors={validationErrors['start_time']}
                                        />
                                        <CustomDateTime
                                            id="end_time"
                                            disablePast
                                            disabled={formType === 'update' && isSuperEvent}
                                            validationErrors={validationErrors['end_time']}
                                            defaultValue={values['end_time']}
                                            name="end_time"
                                            labelDate={<FormattedMessage  id="event-ending-datelabel" />}
                                            labelTime={<FormattedMessage  id="event-ending-timelabel" />}
                                            setDirtyState={this.props.setDirtyState}
                                            minDate={values['start_time'] ? moment(values['start_time']) : undefined}
                                            required={true}
                                        />
                                    </div>
                                    :
                                    <React.Fragment>
                                        <div className={'new-events ' + (this.state.showNewEvents ? 'show' : 'hidden')}>
                                            <UncontrolledCollapse toggler='#events-list' defaultOpen>
                                                { newEvents }
                                            </UncontrolledCollapse>
                                        </div>
                                        <Button
                                            block
                                            className='btn'
                                            id='events-list'
                                            onClick={() => this.showEventList()}>
                                            {this.state.displayEvents
                                                ? <FormattedMessage id='event-list-hide'/>
                                                : <FormattedMessage id='event-list-show'/>
                                            }
                                        </Button>
                                        {this.state.showRecurringEvent &&
                                                <RecurringEvent
                                                    toggle={() => this.showRecurringEventDialog()}
                                                    isOpen={this.state.showRecurringEvent}
                                                    validationErrors={validationErrors}
                                                    values={values}
                                                    formType={formType}
                                                />
                                        }
                                        <Button
                                            size='lg'block
                                            variant="contained"
                                            disabled={formType === 'update' ||
                                                    formType === 'add' ||
                                                    isSuperEventDisable ||
                                                    newEvents.length >= maxSubEventCount
                                            }
                                            onClick={() => this.addNewEventDialog()}>

                                            <span aria-hidden='true' className="glyphicon glyphicon-plus"/>
                                            <FormattedMessage id="event-add-new-occasion">{txt =>txt}</FormattedMessage>
                                        </Button>

                                        <Button
                                            size='lg' block
                                            variant="contained"
                                            disabled={formType === 'update' ||
                                                    formType === 'add' ||
                                                    isSuperEventDisable ||
                                                    newEvents.length >= maxSubEventCount
                                            }
                                            onClick={() => this.showRecurringEventDialog()}>

                                            <span aria-hidden='true' className="glyphicon glyphicon-refresh"/>
                                            <FormattedMessage id="event-add-recurring">{txt =>txt}</FormattedMessage>
                                        </Button>

                                    </React.Fragment>
                                }
                            </div>
                        </div>
                    </Collapse>
            
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerImage'
                            isOpen={this.state.headerImage}
                            isRequired={true}
                            targetCollapseNameId='event-image-title'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={validationErrors['image']}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerImage}>
                        <div className='row'>
                            <ImageGallery validationErrors={validationErrors['image']} locale={currentLocale}/>
                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerCategories'
                            isOpen={this.state.headerCategories}
                            isRequired={true}
                            targetCollapseNameId='event-category-form-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['keywords'], validationErrors['audience']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerCategories}>
                        <div className="row keyword-row">
                            <HelKeywordSelector
                                editor={editor}
                                intl={this.context.intl}
                                setDirtyState={this.props.setDirtyState}
                                currentLocale={currentLocale}
                            />
                        </div>
                        <div className="row audience-row">
                            <HelLabeledCheckboxGroup
                                groupLabel={<FormattedMessage id="target-groups-header"/>}
                                selectedValues={values['audience']}
                                ref="audience"
                                name="audience"
                                validationErrors={validationErrors['audience']}
                                itemClassName="col-md-12 col-lg-6"
                                options={helTargetOptions}
                                setDirtyState={this.props.setDirtyState}
                            />
                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerPrices'
                            isOpen={this.state.headerPrices}
                            targetCollapseNameId='event-price-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['price'], validationErrors['offer_info_url']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerPrices}>
                        <FormHeader messageID='event-price-fields-header'/>
                        <div className="row offers-row">
                            <div className="col-sm-6">
                                <HelOffersField
                                    ref="offers"
                                    name="offers"
                                    validationErrors={validationErrors}
                                    defaultValue={values['offers']}
                                    languages={this.props.editor.contentLanguages}
                                    setDirtyState={this.props.setDirtyState}
                                />
                            </div>

                        </div>
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerSocials'
                            isOpen={this.state.headerSocials}
                            targetCollapseNameId='event-social-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['info_url'], validationErrors['extlink_facebook'],
                                validationErrors['extlink_twitter'], validationErrors['extlink_instagram']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerSocials}>
                        <div className="row social-media-row">
                            <div className="col-sm-6">
                                <MultiLanguageField
                                    id='event-info-url'
                                    required={false}
                                    multiLine={false}
                                    label="event-info-url"
                                    ref="info_url"
                                    name="info_url"
                                    validationErrors={validationErrors['info_url']}
                                    defaultValue={values['info_url']}
                                    languages={this.props.editor.contentLanguages}
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                />
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id='extlink_facebook'
                                    ref="extlink_facebook"
                                    name="extlink_facebook"
                                    label='Facebook'
                                    validationErrors={validationErrors['extlink_facebook']}
                                    defaultValue={values['extlink_facebook']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                />
                                <i className='facebookIcon' />
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id='extlink_twitter'
                                    ref="extlink_twitter"
                                    name="extlink_twitter"
                                    label='Twitter'
                                    validationErrors={validationErrors['extlink_twitter']}
                                    defaultValue={values['extlink_twitter']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                />
                                <HelTextField
                                    validations={[VALIDATION_RULES.IS_URL]}
                                    id='extlink_instagram'
                                    ref="extlink_instagram"
                                    name="extlink_instagram"
                                    label='Instagram'
                                    validationErrors={validationErrors['extlink_instagram']}
                                    defaultValue={values['extlink_instagram']}
                                    setDirtyState={this.props.setDirtyState}
                                    forceApplyToStore
                                    type='url'
                                    placeholder='https://...'
                                />
                            </div>
                        </div>
                        <HelVideoFields
                            defaultValues={values['videos']}
                            validationErrors={validationErrors}
                            setDirtyState={this.props.setDirtyState}
                            intl={this.context.intl}
                            action={this.props.action}
                        />
                    </Collapse>
                </div>
                <div>
                    <h2>
                        <CollapseButton
                            id='headerInlanguage'
                            isOpen={this.state.headerInlanguage}
                            targetCollapseNameId='hel-event-languages-header'
                            toggleHeader={this.toggleHeader}
                            validationErrorList={[validationErrors['in_language']]}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerInlanguage}>
                        <div className="row inlanguage-row">
                            <HelLabeledCheckboxGroup
                                groupLabel={<FormattedMessage id="hel-event-languages-header2"/>}
                                selectedValues={values['in_language']}
                                ref="in_language"
                                name="in_language"
                                validationErrors={validationErrors['in_language']}
                                itemClassName="col-md-12 col-lg-6"
                                options={helEventLangOptions}
                                setDirtyState={this.props.setDirtyState}
                            />
                        </div>
                    </Collapse>
                </div>
                {appSettings.ui_mode === 'courses' &&
                <div>
                    <h2>
                        <CollapseButton
                            id='headerCourses'
                            isOpen={this.state.headerCourses}
                            targetCollapseNameId='create-courses'
                            toggleHeader={this.toggleHeader}
                        />
                    </h2>
                    <Collapse isOpen={this.state.headerCourses}>
                        <div>
                            <FormHeader messageID='audience-age-restrictions'/>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6">
                                    <HelTextField
                                        ref="audience_min_age"
                                        name="audience_min_age"
                                        label={<FormattedMessage id="audience-min-age"/>}
                                        validationErrors={validationErrors['audience_min_age']}
                                        defaultValue={values['audience_min_age']}
                                        setDirtyState={this.props.setDirtyState}
                                        type='text'
                                    />

                                    <HelTextField
                                        ref="audience_max_age"
                                        name="audience_max_age"
                                        label={<FormattedMessage id="audience-max-age"/>}
                                        validationErrors={validationErrors['audience_max_age']}
                                        defaultValue={values['audience_max_age']}
                                        setDirtyState={this.props.setDirtyState}
                                        type='text'
                                    />
                                </div>
                            </div>

                            <FormHeader messageID='enrolment-time'/>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6">
                                    <CustomDateTimeField
                                        validationErrors={validationErrors['enrolment_start_time']}
                                        defaultValue={values['enrolment_start_time']}
                                        name="enrolment_start_time"
                                        id="enrolment_start_time"
                                        label="enrolment-start-time"
                                        setDirtyState={this.props.setDirtyState}
                                    />
                                    <CustomDateTimeField
                                        validationErrors={validationErrors['enrolment_end_time']}
                                        defaultValue={values['enrolment_end_time']}
                                        name="enrolment_end_time"
                                        id="enrolment_end_time"
                                        label="enrolment-end-time"
                                        setDirtyState={this.props.setDirtyState}
                                    />
                                </div>
                            </div>

                            <FormHeader messageID='attendee-capacity'/>
                            <div className="row">
                                <div className="col-xs-12 col-sm-6">
                                    <HelTextField
                                        ref="minimum_attendee_capacity"
                                        name="minimum_attendee_capacity"
                                        label={<FormattedMessage id="minimum-attendee-capacity"/>}
                                        validationErrors={validationErrors['minimum_attendee_capacity']}
                                        defaultValue={values['minimum_attendee_capacity']}
                                        setDirtyState={this.props.setDirtyState}
                                        type='text'
                                    />

                                    <HelTextField
                                        ref="maximum_attendee_capacity"
                                        name="maximum_attendee_capacity"
                                        label={<FormattedMessage id="maximum-attendee-capacity"/>}
                                        validationErrors={validationErrors['maximum_attendee_capacity']}
                                        defaultValue={values['maximum_attendee_capacity']}
                                        setDirtyState={this.props.setDirtyState}
                                        type='text'
                                    />
                                </div>
                            </div>
                        </div>
                    </Collapse>
                </div>
                }
            </div>
        )
    }
}


FormFields.propTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    showNewEvents: PropTypes.bool,
    showRecurringEvent: PropTypes.bool,
    editor: PropTypes.object,
    event: PropTypes.object,
    superEvent: PropTypes.object,
    user: PropTypes.object,
    setDirtyState: PropTypes.func,
    action: PropTypes.oneOf(['update', 'create', 'add']),
    loading: PropTypes.bool,
}

FormFields.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    showNewEvents: PropTypes.bool,
    showRecurringEvent: PropTypes.bool,
};

export default FormFields
