const express = require( 'express' );
const bodyParser = require( 'body-parser' );

const app = express();

app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }));
app.all( '*', function( req, res, next ) {
    res.header( 'Access-Control-Allow-Origin', '*' );
    res.header( 'Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS' );
    res.header( 'Access-Control-Allow-Headers', 'Content-Type' );
    next();
});

app.get( '/api/', ( req, res ) => {
    res.send({ success: true });
});
app.post( '/api/login/', ( req, res ) => {
    res.status( 200 );
    res.send({ success: true });
});
app.listen( process.env.PORT, () => {
    console.log( `server started on ${process.env.PORT}` );
});
