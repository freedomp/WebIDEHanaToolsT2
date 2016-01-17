/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(function() {
    "use strict";

    var isMSXML;

    // detect the browser/XML vendor
    try {
        new ActiveXObject("Microsoft.XMLDOM");
        isMSXML = true;
    } catch (e) {
        isMSXML = false;
    }

    var Util = {
        XSI_NS: "http://www.w3.org/2001/XMLSchema-instance",
        XML_NS: "http://www.w3.org/2000/xmlns/",
        XMLNS_PREFIX: "xmlns:",
        XMLNS_REGEX: new RegExp("^xmlns:"),
        SELECTOR_REGEX: new RegExp("^{(\\w+)}$"),

        isMSXML: function() {
            return isMSXML;
        },
        createSelectorNS: function(name, namespace, valueMapper) {
            var selectorObj = {
                name: name
            };
            if (namespace) {
                selectorObj.namespace = namespace;
            }
            if (valueMapper) {
                selectorObj.valueMapper = valueMapper;
            }
            return selectorObj;
        },
        parseInt: function(value) {
            return parseInt(value, 10);
        },
        parseBool: function(value) {
            return value === 'true';
        },
        createIntSelector: function(name) {
            return this.createSelectorNS(name, null, this.parseInt);
        },
        createBoolSelector: function(name) {
            return this.createSelectorNS(name, null, this.parseBool);
        },
        createSelector: function(name, valueMapper) {
            return this.createSelectorNS(name, null, valueMapper);
        },
        createXsiSelector: function(name, valueMapper) {
            return this.createSelectorNS(name, this.XSI_NS, valueMapper);
        },
        createCalculationSelector: function(name, valueMapper) {
            return this.createSelectorNS(name, this.CALCULATION_SELECT, valueMapper);
        },

        parseSelector: function(selector) {
            var selectorObj = {};
            switch (typeof selector) {
                case "object":
                    selectorObj = selector;
                    break;
                case "string":
                    var matches = this.SELECTOR_REGEX.exec(selector);
                    if (!matches) {
                        // fixed value
                        selectorObj.value = selector;
                    } else {
                        // attribute selector enclosed by {}
                        selectorObj.name = matches[1];
                    }
                    break;
                default:
                    selectorObj.value = selector;
            }
            return selectorObj;
        }
    };

    /**
     * @class
     */
    var SkippedNodes = function(nodeName) {
        this.nodeName = nodeName;
        this.xmlnsAttributes = [];
        this.attributes = {};
        this.attributeNames = []; // ensures stable order of attributes, includes also names of consumed attributes
        this.nodesBefore = [];
        this.childNodes = [];
        this.nodesAfter = [];
        this.intermediateElements = {}; // a map SkippedNodes containing intermediate elements that do not directly correspond to a model object
    };

    /**
     * @class
     */
    var DocumentProperties = function() {
        this.detectedLineEndings = "";
        this.hasMixedLineEndings = false;
        this.spacesBeforeDocumentElement = "";
        this.spacesAfterDocumentElement = "";
    };

    var XmlReaderException = function(node, message) {
        this.message = node ? node.nodeName + " - " + message : message;
        this.name = "XmlReaderException";
    };
    XmlReaderException.prototype = {
        toString: function() {
            return this.name + ": " + this.message;
        }
    };

    var XmlWriterException = function(node, message) {
        this.message = node ? node.nodeName + " - " + message : message;
        this.name = "XmlWriterException";
    };
    XmlWriterException.prototype = {
        toString: function() {
            return this.name + ": " + this.message;
        }
    };

    return {
        Util: Util,
        SkippedNodes: SkippedNodes,
        XmlReaderException: XmlReaderException,
        XmlWriterException: XmlWriterException,
        DocumentProperties: DocumentProperties
    };
});
