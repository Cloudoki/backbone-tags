(function(Backbone, Tags) {
  'use strict';

  // console.log(Tags);

  var User = Backbone.Model.extend({
    urlRoot: '/users'
  });

  var user = new User({
    id: '1',
    name: 'John'
  });

  var tagsView = new Tags.TagsView({
    parentModel: user,
    typeaheadElement: $('.typeahead'),
    template: "<p class='text-info'>{{text}}</p>"
  });

  /*
  // Test tags collection
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

  console.log(Tags.Library);*/

})(Backbone, Tags);
