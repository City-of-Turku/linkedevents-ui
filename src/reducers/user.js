import constants from '../constants'
import {USER_EXPIRED} from 'redux-oidc'


const initialState = null

function update(state = initialState, action) {
    switch(action.type) {
        // Login
        case constants.RECEIVE_USERDATA:
            if(action.payload && action.payload.id) {
                // TODO: get from payload
                return Object.assign({}, action.payload);
            }

            else {
                return state
            }
        // Logout
        case constants.CLEAR_USERDATA:
        case USER_EXPIRED: // if oidc login expires, user data should be cleared
            return null
        default:
            return state
    }
}

export default update
