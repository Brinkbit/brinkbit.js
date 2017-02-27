const express = require( 'express' );

const router = express.Router();

router.post( '/api/users/', ( req, res ) => {
    req.body._id = 'newId';
    res.send( req.body );
});
router.get( '/api/users/testUserId/', ( req, res ) => {
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
router.put( '/api/users/testUserId/', ( req, res ) => {
    if ( req.token === 'testToken' ) {
        res.send( req.body );
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
module.exports = router;
