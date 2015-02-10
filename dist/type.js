(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/type.js":[function(require,module,exports){
(function (global){
"use strict";

var Cmd = require('./modules/cmd.js');

var cmd = new Cmd();

/**
 * The main class required to set up a Type instance in the browser.
 *
 * @class Type
 * @constructor
 */
var Type = function() {
  console.log('HELLO');
  cmd.bold();
};


global.Type = Type;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./modules/cmd.js":"/Users/luke/HTW/Masterarbeit/Code/Type.js/src/modules/cmd.js"}],"/Users/luke/HTW/Masterarbeit/Code/Type.js/src/modules/cmd.js":[function(require,module,exports){
"use strict";

var Range = require('./range');

/**
 * Class to handle commands for text formatting.
 *
 * @class Cmd
 * @constructor
 */
var Cmd = function() {
};

(function() {

  /**
   * Wraps the current selection with <strong> tags
   */
  this.bold = function() {
    console.log('Bold');
  }

}).call(Cmd.prototype);


module.exports = Cmd;
},{"./range":"/Users/luke/HTW/Masterarbeit/Code/Type.js/src/modules/range.js"}],"/Users/luke/HTW/Masterarbeit/Code/Type.js/src/modules/range.js":[function(require,module,exports){
"use strict";

/**
 * Class to handle browser ranges
 *
 * @class Range
 * @constructor
 */
var Range = function() {

};

(function() {

}).call(Range.prototype);

/**
 * Returns a Range representation of the current browser range
 *
 * @returns {Range}
 **/
Range.get = function() {
  return new Range();
};

module.exports = Range;
},{}]},{},["./src/type.js"]);

//# sourceMappingURL=type.js.map