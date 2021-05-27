import fiMessages from './fi.json';
import enMessages from './en.json';
import svMessages from './sv.json';
import additionalMessages from '@city-i18n';

let fi = fiMessages;
let en = enMessages;
let sv = svMessages;
if (Object.entries(additionalMessages).length > 0) {
    Object.entries(additionalMessages).forEach(([key, value]) => {
        if(key === 'fi') {
            fi = {...fiMessages, ...value}
        }
        if (key === 'en') {
            en = {...enMessages, ...value}
        }
        if (key === 'sv') {
            sv = {...svMessages, ...value}
        }
    })
}

export default {fi, en, sv};
