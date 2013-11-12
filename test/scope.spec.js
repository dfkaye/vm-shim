// scope.spec.js

var vm = vm || (function() {
  if (typeof require == 'function') {
    return require('../vm-shim');
  }
}());

  /*** SUBJECT - TO BE MOVED OUT ***/
  
function mockScope(fn, alias) {

  var source = fn.toString();
  
  if (typeof alias == 'string') {
    source = source.replace(/function[^\(]*/, 'function ' + alias) + '\n;';
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
  };
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
  
  describe('fixtures', function () {

    it('should be functions', function () {
      expect(typeof fixture).toBe('function');
      expect(typeof mockScope).toBe('function');
      expect(typeof mockScope(fixture).source).toBe('function');
      expect(typeof mockScope(fixture).inject).toBe('function');
      expect(typeof mockScope(fixture).invoke).toBe('function');
    });
    
    it('should have defaults', function () {
      expect(fixture()).toBe('pFuncified');
      expect(fixture('value')).toBe(444);
      expect(fixture('object').id).toBe('invisible man');
    });
    
  });

  describe('source & inject', function () {

    var s;
    
    afterEach(function () {
      s = undefined;
    });    
    
    beforeEach(function () {
      s = mockScope(fixture, 'fixture');
    });
    
    it('mockScope should rename fn with alias', function () {
      expect(s.source().indexOf('function fixture(')).toBe(0);
    });
    
    it('inject should return source holder', function () {
      expect(s.inject('', '')).toBe(s);
    });
    
    it('should inject mockFunc', function () {
      s.inject('pFunc', 'mockFunc')
      expect(s.source().indexOf('return mockFunc()')).not.toBe(-1);
    });
    
  });

  describe('invoke', function () {
  
    describe('with mockFunc', function () {
    
      var mockFunc = function mockFunc() {
        return 'mockified';
      };
      var s;
      var context;
      
      afterEach(function () {
        s = undefined;
        context = undefined;
      });
      
      beforeEach(function () {
        context = { mockFunc: mockFunc, expect: expect };
        s = mockScope(fixture, 'fixture');
        s.inject('pFunc', 'mockFunc');
      });
  
      it('should use inline source', function () {
        var inlineSource = s.source() + 'expect(fixture()).toBe(\'mockified\')';
        vm.runInNewContext(inlineSource, context);
      });
      
      it('should use standalone source', function () {
        function standalone() {
          expect(fixture()).toBe('mockified');
        }
        s.invoke(standalone, context);
      });
      
      it('should use fn param', function () {
        s.invoke(function() {
          expect(fixture()).toBe('mockified');
        }, context);
      });
      
      it('should return holder', function () {

        var result = s.invoke(function() {
          expect(fixture()).toBe('mockified');
        }, context);
        
        expect(result).toBe(s);
      });
      
    });

    describe('invoke with param \'value\'', function () {
    
      var mockValue = 777;
      var s;
      var context;
      
      afterEach(function () {
        s = undefined;
        context = undefined;
      });
      
      beforeEach(function () {
        s = mockScope(fixture, 'fixture');
        s.inject('pValue', 'mockValue');
        context = { mockValue: mockValue, expect: expect };
      });

      it('should use inline source', function () {
        var inlineSource = s.source() + 'expect(fixture(\'value\')).toBe(777)';
        vm.runInNewContext(inlineSource, context);
      });
      
      it('should use standalone source', function () {
        function standalone() {
          expect(fixture('value')).toBe(777);
        }
        s.invoke(standalone, context);
      });
      
      it('should use fn param', function () {
        s.invoke(function() {
          expect(fixture('value')).toBe(777);
        }, context);
      });

    });
    
    describe('invoke with param \'object\'', function () {
    
      var mockObj = { id: 'mockScope-invisible-man' };
      var s;
      var context;
      
      afterEach(function () {
        s = undefined;
        context = undefined;
      });
      
      beforeEach(function () {
        s = mockScope(fixture, 'fixture');
        s.inject('pObject', 'mockObj');
        context = { mockObj: mockObj, expect: expect };
      });

      it('should use inline source', function () {
        var inlineSource = s.source() + 'expect(fixture(\'object\').id).toBe(\'mockScope-invisible-man\')';
        vm.runInNewContext(inlineSource, context);
      });

      it('should use standalone source', function () {
        function standalone() {
          expect(fixture('object').id).toBe('mockScope-invisible-man');
        }
        s.invoke(standalone, context);
      });
      
      it('should use fn param', function () {
        s.invoke(function() {
          expect(fixture('object').id).toBe('mockScope-invisible-man');
        }, context);
      });
      
    });
    
    describe('chained use', function() {
      it('should work', function() {
        mockScope(fixture, 'fixture')
        .inject('pObject', 'mockObj')
        .invoke(function() {
          expect(fixture('object').id).toBe('chained-invisible-man');
        }, { mockObj: { id: 'chained-invisible-man' }, expect: expect })
      });
    });
    
  });
});
