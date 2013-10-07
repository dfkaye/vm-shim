// vm-shim browser-spec

describe("vm-shim suite", function() {
  
  it("contains runInContext()", function() {
  
    expect(typeof vm.runInContext).toBe('function');
  });
  
  // rest of these lean on vm to execute assertions
  
  it("passes expect to context", function() {
  
    vm.runInContext("expect(true).toBe(true);", { 
        expect: expect
    });
  });  
    
  it("context not leaked", function() {
  
    vm.runInContext("expect(context).toBe(undefined);", { 
        expect: expect
    });
  });
  
  it("passes string value", function() {
  
    vm.runInContext("expect(string).toBe('string value');", { 
        expect: expect,
        string: 'string value'
    });
  });
  
  it("passes number value", function() {
  
    vm.runInContext("expect(number).toBe(347.347);", { 
        expect: expect,
        number: 347.347
    });
  });
  
  it("passes boolean value", function() {
  
    vm.runInContext("expect(boolean).toBe(true);", { 
        expect: expect,
        boolean: true
    });
  });

  it("passes objects as properties", function() {

    vm.runInContext("expect(object.id).toBe('an id/string');", { 
      expect: expect,
      object: { id: 'an id/string' } 
    });
  });

  it("accepts function as src-code", function() {

    vm.runInContext(function(){
  
      expect(context).toBe(undefined);
      expect(object.id).toBe('an id/string');
    
    }, { object: { id: 'an id/string' }, expect: expect });
  });

  it("can modify var values", function() {

    var count = 2;
    
    vm.runInContext("count += 1;expect(count).toBe(3);", { count: 2, expect: expect });
    
    expect(count).toBe(2);
  });
  
  it("can modify var values in functions", function() {

    var count = 2;
    
    vm.runInContext(function(){
    
      count += 1;
      
      expect(count).toBe(3);
    
    }, { count: count, expect: expect });
    
    expect(count).toBe(2);
  });

  it("vm internals not leaked", function() {

    vm.runInContext(function(){
    
      var undef = 'undefined';
      
      expect(context).not.toBeDefined();

      expect(typeof code).toBe(undef);
      expect(typeof src).toBe(undef);
      expect(typeof key).toBe(undef);
      
    }, { expect: expect });
  });
  
  it("overrides external scope vars with context attrs", function() {

    var attr = "shouldn't see this";
   
    vm.runInContext(function(){
  
      expect(attr).toBe('ok');
      expect(attr).not.toBe('should not see this');

    }, { attr: 'ok', expect: expect });
  });
  
  it("bad code throws error", function() {
    
    function exec(){
      
      function throwIt() {
        barf;
      }

      // now try it and view the console
      try {
        throwIt();
      } catch (e) {
        if (typeof console != 'undefined') {
          console.log(e.message);
        }
        
        // matcher for msg variants between IE vs FF vs WK...
        
        // opera: Undefined variable: barf
        // IE 'barf' is undefined
        // chrome, ff: barf is not defined
        expect(e.message).toMatch(/barf/);
        expect(e.message).toMatch(/(not defined|undefined)/i);
      }
    }
    
    vm.runInContext(exec, { expect: expect });
  });
  
  it("runInNewContext: global and vm not shared", function() {

    vm.runInNewContext(function(){
    
      var undef = 'undefined';

      expect(global.vm).not.toBeDefined();
      expect(global).not.toBe(window);
      
    }, { expect: expect, global: global });
    
    // should preserve vm
    expect(typeof vm).not.toBe('undefined');
  });
  
  
  it("runInThisContext: global shared", function() {
    
    vm.runInThisContext(function(){
    
      expect(global.vm).toBe(vm);
      expect(global).toBe(window);
    });
  });
  
  it("runInThisContext: context not leaked", function() {

    var control = 'outer';
    
    vm.runInThisContext(function(){
    
      control = 'inner';
      expect(control).toBe('inner');
    });
    
    // should preserve control
    expect(control).toBe('outer');
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
