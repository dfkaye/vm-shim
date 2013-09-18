(function(){

  var global = global || window;
  
  console.log(global);
  
  console.log('vm-shim.js');

  function runInNewContext(code, context, filename) {
    
    var names = [];
    var values = [];
    
    Object.keys(context).forEach(function(key, i, keys){
      names.push(key);
      values.push(context[key]);
    });
    
    typeof code == 'string' || (code = '(' + code.toString() + '())');
    
    code = '(function t(' + names.join(',') + '){' + code + '}(' + values.join(',') + '))';
    
    //var fn = Function(code);
    
    //console.log(fn.toString());
    
  }
  
  global.vm = {
    runInNewContext : runInNewContext
  }
  
}());

vm.runInNewContext(function(){
  console.log('code');
  console.log(info);
}, { info: 'some info'})
