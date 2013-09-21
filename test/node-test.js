// vm-shim node-test
var test = require('tape');
var vm = require('../vm-shim.js');

/*** TESTS ***/

test('contains runInContext()', function (t) {

  t.plan(1);
  
  t.equal(typeof vm.runInContext, 'function');
});

test('passes t as test', function (t) {

  t.plan(1);
  
  vm.runInContext("test.ok(true);", { 
    test: t 
  });   
});

test('context not leaked', function (t) {

  t.plan(1);
  
  vm.runInContext("test.ok(!context);", { 
    test: t 
  }); 
});

test('string property', function (t) {

  t.plan(1);
  
  vm.runInContext("test.equal(string, 'string value');", { 
    string: 'string value', test: t 
  });
});

test('number property', function (t) {

  t.plan(1);
  
  vm.runInContext("test.equal(number, 347.347);", { 
    number: 347.347, test: t 
  });
});

test('boolean property', function (t) {

  t.plan(1);
  
  vm.runInContext("test.equal(boolean, true);", { 
    boolean: true, test: t 
  });
});

test('object property', function (t) {

  t.plan(1);
  
  vm.runInContext("test.equal(object.id, 'an id/string');", { 
    object: { id: 'an id/string' }, test: t 
  });
});

test('accepts function as src-code', function (t) {

  t.plan(2);

  vm.runInContext(function(){
  
    test.equal(context, undefined); 
    test.equal(object.id, 'an id/string');
    
  }, { object: { id: 'an id/string' }, test: t });
});

test('vm internals not leaked', function (t) {

  t.plan(4);

  vm.runInContext(function(){
  
    var undef = 'undefined';
    
    test.equal(typeof context, undef); 
    test.equal(typeof context, undef); 
    test.equal(typeof context, undef); 
    test.equal(typeof context, undef); 

  }, { test: t });
  
});

test("context attrs override external scope vars", function(t) {

  t.plan(1);

  var attr = "shouldn't see this";
   
  vm.runInContext(function(){
  
    test.equal(attr, 'ok');

  }, { attr: 'ok', test: t });
});

test("bad code throws error", function(t) {

  t.plan(2);
  
  function exec(){

    var msg = 'barf is not defined';
    
    function throwIt() {
      barf
    }
  
    // capture it
    test.throws(throwIt, msg);

    // now try it and view the console
    try {
      throwIt();
    } catch(e) {
      console.dir(e);
      test.equal(e.message, msg);
    }
  }

  vm.runInContext(exec, { test: t });
});
