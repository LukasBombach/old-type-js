'use strict';


// todo
// textarea / contenteditable
// einfache eingaben
// pasting
// backspace und delete
// verhalten bei bestimmten elementen (br löschen oder am löschen wenn man am anfang eines elements ist)


'use strict';

var Type = require('./core');


function TypeInput () {

}


(function () {

}).call(TypeInput.prototype);




/**
 *
 *
 *
 *  DEV CODE
 *  Needs to go somewhere and play along with input, cmd, caret & Etherpad!
 *
 *
 */
(function () {

  /**
   *
   * @param {string} changeset
   * @returns {Type}
   */
  this.applyChangeset = function (changeset) {
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {Type}
   */
  this.removeChangeset = function (changeset) {
    this.applyChangeset(this._invertChangeset(changeset));
    return this;
  };

  /**
   *
   * @param {string} changeset
   * @returns {string}
   * @private
   */
  this._invertChangeset = function (changeset) {

  };

}).call(Type.fn);

