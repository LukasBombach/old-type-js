
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
  this._operations = this._getOperations();
};

(function () {


  /**
   * Creates a changeset string representing this instance
   *
   * @returns {string} - The changeset string
   */
  this.getString = function (base) {

    var changeset, len, i;

    len = this._operations.length;

    changeset  = this._baseLengthString(base);
    changeset += this._lengthChangeString();
    changeset += this._operationString(this._operations[0]);

    for (i = 1; i < len; i += 1) {
      changeset += this._operationString(this._operations[i], this._operations[i-1]);
    }

    changeset += this._charbankString();

    return changeset;

  };

  /**
   * Returns the length parameter for the changeset string
   *
   * Returns the length of either a string or the text inside
   * an element as a 36 base encoded number, prepended by 'Z:'
   *
   * @param {string|Element} base - Either a string or an element
   * @returns {string} - The 36 base encoded number
   * @private
   */
  this._baseLengthString = function (base) {
    return 'Z:' + this._lengthFor(base).toString(36);
  };

  /**
   * Returns the parameter for the changeset string that determines
   * the change in the length of the text.
   *
   * @returns {string}
   * @private
   */
  this._lengthChangeString = function () {
    var count = this._countLengthChange();
    return (count > 0 ? '>' : '<') + count;
  };

  /**
   * Returns a serialized operation as a string
   *
   * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} operation
   *     An insertion or removal object
   * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} [prev]
   *     The operation before this operation
   * @returns {string} - The serialized string for the operation
   * @private
   */
  this._operationString = function (operation, prev) {

    var offset, hack, operatorSnd;

    offset = this._offsetString(operation, prev);
    hack = operation.op == '+' ? '*0' : '';

    if(/^[\n\r]+$/.test(operation.text || '')) {
      operatorSnd = '|1+1'; // todo Only works if charbank === a single newline
    } else {
      operatorSnd = operation.op + operation.text.length;
    }

    return offset + hack + operatorSnd;

  };

  /**
   * Returns the serialized charbank string from all
   * operations
   *
   * @returns {string}
   * @private
   */
  this._charbankString = function () {
    var charbank, len, i;
    charbank = '$';
    len = this._operations.length;
    for (i = 0; i < len; i += 1) {
      charbank += this._operationCharbankString(this._operations[i]);
    }
    return charbank;
  };

  /**
   * Return the text of an operation or an empty string
   *
   * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} operation
   *     An insertion or removal object
   * @returns {string} - The text of the operation or an empty string
   * @private
   */
  this._operationCharbankString = function (operation) {
    return operation.text ? operation.text : '';
  };

  /**
   * Returns a serialized string calculating the delta
   * offset of 2 operations.
   *
   * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} operation
   *     An insertion or removal object
   * @param {{op: string, start: number, end: number, text: string}|{op: string, start: number, numChars: number}} [prev]
   *     The operation before this operation
   * @returns {string} - The serialized offset string for the operation
   *     relative to is prev operation
   * @private
   */
  this._offsetString = function (operation, prev) {
    var offset = operation.start - (prev ? prev.start : 0);
    return offset > 0 ? '=' + offset.toString(36) : '';
  };

  /**
   * Returns the length of a string or the text inside an element
   *
   * @param {string|Element} base - Either a string or an element
   * @returns {number|null} - Will return the text length or null
   *     if the argument passed is not a string or an element
   * @private
   */
  this._lengthFor = function (base) {
    if (typeof base === 'string') {
      return base.length;
    }
    if (base.textContent) {
      return base.textContent.length;
    }
    return null;
  };

  /**
   * Returns if the sum of all characters added and removed in this
   * changeset
   *
   * @returns {number} - The sum of all characters added and removed
   *     in this changeset
   * @private
   */
  this._countLengthChange = function () {
    var change = 0, len, i;
    len = this._operations.length;
    for (i=0; i < len; i += 1) {
      change += this._operations[i].numChars;
    }
    return change;
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

