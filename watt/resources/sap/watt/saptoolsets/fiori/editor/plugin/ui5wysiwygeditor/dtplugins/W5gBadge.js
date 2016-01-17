sap.ui.define([
		"sap/ui/dt/Plugin"
	],
	function (Plugin) {
		"use strict";

		/**
		 * Constructor for a new W5gBadge.
		 *
		 * @param {string} [sId] id for the new object, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new object
		 *
		 * @class
		 * The W5gBadge adds badges to overlays in the layout editor
		 * @extends sap.ui.dt.Plugin
		 *
		 */
		var W5gBadge = Plugin.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gBadge",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins.W5gBadge.prototype */ {
			metadata: {
				library: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.dtplugins",
				properties: {
					w5gUtils: {type: "object"}
				}
			}
		});

		/*
		 * @private
		 */
		W5gBadge.prototype.init = function () {
			Plugin.prototype.init.apply(this, arguments);

			var that = this;
			this._mEventDelegate = {
				onAfterRendering: function() {
					var oBadgeInfo = that.getW5gUtils().getBadgeInfo(this.getElementInstance(), window);
					if (oBadgeInfo.text.length) {
						if (oBadgeInfo.fragment || oBadgeInfo.nestedView || oBadgeInfo.unsupported || oBadgeInfo.toBeSupported) {
							this.addStyleClass("controlOverlayForUnsupportedControl");
						}
						this.addStyleClass("controlOverlayBadge");
						this.$().attr("badge-data", oBadgeInfo.text);
					} else {
						this.removeStyleClass("controlOverlayForUnsupportedControl");
						this.removeStyleClass("controlOverlayBadge");
						this.$().removeAttr("badge-data");
					}
				}
			};
		};

		/*
		 * @override
		 */
		W5gBadge.prototype.registerOverlay = function (oOverlay) {
			oOverlay.addEventDelegate(this._mEventDelegate, oOverlay);
		};

		/*
		 * @override
		 */
		W5gBadge.prototype.deregisterOverlay = function (oOverlay) {
			oOverlay.removeEventDelegate(this._mEventDelegate, oOverlay);
		};

		return W5gBadge;
	},
	/* bExport= */ true
);
