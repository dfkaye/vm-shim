// scope.spec.js
// scope-injection-test.js

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
    invoke : function (fn) {
      fn = !fn ? '' : fn.toString();
      return source + ';\n' + '(' + fn + '());';
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


describe('scope', function () {


  describe('smoke test', function () {
  
    var ready;
    
    beforeEach(function () {
      ready = true;
    });
    
    afterEach(function () {
      ready = false;
    });
    
    it('should run', function () {
      expect(ready).toBe(true);
    });
    
    it('should find fixture', function () {
      expect(typeof fixture).toBe('function');
    });
    
  });
  
});