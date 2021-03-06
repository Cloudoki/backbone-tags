/* globals Backbone, Tags, $ */
(function (Backbone, Tags, $) {
  'use strict';

  var templates = {
    view: '<span class="label label-info">{{text}}</span>',
    edit: '<input class="typeahead" data-role="typeahead" type="text" ' +
      'placeholder="Input tag here"></input>',
    suggestion: {
      text: '<p class="text-info">{{text}}</p>',
      notFound: '<div class="notFound">0 results found</div>',
      pending: '<div class="pending">pending</div>',
      header: '',
      footer: '',
    }
  };

  // Creating a model to be the tags parent
  var User = Backbone.Model.extend({
    // the model must have a urlRoot assigned because this model is not
    //  within a collection
    urlRoot: 'users'
  });

  var user = new User({
    id: '1',
    name: 'John'
  });

  var tags = Tags.init({
    // adding the tags parent
    parentModel: user,
    // the element where to render views
    tagsElement: $('#tags'),
    // templates for rendering the views
    templates: templates
  });

  // enter edit tags mode when button `edit tags` is pressed
  $('#edit').click(function () {
    tags.view.list.editTags();
  });
  // save tags when button `save tags` is pressed
  $('#save').click(function () {
    tags.view.list.saveTags();
  });
  // cancel tags edit when button `cancel edit tags` is pressed
  $('#cancel').click(function () {
    tags.view.list.cancelEdit();
  });

  // listening triggers
  /* eslint-disable no-console */
  tags.view.list.on('tag:attach', function () {
    console.log('attach tag triggered');
  });
  tags.view.list.on('tag:detach', function () {
    console.log('detach tag triggered');
  });
  tags.view.list.on('tag:save', function () {
    console.log('save tags triggered');
  });
  tags.view.list.on('tag:cancel', function () {
    console.log('cancel triggered');
  });
  /* eslint-enable no-console */
})(Backbone, Tags, $);
