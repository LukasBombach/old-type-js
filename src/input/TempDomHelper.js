'use strict';

var RangeInfo = require('../range_info');
var DomUtil = require('../dom_utilities');

/**
 *
 * @param constrainingNode
 * @constructor
 */
function TempDomHelper(constrainingNode) {
  this.constrainingNode = constrainingNode;
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
   * @param {RangeInfo} rangeInfo - An object containing data on which part
   *     of the text to format
   * @param {...*} params - Any number of arguments that specify attributes
   *     for the tag
   * @returns {TempDomHelper}
   */
  this.cmd = function (tag, rangeInfo, params) {
    var args;
    params = Array.prototype.slice.call(arguments, 2);
    args = [tag, rangeInfo.splitStartContainer(), rangeInfo.splitEndContainer()];
    args = args.concat(params);
    this._handlerFor(tag).apply(this, args);
    return this;
  };

  /**
   *
   * @param {String} tag
   * @param {Node} startNode
   * @param {Node} endNode
   * @param {...*} params
   * @returns {TempDomHelper}
   */
  this.inline = function (tag, startNode, endNode, params) {

    // Required variables
    var currentNode = startNode,
      parent = currentNode.parentNode,
      nodesToWrap = [];
    
    // We iterate through all siblings until we found the end of this
    // containing node or we found a node that is the endNode or contains
    // the endNode
    while (currentNode && !currentNode.contains(endNode)) {
      nodesToWrap.push(currentNode);
      currentNode = currentNode.nextSibling;
    }

    // The node where we stopped is the endNode. We can include it in
    // the wrapped nodes and stop this algorithm. Note: This will also
    // happen if the startNode equaled the endNode to begin with
    if (currentNode === endNode) {
      nodesToWrap.push(currentNode);
      DomUtil.wrap(tag, nodesToWrap);

      // The node where we stopped contains the endNode. We wrap up what
      // we have and apply this algorithm recursively to the contents of
      // that node
    } else if (currentNode && currentNode.contains(endNode)) {
      DomUtil.wrap(tag, nodesToWrap);
      this._wrapInline(tag, currentNode.firstChild, endNode);

      // We have reached the last element of the containing node. We find
      // the next element in the document flow and apply this algorithm
      // recursively to that node
    } else if (currentNode === null) {
      DomUtil.wrap(tag, nodesToWrap);
      if (parent !== null) {
        this._wrapInline(tag, DomUtil.nextNode(parent), endNode);
      }
    }

    // Chaining
    return this;

  };

  /**
   *
   * @param tag
   * @param rangeInfo
   * @returns {TempDomHelper}
   * @private
   */
  this.inlineOld = function (tag, rangeInfo) {

    // Required variables
    var startNode, endNode;

    // Create tag and finish if a singe text node is selected
    // Todo what if start end end node are 2 adjacent text nodes
    if (rangeInfo.startsAndEndsInSameNode()) {
      this._insertInTextNode(tag, rangeInfo.startContainer, rangeInfo.startOffset, rangeInfo.endOffset);
      return this;
    }

    // Create new text node including the selected text for processing in wrap method (begin of selection)
    if (rangeInfo.startOffset === 0) {
      startNode = rangeInfo.startContainer;
    } else {
      startNode = rangeInfo.startContainer.splitText(rangeInfo.startOffset);
    }

    // Create new text node including the selected text for processing in wrap method (end of selection)
    if (rangeInfo.endOffset === rangeInfo.endContainer.length) {
      endNode = rangeInfo.endContainer;
    } else {
      endNode = rangeInfo.endContainer.splitText(rangeInfo.endOffset).previousSibling;
    }

    // Wrap nodes from startNode to endNode in new tag
    this._wrapInline(tag, startNode, endNode);

    // Chaining
    return this;
  };

  /**
   *
   * @param cmd
   * @param typeRange
   * @param params
   * @returns {TempDomHelper}
   * @private
   */
  this.block = function (cmd, typeRange, params) {

    return this;
  };

  /**
   *
   * @param {String} tag
   * @param {Node} startNode
   * @param {Node} endNode
   * @returns {TempDomHelper}
   * @private
   */
  this._wrapInline = function (tag, startNode, endNode) {

    // Required variables
    var currentNode = startNode,
      parent = currentNode.parentNode,
      nodesToWrap = [];

    // We iterate through all siblings until we found the end of this
    // containing node or we found a node that is the endNode or contains
    // the endNode
    // Todo What if startNode.contains(endNode) - is that even possible? yes in recursion (first else if)
    do {
      nodesToWrap.push(currentNode);
      currentNode = currentNode.nextSibling;
    } while (currentNode && !currentNode.contains(endNode));

    // The node where we stopped is the endNode. We can include it in
    // the wrapped nodes and stop this algorithm
    if (currentNode === endNode) {
      nodesToWrap.push(currentNode);
      DomUtil.wrap(tag, nodesToWrap);

    // The node where we stopped contains the endNode. We wrap up what
    // we have and apply this algorithm recursively to the contents of
    // that node
    } else if (currentNode && currentNode.contains(endNode)) {
      DomUtil.wrap(tag, nodesToWrap);
      this._wrapInline(tag, currentNode.firstChild, endNode);

    // We have reached the last element of the containing node. We find
    // the next element in the document flow and apply this algorithm
    // recursively to that node
    } else if (currentNode === null) {
      DomUtil.wrap(tag, nodesToWrap);
      if (parent !== null) {
        this._wrapInline(tag, DomUtil.nextNode(parent), endNode);
      }
    }

    // Chaining
    return this;
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @returns {TempDomHelper}
   * @private
   */
  this._remove = function (tag, typeRange) {

    return this;
  };

  /**
   *
   * @param tag
   * @param textNode
   * @param start
   * @param end
   * @returns {Element}
   * @private
   */
  this._insertInTextNode = function (tag, textNode, start, end) {
    // todo create element in textnode and return it
    return document.createElement(tag);
  };

  /**
   *
   * @param textNode
   * @param start
   * @param end
   * @returns {TempDomHelper}
   * @private
   */
  this._removeFromTextNode = function (tag, textNode, start, end) {

    return this;
  };

  /**
   * Todo Maybe use fallback http://stackoverflow.com/a/2881008/1183252 if tag is not found
   *
   * @param {String} tag
   * @returns {inline|block|_noop}
   * @private
   */
  this._handlerFor = function (tag) {

    tag = tag.toLowerCase();

    if (this._inlineTags.indexOf(tag) > -1) {
      return this.inline;
    }

    if (this._blockTags.indexOf(tag) > -1) {
      return this.block;
    }

    console.debug('Tag "' + tag + '" not implemented');
    return this._noop;

  };

  /**
   * No op multi-purpose handler
   *
   * @returns {TempDomHelper}
   * @private
   */
  this._noop = function () {
    return this;
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
