'use strict';

var Type = require('../../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset.Changes.Removal = function (offset, length) {
  this.start  = offset;
  this.length = length;
  this.end    = offset + length;
};

/**
 * Inherit from Etherpad change
 */
Type.OOP.inherits(Type.Etherpad.Changeset.Changes.Removal, Type.Etherpad.Changeset.Changes.Change);


(function () {

  /**
   * Etherpad's serialized string for this operation
   * @type {string}
   */
  this.op = '-';

}).call(Type.Etherpad.Changeset.Changes.Removal);

/**
 *
 * @param {{ absolute: number, stack: number[] }} offset - An object
 *     containing offset information
 * @param {{attrs: string, operator: string, value: string}} match
 * @returns {Type.Etherpad.Changeset.Changes.Removal}
 */
Type.Etherpad.Changeset.Changes.Removal.fromMatch = function (offset, match) {
  return new Type.Etherpad.Changeset.Changes.Removal(offset.absolute, parseInt(match.value, 36));
};

module.exports = Type.Etherpad.Changeset.Changes.Removal;
