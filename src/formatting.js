'use strict';

var Type = require('./core');
var TypeRange = require('./type_range');
var DomUtil = require('./dom_utilities');
var Walker = require('./dom_walker');

/**
 *
 * @param {Type} type
 * @constructor
 */
function Formatting(type) {
  this._type = type;
}

(function () {

  /**
   * A list of tags that are displayed inline. We generate different markup
   * for inline and block tags. We use this array as reference to determine
   * what kind of markup to generate.
   *
   * @type {string[]}
   * @private
   */
  this._inlineTags = ["strong", "em", "u", "s"];

  /**
   * A list of tags that are displayed as block elements. We generate different
   * markup for inline and block tags. We use this array as reference to determine
   * what kind of markup to generate.
   *
   * @type {string[]}
   * @private
   */
  this._blockTags  = ["h1", "h2", "h3", "h4", "h5", "h6", "blockquote"];

  /**
   * Will call either this.inline, this.block or this._noop depending on
   * whether the given tag is an inline or block element or we do not know
   * this tag yet (the latter would call _noop which would utter no action).
   *
   * @param {String} tag - The tag that we want to format the text with
   * @param {TypeRange} typeRange - An object containing data on which part
   *     of the text to format
   * @param {...*} params - Any number of arguments that specify attributes
   *     for the tag
   * @returns {Formatting}
   */
  this.format = function (tag, typeRange, params) {
    typeRange.ensureIsInside(this._type.getRoot());
    this._handlerFor(tag).apply(this, arguments);
    return this;
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @param params
   * @returns {Formatting}
   */
  this.inline = function (tag, typeRange, params) {

    var args, startNode, endNode, enclosingTag, selPositions;

    //selPositions = typeRange.save(this._type.getRoot());

    // If the selection is enclosed the tag we want to format with
    // remove formatting from selected area
    if (enclosingTag = typeRange.elementEnclosingStartAndEnd(tag)) {
      this.removeInline(enclosingTag, typeRange);

      // Otherwise add formatting to selected area
    } else {
      startNode = this._getStartNode(tag, typeRange);
      endNode   = this._getEndNode(tag, typeRange);
      params    = Array.prototype.slice.call(arguments, 2);
      args      = [tag, startNode, endNode].concat(params);
      this.insertInline.apply(this, args);
    }

    //TypeRange.load(selPositions).select();

    return this;
  };

  /**
   * This method will wrap the given tag around (and including) all elements
   * between the startNode and endNode and try to maintain simple and valid
   * HTML. The tag should be an "inline"-element, for "block" elements use
   * {block}. Both methods have a different behaviour when generating markup.
   *
   * @param {String} tag
   * @param {Node} startNode
   * @param {Node} endNode
   * @param {...*} [params]
   * @returns {Formatting}
   */
  this.insertInline = function (tag, startNode, endNode, params) {

    // Required variables
    var currentNode = startNode,
      nodesToWrap   = [],
      nextNode;

    // Collect the startNode and all its siblings until we
    // found the endNode or a node containing it
    while (currentNode && !currentNode.contains(endNode)) {
      nodesToWrap.push(currentNode);
      currentNode  = currentNode.nextSibling;
    }

    // If the node where we stopped is the endNode, add it
    // to our collection of nodes
    if (currentNode === endNode) {
      nodesToWrap.push(currentNode);
    }

    // If the node where we stopped contains the endNode,
    // apply this algorithm on it recursively
    if (currentNode && DomUtil.containsButIsnt(currentNode, endNode)) {
      this.insertInline(tag, currentNode.firstChild, endNode);
    }

    // If we did not find the endNode but there are no more
    // siblings, find the next node in the document flow and
    // apply this algorithm on it recursively
    if (currentNode === null) {
      nextNode = Walker.next(startNode.parentNode.lastChild, this._type.getRoot());
      this.insertInline(tag, nextNode, endNode);
    }

    // Wrap the nodes we got so far in the provided tag
    DomUtil.wrap(tag, nodesToWrap);

    // Chaining
    return this;

  };

  /**
   *
   * @param {Node} enclosingTag
   * @param {TypeRange} typeRange
   * @returns {Formatting}
   */
  this.removeInline = function (enclosingTag, typeRange) {

    var tagName = enclosingTag.tagName,
      tagPositions = TypeRange.fromElement(enclosingTag).save(this._type.getRoot()),
      selPositions = typeRange.save(this._type.getRoot()),
      leftRange,
      rightRange;

    DomUtil.unwrap(enclosingTag);

    leftRange = TypeRange.load(this._type.getRoot(), tagPositions.start, selPositions.start);
    if (!leftRange.isCollapsed())
      this.inline(tagName, leftRange);

    rightRange = TypeRange.load(this._type.getRoot(), selPositions.end, tagPositions.end);
    if (!rightRange.isCollapsed())
      this.inline(tagName, rightRange);

    return this;

  };

  /**
   *
   * @param cmd
   * @param typeRange
   * @param params
   * @returns {Formatting}
   * @private
   */
  this.block = function (cmd, typeRange, params) {
    return this;
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @returns {*}
   * @private
   */
  this._getStartNode = function (tag, typeRange) {
    return typeRange.startTagIs(tag) ? typeRange.getStartElement() : typeRange.splitStartContainer();
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @returns {*}
   * @private
   */
  this._getEndNode = function (tag, typeRange) {
    return typeRange.endTagIs(tag) ? typeRange.getEndElement() : typeRange.splitEndContainer();
  };

  /**
   * Takes a tag name and returns the handler function for formatting
   * the DOM with this tag by checking if it is an inline or block tag.
   *
   * Todo Maybe use fallback http://stackoverflow.com/a/2881008/1183252 if tag is not found
   *
   * @param {String} tag - The name of the tag that the DOM should be
   *     formatted with.
   * @returns {inline|block|_noop} - The handler function for inline
   *     or block tags, or _noop if the tag is unknown.
   * @private
   */
  this._handlerFor = function (tag) {
    tag = tag.toLowerCase();
    if (this._inlineTags.indexOf(tag) > -1) return this.inline;
    if (this._blockTags.indexOf(tag) > -1) return this.block;
    console.debug('Tag "' + tag + '" not implemented');
    return this._noop;
  };

  /**
   * Multi-purpose no-op handler
   *
   * @returns {Formatting}
   * @private
   */
  this._noop = function () {
    return this;
  };

}).call(Formatting.prototype);

module.exports = Formatting;
