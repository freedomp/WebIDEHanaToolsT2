define([], function() {
    return {
        /*
        The code here is almost a duplication of jquery.sap.xml
        still there are few changes:
        1. For ie - Microsoft.XMLDOM always used (in jquery.sap.xml it is used only old versions). 
                 this because only this parser gives error location information in case of any version of ie.
        2. In case of webkit - jquery.sap.xml.getParseError checks for 'parsererror' tag under html element (this is a bug),
                while 'parsererror' tag may apear under other elements.
        */
    	parseXML : function parseXML(x) {
    		var X;
    		if (sap.ui.Device.browser.internet_explorer) {
    			X = new ActiveXObject('Microsoft.XMLDOM');
    			X.async = false;
    			X.loadXML(x);
    		} else if (window.DOMParser) {
    			var p = new DOMParser();
    			try {
    				X = p.parseFromString(x, 'text/xml');
    			} catch (e) {
    				var P = this.getParseError(X);
    				X = {};
    				P.reason = e.message;
    				X.parseError = P;
    				return X;
    			}
    		} 
    		var P = this.getParseError(X);
    		if (P) {
    			if (!X.parseError) {
    				X.parseError = P;
    			}
    		}
    		return X;
    	},
    	serializeXML : function serializeXML(x) {
    		var X = '';
    		if (window.ActiveXObject) {
    			X = x.xml;
    			if (X) {
    				return X;
    			}
    		}
    		if (window.XMLSerializer) {
    			var s = new XMLSerializer();
    			X = s.serializeToString(x);
    		}
    		return X;
    	},
    	isEqualNode : function (n, N) {
    		if (n === N) {
    			return true;
    		}
    		if (!n || !N) {
    			return false;
    		}
    		if (n.isEqualNode) {
    			return n.isEqualNode(N);
    		}
    		if (n.nodeType !== N.nodeType) {
    			return false;
    		}
    		if (n.nosap.ui.sap.ui.Devicealue !== N.nodeValue) {
    			return false;
    		}
    		if (n.baseName !== N.baseName) {
    			return false;
    		}
    		if (n.nodeName !== N.nodeName) {
    			return false;
    		}
    		if (n.nameSpaceURI !== N.nameSpaceURI) {
    			return false;
    		}
    		if (n.prefix !== N.prefix) {
    			return false;
    		}
    		if (n.nodeType !== 1) {
    			return true;
    		}
    		if (n.attributes.length !== N.attributes.length) {
    			return false;
    		}
    		for (var i = 0; i < n.attributes.length; i++) {
    			if (!this.isEqualNode(n.attributes[i], N.attributes[i])) {
    				return false;
    			}
    		}
    		if (n.childNodes.length !== N.childNodes.length) {
    			return false;
    		}
    		for (var i = 0; i < n.childNodes.length; i++) {
    			if (!this.isEqualNode(n.childNodes[i], N.childNodes[i])) {
    				return false;
    			}
    		}
    		return true;
    	},
    	getParseError : function getParseError(xmlDom) {
    		var p = {
    			errorCode : -1,
    			url : '',
    			reason : 'unknown error',
    			srcText : '',
    			line : -1,
    			linepos : -1,
    			filepos : -1
    		};
	        jQuery.sap.require('sap.ui.Device');

    		if (!!sap.ui.Device.browser.internet_explorer && xmlDom && xmlDom.parseError && xmlDom.parseError.errorCode !== 0) {
    			return xmlDom.parseError;
    		}
    		if (!!sap.ui.Device.browser.firefox && xmlDom && xmlDom.documentElement && xmlDom.documentElement.tagName === 'parsererror') {
    			var e1 = xmlDom.documentElement.firstChild.nodeValue;
    			var r1 = /XML Parsing Error: (.*)\nLocation: (.*)\nLine Number (\d+), Column (\d+):(.*)/;
    			if (r1.test(e1)) {
    				p.reason = RegExp.$1;
    				p.url = RegExp.$2;
    				p.line = parseInt(RegExp.$3, 10);
    				p.linepos = parseInt(RegExp.$4, 10);
    				p.srcText = RegExp.$5;
    			}
    			return p;
    		}
    		if (!!sap.ui.Device.browser.webkit && xmlDom && xmlDom.documentElement && xmlDom.getElementsByTagName('parsererror').length > 0) {
    			var e2 = this.serializeXML(xmlDom);
    			var r2 = /error on line (\d+) at column (\d+): ([^<]*)/;
    			if (r2.test(e2)) {
    				p.reason = RegExp.$3;
    				p.url = '';
    				p.line = parseInt(RegExp.$1, 10);
    				p.linepos = parseInt(RegExp.$2, 10);
    				p.srcText = '';
    			}
    			return p;
    		}
    		if (!xmlDom || !xmlDom.documentElement) {
    			return p;
    		}
    		return {
    			errorCode : 0
    		};
    	},
        
        decodeXml: function decodeXml(text) {
            var escaped_one_to_xml_special_map = {
                '&': '&',
                '"': '"',
                '&lt;': '&lt;',
                '&gt;': '>'
            };
            return text.replace(/("|&lt;|&gt;|&)/g,
                function(str, item) {
                    return escaped_one_to_xml_special_map[item];
            });
        }
    };
});
