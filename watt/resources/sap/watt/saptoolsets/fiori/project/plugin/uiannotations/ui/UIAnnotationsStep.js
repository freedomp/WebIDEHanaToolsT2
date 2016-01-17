/**************************************************************************
*                          DEPRECATED!                                    *
* Old version of UI Annotations Step. Should not be used anymore!         *
***************************************************************************/

jQuery.sap.declare("sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.UIAnnotationsStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend("sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.UIAnnotationsStep", {

//	selectSystemMsg : "Select the system containing the UI Annotations file",
//	provideUrlMsg : "Provide a URL for the UI Annotations file",
//	relativeUrlMsg : "The URL for the UI Annotations file must be relative to the selected system",
//	invalidFileMsg : "The URL provided must point to a valid UI Annotations file within the selected system",

	selectSystemMsg : undefined,
	provideUrlMsg : undefined,
	relativeUrlMsg : undefined,
	invalidFileMsg : undefined,

	init : function() {

		var that = this;
		this.bLoadDestinations = false;
		this.bAlreadyLoaded = false;

		var oDestinationsLabel = new sap.ui.commons.TextView({
			text : "{i18n>uiAnnotationsStep_system}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M4 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		this._oDestinationsDropdownBox = new sap.ui.commons.DropdownBox({
			width : "100%",
			change : [ that._validateAnnotations, that ],
			layoutData : new sap.ui.layout.GridData({
				span : "L7 M8 S12"
			})
		});

		var oAnnotationsUrlLabel = new sap.ui.commons.TextView({
			text : "{i18n>uiAnnotationsStep_fileUrl}",
			textAlign : "Left",
			layoutData : new sap.ui.layout.GridData({
				span : "L2 M4 S12",
				linebreak : true
			})
		}).addStyleClass("wizardBody");

		this._oAnnotationsUrlTextField = new sap.ui.commons.TextField({
			value : "",
			width : "100%",
			change : function(oEvent) {
				that._validateAnnotations(oEvent).fail(/*No failure handling is needed here*/);
			},
			layoutData : new sap.ui.layout.GridData({
				span : "L7 M8 S12"
			})
		});

		var annotationsContent = new sap.ui.layout.Grid({
			layoutData : new sap.ui.layout.GridData({
				span : "L12 M12 S12",
				linebreak : true
			}),
			content : [ oDestinationsLabel, this._oDestinationsDropdownBox, oAnnotationsUrlLabel, this._oAnnotationsUrlTextField ]
		});

		this.addContent(annotationsContent);
	},

	setDestinations : function(aDestinationConnections) {
		var that = this;
		if (aDestinationConnections !== undefined) {
			aDestinationConnections.forEach(function(oConnection) {
				that._oDestinationsDropdownBox.addItem(new sap.ui.core.ListItem({
					text : oConnection.name
				}).data("connection", oConnection));
			});
		}
		this.fireProcessingEnded();
		this.bLoadDestinations = true;
	},

	_loadSystems : function() {
		var that = this;
		this.getContext().service.destination.getDestinations().then(function(aDestinations) {
			that.setDestinations(that._getFormattedConnections(aDestinations));
		}).fail(function() {
			that.setDestinations(undefined);
		});
	},

	_getFormattedConnections : function(aDestinations) {
		var that = this;
		var aFormattedDestinations = [];
		var aFilteredDestination = [];
		if (aDestinations) {
			aFilteredDestination = aDestinations.filter(function(oValue) {
				return (oValue.wattUsage === "bsp_execute_abap");
			});
			aFilteredDestination.forEach(function(oConnection) {
				aFormattedDestinations.push({
					name : oConnection.description,
					type : oConnection.wattUsage,
					destination : oConnection
				});
			});
		}
		return aFormattedDestinations;
	},

	_validateAnnotations : function(oEvent) {
		var that = this;
		var bValueChanged;
		var oDeferred = Q.defer();

		var sAnnotationURI = this._oAnnotationsUrlTextField.getValue().trim();
		var oSelectedDestinationItem = this._getSelectedItem(this._oDestinationsDropdownBox);

		if (oEvent !== undefined) {
			if (oEvent.getSource() === this._oAnnotationsUrlTextField) {
				// URL Text Field was changed
				sAnnotationURI = oEvent.getParameter("newValue").trim();
				oEvent.getSource().setValue(sAnnotationURI);
			} else {
				// Destination ComboBox was changed
				oSelectedDestinationItem = oEvent.getParameter("selectedItem");
				if (this._oDestinationsDropdownBox.getValue === "") {
					// Mark destination as valid after changed from empty value
					this.markAsValid(this._oDestinationsDropdownBox);
				}
			}
			bValueChanged = true;
		} else {
			// Validation called with no UI change
			bValueChanged = false;
		}

		var oConnection;
		if (oSelectedDestinationItem) {
			oConnection = oSelectedDestinationItem.data("connection");
		} else {
			oConnection = null;
		}

		// Start validation:
		if (oConnection === undefined || oConnection === null) {
			oDeferred.reject(this.selectSystemMsg);
			this._handleInvalidDestination(this.selectSystemMsg);
		} else if (sAnnotationURI.length === 0) {
			oDeferred.reject(this.provideUrlMsg);
			this._handleInvalidAnnotationsUrl(this.provideUrlMsg);
		} else if (sAnnotationURI.charAt(0) !== "/") {
			oDeferred.reject(this.relativeUrlMsg);
			this._handleInvalidAnnotationsUrl(this.relativeUrlMsg);

		} else {
			// Fetch the annotations xml file 
			this.getContext().service.annotation.getAnnotationXML(oConnection.destination, sAnnotationURI).then(
					function(oXMLResponse) {
						if (bValueChanged) {
							// Mark annotation url as valid and save result in the model
							that.markAsValid(that._oAnnotationsUrlTextField);
							var annoFileName = that._getFileNameFromAnnotationsUrl(sAnnotationURI);
							that.getModel().oData.annotationsXML = {
								url : sAnnotationURI,
								destination : oConnection.destination,
								filename : annoFileName,
								content : oXMLResponse
							};
							// Get service from previous step and parse annotation xml to JSON
							var oServiceConnectionData = that.getModel().oData.connectionData;
							if (oServiceConnectionData !== undefined) {
								var serviceUrl = oServiceConnectionData.url;
								var sServiceUrlWithDestination = serviceUrl.replace(oServiceConnectionData.destination.path,
										oServiceConnectionData.destination.url);
								var sAnnotationURIWithDestination = sAnnotationURI.replace(oConnection.destination.path,
										oConnection.destination.url);
								var oODataModel = new sap.ui.model.odata.ODataModel(sServiceUrlWithDestination, {
									annotationURI : sAnnotationURIWithDestination,
									loadAnnotationsJoined : true,
									loadMetadataAsync : false,
									json : true
								});

								var annotationsJSON = oODataModel.getServiceAnnotations();
								if (annotationsJSON) {
									// Add annotations into model
									if (that.getModel().oData.datasource) {
										that.getModel().oData.datasource.uiModel = annotationsJSON;
									} else {
										that.getModel().oData.datasource = {
											uiModel : annotationsJSON
										};
									}
									// Announce model builder that ui annotations was changed 
									//(if not adding json to model - cannot influence on model builder step)
									that.fireValueChange({
										id : "uiAnnotations",
										value : annotationsJSON
									});
								}
							}
						}
						// Got Annotations XML - step is valid
						oDeferred.resolve();
						that.fireValidation({
							isValid : true
						});
					}).fail(function(oError) {
				oDeferred.reject(that.invalidFileMsg);
				that._handleInvalidAnnotationsUrl(that.invalidFileMsg);
			});
		}
		return oDeferred.promise;
	},

	validateStepContent : function() {
		return this._validateAnnotations();
	},

	// For example,for the following url : "/sap/bc/bsp/sap/BSCBN_ANF_SDSLS/BSCBN_SALES_ORDER_SRV_ANNO.xml"
	// the method will return "BSCBN_SALES_ORDER_SRV_ANNO.anno"
	_getFileNameFromAnnotationsUrl : function(sAnnotationURI) {
		var parts = sAnnotationURI.split("/");
		var fileName = parts[parts.length - 1];
		fileName = fileName.replace(/xml/gi, "anno");
		return fileName;
	},

	_handleInvalidAnnotationsUrl : function(sMessage) {
		this.markAsInvalid(this._oAnnotationsUrlTextField);
		this.fireValidation({
			isValid : false,
			message : sMessage
		});
	},

	_handleInvalidDestination : function(sMessage) {
		this.markAsInvalid(this._oDestinationsDropdownBox);
		this.fireValidation({
			isValid : false,
			message : sMessage
		});
	},

	_getSelectedItem : function(oDropdownBox) {
		var selectedItem = undefined;
		var selectedItemId = oDropdownBox.getSelectedItemId();
		var aItems = oDropdownBox.getItems();
		for ( var i = 0; i < aItems.length; i++) {
			if (aItems[i].getId() === selectedItemId) {
				selectedItem = aItems[i];
			}
		}
		return selectedItem;
	},

	setAnnotationsUrl : function(sSelected) {
		this._oAnnotationsUrlTextField.setValue(sSelected);
		this._oAnnotationsUrlTextField.fireChange({
			newValue : sSelected
		});
	},

	renderer : {},

	onAfterRendering : function() {
		this.selectSystemMsg = this.getContext().i18n.getText("i18n", "uiAnnotationsStep_selectSystemMsg");
		this.provideUrlMsg = this.getContext().i18n.getText("i18n", "uiAnnotationsStep_provideUrlMsg");
		this.relativeUrlMsg = this.getContext().i18n.getText("i18n", "uiAnnotationsStep_relativeUrlMsg");
		this.invalidFileMsg = this.getContext().i18n.getText("i18n", "uiAnnotationsStep_invalidFileMsg");

		this.bAlreadyLoaded = true;
		if (!this.bLoadDestinations) {
			this.fireProcessingStarted();
			this._loadSystems();
		}
	},

	setFocusOnFirstItem : function() {
		this._oAnnotationsUrlTextField.focus();
	},

	cleanStep : function() {

		// Clean user input (but keep loaded destinations)
		var aDestinationListItems = this._oDestinationsDropdownBox.getItems();
		if (aDestinationListItems && aDestinationListItems.length > 0) {
			var firstItem = aDestinationListItems[0];
			this._oDestinationsDropdownBox.setSelectedItemId(firstItem.getId());
			this._oDestinationsDropdownBox.setValue(firstItem.text);
		} else {
			this._oDestinationsDropdownBox.setSelectedItemId(undefined);
			this._oDestinationsDropdownBox.setValue("");
		}

		this._oAnnotationsUrlTextField.setValue("");

		// Clean validation marks
		this.clearValidationMarks(this._oAnnotationsUrlTextField);
		this.clearValidationMarks(this._oDestinationsDropdownBox);

		// Clean model
		if (this.getModel()) {
			this.getModel().oData.annotationsXML = undefined;
			if (this.getModel().oData.datasource) {
				this.getModel().oData.datasource.uiModel = undefined;
			}
		}
	},

	onChangeTemplate : function(oEvent) {
		if (this.bAlreadyLoaded) {
			this.cleanStep();
			// clean error messages and make the next button disabled
			this.fireValidation({
				isValid : false,
				message : ""
			});
		}
	},

	onSelectedServiceChange : function(oEvent) {
		if (this.bAlreadyLoaded) {
			this.cleanStep();
			// clean error messages and make the next button disabled
			this.fireValidation({
				isValid : false,
				message : ""
			});
		}
	}

});
