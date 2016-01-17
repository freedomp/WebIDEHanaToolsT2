sap.ui.define(
	[
		"sap/ui/core/Control", "./PatchCore", "./IFrame", "./library"
	],
	function (Control, PatchCore, IFrame) {
		"use strict";

// Private variables and methods
// Begin
		var UI_DBG_FLAG = "sap-ui-debug";

		function _errorHandler(message, filename, lineno, colno, oError) {
			var oDelegate = oError;
			if (!oDelegate) {
				oDelegate = new Error(message ? message : "no details available",
					filename ? filename : "", lineno ? lineno : undefined);
			}
			throw oDelegate;
		}

		function _getIFrameSrc(sSrc) {
			var oURI = URI(sSrc);
			oURI
				.addSearch("sap-ui-xx-designMode", "true")
				.addSearch("responderOn", "true")
				.addSearch("sap-ui-xx-noless", "true");
			if (jQuery.sap.getUriParameters().get(UI_DBG_FLAG)) {
				oURI.addSearch(UI_DBG_FLAG, "true");
			}
			return oURI.toString();
		}

		/**
		 * @this {Wysiwyg}
		 */
		function _onLoaded() {
			var oWindow = this._oWindow = this._$IFrame[0].contentWindow,
				that = this;

			oWindow.sap.ui.getCore().attachInit(function () {
				PatchCore.patch(oWindow);
				oWindow.onerror = _errorHandler;
				that._$IFrame.removeClass("sapWysiwygIframeLoading");
				that.fireLoaded({
					window: oWindow
				});
			});
		}

		/**
		 * @this {Wysiwyg}
		 */
		function _getIFramePosition() {
			return this._$IFrame.position();
		}
// End
// Private variables and methods

		/**
		 * Constructor for a new Wysiwyg canvas.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 *
		 * @class
		 * WYSIWYG canvas
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg
		 */
		var Wysiwyg = Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe",
				properties: {
					"device": {
						type: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Device",
						group: "Dimension",
						defaultValue: sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Device.tablet
					},
					"autoSize": { type: "boolean", group: "Dimension", defaultValue: true },
					"src": { type: "sap.ui.core.URI", group: "Data", defaultValue: null }
				},
				events: {
					"loaded": {}
				}
			}
		});

		Wysiwyg.prototype.init = function () {
			this._$IFrame = null;
			this._oWindow = null;
			this._createIframe();
		};

		Wysiwyg.prototype.exit = function () {
			this._oIFrame
				.detachLoaded(_onLoaded, this)
				.destroy();
			this._$IFrame = null;
			this._oWindow = null;
		};

		Wysiwyg.prototype.setSrc = function (sSrc) {
			this.setProperty("src", sSrc, true);

			this._$IFrame.addClass("sapWysiwygIframeLoading");
			this._oIFrame
				.detachLoaded(_onLoaded, this)
				.attachLoaded(_onLoaded, this)
				.setSource(_getIFrameSrc(sSrc));
			return this;
		};

		Wysiwyg.prototype.setDevice = function (sDevice) {
			if (sDevice !== this.getDevice() && this._oIFrame) {
				var sDeviceClass = this._getDeviceClass();

				this.setProperty("device", sDevice, true);
				this._oIFrame
					.removeStyleClass(sDeviceClass)
					.addStyleClass(this._getDeviceClass());
				this.invalidate();
			}
			return this;
		};

		Wysiwyg.prototype._createIframe = function () {
			if (this._oIFrame) {
				return;
			}

			this._oIFrame = new IFrame();
			this._oIFrame.addStyleClass(this._getDeviceClass());
			this._$IFrame = jQuery(this._oIFrame.getDomRef());
		};

		Wysiwyg.prototype.getIFrameDomRef = function() {
			return this._$IFrame && this._$IFrame[0];
		};

		/**
		 * Returns iframe window
		 * 
		 * @return {Window}
		 */
		Wysiwyg.prototype.getScope = function() {
			return this._oWindow;
		};

		Wysiwyg.prototype.getIFramePosition = function() {
			return _getIFramePosition.bind(this);
		};

		Wysiwyg.prototype._getDeviceClass = function () {
			var sDevice = this.getDevice();
			return "sapWysiwyg" + (sDevice.charAt(0).toUpperCase() + sDevice.slice(1));
		};

		return Wysiwyg;
	},
	/* bExport= */ true
);
