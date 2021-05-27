// eslint-disable-next-line
reg = require('@babel/register');
require('app-module-path').addPath(require('path').resolve(__dirname, '..', 'src'));
require('./server');
