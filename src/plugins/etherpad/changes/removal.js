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

  /**
   * @param {Type.Content} content - The content this changeset
   *     should be applied to
   * @param {Type.Caret} localCaret - The local user's caret
   * @returns {Type.Etherpad.Changeset.Changes.Insertion} - This instance
   */
  this.apply = function (content, localCaret) {
    content.remove(this.start, this.length);
    if (this.end <= localCaret.getOffset())
      localCaret.moveBy(this.length * -1);
    return this;
  };

}).call(Type.Etherpad.Changeset.Changes.Removal.prototype);

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
