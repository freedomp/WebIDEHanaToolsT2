define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {
	var sandbox;
	var suiteName = "service_js_validator_display";
	var oJSValidatorService;
	var oJSDisplayValidatorConfigurationService;
	var _oJSDisplayValidatorConfigurationImpl;
	var oFakeFileDAO;
	var MockFileDocument;

	function getFileAsString(url) {
		var sURL = require.toUrl(url);
		var sResult;
		jQuery.ajax({
			url: sURL,
			dataType: 'text',
			success: function (result) {
				sResult = result;
			},
			async: false
		});
		return sResult;
	}

	var FakeDocumentForSecurity = function (sContent, ruleName) {
		this.getEntity = function () {
			return {
				getFullPath: function () {
					return ruleName;
				}
			};
		};
		this.getContent = function () {
			return Q(sContent);
		};
		this.getTitle = function () {
			return ruleName;
		};
	};

	describe("JavaScript Validator Display Configuration", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					oJSValidatorService = serviceGetter("jsValidator");
					oJSDisplayValidatorConfigurationService = serviceGetter("jsDisplayValidatorConfiguration");
					oFakeFileDAO = serviceGetter("fakeFileDAO");
					return STF.getServicePrivateImpl(oJSDisplayValidatorConfigurationService).then(function (oImpl) {
						_oJSDisplayValidatorConfigurationImpl = oImpl;
						return STF.require(suiteName, [
							"sane-tests/util/mockDocument"
						]);
					}).spread(function (oMockDocument) {
						MockFileDocument = oMockDocument.MockFileDocument;
					});
				});
		});

		beforeEach(function () {
			sandbox = sinon.sandbox.create();
		});

		it("fiori custom rules should pass security test", function () {
			var rulesNames = [
				"sap-browser-api-error",
				"sap-browser-api-warning",
				"sap-no-event-prop",
				"sap-no-global-variable",
				"sap-no-hardcoded-color",
				"sap-no-hardcoded-url",
				"sap-no-jquery-device-api",
				"sap-no-localstorage",
				"sap-no-override-rendering",
				"sap-no-override-storage-prototype",
				"sap-no-sessionstorage",
				"sap-no-ui5base-prop",
				"sap-no-ui5eventprovider-prop",
				"sap-no-ui5odatamodel-prop",
				"sap-no-window-alert"
			];
			var aDocuments = [];
			_.each(rulesNames, function (ruleName) {
				var fileContent = getFileAsString(ruleName + ".js", "rules/fiori");
				aDocuments.push(new FakeDocumentForSecurity(fileContent, ruleName));
			});
			return _oJSDisplayValidatorConfigurationImpl._securityScan(aDocuments).then(function (aIds) {
				// ids that passes security
				expect(rulesNames.length).to.equal(aIds.length);
			});
		});

		it("Test 'convertConfigurationToDisplayFormat' method", function () {
			var oConfig = {
				"eslintConfig": {
					"env": {
						"browser": false,
						"node": false,
					},
					"globals": {
						"sinon": false,
						"sap": false
					},
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [2, {"location": "anywhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "warning",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};

			var aExpectedRules = {
				"header": {
					"env": {
						"browser": false,
						"node": false,
					},
					"globals": {
						"sinon": false,
						"sap": false
					}
				},
				"rules": {
					"block-scoped-var": {
						"ruleId": "block-scoped-var",
						"severity": "info",
						"enable": false,
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var",
					},
					"no-warning-comments": {
						"ruleId": "no-warning-comments",
						"severity": "warning",
						"enable": true,
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
						"additionalProperties": [{"location": "anywhere"}]
					}
				}
			};

			return oJSDisplayValidatorConfigurationService.convertConfigurationToDisplayFormat(oConfig).then(function (aRules) {
				expect(aRules).to.be.ok;
				expect(aRules).to.deep.equal(aExpectedRules); //TODO: error assert
			});
		});

		it("Test 'convertConfigurationToDisplayFormat' method - no header info", function () {
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [2, {"location": "anywhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "warning",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};

			var aExpectedRules = {
				"header": {},
				"rules": {
					"block-scoped-var": {
						"ruleId": "block-scoped-var",
						"severity": "info",
						"enable": false,
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var",
					},
					"no-warning-comments": {
						"ruleId": "no-warning-comments",
						"severity": "warning",
						"enable": true,
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
						"additionalProperties": [{"location": "anywhere"}]
					}
				}
			};

			return oJSDisplayValidatorConfigurationService.convertConfigurationToDisplayFormat(oConfig).then(function (aRules) {
				expect(aRules).to.be.ok;
				expect(aRules).to.deep.equal(aExpectedRules); //TODO: error assert
			});
		});

		it("Test 'convertConfigurationToConcreteFormat' method", function () {
			var aRules = {
				"rules": {
					"block-scoped-var": {
						"ruleId": "block-scoped-var",
						"severity": "info",
						"enable": false,
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var",
					},
					"no-warning-comments": {
						"ruleId": "no-warning-comments",
						"severity": "warning",
						"enable": true,
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
						"additionalProperties": [{"location": "anywhere"}]
					}
				}
			};

			var oExpectedConfig = {
				"eslintConfig": {
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [2, {"location": "anywhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var",
					},
					"no-warning-comments": {
						"severity": "warning",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};

			return oJSDisplayValidatorConfigurationService.convertConfigurationToConcreteFormat(aRules).then(function (oConfig) {
				expect(oConfig).to.be.ok;
				expect(oConfig).to.deep.equal(oExpectedConfig); //TODO: error assert
			});
		});

		it("Test 'mergeConfigurations' method", function () {
			var defaultConfig = {
				"eslintConfig": {
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [2, {"location": "anywhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "warning",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};
			var customConfiguration = {
				"eslintConfig": {
					"rules": {
						"no-warning-comments": [0, {"location": "nowhere"}]
					}
				},
				"rulesExt": {
					"no-warning-comments": {
						"severity": "info",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};
			return oJSDisplayValidatorConfigurationService.mergeConfigurations(defaultConfig, customConfiguration).then(function (oConfig) {
				var mergeConfig = {
					"eslintConfig": {
						"rules": {
							"block-scoped-var": 0,
							"no-warning-comments": [0, {"location": "nowhere"}]
						}
					},
					"rulesExt": {
						"block-scoped-var": {
							"severity": "info",
							"category": "Stylistic Issue",
							"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
						},
						"no-warning-comments": {
							"severity": "info",
							"category": "Best Practice",
							"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
						}
					}
				};
				expect(oConfig).to.deep.equal(mergeConfig);
			});
		});

		it("Test 'getDiffConfigurationToStore' method - no previous project configuration", function () {
			var defaultConfig = {
				"eslintConfig": {
					"env": {"browser": false},
					"globals": {"require": false},
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [2, {"location": "anywhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "warning",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};
			var customConfiguration = {
				"eslintConfig": {
					"globals": {"require": false},
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [0, {"location": "nowhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "info",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};
			var prevProjectConfig = undefined;
			return oJSDisplayValidatorConfigurationService.getDiffConfigurationToStore(defaultConfig, prevProjectConfig, customConfiguration)
				.then(function (oConfig) {
					var diffConfig = {
						"eslintConfig": {
							"env": {},
							"rules": {
								"no-warning-comments": [0, {"location": "nowhere"}]
							}
						},
						"rulesExt": {
							"no-warning-comments": {
								"severity": "info",
								"category": "Best Practice",
								"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
							}
						}
					};
					expect(oConfig).to.deep.equal(diffConfig);
				});
		});

		it("Test 'getDiffConfigurationToStore' method - with previous project configuration", function () {
			var defaultConfig = {
				"eslintConfig": {
					"env": {"browser": false},
					"globals": {"require": false},
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [2, {"location": "anywhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "warning",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};
			var customConfiguration = {
				"eslintConfig": {
					"globals": {"require": false},
					"rules": {
						"block-scoped-var": 0,
						"no-warning-comments": [0, {"location": "nowhere"}]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "info",
						"category": "Stylistic Issue",
						"helpUrl": "http://eslint.org/docs/rules/block-scoped-var"
					},
					"no-warning-comments": {
						"severity": "info",
						"category": "Best Practice",
						"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
					}
				}
			};
			var prevProjectConfig = {
				"eslintConfig": {
					"env": {
						"browser": false,
						"sap": true
					},
					"rules": {
						"block-scoped-var": 2
					}
				}
			};
			return oJSDisplayValidatorConfigurationService.getDiffConfigurationToStore(defaultConfig, prevProjectConfig, customConfiguration)
				.then(function (oConfig) {
					var diffConfig = {
						"eslintConfig": {
							"env": {},
							"rules": {
								"block-scoped-var": 0,
								"no-warning-comments": [0, {"location": "nowhere"}]
							}
						},
						"rulesExt": {
							"no-warning-comments": {
								"severity": "info",
								"category": "Best Practice",
								"helpUrl": "http://eslint.org/docs/rules/no-warning-comments",
							}
						}
					};
					expect(oConfig).to.deep.equal(diffConfig);
				});
		});

		it("Test 'getDefaultConfiguration' method without path", function () {
			return oJSDisplayValidatorConfigurationService.getDefaultConfiguration().then(function (oConfig) {
				expect(oConfig).to.be.ok;
				expect(oConfig.eslintConfig);
				expect(oConfig.eslintConfig.globals).to.be.ok;
				expect(oConfig.eslintConfig.env).to.be.ok;
				expect(oConfig.eslintConfig.rules).to.be.ok;
				expect(oConfig.rulesExt).to.be.ok;
				assert.ok(Object.keys(oConfig.eslintConfig.globals).length > 0);
				assert.ok(Object.keys(oConfig.eslintConfig.env).length > 0);
				assert.ok(Object.keys(oConfig.eslintConfig.rules).length > 0);
				expect(Object.keys(oConfig.eslintConfig.rules).length).to.equal(Object.keys(oConfig.rulesExt).length);
			});
		});

		it("Test 'getDefaultConfiguration' method with path", function () {
			var searchedFolder = "/myTestProject";
			var source = "var a = 5;\n if (a === 4)  {\n eval(3 * 5); \n}";
			var oFileStructure = {
				"myTestProject": {
					"test": {
						"ifRule.js": getFileAsString("if_NoModule.js", "rules"),
						"inner": {
							"myfile.xml": "1",
							"evalRule.js": getFileAsString("eval_NoModule.js", "rules")
						},
						"non-secure-rule.js": getFileAsString("securityViolation.js", "rules")
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure)
				.then(function () {
					return oJSDisplayValidatorConfigurationService.getDefaultConfiguration(searchedFolder)
						.then(function (oConfig) {
							expect(oConfig).to.be.ok;
							expect(oConfig.eslintConfig);
							expect(oConfig.eslintConfig.globals).to.be.ok;
							expect(oConfig.eslintConfig.env).to.be.ok;
							expect(oConfig.eslintConfig.rules).to.be.ok;
							expect(oConfig.rulesExt).to.be.ok;
							assert.ok(oConfig.eslintConfig.rules.hasOwnProperty("ifRule"));
							assert.ok(oConfig.eslintConfig.rules.hasOwnProperty("evalRule"));
							assert.ok(!oConfig.eslintConfig.rules.hasOwnProperty("myfile"));
							assert.ok(Object.keys(oConfig.eslintConfig.rules).length > 2); //configuration includes user-custom rules and eslint default configuration
						});
				});
		});

		it("Test 'getDefaultConfiguration' method with empty path", function () {
			return oJSDisplayValidatorConfigurationService.getDefaultConfiguration(null)
				.then(function (oConfig) {
					expect(oConfig).to.be.ok;
					expect(oConfig.eslintConfig);
					expect(oConfig.eslintConfig.globals).to.be.ok;
					expect(oConfig.eslintConfig.env).to.be.ok;
					expect(oConfig.eslintConfig.rules).to.be.ok;
					expect(oConfig.rulesExt).to.be.ok;
					assert.ok(Object.keys(oConfig.eslintConfig.rules).length > 10, "default rules returned");
				});
		});

		it("Test '_setCustomRulesConfiguration' with exsiting path - integration", function () {
			var searchedFolder = "/myTestProject/test";
			var oFileStructure = {
				"myTestProject": {
					"test": {
						"ifRule.js": "1",
						"myfile.xml": "1",
						"evalRule.js": "2"
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function () {
				return _oJSDisplayValidatorConfigurationImpl._setCustomeConfiguration(searchedFolder)
					.then(function (oCustomConfig) {
						expect(oCustomConfig).to.be.ok;
						expect(oCustomConfig.eslintConfig).to.be.ok;
						assert.ok(Object.keys(oCustomConfig.eslintConfig.rules).length = 2, "only ifRule and evalRule should be in the configuration");
						expect(oCustomConfig.rulesExt).to.be.ok;
						assert.ok(Object.keys(oCustomConfig.rulesExt).length = 2, "only ifRule and evalRule should be in the configuration");
					});
			});
		});

		it("Test '_setCustomRulesConfiguration' without path - integration", function () {
			var searchedFolder = "/myTestProject/test"
			var oFileStructure = {
				"myTestProject": {
					"test": {
						"ifRule.js": "1",
						"myfile.xml": "1",
						"evalRule.js": "2"
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function () {
				return _oJSDisplayValidatorConfigurationImpl._setCustomeConfiguration().then(function (oResult) {
					expect(oResult).to.be.undefiend;
				});
			});
		});

		it("Test '_setCustomRulesConfiguration' no js files in path - integration", function () {
			var searchedFolder = "/myTestProject/test";
			var oFileStructure = {
				"myTestProject": {
					"test": {
						"myfile.xml": "1"
					}
				}
			};
			return oFakeFileDAO.setContent(oFileStructure).then(function () {
				return _oJSDisplayValidatorConfigurationImpl._setCustomeConfiguration(searchedFolder).then(function (oResult) {
					expect(oResult).to.be.undefiend;
				});
			});
		});

		afterEach(function () {
			sandbox.restore();
		});

		after(function () {
			STF.shutdownWebIde(suiteName);
		});
	});
});