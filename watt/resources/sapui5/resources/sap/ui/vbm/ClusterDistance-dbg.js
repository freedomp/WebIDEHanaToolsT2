/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterDistance.
sap.ui.define([
	'./ClusterBase', './library'
], function(ClusterBase, library) {
	"use strict";

	/**
	 * Constructor for a new ClusterDistance.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Cluster definition element for grid based clusters. Visual objects are clustered based on a grid. It is possible to have multiple grid
	 *        based clusters. The visualization object is placed in the center of the grid cell plus a given offset.
	 * @extends sap.ui.vbm.ClusterBase
	 * @experimental Since 1.32.0 this element is experimental and might be modified or removed in future versions.
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterDistance
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterDistance = ClusterBase.extend("sap.ui.vbm.ClusterDistance", /** @lends sap.ui.vbm.ClusterDistance.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Distance in pixels between cluster objects. This distance as parameter during the clustering. The visualization objects are placed
				 * in center of gravity of the covered objects. Thus the actual distance between them may vary.
				 */
				distance: {
					type: "int",
					group: "Behaviour",
					defaultValue: "128"
				}

			},
			aggregations: {},
			events: {}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	// sap.ui.vbm.ClusterDistance.prototype.init = function(){
	// // do something for initialization...
	// };

	// ...........................................................................//
	// model creators............................................................//
	ClusterDistance.prototype.getClusterDefinition = function() {
		var oDefinition = ClusterBase.prototype.getClusterDefinition.apply(this, arguments);

		oDefinition.type = "distance";

		oDefinition.distance = this.getDistance().toString();
		return oDefinition;
	};

	return ClusterDistance;

});
