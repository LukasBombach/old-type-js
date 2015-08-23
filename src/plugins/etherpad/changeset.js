'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad.Changeset instance
 *
 * @constructor
 */
Type.Etherpad.Changeset = function () {
  this._stack = [];
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
    var i, len = this._stack.length;
    for (i = 0; i < len; i += 1) {
      this._stack[i].apply(content, localCaret);
    }
    return this;
  };

  /**
   * Adds a serialized changeset (as a string) to this
   * changeset instance
   *
   * @param {string} str - A serialized changeset
   * @param {Object} apool - An Etherpad attribute pool
   * @param {string} base - Text contents
   * @returns {Type.Etherpad.Changeset} - This instance
   */
  this.addString = function (str, apool, base) {

    var charbank = this._getCharbank(str),
      nlIndices = this._getNlIndices(base),
      offsets = { absolute: 0, stack: []},
      rawMatch, match;

    while ((rawMatch = this._changesetRegex.exec(str)) !== null) {
      if (match = this._parseMatch(rawMatch))
        this._addMatchToStack(offsets, charbank, match, apool, nlIndices);
    }

    return this;

  };

  /**
   * Returns the indices of newlines in a string
   *
   * @param {string} str - The string to return the indexes of newlines for
   * @returns {number[]} - An array in indexes of the newlines in the text
   * @private
   */
  this._getNlIndices = function (str) {
    var regex = /[\n]/gi, result, indices = [];
    while ( (result = regex.exec(str)) ) {
      indices.push(result.index);
    }
    return indices;
  };

  /**
   * Getter for the operation stack
   * @returns {Array}
   */
  this.getStack = function () {
    return this._stack;
  };

  /**
   *
   * @param {{ absolute: number, stack: number[] }} offset - An object
   *     containing offset information
   * @param {string} charbank - The charbank of a string changeset
   * @param {{attrs: string, operator: string, value: string, nl: number}} match
   *     A match as returned by _parseMatch
   * @param {Object} apool - An Etherpad attribute pool
   * @param {number[]} nlIndices -
   * @private
   */
  this._addMatchToStack = function (offset, charbank, match, apool, nlIndices) {

    var delta;

    this._mergeOrPush(this._createFromMatch(offset, charbank, match, apool));

    if (match.operator === '=') {
      delta  = parseInt(match.value, 36);
      delta += match.nl ? 1 : 0;
      offset.absolute += delta;
      offset.stack.push(offset);
    }

    return this;

  };

  /**
   *
   * @param offset
   * @param charbank
   * @param match
   * @param apool
   * @returns {*}
   * @private
   */
  this._createFromMatch = function (offset, charbank, match, apool) {

    var attrs = this._getAttributesFromMatch(match, apool);

    //if (!attrs.length && match.operator === '=') {
    //  return Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject(offset);
    //}
    //switch(attrs[0]) {
    //}

    //return Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject(offset);

    switch(match.operator) {
      case '*':
        return Type.Etherpad.Changeset.Changes.Command.fromAPool(apool);
      case '=':
        return this._operationOrMovement(offset, charbank, match, attrs);
      case '+':
        return new Type.Etherpad.Changeset.Changes.Insertion(offset.absolute, charbank);
      case '-':
        return Type.Etherpad.Changeset.Changes.Removal.fromMatch(offset, match);
      default:
        Type.Development.debug('Cannot match operator ' + match.operator, match);
        return null;
    }
  };

  this._operationOrMovement = function (offset, charbank, match, attrs) {
    if (!attrs.length) {
      return Type.Etherpad.Changeset.Changes.Movement.fromOffsetObject(offset, match);
    } else {
      return Type.Etherpad.Changeset.Changes.Formatting.fromAttrs(attrs, offset.absolute, match);
    }
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

    if (!!last && last.mergable(change)) {
      last.merge(change);
    } else if (!(change instanceof Type.Etherpad.Changeset.Changes.Movement)) {
      this._stack.push(change);
    }

    return this;
  };


  /**
   * Parses a regex match and returns a readable object
   *
   * @param {Array|{index: number, input: string}} match - A
   *     RegEx match
   * @returns {{attrs: string, operator: string, value: string}}
   * @private
   */
  this._parseMatch = function (match) {

    if (match.index === this._changesetRegex.lastIndex)
      this._changesetRegex.lastIndex++;

    if(match[0] === '')
      return false;

    return {
      attrs    : match[1],
      nl       : match[2],
      operator : match[3],
      value    : match[4]
    }
  };

  /**
   * Returns the attributes from a match and an apool
   *
   * @param {{attrs: string, operator: string, value: string}} match - A
   *     match parsed by this._parseMatch
   * @param {{numToAttrib: array}} apool - An attribute pool from an
   *     Etherpad server
   * @returns {*[]}
   * @private
   */
  this._getAttributesFromMatch = function (match, apool) {
    var i;
    if (!match.attrs.length) return [];
    i = parseInt(match.attrs.substr(1));
    return [apool.numToAttrib[i]]
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
Type.Etherpad.Changeset.fromString = function (str, apool, base) {
  var changeset = new Type.Etherpad.Changeset();
  changeset.addString(str, apool, base);
  return changeset;
};


/**
 * Namespace for changes
 * @type {{}}
 */
Type.Etherpad.Changeset.Changes = {};


module.exports = Type.Etherpad.Changeset;

