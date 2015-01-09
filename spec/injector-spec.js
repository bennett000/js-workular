/**
 * file: injector-spec
 * Created by michael on 09/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('Injector class', function () {
    'use strict';
    /*global workular */
    var w = workular,
        I = w.Injector;

    it('should throw wihtout an object dictionary', function () {
        expect(function () {
            var t = new w.Injector();
        }).toThrow();
    });

    it('should be a constructor', function () {
        expect(w.Injector({}) instanceof w.Injector).toBe(true);
        expect(new w.Injector({}) instanceof w.Injector).toBe(true);
    });

    it('annotate strict should return a function\'s $inject array',
       function () {
           var test = function test(z, x, y, p, r, q, t) {};
           test.$inject = ['a', 'b', 'c', 5];
           expect(I.prototype.annotate(test, true).toString()).
           toBe(test.$inject.toString());
       });

    it('annotate strict should return an array',
       function () {
           var test = function test() {};
           expect(I.prototype.annotate(test, true).toString()).
           toBe([].toString());
       });

    it('annotate should prefer fn.$inject to argument parsing', function () {
        var test = function test(z, r, w, d, e, o, l) {};
        test.$inject = ['a', 'b', 'c', 5];
        expect(I.prototype.annotate(test).toString()).
        toBe(test.$inject.toString());
    });

    it('annotate should parse functions when all else fails', function () {
        var test = function test(a, b, c) {};
        expect(I.prototype.annotate(test).toString()).
        toBe(['a', 'b', 'c'].toString());
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

    it('getArgsFromFunction should return parsed arguments if no $inject ' +
       'present', function () {
        var t = function (hi, hello, howAreYou) { };
        expect(C.getArgsFromFn(t).toString()).
        toBe(['hi', 'hello', 'howAreYou'].toString());
    });
});

