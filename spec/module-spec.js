/**
 * file: module-spec.js
 * Created by michael on 08/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('workular Module', function () {
    'use strict';
    /*global workular*/
    var w = workular;

    it('should be a constructor', function () {
        expect(w.Module() instanceof w.Module).toBe(true);
        expect(new w.Module() instanceof w.Module).toBe(true);
    });

    w.componentTypes.forEach(function (component) {
        it('should expose a ' + component + ' component', function () {
            var t = w.Module('test', []);
            expect(typeof t[component]).toBe('function');
        });
    });

    it('config should register a config function, _without_ the need for a ' +
       'name', function () {
        var t = w.Module();
        expect(t.config(function test() {})).toBe(t);
    });

    it('run should register a run function, _without_ the need for a ' +
       'name', function () {
        var t = w.Module();
        expect(t.run(function test() {})).toBe(t);
    });

    it('main should register a main function, _without_ the need for a ' +
       'name', function () {
        var t = w.Module();
        expect(t.main(function test() {})).toBe(t);
    });

    it('factory should register a factory function', function () {
        var t = w.Module();
        expect(t.factory('name', function test() {})).toBe(t);
    });

    it('should warn if given a duplicate component name', function () {
        spyOn(w.log, 'warn');
        var t = w.Module();
        expect(t.factory('name', function test() {})).toBe(t);
        expect(t.factory('name', function test() {})).toBe(t);
        expect(w.log.warn).toHaveBeenCalled();
    });

    it('hasComponent should return null if it does not have the requested ' +
       'component', function () {
        var t = w.Module();
        expect(t.$$hasComponent_('test')).toBe(null);
    });

    it('hasComponent should return valid constants ', function () {
        var t = w.Module();
        t.constant('test', 5);
        expect(t.$$hasComponent_('test')).toBeTruthy();
    });

    it('hasComponent should return valid values ', function () {
        var t = w.Module();
        t.value('test', 5);
        expect(t.$$hasComponent_('test')).toBeTruthy();
    });

    it('hasComponent should return valid providers ', function () {
        var t = w.Module();
        t.provider('test', function () {});
        expect(t.$$hasComponent_('test')).toBeTruthy();
    });

    it('hasComponent should return valid services ', function () {
        var t = w.Module();
        t.service('test', function () {});
        expect(t.$$hasComponent_('test')).toBeTruthy();
    });

    it('hasComponent should return valid factories ', function () {
        var t = w.Module();
        t.factory('test', function () {});
        expect(t.$$hasComponent_('test')).toBeTruthy();
    });

    it('Components with type errors should throw', function() {
        var t = w.Module();
        
        expect(function() {
            t.factory(null);
        }).toThrow();
    });
});