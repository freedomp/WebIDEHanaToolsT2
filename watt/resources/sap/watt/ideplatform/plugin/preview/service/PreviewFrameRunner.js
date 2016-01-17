define([], function() {
	return {
		_aWindows: [],
		_bEventListenerExists: false,
		_bOpenNoFrame: false,
		_oCurrentWindow: null,

		showPreview: function(oWindow, oURL, mCustomSettings, sNoFrameUrl) {
			var that = this;
			that._oCurrentWindow = oWindow;
			if (!oURL) {
				return Q();
			}
			var sFrameUrl = oURL.toString();

			var sWrapperUrl = require.toUrl("sap.watt.ideplatform.preview/view/wrapper.html") + "?url=" + window.encodeURIComponent(sFrameUrl);

			//This seems to be nonsense after change 710753 which
			// got applied after change 706367
			var oEnv = window["sap-ide-env"];
			if (sFrameUrl === "about:blank" && oEnv.server_type === "java") {
				// for qunit in IE
				sWrapperUrl = require.toUrl("/resources/sap/watt/ideplatform/plugin/preview/view/wrapper.html") + "?url=" + window.encodeURIComponent(
					sFrameUrl);
			}

			// Deferred which waits for the ready callback
			var oDeferred = Q.defer();
			//Avoid unfinished promise chain warning as this deferred is being tracked with some delay
			if (oDeferred.promise.debugInfo) {
				oDeferred.promise.debugInfo.finalized = true;
			}
			var oWin;
			var sWindowName = that._getWindowName(that._oCurrentWindow);

			// Check if this window is already in the windows array
			for (var i = 0; i < that._aWindows.length; i++) {
				//TODO: check why in extensibility mode each time a new window is created, all with window.name = ""
				if (sWindowName === that._aWindows[i].sWindowName) {
					// Update oWin elements with the current attributes in case the same window is opened more then once with differen values
					oWin = that._aWindows[i];
					oWin.sWindowName = sWindowName;
					// Update oWin elements with the current attributes in case the same window is opened more then once with differen values
					oWin.oCustSettings = mCustomSettings;
					oWin.oDeferred = oDeferred;
					oWin.sFrameUrl = sFrameUrl;
					oWin.sNoFrameUrl = sNoFrameUrl;
					break;
				}
			}

			// In case the window was already in the array, or window has an 
			// emtpy name (not in run scenario (extensibility or fact sheet scenario) 
			// - do not open first without frame (not first run of this window)
			that._bOpenNoFrame = ((oWin || sWindowName == "") ? false : true);
			if (!oWin) {
				// New window - add it to the array
				oWin = {
					sWindowName: sWindowName,
					//oWindow: that._oCurrentWindow,
					oCustSettings: mCustomSettings,
					oDeferred: oDeferred,
					sFrameUrl: sFrameUrl,
					sNoFrameUrl: sNoFrameUrl
				};
				that._aWindows.push(oWin);
			}

			if (!that._bEventListenerExists) {
				// Add the event listener only once
				that._bEventListenerExists = true;
				//FIXME This is never deregistered
				addEventListener("message", function(ev) {
					// Validate the origin of the message
					if (!window.location.origin) {
						// In IE10 window.location.origin is undefined
						window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location
							.port : '');
					}
					if (window.location.origin === ev.origin) {
						if (ev.source && ev.source.window) {
							// Get correct window
							var oWinListener;
							var oCustSettings;
							var oDeferredListener;
							var sUrlListener;

							var sSrcWindowName = that._getWindowName(ev.source);

							for (var j = 0; j < that._aWindows.length; j++) {
								if (sSrcWindowName === that._aWindows[j].sWindowName) {
									oWinListener = ev.source.window;
									oCustSettings = that._aWindows[j].oCustSettings;
									oDeferredListener = that._aWindows[j].oDeferred;
									sUrlListener = that._aWindows[j].sFrameUrl;
									break;
								}
							}
							if (oWinListener) {
								if (ev.data.search("changeDevice") === 2) {
									var oMessage = JSON.parse(ev.data);
									var dev = oMessage.changeDevice;
									if (that.context && that.context.service) {
										that.context.service.preferences.set({
											"device": dev
										}, "Preview").fail(function(error) {
											console.log(error);
										}).done();

										//Usage Monitoring 
										if (oMessage.changeDeviceClicked) {
											that.context.service.usagemonitoring.report("preview", "preview_size", oMessage.changeDeviceClicked).done();
										}
									}
								} else if (ev.data === "initializeTexts") {
									that._initializeTexts(oWinListener);
								} else if (ev.data === "previewReady") {
									if (oWinListener && oWinListener.wrapper) {
										oWinListener.wrapper.createCustButtons(oCustSettings);
										if (that.context && that.context.service) {
											var qrService = that.context.service.qrcode;
											if (qrService) {
												qrService.getQrCode(sUrlListener, true, true).then(function(item) {
													if (item && item.oDiv && item.oDiv[0]) {
														var shareBtn = oWinListener.document.getElementById("shareBtn");
														var shareDiv = oWinListener.document.getElementById("share");
														var newQr = item.oDiv[0];
														newQr.style.padding = "16px";
														$(shareDiv.firstChild).replaceWith(item.oDiv.outerHTML());
														shareBtn.removeAttribute('class'); //remove disable class
														var warnningDiv = oWinListener.document.getElementById("localhost-warning");
														if (warnningDiv) {
															warnningDiv.innerText = that._getText("msg_localhost_warning");
														}
													}
												}).done();
											}
										}
										oDeferredListener.resolve(oWinListener.wrapper);
									} else {
										oDeferredListener.reject();
									}
								} else if (ev.data.search("changeLanguage") === 2) {
									//Usage Monitoring 
									var oMessage = JSON.parse(ev.data);
									var dev = oMessage.changeLanguage;
									that.context.service.usagemonitoring.report("preview", "preview_language", oMessage.changeLanguage).done();
								} else {
									// custom buton
									that.context.event.fireButtonClicked({
										id: ev.data
									}).done();
								}
							}
						}
					}
				}, false);
			}

			var oProm = Q(sWrapperUrl);
			if (that.context && that.context.service) {
				oProm = that.context.service.setting.project.get(that.context.service.translation).then(function(mSettings) {
					if (mSettings) {
						var lang = mSettings.supportedLanguages;
						var dft = mSettings.defaultLanguage;
						if (!dft) {
							if (lang) {
								dft = lang.split(",")[0];
							} else {
								lang = "en";
								dft = "en";
							}
						}
						return Q(sWrapperUrl + "&lang=" + window.encodeURIComponent(lang) +
							"&dft=" + window.encodeURIComponent(dft));
					} else {
						return Q(sWrapperUrl);
					}
				}, function() {
					return Q(sWrapperUrl);
				}).then(function(sUrl) {
					return that.context.service.preferences.get("Preview").then(function(oPreviewSetting) {
						return sUrl + "&device=" + window.encodeURIComponent(oPreviewSetting.device);
					}).fail(function(error) {
						return sUrl;
					});
				});
			}
			return oProm.then(function(sUrl) {
				// In most Web IDE systems SCI group added clickjacking protection by the setting the X-Frame-Options to SAMEORIGIN. 
				// This prevents from authenticating the user when running in a frame. As a workaround, we display the preview 
				// without a frame for 2 seconds and only then with the frame.
				if (that._bOpenNoFrame) {
					// In case of first run, open the preview without frame for 2 seconds and only then with frame 
					// TODO: see if we can change the arbitrary 2 seconds to display the preview with frame only after
					// the preview without frame was loaded and the authentication was done properly.
					that._oCurrentWindow.window.location.href = oWin.sNoFrameUrl;
					setTimeout(function() {
						that._oCurrentWindow.window.location.href = sUrl;
						return oWin.oDeferred.promise;
					}, 2000);
				} else {
					that._oCurrentWindow.window.location.href = sUrl;
					return oWin.oDeferred.promise;
				}
			});
		},

		_initializeTexts: function(oWin) {
			var aDom = [];
			try {
				aDom = oWin.document.getElementsByClassName("i18n");
			} catch (e) {
				console.log(e.message);
			}
			oWin.document.title = this._getText("preview_title");
			oWin.msg_invalid_url = "msg_invalid_url";
			oWin.msg_no_ide = "msg_invalid_url";
			for (var id in oWin.wrapper.msg) {
				oWin.wrapper.msg[id] = this._getText(id);
			}
			for (var n = 0; n < aDom.length; n++) {
				var dom = aDom[n];
				if (dom.textContent != "" && dom.textContent.indexOf("preview_") == 0) {
					dom.textContent = this._getText(dom.textContent);
				}
				if (dom.title != "" && dom.title.indexOf("preview_") == 0) {
					dom.title = this._getText(dom.title);
				}
			}
		},
		_getText: function(id) {
			if (this.context) {
				var i18n = this.context.i18n;
				return i18n.getText("i18n", id);
			}
			return id;
		},
		_getWindowName: function(oWindow) {
			// In IE the access to the window element is denied - set name to "" in this case
			var sWindowName;
			try {
				sWindowName = oWindow.name;
			} catch (e) {
				sWindowName = "";
			}
			return sWindowName;
		}
	};
});