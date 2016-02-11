const constants = {

    APP_SET_FLASHMSG: 'APP_SET_FLASHMSG',
    APP_CLEAR_FLASHMSG: 'APP_CLEAR_FLASHMSG',
    APP_CONFIRM_ACTION: 'APP_CONFIRM_ACTION',
    APP_DO_ACTION: 'APP_DO_ACTION',
    APP_CANCEL_ACTION: 'APP_CANCEL_ACTION',

    REQUEST_EVENTS: 'REQUEST_EVENTS',
    RECEIVE_EVENTS: 'RECEIVE_EVENTS',
    RECEIVE_EVENT_FOR_EDITING: 'RECEIVE_EVENT_FOR_EDITING',
    RECEIVE_EVENTS_ERROR: 'RECEIVE_EVENTS_ERROR',
    RECEIVE_EVENT_DETAILS: 'RECEIVE_EVENT_DETAILS',
    EVENT_DELETED: 'EVENT_DELETED',

    RECEIVE_USERDATA: 'RECEIVE_USERDATA',
    CLEAR_USERDATA: 'CLEAR_USERDATA',

    EDITOR_RECEIVE_KEYWORDSETS: 'EDITOR_RECEIVE_KEYWORDSETS',
    EDITOR_RECEIVE_LANGUAGES: 'EDITOR_RECEIVE_LANGUAGES',
    EDITOR_SETDATA: 'EDITOR_SETDATA',
    EDITOR_REPLACEDATA: 'EDITOR_REPLACEDATA',
    EDITOR_CLEARDATA: 'EDITOR_CLEARDATA',
    EDITOR_SENDDATA: 'EDITOR_SENDDATA',
    EDITOR_SENDDATA_COMPLETE: 'EDITOR_SENDDATACOMPLETE',
    EDITOR_SENDDATA_ERROR: 'EDITOR_SENDDATA_ERROR',
    EDITOR_SENDDATA_SUCCESS: 'EDITOR_SENDDATA_SUCCESS',

    // Local storage keys
    EDITOR_VALUES: 'EDITOR_VALUES',

    // Event schedule values
    EVENT_STATUS: {
        SCHEDULED: 'EventScheduled',
        CANCELLED: 'EventCancelled',
        POSTPONED: 'EventPostponed',
        RESCHEDULED: 'EventRescheduled'
    },

    PUBLICATION_STATUS: {
        DRAFT: 'draft',
        PUBLIC: 'public'
    }
}

export default constants
