/**
 * file: workular-mock-spec.js
 * Created by michael on 15/01/15
 */

/*global window, jasmine, beforeEach, describe, expect, waitsFor, spyOn, runs, it, module,inject, workular */


describe('Test workular mock - wmodel/winject', function() {
    'use strict';
    /*global wmodule, winject*/

    it('wmodule should reset workular', function() {
        var old = workular.$$injector, newOne;
        wmodule();
        newOne = workular.$$injector;
        expect(newOne === old).toBe(false);
        wmodule();
        expect(workular.$$injector === newOne).toBe(false);
    });

    it('winject should return a function', function() {
        wmodule();
        expect(typeof winject(function() {})).toBe('function');
    });

    it('winject should inject stuff', function() {
        var isDone = false;
        workular.module('test', []).value('testy', 'thing');
        wmodule();
        winject(function(testy) {
            isDone = true;
            expect(testy).toBe('thing');
        })();
        expect(isDone).toBe(true);
    });
});