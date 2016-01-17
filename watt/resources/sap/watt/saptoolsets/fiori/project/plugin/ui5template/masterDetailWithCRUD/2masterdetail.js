define({

	/**
	 *	SAPUI5 Web IDE templates 1.34
	 */

	/**
	 * Applies template logic before generating the template resources in the provided zip file.
	 *
	 * This method is executed before passing the model into the template resources,
	 * and is therefore ideal for model manipulations.
	 *
	 * Note that this method is not called for templates that do not include resources.
	 *
	 * @param templateZip The zip bundle containing the template resources that are about to be generated,
	 * as provided by the template.
	 *
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	onBeforeTemplateGenerate: function(templateZip, model) {

		Handlebars.registerHelper("formatNamespace", function(namespace) {
			// cast to string is a hack for ticket #1570474199 if it is fixed, we can remove it
			return ("" + namespace).replace(/\./g, "\/");
		});
		Handlebars.registerHelper("formatUrl", function(url) {
			if (url === undefined) {
				return "/here/goes/your/serviceurl/";
			} else {
				// add a trailing slash, since mockserver will break if there is no /
				if (url.lastIndexOf("/") !== (url.length - 1)) {
					url = url + "/";
				}

				return url;
			}
		});
		Handlebars.registerHelper("needQuots", function(sType, oOptions) {
			if (sType === "String" || sType === "LargeString") {
				return oOptions.fn(this);
			}
			return oOptions.inverse(this);
		});

		Handlebars.registerHelper("doubleCurlyBrackets", function(sString) {
			return "{{" + sString + "}}";
		});

		Handlebars.registerHelper("singleCurlyBracket", function(sString) {
			return "{" + sString;
		});

		Handlebars.registerHelper('if_eq', function(s1, s2, opts) {
			if (s1 === s2) {
				return opts.fn(this);
			} else {
				return opts.inverse(this);
			}
		});

		Handlebars.registerHelper("isLastItem", function(arr, options) {
			if (options.inverse && !arr.length) {
				return options.inverse(this);
			}

			return arr.map(function(item, index) {
				item.$index = index;
				item.$notlast = index !== arr.length - 1;
				item.$last = index === arr.length - 1;
				return options.fn(item);
			}).join('');
		});

		Handlebars.registerHelper('create_id', function(text) {
			return text.replace("/", "_") + "_id";
		});

		Handlebars.registerHelper('replace_slash', function(text) {
			return text.replace("/", "_");
		});

		Handlebars.registerHelper("handleKeys", function(sItem, data, options) {
			var ret = "";
			for (var i = 0, j = data.length; i < j; i++) {
				if (data[i].isKey) {
					var sKey = data[i].name;
					// need to add the linebreak and tabs manually for formatting
					ret += sKey + ': encodeURIComponent(' + sItem + '.getBindingContext().getProperty("' + sKey + '")),\n\t\t\t\t\t';
				}
			}
			// finally remove the linebreaks, tabs and the trailing comma...
			ret = ret.substring(0, ret.length - 7);
			return ret;
		});

		Handlebars.registerHelper("handleRoutingPattern", function(data, options) {
			var sPattern = data + "/",
				oElements = model["2masterdetail"].parameters.ObjectCollection.value.elements;
			for (var i = 0, j = oElements.length; i < j; i++) {
				if (oElements[i].isKey) {
					var sKey = oElements[i].name;
					sPattern += "{" + sKey + "}/";
				}
			}
			sPattern = sPattern.substring(0, sPattern.length - 1);
			return sPattern;
		});

		Handlebars.registerHelper("handleUrl", function(data, options) {
			var ret = "";
			data.forEach(function(elem, index) {
				ret += "oBindingContext.getProperty('" + elem + "')" + "+'/'+";
			});
			ret = ret.substring(0, ret.length - 5);
			return ret;
		});

		Handlebars.registerHelper("handleEnabledBinding", function(required, creatable, updatable, options) {
			if (required && updatable) {
				return "true";
			} else if (required && !updatable) {
				return "{= ${viewModel>/mode} === 'edit'? false: true}";
			}else {
				if (creatable && updatable) {
					return "true";
				} else if (!creatable && !updatable) {
					return "false";
				} else if (creatable && !updatable) {
					return "{= ${viewModel>/mode} === 'edit'? false: true}";
				} else if (updatable && !creatable) {
					return "{= ${viewModel>/mode} === 'edit'? true: false}";
				}
			}
		});

		var oParameters = model["2masterdetail"].parameters;
		// no whitespace / \ . -
		// cast to string is a hack for ticket #1570474199 if it is fixed, we can remove it
		oParameters.append("NavigationIntent", ("" + oParameters.ApplicationTitle.value).replace(new RegExp("\\.|/|\\\\|-|\\s", "g"), ""));

		// make internal/external status available in template generation
		if (sap.watt.getEnv("internal")) {
			model["2masterdetail"].environment.internal = "true";
			model["2masterdetail"].environment.uuid = this._generateUUID();
		}

		// check whether the generated app should have an FLP dependency or not (e.g. for OpenUI5)
		if (document.location.search.indexOf("sap-ui-template-nonFLP") > -1) { // undocumented URL parameter for now...
			model["2masterdetail"].parameters.nonFLP = "true";
		}

		var that = this;

		return this.context.service.odataProvider.validateMetadata(model.connectionData.metadataContent).then(function(oMetaData) {
			var sEntityNameSpaceLength = oMetaData.dataServices.schema[0].namespace.length;
			var sEntityFullName = model["2masterdetail"].parameters.ObjectCollection.value.entityType;

			// Extract the Entity name without the namespace
			var sEntityName = sEntityFullName.substring(sEntityNameSpaceLength + 1);
			var aEntityProperties = [];
			for (var i = 0; i < oMetaData.dataServices.schema[0].entityType.length; i++) {
				if (oMetaData.dataServices.schema[0].entityType[i].name === sEntityName) {
					aEntityProperties = oMetaData.dataServices.schema[0].entityType[i].property;
					break;
				}
			}
			var oEntityElements = model["2masterdetail"].parameters.ObjectCollection.value.elements;
			// get all complex types names in the service
			var aComplexTypes = oMetaData.dataServices.schema[0].complexType;
			var aRelevantComplexTypesProp = [];
			var aComplexTypesNames = [];
			var sServiceNamespace = oMetaData.dataServices.schema[0].namespace;
			if (aComplexTypes && aComplexTypes.length > 0) {
				for (var j = 0; j < aEntityProperties.length; j++) {
					for (var t = 0; t < aComplexTypes.length; t++) {
						if (aEntityProperties[j].type === sServiceNamespace + "." + aComplexTypes[t].name) {
							aComplexTypesNames.push({
								name: aEntityProperties[j].name
							});
							if (aEntityProperties[j].nullable === "false") {
								for (var n = 0; n < aComplexTypes[t].property.length; n++) {
									aComplexTypes[t].property[n].nullable = "false";
								}
							}
							aRelevantComplexTypesProp.push(aComplexTypes[t].property);
						}
					}
				}
			}
			// store the complex types names in the model
			model["2masterdetail"].aComplexTypesNames = aComplexTypesNames;

			for (var m = 0; m < oEntityElements.length; m++) {
				var oMetaDataProperty = that.getMetaDataPropertyByName(oEntityElements[m].name, aRelevantComplexTypesProp, aEntityProperties);
				if (oMetaDataProperty) {
					var aExtensions = oMetaDataProperty.extensions;
					that.updateElementFromExtensions(oEntityElements[m], aExtensions);
					oEntityElements[m].constraints = that.getConstraintsByType(oMetaDataProperty);
					oEntityElements[m].type = oMetaDataProperty.type;
					oEntityElements[m].nullable = oMetaDataProperty.nullable;

					if (oEntityElements[m].nullable === "false") {
						oEntityElements[m].constraints.push({
							name: "nullable",
							value: false
						});
					}

				}
			}

			var aControls = that.getEntityControls(model);
			that.buildFormElements(aControls, model);
			return [templateZip, model];

		});
	},

	updateElementFromExtensions: function(oEntityElement, aExtensions) {
		if (aExtensions) {
			for (var k = 0; k < aExtensions.length; k++) {
				switch (aExtensions[k].name) {
					case "label":
						oEntityElement.label = aExtensions[k].value;
						break;
					case "creatable":
						if (aExtensions[k].value === "false") {
							oEntityElement.creatable = false;
						}
						break;
					case "updatable":
						if (aExtensions[k].value === "false") {
							oEntityElement.updatable = false;
						}
						break;
					default:
						//do Nothing	
				}
			}
		}
		if (oEntityElement.creatable === undefined) {
			oEntityElement.creatable = true;
		}
		if (oEntityElement.updatable === undefined) {
			oEntityElement.updatable = true;
		}
	},

	getConstraintsByType: function(oMetaDataProperty) {
		var aConstraints = [];
		switch (oMetaDataProperty.type) {
			case "Edm.String":
				if (oMetaDataProperty.maxLength) {
					aConstraints.push({
						name: "maxLength",
						value: oMetaDataProperty.maxLength
					});
				}
				break;
			case "Edm.Decimal":
				if (oMetaDataProperty.precision) {
					aConstraints.push({
						name: "precision",
						value: oMetaDataProperty.precision
					});
				}
				if (oMetaDataProperty.scale) {
					aConstraints.push({
						name: "scale",
						value: oMetaDataProperty.scale
					});
				}
				break;
			default:
				//do Nothing	
		}
		return aConstraints;
	},

	getSAPUI5Type: function(sOdataType) {
		var sSapUI5Type;
		switch (sOdataType) {
			case "Edm.String":
				sSapUI5Type = "sap.ui.model.odata.type.String";
				break;
			case "Edm.Decimal":
				sSapUI5Type = "sap.ui.model.odata.type.Decimal";
				break;
			case "Edm.Int32":
				sSapUI5Type = "sap.ui.model.odata.type.Int32";
				break;
			case "Edm.DateTime":
				sSapUI5Type = "sap.ui.model.odata.type.DateTime";
				break;
			case "Edm.Byte":
				sSapUI5Type = "sap.ui.model.odata.type.Byte";
				break;
			case "Edm.Time":
				sSapUI5Type = "sap.ui.model.odata.type.Time";
				break;
			case "Edm.Guid":
				sSapUI5Type = "sap.ui.model.odata.type.Guid";
				break;
			default:
				sSapUI5Type = "sap.ui.model.odata.type.String";
		}
		return sSapUI5Type;
	},

	getMetaDataPropertyByName: function(sPropName, aRelevantComplexTypesProp, aEntityProperties) {
		for (var i = 0; i < aRelevantComplexTypesProp.length; i++) {
			var aSingleComplexArray = aRelevantComplexTypesProp[i];
			for (var e = 0; e < aSingleComplexArray.length; e++) {
				if (sPropName.indexOf(aSingleComplexArray[e].name, sPropName.length - aSingleComplexArray[e].name.length) !== -1) {
					return aSingleComplexArray[e];
				}
			}
		}

		for (var j = 0; j < aEntityProperties.length; j++) {
			if (aEntityProperties[j].name === sPropName) {
				return aEntityProperties[j];
			}
		}
	},

	buildFormElements: function(aControls, model) {
		var aFormElements = [];
		for (var m = 0; m < aControls.length; m++) {
			// if (this.shouldControlBeGenaratedInCreateScreen(aControls[m])) {
			aFormElements.push({
				constraints: aControls[m].constraints,
				type: aControls[m].type,
				label: aControls[m].label,
				fields: [aControls[m].control],
				require: aControls[m].require,
				name: aControls[m].name,
				creatable: aControls[m].creatable,
				updatable: aControls[m].updatable
			});
			// }
		}

		model["2masterdetail"].aFormElements = aFormElements;
	},

	// shouldControlBeGenaratedInCreateScreen: function(oControl) {
	// 	// If Nullable equals false , the control should be displayed
	// 	if (oControl.require) {
	// 		return true;
	// 	} else {
	// 		return oControl.creatable;
	// 	}
	// },

	getEntityControls: function(model) {
		var aEntityProperties = [];
		var aResult = [];

		aEntityProperties = model["2masterdetail"].parameters.ObjectCollection.value.elements;
		for (var k = 0; k < aEntityProperties.length; k++) {
			var sLabelText = "";
			var bIsRequire;
			var oControl;
			switch (aEntityProperties[k].type) {
				case "Edm.String":
					oControl = "sap.m.Input";
					break;
				case "Edm.DateTime":
					oControl = "sap.m.DateTimeInput";
					break;
				case "Edm.Boolean":
					oControl = "sap.m.CheckBox";
					break;
				default:
					oControl = "sap.m.Input";
			}

			sLabelText = (aEntityProperties[k].label) ? aEntityProperties[k].label : aEntityProperties[k].name;
			if (aEntityProperties[k].nullable && aEntityProperties[k].nullable === "false") {
				bIsRequire = true;
			} else {
				bIsRequire = false;
			}
			aResult.push({
				type: this.getSAPUI5Type(aEntityProperties[k].type),
				constraints: aEntityProperties[k].constraints,
				label: sLabelText,
				require: bIsRequire,
				name: aEntityProperties[k].name,
				creatable: aEntityProperties[k].creatable,
				updatable: aEntityProperties[k].updatable,
				control: oControl,
				entity: aEntityProperties[k]
			});

		}
		return aResult;
	},

	/**
	 * Applies template logic after generating the template resources according to the template model
	 * and bundling the generated resources into the provided zip file.
	 *
	 * This method is executed after passing the model into the template resources
	 * but before extracting the generated project zip file to the SAP RDE workspace.
	 * Therefore, this method is ideal for manipulating the generated project files
	 * (for example, renaming files according to the template model).
	 *
	 * @param projectZip The zip bundle containing all the generated project resources,
	 * after applying the model parameters on the template resources.
	 *
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	onAfterGenerate: function(projectZip, model) {
		// workaround for ticket 1570573232 metadata got lost when it was specified in plugin.json in some cases
		projectZip.file("webapp/localService/metadata.xml", model.connectionData.metadataContent, {
			createFolders: true
		});

		// get rid of the mockdata since it is not matching the service of the created app
		projectZip.remove("webapp/localService/mockdata");
		// remove files which are only relevant for SAP-internal usage
		if (!sap.watt.getEnv("internal")) {
			projectZip.remove("pom.xml");
			projectZip.remove("extensionDocu.properties");
			projectZip.remove("webapp/WEB-INF");
		}

		if (!model["2masterdetail"].parameters.Object_Number.value) {
			projectZip.remove("webapp/model/grouper.js");
			projectZip.remove("webapp/test/unit/model/grouper.js");
		}
		if (sap.watt.getEnv("internal")) {
			return;
		}

		//this part will only be executed for external builds
		var that = this,
			oBuildSettings = {
				"targetFolder": "dist",
				"sourceFolder": "webapp",
				"excludedFolders": ["test"],
				"excludedFiles": ["test.html"]
			},
			aProjectSettings = [
				"com.watt.common.builder.sapui5clientbuild",
				"sap.watt.uitools.ide.fiori"
			];

		this.context.service.filesystem.documentProvider.getDocument("/" + model.projectName).then(function(oProjectDocument) {
			that.context.service.projectType.setProjectTypes(oProjectDocument, aProjectSettings);
			that.context.service.setting.project.setProjectSettings("build", oBuildSettings, oProjectDocument);
		});

		return [projectZip, model];
	},

	_moveFileTo: function(oOptions) {
		var oZip = oOptions.zip;
		var oFileToMove = oZip.file(oOptions.file);

		oZip.file(oOptions.target, oFileToMove.asText(), {
			createFolders: true
		});

		oZip.remove(oOptions.file);
	},

	_generateUUID: function() {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	},

	/**
	 * The current validation infrastructure uses project type to check that the template can be selected in the wizard
	 * within the context of the user selections.
	 * It is used for preventing the user from selecting the template when it is not appropriate according to previous
	 * selections in the generation wizard (or in the work space).
	 * This new method receives the model as passed from the wizard and must return a boolean value or throw an
	 * exception with the appropriate error message to the user.
	 *
	 * By default this method returns true.Use this method to add more validations, if needed.
	 *
	 * @param model The template model as passed from the generation wizard based on the user selections.
	 */
	customValidation: function(model) {

		return true;
	},

	/**
	 * Configures the wizard steps that appear after the template is selected in the wizard.
	 * 
	 * The method arguments are the wizard step objects that appear after selecting the template.
	 * These steps are defined in the 'wizardSteps' property of the template configuration entry 
	 * (located in the plugin.json file of the plugin containing the template).
	 * 
	 * The method is used for setting step parameters and event handlers  
	 * that define the appropriate relations between the steps.
	 * 
	 * For example, to define how 'step2' handles changes that occur in 'step1':
	 * 
	 * var oStep1Content = oStep1.getStepContent();
	 * var oStep2Content = oStep2.getStepContent();
	 * 
	   // To handle validation status changes in oStep1Content:
	 * oStep1Content.attachValidation(oStep2Content.someHandlerMethod, oStep2Content);
	 * 
	   // To handle value changes in oStep1Content:
	 * oStep1Content.attachValueChange(oStep2Content.anotherHandlerMethod, oStep2Content);
	 *  
	 */
	configWizardSteps: function() {

	}

});