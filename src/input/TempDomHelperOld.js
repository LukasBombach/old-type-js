'use strict';

function TempDomHelper() {
}


(function () {

  this._inlineCommands = {
    strong     : 'strong',
    em         : 'em',
    u          : 'u',
    s          : 's',
    h1         : 'h1',
    h2         : 'h2',
    h3         : 'h3',
    h4         : 'h4',
    blockquote : 'blockquote'
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

    var tagName = this._inlineCommands[cmd],
      startTag = this._isInside(tagName, rangeInfo.startContainer),
      endTag = this._isInside(tagName, rangeInfo.endContainer);;

    if(rangeInfo.startContainer === rangeInfo.endContainer && startTag !== false) {
      this._split(startTag, rangeInfo.startOffset, rangeInfo.endOffset);
    }

    else if(rangeInfo.startContainer === rangeInfo.endContainer) {
      this._wrapWith(rangeInfo.startContainer, this._inlineCommands[cmd], rangeInfo.startOffset, rangeInfo.endOffset);
    }

    else if(startTag !== false && endTag === false) {
      this._extendEndTo(rangeInfo, this._inlineCommands[cmd]);
    }

    else if(startTag === false && endTag !== false) {
      this._extendStartTo(rangeInfo, this._inlineCommands[cmd]);
    }

    else {
      this._wrapWithMultiple(rangeInfo, this._inlineCommands[cmd]);
    }

    return this;
  };

  /**
   *
   * @param rangeInfo
   * @param tagName
   * @returns {*}
   * @private
   */
  this._wrapWithMultiple = function(rangeInfo, tagName) {

    var startEl = rangeInfo.startContainer.parentNode,
      endEl = rangeInfo.endContainer.parentNode,
      newMiddleEl = window.document.createElement(tagName),
      sibling = startEl.nextSibling;

    // startcontainer < insert inside till end
    var formattedStartText = rangeInfo.startContainer.splitText(rangeInfo.startOffset);
    startEl.replaceChild(this._nel(formattedStartText.nodeValue, tagName), formattedStartText);

    // elements in between < wrap all (simplest markup)
    endEl.parentElement.insertBefore(newMiddleEl, endEl);
    while(sibling !== endEl && sibling !== null) {
      newMiddleEl.appendChild(sibling);
      sibling = sibling.nextSibling;
    }

    // endcontainer < insert inside from start
    var formattedEndText = rangeInfo.endContainer.splitText(rangeInfo.endOffset).previousSibling;
    endEl.replaceChild(this._nel(formattedEndText.nodeValue, tagName), formattedEndText);

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
   *
   * @param el
   * @param start
   * @param end
   * @returns {*}
   * @private
   */
  this._split = function(el, start, end) {

    if(el.childNodes.length > 1) {
      console.log('Nested elements not implemented yet, doing nothing.');
      return;
    }

    var startTag = '<'+el.tagName.toLowerCase()+'>',
      endTag = '</'+el.tagName.toLowerCase()+'>',
      text = el.innerHTML,
      parts = [];

    parts.push(text.substr(0, start));
    parts.push(text.substr(start, end-start));
    parts.push(text.substr(end));

    el.insertAdjacentHTML('afterend', startTag+parts[0]+endTag + parts[1] + startTag+parts[2]+endTag);
    el.parentNode.removeChild(el);

    return this;
  };

  /**
   * Todo: Restraining Container
   *
   * @param selector
   * @param el
   * @returns {boolean|Node}
   * @private
   */
  this._isInside = function(selector, el) {
    while (el.parentNode) {
      if (this._matches(el, selector)) {
        return el;
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

  /**
   *
   * @param str
   * @returns {NodeList|Node}
   * @private
   * @param wrapwith
   */
  this._createFromHTML = function(str, wrapwith) {

    if(wrapwith !== null) {
      str = '<'+wrapwith+'>' + str + '</'+wrapwith+'>';
    }

    //var frag = document.createDocumentFragment();
    //var frag = window.document.createElement('div');
    //frag.innerHTML = str;

    var parser = new DOMParser();
    var frag = parser.parseFromString(str, "text/xml");

    return frag.childNodes.length == 1 ? frag.childNodes[0] : frag.childNodes;
  };

  /**
   * Shorthand for _createFromHTML
   *
   * @param str
   * @returns {NodeList|Node}
   * @private
   */
  this._nel = function(str, wrapwith) {
    return this._createFromHTML(str, wrapwith);
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
