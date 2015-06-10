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

    // Break on unknown tags
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

    if (typeRange.startsOrEndsInTag(tag)) {
      
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
   * @param textNode
   * @param start
   * @param end
   * @private
   */
  this._insert = function (textNode, start, end) {

  };

  /**
   *
   * @param textNode
   * @param start
   * @param end
   * @private
   */
  this._remove = function (textNode, start, end) {

  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
