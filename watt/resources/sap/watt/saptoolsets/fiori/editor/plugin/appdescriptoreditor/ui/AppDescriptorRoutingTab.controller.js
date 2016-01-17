sap.ui.define([
	"./AppDescriptorEditorBase.controller"
], function(BaseController) {
	"use strict";

	return BaseController.extend("sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorRoutingTab", {

		onInit: function() {
			this._oContext = this.getView().getViewData().oContext;
			this._oUtilities = this.getView().getViewData().oUtil;
			this._ = require("sap/watt/lib/lodash/lodash"); //Already uploaded in the service
			var oManageTargetControl = this.byId("manageTargetsList");
			oManageTargetControl.setPreRemoveHandler(this.onPreRemoveDecision, this);
		},

		/**
		 * =============================
		 * Routing tab methods
		 * =============================
		 */
		 
		formatManageTargetsViewType: function(oItem) {
			if (oItem) {
				return oItem[Object.keys(oItem)[0]].viewType;
			}
		},
		
		formatManageTargetsTransition: function(oItem) {
			if (oItem) {
				return oItem[Object.keys(oItem)[0]].transition;
			}
		},
		
		formatManageTargetsClearAggregation: function(oItem) {
			if (oItem) {
				return oItem[Object.keys(oItem)[0]].clearAggregation;
			}
		},

		onAfterRendering: function() {
			var bManageTargets = false;
			var sRoutingTargetSelectedKey = this.getView().getModel("AppDescriptorUI").getProperty("/sRoutingTargetSelectedKey");
			if (sRoutingTargetSelectedKey && sRoutingTargetSelectedKey !== undefined) {
				bManageTargets = true;
			}
			this.getView().getModel().setProperty("/manageTargetsDetails", {
				manageTargetsDetailsEnabled: bManageTargets
			});

		},

		onPreRemoveDecision: function(sTargetName) {
			var that = this;
			var oManifestModel = this.getView().getModel("manifest");
			var aLocalRoutes = this._.cloneDeep(oManifestModel.getProperty("/sap.ui5/routing/routes"));
			var oBypassedHorizontalLayout = this.byId("routingBypassedHorizontalLayout");
			var oHLModel = oBypassedHorizontalLayout.getModel();
			var sHLPath = oBypassedHorizontalLayout.getBindingPath("content");
			var oLocalBypassedData = this._.cloneDeep(oHLModel.getProperty(sHLPath));			
			var bTargetExist = false;
			
			//Remove traget from the routes model
			for (var i = 0; aLocalRoutes && i < aLocalRoutes.length; i++) {
				if (aLocalRoutes[i].target && aLocalRoutes[i].target.length > 0 && aLocalRoutes[i].target.indexOf(sTargetName) >= 0) {
					this._.remove(aLocalRoutes[i].target, function(oElement) {
						if (that._.isEqual(oElement, sTargetName)) {
							bTargetExist = true;
							return true;
						}
					});
				}
			}

			//Remove the bypass target from the model
			this._.remove(oLocalBypassedData, function(oElement) {
				if (oElement.text === sTargetName) {
						bTargetExist = true;
						return true;
				}
				return false;
			});
			///if there is a dependency
			if (bTargetExist) {
				//return the user decision
				return this._oContext.service.usernotification.confirm(this._oContext.i18n.getText("AppDescriptor_Routing_Delete_Confirmation"))
					.then(function(oRet) {
						if (oRet.bResult) {
							oManifestModel.setProperty("/sap.ui5/routing/routes", aLocalRoutes);
							oHLModel.setProperty(sHLPath, oLocalBypassedData);
							that._deleteEntryFromManifest(["sap.ui5", "routing", "config", "bypassed", "target"], null, sTargetName);
							//raise event to update the document
							that.fireEvent("manifestChanged");
							return Q(true);
						}
						return Q(false);
					});
			}
			
			return Q(true);
		},

		onRoutingViewPathChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "viewPath"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingViewTypeChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "viewType"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingControlIdChange: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "controlId"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onViewLevel2Change: function(oEvent) {
			//FIXME feagure out how to make this work.
			//sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
			this._checkValidation(oEvent.getSource(), /^\d+$/);
			//Create the skeleton if it does not exist and update the new value of the field
			var iViewLevel = parseInt(oEvent.getParameter("newValue"));
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "viewLevel"], "", iViewLevel);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onControlAggregation2Change: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "controlAggregation"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onTransition2Change: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "transition"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onClearAggregation2Change: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "clearAggregation"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onSAPUI5RoutingTargetsChange: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			var oModelUI = oEvent.getSource().getModel("AppDescriptorUI");
			
			if (oEvent.getParameter("action") === "add") {
				oModel.setProperty("/manageTargetsDetails/manageTargetsDetailsEnabled", true);
				oModelUI.setProperty("/sRoutingTargetSelectedKey", Object.keys(oEvent.getParameter("item").item)[0]);
			}

			//this.getSource()._oList.setSlelctedKey(Object.keys(oEvent.getParameter("item").item)[0]);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets"]);
			this._updateManifestSchemaFromAddRemoveListBox(["sap.ui5", "routing", "targets"], oEvent, undefined, ["sap.ui5"], ["routing",
				"targets"
			]);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onPressMorePropeties: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			oModel.setProperty("/sap.ui5/properties/routing/properties/config/showMoreProperties/bValue", true);
		},

		onPressLessPropeties: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			oModel.setProperty("/sap.ui5/properties/routing/properties/config/showMoreProperties/bValue", false);
		},

		onTargetParent2Change: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "targetParent"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onParent2Change: function(oEvent) {
			//Create the skeleton if it does not exist and update the new value of the field
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "parent"], "", oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingBypassAddPress: function() {
			this._openAddRoutingTargetDialog(function(sSelectedTarget) {
				var oBypassedHorizontalLayout = this.byId("routingBypassedHorizontalLayout");
				var oHLModel = oBypassedHorizontalLayout.getModel();
				var sHLPath = oBypassedHorizontalLayout.getBindingPath("content");
				var oHorizontalLayoutrData = oHLModel.getProperty(sHLPath);

				this._createManifstSpecificSkeleton(["sap.ui5", "routing", "config", "bypassed", "target"], "array", sSelectedTarget);
				//raise event to update the document
				this.fireEvent("manifestChanged");
				//Update the ui model on the schema
				var bValueExist = false;
				for (var i = 0; oHorizontalLayoutrData && oHorizontalLayoutrData.length && i < oHorizontalLayoutrData.length; i++) {
					if (oHorizontalLayoutrData[i].text === sSelectedTarget) {
						bValueExist = true;
					}
				}

				if (!bValueExist) {
					oHorizontalLayoutrData.push(this._oUtilities._convertStringToItemArray(sSelectedTarget));
					oHLModel.setProperty(sHLPath, oHorizontalLayoutrData);
				}
			}, this);
		},

		onBypassedTargetsRemovePressed: function(oEvent) {
			var oBypassedHorizontalLayout = this.byId("routingBypassedHorizontalLayout");
			var oHLModel = oBypassedHorizontalLayout.getModel();
			var sHLPath = oBypassedHorizontalLayout.getBindingPath("content");
			var oHorizontalLayoutrData = oHLModel.getProperty(sHLPath);
			var sValueToDelete = oEvent.getSource().getText();

			this._deleteEntryFromManifest(["sap.ui5", "routing", "config", "bypassed", "target"], null, sValueToDelete);
			//raise event to update the document
			this.fireEvent("manifestChanged");
			//Remove the button from the model
			this._.remove(oHorizontalLayoutrData, function(oElement) {
				return oElement.text === sValueToDelete;
			});
			oHLModel.setProperty(sHLPath, oHorizontalLayoutrData);

		},

		formatRoutingTargetsToText: function(oItem) {
			if (oItem) {
				return Object.keys(oItem)[0];
			}
		},

		onSAPUI5RoutingTargetsSelect: function(oEvent) {
			var oModel = oEvent.getSource().getModel();
			var oParams = oEvent.getParameters();
			var bTargetDetailsEnabled = false;
			var oBindCntx;
			var oTargetDetailsForm;
			var oParameters = oParams.getParameters();
			if (oParameters.selectedItem) {
				bTargetDetailsEnabled = true;
				oBindCntx = oParameters.selectedItem.getBindingContext();
				oTargetDetailsForm = this.byId("ManageTargetsDetails");
				oTargetDetailsForm.setBindingContext(oBindCntx);
				this.getView().getModel("AppDescriptorUI").setProperty("/sRoutingTargetSelectedKey", oParameters.selectedItem.getKey());
			} else {
				//no item was selected and the select event was raised -> removes item from the list
				this.getView().getModel("AppDescriptorUI").setProperty("/sRoutingTargetSelectedKey", undefined);
			}
			oModel.setProperty("/manageTargetsDetails/manageTargetsDetailsEnabled", bTargetDetailsEnabled);
		},

		onRoutingTargetsViewNameChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "viewName"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsViewIDChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "viewId"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsViewLevelChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			var iViewLevel = parseInt(oEvent.getParameter("newValue"));
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "viewLevel"], "", iViewLevel);
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsControlAggChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "controlAggregation"], "",
				oEvent.getParameter("newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsControlIDChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "controlId"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsViewPathChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oNewValue = oEvent.getParameter("newValue");
			var oTargets = oModel.getProperty(sPath);
			//Create the path in manifest of does not exist
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "viewPath"], "", oNewValue);
			//delete the property viewPath if empty
			if (oNewValue === "") {
				this._deleteEntryFromManifest(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "viewPath"], "viewPath");
			}
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsViewTypeChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "viewType"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsTransitionChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "transition"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsParentChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "parent"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsClearAggChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "clearAggregation"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onRoutingTargetsTargetParentChange: function(oEvent) {
			var sPath = oEvent.getSource().getBindingContext().sPath;
			var oModel = oEvent.getSource().getModel();
			var oTargets = oModel.getProperty(sPath);
			this._createManifstSpecificSkeleton(["sap.ui5", "routing", "targets", Object.keys(oTargets.item)[0], "targetParent"], "", oEvent.getParameter(
				"newValue"));
			//raise event to update the document
			this.fireEvent("manifestChanged");
		},

		onAddRoutePress: function() {
			var oManifestModel = this.getView().getModel("manifest");
			var aRoutes = oManifestModel.getProperty("/sap.ui5/routing/routes");
			if (!aRoutes) {
				aRoutes = [];
			}
			aRoutes.push({
				name: "route name",
				pattern: "",
				greedy: false
			});
			oManifestModel.setProperty("/sap.ui5/routing/routes", aRoutes);
		},

		onRemoveRoutePress: function(oEvent) {
			// Get route index
			var sRoutePath = oEvent.getSource().getParent().getBindingContext("manifest").getPath();
			var iRouteIndex = Number(sRoutePath.substr(sRoutePath.lastIndexOf("/") + 1));

			// Update model
			var oManifestModel = this.getView().getModel("manifest");
			var aRoutes = oManifestModel.getProperty("/sap.ui5/routing/routes");
			aRoutes.splice(iRouteIndex, 1);
			oManifestModel.setProperty("/sap.ui5/routing/routes", aRoutes);
		},

		onMoveRouteUpPress: function(oEvent) {
			// Get route index
			var sRoutePath = oEvent.getSource().getParent().getBindingContext("manifest").getPath();
			var iRouteIndex = Number(sRoutePath.substr(sRoutePath.lastIndexOf("/") + 1));

			if (iRouteIndex === 0) {
				return;
			}

			// Update model
			var oManifestModel = this.getView().getModel("manifest");
			var aRoutes = oManifestModel.getProperty("/sap.ui5/routing/routes");
			var oRouteToMove = aRoutes.splice(iRouteIndex, 1)[0];
			aRoutes.splice(iRouteIndex - 1, 0, oRouteToMove);
			oManifestModel.setProperty("/sap.ui5/routing/routes", aRoutes);
		},

		onMoveRouteDownPress: function(oEvent) {
			// Get route index
			var sRoutePath = oEvent.getSource().getParent().getBindingContext("manifest").getPath();
			var iRouteIndex = Number(sRoutePath.substr(sRoutePath.lastIndexOf("/") + 1));

			// Get routes from model
			var oManifestModel = this.getView().getModel("manifest");
			var aRoutes = oManifestModel.getProperty("/sap.ui5/routing/routes");

			if (iRouteIndex === aRoutes.length - 1) {
				return;
			}

			// Update model
			var oRouteToMove = aRoutes.splice(iRouteIndex, 1)[0];
			aRoutes.splice(iRouteIndex + 1, 0, oRouteToMove);
			oManifestModel.setProperty("/sap.ui5/routing/routes", aRoutes);
		},

		onAddTargetToRoutePress: function(oEvent) {
			// Get current route 
			var sRoutePath = oEvent.getSource().getBindingContext("manifest").getPath();
			var iRouteIndex = Number(sRoutePath.substr(sRoutePath.lastIndexOf("/") + 1));
			var oManifestModel = this.getView().getModel("manifest");
			var aRoutes = oManifestModel.getProperty("/sap.ui5/routing/routes");
			var oCurrentRoute = aRoutes[iRouteIndex];

			// Open add target dialog
			this._openAddRoutingTargetDialog(function(sSelectedTarget) {
				// Add target to route if it doesn't exist 
				if (!oCurrentRoute.target) {
					oCurrentRoute.target = [];
				}
				if (oCurrentRoute.target.indexOf(sSelectedTarget) === -1) {
					oCurrentRoute.target.push(sSelectedTarget);
				}
				oManifestModel.setProperty("/sap.ui5/routing/routes", aRoutes);
			}, this);
		},

		onRemoveTargetFromRoutePress: function(oEvent) {
			// Get current route 
			var sRoutePath = oEvent.getSource().getParent().getBindingContext("manifest").getPath();
			var iRouteIndex = Number(sRoutePath.substr(sRoutePath.lastIndexOf("/") + 1));
			var oManifestModel = this.getView().getModel("manifest");
			var aRoutes = oManifestModel.getProperty("/sap.ui5/routing/routes");
			var oCurrentRoute = aRoutes[iRouteIndex];

			// Remove target from route
			var sTargetToRemove = oEvent.getSource().getText();
			var aTargets = oCurrentRoute.target;
			aTargets.splice(aTargets.indexOf(sTargetToRemove), 1);
			oManifestModel.setProperty("/sap.ui5/routing/routes", aRoutes);

		},

		_openAddRoutingTargetDialog: function(fnTargetSelectedtHandler, oContext) {
			// Create dialog if it doesn't exist
			if (!this._oRoutingTargetsDialogFragment) {
				this._oRoutingTargetsDialogFragment = sap.ui.xmlfragment(
					"sap.watt.saptoolsets.fiori.editor.plugin.appdescriptoreditor.ui.AppDescriptorRoutingAvailableTargetsDialog", this);
				this._oRoutingTargetsDialogFragment.setModel(this.getView().getModel("i18n"), "i18n");
				this._oRoutingTargetsDialogFragment.setModel(this.getView().getModel());
				this._oRoutingTargetsDialogFragment.setInitialFocus("appDescriptorRoutingCombo");
			}

			// Register OK press listener
			var oOkButton = this._oRoutingTargetsDialogFragment.getButtons()[0];
			oOkButton.detachPress(this.onTargetstDialogOk, this);
			var oData = {
				targetSelectedtHandler: fnTargetSelectedtHandler,
				context: oContext
			};
			oOkButton.attachPress(oData, this.onTargetstDialogOk, this);

			this._oRoutingTargetsDialogFragment.open();
		},

		onTargetstDialogOk: function(oEvent, oData) {
			var oTargetsComboBox = sap.ui.getCore().byId("appDescriptorRoutingCombo");
			var sSelectedTarget = oTargetsComboBox.getSelectedKey();
			this._oRoutingTargetsDialogFragment.close();
			oData.targetSelectedtHandler.call(oData.context, sSelectedTarget);
		},

		onTargetstDialogCancel: function() {
			this._oRoutingTargetsDialogFragment.close();
		},

		onComboTargetsChange: function(oEvent) {
			var bIsListItemSelected = !!oEvent.getParameter("selectedItem");
			var oOkButton = this._oRoutingTargetsDialogFragment.getButtons()[0];
			oOkButton.setEnabled(bIsListItemSelected);

		},

		onTargetsDialogClose: function() {
			var oTargetsComboBox = sap.ui.getCore().byId("appDescriptorRoutingCombo");
			oTargetsComboBox.setValue("");
			var oOkButton = this._oRoutingTargetsDialogFragment.getButtons()[0];
			oOkButton.setEnabled(false);
		},
		
		onRouteNameChange: function(oEvent) {
			var sValueState = sap.ui.core.ValueState.None;
			if (oEvent.getParameter("newValue") === "") {
				sValueState = sap.ui.core.ValueState.Error;
			} 
			oEvent.getSource().setValueState(sValueState);
		}
	});
});