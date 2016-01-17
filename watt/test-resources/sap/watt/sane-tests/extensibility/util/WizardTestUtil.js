define(["sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/ui/wizard/ExtensionProjectWizard",
		"sap/watt/saptoolsets/fiori/project/plugin/fioriexttemplate/ui/wizard/ExtensionWizard",
		"sap/watt/ideplatform/plugin/generationwizard/ui/ReferenceProjectGenerationWizard",
		"sap/watt/lib/lodash/lodash"],
	function (extensionProjectWizard, extensionWizard, referenceProjectGenerationWizard, _) {

		"use strict";
		
		/* eslint-disable no-console */

		/**
		 * Wait for a condition to be true. Once and if true, execute the success handler.
		 *
		 * @param {function object} fnTest - The function to execute in order to test if the condition is true. The function should return
		 *         non falsy result to indicate success.
		 * @param {function object} fnSuccess - The function to be called upon success of the test function. The return value of the test function
		 *         is given as input to the success function.
		 * @param {number} nMaxAttempts - Max number of calls to try the test function. Default: 100
		 * @param {number} nInterval - The interval in ms between calls to the test function. Default: 1000
		 */
		function waitKarma(fnTest, fnSuccess, nMaxAttempts, nInterval) {
			if (!nMaxAttempts) {
				nMaxAttempts = 100;
			}
			if (!nInterval) {
				nInterval = 200;
			}
			var counter = 0;

			var intervalRef = setInterval(function () {
				var testedObj = fnTest();
				if (testedObj) {
					clearInterval(intervalRef);
					fnSuccess(testedObj);
				} else if (counter >= nMaxAttempts) {
					clearInterval(intervalRef);
				}
				counter++;
			}, nInterval);
		}

		/**
		 * Generate an extension project remotely from ABAP.
		 *
		 * @param {object} oContext - The context (on which services are called etc')
		 * @param {string} sParentAppId - The ID of the parent project from which the extended project is created
		 */
		var _generateAbapExtensionProject = function (oContext, sParentAppId) {
			var DESTINATION_DESCRIPTION = "ABAP Backend System - for testing!"; // This destination is common to all accounts

			extensionProjectWizard.openGenerationWizardUI(oContext);

			waitKarma(function () {
				console.log("TEST: Waiting for the wizard to get created");
				return sap.ui.getCore().byId("CreateExtensionProjectWizardUI");
			}, function (wizard) {
				console.log("TEST: Wizard created! " + wizard.getId());

				// Open the abap selection dialog
				var wizardContent = wizard.getContent();
				// Center -> Grid -> Step -> content??? -> Grid > MenuButton (of remotes)
				var selectAppButton = wizardContent[0].getCenter().getContent()[0].getContent()[0].getContent()[1].getContent()[0].getContent()[2];

				console.log("TEST: selectAppButton created? " + selectAppButton.getId());

				var menu = selectAppButton.getMenu();

				console.log("TEST: menu created? " + menu.getId());

				menu.open();
				var abapItem = menu.getItems()[0];

				console.log("TEST: abapItem exist? " + abapItem.getId());

				abapItem.fireEvent("select");

				// Select abap system and application
				waitKarma(function () {
					console.log("TEST: Waiting for the remote dialog to get created");
					return sap.ui.getCore().byId("fioriexttemplate_remoteDialog");
				}, function (remoteDialog) {
					console.log("TEST: remote dialog created! " + remoteDialog.getId());

					var systemsDropDown = remoteDialog.getContent()[0].getContent()[1].getContent()[1];

					console.log("TEST: systemsDropDown created? " + systemsDropDown.getId());

					var abap_backend = _.find(systemsDropDown.getItems(), function (oItem) {
						return oItem.getText() === DESTINATION_DESCRIPTION; // TODO-GS perhaps use something more unique than the description
					});

					console.log("TEST: abap_backend created? " + abap_backend.getId());

					systemsDropDown.setSelectedKey(abap_backend.getKey());
					systemsDropDown.fireChange({
						"selectedItem": abap_backend
					});

					var appsTable = remoteDialog.getContent()[0].getContent()[3];

					console.log("TEST: appsTable created? " + appsTable.getId());

					// Wait for the apps table to be populated
					waitKarma(function () {
						console.log("TEST: Waiting for table rows and for table to be not busy");

						return appsTable.getRows().length > 0 && !appsTable.getBusy();
					}, function () {
						// Search for our app
						var appsSearch = remoteDialog.getContent()[0].getContent()[2];

						console.log("TEST: appsSearch exists? " + appsSearch.getId());

						appsSearch.setValue(sParentAppId);
						appsSearch.fireSuggest({
							"value": sParentAppId
						});

						waitKarma(function () {

							console.log("TEST: Waiting for HCM_LR_CRE app to be found in the table");

							var HCM_LR_CRERow = _.find(appsTable.getRows(), function (oRow) {
								return oRow.getCells()[0].getText() === sParentAppId;
							});
							return HCM_LR_CRERow;
						}, function (HCM_LR_CRERow) {

							console.log("TEST: HCM_LR_CRERow exists? " + HCM_LR_CRERow.getId());

							var rowSelectionMap = {
								"rowIndex": HCM_LR_CRERow.getIndex(),
								"rowContext": HCM_LR_CRERow.getCells()[0].getBindingContext()
							};
							appsTable.fireRowSelectionChange(rowSelectionMap);
							var okButton = remoteDialog.getButtons()[0];
							waitKarma(function () {

								console.log("TEST: Waiting for okButton to be enabled");

								return okButton.getEnabled();
							}, function () {

								console.log("TEST: okButton exists? " + okButton.getId());

								// Close the abap dialog
								okButton.firePress();

								// Wait for the dialog to be closed
								waitKarma(function () {

									console.log("TEST: Waiting for the dialog to be closed");

									return remoteDialog.getOpenState() === sap.ui.core.OpenState.CLOSED;
								}, function () {

									console.log("TEST: Next button exists? " + wizard._steps[0]._nextButton.getId());

									// Click the Next
									wizard._steps[0]._nextButton.firePress(); // Using the inner variables and not the getters since the getters return empty result...
									// Wait for the finish step to be active
									waitKarma(function () {

										console.log("TEST: Waiting for the Finish step to be active");

										return wizard._finishStep.isActive();
									}, function () {

										console.log("TEST: Finish button exists? " + wizard._finishButton.getId());

										wizard._finishButton.firePress();
									});
								});
							});
						});
					});
				});
			});
		};

		/**
		 * Generate an extension from the Extension Wizard.
		 *
		 * @param {object} iFrameWindow - The inner iFrame in which Web IDE is running
		 * @param {object} oContext - The context (on which services are called etc')
		 * @param {number} nTileIndex - The index of the desired tile
		 * @param {string} sTemplateId - The id of the desired template (e.g. "fioriexttemplate.extendcontrollerhook")
		 * @param {string} sResourcesComboboxId - The id of the resources combobox (views/controllers)
		 * @param {number} nSelectedResourceIndex - The index of the desired view/controller
		 */
		var _createExtension = function (iFrameWindow, oContext, nTileIndex,
										 sTemplateId, sResourcesComboboxId, nSelectedResourceIndex) {

			// the step of all available extensions
			var oExtensionSelectionStep = null;
			// the step of the selected extension (hide control, extend controller... etc)
			var oSelectedExtensionStep = null;

			// open the extension wizard
			extensionWizard.openExtensionWizardUI(oContext);

			// wait until the wizard has opened
			waitKarma(function () {
				return iFrameWindow.sap.ui.getCore().byId("CreateExtensionWizardUI");
			}, function (wizard) {
				// the Next button should already be enabled because we selected the extension project
				// click Next
				var oExtensionProjectStep = wizard._steps[0];
				oExtensionProjectStep._nextButton.firePress();

				// wait until the Next button of the "Extension Selection" step is enabled
				waitKarma(function () {
					oExtensionSelectionStep = wizard._steps[1];
					return oExtensionSelectionStep._nextButton.getEnabled();

				}, function () {

					// get all available extensions (tiles)
					var oDataSet = sap.ui.getCore().byId("SelectTemplateStep_DataSet");
					var aDataSetItems = oDataSet.getItems();
					// select the desired extension (tile)
					var oSelectedExtensionTile = aDataSetItems[nTileIndex];
					oSelectedExtensionTile.fireSelected({"itemId": oSelectedExtensionTile.getId()});

					// wait until the selected template is indeed the one we want
					waitKarma(function () {
						var selectedItemIndex = oDataSet.getSelectedIndex();
						if (selectedItemIndex === nTileIndex) {
							var oSelectedTemplate = wizard.getModel().getData().selectedTemplate;
							if (oSelectedTemplate._sId === sTemplateId) {
								return oSelectedTemplate;
							}
						}
					}, function () {

						// click Next to go to selected extension step
						oExtensionSelectionStep._nextButton.firePress();

						waitKarma(function () {
							oSelectedExtensionStep = wizard._steps[2];
							// wait until the Next button of the selected extension step is active
							return oSelectedExtensionStep && oSelectedExtensionStep._nextButton.isActive();

						}, function () {
							// get the resources combobox (views/controllers) and select the desired resource
							// leave the second combobox untouched (extension point, hook... etc)
							var oViewsCombobox = sap.ui.getCore().byId(sResourcesComboboxId);
							var sDetailsViewItemId = oViewsCombobox.getItems()[nSelectedResourceIndex].getId();
							oViewsCombobox.setSelectedItemId(sDetailsViewItemId);
							oViewsCombobox.fireChange({
								selectedItem: oViewsCombobox.getItems()[nSelectedResourceIndex]
							});

							waitKarma(function () {
								// wait until the Next button is enabled after we fired change in the combobox
								return oSelectedExtensionStep._nextButton.getEnabled();
							}, function () {
								// click Next to get to the Finish step
								oSelectedExtensionStep._nextButton.firePress();

								waitKarma(function () {
									// wait until the finish button is both active and enabled
									return wizard._finishButton.isActive() && wizard._finishButton.getEnabled();
								}, function () {
									// click Finish
									wizard._finishButton.firePress(); // this will trigger the "generated" event
								});
							});
						});
					});
				});
			});
		};

		/**
		 * Generate an extension project to a local application (workspace).
		 * Returns the extension project name.
		 *
		 * @param {object} iFrameWindow - The inner iFrame in which Web IDE is running
		 * @param {object} oContext - The context (on which services are called etc')
		 * @param {string} sParentName - The name of the original application
		 * @param {object} oResult - Properties to be returned to the caller. Contains extensionProjectName - the name of the generated project
		 * @param {function object} fnOnGenerated - A callback to be attached to the 'generated' event of the 'generation' service
		 */
		var _createLocalExtensionProject = function (iFrameWindow, oContext, sParentName, oResult, fnOnGenerated) {

			extensionProjectWizard.openGenerationWizardUI(oContext);

			waitKarma(function () {
				var w = iFrameWindow.sap.ui.getCore().byId("CreateExtensionProjectWizardUI");
				var b = iFrameWindow.sap.ui.getCore().byId("ExtensionProjectWizard_SelectAppMenuButton");
				if (w && b && b.getEnabled() ) {
					return w;
				} else {
					return false;
				}
			}, function (wizard) {

				// locate the "Select Application" menu button
				var selectAppButton = iFrameWindow.sap.ui.getCore().byId("ExtensionProjectWizard_SelectAppMenuButton");
                var menu = selectAppButton.getMenu();

				console.log("TEST: menu created? " + menu.getId());

				menu.open();
				var workspaceItem = menu.getItems()[2];

				console.log("TEST: workspaceItem exist? " + workspaceItem.getId());

				workspaceItem.fireEvent("select");

				// select the parent application
				waitKarma(function () {
					var localDialog = iFrameWindow.sap.ui.getCore().byId("extensionProjectWizard_localDialog");

					if (localDialog && _.isFunction(localDialog.getContent) &&
						localDialog.getContent()[1] &&
						_.isFunction(localDialog.getContent()[1].getContent) &&
						localDialog.getContent()[1].getContent()[0]) {
						return localDialog;
					} else {
						return false;
					}
				}, function (localDialog) {
					var workspaceTree = localDialog.getContent()[1].getContent()[0];
					var rootNode = workspaceTree.getNodes()[0];

					// selects the parent app
					var aNodes = rootNode.getNodes();
					for (var i = 0; i < aNodes.length; i++) {
						if (aNodes[i].getText() === sParentName) {
							aNodes[i].select();
							break;
						}
					}

					var okButton = localDialog.getButtons()[0];

					// wait for the ok button to get enabled
					waitKarma(function () {
						return okButton.getEnabled();
					}, function () {
						// click ok
						okButton.firePress();

						// Wait for the dialog to be closed
						waitKarma(function () {
							//return localDialog.getOpenState() === sap.ui.core.OpenState.CLOSED; UI5 bug? sometimes we don't get the closed status
							return wizard._steps[0]._step.packageNameTextField.getValue(); // Check that the extension project name was populated
						}, function () {
							// Click Next
							wizard._steps[0]._nextButton.firePress(); // Using the inner variables and not the getters since the getters return empty result...
							// Wait for the finish step to be active
							waitKarma(function () {
								return wizard._finishStep.isActive();
							}, function () {
								var extensionProjectName = wizard.getModel().getData().projectName;
								oResult.extensionProjectName = extensionProjectName;
								oContext.service.generation.attachEvent("generated", fnOnGenerated);

								// click finish
								wizard._finishButton.firePress();
							});
						});
					});
				});
			});
		};

		/**
		 * Generate an a sample app - the first one in the templates selection step.
		 *
		 * @param {object} iFrameWindow - The inner iFrame in which Web IDE is running
		 * @param {object} oContext - The context (on which services are called etc')
		 * @param {function object} fnOnGenerated - A callback to be attached to the 'generated' event of the 'generation' service
		 */
		var _createSampleApp = function (iFrameWindow, oContext, fnOnGenerated) {
			// Open the wizard
			referenceProjectGenerationWizard.openGenerationWizardUI(oContext);
			waitKarma(function () {
				var wizard = iFrameWindow.sap.ui.getCore().byId("CreateGenerationWizardUI");
				if (wizard) {
					if (wizard._steps[0]._nextButton.getEnabled()) {
						return wizard;
					} else {
						return null;
					}
				} else {
					return null;
				}
				return iFrameWindow.sap.ui.getCore().byId("CreateGenerationWizardUI");
			}, function (wizard) {
				wizard._steps[0]._nextButton.firePress(); // Using the inner variables and not the getters since the getters return empty result...
				waitKarma(function () {
					// Wait for the 'I Agree' label of the checkBox
					var wizardElements = wizard.findElements(true);
					var text = oContext.i18n.getText("FinishStepContent_agreeText");
					for (var i = 0; i < wizardElements.length; i++) {
						var element = wizardElements[i];
						if (element instanceof sap.ui.commons.CheckBox && element.getText() === text) {
							return element;
						}
					}
					return false;
				}, function (checkBox) {
					checkBox.setChecked();
					// Wait for the finish step to be active
					waitKarma(function () {
						return wizard._finishStep.isActive();
					}, function () {
						//wizard.setAfterCloseHandler(fnOnGenerated); This is an alternative for termination event...
						oContext.service.generation.attachEvent("generated", fnOnGenerated);

						// Click finish
						wizard._finishButton.firePress();
					});
				});
			});
		};
		
		/* eslint-enable no-console */

		return {
			createLocalExtensionProject: _createLocalExtensionProject,
			createSampleApp: _createSampleApp,
			createExtension: _createExtension,
			waitKarma: waitKarma,
			generateAbapExtensionProject: _generateAbapExtensionProject
		};
	});