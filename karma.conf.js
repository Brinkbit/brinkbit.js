const webpack = require( './webpack.config.js' );

module.exports = function conf( config ) {
    config.set({
        files: [
            'test/index.js',
        ],

        frameworks: ['mocha'],

        preprocessors: {
            'test/index.js': [ 'webpack', 'sourcemap' ],
        },

        reporters: [ 'mocha', 'coverage' ],

        webpack,

        autoWatch: false,

        singleRun: true,

        browsers: ['Chrome'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage/',
        },

        client: {
            captureConsole: false,
            mocha: {},
        },

        webpackMiddleware: {
            stats: 'errors-only',
        },
    });
};
