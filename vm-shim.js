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
    runInContext      : runInContext,
    runInNewContext   : runInNewContext,
    runInThisContext  : runInThisContext
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

    return sandbox(function () {
      Function('context', code).call(null, context);
      return context;
    });
  }
  
  // src may be a string or a function
  // context is a config object of properties to be used as vars inside the new scope  
  function runInNewContext(src, context/*, filename*/) {

    context = context || {};
    
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

    return sandbox(function () {
      return eval(code);
    });
  }
  
  // sandbox is a helper function for scrubbing "accidental" un-var'd globals from eval()
  // Unbelievably, eval() & Function() don't take functions as args; 
  // eval() leaks un-var'd symbols in browser & node.js;
  // indirect eval() leaks ALL vars globally, 
  //  i.e., where var e = eval; e('var a = 7'); 'a' becomes global, thus, defeating the purpose.
  function sandbox(fn) {
  
    var keys = {};
    
    for (var k in global) {
      keys[k] = k;
    }
    
    var result = fn();
    
    for (var k in global) {
      if (!(k in keys)) {
        delete global[k];
      }
    }
    
    return result;
  }
  
}());