/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

/* global VBI */// declare unusual global vars for ESLint/SAPUI5 validation
// Provides control sap.ui.vbm.VBI.
sap.ui.define([
	'jquery.sap.global', './library', 'sap/ui/core/Control', 'sap/ui/core/IconPool', 'sap/ui/thirdparty/jqueryui/jquery-ui-widget', 'sap/ui/thirdparty/jqueryui/jquery-ui-core', 'sap/ui/thirdparty/jqueryui/jquery-ui-mouse', 'sap/ui/thirdparty/jqueryui/jquery-ui-draggable', './lib/sapvbi'
], function(jQuery, library, Control, IconPool, jqueryuiwidget, jqueryuicore, jqueryuimouse, jqueryuidraggable, sapvbi) {
	"use strict";

	/**
	 * Constructor for a new VBI.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The VBI control. This is the Visual Business base control, which is mainly intended to communicate directly with the Visual Business
	 *        Backend API in a proprietary JSON format. This control should not be used directly in a client side application. For this the control
	 *        extension <a href="sap.ui.vbm.GeoMap.html">sap.ui.vbm.GeoMap</a> is recommended.<br>
	 *        The main or high level API of the VBI control is made of
	 *        <ul>
	 *        <li>method <i>load</i> for sending JSON to the control for processing, and</li>
	 *        <li>event <i>submit</i> returning a result JSON as parameter data containing actual event information and changed data.</li>
	 *        </ul>
	 *        Further the high level API provides the thumbnail support.<br>
	 *        Additionally the control offers a low level API made of several events, like render, zoom, move and so on, which allow to render
	 *        application specific content directly on the controls canvas.
	 * @extends sap.ui.core.Control
	 * @author SAP SE
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.VBI
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VBI1 = Control.extend("sap.ui.vbm.VBI", /** @lends sap.ui.vbm.VBI.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Set the width of the control.
				 */
				width: {
					type: "sap.ui.core.CSSSize",
					group: "Misc",
					defaultValue: '800px'
				},

				/**
				 * Set the height of the control.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					group: "Misc",
					defaultValue: '600px'
				},

				/**
				 * This is the model configuration. Usually the Visual Business application is provided by this property. Nevertheless the property
				 * can be used for data binding to the inner Visual Business data model.
				 */
				config: {
					type: "object",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * When true, the ActiveX plugin version of Visual Business will be used for rendering. For that the plugin needs to be installed on
				 * the client. Default (false) the control renders on canvas.
				 */
				plugin: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			events: {

				/**
				 * High level API. Submit event is raised.
				 */
				submit: {
					parameters: {

						/**
						 * JSON (or possibly XML and case the plugin is used) string describing the delta state of Visual Business and the information
						 * about the event.
						 */
						data: {
							type: "string"
						}
					}
				},

				/**
				 * High level API. ThumbnailClick event is raised.
				 */
				thumbnailClick: {
					parameters: {

						/**
						 * Geo coordinates in format "lon;lat;0"
						 */
						pos: {
							type: "string"
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
				 * Low level API. Rendering of the canvas content is reqested. This event can be used to do custom rendering into the Visual Business
				 * overlay canvas. This function is not supported in plugin mode.
				 */
				render: {
					parameters: {

						/**
						 * Canvas object to render into.
						 */
						canvas: {
							type: "object"
						}
					}
				},

				/**
				 * Low level API. The canvas is zoomed. This function is not supported in plugin mode.
				 */
				zoom: {
					parameters: {

						/**
						 * Canvas object to render into
						 */
						canvas: {
							type: "object"
						}
					}
				},

				/**
				 * Low level API. The canvas was moved. This function is not supported in plugin mode.
				 */
				move: {
					parameters: {

						/**
						 * Canvas object to render into.
						 */
						canvas: {
							type: "object"
						}
					}
				},

				/**
				 * The event is raised raised before a Visual Business window is opened. It is intended to be used to place arbitrary content in e.g.
				 * a Detail Window. This function is not supported in plugin mode.
				 */
				openWindow: {
					parameters: {

						/**
						 * Div placeholder to render into.
						 */
						contentarea: {
							type: "object"
						},

						/**
						 * ID of the window that is opened.
						 */
						id: {
							type: "string"
						}
					}
				},

				/**
				 * The event is raised raised before a Visual Business window is closed. This function is not supported in plugin mode.
				 */
				closeWindow: {
					parameters: {

						/**
						 * Div placeholder for content.
						 */
						contentarea: {
							type: "object"
						},

						/**
						 * ID of the window that is closed.
						 */
						id: {
							type: "string"
						}
					}
				}
			}
		}
	});

	// ...........................................................................//
	// This file defines behavior for the control,...............................//
	// ...........................................................................//
	// Map used for storing RichTooltips
	VBI1.RttMap = {};

	VBI1.prototype.exit = function() {
		// create the vbi control context.........................................//
		// alert( "destroy" );

		// destroy the vbi control context........................................//
		// or plugin keept resources..............................................//

		if (this.getPlugin()) {
			var pi = this.getPlugInControl();
			if (pi) {
				pi.OnSubmit = null; // unsubscribe event............//
			}
		} else if (this.mVBIContext) {
			this.mVBIContext.clear(); // clear the resources...................//
		}

		if (this.resizeID != "") {
			sap.ui.core.ResizeHandler.deregister(this.resizeID);
			this.resizeID = "";
		}

	};

	VBI1.prototype.resize = function(event) {
		var cntrl = (this.oControl != undefined) ? this.oControl : this;

		var ctx = cntrl.mVBIContext;
		if (ctx) {
			var scene = ctx.GetMainScene();
			if (scene) {
				scene.resizeCanvas(event);
			}
		}
	};

	VBI1.prototype.init = function() {
		this.m_aLoadQueue = null; // load queue...................//

		// create the vbi control context.........................................//
		if (!this.getPlugin()) {
			// just create the context.............................................//
			this.mVBIContext = new VBI.VBIContext(this);
		}
		this.resizeID = "";
	};

	VBI1.prototype.loadNative = function(dat) {
		var l_vbiId = this.getId();
		var elem = document.getElementById('VBI' + l_vbiId);

		if (!elem) {
			return; // element not found.......................................//
		}
		var sf = function(strVal) {
			// to be compatible with the html version, we skip the root object.....//
			// definition..........................................................//
			try {
				var oD;
				if ((oD = JSON.parse(strVal))) {
					var vb = oD.SAPVB;
					var txt = JSON.stringify(vb, null, '  ');

					// fire the submit..................................................//
					this.fireSubmit({
						data: txt
					});
				}
			} catch (e) {
				if (VBI.m_bTrace) {
					VBI.Trace("Error submitting plugin event");
				}
			}
		};

		if (jQuery.type(dat) == 'object') {
			// input is a json object, convert to sting and load...................//
			var txt = JSON.stringify(dat, null, '  ');
			try {
				elem.Load(txt);
				elem.OnSubmit = sf.bind(this);
			} catch (e) {
			}
		} else if (jQuery.type(dat) == 'string') {
			try {
				elem.Load(dat);
				elem.OnSubmit = sf.bind(this);
			} catch (e) {
			}
		}
	};

	VBI1.prototype.loadHtml = function(data) {
		var l_vbiId = this.getId();

		var dat = null;

		// ensure that data is converted to a json object.........................//
		// when this is a string, due ABAP servers sometimes sets a BOM at the....//
		// beginning of the string we try to skip this............................//
		if (typeof data == 'string') {
			dat = JSON.parse(data.indexOf('{') ? data.substr(data.indexOf('{')) : data);
		} else if (typeof data == 'object') {
			dat = data; // this is already an object
		}
		// return immediately when data can not be interpreted....................//
		if (!dat) {
			return;
		}

		// check for data binding.................................................//
		if (!dat["SAPVB"]) {
			var md;
			if (this.mVBIContext && (md = (new VBI.Adaptor(this.mVBIContext)).CreateLoadData(dat))) {
				this.loadHtml(md);
				return;
			} else {
				return; // this is no valid data..............
			}
		}

		// todo: do correct handling when change flags get set....................//
		var bModifiedData = false;
		var bModifiedScenes = false;
		var bModifiedWindows = false;
		var bModifiedClustering = false;

		// the data can be a json object..........................................//
		if (jQuery.type(dat) == 'object') {
			if (dat.SAPVB) {
				// process configuration ...........................................//
				if (dat.SAPVB.Config) {
					// load the configuraiont .......................................//
					this.mVBIContext.GetConfig().load(dat.SAPVB.Config, this.mVBIContext);
				}
				// process resources................................................//
				if (dat.SAPVB.Resources) {
					// load the resources............................................//
					this.mVBIContext.GetResources().load(dat.SAPVB.Resources, this.mVBIContext);
				}
				// process datatypes................................................//
				if (dat.SAPVB.DataTypes) {
					// load the datatype provider....................................//
					if (!this.mVBIContext.m_DataTypeProvider) {
						this.mVBIContext.m_DataTypeProvider = new VBI.DataTypeProvider();
					}

					this.mVBIContext.m_DataTypeProvider.load(dat.SAPVB.DataTypes, this.mVBIContext);
				}
				// process datacontext..............................................//
				if (dat.SAPVB.Data) {
					// load the datacontext..........................................//
					// when the datacontext is loaded, provide the datatype info.....//
					if (!this.mVBIContext.m_DataProvider) {
						this.mVBIContext.m_DataProvider = new VBI.DataProvider();
					}

					this.mVBIContext.m_DataProvider.load(dat.SAPVB.Data, this.mVBIContext);
					bModifiedData = true;
				}
				// process mapproviders.............................................//
				if (dat.SAPVB.MapProviders) {
					// load the mapproviders.........................................//
					if (!this.mVBIContext.m_MapProviders) {
						this.mVBIContext.m_MapProviders = new VBI.MapProviders();
					}

					this.mVBIContext.m_MapProviders.load(dat.SAPVB.MapProviders, this.mVBIContext);
				}
				// process maplayerstacks...........................................//
				if (dat.SAPVB.MapLayerStacks) {
					// load the mapproviders.........................................//
					if (!this.mVBIContext.m_MapLayerStackManager) {
						this.mVBIContext.m_MapLayerStackManager = new VBI.MapLayerStackManager(this.mVBIContext);
					}

					this.mVBIContext.m_MapLayerStackManager.load(dat.SAPVB.MapLayerStacks, this.mVBIContext);
				}
				// process windows..................................................//
				if (dat.SAPVB.Windows) {
					if (!this.mVBIContext.m_Windows) {
						this.mVBIContext.m_Windows = new VBI.Windows();
					}
					this.mVBIContext.m_Windows.load(dat.SAPVB.Windows, this.mVBIContext);
					bModifiedWindows = true;
				}
				// process actions..................................................//
				if (dat.SAPVB.Actions) {
					if (!this.mVBIContext.m_Actions) {
						this.mVBIContext.m_Actions = new VBI.Actions();
					}
					this.mVBIContext.m_Actions.load(dat.SAPVB.Actions, this.mVBIContext);
				}
				// process automations..............................................//
				if (dat.SAPVB.Automation) {
					if (!this.mVBIContext.m_Automations) {
						this.mVBIContext.m_Automations = new VBI.Automations();
					}
					this.mVBIContext.m_Automations.load(dat.SAPVB.Automation, this.mVBIContext);
				}
				// context menues ..................................................//
				if (dat.SAPVB.Menus) {
					if (!this.mVBIContext.m_Menus) {
						this.mVBIContext.m_Menus = new VBI.Menus();
					}
					this.mVBIContext.m_Menus.load(dat.SAPVB.Menus, this.mVBIContext);
				}
				// clustering definition............................................//

				if (dat.SAPVB.Clustering) {
					if (!this.mVBIContext.m_Clustering) {
						this.mVBIContext.m_Clustering = new VBI.Clustering();
					}
					this.mVBIContext.m_Clustering.load(dat.SAPVB.Clustering, this.mVBIContext);
					bModifiedClustering = true;
				}

				// process scenes...................................................//
				// Note: process scenes last! Since it triggers a re-rendering everything should be updated before
				if (dat.SAPVB.Scenes) {
					if (!this.mVBIContext.m_SceneManager) {
						this.mVBIContext.m_SceneManager = new VBI.SceneManager();
					}
					this.mVBIContext.m_SceneManager.load(dat.SAPVB.Scenes, this.mVBIContext);
					bModifiedScenes = true;
				}

			}

			// notify framework about data modifications...........................//
			if (bModifiedData) {
				if (this.mVBIContext.m_Windows) {
					this.mVBIContext.m_Windows.NotifyDataChange();
				}
			}

			// control context is loaded
			if (bModifiedScenes || bModifiedWindows) {
				if (this.mVBIContext.m_Windows) {
					this.mVBIContext.m_Windows.Awake(l_vbiId);
				}
			}

			if (bModifiedScenes || bModifiedData || bModifiedClustering) {
				if (this.mVBIContext.m_Windows) {
					this.mVBIContext.m_Windows.RenderAsync();
				}
			}
		}
	};

	// high level function interface implementation..............................//
	// interface function implementation.........................................//

	/**
	 * High level load function. The function accepts a json string or an already parsed json object. This can be a Visual Business application, any
	 * delta operations on the application or other hierachical data that can be mapped by the Visual Business data provider to the inner Visual
	 * Business data context.
	 * 
	 * @param {string} dat Application JSON to process
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.load = function(dat) {
		// when the control is not yet rendered, queue the load calls.............//
		if (!this.isRendered()) {
			// create the queue and push load requests.............................//
			if (!this.m_aLoadQueue) {
				this.m_aLoadQueue = [];
			}
			this.m_aLoadQueue.push(dat);
			return;
		}

		// do processing when running as a plugin.................................//
		if (this.getPlugin()) {
			this.loadNative(dat);
		} else {
			this.loadHtml(dat);
		}
	};

	/**
	 * Minimize to Thumbnail.
	 * 
	 * @param {int} iNewWidth Width of the thumbnail
	 * @param {int} iNewHeight Height of the thumbnail
	 * @param {int} [iFullWidth] Width of the underlying VBI control. If ommitted current width is taken
	 * @param {int} [iFullHeight] Height of the underlying control. If ommitted current width is taken
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.minimize = function(iNewWidth, iNewHeight, iFullWidth, iFullHeight) {
		var vbictx = this.mVBIContext;
		if (!vbictx.moThumbnail) {
			vbictx.moThumbnail = {
				bThumbnailed: false
			};
		}
		vbictx.moThumbnail.nThumbWidth = iNewWidth;
		vbictx.moThumbnail.nThumbHeight = iNewHeight;
		if (iFullWidth) {
			vbictx.moThumbnail.nFullWidth = iFullWidth;
		}
		if (iFullHeight) {
			vbictx.moThumbnail.nFullHeight = iFullHeight;
		}
		var scene = vbictx.GetMainScene();
		if (scene) {
			vbictx.DoMinimize(scene);
		}
	};

	/**
	 * Maximize from Thumbnail.
	 * 
	 * @param {int} [iFullWidth] Width of the underlying VBI control. If ommitted current width is taken
	 * @param {int} [iFullHeight] Height of the underlying control. If ommitted current width is taken
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.maximize = function(iFullWidth, iFullHeight) {

		var scene = this.mVBIContext.GetMainScene();
		if (scene) {
			var newWidth, newHeight;
			if (iFullWidth) {
				newWidth = String(iFullWidth) + "px";
			} else {
				newWidth = this.mVBIContext.moThumbnail.strOrgWidth ? this.mVBIContext.moThumbnail.strOrgWidth : this.getWidth();
			}
			if (iFullHeight) {
				newHeight = String(iFullHeight) + "px";
			} else {
				newHeight = this.mVBIContext.moThumbnail.strOrgHeight ? this.mVBIContext.moThumbnail.strOrgHeight : this.getHeight();
			}
			this.mVBIContext.m_bThumbnail = false;

			this.setWidth(newWidth);
			this.setHeight(newHeight);
			scene.m_Ctx.moThumbnail = undefined;
			
			// we trigger resizing always as we cannot rely on Resize Handler as the size might not change
			scene.resizeCanvas(0);
		}
	};

	// ...........................................................................//
	// low level interface implementation........................................//

	/**
	 * Zoom to one or multiple geo positions. This function works only for the main geo scene in the Visual Business control.
	 * 
	 * @param {float} fLon Longitude in degrees. This can also be an array of longitude values.
	 * @param {float} fLat Latitude in degrees. This can also be an array of latitude values.
	 * @param {int} iLod Level of detail, usually between 0 and 20. This will be limited by the map provider capabilities.
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.zoomToGeoPosition = function(fLon, fLat, iLod) {
		// the project must be loaded already
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			if (jQuery.type(fLon) == 'array' && jQuery.type(fLat) == 'array') {
				if (fLon.length > 1 && fLat.length > 1) {
					scene.ZoomToMultiplePositions(fLon, fLat);
				} else {
					scene.ZoomToGeoPosition(VBI.MathLib.DegToRad([
						parseFloat(fLon[0]), parseFloat(fLat[0])
					]), parseFloat(iLod));
				}
			} else {
				scene.ZoomToGeoPosition(VBI.MathLib.DegToRad([
					parseFloat(fLon), parseFloat(fLat)
				]), parseFloat(iLod));
			}
		}
	};

	/**
	 * Zoom to one or multiple Areas. This function works only for the main geo scene in the Visual Business control.
	 * 
	 * @param {array} aAreaList List of Area Ids to zoom to.
	 * @param {float} corr Correction factor for calculated zoom level or array of pixel values for the added margin of the calculated zoom area.
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.zoomToAreas = function(aAreaList, corr) {
		// the project must be loaded already
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			scene.ZoomToAreas(aAreaList, corr);
		}
	};

	/**
	 * Retrieve information on a specific cluster object . Type : 0 : contained VOs 1 : child clusters (tree clustering only) 2 : parent Node (tree
	 * clustering only) 10 : Information on Node 11 : Edges of the Voronoi Area (tree clustering only, not merged with rectangle)
	 * 
	 * @param {string} sIdent Cluster Id
	 * @param {sap.ui.vbm.ClusterInfoType} iType Type of information which should be returned
	 * @returns {oClusterInfo} Cluster Info Object with requested info according to given Cluster Info Type
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VBI1.prototype.getInfoForCluster = function(sIdent, iType) {
		var scene = null;
		if ((scene = this.mVBIContext.GetMainScene())) {
			return scene.getInfoForCluster(sIdent, iType);
		}
		return null;
	};

	// ...........................................................................//
	// once VBI control is rendered, we attach navigation bar and map it self....//

	VBI1.prototype.onAfterRendering = function() {
		// when there is preserved content restore it.............................//
		if (this.$oldContent.length > 0) {
			this.$().append(this.$oldContent);
		}

		// process the load queue.................................................//
		if (this.m_aLoadQueue) {
			var nJ;
			for (nJ = 0; nJ < this.m_aLoadQueue.length; ++nJ) {
				this.load(this.m_aLoadQueue[nJ]);
			}
			this.m_aLoadQueue = null;
		}

		if (this.resizeID == "") {
			this.resize();
			this.resizeID = sap.ui.core.ResizeHandler.register(this, this.resize);
		}

		// do a new adjust of DOM placed elements.................................//
		// the function should do nothing if nothing needs to be done.............//
		var l_vbiId = this.getId();
		if (this.mVBIContext.m_Windows) {
			this.mVBIContext.m_Windows.Awake(l_vbiId);
		}
	};

	VBI1.prototype.onBeforeRendering = function() {
		// this is called before the renderer is called...........................//

		this.$oldContent = sap.ui.core.RenderManager.findPreservedContent(this.getId());
	};

	// ...........................................................................//
	// diagnostics...............................................................//

	VBI1.prototype.isRendered = function() {
		return this.getDomRef() ? true : false;
	};

	// ...........................................................................//
	// helpers...................................................................//

	VBI1.prototype.getPlugInControl = function() {
		var l_vbiId = this.getId();
		var elem = document.getElementById('VBI' + l_vbiId);
		return elem ? elem : null;
	};

	// ...........................................................................//
	// re implement property setters.............................................//

	VBI1.prototype.setConfig = function(config) {
		// just call the load function............................................//
		// this will execute once and discard the config..........................//
		return this.load(config);
	};

	VBI1.prototype.setWidth = function(val) {
		if (typeof val === 'number') {
			this.setProperty("width", parseInt(val, 10).toString() + "px");
		} else {
			this.setProperty("width", val);
		}
	};

	VBI1.prototype.setHeight = function(val) {
		if (typeof val === 'number') {
			this.setProperty("height", parseInt(val, 10).toString() + "px");
		} else {
			this.setProperty("height", val);
		}
	};

	return VBI1;

});
