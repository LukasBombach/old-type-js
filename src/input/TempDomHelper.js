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

    // Stop on unknown tags
    if (this._tags[tag] === undefined) {
      console.debug('Tag "' + tag + '" not implemented');
      return this;
    }

    // Call command handler for either inline or block commands
    var handler = this._tags[tag] === this._COMMAND_TYPE_INLINE ? '_inline' : '_block';
    this[handler].apply(this, arguments);

    return this;
  };

  /**
   *
   * @param tag
   * @param typeRange
   * @param params
   * @returns {TempDomHelper}
   * @private
   */
  this._inline = function (tag, typeRange, params) {

    //if (!typeRange.containsMultipleElements()) {
    //  if (typeRange.getStartTagName() !== cmdTag) {
    //    this._insert(typeRange.startContainer, typeRange.startOffset, typeRange.endOffset);
    //  } else {
    //    this._remove(typeRange.startContainer, typeRange.startOffset, typeRange.endOffset);
    //  }
    //} else {
    //  if (typeRange.getStartTagName() !== cmdTag) {
    //    this._insert(typeRange.startContainer, typeRange.startOffset, typeRange.endOffset);
    //  } else {
    //    this._remove(typeRange.startContainer, typeRange.startOffset, typeRange.endOffset);
    //  }
    //}

    //if (typeRange.startsOrEndsInTag(tag)) {
    //}

    if (typeRange.isEnclosedByTag(tag)) {
      this._remove(tag, typeRange);
    } else {
      this._insert(tag, typeRange);
    }

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
  this._block = function (cmd, typeRange, params) {

    return this;
  };

  this._insertNewNew = function(tag, rangeInfo) {

    // move through elements until endcontainer is reached
    // or end of parent element is reached
    // include everything in between

    // then find next sibling of parent (parent's parent etc)
    // and repeat this method

    // ----

    // other idea
    // iterate over siblings
    // if endNode (endContainer) is found, wrap including part of endcontainer ✓

    // if node parent to endNode is found, wrao until before that node and apply this method to first textNode in there
    // What do with

    // if node parent to end is found, wrap till before that and apply this method to that node
    // if end of parent is found wrap find next sibling to parent


    // ---

    // Immer siblings iterieren und wrappen. bis man den sibling findet der das ding als child hat
    // -> note: selbst wenn letzteres ein einfaches <u>endNode<u> element ist, wird es als node.contains(endNode) gefunden
    // Wenn der node.contains(endNode) gefunden wurde, bei seinem ersten ChildNode anfangen und den selben algorithmus ausführen

    // Deswegen sollte _insert irgendwie mit elementen arbeiten und nicht mit textnodes
    // TextNodes sind auch einfach nur nodes, von daher muss man es nur als sonderfall betrachten wenn currentNode = startContainer


    // Todo what if start end end node are 2 adjacent text nodes
    if (rangeInfo.startsAndEndsInSameNode()) {
      this._insertInTextNode(tag, rangeInfo.startContainer, rangeInfo.startOffset, rangeInfo.endOffset);
      return this;
    }

    var startNode = rangeInfo.startContainer.splitText(rangeInfo.startOffset),
      endNode     = rangeInfo.endContainer.splitText(rangeInfo.endOffset).previousSibling,
      currentNode = startNode,
      nodesToWrap = [];

    do {
      nodesToWrap.push(currentNode);
      currentNode = currentNode.nextSibling;
    } while (currentNode && !currentNode.contains(endNode));

    if (currentNode === endNode) {
      nodesToWrap.push(currentNode);
    }

    DomUtil.wrap(tag, nodesToWrap);

  };

  /**
   * Todo Aufschreiben: Technik an Virtual Dom angelehnt, möglichst wenige operations
   *
   * @param tag
   * @param rangeInfo
   * @returns {string}
   * @private
   */
  this._insertOperations = function (tag, rangeInfo) {

    var startContainer = rangeInfo.startContainer,
      startOffset      = rangeInfo.startOffset,
      endContainer     = rangeInfo.endContainer,
      endOffset        = rangeInfo.endOffset,
      mergeNodes       = [],
      addNode;

    if (startContainer === endContainer) {
      if (rangeInfo.endTagIs(tag)) {
        return 'Tag rangeInfo.endTag()';
      }
      return '(endOffset === endContainer.length) ? endContainer : endContainer.splitText(endOffset).previousSibling';
    }

    if (rangeInfo.startTagIs(tag)) {
      addNode = "Tag rangeInfo.getStartElement()";
    } else {
      addNode = 'New tag at startContainer, startOffset, startContainer.length';
    }

    do {
      mergeNodes.push(addNode);
      addNode = addNode.nextSibling;
    } while (addNode.nextSibling !== null && !addNode.nextSibling.contains(endContainer));

    if (addNode.nextSibling.contains(endContainer)) {
      mergeNodes.push(this._insertOperations());
    }

    if (addNode.nextSibling === null) {

    }

  };

  /**
   * Todo Aufschreiben: Technik an Virtual Dom angelehnt, möglichst wenige operations
   *
   * @param tag
   * @param rangeInfo
   * @returns {string}
   * @private
   */
  this._insertNew = function (tag, rangeInfo) {

    var startContainer = rangeInfo.startContainer,
      startOffset      = rangeInfo.startOffset,
      endContainer     = rangeInfo.endContainer,
      endOffset        = rangeInfo.endOffset,
      endTextNode      = (endOffset === endContainer.length) ? endContainer : endContainer.splitText(endOffset).previousSibling,
      startTag,
      sibling,
      wrapTags = [];

    if (startContainer === endContainer) {
      return 'New tag at startContainer, startOffset, endOffset';
    }

    if (rangeInfo.startTagIs(tag)) {
      startTag = sibling = rangeInfo.getStartElement();
    } else {
      startTag = sibling = this._insertInTextNode(tag, startContainer, startOffset, startContainer.length);
    }

    while (sibling = sibling.nextSibling) {

      if (sibling === endTextNode) {
        wrapTags.push(sibling);
        break;
      } else if (sibling.contains(endContainer)) {
        break;
      } else {
        wrapTags.push(sibling);
      }
    }

    return DomUtil.moveElementsTo(startTag, wrapTags);


  };

  /**
   *
   * @param tag
   * @param rangeInfo
   * @returns {*}
   * @private
   */
  this._insert = function (tag, rangeInfo) {

    var startContainer = rangeInfo.startContainer,
      startOffset = rangeInfo.startOffset,
      endContainer = rangeInfo.endContainer,
      endOffset = rangeInfo.endOffset,
      startTag,
      sibling,
      wrapTags = [],
      nextTextNode;

    if (startContainer === endContainer) {
      this._insertInTextNode(tag, startContainer, startOffset, endOffset);
      return this;
    }

    if (rangeInfo.startTagIs(tag)) {
      startTag = sibling = rangeInfo.getStartElement();
    } else {
      startTag = sibling = this._insertInTextNode(tag, startContainer, startOffset, startContainer.length);
    }

    while (true) {
      if (sibling.nextSibling !== null || sibling.nextSibling === endContainer) {
        wrapTags.push(sibling);
      } else {
        break;
      }
    }

    while (sibling.nextSibling !== null && !sibling.nextSibling.contains(endContainer)) {
      sibling = sibling.nextSibling;
      wrapTags.push(sibling);
    }

    this._extendTagTo(startTag, wrapTags);

    //if (sibling && sibling.contains(endContainer)) {
    //  firstTextNode = DomUtil.firstTextNode(sibling);
    //  this._insert(tag, new RangeInfo(firstTextNode, 0, endContainer, endOffset));
    //}

    nextTextNode = DomUtil.nextTextNode(sibling);
    this._insert(tag, new RangeInfo(nextTextNode, 0, endContainer, endOffset));


    // create start node
    // while next node
    // if contains endNode
      // go in recursively


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

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
