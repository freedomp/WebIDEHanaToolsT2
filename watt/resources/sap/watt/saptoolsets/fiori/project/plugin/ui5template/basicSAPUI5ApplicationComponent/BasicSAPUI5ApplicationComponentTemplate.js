define([ "sap/watt/lib/jszip/jszip-shim" ], function(JSZip) {
	return {
		configWizardSteps : function(oTemplateCustomizationStep) {
			return [ oTemplateCustomizationStep ];
		},

		zipFilesMap : {
				"JavaScript" : [ "View1.controller.js.tmpl", "Mobile.view.js.tmpl" ],
				"XML" :        [ "View1.controller.js.tmpl", "Mobile.view.xml.tmpl" ],
				"HTML" :       [ "View1.controller.js.tmpl", "Mobile.view.html.tmpl" ],
				"JSON" :       [ "View1.controller.js.tmpl", "Mobile.view.json.tmpl" ]
		},

		onBeforeTemplateGenerate : function(templateZip, model) {
			var sViewType = model.basicSAPUI5ApplicationComponent.parameters.ViewTypesCollection.value.value;
			var sViewNamespace = model.basicSAPUI5ApplicationComponent.parameters.namespace.value;
			var viewName = model.basicSAPUI5ApplicationComponent.parameters.name.value;

			var newZip = new JSZip();
			//switch case for the view type
				switch (sViewType.toLowerCase()) {
    				case "xml":
    					var aMobileXmlFiles = this.zipFilesMap.XML;
    					this._addFilesToNewZip(aMobileXmlFiles, newZip, templateZip);
    					break;
    				case "json":
    					var aMobileJsonFiles = this.zipFilesMap.JSON;
    					this._addFilesToNewZip(aMobileJsonFiles, newZip, templateZip);
    					break;
    				case "javascript":
    					var aMobileJavaScriptFiles = this.zipFilesMap.JavaScript;
    					this._addFilesToNewZip(aMobileJavaScriptFiles, newZip, templateZip);
    					break;
    				case "html":
    					var aMobileHtmlFiles = this.zipFilesMap.HTML;
    					this._addFilesToNewZip(aMobileHtmlFiles, newZip, templateZip);
    					break;
				}

			if (viewName === undefined) {
				viewName = "View1";
				model.basicSAPUI5ApplicationComponent.parameters.name.value = viewName;
			}

			var sPathInsideProject = "";
			if (sViewNamespace === undefined || sViewNamespace.trim().length === 0) {
				sPathInsideProject = this._getFolerPathInProject(model);

				if (sPathInsideProject.length > 0) {
					model.viewNamespace = sPathInsideProject + "." + viewName;
				} else {
					model.viewNamespace = viewName;
				}
				model.basicSAPUI5ApplicationComponent.parameters.namespace.value = sPathInsideProject;
			} else {
				sPathInsideProject = this._getFolerPathInProject(model);

				if (sPathInsideProject.trim().length > 0) {
					model.viewNamespace = sViewNamespace + "." + sPathInsideProject + "." + viewName;
				} else {
					model.viewNamespace = sViewNamespace + "." + viewName;
				}
			}

			return [ newZip, model ];
		},

		_getFolerPathInProject : function(model) {

			var path = model.componentPath;
			var idx = path.indexOf("/", 1) + 1;
			var sPathInProject = "";
			if (idx > 0) {
				sPathInProject = path.substring(idx).replace(new RegExp("/", "g"), ".");
			}
			return sPathInProject;
		},

		_addFilesToNewZip : function(aFiles, oNewZip, oOldZip) {
			for ( var i = 0; i < aFiles.length; i++) {
				var sFileName = aFiles[i];
				oNewZip.file(sFileName, oOldZip.file(sFileName).asText());
			}
		},

		onAfterGenerate : function(projectZip, model) {
			var viewName = model.basicSAPUI5ApplicationComponent.parameters.name.value;
			var newZip = new JSZip();

			for ( var file in projectZip.files) {
				var iFile = projectZip.files[file];
				var name = iFile.name;
				var newName = "";
				if (name.indexOf("controller") === -1) {
					newName = viewName + name.substring(name.indexOf("."));
				} else {
					newName = viewName + ".controller.js";
				}
				var data = iFile._data;
				var options = iFile.options;
				newZip.file(newName, data, options);
			}

			return [ newZip, model ];
		}
	};
});
