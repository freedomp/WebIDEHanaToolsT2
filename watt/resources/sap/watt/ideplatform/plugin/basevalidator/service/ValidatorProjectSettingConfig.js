define(["sap/watt/common/plugin/platform/service/ui/AbstractConfig", "../util/RulesManager"],
		function(AbstractConfig, rulesManager) {
	"use strict";
	return AbstractConfig.extend("sap.watt.common.plugin.linter.basevalidator.ValidatorProjectSettingConfig", {
		
		_oValidatorView : null,
		_oValidatorController : null,
		
		_getfileExtensionByMenueId: function(sMenuId){
		    if (sMenuId === "esLintSetting") {
		    	return "js";
		    }
		},
		
		getProjectSettingContent : function(id, group, sProjectPath) {//id, group, sProjectPath) {
			var that = this;
			if (!that._oValidatorView) {
                that._oValidatorView = new sap.ui.view({
    				viewName : "sap.watt.ideplatform.plugin.basevalidator.view.ValidatorSetting",
    				type : sap.ui.core.mvc.ViewType.XML,
    				viewData : {
    					context : that.context,
    					rulesManager: rulesManager,
    					projectPath: sProjectPath
    				}
    			});
			}else{
				this._oValidatorView.getController().setProjectPath(sProjectPath);
			}
			that._oValidatorView._projectPath = sProjectPath;
			that._oValidatorController = that._oValidatorView.getController();
			return that._oValidatorView;
		},

		saveProjectSetting : function(id, group, sProjectPath) {
		    var errorMsg = this._oValidatorController.getErrorMessgae();
		    if (errorMsg) {
		        //throw new Error(errorMsg);
		        return Q.reject(errorMsg);
		    }
		    var rulesManagerInst = this._oValidatorController.getRulesManagerInst();
		    if (rulesManagerInst) {
                var settings = this._oValidatorController.getConfiguredValues();
				var that = this;
				return rulesManagerInst.saveValidatorConfiguration(settings).then(function(){
					return that.context.service.basevalidator.validatorConfigurationsChangeHandler(sProjectPath);
				});
		    }
		}

	});
});