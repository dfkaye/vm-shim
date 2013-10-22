
console.log 'tape-test.coffee here'

# vm-shim node-test
test = require 'tape'
vm = require('../vm-shim.js')

### TESTS ###

test 'contains runInContext()', (t) ->

  t.plan(1)
  
  t.equal(typeof vm.runInContext, 'function')

  
test 'passes t', (t) ->

  t.plan(1)
  
  vm.runInContext "t.ok(true)"
    , { t: t }


test 'context not leaked', (t) ->

  t.plan(1)
  
  vm.runInContext "t.ok(!context)"
    , { t: t }

    
test 'passing require', (t) ->
  
  t.plan(1)
  
  vm.runInContext ->
  
      junk = require './junk-drawer.js'
      
      t.equal('junk drawer', junk.name, 'should find junk drawer')
      
    , { require: require,  t: t }


test 'string property', (t) ->

  t.plan(1)
  
  vm.runInContext "t.equal(string, 'string value')"
    , { string: 'string value', t: t }


test 'number property', (t) ->

  t.plan(1)
  
  vm.runInContext "t.equal(number, 347.347)"
    , { number: 347.347, t: t }


test 'boolean property', (t) ->

  t.plan(1)
  
  vm.runInContext "t.equal(boolean, true)"
    , { boolean: true, t: t }


test 'object property', (t) ->

  t.plan(1)
  
  vm.runInContext "t.equal(object.id, 'an id/string')"
    , { object: { id: 'an id/string' }, t: t }


test 'accepts function as src-code', (t) ->

  t.plan(2)

  vm.runInContext ->
  
    t.equal(context, undefined) 
    t.equal(object.id, 'an id/string')
    
  , { object: { id: 'an id/string' }, t: t }


test "can modify values", (t) ->

  t.plan(2)
  count = 2
    
  vm.runInContext "count += 1; t.equal(count, 3)"
    , { count: 2, t: t }
    
  t.equal(count, 2)

  
test "can modify values in functions", (t) ->

  t.plan(2)
  count = 2
    
  vm.runInContext ->
    
    count += 1
    t.equal(count, 3)
    
  , { count: count, t: t }
    
  t.equal(count, 2)


test 'vm internals not leaked', (t) ->

  t.plan(4)

  vm.runInContext ->
  
    undef = 'undefined'
    
    t.equal(typeof context, undef) 
    t.equal(typeof code, undef) 
    t.equal(typeof src, undef) 
    t.equal(typeof key, undef) 
          
  , { t: t }


test 'overrides external scope vars with context attrs', (t) ->

  t.plan(2)

  attr = "shouldn't see this"
   
  vm.runInContext ->
  
    t.equal(attr, 'ok')
    t.notEqual(attr, 'should not see this')

  , { attr: 'ok', t: t }


test 'bad code throws error', (t) ->

  t.plan(2)
  
  exec = () ->

    msg = 'barf is not defined'
    
    throwIt = () ->
      barf
  
    # capture it
    t.throws(throwIt)

    # now try it and view the console
    try
      throwIt()
    catch e 
      #console.dir(e) # keep around for Error type output
      t.equal(e.message, /\'?barf\'? is (un|not )defined/.exec(e.message)[0])

  vm.runInContext( exec, { t: t })


test 'global and vm not leaked', (t) ->

  t.plan(3)
  
  vm.runInContext ->
  
    undef = 'undefined'
  
    t.equal(typeof global.vm, undef)
    t.equal(typeof vm, undef)
    
  , { t: t }
  
  t.notEqual(typeof vm, 'undefined', 'should preserve vm')


test "runInNewContext: global and vm not shared", (t) ->

  t.plan(3)
      
  vm.runInNewContext ->
  
    undef = 'undefined'

    t.equal(typeof global.vm, undef)
    t.equal(typeof vm, undef)
    
  , { t: t }
  
  t.notEqual(typeof vm, 'undefined', 'should preserve vm')


test "runInThisContext: global shared", (t) ->

  t.plan(1)
  
  global.t = t
  global.vm = vm
  
  vm.runInThisContext ->
    global.t.equal(global.vm, vm)

  delete global.t
  delete global.vm
  

test "runInThisContext: context not leaked", (t) ->

  t.plan(2)

  control = 'outer'
  global.t = t

  vm.runInThisContext ->
    control = 'inner'
    global.t.equal(control, 'inner')

  delete global.t
    
  # should preserve control
  t.equal(control, 'outer')
