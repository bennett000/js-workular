/**
 * workular namespace
 * @param {Object} global
 * @param {string} ns
 */
(function (global, ns) {
    'use strict';

    /** @const {string} */
    var nameSpace = ns + '' || 'app',
        workular   = Object.create(null),
        /** @type {Object} */
        di;

    /**
     * creates a new dependency injector service
     * @param {*} rObj
     * @param {Array.<Object>|Object=} initialValues
     */
    function newDI(rObj, initialValues) {
        /** @dict */
        var rawInput = Object.create(null),
            /** @dict */
            factories = Object.create(null),
            /** @dict */
            runRetries = Object.create(null),
            /** @const */
            retryLimit = 500,
            /** @const */
            retryInterval = 5,
            /** @cosnt */
            retryDelay = 1.2;

        /**
         * For now modules do nothing but provide angular style
         * @param {string} name
         * @param {function (...)|Array} depsArray
         * @returns {*}
         */
        function module(name, depsArray) {
            depsArray = Array.isArray(depsArray) ? depsArray : [depsArray];
            return rObj;
        }

        /**
         * checks if all the dependencies for a provider are loaded
         * @param {Array.<string>} depsArray
         * @returns {boolean}
         */
        function areDepsMet(depsArray) {
            var result = true;
            depsArray.forEach(function (dep) {
                if (factories[dep] === undefined) {
                    result = false;
                }
            });
            return result;
        }

        /**
         * transforms an array of dependency strings into their actual deps
         * @param {Array.<string>} depArray
         * @returns {Array}
         */
        function resolveDepArray(depArray) {
            if (!Array.isArray(depArray)) {
                depArray = [];
            }

            return depArray.map(function resolveDep(depName) {
                if (factories[depName] === undefined) {
                    throw new Error(nameSpace + ' could not find dependency ' + depName);
                }
                return factories[depName];
            });
        }

        /**
         * attempts to invoke a factory function
         * @param {string} name
         * @param {function(...)} fn
         * @param {Array.<string>} depsArray
         * @param {number=} delay
         */
        function invokeFactory(name, fn, depsArray, delay) {
            // delay the factory run
            if (!areDepsMet(depsArray)) {
                delay = delay || retryInterval;
                runRetries[name] = !runRetries[name] ? 1 : runRetries[name] + 1;

                // if we've tried to many times, print an error, and stop trying
                if (runRetries[name] > retryLimit) {
                    doError(nameSpace + ' module ' + name + ' not registered in a timely fashion', true);
                } else {
                    // rerun the factory after delay
                    setTimeout(function () {
                        initLog(nameSpace + ' delaying invocation of ' + name);
                        invokeFactory(name, fn, depsArray, delay * retryDelay);
                    }, delay);
                }
            } else {
                // run the factory
                try {
                    factories[name] = fn.apply(null, resolveDepArray(depsArray));
                } catch (err) {
                    doError({error:err.message});
                    throw(err);
                }
            }
        }

        /**
         * checks names for validity, throws on error
         * @param {string} name
         */
        function validateName(name) {
            if (typeof name !== 'string') {
                throw new Error(nameSpace + ' module dependencies must be specified as strings');
            }
            if (name === '') {
                throw new Error(nameSpace + ' module dependencies must be specified as non-empty strings');
            }
        }

        /**
         * checks dependencies for duplicates, throws on error
         * @param {Array.<string>} depsArray
         */
        function validateDeps(depsArray) {
            var dupeArray = [];
            depsArray.forEach(function (dep) {
                validateName(dep);
                if (dupeArray.indexOf(dep) !== -1) {
                    throw new Error(nameSpace + ' module dependencies can not be duplicates (' + dep + ')');
                }
                dupeArray.push(dep);
            });
        }

        /**
         * registers a factory service
         * @param {string} name
         * @param {function(...)|Array} depsArray
         * @returns {*}
         */
        function factory(name, depsArray) {
            depsArray = Array.isArray(depsArray) ? depsArray : [depsArray];
            validateName(name);
            if (depsArray.length < 1) {
                throw new Error(nameSpace + ' must specify a module');
            }

            // save the raw signature, for use with testing
            rawInput[name] = depsArray.map(function (val) {
                return val;
            });

            // clone the depsArray to avoid potential side affects of destructive array operations
            depsArray = depsArray.map(function (val) { return val; });

            var fn = depsArray.pop();

            if (typeof fn !== 'function') {
                throw new Error(nameSpace + ' module must be a function');
            }

            validateDeps(depsArray);

            if (factories[name]) {
                initLog(nameSpace + ' overwriting ' + name);
            }
            invokeFactory(name, fn, depsArray);

            return rObj;
        }

        /**
         * returns the unprocessed factory/module.  Used for testing.
         * @param {string} name
         * @returns {*}
         */
        function getRaw(name) {
            validateName(name);
            if (rawInput[name] === undefined) {
                return null;
            }
            return rawInput[name].map(function (val) {
                return val;
            });
        }

        /**
         * gets a factory instance
         * @param {string} name
         * @returns {*}
         */
        function get(name) {
            validateName(name);
            if (factories[name] === undefined) {
                return null;
            }
            return factories[name];
        }

        /**
         * has - does this injector have name?
         * @param {string} name
         * @returns {boolean}
         */
        function has(name) {
            try {
                validateName(name);
                return factories[name] !== undefined;
            } catch (err) {
                return false;
            }
        }

        function validateInitialVal(val) {
            if (!val) {
                return false;
            }
            try {
                validateName(val.name);
            } catch (err) {
                return false;
            }
            return val.value !== undefined;
        }

        /**
         * initializes the DI with any given values.  Values are in the form
         * { name: name, value: value } or [{ name: name, value: value }, ...]
         */
        function init() {
            initialValues = Array.isArray(initialValues) ? initialValues : [initialValues];

            initialValues.forEach(function (val) {
                if (!validateInitialVal(val)) { return; }
                factories[val.name] = val.value;
            });
        }
        init();

        return Object.create(null, {
            getRaw : {
                value       : getRaw,
                configurable: false
            },
            get    : {
                value       : get,
                configurable: false
            },
            has : {
                value       : has,
                configurable: false
            },
            factory: {
                value       : factory,
                configurable: false
            },
            module : {
                value       : module,
                configurable: false
            }
        });
    }

    function init() {
        // workular di instance
        di = newDI(workular, {
            name: 'global',
            value: global
        });
    }
    init();

    // expose workular
    Object.defineProperty(workular, 'newDI', {
        value: newDI,
        configurable: false
    });
    Object.defineProperty(workular, 'factory', {
        value: di.factory,
        configurable: false
    });
    Object.defineProperty(workular, 'module', {
        value: di.module,
        configurable: false
    });
    Object.defineProperty(workular, 'getModule', {
        value: di.get,
        configurable: false
    });
    Object.defineProperty(workular, 'getModuleRaw', {
        value: di.getRaw,
        configurable: false
    });

    global[nameSpace] = workular;

}(this, 'workular'));