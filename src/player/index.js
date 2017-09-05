/* eslint-disable no-param-reassign */

const merge = require( 'lodash.merge' );

const validate = require( '../validate' );
const ValidationError = require( '../validate/validationError' );
const normalizeArguments = require( '../validate/normalizeArguments' );
const Plugin = require( '../plugin' );

function initialize( brinkbit ) {
    class Player extends Plugin {

        constructor( config ) {
            super( brinkbit, {}, config );
            this.read = [ '_id', 'dateCreated', 'email', 'username' ];
            this.write = [ 'email', 'password', 'username' ];
            if ( config ) {
                validate.constructor( config, {
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
                this.data = config;
            }
            this.middleware.save = this.saveMiddleware.bind( this );
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

        getUrl( method ) {
            switch ( method ) {
                case 'post':
                    return './players/';
                default:
                    return `./players/${this.id}/`;
            }
        }

        validate( method, data ) {
            switch ( method ) {
                case 'delete':
                    return typeof this.id === 'string' ?
                        Promise.resolve() :
                        Promise.reject( new ValidationError( 'Cannot delete user without id' ));
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

    return Player;
}

module.exports = {
    name: 'Player',
    initialize,
};
