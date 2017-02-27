const pick = require( 'lodash.pick' );

const validate = require( '../validate' );
const ValidationError = require( '../validate/validationError' );
const Plugin = require( '../plugin' );

function initialize( brinkbit ) {
    class User extends Plugin {

        constructor( config ) {
            super( brinkbit, {}, config );
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
                this.set( this.data, pick( config, [ 'username', 'email', 'password' ]));
            }
            this.read = [ '_id', 'dateCreated', 'email', 'username' ];
            this.write = [ 'email', 'password', 'username' ];
        }

        getUrl( method ) {
            switch ( method ) {
                case 'post':
                    return './users/';
                default:
                    return `./users/${this.id}/`;
            }
        }

        validate( method, data ) {
            switch ( method ) {
                case 'get':
                    return typeof this.id === 'string' ?
                        Promise.resolve() :
                        Promise.reject( new ValidationError( 'Cannot fetch user without id' ));
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
                        },
                        email: {
                            dataType: 'string',
                        },
                        password: {
                            dataType: 'string',
                        },
                    });
                default:
                    return Promise.resolve();
            }
        }

    }

    return User;
}

module.exports = {
    name: 'User',
    initialize,
};
