define(["STF", "util/orionUtils"], function(STF, OrionUtils) {
	"use strict";

	// If you want this test to check all use cases note that some services need explicit configuration.
	var suiteName = "servicesTest";
	var iMaxGetServiceTime = 0;

	describe("Services test, load all services independently", function() {
		var getService = STF.getServicePartial(suiteName);
		var iGetServiceTime;
		var oDocumentProvider = null;
		var rootFolder = null;
		var sFolderBaseName = "Test_services_folder_" + Number(new Date());
		var sFileName = "tempFile.js";
		var content = "var  = \"tempValue\";";
		var sServiceTime="";

		function _createTestOrionData() {
			return OrionUtils.startWebIdeWithOrion(suiteName, {}, undefined, undefined, true).then(function (webIdeWindowObj) {
				oDocumentProvider = getService("filesystem.documentProvider");
				oDocumentProvider._oDAO = getService("orionFileDAO");

				return oDocumentProvider.getRoot().then(function (oRoot) {
					return oRoot.createProject({"name": sFolderBaseName}).then(function (folder) {
						rootFolder = folder;
						return folder.createFile(sFileName).then(function (file) {
							return file.setContent(content).then(function () {
								return file.save().then(function () {
									return oRoot.refresh().then(function() {
										STF.shutdownWebIde(suiteName);
									});
								});
							});
						});
					});
				});
			});
		}

		function _removeTestOrionData() {
			return OrionUtils.startWebIdeWithOrion(suiteName, {}, undefined, undefined, true).then(function (webIdeWindowObj) {
				oDocumentProvider = getService("filesystem.documentProvider");
				oDocumentProvider._oDAO = getService("orionFileDAO");

				return oDocumentProvider.getRoot().then(function (oRoot) {
					return oRoot.getFolderContent().then(function (aResult) {
						_.forEach(aResult, function (oFolder) {
							if (sFolderBaseName === oFolder.getEntity().getName()) {
								return oFolder.delete().then(function () {
									return STF.shutdownWebIde(suiteName);
								});
							}
						});
						return STF.shutdownWebIde(suiteName);
					});
				});
			});
		}

		before(function () {
			return _createTestOrionData();
		});

		after(function () {
			sServiceTime += 'Max service time: = ' + iMaxGetServiceTime + ' ms';
			console.log(sServiceTime);
			return _removeTestOrionData();

		});

		function _validateService(serviceName) {
			var iStart = performance.now();
			var oService = getService(serviceName);
			expect(oService).to.be.ok;
			return STF.getServicePrivateImpl(oService).then(function (oServiceImpl) {
				expect(oServiceImpl).to.be.ok;
				expect(oServiceImpl.context.event.fire).to.be.ok;
				iGetServiceTime = performance.now() - iStart;
				if (iMaxGetServiceTime < iGetServiceTime) {
					iMaxGetServiceTime = iGetServiceTime;
				}
				return Q(oService);
			});
		}

		var aServicesNames = window.CI_TESTS_ALL_SERVICE_NAMES;
		var sServiceName;

		// The number of services is not a constant. We expect it to be bigger then 100 (today it is 282)
		expect(aServicesNames).to.have.length.greaterThan(100);

        /**
         * Gets a command line parameter's value
         * @return the given parameter's value, undefined if it doesn't exist
         */
		function getParameter(parameterName) {
		    var returnValue;
            var paramIndex = _.findIndex(window.__karma__.config.args, function filter(arg) {
                return arg.startsWith("--" + parameterName);
            });
            if (paramIndex < 0) {
                return;
            } else {
                returnValue = window.__karma__.config.args[paramIndex];
                returnValue = returnValue.split('=')[1];
                returnValue = Number(returnValue);
            }
            return returnValue;
		}
		// totalSections & currSection are command line parameters that specify which services should be tested.
		// To determine the tests to run, we go over the list of services and run the tests only for
		// the services who's index is within the section that is defined by currSection.
		// For example, if we have 23 services, totalSections of 3 and currSection of 1, we will test the services
		// with the following indices (zero-based):
		// 8, 9, 10, 11, 12, 13, 14, 15, 16
		// The default values are totalSections = 1 and currSection = 0, this lets us go over all services
        var totalSections = getParameter("totalSections");
        var currSection = getParameter("currSection");
        if (totalSections === undefined || currSection === undefined) {
            totalSections = 1;
            currSection = 0;
        }

        var sortedServicesNames = _.sortBy(aServicesNames);
        var filteredServicesNames = _.chunk(sortedServicesNames, Math.ceil(aServicesNames.length / totalSections))[currSection];

		_.forEach(filteredServicesNames, function (serviceName) {
            it('Should load service ' + serviceName, function () {
                sServiceName = serviceName;
                return _validateService(serviceName);
            });
		});

		beforeEach(function() {
			return OrionUtils.startWebIdeWithOrion(suiteName, {}, undefined, undefined, true);
		});

		afterEach(function() {
			STF.shutdownWebIde(suiteName);
			sServiceTime +='Test Service ' + sServiceName +' Time = ' + iGetServiceTime + ' ms\n';
		});
	});
});