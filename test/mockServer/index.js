const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const Brinkbit = require( 'brinkbit' );
const env = require( '../../env' );

const app = express();
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }));
app.use( '/api', new Brinkbit( env.server.config ).createMiddleware());
app.listen( env.server.port, () => {
    console.log( 'server started' );
});
