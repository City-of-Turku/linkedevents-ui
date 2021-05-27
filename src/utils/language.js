import {map, filter, keys} from 'lodash'
import API from 'src/api'

// TODO: configure somewhere properly.
// name & alt_text fields are for the event image object.
const SKIP_FIELDS = new Set(['location', 'keywords', 'audience', 'languages', 'in_language', 'sub_events','name','alt_text']);

// Enumerate all the property names
// of an object recursively.
function* propertyNames(obj, parent) {
    for (let name of keys(obj)) {
        let val = obj[name];
        if (val instanceof Object && !SKIP_FIELDS.has(name)) {
            yield* propertyNames(val);
        }
        if (val && val != '') {
            yield name;
        }
    }
}

// Given an event object, get all the languages which
// have any attributes filled.
export default function getContentLanguages(event) {
    if (!event) {
        return [];
    }
    const orderedLanguages = map(API.eventInfoLanguages(), l => l.value);
    const languages = new Set(orderedLanguages);
    let foundLanguages = new Set();
    for (let name of propertyNames(event)) {
        if (foundLanguages.size == languages.size) {
            break;
        }
        if (languages.has(name)) {
            foundLanguages.add(name);
        }
    }
    return filter(orderedLanguages, l => foundLanguages.has(l));
}
