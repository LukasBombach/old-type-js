'use strict';

var Etherpad = require('./EtherpadLite');
var TypeDocument = require('../../type_document');
var DocumentNode = require('../../document_node');

/**
 * Loads a document from an Etherpad Pad
 * @constructor
 */
function EtherpadReader() {
  this.etherpad = new Etherpad({apikey: '6535d0f30f0ce73a5a183dd1ee1909b5a233ed5d024bc0bc09bf35ee78ca0671'});
}

(function () {

  /**
   * @param {function} callback
   * @returns {EtherpadReader}
   */
  this.getDocument = function (callback) {
    this.etherpad.call('getContents', {padID:"Test"}, function(err, res){
      if(err === 0) {
        var node = new DocumentNode('P');
        node.childNodes.push(new DocumentNode('TEXT', res.data.text));
        var document = new TypeDocument(node);
        callback(document);
      }
    });
    return this;
  };

}).call(EtherpadReader.prototype);

module.exports = EtherpadReader;
