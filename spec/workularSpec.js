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

    describe('workular', function () {
        it('should be an object', function () {
            expect(typeof workular).toBe('object');
        });
        it('should provide a module function', function () {
            expect(typeof workular.module).toBe('function');
        });
        it('should provide a factory function', function () {
            expect(typeof workular.factory).toBe('function');
        });
        it('should provide a newDI function', function () {
            expect(typeof workular.newDI).toBe('function');
        });
        it('should provide a main function', function () {
            expect(typeof workular.main).toBe('function');
        });
        it('should provide access to the global object through DI', function () {
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
                [],
                ''
            ];
            testValues.forEach(function (val) {
                expect(function () {
                    workular.main(val);
                }).toThrow();
            });
        });

        it ('should invoke a given function', function () {
            var done = false;

            workular.main(function () {
                done = true;
            });

            waitsFor(function () {
                return done;
            });

            runs(function() {
                expect(true).toBe(true);
            });
        });
    });

    describe('getComponent method', function () {
        it('should support multiple namespaces through the \'module\' interface', function () {
            workular.module('test1').factory('testFactory1', function () { return 'test1'; });
            workular.module('test2').factory('testFactory2', function () { return 'test2'; });

            expect(workular.getComponent('testFactory1')).toBe('test1');
            expect(workular.getComponent('testFactory2')).toBe('test2');
        });
    });

    describe('getComponentRaw method', function () {
        it('should support multiple namespaces through the \'module\' interface', function () {
            var test1 = function () { return 'test1'; },
            test2 = [function () { return 'test2'; }];

            workular.module('test1').factory('testFactory1', test1);
            workular.module('test2').factory('testFactory2', test2);

            expect(workular.getComponentRaw('testFactory1').toString()).toBe(test1.toString());
            expect(workular.getComponentRaw('testFactory2').toString()).toBe(test2.toString());
        });
    });
});