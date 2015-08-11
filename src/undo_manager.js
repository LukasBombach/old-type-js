'use strict';

var Type = require('./core');

/**
 *
 * @param {Type} type
 * @constructor
 */
Type.UndoManager = function (type) {
  this._type = type;
  this._stack = [];
  this._pointer = 0;
};

(function () {

  /**
   *
   * @param {Type.Actions.Type|Type.Actions.Insert|*} action
   * @returns {Type.UndoManager}
   */
  this.push = function (action) {
    this._stack.length = this._pointer;
    if (this._stack.length && this._stack[this._pointer].mergeable(action)) {
      this._stack[this._pointer].merge(action)
    } else {
      this._stack.push(action);
    }
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {Type.UndoManager}
   */
  this.undo = function (steps) {
    steps = steps === null ? 1 : steps;
    for (steps; steps > 0; steps -= 0) {
      this._stack[this._pointer].undo();
      this._pointer--;
      if (this._pointer < 0) {
        this._pointer = 0;
        break;
      }
    }
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {Type.UndoManager}
   */
  this.redo = function (steps) {
    steps = steps === null ? 1 : steps;
    for (steps; steps > 0; steps -= 0) {
      this._stack[this._pointer].execute();
      this._pointer++;
      if (this._pointer > this._stack.length) {
        this._pointer = this._stack.length;
        break;
      }
    }
    return this;
  };

}).call(Type.UndoManager.prototype);

module.exports = Type.UndoManager;
