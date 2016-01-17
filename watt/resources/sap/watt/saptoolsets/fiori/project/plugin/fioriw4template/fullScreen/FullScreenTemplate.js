define({

	configWizardSteps : function(oServiceCatalogStep, oTemplateCustomizationStep) {

		var oServiceCatalogStepContent = oServiceCatalogStep.getStepContent();
		var oTemplateCustomizationStepContent = oTemplateCustomizationStep.getStepContent();

		oServiceCatalogStepContent.attachValidation(oTemplateCustomizationStepContent.onSelectedServiceChange,
				oTemplateCustomizationStepContent);

		return [ oServiceCatalogStep, oTemplateCustomizationStep ];
	},

	onBeforeTemplateGenerate : function(templateZip, model) {
		var fnModifyServiceURL = function(sServiceUrl, oConnectionData) {
			var sNewServiceUrl = sServiceUrl;
			if (oConnectionData && oConnectionData.destination) {
				oDestination = oConnectionData.destination;
				if (sServiceUrl.indexOf(oDestination.name) !== -1) {
					var aParts = sServiceUrl.split(oDestination.name);
					sNewServiceUrl = oDestination.path + aParts[1];
				}
			}
			if (sNewServiceUrl.indexOf("/", sNewServiceUrl.length - 1) === -1) {
				sNewServiceUrl += "/";
			}
			return sNewServiceUrl;
		};

		var extractServiceName = function(serviceUrl) {
			var serviceName = undefined;
			// check for parameters
			var indexOfParams = serviceUrl.indexOf("?");
			if (indexOfParams !== -1) { // there are parameters!
				// remove all parameters
				serviceUrl = serviceUrl.substring(0, indexOfParams);
			}
			// check for '$' sign
			var indexOfDollarSign = serviceUrl.indexOf("$");
			if (indexOfDollarSign !== -1) { // there is $ sign!
				// remove it
				serviceUrl = serviceUrl.substring(0, indexOfDollarSign);
			}
			var lastIndexOfSlash = serviceUrl.lastIndexOf("/");
			serviceName = serviceUrl.substring(lastIndexOfSlash + 1);
			if (serviceName.length === 0) {
				serviceName = serviceUrl.substring(0, lastIndexOfSlash);
				lastIndexOfSlash = serviceName.lastIndexOf("/");
				serviceName = serviceName.substring(lastIndexOfSlash + 1);
			}
			return serviceName;
		};

		// modify service url
		var serviceUrl = model.datasource.url;
		if (serviceUrl !== undefined) {
			serviceUrl = fnModifyServiceURL(model.datasource.url, model.connectionData);
			model.datasource.url = serviceUrl;
		}

		var serviceName = "";
		if (serviceUrl === undefined) {
			serviceUrl = ""; // generate empty service URL and empty service name
		} else {
			// extract the service name from the service url
			serviceName = extractServiceName(serviceUrl);
		}

		// update the service name in the model
		model.fullScreen.parameters.ServiceDetails.serviceName = serviceName;
		model.webappPath = "src/main";

		if (!model.neoapp) {
			model.neoapp = {
					destinations : []
			};
		}
		else if (!model.neoapp.destinations) {
			model.neoapp.destinations = [];
		}
		
		model.neoapp.destinations.push({
			"path" : "/",
			"target" : {
				"type" : "application",
				"name" : "parentneoapp",
				"preferLocal" : true
			},
			"description" : "Parent neo-app.json"
		});

		if (sap.watt.getEnv("ui5dist")) {
			model.neoapp.destinations.push({
				"path" : "/src/main/webapp/resources",
				"target" : {
					"type" : "destination",
					"name" : "ui5dist"
				},
				"description" : " SAPUI5 Resources"
			});

			model.neoapp.destinations.push({
				"path" : "/src/main/webapp/test-resources",
				"target" : {
					"type" : "destination",
					"name" : "ui5dist-test-resources"
				},
				"description" : " SAPUI5 Test Resources"
			});
		} else {
			model.neoapp.destinations.push({
				"path" : "/src/main/webapp/resources",
				"target" : {
					"type" : "service",
					"name" : "sapui5",
					"entryPath" : "/resources"
				},
				"description" : " SAPUI5 Resources"
			});

			model.neoapp.destinations.push({
				"path" : "/src/main/webapp/test-resources",
				"target" : {
					"type" : "service",
					"name" : "sapui5",
					"entryPath" : "/test-resources"
				},
				"description" : " SAPUI5 Test Resources"
			});
		}

	},

	onAfterGenerate : function(projectZip, model) {

	},

	validateOnSelection : function(model) {
		return true;
	}

});
