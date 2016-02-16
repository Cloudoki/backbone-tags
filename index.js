(function (root, main) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['backbone', 'mustache', 'bloodhound', 'underscore'], main);
  // CommonJS
  } else if (typeof exports !== 'undefined' && typeof require !== 'undefined') {
    module.exports = main(require('backbone'), require('mustache'),
      require('bloodhound'), require('underscore'));
  // Globals
  } else {
    /* eslint-disable no-param-reassign */
    root.Tags = main(root.Backbone, root.Mustache, root.Bloodhound, root._);
    /* eslint-enable no-param-reassign */
  }
})(this, function (Backbone, Mustache, Bloodhound, _) {
  'use strict';

  // TODO: options.fetch / options.create / options.sync allow to provide them
  //  for each backbone method used
  // TODO: cancel, save, edit events on view on "Backbone.View.events"
  // TODO: Tags-init options tags collection url (and options.url => .libraryUrl)

  var Tags = Object.create(null);

  Tags.Model = Backbone.Model.extend({
    /**
     * checks if only has id and no tag data
     * @return {Boolean} true if it has fetched data
     */
    hasData: function () {
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
    getTag: function () {
      return Tags.Library.get(this.get('id') || this.get('tagId'));
    },
    /*
     * Overwrites set to add tag reference to main library
     */
    set: function (attrs, opts) {
      // if there's a new tag id that is not in library add it
      if (attrs.id && !Tags.Library.get(attrs.id)) {
        Tags.Library.add({
          id: attrs.id
        });
      }
      return Backbone.Model.prototype.set.call(this, attrs, opts);
    }
  });
  /**
   * Collection of references to Tags associated with a parent Model
   */
  Tags.Collection = Backbone.Collection.extend({
    model: Tags.Reference,
    args: {},
    initialize: function (models, options) {
      this.args = options;
      this.parentModel = options.parentModel;
      this._url = options.url;
    },
    /**
     * Associate collection url to the parent Model
     * @return {string | undefined}
     */
    url: function () {
      return this.parentModel ? this.parentModel.url() + '/' +
        (this._url || 'tags') : (this._url || 'tags');
    },
    /**
     * Overrides the clone() method to also clone the collection parameters
     * @return {Backbone.Collection}
     */
    clone: function () {
      return new this.constructor(this.models, this.args);
    }
  });

  /**
   * Store of all the tags models
   * @type {Backbone.Collection}
   */
  Tags.LibraryCollection = Backbone.Collection.extend({
    model: Tags.Model,
    url: 'tags',
    initialize: function (options) {
      var self = this;

      this.url = options.url || this.url;
      /**
       * Used as a suggestion engine for typeahead.js to fetch tags from the
       *  server as the user inputs them.
       * Set rateLimitWait to an obscene number of requests being made to the
       * remote endpoint.
       * Set the url to the Tags.Library endpoint.
       * See more about Bloodhound in the link bellow
       * {@link https://github.com/twitter/typeahead.js/blob/master/doc/bloodhound.md}
       */
      this.bloodhound = options.bloodhound || new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace,
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        identify: function (obj) {
          return obj.id;
        },
        remote: {
          rateLimitBy: options.rateLimitBy || 'throttle',
          rateLimitWait: options.rateLimitWait || 1000,
          url: self.url + '?search=%QUERY',
          wildcard: '%QUERY'
        }
      });
    },
  });

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
      footer: ''
    }
  };

  Tags.Views = Object.create(null);

  /**
   * View for the tags
   * @param  {Object} options
   * @return {Backbone.View}
   */
  Tags.Views.List = Backbone.View.extend({
    typeahead: '[data-role="typeahead"]',
    textName: 'text',
    mode: 'view',
    oldModels: {},
    /**
     * Set the parent model.
     * Fetch the tags related with this user and render them.
     * @param  {object} options Contains the parameters such as parentModel
     * @param  {string} options.textName
     * @return {void}
     */
    initialize: function (options) {
      this.textName = options.textName || this.textName;
      this.collection = options.collection;
      this.bloodhound = options.bloodhound || Tags.Library.bloodhound;
      this.templates = options.templates || Tags.Templates;
    },
    /**
     * Get the user tags from the server
     * @return {void}
     */
    fetch: function (options) {
      var self = this;
      this.collection.fetch({
        wait: true,
        success: function () {
          var ids = self.collection.models.map(function (model) {
            return model.id;
          });
          self.oldModels = self.collection.clone();
          Tags.Library.fetch({
            wait: true,
            data: {
              ids: ids
            },
            success: function () {
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
    editTags: function () {
      var self = this;
      if (this.mode === 'view') {
        this.oldModels = this.collection.clone();
        this.$el.html(self.templates.edit);
        this.$(this.typeahead).tagsinput({
          typeaheadjs: [{
            hint: true,
            highlight: true,
            minLength: 3
          }, {
            name: 'tags',
            displayKey: self.textName,
            source: function (query, syncResults, asyncResults) {
              self.bloodhound.search(query, syncResults, function (suggestions) {
                var filtered = suggestions.filter(function (suggestion) {
                  return suggestion[self.textName]
                    .toLowerCase()
                    .indexOf(query.toLowerCase()) >= 0;
                });
                asyncResults(filtered);
              });
            },
            templates: {
              notFound: self.templates.suggestion.notFound || '',
              pending: self.templates.suggestion.pending || '',
              header: self.templates.suggestion.header || '',
              footer: self.templates.suggestion.footer || '',
              suggestion: function (context) {
                return Mustache.render(self.templates.suggestion.text, context);
              }
            }
          }],
          itemValue: function (item) {
            return item[self.textName];
          }
        });
        // Detect tag addition event and add it to the collection if not there
        this.$(this.typeahead).on('itemAdded', function (event) {
          var exists = _(self.collection.models).some(function (model) {
            return model.tagId === event.item.id;
          });
          Tags.Library.add(event.item);
          if (!exists) {
            self.collection.add({
              tagId: event.item.id
            });
            self.trigger('tag:attach');
          }
        });
        // Detect tag remove event and remove it from the collection
        this.$(this.typeahead).on('itemRemoved', function (event) {
          self.collection.remove(event.item.cid);
          self.trigger('tag:detach');
        });
        // Add existing tags to the tagsinput for editing
        this.collection.each(function (item) {
          var model = item.getTag().toJSON();
          model.cid = item.cid;
          self.$(self.typeahead).tagsinput('add', model);
        });
        this.$(this.typeahead).tagsinput('focus');
      }
      this.mode = 'edit';
    },
    /**
     * Save the edited tags by sending them to the server
     * @return {void}
     */
    saveTags: function () {
      var self = this;
      if (this.mode === 'edit') {
        this.$el.html('');
        Backbone.sync('create', this.collection, {
          wait: true,
          success: function () {
            self.oldModels = self.collection.clone();
            self.render();
            self.trigger('tag:save');
          },
          error: function () {
            self.collection = self.oldModels;
            self.render();
          }
        });
        this.mode = 'view';
      }
    },
    /**
     * Cancel edition and restore collection to state before being edited.
     * @return {void}
     */
    cancelEdit: function () {
      if (this.mode === 'edit') {
        this.$el.html('');
        this.collection = this.oldModels;
        this.render();
        this.mode = 'view';
        this.trigger('tag:cancel');
      }
    },
    /**
     * Render a tag to web page using the template
     * @param  {Backbone.Model} item The tag object
     * @return {void}
     */
    renderTag: function (item) {
      this.$el.append(Mustache.render(this.templates.view, item.toJSON()));
    },
    /**
     * Render tags collection by rendering each tag it contains with the view
     * template and appends all the tags to the corresponding element
     * @return {void}
     */
    render: function () {
      this.collection.each(function (item) {
        this.renderTag(item.getTag());
      }, this);
    }
  });

  /**
   * Initializes the tags plugin with the inputted options
   * @param  {Object} options Contains the options to initialize the plugin
   * @return {Backbone.View}
   */
  Tags.init = function (options) {
    var opts = _.defaults(options, {
      render: true,
      fetch: true
    });
    var instance = {
      view: {}
    };

    if (!Tags.Library) {
      Tags.Library = new Tags.LibraryCollection({
        bloodhound: opts.bloodhound,
        url: opts.url
      });
    }

    instance.collection = opts.collection || new Tags.Collection([], {
      parentModel: options.parentModel
    });

    var listInit =  {
      collection: instance.collection,
      bloodhound: options.bloodhound,
      templates: options.templates
    };
    
    if (options.tagsElement) {
      listInit.el = options.tagsElement;
    }
    
    instance.view.list = new Tags.Views.List(listInit);

    if (opts.fetch && instance.view.list) {
      // fetch tags from server and render them
      instance.view.list.fetch({
        render: opts.render
      });
    }

    if (opts.render && instance.view.list) {
      instance.view.list.render();
    }

    return instance;
  };

  return Tags;
});
