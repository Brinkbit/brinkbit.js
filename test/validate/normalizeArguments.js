import chai from 'chai';

import normalizeArguments from '../../src/validate/normalizeArguments';

const { expect } = chai;


describe( 'normalizeArguments', function() {
    it( 'should expose a function', function() {
        expect( normalizeArguments ).to.be.a( 'function' );
    });

    it( 'should pass through an object', function() {
        const testObj = { uri: 'test' };
        const normalized = normalizeArguments( testObj );
        expect( normalized ).to.equal( testObj );
    });

    it( 'should add a callback to the object', function() {
        const testObj = { uri: 'test' };
        const callback = function callback() {};
        const normalized = normalizeArguments( testObj, callback );
        expect( normalized ).have.property( 'callback' ).and.equal( callback );
    });

    it( 'should use a string as a uri', function() {
        const uri = 'testUrl';
        const normalized = normalizeArguments( uri );
        expect( normalized ).have.property( 'uri' ).and.equal( uri );
    });

    it( 'should combine uri, options, and callback', function() {
        const testObj = {};
        const callback = function callback() {};
        const uri = 'testUrl';
        const normalized = normalizeArguments( uri, testObj, callback );
        expect( normalized ).to.equal( testObj );
        expect( normalized ).have.property( 'uri' ).and.equal( uri );
        expect( normalized ).have.property( 'callback' ).and.equal( callback );
    });
});
