define({

	onBeforeTemplateGenerate : function(templateZip, model) {

		return [ templateZip, model ];
	},

	onAfterGenerate : function(projectZip, model) {

		return [ projectZip, model ];
	}

});