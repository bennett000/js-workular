/**
 * file: pre-log.js
 * Created by michael on 08/01/15.
 */
/*global workular*/

/**
 * @private
 * @constructor
 */
workular.PreLog_ = function PreLog() {
    'use strict';

    /**
     *  @const
     *  @private
     *  */
    this.methods_ = ['debug', 'error', 'info', 'log', 'trace', 'warn'];

    /**
     * @type {Array.<{ method: string, args: Array}>}
     * @private
     */
    this.history_ = [];

    this.$$build_();
};

/**
 * @private
 */
workular.PreLog_.prototype.$$build_ = function build() {
    'use strict';

    var that = this;

    this.methods_.forEach(function(method) {
        that[method] = that.getMethod_(method);
    });
};

/**
 * @param {{ debug: function(...), error: function(...),
 info: function (...), log: function (...), warn: function(...) }} newLogger
 * @return {boolean}
 */
workular.PreLog_.prototype.upgrade = function upgrade(newLogger) {
    'use strict';

    var isValid = true, that = this;
    this.methods_.forEach(function(method) {
        if (!workular.isFunction(newLogger[method])) {
            isValid = false;
        }
    });

    if (!isValid) {
        return false;
    }

    this.methods_.forEach(function(method) {
        that[method] = workular.bind(newLogger, newLogger[method]);
    });

    this.history_.forEach(function(message) {
        that[message.method].apply(that, message.args);
    });

    this.history_ = [];
};

/**
 * @param {string} method
 * @return {function(...)}
 * @private
 */
workular.PreLog_.prototype.getMethod_ = function getMethod(method) {
    'use strict';
    var that = this;

    function doLog() {
        that.history_.push({
                               args: Array.prototype.slice.call(arguments, 0),
                               method: method
                           });
    }

    return doLog;
};

/**
 * @type {workular.PreLog_|*}
 */
workular.log = new workular.PreLog_();
workular['upgradeLogger'] = function upgradeLogger(newLog) {
    'use strict';
    return workular.log.upgrade(newLog);
};

/**
 * @param {Error} err
 * @private
 */
workular.$$onError_ = function onError(err) {
    'use strict';
    var msg = 'workular: uncaught error: ' + err.message + ' ==> ' + err.stack;

    if (!workular.global.console) {
        workular.log.error(msg);
    } else {
        workular.global.console.error(msg);
    }
};

workular.global.addEventListener('error', workular.$$onerror_);
