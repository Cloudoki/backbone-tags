(function(root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone'],
      function(Backbone) {
        return main(Backbone);
      });
    // CommonJS
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = main(require('backbone'));
    // Globals
  } else {
    root.Tags = main(root.Backbone);
  }
})(this, function(Backbone) {
  'use strict';

});
