define({

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
		// overruling model overwrite flag if it set to true 
		if (model.overwrite === true) {
			model.overwrite = false;
		}

		// prepare model data to how it expected in the hadlebar template
		this._prepareModelToTemplate(model);

		// get project path
		var aPath = model.componentPath.split("/");
		var sProjectPath = "/" + aPath[1];
		var oDocProvider = this.context.service.filesystem.documentProvider;

		// check if "WEB-INF" folder is already exist
		var sWebinfPath = sProjectPath + "/src/test/qunit/WEB-INF";
		return oDocProvider.getDocument(sWebinfPath).then(function(oWebInfFolderDocument) {
			if (oWebInfFolderDocument !== null) {
				// WEB-INF folder is already exist - folder should not be generated again, delete this folder from the templateZip
				templateZip.remove("test/qunit/WEB-INF/");
				templateZip.remove("test/qunit/WEB-INF/webjetty.xml");
				return [templateZip, model];
			} else {
				sWebinfPath = sProjectPath + "/test/qunit/WEB-INF";
				return oDocProvider.getDocument(sWebinfPath).then(function(oWebInfFolderDocument) {
					if (oWebInfFolderDocument !== null) {
						// WEB-INF folder is already exist - folder should not be generated again, delete this folder from the templateZip
						templateZip.remove("test/qunit/WEB-INF/");
						templateZip.remove("test/qunit/WEB-INF/webjetty.xml");
						return [templateZip, model];
					}
				});
			}
		});
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
		// Change the original template files names according to selected JavaScript file name. 
       this.context.service.usagemonitoring.report("component_generation", "qunit_generate", model.componentPath.split("/")[1]).done();
		for (var file in projectZip.files) {
			switch (file) {
				case "test/qunit/test-files/testfile.js":
					this._setProjectZipFiles(projectZip, model.testJSFileName, "test/qunit/test-files/testfile.js");
					break;

				case "test/qunit/testsuite.qunit.html":
					this._setProjectZipFiles(projectZip, model.testSuiteHtmlFileName, "test/qunit/testsuite.qunit.html");
					break;

				case "test/qunit/testsuite.qunit.js":
					this._setProjectZipFiles(projectZip, model.testSuiteJSFileName, "test/qunit/testsuite.qunit.js");
					break;

				default:
					break;
			}
		}
	},

	_setProjectZipFiles : function(projectZip , sNewFileName, sOldFileName){

		projectZip.file(sNewFileName, projectZip.files[sOldFileName]._data);
		projectZip.remove(sOldFileName);
	},

	/**
	 *The current validation infrastructure checks that the template can be selected in the wizard
	 *within the context of the user selections (using project type validation).
	 *It is used for preventing the user from selecting the template when it is not appropriate according to previous
	 *selections in the generation wizard (or in the workspace). Use this method to add more validations, if needed.
	 * 
	 * this method 
	 *
	 * @param {object}	[model]		JSON object which includes all the data provided by all the wizard steps that are
	 * 								used for generating the template
	 * @returns {Boolean}	True if a template can be selected
	 */
	customValidation: function(model) {
		var that = this;
		// get project path
		var aPath = model.componentPath.split("/");
		var sProjectPath = "/" + aPath[1];
	    var oDocProvider = this.context.service.filesystem.documentProvider;
		// get project name from pom.xml file
		var sPomPath = sProjectPath + "/pom.xml";
		return oDocProvider.getDocument(sPomPath).then(function(oPomXmlDocument) {
		    if (!oPomXmlDocument) {
		        throw new Error(that.context.i18n.getText("i18n", "errmsg_qunit_Select_tile"));
		    }
		    return true;
		});
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
	configWizardSteps: function(ChoseFileStep) {

		return [ChoseFileStep];

	},

	_prepareModelToTemplate: function(model) {
		// set JS file name to be referenced in the test file in the test-files folder
		model.selectedJSFileName = model.fileName;
		// check if the selected JS file is controller
		if (model.selectedJSFileName.search(".controller") > -1) {
			// selected file is controller - delete suffix of .controller and set flag to the model
			model.selectedJSFileName = model.selectedJSFileName.replace(".controller", "");
			model.isController = true;
		}

		// build function condition statments
		if (model.oQunitData) {
			if (model.oQunitData.aFunctionsList) {
				model.oQunitData.aFunctionsList.forEach(function(oFuncEntry) {
					var sFunctionParameters = "";
					if (oFuncEntry.aFunctionParams) {
						oFuncEntry.aFunctionParams.forEach(function(oParamEntry) {
							if (sFunctionParameters === "") {
								sFunctionParameters = oParamEntry.paramerName;
							} else {
								sFunctionParameters = sFunctionParameters + ", " + oParamEntry.paramerName;
							}
						});
						oFuncEntry.sFunctionParameters = sFunctionParameters;
					}
				});
			}

			if (model.oQunitData.aObjectList) {
				model.oQunitData.aObjectList.forEach(function(oObjEntry) {
					if (oObjEntry.aFunctionsList) {
						oObjEntry.aFunctionsList.forEach(function(oFuncEntry) {
							if (oFuncEntry.aFunctionParams) {
								var sFunctionParameters = "";
								oFuncEntry.aFunctionParams.forEach(function(oParamEntry) {
									if (sFunctionParameters === "") {
										sFunctionParameters = oParamEntry.paramerName;
									} else {
										sFunctionParameters = sFunctionParameters + ", " + oParamEntry.paramerName;
									}
								});
								oFuncEntry.sFunctionParameters = sFunctionParameters;
							}
						});
					}
				});
			}
		}
		else{
		    model.isEmptyStub = true;
		}

		// set the seleted JS file relative path
		model.selectedJSFilePath = model.filePath.replace(model.componentPath, "");

		// set test file name to be referenced in the template 
		var aFiles = model.testJSFileName.split("/");
		model.testFileNameForTemplate = aFiles[aFiles.length - 1].replace(".js", "");

		// set test suite file name to be referenced in the template 
		aFiles = model.testSuiteJSFileName.split("/");
		model.testSuiteFileNameForTemplate = aFiles[aFiles.length - 1];

		return model;
	}

});