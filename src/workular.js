/*global workular*/
(function(global, ns) {
    'use strict';

    if ((global[ns]) && (typeof global[ns] === 'object')) {
        global[ns] = {
            'alternates': [global[ns]],
            'global': global
        };
        if (Array.isArray(global[ns].alternates[0]['alternates'])) {
            global[ns].alternates.concat(global[ns].alternates[0].alternates);
        }
    } else {
        global[ns] = {
            'alternates': [],
            'global': global
        };
    }
}(this, 'workular'));

/**
 * @const
 */
workular.$$version = '0.6.0';

/**
 * @const
 */
workular['version'] = {
    full: workular.$$version,
    major: workular.$$version.split('.')[0],
    minor: workular.$$version.split('.')[1],
    dot: workular.$$version.split('.')[2],
    codeName: 'Compliant Kickoff'
};

/**
 * @const
 */
workular.componentTypes = [
    'factory', 'service', 'run', 'main', 'filter',
    'provider', 'config', 'constant', 'value'
];

/**
 * @const
 */
workular.componentsAnonymous = [
    'run', 'main', 'config'
];

/**
 * @const
 */
workular.componentsData = [
    'value', 'constant'
];

workular['noop'] = function noop() {};
workular['emptyFunction'] = workular.noop;

/**
 * root workular object
 * @return {Object}
 * @constructor
 */
workular['Object'] = function WorkularObject() {
    'use strict';

    if (!(this instanceof WorkularObject)) {
        return new WorkularObject();
    }
};
