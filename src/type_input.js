'use strict';

var Settings = require('./settings');
var DomUtil = require('./dom_utilities');

// todo
// textarea / contenteditable
// einfache eingaben
// pasting
// backspace und delete
// verhalten bei bestimmten elementen (br löschen oder am löschen wenn man am anfang eines elements ist)


'use strict';

var Type = require('./core');


function TypeInput () {
  this._el = this._createElement();
}


(function () {

  /**
   *
   * @returns {Element}
   * @private
   */
  this._createElement = function () {
    var div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    div.className = Settings.prefix + 'input';
    DomUtil.elementsContainer().appendChild(div);
    return div;
  }

}).call(TypeInput.prototype);

module.exports = TypeInput;
