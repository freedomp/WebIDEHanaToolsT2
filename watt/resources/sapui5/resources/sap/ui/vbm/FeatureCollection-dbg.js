/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.FeatureCollection.
sap.ui.define([
	'sap/ui/core/theming/Parameters', 'sap/ui/core/Element', './library'
], function(Parameters, Element, library) {
	"use strict";

	/**
	 * Constructor for a new FeatureCollection.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class FeatureCollection aggregation container. A FeatureCollection can render the content of an assigned GeoJSON. The naming is associated to
	 *        the GeoJSON standard. All features found in the GeoJSON are rendered as separated objects. From the possible feature types only
	 *        <ul>
	 *        <li>Polygon and
	 *        <li>Multipolygon
	 *        </ul>
	 *        are supported so far. The feature type support will be extended in the upcoming releases.<br>
	 *        All features from the GeoJSON will be rendered with the given default colors and are inactive. They do not react on mouse over, except
	 *        with tooltip, or raise any events on click or right click.<br>
	 *        By adding <i>Feature elements</i> to the items aggregation you can make the match (by id) feature from the GeoJSON interactive and give
	 *        it alternative colors.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.FeatureCollection
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var FeatureCollection = Element.extend("sap.ui.vbm.FeatureCollection", /** @lends sap.ui.vbm.FeatureCollection.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Source URL for GeoJSON
				 */
				srcURL: {
					type: "string",
					defaultValue: null
				},

				/**
				 * Default Fill color for aggregated features
				 */
				defaultFillColor: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(186, 193, 196, 0.5)"
				},

				/**
				 * Default border color for aggregated features, if applicable
				 */
				defaultBorderColor: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(255, 255, 255, 1.0)"
				}
			},
			defaultAggregation: "items",
			aggregations: {

				/**
				 * Feature object aggregation
				 */
				items: {
					type: "sap.ui.vbm.Feature",
					multiple: true,
					singularName: "item"
				}
			},
			events: {

				/**
				 * The event is raised when there is a click action on an aggregated Feature. Clicks on other Features from the GeoJSON are ignored.
				 */
				click: {
					parameters: {
						/**
						 * Id of clicked Feature
						 */
						featureId: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised when there is a right click or a tap and hold action on an aggregated Feature. Clicks on other Features from
				 * the GeoJSON are ignored.
				 */
				contextMenu: {
					parameters: {
						/**
						 * Id of clicked Feature
						 */
						featureId: {
							type: "string"
						}
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	FeatureCollection.prototype.init = function() {
		this.mbGeoJSONDirty = true;
	};

	FeatureCollection.prototype.setSrcURL = function(sSrcURL) {
		this.mbGeoJSONDirty = true;
		this.setProperty("srcURL", sSrcURL);
	};

	FeatureCollection.prototype.createFeatures = function() {
		// set some default colors
		var colC = this.getDefaultFillColor();
		var colCB = this.getDefaultBorderColor();

		// feature constructor.....................................................//
		function FeatureDataElement(id, array, type, color, colorBorder, tooltip, entity) {
			this.K = id;
			this.P = [];
			this.TT = tooltip;
			this.C = color;
			this.CB = colorBorder;
			this["VB:s"] = false;

			var str, area, areaParts;
			for (var nI = 0, alen = array.length; nI < alen; ++nI) {
				area = array[nI];
				areaParts = [];
				for (var nJ = 0, blen = area.length; nJ < blen; ++nJ) {
					str = "";
					for (var nK = 0, clen = area[nJ].length; nK < clen; ++nK) {
						if (nK) {
							(str += ";");
						}
						str += area[nJ][nK];
					}
					areaParts.push(str);
				}
				this.P.push(areaParts);
			}
		}

		// the constructor needs to be removed, when it is not removed the jquery.//
		// cloning will not work..................................................//
		delete FeatureDataElement.prototype.constructor;

		// ........................................................................//
		// load the geojson trying different location.............................//
		// first the explicit path, second abap third the default.................//

		var oData = null, sPathGeoJSON = null;

		// explicit specified.....................................................//
		sPathGeoJSON = this.getSrcURL();
		if (!oData && sPathGeoJSON) {
			oData = jQuery.sap.syncGetJSON(sPathGeoJSON).data;
		}

		// verify that the json at the specified location was loaded..............//
		if (!oData) {
			jQuery.sap.log.error("The path or the GeoJSON file at location " + sPathGeoJSON + "is invalid.");
			return;
		}

		// load the data with the default settings................................//
		this.mFeatureColl = [];

		this.mFeatureBBox = []; // feature box
		this.mNames = []; // array of names
		this.mFeatureProps = []; // array of properties
		var x, y, minX = 0, maxX = 0, minY = 0, maxY = 0;

		var af = oData.features, tt = '', tmp;
		var aCoordsVB; // array of point coordinates in VB format "lon,lat,0"
		var aCoordsGJ; // array of coordinates in GeoJSON format [lon,lat]
		var aBoundingBoxes; // array of bounding boxes for multi parts
		var aPolygons; // multi polygon array
		var aPolygoneParts; // polygon parts array - with holes
		var nI, nJ, nK;
		for (nJ = 0; nJ < af.length; ++nJ) {
			aPolygons = [];
			aPolygoneParts = [];
			aBoundingBoxes = [];
			var f = af[nJ];

			// get the name of the fragment........................................//
			tt = (f.properties && f.properties.name) ? f.properties.name : "";
			this.mFeatureProps[f.id] = f.properties;

			var coord = f.geometry.coordinates;

			switch (f.geometry.type) {
				case "Polygon":
					minY = Number.MAX_VALUE;
					maxY = -Number.MAX_VALUE;
					minX = Number.MAX_VALUE;
					maxX = -Number.MAX_VALUE;

					for (nI = 0; nI < coord.length; ++nI) {
						aCoordsGJ = coord[nI];

						// create the vbi float array for regions
						aCoordsVB = [];
						for (nK = 0; nK < aCoordsGJ.length; ++nK) {
							tmp = aCoordsGJ[nK];
							if (!nI) {
								// do min max detection -> only on null'th, since holes will not contribute //
								if ((x = tmp[0]) < minX) {
									minX = x;
								}
								if (x > maxX) {
									maxX = x;
								}
								if ((y = tmp[1]) < minY) {
									minY = y;
								}
								if (y > maxY) {
									maxY = y;
								}
							}
							aCoordsVB.push(tmp[0], tmp[1], "0");
						}
						aPolygoneParts.push(aCoordsVB);
					}
					aPolygons.push(aPolygoneParts);
					aBoundingBoxes.push([
						minX, maxX, minY, maxY
					]);
					break;
				case "MultiPolygon":
					for (var nL = 0, coordlen, acmlen = coord.length; nL < acmlen; ++nL) {
						minY = Number.MAX_VALUE;
						maxY = -Number.MAX_VALUE;
						minX = Number.MAX_VALUE;
						maxX = -Number.MAX_VALUE;

						aPolygoneParts = [];
						coordlen = coord[nL].length;
						for (nI = 0; nI < coordlen; ++nI) {
							aCoordsGJ = coord[nL][nI];

							// create the vbi float array for regions.....................//
							aCoordsVB = [];
							for (nK = 0; nK < aCoordsGJ.length; ++nK) {
								tmp = aCoordsGJ[nK];
								if (!nI) {
									// do min max detection -> only on null'th, since holes will not contribute //
									if ((x = tmp[0]) < minX) {
										minX = x;
									}
									if (x > maxX) {
										maxX = x;
									}
									if ((y = tmp[1]) < minY) {
										minY = y;
									}
									if (y > maxY) {
										maxY = y;
									}
								}
								aCoordsVB.push(tmp[0], tmp[1], "0");
							}
							aPolygoneParts.push(aCoordsVB);
						}
						aPolygons.push(aPolygoneParts);
						aBoundingBoxes.push([
							minX, maxX, minY, maxY
						]);
					}
					break;
				case "Point":
					continue;
				default:
					continue;
			}
			this.mFeatureColl.push(new FeatureDataElement(f.id, aPolygons, f.geometry.type, colC, colCB, tt, f.id));

			// get surrounding box for all parts -> this needs to consider round world for optimized bounding box size!
			this.mFeatureBBox[f.id] = window.VBI.MathLib.GetSurroundingBox(aBoundingBoxes);
		}
	};

	// ...........................................................................//
	// model creators............................................................//

	FeatureCollection.prototype.getTemplateObject = function() {
		var oTemp = {};

		oTemp.id = this.getId();

		// the data source name is equivalent to the controls id..................//
		oTemp.datasource = oTemp.id;

		oTemp.hotDeltaColor = "RHLSA(0;1;1;1.5)"; // increase opacity by 50%
		oTemp.altBorderDeltaColor = (Parameters) ? Parameters.get("sapUiChartDataPointBorderHoverSelectedColor") : "#666";

		oTemp['type'] = "{00100000-2012-0004-B001-F311DE491C77}"; // Area -> only polygons supported so far
		oTemp['posarraymulti.bind'] = oTemp.id + ".P"; // P is the position array multi
		oTemp['color.bind'] = oTemp.id + ".C"; // C the color
		oTemp['colorBorder.bind'] = oTemp.id + ".CB"; // CB the border color
		oTemp['tooltip.bind'] = oTemp.id + ".TT"; // TT the tooltip

		return [
			oTemp
		];
	};

	FeatureCollection.prototype.getTypeObject = function() {
		var oType = {};

		// set the id.............................................................//
		oType['name'] = this.getId();

		oType['key'] = 'K';

		oType.A = [
			{
				"name": "K", // key
				"alias": "K",
				"type": "string"
			}, {
				"name": "VB:s", // selection flag
				"alias": "VB:s",
				"type": "boolean"
			}, {
				"name": "P", // position array multi
				"alias": "P",
				"type": "vectorarraymulti"
			}, {
				"name": "C", // color
				"alias": "C",
				"type": "color"
			}, {
				"name": "CB", // border color
				"alias": "CB",
				"type": "string"
			}, {
				"name": "TT", // tooltip
				"alias": "TT",
				"type": "string"
			}
		];
		return [
			oType
		];
	};

	FeatureCollection.prototype.getDataObject = function() {
		if (this.mbGeoJSONDirty) {
			this.createFeatures();
			this.mbGeoJSONDirty = false;
		}

		// apply the region properties to the vbi datacontext.....................//
		// do a real clone of the original data, to be able to handle complete....//
		// model changes..........................................................//

		var aElements = [];
		jQuery.extend(true, aElements, this.mFeatureColl);

		if (!aElements.length) {
			return []; // return immediately when no features are available.....//
		}

		// create lookup for overlayed features..................................//
		var oOverlayMap = {};
		var aOverlayFeatures = this.getItems();
		for (var nJ = 0, len = aOverlayFeatures ? aOverlayFeatures.length : 0, item; nJ < len; ++nJ) {
			item = aOverlayFeatures[nJ];
			oOverlayMap[item.getFeatureId()] = item;
		}

		// iterate over feature table.............................................//
		for (var nK = 0, oElement, oOverlay, tmp; nK < aElements.length; ++nK) {
			oElement = aElements[nK];

			if ((oOverlay = oOverlayMap[oElement.K])) {
				// Overlay found, apply properties.....................................//
				oElement.C = oOverlay.getColor();
				if ((tmp = oOverlay.getTooltip())) {
					oElement.TT = tmp;
				}
			}
		}

		return [
			{
				"name": this.getId(),
				"type": "N",
				"E": aElements
			}
		];
	};

	FeatureCollection.prototype.getActionArray = function() {
		var aActions = [];
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
// if( this.mEventRegistry[ "drop" ] || this.isEventRegistered( "drop" ) )
// aActions.push( { "id": id + "3", "name": "drop", "refScene": "MainScene", "refVO": id, "refEvent": "Drop" } );
//	    
// if( this.mEventRegistry[ "edgeClick" ] || this.isEventRegistered( "edgeClick" ) )
// aActions.push( { "id": id + "7", "name": "edgeClick", "refScene": "MainScene", "refVO": id, "refEvent": "EdgeClick" });
// if( this.mEventRegistry[ "edgeContextMenu" ] || this.isEventRegistered( "edgeContextMenu" ) )
// aActions.push( { "id": id + "8", "name": "edgeContextMenu", "refScene": "MainScene", "refVO": id, "refEvent": "EdgeContextMenu" });

		return aActions;
	};

	/**
	 * Returns Properties for Features like name, bounding box, and midpoint
	 * 
	 * @param {string[]} aFeatureIds Array of Feature Ids. The Feature Id must match the GeoJSON tag.
	 * @returns {array} Array of Feature Information Objects. Each object in the array has the properties BBox: Bounding Box for the Feature in format
	 *          "lonMin;latMin;lonMax;latMax", Midpoint: Centerpoint for Feature in format "lon;lat", Name: Name of the Feature, and Properties: Array
	 *          of name-value-pairs associated with the Feature
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FeatureCollection.prototype.getFeaturesInfo = function(aFeatureIds) {
		var result = [];
		for (var nJ = 0, len = aFeatureIds.length, featureId; nJ < len; ++nJ) {
			featureId = aFeatureIds[nJ];
			result[featureId] = {};
			result[featureId].BBox = this.mFeatureBBox[featureId];
			result[featureId].Midpoint = [
				(this.mFeatureBBox[featureId][0] + this.mFeatureBBox[featureId][1]) / 2, (this.mFeatureBBox[featureId][2] + this.mFeatureBBox[featureId][3]) / 2
			];
			result[featureId].Name = this.mNames[featureId];
			result[featureId].Properties = this.mFeatureProps[featureId];
		}
		return result;
	};

	FeatureCollection.prototype.handleEvent = function(event) {
		var s = event.Action.name;

		var funcname = "fire" + s[0].toUpperCase() + s.slice(1);

		// first we try to get the event on a FeatureCollection instance......................//
		var oOverlay, sInstance = event.Action.instance;
		if ((oOverlay = this.findInstance(sInstance))) {

			if (oOverlay.mEventRegistry[s]) {
				if (s === "click") {
					oOverlay.mClickGeoPos = event.Action.AddActionProperties.AddActionProperty[0]['#'];
				}
				if (s === "contextMenu") {
					oOverlay.mClickPos = [
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
					oOverlay.fireContextMenu({
						menu: oMenuObject
					});
				} else if (s === "handleMoved") {
					oOverlay[funcname]({
						data: event
					});
				} else {
					oOverlay[funcname]({});
				}
			}
		}
		// check wether event is registered on Feature Collection and fire in case of
		if (this.mEventRegistry[s]) {
			this[funcname]({
				featureId: sInstance.split(".")[1]
			});
		}
	};

	/**
	 * open a Detail Window
	 * 
	 * @param {sap.ui.vbm.Feature} oFeature VO instance for which the Detail Window should be opened
	 * @param {object} oParams Parameter object
	 * @param {string} oParams.caption Text for Detail Window caption
	 * @param {string} oParams.offsetX position offset in x-direction from the anchor point
	 * @param {string} oParams.offsetY position offset in y-direction from the anchor point
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FeatureCollection.prototype.openDetailWindow = function(oFeature, oParams) {
		var oParent = this.getParent();
		oParent.mDTWindowCxt.bUseClickPos = true;
		oParent.mDTWindowCxt.open = true;
		oParent.mDTWindowCxt.src = oFeature;
		oParent.mDTWindowCxt.key = oFeature.getFeatureId();
		oParent.mDTWindowCxt.params = oParams;
		oParent.m_bWindowsDirty = true;
		oParent.invalidate(this);
	};

	/**
	 * open the context menu
	 * 
	 * @param {sap.ui.vbm.Feature} oFeature VO instance for which the Detail Window should be opened
	 * @param {object} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	FeatureCollection.prototype.openContextMenu = function(oFeature, oMenu) {
		this.oParent.openContextMenu("Area", oFeature, oMenu);
	};

	FeatureCollection.prototype.handleChangedData = function(aElements) {
		if (aElements && aElements.length) {
			for (var nI = 0, oElement, oInst; nI < aElements.length; ++nI) {
				oElement = aElements[nI];
				oInst = this.findInstance(oElement.K);
				if (oInst) {
					oInst.handleChangedData(oElement);
				}
			}
		}
	};

	// ..........................................................................//
	// helper functions.........................................................//

	FeatureCollection.prototype.isEventRegistered = function(name) {
		var aOverlayFeatures = this.getItems();
		if (!aOverlayFeatures) {
			return false;
		}

		for (var nJ = 0, len = aOverlayFeatures.length; nJ < len; ++nJ) {
			// if one registers for an event we can return........................//
			if (aOverlayFeatures[nJ].mEventRegistry[name]) {
				return true;
			}
		}

		return false;
	};

	FeatureCollection.prototype.findInstance = function(name) {
		var aOverlayFeatures = this.getItems();
		if (!aOverlayFeatures) {
			return false;
		}

		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = aOverlayFeatures.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aOverlayFeatures[nJ].getFeatureId() === key) {
				return aOverlayFeatures[nJ];
			}
		}

		return null;
	};

	return FeatureCollection;

});
