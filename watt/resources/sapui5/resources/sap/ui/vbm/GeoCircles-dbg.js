/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.GeoCircles.
sap.ui.define([
	'./VoAggregation', './library'
], function(VoAggregation, library) {
	"use strict";

	/**
	 * Constructor for a new GeoCircles.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type specific Visual Object aggregation for <i>GeoCircle</i> elements.
	 * @extends sap.ui.vbm.VoAggregation
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.GeoCircles
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GeoCircles = VoAggregation.extend("sap.ui.vbm.GeoCircles", /** @lends sap.ui.vbm.GeoCircles.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Set to true if position may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				posChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Set to true if radius may be changed at runtime. The actual changeability is control on each aggregated element with property
				 * <i>changeable</i>.
				 */
				radiusChangeable: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * GeoCircle element aggregation
				 */
				items: {
					type: "sap.ui.vbm.GeoCircle",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on a GeoCircle.
				 */
				click: {},

				/**
				 * The event is raised when there is a right click or a tap and hold action on a GeoCircle.
				 */
				contextMenu: {},

				/**
				 * The event is raised when something is dropped on a GeoCircle.
				 */
				drop: {}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.GeoCircles.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators...........................................................//

	GeoCircles.prototype.getBindInfo = function() {
		var oBindInfo = VoAggregation.prototype.getBindInfo.apply(this, arguments);
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.C = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("color") : true;
		oBindInfo.CB = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("colorBorder") : true;
		oBindInfo.P = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("position") : true;
		oBindInfo.NS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("slices") : true;
		oBindInfo.R = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("radius") : true;

		return oBindInfo;
	};

	GeoCircles.prototype.getTemplateObject = function() {
		// get common template from base class (VoAggregation)
		var oTemp = VoAggregation.prototype.getTemplateObject.apply(this, arguments);

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		oTemp["type"] = "{00100000-2013-0004-B001-686F01B57873}";
		if (oBindInfo.P) {
			oTemp["midpoint.bind"] = oTemp.id + ".P";
		} else {
			oTemp.pos = oVoTemplate.getPosition(); // P is the position
		}
		if (oBindInfo.NS) {
			oTemp["slices.bind"] = oTemp.id + ".NS";
		} else {
			oTemp.slices = oVoTemplate.getSlices(); // NS is the number of slices
		}
		if (oBindInfo.C) {
			oTemp["color.bind"] = oTemp.id + ".C";
		} else {
			oTemp.color = oVoTemplate.getColor(); // C the color
		}
		if (oBindInfo.CB) {
			oTemp["colorBorder.bind"] = oTemp.id + ".CB";
		} else {
			oTemp.colorBorder = oVoTemplate.getColorBorder(); // BC the border color
		}
		if (oBindInfo.R) {
			oTemp["radius.bind"] = oTemp.id + ".R";
		} else {
			oTemp.radius = oVoTemplate.getRadius(); // R is the radius
		}

		return oTemp;
	};

	GeoCircles.prototype.getTypeObject = function() {
		var oType = VoAggregation.prototype.getTypeObject.apply(this, arguments);
		var oBindInfo = this.mBindInfo;

		if (oBindInfo.P) {
			oType.A.push({
				"changeable": this.getPosChangeable().toString(),
				"name": "P", // position
				"alias": "P",
				"type": "vector"
			});
		}
		if (oBindInfo.R) {
			oType.A.push({
				"changeable": this.getRadiusChangeable().toString(),
				"name": "R", // radius
				"alias": "R",
				"type": "double"
			});
		}
		if (oBindInfo.C) {
			oType.A.push({
				"name": "C", // color
				"alias": "C",
				"type": "color"
			});
		}
		if (oBindInfo.CB) {
			oType.A.push({
				"name": "CB", // colorBorder
				"alias": "CB",
				"type": "color"
			});
		}
		if (oBindInfo.NS) {
			oType.A.push({
				"name": "NS", // slices
				"alias": "NS",
				"type": "long"
			});
		}
		return oType;
	};

	// ..........................................................................//
	// helper functions.........................................................//

	GeoCircles.prototype.handleEvent = function(event) {
		var s = event.Action.name;

		var funcname = "fire" + s[0].toUpperCase() + s.slice(1);

		// first we try to get the event on a GeoCircles instance......................//
		var GeoCircle;
		if ((GeoCircle = this.findInstance(event.Action.instance))) {
			if (GeoCircle.mEventRegistry[s]) {
				if (s == "click") {
					GeoCircle.mClickGeoPos = event.Action.AddActionProperties.AddActionProperty[0]['#'];
				}
				if (s == "contextMenu") {
					GeoCircle.mClickPos = [
						event.Action.Params.Param[0]['#'], event.Action.Params.Param[1]['#']
					];
					// create an empty menu
					jQuery.sap.require("sap.ui.unified.Menu");

					if (this.oParent.mVBIContext.m_Menus) {
						this.oParent.mVBIContext.m_Menus.deleteMenu("DynContextMenu");
					}

					var oMenuObject = new sap.ui.unified.Menu();
					oMenuObject.vbi_data = {};
					oMenuObject.vbi_data.menuRef = "CTM";
					oMenuObject.vbi_data.VBIName = "DynContextMenu";

					// fire the contextMenu..................................................//
					GeoCircle.fireContextMenu({
						data: event,
						menu: oMenuObject
					});
				} else if (s == "handleMoved") {
					GeoCircle[funcname]({
						data: event
					});
				} else {
					GeoCircle[funcname]({
						data: event
					});
				}
			}
		}

		this[funcname]({
			data: event
		});
	};

	GeoCircles.prototype.getActionArray = function() {
		var aActions = VoAggregation.prototype.getActionArray.apply(this, arguments);

		var id = this.getId();

		// check if the different vo events are registered..............................//
		if (this.mEventRegistry["click"] || this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"] || this.isEventRegistered("contextMenu")) {
			aActions.push({
				"id": id + "2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "ContextMenu"
			});
		}
		if (this.mEventRegistry["drop"] || this.isEventRegistered("drop")) {
			aActions.push({
				"id": id + "3",
				"name": "drop",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Drop"
			});
		}

		return aActions;
	};

	return GeoCircles;

});
