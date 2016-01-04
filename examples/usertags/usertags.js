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

  var viewTemplate = "<span class=\"label label-info\">{{text}}</span>";
  var editTemplate = "<input class=\"typeahead\" type=\"text\" " +
                     "placeholder=\"Input tag here\"></input>";

  var tagsView = new Tags.TagsView({
    parentModel: user,
    typeaheadElement: '.typeahead',
    tagsElement: $('#tags'),
    suggestionTemplate: "<p class='text-info'>{{text}}</p>",
    viewTemplate: viewTemplate,
    editTemplate: editTemplate
  });

  // edit tags when button `edit tags` is pressed
  $('#edit').click(function() {
    tagsView.editTags();
  });
  // save tags when button `save tags` is pressed
  $('#save').click(function() {
    tagsView.saveTags();
  });
  // cancel tags edit when button `cancel edit tags` is pressed
  $('#cancel').click(function() {
    tagsView.cancelEdit();
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
