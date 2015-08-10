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
};

(function () {

  /**
   *
   * @param {Type.Actions.Type} action
   * @returns {*}
   */
  this.execute = function (action) {
    this._stack.push(action);
    action.execute();
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {Type.Writer}
   */
  this.undo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

  /**
   *
   * @param {number} steps
   * @returns {Type.Writer}
   */
  this.redo = function (steps) {
    steps = steps === null ? 1 : steps;
    return this;
  };

}).call(Type.UndoManager.prototype);

module.exports = Type.UndoManager;
