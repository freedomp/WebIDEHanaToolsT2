define(["sap/watt/lib/jszip/jszip-shim"], function(JSZip) {
	return function() {
		return {

			configWizardSteps: function(oTemplateCustomizationStep) {
				return [oTemplateCustomizationStep];
			},

			mFilesToRemove: {
				"JavaScript": ["webapp/view/temp.view.xml.tmpl", "webapp/view/temp.view.html.tmpl", "webapp/view/temp.view.json.tmpl",
					"webapp/view/folderInfo.txt", "webapp/controller/folderInfo.txt"
				],
				"XML": ["webapp/view/temp.view.js.tmpl", "webapp/view/temp.view.html.tmpl", "webapp/view/temp.view.json.tmpl",
					"webapp/view/folderInfo.txt", "webapp/controller/folderInfo.txt"
				],
				"HTML": ["webapp/view/temp.view.xml.tmpl", "webapp/view/temp.view.js.tmpl", "webapp/view/temp.view.json.tmpl",
					"webapp/view/folderInfo.txt", "webapp/controller/folderInfo.txt"
				],
				"JSON": ["webapp/view/temp.view.xml.tmpl", "webapp/view/temp.view.html.tmpl", "webapp/view/temp.view.js.tmpl",
					"webapp/view/folderInfo.txt", "webapp/controller/folderInfo.txt"
				],
				"None": ["webapp/view/temp.view.xml.tmpl", "webapp/view/temp.view.html.tmpl", "webapp/view/temp.view.js.tmpl",
					"webapp/view/temp.view.json.tmpl", "webapp/controller/temp.controller.js.tmpl"
				]
			},

			onBeforeTemplateGenerate: function(templateZip, model) {
				if (!model.basicSAPUI5ApplicationProject.parameters.namespace.value) {
					model.basicSAPUI5ApplicationProject.parameters.namespace.value = model.projectName;
				}

				// in case the namespace contains dots, replace them with sleshs. Only relevant for the reference to model/models in component.js
				Handlebars.registerHelper("formatNamespace", function(namespace) {
					return ("" + namespace).replace(/\./g, "\/");
				});

				model.selectedTemplateId = model.selectedTemplate.getId();
				model.selectedTemplateVersion = model.selectedTemplate.getVersion();

				var sViewType = model.basicSAPUI5ApplicationProject.parameters.ViewTypesCollection.value.value;
				var sViewNamespace = model.basicSAPUI5ApplicationProject.parameters.namespace.value;
				var viewName = model.basicSAPUI5ApplicationProject.parameters.name.value;

				//switch case for the view type
				var sapViewType = "";
				switch (sViewType.toLowerCase()) {
					case "xml":
						sapViewType = "sap.ui.core.mvc.ViewType.XML";
						model.basicSAPUI5ApplicationProject.hasView = true;

						var aMobileXmlFiles = this.mFilesToRemove.XML;
						this._removeFilesFromZip(aMobileXmlFiles, templateZip);
						break;
					case "json":
						sapViewType = "sap.ui.core.mvc.ViewType.JSON";
						model.basicSAPUI5ApplicationProject.hasView = true;

						var aMobileJsonFiles = this.mFilesToRemove.JSON;
						this._removeFilesFromZip(aMobileJsonFiles, templateZip);
						break;
					case "js":
						sapViewType = "sap.ui.core.mvc.ViewType.JS";
						model.basicSAPUI5ApplicationProject.hasView = true;

						var aMobileJavaScriptFiles = this.mFilesToRemove.JavaScript;
						this._removeFilesFromZip(aMobileJavaScriptFiles, templateZip);
						break;
					case "html":
						sapViewType = "sap.ui.core.mvc.ViewType.HTML";
						model.basicSAPUI5ApplicationProject.hasView = true;

						var aMobileHtmlFiles = this.mFilesToRemove.HTML;
						this._removeFilesFromZip(aMobileHtmlFiles, templateZip);
						break;
					case "none":
						model.basicSAPUI5ApplicationProject.hasView = false;

						var aMobileNoViewFiles = this.mFilesToRemove.None;
						this._removeFilesFromZip(aMobileNoViewFiles, templateZip);
						break;
				}

				model.sapViewType = sapViewType;

				if (viewName === undefined) {
					viewName = "View1";
					model.basicSAPUI5ApplicationProject.parameters.name.value = viewName;
				}

				if (sViewNamespace === undefined) {
					sViewNamespace = "view";
					model.basicSAPUI5ApplicationProject.parameters.namespace.value = sViewNamespace;
					model.viewNamespace = sViewNamespace + "." + viewName;
				} else {
					model.viewNamespace = sViewNamespace + ".view." + viewName;
				}

				model.mode = {
					internal: sap.watt.getEnv("internal")
				};

				return [templateZip, model];
			},

			_removeFilesFromZip: function(aFiles, oZip) {
				for (var i = 0; i < aFiles.length; i++) {
					var sFileName = aFiles[i];
					oZip.remove(sFileName);
				}
			},

			onAfterGenerate: function(projectZip, model) {
				var newZip = new JSZip();
				var viewFolder = null;
				var controllerFolder = null;

				var viewName = model.basicSAPUI5ApplicationProject.parameters.name.value;
				var sViewType = model.basicSAPUI5ApplicationProject.parameters.ViewTypesCollection.value.value;
				if (sViewType !== "None") {
					viewFolder = newZip.folder("webapp/view");
					controllerFolder = newZip.folder("webapp/controller");
				}
				var newName = "";
				for (var file in projectZip.files) {
					var iFile = projectZip.files[file];
					var name = iFile.name;
					var data = iFile._data;
					var options = iFile.options;

					if (!options.dir) {
						if ((name.indexOf("webapp/controller/temp.controller") === 0) && (controllerFolder !== null)) {
							newName = name.replace("webapp/controller/temp", viewName);
							controllerFolder.file(newName, data, options);
						} else if ((name.indexOf("webapp/view/temp.view") === 0) && (viewFolder !== null)) {
							newName = name.replace("webapp/view/temp", viewName);
							viewFolder.file(newName, data, options);
						} else {
							newZip.file(name, data, options);
						}
					}
				}

				if (!sap.watt.getEnv("internal")) {
					//this part will only be executed for external builds
					var that = this,
						oBuildSettings = {
							"targetFolder": "dist",
							"sourceFolder": "webapp"
						},
						aProjectSettings = [
							"com.watt.common.builder.sapui5clientbuild"
						];
		
					this.context.service.filesystem.documentProvider.getDocument("/" + model.projectName).then(function (oProjectDocument) {
						that.context.service.projectType.addProjectTypes(oProjectDocument, aProjectSettings).done();
						that.context.service.setting.project.setProjectSettings("build", oBuildSettings, oProjectDocument).done();
					}).done();
				}

				return [newZip, model];
			}
		};
	};
});