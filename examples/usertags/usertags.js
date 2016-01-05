(function(Backbone, Tags) {
  'use strict';

  console.log("Tags Test");

  // Creating a model to be the tags parent
  var User = Backbone.Model.extend({
    // the model must have a urlRoot assigned
    urlRoot: '/users'
  });
  var user = new User({
    id: '1',
    name: 'John'
  });

  // templates for rendering the views
  var templates = {
    viewTemplate: '<span class="label label-info">{{text}}</span>',
    editTemplate: '<input class="typeahead" type="text" ' +
      'placeholder="Input tag here"></input>',
    suggestionTemplate: {
      text: '<p class="text-info">{{text}}</p>',
      notFound: '<div class="notFound">0 results found</div>',
      pending: '<div class="pending">pending</div>',
      header: '<div class="headerSuggestion"></div>',
      footer: '<div class="footerSuggestion"></div>',
    }
  };
  Tags.templates = templates;

  var tagsView = new Tags.TagsView({
    // adding the tags parent
    parentModel: user,
    // URL to get tags from
    url: '/tags',
    // the element class/id in the template where to render the tagsinput
    typeaheadElement: '.typeahead',
    // the element where to render views
    tagsElement: $('#tags')
  });

  // enter edit tags mode when button `edit tags` is pressed
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

  // fetch tags from server and render them
  tagsView.fetch({
    render: true
  });

})(Backbone, Tags);
