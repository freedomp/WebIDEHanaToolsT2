/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "./CalcViewEditorUtil",
        "../viewmodel/model"
    ],
	function(ResourceLoader, CalcViewEditorUtil, viewModel) {

		var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

		var OutputToolPopup = function(parameters) {
			this.viewNode = parameters.viewNode;
			this.opener = parameters.opener; // parent control
			this.excludedElements = parameters.excludedElements; // optional Array or Element : can be used to hide certain column
			this.callback = parameters.callback; // Returns an object which contains elementName and inputkey(only in case of shared column)
			this.doNotshowSharedElements = parameters.doNotshowSharedElements; // even incase of star join node we can stop showing shared elements 
			this.showCalculatedColumns = parameters.hasOwnProperty("showCalculatedColumns") ? parameters.showCalculatedColumns : true;  // To stop showing calculated column folder 
			this.init();
		};

		OutputToolPopup.prototype = {

			open: function(dockOption) {
				if (dockOption) {
					this.toolPopup.open(dockOption);
				} else {
					this.toolPopup.open(sap.ui.core.Popup.Dock.RightTop);
				}
			},
			close: function() {
				this.toolPopup.close();
			},

			init: function() {
				var that = this;

				var oTree = new sap.ui.commons.Tree({
					height: "200px",
					width: "300px",
					select: function(event) {
						var node = event.getParameter("node");
						var selectedObject = node.getBindingContext();
						if (selectedObject && that.callback) {
							that.callback(selectedObject);
						}
						toolPopup.close();
					}
				});
				
				//unable to select the bellow content if it has scorll 
			/*	oTree.setShowHeader(false);
				oTree.setShowHeaderIcons(false);     */
				
				

             if (sap.ui.getCore().byId("WebIDE_OutputToolPopup")) {
                    sap.ui.getCore().byId("WebIDE_OutputToolPopup").destroy();
                }

				var toolPopup = new sap.ui.ux3.ToolPopup("WebIDE_OutputToolPopup",{
					//title: "Columns",
					content: [oTree],
					autoClose: true,
					opener: this.opener
				});
            toolPopup.addStyleClass("OutputToolPopup");
				//create Tree Nodes

				// shared columns
				if (!this.doNotshowSharedElements) {
					if (this.viewNode.isStarJoin && this.viewNode.isStarJoin()) {

						var calculationViewsNode = this._createFolderNode(oTree, resourceLoader.getText("tit_calculation_views"));

						this.viewNode.inputs.foreach(function(input) {
							if (input.selectAll) {
								var inputNode = new sap.ui.commons.TreeNode({
									text: CalcViewEditorUtil.getInputName(input),
									icon: CalcViewEditorUtil.getInputImagePath(input),
									expanded: false,
									selectable: false
								});

								input.getSource().elements.foreach(function(element) {
									if (element.aggregationBehavior === "none") {
										that._createElementNode(inputNode, element, input.$getKeyAttributeValue());
									}
								});

								inputNode.collapse();

								calculationViewsNode.addNode(inputNode);
							}
						});

						calculationViewsNode.collapse();
					}
				}
				var columnsNode = this._createFolderNode(oTree, resourceLoader.getText("tit_columns"));
				var calculatedColumnsNode;
				if(that.showCalculatedColumns){
				calculatedColumnsNode = this._createFolderNode(oTree, resourceLoader.getText("tit_calculated_columns"));
				}

				oTree.addStyleClass("customProperties");

				// Add columns and calculated columns
				this.viewNode.elements.foreach(function(element) {
					if (!element.nameInSharedDimension && !element.sharedDimension) {
						if (element.aggregationBehavior === "none") {
							if (element.calculationDefinition && that.showCalculatedColumns) {
								// calc column
								that._createElementNode(calculatedColumnsNode, element);
							} else {
								//column
								that._createElementNode(columnsNode, element);
							}
						}
					}
				});
				this.toolPopup = toolPopup;
			},

			_canAddElement: function(element) {
				if (this.excludedElements instanceof Array && this.excludedElements.indexOf(element) !== -1) {
					return false;
				}
				if (this.excludedElements === element) {
					return false;
				}
				return true;
			},

			_createElementNode: function(parentNode, element, inputKey) {
				if (this._canAddElement(element)) {
					var oNode = new sap.ui.commons.TreeNode({
						text: element.name,
						icon: element.calculationDefinition ? resourceLoader.getImagePath("Calculated_Attribute.png") : resourceLoader.getImagePath(
							"Attribute.png"),
						expanded: true
					});
					oNode.setBindingContext({
						elementName: element.name,
						inputKey: inputKey
					});
					parentNode.addNode(oNode);
				}
			},

			_createFolderNode: function(parentNode, name) {
				var oNode = new sap.ui.commons.TreeNode({
					text: name,
					icon: resourceLoader.getImagePath("folder.png"),
					expanded: true,
					selectable: false
				});
				parentNode.addNode(oNode);
				return oNode;
			}

		};
		return OutputToolPopup;
	});
