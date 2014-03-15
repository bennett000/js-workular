/**
 * workular namespace
 * @param {Object} global
 * @param {string} ns
 */
(function (global, ns) {
    'use strict';

    /** @const {string} */
    var nameSpace = ns + '' || 'app',
        /** @type {Object} */
            workular = Object.create(null),
        /** @type {Object} */
            modules = Object.create(null),
        /** @type {Object} */
            log,
        /** @type {Object} */
            di;

    /**
     * returns a function for use with Array.sort
     * @param field {string}
     * @param reverse {boolean}
     * @param primer {function(...)}
     * @returns {Function}
     */
    function sortBy(field, reverse, primer){

        var key = primer ?
                  function(x) {return primer(x[field]); } :
                  function(x) {return x[field]; };

        reverse = [-1, 1][+!!reverse];

        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        };
    }

    /**
     * returns true if the value is a string that is not ''
     * @param input
     * @returns {boolean}
     */
    function isNonEmptyString(input) {
        return (typeof input === 'string') && (input !== '');
    }

    /**
     * returns true if the value is a non null object (arrays do _not_ count as objects)
     * @param input {*}
     * @returns {boolean}
     */
    function isObject(input) {
        return typeof input === 'object' && input !== null && Array.isArray(input) === false;
    }

    /**
     * returns true if input is a function
     * @param input {*}
     * @returns {boolean}
     */
    function isFunction(input) {
        return typeof input === 'function';
    }

    /**
     * determines if the JS environment is node.js
     * @returns {boolean}
     */
    function isNodeJS() {
        return ((typeof process !== 'undefined') && (typeof require !== 'undefined') && (typeof module !== 'undefined'));
    }

    /**
     * determines if the JS environment is a web worker
     * @returns {boolean}
     */
    function isWorker() {
        return ((typeof self !== 'undefined') && (typeof navigator !== 'undefined'));
    }

    /**
     * determines if the JS environment is a web browser
     * @returns {boolean}
     */
    function isBrowser() {
        return ((typeof window !== 'undefined') && (typeof document !== 'undefined'));
    }

    /**
     * Stores logs until a 'real' logger is added to the system
     * @returns {*}
     */
    function newPreLog() {
        var rObj = Object.create(null),
            logs = [],
            methods = [
            'log', 'info', 'warn', 'error', 'trace'
        ];

        /**
         * commits the log to memory
         * @param nameSpace {string}
         * @param args {Array.<*>}
         */
        function doLog(nameSpace, args) {
            logs.push(
                {
                    timestamp: Date.now(),
                    nameSpace: nameSpace,
                    arguments: Array.prototype.slice.call(args, 0)
                });
        }

        /**
         * upgrades the log object to an object that can actually log
         * this function will log its memory out, and clean up its storage
         * @param newLogObj
         */
        function upgrade(newLogObj) {
            // upgrade the object (we want the prototype)
            for (var i in newLogObj) {
                rObj[i] = newLogObj[i];
            }

            // sort, then output the buffer
            logs.sort(sortBy('timestamp', false, parseInt)).forEach(function (logParams) {
                rObj[logParams.nameSpace].apply(rObj, logParams['arguments']);
            });

            // delete old logs
            logs = null;
        }

        /** builds the logger */
        function build() {
            methods.forEach(function (method) {
                rObj[method] = function autoLog() {
                    doLog(method, arguments);
                };
            });

            rObj.upgrade = upgrade;
            return rObj;
        }

        return build();
    } /** END Logger */

    function newDependencyInjector(initialValues) {
        var functions  = Object.create(null),
            rawInput   = Object.create(null),
            deps       = Object.create(null),
            knownDis   = [],
            nameSpaces = [
            'factory'
        ], di;

        // initialize the namespaces
        nameSpaces.forEach(function (ns) {
            rawInput[ns] = Object.create(null);
            functions[ns] = Object.create(null);
            deps[ns] = Object.create(null);
        });

        di = Object.create(null);

        /**
         * @param nameSpace {string}
         * @param name {string}
         * @param dependencies {string|Array.<string>}
         * @returns {object}
         */
        function component(nameSpace, name, dependencies) {
            dependencies = Array.isArray(dependencies) ? dependencies : [dependencies];
            if(!isNonEmptyString(name)) {
                throw new Error(nameSpace + ': must specify a component name');
            }
            if (dependencies.length < 1) {
                throw new Error(nameSpace + ': ' + name + ' must specify a component name');
            }

            // save the raw signature, for use with testing
            rawInput[nameSpace][name] = dependencies.map(function (val) {
                return val;
            });

            // clone the dependencies to avoid potential side affects of destructive array operations
            deps[nameSpace][name]      = Object.create(null);
            deps[nameSpace][name].deps = dependencies.map(function (val) { return val; });
            deps[nameSpace][name].fn   = deps[nameSpace][name].deps.pop();

            if (typeof deps[nameSpace][name].fn !== 'function') {
                throw new Error(nameSpace + ' module must be a function');
            }

            // initialize the function
            functions[nameSpace][name] = false;

            return di;
        }

        /**
         * @param name {string}
         * @param dependencies {Array.<string>|string}
         * @returns {object}
         */
        function factory(name, dependencies) {
            return component('factory', name, dependencies);
        }

        /**
         * returns true if a component with the given name is found.
         * @param name {string}
         * @returns {boolean}
         */
        function has(name) {
            if (!isNonEmptyString(name)) {
                return false;
            }
            var result = false;
            Object.keys(rawInput).forEach(function (ns) {
                if (rawInput[ns][name] !== undefined) {
                    result = true;
                }
            });
            return result;
        }

        /**
         * @param nameSpace {string}
         * @param name {string}
         * @returns {Array}
         */
        function resolveDeps(nameSpace, name) {
            return deps[nameSpace][name].deps.map(function (dependency) {
                return di.get(dependency);
            });
        }

        /**
         * Attempts to use commonjs to invoke a component
         * @param moduleName {string}
         * @returns {*}
         */
        function tryCommonInvoke(moduleName) {
            /*global require*/
            try {
                return require(moduleName);
            } catch (err) {
                throw new EvalError('workular dependecy injector: error invoking: ' + nameSpace + ': name: ' + err.message);
            }
        }

        /**
         * Invokes a component function, throws an error if there's a problem
         * This should automagically try and invoke commonjs modules
         * @param nameSpace {string}
         * @param name {string}
         */
        function invokeComponent(nameSpace, name) {
            functions[nameSpace][name] = deps[nameSpace][name].fn.apply(null, resolveDeps(nameSpace, name));
            return functions[nameSpace][name];
        }

        /**
         * returns a component.  If the component has not been invoked, it is invoked
         * @param name {string}
         * @returns {*}
         */
        function get(name) {
            if (!isNonEmptyString(name)) {
                throw new TypeError('workular dependency injector: get function takes a string as a parameter');
            }
            var nameSpace = false, result;
            Object.keys(functions).forEach(function (ns) {
                if (functions[ns][name] !== undefined) {
                    nameSpace = ns;
                }
            });

            // if it's not found in this DI, try known DIs
            if (nameSpace === false) {
                result = false;
                knownDis.forEach(function (aDI) {
                    try {
                        result = aDI.get(name);
                    } catch (err) {
                        // fail over
                    }
                });

                // throw if it's not found at all
                if (result === false) {
                    // looks like we do not have the component.  Try commonjs if it seems like node exists
                    if (!isNodeJS()) {
                        throw new RangeError('workular dependency injector: component ' + name + ' not found!');
                    }
                    return tryCommonInvoke(name);
                }
                // return from other DI
                return result;
            }
            // return invocation
            if (functions[nameSpace][name] === false) {
                return invokeComponent(nameSpace, name);
            }
            // return existing
            return functions[nameSpace][name];
        }

        /**
         * @param name {string}
         * @returns {boolean|Array}
         */
        function getRaw(name) {
            if (!isNonEmptyString(name)) {
                throw new TypeError('workular dependency injector: get function takes a string as a parameter');
            }
            var nameSpace = false, result;
            Object.keys(rawInput).forEach(function (ns) {
                if (rawInput[ns][name] !== undefined) {
                    nameSpace = ns;
                }
            });
            if (nameSpace === false) {
                result = null;
                knownDis.forEach(function (aDI) {
                    var localResult;
                    try {
                        localResult = aDI.getRaw(name);
                        if (localResult) { result = localResult; }
                    } catch (err) {
                        // fail over
                    }
                });

                // return from other DI
                return result;
            }
            return rawInput[nameSpace][name];
        }

        function knows(otherDI) {
            try {
                if (otherDI.isWorkularDI === true) {
                    knownDis.push(otherDI);
                    return true;
                } else {
                    return false;
                }
            } catch (err) {
                throw new Error('woruklar dependency injector: knows function requires a workular dependency injector');
            }
        }

        Object.defineProperty(di, 'factory', {
            value: factory,
            configurable: false
        });
        Object.defineProperty(di, 'has', {
            value: has,
            configurable: false
        });
        Object.defineProperty(di, 'get', {
            value: get,
            configurable: false
        });
        Object.defineProperty(di, 'getRaw', {
            value: getRaw,
            configurable: false
        });
        Object.defineProperty(di, 'knows', {
            value: knows,
            configurable: false
        });
        Object.defineProperty(di, 'isWorkularDI', {
            value: true,
            configurable: false
        });

        function initializeDI() {
            if (initialValues) {
                if (!Array.isArray(initialValues)) {
                    initialValues = [initialValues];
                }
            } else {
                initialValues = [];
            }

            initialValues.forEach(function (value) {
                if (!isObject(value)) {
                    throw new TypeError('workular dependency injector: initial values must be objects with name, namespace, and value fields');
                }
                if (!isNonEmptyString(value.nameSpace) || (!isNonEmptyString(value.name))) {
                    throw new TypeError('workular dependency injector: initial values must have names && namespaces');
                }
                try {
                    functions[value.nameSpace][value.name] = value.value;
                } catch (err) {
                    throw new TypeError('workular dependency injector: initializeDI could not add initial values: ' +
                    err.message);
                }
            });
        }
        initializeDI();

        return di;
    } /** END Dependency Injector */

    /**
     * adds a module.  Warning, this function is destructive!
     * @param name {string}
     */
    function module(name) {
        if (!isNonEmptyString(name)) {
            throw new TypeError('workular: module names must be non empty strings');
        }

        modules[name] = newDependencyInjector();
        di.knows(modules[name]);
        return modules[name];
    }

    function factory() {
        return di.apply(null, Array.prototype.slice.call(arguments, 0));
    }

    /**
     * injects, and invokes the main method
     * @param deps {Array}
     */
    function injectMainDependencies(deps) {
        var main = deps.pop();
        if (!isFunction(main)) {
            console.log('typeof main', typeof main);
            throw new TypeError('workular: expected main method to be a function');
        }
        if (!Array.isArray(deps)) {
            throw new TypeError('workular: expected dependencies to be an Array');
        }
        deps = deps.map(function (dep) {
            return di.get(dep);
        });
        main.apply(null, deps);
    }


    function main(programEntry) {
        if ((!isFunction(programEntry)) && (!Array.isArray(programEntry))) {
            throw new TypeError('workular, expects main parameter to be a function, or an array');
        }
        /*global setTimeout*/
        // start workular on the next turn
        setTimeout(function () {
            try {
                // no dependency case
                if (!Array.isArray(programEntry)) {
                    programEntry();
                } else {
                    injectMainDependencies(programEntry);
                }
            } catch (err) {
                throw new Error('workular failed instantiating main method: ' + err.message);
            }
        }, 0);
    }

    function init() {
        // workular di instance
        log = newPreLog();
        di = newDependencyInjector([{
            nameSpace: 'factory',
            name: 'global',
            value: global
        }, {
            nameSpace: 'factory',
            name: 'log',
            value: log
        }, {
            nameSpace: 'factory',
            name: '$log',
            value: log
        }]);
    }
    init();

    // expose workular
    Object.defineProperty(workular, 'newDI', {
        value: newDependencyInjector,
        configurable: false
    });
    Object.defineProperty(workular, 'newPreLogger', {
        value: newPreLog,
        configurable: false
    });
    Object.defineProperty(workular, 'upgradeLogger', {
        value: log.upgrade,
        configurable: false
    });
    Object.defineProperty(workular, 'factory', {
        value: factory,
        configurable: false
    });
    Object.defineProperty(workular, 'module', {
        value: module,
        configurable: false
    });
    Object.defineProperty(workular, 'getComponent', {
        value: di.get,
        configurable: false
    });
    Object.defineProperty(workular, 'getComponentRaw', {
        value: di.getRaw,
        configurable: false
    });
    Object.defineProperty(workular, 'sortBy', {
        value: sortBy,
        configurable: false
    });
    Object.defineProperty(workular, 'isNonEmptyString', {
        value: isNonEmptyString,
        configurable: false
    });
    Object.defineProperty(workular, 'isObject', {
        value: isObject,
        configurable: false
    });
    Object.defineProperty(workular, 'isFunction', {
        value: isFunction,
        configurable: false
    });
    Object.defineProperty(workular, 'isNodeJS', {
        value: isNodeJS,
        configurable: false
    });
    Object.defineProperty(workular, 'isWorker', {
        value: isWorker,
        configurable: false
    });
    Object.defineProperty(workular, 'isBrowser', {
        value: isBrowser,
        configurable: false
    });
    Object.defineProperty(workular, 'emptyFunction', {
        value: function () {},
        configurable: false
    });
    Object.defineProperty(workular, 'main', {
        value: main,
        configurable: false
    });


    if (global[nameSpace] !== undefined) {
        throw new Error('workular: namespace ' + nameSpace + ' already defined!');
    }
    global[nameSpace] = workular;

}(this, 'workular'));