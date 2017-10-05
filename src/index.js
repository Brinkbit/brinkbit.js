/* eslint-disable no-param-reassign */

import Bluebird from 'bluebird';
import eventEmitter from 'event-emitter';
import request from 'browser-request';
import merge from 'lodash.merge';
import resolveUrl from 'resolve-url';
import store from 'store';

import normalizeArguments from './validate/normalizeArguments';
import normalizeResponse from './validate/normalizeResponse';
import validate from './validate';
import ValidationError from './validate/validationError';
import BrinkbitEvent from './events';
import Plugin from './plugin';
import Player from './plugins/player';

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
        this.gameId = config.gameId;
        const domain = typeof config.base !== 'string' ? 'https://brinkbit.com/api/0.1/' : config.base;
        this.base = `${domain}${domain.slice( -1 ) !== '/' ? '/' : ''}${this.gameId}/`;
        this.parse = config.parse ? config.parse : JSON.parse;
        this.scope = config.scope || [
            'player.basic_info:read',
            'player.basic_info:write',
            'data:read:write',
        ];
        this.use( Player );
        const storedToken = this.retrieve( 'token' );
        if ( storedToken ) {
            this.Player.primary = new this.Player({ _id: this.retrieve( 'playerId' ) });
            this.Player.primary.token = storedToken;
        }
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
        let token;
        const promise = Bluebird.any([
            validate( options, {
                email: {
                    dataType: 'string',
                },
                password: {
                    presence: true,
                },
                stayLoggedIn: {
                    dataType: 'boolean',
                },
            }),
            validate( options, {
                username: {
                    dataType: 'string',
                },
                password: {
                    presence: true,
                },
                stayLoggedIn: {
                    dataType: 'boolean',
                },
            }),
        ])
        .then(() => {
            const body = {
                grant_type: 'password',
                client_id: this.gameId,
                username: options.username || options.email,
                password: options.password,
                scope: this.scope.join( ' ' ),
            };
            return this._post({
                uri: './token/',
                body,
            });
        })
        .then(( response ) => {
            token = response.body.access_token;
            if ( options.stayLoggedIn ) {
                this.store( 'token', token );
            }
            return this._get( './playerinfo/', token );
        })
        .then(( response ) => {
            const player = new this.Player( response.body );
            player.stayLoggedIn = options.stayLoggedIn;
            player.token = token;
            if ( !this.Player.primary ) {
                this.Player.primary = player;
                if ( options.stayLoggedIn ) {
                    this.store( 'playerId', player.id );
                }
            }
            this.emit( 'login', new BrinkbitEvent( 'login', player ));
            return player;
        });
        return normalizeResponse( promise, options );
    }

    isLoggedIn() {
        return !!this.Player.primary;
    }

    logout() {
        this.Player.primary = undefined;
        this.remove( 'token' );
        this.remove( 'playerId' );
    }

    forgot( data ) {
        if ( typeof data === 'string' ) {
            data = { emailOrUsername: data };
        }
        data.gameId = data.gameId || this.gameId;
        return Bluebird.any([
            validate( data, {
                gameId: {
                    dataType: 'string',
                    presence: true,
                },
                username: {
                    dataType: 'string',
                    presence: true,
                },
            }),
            validate( data, {
                gameId: {
                    dataType: 'string',
                    presence: true,
                },
                email: {
                    dataType: 'string',
                    presence: true,
                },
            }),
            validate( data, {
                gameId: {
                    dataType: 'string',
                    presence: true,
                },
                emailOrUsername: {
                    dataType: 'string',
                    presence: true,
                },
            }),
        ])
        .then(() => this.post({
            uri: './forgot/',
            body: data,
        }));
    }

    validateResetToken( data ) {
        if ( typeof data === 'string' ) {
            data = { token: data };
        }
        return validate( data, {
            token: {
                dataType: 'string',
                presence: true,
            },
        })
        .then(() => this.get({
            uri: `./reset/?token=${data.token}`,
        }));
    }

    promote( player ) {
        this.Player.primary = player;
        if ( player.stayLoggedIn ) {
            this.store( 'token', player.token );
            this.store( 'playerId', player.id );
        }
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
            options.json = true;
            if ( typeof options.body === 'object' ) {
                options.body = JSON.stringify( options.body );
            }
            const token = options.token || this.retrieve( 'token' );
            if ( token && options.passToken !== false ) {
                options.headers = merge( options.headers, {
                    Authorization: `Bearer ${token}`,
                });
            }
            return new Bluebird(( resolve, reject ) => {
                request( options, ( err, xhr, body ) => {
                    if (( err && !( err instanceof SyntaxError )) || xhr.statusCode >= 400 ) {
                        this.emit( 'error', xhr );
                        const error = new Error( 'HTTP error' );
                        error.xhr = xhr;
                        error.body = body;
                        return reject( error );
                    }
                    xhr.body = body;
                    this.emit( 'response', new BrinkbitEvent( 'response', xhr ));
                    return resolve( xhr );
                });
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
Brinkbit.validate = validate;
Brinkbit.ValidationError = ValidationError;
Brinkbit.Plugin = Plugin;

export {
    BrinkbitEvent,
    validate,
    ValidationError,
    Plugin,
};

eventEmitter( Brinkbit.prototype );

export default Brinkbit;
