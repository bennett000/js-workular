/**
 * file: functions
 * Created by michael on 08/01/15.
 */

/*global workular*/
/**
 * @param {Arguments} args
 * @return {Array}
 */
workular['argsToArray'] = function argumentsToArray(args) {
    'use strict';

    return Array.prototype.slice.call(args, 0);
};

/**
 * @param {*} context
 * @param {function(...)} fn
 * @param {Array|*=} args
 * @return {*}
 */
workular['bind'] = function bindContext(context, fn, args) {
    'use strict';
    if (!workular.isFunction(fn)) {
        return fn;
    }

    if (!Array.isArray(args)) {
        if (args === undefined) {
            args = [];
        } else {
            args = [args];
        }
    }

    function boundFunction() {
        // if there are arguments, concatenate the arguments object
        if (args.length > 0) {
            return fn.apply(context,
                            args.concat(workular.argsToArray(arguments)));
        } else {
            return fn.apply(context, arguments);
        }
    }

    return boundFunction;
};

/**
 * @param {Array|Object} obj
 * @param {function(...)} callback
 * @param {Object=} context
 */
workular['forEach'] = function forEach(obj, callback, context) {
    'use strict';

    context = workular.isObject(context) ? context : null;

    // invalid
    if (!workular.isFunction(callback)) {
        return;
    }

    // array version
    if (workular.isArray(obj)) {
        obj.forEach(function bindForEachContext(el, i) {
            callback.call(context, el, i, obj);
        });
        return;
    }

    // invalid object
    if (!workular.isObject(obj)) {
        return;
    }

    // object version
    Object.keys(obj).forEach(function(key) {
        callback.call(context, obj[key], key, obj);
    });
};


/**
 * @param {function} Constructor
 * @param {Array} args
 * @return {?Object}
 */
workular['construct'] = function applyConstructor(Constructor, args) {
    'use strict';

    if (!workular.isFunction(Constructor)) {
        return null;
    }

    args = workular.isArray(args) ? args : [];

    if (!args.length) {
        return new Constructor();
    }
    /**
     * Temporary shell class
     * @return {AbstractLambda}
     * @constructor
     */
    function AbstractLambda() {
        return Constructor.apply(this, args);
    }

    AbstractLambda.prototype = Constructor.prototype;

    return new AbstractLambda();
};

/**
 * @param {function()} Child constructor
 * @param {function()} Parent constructor
 * @param {Array=} args
 */
workular['inherits'] = function inheritFrom(Child, Parent, args) {
    'use strict';
    if (!workular.isArray(args)) {
        args = [];
    }

    if (args.length) {
        Child.prototype = workular.construct(Child, args);
    } else {
        Child.prototype = new Parent();
    }
    Child.prototype.constructor = Child;
};

/**
 * @param {*} val
 * @return {*}
 */
workular['identity'] = function identity(val) {
    'use strict';

    return val;
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isArray'] = function isArray(val) {
    'use strict';

    return Array.isArray(val);
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isDefined'] = function isDefined(val) {
    'use strict';

    return val !== undefined;
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isFunction'] = function isFunction(val) {
    'use strict';

    return typeof val === 'function';
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isNumber'] = function isNumber(val) {
    'use strict';

    return typeof val === 'number';
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isNaN'] = function isNaN(val) {
    'use strict';

    return val !== val;
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isNonEmptyString'] = function isNonEmptyString(val) {
    'use strict';

    return workular.isString(val) && val !== '';
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular.isString = function isString(val) {
    'use strict';

    return typeof val === 'string';
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isObject'] = function isObject(val) {
    'use strict';

    return typeof val === 'object' &&
           val !== null &&
           Array.isArray(val) === false;
};

/**
 * @param {*} val
 * @return {boolean}
 */
workular['isUndefined'] = function isUndefined(val) {
    'use strict';

    return val === undefined;
};

/**
 * @param {*} val
 * @return {string}
 */
workular['toString'] = function toString(val) {
    'use strict';

    return val + '';
};

/**
 * @param {*} val
 * @return {number}
 */
workular['toNumber'] = function toNumber(val) {
    'use strict';

    return +val || 0;
};

/**
 * @param {Object} obj
 * @param {Object=} destination
 * @return {*}
 */
workular.$$copyObject = function copyObject(obj, destination) {
    'use strict';

    if (!destination) {
        destination = Object.create(obj);
    }

    workular.forEach(obj, function(val, key) {
        destination[key] = workular.copy(val);
    });

    return destination;
};

/**
 * @param {*} source
 * @param {Object=} destination
 * @throws
 * @this {*}
 */
workular.$$validateCopy = function validateCopy(source, destination) {
    'use strict';

    if ((source === workular.global) || (source === this)) {
        throw new Error('workular cannot copy the global object');
    }
    if (destination === undefined) { return; }
    if (source === destination) {
        throw new Error('workular cannot copy something to itself');
    }

};

/**
 * NOTE THIS FUNCTION IS NOT THE SAME AS angular.copy
 * @param {*} source
 * @param {*=} destination
 * @return {*}
 */
workular['copy'] = function copy(source, destination) {
    'use strict';
    workular.$$validateCopy(source, destination);
    if (workular.isObject(source)) {
        return workular.$$copyObject(source, destination ||
                                             Object.create(source));
    }

    if (workular.isArray(source)) {
        return source.map(function(el) {
            return workular.copy(el);
        });
    }
    return source;
};

