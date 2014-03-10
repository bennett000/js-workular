Workular
========

Workular is a JavaScript library that provides [Angular.js](http://angularjs.org/)
style modules, and dependency injection to JavaScript
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers),
and [node.js](http://nodejs.org/).

## Other module systems

### But node.js already has modules

Yes, node.js has modules, and yes they're good, however it is the opinion of this
author that Angular.js's dependency injection system makes for easier unit testing,
and superior maintainability.  There's also something to be said for being able
to consistently write JavaScript modules without worrying about the engine.

### But Require.js, AMD!

At the time of this writing (March 10 2014) Require.js in its minified form is
fifteen kilobytes, conversely workular _un-minified_ is fifteen kilobytes!  Also
the author likes to think that require.js/AMD solves a different problem than
angular's DI.

## Workular's Workings

### Methods

Workular is made up of a "worker-core", and optional add on libraries.  The core
provides the following functions:

* newDI - creates a  new dependency injector should you need one

* newPreLogger - creates a new "pre logger" which is a "console" compatible logging
 function that stores its output until it is 'upgraded' to a real logging function.
* upgradeLogger - upgrades the built in pre-logger to a real logging object

* module - internal creates a new DI for the module, and returns it

* getComponent - fetches the first matching component from any/all modules
* getComponentRaw - fetches the un-invoked code that makes up a component

* sortBy - returns a function for use with Array.sort, useful for sorting objects

* isNonEmptyString - returns true if given a non-empty string as a parameter
* isObject - returns true if given a non-null, non-array object as a parameter
* isFunction - returns true if given a function as a parameter
* emptyFunction - literally is an 'empty' function, for use with defaults

* main - registers a function to be invoked on the next setTimeout(..., 0) turn

### Where is It?

Workular lives inside a closure, and presents an API through the engine's global
object. The default name of workular is workular.

* Worker's global is self workular defaults to self.workular
* Browser's global is window workular defaults to window.workular
* Node's global is the local module, and not really global! workular defaults to
module.exports.workular





