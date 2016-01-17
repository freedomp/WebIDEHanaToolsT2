/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

/**
 * Initialization Code and shared classes of library sap.suite.ui.generic.template.
 */
sap.ui.define([
	"jquery.sap.global", "./TransformationMatrix", "./DvlException"
], function(jQuery, TransformationMatrix, DvlException) {
	"use strict";

	/**
	 * SAPUI5 library with controls for displaying 3D models.
	 *
	 * @namespace
	 * @name sap.ui.vk
	 * @author SAP SE
	 * @version 1.32.3
	 * @public
	 */

	// Delegate further initialization of this library to the Core.
	sap.ui.getCore().initLibrary({
		name: "sap.ui.vk",
		dependencies: [
			"sap.ui.core", "sap.ui.unified", "sap.ui.vbm"
		],
		types: [
			"sap.ui.vk.ContentResourceSourceCategory", "sap.ui.vk.TransformationMatrix"
		],
		interfaces: [],
		controls: [
			"sap.ui.vk.NativeViewport", "sap.ui.vk.Overlay", "sap.ui.vk.Viewer", "sap.ui.vk.Viewport", "sap.ui.vk.SceneTree"
		],
		elements: [
			"sap.ui.vk.OverlayArea"
		],
		noLibraryCSS: false,
		version: "1.32.3"
	});

	/**
	 * The types of APIs supported by the {@link sap.ui.vk.GraphicsCore} class.
	 *
	 * @enum {string}
	 * @readonly
	 * @public
	 * @experimental since version 1.32.0. The enumeration might be deleted in the next version.
	 */
	sap.ui.vk.GraphicsCoreApi = {
		/**
		 * The legacy DVL API implemented in the com.sap.ve.dvl library (dvl.js).
		 * @public
		 */
		LegacyDvl: "LegacyDvl"
	};

	/**
	 * The categories of content resources.
	 * @enum {string}
	 * @readonly
	 * @public
	 * @experimental Since 1.32.0 This map is experimental and might be modified or removed in future versions.
	 */
	sap.ui.vk.ContentResourceSourceCategory = {
		/**
		 * The 3D content resource.
		 * @public
		 */
		"3D": "3D",
		/**
		 * The 2D content resource.
		 * @public
		 */
		"2D": "2D"
	};

	/**
	 * The map from file extensions to content resource categories.
	 * @readonly
	 * @private
	 * @experimental Since 1.32.0 This map is experimental and might be modified or removed in future versions.
	 */
	sap.ui.vk.ContentResourceSourceTypeToCategoryMap = {
		"vds": sap.ui.vk.ContentResourceSourceCategory["3D"],
		"png": sap.ui.vk.ContentResourceSourceCategory["2D"],
		"jpg": sap.ui.vk.ContentResourceSourceCategory["2D"],
		"gif": sap.ui.vk.ContentResourceSourceCategory["2D"]
	};

	/**
	 * Utility methods used internally by the library to handle results from DVL.
	 * @private
	 */
	sap.ui.vk.dvl = {
		checkResult: function(result) {
			if (result < 0) {
				throw new DvlException(result, sap.ve.dvl.DVLRESULT.getDescription ? sap.ve.dvl.DVLRESULT.getDescription(result) : "");
			}
			return result;
		},

		getPointer: function(pointer) {
			if (pointer.indexOf("errorcode") === 0) {
				var code = parseInt(pointer.substr(15), 16) - 0x100;
				throw new DvlException(code, sap.ve.dvl.DVLRESULT.getDescription ? sap.ve.dvl.DVLRESULT.getDescription(code) : "");
			}
			return pointer;
		},

		getJSONObject: function(object) {
			if (jQuery.type(object) === "number") {
				throw new DvlException(object, sap.ve.dvl.DVLRESULT.getDescription ? sap.ve.dvl.DVLRESULT.getDescription(object) : "");
			}
			return object;
		}
	};

	return sap.ui.vk;
});
