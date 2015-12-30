(function(Backbone, Tags) {
  'use strict';

  console.log(Tags);

  var User = Backbone.Model.extend({
    urlRoot: '/users'
  });

  var user = new User({
    id: '1',
    name: 'John'
  });

  var userTags = new Tags.Collection([], {
    parentModel: user
  });

  userTags.fetch(); // GET user tags at /users/1/tags, may show Error 404
  console.log(userTags);
  console.log(userTags.url()); // /users/1/tags
  console.log(userTags.parentModel)

  userTags.add({
    id: 1
  });

  console.log(userTags.at(0).url()); // /users/1/tags/1

  Tags.Library.fetch(); // GET /tags/tags, may show Error 404

  Tags.Library.at(0).fetch(); // GET /tags/1, may show Error 404

  Tags.Library.fetch({
    data: {
      id: 2
    }
  }); // GET /tags?id=2, may show Error 404
  Tags.Library.fetch({
      data: {
        id: [1, 2, 3, 4, 5]
      }
    }) // GET /tags?id[]=1&id[]=2
    //    &id[]=3&id[]=4&id[]=5
    // may show Error 404

  console.log(Tags.Library);

})(Backbone, Tags);

var tags = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  identify: function(obj) {
    return obj.id;
  },
  prefetch: './tags',
  remote: {
    rateLimitWait: 1000,
    url: './tags?search=%QUERY',
    wildcard: '%QUERY',
    filter: function(tags) {
      return $.map(tags, function(tag) {
        return tag;
      });
    }
  }
});

$('.typeahead').tagsinput({
  typeaheadjs: [{
    hint: true,
    highlight: true,
    minLength: 3
  }, {
    name: 'tags',
    displayKey: 'text',
    // source: tags.ttAdapter(),
    source: function(query, syncResults, asyncResults) {
      console.log(query)
      tags.search(query, syncResults, function(suggestions) {
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
        return Mustache.render('<p><strong>{{text}}</strong></p>', context);
      }
    }
  }],
  itemValue: function(item) {
    return item.text;
  }
});

$('.typeahead').on('itemAdded', function(event) {
  console.log("added item", event.item);
});
$('.typeahead').on('itemRemoved', function(event) {
  console.log("removed item", event.item);
});
