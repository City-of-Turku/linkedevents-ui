const path = require('path');
const nconf = require('nconf');

let cityConfig;
let cityAssets;
let cityImages;
let cityi18n;
/**
 * city_theme package could have the following folders
 * some-ui /
 * assets /
 * -----> images /
 * --------------> images that used for scss, can be imported directly
 * -----> main.scss
 * -----> some scss files that are imported to main.scss
 * i18n /
 * -----> language .json files that override the default ones
 * -----> fi.json
 * plus whatever
 */

if (nconf.get('city_theme')) {
    // used in development, checks from config_dev.json
    cityConfig = path.resolve(__dirname, `../node_modules/${nconf.get('city_theme')}/`);
    cityAssets = path.resolve(cityConfig, 'assets/');
    cityImages = path.resolve(cityAssets, 'images/');
    cityi18n = path.resolve(cityConfig, 'i18n/');
}
else if (process.env.city_theme) {
    // used in production(???), checks from process.env
    cityConfig = path.resolve(__dirname, `../node_modules/${process.env.city_theme}/`);
    cityAssets = path.resolve(cityConfig, 'assets/');
    cityImages = path.resolve(cityAssets, 'images/');
    cityi18n = path.resolve(cityConfig, 'i18n/');
}
else {
    // used when no city_theme is available
    cityConfig = path.resolve(__dirname, '../src/assets/default/');
    cityAssets = path.resolve(cityConfig, 'assets/');
    cityImages = path.resolve(cityAssets, 'images/');
    cityi18n = path.resolve(cityConfig, 'i18n/');
}
module.exports = {cityConfig, cityAssets, cityImages, cityi18n};
