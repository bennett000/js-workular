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
        var testFn = w.bind({name: 'test1'}, testObj.getName);
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
        var blah = {1: 52323, 'say': 'so'};
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

describe('forEach function', function () {
    /*global workular */
    var w = workular;

    it('should work on arrays', function () {
        w.forEach([1, 2, 3, 4, 5], function (el, i) {
            expect(i + 1).toBe(el);
        });
    });

    it('should work on Objects', function () {
        var test = {a: 1, b: 2, 3: 3, d: 4, 5: 5};
        w.forEach(test, function (el, i) {
            expect(el).toBe(test[i]);
        });
    });

    it('should bind context on arrays', function () {
        var test = {};
        w.forEach([1, 2, 3, 4, 5], function (el, i) {
            expect(this).toBe(test);
        }, test);
    });

    it('should bind context on Objects', function () {
        var test = {a: 1, b: 2, 3: 3, d: 4, 5: 5};
        w.forEach(test, function (el, i) {
            expect(this).toBe(test);
        }, test);
    });

    it('should do nothing without a callback', function () {
        expect(function () {
            w.forEach([1, 2, 3]);
        }).not.toThrow();
    });

    it('should do nothing without an array or object', function () {
        var test = {a: 1, b: 2, 3: 3, d: 4, 5: 5};
        expect(function () {
            w.forEach(2352, workular.noop);
        }).not.toThrow();
    });

});

describe('inherits', function () {
    'use strict';
    /*global workular*/
    var w = workular, Child, Parent, GrandParent;

    beforeEach(function () {
        function ChildConstructor(a, b) {
            Parent.call(this, a);
            this.b = b;
        }

        function ParentConstructor(a) {
            this.a = a;
        }

        function GrandParentConstructor(a, b) {
            if (!a || !b) {
                throw new TypeError('test');
            }
        }

        Child = ChildConstructor;
        Parent = ParentConstructor;
        GrandParent = GrandParentConstructor;
    });

    it('control', function () {
        expect(new Child() instanceof Parent).toBe(false);
    });

    it('should do basic inheritance', function () {
        w.inherits(Child, Parent);
        expect(new Child() instanceof Parent).toBe(true);
    });

    it('should do basic inheritance with prototype constructor arguments',
       function () {
           expect(function () {
               w.inherits(Child, GrandParent, ['z', 'x']);
           }).not.toThrow();

           // control
           expect(function () {
               w.inherits(Child, GrandParent);
           }).toThrow();
       });
});

describe('construct', function () {
    'use strict';
    /*global workular*/
    var w = workular;

    function Test(a, b, c) {
        if (!(this instanceof Test)) {
            return new Test(a, b, c);
        }
        this.a = a || null;
        this.b = b || null;
        this.c = c || null;
    }

    it('should return null if not given a constructor', function () {
        expect(w.construct(23523)).toBe(null);
    });

    it('should instantiate classes without arguments', function () {
        expect(w.construct(Test) instanceof Test).toBe(true);
    });

    it('should instantiate classes with arguments', function () {
        expect(w.construct(Test, [1, 2, 3]) instanceof Test).toBe(true);
        expect(w.construct(Test, [1, 2, 3]).a).toBe(1);
        expect(w.construct(Test, [1, 2, 3]).b).toBe(2);
        expect(w.construct(Test, [1, 2, 3]).c).toBe(3);
    });
});
