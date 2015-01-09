/**
 * file: component-spec.js
 * Created by michael on 08/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('workular Component Class', function () {
    'use strict';
    /*global workular*/
    var C = workular.Component,
        n = workular.noop;

    it('should throw if first parameter is not a string', function () {
        expect(function () {
            var c = new C();
        }).toThrow();
    });

    it('should throw if second parameter is not a function, or Array',
       function () {
        expect(function () {
            var c = new C('hello');
        }).toThrow();
    });

    it('should throw if second parameter is not a function, or Array, with ' +
       'last, element as function', function () {
        expect(function () {
            var c = new C('hello', []);
        }).toThrow();
    });

    it('should not throw if second parameter is an Array, with last, element ' +
       'as function', function () {
        expect(function () {
            var c = new C('hello', ['a', function () {}]);
        }).not.toThrow();
    });

    it('should be a constructor', function () {
        expect(C('test', n) instanceof C).toBe(true);
        expect(new C('test', n) instanceof C).toBe(true);
    });

    it('should set its arguments value based on the function\'s $inject ' +
       'parameter', function () {
        var fn = function testFn() {}, c;
        fn.$inject = ['a', 'hello'];
        c = new C('test', fn);
        expect(c.args[0]).toBe('a');
        expect(c.args[1]).toBe('hello');
    });

    it('should start out not instantiated', function () {
        var c = new C('test', n);
        expect(c.instantiated).toBe(null);
    });

    it('getArgsFromFunction should return an empty array if parameter is a ' +
       'non function', function () {
        expect(C.getArgsFromFn().toString()).toBe([].toString());
    });

    it('getArgsFromFunction should return the second parameter\'s $inject ' +
       'attribute _if_ second parameter is a function', function () {
        var t = function () {}, vals = ['a', 52, {}, false];
        t.$inject = vals;
        expect(C.getArgsFromFn(t).toString()).toBe(vals.toString());
    });

    it('getArgsFromFunction should return parsed arguments if no $inject ' +
       'present', function () {
        var t = function (hi, hello, howAreYou) { };
        expect(C.getArgsFromFn(t).toString()).
        toBe(['hi', 'hello', 'howAreYou'].toString());
    });
});