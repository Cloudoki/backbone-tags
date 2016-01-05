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

  var tags = Tags.init({
    // adding the tags parent
    parentModel: user,
    // URL to get tags from
    url: '/tags',
    // the element class/id in the template where to render the tagsinput
    typeaheadElement: '.typeahead',
    // the element where to render views
    tagsElement: $('#tags'),
    // templates for rendering the views
    templates: {
      view: '<span class="label label-info">{{text}}</span>',
      edit: '<input class="typeahead" type="text" ' +
        'placeholder="Input tag here"></input>',
      suggestion: {
        text: '<p class="text-info">{{text}}</p>',
        notFound: '<div class="notFound">0 results found</div>',
        pending: '<div class="pending">pending</div>',
        header: '',
        footer: '',
      }
    },
    // the method used to rate-limit network requests debounce|throttle
    // {@link http://drupalmotion.com/article/debounce-and-throttle-visual-explanation}
    // default: `throttle`
    rateLimitBy: 'throttle',
    // the time interval in milliseconds that will be used by rateLimitBy
    // default: `1000`
    rateLimitWait: 800,
  });

  // enter edit tags mode when button `edit tags` is pressed
  $('#edit').click(function() {
    tags.editTags();
  });
  // save tags when button `save tags` is pressed
  $('#save').click(function() {
    tags.saveTags();
  });
  // cancel tags edit when button `cancel edit tags` is pressed
  $('#cancel').click(function() {
    tags.cancelEdit();
  });

  // fetch tags from server and render them
  tags.fetch({
    render: true
  });

  // listening triggers
  tags.on('tag:attach', function() {
    console.log("attach tag triggered");
  });
  tags.on('tag:detach', function() {
    console.log("detach tag triggered");
  });
  tags.on('tag:save', function() {
    console.log("save tags triggered");
  });
  tags.on('tag:cancel', function() {
    console.log("cancel triggered");
  });

})(Backbone, Tags);
