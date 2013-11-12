// vm-shim.js

(function(vm, undefined){

  if (typeof global == 'undefined' && window) {
  
    // bit from substack's iframe based vm-browserify at
    // https://github.com/substack/vm-browserify/blob/master/index.js#L37-40
    if (!window.eval && window.execScript) {
        // win.eval() magically appears when this is called in IE:
        window.execScript('null');
    }
  
    global = window;
  }
  
  vm = {
    runInContext     : runInContext,
    runInNewContext  : runInNewContext,
    runInThisContext : runInThisContext
  }

  if (typeof module != 'undefined') {
    module.exports = vm;
  } else {
    global.vm = vm;
  }
  
  // src may be a string or a function
  // context is a config object of properties to be used as vars inside the new scope
  function runInContext(src, context/*, filename*/) {
    
    var code = '';
    
    for (var key in context) {
      if (context.hasOwnProperty(key)) {
        code += 'var ' + key + ' = context[\'' + key + '\'];\n';
      }
    }
    
    typeof src == 'string' || (src = '(' + src.toString() + '())');

    // Yep ~ using `with` ~ who said you can't use `with` ~ WHO THE F*** SAID THAT    
    code += 'with(context){' + src + '}';

    var arr = keys(global);
    
    Function('context', code).call(null, context);
    
    scrub(arr);

    return context;
  }
  
  // src may be a string or a function
  // context is a config object of properties to be used as vars inside the new scope  
  function runInNewContext(src, context/*, filename*/) {

    // Object.create shim to shadow out the main global
    function F(){}
    F.prototype = (typeof Window != 'undefined' && Window.prototype) || global;
    context.global = new F;
    
    // This statement resets vm references in the new sandbox:
    // + fixes browser reference if vm is not passed in (so we don't provide it)
    // + fixes node.js reference if vm is passed in (make it available to new global)
    context.global.vm = context.vm = context.vm;
    
    return runInContext(src, context/*, filename*/);
  }

  // src may be a string or a function
  function runInThisContext(src/*, filename*/) {
  
    var code = src;
    
    if (typeof src == 'function') {
      code = src.toString();
      code = code.substring(code.indexOf('{') + 1, code.lastIndexOf('}') - 1);//.replace(/^\s*/, '');
    }

    // new shim coming up:
    // Unbelievably, eval() & Function() don't take functions as args; 
    // eval() leaks un-var'd symbols in browser & node.js
    // thus, defeating the purpose.
    
    var arr = keys(global);
    var result = eval(code);
    
    scrub(arr);
    
    return result;
  }
  
  // helpers for scrubbing "accidental" un-var'd globals from eval()
  
  function keys(o) {
    var res = {};
    for (var k in o) {
      res[k] = k;
    }
    return res;
  };
  
  function scrub(arr) {
    for (var k in global) {
      if (!(k in arr)) {
        delete global[k];
      }
    }
  }
  
}());