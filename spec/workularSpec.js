/*global window, jasmine, beforeEach, describe, expect, spyOn, runs, waitsFor, it, module,inject, workular */

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
            expect(workular.getComponent('global')).toBe(window);
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
});