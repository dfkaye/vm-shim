// vm-shim browser-spec

describe("vm-shim suite", function() {

  /*it("contains spec with an expectation", function() {
    expect(true).toBe(true);
  });*/
  
  it("contains runInContext() ", function() {
    expect(typeof vm.runInContext).toBe('function');
  });
  
  it("passes expect to context", function() {
    vm.runInContext("expect(true).toBe(true);", { 
        expect: expect
      });
  });  
    
  it("context not leaked", function() {
    vm.runInContext("expect(context).toBe(null);", { 
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
  
    var fn = function(){
      expect(context).toBe(null); 
      expect(object.id).toBe('an id/string');
    };
    
    vm.runInContext(fn, { 
        expect: expect,
        object: { id: 'an id/string' }
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
