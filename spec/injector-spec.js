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
           var test = function test(z, x, y, p, r, q, t) {},
               i = new I({});
           test.$inject = ['a', 'b', 'c', 5];
           expect(i.annotate(test, true).toString()).
           toBe(test.$inject.toString());
       });

    it('annotate strict should return an array',
       function () {
           var test = function test() {},
               i = new I({});
           expect(i.annotate(test, true).toString()).
           toBe([].toString());
       });

    it('annotate should prefer fn.$inject to argument parsing', function () {
        var test = function test(z, r, w, d, e, o, l) {},
            i = new I({});
        test.$inject = ['a', 'b', 'c', 5];
        expect(i.annotate(test).toString()).
        toBe(test.$inject.toString());
    });

    it('annotate should parse functions when all else fails', function () {
        var test = function test(a, b, c) {},
            i = new I({});
        expect(i.annotate(test).toString()).
        toBe(['a', 'b', 'c'].toString());
    });

    it('iterate component should return if no callback given', function () {
        var i = new I({});
        spyOn(workular, 'forEach');
        expect(i.$$iterateComponent('asdf')).toBeUndefined();
        expect(workular.forEach).not.toHaveBeenCalled();
    });

    it('iterate component should return if first parameter not in ' +
       'workular.componentTypes', function () {
        var i = new I({});
        spyOn(workular, 'forEach');
        expect(i.$$iterateComponent('asdf', w.noop)).toBeUndefined();
        expect(workular.forEach).not.toHaveBeenCalled();
    });

    it('iterate component should use the injector\'s context', function () {
        var i = new I({ testMod: new w.Module('testMod').config(function () {

            })}),
            isDone = false;
        i.$$iterateComponent('config', function () {
            expect(this).toBe(i);
            isDone = true;
        });
        expect(isDone).toBe(true);
    });

    it('iterate component should work across multiple modules', function () {
        var i = new I({
                          testMod1: new w.Module('testMod1').config(w.noop),
                          testMod2: new w.Module('testMod2').config(w.noop),
                          testMod3: new w.Module('testMod3').config(w.noop),
                          testMod4: new w.Module('testMod4').config(w.noop),
                          testMod5: new w.Module('testMod5').config(w.noop)
                      }),
            count = 0;
        i.$$iterateComponent('config', function () { count += 1; });
        expect(count).toBe(5);
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

