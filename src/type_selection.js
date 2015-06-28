'use strict';

var TypeSelectionOverlay = require('./type_selection_overlay');

function TypeSelection() {
  this._overlays = [];
}

(function () {

  this.start = function (x, y) {
    this.unselect();
    this._overlays.push(new TypeSelectionOverlay(x, y, 0, 14));
  };

  this.moveEnd = function (x, y) {
    this._overlays[0].update(null, null, x - this._overlays[0].x, y - this._overlays[0].y);
  };

  this.unselect = function () {
    var i;
    for (i = 0; i < this._overlays.length; i += 1) {
      this._overlays[i].remove();
    }
    this._overlays = [];
    return this;
  };

}).call(TypeSelection.prototype);



module.exports = TypeSelection;
