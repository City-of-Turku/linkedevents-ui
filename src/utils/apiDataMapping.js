import {find} from 'lodash'
import {getStringWithLocale} from './locale'

export function mapKeywordSetToForm(keywordSets, id, locale = 'fi') {
    let keywordSet = find(keywordSets, {'id': id})
    if(keywordSet && keywordSet.keywords) {
        return keywordSet.keywords.map((item) => {
            let label = getStringWithLocale(item, 'name', locale)
            // we don't want yso parentheses visible in keyword sets, so only pick the part before them
            label = label.split([' ('])[0]
            return {
                value: item['@id'],
                label: label,
                name: item.name,
            }
        })
    }

    else {
        return []
    }
}

export function mapLanguagesSetToForm(set, locale = 'fi') {
    if(set && set.length) {
        return set.map((item) => {
            let label = getStringWithLocale(item, 'name', locale, item.id)
            return {
                value: item['@id'],
                label: label,
            }
        })
    }

    else {
        return []
    }
}
