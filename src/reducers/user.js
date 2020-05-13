import constants from '../constants'

// Saved in store.user
// const initialState = null

// Returns userdata if available, else return null
function tryFetchingUserFromLocalStorage() {
    let user = ''

    try {
        user = localStorage.getItem('user')
        user = JSON.parse(user)
    } catch(e) {
        return null
    }

    if(user && typeof user === 'object' && user.id && user.token && user.displayName && user.localStorageExpires) {
    // Check expire Date
        let date = new Date(user.localStorageExpires)
        if (Date.now() > date) {
            localStorage.removeItem('user')
            return null
        }
        return user
    }
    else {
        return null
    }
}

let initialState = tryFetchingUserFromLocalStorage()

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
            return null
        default:
            return state
    }
}

export default update
