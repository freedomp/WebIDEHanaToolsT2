define(["STF", "sinon"], function(STF, sinon) {
	"use strict";

	var sandbox;
	var suiteName = "psTranslation";

	describe("Pseudo Translation", function() {
		var oFakeFileDAO;
		var oFileSystem;
		var oPseudoService;

		before(function() {
			var loadWebIdePromise = STF.startWebIde(suiteName, {
				config: "runner/service/translation/config.json"
			});
			return loadWebIdePromise.then(function() {
				sandbox = sinon.sandbox.create();
				oFakeFileDAO = STF.getService(suiteName, "fakeFileDAO");
				oFileSystem = STF.getService(suiteName, "filesystem.documentProvider");
				oPseudoService = STF.getService(suiteName, "pseudotranslation");
			});
		});

		after(function() {
			STF.shutdownWebIde(suiteName);
		});

		afterEach(function() {
			sandbox.restore();
		});

		it("Test pseudo translation file generation",
			function() {
				var oFileStructure = {
					"myProject": {
						"i18n": {
							"i18n.properties": "! comment using '!'\n# comment using '#'\n# key without a value 1\nkey1\n# key without a value 2\nkey2=\n# empty line\n\n# equal and special characters in the value\nkey3=rrr!erw\\=#rew\\=\n# space in the key\nspace\\ key = space\\ value\\=mark\\!\n# equal in the key\nequal\\=key = value\n# \\ in end of line - continue to next line\nkey4=val2\\\ncont1=val3\\\ncont2=rrr" +
								"\n# check all English characters\nkey5=abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\n# placeholder in value\nkey6=Welcome {0}\n# space between key and value\nkey7   =    value"
						},
						"plugin.json": "{\"translation\": { \"translationDomain\": \"\", \"supportedLanguages\": \"en,fr,de,en_us_sappsd\", \"defaultLanguage\": \"en\", \"defaultI18NPropertyFile\": \"i18n.properties\", \"resourceModelName\": \"i18n\" }}"
					}
				};

				return oFakeFileDAO.setContent(oFileStructure).then(function() {
					return oFileSystem.getDocument("/myProject/i18n/i18n.properties").then(function(oDoc) {
						return oPseudoService.generatePseudoProperties(oDoc).then(function() {
							return oFileSystem.getDocument("/myProject/i18n/i18n_en_US_sappsd.properties").then(function(oPseudoDoc) {
								return oPseudoDoc.getContent().then(function(sPseudoContent) {
									var sExpectedPseudoContent =
										"! comment using '!'\n# comment using '#'\n# key without a value 1\nkey1\n# key without a value 2\nkey2=\n# empty line\n\n# equal and special characters in the value\nkey3=[[[\\u0157\\u0157\\u0157!\\u0113\\u0157\\u0175\\=#\\u0157\\u0113\\u0175\\=\\u2219\\u2219\\u2219\\u2219]]]\n# space in the key\nspace\\ key = [[[\\u015F\\u03C1\\u0105\\u010B\\u0113\\ \\u028B\\u0105\\u013A\\u0171\\u0113\\=\\u0271\\u0105\\u0157\\u0137\\!\\u2219\\u2219\\u2219\\u2219]]]\n# equal in the key\nequal\\=key = [[[\\u028B\\u0105\\u013A\\u0171\\u0113\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n# \\ in end of line - continue to next line\nkey4=[[[\\u028B\\u0105\\u013A2\\" +
										"\n\\u010B\\u014F\\u014B\\u01631=\\u028B\\u0105\\u013A3\\\n\\u010B\\u014F\\u014B\\u01632=\\u0157\\u0157\\u0157\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n# check all English characters\nkey5=[[[\\u0105\\u0183\\u010B\\u018C\\u0113\\u0192\\u011F\\u0125\\u012F\\u0135\\u0137\\u013A\\u0271\\u014B\\u014F\\u03C1\\u01A3\\u0157\\u015F\\u0163\\u0171\\u028B\\u0175\\u03C7\\u0177\\u017E\\u01000\\u0181\\u0108\\u010E\\u0114\\u0191\\u0122\\u0124\\u012C\\u0134\\u0136\\u013B\\u039C\\u0143\\u014E\\u01A4\\u01EC\\u0158\\u015C\\u0162\\u016E\\u01B2\\u0174\\u03A7\\u0176\\u017B\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]\n# placeholder in value\nkey6=[[[\\u0174\\u0113\\u013A\\u010B\\u014F\\u0271\\u0113 {0}\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]" +
										"\n# space between key and value\nkey7   =    [[[\\u028B\\u0105\\u013A\\u0171\\u0113\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219\\u2219]]]";
									expect(sPseudoContent === sExpectedPseudoContent).to.equal(true);
								});
							});
						});
					});
				});
			});
	});
});