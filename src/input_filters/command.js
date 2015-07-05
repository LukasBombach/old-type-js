'use strict';

var Type = require('../core');
var TypeRange = require('../type_range');

/**
 * Creates a command filter. Will fetch common
 * text formatting keyboard shortcuts and call
 * the according formatting methods.
 *
 * todo should listen for key codes and not keys
 *
 * @param type
 * @param input
 * @constructor
 */
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
   * todo format stuff when nothing is selected
   * @param {TypeInputEvent} e
   */
  this.command = function (e) {

    var sel;

    if (e.cmd) {
      sel = this._selection.save();
      this._formating.format(this.tags[e.key], this._selection.getRange());
      this._selection.restore(sel);
      e.cancel();
    }

  };

}).call(CommandFilter.prototype);

module.exports = CommandFilter;
