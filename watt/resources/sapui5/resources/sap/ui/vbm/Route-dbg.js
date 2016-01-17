/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.Route.
sap.ui.define([
	'./VoBase', './library'
], function(VoBase, library) {
	"use strict";

	/**
	 * Constructor for a new Route.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Specific Visual Object element for a <i>Route</i>. A Route is a polyline, which is given as a list of geo-coordinates. In order to
	 *        indicate direction an arrow head can be added at start and end. Further it is possible to have a dot at each point of the coordinate
	 *        list.<br>
	 *        Since the actual length of a route depends on the zoom level it might be only partly visible. Thus detail windows will be dynamically
	 *        positioned in the middle of the visible route part.<br>
	 *        A Route supports GeoMap internal drag'n drop with fine grained control on matching drag sources and drop targets. A drag'n drop
	 *        operation is possible if any type in the drag source aggregation of the dragged visual object matches a type in the drop target
	 *        aggregation of the target vo. Drag source and drop target types defined on element level apply only for a single element instance,
	 *        except the element is used as template.
	 * @extends sap.ui.vbm.VoBase
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.Route
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var Route = VoBase.extend("sap.ui.vbm.Route", /** @lends sap.ui.vbm.Route.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * The position array of the route. The format is "lon0;lat0;0;...lonN;latN;0".
				 */
				position: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The color of the route.
				 */
				color: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(0;0;0)'
				},

				/**
				 * The start point type of the route.
				 * <ul>
				 * <li>0: no startpoint
				 * <li>1: arrow head as startpoint
				 * </ul>
				 */
				start: {
					type: "string",
					group: "Misc",
					defaultValue: '0'
				},

				/**
				 * The end point type of the route.
				 * <ul>
				 * <li>0: no endpoint
				 * <li>1: arrow as endpoint
				 * </ul>
				 */
				end: {
					type: "string",
					group: "Misc",
					defaultValue: '0'
				},

				/**
				 * The width of the route line. With width 0 no line is drawn.
				 */
				linewidth: {
					type: "string",
					group: "Misc",
					defaultValue: '5'
				},

				/**
				 * The color for the line dots of a route.
				 */
				dotcolor: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(0;0;0)'
				},

				/**
				 * The border color of the line dots of a route.
				 */
				dotbordercolor: {
					type: "string",
					group: "Misc",
					defaultValue: 'RGB(0;0;0)'
				},

				/**
				 * The border color of the route.
				 */
				colorBorder: {
					type: "string",
					group: "Misc"
				},

				/**
				 * Defines the dashing style of the route using an array.
				 */
				lineDash: {
					type: "string",
					group: "Misc"
				},

				/**
				 * The diameter of a dot in a route.
				 */
				dotwidth: {
					type: "string",
					group: "Misc",
					defaultValue: '0'
				},
				/**
				 * Defines the type of the route, default is 'Straight'. Other types are 'Geodesic' which show the shortest path between two points,
				 * e.g. flightroutes
				 * 
				 * @experimental Since 1.32.0 this method is experimental and might be modified or removed in future versions.
				 */
				routetype: {
					type: "sap.ui.vbm.RouteType",
					group: "Misc",
					defaultValue: 'Straight'
				}

			},
			aggregations: {

				/**
				 * DragSource aggregation
				 */
				dragSource: {
					type: "sap.ui.vbm.DragSource",
					multiple: true,
					singularName: "dragSource"
				},

				/**
				 * DropTarget aggregation
				 */
				dropTarget: {
					type: "sap.ui.vbm.DropTarget",
					multiple: true,
					singularName: "dropTarget"
				}
			},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.Route.prototype.init = function(){
	// // do something for initialization...
	// };

	// Implement function defined in VoBase
	Route.prototype.openContextMenu = function(oMenu) {
		this.oParent.openContextMenu("Route", this, oMenu);
	};

	Route.prototype.getDataElement = function() {
		var oElement = VoBase.prototype.getDataElement.apply(this, arguments);
		var oBindInfo = this.oParent.mBindInfo;

		// add the VO specific properties..................................//
		if (oBindInfo.P) {
			if (this.getRoutetype() == 'Geodesic') {
				var pos = this.getPosition().split(";");
				var length = pos.length;
				var geo_start = pos.slice(0, 3);
				var geo_end = pos.slice(length - 3, length);
				var route = calcGeodesicRoute(geo_start, geo_end);
				oElement.P = geo_start[0] + ';' + geo_start[1] + ';0.0;' + route + geo_end[0] + ';' + geo_end[1] + ';0.0';
			} else {
				oElement.P = this.getPosition();
			}
		}
		if (oBindInfo.C) {
			oElement.C = this.getColor();
		}
		if (oBindInfo.ST) {
			oElement.ST = this.getStart();
		}
		if (oBindInfo.ED) {
			oElement.ED = this.getEnd();
		}
		if (oBindInfo.LW) {
			oElement.LW = this.getLinewidth();
		}
		if (oBindInfo.DC) {
			oElement.DC = this.getDotcolor();
		}
		if (oBindInfo.DBC) {
			oElement.DBC = this.getDotbordercolor();
		}
		if (oBindInfo.CB) {
			var cb = this.getColorBorder();
			if (cb != undefined && cb != "") {
				oElement.CB = cb;
			}
		}
		if (oBindInfo.LD) {
			var ld = this.getLineDash();
			if (ld != undefined && ld != "") {
				oElement.LD = ld;
			}
		}
		if (oBindInfo.DW) {
			oElement.DW = this.getDotwidth();
		}
		if (oBindInfo.DS || oBindInfo.DT) {
			oElement.N = this.getDragDropDefs();
		}

		return oElement;
	};

	Route.prototype.handleChangedData = function(oElement) {
		if (oElement.P) {
			this.setPosition(oElement.P);
		}
	};

	return Route;

});

// Crossproduct
function cross(a, b) {
	var c = new Array(4);
	c[1] = a[2] * b[3] - a[3] * b[2];
	c[2] = a[3] * b[1] - a[1] * b[3];
	c[3] = a[1] * b[2] - a[2] * b[1];
	return c;
}

function dot(a, b) {
	var c = 0;
	c = a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	return c;
}

// Converts from degrees to radians.
function radians(degrees) {
	return degrees * Math.PI / 180;
}

// Converts from radians to degrees.
function degrees(radians) {
	return radians * 180 / Math.PI;
}

function calcGeodesicRoute(geo_start, geo_end) {

	var x_start = new Array(4); // Vektoren
	var x_end = new Array(4);
	var u = new Array(4);
	var u_norm = new Array(4);
	var v = new Array(4);

	// var pos = [];
	// if (!destination.length == 0) {
	// pos = destination.split(";");
	// geo_end[1] = pos[0];
	// geo_end[2] = pos[1];
	// };

	x_start[1] = Math.cos(radians(geo_start[1])) * Math.cos(radians(geo_start[0]));
	x_start[2] = Math.cos(radians(geo_start[1])) * Math.sin(radians(geo_start[0]));
	x_start[3] = Math.sin(radians(geo_start[1]));

	x_end[1] = Math.cos(radians(geo_end[1])) * Math.cos(radians(geo_end[0]));
	x_end[2] = Math.cos(radians(geo_end[1])) * Math.sin(radians(geo_end[0]));
	x_end[3] = Math.sin(radians(geo_end[1]));

	// var angle_rad = radians(geo_end[0] - geo_start[0]);
	// var angle_deg = degrees(angle_rad);

	u = cross(x_start, x_end);
	var length = Math.sqrt(dot(u, u));
	u_norm[1] = u[1] / length;
	u_norm[2] = u[2] / length;
	u_norm[3] = u[3] / length;

	v = cross(u_norm, x_start);

	var flight = new Array(101);
	var flight_geo = new Array(201);
	for (var i = 0; i <= 100; i++) {
		flight[i] = new Array(4);
		flight_geo[i] = new Array(4);
	}

	// var step_geo = (geo_end[1] - geo_start[1]) / 100;
	// var step_rad = radians(step_geo);
	var angle_r = Math.acos(dot(x_start, x_end));
	// var angle_de = degrees(angle_r);

	var route = "";

	for (var i = 0; i <= 100; i++) {
		var t = i / 100 * angle_r;

		flight[i][0] = 0;
		flight[i][1] = Math.cos(t) * x_start[1] + Math.sin(t) * v[1]; // x - coordinate
		flight[i][2] = Math.cos(t) * x_start[2] + Math.sin(t) * v[2]; // y - coordinate
		flight[i][3] = Math.cos(t) * x_start[3] + Math.sin(t) * v[3]; // z - coordinate

		flight_geo[i][0] = 0;
		flight_geo[i][1] = degrees(Math.atan2(flight[i][2], flight[i][1])); // lon - coordinate
		flight_geo[i][2] = degrees(Math.asin(flight[i][3])); // lat - coordinate

		route += flight_geo[i][1] + ';' + flight_geo[i][2] + '; 0 ' + ';';
	}
	return route;
}
