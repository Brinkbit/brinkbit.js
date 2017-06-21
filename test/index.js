const expect = require( 'chai' ).expect;

const Brinkbit = require( '../src' );
const ValidationError = require( '../src/validate/validationError' );
const env = require( '../env' );

describe( 'brinkbit.js', function() {
    require( './validate' );

    it( 'should expose a class', function() {
        expect( Brinkbit ).to.be.a( 'function' );
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
                gameId: 'valid',
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
            gameId: 'valid',
        });
        expect( brinkbit ).to.be.an.instanceOf( Brinkbit );
        expect( brinkbit.User ).to.be.a( 'function' );
        brinkbit = new Brinkbit({
            gameId: 'valid',
            base: '/valid',
        });
        expect( brinkbit ).to.be.an.instanceOf( Brinkbit );
    });

    describe( 'brinkbit.request', function() {
        before( function() {
            this.brinkbit = new Brinkbit( env.client.config );
        });

        it( 'should make a valid XMLHttpRequest to the correct route', function() {
            return this.brinkbit.request( './' )
            .then( function( response ) {
                expect( response.body ).to.deep.equal({ success: true });
            });
        });

        it( 'should support callback signature', function( done ) {
            this.brinkbit.request( './', ( error, response ) => {
                expect( error ).to.not.exist;
                expect( response.body ).to.deep.equal({ success: true });
                done();
            });
        });

        it( 'should support object with success callback signature', function( done ) {
            this.brinkbit.request({
                uri: './',
                success: ( response ) => {
                    expect( response.body ).to.deep.equal({ success: true });
                    done();
                },
            });
        });

        it( 'should emit a "response" event', function( done ) {
            this.brinkbit.on( 'response', ( event ) => {
                expect( event ).to.be.an.instanceOf( Brinkbit.BrinkbitEvent );
                expect( event ).to.have.property( 'type' ).and.equal( 'response' );
                expect( event.response.body ).to.deep.equal({ success: true });
                done();
            });
            this.brinkbit.request( './' );
        });
    });

    describe( 'login', function() {
        before( function() {
            this.brinkbit = new Brinkbit( env.client.config );
        });

        it( 'should login the user and return a new User object', function() {
            return this.brinkbit.login( env.user )
            .then(( user ) => {
                expect( user ).to.be.an.instanceOf( this.brinkbit.User );
            });
        });
    });

    require( './user' );
});
