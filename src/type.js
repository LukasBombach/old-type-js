'use strict';

// Load core editor class
var Type = require('./core');

// Load core modules
require('./development');
require('./settings');
require('./oop');
require('./event_api');
require('./plugin_api');
require('./environment');
require('./utilities');
require('./dom_utilities');
require('./dom_walker');
require('./text_walker');
require('./range');
require('./writer');
require('./formatter');
require('./caret');
require('./selection_overlay');
require('./selection');
require('./input');
require('./events/type');

require('./events/input');
require('./input_filters/caret');
require('./input_filters/undo');
require('./input_filters/command');
require('./input_filters/remove');
require('./input_filters/line_breaks');

require('./undo_manager');

require('./content');
require('./actions/type');
require('./actions/insert');

// Expose Type
window.Type = Type;
