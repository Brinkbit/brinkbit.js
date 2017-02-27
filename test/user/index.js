const expect = require( 'chai' ).expect;

const Brinkbit = require( '../../src' );

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
        const user = new brinkbit.User({
            _id: 'testUserid',
        });

        before( function() {
            return brinkbit.login({
                username: 'Violet',
                password: 'FireballsAreTheWorst',
            });
        });

        it( 'should update the user\'s data from the server', function() {
            return user.fetch()
            .then(() => {
                expect( user.data ).to.deep.equal({
                    _id: 'testUserid',
                    username: 'Violet',
                    email: 'violet@trialbyfireball.com',
                });
            });
        });
    });
});
