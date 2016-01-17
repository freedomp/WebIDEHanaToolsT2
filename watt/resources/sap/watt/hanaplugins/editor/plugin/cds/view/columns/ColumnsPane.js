/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(
		[ "../../util/ResourceLoader", "../../../hdbcalculationview/base/modelbase",
		  "../../model/commands", "../CDSEditorUtil",
		  "../../../hdbcalculationview/dialogs/NewFindDialog",
		  "../../../hdbcalculationview/base/MetadataServices",
		  "../../../hdbcalculationview/viewmodel/services/ViewModelService"
		  //"/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/services/ViewModelService"
		  ],
		  function(ResourceLoader, modelbase, commands, CDSEditorUtil, NewFindDialog, MetadataServices, ViewModelService
		  ) {
			"use strict";

			var resourceLoader = new ResourceLoader(
			"/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");

			/*
			 * @class
			 */
			var ColumnsPane = function(parameters) {
				this._model = parameters.model;
				this._entity = parameters.entity;
				this._undoManager = parameters.undoManager;
				this.context = parameters.context;
			};

			ColumnsPane.prototype = {

					_execute : function(command) { 
						return this._undoManager.execute(command);
					},

					getContent : function() {
						var that = this;
						var columnsTable = this._createTable("txt_no_columns", "/",
								"columns", 1);

						var columnsToolbar = columnsTable.getToolbar(); 

						/*
						 * var move = function(indices, isMoveUp) { if
						 * (indices.length > 0) { var viewNodeName =
						 * columnsTable.getBindingContext().getObject().name; var
						 * moveCommands = []; var index, element, i; for (i = 0; i <
						 * indices.length; i++) { index = indices[i]; var newIndex =
						 * index + (isMoveUp ? -1 : 1); element =
						 * columnsTable.getBinding().oList[index];
						 * moveCommands.push(new
						 * commands.MoveElementCommand(viewNodeName, element.name,
						 * isMoveUp)); indices[i] = newIndex; // change selection }
						 * that._execute(new
						 * modelbase.CompoundCommand(moveCommands));
						 * enableButtons(); } };
						 * 
						 * var moveUp = function(event) { var indices =
						 * TypedObjectTable.sortAscending(columnsTable.getSelectedIndices());
						 * move(indices, true); };
						 * 
						 * var moveDown = function(event) { var indices =
						 * TypedObjectTable.sortDescending(columnsTable.getSelectedIndices());
						 * move(indices, false); };
						 */

						/*
						 * var moveUpButton = new sap.ui.commons.Button({ icon:
						 * "sap-icon://up", tooltip: "Move Up" //press: moveUp });
						 * columnsToolbar.addRightItem(moveUpButton); var
						 * moveDownButton = new sap.ui.commons.Button({ icon:
						 * "sap-icon://down", tooltip: "Move Down" //press: moveDown
						 * }); columnsToolbar.addRightItem(moveDownButton);
						 */

						var addButton = new sap.ui.commons.Button(
								{
									icon : "sap-icon://add",
									tooltip : resourceLoader.getText("tol_add"),
									press : function(oevent) {
										var columnAttributes = {
												objectAttributes : {},
												typeAttributes : {},
												calculationAttributes : {}
										};

										columnAttributes.typeAttributes.primitiveType = "Binary";
										columnAttributes.objectAttributes.name = CDSEditorUtil
										.getUniqueNameForElement("col",
												that._entity, [ "col" ]);
										columnAttributes.objectAttributes.sourceEntity = that._entity;

										var entityFullPath = CDSEditorUtil
										.getFullPathFromCDSObject(
												that._entity,
												that._model.root.name);
										that
										._execute(new commands.AddElementCommand(
												that._entity.name,
												entityFullPath,
												columnAttributes));
										// that._execute(new
										// commands.AddElementCommand(that._entity.name,
										// columnAttributes));
									}

								});

						var deleteButton = new sap.ui.commons.Button(
								{
									icon : "sap-icon://delete",
									tooltip : resourceLoader.getText("tol_remove"),
									press : function(oevent) {
										var removeCommands = [];
										var entityFullPath = CDSEditorUtil
										.getFullPathFromCDSObject(
												that._entity,
												that._model.root.name,
												undefined);
										var indices = columnsTable
										.getSelectedIndices();
										for (var i = 0; i < indices.length; i++) {
											var index = indices[i];
											var elementObject = columnsTable
											.getBinding().oList[index];
											if (elementObject) {
												// removeCommands.push(new
												// commands.RemoveElementCommand(that._entity.name,
												// elementObject.name));
												removeCommands
												.push(new commands.RemoveElementCommand(
														that._entity.name,
														entityFullPath,
														elementObject.name));
											}
										}
										if (removeCommands.length > 0) {
											that
											._execute(new modelbase.CompoundCommand(
													removeCommands));
											// reset selection
											columnsTable.setSelectedIndex(-1);
										}

									}
								});

						columnsToolbar.addItem(addButton);
						columnsToolbar.addItem(deleteButton);

						var enableButtons = function() {
							var indices = columnsTable.getSelectedIndices();
							var isEmpty = indices.length <= 0;
							var containsFirst = true;
							var containsLast = true;
							if (!isEmpty) {
								var numberOfRows = (columnsTable.getBinding()
										.getLength() ? columnsTable.getBinding()
												.getLength() : 0);
								containsFirst = indices[0] === 0;
								var lastIndex = indices[indices.length - 1];
								containsLast = lastIndex >= numberOfRows - 1;
							}
							/*
							 * if (containsFirst) { moveUpButton.setEnabled(false); }
							 * else { moveUpButton.setEnabled(!isEmpty); } if
							 * (containsLast) { moveDownButton.setEnabled(false); }
							 * else { moveDownButton.setEnabled(!isEmpty); }
							 */

							if (deleteButton) {
								deleteButton.setEnabled(!isEmpty);
							}

						};

						columnsTable.attachRowSelectionChange(enableButtons.bind(
								null, 0));
						enableButtons();

						this._addColumns(columnsTable);

						return columnsTable;
					},

					_createTable : function(noDataText, tableBindingPath,
							tableRowsBindingPath, fixedColumn) {
						var toolbar = new sap.ui.commons.Toolbar() /* .addStyleClass("parameterToolbarStyle") */;
						var table = new sap.ui.table.Table(
								{
									selectionMode : sap.ui.table.SelectionMode.Multiple,
									selectionBehavior : sap.ui.table.SelectionBehavior.RowOnly,
									navigationMode : sap.ui.table.NavigationMode.Scrollbar,
									visibleRowCountMode : sap.ui.table.VisibleRowCountMode.Auto,
									noData : new sap.ui.commons.TextView({
										text : resourceLoader.getText(noDataText)
									}),
									columnHeaderVisible : true,
									// fixedColumnCount: fixedColumn,
									minAutoRowCount : 1,
									toolbar : toolbar,
									width : "100%"
								});
						table.bindRows(tableRowsBindingPath);

						table.addEventDelegate({
							onAfterRendering : function(event){
								var tableId = table.getId();
								$("#" + tableId).click(function() {
									//Get the Text Field that is selected in table
									jQuery.sap.delayedCall(100, null, function() {
										var body = $('#' + tableId).find('tbody');
										//Find the Text field that is focused
										var focussed = body.find('.sapUiTfFoc')[0];
										if (focussed) {
											//Store the Text Field control which is focused
											table.getModel().setProperty("/FieldID", focussed.id);
										}
									});
								});

								$('#' + tableId).on('keyup', function(e) {
									//On TAB press
									if (e.which == 9) {
										var focussedFieldId = table.getModel().getProperty("/FieldID");
										var selectedField = sap.ui.getCore().byId(focussedFieldId);
										if(!selectedField){
											return;
										}
										var selRow = selectedField.getParent();
										var selTable = selRow.getParent();
										var allCells = selRow.getCells();
										var selectedIndex;
										//Find the text field that is focused
										for (var i = 0; i < allCells.length; i++) {
											if (allCells[i].getId() == focussedFieldId) {
												selectedIndex = i;
												break;
											}
										}
										var targetCell;
										var focusInfo;

										var cellLength = allCells.length - 1;
										var rowLength = selTable.getRows().length - 1;

										//reverse the order of focus if SHIFT+TAB is pressed
										if(e.shiftKey){
											if (selectedIndex === 0) {
												var rows = selTable.getRows();
												var selectedRow;
												for (var i = 0; i < rows.length; i++) {
													if (rows[i].getId() == selRow.getId()) {
														selectedRow = i;
														break;
													}
												}

												if (selectedRow === 0) {
													//If it is first Row of table, scroll previous Logic
													selTable._scrollPrevious();
													jQuery.sap.delayedCall(100, null, function() {
														targetCell = rows[selectedRow].getCells()[cellLength];
														//Get the next row first cell
														table.getModel().setProperty("/FieldID", targetCell.getId());
														//Get Focus of Next Text Field
														focusInfo = targetCell.getFocusInfo();
														//Apply Focus of Next Text Field
														targetCell.applyFocusInfo(focusInfo);
													});

												} else {
													//If it is first Cell of the Row
													targetCell = rows[selectedRow - 1].getCells()[cellLength];
													table.getModel().setProperty("/FieldID", targetCell.getId());
													focusInfo = targetCell.getFocusInfo();
													targetCell.applyFocusInfo(focusInfo);
												}

											} else {
												targetCell = selRow.getCells()[selectedIndex - 1];
												table.getModel().setProperty("/FieldID", targetCell.getId());
												focusInfo = targetCell.getFocusInfo();
												targetCell.applyFocusInfo(focusInfo);
											}
											
										} else{
											if (cellLength === selectedIndex) {
												var rows = selTable.getRows();
												var selectedRow;
												for (var i = 0; i < rows.length; i++) {
													if (rows[i].getId() == selRow.getId()) {
														selectedRow = i;
														break;
													}
												}

												if (selectedRow === rowLength) {
													//If it is last Row of table, scroll Next Logic
													selTable._scrollNext();
													jQuery.sap.delayedCall(100, null, function() {
														targetCell = rows[selectedRow].getCells()[0];
														//Get the next row first cell
														table.getModel().setProperty("/FieldID", targetCell.getId());
														//Get Focus of Next Text Field
														focusInfo = targetCell.getFocusInfo();
														//Apply Focus of Next Text Field
														targetCell.applyFocusInfo(focusInfo);
													});

												} else {
													//If it is last Cell of the Row
													targetCell = rows[selectedRow + 1].getCells()[0];
													table.getModel().setProperty("/FieldID", targetCell.getId());
													focusInfo = targetCell.getFocusInfo();
													targetCell.applyFocusInfo(focusInfo);
												}

											} else {
												targetCell = selRow.getCells()[selectedIndex + 1];
												table.getModel().setProperty("/FieldID", targetCell.getId());
												focusInfo = targetCell.getFocusInfo();
												targetCell.applyFocusInfo(focusInfo);
											}
										}
									}
								});
							}
						});

						return table;
					},

					_addColumns : function(columnsTable) {
						var that = this;

						var changeName = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();
							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							// validate column name against invalid character entry
							// and duplicate name
							var regexPattern = /^(")?[_a-zA-Z]+[_a-zA-Z0-9]*\1$/;
							var keysArray = that._entity.elements._keys;

							if (value.trim() === "") {
								event.getSource().setValueState(
										sap.ui.core.ValueState.Error);
								elementModel.name = elementModel.oldName; // set
								// back
								// the
								// old
								// name
								// into
								// the
								// 'name'
								// attribute
								// in
								// the
								// model
								that.showToolTip(event.getSource(), "Empty");
							} else if (!regexPattern.test(value)) {
								event.getSource().setValueState(
										sap.ui.core.ValueState.Error);
								elementModel.name = elementModel.oldName; // set
								// back
								// the
								// old
								// name
								// into
								// the
								// 'name'
								// attribute
								// in
								// the
								// model
								that.showToolTip(event.getSource(), "InvalidChar");
							} else if (keysArray.indexOf(value) > -1) {
								event.getSource().setValueState(
										sap.ui.core.ValueState.Error);
								elementModel.name = elementModel.oldName; // set
								// back
								// the
								// old
								// name
								// into
								// the
								// 'name'
								// attribute
								// in
								// the
								// model
								that.showToolTip(event.getSource(), "Duplicate");
							} else {
								event.getSource().setValueState(
										sap.ui.core.ValueState.None);
								var attributes = CDSEditorUtil
								.createModelForElementAttributes();
								attributes.objectAttributes.name = value;

								var entityFullPath = CDSEditorUtil
								.getFullPathFromCDSObject(that._entity,
										that._model.root.name, undefined);

								var renamedElement = that._entity.elements.get(elementModel.oldName);

								var references = [];
								//references = ViewModelService.RenameService.getImpactAnalysis(renamedElement);

								if(references.length > 0){
									//this means the element being renamed is used in some place
									//create compound command to reflect the rename in all places
									var renameCDSArtifactCommand = new commands.RenameCDSNodeCommand(renamedElement, value, elementModel.oldName, references);
									that._execute(renameCDSArtifactCommand);

								} else{
									var command = new commands.ChangeElementPropertiesCommand(
											that._entity.name, entityFullPath,
											elementModel.oldName, attributes, "Name");
									that._execute(command);
								}

								var bindPath = bindingContext.getPath();
								var rowIndex = bindPath.substring(bindPath.length-1);
								that.updateLastEdittedDetail("Name", value, rowIndex, 0, resourceLoader.getText("tit_name"));

							}
						};

						columnsTable
						.addColumn(new sap.ui.table.Column(
								{
									label : new sap.ui.commons.Label(
											{
												design : sap.ui.commons.LabelDesign.Bold,
												wrapping : true,
												//textAlign : sap.ui.core.TextAlign.Center,
												text : resourceLoader
												.getText("tit_name")
											}),
											template : new sap.ui.commons.TextField(
													{
														change : changeName,
														tooltip : "{name}",
														value : "{name}"
													})
								.addEventDelegate({
									onsapfocusleave : function(
											event) {
										// event handler when
										// focus leaves the text
										// field
										var rows = columnsTable
										.getRows();
										for (var i = 0; i < rows.length; i++) {
											rows[i].getCells()[0]
											.setValueState(sap.ui.core.ValueState.None);
										}
									}
								}),
								// width: "150px"
								width : "20%"
								}));

						/*
						 * columnsTable.addColumn(new sap.ui.table.Column({ label:
						 * "Type", template: new sap.ui.commons.TextField({
						 * //change: changeName, value: "Primitive Type", editable:
						 * false }), width: "100px" }));
						 */

						var changeType = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();

							if (value === "Primitive Type") {
								// update dataTypes options
								elementModel.dataTypes = CDSEditorUtil
								.getPrimitiveDataTypes();

								elementModel.primitiveType = "Binary";
								elementModel.structureType = undefined;
								elementModel.externalStructureType = undefined;

								// set default data type as first element and reset
								// values for other columns
								attributes.typeAttributes.primitiveType = elementModel.dataTypes[0].datatype;
								attributes.typeAttributes.structureType = undefined;
								attributes.typeAttributes.externalStructureType = undefined;

							} else if (value === "Structure Type") {
								// update dataTypes options

								elementModel.dataTypes = CDSEditorUtil
								.getStructureDataTypes(that._model.root);
								/*elementModel.dataTypes.push({
									datatype: "Other..",
									datatypePath : "Other.."
								});*/

								// set default data type as first element and reset
								// values for other columns
								attributes.typeAttributes.primitiveType = undefined;

								var firstStrucType = elementModel.dataTypes[0];
								var datatypePath = firstStrucType.datatypePath;
								var dotFulString = datatypePath.replace(/\//g, ".");
								var rootNameRemoved = dotFulString
								.substring(dotFulString.indexOf(".") + 1);
								attributes.typeAttributes.structureType = rootNameRemoved;

								attributes.typeAttributes.externalStructureType = undefined;

								elementModel.primitiveType = undefined;
								elementModel.structureType = "" ;
								elementModel.externalStructureType = undefined;
							}

							// set other attributes to undefined property object
							attributes.typeAttributes.length = undefined;
							attributes.typeAttributes.scale = undefined;
							attributes.objectAttributes.defaultValue = "";

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name);

							/*var command = new commands.ChangeElementPropertiesCommand(
									that._entity.name, entityFullPath,
									elementModel.oldName, attributes, "DataTypeCategory");
							that._execute(command);*/

							var bindPath = bindingContext.getPath();
							var rowIndex = bindPath.substring(bindPath.length-1);
							that.updateLastEdittedDetail("DataTypeCategory", value, rowIndex, 1, resourceLoader.getText("tit_type"));
						};

						// type column
						var typeTemplate = new sap.ui.core.ListItem();
						typeTemplate.bindProperty("text", "typeCategory");

						var targetTemplate = new sap.ui.commons.DropdownBox({
							value : "{selectedDataTypeCategory}",
							change : function(event){
								changeType(event);
							}
						});

						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_type")
									}),
									template : targetTemplate.bindItems(
											"dataTypeCategories", typeTemplate),
											width : "15%"
						}));

						var changeDataType = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();

							var changedPropName = "DataType";

							if (elementModel.selectedDataTypeCategory === "Primitive Type") {
								attributes.typeAttributes.primitiveType = value;
								if (value !== "String" && value !== "Binary"
									&& value !== "Decimal") {
									attributes.typeAttributes.length = undefined;
								}
								if (value !== "Decimal") {
									attributes.typeAttributes.scale = undefined;
								}

								attributes.typeAttributes.structureType = undefined;
								attributes.typeAttributes.externalStructureType = undefined;

							} else if (elementModel.selectedDataTypeCategory === "Structure Type") {
								if (value === resourceLoader.getText("txt_other")) {
									// open the find and add dialog to add external
									var dialog = that.createFindAndAddDialog(event,
											columnsTable, bindingContext);

								} 

								//var isExternal = that.isUserInputExternalStruct(elementModel, value);
								var isInternal = CDSEditorUtil.isInternalStructuredType(that._model.root, value);

								if(!isInternal){
									changedPropName = "ExternalStructureType";
									attributes.typeAttributes.externalStructureType = value;
									attributes.typeAttributes.structureType = undefined;
								} else{
									attributes.typeAttributes.externalStructureType = undefined;
									attributes.typeAttributes.structureType = value;
								}

								attributes.typeAttributes.primitiveType = undefined;
								attributes.typeAttributes.length = undefined;
								attributes.typeAttributes.scale = undefined;

							}

							if (value !== resourceLoader.getText("txt_other")) {
								var entityFullPath = CDSEditorUtil
								.getFullPathFromCDSObject(that._entity,
										that._model.root.name, undefined);

								var command = new commands.ChangeElementPropertiesCommand(
										that._entity.name, entityFullPath,
										elementModel.oldName, attributes, changedPropName);
								that._execute(command);

								var bindPath = bindingContext.getPath();
								var rowIndex = bindPath.substring(bindPath.length-1);
								that.updateLastEdittedDetail("DataType", value, rowIndex, 2, resourceLoader.getText("tit_data_type"));
							}
						};

						// data type column
						var dataTypeItemTemplate = new sap.ui.core.ListItem();
						dataTypeItemTemplate.bindProperty("text", {
							parts : [ {
								path : "datatype"
							}, {
								path : "datatypePath"
							} ],
							formatter : function(datatype, datatypePath) {
								if (datatypePath === resourceLoader
										.getText("txt_other")) {
									return datatypePath;
								} else {
									if (!datatypePath) {
										return datatype; //this means its primitive type
									} else {
										var dotFulString = datatypePath.replace(
												/\//g, ".");
										var rootNameRemoved = dotFulString
										.substring(dotFulString
												.indexOf(".") + 1);
										return rootNameRemoved;
									}
								}
							}
						});

						var dataTypeTemplate = new sap.ui.commons.ComboBox({
							change : changeDataType
						}).bindValue({
							parts : [ {
								path : "primitiveType"
							}, {
								path : "structureType"
							},
							{
								path : "externalStructureType"
							}],
							formatter : function(primitiveType, structureType, externalStructureType) {
								if (primitiveType) {
									return primitiveType;
								} else if (structureType) {
									return structureType;
								} else if(externalStructureType){
									return externalStructureType;
								}
							}
						});
						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_data_type")
									}),
									template : dataTypeTemplate.bindItems("dataTypes",
											dataTypeItemTemplate),
											// width: "100px"
											width : "15%"
						}));

						var changeLength = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();
							attributes.typeAttributes.length = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name, undefined);

							var command = new commands.ChangeElementPropertiesCommand(
									that._entity.name, entityFullPath,
									elementModel.name, attributes, "Length");
							that._execute(command);

							var bindPath = bindingContext.getPath();
							var rowIndex = bindPath.substring(bindPath.length-1);
							that.updateLastEdittedDetail("Length", value, rowIndex, 3, resourceLoader.getText("tit_length"));
						};
						var lengthTemplate = new sap.ui.commons.TextField({
							change : changeLength,
							tooltip : "{name}",
							value : "{length}",
							editable : {
								path : "primitiveType",
								formatter : function(primitiveType) {
									if (primitiveType === "String"
										|| primitiveType === "Binary"
											|| primitiveType === "Decimal") {
										return true;
									}
									return false;
								}
							}
						});
						lengthTemplate.attachBrowserEvent("keypress", function(e) {
							var keyCodes = [ 48, 49, 50, 51, 52, 53, 54, 55, 56,
							                 57, 0, 8 ];
							if (!($.inArray(e.which, keyCodes) >= 0)) {
								e.preventDefault();
							}
						});
						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_length")
									}),
									template : lengthTemplate,
									// width: "50px"
									width : "10%"
						}));

						var changeScale = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();
							attributes.typeAttributes.scale = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name, undefined);

							var command = new commands.ChangeElementPropertiesCommand(
									that._entity.name, entityFullPath,
									elementModel.name, attributes, "Scale");
							that._execute(command);

							var bindPath = bindingContext.getPath();
							var rowIndex = bindPath.substring(bindPath.length-1);
							that.updateLastEdittedDetail("Scale", value, rowIndex, 4, resourceLoader.getText("tit_length"));
						};
						var scaleTemplate = new sap.ui.commons.TextField({
							value : "{scale}",
							change : changeScale,
							editable : {
								path : "primitiveType",
								formatter : function(primitiveType) {
									if (primitiveType === "Decimal") {
										return true;
									}
									return false;
								}
							}
						});
						scaleTemplate.attachBrowserEvent("keypress", function(e) {
							var keyCodes = [ 48, 49, 50, 51, 52, 53, 54, 55, 56,
							                 57, 0, 8 ];
							if (!($.inArray(e.which, keyCodes) >= 0)) {
								e.preventDefault();
							}
						});
						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_scale")
									}),
									template : scaleTemplate,
									// width: "50px"
									width : "10%"
						}));

						var changeKey = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							// var viewNodeName =
							// columnsTable.getBindingContext().getObject().name;
							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("checked");

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();
							attributes.objectAttributes.key = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name, undefined);

							var command = new commands.ChangeElementPropertiesCommand(
									that._entity.name, entityFullPath,
									elementModel.name, attributes, "KeyToken");
							that._execute(command);

							var bindPath = bindingContext.getPath();
							var rowIndex = bindPath.substring(bindPath.length-1);
							that.updateLastEdittedDetail("KeyToken", value, rowIndex, 5, resourceLoader.getText("tit_key"));
						};
						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_key")
									}),
									template : new sap.ui.commons.CheckBox({
										change : changeKey,
										editable : true,
										checked : "{keyElement}"
									}),
									// width: "50px",
									width : "10%",
									hAlign : "Center"
						}));

						var changeNull = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							// var viewNodeName =
							// columnsTable.getBindingContext().getObject().name;
							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("checked");

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();
							attributes.objectAttributes.not = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name, undefined);

							var command = new commands.ChangeElementPropertiesCommand(
									that._entity.name, entityFullPath,
									elementModel.name, attributes, "NullToken");
							that._execute(command);

							var bindPath = bindingContext.getPath();
							var rowIndex = bindPath.substring(bindPath.length-1);
							that.updateLastEdittedDetail("NullToken", value, rowIndex, 6, resourceLoader.getText("tit_not_null"));
						};
						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_not_null")
									}),
									template : new sap.ui.commons.CheckBox({
										change : changeNull,
										editable : true,
										checked : "{not}"

									}),
									// width: "70px",
									width : "10%",
									hAlign : "Center"
						}));

						var changeDefaultValue = function(event) {

							that.validateTableValues(columnsTable);

							var valueField = event.getSource();

							// var viewNodeName =
							// columnsTable.getBindingContext().getObject().name;
							var bindingContext = valueField.getBindingContext();
							var elementModel = bindingContext.getObject();

							var value = event.getParameter("newValue");

							if (value === "") {
								value = undefined;
							}

							var attributes = CDSEditorUtil
							.createModelForElementAttributes();
							attributes.objectAttributes.defaultValue = value;

							var entityFullPath = CDSEditorUtil
							.getFullPathFromCDSObject(that._entity,
									that._model.root.name, undefined);

							var command = new commands.ChangeElementPropertiesCommand(
									that._entity.name, entityFullPath,
									elementModel.name, attributes, "DefaultValue");
							that._execute(command);

							var bindPath = bindingContext.getPath();
							var rowIndex = bindPath.substring(bindPath.length-1);
							that.updateLastEdittedDetail("DefaultValue", value, rowIndex, 7, resourceLoader.getText("tit_default"));

						};
						columnsTable.addColumn(new sap.ui.table.Column({
							label : new sap.ui.commons.Label(
									{
										design : sap.ui.commons.LabelDesign.Bold,
										wrapping : true,
										//textAlign : sap.ui.core.TextAlign.Center,
										text : resourceLoader
										.getText("tit_default")
									}),
									template : new sap.ui.commons.TextField({
										change : changeDefaultValue,
										tooltip : "{defaultValue}",
										value : "{defaultValue}"
									}),
									//width: "250px"
									width : "15%"
						}));
					},

					createFindAndAddDialog : function(event, table,
							bindingContext) {
						var self = this;
						var mod = table.getModel();
						var bindPath = bindingContext.sPath;

						var changedComboBox = event.getSource();

						var entitiesTable;
						var dialog = sap.ui.getCore().byId("FindNAddDialog_StructType");

						if (!dialog) {
							var objectTypes = [ "CALCULATIONVIEW", "TABLE", "VIEW",
							                    "ANALYTICVIEW", "ATTRIBUTEVIEW",
							                    "hdbtablefunction", "CALCULATIONVIEW_HISTORY",
							                    "DATA_BASE_TABLE" ];

							dialog = new NewFindDialog(
									"FindNAddDialog_StructType",
									{
										types : objectTypes,
										noOfSelection : 1,
										context : this.context, // oParam.editor.extensionParam.builder._context,
										onOK : function(results) {
											var structTypeNameSpace = "MyModule::BeingUsedFile.OfficeAddress";
											// var targetEntityPath =
											// model.getProperty("/selectedEntityPath");
											if (structTypeNameSpace) {
												var structTypeName = structTypeNameSpace
												.substring(structTypeNameSpace
														.lastIndexOf("::") + 2).trim();
												changedComboBox
												.setValue(structTypeName);
											}

											var jsonResult ;

											self
											.setSelectedStructType(
													bindingContext,
													structTypeNameSpace,
													jsonResult);

											//TODO: uncomment if you want to get details of imported struct type
											/*var metadataDetailService = MetadataServices.MetadataDetails;
											metadataDetailService
											.getDetails(
													structTypePath,
													this.context.serviceName,
													function(result) {
														var jsonResult = JSON
														.parse(result); // this
														// jsonResult
														// should
														// give
														// me
														// the
														// list
														// of
														// elements
														// for
														// selected
														// entity
														self
														.setSelectedStructType(
																bindingContext,
																structTypePath,
																jsonResult);

													}, function(err) {
														alert("oh no!");
													});*/
										}
									});


							/*
							 * entitiesTable = new sap.ui.table.Table({
							 * selectionMode: sap.ui.table.SelectionMode.Single,
							 * selectionBehavior:
							 * sap.ui.table.SelectionBehavior.RowOnly,
							 * navigationMode:
							 * sap.ui.table.NavigationMode.Scrollbar,
							 * visibleRowCountMode:
							 * sap.ui.table.VisibleRowCountMode.Interactive, noData:
							 * new sap.ui.commons.TextView({ text:
							 * resourceLoader.getText("msg_no_keys_available") }),
							 * columnHeaderVisible: true, //fixedColumnCount: 1,
							 * minAutoRowCount: 1, // width: "70%", height: "70%",
							 * rowSelectionChange: function(event) {
							 *  } });
							 * 
							 * var model = new sap.ui.model.json.JSONModel();
							 * entitiesTable.setModel(model); model.setData({
							 * externalEntities: [ ] });
							 * entitiesTable.bindRows("/externalEntities");
							 * 
							 * entitiesTable.addColumn(new sap.ui.table.Column({
							 * label: "", width: "100%", template: new
							 * sap.ui.commons.TextField({ value: "{fullPath}" })
							 * }));
							 * 
							 * var okButton = new sap.ui.commons.Button({ text:
							 * resourceLoader.getText("txt_ok"), style:
							 * sap.ui.commons.ButtonStyle.Emph, press:
							 * function(event) { var selIndex =
							 * entitiesTable.getSelectedIndex(); var selRow =
							 * entitiesTable.getRows()[selIndex]; //var
							 * selectedRowFullPath =
							 * selRow.getBindingContext().getObject().fullPath; var
							 * selectedRowFullPath = "test.cds::HelloWorld.E";
							 * model.setProperty("/selectedEntityPath",
							 * selectedRowFullPath);
							 * self.setSelectedTargetEntity(bindingContext,
							 * selectedRowFullPath); dialog.close(); }
							 * }).addStyleClass("calcCreateBtn");
							 * 
							 * okButton.setModel(mod);
							 * 
							 * var cancelButton = new sap.ui.commons.Button({ text:
							 * resourceLoader.getText("txt_cancel"), style:
							 * sap.ui.commons.ButtonStyle.Emph, enabled: true,
							 * press: function(event) { dialog.close(); }
							 * }).addStyleClass("calcCancelBtn");
							 * 
							 * dialog = new sap.ui.commons.Dialog("FindNAddDialog_StructType", {
							 * title: resourceLoader.getText("tit_find_n_add"),
							 * applyContentPadding: true, showCloseButton: false,
							 * resizable: false, contentBorderDesign:
							 * sap.ui.commons.enums.BorderDesign.Thik, modal: true,
							 * accessibleRole: sap.ui.core.AccessibleRole.Dialog,
							 * content: [new sap.ui.commons.SearchField({
							 * enableListSuggest: false, enableClear: true,
							 * showExternalButton: false, width: "100%", suggest:
							 * function(event) { self._getExternalEntities(model); }
							 * }), entitiesTable], buttons: [okButton,
							 * cancelButton], defaultButton: okButton, keepInWindow:
							 * true, width: "30%", height: "40%", closed:
							 * function(event) { dialog.destroy();
							 * //table.rerender();
							 * 
							 * var targetEntityPath =
							 * model.getProperty("/selectedEntityPath"); if
							 * (targetEntityPath) { var targetEntityName =
							 * targetEntityPath.substring(targetEntityPath.lastIndexOf(".") +
							 * 1); changedComboBox.setValue(targetEntityName); }
							 * 
							 * //sap.ui.getCore("TargetComboBox").setValue("oooooo"); }
							 * });
							 */
						}
					},

					// this function updates the ast model and cds model via calling
					// ChangeElement command
					setSelectedStructType : function(bindingContext,
							structTypeNameSpace, jsonResult) {
						var that = this;
						var elementModel = bindingContext
						.getObject();

						var structTypeName = structTypeNameSpace
						.substring(structTypeNameSpace
								.lastIndexOf("::") + 2).trim();

						elementModel.structTypeName = structTypeName;

						var attributes = CDSEditorUtil.createModelForElementAttributes();

						attributes.typeAttributes.externalStructureType = structTypeNameSpace;

						attributes.typeAttributes.structureType = undefined;

						attributes.typeAttributes.primitiveType = undefined;
						attributes.typeAttributes.length = undefined;
						attributes.typeAttributes.scale = undefined;

						var entityFullPath = CDSEditorUtil
						.getFullPathFromCDSObject(that._entity,
								that._model.root.name, undefined);

						var command = new commands.ChangeElementPropertiesCommand(
								that._entity.name, entityFullPath,
								elementModel.name, attributes, "ExternalStructureType");
						that._execute(command);
					},

					showToolTip : function(textField, errorType) {
						var messageText = "";
						if (errorType === "Empty") {
							messageText = resourceLoader
							.getText("msg_col_name_empty");
						} else if (errorType === "Duplicate") {
							messageText = resourceLoader.getText(
									"msg_col_name_duplicate", textField.getValue());
						} else if (errorType === "InvalidChar") {
							messageText = resourceLoader
							.getText("msg_col_name_invalid_char");
						}
						var toolTipBox = new sap.ui.commons.Callout({
							atPosition : "end top" 
						});
						toolTipBox
						.addContent(new sap.ui.layout.VerticalLayout(
								{
									content : [
									           new sap.ui.layout.HorizontalLayout(
									        		   {
									        			   content : [
									        			              new sap.ui.commons.Label(
									        			            		  {
									        			            			  design : sap.ui.commons.LabelDesign.Bold,
									        			            			  icon : "sap-icon://error"
									        			            		  }),
									        			            		  new sap.ui.commons.TextView(
									        			            				  {
									        			            					  semanticColor : sap.ui.commons.TextViewColor.Negative,
									        			            					  design : sap.ui.commons.TextViewDesign.Bold,
									        			            					  text : "Invalid Column Definition"
									        			            				  }) ]
									        		   }),
									        		   new sap.ui.commons.HorizontalDivider(),
									        		   new sap.ui.commons.TextView({
									        			   text : messageText
									        		   }) ]
								}));
						toolTipBox.openPopup(textField);
					},

					isUserInputExternalStruct : function(elementModel, value){
						var isExternal = true;
						var structTypeArray = elementModel.dataTypes;
						for(var i = 0; i < structTypeArray.length; i++){
							var datatypePath = structTypeArray[i].datatypePath;
							var dotFulString = datatypePath.replace(/\//g, ".");
							var rootNameRemoved = dotFulString
							.substring(dotFulString.indexOf(".") + 1);
							if(rootNameRemoved === value.trim()){
								isExternal = false;
								break;
							} 
						}

						return isExternal;
					},

					updateLastEdittedDetail : function(propName, value, rowIndex, columnIndex, columnName){
						var lastEdittedDetail = {
								propName : propName,
								value : value,
								rowIndex : rowIndex,
								columnIndex : columnIndex,
								columnName : columnName
						};
						this.lastEdittedDetail = lastEdittedDetail;
					},

					validateTableValues : function(columnsTable){
						if(this.lastEdittedDetail && this.lastEdittedDetail.propName === "DataTypeCategory"){
							var lastRowChanged = this.lastEdittedDetail.rowIndex;
							var dataTypeField = columnsTable.getRows()[lastRowChanged].getCells()[this.lastEdittedDetail.columnIndex + 1];
							var dataTypeValue = dataTypeField.getValue();
							if(dataTypeValue === ""){
								var message = "Data Type value was not selected, previous changes will be reverted";
								CDSEditorUtil.showMessageToast(message, columnsTable, "-10px -100px");
							}
						}
						//TODO: add more validation clauses
					}

			};

			return ColumnsPane;

		});