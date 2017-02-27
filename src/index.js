global.Promise = require( 'bluebird' );
const eventEmitter = require( 'event-emitter' );
const request = Promise.promisify( require( 'browser-request' ));
const merge = require( 'lodash.merge' );
const pick = require( 'lodash.pick' );
const resolveUrl = require( 'resolve-url' );
const store = require( 'store' );
const validateJs = require( 'validate.js' );

const normalizeArguments = require( './validate/normalizeArguments' );
const normalizeResponse = require( './validate/normalizeResponse' );
const validate = require( './validate' );
const ValidationError = require( './validate/validationError' );
const BrinkbitEvent = require( './events' );

const User = require( './user' );

class Brinkbit {
    constructor( config ) {
        if ( typeof config !== 'object' ) {
            throw new TypeError( 'brinkbit.js config must be an object' );
        }
        const invalid = validateJs( config, {
            base: {
                dataType: 'string',
            },
            appId: {
                dataType: 'string',
                presence: true,
            },
        });
        if ( invalid ) {
            throw new ValidationError({
                message: invalid.error,
                details: invalid,
            });
        }
        this.base = typeof config.base !== 'string' ? '/api' : config.base;
        this.use( User );
    }

    resolveUrl( uri ) {
        return resolveUrl( this.base, uri );
    }

    store( key, value ) {
        store.set( `${this.appId}_${key}`, value );
    }

    retrieve( key ) {
        return store.get( `${this.appId}_${key}` );
    }

    remove( key ) {
        return store.remove( `${this.appId}_${key}` );
    }

    request( ...args ) {
        const options = normalizeArguments( ...args );
        const promise = validate( options, {
            uri: {
                presence: true,
                dataType: 'string',
            },
        })
        .then(() => {
            options.uri = this.resolveUrl( options.uri );
            if ( typeof options.body === 'object' ) {
                options.body = JSON.stringify( options.body );
            }
            const token = this.retrieve( 'token' );
            if ( token ) {
                options.headers = merge( options.headers, {
                    Authorization: `Bearer ${token}`,
                });
            }
            return request( options )
            .then(( response ) => {
                if ( typeof response.body === 'string' ) {
                    response.body = JSON.parse( response.body );
                }
                if ( response.statusCode >= 400 ) {
                    return Promise.reject( new Error( response.body ));
                }
                this.emit( 'response', new BrinkbitEvent( 'response', response ));
                return response;
            });
        });
        return normalizeResponse( promise, options );
    }

    get( ...args ) {
        const options = normalizeArguments( ...args );
        const opts = merge({}, options, {
            method: 'GET',
        });
        return this.request( opts );
    }

    put( ...args ) {
        const options = normalizeArguments( ...args );
        const opts = merge({}, options, {
            method: 'PUT',
            json: true,
        });
        return this.request( opts );
    }

    post( ...args ) {
        const options = normalizeArguments( ...args );
        const opts = merge({}, options, {
            method: 'POST',
            json: true,
        });
        return this.request( opts );
    }

    delete( ...args ) {
        const options = normalizeArguments( ...args );
        const opts = merge({}, options, {
            method: 'DELETE',
        });
        return this.request( opts );
    }

    login( ...args ) {
        const options = normalizeArguments( ...args );
        const promise = Promise.any([
            validate( options, {
                email: {
                    dataType: 'string',
                },
                password: {
                    presence: true,
                },
            }),
            validate( options, {
                username: {
                    dataType: 'string',
                },
                password: {
                    presence: true,
                },
            }),
        ])
        .then(() => {
            const body = pick( options, [ 'email', 'username', 'password' ]);
            return this.post({
                uri: './login/',
                body,
            });
        })
        .then(( response ) => {
            this.store( 'token', response.body.access_token );
            this.store( 'user', response.body.user );
            const user = new this.User({ id: response.body.user });
            this.emit( 'login', new BrinkbitEvent( 'login', user ));
            return user;
        });
        return normalizeResponse( promise, options );
    }

    logout( ...args ) {
        const options = normalizeArguments( ...args );
        const promise = this.get( './logout/' )
        .then(() => {
            this.remove( 'token' );
            this.remove( 'user' );
            this.emit( 'logout', new BrinkbitEvent( 'logout' ));
        });
        return normalizeResponse( promise, options );
    }

    use( plugin ) {
        if ( Object.prototype.hasOwnProperty.call( this, plugin.name )) {
            throw new Error( `Brinkbit plugin namespace conflict: two plugins are named '${plugin.name}'. Please rename one of them.` );
        }
        this[plugin.name] = plugin.initialize( this );
    }
}

Brinkbit.BrinkbitEvent = BrinkbitEvent;

eventEmitter( Brinkbit.prototype );

module.exports = Brinkbit;
