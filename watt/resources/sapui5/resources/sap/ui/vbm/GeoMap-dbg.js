/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.GeoMap.
sap.ui.define([
	'./VBI', './library'
], function(VBI, library) {
	"use strict";

	/**
	 * Constructor for a new GeoMap.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Map control with the option to position multiple visual objects on top of a map. The GeoMap control shows an image based map loaded from
	 *        one or more configurable external providers. Per default a map from <a href="http://www.mapquest.com">MapQuest</a> is used. Other map
	 *        providers can be configured via property <i>mapConfiguration</i>. Multiple maps can be mashed up into one map layer stack. If multiple
	 *        map layer stacks are provided via configuration it is possible to switch between them during runtime. The control supports the display
	 *        of copyright information for the visible maps.<br>
	 *        On top of the map the GeoMap control provides a navigation control, a scale, and a legend. Each of them can be switched off separately.<br>
	 *        It is possible to set the initial position and zoom for the map display. Further the control allows to restrict the potentially visible
	 *        map area and zoom range.<br>
	 *        Different visual objects can be placed on the map. Visual objects are grouped in VO aggregations and an arbitrary number of VO
	 *        aggregations can be assigned to the <i>vos</i> aggregation.<br>
	 *        The second aggregation <i>featureCollections</i> allows the use of GeoJSON as source for visual objects.
	 * @extends sap.ui.vbm.VBI
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.GeoMap
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var GeoMap = VBI.extend("sap.ui.vbm.GeoMap", /** @lends sap.ui.vbm.GeoMap.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * This is the map configuration for the geo map. The map configuration defines the used maps, the layering of the maps and the
				 * servers that can be used to request the map tiles.
				 */
				mapConfiguration: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Toggles the visibility of the legend
				 */
				legendVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Defines the visibility of the scale. Only supported on initialization!
				 */
				scaleVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Defines the visibility of the navigation control. Only supported on initialization!
				 */
				navcontrolVisible: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Initial position of the Map. Only supported on initialization! Format is "&lt;longitude&gt;;&lt;latitude&gt;;0".
				 */
				initialPosition: {
					type: "string",
					group: "Behavior",
					defaultValue: '0;0;0'
				},

				/**
				 * Initial zoom. Value needs to be positive whole number. Only supported on initialization!
				 */
				initialZoom: {
					type: "string",
					group: "Behavior",
					defaultValue: '2'
				},

				/**
				 * Name of the map layer stack (provided in mapConfiguration) which is used for map rendering. If not set the layer stack with the
				 * name 'Default' is chosen. Property can be changed at runtime to switch between map layer stack.
				 */
				refMapLayerStack: {
					type: "string",
					group: "Appearance",
					defaultValue: 'Default'
				},

				/**
				 * Visual Frame object. Defining a frame {minX, maxX, minY, maxY, maxLOD, minLOD} to which the scene display is restricted.
				 */
				visualFrame: {
					type: "object",
					group: "Behavior",
					defaultValue: null
				},

				/**
				 * @deprecated This property should not longer be used. Its functionality is going to be replaced by the <code>clusters</code>
				 *             aggregation.
				 */
				clustering: {
					type: "object",
					group: "Behavior",
					defaultValue: null
				}
			},
			defaultAggregation: "vos",
			aggregations: {

				/**
				 * Aggregation of visual object types. A VO aggregation can be considered to be a table of VOs of a common type.
				 */
				vos: {
					type: "sap.ui.vbm.VoAggregation",
					multiple: true,
					singularName: "vo"
				},

				/**
				 * Aggregation of GeoJSON Feature collections.
				 */
				featureCollections: {
					type: "sap.ui.vbm.FeatureCollection",
					multiple: true,
					singularName: "featureCollection"
				},

				/**
				 * Aggregation of resources. The images for e.g. Spots have to be provided as resources.
				 */
				resources: {
					type: "sap.ui.vbm.Resource",
					multiple: true,
					singularName: "resource"
				},

				/**
				 * Legend for the Map
				 */
				legend: {
					type: "sap.ui.vbm.Legend",
					multiple: false
				},

				/**
				 * Aggregation of clusters.
				 * 
				 * @experimental Since 1.32.0 this method is experimental and might be modified or removed in future versions.
				 */
				clusters: {
					type: "sap.ui.vbm.ClusterBase",
					multiple: true,
					singularName: "cluster"
				}
			},
			events: {

				/**
				 * Raised when the map is clicked.
				 */
				click: {
					parameters: {

						/**
						 * Geo coordinates in format "&lt;longitude&gt;;&lt;latitude&gt;;0"
						 */
						pos: {
							type: "string"
						}
					}
				},

				/**
				 * Raised when the map is right clicked/longPressed(tap and hold).
				 */
				contextMenu: {
					parameters: {

						/**
						 * Client coordinate X
						 */
						clientX: {
							type: "int"
						},

						/**
						 * Client coordinate Y
						 */
						clientY: {
							type: "int"
						},

						/**
						 * Geo coordinates in format "&lt;longitude&gt;;&lt;latitude&gt;;0"
						 */
						pos: {
							type: "string"
						}
					}
				},

				/**
				 * Raised when something is dropped on the map.
				 */
				drop: {
					parameters: {

						/**
						 * Geo coordinates in format "&lt;longitude&gt;;&lt;latitude&gt;;0"
						 */
						pos: {
							type: "string"
						}
					}
				},

				/**
				 * This event is raised when a multi selection of visual objects has occurred
				 */
				select: {},

				/**
				 * this event is raised on zoom in or zoom out.
				 */
				zoomChanged: {
					parameters: {

						/**
						 * Center point of the map. Format : Lon;Lat;0.0.
						 */
						centerPoint: {
							type: "string"
						},

						/**
						 * Viewport bounding box's upperLeft and lowerRight coordinates. Format : Lon;Lat;0.0.
						 */
						viewportBB: {
							type: "object"
						},

						/**
						 * Level of detail.
						 */
						zoomLevel: {
							type: "int"
						}
					}
				},

				/**
				 * this event is raised on map move.
				 */
				centerChanged: {
					parameters: {

						/**
						 * Center point of the map. Format : Lon;Lat;0.0.
						 */
						centerPoint: {
							type: "string"
						},

						/**
						 * Viewport bounding box's upperLeft and lowerRight coordinates. Format : Lon;Lat;0.0.
						 */
						viewportBB: {
							type: "object"
						},

						/**
						 * Level of detail.
						 */
						zoomLevel: {
							type: "int"
						}
					}
				}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */

	// Author: Ulrich Roegelein

	// sap.ui.vbm.GeoMap.prototype.init = function(){
	// // do something for initialization...
	// };

	GeoMap.DefaultApplicationURL = "media/geomap/geomap.json";

	// ...........................................................................//
	// This section defines behavior for the control,............................//
	// ...........................................................................//

	GeoMap.prototype.exit = function() {
		VBI.prototype.exit.apply(this, arguments);

		// detach the event.......................................................//
		this.detachEvent('submit', GeoMap.prototype.onGeoMapSubmit, this);
		this.detachEvent('openWindow', GeoMap.prototype.onGeoMapOpenWindow, this);
		this.detachEvent('closeWindow', GeoMap.prototype.onGeoMapCloseWindow, this);
	};

	// ...........................................................................//
	// track modifications on resources..........................................//

	GeoMap.prototype.destroyResources = function() {
		this.m_bResourcesDirty = true;
		return this.destroyAggregation("resources");
	};

	GeoMap.prototype.addResource = function(o) {
		this.m_bResourcesDirty = true;
		return this.addAggregation("resources", o);
	};

	GeoMap.prototype.insertResource = function(o, index) {
		this.m_bResourcesDirty = true;
		return this.insertAggregation("resources", o, index);
	};

	GeoMap.prototype.removeResource = function(o) {
		this.m_bResourcesDirty = true;
		return this.removeAggregation("resources", o);
	};

	GeoMap.prototype.removeAllResources = function(o) {
		this.m_bResourcesDirty = true;
		return this.removeAllAggregation("resources");
	};

	// ...........................................................................//
	// track modifications on vos................................................//

	GeoMap.prototype.destroyVos = function() {
		this.m_bVosDirty = true;
		return this.destroyAggregation("vos");
	};

	GeoMap.prototype.addVo = function(o) {
		this.m_bVosDirty = true;
		return this.addAggregation("vos", o);
	};

	GeoMap.prototype.insertVo = function(o, index) {
		this.m_bVosDirty = true;
		return this.insertAggregation("vos", o, index);
	};

	GeoMap.prototype.removeVo = function(o) {
		this.m_bVosDirty = true;
		return this.removeAggregation("vos", o);
	};

	GeoMap.prototype.removeAllVos = function(o) {
		this.m_bVosDirty = true;
		return this.removeAllAggregation("vos");
	};

	// ...........................................................................//
	// track modifications on featureCollections.................................//

	GeoMap.prototype.destroyFeatureCollections = function() {
		this.m_bFCsDirty = true;
		return this.destroyAggregation("featureCollections");
	};

	GeoMap.prototype.addFeatureCollection = function(o) {
		this.m_bFCsDirty = true;
		return this.addAggregation("featureCollections", o);
	};

	GeoMap.prototype.insertFeatureCollection = function(o, index) {
		this.m_bFCsDirty = true;
		return this.insertAggregation("featureCollections", o, index);
	};

	GeoMap.prototype.removeFeatureCollection = function(o) {
		this.m_bFCsDirty = true;
		return this.removeAggregation("featureCollections", o);
	};

	GeoMap.prototype.removeAllFeatureCollections = function(o) {
		this.m_bFCsDirty = true;
		return this.removeAllAggregation("featureCollections");
	};

	// ...........................................................................//
	// track modifications on clusters............................................//

	GeoMap.prototype.destroyClusters = function() {
		this.bClustersDirty = true;
		return this.destroyAggregation("clusters");
	};

	GeoMap.prototype.addCluster = function(o) {
		this.bClustersDirty = true;
		return this.addAggregation("clusters", o);
	};

	GeoMap.prototype.insertCluster = function(o, index) {
		this.bClustersDirty = true;
		return this.insertAggregation("clusters", o, index);
	};

	GeoMap.prototype.removeCluster = function(o) {
		this.bClustersDirty = true;
		return this.removeAggregation("clusters", o);
	};

	GeoMap.prototype.removeAllClusters = function(o) {
		this.bClustersDirty = true;
		return this.removeAllAggregation("clusters");
	};

	// ...........................................................................//
	// track modifications on mapConfiguration...................................//

	/**
	 * Set Map configuration data. Map Configurations contain a set of Map Providers and Map Layer Stacks refering to those providers. The GeoMap
	 * property refMapLayerStack defines, which Map Layer Stack becomes visible.
	 * 
	 * @param {object} oMapConfiguration Map Configuration object
	 * @param {array} oMapConfiguration.MapProvider Array of Map Provider definitions.
	 * @param {string} oMapConfiguration.MapProvider.name Name for the provider. Needed in Map Layer Stack as reference.
	 * @param {string} oMapConfiguration.MapProvider.tileX X-pixel dimension of map tile. Typical 256.
	 * @param {string} oMapConfiguration.MapProvider.tileY Y-pixel dimension of map tile. Typical 256.
	 * @param {string} oMapConfiguration.MapProvider.minLOD Minimal supported Level Of Detail.
	 * @param {string} oMapConfiguration.MapProvider.maxLOD Maximal supported Level Of Detail.
	 * @param {string} oMapConfiguration.MapProvider.copyright Copyright Information to be shown with the map.
	 * @param {array} oMapConfiguration.MapProvider.Source Array of source definitions. At least on Source has to be given. Multiple sources can be
	 *        used for load distribution.
	 * @param {string} oMapConfiguration.MapProvider.Source.id Source id.
	 * @param {string} oMapConfiguration.MapProvider.Source.url Source URL for map tile service. URL includes place holders for variable informations
	 *        set at runtime, e.g. {LOD}.
	 * @param {array} oMapConfiguration.MapLayerStacks Array of Map Layer Stacks
	 * @param {string} oMapConfiguration.MapLayerStacks.name Name of Map Layer Stack. Use with the GeoMap refMapLayerStack property.
	 * @param {array} oMapConfiguration.MapLayerStacks.MapLayer Array of Map Layers. Each Layer refers to a Map Proveride. Map Layers get overlayed in
	 *        the given sequence.
	 * @param {string} oMapConfiguration.MapLayerStacks.MapLayer.name Name of Map Layer.
	 * @param {string} oMapConfiguration.MapLayerStacks.MapLayer.refMapProvider Name of referenced Map Provider.
	 * @param {string} oMapConfiguration.MapLayerStacks.MapLayer.opacity Opacity of Map Layer. Value range 0 to 1.
	 * @param {sap.ui.core.CSSColor} oMapConfiguration.MapLayerStacks.MapLayer.colBkgnd Background color for Map Layer. Only meaningful if opacity is
	 *        below 1.
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */

	GeoMap.prototype.setMapConfiguration = function(o) {
		this.m_bMapConfigurationDirty = true;
		this.setProperty("mapConfiguration", o);
		return this;
	};

	/**
	 * Set clustering definitions.
	 * 
	 * @param {object} oClustering Cluster Definition object
	 * @param {array} oClustering.Cluster Array of Cluster Object
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @deprecated This property should not longer be used. Its functionality is going to be replaced by the <code>clusters</code> aggregation.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setClustering = function(oClustering) {
		this.m_bClusteringDirty = true;
		this.setProperty("clustering", oClustering);
		return this;
	};

	GeoMap.prototype.setRefMapLayerStack = function(o) {
		if (o === this.getRefMapLayerStack()) {
			return this;
		}
		this.m_bRefMapLayerStackDirty = this.m_bSceneDirty = true;
		this.setProperty("refMapLayerStack", o);
		return this;
	};

	/**
	 * Set Visual Frame definition.
	 * 
	 * @param {object} oVisFrame Visual Frame definition object
	 * @param {float} oVisFrame.minLon Minimal longitude of visual frame
	 * @param {float} oVisFrame.maxLon Maximal longitude of visual frame
	 * @param {float} oVisFrame.minLat Minimal latitude of visual frame
	 * @param {float} oVisFrame.maxLat Maximal latitude of visual frame
	 * @param {float} oVisFrame.minLOD Minimal Level of Detail for visual frame
	 * @param {float} oVisFrame.maxLOD Maximal Level of Detail for visual frame
	 * @param {float} oVisFrame.maxFraction Maximal fraction [0..1] of minLOD which is acceptable, otherwise minLOD is rounded upwards
	 * @returns {sap.ui.vbm.GeoMap} This allows method chaining
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.setVisualFrame = function(oVisFrame) {
		this.m_bVisualFrameDirty = true;
		this.setProperty("visualFrame", oVisFrame);
		return this;
	};

	/**
	 * Trigger the interactive creation mode to get a position or position array.
	 * 
	 * @param {boolean} bPosArray Indicator if a single position or an array is requested
	 * @param {function} callback Callback function func( sPosArray ) to be called when done. Position(array) sPosArray is provided in format
	 *        "lon;lat;0;..."
	 * @returns {boolean} Indicator whether the creation mode could be triggered successfully or not.
	 * @public
	 * @experimental Since 1.30.0 This method is experimental and might be modified or removerd in future versions.
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.getPositionInteractive = function(bPosArray, callback) {
		if (!this.mIACreateCB && callback && typeof (callback) === "function") {
			this.mIACreateCB = callback;

			var sType = "POS";
			if (bPosArray) {
				sType += "ARRAY";
			}
			// trigger interactive creation mode by defining an automation call
			var oLoad = {
				"SAPVB": {
					"Automation": {
						"Call": {
							"handler": "OBJECTCREATIONHANDLER",
							"name": "CreateObject",
							"object": "MainScene",
							"scene": "MainScene",
							"instance": "",
							"Param": {
								"name": "data",
								"#": "{" + sType + "}"
							}
						}
					}
				}
			};
			this.load(oLoad);
			return true;
		} else {
			// callback function registered -> other create still pending!
			return false;
		}
	};

	/**
	 * Open Detail window
	 * 
	 * @param {string} sPosition Postion for the Detail Window in format "lon;lat;0"
	 * @param {object} [oParams] Parameter Objects
	 * @param {string} [oParams.caption] Caption of the Detail Window
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.openDetailWindow = function(sPosition, oParams) {
		// set detail window context. The actual opening happens in getWindowsObject()

		this.mDTWindowCxt.key = "";
		this.mDTWindowCxt.open = true;
		this.mDTWindowCxt.bUseClickPos = true;
		this.mDTWindowCxt.params = oParams ? oParams : null;
		this.mDTWindowCxt.src = {
			mClickGeoPos: sPosition
		};
		this.invalidate(this);
		this.m_bWindowsDirty = true;
	};

	/**
	 * Close any open Detail window
	 * 
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	GeoMap.prototype.closeAnyDetailWindow = function() {
		// set detail window open to false and invalide control -> actual closing is triggered in getWindowsObject()
		this.mDTWindowCxt.open = false;
		this.invalidate(this);
		this.m_bWindowsDirty = true;
	};

	// ..............................................................................................//
	// write selection property back to model and fire select event on aggregation ..................//
	GeoMap.prototype.setSelectionPropFireSelect = function(dat) {
		var aN = dat.N;
		for (var nJ = 0; nJ < aN.length; ++nJ) {
			var oAgg = aN[nJ];
			var aEl = oAgg.E;
			var cont;
			if ((cont = this.getAggregatorContainer(oAgg.name))) {

				var aChangedSel = [];
				var aChangedDesel = [];
				for (var nK = 0; nK < aEl.length; ++nK) {
					var oEl = aEl[nK];
					var aVO = cont.getItems();
					if (aVO) {
						for (var nL = 0, len = aVO.length; nL < len; ++nL) {
							if (aVO[nL].sId == oEl.K) {
								var bEleSel = (oEl["VB:s"] == "true" ? true : false);
								var bModelSel = aVO[nL].getSelect();
								if (bEleSel != bModelSel) {
									if (bEleSel) {
										// to be selected
										aVO[nL].setSelect(true); // set model selection property
										if (cont.mEventRegistry["select"]) {
											aChangedSel.push(aVO[nL]); // add element to array to fire the select on aggregation
										}
									} else {
										// to be deselected
										aVO[nL].setSelect(false); // set model selection property
										if (cont.mEventRegistry["deselect"]) {
											aChangedDesel.push(aVO[nL]); // add element to array to fire the deselect on aggregation
										}
									}
								}
							}
						}
					}
				}
				if (aChangedDesel.length) {
					cont.handleSelectEvent(false, aChangedDesel);
				}
				if (aChangedSel.length) {
					cont.handleSelectEvent(true, aChangedSel);
				}
			}
		}
	};

	// ...........................................................................//
	// central event handler.....................................................//

	GeoMap.prototype.onGeoMapSubmit = function(e) {
		// analyze the event......................................................//
		var datEvent = JSON.parse(e.mParameters.data);

		// write changed data back to aggregated elements
		if (datEvent.Data && datEvent.Data.Merge) {
			this.handleChangedData(datEvent.Data.Merge.N);
		}

		// get the container......................................................//
		// and delegate the event to the container first..........................//
		var cont;
		if ((cont = this.getAggregatorContainer(datEvent.Action.object))) {
			cont.handleEvent(datEvent);
			if (datEvent.Action.name == "click" && datEvent.Data && datEvent.Data.Merge) {
				this.setSelectionPropFireSelect(datEvent.Data.Merge); // set selection property on model and call select and deselect on Aggregation
			}
		} else {
			// ToDo: other events might be important later
			switch (datEvent.Action.name) {
				case "click":
					// fire the click..................................................//
					this.fireClick({
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]['#']
					});
					break;
				case "contextMenu":
					// fire the contextMenu..................................................//
					this.fireContextMenu({
						clientX: datEvent.Action.Params.Param[0]['#'],
						clientY: datEvent.Action.Params.Param[1]['#'],
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]['#']
					});
					break;
				case "drop":
					// fire the drop..................................................//
					this.fireDrop({
						pos: datEvent.Action.AddActionProperties.AddActionProperty[0]['#']
					});
					break;
				case "zoomChanged":
					// fire the zoomChanged..................................................//
					this.fireZoomChanged({
						zoomLevel: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						centerPoint: datEvent.Action.AddActionProperties.AddActionProperty[1]['#'],
						viewportBB: {
							upperLeft: datEvent.Action.Params.Param[3]['#'],
							lowerRight: datEvent.Action.Params.Param[4]['#']
						}
					});
					break;
				case "centerChanged":
					// fire the centerChanged..................................................//
					this.fireCenterChanged({
						zoomLevel: datEvent.Action.AddActionProperties.AddActionProperty[0]['#'],
						centerPoint: datEvent.Action.AddActionProperties.AddActionProperty[1]['#'],
						viewportBB: {
							upperLeft: datEvent.Action.Params.Param[3]['#'],
							lowerRight: datEvent.Action.Params.Param[4]['#']
						}
					});
					break;
				case "select":
					if (datEvent.Data && datEvent.Data.Merge.N) {
						var aSelected = this.getSelectedItems(datEvent.Data.Merge.N);
						// fire the select ...............................................//
						this.fireSelect({
							selected: aSelected
						});
						this.setSelectionPropFireSelect(datEvent.Data.Merge); // set selection property on model and call select and deselect on
						// Aggregation
					}
					break;
				case "GetPosComplete":
					// Interactive Position gathering finished
					if (this.mIACreateCB) {
						try {
							this.mIACreateCB(datEvent.Action.Params.Param[0]['#']);
							this.mIACreateCB = null;
						} catch (exc) {
							// clear callback function in any case
							this.mIACreateCB = null;
							throw exc;
						}
					}
					break;
				default:
					break;
			}
		}
	};

	GeoMap.prototype.onGeoMapOpenWindow = function(e) {
		// get the id of the div area where to place the control..................//
		var div = e.getParameter("contentarea");
		if (div.m_ID) {
			// get the container...................................................//
			// and delegate the event to the container first.......................//
			var cont;
			if ((cont = this.getAggregatorContainer(div.m_ID)) && cont.handleOpenWindow) {
				cont.handleOpenWindow(e);
			}
		}
	};

	GeoMap.prototype.onGeoMapCloseWindow = function(e) {
		// get the id of the div area where to place the control..................//
		var div = e.getParameter("contentarea");
		if (div.m_ID) {
			// get the container..................................................//
			// and delegate the event to the container first......................//
			var cont;
			if ((cont = this.getAggregatorContainer(div.m_ID)) && cont.handleCloseWindow) {
				cont.handleCloseWindow(e);
			}
		}
		if (this.mDTWindowCxt.open && e.getParameter("id") == "Detail") {
			// detail window gets closed
			this.mDTWindowCxt.open = false;
			this.mDTWindowCxt.src = null; // release VO
			this.m_bWindowsDirty = true;
		}
	};

	GeoMap.prototype.init = function() {
		// attach the event
		this.attachEvent('submit', GeoMap.prototype.onGeoMapSubmit, this);
		this.attachEvent('openWindow', GeoMap.prototype.onGeoMapOpenWindow, this);
		this.attachEvent('closeWindow', GeoMap.prototype.onGeoMapCloseWindow, this);

		// initially set dirty state for all elements............................//
		this.m_bVosDirty = true;
		this.m_bFCsDirty = true;
		this.bClustersDirty = true;
		this.m_bMapConfigurationDirty = true;
		this.m_bClusteringDirty = true;
		this.m_bVisualFrameDirty = true;
		this.m_bRefMapLayerStackDirty = true;
		this.m_bResourcesDirty = true;
		this.m_bMapProvidersDirty = true;
		this.m_bMapLayerStacksDirty = true;
		this.m_bWindowsDirty = true;
		this.m_bMapconfigDirty = true;
		this.m_bLegendDirty = true;
		this.m_bSceneDirty = true;

		this.mbForceDataUpdate = false;
		this.bDataDeltaUpdate = false;
		this.bHandleChangedDataActive = false;

		// Initialize Detail Window Context object
		this.mDTWindowCxt = {
			open: false,
			src: null,
			key: "",
			params: null
		};

		// call base class first
		VBI.prototype.init.apply(this, arguments);
	};

	// ...........................................................................//
	// common helper functions...................................................//

	GeoMap.prototype.getSelectedItems = function(data) {
		var cont, aContSel, aSel = [];
		if (!data) {
			return null;
		}
		if (jQuery.type(data) == 'object') {
			cont = this.getAggregatorContainer(data.name);
			aContSel = cont.findSelected(true, data.E);
			aSel = aSel.concat(aContSel);
		} else if (jQuery.type(data) == 'array') {
			for (var nJ = 0; nJ < data.length; ++nJ) {
				cont = this.getAggregatorContainer(data[nJ].name);
				aContSel = cont.findSelected(true, data[nJ].E);
				if (aContSel && aContSel.length) {
					aSel = aSel.concat(aContSel);
				}
			}
		}

		return aSel;

	};

	GeoMap.prototype.getWindowsObject = function() {
		// determine the windows object..........................................//
		// Main window -> needs always to be defined
		var oWindows = {
			"Set": [
				{
					"name": "Main",
					"Window": {
						"id": "Main",
						"caption": "MainWindow",
						"type": "geo",
						"refParent": "",
						"refScene": "MainScene",
						"modal": "true"
					}
				}
			],
			"Remove": []
		};

		// Legend window ........................................................//
		var oLegend = this.getLegend();
		if (oLegend) {
			var legendDiv;
			if ((legendDiv = this.getDomRef(oLegend.getId()))) {
				this.m_curLegendPos = {
					right: parseInt(legendDiv.style.right, 10),
					top: parseInt(legendDiv.style.top, 10)
				};
			}

			var oLegendWindows = oLegend.getTemplateObject();

			// concat the sets
			if (oLegendWindows.Set) {
				oWindows.Set = oWindows.Set.concat(oLegendWindows.Set);
			}
			// concat the removes
			if (oLegendWindows.Remove) {

				oWindows.Remove = oWindows.Remove.concat(oLegendWindows.Remove);

			}
		}

		// Detail window..........................................................//
		if (this.mDTWindowCxt.src) {
			// Make sure any detail window opened before is closed
			var oRemove, oDTWindows;

			oRemove = [
				{
					"name": "Detail"
				}
			];

			// Check if given source element is still valid
			if (this.mDTWindowCxt.key) {
				var oCurrentSourceInst = this.getChildByKey(this.mDTWindowCxt.src, this.mDTWindowCxt.key);
				if (!oCurrentSourceInst) {
					// related source object does not longer exist -> reset context
					this.mDTWindowCxt.open = false;
					this.mDTWindowCxt.src = null;
					this.mDTWindowCxt.key = "";
					this.mDTWindowCxt.params = null;
				} else {
					// Note: Instances are not stable related to keys -> update source instance to match instance for given key
					this.mDTWindowCxt.src = oCurrentSourceInst;
				}
			}
			if (this.mDTWindowCxt.open) {
				oDTWindows = {
					"Set": [
						{
							"name": "Detail",
							"Window": {
								"id": "Detail",
								"type": "callout",
								"refParent": "Main",
								"refScene": "",
								"modal": "true",
								"caption": this.mDTWindowCxt.params.caption ? this.mDTWindowCxt.params.caption : "",
								"offsetX": this.mDTWindowCxt.params.offsetX ? this.mDTWindowCxt.params.offsetX : "0",
								"offsetY": this.mDTWindowCxt.params.offsetY ? this.mDTWindowCxt.params.offsetY : "0"
							}
						}
					]
				};
				// set window position
				if (this.mDTWindowCxt.bUseClickPos == true && this.mDTWindowCxt.src.mClickGeoPos) {
					oDTWindows.Set[0].Window.pos = this.mDTWindowCxt.src.mClickGeoPos;
				} else {
					oDTWindows.Set[0].Window['pos.bind'] = this.mDTWindowCxt.src.getParent().sId + "." + this.mDTWindowCxt.src.sId + ".P";
				}

				// Add detail window to the list of windows
				oWindows.Set = oWindows.Set.concat(oDTWindows.Set);
			}

			oWindows.Remove = oWindows.Remove.concat(oRemove);
		}

		return oWindows;
	};

	GeoMap.prototype.getActionArray = function() {
		var aActions = [];
		// subscribe for map event
		// Note: We register Action only if event are subscribed..............................//
		if (this.mEventRegistry["click"]) {
			aActions.push({
				"id": "GMap1",
				"name": "click",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "Click",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["contextMenu"]) {
			aActions.push({
				"id": "GMap2",
				"name": "contextMenu",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "ContextMenu",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["drop"]) {
			aActions.push({
				"id": "GMap3",
				"name": "drop",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "Drop",
				"AddActionProperty": [
					{
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["submit"]) {
			aActions.push({
				"id": "GMap4",
				"name": "zoomChanged",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "ZoomChanged",
				"AddActionProperty": [
					{
						"name": "zoom"
					}, {
						"name": "centerpoint"
					}, {
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["submit"]) {
			aActions.push({
				"id": "GMap5",
				"name": "centerChanged",
				"refScene": "MainScene",
				"refVO": "Map",
				"refEvent": "CenterChanged",
				"AddActionProperty": [
					{
						"name": "zoom"
					}, {
						"name": "centerpoint"
					}, {
						"name": "pos"
					}
				]
			});
		}
		if (this.mEventRegistry["submit"]) {
			aActions.push({
				"id": "GMap6",
				"name": "select",
				"refScene": "MainScene",
				"refVO": "General",
				"refEvent": "Select"
			});
		}
		aActions.push({
			"id": "GMap7",
			"name": "GetPosComplete",
			"refScene": "MainScene",
			"refVO": "General",
			"refEvent": "CreateComplete"
		});

		return aActions;
	};

	GeoMap.prototype.getSceneVOdelta = function(oCurrent, oNew) {
		var aVO = [];
		var aRemove = [];
		// build map of current VOs
		var oVOMap = {};
		for (var nI = 0, len = oCurrent.length; nI < len; ++nI) {
			oVOMap[oCurrent[nI].id] = oCurrent[nI];
		}
		for (var nJ = 0; nJ < oNew.length; ++nJ) {
			if (oVOMap[oNew[nJ].id]) { // VO already exists ...
				if (JSON.stringify(oNew[nJ]) != JSON.stringify(oVOMap[oNew[nJ].id])) { // ... but is different
					aRemove.push({
						"id": oNew[nJ].id,
						"type": "VO"
					}); // remove old VO version from scene and
					aVO.push(oNew[nJ]); // add new VO version
					// window.VBI.m_bTrace && window.VBI.Trace( "Scene update VO " + oNew[nI].id );
				} // else {} // nothing to do

			} else { // new VO -> add it
				aVO.push(oNew[nJ]);
				// window.VBI.m_bTrace && window.VBI.Trace( "Scene add VO " + oNew[nI].id );
			}
			delete oVOMap[oNew[nJ].id]; // remove processed VOs from map
		}
		// remove VOs remaining on map
		for ( var id in oVOMap) {
			aRemove.push({
				"id": id,
				"type": "VO"
			});
			// window.VBI.m_bTrace && window.VBI.Trace( "Scene remove VO " + id );
		}
		var retVal = {
			"Merge": {
				"name": "MainScene",
				"type": "SceneGeo",
				"SceneGeo": {
					"id": "MainScene",
					"refMapLayerStack": this.getRefMapLayerStack()
				}
			}
		};
		if (aRemove.length) {
			retVal.Merge.SceneGeo.Remove = aRemove;
		}
		if (aVO.length) {
			retVal.Merge.SceneGeo.VO = aVO;
		}

		return retVal;
	};

	// ...........................................................................//
	// diagnostics...............................................................//

	GeoMap.prototype.minimizeApp = function(oApp) {
		// todo: calculate a hash instead of caching the json string..............//

		// remove windows section when not necessary..............................//
		var t, s;
		s = null;
		if (!this.m_bWindowsDirty) {
			(t = oApp) && (t = t.SAPVB) && (t = t.Windows) && (s = JSON.stringify(t)) && (s == this.m_curWindows) && (delete oApp.SAPVB.Windows) || (this.m_curWindows = s ? s : this.m_curWindows);
		} else {
			this.m_bWindowsDirty = false;
		}

		// remove unmodified scenes...............................................//
		s = null;
		(t = oApp) && (t = t.SAPVB) && (t = t.Scenes) && (s = JSON.stringify(t)) && (s == this.m_curScenes) && (delete oApp.SAPVB.Scenes) || (this.m_curScenes = s ? s : this.m_curScenes);

		// remove unmodified actions..............................................//
		s = null;
		(t = oApp) && (t = t.SAPVB) && (t = t.Actions) && (s = JSON.stringify(t)) && (s == this.m_curActions) && (delete oApp.SAPVB.Actions) || (this.m_curActions = s ? s : this.m_curActions);

		// remove unmodified datatypes............................................//
		s = null;
		(t = oApp) && (t = t.SAPVB) && (t = t.DataTypes) && (s = JSON.stringify(t)) && (s == this.m_curDataTypes) && (delete oApp.SAPVB.DataTypes) || (this.m_curDataTypes = s ? s : this.m_curDataTypes);

		// remove unmodified data.................................................//
		if (!this.mbForceDataUpdate) {
			s = null;
			(t = oApp) && (t = t.SAPVB) && (t = t.Data) && (s = JSON.stringify(t)) && (s == this.m_curData) && (delete oApp.SAPVB.Data) || (this.m_curData = s ? s : this.m_curData);
		} else {
			this.mbForceDataUpdate = false; // reset
		}

		return oApp;
	};

	// ...........................................................................//
	// helper functions..........................................................//

	GeoMap.prototype.getAggregatorContainer = function(id) {
		// find the right aggregation instance to delegate the event..............//
		var aCluster = this.getClusters();
		for (var nL = 0; nL < aCluster.length; ++nL) {
			if (aCluster[nL].sId === id) {
				return aCluster[nL];
			}
		}
		var aVO = this.getVos();
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			if (aVO[nJ].sId === id) {
				return aVO[nJ];
			}
		}
		var aFC = this.getFeatureCollections();
		for (var nK = 0; nK < aFC.length; ++nK) {
			if (aFC[nK].sId === id) {
				return aFC[nK];
			}
		}
		var legend = this.getLegend();
		if (legend && legend.sId == id) {
			return legend;
		}
		return null;
	};

	GeoMap.prototype.update = function() {
		// get the frame application..............................................//
		var sPathApp = GeoMap.ApplicationURL ? GeoMap.ApplicationURL : sap.ui.resource("sap.ui.vbm", GeoMap.DefaultApplicationURL);
		var oJSON = jQuery.sap.syncGetJSON(sPathApp);
		var oApp = oJSON.data;

		// update the resource data...............................................//
		if (this.m_bResourcesDirty) {
			this.updateResourceData(oApp);
		}
		var oClusterRefVOs = {};
		if (this.m_bClusteringDirty || this.m_bClustersDirty) {
			this.updateClustering(oApp, oClusterRefVOs);
			this.mCurClusterRefVOs = jQuery.extend(true, {}, oClusterRefVOs); // deep copy!
		} else {
			oClusterRefVOs = jQuery.extend(true, {}, this.mCurClusterRefVOs); // deep copy!
		}
		// update the scene data.....................................................//
		if (this.m_bSceneDirty) {
			this.updateScene(oApp, oClusterRefVOs);
		}
		// new resources may have been added ( e.g. images for vo ) .................//
		if (this.m_bResourcesDirty) {
			this.updateResourceData(oApp);
		}
		if (this.m_bMapConfigurationDirty) {
			this.updateMapConfiguration(oApp);
		}

		this.updateMapProviders(oApp);
		this.updateMapLayerStacks(oApp);
		this.updateWindows(oApp);

		// add non VO related actions
		// legend events
		var legend;
		if ((legend = this.getLegend())) {
			if (oApp.SAPVB.Actions) {
				Array.prototype.push.apply(oApp.SAPVB.Actions.Set.Action, legend.getActionArray());
			}
// } else {
// var saAction = [];
// Array.prototype.push.apply( saAction, legend.getActionArray() );
// ((oApp.SAPVB.Actions = {}).Set = {}).Action = saAction;
		}

		if (oApp.SAPVB.Actions) {
			Array.prototype.push.apply(oApp.SAPVB.Actions.Set.Action, this.getActionArray());
		}

		// remove unnecessary sections and return application JSON...................//
		return this.minimizeApp(oApp);
	};

	GeoMap.prototype.updateMapProviders = function(oApp) {
		if (!this.m_bMapProvidersDirty) {
			delete oApp.SAPVB.MapProviders; // remove MapProviders from app
		}
		this.m_bMapProvidersDirty = false;
	};

	GeoMap.prototype.updateMapLayerStacks = function(oApp) {
		if (!this.m_bMapLayerStacksDirty) {
			delete oApp.SAPVB.MapLayerStacks; // remove MapLayerStacks from app
		}
		this.m_bMapLayerStacksDirty = false;
	};

	GeoMap.prototype.updateWindows = function(oApp) {
		oApp.SAPVB.Windows = this.getWindowsObject();
	};

	GeoMap.prototype.updateScene = function(oApp, oClusterRefVOs) {
		var saVO = (oClusterRefVOs.VO) ? oClusterRefVOs.VO : []; // visual object array in the scene..................//
		var saData = []; // data array in the data section....................//
		var saType = (oClusterRefVOs.DataType) ? oClusterRefVOs.DataType : []; // type array in the type section ...................//
		var saAction = []; // actions...........................................//

		// Insert Feature Collection before VOs to get them rendered behind the VOs
		this.updateFCData(saVO, saData, saType, saAction);
		this.updateVOData(saVO, saData, saType, saAction);

		if (this.m_bLegendDirty) {
			// process legend.........................................................//
			var oLegend = this.getLegend();
			if (oLegend) {
				saData.push(oLegend.getDataObject());
				saType.push(oLegend.getTypeObject());
			}
		}

		// check if an update of the scene is necessary...........................//
		// failsafe but data has to be created first..............................//
		var _saVO = JSON.stringify(saVO);
		var bMetaUpdate = true; // might be reset in else part
		if (!this.m_saVO) { // no prior VO data -> initial scene definition
			((((oApp.SAPVB.Scenes = {}).Set = {}).SceneGeo = {
				"id": "MainScene",
				"refMapLayerStack": this.getRefMapLayerStack(),
				"initialZoom": this.getInitialZoom(),
				"initialStartPosition": this.getInitialPosition(),
				"scaleVisible": this.getScaleVisible().toString(),
				"navControlVisible": this.getNavcontrolVisible().toString(),
				"VisualFrame": this.getVisualFrame()
			}).VO = saVO);
		} else if (this.m_bRefMapLayerStackDirty || !(this.m_saVO === _saVO)) {
			// prior VO data exists -> calculate delta and preserve scene
			(oApp.SAPVB.Scenes = this.getSceneVOdelta(JSON.parse(this.m_saVO), saVO));
		} else {
			bMetaUpdate = false;
		}
		this.m_saVO = _saVO;

		// now we should have data, data types and instance information...........//
		// merge it into the app..................................................//
		if (this.bDataDeltaUpdate) {
			oApp.SAPVB.Data = [];
			for (var nI = 0; nI < saData.length; ++nI) {
				oApp.SAPVB.Data.push({
					Set: {
						name: saData[nI].name,
						type: "N",
						N: saData[nI]
					}
				});
			}
		} else {
			((oApp.SAPVB.Data = {}).Set = {}).N = saData;
		}
		if (bMetaUpdate) {
			(((oApp.SAPVB.DataTypes = {}).Set = {}).N = saType);
		}
		if (bMetaUpdate) {
			(((oApp.SAPVB.Actions = {}).Set = {}).Action = saAction);
		}

		// reset dirty states
		this.m_bRefMapLayerStackDirty = this.m_bSceneDirty = this.m_bFCsDirty = this.m_bVosDirty = false;
	};

	GeoMap.prototype.updateMapConfiguration = function(oApp) {
		if (!this.m_bMapConfigurationDirty) {
			return;
		}

		// reset dirty state......................................................//
		this.m_bMapConfigurationDirty = false;
		var aConfig = this.getMapConfiguration();

		// set the map providers
		if (aConfig) {
			oApp.SAPVB.MapProviders = {
				Set: {
					MapProvider: aConfig.MapProvider
				}
			};
			oApp.SAPVB.MapLayerStacks = {
				Set: {
					MapLayerStack: aConfig.MapLayerStacks
				}
			};
		}

		return;
	};

	GeoMap.prototype.updateClustering = function(oApp, oClusterRefVOs) {
		var aClusters = this.getClusters();
		var oClustering = null;

		if (aClusters.length) {
			oClustering = {
				Cluster: []
			};
			oClusterRefVOs.VO = [];
			oClusterRefVOs.DataType = [];
			for (var nI = 0, oCluster; nI < aClusters.length; ++nI) {
				oCluster = aClusters[nI];
				// add ref VO for display
				oClusterRefVOs.VO.push(oCluster.getTemplateObject());
				oClusterRefVOs.DataType.push(oCluster.getTypeObject());
				oClustering.Cluster.push(oCluster.getClusterDefinition());
			}
		} else {
			// cluster aggregation empty -> check for clustering prperty (to be removed later)
			if (this.m_bClusteringDirty) {
				oClustering = this.getClustering();
			}
		}
		if (oClustering) {
			oApp.SAPVB.Clustering = {
				Set: oClustering
			};
		}
		this.m_bClusteringDirty = this.bClustersDirty = false;
	};

	GeoMap.prototype.updateResourceData = function(oApp) {
		if (!this.m_bResourcesDirty) {
			return;
		}

		// reset dirty state......................................................//
		this.m_bResourcesDirty = false;
		var aRes = this.getResources();

		((oApp.SAPVB.Resources = {}).Set = {}).Resource = [];

		// update function for delayed loaded resources...........................//
		function ResUpdate() {
			var oApp = this.update();
			this.load(oApp);
		}

		// image load callback..............................................//
		var funcLoaded = function(res) {
			// check if given resource is still alive and valid
			if (!res.m_Img) {
				return;
			}

			var canvas = document.createElement('canvas');
			canvas.width = res.m_Img.width;
			canvas.height = res.m_Img.height;
			var context = canvas.getContext('2d');
			context.drawImage(res.m_Img, 0, 0);
			res.mProperties.value = canvas.toDataURL();
			delete res.m_Img;
			// mark resources as dirty and apply them again..................//
			this.m_bResourcesDirty = true;
			window.setTimeout(ResUpdate.bind(this), 10);
		};

		// read the resources and update them.....................................//
		for (var nJ = 0, len = aRes.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var res = aRes[nJ];

			// load the data from an url, when done we replace the value...........//
			if (!res.mProperties.value && res.mProperties.src) {
				var img = document.createElement('img');
				res.m_Img = img;
				img.onload = funcLoaded.bind(this, res);
				// we set the data url..............................................//
				img.src = res.mProperties.src;
			} else {
				// when a name is specified, use it. In all other cases use id.........//
				oApp.SAPVB.Resources.Set.Resource.push({
					"name": (res.mProperties.name ? res.mProperties.name : res.sId),
					"value": res.mProperties.value
				});
			}
		}

		return;
	};

	GeoMap.prototype.updateVOData = function(saVO, saData, saType, saAction) {
		var aVO = this.getVos();

		// process visual objects.................................................//
		// we collect the different arrays from the vo instances...................//

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oVO = aVO[nJ];

			// add the control object description..................................//
			// if(this.m_bVosDirty) {
			saVO.push(oVO.getTemplateObject());
			saType.push(oVO.getTypeObject());
			Array.prototype.push.apply(saAction, oVO.getActionArray());
			// }
			// add the control data
			saData.push(oVO.getDataObject());
		}

	};

	GeoMap.prototype.updateFCData = function(saVO, saData, saType, saAction) {
		var aFC = this.getFeatureCollections();

		// process feature collections.................................................//
		// we collect the different arrays from the fc instances...................//

		for (var nJ = 0, len = aFC.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oFC = aFC[nJ];

			// add the control objects description..................................//
			// Note: A feature collection may return multiple VOs!
			// if(this.m_bFCsDirty) {
			Array.prototype.push.apply(saVO, oFC.getTemplateObject());
			Array.prototype.push.apply(saType, oFC.getTypeObject());
			Array.prototype.push.apply(saAction, oFC.getActionArray());
			// }
			// add the control data
			Array.prototype.push.apply(saData, oFC.getDataObject());
		}
	};

	GeoMap.prototype.invalidate = function(oSource) {
		// invalidate scene in any case to trigger updateScene
		this.m_bSceneDirty = true;
		// set the vos dirty state when the aggregations have changed
		if (oSource instanceof sap.ui.vbm.VoAggregation) {
			this.m_bVosDirty = this.m_bWindowsDirty = true;
			// if invalidate results from internal data change we allow delta update for data
			this.bDataDeltaUpdate = this.bHandleChangedDataActive;
		} else if (oSource instanceof sap.ui.vbm.Legend) {
			this.m_bLegendDirty = true;
		} else if (oSource instanceof sap.ui.vbm.FeatureCollection) {
			this.m_bFCsDirty = true;
		} else if (oSource instanceof sap.ui.vbm.ClusterBase) {
			this.bClustersDirty = true;
		}

		sap.ui.core.Control.prototype.invalidate.apply(this, arguments);
	};

	GeoMap.prototype.openContextMenu = function(typ, inst, menu) {
		if (menu && menu.vbi_data && menu.vbi_data.VBIName == "DynContextMenu") {
			if (!this.mVBIContext.m_Menus) {
				this.mVBIContext.m_Menus = new window.VBI.Menus();
			}
			this.mVBIContext.m_Menus.m_menus.push(menu);
			var oAutomation = {

				"SAPVB": {
					"version": "2.0",
					"Automation": {
						"Call": {
							"earliest": "0",
							"handler": "CONTEXTMENUHANDLER",
							"instance": inst.sId,
							"name": "SHOW",
							"object": typ,
							"refID": "CTM",
							"Param": [
								{
									"name": "x",
									"#": inst.mClickPos[0]
								}, {
									"name": "y",
									"#": inst.mClickPos[1]
								}, {
									"name": "scene",
									"#": "MainScene"
								}
							]
						}
					}
				}
			};
			this.loadHtml(oAutomation);
		}
	};

	GeoMap.prototype.addResourceIfNeeded = function(resource) {
		var aRes = this.getResources();
		for (var nJ = 0, len = aRes.length; nJ < len; ++nJ) {
			if (aRes[nJ].getName() === resource) {
				// resource allready loaded
				return;
			}
		}
		// resource not found
		this.addResource(new sap.ui.vbm.Resource({
			name: resource,
			src: sap.ui.resource("sap.ui.vbm", "themes/base/img/" + resource)
		}));
		this.m_bResourcesDirty = true;
	};

	GeoMap.prototype.handleChangedData = function(aNodes) {
		try {
			this.bHandleChangedDataActive = true;
			if (aNodes && aNodes.length) {
				for (var nI = 0, oNode, oCont; nI < aNodes.length; ++nI) {
					oNode = aNodes[nI];
					oCont = this.getAggregatorContainer(oNode.name);
					if (oCont) {
						oCont.handleChangedData(oNode.E);
					}
				}
			}
			this.bHandleChangedDataActive = false;
		} catch (exc) {
			this.bHandleChangedDataActive = false;
			throw exc;
		}

	};

	GeoMap.prototype.getChildByKey = function(oChild, sKey) {
		var cont, oChildInst = null;
		if ((cont = oChild.getParent())) {
			if (cont instanceof sap.ui.vbm.VoAggregation) {
				if ((this.getAggregatorContainer(cont.getId()))) {
					oChildInst = cont.findInstanceByKey(sKey);
				}
			} else {
				oChildInst = cont.findInstanceByKey(sKey);
			}
		}
		return oChildInst;
	};

	return GeoMap;

}, /* bExport= */true);
