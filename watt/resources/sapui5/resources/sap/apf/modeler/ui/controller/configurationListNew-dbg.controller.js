sap.ui.controller("sap.apf.modeler.ui.controller.configurationListNew", {
	onInit : function() {
		var oComponent = this.getOwnerComponent();
		if (oComponent) {
			this.oCoreApi = oComponent.oCoreApi;
		}
		// Data
		this.aData = [];
		this.oModel = new sap.ui.model.json.JSONModel({
			tableData : this.aData
		});
		this.oView = this.getView();
		this.oView.setModel(this.oModel);
		// Listen to route changed event.
		sap.ui.core.UIComponent.getRouterFor(this).attachRouteMatched(this._handleRouteChanged.bind(this));
	},
	_handleRouteChanged : function(oEvent) {
		var mEventParams = oEvent.getParameters();
		if (mEventParams.name !== "applicationList") {
			this.sAppId = mEventParams.arguments.appId;
			this._displayApplicationName();
			this._getConfigHandler().then(this._populateConfigList);
			this.oModel.updateBindings();
		}
	},
	_getConfigHandler : function() {
		var self = this;
		var oConfigHandlerDeferred = new jQuery.Deferred();
		this.oCoreApi.getConfigurationHandler(this.sAppId, function(oConfigHandler) {
			self.oConfigHandler = oConfigHandler;
			oConfigHandlerDeferred.resolveWith(self, [ oConfigHandler ]);
		});
		return oConfigHandlerDeferred;
	},
	_populateConfigList : function() {
		var self = this;
		var aConfigList = this.oConfigHandler.getList();
		aConfigList.forEach(function (oConfig) {
			self.aData.push({
				AnalyticalConfiguration : oConfig.AnalyticalConfiguration,
				Application : oConfig.Application,
				name : oConfig.AnalyticalConfigurationName,
				type : sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CONFIGURATION
			});
		});
		this.oModel.updateBindings();
	},
	_displayApplicationName : function() {
		var self = this;
		this.oCoreApi.getApplicationHandler(function (oApplicationHandler) {
			var sAppName = oApplicationHandler.getApplication(self.sAppId).ApplicationName;
			self.byId("idConfigTitleMaster").setText(self.oCoreApi.getText("configurationObjectTitle") + " : " + sAppName);
		});
	}
});