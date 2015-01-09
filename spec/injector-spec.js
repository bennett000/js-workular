/**
 * file: injector-spec
 * Created by michael on 09/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('Injector class', function () {
    'use strict';
    /*global workular */
    var w = workular;

    it('should throw wihtout an object dictionary', function () {
        expect(function () {
            var t = new w.Injector();
        }).toThrow();
    });

    it('should be a constructor', function () {
        expect(w.Injector({}) instanceof w.Injector).toBe(true);
        expect(new w.Injector({}) instanceof w.Injector).toBe(true);
    });
});

describe('args from function', function () {
    'use strict';

    /*global workular */
    var w = workular,
    C = w.Injector;

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