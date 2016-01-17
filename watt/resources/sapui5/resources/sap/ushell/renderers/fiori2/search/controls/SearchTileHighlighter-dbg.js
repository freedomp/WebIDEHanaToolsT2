/* global jQuery, sap, window, document */
(function() {
    "use strict";

    // =======================================================================
    // import packages
    // =======================================================================
    jQuery.sap.declare('sap.ushell.renderers.fiori2.search.controls.SearchTileHighlighter');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.SearchHelper');
    var Tester = sap.ushell.renderers.fiori2.search.SearchHelper.Tester;

    // =======================================================================
    // tile highlighter
    // =======================================================================    
    var Highlighter = sap.ushell.renderers.fiori2.search.controls.SearchTileHighlighter = function() {
        this.init.apply(this, arguments);
    };

    Highlighter.prototype = {

        init: function() {

        },

        setHighlightTerms: function(highlightTerms) {
            this.tester = new Tester(highlightTerms);
        },

        highlight: function(tileView) {
            var node = tileView.getDomRef();
            if (!node) {
                return;
            }
            this.doHighlight(node);
        },

        doHighlight: function(node) {
            if (node.nodeType === window.Node.TEXT_NODE) {
                this.highlightTextNode(node);
                return;
            }
            for (var i = 0; i < node.childNodes.length; ++i) {
                var child = node.childNodes[i];
                this.doHighlight(child);
            }
        },

        highlightTextNode: function(node) {

            // check for match
            var testResult = this.tester.test(node.textContent);
            if (!testResult.bMatch) {
                return;
            }

            // match -> replace dom node
            var spanNode = document.createElement('span');
            spanNode.innerHTML = testResult.sHighlightedText;
            node.parentNode.insertBefore(spanNode, node);
            node.parentNode.removeChild(node);
        }

    };

})();
