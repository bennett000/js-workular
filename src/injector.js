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
    this.$$componentsCache_ = {};
    /**
     * @dict
     * @private
     */
    this.$$providerCache_ = {};
    /**
     * @type Array.<string>
     * @private
     */
    this.$$dependencyStack_ = [];

    // initialize
    this.$$checkDependencies_();
    this.$$bootstrap_();
};

workular.inherits(workular.Injector, workular.Object);

/**
 * @param {string} component
 * @param {function(...)} callback
 * @param {Object.<string, Object>=} collection
 * @private
 */
workular.Injector.prototype.$$iterateComponent_ =
function iterateComponent(component, callback, collection) {
    'use strict';

    if (!workular.isFunction(callback)) {
        return;
    }

    if (workular.componentTypes.indexOf(component) === -1) {
        return;
    }

    if (!workular.isObject(collection)) {
        collection = this.$$modules_;
    }

    workular.forEach(collection, function(module) {
        workular.forEach(module.$$components[component], function(c) {
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

        // initialize the components cache if not done
        if (!this.$$componentsCache_[name]) {
            this.$$componentsCache_[name] = {};
        }
        // initialize the provider if not done
        if (!this.$$providerCache_[name]) {
            this.$$providerCache_[name] = {};
        }
    }, this);

};

/**
 * @param {string} type
 * @private
 */
workular.Injector.prototype.$$bootstrapData_ =
function bootstrapData(type) {
    'use strict';

    this.$$iterateComponent_(type, function(c) {
        this.$$componentsCache_[c.module] =
        this.$$componentsCache_[c.module] || {};
        this.$$componentsCache_[c.module][c.type] =
        this.$$componentsCache_[c.module][c.type] || {};

        this.$$componentsCache_[c.module][c.type][c.name] = c.data;
    });

    workular.forEach(this.$$componentsCache_, function(mod) {
        if (mod[type]) {
            Object.freeze(mod[type]);
        }
    });
};
/**
 * @private
 */
workular.Injector.prototype.$$bootstrapConstants_ =
function bootstrapConstants() {
    'use strict';

    this.$$bootstrapData_('constant');
};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapConfig_ =
function bootstrapConfigs() {
    'use strict';

    this.$$iterateComponent_('config', function(c) {
    });
};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapValues_ =
function bootstrapValues() {
    'use strict';

    this.$$bootstrapData_('constant');
};

/**
 * @param {workular.Component} p
 * @throws
 * @private
 */
workular.Injector.prototype.$$bootstrapProvider_ =
function bootstrapProvider(p) {
    'use strict';
    var that = this;

    if (this.$$dependencyStack_.indexOf(p.module + p.name) !== -1) {
        throw new Error('workular: Injector: circular dependency detected' +
                        this.$$dependencyStack_.join(' -> '));
    }
    this.$$dependencyStack_.push(p.module + p.name);

    p.args.map(function(dependency) {
        return that.$$resolveConfigDependency_(p, dependency);
    });

    this.$$dependencyStack_.pop();
};


/**
 * @private
 */
workular.Injector.prototype.$$bootstrapProviders_ =
function bootstrapProviders() {
    'use strict';

    this.$$dependencyStack_ = [];
    this.$$iterateComponent_('providers', this.$$bootstrapProvider_);
};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapProviderGets_ =
function bootstrapProviderGets() {

};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapFactoriesFilters_ =
function bootstrapFactories() {

};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapServices_ =
function bootstrapServices() {

};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapRun_ =
function bootstrapRun() {

};

/**
 * @param {workular.Component} nameDependent
 * @param {string} nameRequired
 * @private
 * @throws
 * @return {workular.Component}
 */
workular.Injector.prototype.$$resolveConfigDependencyValidator_ =
function validateFindComponent(nameDependent, nameRequired) {
    'use strict';

    var c = this.$$findComponent_(nameRequired);
    // component not found
    if (!c) {
        throw new TypeError(nameDependent.name + ' requires ' + nameRequired +
                            'which cannot be found');
    }
    // found component is not yet available
    if ((c.type !== 'constant') || (c.type !== 'provider')) {
        throw new TypeError(nameDependent.name + ' requires ' + nameRequired +
                            'which is a ' + c.type + ', and is not available' +
                            'until after the configuration phase');
    }

    return c;
};

/**
 * @param {workular.Component} nameDependent
 * @param {string} nameRequired
 * @private
 * @return {*}
 */
workular.Injector.prototype.$$resolveConfigDependency_ =
function resolveConfigDependency(nameDependent, nameRequired) {
    'use strict';

    var c = this.$$resolveConfigDependencyValidator_(nameDependent,
                                                     nameRequired);

    if (c.type === 'constant') {
        return this.$$componentsCache_[c.module][c.type][c.name];
    }
    if (this.$$providerCache_[c.module][c.name]) {
        return this.$$providerCache_[c.module][c.name];
    }
    if (c.args.length === 0) {

    }
};

/**
 * @private
 */
workular.Injector.prototype.$$resolveRuntimeDependency_ =
function resolveRuntimeDependency() {
    'use strict';

};


/**
 * @private
 */
workular.Injector.prototype.$$bootstrap_ =
function bootstrapInjector() {
    'use strict';

    this.$$bootstrapConstants_();
    this.$$bootstrapProviders_();
    this.$$bootstrapConfig_();
    this.$$bootstrapValues_();
    this.$$bootstrapProviderGets_();
    this.$$bootstrapFactoriesFilters_();
    this.$$bootstrapServices_();
    this.$$bootstrapRun_();
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
    this.$$annotationCache_[fnString] = workular.Injector.$$getArgsFromFn(fn);
    return this.$$annotationCache_[fnString];
};

/**
 * @param {function(...)} fn
 * @param {boolean=} strictDi
 * @return {Array.<string>}
 */
workular.Injector.prototype['annotate'] =
function injectorAnnotate(fn, strictDi) {
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


workular.Injector.prototype['get'] = function injectorGet(name, caller) {

};

workular.Injector.prototype['has'] = function injectorHas(name) {

};

workular.Injector.prototype['invoke'] =
function injectorInvoke(fn, context, locals) {

};

workular.Injector.prototype['instantiate'] =
function injectorInstantiate(Type, locals) {

};

/**
 * @param {function(...)} fn
 * @return {Array.<string>}
 */
workular.Injector.$$getArgsFromFn = function getArgsFromFn(fn) {
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
