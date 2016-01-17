define(["sap/watt/lib/lodash/lodash"], function(_) {
	"use strict";
	/**
	 * Applies  template logic before generating the template resources in the provided zip file.
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
	return {
		onBeforeTemplateGenerate: function(templateZip, model) {
			var that = this;
			// overruling model overwrite flag if it set to true 
			if (model.overwrite === true) {
				model.overwrite = false;
			}

			var oDocProvider = this.context.service.filesystem.documentProvider;

			// get project path
			var aPath = model.componentPath.split("/");
			var sProjectPath = "/" + aPath[1];

			// get project name from pom.xml file
			var sPomPath = sProjectPath + "/pom.xml";
			return oDocProvider.getDocument(sPomPath).then(function(oPomXmlDocument) {
				return oPomXmlDocument.getContent().then(function(oXmlContent) {
					var oPomXml = jQuery.parseXML(oXmlContent);
					var aNameTag = oPomXml.getElementsByTagName("artifactId");
					model.namespace = aNameTag[0].textContent;
					// replace all dots to backslash 
					model.namespacePath = model.namespace.replace(/\./g, "/");

					var sTestFolderPath = sProjectPath + "/src/test";
					return oDocProvider.getDocument(sTestFolderPath).then(function(oTestFolderDocument) {
						if (oTestFolderDocument) {
							return oTestFolderDocument.getCurrentMetadata(true).then(function(aTestFolderMetadataContent) {
	
								// remove unnecessary content from templateZip        
								that._removeContentFromZip(aTestFolderMetadataContent, templateZip);
								
								// Set names of the selected views
	                            var aSelectedViews = [];
								// add pageObject files for each selected view in the wizard to templateZip
								model.oQunitData.aViewList.forEach(function(oViewContent) {
									//Load only selected page. Regenerate will not regenerate AllOpaTests.js - as designed
									if (oViewContent.selected) {
										aSelectedViews.push(oViewContent.name.replace(".view.xml", ""));
									}
								});
								model.oQunitData.aSelectedViews = aSelectedViews;
	
								// add pageObject files for each selected view in the wizard to templateZip
								model.oQunitData.aViewList.forEach(function(oViewContent) {
									if (oViewContent.selected) {
										var sViewName = "test/qunit/test-files/opa/pageObjects/" + oViewContent.name.replace(".view.xml", ".js.tmpl");
										templateZip.file(sViewName, templateZip.file("test/qunit/test-files/opa/pageObjects/View.js.tmpl").asText());
									}
								});
								// remove view template from templateZip
								templateZip.remove("test/qunit/test-files/opa/pageObjects/View.js.tmpl");
	
								return [templateZip, model];
							});
						} else {
							throw new Error(that.context.i18n.getText("i18n", "errmsg_wrong_str"));
						}
					});
				});
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
		    this.context.service.usagemonitoring.report("component_generation", "opa_generate", model.componentPath.split("/")[1]).done();
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
			        throw new Error(that.context.i18n.getText("i18n", "errmsg_Select_tile"));
			    }
			    
			    var sTestFolderPath = sProjectPath + "/src/test";
				return oDocProvider.getDocument(sTestFolderPath).then(function(oTestFolderDocument) {
					if (oTestFolderDocument) { 
						return true;		
					}
					else {
						throw new Error(that.context.i18n.getText("i18n", "errmsg_wrong_str"));	
					}
				});
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
		configWizardSteps: function(SelectViewsStep) {

			return [SelectViewsStep];

		},

		_removeContentFromZip: function(aTestFolderMetadataContent, templateZip) {

			for (var i = 0; i < aTestFolderMetadataContent.length; i++) {
				var oQunitFldContent = aTestFolderMetadataContent[i];
				if (oQunitFldContent.parentPath.indexOf("/qunit/") !== -1) {
					
					if (!oQunitFldContent.folder && oQunitFldContent.name === "qunit.runner.testsuite.html") {
						// qunit.runner.testsuite.html file is already exists - remove it from template zip      	
						templateZip.remove("test/qunit/qunit.runner.testsuite.html.tmpl");
					}

					if (oQunitFldContent.folder && oQunitFldContent.name === "WEB-INF") {
						// WEB-INF folder and it's content is already exists - remove it from template zip  
						templateZip.remove("test/qunit/WEB-INF/");
						templateZip.remove("test/qunit/WEB-INF/webjetty.xml");
					}

					if (oQunitFldContent.parentPath.indexOf("/test-files/") !== -1) {
						// test-files folder
						if (oQunitFldContent.name === "ModulePathForTests.js") {
							// ModulePathForTests.js file is already exists - remove it from template zip      	
							templateZip.remove("test/qunit/test-files/ModulePathForTests.js.tmpl");
						}

						if (oQunitFldContent.parentPath.indexOf("/opa/") !== -1) {
							// opa folder
							if (!oQunitFldContent.folder && oQunitFldContent.name === "testsuite_opa.qunit.html") {
								// testsuite_opa.qunit.html file is already exists - remove it from template zip      	
								templateZip.remove("test/qunit/test-files/opa/testsuite_opa.qunit.html.tmpl");
							}

							if (!oQunitFldContent.folder && oQunitFldContent.name === "testsuite_opa.qunit.js") {
								// testsuite_opa.qunit.js file is already exists - remove it from template zip      	
								templateZip.remove("test/qunit/test-files/opa/testsuite_opa.qunit.js.tmpl");
							}

							if (!oQunitFldContent.folder && oQunitFldContent.name === "AllOpaTests.js") {
								// AllOpaTests.js file is already exists - remove it from template zip      	
								templateZip.remove("test/qunit/test-files/opa/AllOpaTests.js.tmpl");
							}

							if (!oQunitFldContent.folder && oQunitFldContent.name === "readme.txt") {
								// readme.txt file is already exists - remove it from template zip      	
								templateZip.remove("test/qunit/test-files/opa/readme.txt.tmpl");
							}

							if (oQunitFldContent.parentPath.indexOf("/arrangements/") !== -1) {
								// arrangements folder
								if (!oQunitFldContent.folder && oQunitFldContent.name === "Common.js") {
									// Common.js file is already exists - remove it from template zip      	
									templateZip.remove("test/qunit/test-files/opa/arrangements/");
									templateZip.remove("test/qunit/test-files/opa/arrangements/Common.js.tmpl");
								}
							}

							if (oQunitFldContent.parentPath.indexOf("/pageObjects/") !== -1) {
								// pageObjects folder
								if (!oQunitFldContent.folder && oQunitFldContent.name === "Common.js") {
									// Common.js file is already exists - remove it from template zip      	
									templateZip.remove("test/qunit/test-files/opa/pageObjects/Common.js.tmpl");
								}
							}
						}
					}
				}
			}
		}
	};
});