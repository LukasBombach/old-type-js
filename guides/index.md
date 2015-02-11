# Type.js API

Cras mattis consectetur purus sit amet fermentum. Maecenas sed diam eget risus varius blandit sit amet non magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.

## Getting started

### Embed Type

You will find the compiled Type.js library in the **dist** folder.

```html
<div id="editor">Some text with some <strong>formatting</strong>.</div>
<script src="type.min.js" type="text/javascript" charset="utf-8"></script>
<script>
  var type = new Type('editor');
</script>
```
Once instantiated you can work on the text in `#editor` using the methods from the type object.

### Basic Formatting

```javascript
// Will format the current selection bold
type.format('strong');

// Will format the current selection italic
type.format('italic');

// Will format the current selection underlined
type.format('underline');
```
For more info on formatting text read up on [Advanced Formatting](https://github.com/LukasBombach/Type.js/docs/formatting.md) in the guides.
