'use strict';

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

  /**
   *
   * @param tag
   * @param typeRange
   * @returns {*}
   * @private
   */
  this._insert = function (tag, typeRange) {

    var startContainer = typeRange.startContainer,
      endContainer = typeRange.endContainer,
      startOffset = typeRange.startOffset,
      endOffset = typeRange.endOffset,
      startTag;

    if (startContainer === endContainer) {
      this._insertInTextNode(tag, startContainer, startOffset, endOffset);
      return this;
    }

    if (typeRange.startTagIs(tag)) {
      startTag = typeRange.getStartElement();
    } else {
      startTag = this._insertInTextNode(tag, startContainer, startOffset, startContainer.length);
    }

    do {

      if (startTag.nextSibling.contains(endContainer)) {

      }

    } while (startTag.nextSibling && startTag.nextSibling !== endContainer);


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
