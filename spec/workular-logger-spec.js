/**
 * file: workularLoggerSpec
 * Created by michael on 10/03/14
 */

/*global window, jasmine, beforeEach, describe, expect, spyOn, runs, it, module,inject, workular, MockConsole */
if (typeof module !== 'undefined' && module.exports) {
    /*global require */
    var MockConsole = require('./mock-console.js').MockConsole,
    workular = require('../src/workular.js').workular;
}

describe('workular preLogger', function () {
    'use strict';
    var log, mockLog;
    beforeEach(function () {
        //log = workular.newPreLogger();
        log = new workular.PreLog_();
    });

    describe('API', function () {
        it('should be an object', function () {
            expect(workular.isObject(log)).toBe(true);
        });
        it('should provide a basic log function', function () {
            expect(workular.isFunction(log.log));
        });
        it('should provide a basic info function', function () {
            expect(workular.isFunction(log.info));
        });
        it('should provide a basic warn function', function () {
            expect(workular.isFunction(log.warn));
        });
        it('should provide a basic error function', function () {
            expect(workular.isFunction(log.error));
        });
        it('should provide a basic trace function', function () {
            expect(workular.isFunction(log.trace));
        });
        it('should provide an upgrade function', function () {
            expect(workular.isFunction(log.upgrade));
        });
    });

    it('should dump its buffers once exported', function () {
        var nameSpaces = ['log', 'info', 'warn', 'error', 'trace'], testData = {};

        // setup test data
        function getRandomOutput() {
            var output = [{}, false, true, 'pizza', 51352.22, NaN, null];
            return output[Math.floor(Math.random() * output.length)];
        }
        function getRandomLogs() {
            var args = Math.floor(Math.random() * 5) + 1,
                rArray = [], i;
            if (args === 4) {
                args = 1;
            }
            if (args === 5) {
                args = 1;
            }
            for (i = 0; i < args; i += 1) {
                rArray.push(getRandomOutput());
            }
            return rArray;
        }

        nameSpaces.forEach(function (ns) {
            function getSet() {
                var logs = getRandomLogs();
                return {
                    length: logs.length,
                    nameSpace: ns,
                    logs: logs
                };
            }

            var i, limit = Math.floor(Math.random() * 25), rArray = [];

            for (i = 0; i < limit; i += 1) {
                rArray.push(getSet());
            }

            testData[ns] = rArray;
        });

        // do the logging
        nameSpaces.forEach(function (ns) {
            testData[ns].forEach(function (logs) {
                log[ns].apply(null, logs);
            });
        });

        // upgrade
        mockLog = new MockConsole();
        log.upgrade(mockLog);

        // validate
        expect(log.history_.length).toBe(0);
        //nameSpaces.forEach(function (ns) {
        //    expect(log[ns + 's'].length).toBe(testData[ns].length);
        //});
    });

});