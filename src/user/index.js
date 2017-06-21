const validate = require( '../validate' );
const ValidationError = require( '../validate/validationError' );
const Plugin = require( '../plugin' );

function initialize( brinkbit ) {
    class User extends Plugin {

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
                this.set( config );
            }
            this.middleware.save = this.saveMiddleware.bind( this );
        }

        login( password ) {
            return this.brinkbit.login({
                username: this.data.username,
                email: this.data.email,
                password: password || this.data.password,
            });
        }

        saveMiddleware( options ) {
            if ( !this.id ) options.passToken = false;
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

    return User;
}

module.exports = {
    name: 'User',
    initialize,
};
