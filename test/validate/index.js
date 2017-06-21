const expect = require( 'chai' ).expect;

const validate = require( '../../src/validate/index.js' );

describe( 'validate', function() {
    it( 'should expose a function', function() {
        expect( validate ).to.be.a( 'function' );
    });

    it( 'should resolve on valid input', function() {
        return validate({
            password: 'valid',
        }, {
            password: {
                presence: true,
            },
        });
    });

    it( 'should reject on invalid input', function( done ) {
        validate({}, {
            password: {
                presence: true,
            },
        })
        .catch(() => done());
    });

    describe( 'dataType', function() {
        it( 'should reject on invalid dataType', function( done ) {
            validate({
                password: {},
            }, {
                password: {
                    dataType: 'string',
                },
            })
            .catch(() => done());
        });

        it( 'should resolve on valid dataType', function() {
            return validate({
                password: 'valid',
            }, {
                password: {
                    dataType: 'string',
                },
            });
        });

        it( 'should resolve on null and undefined values', function() {
            return validate({}, {
                password: {
                    dataType: 'string',
                },
            });
        });
    });
});

require( './normalizeArguments' );
