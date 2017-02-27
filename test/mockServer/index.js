const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const bearerToken = require( 'express-bearer-token' );

const app = express();

app.use( bearerToken());
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }));
app.get( '/api/', ( req, res ) => {
    res.send({ success: true });
});
app.get( '/api/users/testUserId/', ( req, res ) => {
    if ( req.token === 'testToken' ) {
        res.send({
            _id: 'testUserid',
            username: 'Violet',
            email: 'violet@trialbyfireball.com',
        });
    }
    else {
        res.status( 404 );
        res.send({
            code: 404,
            description: 'Not Found',
            details: {},
            type: 'invalid_request_error',
            error: 'Not Found',
        });
    }
});
app.post( '/api/login/', ( req, res ) => {
    if ( req.body.username === 'Violet' && req.body.password === 'FireballsAreTheWorst' ) {
        res.status( 200 );
        res.send({
            access_token: 'testToken',
            user: 'testUserId',
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
