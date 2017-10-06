/* eslint-disable no-param-reassign */

import merge from 'lodash.merge';

import validate from '../validate';
import ValidationError from '../validate/validationError';
import normalizeArguments from '../validate/normalizeArguments';
import Plugin from '../plugin';

function initialize( brinkbit ) {
    class Player extends Plugin {

        constructor( initialData ) {
            super( brinkbit, {
                initialData,
                read: [ '_id', 'dateCreated', 'email', 'username' ],
                write: [ 'email', 'password', 'username' ],
                pluginId: 'players',
                type: 'core',
            });
            if ( initialData ) {
                validate.constructor( initialData, {
                    username: {
                        dataType: 'string',
                    },
                    email: {
                        dataType: 'string',
                    },
                    password: {
                        dataType: 'string',
                    },
                });
            }
            this.middleware.save = this.saveMiddleware.bind( this );
            Player.plugins.forEach(( plugin ) => {
                this[plugin.name] = plugin.initialize( brinkbit, this );
            });
        }

        login( ...args ) {
            const options = normalizeArguments( ...args );
            options.password = options.uri;
            options.uri = undefined;
            return this.brinkbit.login( merge({}, this.data, options ))
            .then(( user ) => {
                this.token = user.token;
                return this;
            });
        }

        logout() {
            this.token = undefined;
            if ( this.isPrimary ) {
                this.brinkbit.logout();
            }
        }

        promote() {
            this.brinkbit.promotePlayer( this );
        }

        forgot( options ) {
            return this.brinkbit.forgot( options || this.data );
        }

        saveMiddleware( options ) {
            if ( !this.id ) {
                options.passToken = false;
                options.body.gameId = options.body.gameId || this.brinkbit.gameId;
            }
            else {
                options.body.username = undefined;
                options.body.password = undefined;
            }
            return options;
        }

        validate( method, data ) {
            switch ( method ) {
                case 'delete':
                    return Promise.reject( new Error( 'Cannot delete user' ));
                case 'post':
                    return validate( data, {
                        username: {
                            dataType: 'string',
                            presence: true,
                        },
                        email: {
                            dataType: 'string',
                            presence: true,
                        },
                        password: {
                            dataType: 'string',
                            presence: true,
                        },
                    });
                case 'put':
                    return validate( data, {
                        username: {
                            dataType: 'string',
                            presence: false,
                        },
                        email: {
                            dataType: 'string',
                        },
                        password: {
                            dataType: 'string',
                            presence: false,
                        },
                    });
                default:
                    return typeof this.id === 'string' ?
                        Promise.resolve() :
                        Promise.reject( new ValidationError( 'Cannot fetch user without id' ));
            }
        }

    }

    Player.plugins = [];

    return Player;
}

const config = {
    name: 'Player',
    type: 'core',
    initialize,
};

export default config;
