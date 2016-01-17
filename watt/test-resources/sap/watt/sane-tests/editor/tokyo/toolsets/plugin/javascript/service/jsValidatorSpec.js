define(["sap/watt/lib/lodash/lodash", "sinon", 'STF'], function (_, sinon, STF) {
	var sandbox;
	var suiteName = "service_js_validator";
	var jsValidatorService;
	var _jsValidatorServiceImpl;
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
		return  "return " + sResult;
	}

	var defMock = {
		"eslintConfig": {
			"env": {"browser": false},
			"globals": {"require": false},
			"rules": {
				"block-scoped-var": 0,
				"brace-style": [0, "1tbs"],
				"camelcase": 2
			}
		},
		"rulesExt": {
			"block-scoped-var": {
				"severity": "warning",
				"category": "Best Practice"
			},
			"brace-style": {
				"severity": "info",
				"category": "Stylistic Issue"
			},
			"camelcase": {
				"severity": "info",
				"category": "Stylistic Issue"
			}
		}
	};

	var defMockWithCustomRules = {
		"eslintConfig": {
			"env": {"browser": false},
			"globals": {"require": false},
			"rules": {
				"block-scoped-var": 0,
				"brace-style": [0, "1tbs"],
				"camelcase": 2,
				"dummyCustomRule": 2
			}
		},
		"rulesExt": {
			"block-scoped-var": {
				"severity": "warning",
				"category": "Best Practice"
			},
			"brace-style": {
				"severity": "info",
				"category": "Stylistic Issue"
			},
			"camelcase": {
				"severity": "info",
				"category": "Stylistic Issue"
			},
			"dummyCustomRule": {
				"severity": "warning",
				"category": "Best Practice"
			}
		}
	};

	describe("JavaScript Validator Service", function () {
		before(function () {
			return STF.startWebIde(suiteName).
				then(function (webIdeWindowObj) {
					var serviceGetter = STF.getServicePartial(suiteName);
					jsValidatorService = serviceGetter("jsValidator");
					return STF.getServicePrivateImpl(jsValidatorService).then(function (oImpl) {
						_jsValidatorServiceImpl = oImpl;
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

		it("Test 'getFilteredConfiguration' - display only error & warning", function () {
			var sSource = "";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"e_semi": 2,
						"w_semi": 2,
						"i_semi": 2,
						"ai_semi": [2, "mysemi"]
					}

				},
				"rulesExt": {
					"e_semi": {
						"severity": "error",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					},
					"w_semi": {
						"severity": "warning",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					},
					"i_semi": {
						"severity": "info",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					},
					"ai_semi": {
						"severity": "info",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					}
				}
			};
			var oResult = _jsValidatorServiceImpl._getFilteredConfiguration(oConfig, ["error", "warning"]);
			expect(oResult).to.be.ok;
			expect(oResult.eslintConfig).to.be.ok;
			expect(oResult.eslintConfig.rules).to.be.ok;
			expect(oResult.eslintConfig.rules["e_semi"]).to.equal(2);
			expect(oResult.eslintConfig.rules["w_semi"]).to.equal(2);
			expect(oResult.eslintConfig.rules["i_semi"]).to.equal(0);
			expect(oResult.eslintConfig.rules["ai_semi"][0]).to.equal(0);
			expect(oResult.eslintConfig.rules["ai_semi"][1]).to.equal("mysemi");
		});

		it("Test 'getFilteredConfiguration' - disable all", function () {
			var sSource = "";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"e_semi": 2,
						"w_semi": 2,
						"i_semi": 2,
						"ai_semi": [2, "mysemi"]
					}

				},
				"rulesExt": {
					"e_semi": {
						"severity": "error",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					},
					"w_semi": {
						"severity": "warning",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					},
					"i_semi": {
						"severity": "info",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					},
					"ai_semi": {
						"severity": "info",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					}
				}
			};
			var oResult = _jsValidatorServiceImpl._getFilteredConfiguration(oConfig, []);
			expect(oResult).to.be.ok;
			expect(oResult.eslintConfig).to.be.ok;
			expect(oResult.eslintConfig.rules).to.be.ok;
			expect(oResult.eslintConfig.rules["e_semi"]).to.equal(0);
			expect(oResult.eslintConfig.rules["w_semi"]).to.equal(0);
			expect(oResult.eslintConfig.rules["i_semi"]).to.equal(0);
			expect(oResult.eslintConfig.rules["ai_semi"][0]).to.equal(0); 	//TODO: error assert
			expect(oResult.eslintConfig.rules["ai_semi"][1]).to.equal("mysemi");
		});

		it("Test 'getConfiguration' - no custom path, no filters", function () {
			var customConfig = {
				"eslintConfig": {
					"env": {"sap": false},
					"rules": {
						"block-scoped-var": 2,
						"brace-style": [0, "2tbs"]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "warning",
						"category": "Best Practice"
					},
					"brace-style": {
						"severity": "info",
						"category": "Stylistic Issue"
					}
				}
			};
			return jsValidatorService.getConfiguration(undefined, defMock, customConfig).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.eslintConfig).to.be.ok;
				expect(oResult.eslintConfig.rules).to.be.ok;
				expect(oResult.eslintConfig.rules["block-scoped-var"]).to.equal(2);
				expect(oResult.eslintConfig.rules["brace-style"][0]).to.equal(0);
				expect(oResult.eslintConfig.rules["brace-style"][1]).to.equal("2tbs");
				expect(oResult.eslintConfig.rules["camelcase"]).to.equal(2);
			});
		});

		it("getConfiguration - no custom rules, with filter all", function () {
			var customConfig = {
				"eslintConfig": {
					"env": {"sap": false},
					"rules": {
						"block-scoped-var": 2,
						"brace-style": [0, "2tbs"],
						"camelcase": [0, 15]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "warning",
						"category": "Best Practice"
					},
					"brace-style": {
						"severity": "info",
						"category": "Stylistic Issue"
					}
				}
			};
			return jsValidatorService.getConfiguration(["error", "warning", "info"], defMock, customConfig).then(function (rules) {
				//returns in concrete validator format. merges defaults and project configured rules
				var mergedConfig = {
					"eslintConfig": {
						"env": {
							"browser": false,
							"sap": false
						},
						"globals": {"require": false},
						"rules": {
							"block-scoped-var": 2,
							"brace-style": [0, "2tbs"],
							"camelcase": [0, 15]
						}
					},
					"rulesExt": {
						"block-scoped-var": {
							"severity": "warning",
							"category": "Best Practice"
						},
						"brace-style": {
							"severity": "info",
							"category": "Stylistic Issue"
						},
						"camelcase": {
							"severity": "info",
							"category": "Stylistic Issue"
						}
					}
				};
				expect(rules).to.deep.equal(mergedConfig);
			});
		});

		it("getConfiguration - with custom rules", function () {
			//"customRulesPath": "/eslintConfig/myrules"
			var customConfig = {
				"eslintConfig": {
					"env": {"sap": false},
					"rules": {
						"block-scoped-var": 2,
						"brace-style": [0, "2tbs"],
						"camelcase": [0, 15]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "warning",
						"category": "Best Practice"
					},
					"brace-style": {
						"severity": "info",
						"category": "Stylistic Issue"
					}
				}
			};
			return jsValidatorService.getConfiguration(["error", "warning", "info"], defMockWithCustomRules, customConfig).then(function (rules) {
				//returns in concrete validator format. merges defaults and project configured rules
				var mergedConfig = {
					"eslintConfig": {
						"env": {
							"browser": false,
							"sap": false
						},
						"globals": {"require": false},
						"rules": {
							"block-scoped-var": 2,
							"brace-style": [0, "2tbs"],
							"camelcase": [0, 15],
							"dummyCustomRule": 2
						}
					},
					"rulesExt": {
						"block-scoped-var": {
							"severity": "warning",
							"category": "Best Practice"
						},
						"brace-style": {
							"severity": "info",
							"category": "Stylistic Issue"
						},
						"camelcase": {
							"severity": "info",
							"category": "Stylistic Issue"
						},
						"dummyCustomRule": {
							"severity": "warning",
							"category": "Best Practice"
						}
					}
				};
				expect(rules).to.deep.equal(mergedConfig);
			});
		});

		it("getConfiguration - filter errors only", function () {
			var customConfig = {
				"eslintConfig": {
					"env": {"sap": false},
					"rules": {
						"block-scoped-var": 2,
						"brace-style": [1, "2tbs"],
						"camelcase": [0, 15]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "error",
						"category": "Best Practice"
					},
					"brace-style": {
						"severity": "info",
						"category": "Stylistic Issue"
					},
					"camelcase": {
						"severity": "info",
						"category": "Stylistic Issue"
					}
				}
			};
			return jsValidatorService.getConfiguration(["error"], defMock, customConfig)
				.then(function (rules) {
					//returns in concrete validator format. merges defaults and project configured rules
					var mergedConfig = {
						"eslintConfig": {
							"env": {
								"browser": false,
								"sap": false
							},
							"globals": {"require": false},
							"rules": {
								"block-scoped-var": 2,
								"brace-style": [0, "2tbs"], 	//TODO: error assert
								"camelcase": [0, 15]
							}
						},
						"rulesExt": {
							"block-scoped-var": {
								"severity": "error",
								"category": "Best Practice"
							},
							"brace-style": {
								"severity": "info",
								"category": "Stylistic Issue"
							},
							"camelcase": {
								"severity": "info",
								"category": "Stylistic Issue"
							}
						}
					};
					expect(rules).to.deep.equal(mergedConfig);
				});
		});

		it("getConfiguration - disable by filter", function () {
			var customConfig = {
				"eslintConfig": {
					"env": {"sap": false},
					"rules": {
						"block-scoped-var": 2,
						"brace-style": [1, "2tbs"],
						"camelcase": [0, 15]
					}
				},
				"rulesExt": {
					"block-scoped-var": {
						"severity": "error",
						"category": "Best Practice"
					},
					"brace-style": {
						"severity": "info",
						"category": "Stylistic Issue"
					},
					"camelcase": {
						"severity": "info",
						"category": "Stylistic Issue"
					}
				}
			};
			return jsValidatorService.getConfiguration([], defMock, customConfig)
				.then(function (rules) {
					//returns in concrete validator format. merges defaults and project configured rules
					var mergedConfig = {
						"eslintConfig": {
							"env": {
								"browser": false,
								"sap": false
							},
							"globals": {"require": false},
							"rules": {
								"block-scoped-var": 0,
								"brace-style": [0, "2tbs"], 	//TODO: error assert
								"camelcase": [0, 15]
							}
						},
						"rulesExt": {
							"block-scoped-var": {
								"severity": "error",
								"category": "Best Practice"
							},
							"brace-style": {
								"severity": "info",
								"category": "Stylistic Issue"
							},
							"camelcase": {
								"severity": "info",
								"category": "Stylistic Issue"
							}
						}
					};
					expect(rules).to.deep.equal(mergedConfig);
				});
		});

		it("Test 'getIssuesSynchronously' method with an empty source", function () {
			var sSource = "";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"semi": 2
					},
					"rulesExt": {
						"semi": {
							"severity": "error",
							"category": "Possible Error",
							"helpUrl": "http://eslint.org/docs/rules/semi.html"
						}
					}
				}
			};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.root).to.be.ok;
				expect(oResult.issues).to.be.ok;
				expect(oResult.issues.length).to.equal(0);
			});
		});

		//TODO
		it("Test 'getIssuesSynchronously' method with no file path", function () {
			assert.ok(true);
			return Q();
		});

		it("Test 'getIssuesSynchronously' method with a custom configuration", function () {
			var sSource = "var s = 3";

			var oConfig = {
				"eslintConfig": {
					"rules": {
						"semi": 2
					}
				},
				"rulesExt": {
					"semi": {
						"severity": "error",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					}
				}
			};
			var sFullPath = "uuu/file.js";
			var oExpectedIssue = {
				"ruleId": "semi",
				"path": "uuu/file.js",
				"severity": "error",
				"category": "Possible Error",
				"helpUrl": "http://eslint.org/docs/rules/semi.html",
				"checker": "ESLint",
				"line": 1,
				"column": 9,
				"message": "Missing semicolon.",
				"source": "var s = 3"
			};
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.root).to.be.ok;
				assert.ok(oResult.root.severity === undefined);
				expect(oResult.issues).to.be.ok;
				expect(oResult.issues.length).to.equal(1);
				expect(oResult.issues[0]).to.deep.equal(oExpectedIssue);
			});
		});

		it("Test 'getIssuesSynchronously' method with an empty configuration", function () {
			var sSource = "var s";
			var oConfig = {};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.root).to.be.ok;
				expect(oResult.issues).to.be.ok;
				expect(oResult.issues.length).to.equal(0);
			});
		});

		it("Test 'getIssuesSynchronously' method for a text with a syntax error", function () {
			var sSource = "var s{";
			var oConfig = {};
			var sFullPath = "uuu/file.js";
			var oExpectedIssue = {
				"ruleId": "syntax-parse",
				"path": "uuu/file.js",
				"severity": "error",
				"category": "Syntax Error",
				"helpUrl": "http://www.ecma-international.org/ecma-262/5.1/",
				"checker": "ESLint",
				"line": 1,
				"column": 6,
				"message": "Unexpected token {",
				"source": undefined
			};
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.root).to.be.ok;
				expect(oResult.root.severity).to.be.ok;
				expect(oResult.root.severity).to.equal("error");
				expect(oResult.issues).to.be.ok;
				expect(oResult.issues.length).to.equal(1);
				expect(oResult.issues[0]).to.deep.equal(oExpectedIssue);
			});
		});

		it("Test 'getIssuesSynchronously' method with globals", function () {
			var sSource = "var s = Glob;\nvar s1 = Glob1";
			var oConfig = {
				"eslintConfig": {
					"globals": {
						"Glob": false
					},
					"rules": {
						"no-undef": 2
					}
				},
				"rulesExt": {
					"no-undef": {
						"severity": "error",
						"category": "Variable",
						"helpUrl": "http://eslint.org/docs/rules/no-undef.html"
					}
				}
			};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.root).to.be.ok;
				assert.ok(oResult.root.severity === undefined);
				expect(oResult.issues).to.be.ok;
				expect(oResult.issues.length).to.equal(1);
				expect(oResult.issues[0].ruleId).to.equal("no-undef");
			});
		});

		it("Test 'getIssuesSynchronously' method with a configuration object without rulesExt object ", function () {
			var sSource = "var s = 3";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"new_rule": 2
					}
				}
			};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).fail(function (oError) {
				assert.ok(true);
			});
		});

		it("Test 'getIssuesSynchronously' method with a configuration object that has a rule without a matching external rule ", function () {
			var sSource = "var s = 3";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"new_rule": 2
					}
				},
				"rulesExt": {
					"new_rule": {
						"severity": "error",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					}
				}
			};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).fail(function (oError) {
				assert.ok(true);
			});
		});

		it("Test 'getIssuesSynchronously' method with a configuration object that has non-existing/invalid rules", function () {
			var sSource = "var s = 3";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"new_rule": 2
					}
				},
				"rulesExt": {
					"new_rule": {
						"severity": "error",
						"category": "Possible Error",
						"helpUrl": "http://eslint.org/docs/rules/semi.html"
					}
				}
			};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).fail(function (oError) {
				assert.ok(true);
			});
		});

		it("Test 'getIssuesSynchronously' method with 'eslint-disable' comment", function () {
			var sSource = "/* eslint-disable */\nalert('foo');";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"no-alert": 2
					}
				},
				"rulesExt": {
					"no-alert": {
						"severity": "warning",
						"category": "Best Practice"
					}
				}
			};
			var sFullPath = "uuu/file.js";
			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath).then(function (oResult) {
				expect(oResult).to.be.ok;
				expect(oResult.root).to.be.ok;
				assert.ok(oResult.root.severity === undefined);
				expect(oResult.issues).to.be.ok;
				expect(oResult.issues.length).to.equal(0);
			});
		});

		it("Test 'getIssuesSynchronously' method with a custom Rules Content", function () {
			var sSource = "var s = 3";
			var oConfig = {
				"eslintConfig": {
					"rules": {
						"semi_custom": 2
					}
				},
				"rulesExt": {
					"semi_custom": {
						"severity": "error",
						"category": "Possible Error"
					}
				}
			};
			var sFullPath = "uuu/file.js";
			var oExpectedIssue = {
				"ruleId": "semi_custom",
				"path": "uuu/file.js",
				"severity": "error",
				"category": "Possible Error",
				"helpUrl": undefined,
				"checker": "ESLint",
				"line": 1,
				"column": 9,
				"message": "Missing semicolon.",
				"source": "var s = 3"
			};

			var sFileContent = getFileAsString("editor/tokyo/toolsets/plugin/javascript/service/rules/semi_NoModule.js");
			var oCustomContent = {
				semi_custom: sFileContent
			};

			return jsValidatorService.getIssuesSynchronously(sSource, oConfig, sFullPath, oCustomContent)
				.then(function (oResult) {
					expect(oResult).to.be.ok;
					expect(oResult.root).to.be.ok;
					assert.ok(oResult.root.severity === undefined);
					expect(oResult.issues).to.be.ok;
					expect(oResult.issues.length).to.equal(1);
					expect(oResult.issues[0]).to.deep.equal(oExpectedIssue);
				});
		});

		it("Test 'getPathToImplementationModule' method", function () {
			return jsValidatorService.getPathToImplementationModule().then(function (sPath) {
				require([sPath], function (impModule) {
					expect(impModule.getIssues).to.be.ok;
				});
			});
		});

		it("Test '_validateAllDocs' - display only error & warning", function () {
			var oDoc1 = new MockFileDocument("/dev/aaa", "js", "alert('foo');", "dev");
			var oDoc2 = new MockFileDocument("/dev/bbb", "js", "content456", "dev");

			var oConfig = {
				"eslintConfig": {
					"rules": {
						"no-alert": 2
					}
				},
				"rulesExt": {
					"no-alert": {
						"severity": "warning",
						"category": "Best Practice"
					}
				}
			};
			return _jsValidatorServiceImpl._validateAllDocs([oDoc1, oDoc2], oConfig).then(function (results) {
				expect(results).to.be.ok;
				expect(results.length).to.equal(2);
				expect(results[0].document).to.be.ok;
				expect(results[0].result.issues).to.be.ok;
				expect(results[1].document).to.be.ok;
				expect(results[1].result.issues).to.be.ok;
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