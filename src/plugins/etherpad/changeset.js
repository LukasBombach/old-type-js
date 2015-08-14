'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset = function (str) {
  this.addString(str);
};

(function () {

  /**
   * Matches a changeset to an array of results for
   * an each operation
   *
   * @type {RegExp}
   * @private
   */
  this._changesetRegex = /((?:\*[0-9a-z]+)*)(?:\|([0-9a-z]+))?([-+=])([0-9a-z]+)|\?|/g;

  /**
   * Adds a serialized changeset (as a string) to this
   * changeset instance
   *
   * @param {string} str - A serialized changeset
   * @returns {Type.Etherpad.Changeset} - This instance
   */
  this.addString = function (str) {

    var match, attrs, operator, value,
      charbank = this._getCharbank(str),
      offset = 0;


    while ((match = this._changesetRegex.exec(str)) !== null) {

      if (match.index === regex.lastIndex)
        regex.lastIndex++;

      if(match[0] === '')
        continue;

      attrs    = match[1];
      operator = match[3];
      value    = match[4];

      switch(operator) {
        case '=':
          offset = parseInt(value, 36);
          break;
        case '+':
          this.addInsertion(offset, charbank);
          break;
        case '-':
          this.addRemoval(offset, parseInt(value, 36));
          break;
      }

    }

    return this;

  };

  /**
   * Will add a command to insert text to this changeset
   *
   * @param {number} offset - The character offset at which the
   *     text will be inserted
   * @param {string} text - The text that will be inserted
   * @returns {*}
   */
  this.addInsertion = function (offset, text) {

    var insertion = this._createInsertion(offset, text),
      merged = false,
      i, len;

    this._insertions = this._insertions || [];
    len = this._insertions.length;

    for (i = 0; i < len; i += 1) {
      if (merged = this._tryMerge(this._insertions[i], insertion))
        break;
    }

    if (!merged) {
      this._insertions.push(insertion);
    }

    return this;
  };

  /**
   * Will add a command to remove text to this changeset
   *
   * @param {number} offset - The character offset at which the
   *     text will be inserted
   * @param {number} numChars - The number of characters that will
   *     be removed starting from the offset
   * @returns {*}
   */
  this.addRemoval = function (offset, numChars) {
    this._removals = this._removals || [];
    this._removals.push(this._createRemoval(offset, numChars));
    return this;
  };

  /**
   * Getter for this instance's insertions
   * @returns {{start: number, end: number, text: string}[]}
   */
  this.getInsertions = function () {
    return this._insertions;
  };

  /**
   * Getter for this instance's insertions
   * @returns {{start: number, numChars: number}[]}
   */
  this.getRemovals = function () {
    return this._removals;
  };

  /**
   * Creates an object representing an insertion
   *
   * @param {number} offset - The character offset from which the
   *     text will be removed
   * @param {number} numChars - The number of character that will
   *     be removed
   * @returns {{start: number, numChars: number}}
   * @private
   */
  this._createRemoval = function (offset, numChars) {
    return { start:offset, numChars:numChars*-1 }
  };

  /**
   * Creates an object representing an insertion
   *
   * @param {number} offset - The character offset where the text
   *     will be inserted
   * @param {string} text - The text that will be inserted
   * @returns {{start: number, end: number, text: string}}
   * @private
   */
  this._createInsertion = function (offset, text) {
    return { start:offset, end:offset+text.length, numChars:text.length, text:text }
  };

  /**
   * Tries to merge 2 insertions and will return true or false
   * whether or not the insertions could be merged.
   *
   * @param {{start: number, end: number, text: string}} a - An
   *     insertion object
   * @param {{start: number, end: number, text: string}} b - An
   *     insertion object
   * @returns {boolean} - Returns if the insertions have been
   *     merged
   * @private
   */
  this._tryMerge = function (a, b) {
    if (this._insertionIntersects(a, b)) {
      this._mergeInsertion(a, b);
      return true;
    }
    return false;
  };

  /**
   * Merges 'b' into 'a'
   *
   * @param {{start: number, end: number, text: string}} a - An
   *     insertion object
   * @param {{start: number, end: number, text: string}} b - An
   *     insertion object
   * @returns {{start: number, end: number, text: string}}
   * @private
   */
  this._mergeInsertion = function (a, b) {
    var offset = b.start - a. start;
    a.text = a.text.substr(0, offset) + b.text + a.text.substr(offset);
    return a;
  };

  /**
   * Returns true if the insertion given as 'b' starts inside
   * the insertion given as 'a'
   *
   * @param {{start: number, end: number, text: string}} a - An
   *     insertion object
   * @param {{start: number, end: number, text: string}} b - An
   *     insertion object
   * @returns {boolean}
   * @private
   */
  this._insertionIntersects = function (a, b) {
    return a.start <= b.start || b.start <= a.end;
  };

  /**
   * Reads the charbank from a changeset string
   *
   * @param {string} str - A serialized changeset
   * @returns {string|null} - The charbank or null
   *     if there is no charbank
   * @private
   */
  this._getCharbank = function (str) {
    var opsEnd = str.indexOf('$')+1;
    return opsEnd >= 0 ? str.substring(opsEnd) : null;
  };

}).call(Type.Etherpad.Changeset.prototype);



module.exports = Type.Etherpad.Changeset;

