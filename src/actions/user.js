import constants from '../constants.js'
import {set, get} from 'lodash'
import {setEditorAuthFlashMsg} from './editor'
import client from '../api/client'
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

// Handles getting user data from backend api with given id.
export const fetchUser = (id) => async (dispatch) => {
    try {
        // try to get user data from user endpoint
        const userResponse = await client.get(`user/${id}`)
        const userData = userResponse.data

        // add correct permissions to user based on user's organizations
        const permissions = []
        if (get(userData, 'admin_organizations', []).length > 0) {
            permissions.push(USER_TYPE.ADMIN)
        }
        if (get(userData, 'organization_memberships', []).length > 0) {
            permissions.push(USER_TYPE.REGULAR)
        }

        // add all desired user data in an object which will be stored into redux store
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
        
        dispatch(receiveUserData(mergedUser))
        dispatch(setEditorAuthFlashMsg())
    } catch (e) {
        throw Error(e)
    }
}
