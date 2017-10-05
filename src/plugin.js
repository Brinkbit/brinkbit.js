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
            read = [],
            write = [],
            middleware = {},
            player = brinkbit.Player.primary,
            pluginId,
        } = config;
        if ( type === 'player' && !player ) {
            throw new TypeError( 'Player is required for playerdata plugins' );
        }
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
        if ( data._id ) {
            this.id = initialData._id;
        }
    }

    validate() { // eslint-disable-line class-methods-use-this
        return Promise.resolve();
    }

    getUrl( method ) {
        if ( this.type === 'core' ) {
            switch ( method ) {
                case 'post':
                    return `./${this.pluginId}/`;
                default:
                    return `./${this.pluginId}/${this.id}/`;
            }
        }
        if ( this.type === 'player' ) {
            return `./${this.pluginId}/players/${this.player.id}/keys/${this.id}`;
        }
        return `./${this.pluginId}/keys/${this.id}`;
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
                pick(
                    this.type === 'core' ? response.body : response.body.dataValue,
                    this.read
                )
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
        options.token = this.token;
        options.body = pick( this.data, this.write );
        options.method = options.method || ( this.id ? 'put' : 'post' );
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
            if ( this.type !== 'core' ) {
                this.set( response.body.dataValue );
            }
            else {
                this.set( response.body );
            }
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

    get( path ) {
        if ( typeof path !== 'object' && typeof path !== 'string' ) {
            throw new Error( `${typeof path} is not a valid type for path` );
        }
        return typeof attr === 'string' ? get( this.data, path ) : pick( this.data, path );
    }

    set( path, value ) {
        if ( typeof path === 'object' ) {
            merge( this.data, pick( path, this.write ));
        }
        else if ( typeof path === 'string' ) {
            if ( !this.write.includes( path )) {
                throw new Error( `Path ${path} is not writeable!` );
            }
            set( this.data, path, value );
        }
        else {
            throw new Error( `${typeof path} is not a valid type for path` );
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

export default Plugin;
