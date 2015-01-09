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

    var args,
    forceStrictDi = workular.forceStrictDi === true ? true : false;

    if (!(this instanceof Component)) {
        return new Component(name, fn);
    }

    this.validate(name, fn);

    /** Array notation takes presedence for now */
    if (workular.isArray(fn)) {
        args = fn;
        fn = args.pop();
        this.validate(name, fn);
        fn['$inject'] = args;
    }
    if (!workular.isArray(fn['$inject'])) {
        fn['$inject'] = [];
    }

    /** @type {string} @private */
    this.name = name;
    /** @type {function(...)} */
    this.fn = fn;
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

