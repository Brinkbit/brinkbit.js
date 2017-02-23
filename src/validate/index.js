const validateJs = require( 'validate.js' );
const findKey = require( 'lodash.findkey' );
const pick = require( 'lodash.pick' );

validateJs.validators.dataType = function validateDataType( value, options ) {
    return validateJs[`is${validateJs.cpaitalize( options )}`]( value ) ? null : `is not of type ${options}`;
};

validateJs.validators.or = function or( value, options, key, attributes ) {
    if ( value ) return null;
    if ( validateJs.isArray( options )) {
        return findKey( pick( attributes, options ), val => !!val ) ? null : ` or ${options.join( ' or ' )} must be non-empty`;
    }
    return attributes[key] ? null : ` or ${key} must be non-empty`;
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
