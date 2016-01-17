/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
jQuery.sap.require("sap.apf.ui.utils.constants");
jQuery.sap.require("sap.apf.core.constants");
jQuery.sap.require("sap.apf.modeler.ui.utils.textPoolHelper");
/**
* @class representation
* @memberOf sap.apf.modeler.ui.controller
* @name representation
* @description controller for view.representation
*/
sap.ui.controller("sap.apf.modeler.ui.controller.representation", {
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#onInit
	* @description Called on initialization of the view.
	* Sets the static texts for all controls in UI.
	* Sets the scroll height for the container.
	* Adds style classes to all UI controls.
	* Prepares dependencies.
	* Sets dynamic text for input controls
	* Set a preview button in footer 
	* */
	onInit : function() {
		// Data
		this.getView().addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this.oViewData = this.getView().getViewData();
		this.oConfigurationHandler = this.oViewData.oConfigurationHandler;
		this.oConfigurationEditor = this.oViewData.oConfigurationEditor;
		this.oTextPool = this.oConfigurationHandler.getTextPool();
		this.getText = this.oViewData.getText;
		this.getEntityTypeMetadata = this.oViewData.getEntityTypeMetadata;
		this.getRepresentationTypes = this.oViewData.getRepresentationTypes;
		this.mParam = this.oViewData.oParams;
		var self = this;
		if (!this.oConfigurationEditor) {
			this.oConfigurationHandler.loadConfiguration(this.mParam.arguments.configId, function(configurationEditor) {
				self.oConfigurationEditor = configurationEditor;
			});
		}
		this._addConfigStyleClass();
		this._setDisplayText();
		this.setDetailData();
		// Insert Preview Button into the Footer.
		this._oPreviewButton = new sap.m.Button({
			text : this.getText("preview"),
			press : self._handlePreviewButtonPress.bind(this)
		// the current context should be bound to the event handler
		});
		this._insertPreviewButtonInFooter();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_addConfigStyleClass
	* @description Adds style classes to the UI controls.
	* */
	_addConfigStyleClass : function() {
		this.byId("idBasicDataLayout").addStyleClass("basicLayoutData");
		this.byId("idChartTypeLabel").addStyleClass("chartTypeLabel");
		this.byId("idSortLayout").addStyleClass("sortLayoutData");
		this.byId("idChartIcon").addStyleClass("repChartIcon");
		this.byId("idRightUpper").addStyleClass("repRightCornerText");
		this.byId("idRightLower").addStyleClass("repRightCornerText");
		this.byId("idLeftUpper").addStyleClass("repLeftCornerText");
		this.byId("idLeftLower").addStyleClass("repLeftCornerText");
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_setDisplayText
	* @description Sets static texts in UI and place holders.
	* */
	_setDisplayText : function() {
		this.byId("idVisualization").setTitle(this.getText("visualization"));
		this.byId("idChartTypeLabel").setText(this.getText("chartType"));
		this.byId("idBasicData").setTitle(this.getText("basicData"));
		this.byId("idSorting").setTitle(this.getText("sorting"));
		this.byId("idThumbnailTexts").setTitle(this.getText("cornerTextLabel"));
		this.byId("idLeftUpper").setPlaceholder(this.getText("leftTop"));
		this.byId("idRightUpper").setPlaceholder(this.getText("rightTop"));
		this.byId("idLeftLower").setPlaceholder(this.getText("leftBottom"));
		this.byId("idRightLower").setPlaceholder(this.getText("rightBottom"));
	},
	/**
	 * @private
	 * @description Handler for change event on chartTypes drop down.
	 * 				Updates the property drop downs according to the new chart type.
	 * 				Updates the representation object with corresponding data.
	 * 				Updates the tree node with selected representation type.
	 * 				Updates the title and bread crumb. 
	 * @name sap.apf.modeler.ui.controller.representation#handleChangeForChartType
	 * @param {oEvent} oEvt - Selection Event
	 **/
	handleChangeForChartType : function(oEvt) {
		var sNewChartType = oEvt.getParameter("selectedItem").getKey();
		var sPrevChart = this.sCurrentChartType;//getting prevChart type
		this.sCurrentChartType = sNewChartType;
		this._updateAndSetDatasetsByChartType(sNewChartType);
		var aRepresentationTypes = sap.apf.ui.utils.CONSTANTS.representationTypes;
		var aBarClassChart = aRepresentationTypes.BAR_CHART;
		var aColumnClassCharts = [ aRepresentationTypes.COLUMN_CHART, aRepresentationTypes.STACKED_COLUMN_CHART, 
		                           aRepresentationTypes.PERCENTAGE_STACKED_COLUMN_CHART, aRepresentationTypes.LINE_CHART ];
		var bIsBarClassType = (aBarClassChart === sNewChartType);
		this.bIsBarClassType = bIsBarClassType;
		// Checking selected chart belongs to ColumnClass,Line Chart
		var bIsColumnClassType = aColumnClassCharts.indexOf(sNewChartType) !== -1;
		//Checking selected chart belongs to same ChartClass
		var bIsColumnClassSameType = (aColumnClassCharts.indexOf(sNewChartType) !== -1 && 
		        aColumnClassCharts.indexOf(sPrevChart) !== -1);
		if (bIsBarClassType || (bIsColumnClassType && !bIsColumnClassSameType)) {
			this._switchLabelForCharts();//Switches the text for "BarClassCharts","ColumnClassCharts" & LineChart
		}
		this.oRepresentation.setRepresentationType(sNewChartType);
		var sAlternateRepresentation;
		if (sNewChartType !== sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION) {
			sAlternateRepresentation = sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION;
		}
		var sSelectedChartIcon = this._getChartPictureDataset().sSelectedChartPicture;
		this.oRepresentation.setAlternateRepresentationType(sAlternateRepresentation);
		// Update Tree Node
		var sRepresentationTypeText = this.getText(this.oRepresentation.getRepresentationType());
		var aStepCategories = this.oConfigurationEditor.getCategoriesForStep(this.oParentStep.getId());
		if (aStepCategories.length === 1) {//In case the step of representation is only assigned to one category
			this.oViewData.updateSelectedNode({
				name : sRepresentationTypeText,
				icon : sSelectedChartIcon
			});
		} else {
			this.oViewData.updateTree();
		}
		var sTitle = this.getText("representation") + ": " + sRepresentationTypeText;
		this.oViewData.updateTitleAndBreadCrumb(sTitle);
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	    * @private
	    * @function
	    * @name sap.apf.modeler.ui.controller.representation#_switchLabelForCharts
	    * @description Get all property rows in basic data layout & reads aggregation role & kind                        
	    * */
	_switchLabelForCharts : function() {
		var oSelf = this;
		var oBasicDataLayout = this.byId("idBasicDataLayout").getItems();
		var sAggRole, sKind;
		oBasicDataLayout.forEach(function(dataLayout) {
			//Getting Aggregation role for each property row
			sAggRole = dataLayout.getContent()[0].getBindingContext().getProperty("sAggregationRole");
			//Getting kind for each property row
			sKind = dataLayout.getContent()[0].getBindingContext().getProperty("sKind");
			if (sAggRole && sKind) {
				var sText = oSelf._createDimMeasForCharts(sAggRole, sKind);
				dataLayout.getContent()[0].setText(sText);//setting newly created text for property row label
			}
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_createDimMeasForCharts
	* @return sText :Text for label
	* @description Creates text for property row labels(Dimension&Measure)in respect of chart type
	* 
	* */
	_createDimMeasForCharts : function(sAggRole, sKind) {
		var sHorizontal = sap.apf.core.constants.representationMetadata.kind.XAXIS;
		var sVertical = sap.apf.core.constants.representationMetadata.kind.YAXIS;
		//if chart is bar and Aggregation role is 'dimension' & sKind is 'Horizontal' set sKind = 'Vertical'
		if (sAggRole === "dimension" && sKind === sHorizontal) {
			sKind = sHorizontal;
			if (this.bIsBarClassType) {
				sKind = sVertical;
			}
		}//if chart is bar and Aggregation role is 'measure' set sKind = 'Horizontal' 
		else if (sAggRole === "measure") {
			sKind = sVertical;
			if (this.bIsBarClassType) {
				sKind = sHorizontal;
			}
		}
		sAggRole = this.getText(sAggRole);
		sKind = this.getText(sKind);
		var sText = this.getText("dim-measure-label", [ sAggRole, sKind ]);
		return sText; //Newly created text for Label in respect of Chart type
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#handleChangeForCornerText
	* @param {oEvent} oEvt - Selection Event
	* @description Handler for change event on corner text input boxes.
	* Sets the corresponding corner text on the representation object.                
	* */
	handleChangeForCornerText : function(oEvt) {
		var oCornerTextInput = oEvt.getSource();
		var sCornerTextValue = oCornerTextInput.getValue();
		var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.REPRESENTATION_CORNER_TEXT;
		var sCornerTextId = this.oTextPool.setText(sCornerTextValue, oTranslationFormat);
		var sCornerTextName = oCornerTextInput.getBindingPath('value').replace("/", "");
		var sSetCornerTextMethodName = [ "set", sCornerTextName, "CornerTextKey" ].join("");
		this.oRepresentation[sSetCornerTextMethodName](sCornerTextId);
		this.oConfigurationEditor.setIsUnsaved();
		// Run the fall back logic to update the corner text.
		this.mDataset.oCornerTextsDataset[sCornerTextName] = this._getCornerTextsDataset()[sCornerTextName];
		this.mModel.oCornerTextsModel.updateBindings();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_addAutoCompleteFeatureOnInputs
	* @description Adds auto complete feature on all the four corner texts.         
	* */
	_addAutoCompleteFeatureOnInputs : function() {
		var oSelf = this;
		var oTextPoolHelper = new sap.apf.modeler.ui.utils.TextPoolHelper(this.oTextPool);
		// Add Feature on Corner Texts
		var oDependenciesForText = {
			oTranslationFormat : sap.apf.modeler.ui.utils.TranslationFormatMap.REPRESENTATION_CORNER_TEXT,
			type : "text"
		};
		var aCornerTextInputIds = [ "idLeftUpper", "idRightUpper", "idLeftLower", "idRightLower" ];
		aCornerTextInputIds.forEach(function(sId) {
			var oInputControl = oSelf.getView().byId(sId);
			oTextPoolHelper.setAutoCompleteOn(oInputControl, oDependenciesForText);
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_bindBasicRepresentationData
	* @description Binds sap.apf.modeler.ui.controller.representation#mModel.oPropertyModel to Basic Data layout.
	* Iteratively binds the data to each and every control in Basic Data Layout.
	* */
	_bindBasicRepresentationData : function() {
		var oSelf = this;
		var oBasicDataLayout = this.byId("idBasicDataLayout");
		var oPropertyRowTemplate = new sap.ui.layout.Grid({ // add the labels and input control to the grid
			width : "100%"
		});
		// Label
		var oAggregationKindLabel = new sap.m.Label({
			width : "100%",
			textAlign : "End",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S3"
			}),
			text : {
				path : "/",
				formatter : function() {
					var sAggRole = this.getBindingContext().getProperty("sAggregationRole");
					var sKind = this.getBindingContext().getProperty("sKind");
					var sChartName = oSelf.sCurrentChartType;
					var aRepresentationTypes = sap.apf.ui.utils.CONSTANTS.representationTypes;
					var aBarClassCharts = [ aRepresentationTypes.BAR_CHART, aRepresentationTypes.STACKED_BAR_CHART, 
					                        aRepresentationTypes.PERCENTAGE_STACKED_BAR_CHART ];
					oSelf.bIsBarClassType = (aBarClassCharts.indexOf(sChartName) !== -1);
					if (sAggRole && sKind) {
						if (oSelf.bIsBarClassType) { //BarCharts
							return oSelf._createDimMeasForCharts(sAggRole, sKind);
						} else {
							sAggRole = oSelf.getText(sAggRole);
							sKind = oSelf.getText(sKind);
							return oSelf.getText("dim-measure-label", [ sAggRole, sKind ]);
						}
					}
				}
			}
		});
		oPropertyRowTemplate.addContent(oAggregationKindLabel);
		// Select Box
		var oPropertySelectBox = new sap.m.Select({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S3"
			}),
			items : {
				path : "aAllProperties",
				template : new sap.ui.core.ListItem({
					key : "{sName}",
					text : "{sName}"
				})
			},
			selectedKey : "{sSelectedProperty}",
			change : oSelf._handleChangeForBasicDataSelectProperty.bind(this)
		// the current context should be bound to the event handler
		});
		oPropertyRowTemplate.addContent(oPropertySelectBox);
		// Label for 'Label'
		var oLabel = new sap.m.Label({
			textAlign : "End",
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S2"
			}),
			text : {
				path : "/",
				formatter : function() {
					var sText;
					var sDefaultLabel, sSelectedProperty;
					var sLabel = this.getBindingContext().getProperty("sLabel");
					if (this.getParent().getContent()[1].getSelectedItem()) {
						sSelectedProperty = this.getParent().getContent()[1].getSelectedItem().getText();
					} else {
						sSelectedProperty = this.getBindingContext().getProperty("sSelectedProperty");
					}
					sText = oSelf.getText("label"); //"label" title has to be displayed
					//if label is default , only then it should be overridden
					if (sSelectedProperty && sSelectedProperty !== oSelf.getText("none")) {// if a property is selected other than none
						sDefaultLabel = oSelf.oEntityMetadata.getPropertyMetadata(sSelectedProperty).label; // read the default label from metadata
						if (!sLabel || (sLabel && sDefaultLabel && (sLabel === sDefaultLabel))) { // if the label is not defined or label is same as default label
							sText = oSelf.getText("label") + "(" + oSelf.getText("default") + ")"; // "Default" has to be prefixed to label title
						}
					}
					return sText;
				}
			}
		}).addStyleClass("repFormRightLabel");
		oPropertyRowTemplate.addContent(oLabel);
		// Input for 'Label'
		var oInputLabel = new sap.m.Input({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M2 S2"
			}),
			value : {
				path : "sLabel",
				formatter : function() {
					var sDefaultLabel, sSelectedProperty;
					if (this.getParent().getContent()[1].getSelectedItem()) {
						sSelectedProperty = this.getParent().getContent()[1].getSelectedItem().getText();
					} else {
						sSelectedProperty = this.getBindingContext().getProperty("sSelectedProperty");
					}
					if (sSelectedProperty && sSelectedProperty !== oSelf.getText("none")) {
						sDefaultLabel = oSelf.oEntityMetadata.getPropertyMetadata(sSelectedProperty).label;
					}
					var sLabel = this.getBindingContext().getProperty("sLabel");
					// if there is a selected property other than none and the label is not defined for it or label is defined and it is same as default label 
					if ((sSelectedProperty && sSelectedProperty !== oSelf.getText("none") && !sLabel) || (sLabel && sDefaultLabel && (sLabel === sDefaultLabel))) {
						return sDefaultLabel; //default label should be displayed
					} else {
						return sLabel; //else manual entered label has to be displayed
					}
				}
			},
			visible : {
				path : "sLabel",
				formatter : function() {
					if (!this.mEventRegistry.suggest) {
						var oTextPoolHelper = new sap.apf.modeler.ui.utils.TextPoolHelper(oSelf.oTextPool);
						// Add Auto Complete Feature on Label inputs.
						var oDependenciesForText = {
							oTranslationFormat : sap.apf.modeler.ui.utils.TranslationFormatMap.REPRESENTATION_LABEL,
							type : "text"
						};
						oTextPoolHelper.setAutoCompleteOn(this, oDependenciesForText);
					}
					return true;
				}
			},
			change : oSelf._handleChangeForBasicDataPropertyRowLabelInput.bind(this)
		// the current context should be bound to the event handler
		});
		oPropertyRowTemplate.addContent(oInputLabel);
		// Add Icon
		var oAddIcon = new sap.ui.core.Icon({
			width : "100%",
			src : "sap-icon://add",
			tooltip : oSelf.getText("addButton"),
			visible : {
				path : "nMax",
				formatter : function(nMax) {
					return (nMax === "*");
				}
			},
			press : oSelf._handlerForBasicDataAddPropertyRow.bind(this)
		// the current context should be bound to the event handler
		}).addStyleClass("addIconRepresentation");
		// Remove Icon
		var oRemoveIcon = new sap.ui.core.Icon({
			width : "100%",
			src : "sap-icon://less",
			tooltip : oSelf.getText("deleteButton"),
			visible : {
				path : "/",
				formatter : function() {
					var bIsFirstOfItsKind = true;
					var oBindingContext = this.getBindingContext();
					var nCurrentIndex = parseInt(oBindingContext.getPath().split("/").pop(), 10);
					if (nCurrentIndex) {
						var aPropertyRows = oSelf.mDataset.oPropertyDataset.aPropertyRows;
						var sCurrentKind = aPropertyRows[nCurrentIndex].sKind;
						var sCurrentAggRole = aPropertyRows[nCurrentIndex].sAggregationRole;
						var nPreviousIndex = nCurrentIndex - 1;
						var sPreviousKind = aPropertyRows[nPreviousIndex].sKind;
						var sPreviousAggRole = aPropertyRows[nPreviousIndex].sAggregationRole;
						bIsFirstOfItsKind = !(sCurrentKind === sPreviousKind && sCurrentAggRole === sPreviousAggRole);
					}
					return !bIsFirstOfItsKind;
				}
			},
			press : oSelf._handlerForBasicDataDeletePropertyRow.bind(this)
		// the current context should be bound to the event handler
		}).addStyleClass("lessIconRepresentation");
		var oIconLayout = new sap.m.HBox({ //layout to hold the add/less icons
			layoutData : new sap.ui.layout.GridData({
				span : "L1 M2 S2"
			}),
			items : [ oAddIcon, oRemoveIcon ]
		});
		oPropertyRowTemplate.addContent(oIconLayout);
		oBasicDataLayout.bindAggregation("items", "/aPropertyRows", function(sId) {
			return oPropertyRowTemplate.clone(sId);
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handleChangeForBasicDataSelectProperty
	* @param {oControl}
	* @description Handler for change in select property
	* Sets the corresponding properties on the representation object.                
	* */
	_handleChangeForBasicDataSelectProperty : function(oSelectEvent) {
		var oSelf = this;
		var sSelectedKey = oSelectEvent.getSource().getSelectedKey();
		var oLabelControl = oSelectEvent.getSource().getParent().getContent()[2]; // label control for the select property 
		if (sSelectedKey && (sSelectedKey !== oSelf.getText("none"))) { // if a property is selected
			oSelf._setDefaultLabelForSelectedProperty(sSelectedKey, oLabelControl); //pass the selected property and the label control as an argument
		} else {
			oLabelControl.setText(oSelf.getText("label")); // if no property is selected, set the label value as empty string
			oSelectEvent.getSource().getParent().getContent()[3].setValue("");
		}
		oSelf._setPropertiesFromCurrentDataset(); // set the current properties on the representation
		oSelf.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handleChangeForBasicDataPropertyRowLabelInput
	* @param {oControl}
	* @description Handler for change in label for the property row
	* Sets the corresponding properties on the representation object.                
	* */
	_handleChangeForBasicDataPropertyRowLabelInput : function(oInputEvent) {
		var sProperty = oInputEvent.getSource().getBindingContext().getProperty("sSelectedProperty");
		if (sProperty && sProperty !== this.getText("none")) {
			this._updatLabelInPropertyRow(sProperty, oInputEvent.getSource().getValue(), oInputEvent.getSource().getParent().getContent()[2]);
		}
		this._setPropertiesFromCurrentDataset();
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handlerForBasicDataAddPropertyRow
	* @param {oPropertyRow}
	* @description Handler for the "+" icon in the property row
	* adds a new property row in the representation basic data and also sets the corresponding properties on the representation object.          
	* */
	_handlerForBasicDataAddPropertyRow : function(oAddRowEvent) {
		var oBindingContext = oAddRowEvent.getSource().getBindingContext();
		var oCurrentObjectClone = jQuery.extend(true, {}, oBindingContext.getObject());
		delete oCurrentObjectClone.sSelectedProperty;
		delete oCurrentObjectClone.sLabel;
		var nCurrentIndex = parseInt(oBindingContext.getPath().split("/").pop(), 10);
		var aPropertyRows = this.mDataset.oPropertyDataset.aPropertyRows;
		aPropertyRows.splice(nCurrentIndex + 1, 0, oCurrentObjectClone);
		this.mModel.oPropertyModel.updateBindings();
		this._setPropertiesFromCurrentDataset();
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handlerForBasicDataDeletePropertyRow
	* @param {oAddRowEvent}
	* @description Handler for the "-" icon in the property row
	* remove a property row from the representation basic data and also sets the corresponding properties on the representation object.          
	* */
	_handlerForBasicDataDeletePropertyRow : function(oDeleteRowEvent) {
		var oBindingContext = oDeleteRowEvent.getSource().getBindingContext();
		var nCurrentIndex = parseInt(oBindingContext.getPath().split("/").pop(), 10);
		var aPropertyRows = this.mDataset.oPropertyDataset.aPropertyRows;
		aPropertyRows.splice(nCurrentIndex, 1);
		this.mModel.oPropertyModel.updateBindings();
		this._setPropertiesFromCurrentDataset();
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_updatLabelInPropertyRow
	* @param {sSelectedProperty,sLabelValue,oLabel} - Selected property in the drop down, the new value of the lable and the lable control
	* @description gets the default label from the metadata, compares if the same value is given by user 
	* and accordingly adds the "default" prefix to the label. Also sets the text on the label control for every select property.       
	* */
	_updatLabelInPropertyRow : function(sSelectedProperty, sLabelValue, oLabelControl) {
		var sDefaultLabel = this.oEntityMetadata.getPropertyMetadata(sSelectedProperty).label;
		var sLableControlText, sLabelControlValue;
		if (sDefaultLabel !== sLabelValue && sLabelValue.length !== 0) {
			sLableControlText = this.getText("label");
			sLabelControlValue = sLabelValue;
		} else {
			sLableControlText = this.getText("label") + "(" + this.getText("default") + ")";
			sLabelControlValue = sDefaultLabel;
		}
		this.mDataset.oPropertyDataset.aPropertyRows.forEach(function(oPropertyRow) {
			if (oPropertyRow.sSelectedProperty === sSelectedProperty) { //Update the dataset with default value of input label
				oPropertyRow.sLabel = sLabelControlValue;
			}
		});
		this.mModel.oPropertyModel.updateBindings();
		oLabelControl.setText(sLableControlText);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_setDefaultLabelForSelectedProperty
	* @param {sSelectedProperty,oLabelControl} - Selected property in the drop down and the label control
	* @description gets the default label from the metadata, adds the "default" prefix to the label. 
	* Also sets the default text on the label control for every select property.       
	* */
	_setDefaultLabelForSelectedProperty : function(sSelectedProperty, oLabelControl) {
		var sDefaultLabel = this.oEntityMetadata.getPropertyMetadata(sSelectedProperty).label;
		var sLabelText = this.getText("label") + "(" + this.getText("default") + ")";
		this.mDataset.oPropertyDataset.aPropertyRows.forEach(function(oPropertyRow) {
			if (oPropertyRow.sSelectedProperty === sSelectedProperty) {
				oPropertyRow.sLabel = sDefaultLabel; //Update the dataset with default value of input label
			}
		});
		this.mModel.oPropertyModel.updateBindings();
		oLabelControl.setText(sLabelText);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_bindSortLayoutData
	* @description Binds sap.apf.modeler.ui.controller.representation#mModel.oSortModel to Sort layout.
	*               Iteratively binds the data to both the controls in Sort Data Layout.
	* */
	_bindSortLayoutData : function() {
		var oSelf = this;
		var oSortLayout = this.byId("idSortLayout");
		var oSortRowTemplate = new sap.ui.layout.Grid({ // add the select box controls to the grid.
			width : "100%"
		});
		// "Sort Label" Label
		var oSortFieldLabel = new sap.m.Label({
			width : "100%",
			textAlign : "End",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S3"
			}),
			text : this.getText("sortingField")
		});
		oSortRowTemplate.addContent(oSortFieldLabel);
		// "Sort Fields" Select Box
		var oSortPropertySelectBox = new sap.m.Select({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M3 S3"
			}),
			items : {
				path : "aAllProperties",
				template : new sap.ui.core.ListItem({
					key : "{sName}",
					text : "{sName}"
				})
			},
			selectedKey : "{sSortProperty}",
			change : oSelf._handleChangeForSortDataProperty.bind(this)
		// the current context should be bound to the event handler
		});
		oSortRowTemplate.addContent(oSortPropertySelectBox);
		// "Direction" Label
		var oDirectionLabel = new sap.m.Label({
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M2 S2"
			}),
			width : "100%",
			textAlign : "End",
			text : this.getText("direction")
		});
		oSortRowTemplate.addContent(oDirectionLabel);
		// "Direction" Select Box
		var oDirectionSelectBox = new sap.m.Select({
			width : "100%",
			layoutData : new sap.ui.layout.GridData({
				span : "L3 M2 S2"
			}),
			items : [ {
				key : this.getText("ascending"),
				text : this.getText("ascending")
			}, {
				key : this.getText("descending"),
				text : this.getText("descending")
			} ],
			selectedKey : "{sDirection}",
			change : oSelf._handleChangeForSortDirection.bind(this)
		// the current context should be bound to the event handler
		});
		oSortRowTemplate.addContent(oDirectionSelectBox);
		// Add Icon
		var oAddIcon = new sap.ui.core.Icon({
			width : "100%",
			src : "sap-icon://add",
			tooltip : this.getText("addButton"),
			visible : true,
			press : oSelf._handleChangeForAddSortRow.bind(this)
		// the current context should be bound to the event handler
		}).addStyleClass("addIconRepresentation");
		// Remove Icon
		var oRemoveIcon = new sap.ui.core.Icon({
			width : "100%",
			src : "sap-icon://less",
			tooltip : this.getText("deleteButton"),
			visible : {
				path : "/",
				formatter : function() {
					var oBindingContext = this.getBindingContext();
					var nCurrentIndex = parseInt(oBindingContext.getPath().split("/").pop(), 10);
					return !!nCurrentIndex;
				}
			},
			press : oSelf._handleChangeForDeleteSortRow.bind(this)
		// the current context should be bound to the event handler
		}).addStyleClass("lessIconRepresentation");
		// Layout to hold the add/less icons
		var oIconLayout = new sap.m.HBox({
			layoutData : new sap.ui.layout.GridData({
				span : "L1 M2 S2"
			}),
			items : [ oAddIcon, oRemoveIcon ]
		});
		oSortRowTemplate.addContent(oIconLayout);
		oSortLayout.bindAggregation("items", "/aSortRows", oSortRowTemplate);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handleChangeForSortDataProperty
	* @description handler for the change in sort property in representation.       
	* */
	_handleChangeForSortDataProperty : function() {
		this._setSortFieldsFromCurrentDataset();
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handleChangeForSortDirection
	* @description handler for the change in sort direction for a property in representation.       
	* */
	_handleChangeForSortDirection : function(oSelectEvent) {
		var sSortProperty = oSelectEvent.getSource().getBindingContext().getProperty("sSortProperty");
		if (sSortProperty !== this.getText("none")) {
			this._setSortFieldsFromCurrentDataset();
			this.oConfigurationEditor.setIsUnsaved();
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handleChangeForAddSortRow
	* @param {oAddRowEvent}
	* @description Handler for the "+" icon in the sort property row
	* adds a new sort property row in the representation sort data and also sets the corresponding properties on the representation object.          
	* */
	_handleChangeForAddSortRow : function(oAddRowEvent) {
		var oBindingContext = oAddRowEvent.getSource().getBindingContext();
		var oCurrentObjectClone = jQuery.extend(true, {}, oBindingContext.getObject());
		delete oCurrentObjectClone.sSortProperty;
		delete oCurrentObjectClone.sDirection;
		var nCurrentIndex = parseInt(oBindingContext.getPath().split("/").pop(), 10);
		var aSortRows = this.mDataset.oSortDataset.aSortRows;
		aSortRows.splice(nCurrentIndex + 1, 0, oCurrentObjectClone);
		this.mModel.oSortModel.updateBindings();
		this._setSortFieldsFromCurrentDataset();
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handleChangeForDeleteSortRow
	* @param {oDeleteRowEvent}
	* @description Handler for the "-" icon in the sort property row
	* removes a sort property row from the representation sort data and also sets the corresponding properties on the representation object.          
	* */
	_handleChangeForDeleteSortRow : function(oDeleteRowEvent) {
		var oBindingContext = oDeleteRowEvent.getSource().getBindingContext();
		var nCurrentIndex = parseInt(oBindingContext.getPath().split("/").pop(), 10);
		var aSortRows = this.mDataset.oSortDataset.aSortRows;
		aSortRows.splice(nCurrentIndex, 1);
		this.mModel.oSortModel.updateBindings();
		this._setSortFieldsFromCurrentDataset();
		this.oConfigurationEditor.setIsUnsaved();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_validateRepresentationData
	* @description Validates the dimensions and measures of a representation by comparing them with the select properties of the step
	* Removes dimensions or measures that are not part of the step's select properties
	* */
	_validateRepresentationData : function() {
		var oSelf = this;
		//Dimensions set to the representation
		var aDimensions = this.oRepresentation.getDimensions().map(function(dimension) {
			return {
				sType : "Dimension",
				sName : dimension
			};
		});
		//Measures set to the representation
		var aMeasures = this.oRepresentation.getMeasures().map(function(measure) {
			return {
				sType : "Measure",
				sName : measure
			};
		});
		var aRepProperties = aDimensions.concat(aMeasures);
		//Compare representation properties and step properties
		aRepProperties.forEach(function(repProperty) {
			var bPropertyPresent = false;
			oSelf.aSelectProperties.forEach(function(selectProperty) {
				if (repProperty.sName === selectProperty.sName) {
					bPropertyPresent = true;
				}
			});
			//If property is not present in the step's select properties remove the property(dimension or measure) from the representation
			if (bPropertyPresent === false) {
				var sRemoveMethodName = [ "remove", repProperty.sType ].join("");
				oSelf.oRepresentation[sRemoveMethodName](repProperty.sName);
				oSelf.oConfigurationEditor.setIsUnsaved();
			}
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#setDetailData
	* @description Prepares data set and model map to be used within the view.
	* */
	setDetailData : function() {
		var mContextParam = this.mParam.arguments;
		this.oParentStep = this.oConfigurationEditor.getStep(mContextParam.stepId);
		this.oEntityMetadata = this.getEntityTypeMetadata(this.oParentStep.getService(), this.oParentStep.getEntitySet());
		this.aSelectProperties = this._getSelectPropertiesFromParentStep();
		this.oRepresentation = this.oParentStep.getRepresentation(mContextParam.representationId);
		if (!this.oRepresentation) {
			this.oRepresentation = this.oParentStep.createRepresentation();
			// Set Default Chart Type
			this._setDefaultRepresentationType();
			// Set Default Dimensions/Measures
			this._setDefaultProperties();
			this.oConfigurationEditor.setIsUnsaved();
		}
		this._validateRepresentationData();
		// Datasets
		var oChartTypeDataset = this._getChartTypeDataset();
		var oPropertyDataset = this._getPropertyDataset();
		var oSortDataset = this._getSortDataset();
		var oCornerTextsDataset = this._getCornerTextsDataset();
		var oChartPictureDataset = this._getChartPictureDataset();
		this.mDataset = {
			oChartTypeDataset : oChartTypeDataset,
			oPropertyDataset : oPropertyDataset,
			oSortDataset : oSortDataset,
			oCornerTextsDataset : oCornerTextsDataset,
			oChartPictureDataset : oChartPictureDataset
		};
		// Models
		var oChartTypeModel = new sap.ui.model.json.JSONModel(this.mDataset.oChartTypeDataset);
		var oPropertyModel = new sap.ui.model.json.JSONModel(this.mDataset.oPropertyDataset);
		var oSortModel = new sap.ui.model.json.JSONModel(this.mDataset.oSortDataset);
		var oCornerTextsModel = new sap.ui.model.json.JSONModel(this.mDataset.oCornerTextsDataset);
		var oChartPictureModel = new sap.ui.model.json.JSONModel(this.mDataset.oChartPictureDataset);
		this.mModel = {
			oChartTypeModel : oChartTypeModel,
			oPropertyModel : oPropertyModel,
			oSortModel : oSortModel,
			oCornerTextsModel : oCornerTextsModel,
			oChartPictureModel : oChartPictureModel
		};
		// Bindings
		this.byId("idChartType").setModel(this.mModel.oChartTypeModel);
		var sChartType = this.sCurrentChartType;
		this._updateAndSetDatasetsByChartType(sChartType);
		this.byId("idBasicDataLayout").setModel(this.mModel.oPropertyModel);
		this._bindBasicRepresentationData();
		this.byId("idSortLayout").setModel(this.mModel.oSortModel);
		this._bindSortLayoutData();
		this.byId("idLeftLower").setModel(this.mModel.oCornerTextsModel);
		this.byId("idRightLower").setModel(this.mModel.oCornerTextsModel);
		this.byId("idLeftUpper").setModel(this.mModel.oCornerTextsModel);
		this.byId("idRightUpper").setModel(this.mModel.oCornerTextsModel);
		this.byId("idChartIcon").setModel(this.mModel.oChartPictureModel);
		// Actions
		this._addAutoCompleteFeatureOnInputs();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_insertPreviewButtonInFooter
	* @description Inserts the preview Button into the footer.
	* */
	_insertPreviewButtonInFooter : function() {
		var oFooter = this.oViewData.oFooter;
		oFooter.addContentRight(this._oPreviewButton);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_removePreviewButtonFromFooter
	* @description Removes the preview Button from the footer.
	* */
	_removePreviewButtonFromFooter : function() {
		var oFooter = this.oViewData.oFooter;
		oFooter.removeContentRight(this._oPreviewButton);
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_handlePreviewButtonPress
	* @description Handler for press event on preview Button.
	*          Opens a dialog and inserts the preview content in it.
	* */
	_handlePreviewButtonPress : function() {
		var oPreviewDetails = this._getPreviewDetails();
		var oPreviewContent = new sap.ui.view({
			type : sap.ui.core.mvc.ViewType.XML,
			viewName : "sap.apf.modeler.ui.view.previewContent",
			viewData : oPreviewDetails
		});
		var oPreviewDialog = new sap.m.Dialog({
			title : this.getText("preview"),
			content : oPreviewContent,
			endButton : new sap.m.Button({
				text : this.getText("close"),
				press : function() {
					oPreviewDialog.close();
				}
			})
		});
		oPreviewDialog.open();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#onExit
	* @description Called when sub-view is destroyed by configuration list controller.
	*               Removes the preview button from footer.
	* */
	onExit : function() {
		this._removePreviewButtonFromFooter();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getPreviewDetails
	* @description Prepares the argument for sap.apf.modeler.ui.controller.PreviewContent.
	*          Iterates through all the models and populates the result object.
	* @returns {Object} Argument for sap.apf.modeler.ui.controller.PreviewContent
	* */
	_getPreviewDetails : function() {
		var oSelf = this;
		var sChartTpype = this.mDataset.oChartTypeDataset.sSelectedChartType;
		var sStepTitle = this._getParentStepTitle();
		var sStepLongTitle = this._getParentStepLongTitle() || sStepTitle;
		var aDimensions = [], aMeasures = [];
		this.aSelectProperties.forEach(function(oSelectProperty) {
			if (oSelectProperty.sAggregationRole === "dimension") {
				aDimensions.push(oSelectProperty.sName);
			} else if (oSelectProperty.sAggregationRole === "measure") {
				aMeasures.push(oSelectProperty.sName);
			}
		});
		var oChartParameter = {
			dimensions : [],
			measures : []
		};
		this.mDataset.oPropertyDataset.aPropertyRows.forEach(function(oPropertyRow) {
			if (oPropertyRow.sSelectedProperty !== oSelf.getText("none")) {
				var sAggregationRole = oPropertyRow.sAggregationRole + "s";
				oChartParameter[sAggregationRole].push({
					fieldDesc : oPropertyRow.sLabel,
					fieldName : oPropertyRow.sSelectedProperty,
					kind : oPropertyRow.sKind
				});
			}
		});
		// Sort Fields
		var aSort = [];
		this.mDataset.oSortDataset.aSortRows.forEach(function(oSortRow) {
			var sSortProperty = oSortRow.sSortProperty || (oSortRow.aAllProperties.length && oSortRow.aAllProperties[0].sName);
			if (sSortProperty && sSortProperty !== oSelf.getText("none")) {
				var bAscending = !oSortRow.sDirection || (oSortRow.sDirection === oSelf.getText("ascending"));
				aSort.push({
					sSortField : sSortProperty,
					bDescending : !bAscending
				});
			}
		});
		var aCornerTexts = {
			sLeftUpper : this.mDataset.oCornerTextsDataset.LeftUpper,
			sRightUpper : this.mDataset.oCornerTextsDataset.RightUpper,
			sLeftLower : this.mDataset.oCornerTextsDataset.LeftLower,
			sRightLower : this.mDataset.oCornerTextsDataset.RightLower
		};
		return {
			sChartType : sChartTpype,
			sStepTitle : sStepTitle,
			sStepLongTitle : sStepLongTitle,
			aDimensions : aDimensions,
			aMeasures : aMeasures,
			oChartParameter : oChartParameter,
			aSort : aSort,
			aCornerTexts : aCornerTexts
		};
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getParentStepLongTitle
	* @description Getter for parent step's long title
	* @returns {String|undefined} Parent Step's Long Title or undefined if not available.
	* */
	_getParentStepLongTitle : function() {
		var sStepLongTitleId = this.oParentStep.getLongTitleId();
		sStepLongTitleId = !this.oTextPool.isInitialTextKey(sStepLongTitleId) ? sStepLongTitleId : undefined;
		var oStepLongTitleText = sStepLongTitleId && this.oTextPool.get(sStepLongTitleId);
		var sStepLongTitle = oStepLongTitleText && oStepLongTitleText.TextElementDescription;
		return sStepLongTitle;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getParentStepTitle
	* @description Getter for parent step's title
	* @returns {String|undefined} Parent Step's Title or undefined if not available.
	* */
	_getParentStepTitle : function() {
		var sStepTitleId = this.oParentStep.getTitleId();
		var oStepTitleText = sStepTitleId && this.oTextPool.get(sStepTitleId);
		var sStepTitle = oStepTitleText && oStepTitleText.TextElementDescription;
		return sStepTitle;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getSelectPropertiesFromParentStep
	* @description Getter for Select Property List from parent step.
	* @returns {Object[]} Array of select properties of the form : 
	*          {
	*               sName - Name of the property.
	*               sAggregationRole - dimension/measure.
	*               sLabel - Label of the property
	*          }
	* */
	_getSelectPropertiesFromParentStep : function() {
		var sAbsolutePathToServiceDocument = this.oParentStep.getService();
		var sEntitySet = this.oParentStep.getEntitySet();
		var oEntityMetadata = this.getEntityTypeMetadata(sAbsolutePathToServiceDocument, sEntitySet);
		var aSelectProperties = this.oParentStep.getSelectProperties();
		var aResultSet = aSelectProperties.map(function(sProperty) {
			var oMetadataForProperty = oEntityMetadata.getPropertyMetadata(sProperty);
			return {
				sName : sProperty,
				sAggregationRole : oMetadataForProperty["aggregation-role"],
				sLabel : oMetadataForProperty["label"]
			};
		});
		return aResultSet;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getCornerTextsFromConfigObject
	* @param {sap.apf.modeler.core.Step|sap.apf.modeler.core.Representation} oConfigObject - Instance of a configuration object.
	* @description Getter for corner text map of a configuration object.
	* @returns {Object} Map of corner Text of the form : 
	*          {
	*               LeftUpper - Left Upper corner text.
	*               RightUpper - Right Upper corner text.
	*               LeftLower - Left Lower corner text.
	*               RightLower - Right Lower corner text. 
	*          }
	* */
	_getCornerTextsFromConfigObject : function(oConfigObject) {
		var oSelf = this;
		var aCornerTextNames = [ "LeftUpper", "RightUpper", "LeftLower", "RightLower" ];
		var mDataset = {};
		aCornerTextNames.forEach(function(sCornerTextName) {
			var sMethodName = [ "get", sCornerTextName, "CornerTextKey" ].join("");
			var sCornerTextKey = oConfigObject[sMethodName]();
			var oCornerText = sCornerTextKey && oSelf.oTextPool.get(sCornerTextKey);
			var sCornterText = oCornerText && oCornerText.TextElementDescription;
			mDataset[sCornerTextName] = sCornterText;
		});
		return mDataset;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getChartTypeDataset
	* @description Returns the data set to be bound to chart type drop down.
	* @returns {Object} Data set for chart type drop down of the form:
	*          {
	*               aChartTypes : [
	*                    {
	*                          sId - {sap.apf.ui.utils.CONSTANTS.representationTypes} Chart Type.
	*                          sText - {String} Display text for the chart type     
	*                    }
	*               ]
	*               sSelectedChartType - {sap.apf.ui.utils.CONSTANTS.representationTypes} Currently selected Chart Type.
	*          }
	* */
	_getChartTypeDataset : function() {
		var self = this;
		var aKeys = Object.keys(this._getRepresentationMetadata());
		var aChartTypes = aKeys.map(function(sKey) {
			return {
				sId : sKey,
				sText : self.getText(sKey)
			};
		});
		var oDataset = {
			aChartTypes : aChartTypes,
			sSelectedChartType : this.oRepresentation.getRepresentationType()
		};
		this.sCurrentChartType = oDataset.sSelectedChartType;
		return oDataset;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getChartPictureDataset
	* @description Returns the data set to be bound to representation icon
	* @returns {Object} 
	*          {
	*               id : picture
	*          }
	* */
	_getChartPictureDataset : function() {
		var oRepnMetaData = this.getRepresentationTypes();
		var oDataSet = {};
		oRepnMetaData.forEach(function(o) {
			var sId = o.id;
			oDataSet[sId] = o.picture;
		});
		oDataSet.sSelectedChartPicture = oDataSet[this.oRepresentation.getRepresentationType()];
		return oDataSet;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_updatePictureDataset
	* @description Update the picture model data set
	*/
	_updatePictureDataset : function(sChartType) {
		var oDataSet = this.mModel.oChartPictureModel.getData();
		oDataSet.sSelectedChartPicture = oDataSet[sChartType];
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getPropertyDataset
	* @description Returns the data set to be bound to basic data layout.
	* @returns {Object} Data set for basic data layout of the form:
	*          {
	*               aPropertyRows : [
	*                    {
	                           sSelectedProperty - Selected Property of dropdown.
	                           sAggregationRole - dimension/measure.
	                           sLabel - Label of the selected property.
	                           sKind - {sap.apf.core.constants.representationMetadata.kind} kind value of corresponding row.
	                           nMin - Minimum value from representation metadata.
	                           nMax - Maximum value from representation metadata.
	                      }
	*               ]
	*          }
	* */
	_getPropertyDataset : function() {
		var oSelf = this;
		var aPropertyRows = [];
		var fnAddPropertyRowsOfType = function(sType) {
			var sGetterMethodName = [ "get", sType, "s" ].join("");
			var aPropertyList = oSelf.oRepresentation[sGetterMethodName]();
			aPropertyList.forEach(function(sProperty) {
				var sLabelKeyMethodName = [ "get", sType, "TextLabelKey" ].join("");
				var sLabelKey = oSelf.oRepresentation[sLabelKeyMethodName](sProperty);
				var oLabel = sLabelKey && oSelf.oTextPool.get(sLabelKey);
				var sLabel = oLabel && oLabel.TextElementDescription;
				if (sLabel === undefined || sLabel.length === 0) { // if label is undefined or an empty string
					sLabel = oSelf.oEntityMetadata.getPropertyMetadata(sProperty).label;
				}
				var sKindMethodName = [ "get", sType, "Kind" ].join("");
				var sKind = oSelf.oRepresentation[sKindMethodName](sProperty);
				var sChartName = oSelf.oRepresentation.getRepresentationType();
				var oRepMetadata = oSelf._getRepresentationMetadata()[sChartName];
				var aSupportedKinds = oRepMetadata[sType.toLowerCase() + "s"].supportedKinds;
				var nMin, nMax;
				aSupportedKinds.forEach(function(oSupportedKind) {
					if (oSupportedKind.kind === sKind) {
						nMin = oSupportedKind.min;
						nMax = oSupportedKind.max;
					}
				});
				aPropertyRows.push({
					sSelectedProperty : sProperty,
					sAggregationRole : sType.toLowerCase(),
					sLabel : sLabel,
					sKind : sKind,
					nMin : nMin,
					nMax : nMax
				});
			});
		};
		fnAddPropertyRowsOfType("Dimension");
		fnAddPropertyRowsOfType("Measure");
		return {
			aPropertyRows : aPropertyRows
		};
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getSortDataset
	* @description Returns the data set to be bound to sort data layout.
	* @returns {Object} Data set for sort data layout of the form:
	* {
	       aSortRows : [
	       		{
	       			 aAllProperties : [
	                      {
	                           sName : "None" - "None" value since it is an optional field.
	                      },
	                      {
	                           sName - Name of the property.
	                      }
	                ],
	                sSortProperty - Name of the selected sort property.
	                sDirection - Translated text for 'ascending' and 'descending'.
	       		}
	       ]
	 * }
	* */
	_getSortDataset : function() {
		var oSelf = this;
		var aOrderBySpecs = this.oRepresentation.getOrderbySpecifications();
		var aAllProperties = this.aSelectProperties.slice();
		aAllProperties.unshift({
			sName : this.getText("none")
		});
		if (!aOrderBySpecs.length) {
			aOrderBySpecs.push({});
		}
		var aSortRows = aOrderBySpecs.map(function(oOrderBySpec) {
			var sOrderByProperty = oOrderBySpec.property;
			var sOrderByDirection = oOrderBySpec.ascending !== undefined && !oOrderBySpec.ascending ? oSelf.getText("descending") : oSelf.getText("ascending");
			return {
				sSortProperty : sOrderByProperty,
				sDirection : sOrderByDirection,
				aAllProperties : aAllProperties
			};
		});
		return {
			aSortRows : aSortRows
		};
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getCornerTextsDataset
	* @description Returns the data set to be bound to corner texts data layout.
	* @returns {Object} Data set for corner texts data layout of the form:
	*          {
	*               LeftUpper - Left Upper corner text.
	*               RightUpper - Right Upper corner text.
	*               LeftLower - Left Lower corner text.
	*               RightLower - Right Lower corner text. 
	*          }
	* */
	_getCornerTextsDataset : function() {
		var mRepresentationCornerText = this._getCornerTextsFromConfigObject(this.oRepresentation);
		var mParentStepCornerText = this._getCornerTextsFromConfigObject(this.oParentStep);
		var oDataset = jQuery.extend({}, mParentStepCornerText, mRepresentationCornerText);
		return oDataset;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_setDefaultRepresentationType
	* @description Sets the first key from sap.apf.core.representationTypes() list as the default representation type.
	*               Updates the tree node after setting the representation type on the representation object and passes the id of newly created representation.
	* */
	_setDefaultRepresentationType : function() {
		var sDefaultChartType;
		if (this.getRepresentationTypes()[0].metadata) {
			sDefaultChartType = this.getRepresentationTypes()[0].id;
		}
		this.oRepresentation.setRepresentationType(sDefaultChartType);
		this.oRepresentation.setAlternateRepresentationType(sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION);
		// Update Tree Node.
		var sRepresentationTypeText = this.getText(this.oRepresentation.getRepresentationType());
		var sSelectedChartIcon = this._getChartPictureDataset().sSelectedChartPicture;
		var aStepCategories = this.oConfigurationEditor.getCategoriesForStep(this.oParentStep.getId());
		if (aStepCategories.length === 1) {//In case the step of representation is only assigned to one category
			this.oViewData.updateSelectedNode({
				id : this.oRepresentation.getId(),
				icon : sSelectedChartIcon
			});
		} else {
			var aRepresentationContexts = [];
			var representationContext = jQuery.extend(true, {}, this.mParam);
			var oRepresentationInfo = {
				id : this.oRepresentation.getId(),
				aStepCategories : aStepCategories,
				stepContext : representationContext
			};
			this.oViewData.updateTree();
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_setDefaultProperties
	* @description Adds the first dimension from parent step's select properties to representation object and gives it xAxis.
	*          Also adds the first measure to the representation object and gives it yAxis.
	* */
	_setDefaultProperties : function() {
		var sFirstDimension, sFirstMeasure;
		this.aSelectProperties.forEach(function(oSelectProperty) {
			if (!sFirstDimension) {
				if (oSelectProperty.sAggregationRole === "dimension") {
					sFirstDimension = oSelectProperty.sName;
				}
			}
			if (!sFirstMeasure) {
				if (oSelectProperty.sAggregationRole === "measure") {
					sFirstMeasure = oSelectProperty.sName;
				}
			}
		});
		// Add dimension
		if (sFirstDimension) {
			this.oRepresentation.addDimension(sFirstDimension);
			this.oRepresentation.setDimensionKind(sFirstDimension, sap.apf.core.constants.representationMetadata.kind.XAXIS);
		}
		// Add measure
		if (sFirstMeasure) {
			this.oRepresentation.addMeasure(sFirstMeasure);
			this.oRepresentation.setMeasureKind(sFirstMeasure, sap.apf.core.constants.representationMetadata.kind.YAXIS);
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_updateAndSetDatasetsByChartType
	* @param {sap.apf.ui.utils.CONSTANTS.representationTypes} sChartName - Representation Type against which the property dataset has to be updated.
	* @description Updates datasets used in different layouts based on chart type.
	*          This method mutates the sap.apf.modeler.ui.controller.representation#mDataset based on the chart type which is passed.
	*          After the mutation it sets the values on the representation object.
	* */
	_updateAndSetDatasetsByChartType : function(sChartName) {
		this._updatePropertyDatasetByChartType(sChartName);
		this.mModel.oPropertyModel.updateBindings();
		this._setPropertiesFromCurrentDataset();
		this._updateSortDatasetByChartType(sChartName);
		this.mModel.oSortModel.updateBindings();
		this._setSortFieldsFromCurrentDataset();
		this._updatePictureDataset(sChartName);
		this.mModel.oChartPictureModel.updateBindings();
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_updatePropertyDatasetByChartType
	* @param {sap.apf.ui.utils.CONSTANTS.representationTypes} sChartName - Representation Type against which the property dataset has to be updated.
	* @description Property dataset that is used in basic data layout is different for differnt chart types.
	*          This method mutates the sap.apf.modeler.ui.controller.representation#mDataset.oPropertyDataset based on the chart type which is passed.
	*          Contains logic to retain the data rows if old data in row and data row from passed chart type are same.
	* */
	_updatePropertyDatasetByChartType : function(sChartName) {
		var self = this;
		// oDefaultDataset holds the bare-minimum property rows for this particular sChartName.
		var oDefaultDataset = {
			aPropertyRows : []
		};
		var oRepMetadata = this._getRepresentationMetadata()[sChartName];
		var aAggregationRoles = [ "dimensions", "measures" ];
		aAggregationRoles.forEach(function(sAggregationRole) { // for each aggregation role, check the supported kind
			if (oRepMetadata.hasOwnProperty(sAggregationRole)) {
				var aSupportedKinds = oRepMetadata[sAggregationRole].supportedKinds;
				var sSelectedProperty;
				aSupportedKinds.forEach(function(oSupportedKind) { //for each kind, check all the properties 
					var oPropertyRow = {
						sAggregationRole : sAggregationRole.slice(0, -1), // To chop off the letter 's' form 'dimensions' and 'measures'
						sKind : oSupportedKind.kind,
						nMin : oSupportedKind.min,
						nMax : oSupportedKind.max,
						aAllProperties : self.aSelectProperties.filter(function(oProperty) {
							return (oProperty.sAggregationRole === (sAggregationRole.slice(0, -1)));
						})
					};
					if (!parseInt(oSupportedKind.min, 10)) {
						oPropertyRow.aAllProperties.unshift({
							sName : self.getText("none"),
							sAggregationRole : sAggregationRole.slice(0, -1)
						});
					}
					oPropertyRow.aAllProperties.forEach(function(selectedProperty) { //assign the label to each property in one kind
						sSelectedProperty = selectedProperty.sName;
						if (sSelectedProperty) {
							var sType = sAggregationRole.slice(0, -1);
							var sAggregationRoleCamelCase = [ sType.charAt(0).toUpperCase(), sType.substring(1) ].join("");
							var sLabelKeyMethodName = [ "get", sAggregationRoleCamelCase, "TextLabelKey" ].join("");
							var sLabelKey = self.oRepresentation[sLabelKeyMethodName](sSelectedProperty);
							var oLabel = sLabelKey && self.oTextPool.get(sLabelKey);
							var sLabel = oLabel && oLabel.TextElementDescription;
							if (sLabel) { //if the user has given a label manually
								selectedProperty.sLabel = sLabel; // assign the label to the property
							} else { // else read the default label from the metadata
								if (sSelectedProperty !== self.getText("none")) {
									var sDefaultLabel = self.oEntityMetadata.getPropertyMetadata(sSelectedProperty).label;
									if (sDefaultLabel) {
										selectedProperty.sLabel = sDefaultLabel; // assign the label to the property
									}
								}
							}
						}
					});
					oDefaultDataset.aPropertyRows.push(oPropertyRow);
				});
			}
		});
		// oResultDataset combines the oDefaultDataset with the existing mPropertyDataset to retain the similar data entered by the user if any.
		var oResultDataset = {
			aPropertyRows : []
		};
		oDefaultDataset.aPropertyRows.forEach(function(oDefaultPropertyRow) {
			var bExitingRowOfSameKindExists = false;
			self.mDataset.oPropertyDataset.aPropertyRows.forEach(function(oExistingPropertyRow) {
				var bHasSameAggregationRole = oExistingPropertyRow.sAggregationRole === oDefaultPropertyRow.sAggregationRole;
				var bHasSameKind = oExistingPropertyRow.sKind === oDefaultPropertyRow.sKind;
				var bHasSameMinValue = oExistingPropertyRow.nMin === oDefaultPropertyRow.nMin;
				var bHasSameMaxValue = oExistingPropertyRow.nMax === oDefaultPropertyRow.nMax;
				if (bHasSameAggregationRole && bHasSameKind && bHasSameMinValue && bHasSameMaxValue) {
					bExitingRowOfSameKindExists = true;
					var oCompleteRow = jQuery.extend(oExistingPropertyRow, oDefaultPropertyRow);
					oResultDataset.aPropertyRows.push(oCompleteRow);
				}
			});
			if (!bExitingRowOfSameKindExists) {
				oResultDataset.aPropertyRows.push(oDefaultPropertyRow);
			}
		});
		// Update Dataset
		this.mDataset.oPropertyDataset.aPropertyRows = oResultDataset.aPropertyRows;
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_updateSortDatasetByChartType
	* @param {sap.apf.ui.utils.CONSTANTS.representationTypes} sChartName - Representation Type against which the property dataset has to be updated.
	* @description Sort dataset that is used in sort layout is different for differnt chart types.
	*          This method mutates the sap.apf.modeler.ui.controller.representation#mDataset.oPropertyDataset based on the chart type which is passed.
	*          Removes and hides Sort properties if "sortable" is set to false in the metadata of the chart type.
	* */
	_updateSortDatasetByChartType : function(sChartName) {
		var oRepMetadata = this._getRepresentationMetadata()[sChartName];
		if (oRepMetadata.sortable !== undefined && !oRepMetadata.sortable) {
			var aAllProperties = this.aSelectProperties.slice();
			aAllProperties.unshift({
				sName : this.getText("none")
			});
			this.mDataset.oSortDataset.aSortRows = [ {
				aAllProperties : aAllProperties,
				sDirection : this.getText("ascending")
			} ];
			this.byId("idSortLayout").setVisible(false);
			this.byId("idSorting").setVisible(false);
		} else {
			this.byId("idSortLayout").setVisible(true);
			this.byId("idSorting").setVisible(true);
			// <-- Work around to resolve data binding issue while changing visibility. -->
			this.mModel.oSortModel.updateBindings();
			var oSortLayout = this.byId("idSortLayout");
			jQuery.sap.delayedCall(10, oSortLayout, oSortLayout.rerender);
			// <-- Work around to resolve data binding issue while changing visibility. -->
		}
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_setPropertiesFromCurrentDataset
	* @description This function is called on every change event related to properties to adhere to WYSIWYG principle.
	*          Sets new values on the representation object based on the current property model.
	*          Clears the old values from representation object.
	*          Sets new values by iterating through the current property data set.
	* */
	_setPropertiesFromCurrentDataset : function() {
		var oSelf = this;
		// Clear all properties from representation
		var sDimensions = this.oRepresentation.getDimensions();
		sDimensions.forEach(function(sDimension) {
			oSelf.oRepresentation.removeDimension(sDimension);
		});
		var sMeasures = this.oRepresentation.getMeasures();
		sMeasures.forEach(function(sMeasure) {
			oSelf.oRepresentation.removeMeasure(sMeasure);
		});
		// Loop through current dataset and set properties on representation
		this.mDataset.oPropertyDataset.aPropertyRows.forEach(function(oPropertyRow) {
			var sSelectedProperty = oPropertyRow.sSelectedProperty || (oPropertyRow.aAllProperties.length && oPropertyRow.aAllProperties[0].sName);
			if (sSelectedProperty && sSelectedProperty !== oSelf.getText("none")) {
				var sAggregationRole = oPropertyRow.sAggregationRole;
				var sAggregationRoleCamelCase = [ sAggregationRole.charAt(0).toUpperCase(), sAggregationRole.substring(1) ].join("");
				var sDefaultLabel = oSelf.oEntityMetadata.getPropertyMetadata(sSelectedProperty).label;
				var sLabelValue = oPropertyRow.sLabel;
				var sLabelId;
				if (sLabelValue && sLabelValue !== sDefaultLabel) { //if the label exists and it is not same as default label
					var oTranslationFormat = sap.apf.modeler.ui.utils.TranslationFormatMap.REPRESENTATION_LABEL;
					sLabelId = oSelf.oTextPool.setText(sLabelValue, oTranslationFormat);
				}
				var sAddMethodName = [ "add", sAggregationRoleCamelCase ].join("");
				var sSetKindMethondName = [ "set", sAggregationRoleCamelCase, "Kind" ].join("");
				var sSetTextLabelKeyMethodName = [ "set", sAggregationRoleCamelCase, "TextLabelKey" ].join("");
				oSelf.oRepresentation[sAddMethodName](sSelectedProperty);
				oSelf.oRepresentation[sSetKindMethondName](sSelectedProperty, oPropertyRow.sKind);
				oSelf.oRepresentation[sSetTextLabelKeyMethodName](sSelectedProperty, sLabelId);
			} else {
				oPropertyRow.sLabel = "";//clear the label for "None" from the model, from the property row
				oPropertyRow.sSelectedProperty = oSelf.getText("none");//set the selected property to "none" in the model, from the property row
			}
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_setSortFieldsFromCurrentDataset
	* @description This function is called on every change event related to sort layout to adhere to WYSIWYG principle.
	* Sets new values on the representation object based on the current property model.
	* Clears the old values from representation object.
	* Sets new values by iterating through the current sort data set.
	* */
	_setSortFieldsFromCurrentDataset : function() {
		var oSelf = this;
		// Clears current orderBy properties
		this.oRepresentation.getOrderbySpecifications().forEach(function(oOrderBySpec) {
			oSelf.oRepresentation.removeOrderbySpec(oOrderBySpec.property);
		});
		// Loop through current sort model and set orderby properties accordingly.
		this.mDataset.oSortDataset.aSortRows.forEach(function(oSortRow) {
			var sSortProperty = oSortRow.sSortProperty || (oSortRow.aAllProperties.length && oSortRow.aAllProperties[0].sName);
			if (sSortProperty && sSortProperty !== oSelf.getText("none")) {
				var bAscending = !oSortRow.sDirection || (oSortRow.sDirection === oSelf.getText("ascending"));
				oSelf.oRepresentation.addOrderbySpec(sSortProperty, bAscending);
			}
		});
	},
	/**
	* @private
	* @function
	* @name sap.apf.modeler.ui.controller.representation#_getRepresentationMetadata
	* @description Returns the representation metadata by using the getRepresentationTypes API
	* */
	_getRepresentationMetadata : function() {
		var oRepMetadata = {};
		this.getRepresentationTypes().forEach(function(representationType) {
			if (representationType.metadata) {
				oRepMetadata[representationType.id] = representationType.metadata;
			}
		});
		return oRepMetadata;
	}
});