'use strict';

/* jasmine specs for controllers go here */
/* jasmine specs for services go here */
/*global window, jasmine, beforeEach, describe, expect, spyOn, runs, it, module,inject, workular */

describe('workular core', function () {
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
        it('should provide access to the global object through DI', function () {
            expect(typeof workular.getComponent('global')).toBe('object');
            expect(workular.getComponent('global')).toBe(window);
        });
    });
});

describe('dependency injection (newDI)', function () {
    // ensures that parameter one is a non empty string
    function testValidName(fn) {
        expect(function () {
            fn(5);
        }).toThrow();
        expect(function () {
            fn({});
        }).toThrow();
        expect(function () {
            fn(NaN);
        }).toThrow();
        expect(function () {
            fn([]);
        }).toThrow();
        expect(function () {
            fn(null);
        }).toThrow();
        expect(function () {
            fn(false);
        }).toThrow();
        expect(function () {
            fn(true);
        }).toThrow();
        expect(function () {
            fn(function () {
            });
        }).toThrow();
        expect(function () {
            fn('');
        }).toThrow();
    }
    // setup each test with a new di object
    var di;
    beforeEach(function () {
        di = workular.newDI(null);
    });

    describe("DI API", function () {
        it('should be an object', function () {
            expect(typeof di).toBe('object');
        });
        it('should provide a factory function', function () {
            expect(typeof di.factory).toBe('function');
        });
        it('should provide a getRaw function', function () {
            expect(typeof di.getRaw).toBe('function');
        });
        it('should provide a get function', function () {
            expect(typeof di.get).toBe('function');
        });
        it('should provide a has function', function () {
            expect(typeof di.has).toBe('function');
        });
    });

    describe('di should initialize with given values', function () {
        it('should contain the given values from the array', function () {
            var t1 = workular.newDI([
                {
                    nameSpace: 'factory',
                    name: 'five',
                    value: 5
                }, {
                    nameSpace: 'factory',
                    name: 'six',
                    value: '6'
                }, {
                    nameSpace: 'factory',
                    name: 'seven',
                    value: { value: 7 }
                }
            ]);
            expect(t1.get('five')).toBe(5);
            expect(t1.get('six')).toBe('6');
            expect(t1.get('seven').value).toBe(7);
        });
        it('should contain the given value', function () {
            var t1 = workular.newDI({
                nameSpace: 'factory',
                name: 'test',
                value: 'Higgins Rocks!'
                                    });
            expect(t1.get('test')).toBe('Higgins Rocks!');
        });
        it('should throw on truthy malformated inputs', function () {
            expect(function () {
                var t2 = workular.newDI('Cheese');
            }).toThrow();

            expect(function () {
                var t3 = workular.newDI(
                    {
                        nameSpace: 'factory',
                        name: 234523,
                        value: 5
                    });
            }).toThrow();

        });
    });

    describe('factory function', function () {
        it('should throw if no name is given', function () {
            expect(di.factory).toThrow();
        });
        it('should throw if name is not a string, or if name is empty', function () {
            testValidName(di.factory);
        });
        it('should throw if parameter two is not a function, or an array ending with a function', function () {
            expect(function () {
                di.factory('test', {});
            }).toThrow();
            expect(function () {
                di.factory('test', []);
            }).toThrow();
            expect(function () {
                di.factory('test', ['pizza']);
            }).toThrow();
        });
        it('should throw if array parameter 2 contains non-strings', function () {
            expect(function () {
                di.factory('test', ['pizza', 5, function () {
                }]);
                di.get('pizza');
            }).toThrow();
        });
        it('should throw if array parameter 2 contains duplicates', function () {
            expect(function () {
                di.factory('test', ['pizza', 'pizza', function () {
                }]);
                di.get('pizza');
            }).toThrow();
        });
        it('given a valid signature it should return workular', function () {
            expect(di.factory('test', function () {
            })).toBe(workular);
            expect(di.factory('test', [function () {
            }])).toBe(workular);
            expect(di.factory('test', ['blah', function () {
            }])).toBe(workular);
            expect(di.factory('test', ['blah', 'blah2', function () {
            }])).toBe(workular);
        });
        it('should throw an error if the module function encounters an error', function () {
            function test() {
                di.factory('test1', function () {
                    throw new Error('test error');
                });
            }
            expect(test).toThrow();
        });
        it('should populate given functions with registered services', function () {
            di.factory('test1', function () {
                return "test1";
            });
            di.factory('test2', function () {
                return "test2";
            });
            di.factory('test3', ['test1', 'test2', function (t1, t2) {
                expect(t1).toBe('test1');
                expect(t2).toBe('test2');
                return 'test3';
            }]);
            di.factory('test4', ['test2', 'test1', 'test3', function (t2, t1, t3) {
                expect(t1).toBe('test1');
                expect(t2).toBe('test2');
                expect(t3).toBe('test3');
            }]);
        });
    });

    describe('getRaw function', function () {
        it('should throw if name is not a string or if name is empty', function () {
            testValidName(di.getRaw);
        });
        it('should return null if dependency is not registered', function () {
            expect(di.getRaw('hello')).toBe(null);
        });
        it('should return the exact same array as was registered', function () {
            var testArr1 = [
                'test1',
                'test2',
                function () {
                    return 5 * 25;
                }
            ], testArr2 = [
                function () {
                    return 5 * 25;
                }
            ], temp;
            di.factory('test1', testArr1);
            di.factory('test2', testArr2[0]);

            temp = di.getRaw('test1');
            temp.forEach(function (el, k) {
                expect(testArr1[k]).toBe(el);
            });

            temp = di.getRaw('test2');
            temp.forEach(function (el, k) {
                expect(testArr2[k]).toBe(el);
            });
        });
    });

    describe('get function', function () {
        it('should throw if name is not a string or if name is empty', function () {
            testValidName(di.get);
        });
        it('should return null if dependency is not registered', function () {
            expect(di.get('hello')).toBe(null);
        });
        it('should return the result of the function that was registered', function () {
            di.factory('test1', function () {
                return "booya";
            });
            di.factory('test2', function () {
                return 5;
            });
            di.factory('test3', function () {
                return {
                    hello: 'hello'
                };
            });
            expect(di.get('test1')).toBe('booya');
            expect(di.get('test2')).toBe(5);
            expect(di.get('test3').hello).toBe('hello');
        });
    });

    describe('has function', function () {
        it('should return true if it has a module, and false otherwise', function () {
            di.factory('test1', function () {
                return "booya";
            });
            di.factory('test2', function () {
                return 5;
            });
            di.factory('test3', function () {
                return {
                    hello: 'hello'
                };
            });
            expect(di.has('test1')).toBe(true);
            expect(di.has('test2')).toBe(true);
            expect(di.has('test3')).toBe(true);
            expect(di.has('test4')).toBe(false);
            expect(di.has('test5')).toBe(false);
        });
        it('should return false when given incorrect parameters', function () {
            expect(di.has('test1')).toBe(false);
            expect(di.has(5876)).toBe(false);
            expect(di.has({})).toBe(false);
            expect(di.has(NaN)).toBe(false);
            expect(di.has()).toBe(false);
        });
    });
});