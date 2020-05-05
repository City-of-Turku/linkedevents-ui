
/*
Saves store state to global module for another app
 */

let arg = {};

window.ARG = arg;

export default (store) => {
    const state = _.cloneDeep(_.omit(store.getState(), ['userEvents', 'auth']));
    window.ARG = state;
}
