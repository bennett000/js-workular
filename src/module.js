/**
 * file: module.js
 * Created by michael on 08/01/15.
 */



/*global workular*/
/**
 * @param {string} name
 * @param {Array.<string>} requires
 * @return {workular.Module}
 * @extends {workular.Object}
 * @constructor
 */
workular.Module = function Module(name, requires) {
    'use strict';

    if (!(this instanceof Module)) {
        return new Module(name, requires);
    }

    /** @type {workular.Module} */
    var that = this;

    /**
     * Registered components live here
     * @dict
     */
    this.$$components = {};

    /** @type {string} */
    this['name'] = name + '';

    /** @type {Array.<string>} */
    this['requires'] = requires;

    workular.componentTypes.forEach(function(component) {
        that.$$components[component] = {};
        that[component] = that.$$registerComponent(component);
    });

};

workular.inherits(workular.Module, workular.Object);

/**
 * @param {string} name
 * @return {?workular.Component}
 * @private
 */
workular.Module.prototype.$$hasComponent_ = function hasComponent(name) {
    'use strict';

    // get components in the following order
    // ignore configs/runs/mains
    //  1. constants
    //  2. values
    //  3. providers
    //  4. factories
    //  5. services
    //  6. filters

    if (this.$$components['constant'][name]) {
        return this.$$components['constant'][name];
    }
    if (this.$$components['value'][name]) {
        return this.$$components['value'][name];
    }
    if (this.$$components['provider'][name]) {
        return this.$$components['provider'][name];
    }
    if (this.$$components['factory'][name]) {
        return this.$$components['factory'][name];
    }
    return this.$$components['service'][name] || null;
};

/**
 * @param {*} val
 * @return {string}
 */
workular.Module.forceTrimString = function forceTrimString(val) {
    'use strict';

    return workular.toString(val).trim();
};

/**
 * @param {string} component
 * @return {function(string, function|Array)}
 */
workular.Module.prototype.$$registerComponent =
function getRegisterComponent(component) {
    'use strict';
    var that = this;

    /**
     * @param {string|function(...)|Array} param1
     * @param {function(...)|Array|*=} param2
     * @return {workular.Module}
     * @throws
     */
    function registerComponent(param1, param2) {
        if (that.$$components[component][param1]) {
            workular.log.warn('workular:', param1,
                              ' already registered in: ', that.name);
            return that;
        }

        that.$$components[component] = new workular.Component[component](param1, param2, that.name);

        return that;
    }

    return registerComponent;
};

