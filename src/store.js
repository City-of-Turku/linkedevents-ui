import createHistory from 'history/createBrowserHistory'
import {applyMiddleware, combineReducers, compose, createStore} from 'redux'
import reducers from './reducers'
import {routerMiddleware, routerReducer} from 'react-router-redux'
import thunk from 'redux-thunk'
import {loadUser} from 'redux-oidc';
import userManager from './utils/userManager';

export const history = createHistory()

const allReducers = combineReducers(Object.assign({}, reducers, {
    router: routerReducer,
}))

const allMiddlewares = compose(
    applyMiddleware(thunk),
    applyMiddleware(routerMiddleware(history)),
    typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
)

const store = createStore(allReducers, allMiddlewares)
loadUser(store, userManager)

export default store
