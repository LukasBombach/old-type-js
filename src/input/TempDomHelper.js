'use strict';

function TempDomHelper() {
}


(function () {

  /**
   *
   * @param textNode
   * @param cmd
   * @returns {TempDomHelper}
   */
  this.cmd = function(textNode, cmd) {
    var args = Array.prototype.slice.call(arguments, 2);
    args.unshift(textNode);
    this['_'+cmd].apply(this, args);
    return this;
  };

  /**
   *
   * @param textNode
   * @param start
   * @param end
   * @returns {TempDomHelper}
   * @private
   */
  this._strong = function(textNode, start, end) {
    this._wrapWith(textNode, 'strong', start, end);
    return this;
  };

  /**
   *
   * @param textNode
   * @param start
   * @param end
   * @returns {TempDomHelper}
   * @private
   */
  this._em = function(textNode, start, end) {
    this._wrapWith(textNode, 'em', start, end);
    return this;
  };

  /**
   *
   * @param textNode
   * @param start
   * @param end
   * @returns {TempDomHelper}
   * @private
   */
  this._u = function(textNode, start, end) {
    this._wrapWith(textNode, 'u', start, end);
    return this;
  };

  /**
   *
   * @param textNode
   * @param tagName
   * @param start
   * @param end
   * @returns {TempDomHelper}
   * @private
   */
  this._wrapWith = function(textNode, tagName, start, end) {
    var wrapContents = textNode.splitText(start);
    wrapContents.splitText(end - start);
    var tag = document.createElement(tagName);
    tag.innerHTML = wrapContents.nodeValue;
    wrapContents.parentNode.replaceChild(tag, wrapContents);
    return this;
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
