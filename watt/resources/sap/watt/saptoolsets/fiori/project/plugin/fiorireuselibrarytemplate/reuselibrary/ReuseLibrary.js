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

		model.isSapFioriRegistrationID = false;
		if (model.reuselibrary.parameters.SapFioriRegistrationID.value !== undefined) {
			model.isSapFioriRegistrationID = true;
		}
		if (!model.reuselibrary.parameters.LibraryNamespace.value) {
			model.reuselibrary.LibraryNamespace = model.projectName.toLowerCase();
		} else {
			model.reuselibrary.LibraryNamespace = model.reuselibrary.parameters.LibraryNamespace.value;
		}
		model.isTheme = false;
		if (model.reuselibrary.parameters.ContentDensitiesCompact.value.value !== "not relevant" &&
			model.reuselibrary.parameters.ContentDensitiesCozy.value.value !== "not relevant") {
			model.isTheme = true;
		}

		model.reuselibrary.libraryName = model.reuselibrary.LibraryNamespace.toString().split(".").join("");
		model.projectPath = model.reuselibrary.LibraryNamespace.toString().split(".").join("/");
		model.isSapPlatfromAbapURI = false;
		if (model.reuselibrary.parameters.SapPlatfromAbapURI.value !== undefined) {
			model.isSapPlatfromAbapURI = true;
		}
		model.reuselibrary.SapPlatfromAbapURI = "/sap/bc/ui5_ui5/sap/" + model.reuselibrary.parameters.SapPlatfromAbapURI.value;

		var oContext = this.context;
		return oContext.service.system.getSystemInfo().then(function(oResult) {
			model.reuselibrary.systemAcount = oResult.sAccount;

			model.reuselibrary.translationDeveloper = oResult.sUsername;
			model.reuselibrary.translationDomain = "";

			model.domain = model.reuselibrary.parameters.LibraryAppDomain.value;
			if (model.domain !== undefined) {
				model.reuselibrary.translationDomain = model.domain.id;
			}

			return [templateZip, model];
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
		var libraryPath = model.projectPath;

		var libraryFolder = projectZip.folder("src").folder(libraryPath);
		libraryFolder.file(".library", projectZip.file("res/.library").asText());
		libraryFolder.file("library.js", projectZip.file("res/library.js").asText());
		libraryFolder.file("manifest.json", projectZip.file("res/manifest.json").asText());
		libraryFolder.file("messagebundle.properties", projectZip.file("res/messagebundle.properties").asText());

		if (model.reuselibrary.parameters.ControlsCheckBox.value === true) {
			var controlsFolder = libraryFolder.folder("controls");
			libraryFolder.file("library.js", projectZip.file("res/controls/library.js").asText());
			controlsFolder.file("Example.js", projectZip.file("res/controls/main/Example.js").asText());
			controlsFolder.file("ExampleRenderer.js", projectZip.file("res/controls/main/ExampleRenderer.js").asText());

			var testFolder = projectZip.folder("test");
			testFolder.folder("qunit/controls").file("Example.qunit.html", projectZip.file("res/controls/test/Example.qunit.html").asText());
			testFolder.folder("qunit").file("testsuite.qunit.html", projectZip.file("res/controls/test/testsuite.qunit.html").asText());
			testFolder.file("Example.html", projectZip.file("res/controls/test/Example.html").asText());

			var themesFolder = libraryFolder.folder("themes");
			themesFolder.folder("base").file("Example.less", projectZip.file("res/themes/base/Example.less").asText());
			themesFolder.folder("base").file("library.source.less", projectZip.file("res/themes/base/library.source.less").asText());
			themesFolder.folder("base").file("shared.less", projectZip.file("res/themes/base/shared.less").asText());
			themesFolder.folder("sap_bluecrystal").file("library.source.less", projectZip.file("res/themes/sap_bluecrystal/library.source.less").asText());
			themesFolder.folder("sap_bluecrystal").file("shared.less", projectZip.file("res/themes/sap_bluecrystal/shared.less").asText());
			this.context.service.usagemonitoring.report("fiory_library", "created", "from_template").done();
		}

		projectZip.remove("res");

		return [projectZip, model];
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
	configWizardSteps: function(oTemplateCustomizationStep) {

		// Return an array that contains all the template wizard steps
		return [oTemplateCustomizationStep];
	},

	onBeforeTemplateCustomizationLoaded: function(wizModel, tmplModel) {
		var that = this;
		if (sap.watt.getEnv("internal")) {	
			return that.context.service.translation.getDomains().then(function(oDomains) {
				tmplModel.oData.reuselibrary.parameters.LibraryAppDomain.append("binding", oDomains.domains);
				return [wizModel, tmplModel];
			}).fail(function(oError) {
				console.error(that.context.i18n.getText("i18n", "reuselibrary_no_app_domain", [oError]));
				return [wizModel, tmplModel];
			});
		} else {
			return [wizModel, tmplModel];
		}
	}

});