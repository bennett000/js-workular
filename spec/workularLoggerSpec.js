/**
 * file: workularLoggerSpec
 * Created by michael on 10/03/14
 */

/*global window, jasmine, beforeEach, describe, expect, spyOn, runs, it, module,inject, workular */


describe('workular preLogger function', function () {
    'use strict';
    var log;
    beforeEach(function () {
        log = workular.newPreLogger();
    });

    it('should be an object', function () {
        expect(workular.isObject(log)).toBe(true);
    });
    it('should provide a basic log function', function () {
        expect(workular.isFunction(log.log));
    });
    it('should provide a basic info function', function () {
        expect(workular.isFunction(log.info));
    });
    it('should provide a basic warn function', function () {
        expect(workular.isFunction(log.warn));
    });
    it('should provide a basic error function', function () {
        expect(workular.isFunction(log.error));
    });
    it('should provide a basic trace function', function () {
        expect(workular.isFunction(log.trace));
    });

});