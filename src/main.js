/**
 * file: main.js
 * Created by michael on 08/01/15.
 */

/*global workular */
/**
 * Namespace for putting the library together
 */

/** @type {boolean} */
workular.$$isBootstrapped = false;

/**
 * @type {Object.<string, workular.Module>}
 * */
workular.$$modules = {};

/**
 * @type {?workular.Injector}
 */
workular.$$injector = null;

workular['$$reset'] = function reset() {
    'use strict';

    workular.$$injector = null;
    workular.$$isBootstrapped = false;
};

/**
 * @param {string} name
 * @param {!Array.<string>=} requires
 * @param {function(...)=} config
 * @return {?workular.Module}
 */
workular['module'] = function module(name, requires, config) {
    'use strict';

    if (requires === undefined) {
        if (workular.$$modules[name]) {
            return workular.$$modules[name];
        } else {
            return null;
        }
    }
    var m = new workular.Module(name, requires);
    workular.$$modules[name] = m;
    if (workular.isFunction(config)) {
        m.config(config);
    }
    return m;
};

/**
 * @param {Array.<string|function(...)|Array>} modules
 * @param {{strictDi: boolean}=} config
 * @return {workular.Injector|*}
 */
workular['bootstrap'] = function bootstrap(modules, config) {
    'use strict';

    // if alrady bootstrapped, skip out
    if (workular.$$isBootstrapped) {
        return workular.$$injector;
    }

    config = config || {};

    workular.$$isBootstrapped = true;
    workular.$$injector = new workular.Injector(workular.$$modules,
                                                config.strictDi);

    if (!workular.isArray(modules)) {
        modules = [modules];
    }

    // run any 'kickstart' modules
    modules.forEach(function(item) {
        if (workular.isString(item)) {
            return workular.$$injector.$$auto.run([item, workular.noop]);
        }
        if (workular.isFunction(item) || workular.isArray(item)) {
            return workular.$$injector.$$auto.run(item);
        }
    });

    workular.$$injector.$$bootstrap();

    // always return
    return workular.$$injector;
};

/**
 * @param {Array.<string|Function>} mods
 * @param {boolean=} strictDi
 * @return {workular.Injector}
 */
workular['injector'] = function newDi(mods, strictDi) {
    'use strict';
    var i = new workular.Injector(workular.$$modules, strictDi);
    i.$$bootstrap();
    return i;
};

workular['newDI'] = workular['injector'];

/**
 * @param {string} name
 * @return {*}
 */
workular['getComponent'] = function getComponent(name) {
    'use strict';

    var i;
    if (workular.$$injector) {
        i = workular.$$injector.get(name);
        return i;
    }
    return null;
};

workular.module('workular', []).
factory('global', function() {
            'use strict';

            // will not work as a value due to workular.copy validation rules
            return workular.global;
        }).
value('log', workular.log).
value('$log', workular.log);

