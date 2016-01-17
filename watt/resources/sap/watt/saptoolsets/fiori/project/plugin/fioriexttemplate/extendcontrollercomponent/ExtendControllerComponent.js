define([ "../manager/ComponentManager",
		"../constants/ComponentConstants",
		"sap/watt/lib/orion/javascript/esprima/esprimaVisitor",
		"sap/watt/lib/orion/ui/esprima/esprima",
		"sap/watt/lib/orion/ui/escodegen/escodegen.browser"], function(ComponentManager, ComponentConstants, mVisitor) {
	var oComponentManager = null;

	var CONSTANTS = {
		EmptyController : "EmptyController.js.tmpl",
		ParentController : "ParentController.js.tmpl"
	};

	var EXTENDCONTROLLERCOMPONENT_CONSTANTS = {
		regex : /,*([a-zA-Z0-9_\s+]*\s*:\s*function[(].*?[)])/g,
		onInit : "onInit",
		onBeforeRendering : "onBeforeRendering",
		onAfterRendering : "onAfterRendering",
		onExit : "onExit",
		comment : "//",
		lineBreak : "\r\n",
		openMustache : "{",
		closeMustache : "}",
		comma : ",",
		dot : ".",
		placeHolder : "var ___replace_me___;",
		constructorSyntax : "sap.ui.controller();"
	};

	var toFullPath = function (sRelativePath, sBase) {
		var stack = sBase.split("/"),
			parts = sRelativePath.split("/");
		stack.pop();
		for (var i = 0; i < parts.length; i++) {
			if (parts[i] === ".") {
				continue;
			}
			if (parts[i] === "..") {
				stack.pop();
			} else {
				stack.push(parts[i]);
			}
		}
		return stack.join("/");
	};

	// locate the "sap.ui.define([], function())" syntax, then iterate over the strings in the array element
	var _repairRelativePaths = function (oNode, oContext) {
		if (oNode.type === esprima.Syntax.CallExpression && oNode.callee &&
			oNode.callee.type === esprima.Syntax.MemberExpression && oNode.callee.property.name === "define" &&
			oNode.callee.object.property  && oNode.callee.object.property.name == "ui" && oNode.callee.object.object &&
			oNode.callee.object.object.name === "sap") {
			if (oNode.arguments && oNode.arguments[0].type === esprima.Syntax.ArrayExpression) {
				var regex = /\.{1,2}\//;
				var defineStrings = oNode.arguments[0].elements ? oNode.arguments[0].elements : [];
				for (var i = 0; i < defineStrings.length; i++) {
					if(regex.test(defineStrings[i].value)) {
						defineStrings[i].value = toFullPath(defineStrings[i].value, oContext.controllerFilePath);
					}
				}
			}
			return false;
		}
		return true;
	};

	var _constructorVisitor = function (oNode, oContext) {
		if (oNode.type === esprima.Syntax.MemberExpression && oNode.property && oNode.property.type === esprima.Syntax.Identifier &&
			oNode.property.name && oNode.property.name === "controller") {
			oContext.constructorAst = oNode;
			return false;
		}
		return true;
	};

	var _copyControllerVisitor = function (oNode, oContext) {
		if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
			oNode.callee.property.type === esprima.Syntax.Identifier && oNode.callee.property.name === "extend") {
			// This is an "something.extend(" call, make sure the ID matches the Controller ID, and replace with the new ID
			if (oNode.arguments[0].value === oContext.oldId) {
				oNode.arguments[0].value = oContext.newId;
				// Replace the ".extend" syntax with "sap.ui.controller" syntax
				oNode.callee = oContext.constructorAst;
				// Copy the controller code for later use
				oContext.oControllerAst = jQuery.extend({}, oNode.arguments[1]);
				// Plant the place holder instead
				oNode.arguments[1].properties = oContext.placeHolderProperty.body;
				return false;
			} else {
				return true;
			}
		}
		return true;
	};

	var _ControllerMethodsVisitor = function (oNode, oContext) {
		if (oNode.type === esprima.Syntax.CallExpression && oNode.callee && oNode.callee.property &&
			oNode.callee.property.type === esprima.Syntax.Identifier && oNode.callee.property.name === "extend") {
			// This is an ".extend(" call, make sure the ID matches the Controller ID, and iterate over the methods defined in it
			if (oNode.arguments[0].value === oContext.oldId) {
				var aProperties = oNode.arguments[1].properties;
				oContext.aProperties = extractControllerMethodSignatures(aProperties);
				return false;
			} else {
				return true;
			}
		}
		return true;
	};

	var extractControllerMethodSignatures = function(aProperties) {
		var aResult = [];
		for (var i = 0; i < aProperties.length; i++) {
			// Only copy method signatures
			if (aProperties[i].value.type !== esprima.Syntax.FunctionExpression) {
				continue;
			}

			var oMethod = aProperties[i];
			// The lifecycle methods are defined in the template, no need to copy them over
			if (oMethod.key && oMethod.key.name &&
				oMethod.key.name !== EXTENDCONTROLLERCOMPONENT_CONSTANTS.onInit && oMethod.key.name !== EXTENDCONTROLLERCOMPONENT_CONSTANTS.onAfterRendering &&
				oMethod.key.name !== EXTENDCONTROLLERCOMPONENT_CONSTANTS.onBeforeRendering && oMethod.key.name !== EXTENDCONTROLLERCOMPONENT_CONSTANTS.onExit) {

				var header = oMethod.key.name;
				var params = [];
				if (oMethod.value && oMethod.value.params && oMethod.value.params.length > 0) {
					for (var j = 0; j < oMethod.value.params.length; j++) {
						params.push(oMethod.value.params[j].name);
					}
				}
				aResult.push({
					header : header,
					params : params
				});
			}
		}
		return aResult;
	};

	var _onBeforeProcessDocument = function (oDocument, sExtensionNamespace, templateZip, model, oContext) {
		return oDocument.getContent().then(function(fileContent) {
			var oAst, oVisitContext;

			if (model.fiori.extensionCommon.extensionId === "Empty controller") {
				oAst = mVisitor.parse(fileContent, {comment : true});
				oVisitContext = {
					oldId : model.fiori.extensionCommon.resourceId
				};

				mVisitor.visit(oAst, oVisitContext, _ControllerMethodsVisitor);
				model.fiori.extendController.parentMethodHeaders = oVisitContext.aProperties;

				templateZip.remove(CONSTANTS.ParentController);
				// clear second drop down box selection
				model.fiori.extensionCommon.extensionId = undefined;
			} else {
				// clear second drop down box selection
				model.fiori.extensionCommon.extensionId = undefined;
				//Call service to get the current controller extension number
				return oContext.service.extensionproject.getExtensionRevision(model).then(function(index) {
					var extensionResourceId = model.fiori.extensionCommon.resourceId.replace(model.extensibility.namespace, sExtensionNamespace);
					extensionResourceId = extensionResourceId + "Custom";
					if (index > 0) {
						extensionResourceId = extensionResourceId + index;
					}
					model.fiori.extensionCommon.extensionResourceId = extensionResourceId;

					oAst = mVisitor.parse(fileContent, {range: true, tokens: true, comment : true});
					// build the base path and adjust relative paths in the define section accordingly
					var controllerFilePath = model.fiori.extensionCommon.resourceId.replace(model.fiori.extensionCommon.resourceName, "").replace(/\./g, "/");
					var oRepairContext = {
						controllerFilePath : controllerFilePath
					};
					mVisitor.visit(oAst, oRepairContext, _repairRelativePaths);

					// swap the content of the controller with the place holder
					var placeHolderAst = mVisitor.parse(EXTENDCONTROLLERCOMPONENT_CONSTANTS.placeHolder);
					var constructorAst = mVisitor.parse(EXTENDCONTROLLERCOMPONENT_CONSTANTS.constructorSyntax);

					oVisitContext = {
						newId : extensionResourceId,
						oldId : model.fiori.extensionCommon.resourceId,
						placeHolderProperty : placeHolderAst
					};
					mVisitor.visit(constructorAst, oVisitContext, _constructorVisitor);
					mVisitor.visit(oAst, oVisitContext, _copyControllerVisitor);

					// Only comment out what we found, do not modify the rest of the file
					if (oVisitContext.oControllerAst) {
						fileContent = escodegen.generate(oAst, { format : {quotes : "double"}, comment: true});

						var controllerContent = escodegen.generate(oVisitContext.oControllerAst, { format : {quotes : "double"}, comment: true});
						var commentedOut = controllerContent.replace(/\n/g, "\n//");
						// remove redundant bracket
						commentedOut = commentedOut.slice(1, commentedOut.lastIndexOf("//"));
						fileContent = fileContent.replace(EXTENDCONTROLLERCOMPONENT_CONSTANTS.placeHolder, commentedOut);
					}

					templateZip.remove(CONSTANTS.EmptyController);
					model.fiori.extendController.parentControllerContent = fileContent;
				});
			}
		});
	};

	var onBeforeReplaceControllerGenerate = function(templateZip, model, oContext) {
		var resourcePath = model.fiori.extensionCommon.selectedDocumentPath;
		var type = model.extensibility.type;
		var system = model.extensibility.system;

		var promises = [];

		promises.push(oContext.service.parentproject.getDocument(resourcePath, "file", system, type));
		promises.push(oContext.service.extensionproject.getExtensionNamespace(model.extensionProjectPath));
		return Q.all(promises).spread(function() {
			var oDocument = arguments[0];
			var extensionNamespace = arguments[1];
			return _onBeforeProcessDocument(oDocument, extensionNamespace, templateZip, model, oContext);
		});
	};

	var _onBeforeTemplateGenerate = function(templateZip, model) {

		oComponentManager = new ComponentManager(this.context);

		oComponentManager.initializeComponentModel(model, ComponentConstants.constants.components.initModel.ExtendController);

		return onBeforeReplaceControllerGenerate(templateZip, model, this.context).then(function() {
			return oComponentManager.onBeforeTemplateGenerate(templateZip, model);
		});
	};

	var _onAfterGenerate = function(projectZip, model) {
		return oComponentManager.onAfterGenerate(projectZip, model);
	};

	var _configWizardSteps = function(oExtendControllerStep) {
		return [ oExtendControllerStep ];
	};

	return {
		onBeforeTemplateGenerate : _onBeforeTemplateGenerate,
		onAfterGenerate : _onAfterGenerate,
		configWizardSteps : _configWizardSteps,
		onBeforeProcessDocument : _onBeforeProcessDocument
	};
});