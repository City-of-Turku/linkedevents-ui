import constants from '../constants'
import {map, sortBy, omit, get as getIfExists} from 'lodash'
import updater from 'immutability-helper';

import {mapAPIDataToUIFormat} from 'src/utils/formDataMapping.js'
import getContentLanguages from 'src/utils/language'

import {doValidations} from 'src/validation/validator.js'

let editorValues = {
    sub_events: {},
}
let languages = {}
let keywordSets = {}

try {
    // Local storage form value loading and saving disabled for now
    // editorValues = JSON.parse(localStorage.getItem('EDITOR_VALUES'))
    keywordSets = JSON.parse(localStorage.getItem('KEYWORDSETS'))
    languages = JSON.parse(localStorage.getItem('LANGUAGES'))
    //
} catch(e) {
    editorValues = {}
}

const initialState = {
    values: editorValues || {},
    languages: languages,
    contentLanguages: ['fi'],
    keywordSets: keywordSets,
    validationErrors: {},
    validateFor: null,
    loading: false,
}

function clearEventDataFromLocalStorage() {
    localStorage.setItem('EDITOR_VALUES', JSON.stringify({}))
}

function update(state = initialState, action) {
    if (action.type === constants.EDITOR_SETDATA) {
        let newValues = {}
        // Merge new values to existing values
        if (action.event) {
            newValues = updater(state, {
                values: {
                    sub_events: {
                        [action.key]: {
                            $set: action.values[action.key],
                        },
                    },
                },
            });
            newValues = newValues.values
        } else if (action.offer) {
            newValues = updater(state, {
                values: {
                    offers: {
                        [action.key]: {
                            $set: action.values[action.key],
                        },
                    },
                },
            });
            newValues = newValues.values
        } else {
            newValues = Object.assign({}, state.values, action.values)
        }
    
        // Local storage saving disabled for now
        // localStorage.setItem('EDITOR_VALUES', JSON.stringify(newValues))
    
        let validationErrors = Object.assign({}, state.validationErrors)
        // If there are validation errors, check if they are fixed
        if (_.keys(state.validationErrors).length > 0) {
            validationErrors = doValidations(newValues, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }

        if (action.event) {
            return updater(state, {
                values: {
                    sub_events: {
                        [action.key]: {
                            $set: newValues.sub_events[action.key],
                        },
                    },
                },
                validationErrors: {$set: validationErrors},
            });
        } else if (action.offer) {
            return updater(state, {
                values: {
                    offers: {
                        [action.key]: {
                            $set: newValues.offers[action.key],
                        },
                    },
                },
                validationErrors: {$set: validationErrors},
            });
        }

        return Object.assign({}, state, {
            values: newValues,
            validationErrors: validationErrors,
        })
    }

    if (action.type === constants.EDITOR_CLEAR_VALUE) {
        return updater(state, {
            values: {
                $unset: action.values,
            },
        })
    }

    if (action.type === constants.EDITOR_UPDATE_SUB_EVENT) {

        const newValues = updater(state.values, {
            sub_events: {
                [action.eventKey]: {
                    [action.property]: {$set: action.value},
                },
            },
        })
        
        let validationErrors = Object.assign({}, state.validationErrors)
        // If there are validation errors in sub_events, check if they are fixed
        if (state.validationErrors.sub_events) {
            validationErrors = doValidations(newValues, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }

        const x = Object.assign({}, state, {
            values: newValues,
            validationErrors,
        })
        return x
    }

    if (action.type === constants.EDITOR_DELETE_SUB_EVENT) {
        const oldSubEvents = Object.assign({}, state.values.sub_events);
        const newSubEvents = omit(oldSubEvents, action.event);
        return updater(state, {
            values: {
                sub_events: {
                    $set: newSubEvents,
                },
            },
        });
    }

    if (action.type === constants.EDITOR_SORT_SUB_EVENTS) {
        const mappedSubEvents = map(state.values.sub_events)
        const eventsWithValues = mappedSubEvents.reduce((events, event) => {
            if (event.start_time !== undefined) {
                events.push(event)
            }
            return events
        }, [])
        const sortedSubEvents = sortBy(eventsWithValues, (event) => event.start_time)

        const subEventsObject = {};
        for (const event in sortedSubEvents) {
            subEventsObject[event] = sortedSubEvents[event]
        }

        return updater(state, {
            values: {
                sub_events: {
                    $set: subEventsObject,
                },
            },
        });
    }

    if (action.type === constants.EDITOR_ADD_OFFER) {
        let offersItems = []
        if (state.values.offers) {
            offersItems = JSON.parse(JSON.stringify(state.values.offers))
        }
        offersItems.push(action.values)
        return updater(state, {
            values: {
                offers: {
                    $set: offersItems,
                },
            },
        })
    }

    if (action.type === constants.EDITOR_DELETE_OFFER) {
        const index = parseInt(action.offerKey)
        const offers = JSON.parse(JSON.stringify(state.values.offers))
        offers.splice(index, 1)
        return updater(state, {
            values: {
                offers: {
                    $set: offers,
                },
            },
        });
    }

    if (action.type === constants.EDITOR_SET_FREE_OFFERS) {
        const offers = JSON.parse(JSON.stringify(state.values.offers))
        for (const offer of offers) {
            offer.is_free = action.isFree
        }

        if (action.isFree === true) {
            // Event is free so we can clear the offers key from state store
            // this prevents validation errors on possibly already entered offer fields
            return updater(state, {
                values: {
                    $unset: ['offers'],
                },
            })
        }

        return updater(state, {
            values: {
                offers: {
                    $set: offers,
                },
            },
        })
    }

    if (action.type === constants.EDITOR_SETLANGUAGES) {
        return Object.assign({}, state, {
            contentLanguages: action.languages,
        });
    }

    if (action.type === constants.VALIDATE_FOR) {
        return Object.assign({}, state, {
            validateFor: action.validateFor,
        })
    }

    if (action.type === constants.EDITOR_REPLACEDATA) {

        // Replace new values to existing values
        let newValues = Object.assign({}, action.values)

        // Local storage saving disabled for now
        // localStorage.setItem('EDITOR_VALUES', JSON.stringify(newValues))

        return Object.assign({}, state, {
            values: newValues,
            contentLanguages: getContentLanguages(newValues),
        })
    }

    if (action.type === constants.EDITOR_CLEARDATA) {
        clearEventDataFromLocalStorage()

        return Object.assign({}, state, {
            values: editorValues,
            validationErrors: {},
            validateFor: null,
            validationStatus: constants.VALIDATION_STATUS.CLEARED,
        })
    }

    if (action.type === constants.EDITOR_SENDDATA_SUCCESS) {
        clearEventDataFromLocalStorage()

        return {
            ...state,
            values: editorValues,
        }
    }

    if (action.type === constants.EDITOR_RECEIVE_KEYWORDSETS) {
        return Object.assign({}, state, {
            keywordSets: action.keywordSets,
        })
    }

    if (action.type === constants.EDITOR_RECEIVE_LANGUAGES) {
        return Object.assign({}, state, {
            languages: action.languages,
        })
    }

    if (action.type === constants.RECEIVE_EVENT_FOR_EDITING) {
        return {
            ...state,
            values: mapAPIDataToUIFormat({...action.event}),
        }
    }

    if (action.type === constants.SELECT_IMAGE_BY_ID) {
        let newVal = getIfExists(action, 'img', null)
        // Merge new values to existing values
        let newImage = (Object.assign({}, state.values, {image: newVal}))
        let validationErrors = Object.assign({}, state.validationErrors)
        // If there are validation errors, check if they are fixed
        if (_.keys(state.validationErrors).length > 0) {
            validationErrors = doValidations(newImage, state.contentLanguages, state.validateFor || constants.PUBLICATION_STATUS.PUBLIC, state.keywordSets)
        }

        const x = Object.assign({}, state, {
            values: newImage,
            validationErrors: validationErrors,
        })
        return x
    }

    if (action.type === constants.SET_VALIDATION_ERRORS) {
        return Object.assign({}, state, {
            validationErrors: action.errors,
            validationStatus: constants.VALIDATION_STATUS.RESOLVE,
        })
    }

    if (action.type === constants.EDITOR_SET_LOADING) {
        return {
            ...state,
            loading: action.loading,
        }
    }

    return state
}

export default update
