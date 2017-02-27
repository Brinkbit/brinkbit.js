module.exports = {
    context: __dirname,
    entry: './src/index.js',
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
    devtool: 'inline-source-map',
};
