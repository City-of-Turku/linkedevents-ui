import './index.scss'
import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames';
import get from 'lodash/get'
import {
    injectIntl,
    FormattedMessage,
    intlShape,
} from 'react-intl'
import {getStringWithLocale} from '../../utils/locale'
import {mapKeywordSetToForm} from '../../utils/apiDataMapping'
import LinksToEvents from '../LinksToEvents/LinksToEvents'
import {Badge} from 'reactstrap';

const NoValue = (props) => {
    let header = props.labelKey ? (<span ><FormattedMessage id={`${props.labelKey}`}/>&nbsp;</span>) : null
    return (
        <div className="no-value" >
            {header}
            <FormattedMessage id="no-value"/>
        </div>
    )
}

NoValue.propTypes = {
    labelKey: PropTypes.string,
}

const CheckedValue = ({label}) => (
    <div className="custom-control">
        <Badge className='badge-primary'>{label}</Badge>
    </div>
)
CheckedValue.propTypes = {
    label: PropTypes.string,
}

const MultiLanguageValue = (props) => {
    if (props.hidden) {
        return (<div/>)
    }

    let value = props.value || []

    let count = (_.keys(value)).length

    // Determine column size depending on the amount of language options
    let colClass = 'col-md-12'
    if (count > 1) {
        colClass = (count === 2) ? 'col-md-6' : 'col-md-4'
    }

    // Use a separate array to ensure correct field order
    let langOptions = ['fi', 'sv', 'en', 'ru', 'zh_hans', 'ar']
    let elements = []

    _.each(langOptions, (key) => {
        let val = value[key]
        const createHTML = () => ({__html: val})

        if (val) {
            elements.push(<div className={colClass} key={key}>
                <div className={`in-${key} indented`}>
                    <label  htmlFor= 'language' className="language"><FormattedMessage id={`in-${key}`}/></label>
                    <input type="hidden" id="language" name="language" />
                    <div dangerouslySetInnerHTML={createHTML()}/>
                </div>
            </div>)
        }
    })

    if (elements.length > 0) {
        return (
            <div className="multi-value-field">
                <label htmlFor= 'field'><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type='hidden' id='field' />

                <div className="row">
                    {elements}
                </div>
            </div>
        )
    } else {
        return (
            <div className="multi-value-field" >
                <label htmlFor= 'field1' ><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type="hidden" id='field1' name="field1"/>
                <div>
                    <NoValue labelKey={props.labelKey}/>
                </div>
            </div>
        )
    }
}

const TextValue = (props) => {
    if (_.isInteger(props.value) || (props.value && props.value.length !== undefined && props.value.length > 0)) {
        return (
            <div className="single-value-field">
                <div>
                    <label htmlFor='events-creator'><FormattedMessage id={`${props.labelKey}`}/></label>
                    <input type="hidden" id="events-creator" />
                </div>
                <span role='address' className="value">{props.value}</span>
            </div>
        )
    } else {
        return (
            <div className="single-value-field">
                <div>
                    <label htmlFor='socialmedia'aria-label="socialmedia"><FormattedMessage id={`${props.labelKey}`}/></label>
                    <input type="hidden" id='socialmedia' />
                </div>
                <NoValue labelKey={props.labelKey}/>
            </div>
        )
    }
}

const ImageValue = (props) => {
    if (props.value !== undefined && props.value instanceof Object) {
        return <img src={props.value.url} alt={getStringWithLocale(props.value, 'alt_text', props.locale)} className="event-image"/>
    }
    return (
        <FormHeader>
            <FormattedMessage id="no-image"/>
        </FormHeader>
    )
}

ImageValue.propTypes = {
    value: PropTypes.object,
    locale: PropTypes.string,
}

const OptionGroup = (props) => {
    let values = props.values || []

    let elements = _.map(values, (val, key) => {
        let name = getStringWithLocale(val, 'name', props.locale) || val.label || val.id || val || ''
        return (<CheckedValue checked={true} label={name} key={key}/>)
    })

    if (elements.length === 0) {
        elements = (<NoValue labelKey={props.labelKey}/>)
    }

    return (
        <div className="option-group">
            <div>
                <label htmlFor='category'><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type="hidden" id='category' />
            </div>
            {elements}
        </div>
    )
}

OptionGroup.propTypes = {
    values: PropTypes.array,
    labelKey: PropTypes.string,
    locale: PropTypes.string,
}
const DateTime = (props) => {
    if (props.value && props.value.length !== undefined && props.value.length > 0) {
        const options = {
            weekday: 'long',
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric',
            timeZone: 'Europe/Helsinki',
        }
        const value = Intl.DateTimeFormat(props.locale, options).format(new Date(props.value))
        return (
            <div className="single-value-field">
                <label htmlFor='single-value-field'><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type="hidden" id="single-value-field" />
                <span className="value" id="single-value-field">
                    {value}
                </span>
            </div>
        )
    } else {
        return (
            <div className="single-value-field">
                <label htmlFor='value'><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type="hidden" id="value" />
                <span className="value">
                    <NoValue id='value' labelKey={props.labelKey}/>
                </span>
            </div>
        )
    }
}

const FormHeader = props => <h2>{props.children}</h2>

FormHeader.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
}

const OffersValue = (props) => {
    const {offers} = props.values

    if (!offers || !offers.length || offers[0].is_free === true || offers[0] && typeof offers[0] !== 'object') {
        return (<FormattedMessage id="is-free"/>)
    }
    return (
        <div>
            {props.values.offers.map((offer, key) => (
                <div key={`offer-value-${key}`} className="offer-values">
                    <FormattedMessage id={props.label} values={{count: key + 1}}>{txt => <h3>{txt}</h3>}</FormattedMessage>
                    <MultiLanguageValue
                        labelKey="event-purchase-link"
                        hidden={offer.is_free}
                        value={offer.info_url}
                    />
                    <MultiLanguageValue
                        labelKey="event-price"
                        hidden={offer.is_free}
                        value={offer.price}
                    />
                    <MultiLanguageValue
                        labelKey="event-price-info"
                        hidden={offer.is_free}
                        value={offer.description}
                    />
                </div>
            ))}
        </div>
    )
}

OffersValue.propTypes = {
    values: PropTypes.object,
    labelKey: PropTypes.string,
    label: PropTypes.string,
}

const VideoValue = ({values}) => {

    if (!values || values.length === 0) {
        return (<NoValue labelKey={'event-video'}/>)
    }

    return (
        <div className={'video-item'}>
            {values.map((item, index) => (
                <div
                    key={`video-item-${index}`}
                    className={'video-item--container'}
                >
                    {Object.entries(item)
                        .map(([key, value]) => {
                            if (key === 'url') {
                                return (
                                    <TextValue
                                        key={`video-value-${key}`}
                                        labelKey={`event-video-${key}`}
                                        value={value}
                                    />
                                )
                            } else {
                                return (
                                    <MultiLanguageValue
                                        key={`video-value-${key}`}
                                        labelKey={`event-video-${key}`}
                                        value={value}
                                    />
                                )
                            }
                        })
                    }
                </div>
            ))}
        </div>
    )
}

VideoValue.propTypes = {
    values: PropTypes.array,
}

const VirtualInfo = (props) => {
    if (props.isvirtual && props.values) {
        const messageId = !props.location ? props.labelvirtual : props.labelvirtualphysical;
        return (
            <div className="single-value-field">
                <div>
                    <FormattedMessage id={messageId}>{txt => <label>{txt}</label>}</FormattedMessage>
                    <br/>
                    <FormattedMessage id={props.labelvirtualURL}>{txt => <span htmlFor={props.values}>{txt}</span>}</FormattedMessage>
                    <br/>
                    <a href={props.values} rel='noopener noreferrer' target="_blank">{props.values}</a>
                </div>
            </div>
        )
    } else {
        return (
            <div />
        )
    }
}
VirtualInfo.propTypes = {
    values: PropTypes.string,
    isvirtual: PropTypes.bool,
    labelvirtual: PropTypes.string,
    labelvirtualURL: PropTypes.string,
    labelvirtualphysical: PropTypes.string,
}


const SubEventListing = (props) => {
    const subEventsExists = typeof props.value === 'object' && Object.keys(props.value).length > 0
    
    if (subEventsExists) {
        const subEvents = Object.values(props.value).sort();
        const mappedSubs = subEvents.map((values, index) => {
            if (values.start_time && values.end_time !== undefined) {
                const options = {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: 'numeric', minute: 'numeric',
                    timeZone: 'Europe/Helsinki',
                }
                const valueStart = Intl.DateTimeFormat(props.locale, options).format(new Date(values.start_time))
                const valueEnd = Intl.DateTimeFormat(props.locale, options).format(new Date(values.end_time))

                return(
                    <FormattedMessage id={props.subLabel} key={index} values={{start: valueStart, end: valueEnd, count: index + 1}} />
                )
            } else if ((values.start_time && values.end_time) === undefined) {
                return (
                    <div className="no-value" key={index}>
                        <FormattedMessage id={props.noSubTimes} key={index} values={{count: index + 1}} />
                    </div>
                )
            }
        });
        return (
            <div className='subGrid'>
                <FormattedMessage id={props.label}>{txt => <h3>{txt}</h3>}</FormattedMessage>
                {mappedSubs}
            </div>
        )
    } else {
        return (
            <div/>
        )
    }
}
SubEventListing.propTypes = {
    value: PropTypes.object,
    subLabel: PropTypes.string,
    noSubTimes: PropTypes.string,
    label: PropTypes.string,
}

const EventDetails = (props) => {
    const {editor, values, intl, rawData, publisher, superEvent} = props
    // Changed keywordSets to be compatible with Turku's backend.
    const mainCategoryValues = mapKeywordSetToForm(editor.keywordSets, 'turku:topics', intl.locale)
        .map(item => item.value)
    let mainCategoryKeywords, nonMainCategoryKeywords = [];
    if (values.keywords) {
        mainCategoryKeywords = values.keywords.filter(item => mainCategoryValues.includes(item.value))
        nonMainCategoryKeywords = values.keywords.filter(item => !mainCategoryValues.includes(item.value))
    }
    const subsExists = Object.keys(editor.values['sub_events']).length > 0

    return (
        <div className={classNames('event-details', {'preview': props.isPreview})}>
            <ImageValue labelKey="event-image" value={values['image']} locale={intl.locale}/>
            <FormHeader>
                {intl.formatMessage({id: 'event-description-fields-header'})}
            </FormHeader>

            <MultiLanguageValue labelKey="event-headline" value={values['name']}/>
            <MultiLanguageValue labelKey="event-short-description" value={values['short_description']}/>
            <MultiLanguageValue labelKey="event-description" value={values['description']}/>
            <MultiLanguageValue labelKey="event-info-url" value={values['info_url']}/>
            <MultiLanguageValue labelKey="event-provider" value={values['provider']}/>
            {publisher && <TextValue labelKey="event-publisher" value={get(publisher, 'name')}/>}

            <FormHeader>
                {intl.formatMessage({id: 'event-datetime-fields-header'})}
            </FormHeader>
            {(!props.isPreview || (props.isPreview && !subsExists)) && (
                <Fragment>
                    <DateTime locale={intl.locale} value={values['start_time']} labelKey="event-starting"/>
                    <DateTime locale={intl.locale} value={values['end_time']} labelKey="event-ending"/>
                </Fragment>)
            }
            {props.isPreview && subsExists && (
                <Fragment>
                    <SubEventListing locale={intl.locale} label='event-subEvent-fields-header' subLabel="event-series" noSubTimes='event-series-time' value={values['sub_events']} />
                </Fragment>)
            }
            <FormHeader>
                {intl.formatMessage({id: 'event-location-fields-header'})}
            </FormHeader>

            <VirtualInfo labelvirtualphysical='event-isvirtualphysical' labelvirtual='event-isvirtual' labelvirtualURL='event-location-virtual-url' location={get(values, 'location.name')} isvirtual={values['is_virtualevent']} values={get(values, 'virtualevent_url')}/>

            <MultiLanguageValue labelKey="event-location" value={get(values, 'location.name')}/>
            <TextValue labelKey="event-location-id" value={get(values, 'location.id')}/>
            <MultiLanguageValue
                labelKey="event-location-additional-info"
                value={values['location_extra_info']}
            />

            <FormHeader>
                {intl.formatMessage({id: 'event-price-fields-header'})}
            </FormHeader>
            <OffersValue label={'event-price-count'} values={values}/>

            <FormHeader>
                {intl.formatMessage({id: 'event-social-media-fields-header'})}
            </FormHeader>
            <TextValue labelKey="facebook-url" value={values['extlink_facebook']}/>
            <TextValue labelKey="twitter-url" value={values['extlink_twitter']}/>
            <TextValue labelKey="instagram-url" value={values['extlink_instagram']}/>

            <FormHeader>
                {intl.formatMessage({id: 'event-video'})}
            </FormHeader>
            <VideoValue values={values['videos']} />

            <FormHeader>
                {intl.formatMessage({id: 'event-categorization'})}
            </FormHeader>

            <OptionGroup values={mainCategoryKeywords} labelKey="main-categories" locale={intl.locale}/>
            <OptionGroup values={nonMainCategoryKeywords} labelKey="additional-keywords" locale={intl.locale}/>
            <OptionGroup values={rawData['audience']} labelKey="hel-target-groups" locale={intl.locale}/>
            <OptionGroup values={rawData['in_language']} labelKey="hel-event-languages" locale={intl.locale}/>

            {appSettings.ui_mode === 'courses' &&
                <React.Fragment>
                    <FormHeader>
                        {intl.formatMessage({id: 'audience-age-restrictions'})}
                    </FormHeader>
                    <TextValue labelKey="audience-min-age" value={values['audience_min_age']}/>
                    <TextValue labelKey="audience-max-age" value={values['audience_max_age']}/>

                    <FormHeader>
                        {intl.formatMessage({id: 'enrolment-time'})}
                    </FormHeader>
                    <DateTime labelKey="enrolment-start-time" value={values['enrolment_start_time']}/>
                    <DateTime labelKey="enrolment-end-time" value={values['enrolment_end_time']}/>

                    <FormHeader>
                        {intl.formatMessage({id: 'attendee-capacity'})}
                    </FormHeader>
                    <TextValue labelKey="minimum-attendee-capacity" value={values['minimum_attendee_capacity']}/>
                    <TextValue labelKey="maximum-attendee-capacity" value={values['maximum_attendee_capacity']}/>
                </React.Fragment>
            }
            {!props.disableSuperEventLinks &&
    <React.Fragment>
        <FormHeader>
            {intl.formatMessage({id: 'links-to-events'})}
        </FormHeader>
        <LinksToEvents
            event={rawData}
            superEvent={superEvent}
        />
    </React.Fragment>
            }
        </div>
    )
}

EventDetails.propTypes = {
    values: PropTypes.object,
    superEvent: PropTypes.object,
    rawData: PropTypes.object,
    intl: intlShape,
    publisher: PropTypes.object,
    editor: PropTypes.object,
    disableSuperEventLinks: PropTypes.bool,
    isPreview: PropTypes.bool,
}

export default injectIntl(EventDetails)
