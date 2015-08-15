'use strict';

var Type = require('../../core');

/**
 * Creates a new Type.Etherpad.Content instance
 *
 * @param {Type.Etherpad} etherpad - The Etherpad instance this
 *     class will manage content collaboration for
 * @constructor
 */
Type.Etherpad.Content = function (etherpad) {
  this._client = etherpad.getClient();
  this._localCaret = etherpad.getType().getCaret();
  this._typeContent = new Type.Content(etherpad.getType());
  this._client.registerMessageHandler('NEW_CHANGES', this.updateContent.bind(this));
};

(function () {

  /**
   * Applies a change to the editor's contents
   * 
   * @param {{}} data - The data received from a NEW_CHANGES message
   * @returns {Type.Etherpad.Content} - This instance
   */
  this.updateContent = function(data) {
    this.revision = data.newRev;
    var changeset = new Type.Etherpad.Changeset.fromString(data.changeset);
    changeset.apply(this._typeContent, this._localCaret);
    return this;
  };

}).call(Type.Etherpad.Content.prototype);


module.exports = Type.Etherpad.Content;

