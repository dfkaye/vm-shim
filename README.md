vm-shim
=======

Wan attempt to reproduce/polyfill/infill the node.js 
<code>vm#runInContext()</code> method in browser ~ no guarantees.

justify
-------

Goal here is to get something like <code>vm.createScript()</code> and/or 
<code>script||vm.runInContext()</code> method to run in the browser, in part to 
show that it really can be done, partly as a potential shim for browserify which 
tries to port node.js to the browser (with some caveats) ~ maybe.

browser tests
-------------

A jasmine test page is viewable on 
<a href='//rawgithub.com/dfkaye/vm-shim/master/test/browser/SpecRunner.html' 
   target='_new' title='opens in new tab or window'>
  rawgithub</a>.

test it on node
---------------

Using @substack's tape module to break up big bag of asserts into unit tests. Run these with:

    cd ./vm-shim
    npm test
  
or 
  
    node ./test/node-test.js
    
implementation
--------------

First-cut implementation is <code>vm.runInContext(code, context)</code>. The 
Function() constructor is at the core. The *code* param may be either a string 
or a function. The *context* param is a simple object with key-value mappings. 
For any key on the context, a new *var* for that key is prefixed to the code. The
code is passed in to Function() so that the keynames can't leak outside the new 
function's scope.

Currently the unit tests rely on the context param to contain a reference to the 
*t* or *test* object (when using *tape*), or the *expect* object (when running 
*jasmine*).

Example using tape:

    test('accepts function as src-code', function (t) {

      t.plan(2);
            
      vm.runInContext(function(){
      
        test.ok(!context, 'should be null'); 
        test.equal(object.id, 'an id/string');
        
      }, { object: { id: 'an id/string' }, test: t });
    });

Example using jasmine:

    it("accepts function as src-code", function() {

      vm.runInContext(function(){
      
        expect(context).toBe(null); 
        expect(object.id).toBe('an id/string');
        
      }, { object: { id: 'an id/string' }, expect: expect });
    });

 
__TODO__

Because Function() is involved, debugger support will be necessary at some point, 
(as with using eval()), possibly injected as a dev-time setting.  Need to add 
failing tests for errors in code argument, should reveal which engines return 
which helpful messages (type, line, filename, etc.).


first success
-------------
Just noting for the record:

+ This idea emerged late at night 17 SEPT 2013 
+ First implemented with rawgithub approach 18 SEPT, 
+ Full success including objects as properties of the context argument 19 SEPT.
+ Breaking the usual TDD procedure:
  + Started with console statements and prayer ~ removed both for real unit tests
  + Tape tests added 20 SEPT.
  + Jasmine tests/page added 20 SEPT.
