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
import {Button,Form, FormGroup} from 'reactstrap';
import {mapKeywordSetToForm, mapLanguagesSetToForm} from '../../utils/apiDataMapping'
import {setEventData, setData} from '../../actions/editor'
import {get, isNull, pickBy} from 'lodash'
import API from '../../api'
import CONSTANTS from '../../constants'
import OrganizationSelector from '../HelFormFields/OrganizationSelector';
import UmbrellaSelector from '../HelFormFields/UmbrellaSelector/UmbrellaSelector'
import moment from 'moment'
import HelVideoFields from '../HelFormFields/HelVideoFields/HelVideoFields'
import CustomDateTimeField from '../CustomFormFields/CustomDateTimeField';
import EventMap from '../Map/EventMap';
import classNames from 'classnames';
import ImageGallery from '../ImageGallery/ImageGallery';

// Removed material-ui/icons because it was no longer used.
//Added isOpen for RecurringEvents modal

let FormHeader = (props) => (
    <div className="row">
        <h2 tabIndex='0' className="col-sm-12">{ props.children }</h2>
    </div>
)

FormHeader.propTypes = {
    children: PropTypes.element,
}

export const SideField = (props) => (
    <div className={`side-field col-sm-5 col-sm-push-1 ${ props.className }`} aria-label='text' tabIndex='0'>
        { props.children }
    </div>
)

SideField.propTypes = {
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
            showNewEvents: true,
            showRecurringEvent: false,
            mapContainer: null,
            openMapContainer: false,
            availableLocales: [],

        }
        this.handleOrganizationChange = this.handleOrganizationChange.bind(this)
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

    addNewEventDialog() {
        let subEventKeys = Object.keys(this.props.editor.values.sub_events)
        let key = subEventKeys.length > 0 ? Math.max.apply(null, subEventKeys) + 1 : 1
        const newEventObject = {[key]: {}}
        this.context.dispatch(setEventData(newEventObject, key))
    }

    generateNewEventFields(events) {
        const {validationErrors} = this.props.editor;
        const subEventErrors = validationErrors.sub_events || {}

        let newEvents = []
        for (const key in events) {
            if (events.hasOwnProperty(key)) {
                newEvents.push(
                    <NewEvent
                        key={key}
                        eventKey={key}
                        event={events[key]}
                        errors={subEventErrors[key] || {}}
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
        const userType = get(user, 'userType')
        const isRegularUser = userType === USER_TYPE.REGULAR
        const organizationData = get(user, `${userType}OrganizationData`, {})
        const publisherOptions = Object.keys(organizationData)
            .map(id => ({label: organizationData[id].name, value: id}))

        const selectedPublisher = publisherOptions.find(option => option.value === values['organization']) || {};

        const position = this.props.editor.values.location ? this.props.editor.values.location.position : null;

        return (
            <div>
                <div className="col-sm-12 highlighted-block">
                    <div className="col-xl-4 col-sm-12">
                        <label htmlFor='languages' tabIndex='0'>
                            <FormattedMessage id="event-presented-in-languages"/>
                        </label>
                        <input id='languages' type='hidden'/>
                    </div>
                    <div className="col-xl-8 col-sm-12">
                        <HelLanguageSelect
                            options={API.eventInfoLanguages()}
                            checked={contentLanguages}
                        />
                    </div>
                </div>

                <FormHeader>
                    <FormattedMessage id="event-description-fields-header"/>
                </FormHeader>


                <div className="row event-row">
                    <SideField>
                        <div className="tip">
                            <p><FormattedMessage id="editor-tip-event-description"/></p>
                            <FormattedMessage id="editor-tip-event-description1"/>
                        </div>
                    </SideField>
                    <div className="col-sm-6">
                        <MultiLanguageField
                            id='event-headline'
                            required={true}
                            multiLine={false}
                            label="event-headline"
                            ref='name'
                            name='name'
                            validationErrors={validationErrors['name', 'short_description']}
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
                            required={true}
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
                            type='text'
                        />
                        <OrganizationSelector
                            formType={formType}
                            options={publisherOptions}
                            selectedOption={selectedPublisher}
                            onChange={this.handleOrganizationChange}
                        />
                    </div>
                </div>
                
                <FormHeader>
                    <FormattedMessage id="event-image-title"/>
                </FormHeader>
                <div className='row'>
                    <ImageGallery locale={currentLocale}/>
                </div>
                <FormHeader>
                    <FormattedMessage id="event-umbrella" className=''/>
                </FormHeader>
                <div className="row umbrella-row">
                    <SideField>
                        <div className="tip">
                            <p><FormattedMessage id="editor-tip-umbrella-selection"/></p>
                            <p><FormattedMessage id="editor-tip-umbrella-selection1"/></p>
                            <FormattedMessage id="editor-tip-umbrella-selection2"/>
                        </div>
                    </SideField>
                    <div className="col-sm-6">
                        {!isRegularUser &&
                                                <UmbrellaSelector editor={this.props.editor} event={event} superEvent={superEvent}/>
                        }
                    </div>
                </div>

                <FormHeader>
                    <FormattedMessage id="event-datetime-fields-header" />
                </FormHeader>
                <div className='row date-row'>
                    <SideField>
                        <div className="tip">
                            <p><FormattedMessage id="editor-tip-time-start"/></p>
                            <p><FormattedMessage id="editor-tip-time-end"/></p>
                            <p><FormattedMessage id="editor-tip-time-multi"/></p>
                            <p><FormattedMessage id="editor-tip-time-delete"/></p>
                        </div>
                    </SideField>
                    <div className='col-sm-6'>
                        <div className='row'>
                            <div className='col-xs-12 col-sm-12'>
                                <CustomDateTimeField
                                    id="start_time"
                                    disabled={formType === 'update' && isSuperEvent}
                                    validationErrors={validationErrors['start_time']}
                                    defaultValue={values['start_time']}
                                    name="start_time"
                                    label={<FormattedMessage  id="event-starting-datetime" />}
                                    setDirtyState={this.props.setDirtyState}
                                    maxDate={values['end_time'] ? moment(values['end_time']) : undefined}
                                    required={true}
                                />
                            </div>
                            <div className="col-xs-12 col-sm-12">
                                <CustomDateTimeField
                                    id="end_time"
                                    disablePast
                                    disabled={formType === 'update' && isSuperEvent}
                                    validationErrors={validationErrors['end_time']}
                                    defaultValue={values['end_time']}
                                    name="end_time"
                                    label={<FormattedMessage  id="event-ending-datetime" />}
                                    setDirtyState={this.props.setDirtyState}
                                    minDate={values['start_time'] ? moment(values['start_time']) : undefined}
                                />
                            </div>
                        </div>
                        <div className={'new-events ' + (this.state.showNewEvents ? 'show' : 'hidden')}>
                            { newEvents }
                        </div>
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
                            disabled={formType === 'update' || isSuperEventDisable}
                            onClick={() => this.addNewEventDialog()}
                        ><span aria-hidden='true' className="glyphicon glyphicon-plus"></span>
                            <FormattedMessage id="event-add-new-occasion" />
                        </Button>
                        <Button
                            size='lg' block
                            variant="contained"
                            disabled={formType === 'update' || isSuperEventDisable}
                            onClick={() => this.showRecurringEventDialog()}

                        ><span aria-hidden='true' className="glyphicon glyphicon-refresh"></span>
                            <FormattedMessage id="event-add-recurring" />
                        </Button>
                    </div>
                </div>

                <FormHeader>
                    <FormattedMessage id="event-location-fields-header" />
                </FormHeader>
                <div className="row location-row">
                    <SideField>
                        <div className="tip">
                            <p><FormattedMessage id="editor-tip-location"/></p>
                            <p><strong><FormattedMessage id="editor-tip-location-internet"/></strong></p>
                            <p><FormattedMessage id="editor-tip-location-extra"/></p>
                            <p><FormattedMessage id="editor-tip-location-not-found"/></p>
                        </div>
                    </SideField>
                    <div className="col-sm-6 hel-select">

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
                            required={true}
                        />
                        <div className='map-button-container'>
                            <Button
                                aria-label={position ? null : this.context.intl.formatMessage({id: 'event-location-button-tooltip'})}
                                aria-pressed={this.state.openMapContainer}
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
                            type='text'
                        />
                    </div>

                </div>

                <FormHeader>
                    <FormattedMessage id="event-price-fields-header" />
                </FormHeader>
                <div className="row offers-row">
                    <SideField>
                        <div className="tip">
                            <p><FormattedMessage id="editor-tip-price"/></p>
                            <p><FormattedMessage id="editor-tip-price-multi"/></p>
                        </div>
                    </SideField>
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

                <FormHeader>
                    <FormattedMessage id="event-social-media-fields-header" />
                </FormHeader>
                <div className="row social-media-row">
                    <SideField><p className="tip"><FormattedMessage id="editor-tip-social-media"/></p></SideField>
                    <div className="col-sm-6">
                        {/* Removed formatted message from label since it was causing accessibility issues */}
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
                            type='text'
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
                            type='text'
                        />
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
                            type='text'
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
                            type='text'
                        />
                    </div>
                </div>

                <FormHeader>
                    <FormattedMessage id="event-categorization" />
                </FormHeader>
                <div className="row keyword-row">
                    <HelKeywordSelector
                        editor={editor}
                        intl={this.context.intl}
                        setDirtyState={this.props.setDirtyState}
                        currentLocale={currentLocale}
                    />
                </div>
                <div className="row audience-row">
                    <SideField><p className="tip"><FormattedMessage id="editor-tip-hel-target-group"/></p></SideField>
                    <HelLabeledCheckboxGroup
                        groupLabel={<FormattedMessage id="hel-target-groups"/>}
                        selectedValues={values['audience']}
                        ref="audience"
                        name="audience"
                        validationErrors={validationErrors['audience']}
                        itemClassName="col-md-12 col-lg-6"
                        options={helTargetOptions}
                        setDirtyState={this.props.setDirtyState}
                    />
                    <SideField><p className="tip"><FormattedMessage id="editor-tip-event-languages"/></p></SideField>
                    <HelLabeledCheckboxGroup
                        groupLabel={<FormattedMessage id="hel-event-languages"/>}
                        selectedValues={values['in_language']}
                        ref="in_language"
                        name="in_language"
                        validationErrors={validationErrors['in_language']}
                        itemClassName="col-md-12 col-lg-6"
                        options={helEventLangOptions}
                        setDirtyState={this.props.setDirtyState}
                    />

                </div>

                <FormHeader>
                    <FormattedMessage id="event-video"/>
                </FormHeader>
                <HelVideoFields
                    defaultValues={values['videos']}
                    validationErrors={validationErrors}
                    setDirtyState={this.props.setDirtyState}
                    intl={this.context.intl}
                    action={this.props.action}
                />

                {appSettings.ui_mode === 'courses' &&
                    <div>
                        <FormHeader>
                            <FormattedMessage id="audience-age-restrictions"/>
                        </FormHeader>
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

                        <FormHeader>
                            <FormattedMessage id="enrolment-time"/>
                        </FormHeader>
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

                        <FormHeader>
                            <FormattedMessage id="attendee-capacity"/>
                        </FormHeader>
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
    action: PropTypes.oneOf(['update', 'create']),
    loading: PropTypes.bool,
}

FormFields.contextTypes = {
    intl: PropTypes.object,
    dispatch: PropTypes.func,
    showNewEvents: PropTypes.bool,
    showRecurringEvent: PropTypes.bool,
};

export default FormFields
