/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/*global FileReader*/
jQuery.sap.require('sap.apf.modeler.ui.utils.helper');
sap.ui.controller("sap.apf.modeler.ui.controller.applicationList", {
	onInit : function() {
		var viewInstance = this.getView();
		viewInstance.addStyleClass("sapUiSizeCompact");//For non touch devices- compact style class increases the information density on the screen by reducing control dimensions
		this._addApplicationStyleClass(); //add the style class
		var oComponent = this.getOwnerComponent();
		if (oComponent !== undefined) {
			this.oCoreApi = oComponent.oCoreApi;
			this._setDisplayText();
			var self = this;
			this.oCoreApi.getApplicationHandler(function(oApplicationHandler) {
				self.applicationHandler = oApplicationHandler;
				self._updateAppList();
			});
		}
		this.oModel = new sap.ui.model.json.JSONModel({});
		this.oModel.setSizeLimit(1000);
		this.bIsEditMode = false;
		this.byId("idAppDescription").attachBrowserEvent("click", this.navToConfigList().fn);
		this.byId("idSemanticObject").attachBrowserEvent("click", this.navToConfigList().fn);
		//Set the height of scroll container initial load and on resize
		var appLayout = viewInstance.byId("idApplicationTable");
		var scrollContainer = viewInstance.byId("idAppListScrollContainer");
		scrollContainer.addEventDelegate({
			onAfterRendering : function() { //Set the height and width of scroll container
				var width = jQuery(viewInstance.byId("idAppPage").getDomRef()).width();
				var height = jQuery(window).height();
				var appTitleBar = jQuery(viewInstance.byId("idAppTitle").getDomRef()).height();
				var appToolbar = jQuery(viewInstance.byId("idApplicationToolbar").getDomRef()).height();
				var header = jQuery(viewInstance.byId("idAppPage").getDomRef()).find("header").height();
				var footer = jQuery(viewInstance.byId("idAppPage").getDomRef()).find("footer").height();
				var offsetHeight;
				if (appTitleBar > 0) { //If onAfterRendering happens before the UI is rendered on the DOM
					appTitleBar = appTitleBar + 80;
					offsetHeight = appTitleBar + appToolbar + header + footer + 25;
				} else {//Fall back if rendered DOM element has height defined as 0 or undefined
					offsetHeight = 232; //Setting constant calculated value
				}
				//Set Initial Height and Width				
				scrollContainer.setHeight(height - offsetHeight + "px");
				scrollContainer.setWidth("100%");
				sap.apf.modeler.ui.utils.helper.onResize(function() {
					if (jQuery(self.getView().getDomRef()).css("display") === "block") {
						width = jQuery(viewInstance.byId("idAppPage").getDomRef()).width();
						height = jQuery(viewInstance.byId("idAppPage").getDomRef()).height();
						scrollContainer.setHeight(height - offsetHeight + "px");
						scrollContainer.setWidth("100%");
					}
				});
				sap.ui.core.UIComponent.getRouterFor(self).attachRoutePatternMatched(function(oEvent) {
					if (oEvent.getParameter("name") === "applicationList") {
						width = jQuery(viewInstance.getDomRef()).width();
						height = jQuery(viewInstance.getDomRef()).height();
						scrollContainer.setHeight(height - offsetHeight + "px");
						scrollContainer.setWidth("100%");
					}
				});
			}
		});
	},
	_setDisplayText : function() {
		this.byId("idAppPage").setTitle(this.oCoreApi.getText("configModelerTitle"));
		this.byId("idAppTitle").setText(this.oCoreApi.getText("applicationOverview"));
		this.byId("idAppNumberTitle").setText(this.oCoreApi.getText("applications"));
		this.byId("idDescriptionLabel").setText(this.oCoreApi.getText("description"));
		this.byId("idSemanticObjectLabel").setText(this.oCoreApi.getText("semanticObject"));
		this.byId("idEditButton").setText(this.oCoreApi.getText("edit"));
		this.byId("idSaveButton").setText(this.oCoreApi.getText("save"));
		this.byId("idCancelButton").setText(this.oCoreApi.getText("cancel"));
		this.byId("idTextCleanupButton").setText(this.oCoreApi.getText("textCleanUp"));
		this.byId("idImportButton").setText(this.oCoreApi.getText("import"));
		this.byId("idNewButton").setTooltip(this.oCoreApi.getText("newApplication"));
	},
	_addConfigStyleClass : function() {
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idJsonFileLabel").addStyleClass("importFileUploaderDialogLabels");
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idTextFileLabel").addStyleClass("importFileUploaderDialogLabels");
	},
	_setOverwriteConfirmationDialogText : function() {
		sap.ui.core.Fragment.byId("idOverwriteConfirmationFragment", "idOverwriteConfirmationDialog").setTitle(this.oCoreApi.getText("warning"));
		sap.ui.core.Fragment.byId("idOverwriteConfirmationFragment", "idConfirmationMessage").setText(this.oCoreApi.getText("overwriteConfirmationMsg"));
		sap.ui.core.Fragment.byId("idOverwriteConfirmationFragment", "idConfirmationMessage").addStyleClass("dialogText");
		sap.ui.core.Fragment.byId("idOverwriteConfirmationFragment", "idYesButton").setText(this.oCoreApi.getText("yes"));
		sap.ui.core.Fragment.byId("idOverwriteConfirmationFragment", "idNoButton").setText(this.oCoreApi.getText("no"));
	},
	_setImportConfigDialogText : function() {
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idImportConfigDialog").setTitle(this.oCoreApi.getText("importConfig"));
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idJsonFileLabel").setText(this.oCoreApi.getText("jsonFile"));
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idJsonFileUploader").setPlaceholder(this.oCoreApi.getText("jsonFileInputPlaceHolder"));
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idTextFileLabel").setText(this.oCoreApi.getText("textFile"));
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idTextFileUploader").setPlaceholder(this.oCoreApi.getText("textFileInputPlaceHolder"));
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idUploadOfConfig").setText(this.oCoreApi.getText("upload"));
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idCancelImportOfConfig").setText(this.oCoreApi.getText("cancel"));
	},
	_setConfirmationDialogText : function() {
		sap.ui.core.Fragment.byId("idConfirmationDialogFragment", "idDeleteConfirmation").setTitle(this.oCoreApi.getText("confirmation"));
		sap.ui.core.Fragment.byId("idConfirmationDialogFragment", "idDeleteButton").setText(this.oCoreApi.getText("deleteButton"));
		sap.ui.core.Fragment.byId("idConfirmationDialogFragment", "idCancelButtonDialog").setText(this.oCoreApi.getText("cancel"));
	},
	_setNewApplicationText : function() {
		sap.ui.core.Fragment.byId("idAddNewApplicationFragment", "idNewApp").setTitle(this.oCoreApi.getText("newApplication"));
		sap.ui.core.Fragment.byId("idAddNewApplicationFragment", "idDescriptionLabelApp").setText("*" + this.oCoreApi.getText("description"));
		sap.ui.core.Fragment.byId("idAddNewApplicationFragment", "idSemanticObjectLabelApp").setText(this.oCoreApi.getText("semanticObject"));
		sap.ui.core.Fragment.byId("idAddNewApplicationFragment", "idSaveButtonApp").setText(this.oCoreApi.getText("save"));
		sap.ui.core.Fragment.byId("idAddNewApplicationFragment", "idCancelButtonApp").setText(this.oCoreApi.getText("cancel"));
	},
	_addApplicationStyleClass : function() {
		this.byId("idAppNumberTitle").addStyleClass("appCountLabel");
		this.byId("idAppDescription").addStyleClass("cursor");
		this.byId("idSemanticObject").addStyleClass("cursor");
		this.byId("idNewButton").addStyleClass("newButton");
		this.byId("idAppListScrollContainer").addStyleClass("applicationListScroll");
		this.byId("idNoOfConfig").addStyleClass("applicationCount");
		this.byId("idAppTitle").addStyleClass("applicationTitle");
		this.byId("idApplicationToolbar").addStyleClass("applicationTitleLayout");
	},
	_updateAppList : function() {
		var applications = this.applicationHandler.getList();
		var appCount = applications.length;
		var aAppDetails = [];
		applications.forEach(function(application) {
			var oAppDetails = {};
			oAppDetails.id = application.Application;
			oAppDetails.description = application.ApplicationName;
			oAppDetails.semanticObject = application.SemanticObject;
			aAppDetails.push(oAppDetails);
		});
		var jsonData = {
			appCount : "(" + appCount + ")",
			tableData : aAppDetails
		};
		if (this.oModel !== undefined) {
			this.oModel.setSizeLimit(1000);
			this.oModel.setData(jsonData);
			this.getView().setModel(this.oModel);
		}
	},
	_enableDisplayMode : function() {
		this.bIsEditMode = false;
		this.byId("idEditButton").setVisible(true);
		this.byId("idSaveButton").setVisible(false);
		this.byId("idSaveButton").setEnabled(false);
		this.byId("idTextCleanupButton").setEnabled(false);
		this.byId("idCancelButton").setVisible(false);
		this.byId("idTextCleanupButton").setVisible(false);
		this.byId("idApplicationTable").setMode("None");
		var items = this.byId("idApplicationTable").getItems();
		items.forEach(function(item) {
			item.setType("Navigation");
			item.getCells()[0].setEditable(false);
			item.getCells()[1].setEditable(false);
			item.getCells()[2].setVisible(false);
		});
		this._updateAppList();
	},
	enableEditMode : function() {
		this.bIsEditMode = true;
		this.byId("idEditButton").setVisible(false);
		this.byId("idSaveButton").setVisible(true);
		this.byId("idCancelButton").setVisible(true);
		this.byId("idTextCleanupButton").setVisible(true);
		this.byId("idApplicationTable").setMode("SingleSelectMaster");
		var items = this.byId("idApplicationTable").getItems();
		if (items.length !== 0) {
			items.forEach(function(item) {
				item.getCells()[0].setEditable(true);
				item.getCells()[1].setEditable(true);
				item.getCells()[2].setVisible(true);
				item.setType("Inactive");
			});
		}
	},
	handleDeletePress : function(evt) {
		var sPath = evt.getSource().getBindingContext().getPath().split("/")[2];
		var removeId = this.getView().getModel().getData().tableData[sPath].id;
		var customData = new sap.ui.core.CustomData({
			value : {
				removeId : removeId,
				sPath : sPath
			}
		});
		if (!this.confirmationDialog) {
			this.confirmationDialog = sap.ui.xmlfragment("idConfirmationDialogFragment", "sap.apf.modeler.ui.fragment.confirmationDialog", this);
			this.getView().addDependent(this.confirmationDialog);
			this._setConfirmationDialogText();
		}
		var confirmationMessage = new sap.m.Label();
		confirmationMessage.addStyleClass("dialogText");
		confirmationMessage.setText(this.oCoreApi.getText("deleteApp"));
		this.confirmationDialog.removeAllContent();
		this.confirmationDialog.addContent(confirmationMessage);
		this.confirmationDialog.removeAllCustomData();
		this.confirmationDialog.addCustomData(customData);
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.confirmationDialog);
		this.confirmationDialog.open();
	},
	handleConfirmDeletion : function() {
		var removeId = this.confirmationDialog.getCustomData()[0].getValue().removeId;
		if (removeId !== undefined) {
			var self = this;
			this.applicationHandler.removeApplication(removeId, function(oResponse, oMetadata, msgObj) {
				if (msgObj === undefined && (typeof oResponse === "string")) {
					self.confirmationDialog.close();
					self._updateAppList();
					self.enableEditMode();
				} else {
					var oMessageObject = self.oCoreApi.createMessageObject({
						code : "11501"
					});
					oMessageObject.setPrevious(msgObj);
					self.oCoreApi.putMessage(oMessageObject);
				}
			});
		}
	},
	closeDialog : function() {
		if (this.confirmationDialog.isOpen()) {
			this.confirmationDialog.close();
		}
	},
	handleSavePress : function() {
		var self = this;
		var j;
		var updateAppArr = [];
		var appList = this.applicationHandler.getList();
		var tableData = this.getView().getModel().getData().tableData;
		for(j = 0; j < appList.length; j++) {
			if (tableData[j].description !== appList[j].ApplicationName || tableData[j].semanticObject !== appList[j].SemanticObject) {
				updateAppArr.push(tableData[j]);
			}
		}
		updateAppArr.forEach(function(app) {
			var updatedAppObject = {
				ApplicationName : app.description,
				SemanticObject : app.semanticObject
			};
			self.applicationHandler.setAndSave(updatedAppObject, function(oResponse, oMetadata, msgObj) {
				if (msgObj === undefined && (typeof oResponse === "string")) {
					self._enableDisplayMode();
				} else {
					var oMessageObject = self.oCoreApi.createMessageObject({
						code : "11500"
					});
					oMessageObject.setPrevious(msgObj);
					self.oCoreApi.putMessage(oMessageObject);
				}
			}, app.id);
		});
	},
	handleCancelPress : function() {
		var j;
		var updateAppArr = [];
		var appList = this.applicationHandler.getList();
		var tableData = this.getView().getModel().getData().tableData;
		for(j = 0; j < appList.length; j++) {
			if (tableData[j].description !== appList[j].ApplicationName || tableData[j].semanticObject !== appList[j].SemanticObject) {
				updateAppArr.push(tableData[j]);
			}
		}
		if (updateAppArr.length !== 0) {
			this.unsavedDataConfirmationDialog = sap.ui.xmlfragment("idMessageDialogFragment", "sap.apf.modeler.ui.fragment.messageDialog", this);
			this.getView().addDependent(this.unsavedDataConfirmationDialog);
			this._setUnsavedDataConfirmationDialogText();
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.unsavedDataConfirmationDialog);
			this.unsavedDataConfirmationDialog.open();
		} else {
			this._enableDisplayMode();
		}
	},
	_handleNavigationWithSave : function() {
		this.handleSavePress();
		if (this.unsavedDataConfirmationDialog.isOpen()) {
			this.unsavedDataConfirmationDialog.close();
			this.unsavedDataConfirmationDialog.destroy();
		}
	},
	_handleNavigateWithoutSave : function() {
		if (this.unsavedDataConfirmationDialog.isOpen()) {
			this.unsavedDataConfirmationDialog.close();
			this.unsavedDataConfirmationDialog.destroy();
		}
		this._enableDisplayMode();
	},
	_handlePreventNavigation : function() {
		if (this.unsavedDataConfirmationDialog.isOpen()) {
			this.unsavedDataConfirmationDialog.close();
			this.unsavedDataConfirmationDialog.destroy();
		}
	},
	_setUnsavedDataConfirmationDialogText : function() {
		sap.ui.core.Fragment.byId("idMessageDialogFragment", "idMessageDialog").setTitle(this.oCoreApi.getText("confirmation"));
		sap.ui.core.Fragment.byId("idMessageDialogFragment", "idYesButton").setText(this.oCoreApi.getText("yes"));
		sap.ui.core.Fragment.byId("idMessageDialogFragment", "idNoButton").setText(this.oCoreApi.getText("no"));
		sap.ui.core.Fragment.byId("idMessageDialogFragment", "idCancelButton").setText(this.oCoreApi.getText("cancel"));
		var confirmationMessage = new sap.m.Label();
		confirmationMessage.addStyleClass("dialogText");
		confirmationMessage.setText(this.oCoreApi.getText("unsavedConfiguration"));
		this.unsavedDataConfirmationDialog.removeAllContent();
		this.unsavedDataConfirmationDialog.addContent(confirmationMessage);
	},
	handleListItemSelect : function(evt) { //handler for selection in application list
		var bindingContext = evt.getParameter("listItem").getBindingContext().getPath().split("/")[2];
		this.appId = this.getView().getModel().getData().tableData[bindingContext].id;
		this.byId("idTextCleanupButton").setEnabled(true);
	},
	handleListItemPress : function(evt) { //handler for navigation in application list
		var bindingContext = evt.getParameter("listItem").getBindingContext().getPath().split("/")[2];
		var appId = this.getView().getModel().getData().tableData[bindingContext].id;
		sap.ui.core.UIComponent.getRouterFor(this).navTo("configurationList", {
			appId : appId
		});
	},
	onLiveChange : function() {
		this.byId("idSaveButton").setEnabled(true);
	},
	addNewApplication : function() {
		if (!this.addNewItemDialog) {
			this.addNewItemDialog = sap.ui.xmlfragment("idAddNewApplicationFragment", "sap.apf.modeler.ui.fragment.newApplication", this);
			this.getView().addDependent(this.addNewItemDialog);
			this._setNewApplicationText();
		}
		this.addNewItemDialog.getContent()[0].getContent()[1].setValue("");
		this.addNewItemDialog.getContent()[0].getContent()[3].setValue("FioriApplication");
		this.addNewItemDialog.getBeginButton().setEnabled(false);
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.addNewItemDialog);
		this.addNewItemDialog.open();
	},
	applicationDescChange : function(oEvent) {
		this.isAppDesc = oEvent.getParameters().value.trim().length !== 0 ? true : false;
		if (this.isAppDesc) {
			this.addNewItemDialog.getBeginButton().setEnabled(true);
		} else {
			this.addNewItemDialog.getBeginButton().setEnabled(false);
		}
	},
	closeNewAppDialog : function() {
		if (this.addNewItemDialog.isOpen()) {
			this.addNewItemDialog.close();
		}
	},
	handleSaveDialogPress : function() {
		var self = this;
		var aDependents = this.getView().getDependents();
		var appObject = {};
		aDependents.forEach(function(oDependent) {
			if (oDependent.sId === "idAddNewApplicationFragment--idNewApp") {
				appObject.ApplicationName = oDependent.getContent()[0].getContent()[1].getValue() !== "" ? oDependent.getContent()[0].getContent()[1].getValue() : undefined;
				appObject.SemanticObject = oDependent.getContent()[0].getContent()[3].getValue() !== "" ? oDependent.getContent()[0].getContent()[3].getValue() : undefined;
			}
		});
		this.applicationHandler.setAndSave(appObject, function(oResponse, oMetadata, msgObj) {
			if (msgObj === undefined && (typeof oResponse === "string")) {
				self._enableDisplayMode();
				self.byId('idApplicationTable').rerender();
				var appTableItemDOM = self.byId('idApplicationTable').getItems()[self.byId('idApplicationTable').getItems().length - 1].$();
				if (appTableItemDOM.length !== 0) {
					appTableItemDOM[0].scrollIntoView();
				}
				self.addNewItemDialog.close();
			} else {
				var oMessageObject = self.oCoreApi.createMessageObject({
					code : "12000"
				});
				oMessageObject.setPrevious(msgObj);
				self.oCoreApi.putMessage(oMessageObject);
			}
		});
	},
	handleImportButtonPress : function() {
		if (!this.importConfigurationDialog) {
			this.importConfigurationDialog = sap.ui.xmlfragment("idImportConfigurationFragment", "sap.apf.modeler.ui.fragment.importConfiguration", this);
			this.getView().addDependent(this.importConfigurationDialog);
			this._setImportConfigDialogText();
			this._addConfigStyleClass();
		}
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idJsonFileUploader").setValue("");
		sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idTextFileUploader").setValue("");
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.importConfigurationDialog);
		this.importConfigurationDialog.open();
	},
	handleUploadOfConfig : function() {
		this.oJSONFileUploader = sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idJsonFileUploader");
		this.oTextPropertyFileUploader = sap.ui.core.Fragment.byId("idImportConfigurationFragment", "idTextFileUploader");
		if ((this.oJSONFileUploader.getValue() && this.oTextPropertyFileUploader.getValue()) || this.oJSONFileUploader.getValue()) {
			this.oJSONFileUploader.upload(); //upload the json file if both the files or only the json file have to be uploaded, properties file will be uploaded after json file
		} else {
			this.oTextPropertyFileUploader.upload(); //upload only the properties file
		}
	},
	addAcceptAttribute : function() {
		var jsonFileInput = jQuery("#idImportConfigurationFragment--idJsonFileUploader-fu");
		var propertyFileInput = jQuery("#idImportConfigurationFragment--idTextFileUploader-fu");
		jsonFileInput.attr('accept', '.json');
		propertyFileInput.attr('accept', '.properties');
	},
	closeImportConfigDialog : function() {
		if (this.importConfigurationDialog.isOpen()) {
			this.importConfigurationDialog.close();
		}
	},
	handleJSONFileUploadComplete : function(oEvent) {
		var self = this;
		var sMsg = this.oCoreApi.getText("errorReadingJSONFile");
		var file = oEvent.getSource().oFileUpload.files[0];
		if (file) {
			var reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = function(evt) {
				self.parsedConfigString = JSON.parse(evt.target.result);
				self.appIdFromConfigFile = self.parsedConfigString.configHeader.Application; //application id in the configuration file
				self._importConfigurationFile(self.parsedConfigString); //only json file has to be imported
			};
			reader.onerror = function() {
				sap.m.MessageToast.show(sMsg);
			};
		}
		this.importConfigurationDialog.close();
	},
	handleTextFileUploadComplete : function(oEvent) {
		var self = this;
		var sMsg = this.oCoreApi.getText("errorReadingPropertiesFile");
		var asyncMsg = this.oCoreApi.getText("asyncMsg");
		var file = oEvent.getSource().oFileUpload.files[0];
		if (file) {
			var reader = new FileReader();
			reader.readAsText(file, "UTF-8");
			reader.onload = function(evt) {
				var aLines = evt.target.result.split(/\r?\n/);
				var len = aLines.length;
				var applicationId, i;
				for(i = 0; i < len; i++) {
					applicationId = /^\#\s*ApfApplicationId=[0-9A-F]+\s*$/.exec(aLines[i]);
					if (applicationId !== null) {
						self.appIdFromTextFile = aLines[i].split('=')[1]; //application id in the properties file
					}
				}
				var bExistingApplication;
				for(i = 0; i < self.applicationHandler.getList().length; i++) { //check if the application exists
					if (self.appIdFromTextFile === self.applicationHandler.getList()[i].Application) {
						bExistingApplication = true;
						break;
					} else {
						bExistingApplication = false;
					}
				}
				if (!bExistingApplication && !self.oJSONFileUploader.getValue()) {
					sap.m.MessageToast.show("chooseJsonFile"); //JSON file has to be selected before properties file if the application does not exist
				} else if (self.oJSONFileUploader.getValue()) {
					if (self.appIdFromConfigFile && self.appIdFromTextFile && self.appIdFromTextFile !== self.appIdFromConfigFile) { //chcek if the id of application is same in both the files
						sap.m.MessageToast.show(asyncMsg);
					} else {
						self._importPropertiesFile(evt.target.result); //only property file has to be imported
					}
				} else if (bExistingApplication && !self.oJSONFileUploader.getValue()) {
					self._importPropertiesFile(evt.target.result);
				}
			};
			reader.onerror = function() {
				sap.m.MessageToast.show(sMsg);
			};
		}
		this.importConfigurationDialog.close();
	},
	_importConfigurationFile : function(parsedConfigString) {
		var self = this;
		var successsMsgForConfigFileImport = this.oCoreApi.getText("successsMsgForConfigFileImport");
		this.oCoreApi.importConfiguration(JSON.stringify(parsedConfigString), function(callbackOverwrite, callbackCreateNew) {
			//Config exists overwrite confirmation popup is shown	
			self.callbackOverwrite = callbackOverwrite;
			self.callbackCreateNew = callbackCreateNew;
			self._openConfirmationDialog();
		}, callbackImport);
		function callbackImport(configuration, metadata, messageObject) {
			if (messageObject === undefined) {
				self._updateAppList();
				sap.m.MessageToast.show(successsMsgForConfigFileImport);
				if (self.oTextPropertyFileUploader.getValue()) {
					self.oTextPropertyFileUploader.upload();
				}
			} else {
				var oMessageObject = self.oCoreApi.createMessageObject({
					code : "11502"
				});
				oMessageObject.setPrevious(messageObject);
				self.oCoreApi.putMessage(oMessageObject);
			}
		}
	},
	_importPropertiesFile : function(aPropertyTexts) {
		var self = this;
		var successsMsgForPropertyFileImport = this.oCoreApi.getText("successsMsgForPropertyFileImport");
		this.oCoreApi.importTexts(aPropertyTexts, function(messageObject) { //import the texts from the property file
			if (messageObject === undefined) {
				sap.m.MessageToast.show(successsMsgForPropertyFileImport);
			} else {
				var oMessageObject = self.oCoreApi.createMessageObject({
					code : "11503"
				});
				oMessageObject.setPrevious(messageObject);
				self.oCoreApi.putMessage(oMessageObject);
			}
		});
	},
	handleTypeMissmatchForJSONFile : function() {
		var sMsg = this.oCoreApi.getText("jsonFileMissmatch");
		sap.m.MessageToast.show(sMsg);
	},
	handleTypeMissmatchForPropertiesFile : function() {
		var sMsg = this.oCoreApi.getText("propertiesFileMissmatch");
		sap.m.MessageToast.show(sMsg);
	},
	_openConfirmationDialog : function() {
		if (!this.overwriteConfirmationDialog) {
			this.overwriteConfirmationDialog = sap.ui.xmlfragment("idOverwriteConfirmationFragment", "sap.apf.modeler.ui.fragment.overwriteConfirmation", this);
			this.getView().addDependent(this.overwriteConfirmationDialog);
			this._setOverwriteConfirmationDialogText();
		}
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.overwriteConfirmationDialog);
		this.overwriteConfirmationDialog.open();
	},
	handleConfirmOverwriting : function() {
		this.callbackOverwrite();
		this.overwriteConfirmationDialog.close();
	},
	handleNoButtonPress : function() {
		this.callbackCreateNew();
		this.overwriteConfirmationDialog.close();
	},
	handleTextCleanUpPress : function() {
		var self = this;
		this.oCoreApi.getConfigurationHandler(this.appId, function(configurationHandler) {
			self.oTextPool = configurationHandler.getTextPool();
			self.oCoreApi.getUnusedTextKeys(self.appId, function(aUnusedTexts, msgObj) {
				if (msgObj === undefined) {
					self.oTextPool.removeTexts(aUnusedTexts, self.appId,function(msgObj) {
						if (msgObj === undefined) {
							var successMessageOnTextCleanUp = self.oCoreApi.getText("successtextCleanup");
							sap.m.MessageToast.show(successMessageOnTextCleanUp, {
								width : "20em"
							});
						}
					});
				} else {
					var oMessageObject = self.oCoreApi.createMessageObject({
						code : "12000"
					});
					oMessageObject.setPrevious(msgObj);
					self.oCoreApi.putMessage(oMessageObject);
				}
			});
		});
	},
	navToConfigList : function() {
		var oSelf = this;
		return {
			fn : function() {
				if (!oSelf.bIsEditMode) {
					var bindingContext = this.getBindingContext().getPath().split("/")[2];
					var appId = oSelf.getView().getModel().getData().tableData[bindingContext].id;
					sap.ui.core.UIComponent.getRouterFor(oSelf).navTo("configurationList", {
						appId : appId
					});
				}
			}
		};
	},
	handleNavBack : function() {
		window.history.go(-1);//Navigate back to the previous history set
	}
});
