# Backbone-Tags

Manage Models Tags with Backbone

## Requirements

- [backbonejs](http://backbonejs.org/)
- [mustache.js](https://github.com/janl/mustache.js)
- [twitter typeahead.js and bloodhound](https://github.com/twitter/typeahead.js) but it seems it's no longer maintained but corejs has a maintained fork [here](https://github.com/corejavascript/typeahead.js)
- [bootstrap-tagsinput](https://github.com/bootstrap-tagsinput/bootstrap-tagsinput)

## Instalation

- **Script Tag:** `<script type="text/javascript" src="https://github.com/Cloudoki/backbone-tags/blob/master/index.js"></script>`
- **Bower:** `bower install git://github.com/Cloudoki/backbone-tags.git`
- **npm:** `npm install github:Cloudoki/backbone-tags`

##  Usage
### Initialize the plugin:
```javascript
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
        // optional
        header: '',
        // optional
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
```

### Managing the tags:
Use jQuery to call the functions on events on DOM.
```html
<!-- tags views will be rendered here -->
<div id="tags"></div>
<!-- clicking this button will trigger edit mode -->
<button id="edit">edit tags</button>
<!-- clicking this button will save the tags -->
<button id="save">save tags</button>
<!-- clicking this button will cancel tagas editing and revert to prior editing -->
<button id="cancel">cancel edit tags</button>
```

```javascript
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
```

###Fetching the tag from the server and rendering:
```javascript
  // fetch tags from server and render them
  tags.fetch({
    render: true
  });
```

### Listening to tags triggers:
There are 4 events that the plugin triggers:
- **'tag:attach'**: when a new tag is added to the collection
- **'tag:detach'**: when a tag is remove from the collection
- **'tag:save'**: when a tags are saved
- **'tag:cancel'**: when the tag editing is cancelled

```javascript
  // listening triggers
  tagsView.on('tag:attach', function() {
    console.log("attach tag triggered");
  });
  tagsView.on('tag:detach', function() {
    console.log("detach tag triggered");
  });
  tagsView.on('tag:save', function() {
    console.log("save tags triggered");
  });
  tagsView.on('tag:cancel', function() {
    console.log("cancel triggered");
  });
```

