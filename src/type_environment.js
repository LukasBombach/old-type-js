'use strict';

var singleton;

function TypeEnvironment() {
  this.mac = navigator.appVersion.indexOf("Mac") !== -1;
}

singleton = new TypeEnvironment();

module.exports = singleton;
