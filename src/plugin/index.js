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
        .then(() => this.brinkbit._get( options.uri || this.getUrl( 'fetch' )))
        .then(( response ) => {
            merge( this.data, pick( response.body, this.read ));
            this.emit( 'save', new BrinkbitEvent( 'save', response ));
            return response;
        });
        return normalizeResponse( promise, options );
    }

    save( ...args ) {
        const options = normalizeArguments( ...args );
        if ( options.body ) {
            this.set( options.body );
        }
        const body = pick( this.data, this.write );
        const method = options.method || ( this.id ? 'put' : 'post' );
        const promise = this.validate( method, body )
        .then(() => this.brinkbit[`_${method}`]( options.uri || this.getUrl( 'fetch' ), { body }))
        .then(( response ) => {
            merge( this.data, pick( response.body, this.read ));
            this.emit( 'save', new BrinkbitEvent( 'save', response ));
            return response;
        });
        return normalizeResponse( promise, options );
    }

    destroy() {
        return this.validate( 'delete' )
        .then(() => this.brinkbit._delete( this.getUrl( 'fetch' )))
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

}

eventEmitter( Plugin.prototype );

module.exports = Plugin;
