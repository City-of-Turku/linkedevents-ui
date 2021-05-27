import React from 'react'
import {shallow} from 'enzyme';
import FormFields, {SideField} from './index'
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
import {
    MultiLanguageField,
    HelTextField,
    HelLabeledCheckboxGroup,
    HelLanguageSelect,
    HelSelect,
    HelCheckbox,
    HelOffersField,
    HelKeywordSelector,
} from 'src/components/HelFormFields'
import RecurringEvent from 'src/components/RecurringEvent'
import {Button,Collapse} from 'reactstrap';
import {mapKeywordSetToForm, mapLanguagesSetToForm} from '../../utils/apiDataMapping'
import {setEventData, setData, clearValue} from '../../actions/editor'
import {merge} from 'lodash'
import API from '../../api'
import CONSTANTS from '../../constants'
import OrganizationSelector from '../HelFormFields/OrganizationSelector';
import UmbrellaSelector from '../HelFormFields/UmbrellaSelector/UmbrellaSelector'
import HelVideoFields from '../HelFormFields/HelVideoFields/HelVideoFields'
import CustomDateTime from '../CustomFormFields/Dateinputs/CustomDateTime'
import EventMap from '../Map/EventMap';
import ImageGallery from '../ImageGallery/ImageGallery';
import {mockKeywordSets, mockLanguages, mockUser, mockUserEvents} from '__mocks__/mockData';
import CollapseButton from './CollapseButton/CollapseButton';


const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const mockEvent = mockUserEvents[0];
const {SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA, VALIDATION_RULES, USER_TYPE} = CONSTANTS
const dispatch = jest.fn()
jest.mock('../../actions/editor');

describe('FormField', () => {
    const defaultProps = {
        intl,
        selectedOption: {},
        action: 'create',
        user: mockUser,
        event: mockEvent,
        toggle: () => null,
        options: [],
        editor: {
            mockKeywordSets,
            values: {
                name: {},
                provider: {},
                short_description: {},
                description: {},
                location_extra_info: {},
                info_url: {},
                extlink_facebook: '',
                extlink_twitter: '',
                extlink_instagram: '',
                sub_events: {},
                audience: {},
                in_language: {},
                location: {
                    position: {},
                },
                virtualevent_url: '',
                offers: [],
                videos: [],
                start_time: '',
                end_time: '',
                super_event_type: [SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA],
            },
            validationErrors: {
                sub_events: {},
                name: {},
                provider: {},
                short_description: {},
                location_extra_info: {},
                info_url: {},
                description: {},
                extlink_facebook: {},
                extlink_twitter: {},
                extlink_instagram: {},
                audience: {},
                in_language: {},
                location: {},
                start_time: {},
                end_time: {},
                virtualevent_url: {},
                image: {},
            },
            contentLanguages: [
            ],
            languages: [
                mockLanguages,
            ],
        },
        setDirtyState: () => {},
    }


    function getWrapper(props) {
        return shallow(<FormFields {...defaultProps} {...props} />, {context: {intl, dispatch}});
    }

    describe('methods', () => {
        describe('toggleEventType', () => {
            let wrapper;
            let instance;
            beforeEach(() => {
                clearValue.mockClear()
                wrapper = getWrapper()
                instance = wrapper.instance()
            })

            test('when toggleEventType is recurring', () => {
                instance.toggleEventType({target: {value: 'single'}})
                clearValue.mockClear()
                expect(wrapper.state().selectEventType).toBe('')
                instance.toggleEventType({target: {value: 'recurring'}})
                expect(clearValue).toHaveBeenCalledWith(['start_time', 'end_time'])
            })
            test('when toggleEventType is single', () => {
                const expectedValue = {sub_events: {}}
                instance.toggleEventType({target: {value: 'recurring'}})
                setData.mockClear()
            
                expect(wrapper.state().selectEventType).toBe('recurring')
                instance.toggleEventType({target: {value: 'single'}})
                expect(setData).toHaveBeenCalledWith(expectedValue)
                expect(wrapper.state().selectEventType).toBe('')
            })
        })
        describe('addNewEventDialog', () => {
            let wrapper;
            let instance;
            let subEventKeys = Object.keys(defaultProps.editor.values.sub_events)
            let key = subEventKeys.length > 0 ? Math.max.apply(null, subEventKeys) + 1 : 0
            const newEventObject = {[key]: {start_time: undefined}}
            beforeEach(() => {
                setEventData.mockClear()
                wrapper = getWrapper()
                instance = wrapper.instance()
            })
            test('called while recurring is false', () => {
                instance.addNewEventDialog()
                expect(setEventData).toHaveBeenCalledTimes(1)
                expect(setEventData).toHaveBeenCalledWith(newEventObject, key)
            })
            test('called while recurring is true', () => {
                instance.addNewEventDialog(true)
                expect(setEventData).toHaveBeenCalledTimes(2)
                expect(setEventData).toHaveBeenCalledWith(newEventObject, key)
            })
        })
    })
    
    describe('render', () => {

        describe('components', () => {

            describe('FormattedMessage', () => {
                test('amount of formattedmessages', () => {
                    const wrapper = getWrapper()
                    const messages = wrapper.find(FormattedMessage)
                    expect(messages).toHaveLength(16)
                })
            })
            describe('SideField', () => {
                const wrapper = getWrapper()
                const Sidefields = wrapper.find(SideField)
                test('amount of sidefields', () => {
                    expect(Sidefields).toHaveLength(4)
                })
                test('sidefields childrens has formattedmesssages', () => {
                    Sidefields.forEach((element) => {
                        expect(element.find(FormattedMessage))
                    })
                })
                test('first sidefield with correct props', () => {
                    expect(Sidefields.at(0).prop('label')).toBe('Pakollisten kenttien ohje')
                    expect(Sidefields.at(0).prop('children')).toEqual(<FormattedMessage id="editor-tip-required"/>)
                    
                })
            })
            describe('MultiLanguageField', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const multifields = wrapper.find(MultiLanguageField)
                test('amount of multilanguagefields', () => {
                    expect(multifields).toHaveLength(6)
                })
                test('default props for multilanguagefields', () => {
                    multifields.forEach((element) => {
                        expect(element.prop('languages')).toBe(defaultProps.editor.contentLanguages)
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    })
                })
                test('correct props for event headline', () => {
                    const headlineMulti = multifields.at(0)
                    expect(headlineMulti.prop('label')).toBe('event-headline')
                    expect(headlineMulti.prop('id')).toBe('event-headline')
                    expect(headlineMulti.prop('name')).toBe('name')
                    expect(headlineMulti.prop('required')).toBe(true)
                    expect(headlineMulti.prop('multiLine')).toBe(false)
                    expect(headlineMulti.prop('validationErrors')).toEqual(defaultProps.editor.validationErrors.name, defaultProps.editor.validationErrors.short_description)
                    expect(headlineMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(headlineMulti.prop('defaultValue')).toBe(defaultProps.editor.values.name)
                })
                test('correct props for event short description', () => {
                    const shortMulti = multifields.at(1)
                    expect(shortMulti.prop('label')).toBe('event-short-description')
                    expect(shortMulti.prop('id')).toBe('event-short-description')
                    expect(shortMulti.prop('name')).toBe('short_description')
                    expect(shortMulti.prop('required')).toBe(true)
                    expect(shortMulti.prop('multiLine')).toBe(true)
                    expect(shortMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.short_description)
                    expect(shortMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(shortMulti.prop('defaultValue')).toBe(defaultProps.editor.values.short_description)
                    expect(shortMulti.prop('type')).toBe('textarea')
                    expect(shortMulti.prop('forceApplyToStore')).toBe(true)
                })
                test('correct props for event location extra', () => {
                    const locationMulti = multifields.at(2)
                    expect(locationMulti.prop('label')).toBe('event-location-additional-info')
                    expect(locationMulti.prop('id')).toBe('event-location-additional-info')
                    expect(locationMulti.prop('name')).toBe('location_extra_info')
                    expect(locationMulti.prop('multiLine')).toBe(true)
                    expect(locationMulti.prop('type')).toBe('text')
                    expect(locationMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.location_extra_info)
                    expect(locationMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(locationMulti.prop('defaultValue')).toBe(defaultProps.editor.values.location_extra_info)
                })
                test('correct props for event long description', () => {
                    const longMulti = multifields.at(3)
                    expect(longMulti.prop('label')).toBe('event-description')
                    expect(longMulti.prop('id')).toBe('event-description')
                    expect(longMulti.prop('name')).toBe('description')
                    expect(longMulti.prop('multiLine')).toBe(true)
                    expect(longMulti.prop('type')).toBe('textarea')
                    expect(longMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.description)
                    expect(longMulti.prop('validations')).toEqual([VALIDATION_RULES.LONG_STRING])
                    expect(longMulti.prop('defaultValue')).toEqual(instance.trimmedDescription())
                })
                test('correct props for event provider', () => {
                    const providerMulti = multifields.at(4)
                    expect(providerMulti.prop('label')).toBe('event-provider-input')
                    expect(providerMulti.prop('id')).toBe('event-provider-input')
                    expect(providerMulti.prop('name')).toBe('provider')
                    expect(providerMulti.prop('required')).toBe(false)
                    expect(providerMulti.prop('multiLine')).toBe(false)
                    expect(providerMulti.prop('type')).toBe('text')
                    expect(providerMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.provider)
                    expect(providerMulti.prop('validations')).toEqual([VALIDATION_RULES.SHORT_STRING])
                    expect(providerMulti.prop('defaultValue')).toEqual(defaultProps.editor.values.provider)
                })
                test('correct props for event info-url', () => {
                    const infoUrlMulti = multifields.at(5)
                    expect(infoUrlMulti.prop('label')).toBe('event-info-url')
                    expect(infoUrlMulti.prop('id')).toBe('event-info-url')
                    expect(infoUrlMulti.prop('name')).toBe('info_url')
                    expect(infoUrlMulti.prop('required')).toBe(false)
                    expect(infoUrlMulti.prop('multiLine')).toBe(false)
                    expect(infoUrlMulti.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.info_url)
                    expect(infoUrlMulti.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(infoUrlMulti.prop('defaultValue')).toBe(defaultProps.editor.values.info_url)
                    expect(infoUrlMulti.prop('type')).toBe('text')
                    expect(infoUrlMulti.prop('forceApplyToStore')).toBe(true)
                })
            })
            describe('HelCheckbox', () => {
                const wrapper = getWrapper()
                const helcheckbox = wrapper.find(HelCheckbox)
                test('correct props for is_virtualevent checkbox', () => {
                    expect(helcheckbox.prop('name')).toBe('is_virtualevent')
                    expect(helcheckbox.prop('label')).toEqual(<FormattedMessage id='event-location-virtual'/>)
                    expect(helcheckbox.prop('fieldID')).toBe('is_virtual')
                })
            })
            describe('HelTextField', () => {
                const wrapper = getWrapper()
                const helfields = wrapper.find(HelTextField)
                test('amount of heltextfields', () => {
                    expect(helfields).toHaveLength(4)
                })
                test('default props for HelTextFields', () => {
                    helfields.forEach((element) => {
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('forceApplyToStore')).toBe(true)
                        expect(element.prop('type')).toBe('text')
                    })
                })
                test('correct props for virtualevent_url field', () => {
                    const virtualHelText = helfields.at(0)
                    expect(virtualHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(virtualHelText.prop('id')).toBe('event-location-virtual-url')
                    expect(virtualHelText.prop('name')).toBe('virtualevent_url')
                    expect(virtualHelText.prop('label')).toBe(defaultProps.intl.formatMessage({id: 'event-location-virtual-url'}))
                    expect(virtualHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.virtualevent_url)
                    expect(virtualHelText.prop('defaultValue')).toBe(defaultProps.editor.values.virtualevent_url)
                })
                test('correct props for event facebook field', () => {
                    const faceHelText = helfields.at(1)
                    expect(faceHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(faceHelText.prop('id')).toBe('extlink_facebook')
                    expect(faceHelText.prop('name')).toBe('extlink_facebook')
                    expect(faceHelText.prop('label')).toBe('Facebook')
                    expect(faceHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_facebook)
                    expect(faceHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_facebook)
                })
                test('correct props for event twitter field', () => {
                    const twitterHelText = helfields.at(2)
                    expect(twitterHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(twitterHelText.prop('id')).toBe('extlink_twitter')
                    expect(twitterHelText.prop('name')).toBe('extlink_twitter')
                    expect(twitterHelText.prop('label')).toBe('Twitter')
                    expect(twitterHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_twitter)
                    expect(twitterHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_twitter)
                })
                test('correct props for event instagram field', () => {
                    const instaHelText = helfields.at(3)
                    expect(instaHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(instaHelText.prop('id')).toBe('extlink_instagram')
                    expect(instaHelText.prop('name')).toBe('extlink_instagram')
                    expect(instaHelText.prop('label')).toBe('Instagram')
                    expect(instaHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_instagram)
                    expect(instaHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_instagram)
                })
            })
            describe('HelLabeledCheckboxGroup', () => {
                const wrapper = getWrapper()
                const helgroupboxes = wrapper.find(HelLabeledCheckboxGroup)
                test('amount of HelLabeledCheckboxGroups', () => {
                    expect(helgroupboxes).toHaveLength(2)
                })
                test('default props for HelLabeledCheckboxGroup', () => {
                    helgroupboxes.forEach((element)=> {
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('itemClassName')).toBe('col-md-12 col-lg-6')
                    })
                })
                test('correct props for audience checkboxgroup', () => {
                    const audiencegroup = helgroupboxes.at(0)
                    expect(audiencegroup.prop('groupLabel')).toEqual(<FormattedMessage id='target-groups-header' />)
                    expect(audiencegroup.prop('selectedValues')).toBe(defaultProps.editor.values.audience)
                    expect(audiencegroup.prop('name')).toBe('audience')
                    expect(audiencegroup.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.audience)
                    expect(audiencegroup.prop('options')).toEqual(mapKeywordSetToForm(defaultProps.editor.mockKeywordSets))
                })
                test('correct props for in_language checkboxgroup', () => {
                    const languagegroup = helgroupboxes.at(1)
                    expect(languagegroup.prop('groupLabel')).toEqual(<FormattedMessage id="hel-event-languages-header2"/>)
                    expect(languagegroup.prop('selectedValues')).toBe(defaultProps.editor.values.in_language)
                    expect(languagegroup.prop('name')).toBe('in_language')
                    expect(languagegroup.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.in_language)
                    expect(languagegroup.prop('options')).toEqual(mapLanguagesSetToForm(defaultProps.editor.languages))
                })
            })
            describe('HelLanguageSelect', () => {
                const wrapper = getWrapper()
                const hellangselect = wrapper.find(HelLanguageSelect)
                test('correct props for HelLanguageSelect ', () => {
                    expect(hellangselect.prop('options')).toEqual(API.eventInfoLanguages())
                    expect(hellangselect.prop('checked')).toBe(defaultProps.editor.contentLanguages)
                })
            })
            describe('HelSelect', () => {
                const wrapper = getWrapper()
                const helselect = wrapper.find(HelSelect)
                test('correct props for HelSelect ', () => {
                    expect(helselect.prop('selectedValue')).toBe(defaultProps.editor.values.location)
                    expect(helselect.prop('name')).toBe('location')
                    expect(helselect.prop('resource')).toBe('place')
                    expect(helselect.prop('validationErrors')).toEqual(defaultProps.editor.validationErrors.location)
                    expect(helselect.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(helselect.prop('optionalWrapperAttributes')).toEqual({className: 'location-select'})
                    expect(helselect.prop('currentLocale')).toBe(intl.locale)
                    expect(helselect.prop('required')).toBe(true)
                })
            })
            describe('HelOffersField', () => {
                const wrapper = getWrapper()
                const heloffers = wrapper.find(HelOffersField)
                test('correct props for HelOffersField', () => {
                    expect(heloffers.prop('name')).toBe('offers')
                    expect(heloffers.prop('validationErrors')).toBe(defaultProps.editor.validationErrors)
                    expect(heloffers.prop('defaultValue')).toBe(defaultProps.editor.values.offers)
                    expect(heloffers.prop('languages')).toBe(defaultProps.editor.contentLanguages)
                    expect(heloffers.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                })
            })

            describe('HelKeywordSelector', () => {
                const wrapper = getWrapper()
                const helkeywords = wrapper.find(HelKeywordSelector)
                test('correct props for HelKeywordSelector', () => {
                    expect(helkeywords.prop('editor')).toBe(defaultProps.editor)
                    expect(helkeywords.prop('intl')).toBe(intl)
                    expect(helkeywords.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(helkeywords.prop('currentLocale')).toBe(intl.locale)
                })
            })

            describe('RecurringEvent', () => {
                const wrapper = getWrapper()
                wrapper.setState({showRecurringEvent: true, selectEventType: 'recurring'})
                const instance = wrapper.instance();
                const recurring = wrapper.find(RecurringEvent)
                test('correct props for RecurringEvent', () => {
                    expect(recurring.prop('toggle')).toBeDefined()
                    expect(recurring.prop('isOpen')).toBe(instance.state.showRecurringEvent)
                    expect(recurring.prop('validationErrors')).toBe(defaultProps.editor.validationErrors)
                    expect(recurring.prop('values')).toBe(defaultProps.editor.values)
                    expect(recurring.prop('formType')).toBe(defaultProps.action)
                })
            })

            describe('OrganizationSelector', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const organization = wrapper.find(OrganizationSelector)
                test('correct props for OrganizationSelector', () => {
                    expect(organization.prop('formType')).toBe(defaultProps.action)
                    expect(organization.prop('options')).toEqual(defaultProps.options)
                    expect(organization.prop('selectedOption')).toEqual(defaultProps.selectedOption)
                    expect(organization.prop('onChange')).toBe(instance.handleOrganizationChange)
                })
            })
            describe('UmbrellaSelector', () => {
                const wrapper = getWrapper()
                const umbrella = wrapper.find(UmbrellaSelector)
                test('correct props for UmbrellaSelector', () => {
                    expect(umbrella.prop('editor')).toBe(defaultProps.editor)
                    expect(umbrella.prop('event')).toBe(defaultProps.event)
                    expect(umbrella.prop('superEvent')).toBe(defaultProps.editor.super_event_type)
                })
            })
            describe('HelVideoFields', () => {
                const wrapper = getWrapper()
                const videofields = wrapper.find(HelVideoFields)
                test('correct props for HelVideoFields', () => {
                    expect(videofields.prop('defaultValues')).toBe(defaultProps.editor.values.videos)
                    expect(videofields.prop('validationErrors')).toBe(defaultProps.editor.validationErrors)
                    expect(videofields.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                    expect(videofields.prop('intl')).toBe(intl)
                    expect(videofields.prop('action')).toBe(defaultProps.action)
                })
            })
            describe('CustomDateTime', () => {
                const wrapper = getWrapper()
                const datetime = wrapper.find(CustomDateTime)
                test('amount of CustonDateTimes', () => {
                    expect(datetime).toHaveLength(2)
                })
                test('default props for CustomDateTime', () => {
                    datetime.forEach((element)=> {
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('disabled')).toBe(false)
                        expect(element.prop('required')).toBe(true)
                    })
                })
                test('correct props for starting time CustomDateTime', () => {
                    const startdatetime = datetime.at(0)
                    expect(startdatetime.prop('id')).toBe('start_time')
                    expect(startdatetime.prop('name')).toBe('start_time')
                    expect(startdatetime.prop('labelDate')).toEqual(<FormattedMessage  id="event-starting-datelabel" />)
                    expect(startdatetime.prop('labelTime')).toEqual(<FormattedMessage  id="event-starting-timelabel" />)
                    expect(startdatetime.prop('defaultValue')).toBe(defaultProps.editor.values.start_time)
                    expect(startdatetime.prop('maxDate')).toBe()
                    expect(startdatetime.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.start_time)
                })
                test('correct props for ending time CustomDateTime', () => {
                    const endingdatetime = datetime.at(1)
                    expect(endingdatetime.prop('id')).toBe('end_time')
                    expect(endingdatetime.prop('disablePast')).toBe(true)
                    expect(endingdatetime.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.end_time)
                    expect(endingdatetime.prop('defaultValue')).toBe(defaultProps.editor.values.end_time)
                    expect(endingdatetime.prop('name')).toBe('end_time')
                    expect(endingdatetime.prop('labelDate')).toEqual(<FormattedMessage  id="event-ending-datelabel" />)
                    expect(endingdatetime.prop('labelTime')).toEqual(<FormattedMessage  id="event-ending-timelabel" />)
                    expect(endingdatetime.prop('minDate')).toBe()
                })
            })
            describe('EventMap', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                wrapper.setState({openMapContainer: true})
                const eventmap = wrapper.find(EventMap)
                test('correct props for EventMap', () => {
                    expect(eventmap.prop('position')).toBe(defaultProps.editor.values.location.position)
                    expect(eventmap.prop('mapContainer')).toBe(instance.state.mapContainer)
                })
            })

            describe('event map button', () => {
                test('container div', () => {
                    const container = getWrapper().find('div.map-button-container')
                    expect(container).toHaveLength(1)
                })

                test('button with correct default props', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    const button = wrapper.find('div.map-button-container').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('title')).toBe(null)
                    expect(button.prop('aria-pressed')).toBe(instance.state.openMapContainer)
                    expect(button.prop('aria-disabled')).toBe(!defaultProps.editor.values.location.position)
                    expect(button.prop('id')).toBe('map-button')
                    expect(button.prop('className')).toBe('btn btn-link')
                    expect(button.prop('onClick')).toBeDefined()
                })

                test('button aria-disabled and title props when position is defined', () => {
                    const wrapper = getWrapper()
                    const editor = {editor: {values: {location: {position: {type: 'Point'}}}}}
                    wrapper.setProps(merge(defaultProps, editor))
                    const button = wrapper.find('div.map-button-container').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('aria-disabled')).toBe(false)
                    expect(button.prop('title')).toBe(null)
                })

                test('button aria-disabled and title props when position is not defined', () => {
                    const wrapper = getWrapper()
                    const editor = {editor:{values: {location: 'null'}}}
                    wrapper.setProps(merge(defaultProps, editor))
                    const button = wrapper.find('div.map-button-container').find(Button)
                    expect(button).toHaveLength(1)
                    expect(button.prop('aria-disabled')).toBe(true)
                    expect(button.prop('title')).toBe(defaultProps.intl.formatMessage({id: 'event-location-button-tooltip'}))
                })

                test('FormattedMessage', () => {
                    const message = getWrapper().find('#event-location-button')
                    expect(message).toHaveLength(1)
                })
                
                test('button icon when state.openMapContainer is true', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    instance.setState({openMapContainer: true})
                    const icon = wrapper.find('div.map-button-container').find(Button).find('span')
                    expect(icon).toHaveLength(1)
                    expect(icon.prop('className')).toBe('glyphicon glyphicon-triangle-bottom')
                })

                test('button icon when state.openMapContainer is false', () => {
                    const wrapper = getWrapper()
                    const instance = wrapper.instance()
                    instance.setState({openMapContainer: false})
                    const icon = wrapper.find('div.map-button-container').find(Button).find('span')
                    expect(icon).toHaveLength(1)
                    expect(icon.prop('className')).toBe('glyphicon glyphicon-triangle-top')
                })
            })

            describe('ImageGallery', () => {
                const wrapper = getWrapper()
                const imagegallery = wrapper.find(ImageGallery)
                test('correct props for ImageGallery', () => {
                    expect(imagegallery.prop('locale')).toBe(intl.locale)
                    expect(imagegallery.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.image)
                })
            })
            describe('Collapse', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const collapse = wrapper.find(Collapse)
                test('correct amount of Collapses', () => {
                    expect(collapse).toHaveLength(6)
                })
                test('correct states for Collapses', () => {
                    expect(collapse.at(0).prop('isOpen')).toBe(instance.state.headerDescription)
                    expect(collapse.at(1).prop('isOpen')).toBe(instance.state.headerImage)
                    expect(collapse.at(2).prop('isOpen')).toBe(instance.state.headerCategories)
                    expect(collapse.at(3).prop('isOpen')).toBe(instance.state.headerPrices)
                    expect(collapse.at(4).prop('isOpen')).toBe(instance.state.headerSocials)
                    expect(collapse.at(5).prop('isOpen')).toBe(instance.state.headerInlanguage)
                })
            })
            describe('CollapseButtons', () => { // päivitä
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const buttons = wrapper.find(CollapseButton)
                test('amount of collapse buttons', () => {
                    expect(buttons).toHaveLength(6)
                })
                test('default props for collapse Buttons', () => {
                    buttons.forEach((button) => {
                        expect(button.prop('toggleHeader')).toBe(instance.toggleHeader)
                    })
                })
                test('correct ids for Buttons', () => {
                    expect(buttons.at(0).prop('id')).toBe('headerDescription')
                    expect(buttons.at(1).prop('id')).toBe('headerImage')
                    expect(buttons.at(2).prop('id')).toBe('headerCategories')
                    expect(buttons.at(3).prop('id')).toBe('headerPrices')
                    expect(buttons.at(4).prop('id')).toBe('headerSocials')
                    expect(buttons.at(5).prop('id')).toBe('headerInlanguage')
                })
            })
            describe('event type radios', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const radios = wrapper.find('input')
                test('correct amount of radios', () => {
                    expect(radios).toHaveLength(2)
                })
                test('default prop for radio buttons', () => {
                    radios.forEach((radio) => {
                        expect(radio.prop('onChange')).toBe(instance.toggleEventType)
                        expect(radio.prop('name')).toBe('radiogroup')
                        expect(radio.prop('type')).toBe('radio')
                        expect(radio.prop('className')).toBe('custom-control-input')
                    })
                })
                test('default props for radio buttons', () => {
                    expect(radios.at(0).prop('id')).toBe('single')
                    expect(radios.at(1).prop('id')).toBe('recurring')
                    expect(radios.at(0).prop('value')).toBe('single')
                    expect(radios.at(1).prop('value')).toBe('recurring')
                    expect(radios.at(0).prop('checked')).toBe(true)
                })
            })
        })
    })
})
