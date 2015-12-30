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
      return this.parentModel ? this.parentModel.url() +
        Tags.Library.url : undefined;
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

  Tags.View = Backbone.View.extend({
    events: {
      'click #detach': 'detachTag'
    },
    /**
     * Detach current tag from the model
     * @return {void}
     */
    detachTag: function() {
      var self = this;
      this.model.destroy({
        wait: true,
        success: function(model, response) {
          self.remove();
        }
      });
    },
  });

  Tags.TagsView = Backbone.View.extend({
    /**
     * Set the parent model.
     * Fetch the tags related with this user and render them.
     * @param  {object} options Contains the parameters such as parentModel
     * @return {void}
     */
    initialize: function(options) {
      var self = this;
      this.editElement = options.editElement || this.editElement;
      this.collection = new Tags.Collection([], {
        parentModel: options.parentModel
      });
      this.collection.fetch({
        wait: true,
        success: function() {
          self.render();
        }
      });

      // this.listenTo(this.collection, 'add', this.renderTag);
      // this.listenTo(this.collection, 'reset', this.render);
    },
    renderTag: function(item) {
      var self = this;
      var tagView = new Tags.View({
        model: item,
        editElement: this.editElement
      });
      this.$el.append(tagView.render().el);
      // get events triggered from note view and propagate them
      noteView.on('tag:detached', function() {
        self.collection.remove(tagView.model);
        self.trigger('tag:detached');
      });
      noteView.on('tag:aborted', function() {
        self.trigger('tag:aborted')
      });
      noteView.on('tag:saved', function() {
        self.trigger('tag:saved')
      });
    },
    /**
     * Render tags collection by rendering each tag it contains
     * @return {void}
     */
    render: function() {
      this.collection.each(function(item) {
        this.renderTag(item);
      }, this);
    }
  });

  return Tags;
});
