'use strict';

function TempDomHelper() {
}


(function () {

  this._inlineCommands = {
    strong : 'strong',
    em     : 'em',
    u      : 'u'
  };

  /**
   *
   * @param cmd
   * @param rangeInfo
   * @returns {TempDomHelper}
   */
  this.cmd = function(cmd, rangeInfo) {
    var args = Array.prototype.slice.call(arguments, 2);

    if(this._inlineCommands[cmd] !== null) {
      args.unshift(cmd, rangeInfo);
      this._inline.apply(this, args);
    }

    return this;
  };

  /**
   *
   * @param cmd
   * @param rangeInfo
   * @returns {*}
   * @private
   */
  this._inline = function(cmd, rangeInfo) {
    var tag = this._inlineCommands[cmd];
    if(rangeInfo.startContainer === rangeInfo.endContainer && this._isInside(tag, rangeInfo.startContainer)) {
      console.log('textNode is inside node of same formatting, doing nothing');
    } else if(rangeInfo.startContainer === rangeInfo.endContainer) {
      this._wrapWith(rangeInfo.startContainer, this._inlineCommands[cmd], rangeInfo.startOffset, rangeInfo.endOffset);
    } else {
      console.log('startContainer does not equal endContainer, not implemented yet')
    }
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

  /**
   * Todo: Restraining Container
   *
   * @param selector
   * @param el
   * @returns {boolean}
   * @private
   */
  this._isInside = function(selector, el) {
    while (el.parentNode) {
      if (this._matches(el, selector)) {
        return true;
      }
      el = el.parentNode;
    }
    return false;
  };

  /**
   *
   * @param el
   * @param selector
   * @returns {boolean}
   * @private
   */
  this._matches = function(el, selector) {
    var _matches = (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector);

    if (_matches) {
      return _matches.call(el, selector);
    } else {
      var nodes = el.parentNode.querySelectorAll(selector);
      for (var i = nodes.length; i--;) {
        if (nodes[i] === el)
          return true;
      }
      return false;
    }
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
