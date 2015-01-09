/**
 * file: module.js
 * Created by michael on 08/01/15.
 */
/*global workular*/
/**
 * @param name {string}
 * @param deps {Array.<string>}
 * @return {workular.Module}
 * @constructor
 * @package
 */
workular.Module = function Module(name, deps) {
    'use strict';

    if (!(this instanceof Module)) {
        return new Module(name, deps);
    }

    /** @type {Object} */
    var components = {},
    /** @type {Module} */
    that = this;

    /** @type {string} */
    this['name'] = name + '';

    /** @type {Array.<string>} */
    this['requires'] = deps;

    workular.componentTypes.forEach(function (component) {
        components[component] = {};
        that[component] = that.$$registerComponent(components, component);
    });

};

/**
 * @param val {*}
 * @return {string}
 */
workular.Module.forceTrimString = function forceTrimString(val) {
    'use strict';

    return workular.toString(val).trim();
};


/**
 * @param components {object}
 * @param component {string}
 * @return {function(string, function|Array)}
 */
workular.Module.prototype.$$registerComponent =
function getRegisterComponent(components, component) {
    'use strict';
    var that = this;

    /**
     * @param name {string}
     * @param fnOrArray {function(...)|Array}
     * @return {workular.Module}
     * @throws
     */
    function registerComponent(name, fnOrArray) {
        // config is a special case
        if (component === 'config') {
            fnOrArray = name;
            name = Date.now().toString(16) + Math.random();
        }
        if (components[component][name]) {
            workular.log.warn('workular:', name,
                              ' already registered in: ', that.name);
            return that;
        }
        components[component] = new workular.Component(name, fnOrArray);

        return that;
    }

    return registerComponent;
};

