/**
 * @overview Initialization for the SAP IDE framework
 *
 * This class provides method {@link #namespace} to register namespaces to the
 * SAP IDE framwork
 *
 * @version @version@
 * @public
 */

(function() {
	//TODO: "use strict";

	/**
	 * Clickjacking prevention
	 */
	var framebuster = function() {
		var fnIFrameIsCreatedByTestResourceFromSameServer = function() {
			return top.location.origin === self.location.origin && top.location.pathname.indexOf("test-resources") !== 0;
		};
		if (self === top || fnIFrameIsCreatedByTestResourceFromSameServer()) {
			//no attack -> show the body
			var oBody = document.getElementsByTagName('body')[0];
			oBody.style.display = "block";
		} else {
			//potential attack -> bust the iframe
			top.location = self.location;
		}
	};

	// Sometimes it could happen that the body is not there yet
	if (document.getElementsByTagName('body')[0]) {
		framebuster();
	} else {
		window.addEventListener("load", framebuster);
	}

	/**
	 * Root namespace for JavaScript functionality provided by SAP SE.
	 *
	 * The <code>sap</code> namespace is automatically registered with the
	 * OpenAjax hub if it exists.
	 *
	 * @version @version@
	 * @namespace
	 * @public
	 * @name sap
	 */
	if (typeof window.sap !== "object" && typeof window.sap !== "function") {
		window.sap = {};
	}

	/**
	 * The <code>sap.watt</code> namespace is the central OpenAjax compliant entry
	 * point for IDE related JavaScript functionality provided by SAP.
	 *
	 * @version @version@
	 * @namespace
	 * @name sap.watt
	 * @public
	 */
	if (typeof window.sap.watt !== "object") {
		window.sap.watt = {};
	}

	/**
	 * Get locale
	 * 
	 * @returns string
	 * @private
	 * @static
	 */
	sap.watt.getLocale = function() {
		return window.sap.watt.locale;
	};

	/**
	 * Includes a script file with the provided source
	 * 
	 * @param {string} sSrc source of the script
	 * @returns promise
	 * @private
	 * @static
	 */
	sap.watt.includeScript = function(sSrc) {
		var oHead = document.getElementsByTagName("head")[0];
		var oScript = document.createElement("script");
		oScript.src = sSrc;

		// cross browser load event handling
		var bDone = false;
		var oDeferred = Q.defer();

		oScript.onload = oScript.onreadystatechange = function() {
			if (!bDone && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
				bDone = true;
				oScript.onload = oScript.onreadystatechange = null; // IE memory leak handling
				oDeferred.resolve();
			}
		};

		oHead.appendChild(oScript);

		return oDeferred.promise;
	};

	/**
	 * Includes a css file with the provided source
	 * 
	 * @param {string} sHref source of the script
	 * @private
	 * @static
	 */
	sap.watt.includeCSS = function(sHref) {
		var oHead = document.getElementsByTagName("head")[0];
		var oLink = document.createElement("link");
		oLink.href = sHref;
		oLink.type = "text/css";
		oLink.media = "screen";
		oLink.rel = "stylesheet";

		oHead.appendChild(oLink);
	};

	var guid = function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};
	};

	/*
	 * Defines the namespace on the window object for the given name.
	 */
	var fnNamespace = function(sName, oObj) {
		var oObject = window;
		var aNames = (sName || "").split("/");
		var l = aNames.length;

		for ( var i = 0; i < l; i++) {
			if (!oObject[aNames[i]] && i < l) {
				oObject[aNames[i]] = i === l - 1 ? oObj || {} : {};
			}
			oObject = oObject[aNames[i]];
		}

		return oObject;
	};

	/**
	 * Forwards the require call to require.js.
	 *
	 * @param {array} deps array of dependencies
	 * @param {function} callback callback function ones the dependencies are loaded
	 * @param {function} errback [optional] callback function in case of an error occured
	 * @param {any} optional [optional] optional
	 * @function
	 * @global
	 * @name require
	 */

	/**
	 * Forwards the define call to require.js.
	 *
	 * @param {string} name [optional] module name
	 * @param {array} deps array of dependencies
	 * @param {function} callback callback function ones the dependencies are loaded / returns the module
	 * @function
	 * @global
	 * @name define
	 */

	/**
	 * Returns the URL for the given module name.
	 *
	 * @param {string} name module name
	 * @return {string} URL for the path name
	 * @function
	 * @global
	 * @name require.toUrl
	 */

	// check for a require/define mechanism beeing available!
	if (!window.require && !window.define) {
		throw new Error("Require.js is not loaded yet. Please include either require.js or UI5!");
	}

	// load the environment
	var fnLoadEnv = function(fnCallback, sEnvPath) {

		// lookup and resolve a environment variable
		function getEnv(sKey, sDefault) {
			var val = window["sap-ide-env"] && window["sap-ide-env"][sKey];
			if (val === undefined) {
				val = sDefault;
			}
			return val;
		}

		// attach the lookup for env variables to sap.ui namespace
		window.sap = window.sap || {};
		window.sap.watt = window.sap.watt || {};
		window.sap.watt.getEnv = getEnv;

		// load the environment file and apply it
		sEnvPath = sEnvPath || "env.json";
		var url = window.location.search ? sEnvPath + window.location.search : sEnvPath;
		var oXHR = new XMLHttpRequest();
		oXHR.open("GET", url);
		oXHR.onload = function(oEvent) {
			if (oXHR.readyState === 4) {
				if (oXHR.status === 200) {
				    try {
					    window["sap-ide-env"] = JSON.parse(oXHR.responseText);
				    } catch (oError) {
				        window.console.error(oError);
				        window.console.error(oXHR.responseText);
				    }
					// some logging
					if (window.console) {
						window.console.log("Environment:");
						for ( var sKey in window["sap-ide-env"]) {
							window.console.log("  - " + sKey + ": " + window["sap-ide-env"][sKey]);
						}
					}

					if (window["sap-ide-env"].server_type === "hcproxy") {
						//Additional handling for hcproxy server
						require([ "./HCProxyEnvLoader" ], function(oHCProxyEnvLoader) {
							oHCProxyEnvLoader(window["sap-ide-env"], fnCallback);
						});
					} else if (window["sap-ide-env"].server_type === "local_hcproxy") {
						//Additional handling for hcproxy server
						require([ "./LocalHCProxyEnvLoader" ], function(LocalHCProxyEnvLoader) {
							LocalHCProxyEnvLoader(window["sap-ide-env"], fnCallback);
						});
					} else if (window["sap-ide-env"].server_type === "java") {
						//Additional handling for java server (local development)
						require([ "./JavaLoader" ], function(oJavaLoader) {
							oJavaLoader(window["sap-ide-env"], fnCallback);
						});
					} else {
						// loaded
						fnCallback(window["sap-ide-env"]);
					}

				} else {
					if (window.console) {
						window.console.error(oXHR.statusText);
					}
				}
			}
		};
		oXHR.onerror = function(ex) {
			if (window.console) {
				window.console.error(ex.message);
			}
		};
		oXHR.send(null);

	};

	/**
	 * Object to check for internet connection and potential error message
	 */
	sap.watt.network = {

		_bNetworkAvailable : true,
		_oError : undefined,
		_httpCode : undefined,

		getNetworkState : function() {
			var xhr = new XMLHttpRequest();
			var status;
			xhr.open("GET", "//" + window.location.host + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false);
			try {
				xhr.send();
				this._oError = undefined;
				this._httpCode = xhr.status;
				this._bNetworkAvailable = true;
			} catch (error) {
				this._oError = error;
				this._bNetworkAvailable = false;
			}
			return this;
		},

		isNetworkAvailable : function(){
			return this._bNetworkAvailable;
		},
		
		isResponseOk : function() {
			return (this._httpCode >= 200 && this._httpCode < 300 || this._httpCode === 304);
		},

		isSessionTimeOutInPreview : function(){
			return window.location.search.indexOf("hc_orionpath=") > -1 && this._httpCode === 503;
		},

		getLastError : function() {
			return this._oError ? this._oError : "";
		},

		getHttpCode : function() {
			return this._httpCode;
		}

	};

	/*
	 * initializes the module loader (lookup of the basedir and the main module), e.g.
	 * 
	 * <pre>
	 * 
	 * &lt;script ... data-sap-ide-main="sap/watt/core/Core" data-sap-ide-basedir="../../../"&gt;&lt;/script&gt;
	 * 
	 * </pre>
	 */
	(function() {

		// find the script tags in the head
		var aScripts = document.querySelectorAll("script[data-sap-ide-basedir][data-sap-ide-main]");
		var oScript;

		if (aScripts.length >= 1) {
			oScript = aScripts[0];
		}

		// extract the basedir and the main module
		if (oScript) {

			var sBaseDir = oScript.getAttribute("data-sap-ide-basedir");
			var sEnvPath = oScript.getAttribute("data-sap-ide-environment-path");
			//Ensure that basedir ends with a /
			sBaseDir = (sBaseDir.lastIndexOf("/") === (sBaseDir.length - 1)) ? sBaseDir : sBaseDir + "/";
			var sMain = oScript.getAttribute("data-sap-ide-main");
			//@lean-web-ide
			var bLeanWebIde = oScript.getAttribute("data-sap-ide-leanwebide") === 'true';
			// load the env.json and the prerequisites
			fnLoadEnv(
					function(mEnv) {

						//@lean-web-ide
						if ((window.requirejs && !(window.jQuery && window.jQuery.sap))||bLeanWebIde) {
							var mRConfig = {
								baseUrl : sBaseDir,
								//Disable load timeout (at least for debugging as this causes unexpected timeout errors)
								waitSeconds : 0
							};
							if (mEnv.namespaceMappings) {
								mRConfig.paths = mEnv.namespaceMappings;
							}
							mEnv["base_path"] = sBaseDir;

							// configure requirejs
							require.config(mRConfig);

							var loadMain = function() {
								// load the prerequisites
								require(
										[ "sap/watt/core/q", "sap/watt/ui5/UI5Loader"],
										function(Q, ui5) {
											// Make Q globally available
											window.Q = Q;
											// route all errors to the same central error handling
											Q.onerror = function(oError) {
												throw oError;
											};

											// Central error handling
											// TODO: Move this to error service
											window.onerror = function (message, filename, lineno, colno, oError) {
												if (!oError) {
													oError = new Error(message ? message : "no details available",
														filename ? filename : "", lineno ? lineno : undefined);
												}
												if (!window.ui5WattQunit) {

													var sError;
													var oNetWorkState = sap.watt.network.getNetworkState();

													if (!oNetWorkState.isNetworkAvailable()) {
														// On network failure send notification to user, but DON'T USE A DIALOG or I18n here
														// (which potentially cannot be loaded)
														sError = "The host is not reachable.\nPlease check your network connection.";
														alert(sError);

													} else if (oNetWorkState.isSessionTimeOutInPreview()) {
														// A session timout in preview occured. The messagebox may not be available.
														sError = "The preview session timed out.\nPlease restart the preview.";
														alert(sError);

													} else if (!oNetWorkState.isResponseOk()) {
														// Network is reachable but some unexpected http response happened, so a messagebox can
														// possibly not be rendered
														sError = "Unexpected server response.\nPlease try again later.";
														console.error("Unexpected server response: ", oNetWorkState.getLastError());

														// Raise popups only if the failure page is not currently displayed.
														if ($("#failure").css("display") === "none") {
															alert(sError);
														}														

													} else {
														// An unexpected client side problem inside the WEB IDE code happened. Most propbably
														// the message box is available to render a smart error message:
														var sUUID = guid()();
														var messageBox = sap.ui.commons.MessageBox;
														// if session is gone send notification to user
														if (oError.message === "SESSION_GONE") {
															sError = "Connection has been broken or session has expired. Copy the content of your unsaved files to an external file and then refresh to reconnect.";
															messageBox.show(sError, "WARNING", "Warning", [], null, null,
																"MSG_UNHANDLEDERROR" + sUUID);
														} else {
															// if the networkand session is available perform the unhandled error handling
															console.error("Unhandled Error", oError);
															console.error(oError.stack);
															sError = "Unhandled Error: " + oError.message;
															
															// Raise popups only if the failure page is not currently displayed.
															if ($("#failure").css("display") === "none") {
																messageBox.show(sError, "ERROR", "Error", [], null, null, "MSG_UNHANDLEDERROR"
																	+ sUUID);
															}
														}
													}
												}

												// this is karma testing mode, the deferred promise must be rejected
												// otherwise the tests will timeout instead of providing useful error messages
												if (sap.watt.getEnv("iframeMode")) {
													var myIFrameID = window.frameElement.id;
													var parent = window.parent;
													var deferredStartupPromise = parent.WEB_IDE_DEFERRED[myIFrameID];
													deferredStartupPromise.reject(new Error(sError));
												}
											};
											
											//@lean-web-ide
											var init = function() {
													//Allow test wrapper pages to hook into startup early
													if (window._startCallback){
														 window._startCallback();
													}
	
													// load the main module
													require([ sMain ]);
												};
											if (!bLeanWebIde) {
												// load UI5 and wait!
												ui5.load(sBaseDir).then(init).done();
											} else {
												init();
											}
										});
							};

							//Define selenium tests indicator - mainly for usage analytics performance reporting by selenium tests
							if(/test=selenium/i.test(window.location.search)){
								mEnv.usage_analytics = "selenium";
							}

							mEnv.enableRuntimeChecks = /[&?]enable-runtime-checks/i.test(window.location.search);
							mEnv.staticWSMode = /[&?]sap-ide-static-ws/i.test(window.location.search);
							if (mEnv.staticWSMode) {
								var UI5RootMatch = /static-ws-ui5-root=([^&]+)(?:&|$)/.exec(document.location.search);
								mEnv.staticWSUI5Root = UI5RootMatch ? decodeURIComponent(UI5RootMatch[1]) : undefined;
							}
							mEnv.iframeMode = /[&?]sap-ide-iframe/i.test(window.location.search);
							mEnv.devMode = /[&?](sap-ide-dev[&=]|sap-ide-dev)+/i.test(window.location.search);
							mEnv.debugMode |= /[&?](sap-ide-debug[&=]|sap-ide-debug$)+/i.test(window.location.search)
									|| /[&?]coverage=true+/i.test(window.location.search);
							if (!mEnv.debugMode) {
								require([ sMain + "-preload" ], loadMain, loadMain);
							} else {
								loadMain();
							}

						} else if (window.jQuery && window.jQuery.sap) {
							require([ "sap/watt/lib/q/q" ]);

							//Allow test wrapper pages to hook into startup early
							if (window._startCallback){
								 window._startCallback();
							}
							
							// load the main module!
							require([ sMain ]);
							// TODO: Move this to error service
							Q.onerror = function(error) {
								if (window.console) {
									window.console.error("Unhandled Error", oError);
								}
							};
						}

					}, sEnvPath);

		} else {

			throw new Error(
					"Bootstrap information is missing. No script tag found with attributes \"data-sap-ide-basedir\" and \"data-sap-ide-main\"!");

		}

	}());

}());