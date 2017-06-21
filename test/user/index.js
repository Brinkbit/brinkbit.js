const expect = require( 'chai' ).expect;
const uuid = require( 'uuid' );

const Brinkbit = require( '../../src' );
const env = require( '../../env' );
const ValidationError = require( '../../src/validate/validationError' );

describe( 'User', function() {
    before( function() {
        this.brinkbit = new Brinkbit( env.client.config );
    });

    it( 'should expose a class', function() {
        expect( this.brinkbit.User ).to.be.a( 'function' );
    });

    it( 'should create a new instance', function() {
        const user = new this.brinkbit.User();
        expect( user ).to.be.an.instanceOf( this.brinkbit.User );
    });

    it( 'should extend instance with config', function() {
        const user = new this.brinkbit.User();
        expect( user ).to.be.an.instanceOf( this.brinkbit.User );
    });

    describe( 'user.fetch', function() {
        before( function() {
            return this.brinkbit.login( env.user )
            .then(( user ) => {
                this.user = user;
            });
        });

        it( 'should update locally with user\'s data from the server', function() {
            const user = new this.brinkbit.User({
                _id: this.user.id,
            });
            return user.fetch()
            .then(() => {
                expect( user.data.username ).to.equal( this.user.data.username );
                expect( user.data.email ).to.equal( this.user.data.email );
            });
        });

        it( 'should reject if id is not a string', function( done ) {
            const user = new this.brinkbit.User();
            user.fetch()
            .catch(( error ) => {
                expect( error ).to.be.an.instanceOf( ValidationError );
                done();
            });
        });
    });

    describe( 'user.save', function() {
        it( 'should create a new user if no id', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const username = `Fireball_${rand}`;
            const email = `fireball${rand}@trialbyfireball.com`;
            this.user = new this.brinkbit.User({
                username,
                email,
                password: 'FireballsAreTheBest',
            });
            return this.user.save()
            .then(( response ) => {
                expect( response.body.username ).to.equal( username );
                expect( response.body.email ).to.equal( email );
            });
        });

        it( 'should update a user if it has an id', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const email = `fireball${rand}@trialbyfireball.com`;
            return this.user.login()
            .then(() => this.user.save({
                body: {
                    email,
                },
            }))
            .then(( response ) => {
                expect( response.body.email ).to.equal( email );
                expect( this.user.data.email ).to.equal( email );
            });
        });
    });

    describe( 'user.create', function() {
        it( 'should create and save a new user', function() {
            const rand = uuid.v4().slice( 0, 5 );
            const username = `Fireball_${rand}`;
            const email = `fireball${rand}@trialbyfireball.com`;
            return this.brinkbit.User.create({
                username,
                email,
                password: 'FireballsAreTheBest',
            })
            .then(( user ) => {
                expect( user ).to.be.an.instanceOf( this.brinkbit.User );
                expect( user.data.username ).to.equal( username );
                expect( user.data.email ).to.equal( email );
            });
        });
    });
});
