define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig", "../util/RulesManager"],
		function(AbstractConfig, rulesManager) {
	"use strict";
	return AbstractConfig.extend("sap.watt.common.plugin.linter.basevalidator.ValidatorProjectSettingConfig", {
		
		_oValidatorView : null,
		_oValidatorController : null,
		
		getProjectSettingContent : function(id, group, sProjectPath) {//id, group, sProjectPath) {
			if (!this._oValidatorView) {
                this._oValidatorView = sap.ui.view({
    				viewName : "sap.watt.ideplatform.plugin.basevalidator.view.XmlValidatorSetting",
    				type : sap.ui.core.mvc.ViewType.XML,
    				viewData : {
    					context : this.context,
    					projectPath: sProjectPath
    				}
    			});
			}else{
				this._oValidatorView.getController().setProjectPath(sProjectPath);
			}
			this._oValidatorView._projectPath = sProjectPath;
			this._oValidatorController = this._oValidatorView.getController();
			return this._oValidatorView;
		},

		_getRulesManagerInst : function(sProjectPath){
			var oController = this._oValidatorView.getController();
			var serviceId = oController.getSelectedServiceId();
			var that = this;
			return this.context.service.basevalidator.getCurrentValidatorServiceProxyById(serviceId)
				.then(function(validatorProxy) {
					return rulesManager.get(that.context, validatorProxy, sProjectPath).then(function(rulesManagerInst){
						return rulesManagerInst;
					});
				});
		},

		saveProjectSetting : function(id, group, sProjectPath) {
			var that = this;
			return this._getRulesManagerInst(sProjectPath).then(function(rulesManagerInst){
				if (rulesManagerInst) {
					var oController = that._oValidatorView.getController();
					var settings = oController.getConfiguredValues();
					return rulesManagerInst.saveValidatorConfiguration(settings).then(function(){
						return that.context.service.basevalidator.validatorConfigurationsChangeHandler(sProjectPath);
					});
				}
			});
		}

	});
});