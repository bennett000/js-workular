/**
 * file: function-spec.js
 * Created by michael on 08/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */

describe('argsToArray', function () {
    'use strict';
    /*global workular */
    var w = workular;

    function testFunction() {
        return w.argsToArray(arguments);
    }

    it('should convert function arguments to an array', function () {
        expect(w.isArray(testFunction('a', 'b', false, true))).toBe(true);
    });
});

describe('workular functions - bind', function () {
    'use strict';
    /*global workular */
    var w = workular, testObj;

    beforeEach(function () {
        testObj = {
            name: 'test object',
            getName: function testGetName() {
                return this.name;
            },
            prefixName: function testPrefixName(a) {
                return a + this.name;
            },
            addNumbers: function testAddNumbers(a, b) {
                return a + b;
            }

        };
    });

    it('bind should run a given function against an object with a given ' +
       'context', function () {
        var testFn = w.bind({ name: 'test1' }, testObj.getName);
        expect(testFn()).toBe('test1');
    });

    it('bind should return the given second parameter if it is not a function',
       function () {
           expect(w.bind(null, 5)).toBe(5);
       });

    it('bind should apply third parameter as arguments, if it is available',
       function () {
           var testFn = w.bind(testObj, testObj.prefixName, 'hi ');
           expect(testFn()).toBe('hi test object');
       });

    it('bind should apply third parameter as arguments, if it is available ' +
       'as an array', function () {
        var testFn = w.bind(testObj, testObj.addNumbers, [1, 2]);
        expect(testFn()).toBe(3);
    });

    it('bind should partially apply if possible ', function () {
        var testFn = w.bind(testObj, testObj.addNumbers, 5);
        expect(testFn(3)).toBe(8);
        expect(testFn(7)).toBe(12);
        expect(testFn(0)).toBe(5);
    });

    it('bind should just forward arguments if possible', function () {
        var testFn = w.bind(testObj, testObj.addNumbers);
        expect(testFn(3, 2)).toBe(5);
    });
});

describe('core simple functions', function () {
    'use strict';
    /*global workular */
    var w = workular;

    it('identity should return the value passed in', function () {
        expect(w.identity(86)).toBe(86);
    });

    it('identity should return the value passed in, even objects', function () {
        var blah = { 1: 52323, 'say': 'so'};
        expect(w.identity(blah)).toBe(blah);
    });

    it('isDefined should return false if given undefined', function () {
        expect(w.isDefined()).toBe(false);
    });

    it('isUndefined should return true if given undefined', function () {
        expect(w.isUndefined()).toBe(true);
    });

    it('isNumber should return false if given a numeric string', function () {
        expect(w.isNumber('56')).toBe(false);
    });

    it('isNumber should return true if given a number', function () {
        expect(w.isNumber(56)).toBe(true);
    });

    it('isNaN should return true for NaN', function () {
        expect(w.isNaN(NaN)).toBe(true);
    });

    it('toNumber should conver to numbers', function () {
        expect(w.toNumber('35')).toBe(35);
    });

    it('toNumber should make falsey things zero', function () {
        expect(w.toNumber(false)).toBe(0);
        expect(w.toNumber(null)).toBe(0);
        expect(w.toNumber()).toBe(0);
        expect(w.toNumber('')).toBe(0);
        expect(w.toNumber(0)).toBe(0);
    });
});
