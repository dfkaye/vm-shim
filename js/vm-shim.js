(function(){

  var global = global || window;
  
  console.log(global);
  
  console.log('vm-shim.js');

  function runInNewContext(code, context, filename) {
    
    var names = [];
    var values = [];
    var value;
    
    Object.keys(context).forEach(function(key, i, keys){
      names.push(key);
      
      i < 1 || (values += ', ');
      //values += 'context["' + key + '"]';
      
      value = context[key];
      
      // more work to do on value type -
      // string - value
      // not object, not string - "'" + value + "'"
      // object not null
      
      console.log(value);
      values.push(typeof value != 'object' && "'" + value + "'" || value);
    });

    console.log(values)
    typeof code == 'string' || (code = '(' + code.toString() + '())');
  
    code = '(function t(context, ' + names.join(',') + '){\n' + code + '\n}(' ;
    code += values.join(',');
    code += '))';
   
    console.log(code.toString());
   
    //var fn = Function(code);
    
    //console.log(fn.toString());
    //fn();
  }
  
  global.vm = {
    runInNewContext : runInNewContext
  }
  
}());

vm.runInNewContext("console.log('string'); console.log(string);", { string: 'string value'});
vm.runInNewContext("console.log('number'); console.log(number);", { number: 347.347});
vm.runInNewContext("console.log('boolean'); console.log(boolean);", { boolean: true});

vm.runInNewContext(function(){
  console.log('function');
  console.log(object);
}, { object: { id: 'an object'} });
