define(function() {

	var HeliumExtensionProject = function() {
		var that = this;

		var generateExtensionProject = function(extensionProjectPath, result, oProjectFolderDocument) {
			return that.context.service.template.getTemplatesPerCategories("Fiori_project").then(function(mTemplatesByCategory) {
				var selectedTemplate = mTemplatesByCategory[0].templates[0];
				result.model.selectedTemplate = selectedTemplate;
				return that.context.service.generation.generate(extensionProjectPath, selectedTemplate, result.model, true, oProjectFolderDocument);
			});
		};

		// system contains: account, appname
		// credential contains: username and password 
		this.create = function(extensionProjectName, system) {
		    system.type = "application"; 
		    if (system.providerAccount) {
			   system.type = "subscription"; 
			}
			
			// validate the cloned parent application
			return that.context.service.parentproject.validateParentProject(system.application, "hcp", system).then(function(result) {
				if (result.isValid === true) {
					// add "system" block to .project.json
					// with the account, application and repository
					result.model.extensibility.system = {};
					result.model.extensibility.system.account = system.account;
					result.model.extensibility.system.type = system.type;
					if (system.providerAccount) {
					   result.model.extensibility.system.providerAccount = system.providerAccount; 
					   result.model.extensibility.system.providerName = system.providerName; 
					}
					
					result.model.extensibility.system.application = system.name;
					result.model.extensibility.type = "hcp";
					result.model.projectName = extensionProjectName;

					return that.context.service.filesystem.documentProvider.getRoot().then(function(oRoot) {
						return oRoot.createFolder(extensionProjectName).then(function(extProjectDocument) {
							var extProjectPath = extProjectDocument.getEntity().getFullPath();
							return generateExtensionProject(extProjectPath, result, extProjectDocument);
						});
					});
				} else { // isValid === false
					throw new Error(result.message);
				}
			});
		};
	};

	return HeliumExtensionProject;
});