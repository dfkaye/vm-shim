// vm-shim node-test
var test = require('tape');
var vm = require('../vm-shim.js');

/*** TESTS ***/

test('contains runInContext()', function (t) {

  t.plan(1);
  
  t.equal(typeof vm.runInContext, 'function');
});

test('passes t', function (t) {

  t.plan(1);
  
  vm.runInContext("t.ok(true);", { 
    t: t 
  });   
});

test('context not leaked', function (t) {

  t.plan(1);
  
  vm.runInContext("t.ok(!context);", { 
    t: t 
  }); 
});

test('string property', function (t) {

  t.plan(1);
  
  vm.runInContext("t.equal(string, 'string value');", { 
    string: 'string value', t: t 
  });
});

test('number property', function (t) {

  t.plan(1);
  
  vm.runInContext("t.equal(number, 347.347);", { 
    number: 347.347, t: t 
  });
});

test('boolean property', function (t) {

  t.plan(1);
  
  vm.runInContext("t.equal(boolean, true);", { 
    boolean: true, t: t 
  });
});

test('object property', function (t) {

  t.plan(1);
  
  vm.runInContext("t.equal(object.id, 'an id/string');", { 
    object: { id: 'an id/string' }, t: t 
  });
});

test('accepts function as src-code', function (t) {

  t.plan(2);

  vm.runInContext(function(){
  
    t.equal(context, undefined); 
    t.equal(object.id, 'an id/string');
    
  }, { object: { id: 'an id/string' }, t: t });
});

test('vm internals not leaked', function (t) {

  t.plan(4);

  vm.runInContext(function(){
  
    var undef = 'undefined';
    
    t.equal(typeof context, undef); 
    t.equal(typeof context, undef); 
    t.equal(typeof context, undef); 
    t.equal(typeof context, undef); 

  }, { t: t });
  
});

test("context attrs override external scope vars", function(t) {

  t.plan(1);

  var attr = "shouldn't see this";
   
  vm.runInContext(function(){
  
    t.equal(attr, 'ok');

  }, { attr: 'ok', t: t });
});

test("bad code throws error", function(t) {

  t.plan(2);
  
  function exec(){

    var msg = 'barf is not defined';
    
    function throwIt() {
      barf
    }
  
    // capture it
    t.throws(throwIt, msg);

    // now try it and view the console
    try {
      throwIt();
    } catch(e) {
      console.dir(e);
      t.equal(e.message, msg);
    }
  }

  vm.runInContext(exec, { t: t });
});
