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
    args: {},
    initialize: function(models, options) {
      this.args = options;
      this.parentModel = options.parentModel;
    },
    /**
     * Associate collection url to the parent Model
     * @return {string | undefined}
     */
    url: function() {
      return this.parentModel ? this.parentModel.url() +
        Tags.Library.url : undefined;
    },
    /**
     * Overrides the clone() method to also clone the collection parameters
     * @return {Backbone.Collection}
     */
    clone: function() {
      return new this.constructor(this.models, this.args);
    }
  });

  /**
   * Store of all the tags models
   * @type {Backbone.Collection}
   */
  var TagsLibrary = Backbone.Collection.extend({
    model: Tags.Model,
    url: '/tags'
  });
  Tags.Library = new TagsLibrary();

  /**
   * Templates that will be used to render the content into the web page.
   * view - template for the view mode
   * edit - template for the edit mode
   * suggestion - object containing the templates for the suggestions
   *   text - the template for the text suggestion
   *   notFound - template for when suggestions are not found
   *   pending - template for when suggestions are being fetched
   *   header - template for the header of the suggestions menu
   *   footer - template for the footer of the suggestions menu
   * @type {Object}
   */
  Tags.Templates = {
    view: '<h6>No template for view, please add one.</h6>',
    edit: '<h6>No template for edit, please add one.</h6>',
    suggestion: {
      text: '<h6>No template for suggestions, please add one.</h6>',
      notFound: '<div class="notFound"></div>',
      pending: '<div class="pending"></div>',
      header: '',
      footer: '',
    }
  };

  /**
   * View for the tags
   * @param  {Object} options
   * @return {Backbone.View}
   */
  Tags.TagsView = Backbone.View.extend({
    typeahead: '.typeahead',
    tagsElement: $('#tags'),
    mode: "view",
    oldModels: {},
    /**
     * Set the parent model.
     * Fetch the tags related with this user and render them.
     * @param  {Object} options Contains the parameters such as parentModel
     * @return {void}
     */
    initialize: function(options) {
      var self = this;
      this.typeahead = options.typeaheadElement || this.typeahead;
      this.tagsElement = options.tagsElement || this.tagsElement;
      this.collection = options.collection;
      /**
       * Used as a suggestion engine for typeahead.js to fetch tags from the server
       * as the user inputs them.
       * Set rateLimitWait to an obscene number of requests being made to the
       * remote endpoint.
       * Set the url to the Tags.Library endpoint.
       * See more about Bloodhound in the link bellow
       * {@link https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md}
       */
      this.bloodhound = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify: function(obj) {
          return obj.id;
        },
        remote: {
          rateLimitBy: options.rateLimitBy,
          rateLimitWait: options.rateLimitWait,
          url: Tags.Library.url + '?search=%QUERY',
          wildcard: '%QUERY'
        }
      });
    },
    /**
     * Get the user tags from the server
     * @return {void}
     */
    fetch: function(options) {
      var self = this;
      this.collection.fetch({
        wait: true,
        success: function() {
          var ids = self.collection.models.map(function(model) {
            return model.id;
          });
          self.oldModels = self.collection.clone();
          Tags.Library.fetch({
            data: {
              id: ids
            },
            success: function() {
              if (options.render) {
                self.render();
              }
            }
          });
        }
      });
    },
    /**
     * Set the view mode to edit.
     * Initialize bootstrap-tagsinput with typeahead.
     * {@link https://github.com/bootstrap-tagsinput/bootstrap-tagsinput}
     * {@link https://github.com/twitter/typeahead.js/blob/master/doc/jquery_typeahead.md}
     * @return {void}
     */
    editTags: function() {
      var self = this;
      this.mode = "edit";
      this.oldModels = this.collection.clone();
      this.tagsElement.html(Tags.Templates.edit);
      $(this.typeahead).tagsinput({
        typeaheadjs: [{
          hint: true,
          highlight: true,
          minLength: 3
        }, {
          name: 'tags',
          displayKey: 'text',
          source: function(query, syncResults, asyncResults) {
            self.bloodhound.search(query, syncResults, function(suggestions) {
              var filtered = suggestions.filter(function(suggestion) {
                return suggestion.text.toLowerCase().indexOf(query.toLowerCase()) >= 0;
              });
              asyncResults(filtered);
            });
          },
          templates: {
            notFound: Tags.Templates.suggestion.notFound,
            pending: Tags.Templates.suggestion.pending,
            header: Tags.Templates.suggestion.header,
            footer: Tags.Templates.suggestion.footer,
            suggestion: function(context) {
              return Mustache.render(Tags.Templates.suggestion.text, context);
            }
          }
        }],
        itemValue: function(item) {
          return item.text;
        }
      });
      // Detect tag addition event and add it to the collection if not there
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
          self.trigger('tag:attach');
        }
      });
      // Detect tag remove event and remove it from the collection
      $(this.typeahead).on('itemRemoved', function(event) {
        // console.log("removed item", event.item);
        var model = self.collection.get(event.item.cid);
        self.collection.remove(model);
        self.trigger('tag:detach');
      });
      // Add existing tags to the tagsinput for editing
      this.collection.each(function(item) {
        var model = item.getTag().toJSON();
        model.cid = item.cid;
        model.inCollection = true;
        $(self.typeahead).tagsinput('add', model);
      });
      $(this.typeahead).tagsinput('focus');
    },
    /**
     * Save the edited tags by sending them to the server
     * @return {void}
     */
    saveTags: function() {
      var self = this;
      if (this.mode === "edit") {
        this.tagsElement.html("");
        Backbone.sync('create', this.collection, {
          wait: true,
          success: function() {
            self.oldModels = self.collection.clone();
            self.render();
          },
          error: function() {
            self.collection = self.oldModels;
            self.render();
          }
        });
        this.mode = "view";
        this.trigger('tag:save');
      }
    },
    /**
     * Cancel edition and restore collection to state before being edited.
     * @return {void}
     */
    cancelEdit: function() {
      if (this.mode === "edit") {
        this.tagsElement.html("");
        this.collection = this.oldModels;
        this.render();
        this.mode = "view";
        this.trigger('tag:cancel');
      }
    },
    /**
     * Render a tag to web page using the template
     * @param  {Backbone.Model} item The tag object
     * @borrows Tags.Templates.view
     * @return {void}
     */
    renderTag: function(item) {
      this.tagsElement.append(Mustache.render(Tags.Templates.view, item.toJSON()));
    },
    /**
     * Render tags collection by rendering each tag it contains with the view
     * template and appends all the tags to the corresponding element
     * @return {void}
     */
    render: function() {
      this.collection.each(function(item) {
        this.renderTag(item.getTag());
      }, this);
    }
  });

  /**
   * Initializes the tags plugin with the inputted options
   * @param  {Object} options Contains the options to initialize the plugin
   * @return {Backbone.View}
   */
  Tags.init = function(options) {
    var tags = new Tags.Collection([], {
      parentModel: options.parentModel
    });
    Tags.Library.url = options.url || Tags.Library.url;
    Tags.Templates = options.templates || Tags.Templates;
    return new Tags.TagsView({
      typeaheadElement: options.typeaheadElement,
      tagsElement: options.tagsElement,
      collection: tags,
      rateLimitBy: options.rateLimitBy || 'throttle',
      rateLimitWait: options.rateLimitWait || 1000
    });
  }

  return Tags;
});
