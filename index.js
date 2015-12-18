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

  var Tags = {};

  Tags.Model = Backbone.Model;
  Tags.Reference = Backbone.Model.extend({
    getTag: function() {
      return Tags.Library.get(this.get('id'));
    }
  });

  Tags.fetch = function(tags) {
    if (tags instanceof Array) {
      var some = tags.splice(0, 32);
      //fetch new tags
      Tags.Library.fetch({
        data: {
          ids: JSON.stringify(some)
        },
      })
      if (tags.length) Tags.fetch(tags);
    } else {
      throw new Error('expects an array')
    }
  }

  Tags.Link = Backbone.Model.extend({
    initialize: function(attrs, options) {
      this.context = attrs.context;
      console.log('INIT ATTRS LINK', attrs);
    },
    url: function() {
      return this.context.url + Tags.Library.url;
    }
  })
  Tags.Extend = {
    listTags: function() {
      var contextTags = this.get('tags');
      return Tags.Library.filter(function(tag) {
        return contextTags.indexOf(tag.id) !== -1;
      });
    },
    detach: function(tagId, options) {
      var context = this;
      console.log('DETACH', tagId);
      var link = new Tags.Link({
        id: tagId,
        context: this
      });
      link.destroy({
        error: options ? options.error : undefined,
        success: function() {
          var tags = context.get('tags');
          tags.splice(tags.indexOf(tagId), 1);
          context.set('tags', tags);
          if (options && options.success) {
            options.success.apply(this, arguments);
          }
        }
      });
      console.log('LINK', link);
    },
    attach: function(tagId, options) {
      console.log('attach', tagId)
      var link = new Tags.Link({
        id: tagId,
        context: this
      });
      link.save({}, {
        error: options ? options.error : undefined,
        success: function() {
          var tags = context.get('tags');
          if (tags.indexOf(tagId) === -1) {
            tags.push(tagId);
            context.set('tags', tags);
          }
          if (options && options.success) {
            options.success.apply(this, arguments);
          }
        }
      });
      console.log('LINK', link);
    },
    parse: function(data) {
      console.log('DATA PARSE');
      if (data && data.tags instanceof Array) {
        Tags.fetch(data.tags.filter(function(tagId) {
          return !Tags.Library.get(tagId)
        }));
        data.tags = new Tag.ContextCollection(data.tags, {
          context: this
        });
      }
      return data;
    }
  }

  Tags.Collection = Backbone.Collection.extend({
    model: Tags.Model,
    url: 'tags'
  });

  Tags.ContextCollection = Backbone.Collection.extend({
    model: Tags.Reference,
    initialize: function(attrs, options) {
      this.context = options.context;
    }
    url: function() {
      return this.context.url + '/' +
        this.context.id + '/' +
        Tags.Library.url;
    }
  });

  Tags.Library = new Tags.Collection();

  return Tags;
});
