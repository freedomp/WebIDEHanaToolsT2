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
		var Mapping = function(Parameter) {
			this.viewNode = Parameter.viewNode;
			this.inputSource = Parameter.inputSource;
			this.newSource;
			this.typeOfReplace = Parameter.typeOfReplace;
			this.callBackForDeleteCheckBox = Parameter.callBackForDeleteCheckBox;
			this.isDeleteNode = Parameter.isDeleteNode;
		};

		Mapping.prototype = {

			setNewSource: function(newSource) {
				this.newSource = newSource;
				this.updateMappingControl();
				//  this.oMappingControl.refreshUI();
			},
			getNewNodeName: function() {
				return this.oComboBox2.getValue();
			},

			execute: function() {
				//var input= that.undoManager.execute(new commands.CreateInputCommand(that.viewNode.name, that.newSource.name, entityParameters));
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

				//jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.images");
				// create mocked model with undoManager
				jQuery.sap.require("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.mapping.Images");
				var oModel = this.createMockModel(that.viewNode, that.inputSource);
				//<--

				//<!--loading reuse libs
				 sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["com.sap.it.spc.webui.mapping"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
                sap.ui.getCore().loadLibrary('com.sap.it.spc.webui.mapping', '/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/com/sap/it/spc/webui/mapping');
                sap.ui.getCore().setThemeRoot("sap_bluecrystal", ["sap.watt.hanaplugins.editor.common.treemap"], "/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/");
                sap.ui.getCore().loadLibrary('sap.watt.hanaplugins.editor.common.treemap',
                    '/watt/resources/sap/watt/hanaplugins/editor/common/treemap/latest/sap/hana/ide/common/plugin/treemap');

				 jQuery.sap.require("sap.watt.hanaplugins.editor.common.treemap.MappingControlEx");
				//<--
				//<!--create mapping control

				var channelId = "sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.replaceDN.editor.id" + Math.round(Math.random() * 10000);
				//  var channelId = "mapping.sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.replaceDN.editor";
				this.oMappingControl = new sap.watt.hanaplugins.editor.common.treemap.MappingControlEx({
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
				this.oMappingControl._getSourceTable().getColumns()[0].setLabel(resourceLoader.getText("tit_source"));
				this.oMappingControl._getTargetTable().getColumns()[0].setLabel(resourceLoader.getText("tit_target"));

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

					// if no target is present this example allows mapping if there is only
					// one single source which has the field-type ATTRIBUTE or MEASURE

					if (!oTarget) {
						return false;
					}
					if (that.targetNode) {
						return true;
					} else if (aSources.length === 1) {
						var oSource = aSources[0];
						var newSourceElement = that.newSource.elements.get(oSource.name);
						if (newSourceElement && !newSourceElement.isProxy) {
							return true;
						}
					}
					return false;

				});

				var listItems = new sap.ui.core.ListItem();
				listItems.bindProperty("text", {
					path: "name",
					formatter: function(name) {
						return name;
					}
				});
				listItems.bindProperty("icon", {
					path: "icon",
					formatter: function(icon) {
						return icon;
					}
				});
				listItems.bindProperty("key", {
					path: "name",
					formatter: function(key) {
						return key;
					}
				});

				var ListOfNodesBox = new sap.ui.commons.ListBox({
					displayIcons: true,
					items: {
						path: "/items",
						template: listItems
					}
				});

				// Create a ComboBox

				that.oComboBox2 = new sap.ui.commons.DropdownBox({
					width: "100%",
					change: function(event) {
						that.targetNode = that.viewNode.$$model.columnView.viewNodes.get(that.oComboBox2.getValue());
						if (that.targetNode) {
							that.updateMappingControl();
							that.oMappingControl.refreshUI();
						}

					}

				});
				that.oComboBox2.setListBox(ListOfNodesBox);
				that.oComboBox2.attachChange(function(oEvent) {
					oEvent.oSource.getSelectedKey()
				})

				that.oMappingControl.setHeight("270px");

				var oLayout = new sap.ui.layout.VerticalLayout({
					// content: [oComboBox2, that.oMappingControl],
					width: "100%"
				});
				if (this.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE) {
					var parentNode = CalcViewEditorUtil.getParentNodeName(this.viewNode);
					var listOfChild;
					if (parentNode) {
						listOfChild = CalcViewEditorUtil.getListOfChildNodes(parentNode);
						//removing direct child of parent node
						parentNode.inputs.foreach(function(input) {
							var index = listOfChild.indexOf(input);
							if (index > -1) {
								listOfChild.splice(listOfChild.indexOf(input), 1);
							}
						});
					}

					that.oComboBox2.setModel(this.getModelComboBox(listOfChild));
					if (listOfChild && listOfChild.length > 0) {
						that.oComboBox2.setValue(listOfChild[0].getSource().name);
						that.targetNode = listOfChild[0].getSource();
					}
					//check box
					that.deleteElemets = new sap.ui.commons.CheckBox({
						text: 'Delete unmapped target columns and its references.',
						tooltip: 'Newsletter checkbox',
						checked: false,
						visible: false,
						change: function(event) {
							that.callBackForDeleteCheckBox(event.mParameters.checked);
							that.deleteElemets.setChecked(event.mParameters.checked);
						}
					});

					oLayout.addContent(that.oComboBox2);
					this.updateMappingControl();
					this.oMappingControl.refreshUI();
				}

				oLayout.addContent(that.oMappingControl);
				if (this.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE && that.callBackForDeleteCheckBox) {

					oLayout.addContent(that.deleteElemets);

				}
				if (that.isDeleteNode) {
					that.deleteNodeCheckBox = new sap.ui.commons.CheckBox({
						text: 'Delete the node after replace.',
						tooltip: 'Delete the node after replace.',
						checked: false

					});
					oLayout.addContent(that.deleteNodeCheckBox);
				}
				return oLayout;

			},
			getModelComboBox: function(inputs) {
				var list = {
					items: []
				};
				var index;
				for (index in inputs) {
					if (inputs.hasOwnProperty(index) === false) {
						continue;
					}
					var item = {};
					item.name = inputs[index].getSource().name;
					item.icon = CalcViewEditorUtil.getInputImagePath(inputs[index]);
					list.items.push(item);
				}

				var listOfNodeModel = new sap.ui.model.json.JSONModel();
				listOfNodeModel.setData(list);
				return listOfNodeModel;
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
					var aMappings = oTransformation.getMappings();
					var source = oData.xPath.split("/");
					var columnName = source[source.length - 1];

					var newSourceElement;
					if (this.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE) {
						newSourceElement = this.targetNode.elements.get(columnName);
					} else {
						newSourceElement = this.newSource.elements.get(columnName);
					}

					if (aMappings !== undefined) {
						for (var index in aMappings) {
							if (aMappings[index].getId() == newMapping.getId() && !newSourceElement.isProxy) {
								this.oldMapping = aMappings[index];
								break;
							}
						}
					}
					var targetElements = oTransformation.target.rootNode.nodes;
					for (var i = 0; i < targetElements.length; i++) {
						if (targetElements[i].xpath == newMapping.targetPaths[0]) {
							if (newSourceElement.isProxy) {
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
					tooltip: resourceLoader.getText("tol_expand_all"),
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
						"ns": "sap/hana/webide/calcvieweditor/replace/columnmapping"
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
				var input = that.inputSource;
				that.model.source.rootNode.nodes = [];
				that.model.target.rootNode.nodes = [];
				that.model.mappings = [];
				//that.targetNode = that.viewNode; //only for replace dataNode
				if (that.newSource || that.targetNode) {
					// var inputKey = input.$getKeyAttributeValue();
					var inputData = {};
					var inputElements;
					if (that.targetNode) {
						inputData = {
							"tag": that.targetNode.name,
							"type": "element",
							"name": that.targetNode.name,
							"field-type": that.targetNode.type,
							"nodes": []
						}
						inputElements = that.targetNode.elements;
					} else {

						inputData = {
							"tag": that.newSource.getId(),
							"type": "element",
							"name": that.newSource.getId(),
							"field-type": that.newSource.type,
							"nodes": []
							//inputKey: inputKey
						};
						inputElements = that.newSource.elements;
					}

					that.model.source.rootNode.nodes.push(inputData);

					inputElements.foreach(function(element) {
						var inputData = that.model.source.rootNode.nodes[0];
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
					if (that.newSource) {
						input.mappings.foreach(function(m) {
							if (m.targetElement && m.sourceElement) {
								var sElement = m.sourceElement;
								var element = m.targetElement;
								//   var inputData = that.model.source.rootNode.nodes[0];
								var fieldType = "COLUMN";
								if (that.newSource.elements.get(sElement.name) && that.newSource.elements.get(sElement.name).isProxy) {
									fieldType = "COLUMN_ERROR";
								}

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
								that.model.target.rootNode.nodes.push(elementDataForTarger);
								var oContext = null;
								var inputData = that.model.source.rootNode.nodes[0];
								var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10, 10)));

								mappingModel.targetPaths = ["/RootTargetElement/" + m.targetElement.name];

								mappingModel.sourcePaths = ["/RootSourceElement/" + inputData.name + "/" + m.sourceElement.name];

								mappingModel.fn = {};
								mappingModel.fn.expression = mappingModel.sourcePaths[0];
								mappingModel.fn.description = "";
								that.model.mappings.push(mappingModel);

							}
						});

					} else {

						var errorFlag = true;
						that.viewNode.inputs.foreach(function(viewNodeInput) {
							viewNodeInput.mappings.foreach(function(mapping) {
								if (mapping.targetElement && mapping.sourceElement) {
									var element = mapping.targetElement;
									var fieldType = "COLUMN_ERROR";

									var elementDataForTarger = {
										"field-data-type": element.inlineType ? element.inlineType.primitiveType : undefined,
										"field-length": element.inlieneType ? element.inlineType.length : undefined,
										"field-scale": element.inlineType ? element.inlineType.scale : undefined,
										"field-type": fieldType,
										name: element.name,
										tag: element.name,
										type: "element"
										// inputKey: inputKey
									};

									var sourceElement = that.targetNode.elements.get(mapping.sourceElement.name);
									if (sourceElement) {
										var oContext = null;
										var inputData = that.model.source.rootNode.nodes[0];
										var mappingModel = new com.sap.it.spc.webui.mapping.models.MappingModel("_new_mapping" + Math.ceil(Math.random() * Math.pow(10,
											10)));

										mappingModel.targetPaths = ["/RootTargetElement/" + element.name];

										mappingModel.sourcePaths = ["/RootSourceElement/" + inputData.name + "/" + sourceElement.name];

										mappingModel.fn = {};
										mappingModel.fn.expression = mappingModel.sourcePaths[0];
										mappingModel.fn.description = "";
										var mappingFlag = true;
										var mappingFlag = true;
										for (var i in that.model.mappings) {
											if (that.model.mappings.hasOwnProperty(i) === false) continue;
											if (that.model.mappings[i].targetPaths[0] === mappingModel.targetPaths[0]) {
												mappingFlag = false;
												break;
											}
										}
										if (mappingFlag) {
											that.model.mappings.push(mappingModel);
										}

										elementDataForTarger["field-type"] = "COLUMN";

									} else {
										errorFlag = false;
									}
									mappingFlag = true;
									for (var i in that.model.target.rootNode.nodes) {
										if (that.model.target.rootNode.nodes[i].name === elementDataForTarger.name) {
											mappingFlag = false;
											break;
										}
									}
									if (mappingFlag) {
										that.model.target.rootNode.nodes.push(elementDataForTarger);
									}

								}
							});

						});
						if (this.typeOfReplace === CalcViewEditorUtil.typeOfReplace.NODE_WITH_NODE) {
							that.deleteElemets.setVisible(!errorFlag);
							that.deleteElemets.fireChange({
								checked: errorFlag
							});
						}

					}

				}
				that.oMappingControl.getTransformation().setJSONData(that.model);
				this.oMappingControl.refreshUI();
			}

		};

		return Mapping;
	});
