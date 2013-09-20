// vm-shim browser-test
(function() {

  console.log('browser-test');
  
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

}());
