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
  this._typeContent = etherpad.getType().getContent();
  this._client.registerMessageHandler('NEW_CHANGES', this.updateContent.bind(this));
};

(function () {

  this.updateContent = function(data) {

    this.revision = data.newRev;

    var changeSet = data.changeset,
      attributes, operator, value, match,
      caretAtPosZero = true;

    var charoffset;

    // Matches an array of results for each operation
    var regex = /((?:\*[0-9a-z]+)*)(?:\|([0-9a-z]+))?([-+=])([0-9a-z]+)|\?|/g,
      opsEnd = changeSet.indexOf('$') + 1,
      charBank = opsEnd >= 0 ? changeSet.substring(opsEnd) : null;

    while ((match = regex.exec(changeSet)) !== null) {

      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      if(match[0] != '') {

        attributes = match[1];
        operator = match[3];
        value = match[4];

        switch(operator) {
          case '=':
            //this.caret._setOffset(parseInt(value, 36));
            charoffset = parseInt(value, 36);
            caretAtPosZero = false;
            console.log('setting offset', parseInt(value, 36));
            break;

          case '+':
            if(caretAtPosZero) charoffset = 0;
            //this.caret.insertText(charBank);
            this._typeContent.insert(charoffset, charBank);
            console.log('writing', charBank);
            break;

          case '-':
            if(caretAtPosZero) charoffset = 0;
            //this.caret.removeCharacter(parseInt(value, 36));
            this._typeContent.remove(charoffset, parseInt(value, 36));
            console.log('removing', parseInt(value, 36));
            break;
        }
      }

    }
  };

}).call(Type.Etherpad.Content.prototype);


module.exports = Type.Etherpad.Content;

