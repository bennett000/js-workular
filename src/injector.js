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
    this.$$strictDi_ = strictDi === true ? strictDi : false;

    /**
     * @type {Object.<string, workular.Module>}
     * @private
     */
    this.$$modules_ = workular.copy(modules);
    /**
     * @dict
     * @private
     */
    this.$$annotationCache_ = {};
    this.$$auto = workular.module('auto', []);
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
    this.$$initialize_();
};

workular.inherits(workular.Injector, workular.Object);

/** @const */
workular.Injector.prototype.PROVIDER_POSTFIX = 'Provider';

/**
 * @private
 */
workular.Injector.prototype.$$initialize_ = function initInjector() {
    'use strict';

    // seed $provide
    this.$$cc_('auto', 'factory', '$provide', this.$$auto);
    // seed $inject
    this.$$cc_('auto', 'factory', '$inject', this);

    this.$$providerCache_['$provide'] =
    this.$$cc_('auto', 'factory', '$provide');

    // initialize
    this.$$checkDependencies_();
};

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
            throw new TypeError('workular: module: ' + name +
                                ' requires' + requiredModule + ' but',
                                requiredModule + ' not found');
        }, this);
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
        this.$$cc_(c.module, c.type, c.name, c.data);
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

    this.$$bootstrapData_('value');
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
 * @param {Array.<string>} names
 * @return {Object.<string, Array.<string>>}
 * @private
 */
workular.Injector.prototype.$$getRuntimeDependencies_ =
function getRuntimeDependencies(names) {
    'use strict';

    /** @type {Object.<string, Array.<string>>} */
    var dependencies = {};

    workular.forEach(names, function(name) {
        if (!name) {
            return;
        }
        var c = this.$$findComponent_(name);
        if (!c) {
            throw new Error('component not found: ' + name + ' ' + typeof name);
        }
        // annotate functions
        if (workular.componentsData.indexOf(c.type) > -1) {
            dependencies[name] = [];
        } else {
            dependencies[name] = this.annotate(c.fn, this.$$strictDi_);
        }
    }, this);

    return dependencies;
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
 * @return {*|undefined}
 * @private
 */
workular.Injector.prototype.$$findRuntimeComponent_ =
function findRuntimeComponent(name) {
    'use strict';
    var result;

    workular.forEach(this.$$componentsCache_, function(module) {
        if (result) { return; }
        workular.forEach(workular.componentsRuntime, function(cName) {
            if (result) {
                return;
            }
            if (!module[cName]) {
                return;
            }
            if (module[cName][name]) {
                result = module[cName][name];
            }
        });
    }, this);

    return result;
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
    return this.$$cc_(dc.module, dc.type, dc.name);
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
    'use strict';

    this.$$iterateComponent_('run', function(c) {
        c.fn['$inject'] = this.annotate(c.fn, this.$$strictDi_);
        this.invoke(c.fn);
    });

    this.$$iterateComponent_('main', function(c) {
        c.fn['$inject'] = this.annotate(c.fn, this.$$strictDi_);
        this.invoke(c.fn);
    });
};

/**
 * Kickstart the injector
 */
workular.Injector.prototype.$$bootstrap =
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

/**
 * @param {string} module
 * @param {string} type
 * @param {string} name
 * @param {*=} value
 * @return {*}
 * @private
 */
workular.Injector.prototype.$$cc_ =
function componentCacheAccessor(module, type, name, value) {
    'use strict';

    if (!this.$$componentsCache_[module]) {
        this.$$componentsCache_[module] = {};
    }
    if (!this.$$componentsCache_[module][type]) {
        this.$$componentsCache_[module][type] = {};
    }

    if (value === undefined) {
        return this.$$componentsCache_[module][type][name];
    }

    // @todo warn if overwriting
    this.$$componentsCache_[module][type][name] = value;
    return this.$$componentsCache_[module][type][name];
};


/**
 * @param {workular.Component} c
 * @return {*}
 * @throws
 * @private
 */
workular.Injector.prototype.$$assembleComponent_ =
function assembleComponent(c) {
    'use strict';
    if ((c.type === 'factory') || (c.type === 'filter')) {
        c.fn['$inject'] = this.annotate(c.fn, this.$$strictDi_);
        this.$$cc_(c.module, c.type, c.name, this.invoke(c.fn));
    } else if (c.type === 'service') {
        c.fn['$inject'] = this.annotate(c.fn, this.$$strictDi_);
        return this.$$cc_(c.module, c.type, c.name, this.instantiate(c.fn));
    } else if (workular.componentsData.indexOf(c.type) > -1) {
        return this.$$cc_(c.module, c.type, c.name);
    } else {
        throw new Error('workular: Injector: unexpected error');
    }
};

/**
 * @param {string} name
 * @return {*}
 * @throws
 * @private
 */
workular.Injector.prototype.$$findAndAssembleComponent_ =
function findAndAssembleComponent(name) {
    'use strict';

    var c = this.$$findComponent_(name);
    if (!c) {
        // @todo warn?
        return null;
    }
    return this.$$assembleComponent_(c);
};

/**
 * @param {string} name
 * @return {*}
 * @this {workular.Injector}
 */
workular.Injector.prototype['get'] = function injectorGet(name) {
    'use strict';

    var result = this.$$findRuntimeComponent_(name);
    if (result) {
        return result;
    }

    return this.$$findAndAssembleComponent_(name);
};

/**
 * @param {string} name
 * @return {boolean}
 * @this {workular.Injector}
 */
workular.Injector.prototype['has'] = function injectorHas(name) {
    'use strict';

    return this.$$findComponent_(name) ? true : false;
};

/**
 * @param {function(...)} fn
 * @param {*=} context
 * @param {Object=} locals
 * @return {*}
 * @this {workular.Injector}
 */
workular.Injector.prototype['invoke'] =
function injectorInvoke(fn, context, locals) {
    'use strict';

    context = context || null;
    locals = locals || {};

    var that = this,
        dependencies = this.$$getRuntimeDependencies_(fn['$inject']),
        args = this.$$orderDependencies_(dependencies).
        map(function(dep) {
                return that.get(dep);
            });

    workular.forEach(locals, function(local, key) {
        var index = fn['$inject'].indexOf(key);
        if (index > -1) {
            args[index] = local;
        }
    });

    return fn.apply(context, args);
};

/**
 * @param {Function} Type
 * @param {Object=} locals
 * @return {Object}
 * @this {workular.Injector}
 */
workular.Injector.prototype['instantiate'] =
function injectorInstantiate(Type, locals) {
    'use strict';

    locals = locals || {};

    var dependencies = this.$$getRuntimeDependencies_(Type['$inject']),
        args = this.$$orderDependencies_(dependencies).
        map(function(dep) {
                return this.get(dep);
            });

    workular.forEach(locals, function(local, key) {
        var index = Type['$inject'].indexOf(key);
        if (index > -1) {
            args[index] = local;
        }
    });

    return workular.construct(Type, args);
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
