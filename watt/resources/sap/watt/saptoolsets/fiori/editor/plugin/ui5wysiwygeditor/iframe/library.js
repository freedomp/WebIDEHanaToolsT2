sap.ui.define([
		"sap/ui/core/library"
	],
	function() {
		"use strict";

		sap.ui.getCore().initLibrary({
			name: "sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe",
			dependencies: [
				"sap.ui.core"
			],
			types: [
				"sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Device"
			],
			controls: [
				"sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe.Wysiwyg"
			],
			interfaces: [],
			elements: [],
			version: "1.32.4"
		});

		var oLib = jQuery.sap.getObject("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.iframe");
		/**
		 * @class Device type of the WYSIWYG control
		 *
		 * @static
		 * @public
		 */
		oLib.Device = {

			/**
			 * Phone device
			 * @public
			 */
			phone : "phone",

			/**
			 * Phone device in landscape orientation
			 * @public
			 */
			phoneLandscape : "phoneLandscape",

			/**
			 * Tablet device
			 * @public
			 */
			tablet : "tablet",

			/**
			 * Tablet device in landscape orientation
			 * @public
			 */
			tabletLandscape : "tabletLandscape",

			/**
			 * Desktop device
			 * @public
			 */
			desktop : "desktop"

		};

		return oLib;
	}
);
