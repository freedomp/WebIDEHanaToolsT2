define(["../manager/ComponentManager",
		"../util/ExtensionProjectSettings"],
	function (ComponentManager, ExtensionProjectSettings) {
		return {
			/**
			 * Performs all the operations required after generating extension/extension project template
			 * This happens after writing the resources to the workspace
			 */
			onAfterGeneration: function (oGeneratedEvent) {
				var services = this.context.service;
				return Q.all([
					ExtensionProjectSettings.createExtensibilityProjectSettings(oGeneratedEvent, services.setting, services.parentproject, services.filesystem, services.ui5projecthandler, services.mockpreview),
					ComponentManager.generatedEventHandler(oGeneratedEvent, this.context.service.uicontent, this.context.service.extensionproject)
				]);
			}
		};
	});