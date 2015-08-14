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
  this.lastActionReceived = null;
  this.mergeDebounce = 500;
};

(function () {

  /**
   *
   * @param {Type.Actions.Type|Type.Actions.Insert|*} action
   * @returns {Type.UndoManager}
   */
  this.push = function (action) {
    this._stack.length = this._stack.length === 0 ? 0 : this._pointer + 1;
    if (this.shouldBeMerged(action)) {
      this._stack[this._pointer].merge(action)
    } else {
      this._stack.push(action);
      this._pointer = this._stack.length - 1;
    }
    this.lastActionReceived = Date.now();
    return this;
  };

  /**
   *
   * @param action
   * @returns {boolean}
   */
  this.shouldBeMerged = function (action) {
    if (this.lastActionReceived === null) {
      return false;
    }
    if (Date.now() > this.lastActionReceived + this.mergeDebounce) {
      return false;
    }
    return !!(this._stack.length && this._stack[this._pointer].mergeable(action));
  };

  /**
   *
   * @param {number} [steps]
   * @returns {Type.UndoManager}
   */
  this.undo = function (steps) {
    steps = !arguments.length ? 1 : steps;
    for (steps; steps > 0; steps -= 1) {
      if (this._pointer < 0) {
        this._pointer = -1;
        break;
      }
      this._stack[this._pointer].undo();
      this._pointer--;
    }
    return this;
  };

  /**
   *
   * @param {number} [steps]
   * @returns {Type.UndoManager}
   */
  this.redo = function (steps) {
    steps = !arguments.length ? 1 : steps;
    for (steps; steps > 0; steps -= 1) {
      this._pointer++;
      if (this._pointer > this._stack.length - 1) {
        this._pointer = this._stack.length - 1;
        break;
      }
      this._stack[this._pointer].execute();
    }
    return this;
  };

  /**
   * Will iterate through the stack (beginning from its end)
   * and collect all character insertions and removals and
   * return them. This can be used bei actions to shift the
   * their character offset to which they apply their changes.
   *
   * @param {number} targetPointer - The stack pointer
   *     to which all character shifts shall be collected
   * @returns {number[][]} - A map of insertions and removals
   *     First dimensions is at which offsets characters have
   *     changed. Second dimension is the number of characters
   *     that have been added or removed.
   * @private
   */
  this._getCharacterShift = function (targetPointer) {

  }

}).call(Type.UndoManager.prototype);

module.exports = Type.UndoManager;
