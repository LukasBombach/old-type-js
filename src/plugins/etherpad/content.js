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
  this._root = this._typeContent.getRoot();
  this._client.registerMessageHandler('NEW_CHANGES', this.updateContent.bind(this));
};

(function () {

  /**
   * Applies a change to the editor's contents
   *
   * @param {{newRev: number, changeset: string, apool:{}}} data - The data received from a NEW_CHANGES message
   * @returns {Type.Etherpad.Content} - This instance
   */
  this.updateContent = function(data) {
    this.revision = data.newRev;
    this.applyChangeset(data.changeset, data.apool);
    return this;
  };

  /**
   * Applies a serialized changeset to the editor's contents
   *
   * @param {string} changesetString - A serialized Changeset
   * @returns {*}
   */
  this.applyChangeset = function (changesetString, apool) {
    var changeset = new Type.Etherpad.Changeset.fromString(changesetString, apool, this._root.textContent);
    changeset.apply(this._typeContent, this._localCaret);
    return this;
  };

  /**
   * Getter for the document revision
   * @returns {number}
   */
  this.getRevision = function () {
    return this.revision;
  };

  /**
   * Setter for the document revision
   * @returns {Type.Etherpad.Content} - This instance
   */
  this.setRevision = function (rev) {
    this.revision = rev;
    return this;
  };

  /**
   * Getter for the root element
   * @returns {number}
   */
  this.getRoot = function () {
    return this._root;
  };

}).call(Type.Etherpad.Content.prototype);


module.exports = Type.Etherpad.Content;

