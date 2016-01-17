define(["sap/watt/lib/lodash/lodash", "../ui/UIAdaptationPane.controller"], function(_) {

	var UIAdaptation = function() {
		var that = this;

		/**
		 * The key of the UI Adaptation block in the .project.json file
		 *
		 * @type {string}
		 */
		var sUIAdaptationBlockKey = "uiadaptation";

		var fnEmbedUrlInTag = function(sScriptPath) {
			return '<script src="' + sScriptPath + '" type="text/javascript"></script>';
		};

		/**
		 * Creates the HTML file that will be run in the UI Adaptation pane and writes it to the root of the
		 * project.
		 * If the UIAdaptation_index.html already exists it will be overwritten so that if the template of this HTML is changed
		 * users with old projects are able to get these changes.
		 * 
		 * @param oProjectDocument  {object}   - The document of the project
		 * @param sComponentName	{string}   - The component name that will be run in the HTML
		 * @param aScriptsPaths		{[string]} - Array of strings containing the paths of the script tags that will be
		 * 										 added to the <head> tag in the HTML
		 * @returns {Promise<string>}		   - Returns the runnable URL of the generated HTML file
		 */
		this.createUIAdaptationIndexHTML = function(oProjectDocument, sComponentName, aScriptsPaths) {
			var aScriptTags = _.map(aScriptsPaths, fnEmbedUrlInTag);
			return that.context.service.template.getTemplate("uiadaptation.uiadaptationpanehtml").then(function(oTemplate) {
				// This document is generated regardless if it already exists. This is to prevent version collision
				var oDataModel = {
					sComponentName: sComponentName,
					scriptsTags: aScriptTags.join("\n")
				};
				return that.context.service.generation.generate(oProjectDocument.getEntity().getFullPath(), oTemplate, oDataModel, true, oProjectDocument);
			}).then(function () {
				return oProjectDocument.getChild("UIAdaptation_index.html");
			}).then(function (oHTMLDocument) {
				return that.context.service.preview.getPreviewUrl(oHTMLDocument).then(function(oUrl) {
					return oUrl.toString();
				});
			});
		};

		/**
		 * Run the application from the provided project and preview it with the local changes
		 * @param oProjectDocument  {object} - The document of the project
		 * @param oWindow 			{Window} - An iFrame element (or an open tab) in which to show the running application
		 */
		this.previewAppWithChanges = function(oProjectDocument, oWindow) {
			return that.getApplicationComponentName(oProjectDocument).then(function(sComponentName){
				return that.createChangesPreviewIndexHTML(oProjectDocument, sComponentName);
			}).then(function(){
				return oProjectDocument.getChild("changes_preview_index.html");
			}).then(function(oHTMLDoc){
				return that.context.service.preview.getPreviewUrl(oHTMLDoc);
			}).then(function(oUri){
				return that.context.service.preview.showPreview(oUri, oWindow);
			});
		};
		
		
		/**
		 * Creates the HTML file that will be run in order to preview the app with the local changes,
		 * and writes it to the root of the project. (If file exists - it will be overwritten)
		 * @param oProjectDocument  {object}   - The document of the project
		 * @param sComponentName	{string}   - The component name that will be run in the HTML
		 * 
		 * @returns {*|orion.Promise|{value}}
		 */
		this.createChangesPreviewIndexHTML = function(oProjectDocument, sComponentName) {
			var oModelData = {
				sComponentName: sComponentName,
				sAppResourcesPath : "/webapp", //currently hard coded. In future we can search this. MK: If it is changed - add it to the test!
				sChangesFolderPath : "/webapp/changes" //currently hard coded. In future we can search this. MK: If it is changed - add it to the test!
			};
			return that.context.service.template.getTemplate("uiadaptation.changespreviewhtml").then(function(oTemplate) {
				return that.context.service.generation.generate(
					oProjectDocument.getEntity().getFullPath(),
					oTemplate,
					oModelData,
					true,
					oProjectDocument
				);
			});
		};

		/**
		 * Retrieves the component name that should be run in the HTML in the UI Adaptation pane
		 * @param oProjectDocument   {object}   - The document of the project
		 *
		 * @returns 				 {string}   - The component name
		 */
		this.getApplicationComponentName = function(oProjectDocument) {
			return that.context.service.setting.project.getProjectSettings(sUIAdaptationBlockKey, oProjectDocument).then(function(oUIAdaptationBlock) {
				// This is meant for future support of "changes projects"
				if (oUIAdaptationBlock && oUIAdaptationBlock.componentname) {
					return oUIAdaptationBlock.componentname;	
				} else {
					return that.context.service.ui5projecthandler.getAppNamespace(oProjectDocument);
				}
			});
		};
		
	//TODO: this function is commented out to prevent miss-use of the variant option until it is completed.
		/**
		 * Retrieves the application variant that should be used in the UI Adaptation pane to create changes
		 * @param oProjectDocument   {object}   - The document of the project
		 *
		 * @returns 				 {string}   - The variant value or null if no such value was defined
		 */
		// this.getVariantForLREPChanges = function(oProjectDocument) {
		// 	return that.context.service.setting.project.getProjectSettings(sUIAdaptationBlockKey, oProjectDocument).then(function(
		// 		oUIAdaptationBlock) {
		// 			if (oUIAdaptationBlock && oUIAdaptationBlock.appvariant) {
		// 				return oUIAdaptationBlock.appvariant;	
		// 			}
		// 			else {
		// 				return null; //No varaiant was defined by the user
		// 			}
		// 	});
		// };
		//TODO: replace with the above method when application variant is relevant again
		//currently it acts as no variant was defined by the user
		this.getVariantForLREPChanges = function(oProjectDocument) {
			return null; //No varaiant was defined by the user
		};
		

		/**
		 * Returns the ID of the type of the UI Adaptation project. This method should be used instead
		 * of using the string directly since the string may change in the future.
		 *
		 * @returns 	{string}	- The ID of the UI Adaptation project
		 */
		this.getUIAdaptationProjectTypeId = function() {
			return "sap.watt.saptoolsets.fiori.project.uiadaptation";
		};

		/**
		 * Creates a single change in the workspace.
		 * 
		 * @returns {promise} - promise to save the document.
		*/
		var saveSingleChange = function(sFullName, oChangesFolder, oChange, timeStamp) {
			//Add the creation field for each change. In real LREP system the server adds this timestamp so that it can later
			//load the changes in an ordered manner. 
			oChange.creation = timeStamp;
			return oChangesFolder.createFile(sFullName).then(function(oFile) {
				return that.context.service.beautifierProcessor.beautify(JSON.stringify(oChange), "json").then(function(oFormattedChange) {
					return oFile.setContent(oFormattedChange).then(function() {
						return oFile.save();
					});
				});
			});
		};

		/**
		 * Saves the LREP changes in workspace.
		*/
		var saveChanges = function(aChanges, oChangesFolder) {
			var i, sFileName, sFullName;
			var aPromises = [];
			//Since the saving of the changes happens fast, and since saving multiple changes can happen in the same millisecond
			//and since the maximum time accuracy in JavaScript is a millisecond, we generate the timestamp here only once and
			//we do not generate a timestamp for each change, and in each iteration we increment this timestamp a millisecond
			//and this way we are sure that changes do not have the same timestamp
			var timeStamp = new Date();
			for (i = 0; i < aChanges.length; i++) {
				sFileName = aChanges[i].fileName;
				sFullName = sFileName +  ".change";
				
				//Increment the timestamp by one millisecond:
				timeStamp.setMilliseconds(timeStamp.getMilliseconds() + 1);
				aPromises.push(saveSingleChange(sFullName, oChangesFolder, aChanges[i], timeStamp.toISOString()));
			}
			
			return Q.all(aPromises);
		};

		/**
		 * Saves the LREP changes in workspace. create change folder if doesnt exist
		 *
		 * @param aChanges  {array}   - the LREP changes
		 * @param oProjectDocument {object} - The document of the project
		 * @returns {Q.promise}
		 */
		this.saveChangeToWorkspace = function(oProjectDocument, aChanges) {
			var sWebappPath = oProjectDocument.getEntity().getFullPath() + "/webapp";
			var sFilePath = sWebappPath + "/changes";

			return that.context.service.filesystem.documentProvider.getDocument(sFilePath).then(function(oChangesFolder) {
				if (oChangesFolder) {
					// if 'changes' folder exists - save the changes in it
					return saveChanges(aChanges, oChangesFolder);
				} else {
					// if 'changes' folder doesn't exist, create the folder first
					return that.context.service.filesystem.documentProvider.getDocument(sWebappPath).then(function(oWebAppFolder){
						return oWebAppFolder.createFolder("changes").then(function(oCreatedChangesFolder) {
							return saveChanges(aChanges, oCreatedChangesFolder);
						});
					});
				}
			});
		};

		/**
		 * Load the LREP changes from workspace. 
		 * This functions loads all the files under <project root>/webapp/change. Each file of these is a single LREP
		 * change. It parses the content of each file and returns an array of JSONs.
		 *
		 * @param oProjectDocument {object} - The document of the project
		 * @returns {array} - A promise cotaining an array of LREP changes, the changes are sorted by the timestamp in 
		 *					  the <creation> field of each change. The promise is rejected in case of any of the change
		 *					  files is corrupted or could not be found.
		 */
		this.loadChangesFromWorkspace = function(oProjectDocument) {
			var sChangesFolderPath = oProjectDocument.getEntity().getFullPath() + "/webapp/changes";
			return that.context.service.filesystem.documentProvider.getDocument(sChangesFolderPath).then(function(oChangesFolder) {
				var aChanges = [];
				//if the 'changes' folder exists, load the changes from there
				if (oChangesFolder) {
					return oChangesFolder.getFolderContent().then(function(aChangesFolderContent) {
						var i, j, oChange;
						var aPromises = [];

						for (i = 0; i < aChangesFolderContent.length; i++) {
							aPromises.push(aChangesFolderContent[i].getContent());
						}
						
						//go over array of files and turn content to json object which hold the change
						return Q.all(aPromises).then(function(aResult) {
							for (j = 0; j < aResult.length; j++) {
								oChange = JSON.parse(aResult[j]);
								aChanges.push(oChange);
							}
							
							//Sort the array by the creation timestamp of the changes
							aChanges.sort(function(oChange1, oChange2) {
								return new Date(oChange1.creation) - new Date(oChange2.creation);
							});
							
							return aChanges;
						});
					});
				} else {
					//if the 'changes' folder doesn't exist, return an empty array (no changes were saved in the workspace)
					return aChanges;
				}
			});
		};

		/**
		 * Creates the runnable HTML file needed to open the pane, including the script tag referencing the transceiver file.
		 * @param oProjectDocument {object} - The project Document object
		 * @returns {object} - an object containing the URL of the html file and the name of the application component
		 */
		var createIndexDoc = function(oProjectDocument) {
			var sComponentName;
			return that.getApplicationComponentName(oProjectDocument).then(function(sName) {
				sComponentName = sName;
				var aRequiredPath = [];
				// append the UIAdaptationTransceiver Lscripts to the application index.html
				var requirePath = require.toUrl("sap.watt.saptoolsets.fiori.project.uiadaptation/util/UIAdaptationTransceiver.js");
				aRequiredPath.push(requirePath);
				return that.createUIAdaptationIndexHTML(oProjectDocument, sName, aRequiredPath);
			}).then(function (sRunnableUrl) {
				return {
					sComponent : sComponentName,
					sFrameUrl : sRunnableUrl
				};
			});
		};

		/**
		 * Launches the UI Adaptation view inside an overlay container element, with the application running inside.
		 *
		 * @param oSelectedProject {object} - The project Document object representing the application in the users workspace.
		 */
		this.openAdaptUI = function(oSelectedProject) {

			sap.watt.includeCSS(require.toUrl("sap.watt.saptoolsets.fiori.project.uiadaptation/ui/css/UIAdaptation.css"));

			return createIndexDoc(oSelectedProject).then(function (oResult) {
				var oContainer = sap.ui.getCore().byId("adaptUiContainer");

				if (oContainer !== undefined) {
					oContainer.destroy();
				}

				// OverlayContainer
				oContainer = new sap.ui.ux3.OverlayContainer("adaptUiContainer", {
					openButtonVisible: false
				}).addStyleClass("wizardBodyVisualExt");

				var oView = sap.ui.view({
					viewName: "sap.watt.saptoolsets.fiori.project.plugin.uiadaptation.ui.UIAdaptationPane",
					type: sap.ui.core.mvc.ViewType.XML,
					viewData : {
						oContext : that.context,
						oProjectDoc : oSelectedProject,
						sFrameUrl : oResult.sFrameUrl,
						sComponentName : oResult.sComponent,
						sLayer : "VENDOR", // This is hard coded for layer 0 changes, when RTC we will add dynamic calculation of layer
						sIdeSrc : this.location.origin || this.location.href // This maintains cross-browser compatibility
					}
				});

				oContainer.addContent(oView);

				// We disrupt the normal closing of the pane in order to insure the saving of changes made in RTA
				oContainer.attachClose(function(oEvent) {
					oEvent.preventDefault();
					oView.getController().onBeforeExit().then(function() {
						oView.destroyContent();
						oContainer.destroy();
					}).done();
				});
				oContainer.open();

				return oContainer; // return it for testability
			});
		};
	};

	return UIAdaptation;
});
