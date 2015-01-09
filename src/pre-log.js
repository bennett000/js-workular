/**
 * file: pre-log.js
 * Created by michael on 08/01/15.
 */
/*global workular*/

/**
 * @private
 * @constructor
 */
workular.PreLog = function PreLog() {
    'use strict';

    /**
     *  @const
     *  @private
     *  */
    this.methods = ['debug', 'error', 'info', 'log', 'trace', 'warn'];

    /**
     * @type {Array.<{ method: string, args: Array}>}
     * @private
     */
    this.history = [];

    this.$$build();
};

/**
 * @private
 */
workular.PreLog.prototype.$$build = function build() {
    'use strict';

    var that = this;

    this.methods.forEach(function (method) {
        that[method] = that.getMethod(method);
    });
};

/**
 * @param newLogger {{ debug: function(...), error: function(...),
 info: function (...), log: function (...), warn: function(...) }}
 * @return {boolean}
 */
workular.PreLog.prototype.upgrade = function upgrade(newLogger) {
    'use strict';

    var isValid = true, that = this;
    this.methods.forEach(function (method) {
        if (!workular.isFunction(newLogger[method])) {
            isValid = false;
        }
    });

    if (!isValid) {
        return false;
    }

    this.methods.forEach(function (method) {
        that[method] = workular.bind(newLogger, newLogger[method]);
    });

    this.history.forEach(function (message) {
        that[message.method].apply(that, message.args);
    });

    this.history = [];
};

/**
 * @param method {string}
 * @return {function(...)}
 * @private
 */
workular.PreLog.prototype.getMethod = function getMethod(method) {
    'use strict';
    var that = this;

    function doLog() {
        that.history.push({
                              args: Array.prototype.slice.call(arguments, 0),
                              method: method
                          });
    }

    return doLog;
};

/**
 * @type {workular.PreLog|*}
 */
workular.log = new workular.PreLog();

