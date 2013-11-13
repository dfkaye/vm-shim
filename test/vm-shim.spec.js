// vm-shim.spec.js

var vm = vm || (function() {
  if (typeof require == 'function') {
    return require('../vm-shim');
  }
}());

describe('vm-shim', function () {

  it('should exist', function () {
    expect(vm).toBeDefined();
  });
  
  describe('runInContext', function () {
  
    describe('string arg', function () {
    
      it('should exist', function () {
        expect(typeof vm.runInContext).toBe('function');
      });
      
      it('should return context object', function () {
        var context = vm.runInContext('', { name: 'test' });
        expect(context.name).toBe('test');
      });
      
      it('should modify context properties', function () {
        var context = { name: 'test' };
        vm.runInContext('name = "modified"', context);
        expect(context.name).toBe('modified');
      });
      
      it('should pass and invoke expect() function', function () {
        var pass = false;
        var context = { pass: pass, expect: expect };
        vm.runInContext('expect(pass).toBe(false); pass = true;', context);
        expect(context.pass).toBe(true);
      });

      it('should not leak internals', function () {
        var context = {
          expect: expect, 
          pass: false
        };
        
        // src and code are internal vars for runInContext
        vm.runInContext(
          'expect(typeof code).toBe("undefined");expect(typeof src).toBe("undefined");pass = true;', 
          context);
        expect(context.pass).toBe(true);
      });
      
      it("should not leak accidental (un-var'd) globals", function() {

        vm.runInContext(function(){
          accidental = 'peekaboo from runInContext';
        }, {});
        
        // /*verify accidental doesn't leak*/
        expect(global.accidental).not.toBeDefined();
      });      
    });
  
    describe('function arg', function () {
    
      it('should accept function as sourcecode argument', function () {
      
        var pass = false;
        
        function src() {
          expect(item.id).toBe('function argument test');
          pass = true;
        };

        var context = { 
          item: { id: 'function argument test' }, 
          pass: pass, 
          expect: expect
        };
        
        vm.runInContext(src, context);
        expect(context.pass).toBe(true);
      });
      
      it('should call require() in context', function () {
      
        var require = require || function () {
          return { name: 'junk drawer'};
        };
        
        vm.runInContext(function() {
          var junk = require('./junk-drawer.js');
          expect(junk.name).toBe('junk drawer');
        }, { require: require,  expect: expect });
      });
      
      it('should throw error on bad sourcecode', function() {
      
        /*
         * long test with bigger setup
         * verifies we can trap errors
         * read the error message
         * and still return the context object
         */
        function exec(){
          /* 
           * matcher for error message variants between IE vs FF vs WK...
           * - opera: Undefined variable: barf
           * - IE 'barf' is undefined
           * - Chrome, Firefox: barf is not defined
           */
          var errorMatcher = /(Undefined variable: barf)|(\'barf\' is undefined)|(barf is not defined)/;
          
          function throwIt() { barf }
        
          // capture it
          expect(throwIt).toThrow();

          // now try it and view the console
          try {
            throwIt();
          } catch(e) {
            //console.dir(e); // keep around for Error type output
            expect(e.message).toMatch(errorMatcher);
          }
        };
        
        var context = vm.runInContext(exec, { expect: expect });
        expect(context.expect).toBe(expect);
      });
    });
  });
  
  describe('runInNewContext', function () {
  
    it('should exist', function () {
      expect(typeof vm.runInNewContext).toBe('function');
    });
    
    it('should return context object', function () {
      var context = { name: 'test' };
      var result = vm.runInNewContext('', context);
      expect(result).toBe(context);
      expect(result.name).toBe('test');
    });
    
    it('should *not* share global and vm by default', function () {
    
      var outerGlobal = global;
      
      vm.runInNewContext(function() {
      
        expect(typeof vm).toBe('undefined')
        expect(typeof global.vm).toBe('undefined')
        expect(outerGlobal).not.toBe(global);
        
      }, { expect: expect, outerGlobal: outerGlobal, global: outerGlobal });
    
      expect(outerGlobal).toBe(global);
    });
    
    it('should share vm', function () {
    
      vm.runInNewContext(function() {
      
        expect(vm).toBeDefined();
        expect(global.vm).toBeDefined();
      
      }, { expect: expect, vm: vm });
    });
    
    it("should not leak accidental (un-var'd) globals", function() {

      vm.runInNewContext(function(){
        accidental = 'peekaboo from runInNewContext';
      }, {});
      
      expect(global.accidental).not.toBeDefined();
    });      
  });

  describe('runInThisContext', function () {
  
    it('should exist', function () {
      expect(typeof vm.runInThisContext).toBe('function');
    });
    
    it('should not return result if sourcecode is empty', function () {
      var context = vm.runInThisContext('');
      expect(context).not.toBeDefined();
    });
    
    it('should eval sourcecode', function () {
      var usingVar = vm.runInThisContext('1;');
      expect(usingVar).toBe(1);
    });
    
    it('should have access to global', function () {
      var pass = false;
      
      global.fakeout = function() {
        expect(pass).toBe(false);
        pass = true;
      };
      
      vm.runInThisContext('fakeout();');
      expect(pass).toBe(true);
      
      delete global.fakeout;
    });
    
    it('should not have access to locals', function () {
      var localvar = 'outer';
      var result = vm.runInThisContext('typeof localvar != "undefined" || (localvar = "inner");');
      expect(result).toBe('inner');
      expect(localvar).toBe('outer');
    });
    
    it("should not leak accidental (un-var'd) globals", function() {

      vm.runInThisContext(function(){
        accidental = 'peekaboo from runInThisContext';
      });
      
      expect(global.accidental).not.toBeDefined();
    });
    
    it('should accept function as sourcecode', function () {
    
      var localVar = 123;
      
      var usingVar = vm.runInThisContext(function() {
         localVar = 1;
      });
      
      expect(usingVar).toBe(1);   
      expect(localVar).toBe(123);
    });
    
    it("should not leak accidental (un-var'd) globals", function() {

      vm.runInThisContext(function(){
        accidental = 'peekaboo from runInThisContext';
        
        // localVar in previous test should not have leaked
        expect(global.localVar).not.toBeDefined();        
      });
      
      // new accidental should not leak
      expect(global.accidental).not.toBeDefined();
    });
    
    it('should have access to global', function () {
      vm.runInThisContext(function() {
        expect(global).toBeDefined();
      });
    });
    
    it('should share global', function () {
    
      var outerGlobal = global;
      
      var innerGlobal = vm.runInThisContext(function() {
         innerGlobal = global;
      });
      
      expect(innerGlobal).toBe(outerGlobal);
    });

    it('should have access to vm', function () {
      vm.runInThisContext(function() {
        expect(vm).toBeDefined();      
      });
    });
  });
});

/*
  // original console tests - archiving for posterity :)
  
  vm.runInContext("console.log('should be null: ' + context); console.log('string'); console.log(string);", 
    { string: 'string value' });
    
  vm.runInContext("console.log('should be null: ' + context); console.log('number'); console.log(number);", 
    { number: 347.347 });
    
  vm.runInContext("console.log('should be null: ' + context); console.log('boolean'); console.log(boolean);", 
    { boolean: true });
  
  vm.runInContext(function(){
    console.log('should be null: ' + context); 
    console.log('function');
    console.log('should be an id/string: ' + object.id);
  }, { object: { id: 'an id/string' } });
  
*/