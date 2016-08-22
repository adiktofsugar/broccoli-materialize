(function (root, factory) {
    var moduleNames = __MODULE_NAMES__;
    var browserModuleNames = __BROWSER_MODULE_NAMES__;
    
    if (typeof define === 'function' && define.amd) {
        define('materialize', moduleNames, function () {
            var e = {};
            var args = Array.prototype.slice.apply(arguments);
            args = [e].concat(args);
            return factory.apply(null, args);
        });
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        var args = moduleNames.map(function (name) {
            return require(name);
        });
        args = [exports].concat(args);
        factory.apply(null, args);
    } else {
        // Browser globals
        var args = browserModuleNames.map(function (name) {
            return root[name];
        });
        args = [root].concat(args);
        factory.apply(null, args);
    }
}(this, function __FUNCTION_SIGNATURE__ {
