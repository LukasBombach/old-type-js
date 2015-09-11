
> # Update
> This project was part of my master's thesis and remains unaltered for the moment.
> I have made some big updates and major improvements to this library and I will continue to work
> on this project for the moment in this repository:
> [https://github.com/LukasBombach/new-type-js](https://github.com/LukasBombach/new-type-js)

# Type js

Lets you implement your own wysiwyg editor.

Please check [https://github.com/LukasBombach/new-type-js](https://github.com/LukasBombach/new-type-js)

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
