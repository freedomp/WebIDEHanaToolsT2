/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(function() {
    "use strict";

    var XmlSerializer = {

        _removeInvalidCharacters: function(content) {
            // See http://www.w3.org/TR/xml/#NT-Char for valid XML 1.0 characters
            return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
        },

        _serializeProcessingInstruction: function(node) {
            return '<?' + node.nodeName + ' ' + node.nodeValue + '?>\n';
        },

        _serializeCDATASection: function(node) {
            return '<![CDATA[' + node.nodeValue + ']]>';
        },

        _serializeAttributeValue: function(value) {
            return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        },

        _serializeTextContent: function(content) {
            return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        _serializeAttribute: function(attr) {
            return ' ' + attr.name + '="' + this._serializeAttributeValue(attr.value) + '"';
        },

        _serializeChildren: function(parent) {
            var i;
            var childNodesResult = [];
            for (i = parent.childNodes.length; i > 0;) {
                i--;
                var node = parent.childNodes[i];
                // last node is a newly created element (no skipped nodes exist), correct the indent
                if (node.nodeType === node.PROCESSING_INSTRUCTION_NODE && node.nodeName === "LAST_NODE_INDENT") {
                    if (i === parent.childNodes.length - 1) {
                        childNodesResult[i] = this._serializeTextContent(node.nodeValue);
                    } else {
                        // ignore PI
                    }
                } else {
                    childNodesResult[i] = this._serializeNode(node);
                }
            }
            return childNodesResult.join('');
        },

        _serializeElement: function(node) {
            var i;
            var output = '<' + node.nodeName;

            for (i = 0; i < node.attributes.length; i++) {
                var attr = node.attributes[i];
                output += this._serializeAttribute(attr);
            }

            if (node.childNodes.length > 0) {
                output += '>';
                output += this._serializeChildren(node);
                output += '</' + node.nodeName + '>';
            } else {
                output += '/>';
            }
            return output;
        },

        _serializeText: function(node) {
            var text = node.nodeValue || '';
            return this._serializeTextContent(text);
        },

        _serializeComment: function(node) {
            return '<!--' + node.nodeValue.replace(/-/g, '&#45;') + '-->';
        },

        _serializeNode: function(node) {
            switch (node.nodeType) {
                case node.ELEMENT_NODE:
                    return this._serializeElement(node);
                case node.TEXT_NODE:
                    return this._serializeText(node);
                case node.CDATA_SECTION_NODE:
                    return this._serializeCDATASection(node);
                case node.PROCESSING_INSTRUCTION_NODE:
                    return this._serializeProcessingInstruction(node);
                case node.COMMENT_NODE:
                    return this._serializeComment(node);
                case node.DOCUMENT_NODE:
                    return this._serializeChildren(node);
                default:
                    return;
            }
        },

        serializeToString: function(oDocument) {
            if (Array.isArray(oDocument)) {
                var result = "";
                for (var i = 0; i < oDocument.length; i++) {
                    result += this.serializeToString(oDocument[i]);
                }
                return result;
            } else {
                return this._removeInvalidCharacters(this._serializeNode(oDocument));
            }
        }
    };

    return XmlSerializer;
});
