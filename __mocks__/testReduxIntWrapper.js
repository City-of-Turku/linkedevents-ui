import {IntlProvider, addLocaleData} from 'react-intl'
import {MemoryRouter as Router} from 'react-router'
import {Provider} from 'react-redux'
import React from 'react'
//Changed Intl-providers testmessage
import fiMessages from 'src/i18n/fi.json';
import mapValues from 'lodash/mapValues';
const testMessages = mapValues(fiMessages, (value, key) => value);
const ReduxIntWrappeComponent = (store, component, locale = 'fi') => {
    const lang = require('react-intl/locale-data/' + locale)
    addLocaleData(lang)
    return (
        <Provider store={store}>
            <IntlProvider locale={locale} messages={testMessages}>
                <Router>
                    {component}
                </Router>
            </IntlProvider>
        </Provider>
    )
}
export default ReduxIntWrappeComponent;
