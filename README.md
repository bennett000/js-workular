Workular
========

Workular is a JavaScript library that provides [Angular.js](http://angularjs.org/)
style modules, and dependency injection to JavaScript
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/Guide/Performance/Using_web_workers),
and [node.js](http://nodejs.org/).

## Other module systems

### But node.js already has modules

They're really good, especially when paired with a module like rewire.  It is
however conceivable that there might be some obscure cases where someone wants
something like this, plus it already works.

As of Workular 0.6.0 node support is being deprecated, notably the auto
loading of CommonJS modules.

### But Require.js, AMD!

AMD makes lots of sense for lots of projects, however there are other classes of
projects where AMD is less appropriate.  I have been using JavaScript since the
mid nineties, and I have yet to work on a project where I require dynamic
module loading.  I'm not opposed to dynamic module loading, I actually think
it's really cool, but it's just not something I've needed to implement... yet.

## Workular's Workings

The workular core is mostly compatible with the Angular 1.3.x core, with respect
to included functions, and the module system. Decorators are note yet supported,
and $provide will not yet $provide providers, or configs.

## Batteries Excluded

Angular is a large library that makes writing declarative HTML a joy. Workular
on the other hand is a library that provides an angular style injection system,
specifically for use in Web Workers, and other non-DOM oriented JavaScript
environments.

The tl;dr version is that workular exists primarily to reduce the cognitive
burden of maintaining large JavaScript projects that span multiple JavaScript
environments.
