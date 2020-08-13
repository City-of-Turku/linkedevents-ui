import './index.scss'
import moment from 'moment-timezone'
import React from 'react'
import PropTypes from 'prop-types'
import get from 'lodash/get'
import {
    injectIntl,
    FormattedMessage,
    FormattedDate,
    FormattedTime,
    intlShape,
} from 'react-intl'
import {getStringWithLocale} from '../../utils/locale'
import {mapKeywordSetToForm} from '../../utils/apiDataMapping'
import LinksToEvents from '../LinksToEvents/LinksToEvents'


import classNames from 'classnames';

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

const CheckedValue = ({checked, labelKey, label}) => (
    <div className="checked-value">
        <label htmlFor={label}>
            {checked
                ? <input type='checkbox' checked='disabled' readOnly id={label}/>
                : <input type='checkbox' disabled id={label} readOnly aria-hidden="true" />
            }
            {labelKey
                ? <FormattedMessage id={labelKey}/>
                : label
            }
        </label>

    </div>
)

CheckedValue.propTypes = {
    checked: PropTypes.bool,
    labelKey: PropTypes.string,
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
            <div className="multi-value-field" tabIndex='0'>
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
            <div className="single-value-field" tabIndex='0'>
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
        <div className="option-group" tabIndex='0'>
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
    // TODO: if all day event show it on this field. Add a props for it
    if (props.value && props.value.length !== undefined && props.value.length > 0) {
        let time = moment(props.value).tz('Europe/Helsinki')
        let value = ''
        if (time.isValid()) {
            value = <div>
                <FormattedDate
                    value={time}
                    year="numeric"
                    month="short"
                    day="numeric"
                    weekday="long"
                />
                <FormattedTime
                    value={time}
                    hour="numeric"
                    minute="2-digit"
                />
            </div>
        }
        return (
            <div className="single-value-field" tabIndex='0'>
                <label  htmlFor='single-value-field'><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type="hidden" id="single-value-field" />
                <span className="value" id="single-value-field">
                    {value}
                </span>
            </div>
        )
    } else {
        return (
            <div className="single-value-field" tabIndex='0'>
                <label  htmlFor='value'><FormattedMessage id={`${props.labelKey}`}/></label>
                <input type="hidden" id="value" />
                <span className="value">
                    <NoValue id='value' labelKey={props.labelKey}/>
                </span>
            </div>
        )
    }
}

const FormHeader = props => <h2 tabIndex='0'>{props.children}</h2>

FormHeader.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]),
}

const OffersValue = (props) => {
    const {offers} = props.values

    if (!offers || !offers.length || offers[0] && typeof offers[0] !== 'object') {
        return (<NoValue  labelKey={props.labelKey}/>)
    }

    return (
        <div tabIndex='0'>
            <CheckedValue  checked={offers[0].is_free} labelKey="is-free"/>
            {props.values.offers.map((offer, key) => (
                <div key={`offer-value-${key}`} className="offer-values">
                    <MultiLanguageValue
                        labelKey="event-purchase-link"
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

const EventDetails = (props) => {
    const {editor, values, intl, rawData, publisher, superEvent} = props
    // Changed keywordSets to be compatible with Turku's backend.
    const mainCategoryValues = mapKeywordSetToForm(editor.keywordSets, 'turku:topics', intl.locale)
        .map(item => item.value)
    const mainCategoryKeywords = values.keywords.filter(item => mainCategoryValues.includes(item.value))
    const nonMainCategoryKeywords = values.keywords.filter(item => !mainCategoryValues.includes(item.value))

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
            <DateTime value={values['start_time']} labelKey="event-starting-datetime"/>
            <DateTime value={values['end_time']} labelKey="event-ending-datetime"/>

            <FormHeader>
                {intl.formatMessage({id: 'event-location-fields-header'})}
            </FormHeader>

            <MultiLanguageValue labelKey="event-location" value={get(values, 'location.name')}/>
            <TextValue labelKey="event-location-id" value={get(values, 'location.id')}/>
            <MultiLanguageValue
                labelKey="event-location-additional-info"
                value={values['location_extra_info']}
            />

            <FormHeader>
                {intl.formatMessage({id: 'event-price-fields-header'})}
            </FormHeader>
            <OffersValue values={values}/>

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
            tabIndex='0'
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
