import React from 'react'
import {shallow, mount} from 'enzyme';
import FormFields, {SideField} from './index'
import {IntlProvider, FormattedMessage} from 'react-intl';
import mapValues from 'lodash/mapValues';
import fiMessages from 'src/i18n/fi.json';
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
import {Button,Form, FormGroup, Collapse} from 'reactstrap';
import {mapKeywordSetToForm, mapLanguagesSetToForm} from '../../utils/apiDataMapping'
import {setEventData, setData} from '../../actions/editor'
import {get, isNull, pickBy} from 'lodash'
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
import {mockKeywordSets, mockLanguages, mockUser, mockUserEvents} from '__mocks__/mockData';


const testMessages = mapValues(fiMessages, (value, key) => value);
const intlProvider = new IntlProvider({locale: 'fi', messages: testMessages}, {});
const {intl} = intlProvider.getChildContext();
const mockEvent = mockUserEvents[0];
const {SUPER_EVENT_TYPE_RECURRING, SUPER_EVENT_TYPE_UMBRELLA, VALIDATION_RULES, USER_TYPE} = CONSTANTS
const dispatch = jest.fn()


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
                audience: {},
                in_language: {},
                location: {
                    position: {},
                },
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
    describe('render', () => {

        describe('components', () => {

            describe('FormattedMessage', () => {
                test('amount of formattedmessages', () => {
                    const wrapper = getWrapper()
                    const messages = wrapper.find(FormattedMessage)
                    expect(messages).toHaveLength(42)
                })
            })
            describe('SideField', () => {
                const wrapper = getWrapper()
                const Sidefields = wrapper.find(SideField)
                test('amount of sidefields', () => {
                    expect(Sidefields).toHaveLength(10)
                })
                test('sidefields childrens has formattedmesssages', () => {
                    Sidefields.forEach((element) => {
                        expect(element.find(FormattedMessage))
                    })
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
            describe('HelTextField', () => {
                const wrapper = getWrapper()
                const helfields = wrapper.find(HelTextField)
                test('amount of heltextfields', () => {
                    expect(helfields).toHaveLength(3)
                })
                test('default props for HelTextFields', () => {
                    helfields.forEach((element) => {
                        expect(element.prop('setDirtyState')).toBe(defaultProps.setDirtyState)
                        expect(element.prop('forceApplyToStore')).toBe(true)
                        expect(element.prop('type')).toBe('text')
                    })
                })
                test('correct props for event facebook field', () => {
                    const faceHelText = helfields.at(0)
                    expect(faceHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(faceHelText.prop('id')).toBe('extlink_facebook')
                    expect(faceHelText.prop('name')).toBe('extlink_facebook')
                    expect(faceHelText.prop('label')).toBe('Facebook')
                    expect(faceHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_facebook)
                    expect(faceHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_facebook)
                })
                test('correct props for event twitter field', () => {
                    const twitterHelText = helfields.at(1)
                    expect(twitterHelText.prop('validations')).toEqual([VALIDATION_RULES.IS_URL])
                    expect(twitterHelText.prop('id')).toBe('extlink_twitter')
                    expect(twitterHelText.prop('name')).toBe('extlink_twitter')
                    expect(twitterHelText.prop('label')).toBe('Twitter')
                    expect(twitterHelText.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.extlink_twitter)
                    expect(twitterHelText.prop('defaultValue')).toBe(defaultProps.editor.values.extlink_twitter)
                })
                test('correct props for event instagram field', () => {
                    const instaHelText = helfields.at(2)
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
                    expect(audiencegroup.prop('groupLabel')).toEqual(<FormattedMessage id='hel-target-groups' />)
                    expect(audiencegroup.prop('selectedValues')).toBe(defaultProps.editor.values.audience)
                    expect(audiencegroup.prop('name')).toBe('audience')
                    expect(audiencegroup.prop('validationErrors')).toBe(defaultProps.editor.validationErrors.audience)
                    expect(audiencegroup.prop('options')).toEqual(mapKeywordSetToForm(defaultProps.editor.mockKeywordSets))
                })
                test('correct props for in_language checkboxgroup', () => {
                    const languagegroup = helgroupboxes.at(1)
                    expect(languagegroup.prop('groupLabel')).toEqual(<FormattedMessage id="hel-event-languages"/>)
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
                wrapper.setState({showRecurringEvent: true})
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
            describe('ImageGallery', () => {
                const wrapper = getWrapper()
                const imagegallery = wrapper.find(ImageGallery)
                test('correct props for ImageGallery', () => {
                    expect(imagegallery.prop('locale')).toBe(intl.locale)
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
            describe('Buttons for collapses', () => {
                const wrapper = getWrapper()
                const instance = wrapper.instance();
                const button = wrapper.find(Button).find('.headerbutton')
                test('amount of collapse buttons', () => {
                    expect(button).toHaveLength(6)
                })
                test('default props for collapse Buttons', () => {
                    button.forEach((element) => {
                        expect(element.prop('color')).toBe('collapse')
                        expect(element.prop('onClick')).toBe(instance.toggleHeader)
                    })
                })
                test('correct ids for Buttons', () => {
                    expect(button.at(0).prop('id')).toBe('headerDescription')
                    expect(button.at(1).prop('id')).toBe('headerImage')
                    expect(button.at(2).prop('id')).toBe('headerCategories')
                    expect(button.at(3).prop('id')).toBe('headerPrices')
                    expect(button.at(4).prop('id')).toBe('headerSocials')
                    expect(button.at(5).prop('id')).toBe('headerInlanguage')
                })
            })
        })
    })
})
