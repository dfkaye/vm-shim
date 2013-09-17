context-bullpen
===============

attempt to reproduce/polyfill/infill node.js vm#runIn&lt;Some>Context() methods in browser - no guarantees

justify
-------

Sandboxing (IIFE) (module pattern), etc.  Goal here is to get something like <code>vm.createScript()</code> 
and <code>script||vm.runIn<Some>Context()</code> methods to run in the browser.

something like new Function() will be involved which means debugger support is necessary somewhere, maybe 
injected as a dev-time setting.

rawgithub
---------

The page should be viewable on rawgithub soon - would be ideal to have a test suite running there too so we don't need
the console open to see them pass.  Adding console support would also be nice.


