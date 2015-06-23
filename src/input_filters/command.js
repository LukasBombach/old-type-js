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
    //this._cmd.remove(this._caret.textNode, this._caret.offset, -1);
    this._type.cmd('remove', this._caret.textNode, this._caret.offset, -1);
  }

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
