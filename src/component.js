/**
 * file: component.js
 * Created by michael on 08/01/15.
 */

/*global workular*/
/**
 * @param {string} type factory, config, etc
 * @param {string|function(...)|Array|*} name
 * @param {function(...)|Array|*} fn
 * @param {string=} module optional string for debugging
 * @return {workular.Component}
 * @extends {workular.Object}
 * @constructor
 * @throws {TypeError}
 */
workular.Component = function Component(type, name, fn, module) {
    'use strict';

    if (!(this instanceof Component)) {
        return new Component(type, name, fn, module);
    }

    /** @type {string} */
    this.module = workular.toString(module);
    /** @type {string} */
    this.type = workular.toString(type);
    /** @type {string} */
    this.name = '';
    /** @type {?function(...)} */
    this.fn = null;
    /** @type {*} */
    this.data = null;

    // validate/assign the null properties
    this.$$validate_(type, name, fn);
};

workular.inherits(workular.Component, workular.Object);


/**
 * @param {string} type
 * @param {string} name
 * @param {*} data
 * @private
 * @throws {TypeError}
 * @return {*}
 */
workular.Component.prototype.$$setName_ = function setName(type, name, data) {
    'use strict';

    // detect one parameter types
    if (workular.componentsAnonymous.indexOf(type) !== -1) {
        data = name;
        name = 'w-' + Date.now().toString(16) + '-' + Math.random();
    }

    if (!workular.isString(name)) {
        throw new TypeError(type + ': first parameter must be string');
    }

    /** @type {string} */
    this.name = name;

    return data;
};

/**
 * @param {string} type
 * @param {function(...)|Array} fnOrArray
 * @private
 */
workular.Component.prototype.$$setFn_ = function setFn(type, fnOrArray) {
    'use strict';

    if (workular.isArray(fnOrArray)) {
        this.fn = fnOrArray.pop();
        this.fn['$inject'] = fnOrArray;
    } else {
        this.fn = fnOrArray;
        if (!workular.isArray(this.fn['$inject'])) {
            this.fn['$inject]'] = [];
        }
    }

    if (!workular.isFunction(this.fn)) {
        throw new TypeError(type + ': requires a function');
    }
};

/**
 * @param {string} type
 * @param {string|function(...)|Array} name
 * @param {function(...)|Array} fnOrArrayOrData
 * @throws {TypeError}
 * @private
 */
workular.Component.prototype.$$validate_ =
function validateComponent(type, name, fnOrArrayOrData) {
    'use strict';
    if (workular.componentTypes.indexOf(type) === -1) {
        throw new TypeError('workular: Component: type must be in ' +
                            'workular.componentTypes');
    }

    fnOrArrayOrData = this.$$setName_(type, name, fnOrArrayOrData);

    if (workular.componentsData.indexOf(type) !== -1) {
        this.data = fnOrArrayOrData;
    } else {
        this.data = null;
        this.$$setFn_(type, fnOrArrayOrData);
    }
};
