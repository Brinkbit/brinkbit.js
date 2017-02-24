module.exports = {
    context: __dirname,
    entry: [
        'babel-polyfill',
        './src/index.js',
    ],
    output: {
        filename: 'dist/brinkbit.js',
        libraryTarget: 'umd',
        library: 'Brinkbit',
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: `babel-loader${process.env.NODE_ENV === 'test' ? '' : '?presets[]=es2015'}` },
        ],
    },
};
