// vm-shim.js
(function(){

  var vm_shim = {
    runInContext : runInContext
  }

  if (typeof global == 'undefined') {
    global = window;
  }
        
  //console && console.log(global);
  //console && console.log('vm-shim.js');

  // wrapped so we could try it in firebug/browser
  if (typeof module != 'undefined' && module.exports) {
    module.exports = vm_shim;
  } else {
    global.vm = vm_shim;
  }
  
  // Object.keys shim (IE < 9, etc.) copied from:
  // http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html
  if (!Object.keys) {
    Object.keys = function(o) {
      if (o !== Object(o)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      var k=[], p;
      for (p in o) {
        if (Object.prototype.hasOwnProperty.call(o,p)) {
          k.push(p);
        }
      }
      return k;
     }
  }
  
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        'use strict';
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
  }
  
  function runInContext(src, context, filename) {

    typeof src == 'string' || (src = '(' + src.toString() + '())');
  
    var code = '(function t(context){\n';
    
    Object.keys(context).forEach(function(key, context){
     code += 'var ' + key + ' = context.' + key + ';\n';
    });

    code += 'context = null; delete context;\n';
    code += src;
    code += '\n}(context))' ;

    //console.log(code.toString());
   
    var fn = Function('context', code);
    //console.log(fn.toString());
    fn(context);
  }

}());
