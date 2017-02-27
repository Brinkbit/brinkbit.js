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
    if ( req.body.username === 'Violet' && req.body.password === 'FireballsAreTheWorst' ) {
        res.status( 200 );
        res.send({
            access_token: 'testToken',
            user: 'testUserid',
        });
    }
    else {
        res.status( 401 );
        res.send({
            code: 401,
            description: 'Invalid username or password',
            details: {},
            type: 'authentication_error',
            error: 'Unauthorized',
        });
    }
});
app.listen( process.env.PORT, () => {
    console.log( `server started on ${process.env.PORT}` );
});
