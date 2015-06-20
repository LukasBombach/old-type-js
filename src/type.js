'use strict';

var Type = require('./core');

// Load plugins
require('./event');
require('./cmd');

// Expose Type
window.Type = Type;

// Dev
window.Caret = require('./input/caret');
window.Etherpad = require('./plugins/Etherpad/EtherpadLite');
window.TypeRange = require('./type_rage');
