'use strict';

function TypeEnvironment() {
  this.mac = navigator.appVersion.indexOf("Mac") !== -1;
}

module.exports = TypeEnvironment;
