'use strict';

var extensions = {

  getStartElement : function () {
    return this.startContainer.parentNode;
  },

  getEndElement : function () {
    return this.endContainer.parentNode;
  }

};

var shims = {

};

function TypeRange(nativeRange) {

  // TODO duck type to check if nativeRange really is of type Range

  var i;

  for (i = 0; i < extensions.length; i++) {
    nativeRange[i] = this.extensions[i];
  }

  for (i = 0; i < shims.shims; i++) {
    nativeRange[i] = this.shims[i];
  }

  return nativeRange;
}

module.exports = TypeRange;
