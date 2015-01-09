/**
 * file: injector.js
 * Created by michael on 08/01/15.
 */

/*global workular*/

/**
 * @param modules {Object.<string, workular.Module>} module dictionary
 * @returns {workular.Injector}
 * @throws
 * @constructor
 * @package
 */
workular.Injector = function Injector(modules) {
    'use strict';

    if (!(this instanceof Injector)) {
        return new Injector(modules);
    }

    if (!workular.isObject(modules)) {
        throw new TypeError('Injector requires modules dictionary');
    }

    /**
     * @type {Object.<string, workular.Module>}
     * @private
     */
    this.$$modules = modules;
};

workular.Injector.prototype.checkDependencies = function checkDependencies() {

};

/**
 * @param fn {function(...)}
 * @param strictDi {boolean=}
 * @returns {Array.<string>}
 */
workular.Injector.prototype.annotate = function injectorAnnotate(fn, strictDi) {
    'use strict';

    strictDi = strictDi === true ? true : false;
    // double check array
    fn['$inject'] = workular.isArray(fn['$inject']) ? fn['$inject'] : [];

    // if strict di $inject _must_ already be set through annotations, or
    // a direct fn.$inject = function functionToRun() {}
    if (strictDi) {
        return fn['$inject'].map(workular.toString);
    }
    // not in strict mode
    // if there is an inject array use it
    if (fn['$inject'].length) {
        return fn['$inject'].map(workular.toString);
    }
    // try function parsing
    return workular.Injector.getArgsFromFn(fn);
};


workular.Injector.prototype.get = function injectorGet(name, caller) {

};

workular.Injector.prototype.has = function injectorHas(name) {

};

workular.Injector.prototype.invoke =
function injectorInvoke(fn, context, locals) {

};

workular.Injector.prototype.instantiate =
function injectorInstantiate(Type, locals) {

};

/**
 * @param fn {function(...)}
 * @return {Array.<string>}
 * @package
 */
workular.Injector.getArgsFromFn = function getArgsFromFn(fn) {
    'use strict';

    if (!workular.isFunction(fn)) {
        return [];
    }

    var fnString = fn.toString(),
        start = fnString.indexOf('(') + 1,
        end = fnString.indexOf(')');

    return fnString.substring(start, end).split(',').
    map(workular.Module.forceTrimString);
};
