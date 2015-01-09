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
};

workular.Injector.prototype.annotate = function injectorAnnotate(fn, strictDi) {

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

    if (Array.isArray(fn['$inject'])) {
        return fn['$inject'].map(workular.toString);
    }

    var fnString = fn.toString(),
        start = fnString.indexOf('(') + 1,
        end = fnString.indexOf(')');

    return fnString.substring(start, end).split(',').
    map(workular.Module.forceTrimString);
};
