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

    this.fn = this.$$functionOrArray_(fnOrArray);

    if (!workular.isFunction(this.fn)) {
        throw new TypeError(type + ': requires a function');
    }
};

/**
 * @param {function(...)|Array} fnOrArray
 * @return {?function(...)}
 * @private
 */
workular.Component.prototype.$$functionOrArray_ =
function functionOrArray(fnOrArray) {
    'use strict';
    /** @type {?function(...)} */
    var fn,
    /** @type Array.<string> */
    array;

    if (workular.isArray(fnOrArray)) {
        // make a *copy* of the array
        array = fnOrArray.map(workular.identity);
        fn = array.pop();
        fn['$inject'] = array;
    } else {
        fn = fnOrArray;
    }

    if (!workular.isFunction(fn)) {
        return null;
    }

    if (!workular.isArray(fn['$inject'])) {
        fn['$inject'] = [];
    }

    return fn;
};

/**
 * @param {Object} provider
 * @private
 */
workular.Component.prototype.$$validateProviderObject_ =
function validateProviderObject(provider) {
    'use strict';

    if (!workular.isObject(provider)) {
        throw new TypeError('Provider ' + this.name + ' must provide an ' +
                            'object, or a function');
    }

    if (!this.$$functionOrArray_(provider['$get'])) {
        throw new TypeError('Provider ' + this.name + ' must provide a ' +
                            '$get method');
    }


    this.data = provider;
};

/**
 * @param {Object} fnOrObjectOrArray
 * @private
 */
workular.Component.prototype.$$validateProviderData_ =
function validateProviderData(fnOrObjectOrArray) {
    'use strict';

    this.fn = this.$$functionOrArray_(fnOrObjectOrArray);
    if (workular.isFunction(this.fn)) {
        return;
    }
    this.$$validateProviderObject_(fnOrObjectOrArray);

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

    if (type === 'provider') {
        this.$$validateProviderData_(fnOrArrayOrData);
    } else if (workular.componentsData.indexOf(type) !== -1) {
        this.data = fnOrArrayOrData;
    } else {
        this.data = null;
        this.$$setFn_(type, fnOrArrayOrData);
    }
};
