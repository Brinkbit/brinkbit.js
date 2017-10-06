/* eslint-disable no-param-reassign */

import merge from 'lodash.merge';
import pick from 'lodash.pick';
import get from 'lodash.get';
import set from 'lodash.set';
import eventEmitter from 'event-emitter';

import Brinkbit from './';
import validate from './validate';
import ValidationError from './validate/validationError';
import normalizeArguments from './validate/normalizeArguments';
import normalizeResponse from './validate/normalizeResponse';
import BrinkbitEvent from './events';

class Plugin {

    constructor( brinkbit, config ) {
        validate.constructor( config, {
            type: {
                dataType: 'string',
                presence: true,
                inclusion: [
                    'player',
                    'game',
                    'core',
                ],
            },
            player: {
                instanceOf: Brinkbit.Player,
            },
            initialData: {
                dataType: 'object',
            },
            defaults: {
                dataType: 'object',
            },
            read: {
                dataType: 'array',
            },
            write: {
                dataType: 'array',
            },
            middleware: {
                dataType: 'object',
            },
            pluginId: {
                presence: true,
                dataType: 'string',
            },
        });
        const {
            initialData = {},
            defaults = {},
            type,
            read,
            write,
            middleware = {},
            player = brinkbit.Player.primary,
            pluginId,
        } = config;
        this.pluginId = pluginId;
        this.player = player;
        this.brinkbit = brinkbit;
        this.read = read;
        this.write = write;
        this.type = type;
        this.middleware = middleware;
        const data = merge({}, defaults, initialData );
        validate.constructor( data, {
            _id: {
                dataType: 'string',
            },
        });
        this.data = data;
        if ( type === 'core' && data._id ) {
            this.id = initialData._id;
        }
    }

    getPlayer() {
        if ( !this.player && !this.brinkbit.Player.primary ) {
            throw new Error( 'No player logged in' );
        }
        const player = this.player || this.brinkbit.Player.primary;
        if ( !player.token || !player.id ) {
            throw new Error( 'No player logged in' );
        }
        return player;
    }

    validate() { // eslint-disable-line class-methods-use-this
        return Promise.resolve();
    }

    getUrl( method ) {
        const key = this.id || this.data._id;
        if ( this.type === 'core' ) {
            switch ( method ) {
                case 'post':
                    return `./${this.pluginId}/`;
                default:
                    return `./${this.pluginId}/${key}/`;
            }
        }
        if ( this.type === 'player' ) {
            return `./data/${this.pluginId}/players/${this.getPlayer().id}/keys/${key}`;
        }
        return `./data/${this.pluginId}/keys/${key}`;
    }

    fetch( ...args ) {
        const options = normalizeArguments( ...args );
        options.token = this.token;
        options.uri = options.uri || this.getUrl( 'get' );
        const promise = this.validate( 'get', options )
        .then(() => this.brinkbit._get( options ))
        .then(( response ) => {
            merge(
                this.data,
                this.readable( this.type === 'core' ? response.body : response.body.dataValue )
            );
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
        options.token = this.token || this.getPlayer().token;
        options.method = options.method || ( this.id ? 'put' : 'post' );
        options.body = options.method === 'put' || options.method === 'post' ? this.writeable( this.data ) : undefined;
        options.uri = options.uri || this.getUrl( options.method );
        const opts = this.processMiddleware( 'save', options );
        const validationResponse = this.validate( opts.method, opts.body );
        const promise = (() => {
            if ( typeof validationResponse === 'object' ) {
                if ( typeof validationResponse.then === 'function' ) {
                    return validationResponse;
                }
                else if (
                    validationResponse instanceof ValidationError ||
                    validationResponse instanceof Error ||
                    validationResponse instanceof TypeError
                ) {
                    return Promise.reject( validationResponse );
                }
                const error = new ValidationError();
                error.details = validationResponse;
                return Promise.reject( error );
            }
            else if ( typeof validationResponse === 'string' ) {
                return Promise.reject( validationResponse );
            }
            return Promise.resolve();
        })()
        .then(() => this.brinkbit._request( opts ))
        .then(( response ) => {
            merge(
                this.data,
                this.readable( this.type === 'core' ? response.body : response.body.dataValue )
            );
            if ( this.data._id ) {
                this.id = this.data._id;
            }
            this.emit( 'save', new BrinkbitEvent( 'save', response ));
            return response;
        });
        return normalizeResponse( promise, options );
    }

    destroy( options = {}) {
        options.uri = this.getUrl( 'delete' );
        options.token = this.token || this.getPlayer().token;
        return this.validate( 'delete' )
        .then(() => this.brinkbit._delete( options ))
        .then(( response ) => {
            this.id = undefined;
            this.data.id = undefined;
            return response;
        });
    }

    get( path ) {
        if ( typeof path !== 'object' && typeof path !== 'string' ) {
            throw new Error( `${typeof path} is not a valid type for path` );
        }
        return typeof attr === 'string' ? get( this.data, path ) : pick( this.data, path );
    }

    set( path, value ) {
        if ( typeof path === 'object' ) {
            merge( this.data, this.writeable( path ));
        }
        else if ( typeof path === 'string' ) {
            if ( this.write && !this.write.includes( path )) {
                throw new Error( `Path ${path} is not writeable!` );
            }
            set( this.data, path, value );
        }
        else {
            throw new Error( `${typeof path} is not a valid type for path` );
        }
    }

    writeable( data ) {
        return this.write ? pick( data, this.write ) : data;
    }

    readable( data ) {
        return this.read ? pick( data, this.read ) : data;
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

export default Plugin;
