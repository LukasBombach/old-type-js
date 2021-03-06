'use strict';

var Input = require('../input');

/**
 * Creates a caret filter. Will catch arrow key inputs,
 * move the editor's caret and cancel the event.
 *
 * @param {Type} type
 * @param {Type.Input} [input]
 * @constructor
 */
Input.Filter.Undo = function (type, input) {
  this._undoManager = type.getUndoManager();
  this._sourceId = input.getContent().getSourceId();
};

(function () {

  this.keys = {
    90  : 'undoRedo' // z
  };

  /**
   * Performs undo and redo commands
   *
   * @param {Type.Events.Input} e
   */
  this.undoRedo = function (e) {

    if (e.cmd && e.shift) {
      this._undoManager.redo(this._sourceId);
      e.cancel();
    } else if (e.cmd) {
      this._undoManager.undo(this._sourceId);
      e.cancel();
    }

  };

}).call(Input.Filter.Undo.prototype);

module.exports = Input.Filter.Undo;
