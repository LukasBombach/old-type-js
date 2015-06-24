'use strict';

var Type = require('../core');

function CommandFilter(type, input) {
  this._type = type;
  //this._cmd = type.plugin('cmd');
  this._caret = input.caret;
}

(function () {

  this.keys = {
    backSpace : 'remove'
  };

  this.remove = function () {
    this._type.cmd('remove', this._caret.textNode, this._caret.offset, -1);
    this._caret.moveLeft();
  };

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
