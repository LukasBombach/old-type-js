'use strict';

var RangeInfo = require('../range_info');
var DomUtil = require('../dom_utilities');

function TempDomHelper() {
}


(function () {

  this._TYPE_INLINE = 0;
  this._TYPE_BLOCK = 1;

  this._tags = {
    strong     : this._TYPE_INLINE,
    em         : this._TYPE_INLINE,
    u          : this._TYPE_INLINE,
    s          : this._TYPE_INLINE,
    h1         : this._TYPE_BLOCK,
    h2         : this._TYPE_BLOCK,
    h3         : this._TYPE_BLOCK,
    h4         : this._TYPE_BLOCK,
    h5         : this._TYPE_BLOCK,
    h6         : this._TYPE_BLOCK,
    blockquote : this._TYPE_BLOCK
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @param params
   * @returns {TempDomHelper}
   */
  this.cmd = function (tag, typeRange, params) {
    var handler = this._handlerFor(tag);
    this[handler].apply(this, arguments);
    return this;
  };

  /**
   *
   * @param tag
   * @param rangeInfo
   * @returns {*}
   * @private
   */
  this.inline = function (tag, rangeInfo) {

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
   * @returns {*}
   * @private
   */
  this.block = function (cmd, typeRange, params) {

    return this;
  };

  /**
   *
   * @param tag
   * @param startNode
   * @param endNode
   * @returns {*}
   * @private
   */
  this._wrapInline = function (tag, startNode, endNode) {

    // Required variables
    var currentNode = startNode,
      nodesToWrap = [];

    // We iterate through all siblings until we found the end of this
    // containing node or we found a node that is the endNode or contains
    // the endNode
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
      this._insertNewNew(tag, currentNode.firstChild, endNode);

    // We have reached the last element of the containing node. We find
    // the next element in the document flow and apply this algorithm
    // recursively to that node
    } else if (currentNode === null) {
      DomUtil.wrap(tag, nodesToWrap);
      this._insertNewNew(tag, currentNode.firstChild, endNode);
    }

    // Chaining
    return this;
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @returns {*}
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
   * @returns {*}
   * @private
   */
  this._removeFromTextNode = function (tag, textNode, start, end) {

    return this;
  };

  /**
   *
   * @param tag
   * @returns {*}
   * @private
   */
  this._handlerFor = function (tag) {

    if (this._tags[tag] === this._TYPE_INLINE) {
      return 'inline';
    }

    if (this._tags[tag] === this._TYPE_BLOCK) {
      return 'block';
    }

    console.debug('Tag "' + tag + '" not implemented');
    return '_noop';

  };

  /**
   * No op multi-puprose handler
   *
   * @returns {*}
   * @private
   */
  this._noop = function () {
    return this;
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
