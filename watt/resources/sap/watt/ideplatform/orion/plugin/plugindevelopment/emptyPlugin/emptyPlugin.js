define({

	configWizardSteps : function(oTemplateCustomizationStep) {

		return [ oTemplateCustomizationStep ];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
		model.i18nGuid = this._generateGuid();
		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {
		var that = this;
		// Remove sample code files from zip if user didn't want to include sample code
		if (!model.emptyPlugin.parameters.includeSample.value) {
			projectZip.remove("command/HelloWorld.js");
			projectZip.remove("css/helloWorld.css");
			projectZip.remove("service/Sample.js");
			projectZip.remove("service/Sample.json");
		}

		// Add plugin project settings
		return this.context.service.filesystem.documentProvider.getDocument("/" + model.projectName).then(function(oTargetDocument) {
			if (oTargetDocument) {
				var oProject = that.context.service.setting.project;
				var oPluginDevelopment = that.context.service.plugindevelopment;
				return oProject.get(that.context.service.plugindevelopment, oTargetDocument).then(function(mSettings) {
					var oSettings = {};
					if (mSettings) {
						oSettings = mSettings;
					}

					oSettings.dependencies = {
						"all" : []
					};
					oSettings.devUrlParameters = {
						"sap-ide-debug" : "false"
					};

					return oProject.set(oPluginDevelopment, oSettings, oTargetDocument).then(function() {
						return [ projectZip, model ];
					});
				});
			} else {
				throw new Error(that.context.i18n.getText("i18n", "emptyPlugin_writing_settings_error"));
			}
		});
	},

	_generateGuid : function() {
		return this._generate4Chars() + this._generate4Chars() + '-' + this._generate4Chars() + '-' + this._generate4Chars() + '-'
				+ this._generate4Chars() + '-' + this._generate4Chars() + this._generate4Chars() + this._generate4Chars();

	},

	_generate4Chars : function() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
});