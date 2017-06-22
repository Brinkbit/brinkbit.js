const expect = require( 'chai' ).expect;
const merge = require( 'lodash.merge' );

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
        expect( brinkbit.Player ).to.be.a( 'function' );
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

        afterEach( function() {
            return this.brinkbit.logout();
        });

        it( 'should login the player and return a new Player object', function() {
            return this.brinkbit.login( env.player )
            .then(( player ) => {
                expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
                expect( player.data.username ).to.equal( env.player.username );
                expect( this.brinkbit.Player.primary ).to.equal( player );
            });
        });

        it( 'should log additonal players in as secondary players', function() {
            return this.brinkbit.login( env.player )
            .then(() => this.brinkbit.login( env.player2 ))
            .then(( player ) => {
                expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
                expect( player.data.username ).to.equal( env.player2.username );
                expect( this.brinkbit.Player.primary ).to.not.equal( player );
                expect( this.brinkbit.Player.primary.data.username ).to.equal( env.player.username );
            });
        });

        it( 'should store player and token if stayLoggedIn is true', function() {
            return this.brinkbit.login( merge({ stayLoggedIn: true }, env.player ))
            .then(() => {
                expect( this.brinkbit.retrieve( 'token' )).to.be.a( 'string' );
                expect( this.brinkbit.retrieve( 'player' )).to.be.an( 'object' );
            });
        });
    });

    describe( 'logout', function() {
        before( function() {
            this.brinkbit = new Brinkbit( env.client.config );
            return this.brinkbit.login( env.player );
        });

        it( 'should log out the primary player', function() {
            this.brinkbit.logout();
            expect( this.brinkbit.Player.primary ).to.not.exist;
        });
    });

    describe( 'promote', function() {
        before( function() {
            this.brinkbit = new Brinkbit( env.client.config );
            return this.brinkbit.login( env.player )
            .then(() => this.brinkbit.login( env.player2 ))
            .then(( player ) => {
                this.player2 = player;
            });
        });

        it( 'should promote the player to primary', function() {
            this.brinkbit.promote( this.player2 );
            expect( this.brinkbit.Player.primary ).to.equal( this.player2 );
        });
    });

    require( './player' );
});
