const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const bearerToken = require( 'express-bearer-token' );

const userRouter = require( './user' );

const app = express();

app.use( bearerToken());
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({ extended: true }));
app.get( '/api/', ( req, res ) => {
    res.send({ success: true });
});
app.use( userRouter );
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
