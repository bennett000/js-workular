/**
 * file: component-spec.js
 * Created by michael on 08/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('workular Component Class', function() {
    'use strict';
    /*global workular*/
    var C = workular.Component,
        n = workular.noop;

    it('should throw if first parameter is not in componentTypes', function() {
        expect(function() {
            var c = new C();
        }).toThrow();
    });

    it('should throw if name is not a string (when type is not config/run)',
       function() {
           expect(function() {
               var c = new C('factory', ['hah']);
           }).toThrow();
       });

    it('should throw if second parameter is not a function, or Array, with ' +
       'last, element as function, (when type is config/run', function() {
        expect(function() {
            var c = new C('config', ['fail']);
        }).toThrow();
    });

    it('should throw if third parameter is not a function, or Array, with ' +
       'last, element as function, (when type is not config/run', function() {
        expect(function() {
            var c = new C('factory', 'testme', []);
        }).toThrow();
    });

    it('should not throw if second parameter is an Array, with last, element ' +
       'as function (config/run)', function() {
        expect(function() {
            var c = new C('config', ['a', function() {}]);
        }).not.toThrow();
    });

    it('should not throw if third parameter is an Array, with last, element ' +
       'as function (not config/run)', function() {
        expect(function() {
            var c = new C('service', 'testme', ['a', function() {}]);
        }).not.toThrow();
    });

    it('should be a constructor', function() {
        expect(C('config', n) instanceof C).toBe(true);
        expect(new C('config', n) instanceof C).toBe(true);
    });

    it('should be a workular Object ', function() {
        expect(C('config', n) instanceof workular.Object).toBe(true);
    });

    it('should force fn.$inject to be an array of arguments' +
       'parameter', function() {
        var fn = function testFn() {}, c;
        fn.$inject = ['a', 'hello'];
        c = new C('config', fn);
        expect(c.fn.$inject[0]).toBe('a');
        expect(c.fn.$inject[1]).toBe('hello');
    });

    it('should store anything as data (value/constant)', function() {
        var c = new C('constant', 'testme', null);
        expect(c.data).toBe(null);
        c = new C('constant', 'testme', [5, 6]);
        expect(c.data.toString()).toBe([5, 6].toString());
    });
});