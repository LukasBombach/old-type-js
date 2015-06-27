'use strict';

var Type = require('./core');
var TypeRange = require('./type_range');


function TypeSelection (type) {
  this._range = null;
  this._observeEvents(type);
}

(function () {

  /**
   *
   * @returns {boolean}
   */
  this.exists = function () {
    return !this._range.isCollapsed() && this._touchesEditor();
  };

  /**
   * todo should cache the range until the selection has changed (events needed for that)
   * @returns {TypeRange}
   * @private
   */
  this._getRange = function () {
    return TypeRange.fromCurrentSelection();
    //if (this._range === null) this._range = TypeRange.fromCurrentSelection();
    //return this._range;
  };

  /**
   * todo implementation
   * @returns {boolean}
   * @private
   */
  this._touchesEditor = function () {
    return true;
  };

  /**
   * todo should listen to selection events and trigger type internal events if editor is touched
   * @param type
   * @returns {TypeSelection}
   * @private
   */
  this._observeEvents = function (type) {
    return this;
  };

}).call(TypeSelection.prototype);

Type.fn.selection = function (cmd, params) {
  params = Array.prototype.slice.call(arguments, 1);
  var typeSelection = this.pluginInstance('selection', TypeSelection, this.options.root);
  return this.callMethodFrom(typeSelection, cmd, params);
};


module.exports = TypeSelection;
