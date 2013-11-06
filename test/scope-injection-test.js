// scope-injection-test.js

var test = require('tape');

var vm = require('../vm-shim.js');

function mock(fn, alias) {

  var source = fn.toString();
  
  if (typeof alias == 'string') {
    source = source.replace(/function[^\(]*/, 'function ' + alias);
  }
  
  return {
    source : function () {
      return source;
    },
    inject : function (key, value) {
      source = source.replace(key, value)
      return this;
    },
    invoke : function (fn, context) {
      fn = !fn ? '' : fn.toString();
      vm.runInNewContext(source + ';\n' + '(' + fn + '());', context);
      return this;
    }
  }
};



/*** FIXTURES ***/

var fixture = (function(){
  
  var pValue = 444;
  
  var pObject = { id: 'invisible man' };

  function pFunc() {
    return 'pFuncified';
  }

  function fn(type) {
  
    var which = (type || '').toLowerCase();
    
    if (which == 'value') return pValue;
    if (which == 'object') return pObject;
      
    return pFunc();
  }
  
  return fn;
}());



/*** TESTS ***/

test('fixtures', function (t) {

  t.plan(8);
  
  t.equal(typeof fixture, 'function', 'fixture should be a function'); 
  t.equal(typeof mock, 'function', 'mock should be a function');
  t.equal(typeof mock(fixture).source, 'function', 'source should be a function');
  t.equal(typeof mock(fixture).inject, 'function', 'inject should be a function');
  t.equal(typeof mock(fixture).invoke, 'function', 'invoke should be a function');

  t.equal(fixture(), 'pFuncified', 'fixture() should return \'pFuncified\'');
  t.equal(fixture('value'), 444, 'fixture(\'value\') should return \'pValue\' of 444');
  t.equal(fixture('object').id, 'invisible man', 'fixture(\'object\') should return \'pObject\' with id');
});

test('inject', function (t) {

  t.plan(4);

  var s = mock(fixture, 'fixture');
  
  t.equal(s.source().indexOf('function fixture('), 0, 'mock should rename fn with alias');
  t.equal(s.inject('', ''), s, 'inject should return source holder');
  
  t.ok(s.source().indexOf('return pFunc()') != -1, 'should contain pFunc');
  
  s.inject('pFunc', 'mockFunc');
  
  t.ok(s.source().indexOf('return mockFunc()') != -1, 'should contain mockFunc');
  
});

test('invoke', function (t) {

  t.plan(4);

  
  // beforeEach
  var mockFunc = function () {
    return 'mockified';
  };
  var s = mock(fixture, 'fixture');
  s.inject('pFunc', 'mockFunc');
  
  
  var inlineSource = s.source() + ';t.equal(fixture(), \'mockified\', \'inline source should return \"mockified\" instead of true\')';
  vm.runInContext(inlineSource, { mockFunc: mockFunc, t: t });
  
  function standalone() {
    t.equal(fixture(), 'mockified', 'standalone should return \'mockified\' instead of true');
  }
  s.invoke(standalone, { mockFunc: mockFunc, t: t });

  s.invoke(function() {
    t.equal(fixture(), 'mockified', 'compressed should return \'mockified\' instead of true')
  }, { mockFunc: mockFunc, t: t });

  var wrapped = s.invoke(function() {
    t.equal(fixture(), 'mockified', 'wrapped should return \'mockified\' instead of true')
  }, { mockFunc: mockFunc, t: t });
});

test('invoke with param \'value\'', function (t) {

  t.plan(4);
  
  
  // beforeEach
  var mockValue = 777;
  var s = mock(fixture, 'fixture');
  s.inject('pValue', 'mockValue');
  

  var inlineSource = s.source() + ';t.equal(fixture(\'value\'), 777, \'inline source should return 777 instead of 444\')';
  vm.runInContext(inlineSource, { mockValue: mockValue, t: t });
  
  function standalone() {
    t.equal(fixture('value'), 777, 'standalone should return 777 instead of 444');
  }
  s.invoke(standalone, { mockValue: mockValue, t: t });
  
  s.invoke(function() {
    t.equal(fixture('value'), 777, 'compressed source should return 777 instead of 444')
  }, { mockValue: mockValue, t: t });
  
  var wrapped = s.invoke(function() {
    t.equal(fixture('value'), 777, 'wrapped source should return 777 instead of 444');
  }, { mockValue: mockValue, t: t });
  
});

test('invoke with param \'object\'', function (t) {

  t.plan(4);
  
  
  //beforeEach
  var mockObj = { id: 'mock-invisible-man' };
  var s = mock(fixture, 'fixture');
  s.inject('pObject', 'mockObj');
  

  var inlineSource = s.source() + ';t.equal(fixture(\'object\').id, \'mock-invisible-man\', \'inline source should return "mock-invisible-man"\')';
  vm.runInContext(inlineSource, { mockObj: mockObj, t: t });
  
  
  function standalone() {
    t.equal(fixture('object').id, 'mock-invisible-man', 'standalone should return \'mock-invisible-man\'');
  }
  s.invoke(standalone, { mockObj: mockObj, t: t });
  
  
  var wrapped = s.invoke(function() {
    t.equal(fixture('object').id, 'mock-invisible-man', 'wrapped source should return \'mock-invisible-man\'');
  }, { mockObj: mockObj, t: t });
  

  s.invoke(function() {
    t.equal(fixture('object').id, 'mock-invisible-man', 'compressed source should return \'mock-invisible-man\'')
  }, { mockObj: mockObj, t: t });

});

test('chained use', function(t) {

  t.plan(1);
  
  mock(fixture, 'fixture')
  .inject('pObject', 'mockObj')
  .invoke(function() {
    t.equal(fixture('object').id, 'chained-invisible-man', 'chained use should return \'chained-invisible-man\'')
  }, { mockObj: { id: 'chained-invisible-man' }, t: t })

});