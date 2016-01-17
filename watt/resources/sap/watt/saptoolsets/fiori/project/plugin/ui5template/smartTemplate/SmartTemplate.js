define({
	configWizardSteps: function(oServiceCatalogStep, oAnnotationselection, oTemplateCustomizationStep) {
		return [oServiceCatalogStep, oAnnotationselection, oTemplateCustomizationStep];
	},

	onBeforeTemplateGenerate: function(templateZip, model) {

		// in case the namespace contains dots, replace them with sleshs. fix for mock server.
		Handlebars.registerHelper("formatNamespace", function(namespace) {
			return ("" + namespace).replace(/\./g, "\/");
		});

		this.looksForFacets(model);
		//remove localAnnotation.xml.tmpl if not needed
		if (!model.generate) {
			templateZip.remove('webapp/annotations/annotations.xml.tmpl');
			templateZip.remove('webapp/annotations');
		}
		if (!model.smartTemplate.parameters.ProjectNamespace.value) {
			model.smartTemplate.parameters.ProjectNamespace.value = model.projectName;
		}
		//If internal === true -> generate maven placeholders for project id in manifest.json.tmpl
		model.mode = {
			internal: sap.watt.getEnv("internal")
		};
		return [templateZip, model];
	},

	onBeforeTemplateCustomizationLoaded: function(wizModel, tmplModel) {
		var bInternal = sap.watt.getEnv("internal"); // whether the WebIDE is in SAP-internal or in external-customer mode
		if (!bInternal) { // remove certain parameters in external mode
			var sParamToRemove = "smartTemplate.parameters.ACH"; // leading "@" needs to be removed!
			// to remove parameters from groups, access them here; when groups in model.json are re-arranged, update this selection of the group!
			var aWLGroups = tmplModel.oData.smartTemplate.forms[0].groups;
			var aWLFirstGroupParameters = aWLGroups[0].parameters; // this is the first group of parameters, titled "Application Settings"
			var paramIndex = aWLFirstGroupParameters.indexOf(aWLFirstGroupParameters.resolve(sParamToRemove));
			if (paramIndex > -1) {
				aWLFirstGroupParameters.splice(paramIndex, 1);
			}
			//also remove complete second group for SAP internal values:
			aWLGroups.splice(1, 1);
		}
		return [wizModel, tmplModel];
	},

	addNeoDestinations: function(model) {
		var ui5Resource = {
			"path": "/resources",
			"target": {
				"type": "service",
				"name": "sapui5",
				"preferLocal": true,
				"entryPath": "/resources"
			},
			"description": "SAPUI5 Resources"
		};
		//The following two destinations are for HCP application testing
		var ui5ResourceForFLP = {
			"path": "/sap/ui5/1/resources",
			"target": {
				"type": "service",
				"name": "sapui5",
				"preferLocal": true
			},
			"description": "SAPUI5 dist layer resources"
		};
		var fioriLaunchPad = {
			"path": "/",
			"target": {
				"type": "application",
				"name": "flpsandbox",
				"preferLocal": true
			},
			"description": "Subscribed Fiori LaunchPad"
		};
		var localResources = {
			"path": "/webapp/resources",
			"target": {
				"type": "service",
				"name": "sapui5",
				"entryPath": "/resources"
			},
			"description": "SAPUI5 Resources"
		};
		var localTestResources = {
			"path": "/webapp/test-resources",
			"target": {
				"type": "service",
				"name": "sapui5",
				"entryPath": "/test-resources"
			},
			"description": "SAPUI5 Test Resources"
		};
		if (model.connectionData.destination) {
			var lrep = {
				"path": "/sap/bc/lrep",
				"target": {
					"type": "destination",
					"name": model.connectionData.destination.name,
					"entryPath": "/sap/bc/lrep"
				},
				"description": model.connectionData.destination.name
			};
			model.neoapp.destinations.push(lrep);
		}
		
		//HACK for smart Template to run in runtime with the compatible ui5 version
		ui5Resource.target.version =model.mode.internal? "snapshot":"1.32.4"; 
		ui5ResourceForFLP.target.version = model.mode.internal? "snapshot":"1.32.4";
		localResources.target.version = model.mode.internal? "snapshot":"1.32.4";
		
		model.neoapp.destinations.push(ui5Resource);
		model.neoapp.destinations.push(ui5ResourceForFLP);
		model.neoapp.destinations.push(fioriLaunchPad);
		model.neoapp.destinations.push(localResources);
		model.neoapp.destinations.push(localTestResources);

	},

	getManifest: function(projectZip) {
		var sManifest = projectZip.file("webapp/manifest.json").asText();
		if (sManifest) {
			return JSON.parse(sManifest);
		}
	},

	componentFolderMapping: {},

	usedFolderNames: {},

	getFolderName: function(name) {
		//derive folder names from complete namespace to have short file paths as a result
		var sFolderName = '',
			aPieces = [],
			oFolder = {};
		if (this.componentFolderMapping.hasOwnProperty(name)) {
			sFolderName = this.componentFolderMapping[name];
		} else {
			//Take last segment as folder name
			aPieces = name.split('.');
			sFolderName = aPieces[aPieces.length - 1];
			//If the name was already used by another component name
			if (this.usedFolderNames.hasOwnProperty(sFolderName)) {
				//create an alternative name
				oFolder = this.usedFolderNames[sFolderName];
				if (!oFolder.hasOwnProperty('count')) {
					oFolder.count = 0;
				}
				oFolder.count += 1;
				sFolderName += oFolder.count;
			} else {
				//remember it
				this.usedFolderNames[sFolderName] = {};
			}
			//remember mapping
			this.componentFolderMapping[name] = sFolderName;
		}
		return sFolderName;
	},

	handlePages: function(pages, projectZip) {
		var oI18nFolder = projectZip.folder('webapp/i18n'),
			oI18nPropertiesContent = oI18nFolder.file('pages_i18n.properties').asText(),
			that = this;
		jQuery.each(pages, function(index, page) {
			var oTemplateFolder = oI18nFolder.folder(that.getFolderName(page.component.name)),
				oEntitySetFolder = oTemplateFolder.folder(page.entitySet),
				oFile = oEntitySetFolder.file('i18n.properties');

			if (oFile === null) {
				oFile = oEntitySetFolder.file('i18n.properties', oI18nPropertiesContent);
			}
			if (page.pages instanceof Array && page.pages.length > 0) {
				that.handlePages(page.pages, projectZip);
			}
		});
	},

	generateI18NFolders: function(projectZip, model) {
		var oManifest = this.getManifest(projectZip);
		var oPages = null;

		oPages = oManifest['sap.ui.generic.app'].pages;
		this.handlePages(oPages, projectZip);
	},

	onAfterGenerate: function(projectZip, model) {
		this.generateI18NFolders(projectZip, model);
		projectZip.remove('webapp/i18n/pages_i18n.properties');
		this.addNeoDestinations(model);

		if (!sap.watt.getEnv("internal")) {
			// remove files which are only relevant for SAP-internal usage
			projectZip.remove("pom.xml");
			projectZip.remove("webapp/WEB-INF");

			//this part will only be executed for external builds
			var that = this,
				oBuildSettings = {
					"targetFolder": "dist",
					"sourceFolder": "webapp",
					"excludedFolders": ["test"]
				},
				aProjectSettings = [
					"com.watt.common.builder.sapui5clientbuild"
				];

			this.context.service.filesystem.documentProvider.getDocument("/" + model.projectName).then(function (oProjectDocument) {
				that.context.service.projectType.addProjectTypes(oProjectDocument, aProjectSettings).done();
				that.context.service.setting.project.setProjectSettings("build", oBuildSettings, oProjectDocument).done();
			}).done();
		}


		return [projectZip, model];
	},

	validateOnSelection: function(model) {
		return true;
	},

	looksForFacets: function(oModel) {
		var noFacets = true;
		var oConnectionData = oModel.connectionData;
		var aAnnotations = oModel.annotations;
		if (oConnectionData && aAnnotations) {
			var sServiceName = oConnectionData.serviceName;
			oModel.modelNamespace = sServiceName;
			var oMetaModel = oModel.metaModel;
			var oSmartTemplate = oModel.smartTemplate;
			//Look for facets in the chosen odata collection
			var oEntitySet = oMetaModel.getODataEntitySet(oSmartTemplate.parameters.ODataCollection.value.name);
			if (oEntitySet) {
				oModel.TargetEntityTypeForCollection = oEntitySet.entityType;
				var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				noFacets = !oEntityType.hasOwnProperty("com.sap.vocabularies.UI.v1.Facets");
				//Look for facets in the chosen navigation property if set
				if (oSmartTemplate.parameters.NavigationFromOdataCollection.value) {
					var sNavigationProperty = oSmartTemplate.parameters.NavigationFromOdataCollection.value.name;
					var oAssociationEnd = oMetaModel.getODataAssociationEnd(oEntityType, sNavigationProperty);
					oModel.TargetEntityTypeForNavProp = oAssociationEnd.type;
					var oNavEntityType = oMetaModel.getODataEntityType(oAssociationEnd.type);
					noFacets = !oNavEntityType.hasOwnProperty("com.sap.vocabularies.UI.v1.Facets");
				}
				oModel.generate = noFacets;
			}
		}
	}
});