const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const shell = require( 'shelljs' );
const Brinkbit = require( 'brinkbit' );

const env = require( '../../env' );

const app = express();
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }));
app.use( '/api', new Brinkbit( env.server.config ).createMiddleware());
if ( env.server.getreset ) {
    app.get( '/getreset', ( req, res, next ) => {
        shell.exec( env.server.getreset, { async: true, cwd: env.server.cwd }, ( code, stdout, stderr ) => {
            if ( code ) {
                next( stderr );
            }
            else {
                res.send({ data: stdout.replace( /\n/g, '' ) });
            }
        });
    });
}
app.listen( env.server.port );
