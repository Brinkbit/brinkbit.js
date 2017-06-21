const merge = require( 'lodash.merge' );
const pick = require( 'lodash.pick' );
const eventEmitter = require( 'event-emitter' );

const validate = require( '../validate' );
const normalizeArguments = require( '../validate/normalizeArguments' );
const normalizeResponse = require( '../validate/normalizeResponse' );
const BrinkbitEvent = require( '../events' );

class Plugin {

    constructor( brinkbit, defaults, config ) {
        this.brinkbit = brinkbit;
        this.read = [];
        this.write = [];
        this.data = defaults || {};
        this.middleware = {};
        if ( config ) {
            validate.constructor( config, {
                _id: {
                    dataType: 'string',
                },
            });
            if ( config._id ) {
                this.id = config._id;
            }
        }
    }

    validate() { // eslint-disable-line class-methods-use-this
        return Promise.resolve();
    }

    fetch( ...args ) {
        const options = normalizeArguments( ...args );
        const promise = this.validate( 'get' )
        .then(() => this.brinkbit._get( options.uri || this.getUrl( 'get' )))
        .then(( response ) => {
            merge( this.data, pick( response.body, this.read ));
            this.emit( 'fetch', new BrinkbitEvent( 'fetch', response ));
            return response;
        });
        return normalizeResponse( promise, options );
    }

    save( ...args ) {
        const options = normalizeArguments( ...args );
        if ( options.body ) {
            this.set( options.body );
        }
        options.body = pick( this.data, this.write );
        options.method = options.method || ( this.id ? 'put' : 'post' );
        options.uri = options.uri || this.getUrl( options.method );
        const opts = this.processMiddleware( 'save', options );
        const promise = this.validate( opts.method, opts.body )
        .then(() => this.brinkbit._request( opts ))
        .then(( response ) => {
            this.set( response.body );
            if ( response.body._id ) {
                this.data._id = response.body._id;
                this.id = response.body._id;
            }
            this.emit( 'save', new BrinkbitEvent( 'save', response ));
            return response;
        });
        return normalizeResponse( promise, options );
    }

    destroy() {
        return this.validate( 'delete' )
        .then(() => this.brinkbit._delete( this.getUrl( 'delete' )))
        .then(( response ) => {
            this.id = undefined;
            this.data.id = undefined;
            return response;
        });
    }

    get( attr ) {
        return typeof attr === 'string' ? this.data[attr] : pick( this.data, attr );
    }

    set( attr, value ) {
        if ( typeof attr === 'object' ) {
            merge( this.data, pick( attr, this.write ));
        }
        else if ( this.write.includes( attr )) {
            this.data[attr] = value;
        }
    }

    processMiddleware( method, opts ) {
        return typeof this.middleware === 'object' &&
            typeof this.middleware[method] === 'function' ? this.middleware[method]( opts ) : opts;
    }

    static create( ...args ) {
        const instance = new this( ...args );
        return instance.save()
        .then(() => instance );
    }

}


eventEmitter( Plugin.prototype );

module.exports = Plugin;
