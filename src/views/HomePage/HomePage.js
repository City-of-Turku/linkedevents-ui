import React from 'react'
import {
    injectIntl,
    FormattedMessage,
    FormattedHTMLMessage,
    intlShape,
} from 'react-intl'
import PropTypes from 'prop-types';
import EventGrid from '../../components/EventGrid'
import {connect} from 'react-redux';
import {push} from 'connected-react-router';
import {withRouter} from 'react-router';
import './index.scss'
import {EventQueryParams, fetchEvents} from '../../utils/events'
import {get} from 'lodash'
import constants from '../../constants'
import {Button} from 'reactstrap'
import {Helmet} from 'react-helmet';
const {USER_TYPE, PUBLICATION_STATUS} = constants

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            events: [],
        };
    }
    componentDidMount() {
        this.fetchTableData()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.locale !== this.props.locale) {
            this.fetchTableData()
        }
    }

    /**
     * Fetches the event data
     */
    fetchTableData = async () => {
        const queryParams = this.getDefaultEventQueryParams()
        
        const response = await fetchEvents(queryParams)

        this.setState({events: response.data.data})
    }

    /**
     * Return the default query params to use when fetching event data
     * @returns {EventQueryParams}
     */
    getDefaultEventQueryParams = () => {
        const queryParams = new EventQueryParams()
        const {locale} = this.props

        queryParams.publication_status = PUBLICATION_STATUS.PUBLIC
        queryParams.include = 'location'
        queryParams.start = 'today'
        queryParams.end = 'today'
        queryParams.in_language = locale
        return queryParams
    }

    getEvents() {
        const {events} = this.state;
        const homeEvents = events.slice(0,3)
        return (
            <EventGrid events={homeEvents} locale={this.props.locale} homePage={true} />
        )}

        handleRouterClick = (url) => {
            const {routerPush} = this.props;
            routerPush(url);
        }

        getIDref(locale) {
            if (locale === 'fi') {
                return '#b-organisaatiotunnukset'
            }
            if (locale === 'en') {
                return '#b-organization-ids'
            }
            if (locale === 'sv') {
                return '#b-organisationsidentifikation'
            }
        }

        render() {
            const {user, locale} = this.props;
            const {intl} = this.context;
            const userType = get(user, 'userType')
            const pageTitle = `Linkedevents - ${intl.formatMessage({id: `${appSettings.ui_mode}-homepage`})}`

            let organization_missing_msg = null;
            if (user && !user.organization) {
                if (appSettings.ui_mode === 'courses') {
                    organization_missing_msg =
                    <div className='organization-missing-msg'>
                        <h1>
                            <FormattedMessage id='organization-missing-heading-courses'/>
                            {user.displayName}!
                        </h1>
                        <p>
                            <FormattedMessage id='organization-missing-message-courses'/>
                        </p>
                        <FormattedMessage id='organization-missing-message1'/>
                    </div>
                } else {
                    organization_missing_msg =
                    <div className='organization-missing-msg'>
                        <h1>
                            <FormattedMessage id='organization-missing-heading'/>
                            {user.displayName}!
                        </h1>
                        <p>
                            <FormattedMessage id='organization-missing-message'/>
                            <FormattedMessage id='organization-missing-message-contact'/>
                            <a href="mailto:matias.peltonen@turku.fi">
                                <FormattedMessage id='organization-missing-message-contact1'/>
                            </a>
                            <FormattedMessage id='organization-missing-message-contact2'/>
                        </p>
                        <FormattedMessage id='organization-missing-message1'/>
                    </div>
                }
            }

            return (
                <div className='homepage'>
                    <div className='container header'/>
                    <div className='container'>
                        <Helmet title={pageTitle}/>
                        <div className='content'>
                            <div className= 'row-homeheader'>
                                <div>
                                    <FormattedMessage id='homepage-welcome'>{txt => <h1>{txt}{user ? ', ' + user.firstName : null }</h1>}</FormattedMessage>
                                </div>
                            </div>
                            {this.props.location.pathname == '/' &&
                    <React.Fragment>
                        {organization_missing_msg}
                    </React.Fragment>
                            }
                            <div className='container-md'>
                                <FormattedMessage id='homepage-introduction-one'>{txt => <p>{txt}</p>}</FormattedMessage>
                                <FormattedHTMLMessage id='homepage-introduction-two'/>
                                <FormattedMessage id='homepage-introduction-three'>{txt => <p>{txt}</p>}</FormattedMessage>
                                <FormattedMessage id='homepage-introduction-four'>{txt => <p>{txt}</p>}</FormattedMessage>
                            </div>
                            <div className='homebuttons'>
                                <FormattedMessage id='homepage-for-publishers'>{txt => <h2>{txt}</h2>}</FormattedMessage>
                                <Button
                                    className='btn'
                                    onClick={() => this.handleRouterClick('/event/create/new')}
                                >
                                    <span aria-hidden className='glyphicon glyphicon-plus' />
                                    <FormattedMessage id={`create-${appSettings.ui_mode}`} />
                                </Button>
                                <Button
                                    className='btn'
                                    href={this.getIDref(locale)}
                                    onClick={() => this.handleRouterClick('/help/')}
                                >
                                    <span aria-hidden className='glyphicon glyphicon-user' />
                                    <FormattedMessage id='homepage-organization-button'/>
                                </Button>
                                <Button
                                    className='btn'
                                    onClick={() => this.handleRouterClick('/help')}
                                >
                                    <span aria-hidden className='glyphicon glyphicon-question-sign' />
                                    <FormattedMessage id='more-info' />
                                </Button>
                            </div>
                            <div className='events'>
                                <FormattedMessage id='homepage-example-events'>{txt => <h2>{txt}</h2>}</FormattedMessage>
                                {this.getEvents()}
                            </div>
                        </div>
                    </div>
                </div>
            
            );
        }
}
HomePage.propTypes = {
    events: PropTypes.array,
    user: PropTypes.object,
    routerPush: PropTypes.func,
    location: PropTypes.object,
    locale: PropTypes.string,
    intl: intlShape,
}
HomePage.contextTypes = {
    intl: PropTypes.object,
}
const mapStateToProps = (state) => ({
    user: state.user,
    locale: state.userLocale.locale,
})

const mapDispatchToProps = (dispatch) => ({
    routerPush: (url) => dispatch(push(url)),
});

export {HomePage as UnconnectedHomePage}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HomePage));
