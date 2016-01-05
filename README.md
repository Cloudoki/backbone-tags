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
### Setting Mustache templates:
Create a templates object as follows and set it to the plugin templates.
```javascript
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
```

### Initialize the plugin:
```javascript
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
```

### Managing the tags:
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


