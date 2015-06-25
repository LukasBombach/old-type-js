'use strict';

(function () {

  /**
   * Todo this should work like ../../core_api.js for this plugin
   */

}).call(Type.fn);


/**
 *
 * @param options
 * @constructor
 */
Type.fromEtherpad = function(options) {
  var etherpadInput = new EtherpadInput({
    onContentLoaded : function(text, input) {

      //var node = new DocumentNode('P');
      //node.childNodes.push(new DocumentNode('TEXT', text));
      //var document = new TypeDocument(node);
      //var renderer = new Renderer(document);
      //options.renderTo.appendChild(renderer.output());
      //input.caret.moveTo(options.renderTo.childNodes[0].childNodes[0], 0)._blink();
      //options.onload(input);

      var p = window.document.createElement('p');

      text = text.replace(/(?:\r\n|\r|\n)/g, '<br />');

      p.innerHTML = text;

      //var textNode = window.document.createTextNode(text);
      //p.appendChild(textNode);
      options.root.appendChild(p);
      input.caret.moveTo(options.root.childNodes[0].childNodes[0], 0)._blink();

      var type = new Type({
        root : options.root
      });

      var typeCaret = type._input._caret;

      typeCaret.registerCallback('_setOffset', function() {
        input.progagateCaret(this.offset, 0);
      });

      // todo numChars
      typeCaret.registerCallback('removeCharacter', function(numChars) {
        input.propagateUpdate(p, '-', typeCaret.offset - 1, 1);
      });

      typeCaret.registerCallback('insertText', function(val) {
        input.propagateUpdate(p, '+', typeCaret.offset, val.length, val);
      });

      return type;

    }
  });
};
