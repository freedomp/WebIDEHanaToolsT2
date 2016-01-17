/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Cluster.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool'
], function(jQuery, library, Control, IconPool) {
	"use strict";

	/**
	 * Constructor for a new Cluster.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Cluster control to visualize clustered objects on a map. The Cluster control does not cluster anything itself, instead it only shows a
	 *        predefined image. The image can be configured with the properties <i>type</i>, <i>color</i>, <i>icon</i> and <i>text</i>. If a
	 *        <i>text</i> is given it is shown in the upper right corner of the control with a rounded border around. With the <i>color</i> property
	 *        any color can be chosen. The <i>type</i> property overwrites a property <i>color</i> with semantic color of the type and provides a
	 *        particular semantic icon in the middle of the control. With the <i>icon</i> property an icon can be defined and may overrule the
	 *        semantic icon; if no icon is defined ( and no type) then the semantic icon for type inactive is chosen.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Cluster
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Cluster = Control.extend("sap.ui.vbm.Cluster", /** @lends sap.ui.vbm.Cluster.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Set the color of the control. If a type is set then the semantic color of the type is taken instead.
				 */
				color: {
					type: "sap.ui.core.CSSColor",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Set the icon of the control. If a type is set then the semantic icon of the type can be overwritten with this property. If no icon
				 * and no type is set then the icon for the semantic type 'inactive' is taken.
				 */
				icon: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * Set the text of the control.
				 */
				text: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},
				/**
				 * semantic type for cluster. The type specifies the icon and the color of the cluster control.
				 */
				type: {
					type: "sap.ui.vbm.SemanticType",
					group: "Behavior",
					defaultValue: sap.ui.vbm.SemanticType.None
				}

			}
		}
	});

	jQuery.sap.require("sap.ui.core.IconPool");
	jQuery.sap.require("sap.ui.core.theming.Parameters");

	// ...........................................................................//
	// This file defines behavior for the control,...............................//
	// ...........................................................................//

	Cluster.prototype.exit = function() {
	};

	Cluster.prototype.init = function() {
	};

	// ...........................................................................//

	Cluster.prototype.onAfterRendering = function() {
		// when there is preserved content restore it.............................//
		if (this.$oldContent.length > 0) {
			this.$().append(this.$oldContent);
		}
		var col = this.getColor();
		var type = this.getType();
		if (col && type == sap.ui.vbm.SemanticType.None) {
			// color manipulation needed

			var Id1 = this.getId() + "-" + "backgroundcircle";
			var Id2 = Id1 + "-" + "innercircle";

			var backgroundcircle = document.getElementById(Id1);
			var innercircle = document.getElementById(Id2);
			var c = jQuery(backgroundcircle).css("border-bottom-color");
			var rgba = Cluster.prototype.string2rgba(c);
			rgba = "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + 0.5 + ")";
			jQuery(backgroundcircle).css("border-color", rgba);
			jQuery(innercircle).css("border-color", rgba);

		}

	};

	Cluster.prototype.onBeforeRendering = function() {
		// this is called before the renderer is called...........................//

		this.$oldContent = sap.ui.core.RenderManager.findPreservedContent(this.getId());
	};

	// ...........................................................................//
	// re implement property setters.............................................//

	Cluster.prototype.setColor = function(col) {
		this.setProperty("color", col);
	};

	Cluster.prototype.setIcon = function(ic) {
		this.setProperty("icon", ic);
	};

	Cluster.prototype.setText = function(txt) {
		this.setProperty("text", txt);
	};

	Cluster.prototype.string2rgba = function(a) {
		var cache;

		if ((cache = /^rgb\(([\d]+)[,;]\s*([\d]+)[,;]\s*([\d]+)\)/.exec(a))) {
			return [
				+cache[1], +cache[2], +cache[3], 1.0, 0
			];
		} else {
			return [
				94, 105, 110
			];
		}
	};

	return Cluster;

});
