vm-shim
=======

Wan attempt to reproduce/polyfill/infill the node.js 
<code>vm#runIn<Some?>Context()</code> methods in browser ~ no guarantees.

+ <code>vm#runInContext(code, context)</code>
+ <code>vm#runInNewContext(code, context)</code>
+ <code>vm#runInThisContext(code)</code>

justify
-------

Goal here is to get Node.js's <code>vm.runInContext()</code> methods to run in 
the browser, partly to show that it really can be done, partly as a potential 
replacement for browserify's 
[vm-browserify](https://github.com/substack/vm-browserify) which uses iframes to 
create and clone globals and contexts.

browser tests
-------------

Using @pivotallabs' <a href='https://github.com/pivotal/jasmine'>jasmine</a> for the 
browser suite.

The *jasmine* test page is viewable on 
<a href='//rawgithub.com/dfkaye/vm-shim/master/test/browser/SpecRunner.html' 
   target='_new' title='opens in new tab or window'>
  rawgithub</a>.

node tests
----------

Out of curiosity, I've included a test suite to detect possible issues on Node, 
using @substack's <a href='https://github.com/substack/tape'>tape</a> module. 

Run these with:

    cd ./vm-shim
    npm test
  
or 
  
    node ./test/node-test.js

    
CoffeeScript tests
------------------

As a further learning exercise, I've created a node.spec.coffee test file and 
run it with jasmine-node.  

    jasmine-node --coffee --verbose ./test/node.spec.coffee

jasmine-node expects your tests to be ".spec" files; and that your coffeescript 
spec names have ".coffee" appended to them, e.g., [name].spec.coffee


I've even written the tape tests in CoffeeScript to see what that's like:

    coffee ./test/tape-test.coffee

    
implementation
--------------

First-cut implementation is <code>vm.runInContext(code, context)</code>. The 
Function() constructor is at the core. The *code* param may be either a string 
or a function. The *context* param is a simple object with key-value mappings. 
For any key on the context, a new *var* for that key is prefixed to the code. The
code is passed in to Function() so that the keynames can't leak outside the new 
function's scope.

Currently the unit tests rely on the context param to contain a reference to the 
test's *t* object (when using *tape*), or the *expect* object (when running 
*jasmine*).

Example using *tape*:

    test("overrides external scope vars with context attrs", function(t) {

      t.plan(1);

      var attr = "shouldn't see this";
       
      vm.runInContext(function(){
      
        t.equal(attr, 'ok');
        t.notEqual(attr, 'should not see this');

      }, { attr: 'ok', t: t });
    });

Example using *jasmine*:

    it("overrides external scope vars with context attrs", function() {

      var attr = "shouldn't see this";

      vm.runInContext(function(){

        expect(attr).toBe('ok');
        expect(attr).not.toBe('should not see this');

      }, { attr: 'ok', expect: expect });
    });

Example using *jasmine-node --coffee*:

    it 'overrides external scope vars with context attrs', ->

      attr = 'should not see this'
      
      vm.runInContext (->
        
        expect(attr).toBe('ok')
        expect(attr).not.toBe('should not see this')
        
      ), { attr: 'ok', expect: expect }
    
Example using *tape* test written in *coffeescript*:

    test 'overrides external scope vars with context attrs', (t) ->

      t.plan(2)

      attr = "shouldn't see this"
       
      vm.runInContext ->
      
        t.equal(attr, 'ok')
        t.notEqual(attr, 'should not see this')

      , { attr: 'ok', t: t }
  
footgun
-------

Because __JavaScript is a footgun__ where Function() is involved, debugger support 
will be necessary at some point, (as with using eval()).  I've added simple 
throw-error tests to find which engines return which helpful messages.


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
+ Error, and leakage tests added 21 SEPT.
+ runInNewContext, runInThisContext methods added; runInContext refactored 4 OCT
+ CoffeeScript test with jasmine-node added 6 OCT
+ tape test written in CoffeeScript test added 7 OCT