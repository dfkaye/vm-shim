// suite.spec.js

if (typeof require == 'function') {
  require('./vm-shim.spec');
  require('./scope.spec');
}