/**
 * file: workular-timers
 * Created by michael on 10/03/14.
 */

/*global workular, setTimeout, setInterval*/
workular.module('$timers').factory('$immediate', [function () {

    }]).factory('$setTimeout', ['$immediate', function ($immediate) {
        'use strict';

        /**
         *
         * @param fn
         * @param delay
         */
        function timeout(fn, delay) {
            delay = +delay;
            if (delay === 0) {
                $immediate(fn);
                return;
            }
            if (delay < 0) { delay *= -1; }
            setTimeout(fn, delay);
        }

        timeout.cancel = function cancelTimeout() {

        };

        return Object.create(null, {
            timeout: {
                value: timeout,
                enumerable: true,
                configurable: false
            }
        });
    }]);