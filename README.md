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

### Templates

You need to provide Mustache templates to be able to render the tags.
- `view`: The template used to render the tag view. How the tags will look in the Web page. **Required**
- `edit`: The template used to render the edit mode of the tag. An HTML element with the attribute **data-role="typeahead"**. **Required**
- `suggestion`:
    + `text`: The template for for the suggestions text. How the text in the suggestions will look like. **Required**
    + `notFound`: The template for when no suggestions is found.
    + `pending`: The template for when the suggestions are being fetched from the server.
    + `header`: The template for the header of the suggestions.
    + `footer`: The template for the footer of the suggestions.

```javascript
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
```

###Containers

You will need to provide a container where the tags will be rendered.

```html
<!-- tags views will be rendered here -->
<div id="tags"></div>
```

###ParentModel

You will need an parent model for the tags to associate with:

```javascript
  // Creating a model to be the tags parent
  var User = Backbone.Model.extend({
    // the model must have a urlRoot assigned because this model is not
    //  within a collection 
    urlRoot: '/users'
  });
  var user = new User({
    id: '1',
    name: 'John'
  });
```

### Initialization

####Tags.init(options)

You may use the Tags.init function for standard use of the plugin

```javascript
  var tags = Tags.init({
    // adding the tags parent
    parentModel: user,
    // the element where to render views
    tagsElement: $('#tags'),
    // templates for rendering the views
    templates: templates
  });
```

####Options

When instantiating Tags there are a number of options you can configure.
- `parentModel`: The Model that will be the parent of the tags.
- `url`: The URL where to get the tags from.
- `tagsElement`: The container where the tags will be rendered.
- `textName`: The tags object name to access the tags text value. default: *text*
- `templates`: The templates for rendering the tags view.
- `rateLimitBy`: The method used to rate-limit network requests. Can be *debounce* or *throttle*. Read more about how these method work [here](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation). default: *throttle*
- `rateLimitWait`: The time interval in milliseconds that will be used by rateLimitBy. default: *1000*

### Managing the tags:

To manage your tags you can call the tags provided functions:
- `editTags()`: Enter edit mode.
- `saveTags()`: Try to save the tags while in edit mode.
- `cancelEdit()`: Cancel the edition and reverts to prior edition, in edit mode.

```html
<!-- clicking this button will trigger edit mode -->
<button id="edit">edit tags</button>
<!-- clicking this button will save the tags -->
<button id="save">save tags</button>
<!-- clicking this button will cancel tags editing and revert to prior editing -->
<button id="cancel">cancel edit tags</button>
```

```javascript
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
```

### Listening to tags triggers:

There are 4 events that the tags view emits:
- **'tag:attach'**: when a new tag is added to the collection
- **'tag:detach'**: when a tag is remove from the collection
- **'tag:save'**: when a tags are saved
- **'tag:cancel'**: when the tag editing is cancelled

```javascript
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
```
