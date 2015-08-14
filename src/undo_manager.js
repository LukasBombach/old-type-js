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
   * @param {*} [sourceId]
   * @param {number} [steps]
   * @returns {Type.UndoManager}
   */
  this.undo = function (sourceId, steps) {

    steps = steps === undefined ? 1 : steps;

    //for (steps; steps > 0; steps -= 1) {
    //  if (this._pointer < 0) {
    //    this._pointer = -1;
    //    break;
    //  }
    //  this._stack[this._pointer].undo(this._getCharacterShift());
    //  this._pointer--;
    //}

    while (steps > 0 && this._pointer > -1) {
      if (this._stack[this._pointer].sourceId === sourceId || sourceId === undefined) {
        this._stack[this._pointer].undo(this._getCharacterShift());
        steps -= 1;
      }
      this._pointer -= 1;
    }

    return this;
  };

  /**
   *
   * @param {*} [sourceId]
   * @param {number} [steps]1
   * @returns {Type.UndoManager}
   */
  this.redo = function (sourceId, steps) {

    var stackLen = this._stack.length;
    steps = steps === undefined ? 1 : steps;

    //for (steps; steps > 0; steps -= 1) {
    //  this._pointer++;
    //  if (this._pointer > this._stack.length - 1) {
    //    this._pointer = this._stack.length - 1;
    //    break;
    //  }
    //  this._stack[this._pointer].execute(this._getCharacterShift());
    //}

    while (steps > 0 && this._pointer < stackLen) {
      this._pointer++;
      if (this._pointer > this._stack.length - 1) {
        this._pointer = this._stack.length - 1;
        break;
      }
      if (this._stack[this._pointer].sourceId === sourceId || sourceId === undefined) {
        this._stack[this._pointer].execute(this._getCharacterShift());
        steps--;
      }
    }

    return this;
  };

  /**
   * Will iterate through the stack (beginning from its end)
   * and collect all character insertions and removals and
   * return them. This can be used bei actions to shift the
   * their character offset to which they apply their changes.
   *
   * @param {number} [targetPointer] - The stack pointer
   *     to which all character shifts shall be collected
   * @returns {number[][]} - A map of insertions and removals
   *     First dimensions is at which offsets characters have
   *     changed. Second dimension is the number of characters
   *     that have been added or removed.
   * @private
   */
  this._getCharacterShift = function (targetPointer) {

    targetPointer = targetPointer === undefined ? this._pointer + 1 : targetPointer;

    var len = this._stack.length - 1,
      shifts = [],
      shift,
      i, j;

    for (i = len; i >= targetPointer; i -= 1) {

      shift = this._stack[i].getCharacterShift();

      for (j = 0; j < shift.length; j++) {
        shifts.push( shift[j] );
      }

      //shifts.concat(shift);
    }

    return shifts;
  }

}).call(Type.UndoManager.prototype);

module.exports = Type.UndoManager;
