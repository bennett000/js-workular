Workular
========

[![Build Status](https://travis-ci.org/bennett000/js-workular.svg?branch=master)](https://travis-ci.org/bennett000/js-workular) [![Code Climate](https://codeclimate.com/github/bennett000/js-workular/badges/gpa.svg)](https://codeclimate.com/github/bennett000/js-workular) [![Test Coverage](https://codeclimate.com/github/bennett000/js-workular/badges/coverage.svg)](https://codeclimate.com/github/bennett000/js-workular/coverage)

Workular is a JavaScript library that provides [Angular.js](http://angularjs.org/)
style modules, and dependency injection to JavaScript
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers),
and [node.js](http://nodejs.org/).

There is likely not much point in using workular as there are better ways to go
about doing things. Workular was written in a rush to simplify the import of a
few Angular services into a Worker process.  Workular is likely not useful
outside of a few niches, and possibly learning how to implement a basic module
system with circular dependency detection.


## Other module systems

Many other module systems exist.  The author's preference is now to use es6
modules everywhere, and/or deal with modules through Grunt/Gulp tasks.

Workular's modules were never inteded to be a "batteries included" module
system, only to provide a thin Angular like interface for simplifying
isomorphic code. In practice this is _better_ achieved by creating more
sophisticated build rules.


### But Why Workular?

The initial workular code facilitated loading 

## Workular's Workings

The workular core is _largely_ compatible with the Angular 1.3.x core, 
with respect to included functions, and the module system. Decorators are note 
yet supported, and $provide will not yet $provide providers, or configs.

Given the 

## Bugs

The Closure Compiler optimizations  do not quite work as expected, consequently
the minified version is not currently functional out of the box

## Batteries Excluded

Angular is a large library that makes writing declarative HTML a joy. Workular
on the other hand is a library that provides an angular style injection system,
specifically for use in Web Workers, and other non-DOM oriented JavaScript
environments.

The tl;dr version is that workular exists primarily to reduce the cognitive
burden of maintaining large JavaScript projects that span multiple JavaScript
environments.
