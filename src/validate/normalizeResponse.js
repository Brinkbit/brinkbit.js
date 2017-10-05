function normalizeResponse( promise, options ) {
    return promise.then(( data ) => {
        if ( typeof options.callback === 'function' ) {
            options.callback( null, data );
        }
        if ( typeof options.success === 'function' ) {
            options.success( data );
        }
        return data;
    })
    .catch(( error ) => {
        if ( typeof options.callback === 'function' ) {
            return options.callback( error );
        }
        if ( typeof options.error === 'function' ) {
            return options.error( error );
        }
        return Promise.reject( error );
    });
}

export default normalizeResponse;
