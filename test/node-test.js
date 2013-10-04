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

test("can modify var values", function(t) {

  t.plan(2);

  var count = 2;
    
  vm.runInContext("count += 1;t.equal(count, 3);", { count: 2, t: t });
    
  t.equal(count, 2);
});
  
test("can modify var values in functions", function(t) {

  t.plan(2);
  
  var count = 2;
    
  vm.runInContext(function(){
    
    count += 1;
      
    t.equal(count, 3);
    
  }, { count: count, t: t });
    
  t.equal(count, 2);
});

test('vm internals not leaked', function (t) {

  t.plan(4);

  vm.runInContext(function(){
  
    var undef = 'undefined';
    
    t.equal(typeof context, undef); 
    t.equal(typeof code, undef); 
    t.equal(typeof src, undef); 
    t.equal(typeof key, undef); 
          
  }, { t: t });
});

test('context attrs override external scope vars', function(t) {

  t.plan(1);

  var attr = "shouldn't see this";
   
  vm.runInContext(function(){
  
    t.equal(attr, 'ok');

  }, { attr: 'ok', t: t });
});

test('bad code throws error', function(t) {

  t.plan(2);
  
  function exec(){

    var msg = 'barf is not defined';
    
    function throwIt() {
      barf
    }
  
    // capture it
    t.throws(throwIt);

    // now try it and view the console
    try {
      throwIt();
    } catch(e) {
      //console.dir(e); // keep around for Error type output
      t.equal(e.message, /\'?barf\'? is (un|not )defined/.exec(e.message)[0]);
    }
  }
  
  vm.runInContext(exec, { t: t });
});



test('global and vm not leaked', function (t) {

  t.plan(3);
  
  vm.runInContext(function(){
  
    var undef = 'undefined';
  
    t.equal(typeof global.vm, undef);
    t.equal(typeof vm, undef);
    
  }, { t: t, global: global });
  
  t.notEqual(typeof vm, 'undefined', 'should preserve vm');
});


test("runInNewContext: global and vm not shared", function(t) {

  t.plan(3);
  
  vm.runInNewContext(function(){
    var undef = 'undefined';
  
    t.equal(typeof global.vm, undef);
    t.equal(typeof vm, undef);
    
  }, { t: t, global: global });
  
  t.notEqual(typeof vm, 'undefined', 'should preserve vm');
});
  

test("runInThisContext: global shared", function(t) {

  t.plan(1);
  
  global.t = t;
  global.vm = vm;
  
  vm.runInThisContext(function(){

    global.t.equal(global.vm, vm);
  });
  
  delete global.t;
  delete global.vm;
});


test("runInThisContext: context not leaked", function(t) {

  t.plan(2);

  var control = 'outer';

  global.t = t;

  vm.runInThisContext(function(){

    control = 'inner';
    global.t.equal(control, 'inner');
  });

  delete global.t;
    
  // should preserve control
  t.equal(control, 'outer');
});