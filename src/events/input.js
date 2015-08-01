'use strict';

var Type = require('../core');

/**
 * Creates a new Type input event.
 * This is an abstraction for browser events that lead to an input in
 * the editor.
 *
 * @param {Object} options - Object holding parameters for the event
 * @param {string} [options.key] - A descriptive name for the key
 *     pressed as set in {@link Type.Events.Input.keyDownNames}.
 * @param {number} [options.keyCode] - The key code of the key pressed
 * @param {boolean} [options.shift] - Whether or not the shift key has
 *     been pressed together with the given key.
 * @param {boolean} [options.alt] - Whether or not the alt key has
 *     been pressed together with the given key.
 * @param {boolean} [options.ctrl] - Whether or not the control key has
 *     been pressed together with the given key.
 * @param {boolean} [options.meta] - Whether or not the command key has
 *     been pressed together with the given key (for os x users).
 * @constructor
 */
Type.Events.Input = function (options) {

  options = options || {};

  this.key     = options.key     || null;
  this.keyCode = options.keyCode || null;
  this.shift   = options.shift   || false;
  this.alt     = options.alt     || false;
  this.ctrl    = options.ctrl    || false;
  this.meta    = options.meta    || false;
  this.cmd     = (!Type.Environment.mac && options.ctrl) || (Type.Environment.mac && options.meta);

  this.canceled = false;

};

/**
 * Inherit from general Type event
 */
Type.OOP.inherits(Type.Events.Input, Type.Events.Type);

/**
 * Maps character codes from key down events to readable names
 * @type {Object}
 */
Type.Events.Input.keyDownNames = {
  8  : 'backspace',
  9  : 'tab',
  13 : 'enter',
  32 : 'space',
  37 : 'left',
  38 : 'up',
  39 : 'right',
  40 : 'down',
  46 : 'del'
};

/**
 * Factory to create a {Type.Events.Input} from a {KeyboardEvent}
 *
 * @param {KeyboardEvent} e
 * @returns {Type.Events.Input}
 */
Type.Events.Input.fromKeyDown = function (e) {

  var charCode = (typeof e.which === "number") ? e.which : e.keyCode,
    options = {
      key     : Type.Events.Input.keyDownNames[charCode] || charCode,
      keyCode : charCode,
      shift   : e.shiftKey,
      alt     : e.altKey,
      ctrl    : e.ctrlKey,
      meta    : e.metaKey
    };

  return new Type.Events.Input(options);

};

module.exports = Type.Events.Input;
