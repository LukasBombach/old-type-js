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