/*global window, jasmine, beforeEach, describe, expect, spyOn, runs, it, module,inject, workular */

describe('workular core', function () {
    'use strict';

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