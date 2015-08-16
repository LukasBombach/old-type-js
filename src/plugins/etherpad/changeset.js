'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset = function () {
  this._stack = [];
  this._insertions = [];
  this._removals = [];
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
   * Maps Etherpad's formatting codes to readable formattings
   *
   * @type {{0: string}}
   * @private
   */
  this._formattingCodes = {
    0 : 'strong'
  };

  /**
   * Returns a serialized changeset string based on the length of
   * a given string or the text contents of a given element
   *
   * @param {string|Element} base - Either a string or an element
   * @returns {string}
   */
  this.getString = function (base) {
    var serializer = new Type.Etherpad.ChangesetSerializer(this);
    return serializer.getString(base);
  };

  /**
   * Applies this changeset to a given content
   *
   * Todo Insertions and removals must be executed in order
   * Todo not after one another
   *
   * @param {Type.Content} content - The content this changeset
   *     should be applied to
   * @param {Type.Caret} localCaret - The local user's caret
   * @returns {Type.Etherpad.Changeset} - This instance
   */
  this.apply = function (content, localCaret) {
    this._applyInsertions(content, localCaret);
    this._applyRemovals(content, localCaret);
    return this;
  };

  /**
   * Adds a serialized changeset (as a string) to this
   * changeset instance
   *
   * @param {string} str - A serialized changeset
   * @returns {Type.Etherpad.Changeset} - This instance
   */
  this.addString = function (str) {

    var charbank = this._getCharbank(str),
      rawMatch, match, offsets;

    offsets = { absolute: 0, stack: [] };

    while ((rawMatch = this._changesetRegex.exec(str)) !== null) {
      match = this._parseMatch(rawMatch);
      this._addMatchToStack(offsets, charbank, match);
      //offset += this._processMatch(offset, charbank, match);
    }

    return this;
  };

  /**
   *
   * @param {{ absolute: number, stack: number[] }} offset - An object
   *     containing offset information
   * @param {string} charbank - The charbank of a string changeset
   * @param {{attrs: string, operator: string, value: string}} match
   *     A match as returned by _parseMatch
   * @private
   */
  this._addMatchToStack = function (offset, charbank, match) {

    var delta;

    if (match.operator === '=') {
      delta = parseInt(match.value, 36);
      offset.absolute += delta;
      offset.stack.push(offset);
    } else {
      this._mergeOrPush(this._createFromMatch(offset, charbank, match));
    }

    return this;

  };

  /**
   *
   * @param {Type.Etherpad.Changeset.Changes.Change} change - A change
   *     instance or an inheriting class
   * @returns {Type.Etherpad.Changeset} - This instance
   * @private
   */
  this._mergeOrPush = function (change) {

    var last = this._stack[this._stack.length - 1];

    if (last.mergable(change)) {
      last.merge(change);
    } else {
      this._stack.push(change);
    }

    return this;
  };

  /**
   *
   * @param offset
   * @param charbank
   * @param match
   * @returns {*}
   * @private
   */
  this._createFromMatch = function (offset, charbank, match) {
    switch(match.operator) {
      case '=':
        return Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject(offset);
      case '+':
        return Type.Etherpad.Changeset.Changes.Insertion(offset.absolute, charbank);
      case '-':
        return Type.Etherpad.Changeset.Changes.Removal.fromMatch(match);
      default:
        Type.Development.debug('Cannot match operator ' + match.operator, match);
        return null;
    }
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
      merged = this._mergeInsertionIfPossible(insertion);
    if (!merged)
      this._insertions.push(insertion);
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
    this._removals.push(this._createRemoval(offset, numChars));
    return this;
  };

  this.addFormatting = function () {

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
   * Applies this changeset's insertions to a given content
   *
   * @param {Type.Content} content - The content this changeset
   *     should be applied to
   * @param {Type.Caret} localCaret - The local user's caret
   * @returns {Type.Etherpad.Changeset} - This instance
   * @private
   */
  this._applyInsertions = function (content, localCaret) {
    var len, i;
    len = this._insertions.length;
    for (i = 0; i < len; i += 1) {
      content.insert(this._insertions[i].start, this._insertions[i].text);
      localCaret.moveBy(this._insertions[i].numChars);
    }
    return this;
  };

  /**
   * Applies this changeset's removals to a given content
   *
   * Todo I should not reverse the numChars here
   *
   * @param {Type.Content} content - The content this changeset
   *     should be applied to
   * @param {Type.Caret} localCaret - The local user's caret
   * @returns {Type.Etherpad.Changeset} - This instance
   * @private
   */
  this._applyRemovals = function (content, localCaret) {
    var len, i;
    len = this._removals.length;
    for (i = 0; i < len; i += 1) {
      content.remove(this._removals[i].start, this._removals[i].numChars * -1);
      localCaret.moveBy(this._removals[i].numChars * -1);
    }
    return this;
  };

  /**
   * Parses a regex match and returns a readable object
   * @param {Array|{index: number, input: string}} match - A
   *     RegEx match
   * @returns {{attrs: string, operator: string, value: string}}
   * @private
   */
  this._parseMatch = function (match) {

    if (match.index === this._changesetRegex.lastIndex)
      this._changesetRegex.lastIndex++;

    if(match[0] === '')
      return {};

    return {
      attrs    : match[1],
      operator : match[3],
      value    : match[4]
    }
  };

  /**
   * Calls insertion / removal / format operations for a give match
   * as returned by _parseMatch
   *
   * @param {number} offset - The offset for insert and del operations
   * @param {string} charbank - The charbank of a string changset
   * @param {{attrs: string, operator: string, value: string}} match
   *     A match as returned by _parseMatch
   * @returns {*}
   * @private
   */
  this._processMatch = function (offset, charbank, match) {
    switch(match.operator) {
      case '=':
        return parseInt(match.value, 36);
        break;
      case '+':
        this.addInsertion(offset, charbank);
        break;
      case '-':
        this.addRemoval(offset, parseInt(match.value, 36));
        break;
    }
    return 0;
  };

  /**
   * Creates an object representing an insertion
   *
   * @param {number} offset - The character offset from which the
   *     text will be removed
   * @param {number} numChars - The number of character that will
   *     be removed
   * @returns {{op: string, start: number, numChars: number}}
   * @private
   */
  this._createRemoval = function (offset, numChars) {
    return { op:'-', start:offset, numChars:numChars*-1 }
  };

  /**
   * Creates an object representing an insertion
   *
   * @param {number} offset - The character offset where the text
   *     will be inserted
   * @param {string} text - The text that will be inserted
   * @returns {{op: string, start: number, end: number, text: string}}
   * @private
   */
  this._createInsertion = function (offset, text) {
    return { op:'+', start:offset, end:offset+text.length, numChars:text.length, text:text }
  };

  /**
   *
   * @param {{op: string, start: number, end: number, text: string}} insertion
   *     An insertion object
   * @returns {boolean}
   * @private
   */
  this._mergeInsertionIfPossible = function (insertion) {
    var i, len;
    len = this._insertions.length;
    for (i = 0; i < len; i += 1) {
      if (this._tryMergeTwoInsertions(this._insertions[i], insertion))
        return true;
    }
    return false;
  };

  /**
   * Tries to merge 2 insertions and will return true or false
   * whether or not the insertions could be merged.
   *
   * @param {{op: string, start: number, end: number, text: string}} a - An
   *     insertion object
   * @param {{op: string, start: number, end: number, text: string}} b - An
   *     insertion object
   * @returns {boolean} - Returns if the insertions have been
   *     merged
   * @private
   */
  this._tryMergeTwoInsertions = function (a, b) {
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


/**
 * Creates a new {Type.Etherpad.Changeset} from a serialized
 * changeset string
 *
 * @param {string} str - A serialized changeset string
 * @returns {Type.Etherpad.Changeset}
 */
Type.Etherpad.Changeset.fromString = function (str) {
  var changeset = new Type.Etherpad.Changeset();
  changeset.addString(str);
  return changeset;
};


/**
 * Namespace for changes
 * @type {{}}
 */
Type.Etherpad.Changeset.Changes = {};


module.exports = Type.Etherpad.Changeset;

