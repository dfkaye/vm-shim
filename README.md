vm-shim
=======

Wan attempt to reproduce/polyfill/infill the node.js <code>vm#runInContext()</code> method in browser - no guarantees.

justify
-------

Sandboxing (IIFE) (module pattern), etc.  Goal here is to get something like <code>vm.createScript()</code> 
and <code>script||vm.runInContext()</code> methods to run in the browser, in part to show that it really can be 
done, partly as a potential shim for browserify which tries to port node.js to the browser (with some caveats) ~ maybe.

implementation
--------------

Use of Function() is involved ~ which means debugger support is necessary somewhere, maybe 
injected as a dev-time setting.  Tests for errors in code argument should reveal which engines return most helpful 
messages (type, line, filename, etc.).

rawgithub html test page
------------------------

A working test page is be viewable on 
<a href='//rawgithub.com/dfkaye/vm-shim/master/test.html' target='_new' title='opens in new tab or window'>
  rawgithub</a>.

TODO ~ Should have a test suite running there too so we don't need the console open to see them pass.  
Adding in-page output to replace the console would also be nice.

test it on node
---------------

Using @substack's tape module to break up big bag of asserts into unit tests. Run these with:

<code>
  cd ./vm-shim
  npm test
  # or 
  node ./test/node-test.js
</code>

first success
-------------
Just noting for the record:

This idea emerged late at night 17 SEPT 2013 ~ first implemented with rawgithub 
approach 18 SEPT, full success including objects as properties of the context 
argument 19 SEPT.

Tape tests added 20 SEPT.

More to come...


