module.exports = function normalizeArguments( ...args ) {
    let options = {};
    if ( typeof args[0] === 'object' ) {
        options = args[0];
    }
    else if ( typeof args[1] === 'object' ) {
        options = args[1];
    }
    if ( typeof args[0] === 'string' ) {
        options.url = args[0];
    }
    if ( args.length > 0 && typeof args[args.length - 1] === 'function' ) {
        options.callback = args[args.length - 1];
    }
    if ( typeof options.callback !== 'function' ) {
        options.callback = function identity() {};
    }
    return options;
};
