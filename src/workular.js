/*global workular*/
(function (global, ns) {
    'use strict';

    if ((global[ns]) && (typeof global[ns] === 'object')) {
        global[ns] = {
            'alternates': [global[ns]]
        };
        if (Array.isArray(global[ns].alternates[0]['alternates'])) {
            global[ns].alternates.concat(global[ns].alternates[0].alternates);
        }
    } else {
        global[ns] = {
            'alternates': []
        };
    }
}(this, 'workular'));

/**
 * @const
 * @private
 */
workular['$$version'] = '0.6.0';

/**
 * @const
 */
workular['version'] = {
    full: workular.$$version,
    major: workular.$$version.split('.')[0],
    minor: workular.$$version.split('.')[1],
    dot: workular.$$version.split('.')[2],
    codeName: 'Compliant Kickoff'
};

/**
 * @const
 * @private
 */
workular['componentTypes'] = [
    'factory', 'service', 'run', 'main', 'filter',
    'provider', 'config', 'constant', 'value'
];

/**
 * @param context {*}
 * @param fn {function(...)}
 * @param args {Array=}
 * @return {*}
 */
workular['bind'] = function bindContext(context, fn, args) {
    'use strict';
    if (!workular.isFunction(fn)) {
        return fn;
    }

    if (!Array.isArray(args)) {
        args = [args];
    }

    function boundFunction() {
        if (args.length) {
            return fn.apply(context, arguments);
        } else {
            return fn.apply(context, args.concat(arguments));
        }
    }

    return boundFunction;
};

/**
 * @param val {*}
 * @return {*}
 */
workular['identity'] = function identity(val) {
    'use strict';

    return val;
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isDefined'] = function isDefined(val) {
    'use strict';

    return val !== undefined;
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isFunction'] = function isFunction(val) {
    'use strict';

    return typeof val === 'function';
};

workular['isNumber'] = function isNumber() {

};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isNaN'] = function isNaN(val) {
    'use strict';

    return val !== val;
};

workular['isNonEmptyString'] = function isNonEmptyString(val) {
    'use strict';

    return typeof val === 'string' && val !== '';
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isObject'] = function isObject(val) {
    'use strict';

    return typeof val === 'object' &&
           val !== null &&
           Array.isArray(val) === false;
};

/**
 * @param val {*}
 * @return {string}
 */
workular['toString'] = function toString(val) {
    'use strict';

    return val + '';
};

/**
 * @param val {*}
 * @return {number}
 */
workular['toNumber'] = function toNumber(val) {
    'use strict';

    return +val || 0;
};

/**
 * @private
 * @constructor
 */
workular.PreLog = function PreLog() {
    'use strict';

    /**
     *  @const
     *  @private
     *  */
    this.methods = ['debug', 'error', 'info', 'log', 'trace', 'warn'];

    /**
     * @type {Array.<{ method: string, args: Array}>}
     * @private
     */
    this.history = [];

    this.$$build();
};

/**
 * @private
 */
workular.PreLog.prototype.$$build = function build() {
    'use strict';

    var that = this;

    this.methods.forEach(function (method) {
        that[method] = that.getMethod(method);
    });
};

/**
 * @param newLogger {{ debug: function(...), error: function(...), info: function (...), log: function (...), warn: function(...) }}
 * @return {boolean}
 */
workular.PreLog.prototype.upgrade = function upgrade(newLogger) {
    'use strict';

    var isValid = true;
    this.methods.forEach(function (method) {
        if (!workular.isFunction(newLogger[method])) {
            isValid = false;
        }
    });

    if (!isValid) {
        return false;
    }

    var that = this;

    this.methods.forEach(function (method) {
        that[method] = workular.bind(newLogger, newLogger[method]);
    });

    this.history.forEach(function (message) {
        that[message.method].apply(that, message.args);
    });

    this.history = [];
};

/**
 * @param method {string}
 * @return {function(...)}
 * @private
 */
workular.PreLog.prototype.getMethod = function getMethod(method) {
    'use strict';
    var that = this;

    function doLog() {
        that.history.push({
                              args: Array.prototype.slice.call(arguments, 0),
                              method: method
                          });
    }

    return doLog;
};

/**
 * @type {workular.PreLog|*}
 */
workular.log = new workular.PreLog();


/**
 * @param name {string}
 * @param args {Array.<string>}
 * @param fn {function(...)}
 * @return {workular.Component}
 * @constructor
 * @private
 * @interface
 */
workular.Component = function Component(name, args, fn) {
    'use strict';

    if (!(this instanceof Component)) {
        return new Component(name, args, fn);
    }

    /** @type {string} @private */
    this.name = name + '';
    /** @type {string} @private */
    this.args = Array.isArray(args) ? args.map(workular.toString) : [];
    /** @type {function(...)} */
    this.fn = workular.isFunction(fn) ? fn : workular.noop;
    /** @type {*} */
    this.instantiated = null;
};


/**
 * @param name {string}
 * @param deps {Array.<string>}
 * @return {workular.Module}
 * @constructor
 * @private
 */
workular.Module = function Module(name, deps) {
    'use strict';

    if (!(this instanceof Module)) {
        return new Module(name, deps);
    }

    /** @type {Module} */
    var that = this,
    /** @type {Object} */
    components = {};

    workular.componentTypes.forEach(function (el) {
        components[el] = {};
        that[el] = function componentRegister(name, fnOrArray) {
            if (components[el][name]) {

            }
            if (Array.isArray[fnOrArray]) {
                components[el] = {
                    name: name + '',
                    args: [],
                    fn: fnOrArray.pop()
                };
            }
        };
    });

};

/**
 * @param name {string}
 * @param deps {Array.<string>}
 * @return {workular.Module}
 */
workular['module'] = function module(name, deps) {
    'use strict';
    name = name + '';

    if (!Array.isArray(deps)) {
        deps = [];
    }

    return new workular.Module(name, deps);
};

workular['noop'] = function noop() {};
workular['emptyFunction'] = workular.noop;