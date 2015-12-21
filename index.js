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

  var Tags = Object.create(null);

  Tags.Model = Backbone.Model.extend({
    /**
     * checks if only has id and no tag data
     * @return {Boolean} true if it has fetched data
     */
    isEmpty: function() {
      return Object.keys(this.attributes).length > 1 && this.get('id');
    }
  });

  /**
   * Backbone Model containing the tag Id used as reference
   */
  Tags.Reference = Backbone.Model.extend({
    /**
     * Retrieves the corresponding tag
     *
     * @return {Backbone.Model} tag model instance
     */
    getTag: function() {
      return Tags.Library.get(this.get('id'));
    },
    /*
     * Overwrites set to add tag reference to main library
     */
    set: function(attrs, opts) {
      // if there's a new tag id that is not in library add it
      if (attrs.id && !Tags.Library.get(attrs.id)) {
        var added = Tags.Library.add({
          id: attrs.id
        });
      }
      return Backbone.Model.prototype.set.call(this, attrs, opts)
    }
  });
  /**
   * Collection of references to Tags associated with a parent Model
   */
  Tags.Collection = Backbone.Collection.extend({
    model: Tags.Reference,
    initialize: function(models, options) {
      this.parentModel = options.parentModel;
    },
    /**
     * Associate collection url to the parent Model
     * @return {string | undefined}
     */
    url: function() {
      return this.parentModel ? this.parentModel.url() + Tags.Library.url : undefined;
    }
  });

  var TagsLibrary = Backbone.Collection.extend({
    model: Tags.Model,
    url: '/tags'
  });
  /**
   * Store of all the tags models
   * @type {Backbone.Collection}
   */
  Tags.Library = new TagsLibrary();
  return Tags;
});
