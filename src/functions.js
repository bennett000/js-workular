/**
 * file: functions
 * Created by michael on 08/01/15.
 */

/*global workular*/
/**
 * @param args {Arguments}
 * @returns {Array}
 */
workular['argsToArray'] = function argumentsToArray(args) {
    'use strict';

    return Array.prototype.slice.call(args, 0);
};

/**
 * @param context {*}
 * @param fn {function(...)}
 * @param args {Array|*=}
 * @return {*}
 */
workular['bind'] = function bindContext(context, fn, args) {
    'use strict';
    if (!workular.isFunction(fn)) {
        return fn;
    }

    if (!Array.isArray(args)) {
        if (args === undefined) {
            args = []
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
 * @param val {*}
 * @return {*}
 */
workular['identity'] = function identity(val) {
    'use strict';

    return val;
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isArray'] = function isArray(val) {
    'use strict';

    return Array.isArray(val);
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isDefined'] = function isDefined(val) {
    'use strict';

    return val !== undefined;
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isFunction'] = function isFunction(val) {
    'use strict';

    return typeof val === 'function';
};

workular['isNumber'] = function isNumber(val) {
    'use strict';

    return typeof val === 'number';
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isNaN'] = function isNaN(val) {
    'use strict';

    return val !== val;
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isNonEmptyString'] = function isNonEmptyString(val) {
    'use strict';

    return workular.isString(val) && val !== '';
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular.isString = function isString(val) {
    'use strict';

    return typeof val === 'string';
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isObject'] = function isObject(val) {
    'use strict';

    return typeof val === 'object' &&
           val !== null &&
           Array.isArray(val) === false;
};

/**
 * @param val {*}
 * @return {boolean}
 */
workular['isUndefined'] = function isUndefined(val) {
    'use strict';

    return val === undefined;
};

/**
 * @param val {*}
 * @return {string}
 */
workular['toString'] = function toString(val) {
    'use strict';

    return val + '';
};

/**
 * @param val {*}
 * @return {number}
 */
workular['toNumber'] = function toNumber(val) {
    'use strict';

    return +val || 0;
};
