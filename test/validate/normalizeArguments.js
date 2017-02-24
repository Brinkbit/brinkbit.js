const expect = require( 'chai' ).expect;

const normalizeArguments = require( '../../src/validate/normalizeArguments.js' );

describe( 'normalizeArguments', function() {
    it( 'should expose a function', function() {
        expect( normalizeArguments ).to.be.a.function;
    });

    it( 'should pass through an object', function() {
        const testObj = { url: 'test' };
        const normalized = normalizeArguments( testObj );
        expect( normalized ).to.equal( testObj );
        expect( normalized ).have.property( 'callback' ).and.be.a.function;
        expect( normalized.callback()).to.not.exist;
    });

    it( 'should add a callback to the object', function() {
        const testObj = { url: 'test' };
        const callback = function callback() {};
        const normalized = normalizeArguments( testObj, callback );
        expect( normalized ).have.property( 'callback' ).and.equal( callback );
    });

    it( 'should use a string as a url', function() {
        const url = 'testUrl';
        const normalized = normalizeArguments( url );
        expect( normalized ).have.property( 'url' ).and.equal( url );
    });

    it( 'should combine url, options, and callback', function() {
        const testObj = {};
        const callback = function callback() {};
        const url = 'testUrl';
        const normalized = normalizeArguments( url, testObj, callback );
        expect( normalized ).to.equal( testObj );
        expect( normalized ).have.property( 'url' ).and.equal( url );
        expect( normalized ).have.property( 'callback' ).and.equal( callback );
    });
});
