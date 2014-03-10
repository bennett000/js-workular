function getMockConsole() {
    'use strict';

    return Object.create(null, {
        logs: [],
        infos: [],
        warns: [],
        errors: [],
        traces: [],
        log: {
            value: function () {
                this.logs.push(arguments);
            }
        },
        info: {
            value: function () {
                this.infos.push(arguments);
            }
        },
        warn: {
            value: function () {
                this.warns.push(arguments);
            }
        },
        error: {
            value: function () {
                this.errors.push(arguments);
            }
        },
        trace: {
            value: function () {
                this.traces.push(arguments);
            }
        }
    });
};