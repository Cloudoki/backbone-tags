(function(Backbone, Tags) {
  'use strict';

<<<<<<< HEAD
  console.log('USERTAGS')

  var User = Backbone.Model.extend({
    defaults: {
      name: 'no name'
    },
    url: 'users'
  });
  User = User.extend(Tags.Extend);

  var Users = Backbone.Collection.extend({
    model: User,
    url: 'users'
  })

  var edgar = new User({
    id: '1',
    name: 'Edgar',
    tags: ['1', '2']
  }, {
    parse: true
  });

  var users = new Users(edgar);

  edgar.on('change', function() {
    console.log('CHANGE ON USER EDGAR', arguments)
  });

  users.get('1').detach('1')

  console.log('LIB', Tags.Library.length)

  //users.get('1').attach('1');

  console.log('EDGAR', edgar);

=======
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
>>>>>>> something

})(Backbone, Tags);
