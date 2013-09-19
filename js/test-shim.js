(function() {

  console.log('test-shim');
  
  vm.runInNewContext("console.log('should be null: ' + context); console.log('string'); console.log(string);", { string: 'string value'});
  vm.runInNewContext("console.log('should be null: ' + context); console.log('number'); console.log(number);", { number: 347.347});
  vm.runInNewContext("console.log('should be null: ' + context); console.log('boolean'); console.log(boolean);", { boolean: true});
  
  vm.runInNewContext(function(){
    console.log('should be null: ' + context); 
    console.log('function');
    console.log('should be an id/string: ' + object.id);
  }, { object: { id: 'an id/string'} });

}());
