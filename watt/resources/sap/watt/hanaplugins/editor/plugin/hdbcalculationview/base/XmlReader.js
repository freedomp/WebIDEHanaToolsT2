/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
/*global DOMParser, XMLSerializer*/
/*eslint-disable no-constant-condition, quotes*/
define(["./common"], function(common) {
    "use strict";

    var SkippedNodes = common.SkippedNodes;
    var XmlReaderException = common.XmlReaderException;
    var Util = common.Util;

    function checkParserError(document) {
        if (!document || !document.documentElement) {
            throw new XmlReaderException(null, "unknown parser error");
        }
        // legacy IE
        if (document.parseError && document.parseError.errorCode !== 0) {
            throw new XmlReaderException(null, document.parseError);
        }
        // Firefox
        if (document.documentElement.tagName === "parsererror") {
            throw new XmlReaderException(null, document.documentElement.firstChild.nodeValue);
        }
        // Chrome
        if (document.getElementsByTagName("parsererror").length > 0) {
            var errorElement = document.getElementsByTagName("parsererror")[0];
            var errorMessage = errorElement.textContent + '\n';
            if (errorElement.nextElementSibling) {
                errorMessage += new XMLSerializer().serializeToString(errorElement.nextElementSibling);
            }
            throw new XmlReaderException(errorElement.parentElement, errorMessage);
        }
    }

    function parseDocument(content) {
        var parser = new DOMParser();
        var result;
        try {
            result = parser.parseFromString(content, "text/xml");
        } catch (e) {
            // IE9+
            throw new XmlReaderException(null, e.toString());
        }
        checkParserError(result);
        return result;
    }

    /*
     *detect line endings based on the first occurrence
     */
    function detectLineEndings(content, props) {
        var cr = '\r';
        var lf = '\n';
        var crlf = '\r\n';
        var pos = 0;
        props.hasMixedLineEndings = true;
        while (true) {
            pos = content.indexOf(lf, pos);
            if (pos < 0) {
                props.hasMixedLineEndings = false;
                return;
            }
            if (content.charAt(pos - 1) === cr) {
                if (props.detectedLineEndings === lf) {
                    return;
                } else {
                    props.detectedLineEndings = crlf;
                }
            } else {
                if (props.detectedLineEndings === crlf) {
                    return;
                } else {
                    props.detectedLineEndings = lf;
                }
            }
            pos++;
        }
    }

    function createDocumentProperties(content) {
        var props = new common.DocumentProperties();
        if (typeof content === "string") {
            detectLineEndings(content, props);
            var spacesBefore = content.match(/\?>(\s+)/);
            if (spacesBefore && spacesBefore.length === 2) {
                props.spacesBeforeDocumentElement = spacesBefore[1];
            }
            var spacesAfter = content.match(/\s+$/);
            if (spacesAfter && spacesAfter.length === 1) {
                props.spacesAfterDocumentElement = spacesAfter[0];
            }
        }
        return props;
    }

    function fixLineEndings(content, targetEndings) {
        return content.replace(/\r\n|\n/g, targetEndings);
    }

    var XmlReader = function(xmlDocument, fixMixedLineEndings, forceLineEndings) {
        this.documentProperties = createDocumentProperties(xmlDocument);
        if (typeof xmlDocument === "string") {
            if (fixMixedLineEndings && this.documentProperties.hasMixedLineEndings) {
                xmlDocument = fixLineEndings(xmlDocument, forceLineEndings ? forceLineEndings : this.documentProperties.detectedLineEndings);
                this.documentProperties.fixedContent = xmlDocument;
            }
            this._xmlDocument = parseDocument(xmlDocument);
        } else {
            this._xmlDocument = xmlDocument;
        }
        this._hasMovedDown = false;
        this._current = this._xmlDocument;
        this.skippedNodes = new SkippedNodes();
        this._skippedNodesStack = [];
        this._removePrefixFunctions = {};
        this._isRead = false;
        this.context = {};
    };

    XmlReader.prototype = {

        _getParentSkippedNodes: function() {
            return this._skippedNodesStack[this._skippedNodesStack.length - 1];
        },

        removePrefix: function(namespace, value) {
            var func = this._removePrefixFunctions[namespace];
            if (!func) {
                var that = this;
                func = function(val) {
                    var prefix = that._xmlDocument.lookupPrefix(namespace);
                    var regex = new RegExp("^" + prefix + ":");
                    return val.replace(regex, "");
                };
                this._removePrefixFunctions[namespace] = func;
            }
            return func(value);
        },

        moveToIntermediate: function(name, namespace, match) {
            if (!this.tryMoveToIntermediate(name, namespace, match)) {
                throw new XmlReaderException(this._current, "sibling element " + name + " not found");
            }
            return this;
        },

        tryMoveToIntermediate: function(name, namespace, match) {
            return this._tryMoveTo(name, namespace, match, false);
        },

        moveTo: function(name, namespace, match) {
            if (!this.tryMoveTo(name, namespace, match)) {
                throw new XmlReaderException(this._current, "sibling element " + name + " not found");
            }
            return this;
        },

        tryMoveTo: function(name, namespace, match) {
            return this._tryMoveTo(name, namespace, match, true);
        },

        _tryMoveTo: function(name, namespace, match, doConsume) {
            if (this._isRead) {
                return false;
            }

            var i;
            var qualifiedName = namespace ? this._xmlDocument.lookupPrefix(namespace) + ":" + name : name;
            var nextNode = this._current;
            var skippedDomNodes = [];
            var found = false;
            var parentSkippedNodes, skippedDomNode, attribute;
            do {
                if (nextNode.nodeType === nextNode.ELEMENT_NODE && nextNode.nodeName === qualifiedName && (!match || match(nextNode))) {
                    if (nextNode !== this._current) {
                        this._hasMovedDown = false;
                    }
                    this._current = nextNode;

                    // store skipped nodes only if target element was found
                    this.skippedNodes = new SkippedNodes(qualifiedName);
                    if (!doConsume) {
                        parentSkippedNodes = this._getParentSkippedNodes();
                        if (parentSkippedNodes.intermediateElements[qualifiedName]) {
                            throw new XmlReaderException(this._current, "intermediate child with same name already found in " + parentSkippedNodes.nodeName);
                        }
                        parentSkippedNodes.intermediateElements[qualifiedName] = this.skippedNodes;
                    }
                    for (i = 0; i < skippedDomNodes.length; i++) {
                        skippedDomNode = skippedDomNodes[i];
                        skippedDomNode.parentNode.removeChild(skippedDomNode);
                        this.skippedNodes.nodesBefore.push(skippedDomNode);
                    }
                    for (i = 0; i < this._current.attributes.length; i++) {
                        attribute = this._current.attributes[i];
                        if (Util.XMLNS_REGEX.test(attribute.name)) {
                            this.skippedNodes.xmlnsAttributes.push({
                                name: attribute.name,
                                value: attribute.value
                            });
                        } else {
                            this.skippedNodes.attributeNames.push(attribute.name);
                        }
                    }
                    if (Util.isMSXML()) {
                        // IE stores attributes in reverse order
                        this.skippedNodes.attributeNames.reverse();
                    }
                    found = true;
                } else {
                    skippedDomNodes.push(nextNode);
                    nextNode = nextNode.nextSibling;
                }
            }
            while (nextNode && !found);
            return found;
        },

        next: function() {
            var nextChild, nextNextChild, nextSibling;
            
            if (this._isRead) {
                throw new XmlReaderException(this._current, "cannot move from this element");
            }
            if (!this._hasMovedDown) {
                nextChild = this._current.firstChild;
                while (nextChild) {
                    nextNextChild = nextChild.nextSibling;
                    this._current.removeChild(nextChild);
                    this.skippedNodes.childNodes.push(nextChild);
                    nextChild = nextNextChild;
                }
            }

            nextSibling = this._current.nextSibling;
            if (nextSibling) {
                this._hasMovedDown = false;
                this._current = nextSibling;
            } else {
                this._isRead = true;
            }
            return this;
        },

        moveDown: function() {
            if (!this.tryMoveDown()) {
                throw new XmlReaderException(this._current, "cannot move down from this element");
            }
            return this;
        },

        tryMoveDown: function() {
            if (this._isRead || !this._current.firstChild) {
                return false;
            }
            if (!this.skippedNodes) {
                throw new XmlReaderException(this._current, "cannot move down w/o visiting an element");
            }
            this._hasMovedDown = true;
            this._current = this._current.firstChild;
            this._skippedNodesStack.push(this.skippedNodes);
            this.skippedNodes = null;
            this._isRead = false;
            return true;
        },

        skipChildren: function() {
            if (this.tryMoveDown()) {
                this.moveUp();
            }
            return this;
        },

        moveUp: function() {
            var parent = this._current.parentNode;
            if (!parent) {
                throw new XmlReaderException(this._current, "cannot move up from this element");
            }

            var lastSkippedNodes = this.skippedNodes;
            this.skippedNodes = this._skippedNodesStack.pop();

            if (!this._isRead) {
                var skippedNodes = lastSkippedNodes ? lastSkippedNodes.nodesAfter : this.skippedNodes.childNodes;
                do {
                    var nextSibling = this._current.nextSibling;
                    skippedNodes.push(this._current);
                    this._current.parentNode.removeChild(this._current);
                    this._current = nextSibling;
                }
                while (this._current);
            }
            this._hasMovedDown = true;
            this._current = parent;
            this._isRead = false;
            return this;
        },

        buildAttributes: function(attributeMapping, existingProperties) {
            if (this._isRead) {
                throw new XmlReaderException(this._current, "cannot build attributes, already moved away from current element");
            }
            if (this._current.nodeType !== this._xmlDocument.ELEMENT_NODE) {
                throw new XmlReaderException(this._current, "cannot build attributes, current node is not an element node");
            }

            var node = this._current;
            var skippedNodes = this.skippedNodes;
            var properties = existingProperties ? existingProperties : {};
            var attrValue;

            for (var propName in attributeMapping) {
                if (!attributeMapping.hasOwnProperty(propName)) {
                    continue;
                }
                var selectorObj = Util.parseSelector(attributeMapping[propName]);
                if (selectorObj.hasOwnProperty("value")) {
                    // fixed value
                    attrValue = selectorObj.value;
                } else {
                    attrValue = undefined;
                    if (selectorObj.namespace) {
                        if (node.hasAttributeNS(selectorObj.namespace, selectorObj.name)) {
                            attrValue = node.getAttributeNS(selectorObj.namespace, selectorObj.name);
                            node.removeAttributeNS(selectorObj.namespace, selectorObj.name);
                        }
                    } else {
                        if (node.hasAttribute(selectorObj.name)) {
                            attrValue = node.getAttribute(selectorObj.name);
                            node.removeAttribute(selectorObj.name);
                        }
                    }
                    if (typeof attrValue !== "undefined" && selectorObj.valueMapper) {
                        attrValue = selectorObj.valueMapper(attrValue);
                    }
                }
                if (typeof attrValue !== "undefined") {
                    properties[propName] = attrValue;
                }
            }
            for (var i = 0; i < node.attributes.length; i++) {
                var attribute = node.attributes.item(i);
                if (Util.XMLNS_REGEX.test(attribute.name)) {
                    // xmlns attributes already recorded
                    continue;
                } else {
                    skippedNodes.attributes[attribute.name] = attribute.value;
                }
            }
            return properties;
        },

        getAttribute: function(name, namespace) {
            if (this._isRead) {
                throw new XmlReaderException(this._current, "cannot get attribute, already moved away from current element");
            }

            var val;
            if (namespace) {
                val = this._current.getAttributeNS(namespace, name);
            } else {
                val = this._current.getAttribute(name);
            }
            return val;
        },

        consumeAttribute: function(name, namespace) {
            if (this._isRead) {
                throw new XmlReaderException(this._current, "cannot consume attribute, already moved away from current element");
            }

            var val;
            if (namespace) {
                val = this._current.getAttributeNS(namespace, name);
                this._current.removeAttributeNS(namespace, name);
            } else {
                val = this._current.getAttribute(name);
                this._current.removeAttribute(name);
            }
            return val;
        },

        getContent: function() {
            if (this._isRead) {
                throw new XmlReaderException(this._current, "cannot get content, already moved away from current element");
            }

            return this._current.textContent;
        },

        consumeContent: function() {
            if (this._isRead) {
                throw new XmlReaderException(this._current, "cannot consume content, already moved away from current element");
            }

            var result = this._current.textContent;
            this._current.textContent = null;
            return result;
        }
    };

    return XmlReader;
});
