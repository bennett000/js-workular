/**
 * file: main.js
 * Created by michael on 08/01/15.
 */

/*global workular */
/**
 * Namespace for putting the library together
 */
(function(global, w) {
    'use strict';

    /** @type {boolean} */
    var isBootstrapped = false,
    /** @type {workular.Injector} */
    appInjector,
    /** @dict */
    modules = {};

    /**
     * @param {string} name
     * @param {!Array.<string>=} requires
     * @param {function(...)=} config
     * @return {?workular.Module}
     */
    function module(name, requires, config) {
        if (requires === undefined) {
            if (modules[name]) {
                return modules[name];
            } else {
                return null;
            }
        }
        var m = new w.Module(name, requires);
        modules[name] = m;
        if (workular.isFunction(config)) {
            m.config(config);
        }
        return m;
    }

    function bootstrap(modules, config) {
        var injector;
        if (workular.isString(modules)) {
            modules = [modules];
        }
        if (workular.isFunction(modules)) {

        }
        if ((config) && (config.strictDi)) {

        }
        // if not already bootstrapped, install
        if (!isBootstrapped) {
            isBootstrapped = true;
            appInjector = injector;
        }
        // always return
        return injector;
    }

    w['module'] = module;
    w['bootstrap'] = bootstrap;
}(this, workular));
