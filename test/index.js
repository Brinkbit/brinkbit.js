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

        it( 'should support callback signature', function( done ) {
            brinkbit.request( './', ( error, response ) => {
                expect( error ).to.not.exist;
                expect( response.body ).to.deep.equal({ success: true });
                done();
            });
        });

        it( 'should support object with success callback signature', function( done ) {
            brinkbit.request({
                uri: './',
                success: ( response ) => {
                    expect( response.body ).to.deep.equal({ success: true });
                    done();
                },
            });
        });

        it( 'should emit a "response" event', function( done ) {
            brinkbit.on( 'response', ( event ) => {
                expect( event ).to.be.an.instanceOf( Brinkbit.BrinkbitEvent );
                expect( event ).to.have.property( 'type' ).and.equal( 'response' );
                expect( event.response.body ).to.deep.equal({ success: true });
                done();
            });
            brinkbit.request( './' );
        });
    });

    describe( 'login', function() {
        const brinkbit = new Brinkbit({
            base: 'http://localhost:3010/api/',
            appId: 'test',
        });

        it( 'should login the user and return a new User object', function() {
            return brinkbit.login({
                username: 'Violet',
                password: 'FireballsAreTheWorst',
            })
            .then( function( user ) {
                expect( user ).to.be.an.instanceOf( brinkbit.User );
            });
        });
    });

    require( './user' );
});
