/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/**
 * Initialization Code and shared classes of library sap.ui.vbm.
 */
sap.ui.define([
	'sap/ui/unified/library', 'sap/ui/commons/library', 'sap/ui/core/Core', 'sap/ui/core/library'
], function(library3, library2, Core, library1) {
	"use strict";

	/**
	 * SAP UI library: sap.ui.vbm
	 * 
	 * @namespace
	 * @name sap.ui.vbm
	 * @author SAP SE
	 * @version 1.32.4
	 * @public
	 */

	// library dependencies
	// delegate further initialization of this library to the Core
	sap.ui.getCore().initLibrary({
		name: "sap.ui.vbm",
		dependencies: [
			// use of sap.ui.commons.RichTooltip ans sap.ui.unified.Menu
			"sap.ui.core", "sap.ui.commons", "sap.ui.unified"
		],
		types: [
			"sap.ui.vbm.ClusterInfoType", "sap.ui.vbm.SemanticType"
		],
		interfaces: [],
		controls: [
			"sap.ui.vbm.AnalyticMap", "sap.ui.vbm.GeoMap", "sap.ui.vbm.VBI", "sap.ui.vbm.Cluster"
		],
		elements: [
			"sap.ui.vbm.Area", "sap.ui.vbm.Areas", "sap.ui.vbm.Box", "sap.ui.vbm.Boxes", "sap.ui.vbm.Circle", "sap.ui.vbm.Circles", "sap.ui.vbm.Container", "sap.ui.vbm.Containers", "sap.ui.vbm.DragSource", "sap.ui.vbm.DropTarget", "sap.ui.vbm.Feature", "sap.ui.vbm.FeatureCollection", "sap.ui.vbm.GeoCircle", "sap.ui.vbm.GeoCircles", "sap.ui.vbm.Legend", "sap.ui.vbm.LegendItem", "sap.ui.vbm.Pie", "sap.ui.vbm.PieItem", "sap.ui.vbm.Pies", "sap.ui.vbm.Region", "sap.ui.vbm.Resource", "sap.ui.vbm.Route", "sap.ui.vbm.Routes", "sap.ui.vbm.Spot", "sap.ui.vbm.Spots", "sap.ui.vbm.VoAggregation", "sap.ui.vbm.VoBase", "sap.ui.vbm.ClusterBase", "sap.ui.vbm.ClusterTree", "sap.ui.vbm.ClusterGrid", "sap.ui.vbm.ClusterDistance"
		],
		noLibraryCSS: false,
		version: "1.32.4"
	});

	/**
	 * Semantic type with pre-defined display properties, like colors, icon, pin image, and so on. Semantic types enforce to fiori guidelines.
	 * 
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.vbm.SemanticType = {

		/**
		 * Type indicating no state
		 * 
		 * @public
		 */
		None: "None",

		/**
		 * Type indicating an Error state
		 * 
		 * @public
		 */
		Error: "Error",

		/**
		 * Type indicating a Warning state
		 * 
		 * @public
		 */
		Warning: "Warning",

		/**
		 * Type indicating a Success/Positive state
		 * 
		 * @public
		 */
		Success: "Success",

		/**
		 * Type indicating the Default state
		 * 
		 * @public
		 */
		Default: "Default",

		/**
		 * Type indicating an Inactive state
		 * 
		 * @public
		 */
		Inactive: "Inactive"

	};

	/**
	 * Cluster Info Type
	 * 
	 * @enum {int}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.vbm.ClusterInfoType = {

		/**
		 * Type indicating that Cluster Info should return only VOs covered by the Cluster object
		 * 
		 * @public
		 */
		ContainedVOs: 0,

		/**
		 * Type indicating that Cluster Info should return info on child cluster nodes (next LOD). This is only supported for tree clustering.
		 * 
		 * @public
		 */
		ChildCluster: 1,

		/**
		 * Type indicating that Cluster Info should return info on parent cluster node (previous LOD). This is only supported for tree clustering.
		 * 
		 * @public
		 */
		ParentNode: 2,

		/**
		 * Type indicating that Cluster Info should return info on cluster node itself.
		 * 
		 * @public
		 */
		NodeInfo: 10,

		/**
		 * Type indicating that Cluster Info should return info on Edges of the Voronoi Area for the cluster. This is only supported for tree
		 * clustering. Edges not merged with rectangles.
		 * 
		 * @public
		 */
		Edges: 11

	};

	/**
	 * Route type, determining how line between start and endpoint should be drawn.
	 * 
	 * @enum {string}
	 * @public
	 * @ui5-metamodel This enumeration also will be described in the UI5 (legacy) designtime metamodel
	 */
	sap.ui.vbm.RouteType = {

		/**
		 * Type indicating a straight connection
		 * 
		 * @public
		 */
		Straight: "Straight",

		/**
		 * Type indicating a geodesic connection
		 * 
		 * @public
		 */
		Geodesic: "Geodesic"

	};

	return sap.ui.vbm;

}, /* bExport= */false);
