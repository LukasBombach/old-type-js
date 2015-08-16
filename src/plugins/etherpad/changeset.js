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
      offsets = { absolute: 0, stack: []},
      rawMatch;

    while ((rawMatch = this._changesetRegex.exec(str)) !== null) {
      this._addMatchToStack(offsets, charbank, this._parseMatch(rawMatch));
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
    }

    this._mergeOrPush(this._createFromMatch(offset, charbank, match));

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
    } else if (!(change instanceof Type.Etherpad.Changeset.Changes.Movement)) {
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
        return new Type.Etherpad.Changeset.Changes.Insertion(offset.absolute, charbank);
      case '-':
        return Type.Etherpad.Changeset.Changes.Removal.fromMatch(offset, match);
      default:
        Type.Development.debug('Cannot match operator ' + match.operator, match);
        return null;
    }
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

