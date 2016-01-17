/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeRestrictionValue",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/SqlAnyToAttributes",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/AddAttribute",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/AddRestrictionForAttribute",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/RemoveRestrictionForAttribute",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/RemoveRestrictedAttribute",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeModel",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeAttribute",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/commands/ChangeRestrictionType",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/images/Images",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ConditionalComboBox",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ConditionalOperatorComboBox",
    "sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/view/ConditionalValueHelpField",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/dialogs/ValueHelpDialog",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/viewmodel/ModelProxyResolver",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/view/dialogs/SqlColumnValueHelpDialog",
    "sap/watt/hanaplugins/editor/plugin/hdbcalculationview/dialogs/NewFindDialog"

], function(
	ChangeRestrictionValue,
	SqlAnyToAttributes,
	AddAttribute,
	AddRestrictionForAttribute,
	RemoveRestrictionForAttribute,
	RemoveRestrictedAttribute,
	ChangeModel,
	ChangeAttribute,
	ChangeRestrictionType,
	Images,
	ConditionalComboBox,
	ConditionalOperatorComboBox,
	ConditionalValueHelpField,
	ValueHelpDialog,
	ModelProxyResolver,
	SqlColumnValueHelpDialog,
	FindDialog) {

	jQuery.sap.declare("sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.RestrictedAttributesSection");

	var RestrictedAttributesSection = sap.ui.core.Control.extend(
		"sap.watt.hanaplugins.editor.plugin.hdbanalyticprivilege.view.RestrictedAttributesSection", {

			_modelTable: null,
			_treeTable: null,
			_modelAccessService: null,
			_operatorComboBox: null,
			_typeComboBox: null,
			_typeListBox: null,

			metadata: {

				properties: {
					context: {
						type: "any"
					},
					privilegeType: {
						type: "string"
					}
				},
				aggregations: {
					_restrictionPanel: {
						type: "sap.ui.commons.layout.MatrixLayout",
						multiple: false
					},

					_restrictionTable: {
						type: "sap.ui.table.TreeTable",
						multiple: false
					},
					_modelValueHelpDialog: {
						type: "Object",
						multiple: false
					},
					_attributeValueHelpDialog: {
						type: "Object",
						multiple: false
					},
					_filterValueHelpDialog: {
						type: "Object",
						multiple: false
					}
				}
			},

			renderer: {
				render: function(oRm, oControl) {

					oRm.write("<div ");
					oRm.writeControlData(oControl);
					oRm.writeClasses();
					oRm.writeStyles();
					oRm.write(">");
					oRm.renderControl(oControl.getAggregation("_restrictionPanel"));
					oRm.write("</div>");
				}

			},

			init: function() {
				var that = this;
				this.createTreeTable();
				var treeTablePanel = new sap.ui.commons.Panel({
					title: new sap.ui.core.Title({
						text: "{i18n>tit_restricted_attributes}"
					}),
					height: "100%",
					showCollapseIcon: false,
					content: that._treeTable
				});

				var oMatrixLayout = new sap.ui.commons.layout.MatrixLayout({
					height: "100%",
					columns: 1
				});

				var oRowForTables = new sap.ui.commons.layout.MatrixLayoutRow({
					height: "100%",
					width: "100%"
				});

				var oCellForTreeTable = new sap.ui.commons.layout.MatrixLayoutCell({
					height: "100%",
					width: "100%",
					vAlign: sap.ui.commons.layout.VAlign.Top
				});

				oCellForTreeTable.addContent(treeTablePanel);
				oRowForTables.addCell(oCellForTreeTable);
				oMatrixLayout.addRow(oRowForTables);

				this.setAggregation("_restrictionPanel", oMatrixLayout);
			},

			onBeforeRendering: function() {
				var that = this;
				if (that._typeListBox === null) {

					var modulePath = "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege";

					var oTypeListBox = new sap.ui.commons.ListBox({
						displayIcons: true,
						items: [
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_fixed_value"),
								key: "valueFilter"
							}),
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_catalog_procedure"),
								key: "CatalogProcedureFilter",
								icon: modulePath + Images.PROCEDURE
							}),
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_repository_procedure"),
								key: "RepositoryProcedureFilter",
								icon: modulePath + Images.PROCEDURE
							})
                    ]
					});

					var oTypeListBoxSQL = new sap.ui.commons.ListBox({
						displayIcons: true,
						items: [
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_fixed_value"),
								key: "valueFilter"
							})
                    ]
					});

					if (that.getModel().getData().privilegeType === "SQL_ANALYTIC_PRIVILEGE") {
						that._typeListBox = oTypeListBoxSQL;
						that._typeComboBox.setListBox(oTypeListBoxSQL);
					} else {
						that._typeListBox = oTypeListBox;
						that._typeComboBox.setListBox(oTypeListBox);
					}

					var oOperatorListBox = new sap.ui.commons.ListBox({
						displayIcons: true,
						items: [
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_between"),
								//text: "Between",
								key: "BT",
								icon: modulePath + Images.BETWEEN
							}),
                        new sap.ui.core.ListItem({
								icon: modulePath + Images.EQUAL,
								text: that.getModel("i18n").getProperty("txt_equal"),
								//text: "Equal",
								key: "EQ"
							}),
                        new sap.ui.core.ListItem({
								icon: modulePath + Images.GREATER_EQUAL,
								text: that.getModel("i18n").getProperty("txt_greater_equal"),
								//text: "Greater or Equal",
								key: "GE"
							}),
                        new sap.ui.core.ListItem({
								icon: modulePath + Images.GREATER_THAN,
								text: that.getModel("i18n").getProperty("txt_greater_than"),
								//text: "Greater Than",
								key: "GT"
							}),
                        new sap.ui.core.ListItem({
								icon: modulePath + Images.LESSER_EQUAL,
								text: that.getModel("i18n").getProperty("txt_less_equal"),
								//text: "Less or Equal",
								key: "LE"
							}),
                        new sap.ui.core.ListItem({
								icon: modulePath + Images.LESSER_THAN,
								text: that.getModel("i18n").getProperty("txt_less_than"),
								//text: "Less Than",
								key: "LT"
							}),
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_contains_pattern"),
								//text: "Contains Pattern",
								key: "CP"
							}),
                        new sap.ui.core.ListItem({
								icon: modulePath + Images.IS_NULL,
								text: that.getModel("i18n").getProperty("txt_is_null"),
								//text: "Not Is Null",
								key: "NU"
							}),
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_not_is_null"),
								//text: "Not Is Null",
								key: "NL"
							}),
                        new sap.ui.core.ListItem({
								text: that.getModel("i18n").getProperty("txt_in"),
								//text: "In",
								key: "IN"
							})
                    ]
					});

					if (that.getModel().getData().privilegeType === "SQL_ANALYTIC_PRIVILEGE") {
						oOperatorListBox.addItem(new sap.ui.core.ListItem({
							text: that.getModel("i18n").getProperty("txt_not_contains_pattern"),
							//text: "In",
							key: "NCP"
						}));
						oOperatorListBox.addItem(new sap.ui.core.ListItem({
							text: that.getModel("i18n").getProperty("txt_not_equal"),
							//text: "In",
							key: "NE"
						}));
					} else {
						//Column "shared" should only be displayed in classical privilege ui
						var oColShared = new sap.ui.table.Column({
							label: "{i18n>tit_shared}",
							template: new sap.ui.commons.CheckBox({
								enabled: false
							}).bindProperty("checked", {

								parts: ["dimensionUri"],
								formatter: function(dimensionUri) {
									if (dimensionUri !== undefined) {
										return true;
									} else {
										return false;
									}
								}
							}),
							width: "6%",
							hAlign: "Center"
						});

						var columns = that._treeTable.getColumns();

						//Reduce width of other columns to fit in the new one
						columns[1].setWidth("13%");
						columns[2].setWidth("6%");

						that._treeTable.insertColumn(oColShared, 2);
					}

					oOperatorListBox.setDisplayIcons(true);
					oOperatorListBox.setMinWidth("300px");

					that._operatorComboBox.setListBox(oOperatorListBox);
				}
			},

			createTreeTable: function() {
				var that = this;
				jQuery.sap.require("sap.ui.table.TreeTable");
				var oTable = new sap.ui.table.TreeTable({
					selectionMode: sap.ui.table.SelectionMode.Multi,
					height: "100%",
					width: "100%",
					rowHeight: 32,
					visibleRowCountMode: sap.ui.table.VisibleRowCountMode.Auto,
					minAutoRowCount: 2,
					toggleOpenState: function() {
						// that._treeTable.rerender();
					}
				});

				var modulePath = "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege";

				var oColAttributes = new sap.ui.table.Column({
					label: "{i18n>tit_attribute}",
					template: new ConditionalValueHelpField({
						icon: new sap.ui.commons.Image({
							src: modulePath + Images.ATTRIBUTE
						})
					}).bindProperty(
						"value", "attributeName").bindProperty("tooltip", "technicalName").setProperty("onValueHelpRequest",
						function() {
							var parent = this.getParent();
							var rowIndex = parent.getIndex();
							if (that._treeTable.getSelectedIndex() !== rowIndex) {

								that._treeTable.setSelectedIndex(rowIndex);
								that._treeTable.fireRowSelectionChange({
									rowIndex: rowIndex
								});
								that._treeTable.getSelectedIndex();
							}
							that.displayAttributeValueHelp("");
						}),
					width: "10%"
				});
				oTable.addColumn(oColAttributes);

				var oColDimension = new sap.ui.table.Column({
					label: "{i18n>tit_origin}",
					template: new sap.ui.commons.Label().bindProperty("text", {

						parts: ["dimensionUri", "originInformationModelUri"],
						formatter: function(dimensionUri, originInformationModelUri) {
							var oResult = "";
							if (dimensionUri !== undefined) {
								var startPos = dimensionUri.lastIndexOf("/");
								oResult = dimensionUri.substring(startPos + 1);
							} else if (originInformationModelUri !== undefined) {
								var startPos = originInformationModelUri.lastIndexOf("/");
								oResult = originInformationModelUri.substring(startPos + 1);
							}
							return oResult;
						}

					}).bindProperty("icon", {
						parts: ["dimensionUri", "originInformationModelUri"],
						formatter: function(dimensionUri, originInformationModelUri) {
							var oResult = "";
							if (dimensionUri !== undefined) {
								var aUriParts = dimensionUri.split("/");
								return that.typeIcon(aUriParts[2]);
							} else if (originInformationModelUri !== undefined) {
								var aUriParts = originInformationModelUri.split("/");
								return that.typeIcon(aUriParts[2]);
							}
							return oResult;
						}
					}),
					width: "15%"
				});

				oTable.addColumn(oColDimension);

				//oTable.setSelectionMode(sap.ui.table.SelectionMode.Single);

				var oColCount = new sap.ui.table.Column({
					label: "{i18n>tit_count}",
					template: "count",
					width: "10%"
				});
				oTable.addColumn(oColCount);

				var modulePath = "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege";

				var oTypeImage = new sap.ui.commons.Image();
				/*{
                src : {
                    path : "type",
                    formatter : $.proxy(that.typeIcon, that),
                    mode: sap.ui.model.BindingMode.OneWay
                }
            });*/
				oTypeImage.bindProperty("src", "type", $.proxy(that.typeIcon, that));

				var oTypeComboBox = new ConditionalComboBox({
					icon: oTypeImage
				});
				oTypeComboBox.bindProperty("selectedKey", {
					path: "type",
					mode: sap.ui.model.BindingMode.OneWay
				});

				oTypeComboBox.bindProperty("filterType", "type");

				//The type change event has to be fired here... Trying to realize it in the PropertyBinding caused problems because the table 
				//has to rerender and the focusinfo needs to be updated inside the command (otherwise undo-redo is not working...)
				oTypeComboBox.setProperty("handleChange", function() {
					if (that.getModel() !== undefined) {
						var customData = this.getCustomData();
						var parent = customData[1].getValue();
						var rowIndex = parent.getIndex();
						if (that._treeTable.getSelectedIndex() !== rowIndex) {

							that._treeTable.setSelectedIndex(rowIndex);
							that._treeTable.fireRowSelectionChange({
								rowIndex: rowIndex
							});
						}

						var oValue = this.getSelectedKey();
						var oData = that.getModel().getData();
						var iSelectedIndex = that._treeTable.getSelectedIndex();
						var context = that._treeTable.getContextByIndex(iSelectedIndex);
						var oCmdChangeRestrictionType = new ChangeRestrictionType(oValue, context, that._treeTable, this);
						oData._undoManager.execute(oCmdChangeRestrictionType);
					}
				});

				oTypeComboBox.setProperty("onButtonPress",
					function() {
						var customData = this.getCustomData();
						var parent = customData[0].getValue();
						var rowIndex = parent.getIndex();
						if (that._treeTable.getSelectedIndex() !== rowIndex) {

							that._treeTable.setSelectedIndex(rowIndex);
							that._treeTable.fireRowSelectionChange({
								rowIndex: rowIndex
							});
						}
						var iSelectedIndex = that._treeTable.getSelectedIndex();
						var oContext = that._treeTable.getContextByIndex(iSelectedIndex);
						var oObject = oContext.getObject();

						var restrictionIndex = oObject.index;
						var attributeName = oObject.attributeName;

						that.addRestriction(restrictionIndex, attributeName);
						that.expandRowForModelIndex(iSelectedIndex);
					}

				);

				that._typeComboBox = oTypeComboBox;

				var oColTypes = new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "{i18n>tit_restriction_type}"
					}),
					template: that._typeComboBox,
					width: "20%"
				});

				oTable.addColumn(oColTypes);

				var oImage = new sap.ui.commons.Image();
				oImage.bindProperty("src", "operator", $.proxy(that.operatorIcon, that));

				var oOperatorComboBox = new ConditionalOperatorComboBox({
					icon: oImage
				});

				oOperatorComboBox.setListBox(that._operatorListBox);
				oOperatorComboBox.bindProperty("filterType", "type");
				oOperatorComboBox.bindProperty("selectedKey", "operator");
				oOperatorComboBox.setPlaceholder("select");

				oOperatorComboBox.setProperty("handleChange", function() {
					if (that.getModel() !== undefined) {
						var customData = this.getCustomData();
						var parent = customData[1].getValue();
						var rowIndex = parent.getIndex();
						if (that._treeTable.getSelectedIndex() !== rowIndex) {

							that._treeTable.setSelectedIndex(rowIndex);
							that._treeTable.fireRowSelectionChange({
								rowIndex: rowIndex
							});
						}
					}
				});

				that._operatorComboBox = oOperatorComboBox;

				var oColOperators = new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "{i18n>tit_operator}"
					}),
					template: that._operatorComboBox,
					width: "20%"
				});

				oTable.addColumn(oColOperators);

				var oConditionalValueHelpField = new ConditionalValueHelpField({
					enabled:{
						parts:["type", "operator"],
						formatter:function(type, operator){
						var oResult = false;
						if (type !== undefined && type !== "" && operator !== "NL" && operator !== "NU" ) {
							oResult = true;
						} else {
							oResult = false;
						}
						return oResult;
					
							
						}
					}
				});
				oConditionalValueHelpField.bindProperty("value", {

					parts: ["value", "lowValue", "highValue"],
					formatter: function(value, low, high) {
						var oResult = "";
						if (value !== undefined) {
							oResult = value;
						} else if (low !== undefined && high !== undefined) {
							oResult = low + " - " + high;
						}

						return oResult;
					},
					mode: sap.ui.model.BindingMode.OneWay
				});

				oConditionalValueHelpField.bindProperty("enableValueHelp", {
					parts: ["type", "operator"],
					formatter: function(type, operator) {
						var oResult = false;
						if (type !== undefined && type !== "" && operator !== "NL") {
							oResult = true;
						} else {
							oResult = false;
						}

						return true;
					},
					mode: sap.ui.model.BindingMode.OneWay
				});
				
	    oConditionalValueHelpField.setProperty("onChange",function(event){
			    var oData = that.getModel().getData();
				var context = event.getSource().getBindingContext();
				if(context){
				var oldValue = event.getSource().getBindingContext().getProperty("").value;
				var newValue = event.getParameter("newValue");
				if(oldValue !== newValue){
				var oCmdChangeRestrictionValue = new ChangeRestrictionValue(newValue, context);
				oData._undoManager.execute(oCmdChangeRestrictionValue);
			    	}
				}
			});

				oConditionalValueHelpField.setProperty("onValueHelpRequest",
					function() {
						var parent = this.getParent();
						var rowIndex = parent.getIndex();
						if (that._treeTable.getSelectedIndex() !== rowIndex) {

							that._treeTable.setSelectedIndex(rowIndex);
							that._treeTable.fireRowSelectionChange({
								rowIndex: rowIndex
							});
						}
						var iSelectedIndex = that._treeTable.getSelectedIndex();
						var oContext = that._treeTable.getContextByIndex(iSelectedIndex);
						var oObject = oContext.getObject();
						var restrictionType = oObject.type;
						if (restrictionType === "CatalogProcedureFilter") {
							that.displayProcedureValueHelp("CatalogProcedureFilter");
						} else if (restrictionType === "RepositoryProcedureFilter") {
							that.displayProcedureValueHelp("RepositoryProcedureFilter");
						} else {
							that.displayDialogForFixedValueHelp();
						}
					});

				var oColValues = new sap.ui.table.Column({
					label: new sap.ui.commons.Label({
						text: "{i18n>tit_value}"
					}),
					template: oConditionalValueHelpField,
					width: "25%"
				});

				oTable.addColumn(oColValues);

				oTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.RowSelector);

				//Delete Button
				var oDeleteBtn = new sap.ui.commons.Button({
					icon: "sap-icon://delete",
					text: "{i18n>txt_remove}",
					enabled: false,
					press: function() {
						var oI18N = that.getModel("i18n");
						sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_delete_row"), $.proxy(that.removeRestriction, that), oI18N.getProperty(
							"tit_confirm_row"));
					}
				});
				oTable.attachRowSelectionChange(function(oEvent) {
					var aIndicies = oEvent.getSource().getSelectedIndices();
					if (aIndicies.length > 0) {
						oDeleteBtn.setEnabled(true);
					} else {
						oDeleteBtn.setEnabled(false);
					}
				});

				// Toolbar
				var oToolbar = new sap.ui.commons.Toolbar({
					items: [
                    new sap.ui.commons.Button({
							icon: "sap-icon://add",
							text: "{i18n>txt_add}",
							press: function() {
								if (that.getModel().getData()._apeModel.analyticPrivilege.restrictions === undefined) {
									var oI18N = that.getModel("i18n");
									sap.ui.commons.MessageBox.confirm(oI18N.getProperty("txt_any_to_attributes"), $.proxy(that.addFirstRestrictionRow, that),
										oI18N.getProperty("tit_confirm_attribute"));
								} else {
									that.displayAttributeValueHelp(true);
									//that.addRestrictionRow();
								}
							}
						}).bindProperty("enabled", {
							parts: ["securedModels"],
							formatter: function(models) {
								if (models.length > 0) {
									return true;
								} else {
									return false;
								}
							}
						}), oDeleteBtn
                ]
				});

				oTable.setToolbar(oToolbar);

				this._treeTable = oTable;
				this.setAggregation("_restrictionTable", oTable);
				this._treeTable.bindRows("/restrictions");
			},

			addFirstRestrictionRow: function(confirmed) {
				var that = this;
				if (confirmed) {

					if (that.getModel() !== undefined) {
						var oData = that.getModel().getData();
						var oCmdAddAttribute = new AddAttribute(that.getModel());
						var oCmdAnyToAttribute = new SqlAnyToAttributes(that.getModel(), oCmdAddAttribute);
						oData._undoManager.execute(oCmdAnyToAttribute);
						that._treeTable.rerender();
					}
				}
			},

			addRestrictionRow: function(attributeName, modelName, isPartOfDimension) {
				var that = this;
				if (that.getModel() !== undefined) {
					var oData = that.getModel().getData();
					var oCmdAddAttribute = new AddAttribute(that.getModel(), attributeName, modelName, isPartOfDimension);
					oData._undoManager.execute(oCmdAddAttribute);
					that._treeTable.rerender();
				}

			},

			addRestriction: function(iIndex, sAttributeName) {
				var that = this;
				if (that.getModel() !== undefined) {
					var oData = that.getModel().getData();
					var oCmdAddRestrictionForAttribute = new AddRestrictionForAttribute(that.getModel(), iIndex, sAttributeName);
					oData._undoManager.execute(oCmdAddRestrictionForAttribute);
				}

			},

			expandRowForModelIndex: function(iIndex) {
				this._treeTable.expand(iIndex);
			},

			removeRestriction: function(confirmed) {
				var that = this;
				if (confirmed) {
					if (that.getModel() !== undefined) {
						var oData = that.getModel().getData();
						var iSelectedIndices = that._treeTable.getSelectedIndices();
						var contextArray = [];
						for (var i = 0; i < iSelectedIndices.length; i++) {
							var iSelectedIndex = iSelectedIndices[i];
							var context = that._treeTable.getContextByIndex(iSelectedIndex);
							contextArray.push(context);
						}

						var aPathParts = contextArray[0].sPath.split("/");
						if (aPathParts.length > 3) {
							var oCmdRemoveRestrictionForAttribute = new RemoveRestrictionForAttribute(contextArray);
							oData._undoManager.execute(oCmdRemoveRestrictionForAttribute);
						} else {
							var oCmdRemoveRestrictedAttribute = new RemoveRestrictedAttribute(contextArray);
							oData._undoManager.execute(oCmdRemoveRestrictedAttribute);
						}
					}
					that._treeTable.clearSelection();
				}

			},

			displayModelValueHelp: function() {
				var that = this;
				var fnCallBack = function(selectedAttribute) {
					var iSelectedIndex = that._treeTable.getSelectedIndex();
					var context = that._treeTable.getContextByIndex(iSelectedIndex);
					var oCmdChangeModel = new ChangeModel(selectedAttribute.name, context);
					that.getModel().getData()._undoManager.execute(oCmdChangeModel);
					that._treeTable.rerender();
				};

				var viewModel = that.createJsonForModelValueHelp();
				var oI18N = that.getModel("i18n");
				var valueHelpDialog = new ValueHelpDialog({
					fnCallBack: fnCallBack,
					model: viewModel,
					title: oI18N.getProperty("tit_models")
				});

				valueHelpDialog.openDialog();

			},

			createJsonForModelValueHelp: function() {
				var oSecuredModels = this.getModel().oData.securedModels;
				var oData = {
					"RootNode": {
						"childNodes": []
					}
				};
				for (var i = 0; i < oSecuredModels.length; i++) {
					oData["RootNode"]["childNodes"][i] = {
						"name": oSecuredModels[i].modelUri,
						"nodetype": "element"
					};
				}

				return oData;
			},

			displayAttributeValueHelp: function(addButtonPressed) {
				var that = this;

				var fnCallBack = function(selectedAttribute) {
					var iSelectedIndex = that._treeTable.getSelectedIndex();
					var context = that._treeTable.getContextByIndex(iSelectedIndex);

					if (addButtonPressed === true) {
						if (selectedAttribute.parentNodeType === "dimension" || selectedAttribute.parentNode.indexOf("attributeviews") >= 0) {
							that.addRestrictionRow(selectedAttribute.name, selectedAttribute.parentNode, true);
						} else {
							that.addRestrictionRow(selectedAttribute.name, selectedAttribute.parentNode, false);
						}
					} else {
						var oCmdChangeAttribute = null;

						if (selectedAttribute.parentNodeType === "dimension" || selectedAttribute.parentNode.indexOf("attributeviews") >= 0) {
							oCmdChangeAttribute = new ChangeAttribute(selectedAttribute.name, context, selectedAttribute.parentNode, true);
						} else {
							oCmdChangeAttribute = new ChangeAttribute(selectedAttribute.name, context, selectedAttribute.parentNode, false);
						}
						that.getModel().getData()._undoManager.execute(oCmdChangeAttribute);
						that._treeTable.rerender();
					}
				};

				var oI18N = that.getModel("i18n");
				var fnOpenDialog = function(viewModel) {
					var valueHelpDialog = new ValueHelpDialog({
						modal: true,
						fnCallBack: fnCallBack,
						model: viewModel,
						title: oI18N.getProperty("tit_attributes")
					});

					valueHelpDialog.openDialog();
				};

				that.createJSONModelForAttributeValueHelp(fnOpenDialog);
			},

			//Needs refactoring: Remove duplicated code!! 
			createJSONModelForAttributeValueHelp: function(fnOpenDialog) {
				var that = this;
				var oData = that.getModel().getData();
				var oSecuredModels = oData.securedModels;
				var entities = [];
				var dimensions = [];
				var attributes = [];

				var oModelData = {
					"RootNode": {
						"childNodes": []
					}
				};

				for (var index = 0; index < oSecuredModels.length; index++) {

					var modelUri = oSecuredModels[index].modelUri;
					var uriParts = modelUri.split("/");
					var modelType = uriParts[2];
					var modelIconPath = that.typeIcon(modelType);
					var elements = oSecuredModels[index].metadata;
					//var dimensions = oSecuredModels.dimensions;

					oModelData["RootNode"]["childNodes"][index] = {
						"name": modelUri,
						"childNodes": [],
						"iconpath": modelIconPath
					};

					for (var i = 0; i < elements.size(); i++) {
						if (elements.getAt(i).aggregationBehavior === "none") {
							if (elements.getAt(i).sharedDimension !== undefined) {
								var sharedDimensionName = elements.getAt(i).sharedDimension;
								var aDimUriParts = sharedDimensionName.split("::");
								var sPackagename = aDimUriParts[0];
								var sDimensionName = aDimUriParts[1];
								var dimensionType = null;
								var sAttributeName = null;

								if (modelType === "calculationviews") {
									dimensionType = "calculationviews";
								} else {
									dimensionType = "attributeviews";
								}

								var sDimensionUri = "/" + sPackagename + "/" + dimensionType + "/" + sDimensionName;
								if (dimensions.indexOf(elements.getAt(i).sharedDimension) < 0) {
									dimensions.push(elements.getAt(i).sharedDimension);
									var dimensionIconPath = that.typeIcon(dimensionType);
									oModelData["RootNode"]["childNodes"][index]["childNodes"][dimensions.indexOf(elements.getAt(i).sharedDimension)] = {
										"name": sDimensionUri,
										"nodetype": "dimension",
										"parentNode": modelUri,
										"childNodes": [],
										"iconpath": dimensionIconPath
									};
								}

								if (oData.privilegeType !== "SQL_ANALYTIC_PRIVILEGE") {
									sAttributeName = elements.getAt(i).nameInSharedDimension;
								} else {
									sAttributeName = elements.getAt(i).name;
								}
								oModelData["RootNode"]["childNodes"][index]["childNodes"][dimensions.indexOf(elements.getAt(i).sharedDimension)]["childNodes"].push({
									"name": sAttributeName,
									"nodetype": "element",
									"parentNodeType": "dimension",
									"parentNode": sDimensionUri,
									"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/images/Attribute.png"
								});
							} else {
								attributes.push({
									"name": elements.getAt(i).name,
									"nodetype": "element",
									"parentNodeType": "cube",
									"parentNode": oSecuredModels[index].modelUri,
									"iconpath": "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/images/Attribute.png"
								});
							}

						}
					}
					for (var i = 0; i < attributes.length; i++) {
						oModelData["RootNode"]["childNodes"][index]["childNodes"].push(attributes[i]);
					}

					attributes = [];

				}

				fnOpenDialog(oModelData);
			},

			displayProcedureValueHelp: function(procedureType) {
				var that = this;

				var objectTypes = null;
				if (procedureType === "CatalogProcedureFilter") {
					objectTypes = ["CATALOG_PROCEDURE"];
				} else {
					objectTypes = ["REPO_PROCEDURE"];
				}

				var findDialog = new FindDialog("find", {
					types: objectTypes,
					noOfSelection: 1, // multiselect if not specified? 
					onOK: function(results) {
						if (results && results !== null) {
							for (var i = 0; i < results.length; i++) {
								var prop = results[i];
								var procedureName = prop.name;
								if (prop.packageName !== undefined) {
									procedureName = prop.packageName + "::" + prop.name;
								} else if (prop.schemaName !== undefined) {
									procedureName = "\"" + prop.schemaName + "\"." + prop.name;
								}

								if (that.getModel() !== undefined) {
									var oData = that.getModel().getData();
									var iSelectedIndex = that._treeTable.getSelectedIndex();
									var context = that._treeTable.getContextByIndex(iSelectedIndex);
									var oCmdChangeRestrictionValue = new ChangeRestrictionValue(procedureName, context);
									oData._undoManager.execute(oCmdChangeRestrictionValue);
								}

							}
						}
					}
				});
			},

			displayDialogForFixedValueHelp: function() {
				var that = this;
				var oData = that.getModel().getData();
				var iSelectedIndex = that._treeTable.getSelectedIndex();
				var context = that._treeTable.getContextByIndex(iSelectedIndex);
				var selectedRestriction = context.getObject();
				var aPathParts = context.sPath.split("/");
				var iIndex1 = parseInt(aPathParts[2]);
				var oAttribute = oData.restrictions[iIndex1];
				var sUri = null;
				if (oAttribute.dimensionUri !== undefined) {
					sUri = oAttribute.dimensionUri;
				} else {
					sUri = oAttribute.originInformationModelUri;
				}

//				var aUriParts = sUri.split("/");
//				var sPackageName = aUriParts[1];
//				var sDataSourceName = aUriParts[3];
				
				var sDataSourceName = sUri;
				
				var sColumnName = oAttribute.attributeName;

				var oOperator = selectedRestriction.operator;
				var oOldValue = []; // selectedRestriction.value;

				if (selectedRestriction.lowValue && selectedRestriction.highValue) {
					oOldValue.push(selectedRestriction.lowValue);
					oOldValue.push(selectedRestriction.highValue);
				}

				var valueHelpCallback = function(object) {
					if (that.getModel() !== undefined) {
						var oCmdChangeRestrictionValue = new ChangeRestrictionValue(object, context);
						oData._undoManager.execute(oCmdChangeRestrictionValue);
					}
				};

				var oI18N = that.getModel("i18n");
				var valueHelpDialog = new SqlColumnValueHelpDialog({
					context: that.getContext(),
					tableData: {
						dataSourceName: sDataSourceName,
						columnName: sColumnName,
						//packageName: sPackageName,
						isTable: false
					},
					callback: valueHelpCallback,
					dialogtype: {
						Operator: oOperator,
						oldValue: oOldValue,
						dialogTitle: oI18N.getProperty("tit_value_help")
					}

				});
				valueHelpDialog.onValueHelpRequest();

			},

			operatorIcon: function(sOperator) {

				var modulePath = "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege";

				var sResult;
				switch (sOperator) {
					case "BT":
						sResult = Images.BETWEEN;
						break;
					case "EQ":
						sResult = Images.EQUAL;
						break;
					case "GE":
						sResult = Images.GREATER_EQUAL;
						break;
					case "GT":
						sResult = Images.GREATER_THAN;
						break;
					case "LE":
						sResult = Images.LESSER_EQUAL;
						break;
					case "LT":
						sResult = Images.LESSER_THAN;
						break;
					case "NU":
						sResult = Images.IS_NULL;
						break;
					default:
						sResult = null;

				}

				return sResult ? modulePath + sResult : null;

			},

			typeIcon: function(sType) {

				var modulePath = "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege";

				var sResult;
				switch (sType) {
					case "CatalogProcedureFilter":
						sResult = Images.PROCEDURE;
						break;
					case "RepositoryProcedureFilter":
						sResult = Images.PROCEDURE;
						break;
					case "analyticviews":
						sResult = Images.ANALYTIC_VIEW;
						break;
					case "attributeviews":
						sResult = Images.ATTRIBUTE_VIEW;
						break;
					case "calculationviews":
						sResult = Images.CALCULATION_VIEW;
						break;
					default:
						sResult = null;
				}

				return sResult ? modulePath + sResult : null;

			},

			getTreeTable: function() {
				return this._treeTable;
			}
		});

	return RestrictedAttributesSection;
});
