/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.ClusterBase.
sap.ui.define([
	'sap/ui/core/Element', './library'
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new ClusterBase.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abtract base class for Clustering types. This element implements the common part for all specific Cluster elements. It must not be used
	 *        directly, but is the base for further extension.<br>
	 *        There are two optional aggregations: <code>vizTemplate</code> and <code>vizVO</code> determining how cluster objects should be
	 *        visualized. Only the one or the other should be provided.
	 * @experimental Since 1.32.0 this element is experimental and might be modified or removed in future versions.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.ClusterBase
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ClusterBase = Element.extend("sap.ui.vbm.ClusterBase", /** @lends sap.ui.vbm.ClusterBase.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Flag controlling the visibility of the area convered by a cluster object.
				 */
				areaAlwaysVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: "false"
				},

				/**
				 * Fill color for the area covered by a cluster object
				 */
				areaColor: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(200,0,0,0.2)"
				},

				/**
				 * Border color for the area covered by a cluster object
				 */
				areaColorBorder: {
					type: "sap.ui.core.CSSColor",
					group: "Appearance",
					defaultValue: "rgba(220,220,220,0.5)"
				},

				/**
				 * Name of property of the visualization control receiving the number of clustered objects.
				 */
				textProperty: {
					type: "string",
					group: "Misc",
					defaultValue: "text"
				},

				/**
				 * Clustering rule, describing which visual objects should be considered for clustering
				 */
				rule: {
					type: "string",
					group: "Misc",
					defaultValue: null
				}
			},
			defaultAggregation: "vizTemplate",
			aggregations: {

				/**
				 * Optional: Instance of a control, which is used as template for visualizing cluster objects. This is the prefered choise.
				 */
				vizTemplate: {
					type: "sap.ui.core.Control",
					multiple: false
				},

				/**
				 * Optional: Instance of a spot, which is used as template for visualizing cluster objects
				 */
				vizVO: {
					type: "sap.ui.vbm.Spot",
					multiple: false
				}
			},
			events: {}
		}
	});

	/**
	 * This file defines behavior for the control,
	 */
	sap.ui.vbm.ClusterBase.prototype.init = function() {
		// do something for initialization...
		this.mVizObjMap = {};
	};

	// ...........................................................................//
	// model creators............................................................//

	// A cluster needs a reference VO for rendering. Thus we return a container object as ref VO.
	ClusterBase.prototype.getTemplateObject = function() {
		var oTemplate = {};

		// Ref VO id is given in handleOpenWindow event and must match cluster id for event dispatching
		var sId = this.getId();

		if (this.getVizTemplate()) {
			// vizTemplate given -> use a container VO as reference
			oTemplate = {
				id: sId,
				type: "{00100000-2012-0004-B001-2297943F0CE6}",
				datasource: sId
			};
		} else if (this.getVizVO()) {
			// Spot given
			this.oSpotAggr = new sap.ui.vbm.Spots(sId, {
				items: {
					path: "/",
					template: this.getVizVO().clone()
				}
			});
			oTemplate = this.oSpotAggr.getTemplateObject();
		} else {
			// nothing given
			jQuery.sap.log.error("No visualization object given for cluster");
		}
		return oTemplate;
	};

	// Any VO needs an associated DataType
	ClusterBase.prototype.getTypeObject = function() {
		var oDataType = {};

		if (this.getVizTemplate()) {
			// vizTemplate given -> use a container VO as reference
			oDataType = {
				name: this.getId(),
				key: "K",
				A: [
					{
						name: "K",
						alias: "K",
						type: "string"
					}
				]
			};
		} else if (this.getVizVO()) {
			// Spot given
			oDataType = this.oSpotAggr.getTypeObject();
		} else {
			// nothing given
			jQuery.sap.log.error("No visualization object given for cluster");
		}
		return oDataType;
	};

	ClusterBase.prototype.getClusterDefinition = function() {
		return {
			id: this.getId(),
			VO: this.getId(),
			rule: this.getRule(),
			areapermanent: this.getAreaAlwaysVisible().toString(),
			areabordersize: "2",
			areafillcol: this.getAreaColor(),
			areabordercol: this.getAreaColorBorder()
		};
	};

	// ...........................................................................//
	// Internal API functions.....................................................//

	ClusterBase.prototype.handleOpenWindow = function(event) {
		// get the control
		var sClusterId = event.mParameters.id;
		var oItem = this._getVizObjInst(sClusterId);
		if (oItem) {
			// read cluster info data for given Id
			var oNodeInfo = this.getParent().getInfoForCluster(sClusterId, sap.ui.vbm.ClusterInfoType.NodeInfo);
			oItem.setProperty(this.getTextProperty(), oNodeInfo.cnt.toString());

			// determine the id of the div to place the control
			var divId = event.getParameter("contentarea").id;

			// propagate all models - even the named ones!
			var oTemplate = this.getVizTemplate();
			this._propagateModels(oTemplate, oItem);
			oItem.placeAt(divId, "only");
			oItem.setBindingContext(oTemplate.getBindingContext());
		}
	};

	ClusterBase.prototype.handleCloseWindow = function(event) {
		// remove assoviate control instance
		delete this.mVizObjMap[event.mParameters.id];
	};

	// ...........................................................................//
	// private helper functions...................................................//

	ClusterBase.prototype._getVizObjInst = function(key) {
		var oResult = this.mVizObjMap[key];
		if (!oResult) {
			// no instance found for given key -> create it
			oResult = this.mVizObjMap[key] = this.getVizTemplate().clone();
		}

		return oResult;
	};

	/**
	 * For internal use only!
	 * 
	 * @param {sap.ui.core.Element} oSource Source element
	 * @param {sap.ui.core.Element} oTarget Target element
	 * @returns {void}
	 * @private
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	ClusterBase.prototype._propagateModels = function(oSource, oTarget) {
		var sName = "";
		for (sName in oSource.oPropagatedProperties.oModels) {
			if (sName === "undefined") {
				oTarget.setModel(oSource.oPropagatedProperties.oModels[sName]);
			} else {
				oTarget.setModel(oSource.oPropagatedProperties.oModels[sName], sName);
			}
		}
		for (sName in oSource.oModels) {
			if (sName === "undefined") {
				oTarget.setModel(oSource.oModels[sName]);
			} else {
				oTarget.setModel(oSource.oModels[sName], sName);
			}
		}
	};

	return ClusterBase;

});
