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
   * @param tag
   * @param start
   * @param end
   * @returns {TempDomHelper}
   * @private
   */
  this._wrapWith = function(textNode, tag, start, end) {
    var wrapContents = textNode.splitText(start);
    wrapContents.splitText(end - start);
    console.log(wrapContents);
    return this;
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
