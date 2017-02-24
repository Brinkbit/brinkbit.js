const expect = require( 'chai' ).expect;

const Brinkbit = require( '../src' );
const ValidationError = require( '../src/validate/validationError' );

describe( 'brinkbit.js', function() {
    require( './validate' );

    it( 'should expose a class', function() {
        expect( Brinkbit ).to.be.a.class;
    });

    it( 'should throw if no config', function() {
        expect( function() {
            new Brinkbit(); // eslint-disable-line no-new
        }).to.throw( TypeError );
    });

    it( 'should throw if invalid config', function() {
        expect( function() {
            new Brinkbit({}); // eslint-disable-line no-new
        }).to.throw( ValidationError );
        expect( function() {
            new Brinkbit({ // eslint-disable-line no-new
                base: {},
                appId: 'valid',
            });
        }).to.throw( ValidationError );
        expect( function() {
            new Brinkbit({ // eslint-disable-line no-new
                base: 'valid',
            });
        }).to.throw( ValidationError );
    });

    it( 'should create a new instance with valid config', function() {
        let brinkbit = new Brinkbit({
            appId: 'valid',
        });
        expect( brinkbit ).to.be.an.instanceOf( Brinkbit );
        expect( brinkbit.User ).to.be.a.class;
        brinkbit = new Brinkbit({
            appId: 'valid',
            base: '/valid',
        });
        expect( brinkbit ).to.be.an.instanceOf( Brinkbit );
    });

    describe( 'brinkbit.request', function() {
        const brinkbit = new Brinkbit({
            base: 'http://localhost:3010/api/',
            appId: 'test',
        });

        it( 'should make a valid XMLHttpRequest to the correct route', function() {
            return brinkbit.request( './' )
            .then( function( response ) {
                expect( response.body ).to.deep.equal({ success: true });
            });
        });
    });
});
