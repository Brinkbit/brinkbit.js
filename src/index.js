global.Promise = require( 'bluebird' );
const eventEmitter = require( 'event-emitter' );
const request = Promise.promisify( require( 'browser-request' ));
const merge = require( 'lodash.merge' );
const resolveUrl = require( 'resolve-url' );
const store = require( 'store' );

const normalizeArguments = require( './validate/normalizeArguments' );
const validate = require( './validate' );
const BrinkbitEvent = require( './events' );

const User = require( './user' );

class Brinkbit {
    constructor( config ) {
        this.base = typeof config.base !== 'string' ? '/api' : config.base;
        this.appName = config.appName;
        this.use( User );
    }

    resolveUrl( url ) {
        return resolveUrl( this.base, url );
    }

    store( key, value ) {
        store.set( `${this.appName}_${key}`, value );
    }

    retrieve( key ) {
        return store.get( `${this.appName}_${key}` );
    }

    remove( key ) {
        return store.remove( `${this.appName}_${key}` );
    }

    request( ...args ) {
        return validate( normalizeArguments( ...args ), {
            url: {
                presence: true,
                dataType: 'String',
                url: true,
            },
        })
        .then(( opts ) => {
            opts.url = this.resolveUrl( opts.url );
            const token = this.retrieve( 'token' );
            if ( token ) {
                opts.headers = merge( opts.headers, {
                    Authorization: `Bearer ${token}`,
                });
            }
            return request( opts )
            .then(( response ) => {
                if ( response.statusCode >= 400 ) {
                    return Promise.reject( new Error( response.body ));
                }
                this.emit( 'response', new BrinkbitEvent( 'response', response ));
                return response;
            });
        });
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
        });
        return this.request( opts );
    }

    post( ...args ) {
        const options = normalizeArguments( ...args );
        const opts = merge({}, options, {
            method: 'POST',
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
        return validate( options, {
            data: {
                presence: true,
            },
        })
        .then(() => Promise.any([
            validate( options.data, {
                email: {
                    dataType: 'string',
                },
                password: {
                    presence: true,
                },
            }),
            validate( options.data, {
                username: {
                    dataType: 'string',
                },
                password: {
                    presence: true,
                },
            }),
        ]))
        .then(() => this.post( options ))
        .then(( response ) => {
            this.store( 'token', response.body.access_token );
            this.store( 'user', response.body.user );
            const user = new Brinkbit.User( response.body.user );
            this.emit( 'login', new BrinkbitEvent( 'login', user ));
            options.callback( user );
            return user;
        });
    }

    logout( callback ) {
        return this.get( '/logout/' )
        .then(() => {
            this.remove( 'token' );
            this.remove( 'user' );
            this.emit( 'logout', new BrinkbitEvent( 'logout' ));
            if ( typeof callback === 'function' ) {
                callback();
            }
        });
    }

    use( plugin ) {
        if ( Object.prototype.hasOwnProperty.call( Brinkbit, plugin.name )) {
            throw new Error( `Brinkbit plugin namespace conflict: two plugins are named '${plugin.name}'. Please rename one of them.` );
        }
        Brinkbit[plugin.name] = plugin.initialize( this );
    }
}

eventEmitter( Brinkbit.prototype );

module.exports = Brinkbit;
