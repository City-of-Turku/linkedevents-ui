const nconf = require('nconf');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const path = require('path');
const paths = require('./webpack/common').paths;


// Config-keys used by server
const serverConfigKeys = ['port', 'publicUrl', 'helsinkiAuthId', 'helsinkiAuthSecret', 'helsinkiTargetApp', 'sessionSecret'];
// Config-keys used for pug template
const templateConfigKeys = ['LE_PRODUCTION_INSTANCE', 'APP_MODE'];
// React-app config-keys
const clientConfigKeys = ['api_base', 'local_storage_user_expiry_time', 'nocache', 'raven_id', 'commit_hash', 'ui_mode',
    'client_id', 'openid_audience', 'openid_authority'];

const gitRevisionPlugin = new GitRevisionPlugin();
nconf.overrides({
    'commit_hash': gitRevisionPlugin.commithash(),
});

// Read values from env, all known config-keys are whitelisted
const allKeys = serverConfigKeys.concat(templateConfigKeys, clientConfigKeys);
nconf.env({whitelist: allKeys, parseValues: true});

// Read config_dev.json if in development-mode. Will not overwrite configs from env.
if (process.env.NODE_ENV === 'development') {
    nconf.file({file: path.join(paths.ROOT, 'config_dev.json'), parseValues: true});
}

// Defaults, fall back to these if they are not found in any of the previous sources
nconf.defaults({
    'LE_PRODUCTION_INSTANCE': '#',
    'APP_MODE': process.env.NODE_ENV,
    'port': 8080,
    'ui_mode': 'events',
});

/**
 * Function to retrieve value from config
 * @param {undefined|string|string[]} keys
 */
function getConfig(keys) {
    // Return all config if no keys provided
    if (!keys) {
        return nconf.get();
    }

    // Get single item, return value as is
    if (typeof keys === 'string') {
        nconf.required([keys]);
        return nconf.get(keys);
    }

    // Multiple keys provided, return object
    nconf.required(keys);
    return keys.reduce(function(obj, key) {
        obj[key] = nconf.get(key);
        return obj;
    }, {});
}

function ensureConfigExists(keys) {
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    nconf.required(keys);
}

module.exports = {
    readConfig: getConfig,
    ensureConfigExists: ensureConfigExists,
    serverConfigKeys: serverConfigKeys,
    templateConfigKeys: templateConfigKeys,
    clientConfigKeys: clientConfigKeys,
};
