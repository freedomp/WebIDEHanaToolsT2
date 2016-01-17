/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../../util/ResourceLoader",
        "../../base/modelbase",
        "../../viewmodel/commands",
        "../CalcViewEditorUtil",
        "../dialogs/FindDialog",
        "../../viewmodel/ModelProxyResolver",
        "../../viewmodel/model"
    ],
	function(ResourceLoader, modelbase, commands, CalcViewEditorUtil, FindDialog, ModelProxyResolver, viewModel) {
		"use strict";
		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		/**
		 * @class
		 */
		var JoinMapping = function(Parameter) {
			this.viewNode = Parameter.viewNode;
			this.inputSource = Parameter.inputSource;
			this.typeOfReplace = Parameter.typeOfReplace;
			this.newNode = Parameter.newNode;
			this.callBackForDeleteCheckBox = Parameter.callBackForDeleteCheckBox;
		};

		JoinMapping.prototype = {

			setNewSource: function(newSource) {
				this.newSource = newSource;
				this.updateMappingControl();
				//    this.oMappingControl.refreshUI();
			},

			execute: function() {
				var oTransformation = this.oMappingControl.getTransformation();
				var aMappings = oTransformation.getMappings();
				return aMappings;
			},
			getContend: function() {

				var that = this;
				//<!--loading mock data
				//    jQuery.sap.registerModulePath('playground.bertram');
				//jQuery.sap.require("playground.bertram.Images");
				// jQuery.sap.require("playground.bertram.data");

				// jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.images");
				// create mocked model with undoManager
					jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images");
				var oModel = this.createMockModel(that.viewNode, that.inputSource);
				//<--

				sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["com.sap.it.spc.webui.mapping"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
				sap.ui.getCore().loadLibrary('com.sap.it.spc.webui.mapping', '/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/com/sap/it/spc/webui/mapping');
				sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["sap.watt.hanaplugins.editor.common.treemap"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
				sap.ui.getCore().loadLibrary('sap.watt.hanaplugins.editor.common.treemap',
				'/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/sap/hana/ide/common/plugin/treemap');

				jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.MappingControlEx");
			
				var channelId = "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.replaceDN.editor.id" + Math.round(Math.random() * 10000);
				//var channelId = "join.sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.replaceDN.editor"; 
				//<!--create mapping control
				that.oMappingControl = new sap.watt.hanaplugins.editor.common.treemap.MappingControlEx({
					height: "100%",
					eventChannelId: channelId // unique id for event handling
					//IMPORTANT: eventChannelId must be unique for every instance
				});

				// that.MappingControl = oMappingControl;
				var oTransformation = new com.sap.it.spc.webui.mapping.models.TransformationModel();
				//oTransformation.setJSONData(playground.bertram.ModelerTestData);
				// oTransformation.setJSONData(playground.bertram.ModelerTestData2);
				oTransformation.setJSONData(oModel);

				that.oMappingControl.setTransformation(oTransformation);
				that.oMappingControl.setEditMode(true); //enable drag and drop

				//set custom toolbars
				that.oMappingControl.setSourceMessageHeader(this.createCustomSourceToolbar(that.oMappingControl));
				//no tool bar for output column  
				that.oMappingControl.setTargetMessageHeader(this.createCustomTargetToolbar(that.oMappingControl));

				// modeler specific changes
				this.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("txt_left_column"));
				this.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText("txt_right_column"));

				// set custom labels
				that.oMappingControl.setCustomSourceLabel(this.createCustomLabel());
				that.oMappingControl.setCustomTargetLabel(this.createInlineEditorLabel());
				// set custom binding
				that.oMappingControl.setCustomSourceBinding("/rootNode");
				that.oMappingControl.setCustomTargetBinding("/rootNode");

				// listener
				// Event handling for created mappings
				MappingLibrary.EventBus.subscribe(channelId, MappingLibrary.Events.MAPPING_CREATE, this.callbackMappingCreate(that.oMappingControl,
					oModel), this);
				// Event handling for updated mappings
				MappingLibrary.EventBus.subscribe(channelId, MappingLibrary.Events.MAPPING_UPDATE, this.callbackMappingUpdate(that.oMappingControl,
					oModel), this);
				// Event handling for deleted mappings
				MappingLibrary.EventBus.subscribe(channelId, MappingLibrary.Events.MAPPING_DELETE, this.callbackMappingDelete(that.oMappingControl,
					oModel), this);
				// attach listener to selection changes
				that.oMappingControl.attachNodeSelectionChange(this.callbackSelection(that.oMappingControl, oModel));

				// attach listener which allows to interupt the default mapping process
				// by "preventDefault" and replace it with own business logic
				that.oMappingControl.attachCreateMapping(this.callbackPreMappingCreate);

				// drop validation
				that.oMappingControl.setDropValidator(function(aSources, oTarget) {
					// your validation code here
					if (!oTarget) {
						return false;
					}
					if (aSources.length === 1) {
						var oSource = aSources[0];
						var newSourceElement = that.newSource.elements.get(oSource.name);
						if (newSourceElement && !newSourceElement.isProxy) {
							return true;
						}
					}
					return false;
				});
				that.oMappingControl.setHeight("270px");
				//check box
				that.deleteElemets = new sap.ui.commons.CheckBox({
					text: 'Delete unmapped target column and referenceces from the node aggregaiton up to semantic node',
					tooltip: 'Newsletter checkbox',
					checked: false,

					change: function(event) {
						that.callBackForDeleteCheckBox(event.mParameters.checked);
						that.deleteElemets.setChecked(event.mParameters.checked);
					}
				});

				//layout 
				var oLayout = new sap.ui.layout.VerticalLayout({
					// content: [oComboBox2, that.oMappingControl],
					width: "100%"
				});

				oLayout.addContent(that.oMappingControl);
				if (this.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE && that.callBackForDeleteCheckBox) {
					oLayout.addContent(that.deleteElemets);
				}
				return oLayout;

			},

			callbackSelection: function(oMappingControl, oModel) {

				return function(oEvent) {
					//disables default selection behavior
					oEvent.preventDefault();
					console.log(oEvent.getParameters());
				}
			},

			callbackPreMappingCreate: function(oEvent) {

				var oParameters = oEvent.getParameters();
				// this are the possible parameters
				var oSourceObject = oParameters["sourceObject"];
				var oTargetObject = oParameters["targetObject"];
				var oMappingControl = oParameters["mappingControl"];
				if (oSourceObject && !oTargetObject) {
					//prevent default create behavior and provide custom code
					oEvent.preventDefault();
					var oModel = oMappingControl.getTransformation();
					var targetRootNode = oModel.getTargetMessage().getRootNode();

					// create a new node on target side
					// you have to check for unique names. Here it is done by a random number added to the name
					// but this is probably not sufficient for most use cases
					var id = oSourceObject["tag"] + Math.ceil(Math.random() * Math.pow(10, 10));
					var newData = {
						"tag": id,
						"type": "element",
						"name": id,
						"field-data-type": oSourceObject["field-data-type"],
						"field-type": oSourceObject["field-type"],
						"field-length": oSourceObject["field-length"]
					};

					targetRootNode.addChildNodeJSON(newData);
					var lastNode = targetRootNode.nodes[targetRootNode.nodes.length - 1];
					//new method to add mappings via JSON object
					oModel.addMappingJSON({
						sourcePaths: [oSourceObject["xpath"]],
						targetPaths: [lastNode["xpath"]]
					});

					oMappingControl.refreshUI();

				}
			},

			callbackMappingDelete: function(oMappingControl, oModel) {
				var oTransformation = oMappingControl.getTransformation();
				return function(sChannelId, sEventId, oData) {

					var aMappings = oTransformation.getMappings();
					if (aMappings !== undefined) {
						for (var index in aMappings) {
							if (aMappings[index].getId() === this.mapping.getId()) {
								aMappings.splice(index, 1);
								break;
							}
						}

					}
					oMappingControl.clearSelection();

				};
			},

			callbackMappingUpdate: function(oMappingControl, oModel) {
				var oTransformation = oMappingControl.getTransformation();
				return function(sChannelId, sEventId, oData) {
					console.log("MAPPING_UPDATE");
					console.log(oData);
					var newMapping = oData.mapping;
					var oldMapping = null;
					var source = oData.xPath.split("/");
					var columnName = source[source.length - 1];
					var aMappings = oTransformation.getMappings();
					var newSourceElement = this.newSource.elements.get(columnName);

					if (aMappings !== undefined) {
						for (var index in aMappings) {
							if (aMappings[index].getId() == newMapping.getId()) {
								this.oldMapping = aMappings[index];
								break;
							}
						}
					}
					var targetElements = oTransformation.target.rootNode.nodes;
					for (var i = 0; i < targetElements.length; i++) {
						if (targetElements[i].xpath == newMapping.targetPaths[0]) {
							if (newSourceElement && newSourceElement.isProxy) {
								targetElements[i]["field-type"] = "COLUMN_ERROR";
							} else {
								targetElements[i]["field-type"] = "COLUMN";
							}
						}
					}
					this.oldMapping.sourcePaths = [];
					oMappingControl.clearSelection();
					oMappingControl.refreshUI();
				};
			},

			callbackMappingCreate: function(oMappingControl, oModel) {
				var oTransformation = oMappingControl.getTransformation();
				return function(sChannelId, sEventId, oData) {
					console.log("MAPPING_CREATE");
					console.log(oData);

					// oTransformation.addMapping(oData.mapping, false);
					var targetElements = oTransformation.target.rootNode.nodes;
					var newMapping = oData.mapping;
					for (var i = 0; i < targetElements.length; i++) {
						if (targetElements[i].xpath == newMapping.targetPaths[0]) {

							targetElements[i]["field-type"] = "COLUMN";

						}
					}
					oMappingControl.clearSelection();
					oMappingControl.refreshUI();

				};

			},

			createCustomLabel: function() {
				// custom label with icon
				var oImage = new sap.ui.commons.Image();
				oImage.bindProperty("src", {
					parts: ["field-type"],
					formatter: function(type) {
						return sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images[type];
					}

				});
				var oLabel = new sap.ui.commons.Label();
				oLabel.bindProperty("text", "name");

				var oCustomlabel = new sap.ui.layout.HorizontalLayout({
					content: [oImage, oLabel]
				});

				// custom tooltip
				var oTooltip = new sap.ui.commons.RichTooltip();

				oTooltip.bindProperty("title", "name");

				oTooltip.bindProperty("text", {
					parts: ["name", "icon", "field-type", "field-length", "field-scale"],
					formatter: function(name, icon, type, length, scale) {

						var oResult = "Details:<br>";
						oResult += "<ul>";
						oResult += type ? "<li><strong>Type </strong>" + type + "</li>" : "";
						oResult += length ? "<li><strong>Length </strong>" + length + "</li>" : "";
						oResult += scale ? "<li><strong>Scale </strong>" + scale + "</li>" : "";
						oResult += "</ul>";

						return oResult;
					}
				});

				oCustomlabel.setTooltip(oTooltip);

				// Create the menu
				var oMenu = new sap.ui.commons.Menu({
					ariaDescription: "Menu"
				});
				jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.InlineEditor");
				var oInlineEditor = new sap.watt.hanaplugins.editor.common.treemap.InlineEditor({
					label: oCustomlabel,
					contextMenu: oMenu
				});

				// Create the menu items for the context menu dynamically
				oInlineEditor.attachOpenContextMenu(function(oEvent) {
					var oData = oEvent.getParameter("data");
					var oMenu = oEvent.getParameter("menu");
					oMenu.removeAllItems();
					if (oData["field-type"] === "CUBE" || oData["field-type"] === "COLUMN_TABLE") {
						var oMenuItem = new sap.ui.commons.MenuItem({
							icon: resourceLoader.getImagePath("Automap.png"),
							text: "Automap"
						});
						oMenu.addItem(oMenuItem);
					}
				});

				return oInlineEditor;
			},

			createInlineEditorLabel: function() {
				// custom label with icon
				var oImage = new sap.ui.commons.Image();
				oImage.bindProperty("src", {
					parts: ["field-type"],
					formatter: function(type) {
						return sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images[type];
					}
				});

				// link
				var oLink = new sap.ui.commons.Link({
					text: "empty link",
					tooltip: "Click to edit",
					press: function() {
						// get InlineEditor instance and set showEditor to true
						this.getParent().getParent().setShowEditor(true);
						this.focus();
					}
				});
				oLink.bindProperty("text", "name");

				//create custom label
				var oCustomLabel = new sap.ui.layout.HorizontalLayout({
					content: [oImage, oLink]
				});
				// custom tooltip
				var oTooltip = new sap.ui.commons.RichTooltip();

				oTooltip.bindProperty("title", "name");

				oTooltip.bindProperty("text", {
					parts: ["name", "icon", "field-type", "field-length", "field-scale"],
					formatter: function(name, icon, type, length, scale) {

						var oResult = "Details:<br>";
						oResult += "<ul>";
						oResult += type ? "<li><strong>Type </strong>" + type + "</li>" : "";
						oResult += length ? "<li><strong>Length </strong>" + length + "</li>" : "";
						oResult += scale ? "<li><strong>Scale </strong>" + scale + "</li>" : "";
						oResult += "</ul>";

						return oResult;
					}
				});

				oCustomLabel.setTooltip(oTooltip);

				//defining a context menu
				//some mock menu
				var oMenu = new sap.ui.commons.Menu({
					ariaDescription: "Menu"
				});

				// add static menu items to the context menus
				/*
                var oMenuItem = new sap.ui.commons.MenuItem({});
            	oMenuItem.bindProperty("text", {
            	    parts: ["name"],
            	    formatter : function(name){
            		return "Context menu for "+name;
            	    }
            	});
            	oMenu.addItem(oMenuItem);
            	*/

				//create inline editor instance and set your label as label
				jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.InlineEditor");
				var oInlineEditor = new sap.watt.hanaplugins.editor.common.treemap.InlineEditor({
					label: oCustomLabel,
					contextMenu: oMenu
				});

				//bind value to editor
				oInlineEditor.bindEditorValue("name");

				// Create the menu items for the context menu dynamically
				oInlineEditor.attachOpenContextMenu(function(oEvent) {
					var oData = oEvent.getParameter("data");
					var oMenu = oEvent.getParameter("menu");

					//this example shows only one menu item if its field-type is ATTRIBUTE
					oMenu.removeAllItems();
					if (oData["field-type"] === "ATTRIBUTE") {
						var oMenuItem = new sap.ui.commons.MenuItem({});
						oMenuItem.bindProperty("text", {
							parts: ["name"],
							formatter: function(name) {
								return "Item for Attribute " + name;
							}
						});
						oMenu.addItem(oMenuItem);
					}

				});

				//you can use the liveChange event for value validation
				oInlineEditor.attachLiveChange(function(oEvent) {
					//you can get the input field via the event parameters
					var oInput = oEvent.getParameter("source");
					var sLiveValue = oEvent.getParameter("liveValue");

					// for example check for allowed characters
					if (sLiveValue.match(/^[\w]{1}[\w\.\-]*$/) === null) {

						var oCallout = new sap.ui.commons.Callout({});
						oCallout.addContent(new sap.ui.commons.TextView({
							semanticColor: sap.ui.commons.TextViewColor.Negative,
							design: sap.ui.commons.TextViewDesign.Bold,
							text: "Name is not valid",
							editable: false
						}));
						//you can define some error messages here
						oInput.setTooltip(oCallout);
						//if the input field ist in Error state the value will not be set in the model 
						oInput.setValueState(sap.ui.core.ValueState.Error);
					} else {
						oInput.setTooltip(null);
						//only if the value state is None the value will get into the model
						oInput.setValueState(sap.ui.core.ValueState.None);
					}
				});

				return oInlineEditor;
			},

			createCustomSourceToolbar: function(mappingControl) {
				var oSourceToolbar = new sap.ui.commons.Toolbar();
				oSourceToolbar.setStandalone(false);
				oSourceToolbar.setDesign(sap.ui.commons.ToolbarDesign.Flat);

				var oButton4 = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("CollapseAll.png"),
					tooltip: resourceLoader.getText("tol_collapse_all"),
					press: function() {
						var sourceTable = mappingControl._getSourceTable();
						var length = sourceTable.getRows().length;
						for (var i = 0; i < length; i++) {
							sourceTable.collapse(i);
						}
					}
				});
				oSourceToolbar.addItem(oButton4);
				var oButton5 = new sap.ui.commons.Button({
					icon: resourceLoader.getImagePath("ExpandAll.png"),
					tooltip: resourceLoader.getText("tol_collapse_all"),
					press: function() {
						var sourceTable = mappingControl._getSourceTable();
						var length = sourceTable.getRows().length;
						for (var i = 0; i < length; i++) {
							sourceTable.expand(i);
						}
					}
				});
				oSourceToolbar.addItem(oButton5);
				return oSourceToolbar;

			},

			createCustomTargetToolbar: function(mappingControl) {
				var oTargetToolbar = new sap.ui.commons.Toolbar();
				oTargetToolbar.setStandalone(false);
				oTargetToolbar.setDesign(sap.ui.commons.ToolbarDesign.Flat);
				return oTargetToolbar;
			},
			createMockModel: function(modelbase, input) {
				var that = this;
				this.model = {
					"mappings": [],
					prefixMap: {
						"ns": "sap/hana/webide/calcvieweditor/replace/joinmapping"
					},
					source: {
						id: "sourceTitleEx",
						title: "Source Title",
						rootNode: {
							name: "Root Source Element",
							occ: "1..1",
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
				return this.model;
			},

			updateMappingControl: function() {
				var that = this;
				//var input = that.inputSource;
				that.model.source.rootNode.nodes = [];
				that.model.target.rootNode.nodes = [];
				that.model.mappings = [];

				if (that.newSource) {
					var fieldType = that.newSource.type;
					// var inputKey = input.$getKeyAttributeValue();
					var inputData = {
						"tag": that.newSource.fqName === undefined ? that.newSource.name : that.newSource.fqName,
						"type": "element",
						"name": that.newSource.fqName === undefined ? that.newSource.name : that.newSource.fqName,
						"field-type": fieldType,
						"nodes": []
						//inputKey: inputKey
					};

					that.model.source.rootNode.nodes.push(inputData);
					var inputData = that.model.source.rootNode.nodes[0];
					that.newSource.elements.foreach(function(element) {

						var fieldType = "COLUMN";
						if (element.isProxy) {
							fieldType = "COLUMN_PROXY";

						}
						var elementData = {
							"field-data-type": element.inlineType ? element.inlineType.primitiveType : undefined,
							"field-length": element.inlineType ? element.inlineType.length : undefined,
							"field-scale": element.inlineType ? element.inlineType.scale : undefined,
							"field-type": fieldType,
							name: element.name,
							tag: element.name,
							type: "element"
							// inputKey: inputKey
						};
						inputData.nodes.push(elementData);
					});

					var rightSideInput;
					//      var rightElemets;
					var rightSide = true;
					var join;
					that.viewNode.joins.foreach(function(oJoin) {
						if (oJoin.leftInput == that.inputSource || oJoin.leftInput.getSource() == that.oldInput) {
							//  rightElemets = join.rightElements;
							rightSideInput = oJoin.rightInput.getSource();
							join = oJoin;
						} else if (oJoin.rightInput == that.inputSource || oJoin.rightInput.getSource() == that.oldInput) {
							// rightElemets = join.leftElements;
							rightSideInput = oJoin.leftInput.getSource();
							rightSide = false;
							join = oJoin;
						}
					});

					if (rightSideInput && join) {

						rightSideInput.elements.foreach(function(element) {
							var fieldType = "COLUMN";
							var elementDataForTarger = {
								"field-data-type": element.inlineType ? element.inlineType.primitiveType : undefined,
								"field-length": element.inlineType ? element.inlineType.length : undefined,
								"field-scale": element.inlineType ? element.inlineType.scale : undefined,
								"field-type": fieldType,
								name: element.name,
								tag: element.name,
								type: "element"
								// inputKey: inputKey
							};

							var mappingElement;

							for (var key in join.leftElements._keys) {

								var leftElement = join.leftElements._values[join.leftElements._keys[key]];
								var rightElemet = join.rightElements._values[join.rightElements._keys[key]];
								//  var mappingKey=rightElemets._values.indexOf(element);
								// var mappingElement;
								var mappKey;
								if (rightSide) {

									for (var i in join.rightElements._keys) {
									    if (join.rightElements._keys.hasOwnProperty(i) === false) {
											continue;
										}
										if (join.rightElements._values[join.rightElements._keys[i]].name == element.name) {
											mappKey = i;
										}
									}
									if (mappKey > -1) {
										mappingElement = join.leftElements._values[join.leftElements._keys[mappKey]];
									}

								} else {
									//   mappingElement = join.rightElements._values[mappingKey];

									for (var i in join.leftElements._keys) {
									    if (join.rightElements._keys.hasOwnProperty(i) === false) {
											continue;
										}
										if (join.rightElements._values[join.rightElements._keys[i]].name == element.name) {
											mappKey = i;
										}
									}
									if (mappKey > -1) {
										mappingElement = join.rightElements._values[join.rightElements._keys[mappKey]];
									}
								}
							}

							if (mappingElement) {
								var oContext = null;

								var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10, 10)));

								if (!rightSide) {
									mappingModel.targetPaths = ["/RootTargetElement/" + element.name];
									mappingModel.sourcePaths = ["/RootSourceElement/" + inputData.name + "/" + mappingElement.name];
								} else {
									mappingModel.targetPaths = ["/RootTargetElement/" + element.name];
									mappingModel.sourcePaths = ["/RootSourceElement/" + inputData.name + "/" + mappingElement.name];
								}

								mappingModel.fn = {};
								mappingModel.fn.expression = mappingModel.sourcePaths[0];
								mappingModel.fn.description = "";
								that.model.mappings.push(mappingModel);

								/* if(that.newSource.elements.get(mappingElement.name)){
                                     var elementData = {
                            "field-data-type": mappingElement.inlineType ? mappingElement.inlineType.primitiveType : undefined,
                            "field-length": mappingElement.inlineType ? mappingElement.inlineType.length : undefined,
                            "field-scale": mappingElement.inlineType ? mappingElement.inlineType.scale : undefined,
                            "field-type": "COLUMN_PROXY",
                            name: mappingElement.name,
                            tag: mappingElement.name,
                            type: "element"
                            // inputKey: inputKey
                        };
                        inputData.nodes.push(elementData);
                                }*/
							}

							that.model.target.rootNode.nodes.push(elementDataForTarger);

						});
					}
				}
				that.oMappingControl.getTransformation().setJSONData(that.model);
				that.oMappingControl.refreshUI();
			}

		};

		return JoinMapping;
	});
