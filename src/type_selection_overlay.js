'use strict';

var DomUtil = require('./dom_utilities');

function TypeSelectionOverlay(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this._el = this._createElement();
}

(function () {

  this.update  = function (x, y, width, height) {
    this._draw(x, y, width, height);
    this._set(x, y, width, height);
    return this;
  };

  this.remove = function () {
    DomUtil.removeElement(this._el);
    this._el = null;
    this.x = null;
    this.y = null;
    this.width = null;
    this.height = null;
  };

  this._set = function (x, y, width, height) {
    this.x = x !== null ? x : this.x;
    this.y = y !== null ? y : this.y;
    this.width = width !== null ? width : this.width;
    this.height = height !== null ? height : this.height;
    return this;
  };

  this._draw = function (x, y, width, height) {
    var style = this._el.style;
    if (x) style.left = x;
    if (y) style.top = y;
    if (width) style.width = width;
    if (height) style.height = height;
    return this;
  };

  this._createElement = function () {
    return DomUtil.addElement('div', 'selection');
  };

}).call(TypeSelectionOverlay.prototype);

module.exports = TypeSelectionOverlay;
