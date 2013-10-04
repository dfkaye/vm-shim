// vm-shim.js

(function(exports, undefined){

  if (typeof global == 'undefined') {
    global = window;
  }
  
  exports = {
    runInContext     : runInContext,
    runInNewContext  : runInNewContext,
    runInThisContext : runInThisContext
  }

  if (typeof module != 'undefined') {
    module.exports = exports;
  } else {
    global.vm = exports;
  }

  function runInContext(src, context/*, filename*/) {

    typeof src == 'string' || (src = '(' + src.toString() + '())');
    
    var code = '';

    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        code += 'var ' + key + ' = context.' + key + ';\n';
      }
    }
    
    code += 'context = undefined; delete context;\n';
    code += src;

    return Function('context', code).call(null, context);
  }

  function runInNewContext(src, context/*, filename*/) {

    // Object.create shim
    function F(){}
    F.prototype = (typeof Window != 'undefined' && Window.prototype) || global;
    
    // shadow out the main global
    context.global = new F;
    
    return runInContext(src, context/*, filename*/)
  }

  function runInThisContext(src/*, filename*/) {
  
    return runInContext(src, global/*, filename*/)
  }
  
}());