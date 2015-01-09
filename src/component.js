/**
 * file: component.js
 * Created by michael on 08/01/15.
 */

/*global workular*/

/**
 * @param name {string}
 * @param fn {function(...)|Array}
 * @return {workular.Component}
 * @constructor
 * @throws {TypeError}
 * @package
 * @interface
 */
workular.Component = function Component(name, fn) {
    'use strict';

    var args;

    if (!(this instanceof Component)) {
        return new Component(name, fn);
    }

    this.validate(name, fn);

    if (workular.isArray(fn)) {
        args = fn;
        fn = args.pop();
        this.validate(name, fn);
    } else {
        args = workular.Component.getArgsFromFn(fn);
    }

    /** @type {string} @private */
    this.name = name;
    /** @type {string} @private */
    this.args = args;
    /** @type {function(...)} */
    this.fn = fn;
    /** @type {*} */
    this.instantiated = null;
};

/**
 * @param name {string}
 * @param fn {function(...)|Array}
 * @throws {TypeError}
 * @private
 */
workular.Component.prototype.validate = function validateComponent(name, fn) {
    'use strict';

    if (!workular.isString(name)) {
        throw new TypeError('Component: first parameter must be string');
    }

    if ((!workular.isFunction(fn)) && (!workular.isArray(fn))) {
        throw new TypeError('Component: second parameter must be function');
    }
};

/**
 * @param fn {function(...)}
 * @return {Array.<string>}
 * @package
 */
workular.Component.getArgsFromFn = function getArgsFromFn(fn) {
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
