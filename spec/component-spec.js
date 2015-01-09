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

    it('should force fn.$inject to be an array of arguments' +
       'parameter', function () {
        var fn = function testFn() {}, c;
        fn.$inject = ['a', 'hello'];
        c = new C('test', fn);
        expect(c.fn.$inject[0]).toBe('a');
        expect(c.fn.$inject[1]).toBe('hello');
    });

});