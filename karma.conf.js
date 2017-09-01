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

        reporters: [ 'coverage', process.env.KARMA_REPORTER ],

        webpack,

        autoWatch: false,

        singleRun: true,

        browsers: ['Chrome_without_security'],

        coverageReporter: {
            type: 'html',
            dir: 'coverage/',
        },

        logLevel: config.LOG_DISABLE,

        client: {
            captureConsole: false,
            mocha: {
                bail: false,
            },
        },

        customLaunchers: {
            Chrome_without_security: {
                base: 'Chrome',
                flags: ['--disable-web-security'],
            },
        },

        webpackMiddleware: {
            quiet: true,
            stats: 'none',
        },
    });
};
