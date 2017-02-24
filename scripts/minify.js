/* eslint-disable import/no-extraneous-dependencies */

const fsExtra = require( 'fs-extra' );
const bluebird = require( 'bluebird' );
const UglifyJS = require( 'uglify-js' );
const path = require( 'path' );

const fse = bluebird.promisifyAll( fsExtra );

fse.readFileAsync( path.resolve( __dirname, '../dist/brinkbit.js' ), 'utf8' )
.then(( code ) => {
    const toplevel = UglifyJS.parse( code );
    toplevel.figure_out_scope();
    const compressedAst = toplevel.transform(
        UglifyJS.Compressor() // eslint-disable-line new-cap
    );
    compressedAst.figure_out_scope();
    compressedAst.compute_char_frequency();
    compressedAst.mangle_names();
    const stream = UglifyJS.OutputStream(); // eslint-disable-line new-cap
    compressedAst.print( stream );
    return fse.writeFileAsync( path.resolve( __dirname, '../dist/brinkbit.min.js' ), stream.toString());
})
.then(() => {
    process.exit( 0 );
})
.catch(( error ) => {
    console.log( error ); // eslint-disable-line no-console
    process.exit( 1 );
});
