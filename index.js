(function(root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'mustache'],
      function(Backbone, Mustache) {
        return main(Backbone, Mustache);
      });
    // CommonJS
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = main(require('backbone'), require('mustache'));
    // Globals
  } else {
    root.Tags = main(root.Backbone, root.Mustache);
  }
})(this, function(Backbone, Mustache) {
  'use strict';

  var Tags = Object.create(null);

  Tags.Model = Backbone.Model.extend({
    /**
     * checks if only has id and no tag data
     * @return {Boolean} true if it has fetched data
     */
    hasData: function() {
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
      return Tags.Library.get(this.get('id') || this.get('tagId'));
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

  var bloodhound = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    identify: function(obj) {
      return obj.id;
    },
    remote: {
      rateLimitWait: 1000,
      url: Tags.Library.url + '?search=%QUERY',
      wildcard: '%QUERY',
      filter: function(tags) {
        return $.map(tags, function(tag) {
          return tag;
        });
      }
    }
  });

  Tags.TagsView = Backbone.View.extend({
    el: 'body',
    typeahead: '.typeahead',
    tagsElement: $('#tags'),
    oldModels: {},
    suggestionTemplate: '<h6>No template for suggestions, please add one.</h6>',
    viewTemplate: '<h6>No template for view, please add one.</h6>',
    editTemplate: '<h6>No template for edit, please add one.</h6>',
    /**
     * Set the parent model.
     * Fetch the tags related with this user and render them.
     * @param  {object} options Contains the parameters such as parentModel
     * @return {void}
     */
    initialize: function(options) {
      var self = this;
      this.typeahead = options.typeaheadElement || this.typeahead;
      this.tagsElement = options.tagsElement || this.tagsElement;
      this.suggestionTemplate = options.suggestionTemplate ||
        this.suggestionTemplate;
      this.viewTemplate = options.viewTemplate || this.viewTemplate;
      this.editTemplate = options.editTemplate || this.editTemplate;
      this.collection = new Tags.Collection([], {
        parentModel: options.parentModel
      });
      this.collection.fetch({
        wait: true,
        success: function() {
          var ids = self.collection.models.map(function(model) {
            return model.id;
          });
          console.log(ids);
          Tags.Library.fetch({
            data: {
              id: ids
            },
            success: function() {
              self.render();
            }
          });
        }
      });
    },
    editTags: function() {
      var self = this;
      this.oldModels = this.collection.clone();
      this.oldModels.parentModel = this.collection.parentModel;
      this.tagsElement.html(this.editTemplate);
      $(this.typeahead).tagsinput({
        typeaheadjs: [{
          hint: true,
          highlight: true,
          minLength: 3
        }, {
          name: 'tags',
          displayKey: 'text',
          source: function(query, syncResults, asyncResults) {
            bloodhound.search(query, syncResults, function(suggestions) {
              var filtered = suggestions.filter(function(suggestion) {
                return suggestion.text.toLowerCase().indexOf(query.toLowerCase()) >= 0;
              });
              asyncResults(filtered);
            });
          },
          templates: {
            notFound: '<div class="notFound">0 results found</div>',
            pending: '<div class="pending">pending</div>',
            header: '<div class="headerSuggestion"></div>',
            footer: '<div class="footerSuggestion"></div>',
            suggestion: function(context) {
              return Mustache.render(self.suggestionTemplate, context);
            }
          }
        }],
        itemValue: function(item) {
          return item.text;
        }
      });
      $(this.typeahead).on('itemAdded', function(event) {
        // console.log("added item", event.item);
        Tags.Library.add(event.item);
        var exists = _(self.collection.models).some(function(model) {
          return event.item.inCollection;
        });
        if (!exists) {
          self.collection.add({
            tagId: event.item.id
          });
        }
      });
      $(this.typeahead).on('itemRemoved', function(event) {
        // console.log("removed item", event.item);
        var model = self.collection.get(event.item.cid);
        if (!model.isNew()) {
          model.destroy();
        }
        self.collection.remove(model);
      });
      this.collection.each(function(item) {
        var model = item.getTag().toJSON();
        model.cid = item.cid;
        model.inCollection = true;
        $(self.typeahead).tagsinput('add', model);
      });
    },
    saveTags: function() {
      this.oldModels = this.collection.clone();
      this.oldModels.parentModel = this.collection.parentModel;
      this.tagsElement.html("");
      this.collection.each(function(model) {
        if (model.isNew()) {
          model.save();
        }
      });
      // Backbone.sync('create', this.collection, {
      //   success: function() {
      //     console.log('Saved!');
      //   }
      // });
      this.render();
    },
    cancelEdit: function() {
      this.tagsElement.html("");
      this.collection = this.oldModels;
      this.render();
    },
    renderTag: function(item) {
      var self = this;
      this.tagsElement.append(Mustache.render(this.viewTemplate, item.toJSON()));
    },
    /**
     * Render tags collection by rendering each tag it contains
     * @return {void}
     */
    render: function() {
      this.collection.each(function(item) {
        this.renderTag(item.getTag());
      }, this);
    }
  });

  return Tags;
});
