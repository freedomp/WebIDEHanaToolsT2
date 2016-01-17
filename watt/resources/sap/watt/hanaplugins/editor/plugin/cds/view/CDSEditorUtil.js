/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(
		[ "../util/ResourceLoader", "../model/model",
		  "commonddl/commonddlNonUi" ],

		  function(ResourceLoader, viewmodel, commonddl) {
			"use strict";

			var primitiveTypesLength = {
					"ALPHANUM" : {
						length : 127
					},
					"DECIMAL" : {
						length : 34,
						scale : 34
					},
					"FLOAT" : {
						length : 53
					},
					"NVARCHAR" : {
						length : 5000
					},
					"SHORTTEXT" : {
						length : 5000
					},
					"VARCHAR" : {
						length : 5000
					},
					"VARBINARY" : {
						length : 5000
					}
			};

			var resourceLoader = new ResourceLoader(
			"/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");
			var INVALID_RESOURCE_CHARACTERS = [ '\\', '/', ':', '*', '?', '"',
			                                    '<', '>', '|', '.', '&', ';', '\'', '$', '%', ',', '!',
			                                    '#', '+', '~', '`' ];
			return {
				checkValidUnicodeChar : function(string) {

					for (var i = 0; i < string.length; i++) {
						var ch = string.charAt(i);
						if (ch === ' ' || ch === '\n') {
							return false;
						}
						for (var j = 0; j < INVALID_RESOURCE_CHARACTERS.length; j++) {
							var invalidCh = INVALID_RESOURCE_CHARACTERS[j];
							if (invalidCh === ch) {
								return false;
							}
						}
					}
					return true;
				},

				getInvalidUnicodeCharacters : function() {
					var invalidCharString = "";
					for (var i = 0; i < INVALID_RESOURCE_CHARACTERS.length; i++) {
						invalidCharString = invalidCharString
						+ INVALID_RESOURCE_CHARACTERS[i];
						if (i !== INVALID_RESOURCE_CHARACTERS.length - 1) {
							invalidCharString = invalidCharString.concat(' ');
						}
					}
					return invalidCharString;
				},

				createModelForElement : function(element, root, parentEntity) {
					if (element) {
						var elemModel;
						var dataTypeCategories = this.getDataTypeCategories();
						elemModel = {
								name : element.name,
								oldName : element.name,
								primitiveType : element.inlineType ? element.inlineType.primitiveType
										: undefined,
										structureType : element.inlineType ? element.inlineType.structureType
												: undefined,
												externalStructureType : element.inlineType ? element.inlineType.externalStructureType
														: undefined,
														length : element.inlineType ? element.inlineType.length
																: undefined,
																scale : element.inlineType ? element.inlineType.scale
																		: undefined,
																		dataTypeCategories : dataTypeCategories,
																		keyElement : element.key,
																		not : element.not,
																		defaultValue : element.defaultValue
						};

						/*
						 * if(element.externalType){ elemModel.primitiveType =
						 * undefined; elemModel.structureType =
						 * element.externalType.structureType; } else
						 * if(element.inlineType){
						 * if(element.inlineType.primitiveType){
						 * elemModel.primitiveType =
						 * element.inlineType.primitiveType; } else{
						 * elemModel.primitiveType = undefined; }
						 * 
						 * if(element.inlineType.structureType){
						 * elemModel.structureType =
						 * element.inlineType.structureType; }else{
						 * elemModel.structureType = undefined; } } else{
						 * elemModel.primitiveType = undefined;
						 * elemModel.structureType = undefined; }
						 */
						var seleDataTypeCat;
						var dataTypes;
						if (elemModel.primitiveType === undefined) {
							dataTypes = this.getStructureDataTypes(root);
							/*
							 * dataTypes.push({ datatype: "Other..",
							 * datatypePath : "Other.." });
							 */
							seleDataTypeCat = "Structure Type";
						} else {
							dataTypes = this.getPrimitiveDataTypes();
							seleDataTypeCat = "Primitive Type";
						}

						elemModel.dataTypes = dataTypes;
						elemModel.selectedDataTypeCategory = seleDataTypeCat;

						return elemModel;
					}
				},

				createModelForAssociation : function(association, root,
						currentEntity) {
					if (association) {
						var allSrcCardinality = this.getSrcCardinality();
						var allCardinality = this.getCardinality();
						var availableEntities = this.getEntitiesForAssociating(
								root, currentEntity, association); // currently
						// this
						// function
						// only
						// fetches
						// intenal
						// entities
						// add the last dummy value to be shown in dropdown box
						// for find n add of external NTTs
						/*
						 * availableEntities.push({ entityName: "Other..",
						 * entityFullPath: "Other..", entity: undefined,
						 * isTargetEntity: false, attributes: [] });
						 */

						var attributes = [];
						if (association.isTargetExternal) {
							attributes = association.externalAttributes;
							/*
							 * if(association.associationKeys._keys.length ===
							 * 0){ attributes = association.externalAttributes; }
							 * else{
							 *  }
							 */
						} else {
							attributes = this
							.getAttributesForTargetEntity(availableEntities);
						}

						return {
							name : association.name,
							oldName : association.name,
							srcCardinalityArray : allSrcCardinality,
							selectedSrcCardinality : association.srcCardinality,
							cardinalityArray : allCardinality,
							selectedCardinality : association.cardinality,
							target : availableEntities,
							targetEntityName : association.targetEntityName,
							attributes : attributes,
							// selectedAttributes:
							// this._selectedAttributesArray,
							type : association.type,
							keys : association.associationKeys,
							onCondition : association.onCondition,
							operator : association.operator,
							sourceEntity : currentEntity,
							targetEntity : this.getSelectedTargetEntity(
									availableEntities,
									association.targetEntityName)
									// TODO: association is going to store target entity
									// proxy object, remove this logic
						};
					}
				},

				/**
				 * @Array this function should return all elements of the target
				 *        entity except unmanged associations inside it.
				 */
				getAttributesForTargetEntity : function(availableEntities) {
					var attr;
					for (var i = 0; i < availableEntities.length; i++) {
						var currEntity = availableEntities[i];
						if (currEntity.isTargetEntity) {
							attr = currEntity.attributes;
						}
					}
					return attr;
				},

				getUniqueNameForElement : function(string, entity, elementNames) {
					var name = this.normalizeString(string);
					var aliasName = name;
					var count = 0;
					var unique = false;
					while (elementNames && !unique) {
						unique = true;
						for (var i = 0; i < elementNames.length; i++) {
							if (elementNames[i] === aliasName) {
								count++;
								aliasName = name + "_" + count;
								unique = false;
								break;
							}
						}
					}
					while (entity.elements.get(aliasName)) {
						count++;
						aliasName = name + "_" + count;
					}

					return aliasName;
				},

				normalizeString : function(string) {
					string = string.replace(/\//g, "_");
					string = string.replace(/\@/g, "_");
					string = string.replace(/\ /g, "_");
					return string.replace(/\./g, "_");
				},

				getDataTypeCategories : function() {
					var dataTypeCategories = [ {
						typeCategory : "Primitive Type"
					}, {
						typeCategory : "Structure Type"
					} ];
					return dataTypeCategories;
				},

				getPrimitiveDataTypes : function() {
					var dataTypes = [ {
						datatype : "Binary"
					}, {
						datatype : "BinaryFloat"
					}, {
						datatype : "Boolean"
					}, {
						datatype : "Decimal"
					}, {
						datatype : "DecimalFloat"
					}, {
						datatype : "Integer"
					}, {
						datatype : "Integer64"
					}, {
						datatype : "LargeBinary"
					}, {
						datatype : "LargeString"
					}, {
						datatype : "LocalDate"
					}, {
						datatype : "LocalTime"
					}, {
						datatype : "String"
					}, {
						datatype : "UTCDateTime"
					}, {
						datatype : "UTCTimestamp"
					} ];
					return dataTypes;
				},

				isPrimitiveType : function(value) {
					var dataTypes = this.getPrimitiveDataTypes();
					for (var i = 0; i < dataTypes.length; i++) {
						if (dataTypes[i].datatype === value) {
							return true;
						}
					}
					return false;
				},

				isInternalStructuredType : function(root, value) {
					var isInternal = false;
					var structTypeArray = this.getStructureDataTypes(root);
					for (var i = 0; i < structTypeArray.length; i++) {
						var datatypePath = structTypeArray[i].datatypePath;
						var dotFulString = datatypePath.replace(/\//g, ".");
						var rootNameRemoved = dotFulString
						.substring(dotFulString.indexOf(".") + 1);

						if (rootNameRemoved === value.trim()) {
							isInternal = true;
							break;
						}
					}

					return isInternal;
				},

				getStructureDataTypes : function(root, structuredTypes) {
					if (!structuredTypes) {
						structuredTypes = [ {
							datatype : "",
							datatypePath : ""
						} ];
					}

					var childrenArtifacts = root.children;

					for (var j = 0; j < childrenArtifacts._keys.length; j++) {
						var child = childrenArtifacts.getAt(j);
						if (child instanceof viewmodel.Type) {
							structuredTypes.push({
								datatype : child.name,
								datatypePath : this
								.getFullPathFromCDSObject(child)
							});
						} else if (child instanceof viewmodel.Context) {
							this.getStructureDataTypes(child, structuredTypes);
						}

					}

					return structuredTypes;
				},

				getCardinality : function() {
					var cardinality = [ {
						cardinality : "[0..1]"
					}, {
						cardinality : "[0..*]"
					}, {
						cardinality : "[1..1]"
					}, {
						cardinality : "[1..*]"
					} ];
					return cardinality;
				},

				getSrcCardinality : function() {
					var cardinality = [ {
						cardinality : ""
					}, {
						cardinality : "1"
					}, {
						cardinality : "*"
					} ];
					return cardinality;
				},

				getEntitiesForAssociating : function(root, currentEntity,
						association, entitiesArray) {
					// currently only getting entities inside the current file
					var targetEntityName = association.targetEntityName;
					targetEntityName = targetEntityName
					.substring(targetEntityName.lastIndexOf(".") + 1); // extract
					// only
					// name
					// of
					// entity
					// from
					// the
					// relative
					// path
					if (!entitiesArray) {
						// add the first dummy value to be shown in dropdown box
						entitiesArray = [ {
							entityName : "",
							entityFullPath : "",
							entity : undefined,
							isTargetEntity : false
						} ];
					}

					var sourceEntityFullPath = this
					.getFullPathFromCDSObject(currentEntity);
					var childrenArtifacts = root.children;

					for (var j = 0; j < childrenArtifacts._keys.length; j++) {
						var child = childrenArtifacts.getAt(j);
						if (child instanceof viewmodel.Entity) {
							var entityFullPath = this
							.getFullPathFromCDSObject(child);
							var isTargetEntity = false;
							var attrArray = [];
							if (child.name === targetEntityName) {
								isTargetEntity = true;
								attrArray = this
								.getAvailableAttributesForTargetEntity(
										child, association);
							}
							// push data into array
							entitiesArray.push({
								entityName : child.name,
								entityFullPath : entityFullPath,
								entity : child,
								isTargetEntity : isTargetEntity,
								attributes : attrArray
							});
						} else if (child instanceof viewmodel.Context) {
							this.getEntitiesForAssociating(child,
									currentEntity, association, entitiesArray);
						}
					}

					return entitiesArray;
				},

				getAllEntityNames : function(root, allEntities) {
					if (!allEntities) {
						allEntities = [];
					}
					var childrenArtifacts = root.children;
					for (var j = 0; j < childrenArtifacts._keys.length; j++) {
						var child = childrenArtifacts.getAt(j);
						if (child instanceof viewmodel.Entity) {
							allEntities.push(child.name);
						} else if (child instanceof viewmodel.Context) {
							this.getAllEntityNames(child, allEntities);
						}
					}

					return allEntities;
				},

				getSelectedTargetEntity : function(availableEntities,
						selectedEntityName, selectedEntityFullPath) {
					var targetEntity;
					for (var i = 0; i < availableEntities.length; i++) {
						var current = availableEntities[i];
						if (current.entityName === selectedEntityName) {
							targetEntity = current.entity;
							break;
						} else if(current.entityFullPath === selectedEntityFullPath){ //TODO: remove equality check based on name and keep only based on fullpath. Change passed arguments in all called places
							targetEntity = current.entity;
							break;
						}
					}
					return targetEntity;
				},

				getAvailableAttributesForTargetEntity : function(
						selectedTargetEntity, association) {
					var availableAttributes = [];
					if (selectedTargetEntity) {
						var elements = selectedTargetEntity.elements;
						var associatedKeys = association.associationKeys;

						for (var i = 0; i < elements._keys.length; i++) {
							var keyName = "";
							var isSelected = false;
							var alias = "";
							var element = elements.getAt(i);
							var isElemAssociation = element.associationKeys ? true
									: false;
							var elementName = keyName = elements.getAt(i).name;

							if (associatedKeys) {
								for (var j = 0; j < associatedKeys._keys.length; j++) {
									var associatedKeyName = associatedKeys
									.getAt(j).name;
									if (associatedKeyName === elementName) {
										keyName = elementName;
										alias = associatedKeys.getAt(j).alias;
										isSelected = true;
										break;

									} else if (isElemAssociation) { // if
										// element
										// is an
										// associataion,
										// then find
										// if any
										// key in
										// that was
										// used as
										// key for
										// current
										// association
										for (var k = 0; k < element.associationKeys._keys.length; k++) {
											var key = element.associationKeys
											.getAt(k);
											var fullKeyName = element.name
											+ "." + key.name;
											if (associatedKeyName === fullKeyName) {
												keyName = fullKeyName;
												alias = associatedKeys.getAt(j).alias;
												isSelected = true;
												break;
											}
										}

									} else {
										keyName = elementName;
										alias = "";
										isSelected = false;
									}
								}
							}

							// this block is for adding all keys of the element
							// which is an association to list of avaoilable
							// attributes for target entity when no key sare
							// sleectd in current association
							if (isElemAssociation) {
								if (associatedKeys._keys.length === 0) {
									for (var k = 0; k < element.associationKeys._keys.length; k++) {
										var key = element.associationKeys
										.getAt(k);
										var fullKeyName = element.name + "."
										+ key.name;
										keyName = fullKeyName;
										alias = "";
										isSelected = false;

										availableAttributes.push({
											name : keyName,
											alias : alias,
											isSelected : isSelected,
											element : element
										});
									}
								} else {
									availableAttributes.push({
										name : keyName,
										alias : alias,
										isSelected : isSelected,
										element : element
									});
								}
							} else {
								if (!isElemAssociation) {
									availableAttributes.push({
										name : keyName,
										alias : alias,
										isSelected : isSelected,
										element : element
									});
								}
							}
						}
					}
					return availableAttributes;
				},

				_getSelectedAttributesFromAssociation : function(association) {
					var selectedAttributes = [];
					var associationKeys = association.associationKeys;
					if (associationKeys) {
						for (var i = 0; i < associationKeys._keys.length; i++) {
							selectedAttributes.push({
								name : associationKeys.getAt(i).name,
								alias : associationKeys.getAt(i).alias
							});
						}
					}
					return selectedAttributes;
				},

				getDataTypeImage : function(dataType) {
					if (dataType) {
						if (dataType === "String" || dataType === "LargeString") {
							return resourceLoader
							.getImagePath("datatypes/String.png");
						} else if (dataType === "Integer"
							|| dataType === "Integer64"
								|| dataType === "Decimal"
									|| dataType === "DecimalFloat") {
							return resourceLoader
							.getImagePath("datatypes/Numeric.png");
						} else if (dataType === "LocalDate") {
							return resourceLoader
							.getImagePath("datatypes/Date.png");
						} else if (dataType === "LocalTime"
							|| dataType === "UTCTimestamp") {
							return resourceLoader
							.getImagePath("datatypes/Time.png");
						} else if (dataType === "Binary"
							|| dataType === "LargeBinary"
								|| dataType === "BinaryFloat") {
							return resourceLoader
							.getImagePath("datatypes/Blob.png");
						} else if (dataType === "Boolean") {
							return resourceLoader
							.getImagePath("datatypes/Boolean.png");
						} else if (dataType === "UTCDateTime") {
							return resourceLoader
							.getImagePath("datatypes/DateTime.png");
						} else if (dataType === "Structure") {
							return resourceLoader
							.getImagePath("datatypes/StructureType.png");
						} else if (dataType === "Association") {
							return resourceLoader.getImagePath("Column.png");
						} else if (dataType === "Unknown") {
							return resourceLoader
							.getImagePath("datatypes/Unknown.png");
						} else {
							return resourceLoader
							.getImagePath("Highlight.png");
						}

					}
					return null;
				},

				isDateOrTime : function(dataType) {
					if (dataType === "DATE" || dataType === "TIME"
						|| dataType === "TIMESTAMP") {
						return true;
					}
					return false;
				},
				isNumaric : function(dataType) {
					if (dataType === "BIGINT" || dataType === "DECIMAL"
						|| dataType === "DOUBLE" || dataType === "FLOAT"
							|| dataType === "INTEGER" || dataType === "REAL"
								|| dataType === "SMALLDECIMAL"
									|| dataType === "SMALLINT"
										|| dataType === "TINYINT") {
						return true;
					}
					return false;
				},

				isString : function(dataType) {
					if (dataType === "VARCHAR" || dataType === "NVARCHAR"
						|| dataType === "SHORTTEXT" || dataType === "TEXT") {
						return true;
					}
					return false;
				},
				getPrimitiveTypeMaxLength : function(typeName) {
					var type = primitiveTypesLength[typeName];
					return type ? type.length : -1;
				},
				getPrimitiveTypeMaxScale : function(typeName) {
					var type = primitiveTypesLength[typeName];
					return type && type.scale ? type.scale : -1;
				},
				validateNumber : function(value) {
					var pattern = /^\d+$/;
					return pattern.test(value);
				},
				validateDataTypeLength : function(value, dataType) {
					if ((dataType === "DECIMAL" || dataType === "FLOAT")
							&& value === "") {
						return true;
					}
					var pattern = /^\d+$/;
					return pattern.test(value);
				},

				createModelForElementAttributes : function(element) {
					var attributes = {
							objectAttributes : {},
							typeAttributes : {}
					};
					if (element && element.inlineType) {
						attributes.typeAttributes.primitiveType = element.inlineType.primitiveType;
						attributes.typeAttributes.length = element.inlineType.length;
						attributes.typeAttributes.scale = element.inlineType.scale;
					}
					return attributes;
				},

				createModelForAssociationAttributes : function(association) {
					var attributes = {
							name : "",
							cardinality : ""
					};

					return attributes;
				},

				/*
				 * getEntity: function(parent, entityName) { var that = this;
				 * var entity; if (parent instanceof viewmodel.Entity &&
				 * parent.name === entityName) { entity = parent; } else if
				 * (parent instanceof viewmodel.Context) {
				 * parent.children.foreach(function(child) { if (child
				 * instanceof viewmodel.Entity && child.name === entityName) {
				 * entity = child; } else if (child instanceof
				 * viewmodel.Context) { entity = that.getEntity(child,
				 * entityName); } }); } return entity; },
				 */

				getEntity : function(parent, entityName) {
					var entity;
					if (parent instanceof viewmodel.Entity
							&& parent.name === entityName) {
						entity = parent;
					} else if (parent instanceof viewmodel.Context) {
						var chilrenArray = parent.children;
						for (var i = 0; i < chilrenArray._keys.length; i++) {
							var child = chilrenArray.getAt(i);
							if (child instanceof viewmodel.Entity
									&& child.name === entityName) {
								entity = child;
								break;
							} else if (child instanceof viewmodel.Context) {
								entity = this.getEntity(child, entityName);
							}
						}
					}
					return entity;
				},

				getOrCreateContextMenu : function() {
					var that = this;
					var contextMenu = document
					.getElementById("calcViewEditorContextMenu");

					if (!contextMenu) {
						contextMenu = document.createElement("div");
						contextMenu
						.setAttribute("class", "calcViewContextMenu");
						contextMenu.setAttribute("id",
						"calcViewEditorContextMenu");
						var body = document.getElementsByTagName("body")[0];
						body.appendChild(contextMenu);
						body.addEventListener("click", function() {
							that.hideContextMenu();
						});
						if ($.browser.msie) { // IE
							/*
							 * document.addEventListener("click", function() {
							 * that.hideContextMenu(); });
							 */
							window.addEventListener("click", function() {
								that.hideContextMenu();
							});
						}
					}
					// clear context menu items
					while (contextMenu.firstChild) {
						contextMenu.removeChild(contextMenu.firstChild);
					}
					return contextMenu;
				},

				openContextMenu : function(oEvent) {
					var contextMenu = document
					.getElementById("calcViewEditorContextMenu");
					if (contextMenu) {

						var availableSpaceY = Math
						.abs(window.screen.availHeight
								- oEvent.clientViewY);

						if (availableSpaceY > 200) {
							contextMenu.style.top = oEvent.clientViewY + "px";
							contextMenu.style.left = oEvent.clientViewX + 10
							+ "px";
						} else {
							contextMenu.style.top = oEvent.cilentViewY
							- (contextMenu.childElementCount * 20)
							+ "px";
							contextMenu.style.left = oEvent.clientViewX + 10
							+ "px";
						}

						if (contextMenu.firstChild) {
							contextMenu.hidden = false;
						} else {
							this.hideContextMenu();
						}
						if ($.browser.msie) { // IE
							// hide context menu on mouse left click
							if (oEvent.gesture) {
								this.hideContextMenu();
							}
						}
					}
				},

				createContextMenuItem : function(parent, object) {
					var that = this;

					var menuIten = document.createElement("div");
					menuIten.setAttribute("class", "calcViewContextMenuItem");
					var label = document.createElement("label");
					var textnode = document.createTextNode(object.name); // Create
					// a
					// text
					// node
					label.appendChild(textnode);
					menuIten.appendChild(label);
					parent.appendChild(menuIten);

					if (object.action) {
						menuIten.addEventListener("click", function() {
							that.hideContextMenu();
							object.action(object.actionContext);
						});
					}

					return menuIten;
				},

				hideContextMenu : function() {
					var contextMenu = document
					.getElementById("calcViewEditorContextMenu");
					if (contextMenu) {
						contextMenu.hidden = true;
						if ($.browser.msie) { // IE
							// remove context menu
							var body = document.getElementsByTagName("body")[0];
							body.removeChild(contextMenu);

						}
					}
				},

				/*
				 * getCDSArtifactFromFullPath: function(root, cdsNodeFullPath,
				 * cdsNodeName, generatedPath) { //OuterContext/MyEntity
				 * //OuterContext/Context1/Context2/MyEntity var that = this;
				 * var cdsArtifact = root; var originalPath; if (!generatedPath) {
				 * originalPath = generatedPath = root.name; } else {
				 * originalPath = generatedPath; }
				 * 
				 * if (root instanceof viewmodel.Context) { if (generatedPath
				 * === cdsNodeFullPath) { cdsArtifact = root; } else {
				 * cdsArtifact = root; var chilrenArray = root.children; for
				 * (var i = 0; i < chilrenArray._keys.length; i++) {
				 * generatedPath = originalPath; var child =
				 * chilrenArray.getAt(i); generatedPath = generatedPath + "/" +
				 * child.name; if (generatedPath === cdsNodeFullPath) {
				 * cdsArtifact = child; break; } else { if (child instanceof
				 * viewmodel.Context) { cdsArtifact =
				 * that.getCDSArtifactFromFullPath(child, cdsNodeFullPath,
				 * cdsNodeName, generatedPath); } else if (child instanceof
				 * viewmodel.Entity) { continue; } else { cdsArtifact =
				 * undefined; } } } } } else if (root instanceof
				 * viewmodel.Entity) { if (root.name === cdsNodeName) {
				 * cdsArtifact = root; } else { cdsArtifact = undefined; } }
				 * return cdsArtifact; },
				 */

				getCDSArtifactFullPath : function(oSymbol, fileName, pathsArray) {
					var nodesArray = this.getCDSPathArray(oSymbol, pathsArray);
					nodesArray.push(fileName);
					return nodesArray.reverse().join("/");
				},

				getCDSPathArray : function(oSymbol, pathsArray) {
					if (!pathsArray) {
						pathsArray = [];
					}

					// push symbol's display name in to the path array
					var currentSymbolName = oSymbol.object.name.trim();
					currentSymbolName = currentSymbolName.replace(/ /g, '');
					pathsArray.push(currentSymbolName);

					if (oSymbol.parentSymbol) {
						var childSymbol = oSymbol.parentSymbol;
						pathsArray = this.getCDSPathArray(childSymbol,
								pathsArray);
					}

					return pathsArray;
				},

				getFullPathFromCDSObject : function(cdsObject) {
					var nodesArray = this.getCDSObjectPathArray(cdsObject);
					// nodesArray.push(fileName);
					return nodesArray.reverse().join("/");
				},

				getCDSObjectPathArray : function(cdsObject, pathsArray) {
					if (!pathsArray) {
						pathsArray = [];
					}

					// push symbol's display name in to the path array
					var currentCdsObjectName = cdsObject.name;
					pathsArray.push(currentCdsObjectName);

					if (cdsObject.$getContainer()) {
						if (cdsObject.$getContainer().$$className !== "CDSModel") {
							var parentCdsObject = cdsObject.$getContainer();
							pathsArray = this.getCDSObjectPathArray(
									parentCdsObject, pathsArray);
						}
					}

					return pathsArray;
				},

				/*
				 * getContextASTModel: function(parent, cdsNodeName,
				 * cdsNodeFullPath) { var parentAstNode = parent; if (parent
				 * instanceof commonddl.EntityDeclarationImpl &&
				 * parent.getName() === cdsNodeName) { parentAstNode = parent; }
				 * else if (parent instanceof commonddl.ContextDeclarationImpl ||
				 * parent instanceof commonddl.CompilationUnitImpl) { var
				 * statements = parent.statements; if (statements) { for (var
				 * stmtCount = 0; stmtCount < statements.length; stmtCount++) {
				 * var stmt = statements[stmtCount]; if (stmt instanceof
				 * commonddl.EntityDeclarationImpl) { if (stmt.getName() ===
				 * cdsNodeName) { parentAstNode = stmt; break; } } else if (stmt
				 * instanceof commonddl.ContextDeclarationImpl) { if
				 * (stmt.getName() === cdsNodeName) { parentAstNode = stmt;
				 * break; } else { parentAstNode = this.getContextASTModel(stmt,
				 * cdsNodeName); } } } } } return parentAstNode; },
				 */

				getCDSNodeASTModel : function(rootAstModel, cdsNodeFullPath,
						cdsNodeName, generatedPath) {
					var that = this;
					var cdsArtifactAstModel = rootAstModel;
					var currentPath;

					if (rootAstModel instanceof commonddl.CompilationUnitImpl
							|| rootAstModel instanceof commonddl.ContextDeclarationImpl) {
						cdsArtifactAstModel = rootAstModel;
						var statements = rootAstModel.statements;
						if (statements) {
							for (var stmtCount = 0; stmtCount < statements.length; stmtCount++) {
								var stmt = statements[stmtCount];

								if (stmt instanceof commonddl.ContextDeclarationImpl) {
									if (!generatedPath) {
										generatedPath = stmt.getName();
										currentPath = generatedPath;
									} else {
										currentPath = generatedPath + "/" + stmt.getName();
									}
									if (currentPath === cdsNodeFullPath) { // Context
										cdsArtifactAstModel = stmt;
										break;
									} else if (cdsNodeFullPath.startsWith(currentPath)) {
										cdsArtifactAstModel = that.getCDSNodeASTModel(stmt,cdsNodeFullPath,cdsNodeName,currentPath);
										break;
									}
								} else if (stmt instanceof commonddl.EntityDeclarationImpl) {
									if (!generatedPath) {
										generatedPath = stmt.getName();
										currentPath = generatedPath;
									} else {
										currentPath = generatedPath + "/" + stmt.getName();
									}

									if (currentPath === cdsNodeFullPath) { // Entity
										cdsArtifactAstModel = stmt;
										break;
									} else if (cdsNodeFullPath.startsWith(currentPath)) { // Element
										// or
										// Association
										for (var elementCount = 0; elementCount < stmt.elements.length; elementCount++) {
											var element = stmt.elements[elementCount];
											if (element.getName() === cdsNodeName) {
												cdsArtifactAstModel = element;
												break;
											}
										}
										break;
									}
								} else if (stmt instanceof commonddl.TypeDeclarationImpl) {
									if (!generatedPath) {
										generatedPath = stmt.getName();
										currentPath = generatedPath;
									} else {
										currentPath = generatedPath + "/"
										+ stmt.getName();
									}

									if (currentPath === cdsNodeFullPath) { // Type
										cdsArtifactAstModel = stmt;
										break;
									}
								}
							}
						}
					} else if (rootAstModel instanceof commonddl.EntityDeclarationImpl) {
						if (!generatedPath) {
							generatedPath = rootAstModel.getName();
						}

						if (generatedPath === cdsNodeFullPath) {
							cdsArtifactAstModel = rootAstModel;
						} else {
							cdsArtifactAstModel = undefined;
						}
					}
					return cdsArtifactAstModel;

				},

				validateCDSArtifactName : function(root, renamedNode, fileName) {
					var newName = renamedNode.object.displayName;
					var isNameValid = true;
					// validate cds artifact name against invalid character
					// entry
					if (newName.trim().length === 0) {
						isNameValid = false;
					} else {
						var regexPattern = /^(")?[_a-zA-Z]+[_a-zA-Z0-9]*\1$/;
						isNameValid = regexPattern.test(newName);
					}

					if (isNameValid) {
						// check for duplicate entry inside its parent container
						var parentNodeFullPath;
						var parentNodeName;
						var parentCdsNode;
						if (renamedNode.parentSymbol) {
							parentNodeName = renamedNode.parentSymbol.object.displayName;
							parentNodeFullPath = this.getCDSArtifactFullPath(
									renamedNode.parentSymbol, fileName,
									undefined);
						} else {
							parentNodeName = fileName;
							parentNodeFullPath = fileName;
						}
						parentCdsNode = this.getCDSModelFromFullPath(root,
								parentNodeFullPath, parentNodeName, undefined);
						var chilrenArray = parentCdsNode.children;
						for (var i = 0; i < chilrenArray._keys.length; i++) {
							var child = chilrenArray.getAt(i);
							if (child.name === newName) {
								isNameValid = false;
								break;
							}
						}
					}
					return isNameValid;
				},

				getCDSModelFromFullPath : function(root, cdsArtifactFullPath,
						cdsArtifactName, generatedPath) {
					var cdsArtifact;
					if (!generatedPath) {
						generatedPath = root.name;
					}

					if (root.name === cdsArtifactFullPath) {
						cdsArtifact = root;
					} else {
						var childrenArray = root.children;
						for (var i = 0; i < childrenArray._keys.length; i++) {
							var child = childrenArray.getAt(i);
							var currentChildPath = generatedPath + "/"
							+ child.name;
							if (child instanceof viewmodel.Context) {
								if (currentChildPath === cdsArtifactFullPath) {
									cdsArtifact = child;
									break;
								} else {
									cdsArtifact = this.getCDSModelFromFullPath(
											child, cdsArtifactFullPath,
											cdsArtifactName, currentChildPath);
									if (cdsArtifact) {
										break;
									}
								}
							} else if (child instanceof viewmodel.Entity) {
								if (currentChildPath === cdsArtifactFullPath) {
									cdsArtifact = child;
									break;
									
								} else if (cdsArtifactFullPath.startsWith(currentChildPath)) { //Element or Association
									var childrenArray = child.elements;
									for (var i = 0; i < childrenArray._keys.length; i++) {
										var innerchild = childrenArray.getAt(i);
										if(currentChildPath + "/" + innerchild.name === cdsArtifactFullPath){
											cdsArtifact = innerchild;
											break;
										}
									}
								} else {
									continue;
								}
							}
						}
					}
					return cdsArtifact;
				},

				createElementModel : function(assoModel) {
					var that = this;
					var model = {
							"elements" : {
								"label" : "Elements",
								"data" : [
								          {
								        	  "id" : resourceLoader
								        	  .getText("tit_source_columns"),
								        	  "label" : resourceLoader
								        	  .getText("tit_source_columns"),
								        	  "children" : []
								          },
								          {
								        	  "id" : resourceLoader
								        	  .getText("tit_target_columns"),
								        	  "label" : resourceLoader
								        	  .getText("tit_target_columns"),
								        	  "children" : []
								          } ]
							}
					};
					this.addEntityColumns(assoModel, model);
					return model;
				},

				addEntityColumns : function(assoModel, elemModel) {
					// add columns from source entity
					var sourceEntity = assoModel.sourceEntity;
					if (sourceEntity) {
						var sourceEntityColumns = this
						.getEntityColumnsArray(sourceEntity);
						elemModel.elements.data[0].children = sourceEntityColumns;
					}

					var targetEntity = assoModel.targetEntity;
					if (targetEntity) {
						var targetEntityColumns = this
						.getEntityColumnsArray(targetEntity);
						elemModel.elements.data[1].children = targetEntityColumns;
					} else {
						var entityColumns = [];
						// this means entity is external, extract column
						// information from attributes property
						for (var i = 0; i < assoModel.attributes.length; i++) {
							var dataType;
							var elementType;
							var elementModel;
							elementType = "Column";
							elementModel = {
									"id" : assoModel.attributes[i].name,
									"label" : assoModel.attributes[i].name,
									"nodetype" : "element",
									"datatype" : undefined,
									"elementType" : elementType
									// "separator": "\""
							};
							entityColumns.push(elementModel);
						}
						elemModel.elements.data[1].children = entityColumns;
					}

					return elemModel;
				},

				getEntityColumnsArray : function(entity) {
					var entityColumns = [];
					for (var i = 0; i < entity.elements._keys.length; i++) {
						var element = entity.elements.getAt(i);
						var dataType;
						var elementType;
						var elementModel;
						if (element.inlineType
								&& element.inlineType.primitiveType) {
							dataType = element.inlineType.primitiveType;
							elementType = "Column";
							elementModel = {
									"id" : element.name,
									"label" : element.name,
									"nodetype" : "element",
									"datatype" : dataType,
									"elementType" : elementType
									// "separator": "\""
							};
							entityColumns.push(elementModel);

						} else if (element.inlineType
								&& element.inlineType.structureType) {
							dataType = element.inlineType.structureType;
							elementType = "Column";
							elementModel = {
									"id" : element.name,
									"label" : element.name,
									"nodetype" : "element",
									"datatype" : dataType,
									"elementType" : elementType
									// "separator": "\""
							};
							entityColumns.push(elementModel);

						} else {
							dataType = undefined;
							elementType = "Association";
							if (element.associationKeys) {
								for (var j = 0; j < element.associationKeys._keys.length; j++) {
									var key = element.associationKeys.getAt(j);
									var id = element.name + "_" + key.name;
									id = id.replace(/\./g, "_");
									var fullKeyName = element.name + "."
									+ key.name;
									elementModel = {
											"id" : id,
											"label" : fullKeyName,
											"nodetype" : "element",
											"datatype" : dataType,
											"elementType" : elementType
											// "separator": "\""
									};
									entityColumns.push(elementModel);
								}
							}
						}
					}
					return entityColumns;
				},

				createOperatorData : function() {
					var model = {
							"operators" : {
								"label" : "operators",
								"data" : [
								          /*
								           * { "id": "plus", "label": "+", "nodetype":
								           * "operator" }, { "id": "minus", "label": "-",
								           * "nodetype": "operator" }, { "id": "multiply",
								           * "label": "*", "nodetype": "operator" }, { "id":
								           * "starstar", "label": "**", "nodetype": "operator" }, {
								           * "id": "divide", "label": "/", "nodetype":
								           * "operator" }, { "id": "modulus", "label": "%",
								           * "nodetype": "operator" },
								           */
								          {
								        	  "id" : "braceopen",
								        	  "label" : "(",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "braceclose",
								        	  "label" : ")",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "equals",
								        	  "label" : "=",
								        	  "nodetype" : "operator"
								          },
								          /*
								           * { "id": "notequal", "label": "!=", "nodetype":
								           * "operator" }
								           */
								          {
								        	  "id" : "greater",
								        	  "label" : ">",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "smaller",
								        	  "label" : "<",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "greaterorequal",
								        	  "label" : ">=",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "smallerorequal",
								        	  "label" : "<=",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "lessThanMoreThan",
								        	  "label" : "<>",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "and",
								        	  "label" : "AND",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "or",
								        	  "label" : "OR",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "not",
								        	  "label" : "NOT",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "in",
								        	  "label" : "IN",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "like",
								        	  "label" : "LIKE",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "between",
								        	  "label" : "BETWEEN",
								        	  "nodetype" : "operator"
								          }, {
								        	  "id" : "period",
								        	  "label" : ".",
								        	  "nodetype" : "operator"
								          } ]
							}
					};

					return model;
				},

				generateOnCondition : function(object) {
					var onCondition = "";
					var leftJoinString = "";
					var rightJoinString = "";
					var inJoinString = "";
					var type = "";
					var upperJoinString = "";
					var lowerJoinString = "";

					// complex on conditoins
					if (object.getOnCondition() instanceof commonddl.InExpressionImpl) {
						var inString = "";
						inString = this.generateInString(object
								.getOnCondition().getIns());
						leftJoinString = this.generateJoinString(object
								.getOnCondition().getLeft());
						onCondition = onCondition + leftJoinString + " IN "
						+ inString;

					} else if (object.getOnCondition() instanceof commonddl.LikeExpressionImpl) {
						onCondition = this.generateLikeString(object
								.getOnCondition());

					} else if (object.getOnCondition() instanceof commonddl.BetweenExpressionImpl) {
						onCondition = this.generateBetweenString(object
								.getOnCondition());

					} else if (object.getOnCondition() instanceof commonddl.NotExpressionImpl) {
						onCondition = onCondition
						+ this.generateNotString(object
								.getOnCondition().getCond());

					} else if (object.getOnCondition() instanceof commonddl.BooleanExpressionImpl) { // A."B"
						// LIKE
						// "C"
						// AND
						// A."B"
						// =
						// "D";
						var mainType = object.getOnCondition().getType();
						if (mainType.m_value === 0) {
							mainType = "AND";
						} else if (mainType.m_value === 1) {
							mainType = "OR";
						}

						var conditions = object.getOnCondition()
						.getConditions();
						for (var i = 0; i < conditions.length; i++) {
							var currCondition = conditions[i];
							if (i > 0) {
								onCondition = onCondition + " " + mainType
								+ " ";
							}
							if (currCondition instanceof commonddl.LikeExpressionImpl) {
								onCondition = onCondition
								+ this
								.generateLikeString(currCondition);
							} else if (currCondition instanceof commonddl.CompExpressionImpl) {
								onCondition = onCondition
								+ this
								.generateCompString(currCondition);
							} else if (currCondition instanceof commonddl.InExpressionImpl) {
								var inString = "";
								inString = this.generateInString(currCondition
										.getIns());
								leftJoinString = this
								.generateJoinString(currCondition
										.getLeft());
								onCondition = onCondition + leftJoinString
								+ " IN " + inString;
							} else if (currCondition instanceof commonddl.BetweenExpressionImpl) {
								onCondition = onCondition
								+ this
								.generateBetweenString(currCondition);
							} else if (currCondition instanceof commonddl.NotExpressionImpl) {
								onCondition = onCondition
								+ this.generateNotString(currCondition);
							}
						}

					} else if (object.getOnCondition() instanceof commonddl.CompExpressionImpl) {
						onCondition = onCondition
						+ this.generateCompString(object
								.getOnCondition());
					}

					return onCondition;
				},

				generateJoinString : function(part) {
					var joinString = "";
					for (var i = 0; i < part.pathEntries.length; i++) {
						var current = part.pathEntries[i];
						var textValue = current.getNameToken().getM_lexem();
						if (i > 0) {
							joinString = joinString + ".";
						}
						joinString = joinString + textValue;
					}

					return joinString;
				},

				generateInString : function(part) {
					var inJoinString = "";
					// var inConditions = part.getOnCondition().getIns();
					var inConditions = part;
					if (inConditions.length > 0) {
						inJoinString = inJoinString + "(";
					}
					for (var i = 0; i < inConditions.length; i++) {
						if (i > 0) {
							inJoinString = inJoinString + ", ";
						}
						var currentInCondition = inConditions[i];
						if (currentInCondition instanceof commonddl.LiteralExpressionImpl) {
							inJoinString = inJoinString
							+ currentInCondition.getTokenToken()
							.getM_lexem();

						} else {
							var patHEntries = currentInCondition.pathEntries;
							for (var j = 0; j < patHEntries.length; j++) {
								inJoinString = inJoinString
								+ patHEntries[j].getNameToken()
								.getM_lexem();
							}
						}
					}
					if (inConditions.length > 0) {
						inJoinString = inJoinString + ")";
					}

					return inJoinString;
				},

				generateLikeString : function(part) {
					var onCondition = "";
					var leftJoinString = "";
					var rightJoinString = "";
					var type = "";

					// left condition in on
					if (part.getLeft()) {
						if (part.getLeft() instanceof commonddl.LiteralExpressionImpl) {
							leftJoinString = part.getLeft().getTokenToken()
							.getM_lexem();
						} else {
							leftJoinString = this.generateJoinString(part
									.getLeft());
						}
					}
					// right condition in on
					if (part.getRight()) {
						if (part.getRight() instanceof commonddl.LiteralExpressionImpl) {
							rightJoinString = part.getRight().getTokenToken()
							.getM_lexem();
						} else {
							rightJoinString = this.generateJoinString(part
									.getRight());
						}
					}
					// type condition in on
					if (part.getTypeToken()) {
						type = part.getTypeToken().getM_lexem();
					}

					onCondition = onCondition + leftJoinString + " " + type
					+ " " + rightJoinString;
					return onCondition;
				},

				generateBetweenString : function(part) {
					var onCondition = "";
					var leftJoinString = "";
					var upperJoinString = "";
					var lowerJoinString = "";
					// left condition in on
					if (part.getLeft()) {
						leftJoinString = this
						.generateJoinString(part.getLeft());
					}
					// upper between condition in on
					if (part.getUpper()) {
						if (part.getUpper() instanceof commonddl.LiteralExpressionImpl) {
							upperJoinString = part.getUpper().getTokenToken()
							.getM_lexem();
						} else {
							upperJoinString = this.generateJoinString(part
									.getUpper());
						}
					}
					// lower between condition in on
					if (part.getLower()) {
						if (part.getLower() instanceof commonddl.LiteralExpressionImpl) {
							lowerJoinString = part.getLower().getTokenToken()
							.getM_lexem();
						} else {
							lowerJoinString = this.generateJoinString(part
									.getLower());
						}
					}

					onCondition = onCondition + leftJoinString + " BETWEEN "
					+ lowerJoinString + " AND " + upperJoinString;
					return onCondition;
				},

				generateCompString : function(part) {
					var onCondition = "";
					var leftJoinString = "";
					var rightJoinString = "";
					var type = "";

					//left condition in on
					if (part.getLeft()) {
						if (part.getLeft() instanceof commonddl.LiteralExpressionImpl) {
							leftJoinString = part.getLeft().getTokenToken()
							.getM_lexem();
						} else {
							leftJoinString = this.generateJoinString(part
									.getLeft());
						}
					}
					//right condition in on
					if (part.getRight()) {
						if (part.getRight() instanceof commonddl.LiteralExpressionImpl) {
							rightJoinString = part.getRight().getTokenToken()
							.getM_lexem();
						} else {
							rightJoinString = this.generateJoinString(part
									.getRight());
						}
					}
					//type condition in on
					if (part.getTypeToken()) {
						type = part.getTypeToken().getM_lexem();
					}

					onCondition = onCondition + leftJoinString + " " + type
					+ " " + rightJoinString;
					return onCondition;
				},

				generateNotString : function(part) {
					var onCondition = "";
					var leftJoinString = "";
					var mainType = "NOT";
					if (part instanceof commonddl.LikeExpressionImpl) {
						onCondition = this.generateLikeString(part);
						//final string
						var indexOfLike = onCondition.toLowerCase().indexOf(
						"like");
						onCondition = onCondition.substring(0, indexOfLike)
						+ mainType + " "
						+ onCondition.substring(indexOfLike); //insert main type in the like condition

					} else if (part instanceof commonddl.InExpressionImpl) {
						var inString = "";
						inString = this.generateInString(part.getIns());
						leftJoinString = this
						.generateJoinString(part.getLeft());
						onCondition = onCondition + leftJoinString + " IN "
						+ inString;
						//final string
						var indexOfIn = onCondition.toLowerCase().indexOf("in");
						onCondition = onCondition.substring(0, indexOfIn)
						+ mainType + " "
						+ onCondition.substring(indexOfIn); //insert main type in the in condition

					} else if (part instanceof commonddl.BetweenExpressionImpl) {
						onCondition = this.generateBetweenString(part);
						//final string
						var indexOfBetween = onCondition.toLowerCase().indexOf(
						"between");
						onCondition = onCondition.substring(0, indexOfBetween)
						+ mainType + " "
						+ onCondition.substring(indexOfBetween); //insert main type in the between condition

					} else if (part instanceof commonddl.NotExpressionImpl) {
						onCondition = onCondition
						+ this.generateNotString(part.getCond());

					}

					return onCondition;
				},

				getUsingClausesArray : function(astModel) {
					var stmts = astModel.getStatements();
					var usingNameSpacesArray = [];
					for (var i = 0; i < stmts.length; i++) {
						var stmt = stmts[i];
						if (stmt instanceof commonddl.UsingDirectiveImpl) {
							var nameSpaceString = stmt
							.getNameWithNamespaceDelimeter();
							if (stmt.getAlias()) {
								nameSpaceString = nameSpaceString + " as "
								+ stmt.getAlias().getM_lexem();
							}
							usingNameSpacesArray.push(nameSpaceString);
						}
					}
					return usingNameSpacesArray;
				},

				isModelStateValid : function(elementModel){
					var modelIsValid = true;

					//1. validate that struct type is selected
					if(elementModel.structureType === "" || elementModel.externalStructureType === ""){
						modelIsValid = false;
					}

					return modelIsValid;
				},

				showMessageToast : function(message, parent, offset){
					jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");

					sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(message, {
						of: parent,
						offset: offset
					});
				},

				getErrorsInAstModel : function(astModel){
					var mainArray = [];
					var errorObject;
					for(var i=0; i < astModel.tokenList.length; i++){
						if(astModel.tokenList[i].m_err_state.m_value !== 0){
							errorObject = {
									"tokenIndex" : i,
									"errorState" : astModel.tokenList[i].m_err_state.m_value,
									"lineNo" : astModel.tokenList[i].m_line,
									"colNo" : astModel.tokenList[i].m_column,
									"stringValue" : astModel.tokenList[i].m_lexem
							};
							mainArray.push(errorObject);
							break;
						}
					}
					//return mainArray;
					return errorObject;
				},

				getFullNameSpaceForTargetEntity : function(usingClauseArray, targetEntityFullName){
					//targetEntityFullName should include ..<contextname>.<entityName>
					var targetEntityNameSpace;
					for(var i = 0; i < usingClauseArray.length; i++){
						var currentClause = usingClauseArray[i];
						var cdsArtifactNamespace = currentClause.getNameWithNamespaceDelimeter();
						var alias;
						if(currentClause.getAlias()){
							alias = stmt.getAlias().getM_lexem();
						}

						var regexp = new RegExp("\\b" + targetEntityFullName + "\\b", "g");
						
						//if alias is not present, search for target entity path inside the cdsArtifactNamespace
						//if alias is present, search for target entity path inside the cdsArtifactNamespace appended with alias string
						if(!alias){
							if(regexp.test(cdsArtifactNamespace)){
								targetEntityNameSpace = cdsArtifactNamespace;//if match found, return namespace
							}
						} else{
							if(regexp.test(cdsArtifactNamespace + " as " + alias)){
								targetEntityNameSpace = cdsArtifactNamespace;//if match found, return namespace
							}
						}
					}
					
					return targetEntityNameSpace;
				}
			};

		});