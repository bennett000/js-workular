/**
 * file: build.js
 * Created by michael on 08/01/15.
 */

/*global module*/
var src = 'src';

module.exports.lib = [];

module.exports.src = [
    'workular.js',
    'functions.js',
    'pre-log.js',
    'injector.js',
    'component.js',
    'module.js',
    'main.js'
].map(function (el) {
          'use strict';
          return src + '/' + el;
      });
