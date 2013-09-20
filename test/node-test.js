// vm-shim node-test
var test = require('tape');
var vm = require('../vm-shim.js');

/*** TESTS ***/

test('smoke test', function (t) {
  
  t.equal(typeof vm.runInContext, 'function');
  t.end();
});

test('passes t as test', function (t) {

  t.plan(1);
  
  vm.runInContext("test.ok(true);", { 
    test: t 
  });   
});

test('context not leaked', function (t) {
  
  vm.runInContext("test.ok(!context);", { 
    test: t 
  }); 
  t.end();
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
    test.ok(!context, 'should be null'); 
    test.equal(object.id, 'an id/string');
  }, { object: { id: 'an id/string' }, test: t });
});
