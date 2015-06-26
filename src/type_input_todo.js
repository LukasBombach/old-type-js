/**
 * todo trigger events
 * @returns {TypeInput}
 */
this._onInput = function () {
  this._contents.insertText(this._el.textContent);
  this._el.innerHTML = '';
  return this;
};

/**
 * todo Wenn das clipboard beim copy befehel direkt veränderbar ist, muss nichts weiter gemacht werden
 * todo Wenn nicht, aktuelle selektion in das contenteditable ding kopieren
 * todo trigger events
 */
this._onContextMenu = function () {
};

/**
 * The input element should be moved with the visible caret because the
 * page scrolls to the input element when the user enters something.
 *
 * @returns {TypeInput}
 * @private
 */
this._moveElToCaret = function () {
  this._elStyle.left = this._caretStyle.left;
  this._elStyle.top  = this._caretStyle.top;
  return this;
};

/**
 * Maps character names to caret methods for keyDown events
 *
 * @type {Object}
 * @private
 */
this._caretMethodMap = {
  arrLeft  : 'moveLeft',
  arrUp    : 'moveUp',
  arrRight : 'moveRight',
  arrDown  : 'moveDown'
};

// backup
// todo remove
// Get the readable name for the key
//key  = this._keyNames[e.keyCode];

// Proxy this to the caret
//if (key in this._caretMethodMap) {
//  this.caret[this._caretMethodMap[key]]();
//}
