module.exports = function normalizeArguments( ...args ) {
    let options = {};
    if ( typeof args[0] === 'object' ) {
        options = args[0];
    }
    else if ( typeof args[1] === 'object' ) {
        options = args[1];
    }
    else if ( typeof args[1] === 'string' ) {
        options.token = args[1];
    }
    if ( typeof args[0] === 'string' ) {
        options.uri = args[0];
    }
    if ( args.length > 0 && typeof args[args.length - 1] === 'function' ) {
        options.callback = args[args.length - 1];
    }
    return options;
};
