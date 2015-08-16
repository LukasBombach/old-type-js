'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @param {number} delta - The relative movement
 * @param {number} [absolute] - The absolute text position
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Movement = function (delta, absolute) {
  this.delta = delta;
  this.absolute = absolute || null;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Movement, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   * @type {string}
   */
  this.op = '=';

}).call(Type.Etherpad.Changeset.Changes.Movement);

/**
 *
 * @param match
 * @returns {Type.Etherpad.Changeset.Changes.Movement}
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Movement.fromMatch = function (match) {
  return new Type.Etherpad.Changeset.Changes.Movement(parseInt(match.value, 36));
};

/**
 * Creates a new Movement instance from an object containing the delta
 * and the absolute text offset.
 *
 * @param {{ absolute: number, stack: number[] }} offset - An object
 *     containing offset information
 */
Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject = function (offset) {
  var delta = offset.stack[offset.stack.length -1];
  return new Type.Etherpad.Changeset.Changes.Movement(delta, offset.absolute);
};


module.exports = Type.Etherpad.Changeset.Changes.Movement;
