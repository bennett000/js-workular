/*global workular*/
(function (global, ns) {
    'use strict';

    if ((global[ns]) && (typeof global[ns] === 'object')) {
        global[ns] = {
            'alternates': [global[ns]]
        };
        if (Array.isArray(global[ns].alternates[0]['alternates'])) {
            global[ns].alternates.concat(global[ns].alternates[0].alternates);
        }
    } else {
        global[ns] = {
            'alternates': []
        };
    }
}(this, 'workular'));

/**
 * @const
 * @private
 */
workular['$$version'] = '0.6.0';

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
 * @package
 */
workular.componentTypes = [
    'factory', 'service', 'run', 'main', 'filter',
    'provider', 'config', 'constant', 'value'
];

workular['noop'] = function noop() {};
workular['emptyFunction'] = workular.noop;