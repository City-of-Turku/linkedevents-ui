const pug = require('pug')
const path = require('path')
const common = require('../config/webpack/common')
const readConfig = require('../config/appConfig').readConfig;

const compiledTemplate = pug.compileFile(path.join(common.paths.SRC, 'index.pug'), {pretty: true})

const clientConfigKeys = ['api_base', 'local_storage_user_expiry_time', 'nocache',
    'raven_id', 'commit_hash', 'ui_mode', 'show_cookie_bar'];
const clientConfig = readConfig(clientConfigKeys);
const appMode = readConfig('APP_MODE');
const leProductionInstance = readConfig('LE_PRODUCTION_INSTANCE');

const indexTemplate = compiledTemplate({
    APP_MODE: appMode,
    LE_PRODUCTION_INSTANCE: leProductionInstance,
    ui_mode: clientConfig.ui_mode,
    configJson: JSON.stringify(clientConfig),
})

module.exports = indexTemplate
