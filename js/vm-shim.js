(function(){

  var global = global || window;
  
  console.log(global);
  console.log('vm-shim.js');
  
  // Object.keys shim (IE < 9, etc.) copied from:
  // http://tokenposts.blogspot.com.au/2012/04/javascript-objectkeys-browser.html
  if (!Object.keys) Object.keys = function(o) {
    if (o !== Object(o))
      throw new TypeError('Object.keys called on a non-object');
    var k=[],p;
    for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
    return k;
  }

  function runInContext(src, context, filename) {

    typeof src == 'string' || (src = '(' + src.toString() + '())');
  
    var code = '(function t(context){\n';
    (function() {

      Object.keys(context).forEach(function(key){
        code += 'var ' + key + ' = context.' + key + ';\n';
      });
      
      code += 'context = null; delete context;\n';
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
    runInContext : runInContext
  }
  
}());
