define(["STF"], function (STF) {

	var oBeautifierProcessorService;
	var oBeautifierProcessorServiceImpl;
	var suiteName = "beautifier_test";

	var MockBeautifierService = function () {
		this.beautify = function (sContent, aFileExtension, oSettings) {
			return "beautified : " + sContent;
		};
	};

		describe('beautifierProcessor Service test ', function () {
			before(function () {
				return STF.startWebIde(suiteName, {config: "editor/tokyo/beautify/config.json"})
					.then(function () {
					oBeautifierProcessorService = STF.getService(suiteName, "beautifierProcessor");
					return STF.getServicePrivateImpl(oBeautifierProcessorService).then(function (oImpl) {
						oBeautifierProcessorServiceImpl = oImpl;
					});
				});
			});

		it("no beautifiers configured", function () {
			expect(oBeautifierProcessorService).to.have.ownProperty('hasBeautifierForFileExtension').and.not.equal("js");
			return oBeautifierProcessorService.beautify("abc", "js1").then(function (res) {
				expect(res).to.equal("abc");
			});
		});

		it("configure beautifier and execute", function() {
			var mConfig = {
				"beautifier" : [{
					"service": new MockBeautifierService(),
					"fileExtensions": ["js1", "xsjs1"],
					"name": "jsBeautifier1"
				}]
			};

			oBeautifierProcessorServiceImpl.configure(mConfig);
			expect(oBeautifierProcessorServiceImpl.hasBeautifierForFileExtension('js1')).to.be.true;
			expect(oBeautifierProcessorServiceImpl.hasBeautifierForFileExtension('xsjs1')).to.be.true;
			//equal(oBeautifierProcessorServiceImpl.hasBeautifierForFileExtension("xsjs1"), true);
			var res = oBeautifierProcessorServiceImpl.beautify("abc", "js1");
			expect(res).to.equal("beautified : " + "abc");
		});

		it("configure duplicate beautifier for js extension", function() {
			var mConfig1 = {
				"beautifier" : [{
					"service": "sap.watt.common.service.dummy1",
					"fileExtensions": ["js2", "xsjs2"],
					"name": "jsBeautifier2"
				}]
			};
			var mConfig2 = {
				"beautifier" : [{
					"service": "sap.watt.common.service.dummy2",
					"fileExtensions": ["js2"],
					"name": "dupBeautifier"
				}]
			};

			oBeautifierProcessorServiceImpl.configure(mConfig1);
			oBeautifierProcessorServiceImpl.configure(mConfig2);
			expect(oBeautifierProcessorServiceImpl.hasBeautifierForFileExtension('js2')).to.be.true;
			expect(oBeautifierProcessorServiceImpl._beautifiers).with.property("js2").to.equal(mConfig1.beautifier[0].service);
			expect(oBeautifierProcessorServiceImpl.hasBeautifierForFileExtension('xsjs2')).to.be.true;
		});



		beforeEach(function () {
			oBeautifierProcessorServiceImpl._beautifiers = {};
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});

});