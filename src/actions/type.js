'use strict';

var Type = require('../core');

/**
 * Creates a new Type action
 * @param {*} sourceId - An arbitrary key identifying the author
 *     of this action
 * @param {boolean} [undone] - The state of this action
 * @constructor
 */
Type.Actions.Type = function (sourceId, undone) {
  this.sourceId = sourceId;
  this.undone = undone || false;
};

(function () {

  /**
   * Performs this action
   * @returns {Type.Actions.Type} - This instance
   */
  this.execute = function () {
    return this;
  };


  /**
   * Revokes this action
   * @returns {Type.Actions.Type} - This instance
   */
  this.undo = function () {
    return this;
  };

  /**
   * Returns if a given action can be merged with this
   * action
   * @param {Type.Actions.Type|*} that
   * @returns {boolean}
   */
  this.mergeable = function (that) {
    return false;
  };

  /**
   * Merges a given action with this action
   * @param {Type.Actions.Type|*} that
   * @returns {Type.Actions.Type} - This instance
   */
  this.merge = function (that) {
    return this;
  };

  /**
   * Returns the offsets and number of characters
   * this actions inserts or removes
   * @returns {number[][]}
   */
  this.getCharacterShift = function () {
    return [[0,0]];
  }

}).call(Type.Actions.Type.prototype);

module.exports = Type.Actions.Type;
