define(["sap/watt/saptoolsets/fiori/abap/plugin/abaprepository/ui/wizard/DeployWizard"],
	function (deployWizard) {

		"use strict";

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
		 * gets a destination item with name destinationName from the destinationComboBox object
		 *
		 * @param {object} destinationName - The name of the required destination
		 * @param {object} destinationComboBox - The ComboBox object taken from the DOM
		 * @return {object} destination - contains model parameters to be checked
		 */
		var _getItem = function (destinationName, destinationComboBox) {

			var destination = null;

			var items = destinationComboBox.getItems();
			for (var i = 0; i < items.length; i++) {
				var item = destinationComboBox.getItems()[i];
				var data = item.getModel().getData();
				if (data && data.name === destinationName) {
					destination = item;
				}
			}

			return destination;
		};

		/**
		 * check the persistency in deploy to abap wizard, when the deployment is done first time
		 *(persistency not needed for first time)
		 *
		 * @param {object} oSelection - The of current selected project
		 * @param {object} oContext - The context (on which services are called etc')
		 * @return {promise} oResult - contains model parameters to be checked
		 */
		var _checkFirstPersistencyInABAPDeploymentWizard = function (oContext, oSelection) {
			deployWizard.openWizard(oContext, oSelection);
			var oResult = {};
			var oDeferred = Q.defer();
			waitKarma(function () {
				return sap.ui.getCore().byId("DeployWizard");
			}, function (wizard) {
				waitKarma(function () {
					wizard.getModel().setProperty("/note", false);
					return wizard.getModel().action;
				}, function () {

					var destinationComboBox = sap.ui.getCore().byId("SelectDeployStep_ComboBox");
					var oSelectDeployStep = wizard._steps[0];
					//choose system
					var sys = "testDes";
					destinationComboBox.setValue(sys);
					var oItem = _getItem(sys, destinationComboBox);
					destinationComboBox.setSelectedKey(oItem.getKey());
					destinationComboBox.fireChange({
						"selectedItem": oItem,
						"firstTime": "true"   //this will indicate not to clear persistence information on system change this time
					});
					waitKarma(function () {
						return oSelectDeployStep._nextButton.getEnabled();
					}, function () {
						oSelectDeployStep._nextButton.firePress();

						var oCreateAppStep = wizard._steps[1];

						waitKarma(function () {
							return oCreateAppStep._backButton.getEnabled();
						}, function () {
							var model = wizard.getModel();

							model.setProperty("/name", "myAppTest");
							oCreateAppStep._nextButton.focus();
							model.setProperty("/description", "myAPPDescription");
							oCreateAppStep._nextButton.focus();
							model.setProperty("/selectedPackage", "$TMP");
							var packageText = sap.ui.getCore().byId("CreateApplicationStep_PackageField");
							packageText.fireChange({newValue: "$TMP"});
							waitKarma(function () {
								return oCreateAppStep._nextButton.getEnabled();
							}, function () {
								oCreateAppStep._nextButton.firePress();
								var oFinishStep = wizard._steps[2];
								waitKarma(function () {
									return wizard._finishButton.getEnabled();
								}, function () {
									var oWizardModel = wizard.getModel();
									oResult.action = oWizardModel.action;
									oResult.name = oWizardModel.destination.name;
									oResult.appName = oWizardModel.getData().name;
									oDeferred.resolve(oResult);
								});
							});
						});
					});
				});
			});

			return oDeferred.promise;
		};

		/**
		 * check the persistency in deploy to abap wizard, when the deployment is done seconed time
		 *
		 * @param {object} oSelection - The of current selected project
		 * @param {object} oContext - The context (on which services are called etc')
		 * @return {promise} oResult - contains model parameters to be checked
		 */
		var _checkSecondPersistencyInABAPDeploymentWizard = function (oContext, oSelection) {
			deployWizard.openWizard(oContext, oSelection);
			var oResult = {};
			var oDeferred = Q.defer();
			waitKarma(function () {
				return sap.ui.getCore().byId("DeployWizard");
			}, function (wizard) {
				waitKarma(function () {
					wizard.getModel().setProperty("/note", false);
					return wizard.getModel().action;
				}, function () {
					var oSelectDeployStep = wizard._steps[0];
					waitKarma(function () {
						return oSelectDeployStep._nextButton.getEnabled();
					}, function () {
						oSelectDeployStep._nextButton.firePress();
						var oSelectAppStep = wizard._steps[1];
						waitKarma(function () {
							return oSelectAppStep._nextButton.getEnabled();
						}, function () {
							oSelectAppStep._nextButton.firePress();
							waitKarma(function () {
								return wizard._finishButton.getEnabled();
							}, function () {
								var oWizardModel = wizard.getModel();
								oResult.action = oWizardModel.action;
								oResult.name = oWizardModel.destination.name;
								oResult.appName = oWizardModel.getData().name;
								oDeferred.resolve(oResult);
							});
						});
					});
				});
			});
			return oDeferred.promise;
		};

		var _checkSecondPersistencySystemNotFound = function (oContext, oSelection) {
			deployWizard.openWizard(oContext, oSelection);
			var oResult = {};
			var oDeferred = Q.defer();
			waitKarma(function () {
				return sap.ui.getCore().byId("DeployWizard");
			}, function (wizard) {
				waitKarma(function () {
					wizard.getModel().setProperty("/note", false);
					return wizard.getModel().action;
				}, function () {
					var destinationComboBox = sap.ui.getCore().byId("SelectDeployStep_ComboBox");
					var oSelectDeployStep = wizard._steps[0];
					var oWizardModel = wizard.getModel();
					oResult.action = oWizardModel.action;
					oResult.destinationInModel = oWizardModel.destination;
					oResult.comboBoxValue = destinationComboBox.getValue();
					oResult.isValidBeforeSelection = oSelectDeployStep.getValid();

					//now choose a system and make sure evey thing is ok
					var sys = "testDesNotExist";
					destinationComboBox.setValue(sys);
					var oItem = _getItem(sys, destinationComboBox);
					destinationComboBox.setSelectedKey(oItem.getKey());
					destinationComboBox.fireChange({
						"selectedItem": oItem,
						"firstTime": "true"   //this will indicate not to clear persistence information on system change this time
					});
					waitKarma(function () {
						return oSelectDeployStep._nextButton.getEnabled();
					}, function () {

						oResult.isValidAfterSelection = oSelectDeployStep.getValid();
						oDeferred.resolve(oResult);
					});
				});
			});
			return oDeferred.promise;
		};

		var _checkSecondPersistencySystemNoDApplicationFound = function (oContext, oSelection) {
			deployWizard.openWizard(oContext, oSelection);
			var oResult = {};
			var oDeferred = Q.defer();
			waitKarma(function () {
				return sap.ui.getCore().byId("DeployWizard");
			}, function (wizard) {
				waitKarma(function () {
					wizard.getModel().setProperty("/note", false);
					return wizard.getModel().action;
				}, function () {
					var oSelectDeployStep = wizard._steps[0];
					waitKarma(function () {
						return oSelectDeployStep._nextButton.getEnabled();
					}, function () {
						oSelectDeployStep._nextButton.firePress();
						waitKarma(function () {
							return wizard.getModel().applications;    //wait until all applications are loaded
						}, function () {
							var oSelectAppStep = wizard._steps[1];
							oResult.nextEnabledWithNoApplication = oSelectAppStep._nextButton.getEnabled();
							var oSearchField = sap.ui.getCore().byId("SelectApplocationStep_SearchField");
							var oTable = sap.ui.getCore().byId("SelectApplocationStep_Table");
							oResult.searchFieldValueBeforeChoose = oSearchField.getValue();
							//now choose an application
							oSearchField.setValue("myAppTestNotFound"); //TODO check if need to display at search file also
							oSearchField.fireSuggest({
								"value": "myAppTestNotFound"
							});
							oTable.setSelectedIndex(0);
							waitKarma(function () {
								return oSelectAppStep._nextButton.getEnabled();
							}, function () {
								oResult.searchFieldValueAfterChoose = oSearchField.getValue();
								oResult.nextEnabledWithApplication = oSelectAppStep._nextButton.getEnabled();
								oResult.isValidAfterSelection = oSelectAppStep.getValid();
								oDeferred.resolve(oResult);
							});
						});
					});
				});
			});
			return oDeferred.promise;
		};

		/**
		 * Open the Deployment wizard when there's only one destination configured.
		 * Make sure no error exists and the Next button is enabled.
		 *
		 * @param {object} oContext - The context (on which services are called etc')
		 * @param {object} oSelection - The current selected project
		 * @return {promise} oResult - contains model parameters to be checked
		 */
		var _openDeploymentWizardWithOneDestination = function (oContext, oSelection) {
			deployWizard.openWizard(oContext, oSelection);
			var oResult = {};
			var oDeferred = Q.defer();
			waitKarma(function () {
				return sap.ui.getCore().byId("DeployWizard");
			}, function (wizard) {
				waitKarma(function () {
					wizard.getModel().setProperty("/note", false);
					return wizard.getModel().action;
				}, function () {
					var destinationComboBox = sap.ui.getCore().byId("SelectDeployStep_ComboBox");

					oResult.selectedDestinationText = destinationComboBox.getValue();

					var oSelectDeployStep = wizard._steps[0];

					waitKarma(function () {
						return oSelectDeployStep._nextButton.getEnabled();
					}, function () {

						var oWizardModel = wizard.getModel();
						oResult.action = oWizardModel.action;
						oResult.destinationName = oWizardModel.destination.name;
						oDeferred.resolve(oResult);
					});
				});
			});

			return oDeferred.promise;
		};
		
		
		//applicationParams is an object the should contain the destination system, the applicaion name and the package name
		var _deployApplicationToABAP = function (oContext, oSelection, oApplicaionParams) {
			return deployWizard.openWizard(oContext, oSelection).then(function(){
				console.log("deployment wizard opened");
				var oResult = {};
				var oDeferred = Q.defer();
				waitKarma(function () {
					return sap.ui.getCore().byId("DeployWizard");
				}, function (wizard) {
					var destinationComboBox = sap.ui.getCore().byId("SelectDeployStep_ComboBox");
					var oSelectDeployStep = wizard._steps[0];
					//choose system
					var sSystem = oApplicaionParams.destination;
					destinationComboBox.setValue(sSystem);
					var oItem = _getItem(sSystem, destinationComboBox);
					destinationComboBox.setSelectedKey(oItem.getKey());
					destinationComboBox.fireChange({
						"selectedItem": oItem,
						"firstTime": "true"   //this will indicate not to clear persistence information on system change this time
					});
					waitKarma(function () {
						return oSelectDeployStep._nextButton.getEnabled();
					}, function () {
						console.log("choosed backend system");
						oSelectDeployStep._nextButton.firePress();
						var oCreateAppStep = wizard._steps[1];
						waitKarma(function () {
							return oCreateAppStep._backButton.getEnabled();
						}, function () {
							var model = wizard.getModel();
							model.setProperty("/name", oApplicaionParams.name);
							//focus on "next" button in order to remove the focus from the text field
							oCreateAppStep._nextButton.focus();
							model.setProperty("/description", oApplicaionParams.name + "Description");
							oCreateAppStep._nextButton.focus();
							model.setProperty("/selectedPackage", oApplicaionParams.package);
							var oPackageTextField = sap.ui.getCore().byId("CreateApplicationStep_PackageField");
							oPackageTextField.fireChange({newValue: oApplicaionParams.package});
							waitKarma(function () {
								return oCreateAppStep._nextButton.getEnabled();
							}, function () {
								console.log("inserted app's name and description");
								oCreateAppStep._nextButton.firePress();
								waitKarma(function () {
									return wizard._finishButton.getEnabled();
								}, function () {
									wizard._finishButton.firePress();
									waitKarma(function () {
										console.log("finish pressed");
										var oNotificationBar = sap.ui.getCore().byId("userNotificationBarMessage");
										return oNotificationBar.getVisible() && oNotificationBar.getText() === oContext.i18n.getText("i18n", "DeployToBSPDialog_DeployLogSuccessMsg");
									}, function () {
										var oWizardModel = wizard.getModel();
										oResult.oWizardModel = oWizardModel;
										oDeferred.resolve(oResult);
									});
								});
							});
						});
					});
				});
				return oDeferred.promise;
			});
		};

		return {
			checkFirstPersistencyInABAPDeploymentWizard: _checkFirstPersistencyInABAPDeploymentWizard,
			checkSecondPersistencyInABAPDeploymentWizard: _checkSecondPersistencyInABAPDeploymentWizard,
			checkSecondPersistencySystemNotFound: _checkSecondPersistencySystemNotFound,
			checkSecondPersistencySystemNoDApplicationFound: _checkSecondPersistencySystemNoDApplicationFound,
			openDeploymentWizardWithOneDestination: _openDeploymentWizardWithOneDestination,
			deployApplicationToABAP: _deployApplicationToABAP
		};
	});