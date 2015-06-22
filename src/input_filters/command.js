'use strict';

var Type = require('../core');

function CommandFilter(type) {
  this._type = type;
}

(function () {

  this.keys = {
    backSpace : 'remove'
  };

  this.remove = function () {
    this._type.plugin('cmd').remove(textNode, offset, numChars);
  }

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
