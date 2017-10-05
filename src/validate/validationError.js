import customError from 'custom-error-instance';

const ValidationError = customError( 'ValidationError', {
    message: 'Validation failed',
    details: [],
});

export default ValidationError;
