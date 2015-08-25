# Type js

Lets you implement your own wysiwyg editor.

## Installation

Include `type.min.js` from the `dist.js` on your website.

## Basic usage:

    // Instantiate Type and pass it an element that will be editable
    var element = document.getElementById('editor-contents');
    var editor = new Type(element);
    
    /// Will format characters 10 to 20 as bold
    editor.format('<strong>', 10, 20);

## Building

1. Install node js
2. Install gulp `npm install gulp -g`
3. Run `gulp uglify` to build a minified file

## License

Type is licenced under the MIT license.

See `LICENSE.txt` in this directory.
