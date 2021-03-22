const appConfig = require('../config/appConfig');
const configKeys = ['port', 'publicUrl', 'sessionSecret'];

appConfig.ensureConfigExists(configKeys);

export default function getOptions() {
    return appConfig.readConfig(configKeys);
}
