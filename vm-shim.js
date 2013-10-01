// vm-shim.js

(function(exports, undefined){

  if (typeof global == 'undefined') {
    global = window;
  }
  
  exports = {
    runInContext : runInContext
  }

  if (typeof module != 'undefined') {
    module.exports = exports;
  } else {
    global.vm = exports;
  }

  function runInContext(src, context/*, filename*/) {

    typeof src == 'string' || (src = '(' + src.toString() + '())');
    
    // Object.create shim
    function F(){}
    F.prototype = (typeof Window != 'undefined' && Window.prototype) || global;
    global = new F;
    global.vm = undefined;
    
    var code = 'var vm;\n';

    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        code += 'var ' + key + ' = context.' + key + ';\n';
      }
    }
    
    code += 'context = undefined; delete context;\n';
    code += src;

    Function('context', code).call(null, context);
  }

}());