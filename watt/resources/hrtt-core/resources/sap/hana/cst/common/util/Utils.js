/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define([],
    function() {

        "use strict";

        var Utils = {

            isJSON: function(oItem) {
                oItem = typeof oItem !== "string" ? JSON.stringify(oItem) : oItem;

                try {
                    oItem = JSON.parse(oItem);
                } catch (e) {
                    return false;
                }

                if (typeof oItem === "object" && oItem !== null) {
                    return true;
                }

                return false;
            },

            prettyJSON: function(data) {
                try {
                    if (typeof data === "string") {
                        data = JSON.parse(data);
                    }
                    return JSON.stringify(data, null, 4);
                } catch (e) {
                    return data;
                }
            },

            isXML: function(sText) {
                return this._buildXMLFromString(sText);
            },

            _buildXMLFromString: function(text) {
                var message = "";
                var xmlDoc = null;
                if (window.DOMParser) { // all browsers, except IE before version 9
                    var parser = new DOMParser();
                    try {
                        xmlDoc = parser.parseFromString(text, "text/xml");
                    } catch (e) {
                        // if text is not well-formed,  it raises an exception in IE from version 9
                        return false;
                    }

                } else { // Internet Explorer before version 9
                    xmlDoc = this._createMSXMLDocumentObject();
                    if (!xmlDoc) {
                        return false;
                    }
                    xmlDoc.loadXML(text);
                }

                var errorMsg = null;
                if (xmlDoc.parseError && xmlDoc.parseError.errorCode !== 0) {
                    errorMsg = "XML Parsing Error: " + xmlDoc.parseError.reason + " at line " + xmlDoc.parseError.line + " at position " + xmlDoc.parseError.linepos;
                } else {
                    if (xmlDoc.documentElement) {
                        if (xmlDoc.documentElement.nodeName == "parsererror") {
                            errorMsg = xmlDoc.documentElement.childNodes[0].nodeValue;
                        }
                    } else {
                        errorMsg = "XML Parsing Error!";
                    }
                }

                if (errorMsg) {
                    return false;
                }

                return true;
            },

            _createMSXMLDocumentObject: function() {
                if (typeof(ActiveXObject) != "undefined") {
                    var aDomDocuments = [
                        "Msxml2.DOMDocument.6.0",
                        "Msxml2.DOMDocument.5.0",
                        "Msxml2.DOMDocument.4.0",
                        "Msxml2.DOMDocument.3.0",
                        "MSXML2.DOMDocument",
                        "MSXML.DOMDocument"
                    ];
                    for (var i = 0; i < aDomDocuments.length; i++) {
                        try {
                            return new ActiveXObject(aDomDocuments[i]);
                        } catch (e) {}
                    }
                }
                return null;
            },

            trim: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/^\s+|\s+$/g, "");
            },
            
            // IE does not have trimLeft and trimRight
            trimLeft: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/^\s+/, "");
            },

            trimRight: function(stringToTrim) {
                if (!stringToTrim) {
                    return "";
                }
                return stringToTrim.replace(/\s+$/, "");
            }
        };


        return Utils;
    });