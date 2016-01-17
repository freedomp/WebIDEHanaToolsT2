jQuery.sap.declare("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.ConfigureTileStep");
jQuery.sap.require("sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent");
jQuery.sap.require("sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.controls.CustomTile");

/* eslint-disable no-use-before-define */
var configureTileStep = function() {

	var oContext;
	var oModel;
	var that = null;
	var customTileModel;
	var oDataSet;
	var titleTextField;
	var subtitleTextField;
	var iconTextfield;
	var iconBrowseButton;
	var typeDropdownbox;
	var collectionLabel;
	var collectionDropdownbox;
	var numberUnitLabel;
	var numberUnitTextField;
	var refreshRateLabel;
	var refreshRateTextField;
	var serviceUrlLabel;
	var serviceUrlTextfield;
	var serviceUrlButton;
	var appRelativeServiceUrl = null;
	var destinationName = null;
	var count = "";
	var oMetadata;
	var DESTINATIONS = "/destinations/";

	/*
	 * Initializes the step and creates its UI.
	 * Happens once when the wizard is opened.
	 */
	  /* eslint-disable max-statements */
	var _init = function() {
	  /* eslint-enable max-statements */
		that = this;

		sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.hcp.fiorilaunchpad/ui/css/FioriLaunchpad.css"));

		var typeLabel = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>ConfigureTileStep_Type}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		typeDropdownbox = new sap.ui.commons.DropdownBox({
			width: "100%",
			tooltip: "{i18n>ConfigureTileStep_TypeTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M10 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});

		typeDropdownbox.attachChange(function(oEvent) {
			if (!oEvent.getParameter("selectedItem")) {
				return;
			}

			//var selectedTiletype = oEvent.getParameter("selectedItem").getModel();
			var selectedTiletype = oEvent.getParameter("selectedItem").getModel().getData().modelData;
			// update the model
			oModel.getData().selectedTiletype = selectedTiletype.type;

			// update the custom tile
			updateCustomTile(titleTextField.getValue(), subtitleTextField.getValue(), iconTextfield.getValue(), count, numberUnitTextField.getValue(),
				oModel.getData().selectedTiletype);

			if (selectedTiletype.type === "DynamicTile") {

				that.fireProcessingStarted(); // start the progress bar

				if (appRelativeServiceUrl === null) {
					// get the relative OData service URL of the application
					oContext.service.fioriodata.getServiceUrl(oModel.getData().oProjectDocument.getEntity().getFullPath(), "OData").then(function(
						sRelativeServiceUrl) {
						if (sRelativeServiceUrl && sRelativeServiceUrl.length > 0) {
							appRelativeServiceUrl = sRelativeServiceUrl;

							// make sure the service url starts and ends with "/"
							addSlashesToServiceURL();

							// update the model
							oModel.getData().relativeServiceUrl = appRelativeServiceUrl;

							if (destinationName === null) {
								// get the destination name using the Neoapp service.
								// update the 'destinationName' variable. sets it to null if not found or fails
								fetchDestinationName().then(function() {
									if (destinationName === null) {
										handleMissingDestination();
									} else {
										// found the destination name
										executeODataRequests(appRelativeServiceUrl, false).done();
									}
								}).done();
							} else {
								// destinationName already set
								executeODataRequests(appRelativeServiceUrl, false).done();
							}
						} else {
							handleMissingServiceUrl();
						}
					}).fail(function() {
						handleMissingServiceUrl();
					}).done();
				} else {
					serviceUrlButton.setEnabled(false);
					showDynamicFields();
					that.fireProcessingEnded(); // stop the progress bar
				}
			} else { // "Static"
				hideDynamicFields();
				hideServiceUrlField();

				var res = validateTitle(titleTextField.getValue());
				if (res.isValid === false) {
					handleInvalidTitle(res);
				} else {
					that.fireValidation({
						isValid: true,
						message: ""
					});
				}
			}
		});

		var addSlashesToServiceURL = function() {
			// make sure the service url starts with "/"
			if (appRelativeServiceUrl.charAt(0) !== "/") {
				appRelativeServiceUrl = "/" + appRelativeServiceUrl;
			}
			// make sure the service url ends with "/"
			if (appRelativeServiceUrl.charAt(appRelativeServiceUrl.length - 1) !== "/") {
				appRelativeServiceUrl = appRelativeServiceUrl + "/";
			}
		};

		// service url was not found - show the service url controls and notify the user
		var handleMissingServiceUrl = function() {
			showDynamicFields();
			showServiceUrlField();

			that.fireValidation({
				isValid: false,
				message: oContext.i18n.getText("i18n", "ConfigureTileStep_ServiceUrlErrorMessage"),
				severity: "info"
			});

			that.fireProcessingEnded(); // stop the progress bar
		};

		var hideDynamicFields = function() {
			collectionLabel.setVisible(false);
			collectionDropdownbox.setVisible(false);
			numberUnitLabel.setVisible(false);
			numberUnitTextField.setVisible(false);
			refreshRateLabel.setVisible(false);
			refreshRateTextField.setVisible(false);
		};

		var typeContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [typeLabel, typeDropdownbox]
		});

		var titleLabel = new sap.ui.commons.Label({
			required: true,
			text: "{i18n>ConfigureTileStep_Title}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M3 S12"
			})
		}).addStyleClass("wizardBody");

		titleTextField = new sap.ui.commons.TextField({
			value: "{/title}",
			width: "100%",
			tooltip: "{i18n>ConfigureTileStep_TitleTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M10 S12"
			}),
			liveChange: function(oEvent) {
				handleTitle(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var validateTitle = function(liveValue) {
			var result = {};

			if (liveValue.length === 0) {
				result.isValid = false;
				result.message = that.getContext().i18n.getText("i18n", "ConfigureTileStep_EmptyTitleInfoMsg");
				result.severity = "info";
				return result;
			}

			result.isValid = true;

			return result;
		};

		var handleTitle = function(oEvent) {
			that.markAsValid(titleTextField);
			var liveValue = oEvent.getParameter("liveValue");

			var validationResult = validateTitle(liveValue);
			if (validationResult.isValid === false) {

				handleInvalidTitle(validationResult);

				// update the custom tile
				updateCustomTile(liveValue, subtitleTextField.getValue(), iconTextfield.getValue(), count, numberUnitTextField.getValue(), oModel.getData()
					.selectedTiletype);

				return;
			}

			that.fireValidation({
				isValid: true
			});

			// notify the wizard on the title - for the summary text in the finish step
			that.fireValueChange({
				id: "Title",
				value: liveValue
			});

			// update the custom tile
			updateCustomTile(liveValue, subtitleTextField.getValue(), iconTextfield.getValue(), count, numberUnitTextField.getValue(), oModel.getData()
				.selectedTiletype);
		};

		var handleInvalidTitle = function(validationResult) {
			that.fireValidation({
				isValid: false,
				message: validationResult.message,
				severity: validationResult.severity
			});

			if (validationResult.severity === "error") {
				that.markAsInvalid(titleTextField);
			}
		};

		var titleContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [titleLabel, titleTextField]
		});

		var subtitleLabel = new sap.ui.commons.Label({
			text: "{i18n>ConfigureTileStep_Subtitle}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		subtitleTextField = new sap.ui.commons.TextField({
			value: "{/subtitle}",
			width: "100%",
			tooltip: "{i18n>ConfigureTileStep_SubtitleTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M10 S12"
			}),
			liveChange: function(oEvent) {
				handleSubtitle(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var handleSubtitle = function(oEvent) {
			that.markAsValid(subtitleTextField);
			var liveValue = oEvent.getParameter("liveValue");

			// update the custom tile
			updateCustomTile(titleTextField.getValue(), liveValue, iconTextfield.getValue(), count, numberUnitTextField.getValue(), oModel.getData()
				.selectedTiletype);
		};

		var subtitleContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [subtitleLabel, subtitleTextField]
		});

		var iconLabel = new sap.ui.commons.Label({
			text: "{i18n>ConfigureTileStep_Icon}",
			textAlign: "Left",
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		iconTextfield = new sap.ui.commons.TextField({
			value: "{/icon}",
			enabled: false,
			width: "100%",
			tooltip: "{i18n>ConfigureTileStep_IconTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M10 S12"
			}),
			change: function(oEvent) {
				handleIcon(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var handleIcon = function(oEvent) {
			that.markAsValid(iconTextfield);
			var newValue = oEvent.getParameter("newValue");

			// update the custom tile
			updateCustomTile(titleTextField.getValue(), subtitleTextField.getValue(), newValue, count, numberUnitTextField.getValue(), oModel.getData()
				.selectedTiletype);
		};

		iconBrowseButton = new sap.ui.commons.Button({
			text: "{i18n>ConfigureTileStep_BrowseButton}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S4"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Button
		});

		iconBrowseButton.attachPress(function() {
			oContext.service.ui5icons.openIconDialog().then(function(oResult) {
				if (oResult.accepted) {
					var newIcon = "sap-icon://" + oResult.icon;
					iconTextfield.setValue(newIcon);
					iconTextfield.fireChange({
						newValue: newIcon
					});
				}
			}).done();
		});

		var iconLabelContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [iconLabel, iconTextfield, iconBrowseButton]
		});

		serviceUrlLabel = new sap.ui.commons.Label({
			text: "{i18n>ConfigureTileStep_ServiceUrl}",
			textAlign: "Left",
			visible: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		serviceUrlTextfield = new sap.ui.commons.TextField({
			value: "{/serviceUrl}",
			width: "100%",
			visible: false,
			tooltip: "{i18n>ConfigureTileStep_ServiceUrlTooltip}",
			liveChange: function(oEvent) {
				serviceUrlTextFieldChanged(oEvent);
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L5 M10 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var serviceUrlTextFieldChanged = function(oEvent) {
			var liveValue = oEvent.getParameter("liveValue");
			serviceUrlTextfield.setValue(liveValue);
			if (liveValue.length === 0) {
				serviceUrlButton.setEnabled(false);

				// disable the Next button
				that.fireValidation({
					isValid: false
				});

			} else {
				serviceUrlButton.setEnabled(true);
			}
		};

		serviceUrlButton = new sap.ui.commons.Button({
			text: "{i18n>ConfigureTileStep_ServiceUrlButton}",
			width: "100%",
			visible: false,
			enabled: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S4"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Button
		});

		serviceUrlButton.attachPress(function() {
			that.fireProcessingStarted(); // start the progress bar

			appRelativeServiceUrl = serviceUrlTextfield.getValue();

			// make sure the service url starts and ends with "/"
			addSlashesToServiceURL();

			// update the model
			oModel.getData().relativeServiceUrl = appRelativeServiceUrl;

			if (destinationName === null) {
				fetchDestinationName().then(function() {
					if (destinationName === null) {
						handleMissingDestination();
					} else {
						executeODataRequests(appRelativeServiceUrl, true).done();
					}
				}).done();
			} else {
				executeODataRequests(appRelativeServiceUrl, true).done();
			}
		});

		var serviceUrlContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [serviceUrlLabel, serviceUrlTextfield, serviceUrlButton]
		});

		collectionLabel = new sap.ui.commons.Label({
			text: "{i18n>ConfigureTileStep_Collection}",
			textAlign: "Left",
			visible: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		collectionDropdownbox = new sap.ui.commons.DropdownBox({
			width: "100%",
			visible: false,
			tooltip: "{i18n>ConfigureTileStep_CollectionTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M10 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Combobox
		});

		collectionDropdownbox.attachChange(function(oEvent) {
			if (!oEvent.getParameter("selectedItem")) {
				return;
			}

			that.fireProcessingStarted(); // start the progress bar

			var selectedCollection = oEvent.getParameter("selectedItem").getText();
			// update the model
			oModel.getData().collection = selectedCollection;

			var relativeUrlWithDestination = DESTINATIONS + destinationName + appRelativeServiceUrl;

			// execute a request for count
			oContext.service.odataProvider.getEntitySetCount(relativeUrlWithDestination, selectedCollection).then(function(resCount) {
				// update count
				count = resCount;

				// set default value numberunit.
				return setNumberUnitValue(oMetadata, selectedCollection).fin(function() {
					// update tile
					updateCustomTile(titleTextField.getValue(), subtitleTextField.getValue(), iconTextfield.getValue(), count,
						numberUnitTextField.getValue());

					var res = validateTitle(titleTextField.getValue());
					if (res.isValid === false) {
						handleInvalidTitle(res);
					} else {
						that.fireValidation({
							isValid: true,
							message: ""
						});
					}

					that.markAsValid(collectionDropdownbox);

					that.fireProcessingEnded(); // stop the progress bar
				});
			}).fail(function(oError) {
				// the call for the count has failed
				that.fireValidation({
					isValid: false,
					message: oContext.i18n.getText("i18n", "ConfigureTileStep_CountErrorMessage", [oError.response.requestUri]),
					severity: "error"
				});

				that.markAsInvalid(collectionDropdownbox);

				that.fireProcessingEnded(); // stop the progress bar
			}).done();
		});

		var collectionContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [collectionLabel, collectionDropdownbox]
		});

		numberUnitLabel = new sap.ui.commons.Label({
			text: "{i18n>ConfigureTileStep_NumberUnit}",
			textAlign: "Left",
			visible: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		numberUnitTextField = new sap.ui.commons.TextField({
			value: "{/numberunit}",
			width: "100%",
			visible: false,
			tooltip: "{i18n>ConfigureTileStep_NumberUnitTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M10 S12"
			}),
			liveChange: function(oEvent) {
				handleNumberUnit(oEvent);
			},
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		var handleNumberUnit = function(oEvent) {
			that.markAsValid(numberUnitTextField);
			var liveValue = oEvent.getParameter("liveValue");

			// update the custom tile
			updateCustomTile(titleTextField.getValue(), subtitleTextField.getValue(), iconTextfield.getValue(), count, liveValue);
		};

		var numberUnitContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [numberUnitLabel, numberUnitTextField]
		});

		refreshRateLabel = new sap.ui.commons.Label({
			text: "{i18n>ConfigureTileStep_RefreshRate}",
			textAlign: "Left",
			visible: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S12"
			})
		}).addStyleClass("wizardBody");

		refreshRateTextField = new sap.ui.commons.TextField({
			value: "{/refreshrate}",
			width: "100%",
			visible: false,
			tooltip: "{i18n>ConfigureTileStep_RefreshRateTooltip}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M10 S12"
			}),
			accessibleRole: sap.ui.core.AccessibleRole.Textbox
		});

		refreshRateTextField.attachBrowserEvent("keypress", function(e) {
			var keyCodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8]; // array of ASCII values ranging from 0 to 9
			if (!($.inArray(e.which, keyCodes) >= 0)) {
				e.preventDefault();
			}
		});

		var refreshRateContent = new sap.ui.layout.Grid({
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			content: [refreshRateLabel, refreshRateTextField]
		});

		var data = {
			tile: []
		};

		var sTitle = "Title";
		var sSubtitle = "Subtitle";
		var sIcon = "sap-icon://approvals";
		var sCount = "";
		var sNumberunit = "";

		var oTile = {
			title: sTitle,
			subtitle: sSubtitle,
			icon: sIcon,
			count: sCount,
			numberunit: sNumberunit
		};

		data.tile.push(oTile);

		customTileModel = new sap.ui.model.json.JSONModel();
		customTileModel.setData(data);

		function createTemplate() {
			var c = sap.ui.commons;
			return new sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.controls.CustomTile({
				title: new c.Label({
					text: "{title}",
					wrapping: true
				}).addStyleClass('customTileText'),
				subtitle: new c.Label({
					text: "{subtitle}",
					wrapping: true
				}).addStyleClass('customTileText'),
				button: new c.Button({
					icon: "{icon}"
				}).addStyleClass('customTileIcon'),
				count: new c.Label({
					text: "{count}",
					wrapping: true
				}).addStyleClass('customTileCount'),
				numberunit: new c.Label({
					text: "{numberunit}",
					wrapping: true
				}).addStyleClass('customTileNumberUnit')
			});
		}

		oDataSet = new sap.ui.ux3.DataSet({
			width: "100%",
			showSearchField: false,
			showToolbar: false,
			items: {
				path: "/tile",
				template: new sap.ui.ux3.DataSetItem({
					title: "{title}",
					subtitle: "{subtitle}",
					iconSrc: "{icon}",
					count: "{count}",
					numberunit: "{numberunit}"
				})
			},
			views: [
            		new sap.ui.ux3.DataSetSimpleView({
					name: "Floating, non-responsive View",
					floating: true,
					responsive: false,
					template: createTemplate()
				})
            ],
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S12",
				indent: "L1 M1 S2"
			})
		}).addStyleClass("DataSet");

		oDataSet.setModel(customTileModel);

		var fieldsGrid = new sap.ui.layout.Grid({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L7 M8 S12",
				linebreak: true
			}),
			vSpacing: 0,
			content: [typeContent, titleContent, subtitleContent, iconLabelContent, serviceUrlContent, collectionContent, numberUnitContent,
				refreshRateContent]
		});

		var mainGrid = new sap.ui.layout.Grid({
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			content: [fieldsGrid, oDataSet]
		});

		this.addContent(mainGrid);
	};

	var handleMissingAddressableEntitySets = function() {
		that.fireValidation({
			isValid: false,
			message: oContext.i18n.getText("i18n", "ConfigureTileStep_NoAddressableCollectionsErrorMessage", [appRelativeServiceUrl]),
			severity: "error"
		});

		that.markAsInvalid(collectionDropdownbox);
		that.fireProcessingEnded(); // stop the progress bar
	};

	var showDynamicFields = function() {
		collectionLabel.setVisible(true);
		collectionDropdownbox.setVisible(true);
		numberUnitLabel.setVisible(true);
		numberUnitTextField.setVisible(true);
		refreshRateLabel.setVisible(true);
		refreshRateTextField.setVisible(true);
	};
    /* eslint-disable max-params */
	var updateCustomTile = function(titleValue, subtitleValue, iconValue, countValue, numberUnitValue, type) {
    /* eslint-enable max-params */
		var data = {
			tile: []
		};

		if (type === "StaticTile") {
			countValue = "";
			numberUnitValue = "";
		}

		var oTile = {
			title: titleValue,
			subtitle: subtitleValue,
			icon: iconValue,
			count: countValue,
			numberunit: numberUnitValue
		};

		data.tile.push(oTile);

		customTileModel = new sap.ui.model.json.JSONModel();
		customTileModel.setData(data);
		oDataSet.setModel(customTileModel);
		oDataSet.rerender();
	};

	var handleMissingDestination = function() {
		that.fireValidation({
			isValid: false,
			message: oContext.i18n.getText("i18n", "ConfigureTileStep_NoDestinationErrorMessage", [appRelativeServiceUrl]),
			severity: "error"
		});

		that.fireProcessingEnded(); // stop the progress bar
	};

	var _cleanStep = function() {
		count = "";
		appRelativeServiceUrl = null;
	};

	var populateTileTypes = function() {
		if (typeDropdownbox.getItems().length > 0) {
			typeDropdownbox.removeAllItems();
		}

		var listItem = new sap.ui.core.ListItem({
			text: oContext.i18n.getText("i18n", "ConfigureTileStep_Static"),
			data: {
				type: "StaticTile"
			}
		});

		var oListModel = new sap.ui.model.json.JSONModel();
		oListModel.setData({
			modelData: {
				type: "StaticTile"
			}
		});

		listItem.setModel(oListModel);

		typeDropdownbox.addItem(listItem);

		listItem = new sap.ui.core.ListItem({
			text: oContext.i18n.getText("i18n", "ConfigureTileStep_Dynamic"),
			data: {
				type: "DynamicTile"
			}
		});

		oListModel = new sap.ui.model.json.JSONModel();
		oListModel.setData({
			modelData: {
				type: "DynamicTile"
			}
		});
		listItem.setModel(oListModel);
		typeDropdownbox.addItem(listItem);

		typeDropdownbox.fireChange({
			"selectedItem": typeDropdownbox.getItems()[0]
		});
	};

	/*
	 * Get the metadata of the service, fills the collections dropdown
	 * and send a request to get the count of the first collection
	 */
	var executeODataRequests = function(appRelServiceUrl, comingFromServiceUrlButton) {

		// the collections are already filled
		if (collectionDropdownbox.getItems().length > 0) {
			if (!comingFromServiceUrlButton) {
				serviceUrlButton.setEnabled(false);
				showDynamicFields();
				that.fireProcessingEnded(); // stop the progress bar
				return Q();
			}

			collectionDropdownbox.removeAllItems();
		}

		var relativeUrlWithDestination = DESTINATIONS + destinationName + appRelServiceUrl;

		// get the metadata
		return oContext.service.odataProvider.getMetadata(relativeUrlWithDestination).then(function(metadata) {
			// set metadata
			oMetadata = metadata;

			// get the addressable entity sets
			return oContext.service.odataProvider.getAddressableEntitySets(metadata).then(function(addressableEntitySets) {

				if (addressableEntitySets.length === 0) { // no addressable entity sets
					handleMissingAddressableEntitySets();
					return;
				}

				that.markAsValid(collectionDropdownbox);

				// fill the collections drop down with the addressable collections
				var oItem = null;
				for (var i = 0; i < addressableEntitySets.length; i++) {
					oItem = new sap.ui.core.ListItem();
					oItem.setText(addressableEntitySets[i].name);
					oItem.setModel(addressableEntitySets[i]);
					oItem.setKey(i);
					collectionDropdownbox.addItem(oItem);
				}

				var selectedCollectionName = collectionDropdownbox.getItems()[0].getText();
				// update the model
				oModel.getData().collection = selectedCollectionName;

				oContext.service.odataProvider.getEntitySetCount(relativeUrlWithDestination, selectedCollectionName).then(function(resCount) {
					// update count
					count = resCount;

					// set value of the numberunit field
					setNumberUnitValue(metadata, selectedCollectionName).fin(function() {
						// update the tile
						updateCustomTile(titleTextField.getValue(), subtitleTextField.getValue(), iconTextfield.getValue(), count,
							numberUnitTextField.getValue());
					}).done();

					// disable the "Get Collections" button
					serviceUrlButton.setEnabled(false);

					showDynamicFields();

					that.fireValidation({
						isValid: true,
						message: "",
						severity: "info"
					});

					that.fireProcessingEnded(); // stop the progress bar
				}).fail(function(oError) {
					// the call for the count has failed
					that.fireValidation({
						isValid: false,
						message: oContext.i18n.getText("i18n", "ConfigureTileStep_CountErrorMessage", [oError.response.requestUri]),
						severity: "error"
					});

					that.markAsInvalid(collectionDropdownbox);
					that.fireProcessingEnded(); // stop the progress bar
					return;
				});
			}).fail(function(oError) {
				// the request for the addressable entity sets has failed
				that.fireValidation({
					isValid: false,
					message: oContext.i18n.getText("i18n", "ConfigureTileStep_CountErrorMessage", [oError.response.requestUri]),
					severity: "error"
				});

				that.fireProcessingEnded(); // stop the progress bar
			});
		}).fail(function() {
			// the request for the metadata has failed
			that.fireValidation({
				isValid: false,
				message: oContext.i18n.getText("i18n", "ConfigureTileStep_CountErrorMessage", [serviceUrlTextfield.getValue()]),
				severity: "error"
			});

			that.fireProcessingEnded(); // stop the progress bar
		});
	};

	// set value of the numberunit field
	var setNumberUnitValue = function(metadata, selectedCollectionName) {
		return oContext.service.odataProvider.getEntitySet(metadata, selectedCollectionName).then(function(oEntitySet) {
			return oContext.service.odataProvider.getEntityType(metadata, oEntitySet).then(function(oEntityType) {
				numberUnitTextField.setValue(oEntityType.name);
			});
		});
	};

	var showServiceUrlField = function() {
		serviceUrlLabel.setVisible(true);
		serviceUrlTextfield.setVisible(true);
		serviceUrlButton.setVisible(true);
	};

	var hideServiceUrlField = function() {
		serviceUrlLabel.setVisible(false);
		serviceUrlTextfield.setVisible(false);
		serviceUrlButton.setVisible(false);
	};

	var fetchDestinationName = function() {
		// get the destination name of the destination with path /sap/opu/odata configured in the neo-app of the application
		return oContext.service.neoapp.getDestinations(oModel.getData().oProjectDocument).spread(function(oNeoappDocument, oNeoappContent) {
			var routes = oNeoappContent.routes;
			for (var j = 0; j < routes.length; j++) {
				// check if the service url contains the path of this destination
				// i.e. whether /sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT contains /sap/opu/odata
				if (appRelativeServiceUrl.indexOf(routes[j].path) >= 0) {
					destinationName = routes[j].target.name;
					return;
				}
			}

			// there's no such destination
			destinationName = null;
		}).fail(function() {
			// failed to get the destinations
			destinationName = null;
		});
	};

	var _onAfterRendering = function() {
		oContext = this.getContext();
		oModel = this.getModel();

		// init the text fields with default values
		if (!oModel.getData().icon) {
			oModel.getData().icon = "sap-icon://approvals";
			oModel.getData().title = "Title";
			oModel.getData().subtitle = "Subtitle";
			oModel.getData().refreshrate = 10;
			oModel.refresh();

			updateCustomTile(titleTextField.getValue(), subtitleTextField.getValue(), iconTextfield.getValue(), count, numberUnitTextField.getValue());

			this.fireValidation({
				isValid: true
			});

			populateTileTypes();
		}
	};

	return {
		init: _init,
		onAfterRendering: _onAfterRendering,
		cleanStep: _cleanStep,
		metadata: {
			properties: {
				"wizardControl": "object",
				"iconDialog": "object"
			}
		},
		setFocusOnFirstItem: function() {
			titleTextField.focus();
		},
		renderer: {}
	};
}();

/* eslint-enable no-use-before-define */

sap.watt.ideplatform.plugin.template.ui.wizard.WizardStepContent.extend(
	"sap.watt.saptoolsets.fiori.hcp.plugin.fiorilaunchpad.ui.steps.ConfigureTileStep", configureTileStep);