
/**
 * Creates a new paste event
 * @constructor
 */
Type.Events.Paste = function () {
  this.canceled = false;
};

/**
 * Inherit from general Type event
 */
Type.OOP.inherits(Type.Events.Paste, Type.Events.Type);
