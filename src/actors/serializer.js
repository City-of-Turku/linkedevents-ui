
/*
Saves store state to global module for another app
 */

let arg = {};

window.ARG = arg;

var jwtDecode = require('jwt-decode');

export default (store) => {
    const state = _.cloneDeep(_.omit(store.getState(), ['userEvents']));
    if (state.user) {
        let token = jwtDecode(state.user.token);
        state.user.token = null; // JWT token is of not to be saved into Sentry
        state.user.exp = token.exp;
    }
    window.ARG = state;
}
