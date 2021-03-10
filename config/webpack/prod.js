const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');
const common = require('./common');
const appConfig = require('../appConfig');
const assetPath = require('../assetPath');

// There are defined in common.js as well, but that is not available without
// transpilation, which is not done for webpack configuration file
const path = require('path');

const required = appConfig.clientConfigKeys.concat(appConfig.templateConfigKeys);
appConfig.ensureConfigExists(required);

const indexTemplate = require('../../server/renderIndexTemplate')

const ASSET_PATH = '/'

const ui_mode = appConfig.readConfig('ui_mode')

const config = {
    context: path.join(common.paths.ROOT, '/src'),
    entry: [
        //'webpack-hot-middleware/client',
        'core-js/stable/object/assign',
        path.join(common.paths.SRC, '/index.js'),
    ],
    output: {
        publicPath: ASSET_PATH,
        path: common.paths.ROOT + '/dist',
        filename: '[name].[chunkhash].js',
    },
    devtool: 'source-map',
    resolve: {
        modules: [common.paths.ROOT, 'node_modules'],
        extensions: ['.', '.webpack.js', '.web.js', '.jsx', '.js'],
        alias: {
            '@city-assets': assetPath.cityAssets,
            '@city-images': assetPath.cityImages,
            '@city-i18n': assetPath.cityi18n,
        },
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)?$/,
                exclude: /node_modules/,
                enforce: 'pre',
                use: ['babel-loader', 'eslint-loader'],
            },
            {test: /\.(js|jsx)?$/, exclude: /node_modules/, loader: 'babel-loader'},
            {
                test: /\.scss$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'sass-loader', options: {data: '$ui-mode: ' + ui_mode + ';'}},
                ],
            },
            {test: /\.ico$/, loader: 'url-loader', options: {mimetype: 'image/x-icon'}},
            {test: /\.css$/, use: ['style-loader', 'css-loader']},
            {test: /\.md$/, loader: 'html-loader!markdown-loader'},
            {test: /\.(jade|pug)?$/, loader: 'pug-loader'},
            {test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader'},
            {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
            {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
        ],
    },
    plugins: [
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"production"',
        }),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new HtmlWebpackPlugin({
            inject: true,
            templateContent: indexTemplate,
        }),
        new webpack.DefinePlugin({
            oidcSettings: {
                client_id: JSON.stringify(appConfig.readConfig('client_id')),
                openid_audience: JSON.stringify(appConfig.readConfig('openid_audience')),
                openid_authority: JSON.stringify(appConfig.readConfig('openid_authority')),
            },
        }),
    ],
};

module.exports = config;
