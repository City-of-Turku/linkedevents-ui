import PropTypes from 'prop-types'

const TABLE_COLUMNS = [
    'checkbox',
    'name',
    'publisher',
    'start_time',
    'end_time',
    'last_modified_time',
    'date_published',
    'event_time',
    'validation',
]

const constants = {
    API_HEADERS: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },

    APP_SET_FLASHMSG: 'APP_SET_FLASHMSG',
    APP_CLEAR_FLASHMSG: 'APP_CLEAR_FLASHMSG',
    APP_CONFIRM_ACTION: 'APP_CONFIRM_ACTION',
    APP_DO_ACTION: 'APP_DO_ACTION',
    APP_CANCEL_ACTION: 'APP_CANCEL_ACTION',

    RECEIVE_EVENT_FOR_EDITING: 'RECEIVE_EVENT_FOR_EDITING',

    REQUEST_IMAGES: 'REQUEST_IMAGES',
    RECEIVE_IMAGES: 'RECEIVE_IMAGES',
    REQUEST_IMAGES_AND_META: 'REQUEST_IMAGES_AND_META',
    RECEIVE_IMAGES_AND_META: 'RECEIVE_IMAGES_AND_META',
    SELECT_IMAGE_BY_ID: 'SELECT_IMAGE_BY_ID',

    RECEIVE_USERDATA: 'RECEIVE_USERDATA',
    CLEAR_USERDATA: 'CLEAR_USERDATA',

    EDITOR_RECEIVE_KEYWORDSETS: 'EDITOR_RECEIVE_KEYWORDSETS',
    EDITOR_RECEIVE_LANGUAGES: 'EDITOR_RECEIVE_LANGUAGES',
    EDITOR_SETDATA: 'EDITOR_SETDATA',
    EDITOR_UPDATE_SUB_EVENT: 'EDITOR_UPDATE_SUB_EVENT',
    EDITOR_DELETE_SUB_EVENT: 'EDITOR_DELETE_SUB_EVENT',
    EDITOR_SORT_SUB_EVENTS: 'EDITOR_SORT_SUB_EVENTS',
    EDITOR_ADD_OFFER: 'EDITOR_ADD_OFFER',
    EDITOR_DELETE_OFFER: 'EDITOR_DELETE_OFFER',
    EDITOR_CLEAR_VALUE: 'EDITOR_CLEAR_VALUE',
    EDITOR_SET_FREE_OFFERS: 'EDITOR_SET_FREE_OFFERS',
    EDITOR_SETLANGUAGES: 'EDITOR_SETLANGUAGES',
    EDITOR_REPLACEDATA: 'EDITOR_REPLACEDATA',
    EDITOR_CLEARDATA: 'EDITOR_CLEARDATA',
    EDITOR_SENDDATA_SUCCESS: 'EDITOR_SENDDATA_SUCCESS',
    EDITOR_SET_LOADING: 'EDITOR_SET_LOADING',
    SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
    VALIDATE_FOR: 'VALIDATE_FOR',

    ORG_FETCH_ADMIN: 'ORG_FETCH_ADMIN',
    ORG_FETCH_ADMIN_FAILED: 'ORG_FETCH_ADMIN_FAILED',
    ORG_FETCH_ADMIN_SUCCESS: 'ORG_FETCH_ADMIN_SUCCESS',

    IMAGE_UPLOAD_SUCCESS: 'IMAGE_UPLOAD_SUCCESS',
    IMAGE_UPLOAD_ERROR: 'IMAGE_UPLOAD_ERROR',

    DEFAULT_LOCALE: 'fi',

    APPLICATION_SUPPORT_TRANSLATION: ['fi', 'sv', 'en'],
    // currently there is only finnish translation in i18n

    // Locale actions
    LOCALE_ACTIONS: {
        LOCALE_SET: 'LOCALE_SET',
        LOCALE_RESET: 'LOCALE_RESET',
    },
    
    // Local storage keys
    EDITOR_VALUES: 'EDITOR_VALUES',

    // Super event types
    SUPER_EVENT_TYPE_RECURRING: 'recurring',
    SUPER_EVENT_TYPE_UMBRELLA: 'umbrella',

    // Sub event types
    SUB_EVENT_TYPE_RECURRING: 'sub_recurring',
    SUB_EVENT_TYPE_UMBRELLA: 'sub_umbrella',

    // Event schedule values
    EVENT_STATUS: {
        SCHEDULED: 'EventScheduled',
        CANCELLED: 'EventCancelled',
        POSTPONED: 'EventPostponed',
        RESCHEDULED: 'EventRescheduled',
    },

    PUBLICATION_STATUS: {
        DRAFT: 'draft',
        PUBLIC: 'public',
    },

    VALIDATION_STATUS: {
        CLEARED: 'cleared', // When form is cleared we also clear validation errors and set this status
        RESOLVE: 'resolve', // When form has validation errors and user is on editor page
    },

    EVENT_CREATION: {
        CREATE: 'create',
        DELETE: 'delete',
        CANCEL: 'cancel',
        PUBLISH: 'publish',
        UPDATE: 'update',
        SUCCESS: 'success',
        SAVE_DRAFT: 'savedraft',
        SAVE_PUBLIC: 'savepublic',
        CREATE_SUCCESS: 'event-creation-create-success',
        DELETE_SUCCESS: 'event-creation-delete-success',
        CANCEL_SUCCESS: 'event-creation-cancel-success',
        PUBLISH_SUCCESS: 'event-creation-publish-success',
        MULTIPLE_EVENTS_SUCCESS: 'event-creation-multipleevents-success',
        SAVE_PUBLIC_SUCCESS: 'event-creation-savepublic-success',
        SAVE_DRAFT_SUCCESS: 'event-creation-savedraft-success',
        DEFAULT_SUCCESS: 'event-creation-default-success',
        UPDATE_SUCCESS: 'event-creation-update-success',
    },

    VALIDATION_RULES: {
        IS_URL: 'isUrl',
        IS_DATE: 'isDate',
        IS_TIME: 'isTime',
        IS_INT: 'isInt',
        LONG_STRING:'longString',
        MEDIUM_STRING: 'mediumString',
        SHORT_STRING: 'shortString',
        HAS_PRICE: 'hasPrice',
        REQUIRE_MULTI: 'requiredMulti',
        AFTER_START_TIME: 'afterStartTime',
        AFTER_ENROLMENT_START_TIME: 'afterEnrolmentStartTime',
        IN_THE_FUTURE: 'inTheFuture',
        DAY_WITHIN_INTERVAL: 'daysWithinInterval',
        REQUIRED_IN_CONTENT_LANGUAGE: 'requiredInContentLanguages',
        REQUIRED: 'required',
        REQUIRED_IMAGE: 'requiredImage',
        REQUIRED_FOR_COURSES: 'requiredForCourses',
        REQUIRED_STRING: 'requiredString',
        REQUIRED_STRING_FOR_COURSES: 'requiredStringForCourses',
        REQUIRE_AT_ID: 'requiredAtId',
        AT_LEAST_ONE: 'atLeastOne',
        AT_LEAST_ONE_MAIN_CATEGORY: 'atLeastOneMainCategory',
        IS_MORE_THAN_ONE: 'isMoreThanOne',
        AT_LEAST_ONE_IS_TRUE: 'atLeastOneIsTrue',
        DEFAULT_END_IN_FUTURE: 'defaultEndInTheFuture',
        REQUIRED_VIDEO_FIELD: 'requiredVideoField',
        IS_MORE_THAN_TWO: 'isMoreThanTwo',
        IS_MORE_THAN_SIXTYFIVE: 'isMoreThanSixtyFive',
    },

    CHARACTER_LIMIT: {
        SHORT_STRING: 160,
        MEDIUM_STRING: 320,
        LONG_STRING: 5000,
    },

    GENERATE_LIMIT: {
        OFFER_LENGTH: 20,
        EVENT_LENGTH: 65,
    },

    USER_TYPE: {
        ADMIN: 'admin',
        REGULAR: 'regular',
        PUBLIC: 'public',
    },

    TABLE_COLUMNS: TABLE_COLUMNS,

    TABLE_DATA_SHAPE: PropTypes.shape({
        events: PropTypes.array,
        count: PropTypes.number,
        paginationPage: PropTypes.number,
        pageSize: PropTypes.number,
        fetchComplete: PropTypes.bool,
        sortBy: PropTypes.string,
        sortDirection: PropTypes.string,
        tableColumns: PropTypes.arrayOf(
            PropTypes.oneOf(TABLE_COLUMNS),
        ),
        selectedRows: PropTypes.array,
        invalidRows: PropTypes.array,
    }),
}

export default constants
