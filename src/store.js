import {createBrowserHistory as createHistory} from 'history'
import {applyMiddleware, combineReducers, compose, createStore} from 'redux'
import reducers from './reducers'
import {routerMiddleware, connectRouter} from 'connected-react-router'
import thunk from 'redux-thunk'
import {loadUser} from 'redux-oidc';
import userManager from './utils/userManager';

export const history = createHistory()

const allReducers = combineReducers(Object.assign({}, reducers, {
    router: connectRouter(history),
}))

const allMiddlewares = compose(
    applyMiddleware(thunk),
    applyMiddleware(routerMiddleware(history)),
    typeof window === 'object' && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
)

const store = createStore(allReducers, allMiddlewares)
loadUser(store, userManager)

export default store
