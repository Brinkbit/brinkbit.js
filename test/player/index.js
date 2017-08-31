const expect = require( 'chai' ).expect;
const uuid = require( 'uuid' );

const Brinkbit = require( '../../src' );
const env = require( '../../env' );
const ValidationError = require( '../../src/validate/validationError' );

describe( 'Player', function() {
    before( function() {
        this.brinkbit = new Brinkbit( env.client.config );
    });

    it( 'should expose a class', function() {
        expect( this.brinkbit.Player ).to.be.a( 'function' );
    });

    it( 'should create a new instance', function() {
        const player = new this.brinkbit.Player();
        expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
    });

    it( 'should extend instance with config', function() {
        const player = new this.brinkbit.Player();
        expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
    });

    describe( 'player.fetch', function() {
        before( function() {
            return this.brinkbit.login( env.player )
            .then(( player ) => {
                this.player = player;
            });
        });

        it( 'should update locally with user\'s data from the server', function() {
            const player = new this.brinkbit.Player({
                _id: this.player.id,
            });
            player.token = this.player.token;
            return player.fetch()
            .then(() => {
                expect( player.data.username ).to.equal( this.player.data.username );
                expect( player.data.email ).to.equal( this.player.data.email );
            });
        });

        it( 'should reject if id is not a string', function( done ) {
            const player = new this.brinkbit.Player();
            player.fetch()
            .catch(( error ) => {
                expect( error ).to.be.an.instanceOf( ValidationError );
                done();
            });
        });
    });

    describe( 'player.save', function() {
        it( 'should create a new player if no id', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const username = `fireball_${rand}`;
            const email = `fireball${rand}@trialbyfireball.com`;
            this.player = new this.brinkbit.Player({
                username,
                email,
                password: 'FireballsAreTheBest',
            });
            return this.player.save()
            .then(( response ) => {
                expect( response.body.username ).to.equal( username );
                expect( response.body.email ).to.equal( email );
            });
        });

        it( 'should update a player if it has an id', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const email = `fireball${rand}@trialbyfireball.com`;
            return this.player.login()
            .then(() => this.player.save({
                body: {
                    email,
                },
            }))
            .then(( response ) => {
                expect( response.body.email ).to.equal( email );
                expect( this.player.data.email ).to.equal( email );
            });
        });
    });

    describe( 'player.create', function() {
        it( 'should create and save a new user', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const username = `fireball_${rand}`;
            const email = `fireball${rand}@trialbyfireball.com`;
            return this.brinkbit.Player.create({
                username,
                email,
                password: 'FireballsAreTheBest',
            })
            .then(( player ) => {
                expect( player ).to.be.an.instanceOf( this.brinkbit.Player );
                expect( player.data.username ).to.equal( username );
                expect( player.data.email ).to.equal( email );
            });
        });
    });
});
