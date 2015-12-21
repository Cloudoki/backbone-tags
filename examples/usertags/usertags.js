(function(Backbone, Tags) {
  'use strict';

  console.log(Tags);

  var User = Backbone.Model.extend({
    urlRoot: '/users'
  });

  var user = new User({id: '1', name: 'John'});

  var userTags = new Tags.Collection([], {parentModel: user});

  userTags.fetch();
  console.log(userTags);
  console.log(userTags.url());
  console.log(userTags.parentModel)

  userTags.add({
    id: 1
  });

  console.log(userTags.at(0).url())

  Tags.Library.fetch();

  Tags.Library.at(0).fetch();

  console.log(Tags.Library);

})(Backbone, Tags);
