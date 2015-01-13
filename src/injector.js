/**
 * file: injector.js
 * Created by michael on 08/01/15.
 */

/*global workular*/

/**
 * @param {Object.<string, workular.Module>} modules dictionary
 * @param {boolean=} strictDi
 * @return {workular.Injector}
 * @throws
 * @extends {workular.Object}
 * @constructor
 */
workular.Injector = function Injector(modules, strictDi) {
    'use strict';

    if (!(this instanceof Injector)) {
        return new Injector(modules);
    }

    if (!workular.isObject(modules)) {
        throw new TypeError('Injector requires modules dictionary');
    }

    /** @type {boolean} @private */
    this.$$strictDi_ = false;
    if (strictDi === true) {
        this.$$strictDi_ = true;
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
    this.$$componentsCache_ = {
        'auto': workular.module('auto', [])
    };
    // seed $provide
    this.$$componentsCache_['auto']['factory']['$provide'] =
    this.$$componentsCache_['auto'];
    // seed $inject
    this.$$componentsCache_['auto']['factory']['$inject'] = this;

    /**
     * @dict
     * @private
     */
    this.$$providerCache_ = {};
    this.$$providerCache_['$provide'] =
    this.$$componentsCache_['auto']['factory']['$provide'];

    // initialize
    this.$$checkDependencies_();
    this.$$bootstrap_();
};

workular.inherits(workular.Injector, workular.Object);

/** @const */
workular.Injector.prototype.PROVIDER_POSTFIX = 'Provider';

/**
 * @param {Object.<string, Array.<string>>} hashOfArrays
 * @throws
 * @private
 * @return {Array}
 */
workular.Injector.prototype.$$orderDependencies_ =
function orderDependencies(hashOfArrays) {
    'use strict';
    var result = [],
        checked = {},
        ancestors = [];

    workular.forEach(hashOfArrays, function hashIterator(row, key) {
        // skip rows that have already been checked
        if (checked[key]) { return; }
        // stack up lineage to check circular dependencies
        ancestors.push(key);
        // mark row as checked
        checked[key] = true;

        // check each requirement too
        row.forEach(function rowIterator(requirement) {
            if (!requirement) {
                // skip falsey values silently
                return;
            }
            if (ancestors.indexOf(requirement) > -1) {
                throw new Error('workular: Injector: circular dependency ' +
                                'found: ' + key + ' -> ' + requirement);
            }
            if (checked[requirement]) { return; }
            if (!hashOfArrays[requirement]) {
                throw new ReferenceError('workular: Inject: unable to ' +
                                         'resolve: ' + requirement);
            }
            hashIterator(hashOfArrays[requirement], requirement);
        });

        // add result, and fix up the stack
        result.push(key);
        ancestors.pop();
    });

    return result;
};

/**
 * @param {string} component
 * @param {function(...)} callback
 * @private
 */
workular.Injector.prototype.$$iterateComponent_ =
function iterateComponent(component, callback) {
    'use strict';

    if (!workular.isFunction(callback)) {
        return;
    }

    if (workular.componentTypes.indexOf(component) === -1) {
        return;
    }

    workular.forEach(this.$$modules_, function(module) {
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
workular.Injector.prototype.$$bootstrapValues_ =
function bootstrapValues() {
    'use strict';

    this.$$bootstrapData_('constant');
};


/**
 * @param {string} a
 * @return {string}
 * @private
 */
workular.Injector.prototype.$$postFixProvider_ = function postFixProvider(a) {
    'use strict';

    return a + this.PROVIDER_POSTFIX;
};

/**
 * @return {Object.<string, Array.<string>>}
 * @private
 */
workular.Injector.prototype.$$getProviderDependencies_ =
function getProviderDependencies() {
    'use strict';

    /** @type {Object.<string, Array.<string>>} */
    var dependencies = {};

    this.$$iterateComponent_('constant', function(p) {
        if (dependencies[p.name]) {
            workular.log.warn('workular: duplicate component name: ', p.name);
        }
        dependencies[p.name] = [];
    });

    this.$$iterateComponent_('provider', function(p) {
        var providerName = this.$$postFixProvider_(p.name);
        if (dependencies[providerName]) {
            workular.log.warn('workular: duplicate component name: ', p.name);
        }
        if (p.data) {
            dependencies[providerName] = [];
        }

        dependencies[providerName] = this.annotate(p.fn, this.$$strictDi_);
    });

    return dependencies;
};

/**
 * @param {string} name
 * @return {*}
 * @private
 */
workular.Injector.prototype.$$mapProviderDependency_ = function(name) {
    'use strict';
    if (!name) { return; }
    if (this.$$providerCache_[name]) {
        return this.$$providerCache_[name];
    }
    var dc = this.$$findComponent_(name);
    return this.$$componentsCache_[dc.module][dc.type][dc.name];
};

/**
 * @param {workular.Component} c
 * @return {Object}
 * @private
 */
workular.Injector.prototype.$$constructProvider_ =
function constructProvider(c) {
    'use strict';

    var that = this,
        args;

    c.fn['$inject'] = this.annotate(c.fn, this.$$strictDi_);
    args = c.fn['$inject'].map(function(name) {
        return that.$$mapProviderDependency_(name);
    });

    return workular.construct(c.fn, args);
};

/**
 * @param {{$get: function(...)}} p
 * @return {function(...)}
 * @private
 */
workular.Injector.prototype.$$validateProvider_ = function validateProvider(p) {
    'use strict';

    /** @type {?function(...)} */
    var fn = workular.Component.prototype.$$functionOrArray_(p['$get']);

    if (!workular.isFunction(fn)) {
        throw new TypeError('workular: Injector: providers must have a ' +
                            '$get method');
    }

    return fn;
};

/**
 * @param {workular.Component} component
 * @param {string} nameFull
 * @throws
 * @private
 */
workular.Injector.prototype.$$bootstrapProviderFunction_ =
function bootstrapProviderFn(component, nameFull) {
    'use strict';

    if (!workular.isFunction(component.fn)) {
        throw new ReferenceError('workular: Injector: provider component ' +
                                 'incorrectly setup');
    }
    this.$$providerCache_[nameFull] = this.$$constructProvider_(component);
    var fn = this.$$validateProvider_(this.$$providerCache_[nameFull]);
    // register factory function
    this.$$providerCache_['$provide'].factory(component.name, fn);
};

/**
 * @param {workular.Component} component
 * @param {string} nameFull
 * @private
 */
workular.Injector.prototype.$$bootstrapProviderObject_ =
function bootstrapProviderObject(component, nameFull) {
    'use strict';
    var fn = this.$$validateProvider_(component.data);
    // store provider
    this.$$providerCache_[nameFull] = component.data;
    // register factory function
    this.$$providerCache_['$provide'].factory(component.name, fn);
};

/**
 * @param {string} name
 * @private
 */
workular.Injector.prototype.$$bootstrapProvider_ =
function bootstrapProvider(name) {
    'use strict';
    /** @type {workular.Component} */
    var component,
    /** @type {string} */
    nameFull = name,
    /** @type {number} */
    postfixStart;

    postfixStart = name.indexOf(this.PROVIDER_POSTFIX);
    if (postfixStart === -1) {
        return;
    }
    name = name.slice(0, postfixStart);
    component = this.$$findComponent_(name);

    if (workular.isObject(component.data)) {
        this.$$bootstrapProviderObject_(component, nameFull);
        return;
    }
    this.$$bootstrapProviderFunction_(component, nameFull);
};

/**
 * @param {workular.Component} component
 * @throws
 * @private
 */
workular.Injector.prototype.$$bootstrapConfigFn_ =
function bootstrapConfigFn(component) {
    'use strict';
    var that = this;

    if (!workular.isFunction(component.fn)) {
        throw new ReferenceError('workular: Injector: config component ' +
                                 'incorrectly setup');
    }
    component.fn['$inject'] = this.annotate(component.fn, this.$$strictDi_);

    component.fn.apply(null, component.fn['$inject'].map(function(name) {
        return that.$$mapProviderDependency_(name);
    }));
};


/**
 * @private
 */
workular.Injector.prototype.$$bootstrapProviders_ =
function bootstrapProviders() {
    'use strict';

    // assemble dependency list
    // sort dependency list
    // instantiate/assemble
    var dependencies = this.$$getProviderDependencies_(),
        orderedDependencies = this.$$orderDependencies_(dependencies);
    workular.forEach(orderedDependencies, this.$$bootstrapProvider_, this);
};

/**
 * @private
 */
workular.Injector.prototype.$$bootstrapConfig_ =
function bootstrapConfigs() {
    'use strict';

    // providers all exist, give them out
    this.$$iterateComponent_('config', this.$$bootstrapConfigFn_);
};


/**
 * @private
 */
workular.Injector.prototype.$$bootstrapRun_ =
function bootstrapRun() {

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

/**
 * @param {Function} Type
 * @param {Object=} locals
 * @return {Object}
 */
workular.Injector.prototype['instantiate'] =
function injectorInstantiate(Type, locals) {
    'use strict';
    locals = locals || {};
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
