(function(Backbone, Tags) {
  'use strict';

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


})(Backbone, Tags);
