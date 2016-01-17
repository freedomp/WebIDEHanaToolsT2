define([
	"sap/watt/common/plugin/platform/service/ui/AbstractConfig"
	], function (AbstractConfig) {
	"use strict";

	return AbstractConfig.extend("sap.watt.common.plugin.basevalidator.service.ValidatorUserSettingConfig", {
		_oContent: null,
		_oView: null,
		_oController: null,
		_sCurrentLintingSettings: null,
		_oCheckModeRBG: null,
    
		getUserPreferenceContent : function()  {
		    var that = this;
			if (!this._oContent) {
				this._oContent = this._createUI();
			}
		    var aStyles = [ {
				uri : "sap/watt/ideplatform/plugin/basevalidator/css/linterSetting.css"
			}];
			var aPromises = [];
			aPromises.push(this.context.service.validatorusersettings.getCurrentLintingSettings());
			aPromises.push(this.context.service.resource.includeStyles(aStyles));
			return Q.all(aPromises).spread(
			    function(sCurrentLintingSettings) {
    				that._sCurrentLintingSettings = sCurrentLintingSettings;
					that._oContent.getModel().setProperty("/modelData", that._sCurrentLintingSettings);
					var levels = {
					    levels: [
    						    {key: "e_w_i", text:"All", value:["error", "warning", "info"]},
    						    {key: "e", text:"Error", value:["error"]},
    						    {key: "e_w", text:"Error and Warning", value:["error","warning"]},
    						    {key: "none", text:"Disable", value:[]}]
					};
					that._oContent.getModel().setProperty("/levelsModel", levels);

					return that._oContent;
            	}).fail(function(oError) {
            	    that._callMessageDialog(oError);
    	        });
		},
			
		saveUserPreference : function() {
		    var that = this;
		    return that._apply();
		},
		
		_createUI: function() {
		    var that = this;
            var oModel = new sap.ui.model.json.JSONModel({"modelData": {}});
		    
			if (that._oView === null) {
				that._oView = sap.ui.view({
    				viewName : "sap.watt.ideplatform.plugin.basevalidator.view.LinterSetting",
    				type : sap.ui.core.mvc.ViewType.XML,
    				viewData : {
    						context : that.context
    				}
				});
				that._oController = that._oView.getController();
        		that._oView.setModel(oModel);
				that.context.i18n.applyTo(that._oView);
			}
			return that._oView;
		},
		
		_apply : function() {
			var modelData = this._oContent.getModel().getData().modelData;
			var that = this;
			return this.context.service.validatorusersettings.setCurrentLintingSettings(modelData)
			.fail(function(oError) {
				that._callMessageDialog(oError);
			}); 
		},

		_callMessageDialog: function(oError) {
			if (!oError.source) {
				throw oError;
			}
			var sDetailedMessage = oError.detailedMessage ? "\n\n" + oError.detailedMessage : "";
			switch (oError.type) {
				case "Warning":
					this.contextcontextcontext.service.usernotification.warning(oError.name + sDetailedMessage).done();
					break;
				case "Info":
					this.contextcontext.service.usernotification.info(oError.name + sDetailedMessage).done();
					break;
				default:
					//ERROR
					this.context.service.usernotification.alert(oError.name + sDetailedMessage).done();
			}
		}
	});
});
