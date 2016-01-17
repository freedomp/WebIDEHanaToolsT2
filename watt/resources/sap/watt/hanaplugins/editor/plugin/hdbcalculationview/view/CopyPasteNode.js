
/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/

define([
        "../util/ResourceLoader",
        "../viewmodel/ModelProxyResolver",
        "../base/modelbase",
        "../viewmodel/commands",
        "./CalcViewEditorUtil",
        "../viewmodel/model"
    ],
	function(ResourceLoader, ModelProxyResolver, modelbase, commands, CalcViewEditorUtil, model) {
		var resourceLoader = new ResourceLoader("/sap/hana/ide/editor/plugin/analytics");
		var CopyPasteNode = function(parameter) {
			this.model = parameter.model;
			this.editor = parameter.editor;
			this.undoManager = parameter.undoManager;
			this.columnView = parameter.columnView;
			this.executableCommands = [];
			this.copyName = null;

		};

		CopyPasteNode.prototype = {
			_execute: function(command) {
				try {
					return this.model.viewModel.$getUndoManager().execute(command);
				} finally {

				}
			},
			copyNode: function(editor) {
				var that = this;
				if (editor.selectedSymbols.length === 1) {
					var selectedSymbol = editor.selectedSymbols[0];
					if (selectedSymbol.viewNodeName) {
						var copyNode = editor.model.viewModel.columnView.viewNodes.get(selectedSymbol.viewNodeName);
						if (copyNode.isDefaultNode()) {
							that.copyName = null;
						} else {
							that.copyName = copyNode.name;
						}
						that.model.copyName = copyNode.name;
						that.model.xCopy = copyNode.layout.xCoordinate;
						that.model.yCopy = copyNode.layout.yCoordinate;
					}
				}
			},
			pasteNode: function() {
				var that = this;
				var copyName = that.model.copyName;
				if (copyName !== null) {
					that.viewnodeCopy(copyName);
					that._execute(new modelbase.CompoundCommand(that.executableCommands));
				}
				that.model.copyName = null;
			},
			viewnodeCopy: function(viewNodeName) {
				var that = this;
				that.elementNames = [];
				var copyNode = that.columnView.viewNodes.get(viewNodeName);
				if (copyNode !== undefined) {
					var nodeName = copyNode.name + "_copy";
					var rename = true;
					var k = 1;
					var nodeRename = nodeName;
					while (rename) {
						if ((that.columnView.viewNodes.get(nodeRename)) !== undefined) {
							nodeRename = nodeName + k;
							k++;
						} else {
							rename = false;
						}
					}
					nodeName = nodeRename;
					var attributes = {
						objectAttributes: {
							name: nodeName,
							type: copyNode.type
						},
						layoutAttributes: {
							expanded: true,
							xCoordinate: that.model.viewModel.columnView.x - copyNode.layout.xCoordinate + that.model.xCopy - 580,
							yCoordinate: that.model.viewModel.columnView.y + copyNode.layout.yCoordinate - that.model.yCopy - 30
						}
					};
					var createViewNodeCommand = new commands.CreateViewNodeCommand(attributes);
					that.executableCommands.push(createViewNodeCommand);
                    var inputKeyGen=0;
					copyNode.inputs.foreach(function(source) {
						var inputSource = source.getSource();
						var par = undefined;
						var inputName;
						if (inputSource.type === "JoinNode" || inputSource.type === "Union" || inputSource.type === "Projection" || inputSource.type ===
							"Aggregation" || inputSource.type === "Rank") {
							that.viewnodeCopy(inputSource.name);
							 inputName = inputSource.name + "_copy";
							var irename = true;
							var m = 1;
							var inodeRename = inputName;
							while (irename) {
								if ((that.columnView.viewNodes.get(inodeRename)) !== undefined) {
									inodeRename = inputName + m;
									m++;
								} else {
									irename = false;
								}
							}

							inputName = inodeRename;
						} else {
							par = {
								name: inputSource.name,
								id: inputSource.id,
								packageName: inputSource.packageName,
								physicalSchema: inputSource.physicalSchema,
								schemaName: inputSource.schemaName,
								type: inputSource.type
							};
							inputName = inputSource.name;
						}

						that.executableCommands.push(new commands.CreateInputCommand(nodeName, inputName, par));

						var key = inputKeyGen++;
						source.mappings.foreach(function(maping) {
							that.copyElements(maping, nodeName, key);
						});

						if (copyNode.type === "JoinNode") {
							copyNode.joins.foreach(function(join) {
								that.joinCopy(join, nodeName);
							});
						}

					});
					copyNode.elements.foreach(function(element) {
						that.calColumnCopy(element, nodeName);
					});

					if (copyNode.filterExpression !== undefined) {
						that.copyFilterExpression(nodeName, copyNode);
					}
				}
			},

			copyElements: function(maping, newNodeName, inputKey) {
				var that = this;

				if (maping.targetElement !== undefined && maping.sourceElement !== undefined) {
					var elementAttributes = CalcViewEditorUtil.createModelForElementAttributes(maping.sourceElement);
					//	elementAttributes.objectAttributes.name = maping.targetElement.name
					elementAttributes.objectAttributes.name = maping.targetElement.name;
					elementAttributes.objectAttributes.label = maping.targetElement.name;
					//	that.elementNames.push(elementAttributes.objectAttributes.name);
					elementAttributes.objectAttributes.transparentFilter = maping.targetElement.transparentFilter;
					elementAttributes.objectAttributes.keep = maping.targetElement.keep;
					elementAttributes.mappingAttributes = {
						sourceName: maping.sourceElement.name,
						targetName: elementAttributes.objectAttributes.name,
						type: maping.type
					};
					elementAttributes.inputKey = inputKey;
					elementAttributes.input = this.input;
					var command = new commands.AddElementCommand(newNodeName, elementAttributes);
					that.executableCommands.push(command);

				}

			},
			joinCopy: function(join, newNodeName) {
				var that = this;
				for (var i = 0; i < join.leftElements.count(); i++) {
					var joinAttributes = {
						objectAttributes: {
							joinType: join.type
						},
						leftInput: join.leftInput,
						rightInput: join.rightInput,
						leftColumn: join.leftElements.getAt(i),
						rightColumn: join.rightElements.getAt(i)
					};
					that.executableCommands.push(new commands.CreateJoinCommand(newNodeName, joinAttributes));
				}
			},
			copyFilterExpression: function(nodename, copyNode) {
				var that = this;
				var filterAttr = {
					name: nodename,
					type: copyNode.type,
					filterExpression: {
						formula: copyNode.filterExpression.formula,
						expressionLanguage: copyNode.filterExpression.expressionLanguage
					},
					endUserTexts: copyNode.endUserTexts
				};
				that.executableCommands.push(new commands.ChangeViewNodeCommand(nodename, filterAttr));

			},
			calColumnCopy: function(element, newNodeName) {
				var that = this;
				if (element.calculationDefinition !== undefined) {
					var elementAttributes = {
						objectAttributes: {
							name: element.name,
							aggregationBehavior: element.aggregationBehavior,
							drillDownEnablement: element.drillDownEnablement
						},
						calculationAttributes: {
							expressionLanguage: element.calculationDefinition.expressionLanguage,
							formula: element.calculationDefinition.formula
						},
						typeAttributes: {
							length: "1",
							primitiveType: "VARCHAR",
							semanticType: "empty"
						}
					};
					var command = new commands.AddElementCommand(newNodeName, elementAttributes);
					that.executableCommands.push(command);
				}
			}
		};
		return CopyPasteNode;
	});

