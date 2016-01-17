/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/commands", "../base/modelbase", "../viewmodel/model",
		"./CalcViewEditorUtil"],
	function(ResourceLoader, commands, modelbase, model, CalcViewEditorUtil) {
		'use strict';
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
		var ParameterManageMapping = function(attributes) {
			this.undoManager = attributes.undoManager;
			this._model = attributes.model;
			this.context = attributes.context;
			this.callBack = attributes.callBack;
			this.viewNode = attributes.viewNode;
			this.topLayout;
			this.oMappingControl;
			this._transformationModel;
			this.selectedKey;
			this.internalModel;
			this.deleteConstnatButton;
			this.constants = [];
			this.isScript = false;

		}

		ParameterManageMapping.prototype = {
			_execute: function(commands) {
				if (commands instanceof Array) {
					return this.undoManager.execute(new modelbase.CompoundCommand(commands));
				} else {
					return this.undoManager.execute(commands);
				}
			},
			getContent: function() {
				if (!this.topLayout) {
					this.topLayout = new sap.ui.commons.layout.MatrixLayout({
						width: "100%",
						height: "100%"
					});
					var mappingContent = this.getMappingContent();
					this.topLayout.createRow(mappingContent);
				}
				return this.topLayout;
			},
			update: function() {
				this.selectedKey = "Data Sources";
			//	this.selectedKey = "Views for value help for variables/input parameters";
				
				this.isScript = false;
				if (this.viewNode && this.viewNode.type === "Script") {
					this.selectedKey = "Views for value help for variables/input parameters";
					this.isScript = true;
				}
				this.internalModel.updateBindings(true);
				this.updateMappingControl();
				this.updateLabels();
				this.refreshToolItems({
					target: true
				});
			},
			updateLabels: function() {
				var that = this;
				if (that.selectedKey === "Data Sources") {
					that.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_source_input_parameters"));
					that.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText("txt_calculation_view_input_parameters"));
				} else if (that.selectedKey === "Procedures/Scalar function for input parameters") {
					that.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_variables_input_parameters"));
					that.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText(
						"txt_calculation_view_variables_input_parameters"));
				} else {
					that.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_variables_input_parameters"));
					that.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText(
						"txt_calculation_view_variables_input_parameters"));
				}
			},
			subscribe: function(source) {
				this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETERMAPPING_CREATED, this.updateMappingControl, this);
				this._model.columnView.$getEvents().subscribe(commands.ViewModelEvents.PARAMETERMAPPING_DELETED, this.updateMappingControl, this);
				if (source && source.$getEvents()) {
					source.$getEvents().subscribe(commands.ViewModelEvents.PARAMETERMAPPING_CREATED, this.updateMappingControl, this);
					source.$getEvents().subscribe(commands.ViewModelEvents.PARAMETERMAPPING_DELETED, this.updateMappingControl, this);
				}
				if (this.viewNode) {
					this.viewNode.$getEvents().subscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.updateMappingControl, this);
				}

			},
			unsubscribe: function(source) {
				this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETERMAPPING_CREATED, this.updateMappingControl, this);
				this._model.columnView.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETERMAPPING_DELETED, this.updateMappingControl, this);
				if (source && source.$getEvents()) {
					source.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETERMAPPING_CREATED, this.updateMappingControl, this);
					source.$getEvents().unsubscribe(commands.ViewModelEvents.PARAMETERMAPPING_DELETED, this.updateMappingControl, this);
				}
				if (this.viewNode) {
					this.viewNode.$getEvents().unsubscribe(commands.ViewModelEvents.ELEMENT_CHANGED, this.outerModelChanged, this);
				}
			},
			outerModelChanged: function() {
				if (this.selectedKey === "Views for value help for attributes") {
					this.updateMappingControl();
				}
			},
			getMappingContent: function() {
				var that = this;
				this.selectedKey = "Data Sources";
				//this.selectedKey = "Views for value help for variables/input parameters";
				if (this.viewNode && this.viewNode.type === "Script") {
					this.isScript = true;
				}
				var mainLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					height: "100%"
				});
				var toolbar = new sap.ui.commons.Toolbar({
					width: "100%"
				}).addStyleClass("parameterToolbarStyle");

				if (this.callBack) {
					var backButton = new sap.ui.commons.Button({
						icon: "sap-icon://navigation-left-arrow",
						text: resourceLoader.getText("tol_back"),
						tooltip: resourceLoader.getText("tol_back"),
						press: function() {
							that.callBack();
						}
					});
				}
				toolbar.addItem(backButton);

				var header = new sap.ui.commons.Label({
					text: resourceLoader.getText("tit_manage_mapping_for_parameters"),
					design: sap.ui.commons.LabelDesign.Bold
				});
				toolbar.addItem(header);

				var headerLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%"
				});
				var headerRow = new sap.ui.commons.layout.MatrixLayoutRow({
					width: "100%"
				}).addStyleClass("parameterToolbarStyle");

				var headerCell = new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Begin,
					vAlign: sap.ui.commons.layout.VAlign.Center
				});
				headerCell.addContent(header);
				headerRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
					content: [backButton],
					width: "40%"
				}).addStyleClass("headerWidth"));
				headerRow.addCell(headerCell);

				headerLayout.addRow(headerRow);
				mainLayout.createRow(headerLayout);

				// mainLayout.createRow(toolbar);

				var comboBoxCell = new sap.ui.commons.layout.MatrixLayoutCell({
					hAlign: sap.ui.commons.layout.HAlign.Begin,
					vAlign: sap.ui.commons.layout.VAlign.Center
				});
				this.selectedKey = "Data Sources";
				//this.selectedKey = "Views for value help for variables/input parameters";
				var typeCombo = new sap.ui.commons.DropdownBox({
					width: "31%",
					selectedKey: {
						path: "selectedKey",
						formatter: function(selectedKey) {
							return that.selectedKey;
						}
					},
					enabled: {
						path: "isScript",
						formatter: function(isScript) {
							return true; //!that.isScript;
						}
					},
					change: function(event) {
						var selectedValue = event.getParameter("newValue");
						that.selectedKey = selectedValue;
						that.internalModel.updateBindings(true);
						that.updateMappingControl();
						if (that.selectedKey === "Data Sources") {
							that.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_source_input_parameters"));
							that.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText("txt_calculation_view_input_parameters"));
						} else if (that.selectedKey === "Procedures/Scalar function for input parameters") {
							that.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_variables_input_parameters"));
							that.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText(
								"txt_calculation_view_variables_input_parameters"));
						} else {
							that.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_variables_input_parameters"));
							that.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText(
								"txt_calculation_view_variables_input_parameters"));
						}
					}

				}).addStyleClass("paddingLeft");
				var listItem = new sap.ui.core.ListItem({
					text: "{type}",
					key: "{type}"
				});
				typeCombo.bindItems({
					path: "/comboTypes",
					template: listItem
				});

				comboBoxCell.addContent(new sap.ui.commons.Label({
					text: resourceLoader.getText("txt_select_type")
				}).addStyleClass("paddingRight"));
				comboBoxCell.addContent(typeCombo);

				mainLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
					cells: [comboBoxCell]
				}));

				this.internalModel = new sap.ui.model.json.JSONModel();
				var comboTypes = [{
					type: "Data Sources"
                }/*, {
					type: "Views for value help for variables/input parameters"
                }, {
					type: "Procedures/Scalar function for input parameters"
                }, {
					type: "Views for value help for attributes"
                }*/];

				if (that.isScript) {
					comboTypes = [{
						type: "Views for value help for variables/input parameters"
                }, {
						type: "Views for value help for attributes"
                }];
				}
				var data = [];
				data.comboTypes = comboTypes;
				this.internalModel.setData(data);
				mainLayout.setModel(this.internalModel);

				var mappingControlLayout = that.getMappingControlLayout();

				mainLayout.addRow(new sap.ui.commons.layout.MatrixLayoutRow({
					cells: [new sap.ui.commons.layout.MatrixLayoutCell({
						content: [mappingControlLayout]
					})]
				}));
				that.subscribe();

				return mainLayout;
			},
			getMappingControlLayout: function() {
				var that = this;
				var mappingLayout = new sap.ui.commons.layout.MatrixLayout({
					width: "100%",
					height: "600px"
				});

				sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["com.sap.it.spc.webui.mapping"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
				sap.ui.getCore().loadLibrary('com.sap.it.spc.webui.mapping', '/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/com/sap/it/spc/webui/mapping');
				sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["sap.watt.hanaplugins.editor.common.treemap"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
				sap.ui.getCore().loadLibrary('sap.watt.hanaplugins.editor.common.treemap',
				'/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/sap/hana/ide/common/plugin/treemap');

				jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.MappingControlEx");
				jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images");
				
				var pmmChannelId = "pmmChannelId" + Date.now() + "." + Math.floor((Math.random() * 1000000) + 1);
				this.oMappingControl = new sap.watt.hanaplugins.editor.common.treemap.MappingControlEx({
					height: "100%",
					eventChannelId: pmmChannelId // unique id for event handling
				});
				this.oMappingControl.setDropValidator(this.canDrag);
				//this._transformationModel = new sap.hana.ide.common.plugin.treemap.TransformationModelEx(); 
				this._transformationModel = new com.sap.it.spc.webui.mapping.models.TransformationModel();
				this._transformationModel.setJSONData(this.createModel());
				this.oMappingControl.setTransformation(this._transformationModel);
				this.oMappingControl.setEditMode(true);

				this.oMappingControl.setSourceMessageHeader(this.createCustomSourceToolbar(this.oMappingControl));
				this.oMappingControl.setTargetMessageHeader(this.createCustomTargetToolbar(this.oMappingControl));

				this.oMappingControl.setCustomSourceLabel(this.createCustomLabel());
				this.oMappingControl.setCustomTargetLabel(this.createCustomLabel());

				this.oMappingControl.setCustomSourceBinding("/rootNode");
				this.oMappingControl.setCustomTargetBinding("/rootNode");

				this.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_source_input_parameters"));
				this.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText("txt_calculation_view_input_parameters"));
				/*     this.oMappingControl._getSourceTable().attachRowSelectionChange(function(){
                    that.refreshToolItems({source:true});
                 });
                */
				this.oMappingControl._getTargetTable().attachRowSelectionChange(function() {
					that.refreshToolItems({
						target: true
					});
				});

				// MappingLibrary.EventBus.subscribe("pmmChannelId", MappingLibrary.Events.MAPPING_DELETE, this.callbackMappingDelete(), this);
				MappingLibrary.EventBus.unsubscribe(pmmChannelId, MappingLibrary.Events.MAPPING_CREATE, this.callbackMappingCreate, this);
				MappingLibrary.EventBus.unsubscribe(pmmChannelId, MappingLibrary.Events.MAPPING_UPDATE, this.callbackMappingCreate, this);
				MappingLibrary.EventBus.subscribe(pmmChannelId, MappingLibrary.Events.MAPPING_CREATE, this.callbackMappingCreate, this);
				MappingLibrary.EventBus.subscribe(pmmChannelId, MappingLibrary.Events.MAPPING_UPDATE, this.callbackMappingCreate, this);

				//    this.refreshToolItems();

				mappingLayout.createRow(this.oMappingControl);
				mappingLayout.getRows()[0].setHeight("100%");
				this.oMappingControl.attachCreateMapping(function(event) {
					var oParameters = event.getParameters();
					// this are the possible parameters
					var oSourceObject = oParameters["sourceObject"];
					var oTargetObject = oParameters["targetObject"];
					var oMappingControl = oParameters["mappingControl"];
					if (oSourceObject && !oTargetObject && !oSourceObject.nodes) {
						//prevent default create behavior and provide custom code
						event.preventDefault();
						// var commands = [];
						//  that.makeMappings(oSourceObject, true, commands);

						var executionCommands = [];
						var mapping = {};
						var canAddMapping = true;

						var parameter = that.getSourceParameter(oSourceObject);
					/*	if (parameter.typeOfElement) {
							canAddMapping = false;
						} */
						
						mapping.parameterName = oSourceObject.name;
						mapping.parameterNameOtherView = oSourceObject.name;
						
						if (canAddMapping) {
							var parameterProperties = {};
							parameterProperties.objectAttributes = parameter.$getAttributes();
							if (!parameterProperties.objectAttributes.label) {
								parameterProperties.objectAttributes.label = " ";
							}
							if (parameter.inlineType) {
								parameterProperties.typeAttributes = parameter.inlineType.$getAttributes();
							}
							if (that.isConstant(oSourceObject.name) || that._model.columnView.parameters.get(oSourceObject.name)) {
								parameterProperties.objectAttributes.name = that.getNextParameterName(oSourceObject.name);
								mapping.parameterName = parameterProperties.objectAttributes.name;
							}
							executionCommands.push(new commands.AddParameterCommand(parameterProperties));
							if(parameter.defaultRanges && parameter.defaultRanges.count() > 0){
							    parameter.defaultRanges.foreach(function(defaultRange){
							        executionCommands.push(new commands.CreateParameterDefaultRangeCommand(parameterProperties.objectAttributes.name,{
							         lowExpression: defaultRange.lowExpression,
								     lowValue: defaultRange.lowValue
							        }
							        ));
							    });
							}
							if(parameter.inlineType && parameter.inlineType.valueRanges && parameter.inlineType.valueRanges.count() > 0){
							    parameter.inlineType.valueRanges.foreach(function(valueRange){
							        executionCommands.push(new commands.CreateParameterValueRangeCommand(parameterProperties.objectAttributes.name,{
							         value: valueRange.value,
						      	     label: valueRange.label
							        }
							        ));
							    });
							}
							
						}

						if (canAddMapping) {
							var source = {};
							source.type = oSourceObject.parameterType;
							if (oSourceObject.parameterType === "input") {
								source.typeName = oSourceObject.typeIndex;
								source.viewNode = oSourceObject.viewNode;
							} else if (oSourceObject.parameterType === "parameter") {
								source.typeName = oSourceObject.typeName;
							} else if (oSourceObject.parameterType === "derivationrule") {
								source.typeName = oSourceObject.typeName;
							} else if (oSourceObject.parameterType === "element") {
								source.typeName = oSourceObject.typeName;
							}
							var attributes = {};
							attributes.parameterName = oSourceObject.name;
							attributes.type = that.selectedKey;
							attributes.viewNodeName = oSourceObject.viewNode;
							var sourceList = oSourceObject.xpath.split("/");
							if (that.selectedKey === "Data Sources") {
								attributes.inputName = sourceList[2];
							} else if (that.selectedKey === "Procedures/Scalar function for input parameters" || that.selectedKey ===
								"Views for value help for attributes") {
								attributes.externalParameterName = sourceList[2];
							} else {
								attributes.externalElementName = sourceList[2];
							}

							var existingMapping = that.getMapping(attributes);
							if (existingMapping) {
								executionCommands.push(new commands.RemoveParameterMappingCommand({
									source: source,
									mapping: {
										parameterNameOtherView: existingMapping.parameterNameOtherView,
										value: existingMapping.value ? existingMapping.value : undefined,
										parameter: existingMapping.parameter
									}
								}));
							}
							executionCommands.push(new commands.CreateParameterMappingCommand({
								source: source,
								mapping: mapping
							}));
							if (executionCommands.length > 0) {
								that._execute(new modelbase.CompoundCommand(executionCommands));
								that.updateMappingControl();
							}
						}
					}
				});

				this.oMappingControl._getTargetTable().attachBrowserEvent("ondbclick", function(event) {
					var targetIndex = mappingControl._getTargetTable().getSelectedIndex();
					if (targetIndex > -1) {
						var targetContext = mappingControl._getTargetTable().getContextByIndex(index);
						var targetObject = targetContext.getProperty("");
						if (targetObject) {
							if (targetObject.type == "constant") {
								var textField = new sap.ui.commons.TextField({
									liveChange: function(event) {
										var newValue = event.getParameter("liveValue");
										if (targetObject.name == newValue || that.isNameExists(newValue)) {
											event.getSource().setTooltip(null);
											event.getSource().setValueState(sap.ui.core.ValueState.Error);
											okButton.setEnabled(false);
										} else {
											event.getSource().setTooltip(null);
											event.getSource().setValueState(sap.ui.core.ValueState.None);
											okButton.setEnabled(true);
										}
									},
									change: function(event) {
										var newValue = event.getParameter("newValue");
										if (targetObject.name === newValue || that.isNameExists(newValue)) {
											event.getSource().setTooltip(null);
											event.getSource().setValueState(sap.ui.core.ValueState.Error);
											okButton.setEnabled(false);
										} else {
											event.getSource().setTooltip(null);
											event.getSource().setValueState(sap.ui.core.ValueState.None);
											okButton.setEnabled(true);
										}

									},
									text: targetObject.name,
									value: targetObject.name
								});
								var cancelButton = new sap.ui.commons.Button({
									text: "Cancel",
									press: function() {
										inputDialog.close();
									}
								});
								var okButton = new sap.ui.commons.Button({
									text: "Ok",
									press: function(event) {
										var value = textField.getValue();
										if (value !== "") {
											that.constants.push(value);
											that.constants.forEach(function(constant) {
												if (constant === targetObject.name)
													constant = targetObject.name;
											})
											that.updateConstantMapping(targetObject.name, newValue);
											that.updateMappingControl();
											inputDialog.close();
										}
									},
									enabled: false //textField.getValue() !== "" ? true : false
								});
								var inputDialog = new sap.ui.commons.Dialog({
									modal: true,
									content: [textField],
									// width: "100%",
									buttons: [okButton, cancelButton],
									defaultButton: cancelButton
								});
								inputDialog.open();

							}
						}
					}
				}, this.oMappingControl._getTargetTable());

				return mappingLayout;
			},
			canDrag: function(source, target) {
				// return true;
				if (source && source[0]) {
					var osource = source[0];
					if (osource.type !== "parameter") {
						return false;
					} else if (osource.nodes) {
						return false;
					} else if (source["field-type"] && source["field-type"].indexOf("ERROR") > -1) {
						return false;
					}
					if (osource.inputEnabled) {
						if (target) {
							if (target["field-type"] !== "CONSTANT") {
								return false;
							} else {
								return true;
							}
						} else {
							return false;
						}
					} else {
						if (target && target.name === osource.typeName || (target && target["field-type"] && target["field-type"].indexOf("PROXY") > -1)) {
							return false;
						}
						return true;
					}

				}
				return false;
			},
			callbackPreMappingCreate: function(event) {
				var that = this;
				var oParameters = oEvent.getParameters();
				// this are the possible parameters
				var oSourceObject = oParameters["sourceObject"];
				var oTargetObject = oParameters["targetObject"];
				var oMappingControl = oParameters["mappingControl"];
				if (oSourceObject && !oTargetObject) {
					//prevent default create behavior and provide custom code
					event.preventDefault();
					var commands = [];
					that.makeMappings(oSourceObject, true, commands);

				}
			},
			callbackMappingCreate: function(chId, evId, data) {
				var that = this;
				var existingMapping;
				if (data) {
					if (evId === "MAPPING_LIBRARY_EVENTS-MAPPING_CREATE") {
						var sourcePaths = data.mapping.sourcePaths[0];
						var targetPaths = data.mapping.targetPaths[0];
						var sourceList = sourcePaths.split("/");
						var targetList = targetPaths.split("/");
						var sourceName = sourceList[sourceList.length - 1];
						var targetName = targetList[targetList.length - 1];

						var source = {};
						var mapping = {};
						if (that.selectedKey === "Data Sources") {
							if (!this.isConstant(targetName))
								mapping.parameterName = targetName;
							else
								mapping.value = targetName;
							mapping.parameterNameOtherView = sourceName;
							source.type = "input"
							//  source.typeName = sourceList[2];

							if (this.oMappingControl._dragStart && this.oMappingControl._dragStart.isSourceTable) {
								var sourceContext = this.oMappingControl._getRowContextFromElement(this.oMappingControl._dragStart.startElement, this.oMappingControl
									._getSourceTable())
								var sourceObject = sourceContext.getProperty("");
								source.viewNode = sourceObject.viewNode;
								source.typeName = sourceObject.typeIndex;
							} else {
								var sourceObject1;
								that.model.source.rootNode.nodes.forEach(function(node) {
									if (node.name == sourceList[2] && node.type == "input") {
										if (node.nodes && !sourceObject1) {
											node.nodes.forEach(function(secondNode) {
												if (secondNode.name == sourceList[3] && !sourceObject1) {
													sourceObject1 = secondNode;
												}
											})
										}
									}
								})
								if (sourceObject1) {
									source.viewNode = sourceObject1.viewNode;
									source.typeName = sourceObject1.typeIndex;
								}
							}
							var typeName;
							var viewNodeName;
							if (sourceObject1) {
								typeName = sourceObject1.typeName;
								viewNodeName = sourceObject1.viewNode;
							} else if (sourceObject) {
								typeName = sourceObject.typeName
								viewNodeName = sourceObject.viewNode;
							}
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								inputName: typeName,
								viewNodeName: viewNodeName,
								externalParameterName: undefined
							});
						} else if (that.selectedKey === "Procedures/Scalar function for input parameters") {
							if (!this.isConstant(targetName))
								mapping.parameterName = targetName;
							else
								mapping.value = targetName;
							mapping.parameterNameOtherView = sourceName;
							source.type = "derivationrule";
							source.typeName = sourceList[2];
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								externalParameterName: source.typeName
							});
						} else if (that.selectedKey === "Views for value help for attributes") {
							if (!this.isConstant(targetName))
								mapping.parameterName = targetName;
							else
								mapping.value = targetName;
							mapping.parameterNameOtherView = sourceName;
							source.type = "element";
							source.typeName = sourceList[2];
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								externalElementName: source.typeName
							});

						} else {
							if (!this.isConstant(targetName))
								mapping.parameterName = targetName;
							else
								mapping.value = targetName;
							mapping.parameterNameOtherView = sourceName;
							source.type = "parameter";
							source.typeName = sourceList[2];
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								externalParameterName: source.typeName
							});
						}
						var command = new commands.CreateParameterMappingCommand({
							source: source,
							mapping: mapping
						});
						if (existingMapping) {
							var removeParameterMapping = new commands.RemoveParameterMappingCommand({
								source: source,
								mapping: {
									parameterNameOtherView: existingMapping.parameterNameOtherView,
									value: existingMapping.value ? existingMapping.value : undefined,
									parameter: existingMapping.parameter
								}

							});
							this._execute([removeParameterMapping, command]);
							that.updateMappingControl();
						} else {
							this._execute(command);
							that.updateMappingControl();
						}

					} else if (evId == "MAPPING_LIBRARY_EVENTS-MAPPING_UPDATE") {
						var sourcePaths = data.xPath;
						var targetPaths = data.mapping.targetPaths[0];
						var sourceList = sourcePaths.split("/");
						var targetList = targetPaths.split("/");
						var sourceName = sourceList[sourceList.length - 1];
						var targetName = targetList[targetList.length - 1];

						var source = {};
						var mapping = {};
						if (that.selectedKey === "Data Sources") {
							if (!this.isConstant(targetName)) {
								mapping.parameterName = targetName;
							} else {
								mapping.value = targetName;
							}
							mapping.parameterNameOtherView = sourceName;
							source.type = "input";
							source.typeName = sourceList[2];
							if (this.oMappingControl._dragStart.isSourceTable) {
								var sourceContext = this.oMappingControl._getRowContextFromElement(this.oMappingControl._dragStart.startElement, this.oMappingControl
									._getSourceTable())
								var sourceObject = sourceContext.getProperty("");
								source.typeName = sourceObject.typeIndex;
								source.viewNode = sourceObject.viewNode;
							} else {
								var sourceObject1;
								that.model.source.rootNode.nodes.forEach(function(node) {
									if (node.name === sourceList[2] && node.type === "input") {
										if (node.nodes && !sourceObject1) {
											node.nodes.forEach(function(secondNode) {
												if (secondNode.name === sourceList[3] && !sourceObject1) {
													sourceObject1 = secondNode;
												}
											})
										}
									}
								})
								if (sourceObject1) {
									source.viewNode = sourceObject1.viewNode;
									source.typeName = sourceObject1.typeIndex;
								}
							}
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								inputName: sourceObject1 ? sourceObject1.typeName : sourceObject.typeName,
								viewNodeName: sourceObject1 ? sourceObject1.viewNode : sourceObject.viewNode,
								externalParameterName: undefined
							});
						} else if (that.selectedKey === "Procedures/Scalar function for input parameters") {
							if (!this.isConstant(targetName)) {
								mapping.parameterName = targetName;
							} else {
								mapping.value = targetName;
							}

							mapping.parameterNameOtherView = sourceName;
							source.type = "derivationrule";
							source.typeName = sourceList[2];
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								externalParameterName: source.typeName
							});
						} else if (that.selectedKey === "Views for value help for attributes") {
							if (!this.isConstant(targetName)) {
								mapping.parameterName = targetName;
							} else {
								mapping.value = targetName;
							}

							mapping.parameterNameOtherView = sourceName;
							source.type = "element";
							source.typeName = sourceList[2];
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								externalElementName: source.typeName
							});
						} else {
							if (!this.isConstant(targetName)) {
								mapping.parameterName = targetName;
							} else {
								mapping.value = targetName;
							}

							mapping.parameterNameOtherView = sourceName;
							source.type = "parameter";
							source.typeName = sourceList[2];
							existingMapping = that.getMapping({
								type: that.selectedKey,
								parameterName: mapping.parameterNameOtherView,
								externalParameterName: source.typeName
							});
						}
						var command = new commands.CreateParameterMappingCommand({
							source: source,
							mapping: mapping
						});
						if (existingMapping) {
							var removeParameterMapping = new commands.RemoveParameterMappingCommand({
								source: source,
								mapping: {
									parameterNameOtherView: existingMapping.parameterNameOtherView,
									value: existingMapping.value ? existingMapping.value : undefined,
									parameter: existingMapping.parameter
								}

							});
							this._execute([removeParameterMapping, command]);
							that.updateMappingControl();
						} else {
							this._execute(command);
							that.updateMappingControl();
						}

					}
				}
				// alert("mapping Created");
			},
			refreshToolItems: function(attributes) {

				var that = this;
				var enableRemoveMapping = false;
				var enableConstantRemoveMapping = false;
				/* if (attributes.source) {
                    that.oMappingControl._getSourceTable().getSelectedIndices().forEach(function(index) {
                        var sourceContext = that.oMappingControl._getSourceTable().getContextByIndex(index);
                        if (sourceContext) {
                            var sourceObject = sourceContext.getProperty("");
                            if (sourceObject && sourceObject.type === "parameter" && !sourceObject.nodes) {}
                        }
                    });
                } else 
                */

				if (that.oMappingControl._getTargetTable().getSelectedIndices().length > 0) {
					enableConstantRemoveMapping = true;
				} else {
					enableConstantRemoveMapping = false;
				}
				that.oMappingControl._getTargetTable().getSelectedIndices().forEach(function(index) {
					var targetContext = that.oMappingControl._getTargetTable().getContextByIndex(index);
					if (targetContext) {
						var targetObject = targetContext.getProperty("");
						if (!targetObject || targetObject.type !== "constant" && enableConstantRemoveMapping) {
							enableConstantRemoveMapping = false;
						}
					} else {
						enableConstantRemoveMapping = false;
					}
				});
				if (that.deleteConstnatButton) {
					that.deleteConstnatButton.setEnabled(enableConstantRemoveMapping);
				}

			},
			createCustomLabel: function() {
				// custom label with icon
				var oImage = new sap.ui.commons.Image();
				oImage.bindProperty("src", {
					parts: ["field-type", "inConsistent", "isProxy"],
					formatter: function(type) {
						return sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images[type];
					}

				});
				oImage.bindProperty("tooltip", {
					path: "tooltip",
					formatter: function(tooltip) {
						return tooltip;
					}
				});
				var oLabel = new sap.ui.commons.Label();
				oLabel.bindProperty("text", "name");

				oLabel.bindProperty("text", {
					parts: ["name", "displayName"],
					formatter: function(name, displayName) {
						if (displayName) {
							return displayName;
						} else {
							return name;
						}

					}

				});
				var oCustomlabel = new sap.ui.layout.HorizontalLayout({
					content: [oImage, oLabel]
				});

				// custom tooltip
				var oTooltip = new sap.ui.commons.RichTooltip();
				oTooltip.bindProperty("title", "name");
				oTooltip.bindProperty("text", {
					parts: ["name", "icon", "field-type", "field-length", "field-scale"],
					formatter: function(name, icon, type, length, scale) {
						var oResult = "<table>" +
							(type !== undefined ? "<tr><th>Type</th><td>" + type + "</td></tr>" : "") +
							(length !== undefined ? "<tr><th>Length</th><td>" + length + "</td></tr>" : "") +
							(scale !== undefined ? "<tr><th>Scale</th><td>" + scale + "</td></tr>" : "") +
							"</table>";

						return oResult;

					}
				});

				oCustomlabel.setTooltip(oTooltip);

				/*    jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.InlineEditor");

                var oInlineEditor = new sap.watt.hanaplugins.editor.common.treemap.InlineEditor({
                    label: oCustomlabel
                });

                // Create the menu items for the context menu dynamically
                oInlineEditor.attachOpenContextMenu(function(oEvent) {
                    var oData = oEvent.getParameter("data");
                    var oMenu = oEvent.getParameter("menu");
                    oMenu.removeAllItems();
                    if (oData && oData["field-type"] === "PARAMETER" && oData.nodes === undefined) {
                        var oMenuItem = new sap.ui.commons.MenuItem({
                            // icon: 
                            text: "Remove Mapping"
                        });
                        oMenu.addItem(oMenuItem);
                    }
                });

                 return oInlineEditor; */

				return oCustomlabel;
			},
			createCustomSourceToolbar: function(mappingControl) {
				var that = this;
				var oSourceToolbar = new sap.ui.commons.Toolbar();
				oSourceToolbar.addStyleClass("parameterToolbarStyle");
				oSourceToolbar.setStandalone(false);
				oSourceToolbar.setDesign(sap.ui.commons.ToolbarDesign.Flat);

				that.removeSourceButton = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //"sap-icon://decline", //resourceLoader.getImagePath("Delete.png"),
					//text: resourceLoader.getText("tol_remove_mapping"),
					tooltip: resourceLoader.getText("tol_remove_mapping"),
					press: function() {
						var commands = [];
						mappingControl._getSourceTable().getSelectedIndices().forEach(function(index) {
							var sourceContext = mappingControl._getSourceTable().getContextByIndex(index);
							var sourceObject = sourceContext.getProperty("");

							if (sourceObject.nodes) {
								that.makeRemoveSourceMapping(sourceObject, true, commands);
							} else {
								commands.push(that.removeSourceMapping(sourceObject, true));
							}
						});
						if (commands.length > 0) {
							// that._execute(commands);
							that.updateMappingControl();
							that.refreshToolItems();
						}
					}
				});
				// oSourceToolbar.addItem(that.removeSourceButton);

				/* var oButton3 = new sap.ui.commons.Button({
                    icon: resourceLoader.getImagePath("Automap.png"),
                    tooltip: "This is a test tooltip",
                    press: function() {
                        alert('Alert');
                    }
                });
                oSourceToolbar.addItem(oButton3);*/

				that.addToTargetButton = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("Automap.png"),
					//text: resourceLoader.getText("tit_auto_map"),
					tooltip: resourceLoader.getText("tol_auto_map"),
					press: function() {
						var commands = [];

						that.model.source.rootNode.nodes.forEach(function(node) {
							that.makeMappings(node, true, commands);
						});

						/* if (mappingControl._getSourceTable().getSelectedIndices().length > 0) {
                            mappingControl._getSourceTable().getSelectedIndices().forEach(function(index) {
                                var sourcesSelectedIndex = index;
                                if (sourcesSelectedIndex > -1) {
                                    var sourceContext = mappingControl._getSourceTable().getContextByIndex(sourcesSelectedIndex);
                                    if(sourceContext){
                                    var sourceObject = sourceContext.getProperty("");
                                    if (!sourceObject.nodes) {
                                        commands.push(that.addMapping(sourceObject, true));
                                        that.refreshToolItems();
                                    } else {
                                        that.makeMappings(sourceObject, true, commands);
                                    }
                                    }
                                }
                            });
                        } else {
                            that.model.source.rootNode.nodes.forEach(function(node) {
                                that.makeMappings(node, true, commands);
                            });
                        }
                        */
					}
				});
				oSourceToolbar.addItem(that.addToTargetButton);

				var expandButton = new sap.ui.commons.Button({
				// 	icon: "sap-icon://expand-group",
				// 	icon: "sap-icon://expand",
					icon: resourceLoader.getImagePath("Expand_All.gif"),
					tooltip: "This is a test tooltip",
					press: function() {
						var sourceTable = mappingControl._getSourceTable();
						var length = sourceTable.getRows().length;
						for (var i = 0; i < length; i++) {
							sourceTable.expand(i);
						}
						that.collapsed = false;
					}
				});
				oSourceToolbar.addRightItem(expandButton);

				var collapseButton = new sap.ui.commons.Button({
				// 	icon: "sap-icon://collapse-group",
				// 	icon: "sap-icon://collapse",
					icon: resourceLoader.getImagePath("Collapse_All.png"),
					tooltip: "This is a test tooltip",
					press: function() {
						var sourceTable = mappingControl._getSourceTable();
						var length = sourceTable.getRows().length;
						for (var i = 0; i < length; i++) {
							sourceTable.collapse(i);
						}
						that.collapsed = true;
					}
				});
				oSourceToolbar.addRightItem(collapseButton);

				that.refreshToolItems();

				return oSourceToolbar;

			},
			getSourceParameter: function(sourceObject) {
				if (sourceObject.parameterType === "input") {
					var viewNode = this._model.columnView.viewNodes.get(sourceObject.viewNode);
					if (viewNode) {
						var input = viewNode.inputs.get(sourceObject.typeIndex);
						if (input) {
							return input.getSource().parameters.get(sourceObject.name);
						}
					}
				} else if (sourceObject.parameterType === "derivationrule") {
					var param = this._model.columnView.parameters.get(sourceObject.typeName);
					if (param) {
						if (param.derivationRule && param.derivationRule.scriptObject) {
							return param.derivationRule.scriptObject.parameters.get(sourceObject.name);
						}
					}
				} else if (sourceObject.parameterType === "element") {
					var element = this._model.columnView.getDefaultNode().elements.get(sourceObject.typeName);
					if (element) {
						if (element.externalTypeOfEntity) {
							return element.externalTypeOfEntity.parameters.get(sourceObject.name);
						}
					}
				} else {
					var param = this._model.columnView.parameters.get(sourceObject.typeName);
					if (param) {
						return param.externalTypeOfEntity.parameters.get(sourceObject.name);
					}
				}
			},
			createCustomTargetToolbar: function(mappingControl) {
				var that = this;
				var oTargetToolbar = new sap.ui.commons.Toolbar();
				oTargetToolbar.addStyleClass("parameterToolbarStyle");
				oTargetToolbar.setStandalone(false);
				oTargetToolbar.setDesign(sap.ui.commons.ToolbarDesign.Flat);

				that.removeTargetBtn = new sap.ui.commons.Button({
					icon: "sap-icon://delete", //"sap-icon://decline", //resourceLoader.getImagePath("Delete.png"),
				//	text: resourceLoader.getText("tol_remove_mapping"),
					tooltip: resourceLoader.getText("tol_remove_mapping"),
					press: function() {
						var removableMappingCommands = [];
						mappingControl._getTargetTable().getSelectedIndices().forEach(function(index) {
							var targetContext = mappingControl._getTargetTable().getContextByIndex(index);
							var targetObject = targetContext.getProperty("");
							if (targetObject) {
								if (targetObject.type === 'constant') {
									if (that.selectedKey === "Data Sources") {
										that._model.columnView.viewNodes.foreach(function(viewNode) {
											viewNode.inputs.foreach(function(input) {
												input.parameterMappings.foreach(function(parameterMapping) {
													if (parameterMapping.value === targetObject.name) {
														var typeIndex;
														if (viewNode.type === "JoinNode") {
															if (viewNode.inputs.get(0) === input) {
																typeIndex = 0;
															} else {
																typeIndex = 1;
															}
														}
														removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
															source: {
																type: "input",
																typeName: typeIndex, //input.getSource().name,
																viewNode: viewNode.name
															},
															mapping: {
																parameterNameOtherView: parameterMapping.parameterNameOtherView,
																value: parameterMapping.value
															}

														}));
													}
												});
											});
										});
									} else if (that.selectedKey === "Procedures/Scalar function for input parameters") {
										that._model.columnView.parameters.foreach(function(externalParameter) {
											if (externalParameter.derivationRule && externalParameter.derivationRule.scriptObject) {
												externalParameter.derivationRule.parameterMappings.foreach(function(parameterMapping) {
													if (parameterMapping.value === targetObject.name) {
														removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
															source: {
																type: "derivationrule",
																typeName: externalParameter.name
															},
															mapping: {
																parameterNameOtherView: parameterMapping.parameterNameOtherView,
																value: parameterMapping.value
															}

														}));
													}
												});
											}
										});
									} else if (that.selectedKey === "Views for value help for attributes") {
										that._model.columnView.getDefaultNode().elements.foreach(function(element) {
											if (element.externalTypeOfEntity) {
												element.parameterMappings.foreach(function(parameterMapping) {
													if (parameterMapping.value === targetObject.name) {
														removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
															source: {
																type: "element",
																typeName: element.name
															},
															mapping: {
																parameterNameOtherView: parameterMapping.parameterNameOtherView,
																value: parameterMapping.value
															}

														}));
													}
												});
											}
										});
									} else {
										that._model.columnView.parameters.foreach(function(externalParameter) {
											if (externalParameter.externalTypeOfEntity) {
												externalParameter.parameterMappings.foreach(function(parameterMapping) {
													if (parameterMapping.value === targetObject.name) {
														removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
															source: {
																type: "parameter",
																typeName: externalParameter.name
															},
															mapping: {
																parameterNameOtherView: parameterMapping.parameterNameOtherView,
																value: parameterMapping.value
															}

														}));
													}
												});
											}
										});
									}

								} else {
									var parameter = that._model.columnView.parameters.get(targetObject.name);
									if (parameter) {
										if (that.selectedKey === "Data Sources") {
											that._model.columnView.viewNodes.foreach(function(viewNode) {
												viewNode.inputs.foreach(function(input) {
													input.parameterMappings.foreach(function(parameterMapping) {
														var typeIndex = 0;
														if (parameterMapping.parameter === parameter) {
															if (viewNode.type === "JoinNode") {
																if (viewNode.inputs.get(0) === input) {
																	typeIndex = 0;
																} else {
																	typeIndex = 1;
																}
															}
															removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
																source: {
																	type: "input",
																	typeName: typeIndex, //input.getSource().name,
																	viewNode: viewNode.name
																},
																mapping: {
																	parameterNameOtherView: parameterMapping.parameterNameOtherView,
																	parameter: parameterMapping.parameter
																}

															}));
														}
													});
												});
											});
										}
										if (that.selectedKey === "Procedures/Scalar function for input parameters") {
											that._model.columnView.parameters.foreach(function(externalParameter) {
												if (externalParameter.derivationRule && externalParameter.derivationRule.scriptObject) {
													externalParameter.derivationRule.parameterMappings.foreach(function(parameterMapping) {
														if (parameterMapping.parameter === parameter) {
															removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
																source: {
																	type: "derivationrule",
																	typeName: externalParameter.name
																},
																mapping: {
																	parameterNameOtherView: parameterMapping.parameterNameOtherView,
																	parameter: parameterMapping.parameter
																}

															}));
														}
													});
												}
											});
										} else if (that.selectedKey === "Views for value help for attributes") {
											that._model.columnView.getDefaultNode().elements.foreach(function(element) {
												if (element.externalTypeOfEntity) {
													element.parameterMappings.foreach(function(parameterMapping) {
														if (parameterMapping.parameter === parameter) {
															removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
																source: {
																	type: "element",
																	typeName: element.name
																},
																mapping: {
																	parameterNameOtherView: parameterMapping.parameterNameOtherView,
																	parameter: parameterMapping.parameter
																}

															}));
														}
													});
												}
											});
										} else {
											that._model.columnView.parameters.foreach(function(externalParameter) {
												if (externalParameter.externalTypeOfEntity) {
													externalParameter.parameterMappings.foreach(function(parameterMapping) {
														if (parameterMapping.parameter === parameter) {
															removableMappingCommands.push(new commands.RemoveParameterMappingCommand({
																source: {
																	type: "parameter",
																	typeName: externalParameter.name
																},
																mapping: {
																	parameterNameOtherView: parameterMapping.parameterNameOtherView,
																	parameter: parameterMapping.parameter
																}

															}));
														}
													});
												}
											});
										}

									}
								}
							}

						});
						if (removableMappingCommands.length > 0) {
							that._execute(removableMappingCommands);
							that.updateMappingControl();
						}

					}
				});
				oTargetToolbar.addItem(that.removeTargetBtn);

				var createConstantButton = new sap.ui.commons.Button({
					text: resourceLoader.getText("txt_create_constant"),
					tooltip: resourceLoader.getText("txt_create_constant"),
					press: function(event) {
						var valueLabel = new sap.ui.commons.Label({
							text: resourceLoader.getText("txt_value_label")
						});
						var textField = new sap.ui.commons.TextField({
							liveChange: function(event) {
								var newValue = event.getParameter("liveValue");
								if (newValue === "") {
									CalcViewEditorUtil.showErrorMessageTooltip(textField, resourceLoader.getText("msg_value_not_empty"));
									okButton.setEnabled(false);
								} else if (that.isNameExists(newValue)) {
									CalcViewEditorUtil.showErrorMessageTooltip(textField, resourceLoader.getText("msg_constant_value_exist"));
									okButton.setEnabled(false);
								} else {
									CalcViewEditorUtil.clearErrorMessageTooltip(textField);
									okButton.setEnabled(true);
								}
							},
							change: function(event) {
								var newValue = event.getParameter("newValue");
								if (that.isNameExists(newValue)) {
									event.getSource().setTooltip(null);
									event.getSource().setValueState(sap.ui.core.ValueState.Error);
									okButton.setEnabled(false);
								} else {
									event.getSource().setTooltip(null);
									event.getSource().setValueState(sap.ui.core.ValueState.None);
									okButton.setEnabled(true);
								}

							}
						});
						var cancelButton = new sap.ui.commons.Button({
							text: "Cancel",
							press: function() {
								inputDialog.close();
							}
						});
						var okButton = new sap.ui.commons.Button({
							text: "Ok",
							press: function() {
								var value = textField.getValue();
								if (value !== "") {
									that.constants.push(value);
									that.updateMappingControl();
									inputDialog.close();
								}
							}
						});
						var inputDialog = new sap.ui.commons.Dialog({
							modal: true,
							initialFocus: textField,
							content: [valueLabel, textField],
							title: resourceLoader.getText("tit_enter_constant"),
							// width: "100%",
							buttons: [okButton, cancelButton],
							defaultButton: cancelButton
						});
						inputDialog.open();

					}
				});

				oTargetToolbar.addItem(createConstantButton);

				that.deleteConstnatButton = new sap.ui.commons.Button({
					text: resourceLoader.getText("txt_delete_constant"),
					tooltip: resourceLoader.getText("txt_delete_constant"),
					press: function() {
						var indices = mappingControl._getTargetTable().getSelectedIndices();
						for (var i = 0; i < indices.length; i++) {
							var targetSelectedIndex = indices[i]; //mappingControl._getTargetTable().getSelectedIndex();
							if (targetSelectedIndex > -1) {
								var targetContext = mappingControl._getTargetTable().getContextByIndex(targetSelectedIndex);
								var targetObject = targetContext.getProperty("");
								if (targetObject) {
									var removableIndex = -1;
									if (targetObject.type === "constant") {
										for (var k = 0; k < that.constants.length; k++) {
											var constant = that.constants[k];
											if (constant === targetObject.name) {
												removableIndex = k;
												break;
											}
										}
										if (removableIndex >= 0) {
											that.constants.splice(removableIndex, 1);
											that.removeConstantMappings(targetObject.name);
										}
									}
								}
							}
						}
						that.updateMappingControl();
						that.oMappingControl._getTargetTable().clearSelection();
					}
				});
				that.deleteConstnatButton.setEnabled(false);
				oTargetToolbar.addItem(that.deleteConstnatButton);
				return oTargetToolbar;
			},
			makeMappings: function(sourceObject, execute, commands) {
				var that = this;
				if (sourceObject) {
					if (!sourceObject.nodes) {
						commands.push(that.addMapping(sourceObject, true));
					} else {
						sourceObject.nodes.forEach(function(node) {
							that.makeMappings(node, execute, commands);
						});
					}
				}
				return commands;
			},
			// returns commands;`
			addMapping: function(sourceObject, execute) {
				var that = this;
				if (sourceObject && !sourceObject.inputEnabled) {
					if (!that.isAlreadyMapped({
						type: that.selectedKey,
						parameterName: sourceObject.name,
						input: sourceObject.parameterType === "input" ? sourceObject.typeName : undefined,
						viewNodeName: sourceObject.parameterType === "input" ? sourceObject.viewNode : undefined,
						externalParameter: sourceObject.parameterType !== "input" ? sourceObject.typeName : undefined,
						externalElement: sourceObject.parameterType === "element" ? sourceObject.typeName : undefined
					}))

					{
						var targetParameter = that._model.columnView.parameters.get(sourceObject.name);
						var canAddMapping = true;
						var executableCommands = [];

						if (!targetParameter) {
							var parameter = that.getSourceParameter(sourceObject);
						/*	if (parameter.typeOfElement) {
								canAddMapping = false;
							} */
							if (canAddMapping) {
								var parameterProperties = {};
								parameterProperties.objectAttributes = parameter.$getAttributes();
								if (!parameterProperties.objectAttributes.label) {
									parameterProperties.objectAttributes.label = " ";
								}
								if (parameter.inlineType) {
									parameterProperties.typeAttributes = parameter.inlineType.$getAttributes();
								}
								if (that.isConstant(sourceObject.name)) {
									parameterProperties.objectAttributes.name = that.getNextParameterName(sourceObject.name);
								}
								executableCommands.push(new commands.AddParameterCommand(parameterProperties));
								
							if(parameter.defaultRanges && parameter.defaultRanges.count() > 0){
							    parameter.defaultRanges.foreach(function(defaultRange){
							        executableCommands.push(new commands.CreateParameterDefaultRangeCommand(parameterProperties.objectAttributes.name,{
							         lowExpression: defaultRange.lowExpression,
								     lowValue: defaultRange.lowValue
							        }
							        ));
							    });
							}
							if(parameter.inlineType && parameter.inlineType.valueRanges && parameter.inlineType.valueRanges.count() > 0){
							    parameter.inlineType.valueRanges.foreach(function(valueRange){
							        executableCommands.push(new commands.CreateParameterValueRangeCommand(parameterProperties.objectAttributes.name,{
							         value: valueRange.value,
						      	     label: valueRange.label
							        }
							        ));
							    });
							}
							}

						}
						if (canAddMapping) {
							var source = {};
							var mapping = {};
							mapping.parameterName = sourceObject.name;
							mapping.parameterNameOtherView = sourceObject.name;
							source.type = sourceObject.parameterType;
							if (sourceObject.parameterType === "input") {
								source.typeName = sourceObject.typeIndex;
								source.viewNode = sourceObject.viewNode;
							} else if (sourceObject.parameterType === "parameter") {
								source.typeName = sourceObject.typeName;
							} else if (sourceObject.parameterType === "derivationrule") {
								source.typeName = sourceObject.typeName;
							} else if (sourceObject.parameterType === "element") {
								source.typeName = sourceObject.typeName;
							}
							var mappingCommand = new commands.CreateParameterMappingCommand({
								source: source,
								mapping: mapping
							});
							executableCommands.push(mappingCommand);
							if (execute) {
							    that._execute(executableCommands);
							    that.updateMappingControl();
							/*	if (createCommand) {
									that._execute([createCommand, mappingCommand]);
									that.updateMappingControl();
								} else  */
							}
							 return executableCommands;
							/*if (createCommand) {
								return [createCommand, mappingCommand];
							} else {
								return [mappingCommand];
							} */
						}
					}
				}
			},
			makeRemoveSourceMapping: function(sourceObject, execute, commands) {
				var that = this;
				if (sourceObject && sourceObject.nodes) {
					sourceObject.nodes.forEach(function(node) {
						if (node.nodes) {
							that.makeRemoveSourceMapping(node, execute, commands);
						} else {
							commands.push(that.removeSourceMapping(node, execute));
						}
					});
				}
				return commands;
			},
			removeSourceMapping: function(sourceObject, execute) {
				var that = this;
				if (sourceObject && !sourceObject.nodes) {
					var parameterMapping = that.getMapping({
						type: that.selectedKey,
						parameterName: sourceObject.name,
						inputName: sourceObject.parameterType === "input" ? sourceObject.typeName : undefined,
						viewNodeName: sourceObject.parameterType === "input" ? sourceObject.viewNode : undefined,
						externalParameterName: (sourceObject.parameterType !== "input" && sourceObject.parameterType !== "element") ? sourceObject.typeName : undefined,
						externalElementName: sourceObject.parameterType === "element" ? sourceObject.typeName : undefined
					});
					if (parameterMapping) {
						var source = {};
						var mapping = {};
						mapping.parameterName = parameterMapping.parameter ? parameterMapping.parameter.name : parameterMapping.value;
						mapping.parameterNameOtherView = sourceObject.name;
						source.type = sourceObject.parameterType;
						if (sourceObject.parameterType === "input") {
							source.typeName = sourceObject.typeIndex; //sourceObject.typeName;
							source.viewNode = sourceObject.viewNode;
						} else if (sourceObject.parameterType === "parameter") {
							source.typeName = sourceObject.typeName;
						} else if (sourceObject.parameterType === "derivationrule") {
							source.typeName = sourceObject.typeName;
						} else if (sourceObject.parameterType === "element") {
							source.typeName = sourceObject.typeName;
						}
						var command = new commands.RemoveParameterMappingCommand({
							source: source,
							mapping: mapping
						});
						if (execute) {
							that._execute(command);
						}
						return command;
					}
				}

			},
			updateConstantMapping: function(oldValue, newValue) {
				var that = this;
				var parameterMappings = [];
				that._model.columnView.parameters.foreach(function(parameter) {
					if (!parameter.isVariable && parameter.externalTypeOfElement && parameter.externalTypeOfEntity) {
						parameter.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === oldValue) {
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "parameter",
									typeName: parameter.name
								});
							}
						});
					}
				});
				that._model.columnView.parameters.foreach(function(parameter) {
					if (!parameter.isVariable && parameter.derivationRule && parameter.derivationRule.scriptObject) {
						parameter.derivationRule.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === oldValue) {
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "derivationrule",
									typeName: parameter.name
								});
							}
						});
					}
				});
				that._model.columnView.getDefaultNode().elements.foreach(function(element) {
					if (element.externalTypeOfEntity) {
						element.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === oldValue) {
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "element",
									typeName: element.name
								});
							}
						});
					}
				});
				that._model.columnView.viewNodes.foreach(function(viewNode) {
					viewNode.inputs.foreach(function(input) {
						input.parameterMappiongs.foreach(function(parameterMapping) {
							if (parameterMapping.value === oldValue) {
								var typeIndex = that.getTypeIndex(viewNode, input);
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "input",
									typeName: typeIndex, //input.getSource().name,
									viewNode: viewNode.name
								});
							}
						});
					});
				});
				var mappingCommands = [];
				if (parameterMappings.length > 0) {
					parameterMappings.forEach(function(parameterMapping) {
						mappingCommands.push(new commands.RemoveParameterMappingCommand({
							source: {
								type: parameterMapping.type,
								typeName: parameterMapping.typeName,
								viewNode: parameterMapping.viewNode
							},
							mapping: {
								parameterNameOtherView: parameterMapping.parameterMapping.parameterNameOtherView,
								value: parameterMapping.parameterMapping.value
							}
						}));

					});
					parameterMappings.forEach(function(parameterMapping) {
						mappingCommands.push(new commands.CreateParameterMappingCommand({
							source: {
								type: parameterMapping.type,
								typeName: parameterMapping.typeName,
								viewNode: parameterMapping.viewNode
							},
							mapping: {
								parameterNameOtherView: parameterMapping.parameterMapping.parameterNameOtherView,
								value: newValue
							}
						}));
					});
				}
				if (mappingCommands.lebgth > 0) {
					that._execute(mappingCommands);
				}

			},
			removeConstantMappings: function(constantValue) {

				var that = this;
				var parameterMappings = [];
				that._model.columnView.parameters.foreach(function(parameter) {
					if (parameter.externalTypeOfElement && parameter.externalTypeOfEntity) {
						parameter.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === constantValue) {
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "parameter",
									typeName: parameter.name
								});
							}
						});
					}
				});
				that._model.columnView.parameters.foreach(function(parameter) {
					if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
						parameter.derivationRule.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === constantValue) {
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "derivationrule",
									typeName: parameter.name
								});
							}
						});
					}
				});
				that._model.columnView.getDefaultNode().elements.foreach(function(element) {
					if (element.externalTypeOfEntity) {
						element.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === constantValue) {
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "element",
									typeName: element.name
								});
							}
						});
					}
				});
				that._model.columnView.viewNodes.foreach(function(viewNode) {
					viewNode.inputs.foreach(function(input) {
						input.parameterMappings.foreach(function(parameterMapping) {
							if (parameterMapping.value === constantValue) {
								var typeIndex = that.getTypeIndex(viewNode, input);
								parameterMappings.push({
									parameterMapping: parameterMapping,
									type: "input",
									typeName: typeIndex, //input.getSource().name,
									viewNode: viewNode.name
								});
							}
						});
					});
				});
				var mappingCommands = [];
				if (parameterMappings.length > 0) {
					parameterMappings.forEach(function(parameterMapping) {
						mappingCommands.push(new commands.RemoveParameterMappingCommand({
							source: {
								type: parameterMapping.type,
								typeName: parameterMapping.typeName,
								viewNode: parameterMapping.viewNode
							},
							mapping: {
								parameterNameOtherView: parameterMapping.parameterMapping.parameterNameOtherView,
								value: parameterMapping.parameterMapping.value
							}
						}));

					});
				}
				if (mappingCommands.length > 0) {
					that._execute(mappingCommands);
				}

			},
			updateMappingControl: function(viewNode) {

				var that = this;
				setTimeout(function() {
					//Hi Rajesh,
					//please check if this setTimeout is really required
					//when you are switching to aggregation view the old mapping control gets destroyed
					//switching back to this view creates a new instance
					//with this setTimeout you are calling the already destroyed instance
					//I added that check to prevent exceptions
					// -- Bertram
					if (!that.oMappingControl.bIsDestroyed) {
						that._transformationModel.setJSONData(that.createModel());
						that.oMappingControl.refreshUI();
						if (that.oMappingControl && that.oMappingControl._getSourceTable() && !that.collapsed) {
							var sourceTable = that.oMappingControl._getSourceTable();
							var length = sourceTable.getRows().length;
							for (var i = 0; i < length; i++) {
								sourceTable.expand(i);
							}
						}
						that.refreshToolItems();
					}

				}, 10);
			},
			createModel: function(viewNode) {
				var that = this;
				this.model = {
					"mappings": [],
					prefixMap: {
						"ns": "http://sap.com/hanastudio/modeler"
					},
					source: {
						id: "sourceTitleEx",
						title: "Source Title",
						rootNode: {
							name: "Root Source Element",
							occ: "1..n",
							tag: "RootSourceElement",
							type: "element",
							nodes: []
						}
					},
					target: {
						id: "targetTitleEx",
						title: "Target Title",
						rootNode: {
							"field-type": "VIEW",
							name: "Root Target Element",
							occ: "1..1",
							tag: "RootTargetElement",
							type: "element",
							nodes: []
						}
					}

				};
				// target elements
				that._model.columnView.parameters.foreach(function(parameter) {
					if (that.selectedKey !== "Data Sources" || !parameter.isVariable) {
						if (that.selectedKey === "Data Sources" || parameter.parameterType !== model.ParameterType.DERIVED_FROM_TABLE) {
							if (!(that.selectedKey === "Procedures/Scalar function for input parameters" && parameter.parameterType === model.ParameterType.DERIVED_FROM_PROCEDURE)) {
								var fieldType = "PARAMETER";
								var proxy = "";
								var toolTip;
								var proxyResults = that.isBasedOnElementProxy(parameter, that._model.columnView);
								if (proxyResults) {
									proxy = "_PROXY";
									toolTip = proxyResults;
								}

								var elementData = {
									"field-data-type": "VARCHAR",
									"field-length": "30",
									"field-type": parameter.isVariable ? "VARIABLE" + proxy : "PARAMETER" + proxy,
									name: parameter.name,
									tooltip: toolTip,
									tag: parameter.name,
									type: "element"
								};
								that.model.target.rootNode.nodes.push(elementData);
							}
						}
					}
				});
				that.constants.forEach(function(constant) {
					var fieldType = "CONSTANT";
					var elementData = {
						"field-data-type": "VARCHAR",
						"field-length": "30",
						"field-type": fieldType,
						name: constant,
						tag: constant,
						type: "constant"
					};
					that.model.target.rootNode.nodes.push(elementData);
				});
				if (that.selectedKey === "Data Sources") {
					that._model.columnView.viewNodes.foreach(function(viewNode) {
						// source elements
						viewNode.inputs.foreach(function(input) {
							var fieldType = "CUBE";
							if (input.getSource()) {
								var source = input.getSource();
								/* if (source.parameters && source.parameters.count() <= 0) {
                                    source.createParameter({
                                        name: "IP_1",
                                        label: "IP_1"
                                    }, null, "IP_1");
                                    source.createParameter({
                                        name: "IP_2",
                                        label: "IP_2"
                                    }, null, "IP_2");
                                } */
								if (input.getSource().$$className === "Entity" && input.getSource().type !== "DATA_BASE_TABLE" && input.getSource().parameters.count() >
									0 && that.hasParameter(source)) {
									fieldType = "VIEW";
									var proxy = "";
									if (input.getSource().isProxy) {
										proxy = "_ERROR";
									}
									var inputData = {
										"tag": input.getSource().fqName + "(" + viewNode.name + ")",
										"type": "input",
										"name": input.getSource().name,
										tooltip: input.getSource().isProxy ? "This is a proxy data source" : undefined,
										"displayName": input.getSource().fqName + "(" + viewNode.name + ")",
										"field-type": source.type.toUpperCase() + proxy,
										"nodes": [],
										isProxy: input.getSource().isProxy
									};

									var typeIndex = 0;
									if (viewNode.type === "JoinNode") {
										if (viewNode.inputs.get(0) === input) {
											typeIndex = 0;
										} else {
											typeIndex = 1;
										}
									}
									if (source && source.parameters && source.parameters.count() > 0) {
										source.parameters.foreach(function(parameter) {

											if (!parameter.isVariable && parameter.parameterType !== model.ParameterType.DERIVED_FROM_TABLE) {
												var proxy = "";
												if (parameter.isProxy) {
													proxy = "_ERROR";
												}
												var mapping = that.getMapping({
													inputName: input.getSource().name,
													viewNodeName: viewNode.name,
													parameterName: parameter.name
												});
												/* var mapping =  that.getMapping({inputName:input.getSource().name,parameterName:parameter.name});
                                            if(mapping && mapping.parameter){
                                                if(that.isBasedOnElementProxy(mapping.parameter,that._model.columnView)){
                                                     proxy = "_PROXY";
                                                 }
                                            }*/
												if (!proxy || mapping) {
													// var inputData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "PARAMETER" + proxy,
														name: parameter.name,
														tag: parameter.name,
														type: "parameter",
														parameterType: "input",
														tooltip: parameter.isProxy ? "This is a proxy parameter" : undefined,
														typeName: input.getSource().name,
														typeIndex: typeIndex,
														viewNode: viewNode.name
													};
													inputData.nodes.push(elementData);
												}
											}
										});
									}
									if (inputData.nodes.length > 0) {
										that.model.source.rootNode.nodes.push(inputData);
										that.unsubscribe(input.getSource());
										that.subscribe(input.getSource());
									}
									if (input.parameterMappings.count() > 0) {
										input.parameterMappings.foreach(function(mapping) {
											var oContext = null;
											var inputData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
											var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(
												10, 10)));
											mappingModel.targetPaths = ["/RootTargetElement/" + (mapping.parameter ? mapping.parameter.name : mapping.value) /*mapping.type == model.ParameterMappingType.PARAMETER_MAPPING ? mapping.parameter.name : mapping.value*/ ];
											mappingModel.sourcePaths = ["/RootSourceElement/" + inputData.tag + "/" + mapping.parameterNameOtherView];
											mappingModel.fn = {};
											mappingModel.fn.expression = mappingModel.sourcePaths[0];
											mappingModel.fn.description = "";
											var parameterNameOtherView = mapping.parameterNameOtherView;
											var sourceParameterExist = false;
											source.parameters.foreach(function(parameter) {
												if (!parameter.isVariable && parameter.name === parameterNameOtherView) {
													sourceParameterExist = true;
												}
											});
											if (sourceParameterExist) {
												that.model.mappings.push(mappingModel);
												if (!mapping.parameter) {
													if (!that.isConstant(mapping.value)) {
														var elementData = {
															"field-data-type": "VARCHAR",
															"field-length": "30",
															"field-type": "CONSTANT",
															name: mapping.value,
															tag: mapping.value,
															type: "constant"
														};
														that.model.target.rootNode.nodes.push(elementData);
														that.constants.push(mapping.value);
													}
												}
											}
										});

									}
									that._model.columnView.parameters.foreach(function(parameter) {
										if (parameter.externalTypeOfElement && parameter.externalTypeOfEntity) {
											parameter.parameterMappings.foreach(function(mapping) {
												if (!mapping.parameter) {
													if (!that.isConstant(mapping.value)) {
														var elementData = {
															"field-data-type": "VARCHAR",
															"field-length": "30",
															"field-type": "CONSTANT",
															name: mapping.value,
															tag: mapping.value,
															type: "constant"
														};
														that.model.target.rootNode.nodes.push(elementData);
														that.constants.push(mapping.value);
													}
												}
											});
										}
									});
									that._model.columnView.parameters.foreach(function(parameter) {
										if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
											parameter.derivationRule.parameterMappings.foreach(function(mapping) {
												if (!mapping.parameter) {
													if (!that.isConstant(mapping.value)) {
														var elementData = {
															"field-data-type": "VARCHAR",
															"field-length": "30",
															"field-type": "CONSTANT",
															name: mapping.value,
															tag: mapping.value,
															type: "constant"
														};
														that.model.target.rootNode.nodes.push(elementData);
														that.constants.push(mapping.value);
													}
												}
											});
										}
									});
									that._model.columnView.getDefaultNode().elements.foreach(function(element) {
										if (element.externalTypeOfEntity) {
											element.parameterMappings.foreach(function(mapping) {
												if (!mapping.parameter) {
													if (!that.isConstant(mapping.value)) {
														var elementData = {
															"field-data-type": "VARCHAR",
															"field-length": "30",
															"field-type": "CONSTANT",
															name: mapping.value,
															tag: mapping.value,
															type: "constant"
														};
														that.model.target.rootNode.nodes.push(elementData);
														that.constants.push(mapping.value);
													}
												}
											});
										}
									});

								}
							}

						});

					});
				} else if (that.selectedKey === "Procedures/Scalar function for input parameters") {
					that._model.columnView.parameters.foreach(function(parameter) {
						if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
							var entity = parameter.derivationRule.scriptObject;
							var source = entity; //.getSource();
							if (source && source.$$className === "Entity" && (source.type === "procedure" || source.type === "hdbprocedure" || source.type ===
								"hdbscalarfunction") && source.parameters.count() > 0 && !source.errMsg) {
								var fieldType = "PARAMETER";
								var proxy = "";
								var proxyResults = that.isBasedOnElementProxy(parameter, that._model.columnView);
								var toolTip;
								if (proxyResults) {
									proxy = "_PROXY";
									toolTip = proxyResults;
								}
								var inputEnabled = parameter.derivationRule.inputEnabled;
								var parameterData = {
									"field-data-type": "VARCHAR",
									"field-length": "30",
									"field-type": "PARAMETER" + proxy,
									name: parameter.name,
									tooltip: toolTip,
									tag: parameter.name,
									type: "element",
									inpuEnabled: parameter.derivationRule.inputEnabled,
									nodes: []
								};
								var sourceProxy = "";
								if (source.isProxy) {
									sourceProxy = "_ERROR";
								}
								var entityData = {
									"field-type": source.type.toUpperCase() + sourceProxy,
									name: source.name,
									tag: source.name,
									tooltip: source.isProxy ? "This is a proxy data source" : undefined,
									displayName: source.fqName,
									type: "element",
									nodes: []
								};

								if (source.parameters.count() > 0) {
									source.parameters.foreach(function(externalParameter) {
										if (parameter.parameterType !== model.ParameterType.DERIVED_FROM_TABLE) {
											var proxy = "";
											if (externalParameter.isProxy) {
												proxy = "_ERROR";
											}
											var mapping = that.getMapping({
												externalParameterName: parameter.name,
												parameterName: externalParameter.name
											});
											if (!proxy || mapping) {
												var extarnalParameterData = {
													"field-data-type": "VARCHAR",
													"field-length": "30",
													"field-type": externalParameter.isVariable ? "VARIABLE" + proxy : "PARAMETER" + proxy,
													name: externalParameter.name,
													tag: externalParameter.name,
													type: "parameter",
													tooltip: externalParameter.isProxy ? "This is a proxy parameter" : undefined,
													parameterType: "derivationrule",
													typeName: parameter.name,
													inputEnabled: inputEnabled
												};
												entityData.nodes.push(extarnalParameterData);
											}
										}
									});
								}
								if (entityData.nodes.length > 0) {
									parameterData.nodes.push(entityData);
								}
								if (parameterData.nodes.length > 0) {
									that.model.source.rootNode.nodes.push(parameterData);
									that.unsubscribe(parameter.derivationRule);
									that.subscribe(parameter.derivationRule);
								}
								parameter.derivationRule.parameterMappings.foreach(function(mapping) {
									var oContext = null;
									var parameterData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
									var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10,
										10)));
									mappingModel.targetPaths = ["/RootTargetElement/" + (mapping.parameter ? mapping.parameter.name : mapping.value) /*mapping.type == model.ParameterMappingType.PARAMETER_MAPPING ? mapping.parameter.name : mapping.value*/ ];
									mappingModel.sourcePaths = ["/RootSourceElement/" + parameterData.name + "/" + source.name + "/" + mapping.parameterNameOtherView];
									mappingModel.fn = {};
									mappingModel.fn.expression = mappingModel.sourcePaths[0];
									mappingModel.fn.description = "";
									var parameterNameOtherView = mapping.parameterNameOtherView;
									var sourceParameterExist = false;
									source.parameters.foreach(function(parameter) {
										if (parameter.name === parameterNameOtherView) {
											sourceParameterExist = true;
										}
									});
									if (sourceParameterExist) {
										that.model.mappings.push(mappingModel);
										if (!mapping.parameter) {
											if (!that.isConstant(mapping.value)) {
												var elementData = {
													"field-data-type": "VARCHAR",
													"field-length": "30",
													"field-type": "CONSTANT",
													name: mapping.value,
													tag: mapping.value,
													type: "constant"
												};
												that.model.target.rootNode.nodes.push(elementData);
												that.constants.push(mapping.value);
											}
										}
									}
								});

								that._model.columnView.viewNodes.foreach(function(viewNode) {
									// source elements
									viewNode.inputs.foreach(function(input) {
										if (input.getSource()) {
											var source = input.getSource();
											if (source.parameters && source.parameters.count() <= 0) {
												input.parameterMappings.foreach(function(mapping) {
													if (!mapping.parameter) {
														if (!that.isConstant(mapping.value)) {
															var elementData = {
																"field-data-type": "VARCHAR",
																"field-length": "30",
																"field-type": "CONSTANT",
																name: mapping.value,
																tag: mapping.value,
																type: "constant"
															};
															that.model.target.rootNode.nodes.push(elementData);
															that.constants.push(mapping.value);
														}
													}
												});
											}
										}
									});
								});
								that._model.columnView.getDefaultNode().elements.foreach(function(element) {
									if (element.externalTypeOfEntity) {
										element.parameterMappings.foreach(function(mapping) {
											if (!mapping.parameter) {
												if (!that.isConstant(mapping.value)) {
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "CONSTANT",
														name: mapping.value,
														tag: mapping.value,
														type: "constant"
													};
													that.model.target.rootNode.nodes.push(elementData);
													that.constants.push(mapping.value);
												}
											}
										});
									}
								});
								that._model.columnView.parameters.foreach(function(parameter) {
									if (parameter.externalTypeOfElement && parameter.externalTypeOfEntity) {
										parameter.parameterMappings.foreach(function(mapping) {
											if (!mapping.parameter) {
												if (!that.isConstant(mapping.value)) {
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "CONSTANT",
														name: mapping.value,
														tag: mapping.value,
														type: "constant"
													};
													that.model.target.rootNode.nodes.push(elementData);
													that.constants.push(mapping.value);
												}
											}
										});
									}
								});
							}
						}
					});
				} else if (that.selectedKey === "Views for value help for attributes") {
					that._model.columnView.getDefaultNode().elements.foreach(function(element) {
						if (element.externalTypeOfEntity) {
							var entity = element.externalTypeOfEntity;
							var source = entity; //.getSource();
							if (source && source.$$className === "Entity" && source.type !== "DATA_BASE_TABLE" && source.parameters.count() > 0) {
								var fieldType = "ATTRIBUTE";
								var proxy = "";
								var proxyResults = that.isBasedOnElementProxy(element, that._model.columnView);
								var toolTip;
								if (proxyResults) {
									// proxy = "_PROXY";
									proxy = "_ERROR";
									toolTip = proxyResults;
								}
								var parameterData = {
									"field-data-type": "VARCHAR",
									"field-length": "30",
									"field-type": fieldType + proxy,
									name: element.name,
									tooltip: toolTip,
									tag: element.name,
									type: "element",
									nodes: []
								};
								var sourceProxy = "";
								if (source.isProxy) {
									sourceProxy = "_ERROR";
								}
								var entityData = {
									"field-type": source.type.toUpperCase() + sourceProxy,
									name: source.name,
									tag: source.name,
									tooltip: source.isProxy ? "This is a proxy data source" : undefined,
									displayName: source.fqName,
									type: "element",
									nodes: []
								};

								if (source.parameters.count() > 0) {
									source.parameters.foreach(function(externalParameter) {
										// if (parameter.parameterType !== model.ParameterType.DERIVED_FROM_TABLE) {
										var proxy = "";
										if (externalParameter.isProxy) {
											proxy = "_ERROR";
										}
										var mapping = that.getMapping({
											externalElementName: element.name,
											parameterName: externalParameter.name
										});
										if (!proxy || mapping) {
											var extarnalParameterData = {
												"field-data-type": "VARCHAR",
												"field-length": "30",
												"field-type": externalParameter.isVariable ? "VARIABLE" + proxy : "PARAMETER" + proxy,
												name: externalParameter.name,
												tag: externalParameter.name,
												type: "parameter",
												tooltip: externalParameter.isProxy ? "This is a proxy parameter" : undefined,
												parameterType: "element",
												typeName: element.name
											};
											entityData.nodes.push(extarnalParameterData);
										}
										// }
									});
								}
								if (entityData.nodes.length > 0) {
									parameterData.nodes.push(entityData);
								}
								if (parameterData.nodes.length > 0) {
									that.model.source.rootNode.nodes.push(parameterData);
									that.unsubscribe(element);
									that.subscribe(element);
								}
								element.parameterMappings.foreach(function(mapping) {
									var oContext = null;
									var parameterData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
									var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10,
										10)));
									mappingModel.targetPaths = ["/RootTargetElement/" + (mapping.parameter ? mapping.parameter.name : mapping.value) /*mapping.type == model.ParameterMappingType.PARAMETER_MAPPING ? mapping.parameter.name : mapping.value*/ ];
									mappingModel.sourcePaths = ["/RootSourceElement/" + parameterData.name + "/" + source.name + "/" + mapping.parameterNameOtherView];
									mappingModel.fn = {};
									mappingModel.fn.expression = mappingModel.sourcePaths[0];
									mappingModel.fn.description = "";
									var parameterNameOtherView = mapping.parameterNameOtherView;
									var sourceParameterExist = false;
									source.parameters.foreach(function(parameter) {
										if (parameter.name === parameterNameOtherView) {
											sourceParameterExist = true;
										}
									});
									if (sourceParameterExist) {
										that.model.mappings.push(mappingModel);
										if (!mapping.parameter) {
											if (!that.isConstant(mapping.value)) {
												var elementData = {
													"field-data-type": "VARCHAR",
													"field-length": "30",
													"field-type": "CONSTANT",
													name: mapping.value,
													tag: mapping.value,
													type: "constant"
												};
												that.model.target.rootNode.nodes.push(elementData);
												that.constants.push(mapping.value);
											}
										}
									}
								});

								that._model.columnView.viewNodes.foreach(function(viewNode) {
									// source elements
									viewNode.inputs.foreach(function(input) {
										if (input.getSource()) {
											var source = input.getSource();
											if (source.parameters && source.parameters.count() <= 0) {
												input.parameterMappings.foreach(function(mapping) {
													if (!mapping.parameter) {
														if (!that.isConstant(mapping.value)) {
															var elementData = {
																"field-data-type": "VARCHAR",
																"field-length": "30",
																"field-type": "CONSTANT",
																name: mapping.value,
																tag: mapping.value,
																type: "constant"
															};
															that.model.target.rootNode.nodes.push(elementData);
															that.constants.push(mapping.value);
														}
													}
												});
											}
										}
									});
								});
								that._model.columnView.parameters.foreach(function(parameter) {
									if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
										parameter.derivationRule.parameterMappings.foreach(function(mapping) {
											if (!mapping.parameter) {
												if (!that.isConstant(mapping.value)) {
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "CONSTANT",
														name: mapping.value,
														tag: mapping.value,
														type: "constant"
													};
													that.model.target.rootNode.nodes.push(elementData);
													that.constants.push(mapping.value);
												}
											}
										});
									}
								});
								that._model.columnView.parameters.foreach(function(parameter) {
									if (parameter.externalTypeOfElement && parameter.externalTypeOfEntity) {
										parameter.parameterMappings.foreach(function(mapping) {
											if (!mapping.parameter) {
												if (!that.isConstant(mapping.value)) {
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "CONSTANT",
														name: mapping.value,
														tag: mapping.value,
														type: "constant"
													};
													that.model.target.rootNode.nodes.push(elementData);
													that.constants.push(mapping.value);
												}
											}
										});
									}
								});
							}
						}
					});
				} else {
					that._model.columnView.parameters.foreach(function(parameter) {
						if (parameter.externalTypeOfElement && parameter.externalTypeOfEntity) {
							var entity = parameter.externalTypeOfEntity;
							var source = entity; //.getSource();
							/*  if (source.parameters && source.parameters.count() <= 0) {
                                source.createParameter({
                                    name: "IP_1",
                                    label: "IP_1"
                                }, null, "IP_1");
                                source.createParameter({
                                    name: "IP_2",
                                    label: "IP_2"
                                }, null, "IP_2");
                                source.createParameter({
                                    name: "VAR_1",
                                    label: "VAR_1",
                                    isVariable: true
                                }, null, "VAR_1");
                            } */
							if (source && source.$$className === "Entity" && source.type !== "DATA_BASE_TABLE" && source.parameters.count() > 0) {
								var fieldType = "PARAMETER";
								var proxy = "";
								var proxyResults = that.isBasedOnElementProxy(parameter, that._model.columnView);
								var toolTip;
								if (proxyResults) {
									proxy = "_PROXY";
									toolTip = proxyResults;
								}
								var parameterData = {
									"field-data-type": "VARCHAR",
									"field-length": "30",
									"field-type": parameter.isVariable ? "VARIABLE" + proxy : "PARAMETER" + proxy,
									name: parameter.name,
									tooltip: toolTip,
									tag: parameter.name,
									type: "element",
									nodes: []
								};
								var sourceProxy = "";
								if (source.isProxy) {
									sourceProxy = "_ERROR";
								}
								var entityData = {
									"field-type": source.type + sourceProxy,
									name: source.name,
									tag: source.name,
									tooltip: source.isProxy ? "This is a proxy data source" : undefined,
									displayName: source.fqName,
									type: "element",
									nodes: []
								};

								if (source.parameters.count() > 0) {
									source.parameters.foreach(function(externalParameter) {
										if (parameter.parameterType !== model.ParameterType.DERIVED_FROM_TABLE) {
											var proxy = "";
											if (externalParameter.isProxy) {
												proxy = "_ERROR";
											}
											var mapping = that.getMapping({
												externalParameterName: parameter.name,
												parameterName: externalParameter.name
											});
											/* var mapping =  that.getMapping({externalParameterName:parameter.name,parameterName:externalParameter.name});
                                            if(mapping && mapping.parameter){
                                                if(that.isBasedOnElementProxy(mapping.parameter,that._model.columnView)){
                                                     proxy = "_PROXY";
                                                 }
                                            }*/
											if (!proxy || mapping) {
												var extarnalParameterData = {
													"field-data-type": "VARCHAR",
													"field-length": "30",
													"field-type": externalParameter.isVariable ? "VARIABLE" + proxy : "PARAMETER" + proxy,
													name: externalParameter.name,
													tag: externalParameter.name,
													type: "parameter",
													tooltip: externalParameter.isProxy ? "This is a proxy parameter" : undefined,
													parameterType: "parameter",
													typeName: parameter.name
												};
												entityData.nodes.push(extarnalParameterData);
											}
										}
									});
								}
								if (entityData.nodes.length > 0) {
									parameterData.nodes.push(entityData);
								}
								if (parameterData.nodes.length > 0) {
									that.model.source.rootNode.nodes.push(parameterData);
									that.unsubscribe(parameter);
									that.subscribe(parameter);
								}
								parameter.parameterMappings.foreach(function(mapping) {
									var oContext = null;
									var parameterData = that.model.source.rootNode.nodes[that.model.source.rootNode.nodes.length - 1];
									var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10,
										10)));
									mappingModel.targetPaths = ["/RootTargetElement/" + (mapping.parameter ? mapping.parameter.name : mapping.value) /*mapping.type == model.ParameterMappingType.PARAMETER_MAPPING ? mapping.parameter.name : mapping.value*/ ];
									mappingModel.sourcePaths = ["/RootSourceElement/" + parameterData.name + "/" + source.name + "/" + mapping.parameterNameOtherView];
									mappingModel.fn = {};
									mappingModel.fn.expression = mappingModel.sourcePaths[0];
									mappingModel.fn.description = "";
									var parameterNameOtherView = mapping.parameterNameOtherView;
									var sourceParameterExist = false;
									source.parameters.foreach(function(parameter) {
										if (parameter.name === parameterNameOtherView) {
											sourceParameterExist = true;
										}
									});
									if (sourceParameterExist) {
										that.model.mappings.push(mappingModel);
										if (!mapping.parameter) {
											if (!that.isConstant(mapping.value)) {
												var elementData = {
													"field-data-type": "VARCHAR",
													"field-length": "30",
													"field-type": "CONSTANT",
													name: mapping.value,
													tag: mapping.value,
													type: "constant"
												};
												that.model.target.rootNode.nodes.push(elementData);
												that.constants.push(mapping.value);
											}
										}
									}
								});

								that._model.columnView.viewNodes.foreach(function(viewNode) {
									// source elements
									viewNode.inputs.foreach(function(input) {
										if (input.getSource()) {
											var source = input.getSource();
											if (source.parameters && source.parameters.count() <= 0) {
												input.parameterMappings.foreach(function(mapping) {
													if (!mapping.parameter) {
														if (!that.isConstant(mapping.value)) {
															var elementData = {
																"field-data-type": "VARCHAR",
																"field-length": "30",
																"field-type": "CONSTANT",
																name: mapping.value,
																tag: mapping.value,
																type: "constant"
															};
															that.model.target.rootNode.nodes.push(elementData);
															that.constants.push(mapping.value);
														}
													}
												});
											}
										}
									});
								});
								that._model.columnView.parameters.foreach(function(parameter) {
									if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
										parameter.derivationRule.parameterMappings.foreach(function(mapping) {
											if (!mapping.parameter) {
												if (!that.isConstant(mapping.value)) {
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "CONSTANT",
														name: mapping.value,
														tag: mapping.value,
														type: "constant"
													};
													that.model.target.rootNode.nodes.push(elementData);
													that.constants.push(mapping.value);
												}
											}
										});
									}
								});
								that._model.columnView.getDefaultNode().elements.foreach(function(element) {
									if (element.externalTypeOfEntity) {
										element.parameterMappings.foreach(function(mapping) {
											if (!mapping.parameter) {
												if (!that.isConstant(mapping.value)) {
													var elementData = {
														"field-data-type": "VARCHAR",
														"field-length": "30",
														"field-type": "CONSTANT",
														name: mapping.value,
														tag: mapping.value,
														type: "constant"
													};
													that.model.target.rootNode.nodes.push(elementData);
													that.constants.push(mapping.value);
												}
											}
										});
									}
								});
							}
						}
					});
				}
				return this.model;
			},
			isConstant: function(name) {
				if (name) {
					for (var i = 0; i < this.constants.length; i++) {
						if (this.constants[i] == name) {
							return true;
						}
					}
				}
				return false;
			},
			// attributes: type:DATA SOURCES , parameterName, input, externalParameter
			isAlreadyMapped: function(attributes) {
				var that = this;
				var mapped = false;
				if (attributes.type === "Data Sources") {
					that._model.columnView.viewNodes.foreach(function(viewNode) {
						viewNode.inputs.foreach(function(input) {
							if (!mapped) {
								if (attributes.input) {
									if (viewNode.name === attributes.viewNodeName) {
										if (input.getSource().name === attributes.input) {
											input.parameterMappings.foreach(function(parameterMapping) {
												if (parameterMapping.parameterNameOtherView === attributes.parameterName) {
													mapped = true;
												}
											});
										}
									}
								} else {
									input.parameterMappings.foreach(function(parameterMapping) {
										if (parameterMapping.parameterNameOtherView === attributes.parameterName) {
											mapped = true;
										}
									});
								}
							}
						});
					});
				} else if (attributes.type === "Procedures/Scalar function for input parameters") {
					that._model.columnView.parameters.foreach(function(parameter) {
						if (attributes.externalParameter) {
							if (parameter.name === attributes.externalParameter) {
								if (!parameter.isVariable && parameter.derivationRule && parameter.derivationRule.scriptObject && !mapped) {
									parameter.derivationRule.parameterMappings.foreach(function(parameterMapping) {
										if (parameterMapping.parameterNameOtherView === attributes.parameterName && !mapped) {
											mapped = true;
										}
									});
								}
							}
						} else {
							if (!parameter.isVariable && parameter.derivationRule && parameter.derivationRule.scriptObject && !mapped) {
								parameter.derivationRule.parameterMappings.foreach(function(parameterMapping) {
									if (parameterMapping.parameterNameOtherView === attributes.parameterName && !mapped) {
										mapped = true;
									}
								});
							}
						}
					});
				} else if (attributes.type === "Views for value help for attributes") {
					that._model.columnView.getDefaultNode().elements.foreach(function(element) {
						if (attributes.externalElement) {
							if (element.name === attributes.externalElement) {
								if (element.externalTypeOfEntity && !mapped) {
									element.parameterMappings.foreach(function(parameterMapping) {
										if (parameterMapping.parameterNameOtherView === attributes.parameterName && !mapped) {
											mapped = true;
										}
									});
								}
							}
						} else {
							if (element.externalTypeOfEntity && !mapped) {
								element.parameterMappings.foreach(function(parameterMapping) {
									if (parameterMapping.parameterNameOtherView === attributes.parameterName && !mapped) {
										mapped = true;
									}
								});
							}
						}
					});
				} else {
					that._model.columnView.parameters.foreach(function(parameter) {
						if (attributes.externalParameter) {
							if (parameter.name === attributes.externalParameter) {
								if (!parameter.isVariable && parameter.externalTypeOfElement && parameter.externalTypeOfEntity && !mapped) {
									parameter.parameterMappings.foreach(function(parameterMapping) {
										if (parameterMapping.parameterNameOtherView === attributes.parameterName && !mapped) {
											mapped = true;
										}
									});
								}
							}
						} else {
							if (!parameter.isVariable && parameter.externalTypeOfElement && parameter.externalTypeOfEntity && !mapped) {
								parameter.parameterMappings.foreach(function(parameterMapping) {
									if (parameterMapping.parameterNameOtherView === attributes.parameterName && !mapped) {
										mapped = true;
									}
								});
							}
						}
					});
				}
				return mapped;
			},

			getNextParameterName: function(name) {
				var that = this;
				var parameterName = name + "_" + 1;
				var gotName = true;
				var count = 2;
				while (gotName) {
					if (that._model.columnView.parameters.get(parameterName) || that.isConstant(parameterName)) {
						parameterName = name + "_" + count;
						count++;
					} else {
						gotName = false;
					}
				}
				return parameterName;
			},
			getMapping: function(attributes) {
				var that = this;
				var mappingObject;
				if (that.selectedKey === "Data Sources") {
					if (attributes.inputName) {
						that._model.columnView.viewNodes.foreach(function(viewNode) {
							if (viewNode.name === attributes.viewNodeName) {
							    var viewNodeName = "(" + viewNode.name + ")"; 
								viewNode.inputs.foreach(function(input) {
									if (input.getSource() && (input.getSource().name === attributes.inputName 
									|| input.getSource().fqName === attributes.inputName 
									|| input.getSource().fqName + viewNodeName === attributes.inputName)) {
										input.parameterMappings.foreach(function(mapping) {
											if (mapping.parameterNameOtherView === attributes.parameterName && !mappingObject) {
												mappingObject = mapping;
											}
										});
									}
								});
							}
						});
					}
				} else if (attributes.externalParameterName) {
					if (that.selectedKey === "Procedures/Scalar function for input parameters") {
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.name === attributes.externalParameterName) {
								if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
									parameter.derivationRule.parameterMappings.foreach(function(mapping) {
										if (mapping.parameterNameOtherView === attributes.parameterName && !mappingObject) {
											mappingObject = mapping;
										}
									});
								}
							}
						});
					} else {
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.name === attributes.externalParameterName) {
								parameter.parameterMappings.foreach(function(mapping) {
									if (mapping.parameterNameOtherView === attributes.parameterName && !mappingObject) {
										mappingObject = mapping;
									}
								});
							}
						});

					}
				} else if (attributes.externalElementName) {
					that._model.columnView.getDefaultNode().elements.foreach(function(element) {
						if (element.name === attributes.externalElementName) {
							if (element.externalTypeOfEntity) {
								element.parameterMappings.foreach(function(mapping) {
									if (mapping.parameterNameOtherView === attributes.parameterName && !mappingObject) {
										mappingObject = mapping;
									}
								});
							}
						}
					});
				}
				return mappingObject;
			},
			getMappingsForTargetParameter: function(attributes) {
				var that = this;
				var mappingObjects = [];
				if (that.selectedKey === "Data Sources") {
					that._model.columnView.viewNodes.foreach(function(viewNode) {
						viewNode.inputs.foreach(function(input) {
							input.parameterMappings.foreach(function(mapping) {
								if ((mapping.parameter && mapping.parameter.name === attributes.parameterName) || mapping.value === attributes.parameterName) {
									mappingObjects.push(mapping);
								}
							});
						});
					});
				} else if (attributes.externalParameterName) {
					if (that.selectedKey === "Procedures/Scalar function for input parameters") {
						that._model.columnView.parameters.foreach(function(parameter) {
							if (parameter.derivationRule && parameter.derivationRule.scriptObject) {
								parameter.derivationRule.parameterMappings.foreach(function(mapping) {
									if ((mapping.parameter && mapping.parameter.name === attributes.parameterName) || mapping.value === attributes.parameterName) {
										mappingObjects.push(mapping);
									}
								});
							}
						});
					} else {
						that._model.columnView.parameters.foreach(function(parameter) {
							parameter.parameterMappings.foreach(function(mapping) {
								if ((mapping.parameter && mapping.parameter.name === attributes.parameterName) || mapping.value === attributes.parameterName) {
									mappingObjects.push(mapping);
								}
							});
						});

					}
				} else if (attributes.externalElementName) {
					that._model.columnView.getDefaultNode().elements.foreach(function(element) {
						if (element.externalTypeOfEntity) {
							element.parameterMappings.foreach(function(mapping) {
								if ((mapping.parameter && mapping.parameter.name === attributes.parameterName) || mapping.value === attributes.parameterName) {
									mappingObjects.push(mapping);
								}
							});
						}
					});
				}
				return mappingObjects;
			},
			isNameExists: function(name) {
				var that = this;
				if (name) {
					var parameters = that._model.columnView.parameters.toArray();
					for (var i = 0; i < parameters.length; i++) {
						var parameter = parameters[i];
						if (name === parameter.name) {
							return true;
						}
					}
					for (var j = 0; j < that.constants.length; j++) {
						if (name === that.constants[j]) {
							return true;
						}
					}
				}
				return false;
			},
			getTypeIndex: function(viewNode, input) {
				var typeIndex = 0;
				if (viewNode.type == "JoinNode") {
					if (viewNode.inputs.get(0) == input)
						typeIndex = 0;
					else
						typeIndex = 1;
				}
				return typeIndex;
			},
			close: function() {

			},
			hasParameter: function(source) {
				var hasParameter = false;
				if (source.$$className === "Entity" && source.type !== "DATA_BASE_TABLE" && source.parameters.count() > 0) {
					source.parameters.foreach(function(parameter) {
						if (!parameter.isVariable && parameter.parameterType !== model.ParameterType.DERIVED_FROM_TABLE) {
							hasParameter = true;
						}
					});
				}
				return hasParameter;
			},
			isBasedOnElementProxy: function(element, columnView) {
				if (element && columnView) {
					var results = CalcViewEditorUtil.isBasedOnElementProxy({
						object: element,
						columnView: columnView
					});
					if (results) {
						if (element.isVariable) {
							return CalcViewEditorUtil.consolidateResults(results, {
								elementType: "variable"
							});
						} else {
							return CalcViewEditorUtil.consolidateResults(results, {
								elementType: "parameter"
							});
						}
					}
				}
				return false;
			}

		};
		return ParameterManageMapping;
	});
