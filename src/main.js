/**
 * file: main.js
 * Created by michael on 08/01/15.
 */

/*global workular */
/**
 * Namespace for putting the library together
 */
(function (global, w) {
    'use strict';

    /**
     * @param name {string}
     * @param deps {Array.<string>}
     * @return {workular.Module}
     */
    function module(name, deps) {
        return new w.Module(name, deps);
    }

    w['module'] = module;
}(this, workular));
