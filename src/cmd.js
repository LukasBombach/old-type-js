'use strict';

var Type = require('./core');
var RangeInfo = require('./range_info');
var DomUtil = require('./dom_utilities');

/**
 *
 * @param constrainingNode
 * @constructor
 */
function Cmd(constrainingNode) {
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
   * @returns {Cmd}
   */
  this.cmd = function (tag, rangeInfo, params) {
    //var args, startNode, endNode;
    //rangeInfo.ensureIsInside(this.constrainingNode);
    //startNode = this._getStartNode(tag, rangeInfo);
    //endNode = this._getEndNode(tag, rangeInfo);
    //params = Array.prototype.slice.call(arguments, 2);
    //args = [tag, startNode, endNode].concat(params);
    //this._handlerFor(tag).apply(this, args);
    rangeInfo.ensureIsInside(this.constrainingNode);
    this._handlerFor(tag).apply(this, arguments);
    return this;
  };

  /**
   *
   * @param tag
   * @param rangeInfo
   * @param params
   * @returns {Cmd}
   */
  this.inline = function (tag, rangeInfo, params) {

    var args, startNode, endNode;

    startNode = this._getStartNode(tag, rangeInfo);
    endNode   = this._getEndNode(tag, rangeInfo);
    params    = Array.prototype.slice.call(arguments, 2);
    args      = [tag, startNode, endNode].concat(params);

    if (rangeInfo.startsAndEndsInSameElement() && rangeInfo.startTagIs(tag)) {
      this.removeInline.apply(this, args);
    } else {
      this.insertInline.apply(this, args);
    }

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
   * @returns {Cmd}
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
      nextNode = DomUtil.nextNode(startNode.parentNode.lastChild, this.constrainingNode);
      this.insertInline(tag, nextNode, endNode);
    }

    // Wrap the nodes we got so far in the provided tag
    DomUtil.wrap(tag, nodesToWrap);

    // Chaining
    return this;

  };

  /**
   *
   * @param tag
   * @param startNode
   * @param endNode
   * @param params
   * @returns {Cmd}
   */
  this.removeInline = function (tag, startNode, endNode, params) {


    return this;
  };

  /**
   *
   * @param cmd
   * @param typeRange
   * @param params
   * @returns {Cmd}
   * @private
   */
  this.block = function (cmd, typeRange, params) {
    return this;
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @returns {Cmd}
   * @private
   */
  this.remove = function (tag, typeRange) {
    return this;
  };

  /**
   *
   * @param tag
   * @param rangeInfo
   * @returns {*}
   * @private
   */
  this._getStartNode = function (tag, rangeInfo) {
      return rangeInfo.startTagIs(tag) ? rangeInfo.getStartElement() : rangeInfo.splitStartContainer();
  };

  /**
   *
   * @param tag
   * @param rangeInfo
   * @returns {*}
   * @private
   */
  this._getEndNode = function (tag, rangeInfo) {
    return rangeInfo.endTagIs(tag) ? rangeInfo.getEndElement() : rangeInfo.splitEndContainer();
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
   * Multi-purpose no-op handler
   *
   * @returns {Cmd}
   * @private
   */
  this._noop = function () {
    return this;
  };

}).call(Cmd.prototype);

/**
 * Public interface for the command plugin
 * Formats the current selection with a given tag
 *
 * @param {String} tag -
 * @param {...*} params - Any number of arbitrary parameters
 */
Type.fn.cmd = function (tag, params) {
  if (!this._plugins['cmd']) {
    this._plugins['cmd'] = new Cmd(this.options.root);
  }
  this._plugins['cmd'].cmd(tag, RangeInfo.fromCurrentSelection(), params);
  return this;
};

/**
 * Todo Alternative Variante, TYPE-22
 */
/*Type.on('ready', function(type) {
  var cmd = new Cmd(type.options.root);
  type.cmd = function (tag, params) {
    var range = RangeInfo.fromCurrentSelection();
    cmd.cmd(tag, range, params);
  }
});*/

module.exports = Cmd;
