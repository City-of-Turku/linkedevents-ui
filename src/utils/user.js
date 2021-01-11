import {get} from 'lodash'
import client from '../api/client'
import constants from '../constants'

const {USER_TYPE} = constants

/**
 * Returns a promise containing data for the given organization
 * @param organizationId  Organization ID
 */
export const getOrganization = async (organizationId) => {
    try {
        return await client.get(`organization/${organizationId}`)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Returns a promise containing data for the organizations that the organization is located under
 * @param organizationId Organization id
 */
export const getOrganizationAncestors = async (organizationId) => {
    const params = {
        child: organizationId,
    }

    try {
        return await client.get(`organization`, params)
    } catch (e) {
        throw Error(e)
    }
}

/**
 * Returns a promise containing data for the admin organizations that the given user belongs to
 * @param user  User data
 */
export const getAdminOrganizations = user =>
    get(user, 'adminOrganizations', [])
        .map(getOrganization)

/**
 * Returns a promise containing data for the regular organizations that the given user belongs to
 * @param user  User data
 */
export const getRegularOrganizations = user =>
    get(user, 'organizationMemberships', [])
        .map(getOrganization)

/**
 * Returns whether the given user is an admin in any organization that has regular users
 * @param user  User data
 */
export const hasOrganizationWithRegularUsers = user =>
    get(user, 'organizationsWithRegularUsers', []).length > 0

export const hasOrganizationWithPublicUsers = user =>
    get(user, 'publicMemberships', []).length > 0
/**
 * Returns the ID's of the organizations that the user is part of depending on user type
 * @param user  User data
 */
export const getOrganizationMembershipIds = user => {
    if (!get(user, 'userType')) {
        return null
    }
    if (user.userType === USER_TYPE.ADMIN) {
        return user.adminOrganizations
    }
    if (user.userType === USER_TYPE.REGULAR) {
        return user.organizationMemberships
    }
    if (user.userType === USER_TYPE.PUBLIC) {
        return user.publicMemberships
    }
}
