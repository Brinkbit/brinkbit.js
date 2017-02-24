const validateJs = require( 'validate.js' );

validateJs.validators.dataType = function validateDataType( value, options ) {
    return validateJs[`is${validateJs.capitalize( options )}`]( value ) ? null : `is not of type ${options}`;
};

const ValidationError = require( './validationError' );

module.exports = function validate( attributes, constraints ) {
    const invalid = validateJs( attributes, constraints );
    if ( invalid ) {
        return Promise.reject( new ValidationError({
            message: invalid.error,
            details: invalid,
        }));
    }
    return Promise.resolve();
};
