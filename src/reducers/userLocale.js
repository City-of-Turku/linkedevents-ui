import CONSTANTS from '../constants'
import {loadLocaleFromLocalStorage} from '../utils/locale'

const {LOCALE_ACTIONS, DEFAULT_LOCALE, APPLICATION_SUPPORT_TRANSLATION} = CONSTANTS

let browserLanguage = (navigator.language || navigator.userLanguage).toLowerCase();
let defaultLocale = loadLocaleFromLocalStorage();

if (typeof defaultLocale === 'undefined') {
    defaultLocale = DEFAULT_LOCALE;
    for (const locale of APPLICATION_SUPPORT_TRANSLATION) {
        if (browserLanguage.includes(locale)) {
            defaultLocale = locale;
            break;
        }
    }
}

const initialState = {
    locale: defaultLocale,
}

const userLocale = (state = initialState, action) => {
    switch(action.type) {
        case LOCALE_ACTIONS.LOCALE_SET:
            return Object.assign({}, state, {
                locale: action.locale,
            })
        case LOCALE_ACTIONS.LOCALE_RESET:
            return Object.assign({}, state, {
                locale: initialState.locale,
            })
        default:
            return state
    }
}

export default userLocale
