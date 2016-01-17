/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../CDSEditorUtil",
        "../../model/model",
        "./model",
        "./ui",
        "./galilei"
        ], function(ResourceLoader, CDSEditorUtil, viewmodel) {
	"use strict";

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");
	var TRANSPARENT_IMG =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=";

	var DiagramModelBuilder = function(viewModel, context) {
		this.resource = new sap.galilei.model.Resource();
		var oModel = new sap.watt.hanaplugins.editor.plugin.cds.diagram.GalileiModel(this.resource);
		oModel.viewModel = viewModel;
		this._diagram = new sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.Diagram(this.resource, {
			model: oModel
		});
		this._context = context;
		this._viewModel = viewModel;
		this.selectedNode = this._viewModel.root;
		this.buildDiagram();
	};

	DiagramModelBuilder.prototype = {

			MODEL_PACKAGE: "sap.watt.hanaplugins.editor.plugin.cds.diagram",
			DIAGRAM_PACKAGE: "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui",

			getDiagram: function() {
				return this._diagram;
			},

			getModel: function() {
				return this._diagram.model;
			},

			createObject: function(packageName, className, param) {
				var cls = sap.galilei.model.getClass(packageName + "." + className);
				this.resource.applyUndoableAction(function() { // to improve performance - using undoable action
					if (cls) {
						cls = cls.create(this.resource, param);
					}
				}, "createObject", true);
				if (cls) {
					return cls;
				}
			},

			buildDiagram: function() {
				var that = this;
				var oObject = this.selectedNode;
				if (oObject instanceof viewmodel.Entity) {
					that.createEntity(oObject);
				} else if (oObject instanceof viewmodel.Context) {
					oObject.children.foreach(function(child) {
						if (child instanceof viewmodel.Entity) {
							that.createEntity(child);
						} else if (child instanceof viewmodel.Context) {
							that.createContext(child);
						} else if (child instanceof viewmodel.View) {
							that.createView(child);
						}else if (child instanceof viewmodel.Type) {
							that.createStructure(child);
						}
					});
					that.buildAssociationSymbols(oObject);
				}

				//TODO: now build symbols for external artifacts
				/*var _entities = this._viewModel._entities;
				if(_entities){
					for(var i = 0; i < _entities._keys.length; i++){
						var resolvedObject = _entities.getAt(i);
						//create read only shape based on object type
					}
				}*/
			},

			buildAssociationSymbols: function(oObject) {
				var that = this;
				oObject.children.foreach(function(child) {
					if (child instanceof viewmodel.Entity) {
						child.elements.foreach(function(element) {
							if (element instanceof viewmodel.Association) {
								that.createAssociation(element, child);
							}
						});
					} else if (child instanceof viewmodel.Context) {
						that.buildAssociationSymbols(child);
					}
				});
			},

			createView: function(view) {
				var viewName = view.name;
				var oView = this.createObject(this.MODEL_PACKAGE, "View", {
					name: viewName,
					displayName: viewName,
					cdsObject: view
				});

				var oViewSymbol = this.createViewSymbol({
					object: oView
				});
				this.getDiagram().symbols.push(oViewSymbol);
				return oViewSymbol;
			},

			createViewSymbol: function(param) {
				var oView = param.object;
				param.isAdjustToContent = true;
				param.isKeepSize = true;
				var oViewSymbol = this.createObject(this.DIAGRAM_PACKAGE, oView.classDefinition.name + "Symbol", param);
				return oViewSymbol;
			},

			createContext: function(context) {

				this.parentOffsetX = undefined;
				if (this.xValue) {
					this.xValue += 250;
				} else {
					this.xValue = 50;
				}

				this.parentOffsetY = undefined;
				if (this.yValue) {
					this.yValue += 50;
				} else {
					this.yValue = 50;
				}

				var contextName = context.name;
				var oContext = this.createObject(this.MODEL_PACKAGE, "Context", {
					name: contextName,
					displayName: contextName,
					cdsObject: context
				});

				this.createChildren(context, oContext);

				var oContextSymbol = this.createContextSymbol({
					object: oContext,
					x: this.xValue,
					y: this.yValue
				});

				this.getDiagram().symbols.push(oContextSymbol);

				return oContextSymbol;
			},

			createStructure: function(structure) {

				var structureName = structure.name;
				var oStructure = this.createObject(this.MODEL_PACKAGE, "Structure", {
					name: structureName,
					displayName: structureName,
					cdsObject: structure
				});

				this.createChildren(structure, oStructure);

				var oStructureSymbol = this.createStructureSymbol({
					object: oStructure
				});

				this.getDiagram().symbols.push(oStructureSymbol);

				return oStructureSymbol;
			},

			createContextSymbol: function(param) {
				var oContext = param.object;
				param.isAdjustToContent = true;
				var oContextSymbol = this.createObject(this.DIAGRAM_PACKAGE, oContext.classDefinition.name + "Symbol", param);
				oContextSymbol.getOrCreateShape();
				return oContextSymbol;
			},

			createStructureSymbol: function(param) {
				var oContext = param.object;
				param.isAdjustToContent = true;
				var oContextSymbol = this.createObject(this.DIAGRAM_PACKAGE, oContext.classDefinition.name + "Symbol", param);
				oContextSymbol.getOrCreateShape();
				return oContextSymbol;
			},

			createChildren: function(object, oObject) {
				var children;
				if(object instanceof viewmodel.Type){
					children = object.elements;
				} else if(object instanceof viewmodel.Context){
					children = object.children;
				}

				if(children){
					for (var idx = 0; idx < children.size(); idx++) {
						var child = children.getAt(idx);
						var props = {};
						this.createChild(child, oObject, props);
					}
				}
			},

			createChild: function(child, oObject, props) {
				var oColumn = this.createObject(this.MODEL_PACKAGE, "Child", {
					name: child.name
				});
				this.setChildProperties(oColumn, child);
				oObject.columns.push(oColumn);
				return oColumn;
			},

			setChildProperties: function(column, child) {
				var typeIcon = TRANSPARENT_IMG;

				if (child instanceof viewmodel.Context) {
					typeIcon = resourceLoader.getImagePath("Constant.png");
				} else if (child instanceof viewmodel.Entity) {
					typeIcon = resourceLoader.getImagePath("Table.png");
				} else if (child instanceof viewmodel.Type) {
					typeIcon = resourceLoader.getImagePath("datatypes/StructureType.png");
				}
				column.name = child.name;
				column.displayName = child.name;
				column.typeIcon = typeIcon;
			},

			createEntity: function(entity, isReadOnly) {
				this.parentOffsetX = undefined;
				if (this.xValue) {
					this.xValue += 250;
				} else {
					this.xValue = 50;
				}

				this.parentOffsetY = undefined;
				if (this.yValue) {
					this.yValue += 50;
				} else {
					this.yValue = 50;
				}

				var entityName = entity.name;
				var oEntity = this.createObject(this.MODEL_PACKAGE, "Entity", {
					name: entityName,
					displayName: entityName,
					cdsObject: entity
				});

				this.createColumns(entity, oEntity, isReadOnly);

				var oEntitySymbol = this.createEntitySymbol({
					object: oEntity,
					x: this.xValue,
					y: this.yValue,
					imagePath: resourceLoader.getImagePath("Table.png"),
					isReadOnly: isReadOnly
				});

				this.getDiagram().symbols.push(oEntitySymbol);

				return oEntitySymbol;
			},

			createEntitySymbol: function(param) {
				var oEntity = param.object;
				param.isAdjustToContent = true;
				var oEntitySymbol = this.createObject(this.DIAGRAM_PACKAGE, oEntity.classDefinition.name + "Symbol", param);
				oEntitySymbol.getOrCreateShape();
				return oEntitySymbol;
			},

			createAssociation: function(association, parentEntity) {
				var that = this;
				var targetEntitySymbol = this.getSymbolFromDiagram(association.targetEntityName, "EntitySymbol");
				var sourceEntitySymbol = this.getSymbolFromDiagram(parentEntity.name, "EntitySymbol");
				var isExternalAsso = false; //targetEntitySymbol.isReadOnly || sourceIsContextSymbol;

				var sourceAssociationRowSymbol;
				var sourceIsContextSymbol = false;
				var targetIsContextSymbol = false;

				if (sourceEntitySymbol) {
					if (this.isContextSymbol(sourceEntitySymbol)) {
						sourceIsContextSymbol = true;
						isExternalAsso = true;
						sourceAssociationRowSymbol = sourceEntitySymbol;
					} else if (!this.isRowSymbol(sourceEntitySymbol)) {
						//when sourceEntitySymbol is NOT a row symbol,but is rather an Entity Symbol then find the source association row symbol inside that entity symbol
						for (var i = 0; i < sourceEntitySymbol.symbols.length; i++) {
							var childSymbol = sourceEntitySymbol.symbols.get(i);
							if (this.isRowSymbol(childSymbol) && childSymbol.object.name === association.name) {
								sourceAssociationRowSymbol = childSymbol;
								break;
							}
						}
					} else {
						sourceAssociationRowSymbol = sourceEntitySymbol;
					}
				}

				if (!targetEntitySymbol) {
					//this means that entity is outside of current context. Create a readonly shape for external entity
					var availableEntities = CDSEditorUtil.getEntitiesForAssociating(this._viewModel.root, parentEntity, association);
					var targetEntity;
					for (var i = 0; i < availableEntities.length; i++) {
						var currObj = availableEntities[i];
						if (currObj.isTargetEntity) {
							targetEntity = currObj.entity;
							break;
						}
					}

					//create read only entity now
					if (targetEntity) {
						//create a read only entity ONLY IF--> 
						//1. source symbol is NOT a context and 
						//2. target entity is at a higher level than source entity
						var currentSelectedNodeFullPath = CDSEditorUtil.getFullPathFromCDSObject(this.selectedNode);
						var depth_currentSelectedNode = (currentSelectedNodeFullPath.match(/\//g) || []).length + 1; //adding 1 to the current selected node because the drill down has already happened

						var targetEntityFullPath = CDSEditorUtil.getFullPathFromCDSObject(targetEntity);
						var depth_TargetEntity = (targetEntityFullPath.match(/\//g) || []).length; //find occurences of "/" in the fullpath

						var sourceEntityFullPath = CDSEditorUtil.getFullPathFromCDSObject(parentEntity);
						var depth_SourceEntity = (sourceEntityFullPath.match(/\//g) || []).length;

						var generationGap = depth_currentSelectedNode - depth_TargetEntity;
						if (sourceIsContextSymbol && generationGap > 0) {
							//then do NOT create read only entity and mark associations iwth a dotted line
							isExternalAsso = true;
						} else {
							if (depth_SourceEntity >= depth_TargetEntity) {
								targetEntitySymbol = this.createEntity(targetEntity, true); //read only entity

								//TODO: confirm---> create asso symbols starting from readonly entities 
								/*targetEntity.elements.foreach(function(element) {
							if (element instanceof viewmodel.Association) {
								that.createAssociation(element, targetEntity);
							}
						});*/
							}
						}
					}
				}

				if (this.isContextSymbol(targetEntitySymbol)) {
					targetIsContextSymbol = true;
				}

				if (targetEntitySymbol && sourceAssociationRowSymbol) {
					var oAssociation = this.createObject(this.MODEL_PACKAGE, "Association", {
						name: association.name,
						displayName: association.name,
						targetEntity: association.targetEntity,
						cdsObject: association,
						source: sourceAssociationRowSymbol.object,
						sourceEntity: parentEntity,
						target: targetEntitySymbol.object,
						cardinality: association.cardinality,
						srcCardinality: association.srcCardinality
					});

					if (sourceIsContextSymbol || targetIsContextSymbol) {
						isExternalAsso = true;
					}

					var isContextSelfAssociated = false;
					if(sourceIsContextSymbol && targetIsContextSymbol && (targetEntitySymbol === sourceAssociationRowSymbol)){
						isContextSelfAssociated = true;
					}

					//if source AND target symbols are same context symbol, then do NOT show association symbol; self association should only be shown for entity symbol
					if(!isContextSelfAssociated){
						var oAssociationSymbol = this.createAssociationSymbol({
							object: oAssociation,
							sourceSymbol: sourceAssociationRowSymbol,
							targetSymbol: targetEntitySymbol,
							isExternal: isExternalAsso
						});
						this.getDiagram().symbols.push(oAssociationSymbol);
					}
				}
			},

			createAssociationSymbol: function(param) {
				var oAssociation = param.object;
				param.isAdjustToContent = true;
				var oAssociationSymbol = this.createObject(this.DIAGRAM_PACKAGE, oAssociation.classDefinition.name + "Symbol", param);
				oAssociationSymbol.getOrCreateShape();
				return oAssociationSymbol;
			},

			isEntitySymbol: function(oSymbol) {
				return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.EntitySymbol");
			},

			isContextSymbol: function(oSymbol) {
				return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.ContextSymbol");
			},

			isRowSymbol: function(oSymbol) {
				return sap.galilei.model.isInstanceOf(oSymbol, "sap.watt.hanaplugins.editor.plugin.cds.diagram.ui.RowSymbol");
			},

			getSymbolFromDiagram: function(symbolName, symbolType) {
				//extract only the entity name out of fullnamespace
				symbolName = symbolName.substring(symbolName.lastIndexOf(".") + 1);

				var allSymbols = this.getDiagram().symbols;
				var requiredSymbol;
				for (var i = 0; i < allSymbols.length; i++) {
					var currentSymbol = allSymbols.get(i);
					if (symbolType === "EntitySymbol") {
						if (this.isEntitySymbol(currentSymbol) && currentSymbol.object.name === symbolName) {
							requiredSymbol = currentSymbol;
							break;
						} else if (this.isContextSymbol(currentSymbol)) {
							var children = currentSymbol.symbols;
							for (var j = 0; j < children.length; j++) {
								var childSymbol = children.get(j);
								if (childSymbol.object.name === symbolName) {
									//if you find the required symbol inside of a context shape, then return the containing context shape as source symbol
									requiredSymbol = currentSymbol;
									break;
								}
							}
							if (requiredSymbol) {
								break;
							}
						} else {
							continue;
						}
					} else if (symbolType === "ContextSymbol") {
						if (this.isContextSymbol(currentSymbol) && currentSymbol.object.name === symbolName) {
							requiredSymbol = currentSymbol;
							break;
						} else {
							continue;
						}
					}
				}

				return requiredSymbol;
			},

			getCorrectSymbol: function(currentSymbol, symbolName, symbolType) {
				var requiredSymbol;

				return requiredSymbol;
			},

			updateTable: function(oEntitySymbol, input) {
				if (oEntitySymbol && input) {
					var oEntity = oEntitySymbol.object;
					oEntity.columns.clear();
					this.createColumns(input, oEntity);
				}
				return oEntitySymbol;
			},

			updateColumns: function(oEntitySymbol, input) {
				if (oEntitySymbol && input) {
					var oEntity = oEntitySymbol.object;
					for (var i = 0; i < input.elements.count(); i++) {
						var element = input.elements.getAt(i);
						var column = oEntity.columns.get(i);
						this.setColumnProperties(column, element);
					}
				}
				return oEntitySymbol;
			},

			createColumns: function(entity, oEntity, isReadOnly) {
				for (var idx = 0; idx < entity.elements.size(); idx++) {
					var element = entity.elements.getAt(idx);
					var props = {};
					this.createColumn(element, oEntity, props, isReadOnly);
				}
			},

			setColumnProperties: function(column, element, isReadOnly) {
				var dataTypeIcon = resourceLoader.getImagePath("Column.png");
				var datatype;
				if(element.associationKeys){
					//this means it is an association
					datatype = "Association";
				} else if (element.inlineType !== undefined) {
					if (element.inlineType.primitiveType !== undefined) {
						datatype = element.inlineType.primitiveType;
					} else if (element.inlineType.structureType !== undefined) {
						datatype = "Structure";
					} else if (element.inlineType.externalStructureType !== undefined) {
						datatype = "Structure";
					} else{
						//error during import of external struct type due to using clause not present OR duplicate using clause present
						datatype = "Unknown";
					}
				} else{
					//this means external struct type
					datatype = "Structure";
				}

				dataTypeIcon = CDSEditorUtil.getDataTypeImage(datatype);

				column.name = element.name;
				column.displayName = element.name;
				column.dataTypeIcon = dataTypeIcon;
				column.isReadOnly = isReadOnly;

				if (element.key) {
					column.keyIcon = resourceLoader.getImagePath("KeyAttribute.png");
				}

			},

			createColumn: function(element, oEntity, props, isReadOnly) {

				var oColumn = this.createObject(this.MODEL_PACKAGE, "Column", {
					name: element.name,
					cdsObject: element
				});
				this.setColumnProperties(oColumn, element, isReadOnly);
				oEntity.columns.push(oColumn);
				return oColumn;
			},

			dispose: function() {
				/*var oModel = this._diagram.model;
			if (oModel) {
				oModel = null;
			}*/
			}

	};

	return DiagramModelBuilder;
});