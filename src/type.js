'use strict';

var Type = require('./core');
require('./event');
require('./cmd');
window.Type = Type;
window.Caret = require('./input/caret');
window.Etherpad = require('./plugins/Etherpad/EtherpadLite');
