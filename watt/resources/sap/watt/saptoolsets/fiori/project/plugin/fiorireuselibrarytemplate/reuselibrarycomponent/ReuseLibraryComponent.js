define(["../util/NeoAppUtil", "../util/RepositoryConstants", "sap/watt/lib/lodash/lodash"], function(neoAppUtil, repoConst, _) {
		"use strict";

		var _isDependencyExist = function(dependenciesAttr, oSelector) {
			var valid = true;
			var dependencyArr = dependenciesAttr.find("dependency");
			$.each(dependencyArr, function(i, dependecnyData) {
				var depObject = $(dependecnyData);
				var isExist = true;
				for (var selector in oSelector) {
					var selectorKey = selector;
					var data = oSelector[selector];
					var keyResult = depObject.find(selectorKey).text();
					if (keyResult !== data) {
						isExist = false;
					}
				}
				if (isExist) {
					valid = false;
					return;
				}
			});

			return valid;
		};

		var _createDependenciesAttr = function(xmlContent) {

			var buildAttr = xmlContent.find("project");
			buildAttr.append("\n\t<dependencies>\n\t</dependencies>\n    ");
		};

		var _updatePomContent = function(oContent, model) { //function(oContent, groupID, artifactId, version) {

			var groupID = "";
			var artifactId = "";
			var version = "";
			var repositoryType = model.reuselibrarycomponent.selectedLibraryObject.repositoryType;

			if (repositoryType === repoConst.SAPUI5) {
				groupID = "com.sap.ui5";
				artifactId = "mobile";
			} else {
				groupID = "com.sap.fiori";
				artifactId = model.reuselibrarycomponent.selectedLibraryObject.libraryName;
				version = model.reuselibrarycomponent.selectedLibraryObject.libraryNumber;
			}

			//Get dependencies value from pom.xml
			var parseContentResult = jQuery.sap.parseXML(oContent);
			var xmlContent = $(parseContentResult),
				dependenciesAttr = xmlContent.find("dependencies");
			//<dependencies> attribute doesn't exsit
			if (dependenciesAttr.length === 0) {
				_createDependenciesAttr(xmlContent);
				dependenciesAttr = xmlContent.find("dependencies");
			}
			var selectorArr = {
				groupId: groupID,
				artifactId: artifactId
			};

			var valid = _isDependencyExist(dependenciesAttr, selectorArr);
			if (valid) {
				//New XML
				var newDependecyXML =
					"<dependency>" + "\n\t\t\t" +
					"<groupId>" + groupID + "</groupId>" + "\n\t\t\t" +
					"<artifactId>" + artifactId + "</artifactId>";
				//"<version>" + version + "</version>" + "\n\t" +
				//"</dependency>";
				if (version !== "") {
					newDependecyXML += "\n\t\t\t" + "<version>" + version + "</version>";
				}
				newDependecyXML += "\n\t\t" + "</dependency>";
				//Update XML
				var parseDependecyResult = jQuery.sap.parseXML(newDependecyXML);
				var xmlDependecy = $(parseDependecyResult);
				dependenciesAttr.append("\n\t\t", xmlDependecy.find("dependency"), "\n");

				return (new XMLSerializer()).serializeToString(xmlContent[0]);
			} else {
				return null;
			}
		};

		var _updateLibraryFileContent = function(libraryPath, oContent, componentName, libraryName) {
			//Controls update
			var thisLibraryName = libraryPath.split("/").join(".");
			var newControl = thisLibraryName + ".controls." + componentName;
			var pattern = /controls\s*:\s*\[\s*(")/;

			//Check if the control exist 
			var reControl = new RegExp("controls\\s*:\\s*\\[\\s*(?=.*" + newControl + ").*?\\s*\\]");
			if (!(reControl.test(oContent))) {
				//Check if the control has a content     
				if (pattern.test(oContent)) {
					oContent = oContent.replace(/(controls\s*:\s*\[[^\]]*)/, "$1," + "\"" + newControl + "\"");
				} else {
					oContent = oContent.replace(/(controls\s*:\s*\[[^\]]*)/, "$1" + "\"" + newControl + "\"");
				}
			}
			//update dependencies
			var newDependencey = libraryName;
			pattern = /dependencies\s*:\s*\[\s*(")/;
			var reDep = new RegExp("dependencies\\s*:\\s*\\[\\s*(?=.*" + newDependencey + ").*?\\s*\\]");
			if (!(reDep.test(oContent))) {
				if (pattern.test(oContent)) {
					oContent = oContent.replace(/(dependencies\s*:\s*\[[^\]]*)/, "$1," + "\"" + newDependencey + "\"");
				} else {
					oContent = oContent.replace(/(dependencies\s*:\s*\[[^\]]*)/, "$1" + "\"" + newDependencey + "\"");
				}
			}
			return oContent;
		};

		var _updateLibrarySourceLessContent = function(oContent, componentName) {
			var newLessImport = "@import \"" + componentName + ".less\";";
			if (oContent.indexOf(newLessImport) === -1) {
				oContent = oContent + "\r\n" + newLessImport;
			}
			return oContent;
		};

		var _updateTestSuiteFileContent = function(componentPath, oContent, componentName) {
			var returnIndex = oContent.indexOf("return suite");
			if (returnIndex !== -1) {
				var newContent = oContent.substr(0, returnIndex - 1) +
					"\tsuite.addTestPage(\"/test/qunit/controls/" + componentName +
					".qunit.html\"  + window.location.search );" +
					"\r\n\t\t" +
					oContent.substr(returnIndex);
				return newContent;
			}
			return oContent;
		};

		var _createTestSuite = function(projectZip) {
			var testFolder = projectZip.folder("test");
			testFolder.folder("qunit").file("testsuite.qunit.html", projectZip.file("res/controls/test/testsuite.qunit.html").asText());
		};

		var _createAndUpdateLibrarySourceLess = function(projectZip, filePath, componentName) {
			var oContent = _updateLibrarySourceLessContent(projectZip.file("res/themes/base/library.source.less").asText(), componentName);
			projectZip.file(filePath, oContent);
		};

		var _updateCommaLibraryFileContent = function(oContent, libraryName) {

			//Get dependencies value from pom.xml
			var parseContentResult = jQuery.sap.parseXML(oContent);
			var xmlContent = $(parseContentResult),
				dependenciesAttr = xmlContent.find("dependencies");
			var selectorArr = {
				libraryName: libraryName
			};

			var valid = _isDependencyExist(dependenciesAttr, selectorArr);

			if (valid) {
				//New XML
				var newDependecyXML =
					"<dependency>" + "\n\t\t" +
					"<libraryName>" + libraryName + "</libraryName>" + "\n\t" +
					"</dependency>";
				//Update XML
				var parseDependecyResult = jQuery.sap.parseXML(newDependecyXML);
				var xmlDependecy = $(parseDependecyResult);
				dependenciesAttr.append("\n\t", xmlDependecy.find("dependency"), "\n");

				return (new XMLSerializer()).serializeToString(xmlContent[0]);
			} else {
				return null;
			}

		};

			var _updatemManifestJsonContent = function(oTargetDocumentContent, libraryName, model, context) {
				var that = this;

				var repositoryType = model.reuselibrarycomponent.selectedLibraryObject.repositoryType;
				var version = "";
				if (repositoryType !== repoConst.SAPUI5) {
					version = model.reuselibrarycomponent.selectedLibraryObject.libraryNumber;
				}
				var parseResult = JSON.parse(oTargetDocumentContent);
				var oDependencies = {};
				oDependencies.libs = {};
				if (version !== "") {
					oDependencies.libs[libraryName] = {
						"minVersion": version
					};
				} else {
					oDependencies.libs[libraryName] = {};
				}
				return context.service.librarydevelopment.addDependenciesToAppDescriptor(parseResult,oDependencies);                     

			};
			var _updateNeoAppFileContent = function(oContent, model, context) {

				var newRoutes = neoAppUtil.buildLibraryObjectForNeoApp(model.reuselibrarycomponent.selectedLibraryObject);
				var isLibExist = neoAppUtil.isLibInNeoApp(model.reuselibrarycomponent.selectedLibraryObject, oContent);
				if (!(isLibExist)) {
					var result = neoAppUtil.getUpdatedNeoAppString(oContent, newRoutes, context);
					return result;
				}
				return null;

			};

			var _updateFile = function(projectZip, model, filePath, type, context) {

				var componentPath = model.componentPath;
				var libraryPath = model.projectPath;
				var componentName = model.reuselibrarycomponent.parameters.ComponentName.value;
				var libraryName = "";

				if (model.reuselibrarycomponent.hasOwnProperty("selectedLibraryObject")) {
					libraryName = model.reuselibrarycomponent.selectedLibraryObject.libraryName;
				}

				return context.service.filesystem.documentProvider.getDocument(componentPath + filePath).then(function(oTargetDocument) {
					if (oTargetDocument === null && filePath.indexOf("testsuite.qunit.html") !== -1) {
						return _createTestSuite(projectZip);
					} else if (oTargetDocument === null && filePath.indexOf("library.source.less") !== -1) {
						return _createAndUpdateLibrarySourceLess(projectZip, filePath, componentName);
					} else {
						if ( oTargetDocument !== null) {
							return oTargetDocument.getContent().then(function(oContent) {
								if (type === "manifest.json") {
									oContent = _updatemManifestJsonContent(oContent, libraryName, model, context);
								} else if (type === "library") {
									oContent = _updateLibraryFileContent(libraryPath, oContent, componentName, libraryName);
								} else if (type === "librarySourceLess") {
									oContent = _updateLibrarySourceLessContent(oContent, componentName);
								} else if (type === "suite") {
									oContent = _updateTestSuiteFileContent(componentPath, oContent, componentName);
									// Update .library
								} else if (type === ".library") {
									oContent = _updateCommaLibraryFileContent(oContent, libraryName);
								} else if (type === "neo_app") { //Updtae nep app
									oContent = _updateNeoAppFileContent(oContent, model, context);
								} else if (type === "pom") { // Updtae pom.xml
									oContent = _updatePomContent(oContent, model);
								}
								if (oContent !== null) {
									return oTargetDocument.setContent(oContent).then(function() {
										return oTargetDocument.save();
									});
								}
							});
						}
					}
				});

			};

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

			var onBeforeTemplateGenerate = function(templateZip, model, context) {
				return context.service.libraryDiscovery.getWorkspaceLibraryNamespace(model.componentPath).then(function(sLibraryNamespace) {
					model.projectPath = sLibraryNamespace.substring(1);
					model.reuselibrarycomponent.LibraryNamespace = model.projectPath.split("/").join(".");

					if (model.selectedTemplate.getId() === "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromexistinglibrary") {
						var splitControl = model.reuselibrarycomponent.selectedLibraryObject.controlName.split(".");
						model.controlPath = splitControl.join("/");
						var renderObjectName = splitControl[splitControl.length - 1];
						var renderObjectPrefix = model.reuselibrarycomponent.selectedLibraryObject.libraryExternalName.split(".").join("");
						model.renderObject = renderObjectPrefix + "_" + renderObjectName;
					}

					return [templateZip, model];
				});

			};

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
			var onAfterGenerate = function(projectZip, model, context) {
				var componentName = model.reuselibrarycomponent.parameters.ComponentName.value;
				//		var libraryPath = model.componentPath.split('.').join('/').substring(1);

				//	return context.service.libraryDiscovery.getWorkspaceLibraryNamespace(model.componentPath).then(function(sLibraryNamespace) {
				var that = this;
				var libraryPath = model.projectPath; //sLibraryNamespace.substring(1);
				var libraryFolder = projectZip.folder("src").folder(libraryPath);
				var controlsFolder = libraryFolder.folder("controls");
				var sRepository = "TEST";
				var promisesArr = [];

				if (model.selectedTemplate.getId() === "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromscratch") {
					controlsFolder.file(componentName + ".js", projectZip.file("res/controls/main/Example.js.Scratch").asText());
					controlsFolder.file(componentName + "Renderer.js", projectZip.file("res/controls/main/ExampleRenderer.js.Scratch").asText());
				} else {

					controlsFolder.file(componentName + ".js", projectZip.file("res/controls/main/Example.js").asText());
					controlsFolder.file(componentName + "Renderer.js", projectZip.file("res/controls/main/ExampleRenderer.js").asText());
				}

				//Update library.js
				promisesArr.push(_updateFile(projectZip, model, "/src/" + libraryPath + "/library.js", "library", context));

				if (model.selectedTemplate.getId() === "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromexistinglibrary") {
					var repositoryType = model.reuselibrarycomponent.selectedLibraryObject.repositoryType;
					switch (repositoryType) {
						case repoConst.ABAP:
							sRepository = "ABAP";
							break;
						case repoConst.HCP:
							sRepository = "HCP";
							break;
						case repoConst.WORKSPACE:
							sRepository = "WORKSPACE";
							break;
						default:
							sRepository = "SAPUI5";
					}
					//Update manifest.json
					promisesArr.push(_updateFile(projectZip, model, "/src/" + libraryPath + "/manifest.json", "manifest.json", context));
					//Update pom xml
					promisesArr.push(_updateFile(projectZip, model, "/pom.xml", "pom", context));
					//promisesArr.push(_updatePomXml(model, context));
					//Update .library
					promisesArr.push(_updateFile(projectZip, model, "/src/" + libraryPath + "/.library", ".library", context));
					//Updtae neo-app
					if (repositoryType !== repoConst.SAPUI5) {
						promisesArr.push(_updateFile(projectZip, model, "/neo-app.json", "neo_app", context));
						//promisesArr.push(_updateNeoAppFileContent(model,context ));
					}
				}

				if (model.reuselibrarycomponent.parameters.CreateQUnitTestCheckBox.value === true) {
					var testFolder = projectZip.folder("test");
					testFolder.folder("qunit/controls").file(componentName + ".qunit.html", projectZip.file("res/controls/test/Example.qunit.html").asText());
					promisesArr.push(_updateFile(projectZip, model, "/test/qunit/testsuite.qunit.html", "suite", context));
				}

				if (model.reuselibrarycomponent.parameters.CreateCssFilesCheckBox.value === true) {
					var themesFolder = libraryFolder.folder("themes");
					themesFolder.folder("base").file(componentName + ".less", projectZip.file("res/themes/base/Example.less").asText());

					//Update library source less
					promisesArr.push(_updateFile(projectZip, model, "/src/" + libraryPath + "/themes/base" + "/library.source.less",
						"librarySourceLess",
						context));
				}

				if (model.reuselibrarycomponent.parameters.CreateTestPageCheckBox.value === true) {
					var testFolderEx = projectZip.folder("test");
					if (model.selectedTemplate.getId() === "fiorireuselibrarytemplate.reuselibrarycomponent.newcontrolfromscratch") {
						testFolderEx.file(componentName + ".html", projectZip.file("res/controls/test/Example.html.Scratch").asText());
					} else {
						testFolderEx.file(componentName + ".html", projectZip.file("res/controls/test/Example.html").asText());
					}
				}

				return Q.all(promisesArr).then(function() {
					projectZip.remove("res");
					context.service.usagemonitoring.report("add_comp_data", "repository", sRepository).done();
					return [projectZip, model];
				});
				//		});

			};

			/**
			 * Checks that the template can be selected in the wizard with the context of the given model.
			 *
			 * This method can be used for preventing the user from selecting the template when it is not appropriate
			 * according to previous selections in the generation wizard.
			 * For example, you are prevented from generating a Component template in an inappropriate project.
			 *
			 * @param model The template model as passed from the generation wizard based on the user selections.
			 * @returns 'true' if the template can be selected according to a given model,
			 * or throws an error with the appropriate message if the validation fails.
			 */
			var customValidation = function(model, context) {
				var sGenerationPath = model.componentPath;
				if (sGenerationPath) {
					var aParts = sGenerationPath.split("/");
					if (aParts.length > 2) {
						throw new Error(context.i18n.getText("i18n", "libraryComponent_validation_root_level_error_msg"));
					}
				} else {
					throw new Error(context.i18n.getText("i18n", "libraryComponent_validation_error_msg"));
				}
				return true;
			};

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
			var configWizardSteps = function(oTemplateCustomizationStep, context) {

				// Return an array that contains all the template wizard steps
				return [oTemplateCustomizationStep];
			};

			return {
				onBeforeTemplateGenerate: onBeforeTemplateGenerate,
				onAfterGenerate: onAfterGenerate,
				configWizardSteps: configWizardSteps,
				customValidation: customValidation
			};
		});