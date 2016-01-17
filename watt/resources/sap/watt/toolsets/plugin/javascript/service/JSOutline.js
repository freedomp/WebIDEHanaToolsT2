define(["sap/watt/common/plugin/platform/service/ui/AbstractPart"], function(AbstractPart) {
	"use strict";
	var JSOutline = AbstractPart.extend("sap.watt.common.plugin.javascript.service.JSOutline", {

		_oView: null,
		_oController: null,
		_oEditor: null,
		_sEditorTitle: null,
		_aSupportedFileExtensions: null,

		init: function() {},

		configure: function(mConfig) {
			this._aStyles = mConfig.styles;
			this._aSupportedFileExtensions = mConfig.supportedFileExtensions;
		},

		_isFileExtensionSupported : function(sFileExtension) {
			return this._aSupportedFileExtensions.indexOf(sFileExtension) > -1;
		},

		getContent: function() {
			var that = this;
			if (!this._oView) {
				this._oView = sap.ui.view({
					viewName: "sap.watt.toolsets.plugin.javascript.view.JSOutlineTree",
					type: sap.ui.core.mvc.ViewType.JS
				});
				this._oController = this._oView.getController();
				this.context.self.attachEvent('visibilityChanged', this._onVisibilityChanged, this);
				//this._oController.init(this.context);
				return AbstractPart.prototype.getContent.apply(this, arguments).then(function() {
					that.context.service.selection.attachEvent('changed', that.onSelectionChanged, that);
					that.context.service.document.attachEvent('saved', that.onDocumentSaved, that);
					that.context.service.outlinePane.attachEvent('visibilityChanged', that.onPaneVisibilityChange, that);
					return that._oView;
				});
			}
			return this._oView;
		},

		/** updates outline
		 */
		_updateTree: function(oEvent, oAST, oEditor) {
			var that = this;
			that._oController.initOutline(oAST, oEditor);
		},

		/** starts provider service for oEditor
		 */
		_updateOutline: function(oEvent, oEditor) {

			var that = this;
			if (!oEditor) {
				return;
			}
			if (that._oEditor !== oEditor) {
				that._oEditor = oEditor;
				that._detachAll();
				that._oEditor.attachEvent("viewHasChanged", this._onEditorChange, this);
				that._oEditor.attachEvent("closed", this._onEditorClose, this);
			}
			var astService = that.context.service.jsASTManager;

			that._oEditor.getContentStatus().then(function(content) {
				var context = {
					objHierarchyStack: [],
					outlineJSON: [],
					child2ParentMapping: {}
				};
				return astService.parseAndVisit(content.targetFile, content.buffer, {
					range: true,
					loc: true,
					tolerant: true
				}, context, that.visitor, that.cleanStack).then(function(outlineData) {
					var targetFile = content.targetFile;
					return oEditor.getUI5Editor().then(function(oUI5Editor) {
						if (outlineData.contentOwner === targetFile) {
							that._updateTree(oEvent, outlineData.outlineContext.outlineJSON, oUI5Editor);
							that.context.service.usagemonitoring.report("editor", "get_outline_content").done();
						}
						return Q();
					});
				});
			}).done();

			oEditor.getTitle().then(function(sTitle) {
				that._sEditorTitle = sTitle;
			}).done();

		},

		_detachAll: function() {
			this._oEditor.detachEvent("viewHasChanged", this._onEditorChange, this);
			this._oEditor.detachEvent("closed", this._onEditorClose, this);
		},

		/** Check if outline service is responsible and can work with current selection event
		 */
		canHandle: function(oEvent) {
			/*			if (!sap.watt.getEnv("internal")) {
			 return false;
			 }*/

			var that = this;
			var oOwner = oEvent.params.owner;

			if (that.context.self === oOwner) {
				// don't react on self fired events
				return false;
			}
			if (oOwner.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
				var selection = oEvent.params.selection;
				if (selection && selection.length > 0) {
					var document = selection[0].document;
					var sFileExtension = document && document.getEntity && document.getEntity().getFileExtension();
					if (this._isFileExtensionSupported(sFileExtension)) {
						return true;
					}
					if (that._oController){
						that._oController.cleanOutline();
						that._oDocument = null;
					}
					return false;
				}
			} else {
				return false;
			}
			// 	that.context.service.perspective.getAreaForService("outlinePane").then(function(sPlace) {
			// 		if (sPlace) { // right pane is closed or open WITH THE outline plugin
			// 			that.context.service.perspective.isAreaVisible(sPlace).then(function(bVisible) {
			// 				if (bVisible) {
			// 					if (oOwner.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
			// 						return oOwner.getCurrentFilePath().then(function(sFile) {
			// 							if (sFile && (sFile.match(/\.js$/) !== null)) {
			// 								return true;
			// 							}
			// 							return false;
			// 						});
			// 					} else {
			// 						return new Q(false);
			// 					}
			// 				}
			// 			});
			// 		}
			// 	});
		},

		// 		canHandle: function(oEvent) {
		// 			if (oEvent.params.selection.length > 0) {
		// 				var oOwner = oEvent.params.owner;
		// 				var oDocument = oEvent.params.selection[0].document;
		// 				if (oOwner.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")&&oDocument && oDocument.getEntity() && (oDocument.getEntity().getFileExtension() === 'js')) {
		// 					return true;
		// 				}
		// 			}
		// 			return false;
		// 		},

		onSelectionChanged: function(oEvent) {
			var that = this;
			var oOwner = oEvent.params.owner;
			//return that.canHandle(oEvent).then(function(isHandled) {
			var isHandled = this.canHandle(oEvent);
			if (isHandled) {
				var oDoc = that._getSelectedDocument(oEvent.params.selection);
				if (!that._oDocument || that._oDocument !== oDoc) {
					that._oDocument = oDoc;

					return that.context.service.perspective.getAreaForService("outlinePane").then(function(sPlace) {
						if (sPlace) { // right pane is closed or open WITH THE outline plugin
							return that.context.service.perspective.isAreaVisible(sPlace).then(function(bVisible) {
								if (bVisible) {
									that._updateOutline(oEvent, oOwner);
								}
								return Q();
							});
						}
					});
				}
			}
			//});
		},
		onDocumentSaved: function(oEvent) {
			var that = this;
			return that.context.service.selection.getOwner().then(function(oCurrentEditorInstance) {
				if (oCurrentEditorInstance &&  oCurrentEditorInstance.instanceOf("sap.watt.common.plugin.aceeditor.service.Editor")) {
					var oDocument = oEvent.params.document;
					return that.context.service.perspective.getAreaForService("outlinePane").then(function(sPlace) {
						if (sPlace) { // right pane is closed or open WITH THE outline plugin
							return that.context.service.perspective.isAreaVisible(sPlace).then(function(bVisible) {
								if (bVisible) {
									if (oDocument && oDocument.getEntity() && that._isFileExtensionSupported(oDocument.getEntity().getFileExtension())) {
										that._updateOutline(oEvent, oCurrentEditorInstance);
									}
									return Q();
								}
							});
						}
					});

				}
			}).fail(function(){
				return Q();
			});

		},

		onPaneVisibilityChange: function(oEvent) {
			var that = this;
			return that.context.service.content.getCurrentEditor()
				.then(function(oCurrentEditorInstance){
					if (oCurrentEditorInstance){
						if ( (typeof oCurrentEditorInstance.getName) === "function"){
							return oCurrentEditorInstance.getName()
								.then(function(sEditorType){
									if (sEditorType === "aceeditor"){
										var bVisible = oEvent.params.visible;
										if (bVisible) {
											return oCurrentEditorInstance.getSelection()
												.then(function(oSelection) {
													var sFileExtension = oSelection && oSelection.document && oSelection.document.getEntity().getFileExtension();
													if (that._isFileExtensionSupported(sFileExtension)) {
														return that._updateOutline(oEvent, oCurrentEditorInstance);
													}
												});
										}
									}
								});
						} else {
							throw new Error("Not aceeditor");
						}			    }
				})
				.fail(function(error){
					return Q();
				});
		},

		_onEditorChange: function(oEvent) {
			return this._updateOutline(oEvent, oEvent.params.owner);
		},

		/** search selected ui5 control in given selection
		 */
		_getSelectedDocument: function(aSelection) {
			var oDoc = null;
			aSelection.map(function(sel) {
				if (sel && sel.document) {
					oDoc = sel.document;
				}
			});
			return oDoc;
		},

		_onVisibilityChanged: function(oEvent) {
			if (!oEvent.params.visible) {
				this._oDocument = null;
			}
		},

		/** selection changed event params
		 */
		getSelection: function() {
			return [
				{
					document: this._oDocument,
					control: this._oControl
				}
			];
		},

		/**
		 */
		_onEditorClose: function() {
			this._detachAll();
			this._oDocument = null;
			this._oEditor = null;
		},
		cleanStack: function(node, context) {
			if (node.type === "FunctionDeclaration" || node.type === "FunctionExpression" || node.type === "ObjectExpression") {
				context.objHierarchyStack.pop();
			}
		},

		visitor: function(node, context) {
			if (context.errorLine) {
				if (node.loc.start.line > context.errorLine) {
					return false;
				}
			}

			var oElementTypes = {
				VAR: "var",
				OBJECT: "object",
				FUNCTION: "function"
			};

			switch (node.type) {
				case "Program":
					programHandler(node, context);
					return true;
				case "VariableDeclaration":
					variableDeclarationHandler(node, context);
					return true;
				case "FunctionDeclaration":
				case "FunctionExpression":
					functionHandler(node, context);
					return true;
				case "ObjectExpression":
					objectExpressionHandler(node, context);
					return true;
				case "Literal":
				case "Callee":
				case "ArrayExpression":
				case "NewExpression":
				case "UnaryExpression":
				case "BinaryExpression":
				case "UpdateExpression":
				case "YieldExpression":
				case "ComprehensionExpression":
				case "GeneratorExpression":
				case "GraphExpression":
				case "GraphIndexExpression":
				case "AssigmentExpression":
				case "LetExpression":
				case "CondinitionalExpression":
				case "EmptyStatement":
					return false;
				default:
					return true;
			}

			function programHandler(programNode, context) {
				if (programNode.errors) {
					if (programNode.errors.length > 0) {
						context.errorLine = programNode.errors[0].lineNumber;
					}
				}
			}

			function variableDeclarationHandler(node, context) {

				if (node.declarations) {
					node.declarations.forEach(function(declarator) {
						if (declarator.init) {
							switch (declarator.init.type) {
								case "ObjectExpression":
									var JSONElement = createOutlineElement(oElementTypes.OBJECT, declarator.id.name, declarator.loc);
									var elementKey = generateKeyFromLoc(declarator.init.loc);
									context.child2ParentMapping[elementKey] = {
										"JSONElement": JSONElement
									};
									break;
								case "FunctionExpression":
									var JSONElement = createOutlineElement(oElementTypes.FUNCTION, getFunctionName(declarator.init, declarator.id.name),
										declarator.loc);
									var elementKey = generateKeyFromLoc(declarator.init.loc);
									context.child2ParentMapping[elementKey] = {
										"JSONElement": JSONElement
									};
									break;
								default:
									var JSONElement = createOutlineElement(oElementTypes.OBJECT, declarator.id.name, declarator.loc);
									updateContext(declarator, context, JSONElement);
									break;
							}
						} else {
							var JSONElement = createOutlineElement(oElementTypes.OBJECT, declarator.id.name, declarator.loc);
							updateContext(declarator, context, JSONElement);
						}

					});
				}
			}

			function objectExpressionHandler(node, context) {

				var nodeKey = generateKeyFromLoc(node.loc);
				var nodeDetails = context.child2ParentMapping[nodeKey];
				var ObjJSONElement;
				if (!nodeDetails) {
					ObjJSONElement = createOutlineElement(oElementTypes.OBJECT, "object{}", node.loc);
				} else {
					ObjJSONElement = nodeDetails.JSONElement;
				}
				updateContext(node, context, ObjJSONElement);
				context.objHierarchyStack.push(ObjJSONElement);

				if (node.properties) {
					node.properties.forEach(function(property) {
						if (property.value) {
							var propName = (property.key.name ? property.key.name : property.key.value);
							switch (property.value.type) {
								case "FunctionExpression":
								case "ObjectExpression":
									var propJSONElement = createOutlineElement(((property.value.type === "FunctionExpression") ? oElementTypes.FUNCTION :
										oElementTypes.OBJECT), ((property.value.type === "FunctionExpression") ? getFunctionName(property.value, propName) :
										propName), property.key.loc);
									var elementKey = generateKeyFromLoc(property.value.loc);
									context.child2ParentMapping[elementKey] = {
										"JSONElement": propJSONElement
									};
									break;
								default:
									var propJSONElement = createOutlineElement(oElementTypes.OBJECT, propName, property.key.loc);
									updateContext(property.value, context, propJSONElement);
									break;

							}
						}
					});
				}

			}

			function functionHandler(node, context) {
				var nodeKey = generateKeyFromLoc(node.loc);
				var nodeDetails = context.child2ParentMapping[nodeKey];
				var ObjJSONElement;
				if (!nodeDetails) {
					var name = getFunctionName(node);
					ObjJSONElement = createOutlineElement(oElementTypes.FUNCTION, name, node.loc);
				} else {
					ObjJSONElement = nodeDetails.JSONElement;
				}
				updateContext(node, context, ObjJSONElement);
				context.objHierarchyStack.push(ObjJSONElement);
			}

			function getFunctionName(node, functionName) {

				var name;
				if (!node.id) {
					name = (functionName ? functionName : "function");
				} else {
					name = node.id.name;
				}
				name += "(";

				var numOfParams = node.params.length;
				for (var i = 0; i < numOfParams; i++) {
					name += node.params[i].name;
					if (i < numOfParams - 1) {
						name += ",";
					}
				}
				name += ")";
				return name;
			}

			function generateKeyFromLoc(loc) {
				return loc.start.line + "_" + loc.start.column + "_" + loc.end.line + "_" + loc.end.column;
			}

			function updateContext(node, context, JSONElement) {
				// Check if the current node is a child
				var nodeKey = generateKeyFromLoc(node.loc);
				var nodeDetails = context.child2ParentMapping[nodeKey];

				// find the JSON for the node
				var nodeJson;
				if (nodeDetails !== undefined && nodeDetails.JSONElement !== undefined) {
					nodeJson = nodeDetails.JSONElement;
				} else {
					nodeJson = JSONElement;
				}

				// add to outline or to existing element
				if (context.objHierarchyStack.length < 1) {
					nodeJson.level = 1;
					context.outlineJSON.push(nodeJson);

				} else {
					var parent = context.objHierarchyStack[context.objHierarchyStack.length - 1];
					if (!parent.elements) {
						parent.elements = [];
					}
					nodeJson.level = parent.level + 1;
					parent.elements.push(nodeJson);
				}
			}

			function createOutlineElement(type, name, loc) {
				return {
					"type": type,
					"name": name,
					"startRow": loc.start.line,
					"startColumn": loc.start.column,
					"endRow": loc.end.line,
					"endColumn": loc.end.column
				};
			}

		}

	});

	return JSOutline;
});
