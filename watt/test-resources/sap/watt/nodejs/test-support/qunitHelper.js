/*
 * SAP SE internal
 * Provides convenience functions for QUnit tests
 */

/* global window,document */
(function() {

	window.ui5WattQunit = true;
	window.addEventListener("coverageDataPosted", refreshCodeCoverageFileList);

	window.postCoverageData = function postCoverageData() {
		var event = undefined;
		if (sap.ui.Device.browser.msie) {
			event = document.createEvent("CustomEvent");
			event.initCustomEvent("postCoverageData", false, false, {
				detail: {
					skipOnBeforeUnload: true
				},
				bubbles: true,
				cancelable: true
			});
		} else {
			event = new CustomEvent("postCoverageData", {
				detail: {
					skipOnBeforeUnload: true
				},
				bubbles: true,
				cancelable: true
			});
		}

		window.dispatchEvent(event);
	};

	function refreshCodeCoverageFileList() {
		$("#coverageAnalyzerReport").load("/watt-tests/analyze?coverageReport=unit/jscoverage.xml #coverageAnalyzerReportFileList");
		$("head").append(
			"<link id='codeCoverageAnalyzer' href='/" + window.location.pathname.split('/')[1] + "/css/analyzer.css' type='text/css' rel='stylesheet' />");
	}

    function _runningOnSupportedBrowser (aSupportedBrowsers){
	    if(aSupportedBrowsers){
            return aSupportedBrowsers.some(function(sBrowser){
                return sap.ui.Device.browser[sBrowser];
            });
        }else{
            return true;
        }
	}

	function _executeTest (fnHandler, args){
    	// supress autostart / autorun of QUnit as we start it later
		QUnit.config.autorun = false;
		QUnit.config.autostart = false;
		QUnit.load();

		//start reqular require.js define handler
		try {
			var oResult = Q(fnHandler.apply(null, args));
		} catch (oError) {
			QUnit.start();
			throw oError;
		}

		// handler can return a promise to delay start
		oResult.done(function() {
			// start QUnit.
			QUnit.start();
		}, function(oError) {
			// start QUnit.
			QUnit.start();
			throw oError;
		});
	}

	var _fnSkippedExecution = function() {
		test("Skipping Tests on unsupported browser", function(){
			ok(true);
		});
	}

	window.defineTest = function defineTest(aDependencies, fnHandler, bCallPostCoverageData, aSupportedBrowsers) {
		require.config({
			paths: {
				"qunit": "../test-resources/sap/watt",
				"uitests": "../test-resources/uitests"
			}
		});

		define("runTests", aDependencies, function() {
			//include qUnit css
			sap.watt.includeCSS(sap.watt.getEnv("ui5_root") + "resources/sap/ui/thirdparty/qunit.css");
			//enable UI5 loading mechanism for test resources similar to require.js
			jQuery.sap.registerModulePath("qunit", "../test-resources/sap/watt");
			//map OPA copy path to it's official namespace
			jQuery.sap.registerModulePath("sap.ui.test", "../test-resources/uitests/lib/opa");
			jQuery.sap.registerModulePath("uitests", "../test-resources/uitests");

			var that = this;
			if (bCallPostCoverageData) {
				QUnit.done(function(details) {
					that.postCoverageData();
				});
			}

			var args = arguments;
			if(_runningOnSupportedBrowser(aSupportedBrowsers)){
				_executeTest(fnHandler, args);
			}else{
				_executeTest(_fnSkippedExecution);
			}

		});
	};



	window.defineServiceTest = function defineServiceTest(vSampleConsumerConfig, aDependencies, fnTests, bCallPostCoverageData, aSupportedBrowsers) {
		// Sample Consumer Config might be defined by an object or a module path
		var mSampleConsumerConfig = null;
		switch( typeof vSampleConsumerConfig ) {
			case "object":
				mSampleConsumerConfig = vSampleConsumerConfig;
				break;
			case "string":
				aDependencies.push(vSampleConsumerConfig)
				break;
			default:
				throw new Error("String or Object expected");
		}

		aDependencies.push("sap/watt/core/Core");
		aDependencies.push("sap/watt/core/PluginRegistry");

		window.defineTest(aDependencies, function() {
			if (!mSampleConsumerConfig){
				//Sample Consumer Config provided by module
				mSampleConsumerConfig = arguments[aDependencies.length - 3];
			}

			var aArgs = arguments;
			var Core = arguments[aDependencies.length - 2];
			var PluginRegistry = arguments[aDependencies.length - 1];

			if (!mSampleConsumerConfig.baseURI) {
				var i = document.location.pathname.lastIndexOf("/");
				mSampleConsumerConfig.baseURI = document.location.pathname.substr(0, i);
			}

			Core.getService().then(function(oCoreService) {
				oCoreService.attachEvent("started", function() {
					var aConsumer = [mSampleConsumerConfig];

					return PluginRegistry.register(aConsumer).then(function(oSampleConsumerPlugin) {
						Array.prototype.splice.call(aArgs, 0, 0, oSampleConsumerPlugin[0]._oContext);
						return fnTests.apply(null, aArgs);
					});
				});
			}).done();


			return Core.startup;
		}, bCallPostCoverageData, aSupportedBrowsers);
	};

    window.defineCoreTest = function defineCoreTest(aDependencies, fnTests, bCallPostCoverageData, aSupportedBrowsers) {
        aDependencies.push("sap/watt/core/Core");

        window.defineTest(aDependencies, function () {
            var aArgs = arguments;
            var Core = arguments[aDependencies.length - 1];

            Core.getService().then(function (oCoreService) {
                oCoreService.attachEvent("started", function () {
                    return fnTests.apply(null, aArgs);
                });
            }).done();
            return Core.startup;

        }, bCallPostCoverageData, aSupportedBrowsers);
    };

	window.defineOpaTest = function defineOpaTest(aPageObjects, aDependencies, fnTests, bCallPostCoverageData, aSupportedBrowsers) {

		if(typeof(aDependencies) === "function"){
			//move other parameters as aDependencies is optional
			aSupportedBrowsers = bCallPostCoverageData;
			bCallPostCoverageData = fnTests;
			fnTests = aDependencies;
			aDependencies = [];
		}

		window.defineTest(aDependencies, function() {
			/* Create a high QUnit test timeout for OPA tests
			 * As OPA has it's own timeout mechanism and tests can take long we disable the QUnit timeouts this way
			 */
			QUnit.config.testTimeout = 600000;

			// base
			jQuery.sap.require("sap.ui.test.Opa5");
			jQuery.sap.require("sap.ui.test.opaQunit");

			// used page objects
			aPageObjects.forEach(function(sPageObject) {
				jQuery.sap.require("uitests.pageobjects." + sPageObject);
			});

			return fnTests.apply(null, arguments);

		}, bCallPostCoverageData, aSupportedBrowsers);
	};

	window.withPromise = function(func) {
		return function() {
			stop();
			func.apply(this, arguments).done(function() {
				start();
			}, function(oError) {
				start();
				console.log(oError.stack);
				ok(false, oError.stack);
			});
		};
	};

	var oldBaseUri;
	var bWattOnWatt = false;
	window.setBase = function(sNamespace) {
		oldBaseUri = document.baseURI;
		var sLocation = document.location.pathname;
		var sPath = "/resources/" + sNamespace;
		if (sLocation.indexOf("src/main/webapp/") >= 0) {
			sPath = "/com.sap.watt.ide.core/src/main/webapp/resources/" + sNamespace;
			bWattOnWatt = true;
		} else if (sLocation.indexOf("test-resources") >= 0) {
			sPath = sLocation.substr(0, sLocation.indexOf("test-resources")) + "resources/" + sNamespace;
		}

		var baseNode = document.createElement("base");
		baseNode.href = sPath;

		document.head.appendChild(baseNode);

	};

	window.resolveOnOldBase = function(sUri) {
		return new URI(sUri).absoluteTo(oldBaseUri).path();
	};
	
	/**
	* Gets the test name based on the suite name, here the path to the test html file
	* by removing the file suffix (.html) and replacing the last slash with a dot.
	* This follows the JUnit naming convention and when displayed in Jenkis displays
	* the path as package name and the test file name as class name
	*/
	window.getTestSuiteName = function(path) {
		var name = path //
		.replace(/\..*/, "") // remove file suffix if any
		.replace(/\/(?!.*\/)/, "."); // replace last slash with dot (negative look ahead)
		
		return name;
	}
	
	/**
	 * Checks whether current browser is PhantomJS. Used to circumvent bugs in older 
	 * Phantom JS versions, e.g. date parsing 
	 */ 
	window.isPhantomJS = function() {
		var sUserAgent = navigator.userAgent;
		if (/.*phantomjs.*/igm.test(sUserAgent)) {
			return true;
		}
		
		return false;
	}
	
	/**
	 * Executes the test method only if bCondition is true. Otherwise executes test
	 * with single assert.ok(true) statement
	 */
	window.conditionalTest = function(sTestName, bCondition, fnTest) {
		if( bCondition ) {
			test(sTestName, fnTest);
		} else {
			test("[SKIP] "+ sTestName, function(assert) {assert.ok(true);});
		}
	}

}());