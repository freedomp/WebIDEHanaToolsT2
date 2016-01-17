define([ "sap/watt/lib/jqueryxpathplugin/jqueryXpath"], function(jqueryXpath) {

	var _getAttribute = function(element, attrName) {
		var attributes = element.attributes;
		for ( var i = 0; i < attributes.length; i++) {
			var attribute = attributes[i];

			if (attribute.nodeName === attrName) {
				return attribute.value;
			}
		}
		// default value
		return "file";
	};

	var _firstElementChild = function(xmlContent) {
		var firstXmlElementNode = null;

		var xmlContentChildNodes = xmlContent.childNodes;
		for ( var i = 0; i < xmlContentChildNodes.length; i++) {
			if (xmlContentChildNodes[i].nodeType == Node.ELEMENT_NODE) {
				firstXmlElementNode = xmlContentChildNodes[i];
				break;
			}
		}

		return firstXmlElementNode;
	};

	var _children = function(xmlContent) {
		var children = [];

		var xmlContentChildNodes = xmlContent.childNodes;
		for ( var i = 0; i < xmlContentChildNodes.length; i++) {
			if (xmlContentChildNodes[i].nodeType == Node.ELEMENT_NODE) {
				children.push(xmlContentChildNodes[i]);
			}
		}

		return children;
	};

	var _getChildByTagName = function(entry, tagName) {
		//var children = entry.children;
		var children = entry.childNodes;
		for ( var i = 0; i < children.length; i++) {
			var child = children[i];

			if (child.tagName === tagName) {
				return child;
			}
		}
		return undefined;
	};

	var _getChildByTagAttrNameVal = function(entry, tagName, attrName, attrValue) {
		var matchedChildren = [];
		var children = entry ? entry.childNodes : null;
		if (children) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var childAttrs = child.attributes;
				if (childAttrs) {
					for (var j = 0; j < childAttrs.length; j++) {
						var childAttribute = childAttrs[j];
						if (childAttribute.name === attrName && childAttribute.nodeValue === attrValue &&
							child.tagName === tagName) {
							matchedChildren.push(child);
						}
					}
				}
			}
		}
		return matchedChildren;
	};

	var _getChildByAttrNameVal = function(entry, attrName, attrValue) {
		var matchedChildren = [];
		var children = entry ? entry.childNodes : null;
		if (children) {
			for (var i = 0; i < children.length; i++) {
				var child = children[i];
				var childAttrs = child.attributes;
				if (childAttrs) {
					for (var j = 0; j < childAttrs.length; j++) {
						var childAttribute = childAttrs[j];
						if (childAttribute.name === attrName && childAttribute.nodeValue === attrValue) {
							matchedChildren.push(child);
						}
					}
				}
			}
		}
		return matchedChildren;
	};

	var _getChildNodeValue = function(entry, tagName) {
		for ( var i = 0; i < entry.childElementCount; i++) { // entry.children isn't supported in IE
			var child = entry.childNodes[i];

			if (child.tagName === tagName) {
				return child.textContent; // child.innerHTML isn't supported in IE
			}
		}
		return "";
	};

	var _stringToXml = function(fileContent) {
		var xmlFile = fileContent;
		if (typeof xmlFile === "string") {
			//xmlFile = jQuery.sap.parseXML(fileContent);
			var parser = new DOMParser();
			xmlFile = parser.parseFromString(fileContent, "text/xml");
		}

		return xmlFile;
	};

	var _isVisible = function(library, controlName) {
		try {
			// get library control class
			var libControl = getControlClass(library, controlName);

			if (libControl) {
				// get control class metadata

				var metadata = libControl.getMetadata();
				if (metadata) {
					var publicMethods = metadata.getAllPublicMethods();
					for ( var m = 0; m < publicMethods.length; m++) {
						if (publicMethods[m] === "getVisible") { // check if controll has "getVisible" method
							return true;
						}
					}
				}
			}
		} catch (error) {
			//console.log(error);
		}

		return false;
	};
	
	/* checks if the child control is an aggregation of parent control */
	var _isAggregation = function(library, parentControlName , childControlName) {
		try {
			// get library control class
			var libControl = getControlClass(library, parentControlName);
			if (libControl) {
				// get parent control class metadata
				var metadata = libControl.getMetadata();
				if (metadata) {
					var aggregations = metadata.getAllAggregations();
					if(aggregations[childControlName]){
						return true;
					}
				}
			}
		} catch (error) {
		}
		return false;
	};

	var getControlClass = function(library, controlName) {
		var nameParts = controlName.split(":");
		if (nameParts.length === 2) {
			controlName = nameParts[1];
		}
		// views livrary is sap.ui.core.mvc	
		if (controlName === "View") {
			library = "sap.ui.core.mvc";
		}

		var libControl = sap;
		// get control "class" from "class" name
		var controlFound = true;
		var parts = library.split(".");
		for ( var i = 1; i < parts.length; i++) {
			libControl = libControl[parts[i]];
			if (!libControl) { // if control class cannot be fetched return false
				controlFound = false;
			}
		}

		if (!controlFound) {
			try { // check if a control library is already loaded 
				sap.ui.getCore().loadLibrary(library); // load a control library if necessary
				//sap.ui.lazyRequire(library + "." + controlName);
			} catch (error) {
				console.log(error.message);
			}

			libControl = sap;
			for (i = 1; i < parts.length; i++) {
				libControl = libControl[parts[i]];
				if (!libControl) { // if control class cannot be fetched return false
					return undefined;
				}
			}
		}

		// add control name to class
		libControl = libControl[controlName];

		return libControl;
	};

	var _getXmlParameters = function(xmlFile, tagName, attribute) {
		var controlIds = xmlFile.getElementsByTagName("*");

		var controlIdsValues = [];

		for ( var i = 0; i < controlIds.length; i++) {
			var controlId = controlIds[i].getAttribute(attribute);
			if (controlId === null || controlId === undefined) {
				continue;
			} else if (tagName === "*") {
				if (_isVisible(controlIds[i].namespaceURI, controlIds[i].nodeName)) {
					controlIdsValues.push({
						"name" : controlId,
						"nodeName" : controlIds[i].nodeName
					});
				}
			} else if (jQuery.sap.endsWith(controlIds[i].tagName, tagName)) {
				controlIdsValues.push({
					"name" : controlId,
					"nodeName" : controlIds[i].nodeName
				});
			}
		}

		return controlIdsValues;
	};

	var _getTagAttributes = function (oXmlNode) {
		var mAttributes = {};
		var aAttributes = oXmlNode.attributes;
		for (var i =0; i < aAttributes.length; i++) {
			mAttributes[aAttributes[i].name] = aAttributes[i].value;
		}
		return mAttributes;
	};

	return {
		getAttribute : _getAttribute,
		getChildByTagName : _getChildByTagName,
		getChildNodeValue : _getChildNodeValue,
		getXmlParameters : _getXmlParameters,
		getTagAttributes : _getTagAttributes,
		stringToXml : _stringToXml,
		isVisible : _isVisible,
		isAggregation : _isAggregation,
		firstElementChild : _firstElementChild,
		children : _children,
		getChildByAttrNameVal : _getChildByAttrNameVal,
		getChildByTagAttrNameVal : _getChildByTagAttrNameVal
	};
});