define({

	load: function () {

		// TODO: require fix for UI5 (define will be added again after UI5 has booted!)
		var fnDefine = define;
		var sBaseDir = sap.watt.getEnv("base_path");

		var sThemename = sap.watt.getEnv("themename") || "sap_flat";
		var sThemeroot = sap.watt.getEnv("themeroots") || sBaseDir;
		var bSkipPreload = false;
		if (sap.watt.getEnv("server_type") !== "hcproxy") {
			var sPreloadUrl = sThemeroot + "sap/watt/preload/themes/" + sThemename + "/library.css";
			bSkipPreload = !!(this._headJax(sPreloadUrl) == 404);
		}

		// UI5 configuration (sap-ui-config.json)
		//   => the root component is: sap.watt.uitools.Component
		var themeroots = {};
		//TODO Activate cachebuster for theme css with application timestamp
		themeroots[sThemename] = sThemeroot;


		// var sUi5Libs = "sap.ui.commons,sap.ui.table,sap.ui.ux3,sap.viz";
		var sUi5Libs = "sap.ui.commons,sap.ui.table,sap.ui.ux3";
		if (!sap.watt.getEnv("staticWSMode")) {
			sUi5Libs += ",sap.ui.vbm"; // this is only needed for some external plugins, not local testing/dev
		}

		// merge the existing configuration object with the new one here 
		// but we by default overwrite the libs, theme, resourceroots and themeroots
		window["sap-ui-config"] = window["sap-ui-config"] || {};
		window["sap-ui-config"]["libs"] = sUi5Libs;
		/* defining the libs here means preloading them */
		window["sap-ui-config"]["theme"] = sThemename;
		window["sap-ui-config"]["themeroots"] = themeroots;
		window["sap-ui-config"]["resourceroots"] = {
			"sap.watt": sBaseDir + "sap/watt",
			"sap.hana": sBaseDir + "sap/hana",
			"sap.ui.w5g": sBaseDir + "sap/ui/w5g"
		};

		// TODO Currently Suppress all languages beside default, to avoid unnecesarry request
		// As long as we do not have translation
		//But only if the language is not specified for testing purposes (will cause unnecesarry requests)
		if (!/sap-ui-language=/i.test(window.location.search)) {
			window["sap-ui-config"]["xx-supportedLanguages"] = "";
		}

		window["sap-ui-config"]["xx-bindingSyntax"] = "complex";
		// skip this for debug mode
		if (!sap.watt.getEnv("debugMode") && !bSkipPreload) {
			// window["sap-ui-config"]["xx-preloadLibCss"] = "!sap.ui.core,sap.ui.layout,sap.ui.commons,sap.ui.table,sap.ui.ux3,sap.viz,sap.ui.unified";
			window["sap-ui-config"]["xx-preloadLibCss"] = "!sap.ui.core,sap.ui.layout,sap.ui.commons,sap.ui.table,sap.ui.ux3,sap.ui.unified";
		}

		// UI5 debug mode (handled here because UI5 mechanism is using document.write / doesn't work out here)
		var sDbgSuffix = "";
		var bIsDebugModeViaURL = /[&?](sap-ui-debug=(true|x)[&#]?)+/i.test(window.location.search);
		var bIsDebugModeViaStorage = window.localStorage && window.localStorage.getItem("sap-ui-debug") == "X";
		if (bIsDebugModeViaStorage || bIsDebugModeViaURL) {
			sDbgSuffix += "-dbg";
		}

		// ignore anonymous defines during bootstrap - e.g. loading of URI JS
		// in an anonymous way leads to an issue in require
		define = function (name, deps, callback) {
			if (typeof name === "string") {
				fnDefine.apply(this, arguments);
			} else {
				if (sap.watt.getEnv("debugMode")) {
					console.error("UI5Loader: error loading anonymous module.", new Error().stack);
				}
			}
		};
		define.amd = fnDefine.amd; // take over amd flag!

		// bootstrap UI5
		var sCBTimestamp;
		var aScripts = [];
		aScripts.push("resources/sap-ui-core");
		if (window.ui5WattQunit) {
			aScripts.push("resources/sap/ui/thirdparty/qunit");
			aScripts.push("resources/sap/ui/qunit/QUnitUtils");
			aScripts.push("resources/sap/ui/thirdparty/sinon");
			//aScripts.push("resources/sap/ui/thirdparty/sinon-qunit"); makes problems
			aScripts.push("resources/sap/ui/thirdparty/sinon-ie");
		}

		var oDeferred = Q.defer();

		var fnLoadScriptSync = function () {
			var sScript = aScripts.shift();
			var aScriptSegments = /^(resources\/)(.*)$/.exec(sScript);

			if (aScriptSegments) {
				var sScriptUrl = sap.watt.getEnv("ui5_root") + aScriptSegments[1];
				if (sCBTimestamp) {
					sScriptUrl += "~" + sCBTimestamp + "~/";
				}
				sScriptUrl += aScriptSegments[2] + sDbgSuffix + ".js";

				// one would think that this 'if' should be extracted to the top of the if/else block,
				// however one would be wrong in that case as in includescript.then(...) clause recursively invokes fnLoadScriptSync
				// each iteration of the 'fnLoadScriptSync' will MODIFY the aScripts array with 'shift' until the else block will be entered
				// so modifying the flow of the top if/else block can cause infinite loop in trying to load UI5
				// obfuscated code for the win :)
				if (sap.watt.getEnv("staticWSMode")) {
					sap.watt.includeScript(sap.watt.getEnv("staticWSUI5Root") + "sap-ui-core"+ sDbgSuffix + ".js").then(fnLoadScriptSync);
				}
				else {
					sap.watt.includeScript(sScriptUrl).then(fnLoadScriptSync);
				}
			} else {
				//loads blanket.js -> needs to be loaded after qunit
				if (window.ui5WattQunit) {
					//which js file should be covered by blanket
					var coverUrl = document.querySelectorAll("script[data-sap-ide-main]")[0].getAttribute("data-sap-blanket-cover");
					if (coverUrl) {
						var script = document.createElement('script');
						script.type = 'text/javascript';
						script.src = require.toUrl("qunit/util/blanketjs/blanket.js");
						script.setAttribute("data-cover-only", require.toUrl(coverUrl));
						document.getElementsByTagName("head")[0].appendChild(script);
					}
				}

				// TODO: require fix for UI5 (define will be added again after UI5 has booted!)
				define = fnDefine;
				//TODO: Move this to a better place (e.g. plugin)
				// temporary comment the check so that WATT can be tested also on other browsers
				//if (jQuery.browser.chrome && jQuery.browser.fVersion >= 31 || jQuery.browser.mozilla && jQuery.browser.fVersion >= 26) {
				// UI5 loading done

				// load CSS (the preloaded one)
				// skip this for debug mode
				if (!sap.watt.getEnv("debugMode") && !bSkipPreload) {
					sap.ui.getCore().includeLibraryTheme("sap.watt.preload");
				}

				// find the most relevant language (with UI5 code)
				jQuery.sap.require("jquery.sap.resources");
				var oConfig = sap.ui.getCore().getConfiguration();
				var sLanguage = oConfig.getLanguage();
				var aDeliveredLanguages = oConfig.getLanguagesDeliveredWithCore();
				var aLanguages = jQuery.sap.resources._getFallbackLocales(sLanguage, aDeliveredLanguages);
				var sLanguage = aLanguages[0];

				// as there is no translation yet, we hard code to en unless the sap-ui-language url parameter is set
				var oParameters = jQuery.sap.getUriParameters();
				var sUrlLanguage = oParameters.get("sap-ui-language");
				if (!sUrlLanguage) {
					sLanguage = "en";
				}
				oConfig.setLanguage(sLanguage);
				// set locale
				window.sap.watt.locale = sLanguage;

				//patch popup.js for focus handling of ui5 dialogs
				jQuery.sap.require("sap.ui.core.Popup");

				require(["sap/watt/core/PluginRegistry"], function (PluginRegistry) {
					var _open = sap.ui.core.Popup.prototype.open;
					sap.ui.core.Popup.prototype.open = function () {
						var args = Array.prototype.slice.call(arguments);
						_open.apply(this, args);

						//This is an hard coded workaroung to handle opening of sap.ui.ux3.ToolPopup
						//In case of toolpopup we don't want to track the focus and remain it on the mainwindow
						if (this._$().hasClass("sapUiUx3TP sapUiUx3TPNoButtons sapUiUx3TPNoTitle sapUiShd")) {
							return;
						}
						//use core internal function to access service registry
						//sap.watt.core.Service.get() is deprecated
						var oFocusService = PluginRegistry.$getServiceRegistry().get("focus");
						var oLastFocusElement;
						oFocusService.getFocus().then(function (oElem) {
							oLastFocusElement = oElem;
						}).done();
						if (this._$().parent().attr("id") == "sap-ui-static" && this._$().attr("role") !== "menu"
							&& this._$().attr("role") !== "alertdialog" && !this._$().hasClass("sapUiClt")
							&& !this._$().hasClass("sapUiLbx")) {
							var _dialogContent = this._$()[0];
							this.attachEventOnce("closed", function () {
								oFocusService.detachFocus(_dialogContent).done();
								if (oLastFocusElement) {
									oFocusService.setFocus(oLastFocusElement).done();
								}
							});
							var that = this;
							//wait for the dom element to be rendered
							setTimeout(function () {
								oFocusService.attachFocus(_dialogContent).done();
							}, 100);
						}
					};
					oDeferred.resolve();
				});

				//} else {
				//	alert("This browser is not supported");
				//}
			}
		};

		// detection of the cachebuster timestamp
		var fnGetCacheBusterIndex = function (fnCallback) {

			var oXHR = new XMLHttpRequest();
			oXHR.open("GET", sap.watt.getEnv("ui5_root") + "resources/sap-ui-cachebuster");
			oXHR.onload = function (oEvent) {
				if (oXHR.readyState === 4) {
					if (oXHR.status === 200) {
						// the ~ is optional and can be ignored during the detection
						var aSegments = /~?([a-zA-Z0-9-\.]+)~?/i.exec(oXHR.responseText);
						// extract the timestamp and notify the callback function 
						sCBTimestamp = aSegments && aSegments[1];
						if (typeof fnCallback === "function") {
							fnCallback();
							return;
						}
					} else {
						if (window.console) {
							window.console.error(oXHR.statusText);
						}
					}
					fnCallback();
				}
			};
			oXHR.onerror = function (ex) {
				if (window.console) {
					window.console.error(ex.message);
				}
				fnCallback();
			};
			oXHR.send(null);

		};

		// detect the cachebuster timestamp and load the scripts or 
		// directly load the scripts if the server_type doesn't support it
		if (/^(java|hcproxy|local_hcproxy)$/gi.test(sap.watt.getEnv("server_type"))) {
			fnGetCacheBusterIndex(fnLoadScriptSync);
		} else {
			fnLoadScriptSync();
		}

		return oDeferred.promise;
	},

	_headJax: function (sURL) {
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", sURL, false);
		oXHR.send(null);
		return oXHR.status;
	}

});
