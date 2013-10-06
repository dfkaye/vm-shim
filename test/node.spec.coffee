
# jasmine-node --coffee *.spec.coffee

vm = require '../vm-shim'


describe 'smoke test', ->
  it 'should be ok', ->
    expect(vm).toBeDefined()

      
describe 'runInContext', ->

  it 'should find string', ->
  
    vm.runInContext "expect(value).toBe(true)", { 
      expect: expect, value: true 
    }
    
  it 'should find number', ->
  
    vm.runInContext "expect(value).toBe(1)", { 
      expect: expect, value: 1 
    }
    
  it 'should find boolean', ->
  
    vm.runInContext "expect(value).toBe(false)", { 
      expect: expect, value: false 
    }

  it 'should find object property', ->
  
    vm.runInContext "expect(value.property).toBe('found it')", { 
      expect: expect, 
      value: { property: 'found it' } 
    }

  it 'should accept function as src-code', ->
  
      # note: use of parentheses surrounding the first argument (a function)
      
      vm.runInContext (-> 
          expect(value.property).toBe('found it')
          
        ), { expect: expect, value: { property: 'found it' } }

  it 'modifies var in string', ->

      count = 2
    
      vm.runInContext "count += 1;expect(count).toBe(3)", { 
        expect: expect,
        count: 2 
      }
    
      expect(count).toBe(2)
  
  it 'modifies var in function', ->

      count = 2
    
      vm.runInContext (-> 
          count += 1
          expect(count).toBe(3)
          
      ), { 
        expect: expect,
        count: 2 
      }
    
      expect(count).toBe(2)
      
  it 'does not leak internals ', ->

    vm.runInContext (->
    
      undef = 'undefined'
    
      expect(context).not.toBeDefined()
      expect(typeof code).toBe(undef)
      expect(typeof src).toBe(undef)
      expect(typeof key).toBe(undef)
      
    ), { expect: expect }
    
  it 'uses vars from context and not from external scope', ->

    attr = 'should not see this'
    
    vm.runInContext (->
      
      expect(attr).toBe('ok')
      expect(attr).not.toBe('should not see this')
      
    ), { attr: 'ok', expect: expect }
    

  it 'throws error if bad code', ->
  
    exec = () ->
    
      throwIt = () ->
        barf
        
      try
        throwIt()
      catch e
        # matcher for msg variants between IE vs FF vs WK...
        
        # opera: Undefined variable: barf
        # IE 'barf' is undefined
        # chrome, ff: barf is not defined
        expect(e.message).toMatch(/barf/);
        expect(e.message).toMatch(/(not defined|undefined)/i);
      
      
    # notice that first fn argument being named does not require parentheses to 
    # be disambiguated
    vm.runInContext exec, { expect: expect }

    

describe 'runInNewContext', ->

  it 'should not share global and vm', ->   
        
      vm.runInNewContext (-> 
      
          undef = 'undefined'

          expect(typeof global.vm).toBe(undef)
          expect(typeof vm).toBe(undef)
      
        ), { expect: expect }
    
      expect(typeof vm).toBeDefined('undefined')

      
      
describe 'runInThisContext', ->

  it 'shares global', ->
  
      global.expect = expect;
      global.vm = vm;
  
      vm.runInThisContext( ->
        expect(global.vm).toEqual(vm)
      )
    
      delete global.expect
      delete global.vm

  it "does not leak context", ->

      control = 'outer'
      global.expect = expect

      vm.runInThisContext( ->
        control = 'inner'
        global.expect(control).toBe('inner')
      )

      delete global.expect
    
      # should preserve control
      expect(control).toBe('outer')
