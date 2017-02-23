module.exports = {
    context: __dirname,
    entry: [
        'babel-polyfill',
        './test/preview/index.js',
    ],
    output: {
        filename: 'brinkbit.js',
        libraryTarget: 'umd',
        library: 'Brinkbit',
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader' },
        ],
    },
};
