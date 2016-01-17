define(function() {
	"use strict";

	return {
		configWizardSteps: function(oTemplateCustomizationStep) {
			return [oTemplateCustomizationStep];
		},

		onBeforeTemplateGenerate: function(templateZip, oModel) {
			return [templateZip, oModel];
		},

		onAfterGenerate: function(projectZip, oModel) {
			this._updateProject(oModel);
		},

		validateOnSelection: function(oModel) {
			return true;
		},

		_createPayload: function(oModel) {
			var oPackage = oModel.nodejsXsjsProject.parameters.nodejs.package;
			var oContent = {
				"name": oModel.projectName,
				"type": "sap.nodejs",
				"attributes": {
					"nodejs.package.name": [oModel.projectName],
					"nodejs.package.version": [oPackage.version.value],
					"nodejs.package.description": [oPackage.description.value],
					"nodejs.package.main": [oPackage.main.value],
					"nodejs.package.enableXsjs": [oPackage.enableXsjs.value]
				},
				"builders": {
					"default": "sap.nodejs",
					"configs": {
						"sap.nodejs": {
							"options": {}
						}
					}
				},
				"runners": {
					"default": "system:/sap.nodejs/default",
					"configs": {
						"system:/sap.nodejs/default": {
							"options": {}
						}
					}
				}
			};

			return oContent;
		},

		_updateProject: function(oModel) {
			var that = this;
			var sParentPath;
			if (oModel.selectedDocument.getEntity().isFile()) {
				sParentPath = oModel.selectedDocument.getEntity().getParentPath();
			} else {
				sParentPath = oModel.selectedDocument.getEntity().getFullPath();
			}
			var sPath = sParentPath + "/" + oModel.projectName;
			return this.context.service.document.getDocumentByPath(sPath).then(function(oDocument) {
				var oProjectFolder = oDocument;
				return oDocument.getProject().then(function(oProjectDocument) {
					var oProjectData = that._createPayload(oModel);
					return oProjectDocument.updateProject(oProjectData).then(function() {
						return oProjectDocument.refresh();
					});
				});
			}).fail(function(sError) {
				var message = that.context.i18n.getText("NodejsXsjsProjectTemplate.updateProject.failed_xmsg", [sPath]);
				that.context.service.log.error(message, ["user"]).done();
			});
		}
	};
});
