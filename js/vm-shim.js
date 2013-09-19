(function(){

  var global = global || window;
  
  console.log(global);
  console.log('vm-shim.js');

  function runInNewContext(src, context, filename) {

    typeof src == 'string' || (src = '(' + src.toString() + '())');
  
    var code = '(function t(context){\n';
    (function() {
      var vars = ';\n';
      Object.keys(context).forEach(function(key){
        vars += 'var ' + key + ' = context.' + key + ';\n';
      });
      code += vars;
    }());
    code += src + '\n}(context))' ;
    //code += values.join(',');
    //code += '))';
    console.log(code.toString());
   
    var fn = Function('context', code);
    //console.log(fn.toString());
    fn(context);
  }
  
  global.vm = {
    runInNewContext : runInNewContext
  }
  
}());
