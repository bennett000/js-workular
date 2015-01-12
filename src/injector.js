/**
 * file: injector.js
 * Created by michael on 08/01/15.
 */

/*global workular*/

/**
 * @param {Object.<string, workular.Module>} modules dictionary
 * @return {workular.Injector}
 * @throws
 * @extends {workular.Object}
 * @constructor
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
    this.$$modules_ = modules;
    /**
     * @dict
     * @private
     */
    this.$$annotationCache_ = {};
    /**
     * @dict
     * @private
     */
    this.$$modulesCache_ = {};

    // initialize
    this.$$checkDependencies_();
    this.$$bootstrap();
};

workular.inherits(workular.Injector, workular.Object);

/**
 * @param {string} component
 * @param {function(...)} callback
 */
workular.Injector.prototype.$$iterateComponent =
function iterateComponent(component, callback) {
    'use strict';

    if (!workular.isFunction(callback)) {
        return;
    }

    if (workular.componentTypes.indexOf(component) === -1) {
        return;
    }

    workular.forEach(this.$$modules_, function(module) {
        workular.forEach(module.$$components, function(c, name) {
            if (component !== name) {
                return;
            }
            callback.call(this, c);
        }, this);
    }, this);
};

/**
 * @param {string} name
 * @return {?workular.Component}
 * @private
 */
workular.Injector.prototype.$$findComponent_ = function findComponent(name) {
    'use strict';

    /**
     *  @type {?workular.Component}
     */
    var result = null;

    /**
     * @throws
     */
    workular.forEach(this.$$modules_, function findModuleWithDep(module) {
        if (!result) {
            result = module.$$hasComponent_(name);
        }
    }, this);

    return result;
};

/**
 * Validates that all module dependencies are installed
 * @private
 * @throws if module not present
 */
workular.Injector.prototype.$$checkDependencies_ =
function checkDependencies() {
    'use strict';

    // for each module
    workular.forEach(this.$$modules_, function checkModule(module, name) {
        // check if all module's required modules are available
        workular.forEach(module.requires, function(requiredModule) {
            if (this.$$modules_[requiredModule]) {
                return;
            }
            throw new TypeError('workular: module', name,
                                ' requires', requiredModule, ' but',
                                requiredModule, ' not found');
        }, this);
        // initialize the modulesCache if not done
        if (!this.$$modulesCache_[name]) {
            this.$$modulesCache_[name] = {};
        }
    }, this);

};

workular.Injector.prototype.$$bootstrapConstants = function bootstrapInjector() {

};

workular.Injector.prototype.$$bootstrapProviders = function bootstrapInjector() {

};

workular.Injector.prototype.$$bootstrapFactories = function bootstrapInjector() {

};

workular.Injector.prototype.$$bootstrapServices = function bootstrapInjector() {

};

workular.Injector.prototype.$$bootstrap = function bootstrapInjector() {

};

/**
 * @param {function(...)} fn
 * @param {string} fnString
 * @return {Array.<string>}
 * @private
 */
workular.Injector.prototype.$$annotateStrict_ =
function annotateStrict(fn, fnString) {
    'use strict';

    this.$$annotationCache_[fnString] = fn['$inject'].map(workular.toString);
    return this.$$annotationCache_[fnString];
};

/**
 * @param {function(...)} fn
 * @param {string} fnString
 * @return {Array.<string>}
 * @private
 */
workular.Injector.prototype.$$annotateRelaxed_ =
function annotateRelaxed(fn, fnString) {
    'use strict';

    // not in strict mode
    // if there is an inject array use it
    if (fn['$inject'].length) {
        this.$$annotationCache_[fnString] =
        fn['$inject'].map(workular.toString);
        return this.$$annotationCache_[fnString];
    }
    // try function parsing
    this.$$annotationCache_[fnString] = workular.Injector.getArgsFromFn(fn);
    return this.$$annotationCache_[fnString];
};

/**
 * @param {function(...)} fn
 * @param {boolean=} strictDi
 * @return {Array.<string>}
 */
workular.Injector.prototype.annotate = function injectorAnnotate(fn, strictDi) {
    'use strict';

    // double check array
    fn['$inject'] = workular.isArray(fn['$inject']) ? fn['$inject'] : [];

    /** @type {string} */
    var fnString = fn.toString();

    // check storage
    if (this.$$annotationCache_[fnString]) {
        return this.$$annotationCache_[fnString];
    }

    if (strictDi) {
        return this.$$annotateStrict_(fn, fnString);
    }
    return this.$$annotateRelaxed_(fn, fnString);
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
 * @param {function(...)} fn
 * @return {Array.<string>}
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
