/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
/*global document*/
/*eslint-disable quotes*/
define(["./common", "./XmlSerializer"], function(common, XmlSerializer) {
    "use strict";

    var SkippedNodes = common.SkippedNodes,
        Util = common.Util;

    /*
     * StableOrderNode, StableOrderDocument, StableOrderProcessingInstruction, StableOrderElement, StableOrderText
     * implement those parts of the DOM that are required by XmlWriter and XmlSerializer.
     * XmlWiter creates StableOrderNodes to achive stable rendering of attributes
     * (no re-ordering, push-down of xmlns...) cross browser platform.
     * This supports for textual diff/merge of XML documents.
     */
    function StableOrderNode(type, name, value) {
        this.childNodes = [];
        this.parentNode = null;
        this.ownerDocument = null;
        this.nodeType = type;
        this.nodeName = name;
        this.nodeValue = value ? value : null;
        Object.defineProperty(this, "localName", {
            get: function() {
                return this.nodeName;
            }
        });
        this._index = -1;
        Object.defineProperty(this, "previousSibling", {
            get: function() {
                if (this.parentNode && this._index > 0) {
                    return this.parentNode.childNodes[this._index - 1];
                } else {
                    return null;
                }
            }
        });
        Object.defineProperty(this, "nextSibling", {
            get: function() {
                if (this.parentNode && this._index >= 0 && this._index < this.parentNode.childNodes.length - 1) {
                    return this.parentNode.childNodes[this._index + 1];
                } else {
                    return null;
                }
            }
        });
        Object.defineProperty(this, "innerHTML", {
            get: function() {
                return XmlSerializer.serializeToString(this.childNodes);
            }
        });
        Object.defineProperty(this, "outerHTML", {
            get: function() {
                return XmlSerializer.serializeToString(this);
            }
        });
    }
    StableOrderNode.prototype = {
        appendChild: function(node) {
            if (this.nodeType !== this.ELEMENT_NODE && this.nodeType !== this.DOCUMENT_NODE) {
                throw "assert: appendChild only supported for element or document";
            }
            if (this.nodeType === this.DOCUMENT_NODE && this.childNodes.length === 0 && node.nodeType !== this.PROCESSING_INSTRUCTION_NODE) {
                throw "assert: first node of a document has to be a processing instruction";
            }
            if (this.nodeType === this.DOCUMENT_NODE && this.childNodes.length === 1 && node.nodeType !== this.ELEMENT_NODE) {
                throw "assert: second node of a document has to be an element";
            }
            if (this.nodeType === this.DOCUMENT_NODE && this.childNodes.length === 2) {
                throw "assert: document can only have one document element";
            }
            if (node.nodeType === this.DOCUMENT_NODE) {
                throw "assert: document node cannot be appended";
            }

            // create a clone as a StableOrder node
            if (!(node instanceof StableOrderNode)) {
                var domNode = node;
                var i;
                node = null;


                if (domNode.nodeType === this.ELEMENT_NODE) {
                    node = this.ownerDocument.createElement(domNode.nodeName);
                    var attributes = domNode.attributes;
                    for (i = 0; i < attributes.length; i++) {
                        node.setAttribute(attributes[i].name, attributes[i].value);
                    }
                    for (i = 0; i < domNode.childNodes.length; i++) {
                        node.appendChild(domNode.childNodes[i]);
                    }
                }
                if (domNode.nodeType === this.TEXT_NODE) {
                    node = this.ownerDocument.createTextNode(domNode.nodeValue);
                }
                if (domNode.nodeType === this.COMMENT_NODE) {
                    node = this.ownerDocument.createComment(domNode.nodeValue);
                }
            }
            if (node) {
                if (node.nodeType !== this.PROCESSING_INSTRUCTION_NODE) {
                    node.parentNode = this;
                    node._index = this.childNodes.length;
                }
                this.childNodes.push(node);
            }
        },
        lookupPrefix: function(namespace) {
            if (this.ownerDocument && this.ownerDocument._prefixes.hasOwnProperty(namespace)) {
                return this.ownerDocument._prefixes[namespace];
            } else {
                return null;
            }
        }
    };
    StableOrderNode.prototype.ELEMENT_NODE = 1;
    StableOrderNode.prototype.TEXT_NODE = 3;
    StableOrderNode.prototype.PROCESSING_INSTRUCTION_NODE = 7;
    StableOrderNode.prototype.COMMENT_NODE = 8;
    StableOrderNode.prototype.DOCUMENT_NODE = 9;

    function StableOrderProcessingInstruction(name, value) {
        StableOrderNode.call(this, this.PROCESSING_INSTRUCTION_NODE, name, value);
    }
    StableOrderProcessingInstruction.prototype = new StableOrderNode();
    StableOrderProcessingInstruction.prototype.constructor = StableOrderProcessingInstruction;

    function StableOrderText(value) {
        StableOrderNode.call(this, this.TEXT_NODE, "#text", value);
    }
    StableOrderText.prototype = new StableOrderNode();
    StableOrderText.prototype.constructor = StableOrderText;

    function StableOrderComment(value) {
        StableOrderNode.call(this, this.COMMENT_NODE, "#comment", value);
    }
    StableOrderComment.prototype = new StableOrderNode();
    StableOrderComment.prototype.constructor = StableOrderComment;

    function StableOrderElement(name) {
        StableOrderNode.call(this, this.ELEMENT_NODE, name);
        this.attributes = [];
        this._attributeNames = {};
    }
    StableOrderElement.prototype = new StableOrderNode();
    StableOrderElement.prototype.constructor = StableOrderElement;
    StableOrderElement.prototype._getAttributeIndex = function(name) {
        var targetIndex, j, predecessorIndex, predecessor, k,
            predefinedOrder = this._attributesOrder.indexOf(name);

        if (predefinedOrder >= 0) {
            j = predefinedOrder - 1;
            predecessorIndex = -1;
            while (j >= 0 && predecessorIndex < 0) {
                // attributes are re-ordered by IE, try to put them at the right place
                predecessor = this._attributesOrder[j--];
                k = this.attributes.length - 1;
                while (k >= 0) {
                    if (this.attributes[k].name === predecessor) {
                        predecessorIndex = k;
                        break;
                    }
                    k--;
                }
            }
            targetIndex = predecessorIndex + 1;
        }
        return targetIndex;
    };
    StableOrderElement.prototype.setAttribute = function(name, value, forceOrder) {
        if (typeof value !== "string") {
            value = "" + value; // toString
        }
                        
        if (name.indexOf("xmlns:") === 0) {
            var prefix = name.substr("xmlns:".length);
            this.ownerDocument._prefixes[value] = prefix;
        }

        if (!this._attributesOrder) {
            this._attributesOrder = this.ownerDocument._attributesOrder[this.nodeName];
            if (!this._attributesOrder) {
                this._attributesOrder = this.ownerDocument._attributesOrder["*"];
            }
            if (!this._attributesOrder) {
                this._attributesOrder = [];
            }
        }

        var existing = this._attributeNames[name];
        if (existing) {
            for (var i = 0; i < this.attributes.length; i++) {
                if (this.attributes[i].name === name) {
                    this.attributes[i].value = value;
                }
            }
        } else {
            var targetIndex;
            if (forceOrder || Util.isMSXML()) {
                // insert
                targetIndex = this._getAttributeIndex(name);
            }
            if (typeof targetIndex !== "undefined") {
                this.attributes.splice(targetIndex, 0, {
                    name: name,
                    value: value
                });
            } else {
                // append
                this.attributes.push({
                    name: name,
                    value: value
                });
            }
            this._attributeNames[name] = true;
        }
    };
    StableOrderElement.prototype.setAttributeNS = function(namespace, name, value, forceOrder) {
        this.setAttribute(name, value, forceOrder);
    };

    function StableOrderDocument() {
        StableOrderNode.call(this, this.DOCUMENT_NODE, "#document");
        this._prefixes = {};
        this.ownerDocument = this;
        this._attributesOrder = {};
        Object.defineProperty(this, "documentElement", {
            get: function() {
                return this.childNodes[1];
            }
        });

    }
    StableOrderDocument.prototype = new StableOrderNode();
    StableOrderDocument.prototype.constructor = StableOrderDocument;
    StableOrderDocument.prototype = new StableOrderNode();
    StableOrderDocument.prototype.defineAttributesOrder = function(attributesOrder) {
        if (typeof attributesOrder === "object") {
            this._attributesOrder = attributesOrder;
        } else {
            this._attributesOrder = {};
        }
    };
    StableOrderDocument.prototype.createProcessingInstruction = function(name, value) {
        var result = new StableOrderProcessingInstruction(name, value);
        result.ownerDocument = this;
        return result;
    };
    StableOrderDocument.prototype.createElement = function(name) {
        var result = new StableOrderElement(name);
        result.ownerDocument = this;
        return result;
    };
    StableOrderDocument.prototype.createTextNode = function(value) {
        var result = new StableOrderText(value);
        result.ownerDocument = this;
        return result;
    };
    StableOrderDocument.prototype.createComment = function(value) {
        var result = new StableOrderComment(value);
        result.ownerDocument = this;
        return result;
    };

    /**
     * @class
     */
    var NodeInfo = function(name, skippedNodes, isIntermediate) {
        this.name = name;
        this.skippedNodes = skippedNodes;
        if (isIntermediate) {
            this.isIntermediate = true;
        }
        this.childNodes = [];
    };

    /**
     * @class
     */
    var XmlWriter = function(useBrowserDom) {
        if (useBrowserDom) {
            this._xmlDocument = document.implementation.createDocument(null, null, null);
        } else {
            this._xmlDocument = new StableOrderDocument();
        }
        this._namespaces = [];
    };
    XmlWriter.prototype = {
        close: function() {
            this._setAttributes(this._rootAttributeValues, this._rootSkippedNodes, this._xmlDocument.documentElement);
        },

        _lookupPrefix: function(namespace) {
            if (namespace === Util.XML_NS) {
                return Util.XMLNS_PREFIX;
            }

            for (var i = 0; i < this._namespaces.length; i++) {
                if (namespace === this._namespaces[i].name) {
                    this._namespaces[i].used = true;
                    return this._namespaces[i].prefix;
                }
            }
        },

        configure: function(config) {
            if (!config) {
                config = {};
            }
            this._lineEndings = typeof config.lineEndings === "string" ? config.lineEndings : "\n";
            if (config.attributesOrder && this._xmlDocument instanceof StableOrderDocument) {
                this._xmlDocument.defineAttributesOrder(config.attributesOrder);
            }
            if (Array.isArray(config.namespaces)) {
                for (var i = 0; i < config.namespaces.length; i++) {
                    var ns = config.namespaces[i];
                    if (!this._lookupPrefix(ns.name)) {
                        this._namespaces.push({
                            name: ns.name,
                            prefix: ns.prefix,
                            used: false
                        });
                    }
                }
            }
        },

        writeRootElement: function(object, name, attributeMapping, fixedAttributes) {
            var pi = this._xmlDocument.createProcessingInstruction("xml", 'version="1.0" encoding="UTF-8"');
            this._xmlDocument.appendChild(pi);
            var rootElement = this._xmlDocument.createElement(name);
            this._xmlDocument.appendChild(rootElement);

            var skippedNodes = object.$getSkippedNodes(name);
            if (!skippedNodes) {
                skippedNodes = new SkippedNodes(name);
            }
            var i, node;
            this._rootAttributeValues = this._buildAttributes(object, attributeMapping, fixedAttributes);
            this._rootSkippedNodes = skippedNodes;

            for (i = 0; i < skippedNodes.childNodes.length; i++) {
                node = skippedNodes.childNodes[i];
                rootElement.appendChild(node);
            }
            return rootElement;
        },

        writeNode: function(nodeInfo, parent) {
            var path, nodeName, i, indent, lastIndent, skippedNodes, node, result;

            if (!(nodeInfo instanceof NodeInfo)) {
                throw new common.XmlWriterException(undefined, "writeNode: instance of NodeInfo expected which is returned by createElement or createIntermediateElement");
            }
            if (parent instanceof NodeInfo) {
                if (!parent.result) {
                    parent.childNodes.push(nodeInfo);
                    return nodeInfo;
                }
                parent = parent.result;
            }
            if (!parent) {
                throw new common.XmlWriterException(undefined, "writeNode: parent node missing");
            }

            skippedNodes = nodeInfo.skippedNodes;
            if (skippedNodes && nodeInfo.isIntermediate) {
                // find skipped nodes for intermediate element:
                // 1) first walk-up the DOM to find the ancestor node and remeber the element path
                node = parent;
                path = [];
                while (node && node.localName !== skippedNodes.nodeName) {
                    path.push(parent.localName);
                    node = node.parentNode;
                }
                // 2) move down the skipped nodes hierarchy by using the path built up in 1) to find the matching 
                nodeName = path.pop();
                while (nodeName && skippedNodes) {
                    skippedNodes = skippedNodes.intermediateElements[nodeName];
                    nodeName = path.pop();
                }
                if (skippedNodes) {
                    skippedNodes = skippedNodes.intermediateElements[nodeInfo.name];
                }
            }

            // add indent for newly added elements
            if (!skippedNodes) {
                skippedNodes = new SkippedNodes(nodeInfo.name);
                indent = lastIndent = this._lineEndings;
                if (parent.previousSibling && parent.previousSibling.nodeType === this._xmlDocument.TEXT_NODE) {
                    lastIndent = parent.previousSibling.nodeValue;
                    indent = lastIndent + "  ";
                }
                skippedNodes.nodesBefore.push(this._xmlDocument.createTextNode(indent));
                // add information on how to correct indent of closing tag of parent element, this is evaluated by XmlSerializer
                skippedNodes.nodesAfter.push(this._xmlDocument.createProcessingInstruction("LAST_NODE_INDENT", lastIndent));
            }

            for (i = 0; i < skippedNodes.nodesBefore.length; i++) {
                node = skippedNodes.nodesBefore[i];
                parent.appendChild(node);
            }

            result = this._xmlDocument.createElement(nodeInfo.name);
            this._setAttributes(nodeInfo.valueMap, skippedNodes, result);
            parent.appendChild(result);

            for (i = 0; i < skippedNodes.childNodes.length; i++) {
                node = skippedNodes.childNodes[i];
                result.appendChild(node);
            }

            for (i = 0; i < skippedNodes.nodesAfter.length; i++) {
                node = skippedNodes.nodesAfter[i];
                parent.appendChild(node);
            }

            for (i = 0; i < nodeInfo.childNodes.length; i++) {
                node = nodeInfo.childNodes[i];
                if (node instanceof NodeInfo) {
                    this.writeNode(node, result);
                }
                else {
                    result.appendChild(node);
                }
            }
            nodeInfo.result = result;
            return result;
        },

        createElement: function(object, name, attributeMapping, fixedAttributes) {
            var result = new NodeInfo(name, object.$getSkippedNodes(name));

            result.valueMap = this._buildAttributes(object, attributeMapping, fixedAttributes);
            return result;
        },

        createIntermediateElement: function(object, ancestorName, name, attributeMapping, fixedAttributes) {
            var result = new NodeInfo(name, object.$getSkippedNodes(ancestorName), true);

            result.valueMap = this._buildAttributes(object, attributeMapping, fixedAttributes);
            return result;
        },

        writeIntermediateElement: function(object, parent, ancestorName, name, attributeMapping, fixedAttributes) {
            return this.writeNode(this.createIntermediateElement(object, ancestorName, name, attributeMapping, fixedAttributes), parent);
        },

        writeElement: function(object, parent, name, attributeMapping, fixedAttributes) {
            return this.writeNode(this.createElement(object, name, attributeMapping, fixedAttributes), parent);
        },

        writeTextContent: function(node, value) {
            if (node instanceof NodeInfo) {
                node.childNodes.push(this._xmlDocument.createTextNode(value));
            } else {
                node.appendChild(this._xmlDocument.createTextNode(value));
            }
        },

        addPrefix: function(namespace, value) {
            return this._lookupPrefix(namespace) + ":" + value;
        },

        _buildAttributes: function(object, attributeMapping, fixedValues) {
            var valueMap = {};
            var i, selectorObject, attribute, fixedValue;

            // extract values from model object via attribute mapping
            if (attributeMapping) {
                for (var prop in attributeMapping) {
                    if (!attributeMapping.hasOwnProperty(prop)) {
                        continue;
                    }
                    selectorObject = Util.parseSelector(attributeMapping[prop]);
                    if (object.hasOwnProperty(prop)) {
                        attribute = {
                            value: object[prop]
                        };
                        if (selectorObject.valueMapper) {
                            attribute.value = selectorObject.valueMapper(attribute.value);
                        }
                        if (selectorObject.namespace) {
                            attribute.name = this._lookupPrefix(selectorObject.namespace) + ":" + selectorObject.name;
                            attribute.namespace = selectorObject.namespace;
                        } else {
                            attribute.name = selectorObject.name;
                        }
                        valueMap[attribute.name] = attribute;
                    } else {
                        // property not found in model object
                    }
                }
            }

            // prepare fixed values
            if (fixedValues) {
                for (i = 0; i < fixedValues.length; i++) {
                    fixedValue = fixedValues[i];
                    attribute = {
                        value: fixedValue.value
                    };
                    if (fixedValue.namespace) {
                        attribute.namespace = fixedValue.namespace;
                        attribute.name = this._lookupPrefix(fixedValue.namespace) + ":" + fixedValue.name;
                    } else {
                        attribute.name = fixedValue.name;
                    }
                    valueMap[attribute.name] = attribute;
                }
            }

            return valueMap;
        },

        _setAttributes: function(valueMap, skippedNodes, node) {
            var i, j, qualifiedName, attribute;

            // set xmlns: attributes
            var xmlnsAttributes = skippedNodes.xmlnsAttributes;
            // add registered namespaces to root node only
            if (node.parentNode === node.ownerDocument) {
                for (i = 0; i < this._namespaces.length; i++) {
                    var namespace = this._namespaces[i];
                    var prefix = "xmlns:" + namespace.prefix;
                    if (namespace.used) {
                        // add registered namespace if it was used (_lookupPrefix was called)
                        node.setAttributeNS(Util.XML_NS, prefix, namespace.name, true);
                    } else {
                        for (j = 0; j < xmlnsAttributes.length; j++) {
                            attribute = xmlnsAttributes[j];
                            if (attribute.name === prefix && attribute.value === namespace.name) {
                                // add registered namespace if it was used not used (_lookupPrefix was not called) but was included in the skipped nodes
                                // i.e. we never implicitly remove an xmlns
                                node.setAttributeNS(Util.XML_NS, prefix, namespace.name, true);
                            }
                        }
                    }
                }
            }
            // process xmlns: attributes from skipped nodes
            for (i = 0; i < xmlnsAttributes.length; i++) {
                attribute = xmlnsAttributes[i];
                node.setAttributeNS(Util.XML_NS, attribute.name, attribute.value);
            }

            var attributeNames = skippedNodes.attributeNames;
            // set attributes
            for (i = 0; i < attributeNames.length; i++) {
                qualifiedName = attributeNames[i];
                if (valueMap.hasOwnProperty(qualifiedName)) {
                    attribute = valueMap[qualifiedName];
                    delete valueMap[qualifiedName];
                    if (attribute.namespace) {
                        node.setAttributeNS(attribute.namespace, attribute.name, attribute.value);
                    } else {
                        node.setAttribute(attribute.name, attribute.value);
                    }
                } else if (skippedNodes.attributes.hasOwnProperty(qualifiedName)) {
                    node.setAttribute(qualifiedName, skippedNodes.attributes[qualifiedName]);
                } else {
                    // attribute was present in the original document but has
                    // neither been provided in attribute mapping/fixed value
                    // nor found in skipped attributes
                }
            }

            // append newly added attributes
            for (qualifiedName in valueMap) {
                if (!valueMap.hasOwnProperty(qualifiedName)) {
                    continue;
                }
                attribute = valueMap[qualifiedName];
                if (attribute.namespace) {
                    node.setAttributeNS(attribute.namespace, attribute.name, attribute.value);
                } else {
                    node.setAttribute(attribute.name, attribute.value);
                }
            }

        }

    };

    return XmlWriter;
});
