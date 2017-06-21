global.Promise = require( 'bluebird' );
const eventEmitter = require( 'event-emitter' );
const request = Promise.promisify( require( 'browser-request' ));
const merge = require( 'lodash.merge' );
const resolveUrl = require( 'resolve-url' );
const store = require( 'store' );

const normalizeArguments = require( './validate/normalizeArguments' );
const normalizeResponse = require( './validate/normalizeResponse' );
const validate = require( './validate' );
const BrinkbitEvent = require( './events' );

const User = require( './user' );

class Brinkbit {
    constructor( config ) {
        validate.constructor( config, {
            base: {
                dataType: 'string',
            },
            gameId: {
                dataType: 'string',
                presence: true,
            },
            parse: {
                dataType: 'function',
            },
        });
        this.base = typeof config.base !== 'string' ? '/api' : config.base;
        this.parse = config.parse ? config.parse : JSON.parse;
        this.use( User );
    }

    resolveUrl( uri ) {
        return resolveUrl( this.base, uri );
    }

    store( key, value ) {
        store.set( `${this.gameId}_${key}`, value );
    }

    retrieve( key ) {
        return store.get( `${this.gameId}_${key}` );
    }

    remove( key ) {
        return store.remove( `${this.gameId}_${key}` );
    }

    request( ...args ) {
        const options = normalizeArguments( ...args );
        return normalizeResponse( this._request( options ), options );
    }

    get( ...args ) {
        const options = normalizeArguments( ...args );
        return normalizeResponse( this._get( options ), options );
    }

    put( ...args ) {
        const options = normalizeArguments( ...args );
        return normalizeResponse( this._put( options ), options );
    }

    post( ...args ) {
        const options = normalizeArguments( ...args );
        return normalizeResponse( this._post( options ), options );
    }

    delete( ...args ) {
        const options = normalizeArguments( ...args );
        return normalizeResponse( this._delete( options ), options );
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
            const body = {
                grant_type: 'password',
                username: options.username || options.email,
                password: options.password,
                scope: 'player.basic_info:read player.basic_info:write data:read:write',
            };
            return this._post({
                uri: './token/',
                body,
            });
        })
        .then(( response ) => {
            this.store( 'token', response.body.access_token );
            this.store( 'user', response.body.user );
            return this._get( './playerinfo/' );
        })
        .then(( response ) => {
            const user = new this.User( response.body );
            this.emit( 'login', new BrinkbitEvent( 'login', user ));
            return user;
        });
        return normalizeResponse( promise, options );
    }

    logout( ...args ) {
        const options = normalizeArguments( ...args );
        const promise = this._get( './logout/' )
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

    // private promise-driven api

    _request( options ) {
        return validate( options, {
            uri: {
                presence: true,
                dataType: 'string',
            },
        })
        .then(() => {
            options.uri = this.resolveUrl( options.uri );
            if ( typeof options.body === 'object' ) {
                options.body = JSON.stringify( options.body );
                options.json = true;
            }
            const token = this.retrieve( 'token' );
            if ( token && options.passToken !== false ) {
                options.headers = merge( options.headers, {
                    Authorization: `Bearer ${token}`,
                });
            }
            return request( options )
            .then(( response ) => {
                if ( typeof response.body === 'string' ) {
                    response.body = this.parse( response.body );
                }
                if ( response.statusCode >= 400 ) {
                    return Promise.reject( new Error( response.body ));
                }
                this.emit( 'response', new BrinkbitEvent( 'response', response ));
                return response;
            });
        });
    }

    _get( ...args ) {
        const opts = merge({}, normalizeArguments( ...args ), {
            method: 'GET',
        });
        return this._request( opts );
    }

    _put( ...args ) {
        const opts = merge({}, normalizeArguments( ...args ), {
            method: 'PUT',
            json: true,
        });
        return this._request( opts );
    }

    _post( ...args ) {
        const opts = merge({}, normalizeArguments( ...args ), {
            method: 'POST',
            json: true,
        });
        return this._request( opts );
    }

    _delete( ...args ) {
        const opts = merge({}, normalizeArguments( ...args ), {
            method: 'DELETE',
        });
        return this._request( opts );
    }
}

Brinkbit.BrinkbitEvent = BrinkbitEvent;

eventEmitter( Brinkbit.prototype );

module.exports = Brinkbit;
