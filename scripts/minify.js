/* eslint-disable import/no-extraneous-dependencies */

const fsExtra = require( 'fs-extra' );
const bluebird = require( 'bluebird' );
const UglifyJS = require( 'uglify-js' );
const path = require( 'path' );

const fse = bluebird.promisifyAll( fsExtra );

fse.readFileAsync( path.resolve( __dirname, '../dist/brinkbit.js' ), 'utf8' )
.then( code =>
    fse.writeFileAsync( path.resolve( __dirname, '../dist/brinkbit.min.js' ), UglifyJS.minify( code, {
        warnings: 'verbose',
    }).code )
)
.then(() => {
    process.exit( 0 );
})
.catch(( error ) => {
    console.log( error ); // eslint-disable-line no-console
    process.exit( 1 );
});
