/**
 * file: module.js
 * Created by michael on 08/01/15.
 */
/*global workular*/
/**
 * @param name {string}
 * @param requires {Array.<string>}
 * @return {workular.Module}
 * @constructor
 * @package
 */
workular.Module = function Module(name, requires) {
    'use strict';

    if (!(this instanceof Module)) {
        return new Module(name, requires);
    }

    /** @type {Object} */
    var components = {},
    /** @type {Module} */
    that = this;

    /** @type {string} */
    this['name'] = name + '';

    /** @type {Array.<string>} */
    this['requires'] = requires;

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
 * @param val {*}
 * @returns {boolean}
 * @private
 */
workular.Module.$$isSpecialComponent = function (val) {
    var specials = ['run', 'main', 'config'];

    return specials.indexOf(val) !== -1;
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
        // config, run, and main are special cases
        if (workular.Module.$$isSpecialComponent(component)) {
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

