# ECMA Script 6

Using ES6 is an option. It is expected to be supported by first engines by the end of 2015. In the meantime transpilers can be used (Is already used by bog companies like Netflix etc (see babel website)).

Compatibility: https://kangax.github.io/compat-table/es6/
Mozilla: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
Roundup: http://www.2ality.com/2015/04/deploying-es6.html

⁃	Decided not to use ES6 because my library is intended to be used for a wide range of browsers. That means even when ES6 is common for most browsers, I will still need transpilers for a long time to support legacy systems.
⁃	Complete rewrites are not necessarily a bad thing and can be a great opportunity to improve your library / program. I am looking forward to a complete rewrite using ES6
⁃	One of the main reasons for me to use ES6 is the syntax of classes and foremost their private properites. I decided I will use underscore syntax \_myfunction to mark methods as private. This is a common conventions and will be understood by professionals.

Promises would have been nice though. I might not need them though
