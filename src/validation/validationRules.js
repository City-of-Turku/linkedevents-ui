
import moment from 'moment'
import {includes, every, isNull} from 'lodash';
import CONSTANT from '../constants'
import {textLimitValidator} from '../utils/helpers'
import {mapKeywordSetToForm} from '../utils/apiDataMapping'
/**
 * Notice that all the validation functions follow the Formsy's parameter setup (values, value)
 * where values are all the form valus and value the tested field value
 */

let _isExisty = function _isExisty(value) {
    return value !== null && value !== undefined;
}

let isEmpty = function isEmpty(value) {
    if (value === '') {return true}
    if (value === null) {return true}
    if (typeof value == 'object') {
        const vals = Object.values(value);
        if (vals.length > 0 && vals[0] === '') {return true}
        if (vals.length === 0) {return true}
    }
}

const _containsAllLanguages = (value, languages) => {
    let requiredLanguages = new Set(languages)
    _.forOwn(value, (item, key) => {
        if (isNull(item) || item.length && item.length > 0) {
            requiredLanguages.delete(key)
        }
    })
    return requiredLanguages.size === 0
}

const _isUrl = function(values, value) {
    return validations.matchRegexp(values, value, /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i);
}

var validations = {
    isDefaultRequiredValue: function isDefaultRequiredValue(values, value) {
        return value === undefined || value === '';
    },
    isExisty: function isExisty(values, value) {
        return _isExisty(value);
    },
    matchRegexp: function matchRegexp(values, value, regexp) {
        return !_isExisty(value) || isEmpty(value) || regexp.test(value);
    },
    isUndefined: function isUndefined(values, value) {
        return value === undefined;
    },
    isEmptyString: function isEmptyString(values, value) {
        return isEmpty(value);
    },
    /* eslint-disable */
    isEmail: function isEmail(values, value) {
        return validations.matchRegexp(values, value, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i);
    },
    /* eslint-enable */
    isUrl: function isUrl(values, value, key) {
        if (typeof value === 'object') {
            if (typeof key !== 'undefined') {
                // Check all language urls
                let finnishUrlValidationPassed = true
                let englishUrlValidationPassed = true
                let swedishUrlValidationPassed = true
                if (value[key]) {
                    if (value[key].fi) {
                        finnishUrlValidationPassed = _isUrl(values, value[key].fi)
                    }
                    if (value[key].en) {
                        englishUrlValidationPassed = _isUrl(values, value[key].en)
                    }
                    if (value[key].sv) {
                        swedishUrlValidationPassed = _isUrl(values, value[key].sv)
                    }
                }
                return finnishUrlValidationPassed && englishUrlValidationPassed && swedishUrlValidationPassed
            } else {
                return _.every(value, (item) => {
                    return _isUrl(values, item)
                })
            }
        }
        return _isUrl(values, value)
    },
    isTrue: function isTrue(values, value) {
        return value === true;
    },
    isFalse: function isFalse(values, value) {
        return value === false;
    },
    isNumeric: function isNumeric(values, value) {
        if (typeof value === 'number') {
            return true;
        }
        return validations.matchRegexp(values, value, /^[-+]?(?:\d*[.])?\d+$/);
    },
    isAlpha: function isAlpha(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z]+$/i);
    },
    isAlphanumeric: function isAlphanumeric(values, value) {
        return validations.matchRegexp(values, value, /^[0-9A-Z]+$/i);
    },
    isInt: function isInt(values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:0|[1-9]\d*))$/);
    },
    isFloat: function isFloat(values, value) {
        return validations.matchRegexp(values, value, /^(?:[-+]?(?:\d+))?(?:\.\d*)?(?:[eE][\+\-]?(?:\d+))?$/);
    },
    isWords: function isWords(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s]+$/i);
    },
    isSpecialWords: function isSpecialWords(values, value) {
        return validations.matchRegexp(values, value, /^[A-Z\s\u00C0-\u017F]+$/i);
    },
    isLength: function isLength(values, value, length) {
        return !_isExisty(value) || isEmpty(value) || value.length === length;
    },
    equals: function equals(values, value, eql) {
        return !_isExisty(value) || isEmpty(value) || value == eql;
    },
    equalsField: function equalsField(values, value, field) {
        return value == values[field];
    },
    maxLength: function maxLength(values, value, length) {
        return !_isExisty(value) || value.length <= length;
    },
    minLength: function minLength(values, value, length) {
        return !_isExisty(value) || isEmpty(value) || value.length >= length;
    },
    isTime: function isTime(values, value) {
        // Empty string needs not match, because HelTimePicker does not run validations on empty strings anyway.
        // However, HelDateTimeField itself runs this too, and there we must *not* accept empty time.
        return validations.matchRegexp(values, value, /(24((:|\.)00)?)|^((2[0-3]|1[0-9]|0[0-9]|[0-9])((:|\.)[0-5][0-9])?)$/i);
    },
    isDate(values, value) {
        // Emtpy string needs to match, to allow empty *or* valid date.
        // Required (non-empty) fields are validated separately.
        return !value | moment(value, moment.ISO_8601, true).isValid()
    },
    afterStartTime: function afterStartTime(values, value) {
        if (!values.start_time || !value) return true

        const time = new Date(value)
        const start_time = new Date(values.start_time)

        return time - start_time >= 0;
    },
    afterEnrolmentStartTime: function afterEnrolmentStartTime(values, value) {
        if(!values.enrolment_start_time || !value) { return true }
        return new Date(value) >= new Date(values.enrolment_start_time)
    },
    inTheFuture: function inTheFuture(values, value) {

        if(!value) {return true}

        let now = new Date()
        let time = new Date(value)

        if (time - now >= 0) {
            return true;
        }

        return false;
    },
    defaultEndInTheFuture: function defaultEndInTheFuture(values, value) {
        if (values['end_time']) {
            return true
        }
        const defaultEndTime = moment(value).endOf('day')
        return defaultEndTime.diff(moment()) > 0
    },
    required: function required(values, value) {
        return _isExisty(value)
    },
    requiredImage: function requiredImage(values, value) {
        if(typeof value !== 'object' || !value) {
            return false
        }
        if (Object.keys(value).length === 0) {
            return false;
        }
        return true
    },
    requiredForCourses: function requiredForCourses(values, value){
        if (values['type_id'] === 1) {
            return true;
        }
        return this.required(values, value);
    },
    requiredString: function requiredString(values, value) {
        if(typeof value === 'string' && value.length > 0) {
            return true
        }
        return false
    },
    requiredStringForCourses: function requiredStringForCourses(values, value){
        if (values['type_id'] === 1) {
            return true;
        }
        return this.requiredString(values, value);
    },
    requiredMulti(values, value) {
        if(typeof value !== 'object' || !value) {
            return false;
        }
        if (Object.keys(value).length === 0) {
            return false;
        }
        const valueContent = Object.values(value);
        return valueContent.every(x => !isNull(x)) && valueContent.every(x => typeof x === 'string' && x.trim().length > 0)
    },
    requiredAtId: function requiredAtId(values, value) {
        if(typeof value !== 'object' || !value) {
            return false
        }
        if(typeof value['@id'] !== 'string') {
            return false
        }
        if(value['@id'].length === 0) {
            return false
        }

        return true
    },
    atLeastOne: function atLeastOne(values, value) {
        if(value && value.length && value.length > 0) {
            return true
        }
        return false
    },
    atLeastOneMainCategory(values, value, keywordSets) {
        if (!value) {
            return false
        }
        // Changed keywordSets to be compatible with Turku's backend.
        return mapKeywordSetToForm(keywordSets, 'turku:topics')
            .map(item => item.value)
            .some(item => value.find(_item => _item.value.includes(item)))
    },
    shortString: function shortString(values, value) {
        return textLimitValidator(value, CONSTANT.CHARACTER_LIMIT.SHORT_STRING)
    },
    mediumString: function mediumString(values, value) {
        return textLimitValidator(value, CONSTANT.CHARACTER_LIMIT.MEDIUM_STRING)
    },
    longString: function longString(values, value) {
        return textLimitValidator(value, CONSTANT.CHARACTER_LIMIT.LONG_STRING)
    },
    requiredInContentLanguages: function requiredInContentLanguages(values, value) {
        if (typeof value !== 'object') {
            return false
        }
        return _containsAllLanguages(value, values._contentLanguages)
    },
    offerIsFreeOrHasPrice: function offerIsFreeOrHasPrice(values, value, key) {
        if (typeof value !== 'object') {
            return false
        }
        return _containsAllLanguages(value[key], values._contentLanguages)
    },
    atLeastOneIsTrue: function atLeastOneIsTrue(values, value) {
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                if(value[key]) {
                    return true
                }
            }
        }
        return false
    },
    isMoreThanOne: function isMoreThanOne(values, value) {
        return value > 0 ? true : false
    },
    isMoreThanTwo: function isMoreThanTwo(values, value) {
        return Object.keys(value).length >= 2
    },
    isMoreThanSixtyFive: function isMoreThanSixtyFive(values, value) {
        return Object.keys(value).length <= 65
    },
    daysWithinInterval: function daysWithinInterval(values, value) {
        if (!(value < 6)) { return true }
        const {start_day_index, end_day_index, daysSelected} = values
        const dayCodes = {
            monday: 0,
            tuesday: 1,
            wednesday: 2,
            thursday: 3,
            friday: 4,
            saturday: 5,
            sunday: 6,
        };
        let daysSelectedState = [];
        let betweenInterval;

        if (start_day_index <= end_day_index) {
            betweenInterval = true
        } else {
            betweenInterval = false
        }

        for (const key in daysSelected) {
            if (daysSelected[key] === true) {
                if (betweenInterval) {
                    daysSelectedState.push(start_day_index <= dayCodes[key] && dayCodes[key] <= end_day_index)
                } else {
                    daysSelectedState.push(dayCodes[key] <= end_day_index || start_day_index <= dayCodes[key])
                }
            }
        }

        if (includes(daysSelectedState, false)) {
            return false;
        } else {
            return true;
        }
    },
    hasPrice: function hasPrice(values, value, key) {
        if (value.is_free !== undefined && !value.is_free) {
            const validateLanguages = (value) => {
                let hasFinnish = true;
                let hasEnglish = true;
                let hasSwedish = true;
                let hasLanguage = false
                if (value.fi) {
                    hasLanguage = true
                    hasFinnish = !!value.fi.length
                }
                if (value.en) {
                    hasLanguage = true
                    hasEnglish = !!value.en.length
                }
                if (value.sv) {
                    hasLanguage = true
                    hasSwedish = !!value.sv.length
                }
                return hasLanguage && hasFinnish && hasEnglish && hasSwedish
            }
            return value[key] && validateLanguages(value[key])
        } else {
            return true
        }
    },
    requiredVideoField(values, value, key) {
        // check whether all values are empty
        const allEmpty = Object.values(values).every(isEmpty)

        if (allEmpty) {
            return true
        }

        // check whether given field value is empty
        return !Object.keys(values)
            .filter(valueKey => isEmpty(values[valueKey]))
            .includes(key)
    },
};

export default validations;
