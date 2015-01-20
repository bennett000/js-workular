/**
 * file: workular-mock.js
 * Created by michael on 15/01/15.
 */

/*global workular*/
function wmodule(modules) {
    'use strict';

    workular.$$reset();
    workular.bootstrap(modules);
}

function winject(fn) {
    'use strict';
    if (!workular.isFunction(fn)) {
        throw new TypeError('workular: injector expects a function');
    }

    function injectionWrapper() {
        fn['$inject'] = workular.$$injector.annotate(fn);
        return workular.$$injector.invoke(fn);
    }
    return injectionWrapper;
}
