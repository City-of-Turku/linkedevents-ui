import _ from 'lodash'

export default () => {
    // Define appsettings for Jest tests
    const appSettings = {
        api_base: 'foourl',
        nocache: true,
        local_storage_user_expiry_time: 48,
        ui_mode: 'events',
    }
    global.appSettings = appSettings  // Jest's global == window
    global._ = _
}
