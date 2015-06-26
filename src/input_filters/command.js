'use strict';

var Type = require('../core');

function CommandFilter(type, input) {
  this._type = type;
  //this._cmd = type.plugin('cmd');
  this._caret = input.caret;
}

(function () {

  this.keys = {
    b : 'command',
    i : 'command',
    u : 'command',
    s : 'command'
  };

  /**
   *
   * @param e
   */
  this.command = function (e) {

  };

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
