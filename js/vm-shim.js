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
      value = context[key];
      values.push(typeof value != 'string' && value || "'" + value + "'");
    });

    console.log(values)
    typeof code == 'string' || (code = '(' + code.toString() + '())');
  
    code = '(function t(' + names.join(',') + '){\n' + code + '\n}(' + values.join(',') + '))';

    console.log(code);
   
    var fn = Function(code);
    fn()

    
  }
  
  global.vm = {
    runInNewContext : runInNewContext
  }
  
}());

vm.runInNewContext("console.log('string'); console.log(text);"), { text: 'some text'});

vm.runInNewContext(function(){
  console.log('function');
  console.log(text);
  console.log(object);
}, { text: 'some text', object: { id: 'object' }});
