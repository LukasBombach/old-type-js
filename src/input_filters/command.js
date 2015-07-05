'use strict';

var Type = require('../core');
var TypeRange = require('../type_range');

function CommandFilter(type, input) {
  this._selection = type.getSelection();
  this._formating = type.getFormatting();
}

(function () {

  this.keys = {
    66 : 'command', // b
    73 : 'command', // i
    83 : 'command', // s
    85 : 'command'  // u
  };

  this.tags = {
    66 : 'strong',
    73 : 'em',
    83 : 's',
    85 : 'u'
  };

  /**
   *
   * @param {TypeInputEvent} e
   */
  this.command = function (e) {

    var range;

    if (e.cmd) {
      range = TypeRange.fromRange(this._selection.getNativeRange());
      this._formating.format(this.tags[e.key], range);
      e.cancel();
    }

  };

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
