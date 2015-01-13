/**
 * file: injector-spec
 * Created by michael on 09/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('Injector class', function() {
    'use strict';
    /*global workular */
    var w = workular,
        I = w.Injector;

    it('should throw wihtout an object dictionary', function() {
        expect(function() {
            var t = new w.Injector();
        }).toThrow();
    });

    it('should be a constructor', function() {
        expect(w.Injector({}) instanceof w.Injector).toBe(true);
        expect(new w.Injector({}) instanceof w.Injector).toBe(true);
    });

    it('annotate strict should return a function\'s $inject array',
       function() {
           var test = function test(z, x, y, p, r, q, t) {},
               i = new I({});
           test.$inject = ['a', 'b', 'c', 5];
           expect(i.annotate(test, true).toString()).
           toBe(test.$inject.toString());
       });

    it('annotate strict should return an array',
       function() {
           var test = function test() {},
               i = new I({});
           expect(i.annotate(test, true).toString()).
           toBe([].toString());
       });

    it('annotate should prefer fn.$inject to argument parsing', function() {
        var test = function test(z, r, w, d, e, o, l) {},
            i = new I({});
        test.$inject = ['a', 'b', 'c', 5];
        expect(i.annotate(test).toString()).
        toBe(test.$inject.toString());
    });

    it('annotate should parse functions when all else fails', function() {
        var test = function test(a, b, c) {},
            i = new I({});
        expect(i.annotate(test).toString()).
        toBe(['a', 'b', 'c'].toString());
    });

    it('annotate should use a cache', function() {
        var test = function test(a, b, c) {},
            i = new I({}), a, b;
        expect(Object.keys(i.$$annotationCache_).length).toBe(0);
        a = i.annotate(test);
        expect(Object.keys(i.$$annotationCache_).length).toBe(1);
        b = i.annotate(test);
        expect(Object.keys(i.$$annotationCache_).length).toBe(1);
        expect(a).toBe(b);
    });

    it('iterate component should return if no callback given', function() {
        var i = new I({});
        spyOn(workular, 'forEach');
        expect(i.$$iterateComponent_('asdf')).toBeUndefined();
        expect(workular.forEach).not.toHaveBeenCalled();
    });

    it('iterate component should return if first parameter not in ' +
       'workular.componentTypes', function() {
        var i = new I({});
        spyOn(workular, 'forEach');
        expect(i.$$iterateComponent_('asdf', w.noop)).toBeUndefined();
        expect(workular.forEach).not.toHaveBeenCalled();
    });

    it('iterate component should use the injector\'s context', function() {
        var i = new I({
                          testMod: new w.Module('testMod').config(function() {

                          })
                      }),
            isDone = false;
        i.$$iterateComponent_('config', function() {
            expect(this).toBe(i);
            isDone = true;
        });
        expect(isDone).toBe(true);
    });

    it('iterate component should work across multiple modules', function() {
        var i = new I({
                          testMod1: new w.Module('testMod1').config(w.noop),
                          testMod2: new w.Module('testMod2').config(w.noop),
                          testMod3: new w.Module('testMod3').config(w.noop),
                          testMod4: new w.Module('testMod4').config(w.noop),
                          testMod5: new w.Module('testMod5').config(w.noop)
                      }),
            count = 0;
        i.$$iterateComponent_('config', function() { count += 1; });
        expect(count).toBe(5);
    });

    it('findComponent should return the first found component', function() {
        var testMods = {
            testMod1: new w.Module('testMod1').config(w.noop),
            testMod2: new w.Module('testMod2').config(w.noop)
        }, i = new I(testMods);

        testMods.testMod1.factory('test', function() {});
        expect(i.$$findComponent_('test')).toBeTruthy();
    });

    it('checkDependencies should throw if a dependency is not found',
       function() {
           expect(function() {
               var testMods = {
                   testMod1: new w.Module('testMod1',
                                          ['not-here']).config(w.noop),
                   testMod2: new w.Module('testMod2',
                                          ['testMod1']).config(w.noop)
               }, i = new I(testMods);
           }).toThrow();
       });

    it('checkDependencies should find expected dependencies',
       function() {
           expect(function() {
               var testMods = {
                   testMod1: new w.Module('a', ['d', 'e']).config(w.noop),
                   testMod2: new w.Module('b', ['e', 'a']).config(w.noop),
                   testMod3: new w.Module('c', ['b']).config(w.noop),
                   testMod4: new w.Module('d', ['c']).config(w.noop),
                   testMod5: new w.Module('e', ['d']).config(w.noop)
               }, i = new I(testMods);
           }).toThrow();
       });

    it('$$bootstrapData should load constants/values', function() {
        var t = new w.Module('test', []),
            i;
        t.constant('a', 'a').constant('b', 'b');
        i = new I({testMod: t});
        i.$$bootstrapData_('constant');
        expect(i.$$componentsCache_['test']['constant']['a']).toBe('a');
    });

    it('order dependencies (I)', function() {
        var testSet = {
                http: ['log', 'queue'],
                log: [],
                queue: ['log']
            },
            result = I.prototype.$$orderDependencies_(testSet);
        expect(result.length).toBe(3);
        expect(result[0]).toBe('log');
        expect(result[2]).toBe('http');
    });

    it('order dependencies (II)', function() {
        var testSet = {
                http: ['log', 'queue', 'q'],
                log: [],
                queue: ['log'],
                q: ['log', 'queue'],
                route: ['log', 'q']
            },
            result = I.prototype.$$orderDependencies_(testSet);
        expect(result[0]).toBe('log');
        expect(result[4]).toBe('route');
        expect(result.length).toBe(5);
    });

    it('order dependencies should allow for mutual dependency', function() {
        var testSet = {
            http: ['log', 'queue', 'q'],
            log: [],
            queue: ['log'],
            q: ['log'],
            route: ['queue', 'log', 'http']
        };
        expect(function() {

            var result = I.prototype.$$orderDependencies_(testSet);
        }).not.toThrow();
    });

    it('order dependencies should throw on circular (I)', function() {
        var testSet = {
            http: ['log', 'queue', 'q'],
            log: [],
            queue: ['log'],
            q: ['log', 'http']
        };
        expect(function() {
            var result = I.prototype.$$orderDependencies_(testSet);
        }).toThrow();
    });


    it('provider functions should run', function() {
        var t = new w.Module('test', []),
            isDone = false,
            i;
        t.constant('a', 'a').provider('test', function() {
            isDone = true;
            this.$get = function() {};
        });
        i = new I({testMod: t});

        expect(isDone).toBe(true);
    });

    it('provider functions should be able to include other providers',
       function() {
           var t = new w.Module('test', []),
               isDone = false,
               i;

           function P() {
               isDone = true;
               this.$get = function() {};
           }

           t.constant('a', 'a').
           provider('test', P).
           provider('test2', function(testProvider) {
                        isDone = true;
                        expect(testProvider instanceof P).toBe(true);
                        this.$get = function() {};
                    });
           i = new I({testMod: t});

           expect(isDone).toBe(true);
       });

    it('provider functions should be able to include constants',
       function() {
           var t = new w.Module('test', []),
               isDone = false,
               i;

           function P() {
               isDone = true;
               this.$get = function() {};
           }

           t.constant('a', 'a').
           constant('r', 'rust').
           provider('test', P).
           provider('test2', function(testProvider, r) {
                        isDone = true;
                        expect(testProvider instanceof P).toBe(true);
                        expect(r).toBe('rust');
                        this.$get = function() {};
                    });
           i = new I({testMod: t});

           expect(isDone).toBe(true);
       });

    it('providers with unmet dependencies should throw',
       function() {
           var t = new w.Module('test', []),
               isDone = false,
               i;

           t.provider('test2', function(r) {
               this.$get = function() {};
           });

           expect(function() {
               i = new I({testMod: t});
           }).toThrow();

       });

    it('config blocks should be able to include providers',
       function() {
           var t = new w.Module('test', []),
               isDone = false,
               i;

           function P() {
               isDone = true;
               this.$get = function() {};
           }

           t.constant('a', 'a').
           config(function(testProvider) {
                      isDone = true;
                      expect(testProvider instanceof P).toBe(true);
                  }).
           provider('test', P).
           provider('test2', function(testProvider) {
                        this.$get = function() {};
                        expect(testProvider instanceof P).toBe(true);
                    });
           i = new I({testMod: t});

           expect(isDone).toBe(true);
       });

    it('config blocks should have access to a $provide object', function() {
        var t = new w.Module('test', []),
            isDone = false,
            i;

        t.config(function($provide) {
            isDone = true;
            expect($provide).toBeTruthy();
            expect(typeof $provide).toBe('object');
        });

        i = new I({testMod: t});
        expect(isDone).toBe(true);
    });
});

describe('args from function', function() {
    'use strict';

    /*global workular */
    var w = workular,
        C = w.Injector;

    it('getArgsFromFunction should return an empty array if parameter is a ' +
       'non function', function() {
        expect(C.$$getArgsFromFn().toString()).toBe([].toString());
    });

    it('getArgsFromFunction should return parsed arguments if no $inject ' +
       'present', function() {
        var t = function(hi, hello, howAreYou) { };
        expect(C.$$getArgsFromFn(t).toString()).
        toBe(['hi', 'hello', 'howAreYou'].toString());
    });
});

