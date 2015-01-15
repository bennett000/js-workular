/*global window, jasmine, beforeEach, describe, expect, spyOn, runs, waitsFor, it, module,inject, workular */
if (typeof module !== 'undefined' && module.exports) {
    /*global require */
    var workular = require('../src/workular.js').workular,
    global = require('../src/workular.js');
} else {
    var global = this;
}

describe('workular core', function () {
    'use strict';

    beforeEach(function() {
        workular.$$isBootstrapped = false;
    });

    function bs(modules) {
        workular.bootstrap(modules);
    }

    describe('workular', function () {
        it('should be an object', function () {
            expect(typeof workular).toBe('object');
        });
        it('should provide a module function', function () {
            expect(typeof workular.module).toBe('function');
        });
        it('should provide a newDI function', function () {
            expect(typeof workular.newDI).toBe('function');
        });
        it('should provide access to the global object through DI', function () {
            workular.module('test', []).run(function(global){});
            bs();
            expect(typeof workular.getComponent('global')).toBe('object');
            expect(workular.getComponent('global')).toBe(global);
        });
    });

    describe('isObject method', function () {
        var testValues = [
            null,
            NaN,
            function () {},
            55,
            false,
            true,
            []
        ];

        testValues.forEach(function (val) {
            it('should return false given ' + val, function () {
                expect(workular.isObject(val)).toBe(false);
            });
        });

        it('should return true given an object', function () {
            expect(workular.isObject({})).toBe(true);
            expect(workular.isObject(Object.create(null))).toBe(true);
        });
    });

    describe('isFunction method', function () {
        var testValues = [
            null,
            NaN,
            {},
            55,
            false,
            true,
            []
        ];

        testValues.forEach(function (val) {
            it('should return false given ' + val, function () {
                expect(workular.isFunction(val)).toBe(false);
            });
        });

        it('should return true given a function', function () {
            expect(workular.isFunction(workular.emptyFunction)).toBe(true);
        });
    });

    describe('isNonEmptyString method', function () {
        var testValues = [
            null,
            NaN,
            function () {},
            55,
            false,
            true,
            [],
            ''
        ];

        testValues.forEach(function (val) {
            it('should return false given ' + val, function () {
                expect(workular.isNonEmptyString(val)).toBe(false);
            });
        });

        it('should return true given a non empty string', function () {
            expect(workular.isNonEmptyString('some string')).toBe(true);
        });
    });

    describe('main method', function () {
        it('should throw if a non function is provided', function () {
            var testValues = [
                null,
                NaN,
                {},
                55,
                false,
                true,
                ''
            ];
            testValues.forEach(function (val) {
                expect(function () {
                    workular.main(val);
                }).toThrow();
            });
        });
    });

    describe('getComponent method', function () {
        it('should support multiple namespaces through the \'module\' interface', function () {
            workular.module('test1', []).factory('testFactory1', function () { return 'test1'; });
            workular.module('test2', []).factory('testFactory2', function () { return 'test2'; });
            workular.module('test3', []).run(function (testFactory1, testFactory2) {});
            bs();

            expect(workular.getComponent('testFactory1')).toBe('test1');
            expect(workular.getComponent('testFactory2')).toBe('test2');
        });
    });

});