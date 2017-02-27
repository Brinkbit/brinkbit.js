const validateJs = require( 'validate.js' );

validateJs.validators.dataType = function validateDataType( value, options ) {
    return ( value === null || value === undefined || validateJs[`is${validateJs.capitalize( options )}`]( value )) ? null : `is not of type ${options}`;
};

const ValidationError = require( './validationError' );

const validate = function validate( attributes, constraints ) {
    const invalid = validateJs( attributes, constraints );
    if ( invalid ) {
        return Promise.reject( new ValidationError({
            message: invalid.error,
            details: invalid,
        }));
    }
    return Promise.resolve();
};

validate.constructor = function validateConstructor( config, constraints ) {
    if ( typeof config !== 'object' ) {
        throw new TypeError( 'config must be an object' );
    }
    const invalid = validateJs( config, constraints );
    if ( invalid ) {
        throw new ValidationError({
            message: invalid.error,
            details: invalid,
        });
    }
};

module.exports = validate;
