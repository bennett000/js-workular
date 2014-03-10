var gConsoleFunctions = [
    'log', 'info', 'warn', 'error', 'trace'
];

function MockConsole() {
    'use strict';
    var that = this;

    gConsoleFunctions.forEach(function (fn) {
        that[fn + 's'] = [];
    });
}

gConsoleFunctions.forEach(function (fn) {
    'use strict';
    MockConsole.prototype[fn] = function loggerFn() {
        this[fn + 's'].push(arguments);
    };
});