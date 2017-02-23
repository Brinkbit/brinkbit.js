const customError = require( 'custom-error-instance' );

module.exports = customError( 'ValidationError', {
    message: 'Validation failed',
    details: [],
});
