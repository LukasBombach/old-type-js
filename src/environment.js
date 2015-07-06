'use strict';

var Type = require('./core');

Type.Environment = function () {
};

(function () {

  Type.Environment.mac = navigator.appVersion.indexOf("Mac") !== -1;

}).call(Type.Environment);

module.exports = Type.Environment;
