'use strict';

function TypeEnvironment() {
}

(function () {

  TypeEnvironment.mac = navigator.appVersion.indexOf("Mac") !== -1;

}).call(TypeEnvironment);

module.exports = TypeEnvironment;
