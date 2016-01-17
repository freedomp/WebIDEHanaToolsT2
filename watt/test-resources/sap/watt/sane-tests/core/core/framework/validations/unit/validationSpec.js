define(["sap/watt/core/Validations", "sap/watt/lib/lodash/lodash"], function (Validations, _) {
	"use strict";

	describe("Validations Unit tests (no WebIde framework active)", function () {

		describe("check configured services which are not required or provided", function () {

			it("VALID1 - configured is required", function () {
				var oInput = {
					"requires": {
						"services": [
							"command",
							"shnitzel"
						]
					},

					"configures": {
						"services": {
							"command:commands": []
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				assert.ok(_.isEmpty(aIssues));
			});

			it("VALID2 - configured is provided", function () {
				var oInput = {
					"configures": {
						"services": {
							"bamba:baby": []
						}
					},

					"provides": {
						"services": {
							"bamba": {},
							"bisli": {}
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				assert.ok(_.isEmpty(aIssues));
			});

			it("VALID3 - no configured", function () {
				var oInput = {
					"provides": {
						"services": {
							"bamba": {},
							"bisli": {}
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				assert.ok(_.isEmpty(aIssues));
			});

			it("VALID4 - some configured are from provided some from required", function () {
				var oInput = {
					"requires": {
						"services": [
							"bisli"
						]
					},

					"configures": {
						"services": {
							"bamba:baby": [],
							"bisli": []
						}
					},

					"provides": {
						"services": {
							"bamba": {}
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				assert.ok(_.isEmpty(aIssues));
			});

			it("INVALID1 - configured is missing", function () {
				var oInput = {
					"requires": {
						"services": [
							"bisli"
						]
					},

					"configures": {
						"services": {
							"pizza:baby": [],
							"bisli": []
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				assert.deepEqual(aIssues, ["pizza"]);
			});

			it("INVALID2 - multiple configured are missing", function () {
				var oInput = {
					"configures": {
						"services": {
							"pizza:baby": [],
							"bisli": []
						}
					}
				};

				var aIssues = Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oInput);
				assert.deepEqual(aIssues, ["pizza", "bisli"]);
			});
		});
		describe("check missing required services", function () {

			var providedServices = ["bisli", "bamba", "pizza"];
			var providedServicesMetaData = [
				{
					"name": "ima",

					"provides": {
						"services": {
							"bamba": {}
						}
					}
				},
				{
					"name": "aba",

					"provides": {
						"services": {
							"bisli": {},
							"pizza": {}
						}
					}
				}
			];

			it("valid1 - single required Services exist", function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": [
							"bisli"
						]
					}
				};

				var aIssues = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServices);
				var aIssuesMetaData = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServicesMetaData);
				assert.ok(_.isEmpty(aIssues) && _.isEmpty(aIssuesMetaData));
			});

			it("valid2 - multiple required Services exist", function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": [
							"bisli",
							"pizza"
						]
					}
				};

				var aIssues = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServices);
				var aIssuesMetaData = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServicesMetaData);
				assert.ok(_.isEmpty(aIssues) && _.isEmpty(aIssuesMetaData));
			});

			it("valid3 - no required Services for Plugin",  function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": []
					}
				};

				var aIssues = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServices);
				var aIssuesMetaData = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServicesMetaData);
				assert.ok(_.isEmpty(aIssues) && _.isEmpty(aIssuesMetaData));
			});

			it("valid4 - no required no provided",  function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": []
					}
				};

				var aIssues = Validations.checkMissingRequiredServices(oMetaDataToCheck, []);
				assert.ok(_.isEmpty(aIssues));
			});

			it("invalid1 A - missing single required", function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": ["schnitzel", "bamba"]
					}
				};

				var aIssues = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServices);
				assert.deepEqual(aIssues, ["schnitzel"]);
			});

			it("invalid1 B - missing single required",  function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": ["schnitzel", "bamba"]
					}
				};

				var aIssuesMetaData = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServicesMetaData);
				assert.deepEqual(aIssuesMetaData, ["schnitzel"]);
			});

			it("invalid2 A - missing multiple required",  function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": ["schnitzel", "bamba", "bisli", "hamburger"]
					}
				};

				var aIssues = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServices);
				assert.deepEqual(aIssues, ["schnitzel", "hamburger"]);
			});

			it("invalid2 B - missing multiple required",  function () {
				var oMetaDataToCheck = {
					"requires": {
						"services": ["schnitzel", "bamba", "bisli", "hamburger"]
					}
				};

				var aIssuesMetaData = Validations.checkMissingRequiredServices(oMetaDataToCheck, providedServicesMetaData);
				assert.deepEqual(aIssuesMetaData, ["schnitzel", "hamburger"]);
			});
		});
	});
});