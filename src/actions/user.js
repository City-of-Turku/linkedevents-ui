import constants from '../constants.js'
import {set, get} from 'lodash'
import {setEditorAuthFlashMsg} from './editor'
import client from '../api/client'
import axios from 'axios'
import {getAdminOrganizations, getRegularOrganizations} from '../utils/user'

const {RECEIVE_USERDATA, CLEAR_USERDATA, USER_TYPE} = constants

// Handled by the user reducer
export function receiveUserData(data) {
    return {
        type: RECEIVE_USERDATA,
        payload: data,
    }
}

// Handled by the user reducer
export function clearUserData() {
    return {
        type: CLEAR_USERDATA,
    }
}

const getUserType = (permissions) => {
    if (permissions.includes(USER_TYPE.ADMIN)) {
        return USER_TYPE.ADMIN
    }
    if (permissions.includes(USER_TYPE.REGULAR)) {
        return USER_TYPE.REGULAR
    }
}

// Adds an expiration time for user and saves it to localStorage.
function saveUserToLocalStorage(user) {
    let modifiedUser = Object.assign({}, user)

    let expiryDate = new Date()
    let expiryTime = appSettings.local_storage_user_expiry_time || 12
    expiryDate.setHours(expiryDate.getHours() + expiryTime)
    modifiedUser.localStorageExpires = expiryDate.toISOString()
    localStorage.setItem('user', JSON.stringify(modifiedUser))
}

/*
uusi fetchUser funktio retrieveUserFromSession tilalle.
redux oidc:lla on oma sessiostoragesysteemi, mutta muuten fetchUser
toimii samalla tavalla kuin retrieveUserFromSession
*/

export const fetchUser = (id) => async (dispatch) => {
    try {
        console.log('user actions id: ' + id)
        const userResponse = await client.get(`user/${id}`)
        const userData = userResponse.data
        console.log(userData)
        const permissions = []
        if (get(userData, 'admin_organizations', []).length > 0) {
            permissions.push(USER_TYPE.ADMIN)
        }
        if (get(userData, 'organization_memberships', []).length > 0) {
            permissions.push(USER_TYPE.REGULAR)
        }
        const mergedUser = {
            id: get(userData, 'uuid', null),
            displayName: get(userData, 'display_name', null),
            firstName: get(userData, 'first_name', null),
            lastName: get(userData, 'last_name', null),
            username: get(userData, 'username', null),
            email: get(userData, 'email', null),
            organization: get(userData, 'organization', null),
            adminOrganizations: get(userData, 'admin_organizations', null),
            organizationMemberships: get(userData, 'organization_memberships', null),
            permissions,
            userType: getUserType(permissions),
        }
        
        const adminOrganizations = await Promise.all(getAdminOrganizations(mergedUser))
        const regularOrganizations = await Promise.all(getRegularOrganizations(mergedUser))
        // store data of all the organizations that the user is admin in
        mergedUser.adminOrganizationData = adminOrganizations
            .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
        // store data of all the organizations where the user is a regular user
        mergedUser.regularOrganizationData = regularOrganizations
            .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
        // get organizations with regular users
        mergedUser.organizationsWithRegularUsers = adminOrganizations
            .filter(organization => get(organization, ['data', 'has_regular_users'], false))
            .map(organization => organization.data.id)
        // saveUserToLocalStorage(mergedUser) // tarviiko näitä tallentaa? -> hakee uudestaan backendista...
        
        dispatch(receiveUserData(mergedUser))
        dispatch(setEditorAuthFlashMsg())
    } catch (e) {
        console.log('catch error: ' + e)
        throw Error(e)
    }
}

/*export const retrieveUserFromSession = () => async (dispatch) => {
    try {
        const meResponse = await axios.get(`/auth/me?${+new Date()}`)
        const user = meResponse.data

        if (user.token) {
            const userResponse = await client.get(`user/${user.username}`, {}, {
                headers: {Authorization: `JWT ${user.token}`},
            })
            const userData = userResponse.data
            const permissions = []

            if (get(userData, 'admin_organizations', []).length > 0) {
                permissions.push(USER_TYPE.ADMIN)
            }
            if (get(userData, 'organization_memberships', []).length > 0) {
                permissions.push(USER_TYPE.REGULAR)
            }

            const mergedUser = {
                ...user,
                organization: get(userData, 'organization', null),
                adminOrganizations: get(userData, 'admin_organizations', null),
                organizationMemberships: get(userData, 'organization_memberships', null),
                permissions,
                userType: getUserType(permissions),
            }

            const adminOrganizations = await Promise.all(getAdminOrganizations(mergedUser))
            const regularOrganizations = await Promise.all(getRegularOrganizations(mergedUser))

            // store data of all the organizations that the user is admin in
            mergedUser.adminOrganizationData = adminOrganizations
                .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
            // store data of all the organizations where the user is a regular user
            mergedUser.regularOrganizationData = regularOrganizations
                .reduce((acc, organization) => set(acc, `${organization.data.id}`, organization.data), {})
            // get organizations with regular users
            mergedUser.organizationsWithRegularUsers = adminOrganizations
                .filter(organization => get(organization, ['data', 'has_regular_users'], false))
                .map(organization => organization.data.id)

            saveUserToLocalStorage(mergedUser)
            dispatch(receiveUserData(mergedUser))
            dispatch(setEditorAuthFlashMsg())
        }
    } catch (e) {
        throw Error(e)
    }
}*/

// redux oidc hoitaa tämän
/*export function login() {
    return (dispatch) => {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') {  // Not in DOM? Just try to get an user then and see how that goes.
                return resolve(true);
            }
            const loginPopup = window.open(
                '/auth/login/helsinki',
                'kkLoginWindow',
                'location,scrollbars=on,width=720,height=600'
            );
            const wait = function wait() {
                if (loginPopup.closed) { // Is our login popup gone?
                    return resolve(true);
                }
                setTimeout(wait, 500); // Try again in a bit...
            };
            wait();
        }).then(() => {
            return dispatch(retrieveUserFromSession());
        });
    };
}
*/

// redux oidc hoitaa tämän
/*export function logout() {
    return (dispatch) => {
        fetch('/auth/logout', {method: 'POST', credentials: 'same-origin'}) // Fire-and-forget
        localStorage.removeItem('user')
        dispatch(clearUserData())
        dispatch(setEditorAuthFlashMsg())
    };
}
*/
