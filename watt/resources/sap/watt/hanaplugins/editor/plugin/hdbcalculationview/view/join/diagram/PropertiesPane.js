/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../../util/ResourceLoader",
        "../../../base/modelbase",
        "../../../viewmodel/commands",
        "../../../viewmodel/model",
        "../../CalcViewEditorUtil",
        "../../dialogs/SpatialJoinValueHelpDialog"
    ],
	function(ResourceLoader, modelbase, commands, viewModel, CalcViewEditorUtil, SpatialJoinValueHelpDialog) {
		"use strict";

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		/**
		 * @class
		 */
		var PropertiesPane = function(parameters) {
			this._undoManager = parameters.undoManager;
			this.viewNode = parameters.viewNode;
			this._model = parameters.model;
			this.mainLayout = null;
			this.dataModel = new sap.ui.model.json.JSONModel();

		};

		PropertiesPane.prototype = {

			_execute: function(command) {
				return this._undoManager.execute(command);
			},

			close: function() {

				if (this.dataModel) {
					this.dataModel.destroy();
				}
				if (this.mainLayout) {
					this.mainLayout.destroy();
				}
				if (this.joinPropertiesLayout) {
					this.joinPropertiesLayout.destroy();
				}
				if (this.inputPropertiesLayout) {
					this.inputPropertiesLayout.destroy();
				}
				if (this.elementPropertiesLayout) {
					this.elementPropertiesLayout.destroy();
				}

			},

			getContent: function() {
				this.mainLayout = new sap.ui.commons.layout.VerticalLayout();
				this.mainLayout.setModel(this.dataModel);
				this.mainLayout.addStyleClass("customProperties");

				//this.mainLayout.addContent(this.getJoinPropertiesContent());
				return this.mainLayout;
			},

			setProperty: function(object, parent) {
				// remove existing content
				if (this.mainLayout) {
					if (object) {
						this.object = object
						if (object instanceof viewModel.Join) {
							if (this.mainLayout.getContent() && this.mainLayout.getContent().length === 1) {
								if (this.mainLayout.getContent()[0] !== this.getJoinPropertiesContent()) {
									this.mainLayout.removeContent(0);
									this.mainLayout.addContent(this.getJoinPropertiesContent());
								}
							} else {
								this.mainLayout.addContent(this.getJoinPropertiesContent());
							}
						} else if (object instanceof viewModel.Input) {
							if (this.mainLayout.getContent() && this.mainLayout.getContent().length === 1) {
								if (this.mainLayout.getContent()[0] !== this.getInputPropertiesContent()) {
									this.mainLayout.removeContent(0);
									this.mainLayout.addContent(this.getInputPropertiesContent());
								}
							} else {
								this.mainLayout.addContent(this.getInputPropertiesContent());
							}
						} else if (object instanceof viewModel.Element) {
							if (parent && parent.getSource() instanceof viewModel.ViewNode) {
								if (this.mainLayout.getContent() && this.mainLayout.getContent().length === 1) {
									if (this.mainLayout.getContent()[0] !== this.getViewNodeElementPropertiesContent()) {
										this.mainLayout.removeContent(0);
										this.mainLayout.addContent(this.getViewNodeElementPropertiesContent());
									}
								} else {
									this.mainLayout.addContent(this.getViewNodeElementPropertiesContent());
								}
							} else {
								if (this.mainLayout.getContent() && this.mainLayout.getContent().length === 1) {
									if (this.mainLayout.getContent()[0] !== this.getElementPropertiesContent()) {
										this.mainLayout.removeContent(0);
										this.mainLayout.addContent(this.getElementPropertiesContent());
									}
								} else {
									this.mainLayout.addContent(this.getElementPropertiesContent());
								}
							}
						} else {
							if (this.mainLayout.getContent() && this.mainLayout.getContent().length === 1) {
								this.mainLayout.removeContent(0);
							}
						}
					} else {
						if (this.mainLayout.getContent() && this.mainLayout.getContent().length === 1) {
							this.mainLayout.removeContent(0);
						}

					}
					this.updateProperties();
				}
			},

			getInputPropertiesContent: function() {

				if (!this.inputPropertiesLayout) {

					this.inputPropertiesLayout = new sap.ui.commons.layout.VerticalLayout();
					//propertiesLayout.setModel(this.dataModel);

					var mLayout = new sap.ui.commons.layout.MatrixLayout({
						layoutFixed: true,
						widths: ["5%", "15%", "40%", "40%"]
					});

					var nameLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_name")
					}).addStyleClass("labelFloat");
					var nameField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{inputName}"
					});
					mLayout.createRow(null, nameLabel, nameField, null);

					var packageLabel = new sap.ui.commons.Label({
						text: {
							parts: ["packageName", "schemaName"],
							formatter: function(packageName, schemaName) {
								if (packageName) {
									return resourceLoader.getText("txt_package");
								}
								if (schemaName) {
									return resourceLoader.getText("txt_schema");
								}
							}
						},
						visible: "{isDataSource}"
					}).addStyleClass("labelFloat");
					var packageField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: {
							parts: ["packageName", "schemaName"],
							formatter: function(packageName, schemaName) {
								if (packageName) {
									return packageName;
								}
								if (schemaName) {
									return schemaName;
								}
							}
						},
						visible: "{isDataSource}"
					});
					mLayout.createRow(null, packageLabel, packageField, null);

					this.inputPropertiesLayout.addContent(mLayout);
				}
				return this.inputPropertiesLayout;
			},

			getElementPropertiesContent: function() {

				if (!this.elementPropertiesLayout) {

					this.elementPropertiesLayout = new sap.ui.commons.layout.VerticalLayout();
					//propertiesLayout.setModel(this.dataModel);

					var mLayout = new sap.ui.commons.layout.MatrixLayout({
						layoutFixed: true,
						widths: ["5%", "15%", "40%", "40%"]
					});

					var nameLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_name")
					}).addStyleClass("labelFloat");
					var nameField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{name}"
					});
					mLayout.createRow(null, nameLabel, nameField, null);

					var descLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_label")
					}).addStyleClass("labelFloat");
					var descField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{label}"
					});
					mLayout.createRow(null, descLabel, descField, null);

					var packageLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_data_type")
					}).addStyleClass("labelFloat");
					var packageField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{dataType}"
					});
					mLayout.createRow(null, packageLabel, packageField, null);

					this.elementPropertiesLayout.addContent(mLayout);
				}
				return this.elementPropertiesLayout;
			},

			getViewNodeElementPropertiesContent: function() {

				if (!this.viewNodeElementPropertiesLayout) {

					this.viewNodeElementPropertiesLayout = new sap.ui.commons.layout.VerticalLayout();
					//propertiesLayout.setModel(this.dataModel);

					var mLayout = new sap.ui.commons.layout.MatrixLayout({
						layoutFixed: true,
						widths: ["5%", "15%", "40%", "40%"]
					});

					var nameLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_name")
					}).addStyleClass("labelFloat");
					var nameField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{name}"
					});
					mLayout.createRow(null, nameLabel, nameField, null);

					var packageLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("tit_data_type")
					}).addStyleClass("labelFloat");
					var packageField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{dataType}"
					});
					mLayout.createRow(null, packageLabel, packageField, null);

					this.viewNodeElementPropertiesLayout.addContent(mLayout);
				}
				return this.viewNodeElementPropertiesLayout;
			},

			getJoinPropertiesContent: function() {
				var that = this;

				if (!this.joinPropertiesLayout) {

					this.joinPropertiesLayout = new sap.ui.commons.layout.VerticalLayout();
					//propertiesLayout.setModel(this.dataModel);

					var mLayout = new sap.ui.commons.layout.MatrixLayout({
						layoutFixed: true,
						widths: ["3%", "13%", "29%","6%", "17%", "29%", "3%"]
					});

					var leftInputLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_left_input")
					}).addStyleClass("labelFloat");
					var leftInputField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{leftInput}"
					});
					
					
					var swapBtn =null;
					
						if(this.viewNode.isStarJoin() === false){
				swapBtn	= new sap.ui.commons.Button({
					    icon:sap.ui.core.IconPool.getIconURI("sort"),
					    width:"100%",
					    tooltip : resourceLoader.getText("txt_swap"),
	                    press : function() {
	                        var parameter = {
				                    viewNodeName:  that.viewNode.name,
				                     joinName:0
				                        };
				            var command = new commands.swapInputInJoinCommand(parameter);
				            if( that.viewNode &&   that.viewNode.joins.get(0) &&  that.viewNode.joins.get(0).joinType===viewModel.JoinType.TEXT_TABLE && that.viewNode.joins.get(0).languageColumn){
					       	jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast");
							sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MessageToast.show(resourceLoader.getText("txt_language_col_del"), {
								offset: "-10px -100px"
							});
					       }
					       that._execute(command);
					     
					       
	                    }
                    }).addStyleClass("swapIconBtn");
					}
					var rightInputLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_right_input")
					}).addStyleClass("labelFloat");
					var rightInputField = new sap.ui.commons.TextField({
						width: "90%",
						enabled: false,
						value: "{rightInput}"
					});

					mLayout.createRow(null, leftInputLabel, leftInputField, swapBtn ,rightInputLabel, rightInputField, null);

					var joinTypeLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_join_type")
					}).addStyleClass("labelFloat");

					var joinTypeListItem = new sap.ui.core.ListItem();
					joinTypeListItem.bindProperty("text", "joinType");
					joinTypeListItem.bindProperty("key", "key");

					var joinTypeField = new sap.ui.commons.DropdownBox({
						width: "90%",
						selectedKey: "{joinType}",
						change: function(event) {
							var selecetdKey = event.getSource().getSelectedKey();
							var attributes = {
								objectAttributes: {
									joinType: selecetdKey
								}
							};
							if (selecetdKey === "textTable") {
								attributes.objectAttributes.cardinality = "C1_1";
								//var rightInput = "{rightInput}";
							} else {
								attributes.objectAttributes.languageColumn = undefined;
							}
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
							that.updateProperties();
						},
						enabled: {
							parts: ["join", "isSpatialJoin"],
							formatter: function(join, isSpatialJoin) {
								if (join && join !== null && !isSpatialJoin) {
									return true;
								}
								return false;
							}
						}
					});

					joinTypeField.bindItems({
						path: "/joinTypes",
						template: joinTypeListItem
					});

					var cardinalityLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_cardinality")
					}).addStyleClass("labelFloat");

					var cardinalityTypeListItem = new sap.ui.core.ListItem();
					cardinalityTypeListItem.bindProperty("text", "cardinalityType");
					cardinalityTypeListItem.bindProperty("key", "key");
					var cardinalityField = new sap.ui.commons.DropdownBox({
						width: "90%",
						selectedKey: "{cardinality}",
						enabled: {
							parts: ["joinType", "join"],
							formatter: function(joinType, join) {
								if (join && join !== null && joinType !== "textTable") {
									return true;
								}
								return false;
							}
						},
						change: function(event) {
							var selecetdKey = event.getSource().getSelectedKey();
							if (selecetdKey === "NONE") {
								selecetdKey = undefined;
							}
							var attributes = {
								objectAttributes: {
									cardinality: selecetdKey
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
							that.updateProperties();
						}

					});

					cardinalityField.bindItems({
						path: "/cardinalityTypes",
						template: cardinalityTypeListItem
					});

					mLayout.createRow(null, joinTypeLabel, joinTypeField,null, cardinalityLabel, cardinalityField);

					this.dynamicJoinCB = new sap.ui.commons.CheckBox({
						text: resourceLoader.getText("txt_dynamic_join"),
						tooltip: resourceLoader.getText("txt_dynamic_join"),
						checked: "{dynamic}",
						change: function(event) {
							var checked = event.getSource().getChecked();
							var attributes = {
								objectAttributes: {
									dynamic: checked
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						},
						enabled: {
							path: "join",
							formatter: function(join) {
								if (join) {
									if (join.leftElements.count() > 1) {
										return true;
									}
								}
								return false;
							}
						}
					});

					var languageColumnLabel = new sap.ui.commons.Label({
						text: resourceLoader.getText("txt_language_column")
					}).addStyleClass("labelFloat");

					var languageColumnListItem = new sap.ui.core.ListItem();
					languageColumnListItem.bindProperty("text", "name");
					languageColumnListItem.bindProperty("key", "name");

					var languageColumnField = new sap.ui.commons.DropdownBox({
						width: "90%",
						selectedKey: {
							path: "languageColumn",
							formatter: function(languageColumn) {
								if (languageColumn) {
									return languageColumn;
								} else {
									return "";
								}
							}
						},
						enabled: {
							path: "joinType",
							formatter: function(joinType) {
								return joinType === "textTable";
							}
						},
						change: function(event) {
							var selecetdKey = event.getSource().getSelectedKey();
							if (selecetdKey === "") {
								selecetdKey = undefined;
							}
							var attributes = {
								objectAttributes: {
									languageColumn: selecetdKey
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						}
					});
					languageColumnField.bindItems({
						path: "/languageColumns",
						template: languageColumnListItem
					});

					mLayout.createRow(null, null, this.dynamicJoinCB, null,languageColumnLabel, languageColumnField);

					var optimizeJoinColumnsCB = new sap.ui.commons.CheckBox({
						text: resourceLoader.getText("txt_optimize_join_columns"),
						tooltip: resourceLoader.getText("txt_optimize_join_columns"),
						checked: "{optimizeJoinColumns}",
						change: function(event) {
							var checked = event.getSource().getChecked();
							var attributes = {
								objectAttributes: {
									optimizeJoinColumns: checked
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						},
						enabled: {
							path: "join",
							formatter: function(join) {
								if (join) {
									return true;
								}
								return false;
							}
						}
					});

					mLayout.createRow(null, null, optimizeJoinColumnsCB);

					mLayout.createRow(null);

					this.joinPropertiesLayout.addContent(mLayout);

					if (!this.isStarJoin()) {
						// Spatial join not supported 
						this.joinPropertiesLayout.addContent(this._getSpatialJoinPropertiesContent());
					}

				}

				//propertiesLayout.addStyleClass("customProperties");

				return this.joinPropertiesLayout;
			},

			_getSpatialJoinPropertiesContent: function() {
				var that = this;
				this.spatialPropertiesLayout = new sap.ui.commons.layout.VerticalLayout();
				var headMatrixLayout = new sap.ui.commons.layout.MatrixLayout();
				headMatrixLayout.addStyleClass("headerHeight");
				var headerMatrixLayoutCell = new sap.ui.commons.layout.MatrixLayoutCell({
					vAlign: sap.ui.commons.layout.VAlign.Begin,
					hAlign: sap.ui.commons.layout.HAlign.Begin
				}).addStyleClass("parameterHeaderStyle");

				var headerName = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_spatial_join_properties"),
					design: sap.ui.commons.LabelDesign.Bold
				});

				headerMatrixLayoutCell.addContent(new sap.ui.commons.Label({
					width: "10px"
				}));
				headerMatrixLayoutCell.addContent(headerName);

				headMatrixLayout.createRow(headerMatrixLayoutCell);

				this.spatialPropertiesLayout.addContent(headMatrixLayout);

				var matrixLayout = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: true,
					widths: ["5%", "15%", "30%", "15%", "30%", "5%"]
				});

				matrixLayout.createRow(null);

				var predicateLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_spatial_predicate")
				}).addStyleClass("labelFloat");

				var predicateTypeListItem = new sap.ui.core.ListItem({});
				predicateTypeListItem.bindProperty("text", "predicateType");
				predicateTypeListItem.bindProperty("key", "key");

				var predicateField = new sap.ui.commons.DropdownBox({
					width: "90%",
					selectedKey: "{predicate}",
					change: function(event) {
						var selecetdKey = event.getSource().getSelectedKey();
						var attributes = {
							spatialJoinAttributes: {
								properties: {
									predicate: selecetdKey
								}
							}
						};
						var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
						that._execute(command);
					}
				});

				predicateField.bindItems({
					path: "/predicateTypes",
					template: predicateTypeListItem
				});

				var validateDistance = function(value) {
					var pattern = /^[-+]?[0-9]*\.?[0-9]+$/;
					return pattern.test(value);
				};

				var validateDistanceParamater = function(value) {
					var parameter;
					if (value.indexOf("$$") !== -1 && that._model && that._model.columnView) {
						var parameterName = value.substring(value.indexOf("$$") + 2, value.lastIndexOf("$$"));
						parameter = that._model.columnView.parameters.get(parameterName);
						if (parameter && parameter.isVariable) {
							parameter = undefined;
						}

					}
					return parameter;
				};

				var distanceLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_spatial_distance")
				}).addStyleClass("labelFloat");
				var distanceField = new sap.ui.commons.TextField({
					width: "90%",
					value: "{distance}",
					change: function(event) {
						var value = event.getParameter("newValue");
						if (validateDistance(value)) {
							CalcViewEditorUtil.clearErrorMessageTooltip(this);
							var attributes = {
								spatialJoinAttributes: {
									distance: {
										value: value
									}
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						} else if (validateDistanceParamater(value)) {
							var parameter = validateDistanceParamater(value);
							CalcViewEditorUtil.clearErrorMessageTooltip(this);
							var attributes = {
								spatialJoinAttributes: {
									distance: {
										parameter: parameter
									}
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						} else {
							CalcViewEditorUtil.showErrorMessageTooltip(this, resourceLoader.getText("msg_invalid_distance"));
						}
					},
					enabled: {
						path: "predicate",
						formatter: function(predicate) {
							return predicate === "WITHIN_DISTANCE";
						}
					}
				});

				matrixLayout.createRow(null, predicateLabel, predicateField, distanceLabel, distanceField, null);

				/*var predicateEvaluatesCB = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("txt_spatial_predicate_evaluates"),
                    tooltip: resourceLoader.getText("txt_spatial_predicate_evaluates"),
                    checked: "{predicateEvaluatesTo}",
                    change: function(event) {
                        var checked = event.getSource().getChecked();
                        var attributes = {
                            spatialJoinAttributes: {
                                properties: {
                                    predicateEvaluatesTo: checked
                                }
                            }
                        };
                        var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, "0", attributes);
                        that._execute(command);
                    }
                });*/

				var predicateEvaluatesLabel1 = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_spatial_predicate_evaluates_part_1")
				}).addStyleClass("labelFloat");
				var predicateEvaluatesLabel2 = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_spatial_predicate_evaluates_part_2")
				}).addStyleClass("labelFloat");
				var predicateEvaluatesCombo = new sap.ui.commons.DropdownBox({
					width: "90%",
					//value: resourceLoader.getText("txt_attribute"),
					selectedKey: "{predicateEvaluatesTo}",
					change: function(event) {
						var selecetdKey = event.getSource().getSelectedKey();

						var attributes = {
							spatialJoinAttributes: {
								properties: {
									predicateEvaluatesTo: selecetdKey
								}
							}
						};
						var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
						that._execute(command);
					}
				});
				predicateEvaluatesCombo.addItem(new sap.ui.core.ListItem({
					text: resourceLoader.getText("txt_true"),
					key: true
				}));

				predicateEvaluatesCombo.addItem(new sap.ui.core.ListItem({
					text: resourceLoader.getText("txt_false"),
					key: false
				}));

				var validateIntersectionMatrix = function(value) {
					var pattern = /[TF*012]$/;
					return pattern.test(value) && value.length === 9;
				};

				var validateIntersectionMatrixParamater = function(value) {
					var parameter;
					if (value.indexOf("$$") !== -1 && that._model && that._model.columnView) {
						var parameterName = value.substring(value.indexOf("$$") + 2, value.lastIndexOf("$$"));
						parameter = that._model.columnView.parameters.get(parameterName);
						if (parameter && parameter.isVariable) {
							parameter = undefined;
						}
					}
					return parameter;
				};

				var intersectionMatrixLabel = new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_spatial_intersection_matrix")
				}).addStyleClass("labelFloat");
				var intersectionMatrixField = new sap.ui.commons.TextField({
					width: "90%",
					value: "{intersectionMatrix}",
					change: function(event) {
						var value = event.getParameter("newValue");
						if (validateIntersectionMatrix(value)) {
							CalcViewEditorUtil.clearErrorMessageTooltip(this);
							var attributes = {
								spatialJoinAttributes: {
									intersectionMatrix: {
										value: value
									}
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						} else if (validateIntersectionMatrixParamater(value)) {
							var parameter = validateDistanceParamater(value);
							CalcViewEditorUtil.clearErrorMessageTooltip(this);
							var attributes = {
								spatialJoinAttributes: {
									intersectionMatrix: {
										parameter: parameter
									}
								}
							};
							var command = new commands.ChangeJoinPropertiesCommand(that.viewNode.name, that.join.$getKeyAttributeValue(), attributes);
							that._execute(command);
						} else {
							CalcViewEditorUtil.showErrorMessageTooltip(this, resourceLoader.getText("msg_invalid_intersection_matrix"));
						}
					},
					enabled: {
						path: "predicate",
						formatter: function(predicate) {
							return predicate === "RELATE";
						}
					}
				});

				matrixLayout.createRow(null, predicateEvaluatesLabel1, predicateEvaluatesCombo, intersectionMatrixLabel, intersectionMatrixField);

				matrixLayout.createRow(null, predicateEvaluatesLabel2);

				this.spatialPropertiesLayout.addContent(matrixLayout);

				return this.spatialPropertiesLayout;
			},

			createModel: function(object) {
				var model;
				this.join = undefined;

				if (object instanceof viewModel.Join) {
					this.join = object;

					var joinTypes;
					var cardinalityTypes;
					var predicateTypes;
					var languageColumns = [];
					var leftInput;
					var rightInput;
					var spatialJoinProperties;

					var join = this.join;

					if (join) {

						if (join.spatialJoinProperties && join.spatialJoinProperties.count() > 0) {
							spatialJoinProperties = join.spatialJoinProperties.get(0);
						}

						joinTypes = [{
							joinType: resourceLoader.getText("txt_inner_join"),
							key: "inner"
                        }, {
							joinType: resourceLoader.getText("txt_left_outer"),
							key: "leftOuter"
                        }, {
							joinType: resourceLoader.getText("txt_right_outer"),
							key: "rightOuter"
                        }, {
							joinType: resourceLoader.getText("txt_text_join"),
							key: "textTable"
                        }];
						if (this.isStarJoin()) {
							joinTypes.unshift({
								joinType: "Referential",
								key: "referential"
							});
						}

						cardinalityTypes = [{
							cardinalityType: "",
							key: "NONE"
                        }, {
							cardinalityType: "1..1",
							key: "C1_1"
                        }, {
							cardinalityType: "1..n",
							key: "C1_N"
                        }, {
							cardinalityType: "n..1",
							key: "CN_1"
                        }, {
							cardinalityType: "n..m",
							key: "CN_N"
                        }];

						if (spatialJoinProperties) {
							predicateTypes = [{
								predicateType: resourceLoader.getText("txt_spatial_predicate_contains"),
								key: "CONTAINS"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_covered_by"),
								key: "COVERED_BY"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_covers"),
								key: "COVERS"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_crosses"),
								key: "CROSSES"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_disjoint"),
								key: "DISJOINT"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_equals"),
								key: "EQUALS"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_intersects"),
								key: "INTERSECTS"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_overlaps"),
								key: "OVERLAPS"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_relate"),
								key: "RELATE"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_touches"),
								key: "TOUCHES"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_within"),
								key: "WITHIN"
                            }, {
								predicateType: resourceLoader.getText("txt_spatial_predicate_within_distance"),
								key: "WITHIN_DISTANCE"
                            }];
						}

						// if (this.viewNode.inputs._keys.length === 2) {
						leftInput = join.leftInput;
						rightInput = join.rightInput;
						//if (join.joinType === "textTable") {
						languageColumns.push({
							name: ""
						});
						rightInput.getSource().elements.foreach(function(element) {
							languageColumns.push({
								name: element.name
							});
						});
						//}
						//}
						var distance, intersectionMatrix;
						if (spatialJoinProperties) {
							if (spatialJoinProperties.distance) {
								if (spatialJoinProperties.distance.value) {
									distance = spatialJoinProperties.distance.value;
								} else if (spatialJoinProperties.distance.parameter && spatialJoinProperties.distance.parameter.name) {
									distance = "$$" + spatialJoinProperties.distance.parameter.name + "$$";
								}

							}
							if (spatialJoinProperties.intersectionMatrix) {
								if (spatialJoinProperties.intersectionMatrix.value) {
									intersectionMatrix = spatialJoinProperties.intersectionMatrix.value;
								} else if (spatialJoinProperties.intersectionMatrix.parameter && spatialJoinProperties.intersectionMatrix.parameter.name) {
									intersectionMatrix = "$$" + spatialJoinProperties.intersectionMatrix.parameter.name + "$$";
								}

							}

						}

						model = {
							join: join,
							leftInput: leftInput ? CalcViewEditorUtil.getInputName(leftInput) : null,
							rightInput: rightInput ? CalcViewEditorUtil.getInputName(rightInput) : null,
							cardinality: join.cardinality ? join.cardinality : "NONE",
							joinType: join.joinType,
							joinTypes: joinTypes,
							cardinalityTypes: cardinalityTypes,
							predicateTypes: predicateTypes,
							languageColumns: languageColumns,
							languageColumn: join.languageColumn,
							dynamic: join.dynamic,
							optimizeJoinColumns: join.optimizeJoinColumns,
							predicate: spatialJoinProperties ? spatialJoinProperties.predicate : undefined,
							distance: distance,
							intersectionMatrix: intersectionMatrix,
							predicateEvaluatesTo: spatialJoinProperties ? spatialJoinProperties.predicateEvaluatesTo : undefined,
							isSpatialJoin: spatialJoinProperties ? true : false
						};

						if (this.dynamicJoinCB) {
							if (join.leftElements.count() > 1) {
								this.dynamicJoinCB.setEnabled(true);
							} else {
								this.dynamicJoinCB.setEnabled(false);
							}
						}
					}

					if (this.spatialPropertiesLayout) {
						if (spatialJoinProperties) {
							this.spatialPropertiesLayout.setVisible(true);
						} else {
							this.spatialPropertiesLayout.setVisible(false);
						}

					}
				} else if (object instanceof viewModel.Input) {
					if (object.getSource()) {
						if (object.getSource() instanceof viewModel.ViewNode) {
							model = {
								isDataSource: false,
								inputName: object.getSource().name
							};
						} else {
							model = {
								inputName: object.getSource().name,
								isDataSource: true,
								packageName: object.getSource().packageName,
								schemaName: object.getSource().schemaName
							};
						}
					}

				} else if (object instanceof viewModel.Element) {

					var dataTypeString;

					if (object.inlineType && object.inlineType.primitiveType) {
						dataTypeString = object.inlineType.primitiveType;
						if (object.inlineType.length) {
							dataTypeString = dataTypeString + "(" + object.inlineType.length;
							if (object.inlineType.scale) {
								dataTypeString = dataTypeString + "," + object.inlineType.scale;
							}
							dataTypeString = dataTypeString + ")";
						}
					}

					model = {
						name: object.name,
						label: object.label,
						dataType: dataTypeString
					};
				}

				return model;
			},

			isStarJoin: function() {
				if (this.viewNode && this.viewNode.isStarJoin()) {
					return true;
				}
				return false;
			},

			updateProperties: function() {
				if (this.object) {
					this.dataModel.setData(this.createModel(this.object));
					this.dataModel.updateBindings();
				}
			}
		};

		return PropertiesPane;

	});
