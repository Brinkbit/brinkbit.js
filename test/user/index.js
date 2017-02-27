const expect = require( 'chai' ).expect;

const Brinkbit = require( '../../src' );
const ValidationError = require( '../../src/validate/validationError' );

describe( 'User', function() {
    const brinkbit = new Brinkbit({
        base: 'http://localhost:3010/api/',
        appId: 'test',
    });

    it( 'should expose a class', function() {
        expect( brinkbit.User ).to.be.a.class;
    });

    it( 'should create a new instance', function() {
        const user = new brinkbit.User();
        expect( user ).to.be.an.instanceOf( brinkbit.User );
    });

    it( 'should extend instance with config', function() {
        const user = new brinkbit.User();
        expect( user ).to.be.an.instanceOf( brinkbit.User );
    });

    describe( 'user.fetch', function() {
        before( function() {
            return brinkbit.login({
                username: 'Violet',
                password: 'FireballsAreTheWorst',
            });
        });

        it( 'should update locally with user\'s data from the server', function() {
            const user = new brinkbit.User({
                _id: 'testUserid',
            });
            return user.fetch()
            .then(() => {
                expect( user.data ).to.deep.equal({
                    _id: 'testUserid',
                    username: 'Violet',
                    email: 'violet@trialbyfireball.com',
                });
            });
        });

        it( 'should reject if id is not a string', function( done ) {
            const user = new brinkbit.User();
            user.fetch()
            .catch(( error ) => {
                expect( error ).to.be.an.instanceOf( ValidationError );
                done();
            });
        });
    });

    describe( 'user.save', function() {
        it( 'should create a new user if no id', function() {
            const user = new brinkbit.User({
                username: 'Fireball',
                email: 'fireball@trialbyfireball.com',
                password: 'FireballsAreTheBest',
            });
            return user.save()
            .then(( response ) => {
                expect( response.body ).to.deep.equal({
                    _id: 'newId',
                    username: 'Fireball',
                    email: 'fireball@trialbyfireball.com',
                    password: 'FireballsAreTheBest',
                });
                expect( user ).to.have.property( 'id' ).and.equal( 'newId' );
            });
        });

        it( 'should update a user if it has an id', function() {
            const user = new brinkbit.User({
                _id: 'testUserid',
            });
            return user.save({
                body: {
                    username: 'VioletIsTheBest',
                    email: 'violetIsTheBest@trialbyfireball.com',
                    password: 'FireballsAreStillTheWorst',
                },
            })
            .then(( response ) => {
                expect( response.body ).to.deep.equal({
                    username: 'VioletIsTheBest',
                    email: 'violetIsTheBest@trialbyfireball.com',
                    password: 'FireballsAreStillTheWorst',
                });
                expect( user ).to.have.property( 'id' ).and.equal( 'testUserid' );
            });
        });
    });

    describe( 'user.create', function() {
        it( 'should create and save a new user', function() {
            return brinkbit.User.create({
                username: 'Fireball',
                email: 'fireball@trialbyfireball.com',
                password: 'FireballsAreTheBest',
            })
            .then(( user ) => {
                expect( user ).to.be.an.instanceOf( brinkbit.User );
                expect( user.data ).to.deep.equal({
                    _id: 'newId',
                    username: 'Fireball',
                    email: 'fireball@trialbyfireball.com',
                    password: 'FireballsAreTheBest',
                });
                expect( user ).to.have.property( 'id' ).and.equal( 'newId' );
            });
        });
    });
});
