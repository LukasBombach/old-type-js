'use strict';

function TempDomHelper() {
}


(function () {

  this._COMMAND_TYPE_INLINE = 0;
  this._COMMAND_TYPE_BLOCK  = 1;

  this._commands = {
    strong     : {type: this._COMMAND_TYPE_INLINE, tag: 'strong'},
    em         : {type: this._COMMAND_TYPE_INLINE, tag: 'em'},
    u          : {type: this._COMMAND_TYPE_INLINE, tag: 'u'},
    s          : {type: this._COMMAND_TYPE_INLINE, tag: 's'},
    h1         : {type: this._COMMAND_TYPE_BLOCK,  tag: 'h1'},
    h2         : {type: this._COMMAND_TYPE_BLOCK,  tag: 'h2'},
    h3         : {type: this._COMMAND_TYPE_BLOCK,  tag: 'h3'},
    h4         : {type: this._COMMAND_TYPE_BLOCK,  tag: 'h4'},
    h5         : {type: this._COMMAND_TYPE_BLOCK,  tag: 'h5'},
    h6         : {type: this._COMMAND_TYPE_BLOCK,  tag: 'h6'},
    blockquote : {type: this._COMMAND_TYPE_BLOCK,  tag: 'blockquote'}
  };

  /**
   *
   * @param cmd
   * @param typeRange
   * @param params
   * @returns {TempDomHelper}
   */
  this.cmd = function (cmd, typeRange, params) {

    // Break on unknown commands
    if (this._commands[cmd] === undefined) {
      console.debug('Command "' + cmd + '" not implemented');
      return this;
    }

    // Call command handler for either inline or block commands
    if (this._commands[cmd].type === this._COMMAND_TYPE_INLINE) {
      this._inline.apply(this, arguments);
    } else if (this._commands[cmd].type === this._COMMAND_TYPE_BLOCK) {
      this._block.apply(this, arguments);
    } else {
      console.debug('Did not find type for "' + cmd + '"');
    }

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
  this._inline = function (cmd, typeRange, params) {

    var cmdTag = this._commands[cmd].tag;

    if (typeRange.spansToElement(cmdTag)) {
      this._unwrap(typeRange.getStartElement());
    }

    if (typeRange.isEnclosedByElement(cmdTag)) {
      this._splitElement(typeRange);
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
   * @param typeRange
   * @returns {*}
   * @private
   */
  this._splitElement = function (typeRange) {

    return this;
  };

  /**
   * TODO: Do not use insertAdjacentHTML because this destroys elements and will destroy listeners
   *
   * @param el
   * @private
   */
  this._unwrap = function (el) {
    el.insertAdjacentHTML('afterend', el.innerHTML);
    el.parentNode.removeChild(el);
    return this;
  };

}).call(TempDomHelper.prototype);


module.exports = TempDomHelper;
