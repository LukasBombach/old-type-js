'use strict';

var Type = require('../core');
var TypeEnv = require('../type_environment');

function TypeInputEvent(key, shift, alt, ctrl, meta, mac) {
  this.key   = key;
  this.shift = shift;
  this.alt   = alt;
  this.ctrl  = ctrl;
  this.meta  = meta;
  this.cmd   = (!mac && ctrl) || (mac && meta);
  this.canceled = false;
}

/**
 * Maps character codes to readable names
 *
 * @type {Object}
 */
TypeInputEvent.keyNames = {
  8  : 'backspace',
  37 : 'left',
  38 : 'up',
  39 : 'right',
  40 : 'down',
  46 : 'del'
};

/**
 * Todo keyCode : https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * Todo keyCode : http://stackoverflow.com/questions/1444477/keycode-and-charcode
 *
 * Todo TypeEnv.mac should be Type.env.mac
 *
 * @param {KeyboardEvent} e
 * @returns {TypeInputEvent}
 */
TypeInputEvent.fromKeyDown = function (e) {
  var key = TypeInputEvent.keyNames[e.keyCode] || e.keyCode;
  return new TypeInputEvent(key, e.shiftKey, e.altKey, e.ctrlKey, e.metaKey, TypeEnv.mac);
};

(function () {

  this.cancel = function () {
    this.canceled = true;
  };

}).call(TypeInputEvent.prototype);


module.exports = TypeInputEvent;
