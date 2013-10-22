// scope-injection-test.js

// vm-shim tape-test
var test = require('tape');
var vm = require('../vm-shim.js');

/*** FIXTURES ***/

var sut = (function(){
  
  var pValue = 444;
  var pObject = { id: 'invisible man' };

  function pFunc() {
    return true;
  }

  function f() {
    return pFunc();
  }
  
  return f;
}());



var mock = function (fn, alias) {

  var source = fn.toString();
  
  if (typeof alias == 'string') {
    source = source.replace(/function[^\(]*/, 'function ' + alias);
  }
  
  return {
    source : source,
    inject : function (key, value) {
      this.source = this.source.replace(key, value)
      return this;
    },
    invoke : function (fn) {
      fn = !fn ? '' : fn.toString();
      return this.source + ';\n' + '(' + fn + '());';
    }
  }
};


/*** TESTS ***/

test('fixtures', function (t) {

  t.plan(4);
  
  t.equal(typeof sut, 'function', 'sut should be a function'); 
  t.equal(typeof mock, 'function', 'mock should be a function');
  t.equal(typeof mock(sut).inject, 'function', 'inject should be a function');
  t.equal(sut(), true, 'sut() should return true');
});

test('inject', function (t) {

  t.plan(4);

  var s = mock(sut, 'sut');
  
  t.equal(s.source.indexOf('function sut('), 0, 'mock should rename fn with alias');
  t.equal(s.inject('', ''), s, 'inject should return source holder');
  
  t.ok(s.source.indexOf('return pFunc()') != -1, 'should contain pFunc');
  
  s.inject('pFunc', 'mockFunc');
  
  t.ok(s.source.indexOf('return mockFunc()') != -1, 'should contain mockFunc');
  
});

test('invoke', function (t) {

  t.plan(4);
  
  var mockFunc = function () {
    return false;
  };
  
  var s = mock(sut, 'sut');
 
  s.inject('pFunc', 'mockFunc');
  
  
  var inlineSource = s.source + ';t.equal(false, sut(), \'inline source should return false instead of true\')';
  vm.runInContext(inlineSource, { mockFunc: mockFunc, t: t });
  
  
  function standalone() {
    t.equal(false, sut(), 'standalone function should return false instead of true');
  }
  vm.runInContext(s.invoke(standalone), { mockFunc: mockFunc, t: t });
  
  
  var wrapped = s.invoke(function() {
    t.equal(false, sut(), 'wrapped source should return false instead of true');
  });
  vm.runInContext(wrapped, { mockFunc: mockFunc, t: t });
  

  vm.runInContext(s.invoke(function() {
    t.equal(false, sut(), 'compressed source should return false instead of true')
  }), { mockFunc: mockFunc, t: t });

});
