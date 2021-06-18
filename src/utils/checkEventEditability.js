import constants from '../constants'
import moment from 'moment'
import {get, isNull, isUndefined} from 'lodash'
import {doValidations} from '../validation/validator'
import getContentLanguages from './language'
import {mapAPIDataToUIFormat} from './formDataMapping'
import {getOrganizationMembershipIds} from './user'

const {PUBLICATION_STATUS, EVENT_STATUS, USER_TYPE, SUPER_EVENT_TYPE_UMBRELLA} = constants

export const userMayEdit = (user, event) => {
    const eventOwner = get(event, 'is_owner')
    const adminOrganizations = get(user, 'adminOrganizations')
    const userOrganization = get(user, 'organization')
    const publicMembership = get(user, 'publicMemberships')
    const eventOrganization = get(event, 'publisher')
    const eventOrganizationAncestors = get(event, 'publisherAncestors')
    const organizationMemberships = get(user, 'organizationMemberships')
    const publicationStatus = get(event, 'publication_status')
    const userHasOrganizations = !isNull(getOrganizationMembershipIds(user))

    let userMayEdit = false

    // users that don't belong to any organization are not allowed to edit
    if (!userHasOrganizations) {
        return false
    }
    // If present, also check event organization ancestors for admin orgs.
    // Check admin_organizations and organization_membership, but fall back to user.organization if needed
    if (eventOrganization && eventOrganizationAncestors && adminOrganizations) {
        userMayEdit =
            adminOrganizations.includes(eventOrganization) ||
            adminOrganizations.some(id => (eventOrganizationAncestors.map(org => org.id).includes(id)))
    } else if (eventOrganization && adminOrganizations) {
        userMayEdit = adminOrganizations.includes(eventOrganization)
    } else {
        userMayEdit = eventOrganization === userOrganization
    }

    // exceptions to the above:
    if (eventOrganization && organizationMemberships && !userMayEdit) {
    // non-admins may still edit drafts if they are organization members
        userMayEdit = organizationMemberships.includes(eventOrganization)
            && publicationStatus === PUBLICATION_STATUS.DRAFT
    }
    if ((userOrganization || adminOrganizations) && !eventOrganization) {
    // if event has no organization, we are creating a new event. it is allowed for users with organizations,
    // disallowed for everybody else. event organization is set by the API when POSTing.
        userMayEdit = true
    }
    if (publicMembership && !userMayEdit && eventOwner) {
        //User has public membership and is owner of the event
        //may publish and edit their own events
        userMayEdit = eventOwner
    }
    return userMayEdit
}

export const userCanDoAction = (user, event, action, editor) => {
    const isUmbrellaEvent = get(event, 'super_event_type') === SUPER_EVENT_TYPE_UMBRELLA
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isPublic = get(event, 'publication_status') === PUBLICATION_STATUS.PUBLIC
    const isRegularUser = get(user, 'userType') === USER_TYPE.REGULAR
    const isSubEvent = !isUndefined(get(event, ['super_event', '@id']))
    const eventOwner = get(event, 'is_owner')
    const isPublicUser = get(user, 'userType') === USER_TYPE.PUBLIC
    const {keywordSets} = editor

    if (action === 'publish') {
        if (!event.id || (isDraft && isSubEvent)) {
            return false
        }
        // format event, so that we can validate it
        const formattedEvent = mapAPIDataToUIFormat(event)
        // validate
        const validations = doValidations(formattedEvent, getContentLanguages(formattedEvent), PUBLICATION_STATUS.PUBLIC, keywordSets)
        // check if there are errors
        const hasValidationErrors = Object.keys(validations).length > 0

        return !hasValidationErrors
    }
    if (action === 'update' && isDraft && isSubEvent && !isRegularUser) {
        return false
    }
    if (action === 'cancel') {
        return !(isDraft || (isRegularUser && isPublic))
    }
    if (action === 'edit' || action === 'update' || action === 'delete') {
        return !(isRegularUser && (isUmbrellaEvent || isPublic))
    }
    if (action === 'add') {
        return !(isRegularUser && eventOwner && (isPublic)) 
    }

    return true
}

export const eventIsEditable = (event) => {
    const eventIsCancelled = get(event, 'event_status') === EVENT_STATUS.CANCELLED
    const eventIsDeleted = get(event, 'deleted')
    const startTime = get(event, 'start_time', '')
    const endTime = get(event, 'end_time', null)
    const eventIsInThePast =
        (endTime && moment(endTime, moment.defaultFormatUtc).isBefore(moment()))
        || (!endTime && moment(startTime, moment.defaultFormatUtc).isBefore(moment().startOf('day')))
    if (eventIsCancelled) {
        return {editable: false, explanationId: 'event-canceled'};
    }
    if (eventIsDeleted) {
        return {editable: false, explanationId: 'event-deleted'};
    }
    if (eventIsInThePast) {
        return {editable: false, explanationId: 'event-in-the-past'};
    }
    return {editable: true, explanationId: ''}
}

export const checkEventEditability = (user, event, action, editor) => {
    const eventIsEditable = module.exports.eventIsEditable(event)
    if (!eventIsEditable['editable']) {
        return eventIsEditable
    }

    const userMayEdit = module.exports.userMayEdit(user, event)
    const userCanDoAction = module.exports.userCanDoAction(user, event, action, editor)
    const isDraft = get(event, 'publication_status') === PUBLICATION_STATUS.DRAFT
    const isSubEvent = !isUndefined(get(event, ['super_event', '@id']))

    const getExplanationId = () => {
        if (isDraft && action === 'cancel') {
            return 'draft-cancel'
        }
        if (!userCanDoAction && (action === 'publish' || action === 'update') && isSubEvent) {
            return 'draft-publish-subevent'
        }
        if (!userCanDoAction && action === 'publish') {
            return 'event-validation-errors'
        }
        if (userMayEdit && action === 'update') {
            return 'event-validation-errors'
        }
        if (!userMayEdit || !userCanDoAction) {
            return 'user-no-rights-edit'
        }
    }

    const explanationId = getExplanationId()
    const editable = userMayEdit && userCanDoAction

    return {editable, explanationId}
}
