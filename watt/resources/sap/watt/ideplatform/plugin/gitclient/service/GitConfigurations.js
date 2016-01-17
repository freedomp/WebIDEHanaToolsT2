define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig"], function(AbstractConfig) {
	"use strict";
	return AbstractConfig.extend("sap.watt.ideplatform.gitclient.service.GitConfigurations", {
		_oContent: null,
		_oGit: null,

		getProjectSettingContent: function(id, group) {
			var that = this;
			return this.context.service.selection.getSelection().then(function(aSelection) {
				if (aSelection && aSelection[0] && aSelection[0].document && aSelection[0].document.getEntity().getBackendData().git) {
					that._oGit = aSelection[0].document.getEntity().getBackendData().git;
					return that._getAndUpdateRepositoryConfigurations().then(function() {
						return that._oContent;
					});
				} else {
					return that._setMissingConfigurations();
				}
			}).fail(function(oError) {
				that._callMessageDialog(oError); 
			});
		},
		// FIXME meed to be able to load css using config.json
		// 		configure: function() {
		// 			var that = this;
		//             debugger;
		// 			return AbstractConfig.prototype.configure.apply(this, arguments).then(function() {
		// 				if (that._aStyles) {
		// 					return that.context.service.resource.includeStyles(that._aStyles);
		// 				}
		// 			});
		// 		},

		saveProjectSetting: function(id, group) {
			var that = this;
			var aOperationDetails = [];
			var oAddNewLineModel = this._oContent.getModel();
			if (oAddNewLineModel.getProperty("/modelData/isKeyValid") && oAddNewLineModel.getProperty("/modelData/isValueValid")) {
				aOperationDetails.push({
					operation: "add"
				});
			}

			var aMainGridElements = this._oContent.getContent();
			for (var i = 0; i < aMainGridElements.length; i++) {
				var oMainGridElement = aMainGridElements[i];
				if (oMainGridElement.data().grid) {
					var aGridElements = oMainGridElement.getContent();
					for (var j = 0; j < aGridElements.length; j++) {
						var aLineElements = aGridElements[j].getContent();
						for (var k = 0; k < aLineElements.length; k++) {
							var oLineElement = aLineElements[k];
							if (oLineElement.data().value) {
								var sValue = oLineElement.getValue();
								var oValueTextField = oLineElement;
							}
							if (oLineElement.data().lineLayout) {
								var aButtonElements = oLineElement.getContent();
								for (var m = 0; m < aButtonElements.length; m++) {
									var oButtonElement = aButtonElements[m];
									if (oButtonElement.data().save && oButtonElement.getEnabled()) {
										aOperationDetails.push({
											operation: "update",
											index: j,
											value: sValue,
											saveButton: oButtonElement,
											valueTextField: oValueTextField
										});
									}
								}
							}
						}
					}
				}
			}

			var fnSaveConfigurations = function(oOperationDetails) {
				return function() {
					if (oOperationDetails.operation === "add") {
						return that._addAndSaveConfigEntry("saveAll");
					}
					if (oOperationDetails.operation === "update") {
						return that._saveConfigEntry(null, oOperationDetails);
					}
				};
			};

			var oPromise = Q();
			for (i = 0; i < aOperationDetails.length; i++) {
				oPromise = oPromise.then(fnSaveConfigurations(aOperationDetails[i]));
			}

			return oPromise.fin(function() {
				if (aOperationDetails.length > 0) {
					return that._getAndUpdateRepositoryConfigurations();
				}
			});

		},

		_getAndUpdateRepositoryConfigurations: function() {
			var that = this;
			var oModel;
			return that.context.service.git.getRepositoryConfigurations(this._oGit).then(function(
				aConfigurations) {
				if (!aConfigurations || aConfigurations.length === 0) {
					return that._setMissingConfigurations();
				}
				if (!that._oContent) {
					jQuery.sap.includeStyleSheet("resources/sap/watt/ideplatform/plugin/gitclient/css/gitConfigurations.css");
					that._oContent = that._createUI();
					oModel = new sap.ui.model.json.JSONModel();
					oModel.setData({
						"configurations": [],
						"modelData": {
							"key": "",
							"value": "",
							"isKeyValid": false,
							"isValueValid": false,
							"isAddLineVisible": false
						}
					});
					that._oContent.setModel(oModel);
					that.context.i18n.applyTo(that._oContent);
				}
				oModel = that._oContent.getModel();
				//clean the model 
				oModel.setProperty("/configurations", []);
				oModel.setProperty("/configurations", aConfigurations);
				oModel.setProperty("/modelData/isAddLineVisible", false);
			});
		},

		_getLineIndex: function(oEvent) {
			var path = oEvent.getSource().getBindingContext().sPath;
			var aPathSplit = path.split("/");
			return aPathSplit[aPathSplit.length - 1];
		},

		_deleteConfigEntry: function(oEvent) {
			var that = this;
			var index = this._getLineIndex(oEvent);
			// get the parameter list from the model 
			var oModel = this._oContent.getModel();
			var aConfigurations = oModel.getProperty("/configurations");

			this.context.service.git.deleteRepositoryConfiguration(aConfigurations[index]).then(function() {
				// delete the entry from the list
				aConfigurations.splice(index, 1);
				// set back the parameter list to the model
				oModel.setProperty("/configurations", aConfigurations);
			}).fail(function(oError) {
				that._callMessageDialog(oError);
			}).done();
		},

		_editConfigEntry: function(oEvent) {
			var oButtonsHorizontalLayout = oEvent.getSource().getParent();
			var aButtonElements = oButtonsHorizontalLayout.getContent();
			for (var i = 0; i < aButtonElements.length; i++) {
				var oButtonElement = aButtonElements[i];
				if (oButtonElement.data().save) {
					oButtonElement.setEnabled(true);
				}
			}
			var aLineElements = oButtonsHorizontalLayout.getParent().getContent();
			for (i = 0; i < aLineElements.length; i++) {
				var oLineElement = aLineElements[i];
				if (oLineElement.data().value) {
					oLineElement.setEnabled(true);
				}
			}
		},

		_verifyValueInputIsNotEmpty: function(oEvent) {
			var aLineElements = oEvent.getSource().getParent().getContent();
			for (var i = 0; i < aLineElements.length; i++) {
				var oLineElement = aLineElements[i];
				if (oLineElement.data().lineLayout) {
					var aButtonElements = oLineElement.getContent();
					for (var j = 0; j < aButtonElements.length; j++) {
						var oButtonElement = aButtonElements[j];
						if (oButtonElement.data().save) {
							oButtonElement.setEnabled(!!oEvent.getParameter("liveValue"));
							break;
						}
					}
					break;
				}
			}
		},

		_saveConfigEntry: function(oEvent, oOperationDetails) {
			var that = this;
			var index, sValue, oValueTextField, oSaveButton;
			var oModel = this._oContent.getModel();
			var aConfigurations = oModel.getProperty("/configurations");

			if (oOperationDetails) {
				index = oOperationDetails.index;
				sValue = oOperationDetails.value;
				oValueTextField = oOperationDetails.valueTextField;
				oSaveButton = oOperationDetails.saveButton;
			} else {
				index = this._getLineIndex(oEvent);
				var oButtonsHorizontalLayout = oEvent.getSource().getParent();
				var aButtonElements = oButtonsHorizontalLayout.getContent();
				for (var i = 0; i < aButtonElements.length; i++) {
					var oButtonElement = aButtonElements[i];
					if (oButtonElement.data().save) {
						oSaveButton = oButtonElement;
					}
				}
				var aLineElements = oButtonsHorizontalLayout.getParent().getContent();
				for (i = 0; i < aLineElements.length; i++) {
					var oLineElement = aLineElements[i];
					if (oLineElement.data().value) {
						oValueTextField = oLineElement;
						sValue = oLineElement.getValue();
						break;
					}
				}
			}
				var oValue = sValue;
				that.context.service.git.updateRepositoryConfiguration(aConfigurations[index], {
					Value: oValue
				}).then(function() {
					oValueTextField.setEnabled(false);
					oSaveButton.setEnabled(false);
				}).fail(function(oError) {
					that._callMessageDialog(oError);
				});
		},

		_addAndSaveConfigEntry: function(oEvent) {
			var that = this;
			var oAddNewLineModel = this._oContent.getModel();
			return this.context.service.git.setRepositoryConfiguration(that._oGit, {
				Key: oAddNewLineModel.getProperty("/modelData/key"),
				Value: oAddNewLineModel.getProperty("/modelData/value")
			}).then(function() {
				oAddNewLineModel.setProperty("/modelData/isKeyValid", false);
				oAddNewLineModel.setProperty("/modelData/isValueValid", false);
				if (oEvent !== "saveAll") {
					return that._getAndUpdateRepositoryConfigurations();
				}
			}).fail(function(oError) {
				that._callMessageDialog(oError);
			});
		},

		_changeConfigEntryLineState: function() {
			var oAddNewLineModel = this._oContent.getModel();
			var bAddLineVisible = oAddNewLineModel.getProperty("/modelData/isAddLineVisible");
			oAddNewLineModel.setProperty("/modelData/isAddLineVisible", !bAddLineVisible);
			if (!bAddLineVisible) {
				oAddNewLineModel.setProperty("/modelData/key", "");
				oAddNewLineModel.setProperty("/modelData/value", "");
				oAddNewLineModel.setProperty("/modelData/isKeyValid", false);
				oAddNewLineModel.setProperty("/modelData/isValueValid", false);
			}
		},

		_verifyKeyInput: function(oEvent) {
			var oAddNewLineModel = this._oContent.getModel();
			oAddNewLineModel.setProperty("/modelData/isKeyValid", false);
			var sKey = oEvent.getParameter("liveValue");
			if (!sKey) {
				return;
			}
			//Input validation - Verify key contains "." in the middle;
			var isInputValid = new RegExp("[^\\.]+\\.[^\\.]+");
			if (!isInputValid.test(sKey)) {
				return;
			}
			//check duplicate key
			this._oContent.getModel().getProperty("/configurations");
			var aConfigurations = this._oContent.getModel().getProperty("/configurations");
			for (var i = 0; i < aConfigurations.length; i++) {
				if (sKey === aConfigurations[i].Key) {
					return;
				}
			}
			oAddNewLineModel.setProperty("/modelData/isKeyValid", true);
		},

		_verifyValueInput: function(oEvent) {
			this._oContent.getModel().setProperty("/modelData/isValueValid", !!oEvent.getParameter("liveValue"));
		},

		_setMissingConfigurations: function() {
			var oMissingConfigurationslabel = new sap.ui.commons.Label({
				text: "{i18n>git_configuration_no_configurations}"
			});
			this.context.i18n.applyTo(oMissingConfigurationslabel);
			return oMissingConfigurationslabel;
		},

		_callMessageDialog: function(oError) {
			if (!oError.source || oError.source !== "git") {
				throw oError;
			}
			var sDetailedMessage = oError.detailedMessage ? "\n\n" + oError.detailedMessage : "";
			switch (oError.type) {
				case "Warning":
					this.context.service.usernotification.warning(oError.name + sDetailedMessage).done();
					break;
				case "Info":
					this.context.service.usernotification.info(oError.name + sDetailedMessage).done();
					break;
				default:
					//ERROR
					this.context.service.usernotification.alert(oError.name + sDetailedMessage).done();
			}
		},

		_addParamLineTemplate: function() {

			var oKeyLabel = new sap.ui.commons.Label({
				width: "100%",
				text: "{Key}",
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S3"
				})
			});

			var oValueTextField = new sap.ui.commons.TextField({
				width: "100%",
				value: "{Value}",
				enabled: false,
				liveChange: [this._verifyValueInputIsNotEmpty, this],
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				})
			}).data("value", "value").addStyleClass("gitConfigurationTextView");

			var oDeleteEntryButton = new sap.ui.commons.Button({
				icon: "sap-icon://watt/delete",
				lite: true,
				tooltip: "{i18n>git_configuration_delete_tooltip}",
				press: [this._deleteConfigEntry, this],
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			}).addStyleClass("gitConfigurationButtonLiteHover");

			var oEditEntryButton = new sap.ui.commons.Button({
				icon: "sap-icon://edit",
				lite: true,
				tooltip: "{i18n>git_configuration_edit_tooltip}",
				press: [this._editConfigEntry, this],
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			}).addStyleClass("gitConfigurationButtonLiteHover");

			var oSaveEntryButton = new sap.ui.commons.Button({
				icon: "sap-icon://save",
				lite: true,
				tooltip: "{i18n>git_configuration_save_tooltip}",
				press: [this._saveConfigEntry, this],
				enabled: false,
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			}).data("save", "save").addStyleClass("gitConfigurationButtonLiteHover");

			var oButtonsHorizontalLayout = new sap.ui.commons.layout.HorizontalLayout({
				content: [oEditEntryButton, oDeleteEntryButton, oSaveEntryButton],
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S3"
				})
			}).data("lineLayout", "lineLayout");

			var oLineLayout = new sap.ui.layout.Grid({
				width: "100%",
				hSpacing: 0,
				content: [oKeyLabel, oValueTextField, oButtonsHorizontalLayout],
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			return oLineLayout;
		},

		_createUI: function() {
			var that = this;
			var oKeyLabel = new sap.ui.commons.Label({
				text: "{i18n>git_configuration_key}",
				design: "Bold",
				textAlign: "Begin",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S3"
				})
			});

			var oValueLabel = new sap.ui.commons.Label({
				text: "{i18n>git_configuration_value}",
				design: "Bold",
				width: "100%",
				layoutData: new sap.ui.layout.GridData({
					span: "L5 M5 S5"
				})
			});

			// header grid
			var oHeaderGrid = new sap.ui.layout.Grid({
				content: [oKeyLabel, oValueLabel],
				width: "100%",
				vSpacing: 0,
				hSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			});

			// body grid
			var oGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				})
			}).data("grid", "grid");

			//create the template control that will be repeated and will display the data
			var oRowTemplate = this._addParamLineTemplate();

			oGrid.bindAggregation("content", {
				path: "/configurations",
				template: oRowTemplate
			});

			// ADD LINE
			var oAddNewConfigButton = new sap.ui.commons.Button({
				text: {
					path: "isAddLineVisible",
					formatter: function(isAddLineVisible) {
						if (!isAddLineVisible) {
							return that.context.i18n.getText("git_configuration_add_button");
						}
						return that.context.i18n.getText("git_configuration_hide_button");
					}
				},

				tooltip: "{i18n>git_configuration_add_tooltip}",
				layoutData: new sap.ui.layout.GridData({
					span: "L2 M2 S2"
				}),
				press: [this._changeConfigEntryLineState, this]
			}).addStyleClass("riverControlSmall");

			var oAddKeyLabel = new sap.ui.commons.Label({
				text: "{i18n>git_configuration_key}",
				required: true,
				design: "Bold",
				tooltip: "{i18n>git_configuration_newLineKeyTooltip}",
				visible: "{isAddLineVisible}",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			});

			var oAddKeyTextField = new sap.ui.commons.TextField({
				width: "100%",
				value: "{key}",
				visible: "{isAddLineVisible}",
				tooltip: "{i18n>git_configuration_newLineKeyTooltip}",
				liveChange: [this._verifyKeyInput, this],
				layoutData: new sap.ui.layout.GridData({
					span: "L3 M3 S3"
				})
			});

			var oAddValueLabel = new sap.ui.commons.Label({
				text: "{i18n>git_configuration_value}",
				required: true,
				design: "Bold",
				tooltip: "{i18n>git_configuration_newLineValueTooltip}",
				visible: "{isAddLineVisible}",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			});

			var oAddValueTextField = new sap.ui.commons.TextField({
				width: "100%",
				value: "{value}",
				visible: "{isAddLineVisible}",
				tooltip: "{i18n>git_configuration_newLineValueTooltip}",
				liveChange: [this._verifyValueInput, this],
				layoutData: new sap.ui.layout.GridData({
					span: "L4 M4 S4"
				})
			});

			var oAddSaveEntryButton = new sap.ui.commons.Button({
				icon: "sap-icon://save",
				lite: true,
				tooltip: "{i18n>git_configuration_save_tooltip}",
				press: [this._addAndSaveConfigEntry, this],
				enabled: {
					parts: ["isKeyValid", "isValueValid"],
					formatter: function(isKeyValid, isValueValid) {
						return isKeyValid && isValueValid;
					}
				},
				visible: "{isAddLineVisible}",
				layoutData: new sap.ui.layout.GridData({
					span: "L1 M1 S1"
				})
			}).addStyleClass("gitConfigurationButtonLiteHover");

			var oAddLineGrid = new sap.ui.layout.Grid({
				width: "100%",
				vSpacing: 0,
				hSpacing: 0,
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				containerQuery: true,
				content: [oAddNewConfigButton, oAddKeyLabel, oAddKeyTextField, oAddValueLabel, oAddValueTextField, oAddSaveEntryButton]
			}).addStyleClass("gitConfigurationGridHeight");

			oAddLineGrid.bindElement("/modelData");

			// main grid
			var oMainGrid = new sap.ui.layout.Grid({
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12",
					linebreak: true
				}),
				content: [oAddLineGrid, oHeaderGrid, oGrid]
			});

			return oMainGrid;
		}
	});
});