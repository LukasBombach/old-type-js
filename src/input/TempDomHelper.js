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
    rangeInfo.ensureIsInside(this.constrainingNode);
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

    var currentNode = startNode,
      nodesToWrap   = [],
      nextNode;

    while (currentNode && !currentNode.contains(endNode)) {
      nodesToWrap.push(currentNode);
      currentNode  = currentNode.nextSibling;
    }

    if (currentNode === endNode) {
      nodesToWrap.push(currentNode);
    }

    if (currentNode && DomUtil.containsButIsnt(currentNode, endNode)) {
      this.inline(tag, currentNode.firstChild, endNode);
    }

    if (currentNode === null) {
      nextNode = DomUtil.nextNode(startNode.parentNode.lastChild, this.constrainingNode);
      this.inline(tag, nextNode, endNode);
    }

    DomUtil.wrap(tag, nodesToWrap);

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
   * @param tag
   * @param typeRange
   * @returns {TempDomHelper}
   * @private
   */
  this.remove = function (tag, typeRange) {
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
