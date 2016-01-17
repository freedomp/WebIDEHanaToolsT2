define(["../constants/ComponentConstants",
		"../manager/ComponentManager",
		"sap/watt/platform/plugin/utils/xml/XmlUtil",
		"sap/watt/lib/jqueryxpathplugin/jqueryXpath"],
	function(ComponentConstants, ComponentManager, xmlUtil) {
		var oComponentManager = null;
		var oContext = null;

		var _onBeforeTemplateGenerate = function(templateZip, model) {
			oContext = this.context;
			oComponentManager = new ComponentManager(this.context);

			oComponentManager.initializeComponentModel(model, ComponentConstants.constants.components.initModel.ExtendView);

			return onBeforeExtendViewGenerate(templateZip, model).then(function() {
				return oComponentManager.onBeforeTemplateGenerate(templateZip, model);
			});
		};

		var onBeforeExtendViewGenerate = function(templateZip, model) {
			//Set the selected view document in a component viewDocument
			var selectedResourcePath = model.fiori.extensionCommon.selectedDocumentPath;
			var type = model.extensibility.type;
			var system = model.extensibility.system;
			var selectedExtPoint = model.fiori.extensionCommon.extensionId;

			// get the view document
			return oContext.service.parentproject.getDocument(selectedResourcePath, "file", system, type).then(function(oDocument) {
				// get the view content
				return oDocument.getContent().then(function(viewContent) {

					// parse the view content to an XML object
					var fileXmlContent = viewContent;
					if (typeof viewContent === "string") {
						fileXmlContent = (new DOMParser()).parseFromString(viewContent, "text/xml");
					}

					// extract the view attributes from the content
					var oViewAttributes = getViewAttributesByContent(fileXmlContent);

					// save the attributes in the model to be used in the template document
					model.fiori.extendView.fragmentAttributes = oViewAttributes;

					var extensionPointContent = getExtensionPointContent(fileXmlContent, selectedExtPoint);
					// save the content of the extension point (if exists) in the model to be used in the template document
					model.fiori.extendView.extensionPointContent = extensionPointContent;
					// save this parameter for the comment in the template document
					model.fiori.extendView.parentTypeExists = true;
					model.fiori.extendView.siblingExists = true;
					model.fiori.extendView.extensionPointContentExists = true;
					if (extensionPointContent === "") {
						model.fiori.extendView.extensionPointContentExists = false;
						var relation = getExtensionPointSibling(fileXmlContent, selectedExtPoint); //get parent and sibling of extension point
						model.fiori.extendView.sibling = relation.sibling;
						model.fiori.extendView.parentType = relation.parentType;
						if (model.fiori.extendView.parentType === "") { //no parent type specified
							model.fiori.extendView.parentTypeExists = false;
						}
						if (model.fiori.extendView.sibling === "") {
							model.fiori.extendView.siblingExists = false;
						}
					}
				});
			});
		};

		//Get prefix and Suffix Attributes from View content and add to model
		var getViewAttributesByContent = function(fileXmlContent) {

			var oViewAttributes = "xmlns:core=\"sap.ui.core\"";
			var attributes = xmlUtil.firstElementChild(fileXmlContent).attributes;

			for (var i = 0; i < attributes.length; i++) {
				var attribute = attributes[i];
				var nodeName = attribute.nodeName;

				if (jQuery.sap.startsWith(nodeName, "xmlns")) {
					var nodeValue = attribute.value;

					if (nodeName !== "xmlns:core" && nodeValue !== "sap.ui.core") {
						oViewAttributes = oViewAttributes + " " + nodeName + "=\"" + nodeValue + "\"";
					}
				}
			}

			return oViewAttributes + ">";
		};

		var changeElementIds = function(cln) {

			var iterator = 0;
			var node = null;
			//change id of root
			if (cln.attr) {
				if (cln.attr("id")) {
					var currId = cln.attr("id");
					cln.attr("id", currId + "_clone");
				}
			}

			var nodeList = (cln[0] || document).getElementsByTagName('*');
			//change ids of all elements under clone
			for (iterator; iterator < nodeList.length; iterator++) {
				node = nodeList[iterator];
				if (node.getAttribute("id")) {
					var id = node.getAttribute("id");
					node.setAttribute("id", id + "_clone");
				}

			}

			return cln;
		};

		var costructObj = function(prev, current) {
			if (prev) {
				return prev[current];
			} else {
				return undefined;
			}
		};

		var getExtensionPointSibling = function(fileXmlContent, selectedExtPoint) {
			//extract the siblings and parent of selected extension point 
			var nextSiblings = $(fileXmlContent).xpath("//*:ExtensionPoint[@name='" + selectedExtPoint + "']/following-sibling::*");
			var prevSiblings = $(fileXmlContent).xpath("//*:ExtensionPoint[@name='" + selectedExtPoint + "']/preceding-sibling::*");
			var parent = $(fileXmlContent).xpath("//*:ExtensionPoint[@name='" + selectedExtPoint + "']/..");

			//data is an object to return which contains the parent and siblings if exist
			var data = {};
			data.parentType = "";
			data.sibling = "";

			if (parent.length && parent.length > 0) {
				data.parentType = parent[0].tagName;
			}
			var sibling = "";
			//check if there is a sibling after the extension point
			if (nextSiblings.length && nextSiblings.length > 0) {
				sibling = nextSiblings[0];
				//check if there is a sibling before the extension point
			} else if (prevSiblings.length && prevSiblings.length > 0) {
				sibling = prevSiblings[prevSiblings.length - 1];

			} else { //in case no sibling available
				return data;
			}

			//verify that sibling is UI5 element (otherwise in run time this cant be loaded)
			var namespace = sibling.namespaceURI;
			var tagName = sibling.tagName;
			//check if tag name includes namespace
			if(tagName.indexOf(":") >= 0){
			    var tagNameArr = tagName.split(":");
			    tagName = tagNameArr[1];
			}
			var str = namespace + "." + tagName;
			var isUI5Control = str.split(".").reduce(costructObj, window);
			if (isUI5Control === undefined) { //sibling is not UI5 control
				return data;
			}

			var cln = $(sibling).clone();

			//get the content of clone object as a string
			if (cln.length && (cln.length > 0)) {
								//change the ids in the cloned element to prevent duplicate ids 
				cln = changeElementIds(cln);
				data.sibling = new XMLSerializer().serializeToString(cln[0]);

                //remove all comments
				while(data.sibling.indexOf("<!--") !== -1){
				    var prefix = data.sibling.substr(0,data.sibling.indexOf("<!--"));
				    var infix = data.sibling.substr(data.sibling.indexOf("-->")+3, data.sibling.length);
				    data.sibling = prefix.concat(infix);
				}
				
				//remove blanck lines
				data.sibling = data.sibling.replace(/^\s*$[\n\r]{1,}/gm, '');

				return data;
			}

			return data;
		};

		var getExtensionPointContent = function(fileXmlContent, selectedExtPoint) {

			// extract the selected extension point 
			var extPoints = $(fileXmlContent).xpath("//*:ExtensionPoint[@name='" + selectedExtPoint + "']");

			var extPoint;

			if (extPoints.length && extPoints.length > 0) {
				extPoint = extPoints[0];
			} else {
				return "";
			}

			// get the content of the selected extension point
			var children = $(extPoint).xpath("*");
			if (children.length && (children.length > 0)) { // there are children
				var contentString = "";

				for (var i = 0; i < children.length; i++) {
					// parse every child to string
					contentString += new XMLSerializer().serializeToString(children[i]) + "\n\t";
				}

				return contentString;
			}

			return "";
		};

		var handleFragmentName = function(projectZip, model) {

			//need to remove parent namespace from fragment name in order to allow correct rout of the app.
			//the following code reads the customizing section that was generated in the zip file
			//and remove the namespace from the fragment name.
			//the fragment name was also changed 
			var customizationString = oComponentManager.getFileContentFromZip(projectZip);
			var customizationJson = JSON.parse(customizationString);

			var customizationId = Object.keys(customizationJson)[0];
			if (customizationJson[customizationId] === undefined) {
				customizationJson[customizationId] = customizationJson[customizationId];
			} else if (model.fiori.extensionCommon.resourceId === undefined) {
				customizationJson[customizationId] = customizationJson[customizationId];
			} else {
				var resourceId = Object.keys(customizationJson[customizationId])[0];
				if (customizationJson[customizationId][resourceId] === undefined) {
					customizationJson[customizationId][resourceId] = customizationJson[customizationId][resourceId];
				} else if (typeof customizationJson[customizationId][resourceId] !== "string") {
					var extensionId = Object.keys(customizationJson[customizationId][resourceId])[0];
					if (extensionId !== undefined) {
						customizationJson[customizationId][resourceId][extensionId] = customizationJson[customizationId][resourceId][extensionId];
					}
				}
			}

			var fragmentName = customizationJson[customizationId][resourceId][extensionId]["fragmentName"];
			fragmentName = removeString(fragmentName, model.extensibility.namespace);

			customizationJson[customizationId][resourceId][extensionId]["fragmentName"] = fragmentName;

			var content = JSON.stringify(customizationJson, null, 4);

			projectZip.remove(oComponentManager.customizationFileName);
			projectZip.file(oComponentManager.customizationFileName, content);
			//change the fragment name 
			model.fiori.extensionCommon.extensionFilePath = removeString(model.fiori.extensionCommon.extensionFilePath,
				model.extensibility.namespace);

		};
		var _onAfterGenerate = function(projectZip, model) {
			var selectedResourcePath = model.fiori.extensionCommon.selectedDocumentPath;
			var suffix = "fragment.xml";
			//var match = selectedResourcePath.match(suffix + "$");
			if (selectedResourcePath.lastIndexOf(suffix) !== -1) {
				handleFragmentName(projectZip, model);
			}

			return oComponentManager.onAfterGenerate(projectZip, model);
		};

		var removeString = function(originalString, toRemoveStrig) {

			var lastIndx = originalString.lastIndexOf(toRemoveStrig);
			if (lastIndx === 0) {
				return originalString;
			}
			var prefix = originalString.substring(0, lastIndx);
			var suffix = originalString.substring(lastIndx);
			suffix = suffix.replace(toRemoveStrig + ".", "");
			return prefix + suffix;

		};
		var _configWizardSteps = function(oExtendViewStep) {
			return [oExtendViewStep];
		};

		return {
			onBeforeTemplateGenerate: _onBeforeTemplateGenerate,
			onAfterGenerate: _onAfterGenerate,
			configWizardSteps: _configWizardSteps
		};
	});