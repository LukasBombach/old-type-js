'use strict';

var Type = require('../core');

function CommandFilter(type) {
  this._type = type;
  this._caret = type.input.caret;
}

(function () {

  this.keys = {
    backSpace : 'remove'
  };

  this.remove = function () {
    this._type.plugin('cmd').remove(this._caret.textNode, this._caret.offset, -1);
  }

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
