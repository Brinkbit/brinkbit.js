module.exports = {
    name: 'User',
    initialize: function initialize( brinkbit ) {
        class User {
            constructor( config ) {
                this.id = config.id;
            }
            get() {
                return brinkbit.get( `/users/${this.id}/` );
            }
        }

        User.create = function create( options ) {
            return brinkbit.post( '/users/' );
        };

        return User;
    },
};
