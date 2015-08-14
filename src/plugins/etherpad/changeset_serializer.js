
'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad.ChangesetSerializer instance
 *
 * This class can be used to serialize a Type.Etherpad.Changeset
 * to a string for an Etherpad server
 *
 * @constructor
 */
Type.Etherpad.ChangesetSerializer = function (changeset) {
  this._changeset = changeset;
};

(function () {


  /**
   * Creates a changeset string representing this instance
   *
   * @returns {string} - The changeset string
   */
  this.serialize = function () {

    var operations = this._getOperations(),
      len = operations.length,
      changeset, i, length, lengthDiff;

    //changeset =

    return changeset;
  };

  /**
   * Returns an array of all insert and remove operations
   * ordered by the start offset
   *
   * @returns {Array}
   * @private
   */
  this._getOperations = function () {
    var operations = [];
    operations.concat(this._changeset.getInsertions().slice(0));
    operations.concat(this._changeset.getRemovals().slice(0));
    operations.sort(this._compareOperations);
    return operations;
  };

  /**
   * Compares the offsets of two insertions. This method can be
   * used with Array.prototype.sort
   *
   * @param {{start: number, end: number, text: string}|{start: number, numChars: number}} a
   *     An insertion or removal object
   * @param {{start: number, end: number, text: string}|{start: number, numChars: number}} b
   *     An insertion or removal object
   * @returns {number}
   * @private
   */
  this._compareOperations = function (a, b) {
    if (a.start < b.start) return -1;
    if (a.start > b.start) return 1;
    return 0;
  };

}).call(Type.Etherpad.ChangesetSerializer.prototype);



module.exports = Type.Etherpad.ChangesetSerializer;

