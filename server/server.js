/* eslint-disable no-console */

import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'

import getSettings from './getSettings'
import express from 'express'

import webpack from 'webpack'
import webpackMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import config from '../config/webpack/dev.js'

const settings = getSettings()
const app = express()

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({name: 's', secret: settings.sessionSecret, maxAge: 86400 * 1000}));

if(process.env.NODE_ENV !== 'development') {
    app.use('/', express.static(path.resolve(__dirname, '..', 'dist')));
    app.get('*', function (req, res) {
        res.sendFile(path.resolve(__dirname, '..', 'dist', 'index.html'));
    });
} else {
    const indexTemplate = require('./renderIndexTemplate');
    const compiler = webpack(config)
    app.use(webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {
            colors: true,
            assets: false,
            modules: false,
        },
    }));
    app.use(webpackHotMiddleware(compiler));
    
    app.get('*', (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html')   
        res.end(indexTemplate)
    })
}
console.log('Starting server at port', settings.port);
app.listen(settings.port);
