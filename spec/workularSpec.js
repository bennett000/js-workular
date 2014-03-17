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
                ''
            ];
            testValues.forEach(function (val) {
                expect(function () {
                    workular.main(val);
                }).toThrow();
            });
        });

        it ('should invoke a given function', function () {
            var done = false, testVal;

            workular.main(function () {
                testVal = 5;
                done = true;
            });

            waitsFor(function () {
                return done;
            });

            runs(function() {
                expect(testVal).toBe(5);
                done = false;
            });
        });

        it ('should have injectable dependenceis', function () {
            var done = false, p1, p2;

            workular.module('test3').factory('testFactory3', function () { return 'test3'; });
            workular.module('test4').factory('testFactory4', function () { return 'test4'; });

            workular.main(['testFactory3', 'testFactory4', function (a, b) {
                p1 = a;
                p2 = b;
                done = true;
            }]);

            waitsFor(function () {
                return done;
            });

            runs(function () {
                expect(p1).toBe('test3');
                expect(p2).toBe('test4');
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

    describe('test workular module dependency resolution', function () {
        it('should allow nested modules to resolve dependencies from the parent dependency injector', function () {
            var done = false;

            workular.module('test5').factory('testFactory5', function () { return 'test5'; });
            workular.module('test6').factory('testFactory6', [function () { return 'test6'; }]);
            workular.module('test7').factory('testFactory7', ['testFactory5', 'testFactory6', function (t5, t6) {
                expect(t5).toBe('test5');
                expect(t6).toBe('test6');
                return 'test7';
            }]);

            workular.main(['testFactory7', function (t7) {
                expect(t7).toBe('test7');
                done = true;
            }]);

            waitsFor(function () {
                return done;
            });

            runs(function () {
            });
        });
    });
});