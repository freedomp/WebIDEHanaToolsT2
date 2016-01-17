/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

//Provides control sap.ui.vk.StepNavigation.
sap.ui.define([ "jquery.sap.global", "./library", "sap/ui/core/Control","sap/ui/core/ResizeHandler", "./Loco","./ViewportHandler", "sap/ui/core/Popup", "sap/ui/core/IconPool"],
		function(jQuery, library, Control, ResizeHandler, Loco, ViewportHandler, Popup,IconPool) {
	"use strict";

	/**
	 *  Creates a new StepNavigation object.
	 * 
	 * @class
	 * This control enables navigation and activation of procedures and steps contained in a single 3D scene.
	 * 
	 * @param {string} [sId] ID for the new control. This ID is generated automatically if no ID is provided.
	 * @param {object} [mSettings] Initial settings for the new Step Navigation control.
	 * @public
	 * @author SAP SE
	 * @version 1.32.3
	 * @extends sap.ui.core.Control
	 * @alias sap.ui.vk.StepNavigation
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var StepNavigation = Control.extend("sap.ui.vk.StepNavigation",/** @lends sap.ui.vk.StepNavigation.prototype */{
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Managed settings and properties for Step Navigation events.
				 */
				settings: "sap.ui.core.object",

				/**
				 * Width of the Step Navigation control.
				 */
				width: {
					type:  "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},

				/**
				 * Height of the Step Navigation control.
				 */
				height: {
					type: "sap.ui.core.CSSSize",
					defaultValue: "100%"
				},

				/**
				 * Indicates that the Step Navigation control should display thumbnails. 
				 * If set to <code>true</code>, then thumbnails are rendered. If set to <code>false</code>, then thumbnails are hidden.
				 */
				showThumbnails: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Indicates that the Step Navigation control should display a toolbar. 
				 * If set to <code>true</code>, then the toolbar is rendered. If set to <code>false</code>, then the toolbar is hidden.
				 */
				showToolbar: {
					type: "boolean",
					group: "Appearance",
					defaultValue: true
				},

				/**
				 * Indicates that the Step Navigation control should display a popup containing information around the step that is playing. 
				 * If set to <code>true</code>, then the popup is rendered. If set to <code>false</code>, the popup is hidden.
				 */
				showStepInfo: {
					type: "boolean",
					group: "Appearance",
					defaultValue: false
				}
			},

			publicMethods: [
				"setGraphicsCore",
				"setScene",
				"playStep",
				"pauseStep", 
				"playAllSteps", 
				"getStep", 
				"getNextStep", 
				"getPreviousStep",  
				"getProceduresAndSteps",
				"refresh",
				"clear"],
				associations: {
				},

				aggregations: {
					/**
					 * Template control for Procedure items.
					 */
					procedureItemTemplate: {
						type: "sap.ui.core.Item",
						multiple: false
					},

					/**
					 * sap.ui.core.Popup used to render step information in a popup.
					 */
					stepInfoPopup: {
						type: "sap.ui.core.Control",
						multiple: false
					},

					/**
					 * sap.m.Panel used to render the entire Step Navigation control's content. 
					 */
					layout: {
						type: "sap.m.Panel",
						multiple: false
					}
				},

				events: {
					"resize": {
						parameters: {
							oldSize: "object",
							size: "object"
						}
					},

					/**
					 * Raised each time a step starts, changes, or finishes. 
					 */
					"stepChanged": {
						parameters: {
							/**
							 * The ID of the rendering client that raised the event.
							 */
							clientId: "object",

							/**
							 * The type of DvlEnums.DVLSTEPEVENT that has been raised; for example, DVLSTEPEVENT_FINISHED, DVLSTEPEVENT_SWITCHED, DVLSTEPEVENT_STARTED.
							 */
							type: "object",

							/**
							 * The ID of the step affected by this stepId event.
							 */
							stepId: "object"
						}
					}
				}
		},

		/**
		 * Attaches or detaches the Step Navigation control to the {@link sap.ui.vk.GraphicsCore GraphicsCore} object.
		 *
		 * If the parameter <code>graphicsCore</code> is not <code>null</code>, a rendering object corresponding to the Viewport is created.
		 * If the parameter <code>graphicsCore</code> is <code>null</code>, the rendering object corresponding to the Viewport is destroyed.
		 * @param {sap.ui.vk.GraphicsCore} graphicsCore The {@link sap.ui.vk.GraphicsCore GraphicsCore} object, or <code>null</code>.
		 * @returns {sap.ui.vk.StepNavigation} <code>this</code> to allow method chaining.
		 * @public
		 */
		setGraphicsCore: function(graphicsCore) {
			if (graphicsCore != this._graphicsCore) {
				this._graphicsCore = graphicsCore;
			}

			this.instanceSettings = {}; 

			this.oDvl = this._graphicsCore.getApi(sap.ui.vk.GraphicsCoreApi.LegacyDvl);
			this.oDvl.Client.OnStepEvent = function(clientId, type, stepId) {
				var oSettings = this.getSettings();
				this.instanceSettings.currentStepId = stepId;
				switch (type) {
				case DvlEnums.DVLSTEPEVENT.DVLSTEPEVENT_FINISHED:
					oSettings.currentStepFinished = true;
					oSettings.currentStepPaused = false;
					oSettings.playAllActive = false;
					oSettings.isPlaying = false; 
					this._togglePlayPause(true);
					break;
				case DvlEnums.DVLSTEPEVENT.DVLSTEPEVENT_SWITCHED: //WARNING
				case DvlEnums.DVLSTEPEVENT.DVLSTEPEVENT_STARTED:
					oSettings.currentStepId = stepId;
					oSettings.currentStepFinished = false;
					this._highlightStep(stepId);
					//The user may have attempted to pause the step as it changed. 
					//The following attempts to honor the intent by pausing the current step 
					if (oSettings.currentStepPaused) {
						this.pauseStep();
					}
					break;
				}

				this.fireStepChanged({
					clientId: clientId,
					type: type,
					stepId: stepId
				});
			}.bind(this);

			return this;
		},

		/**
		 * This method is used to check if the Graphics Core object has been set on this Step Navigation control. 
		 *
		 * @returns {boolean} 
		 * @private
		 */
		hasGraphicsCore: function() {
			if (this._graphicsCore) {
				return true;
			}
			return false;
		},

		/** 
		 * Attaches a Scene object to the Step Navigation control so that it can access the Scene’s procedures and steps.
		 * 
		 * @param {object} scene The Scene object to attach to the Step Navigation control.
		 * @public
		 */
		setScene: function (scene) {
			this._scene = scene;
			if (this["_getStepThumbnails"]) {
				if (!this._graphicsCore) {
					this.setGraphicsCore(this._scene.getGraphicsCore());
				}

				delete this._procedures;
				var oProcedureList = this.getProcedureList();
				var oSettings = this.getSettings();
				oSettings.reset();
				oProcedureList.unbindItems(); 
				oProcedureList.setSelectedItem(oProcedureList.getFirstItem()); //oProcedureList.setSelectedItem(null);

				//Destroy the step info popup if it exists
				if (oSettings.stepInfo.stepMessagePopup) {
					if (!oSettings.stepInfo.stepMessagePopup.isOpen()) {
						oSettings.stepInfo.stepMessagePopup.close();
					}
					oSettings.stepInfo.stepMessagePopup.destroy();
					oSettings.stepInfo.stepMessagePopup = null;
					this.getShowStepInfoButton().setText(this.oResourceBundle.getText("STEP_NAV_STEPDESCRIPTIONHEADING"));
				}

				//Get Steps and decide whether to enable/disable controls
				var data = this._getStepThumbnails();
				this.oModel.setData(data);
				sap.ui.getCore().setModel(this.oModel);
				this._togglePlayPause(true);
				this._refreshControl();
			}
			this.refresh();
		},

		init : function() {
			if (Control.prototype.init) {
				Control.prototype.init(this);
			}

			if (this.getSettings() == undefined) {
				this.setSettings(new this._settings());
			}	
			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vk.i18n");
			this._graphicsCore = null;

			// Create JSON data model
			this.oModel = new sap.ui.model.json.JSONModel();
			// Create layout panel
			this._layout =  new sap.m.Panel({
				expandable: false
			});

			this._layoutToolbar = new sap.m.Toolbar({
				design: sap.m.ToolbarDesign.Solid
			}); 

			this._layout.addContent(new sap.m.ScrollContainer(this.getId() + "-scroller", {
				width:"100%", 
				horizontal:true, 
				vertical:false, 
				focusable:true
			}));
			this.setAggregation("layout", this._layout);

			//Create the play previous button
			this.playPreviousButton = new sap.m.Button(this.getId() + "-playPreviousButton", {
				type: sap.m.ButtonType.Transparent,
				icon : "sap-icon://slim-arrow-left",
				tooltip: this.oResourceBundle.getText("STEP_NAV_PREVIOUSSTEPBUTTON"),
				visible: true,
				press:  function(e) {
					var oSettings = this.getSettings();
					var prevStep = this.getPreviousStep(oSettings.currentProcedureIndex);
					if (prevStep) {
						oSettings.currentStepPaused = false;
						this.playStep(prevStep.id,true,oSettings.playAllActive);
						this._togglePlayPause(false);
					}
				}.bind(this)
			});

			// Create the play next button
			this.playNextButton	= new sap.m.Button(this.getId() + "-playNextButton", {
				type: sap.m.ButtonType.Transparent,
				icon: "sap-icon://slim-arrow-right",
				tooltip: this.oResourceBundle.getText("STEP_NAV_NEXTSTEPBUTTON"),
				visible: true,
				press:  function(e) {
					var oSettings = this.getSettings();
					var nextStep = this.getNextStep(oSettings.currentProcedureIndex);
					if (nextStep) {
						oSettings.currentStepPaused = false;
						this.playStep(nextStep.id,true,oSettings.playAllActive);
						this._togglePlayPause(false);
					}
				}.bind(this)
			});

			// Create the play next button
			this.playOptionButton	= new sap.m.Button(this.getId() + "-playOptionButton", {
				type: sap.m.ButtonType.Transparent,
				icon: "sap-icon://media-play",
				tooltip: this.oResourceBundle.getText("STEP_NAV_PLAYBUTTON_PLAY"),
				visible: true,
				press:  function(e) {
					var key = this.getPlayMenuButton().getSelectedKey(); //e.oSource.getSelectedKey();
					var oSettings = this.getSettings();
					var firstStep = null;
					switch (key) {
					case "0":
						// Play
						if (!oSettings.currentStepId) {
							firstStep = this.getNextStep(oSettings.currentProcedureIndex);
							if (firstStep) {
								oSettings.currentStepId = firstStep.id;
							} else {
								return; // If there is no first step then do nothing
							}

						}
						oSettings.playAllActive = false;
						this.playStep(oSettings.currentStepId,!oSettings.currentStepPaused,oSettings.playAllActive);
						oSettings.isPlaying = true;
						oSettings.currentStepPaused = false;
						this._togglePlayPause(false);
						break;
					case "1":
						oSettings.playAllActive = true;
						oSettings.currentStepPaused = false;
						this.playAllSteps(oSettings.currentProcedureId);
						oSettings.isPlaying = true;
						this._togglePlayPause(false);
						break;
					case "2":
						if (!oSettings.currentStepId) {
							firstStep = this.getNextStep(oSettings.currentProcedureIndex);
							if (firstStep) {
								oSettings.currentStepId = firstStep.id;
							} else {
								return; // If there is no first step then do nothing
							}
						}
						oSettings.playAllActive = true;
						var playFromBeginning = !oSettings.currentStepPaused;
						oSettings.currentStepPaused = false;
						this.playStep(oSettings.currentStepId, playFromBeginning, oSettings.playAllActive);
						oSettings.isPlaying = true;
						this._togglePlayPause(false);
						break;
					default:
						break;
					}
				}.bind(this)
			});


			// Create the procedures dropdown list
			this.procedureList = new sap.m.Select(this.getId() + "-procedureList", {
				tooltip: this.oResourceBundle.getText("STEP_NAV_PROCEDURESLISTHEADING"),
				selectedKey: "0",
				type: sap.m.SelectType.Default,
				enabled: true,
				width: "30%",
				autoAdjustWidth: true,
				change: function(oControlEvent) {
					// Reset the control info when they change the selected procedure
					var oProcedureList = this.getProcedureList();
					var oSettings = this.getSettings();
					oSettings.currentProcedureIndex = 0; // Set the default to the first procedure
					oSettings.currentProcedureId = this.instanceSettings.currentProcedureId = oProcedureList.getSelectedKey();
					oSettings.currentStepId = this.instanceSettings.currentStepId = null;
					for (var ip = 0; ip < this.oModel.oData.procedures.length; ip++) {
						if (this.oModel.oData.procedures[ip].id == oSettings.currentProcedureId) {
							oSettings.currentProcedureIndex = ip;
							oSettings.currentProcedure = this.oModel.oData.procedures[ip];
							break;
						}
					}

					// Destroy the step info popup if it exists
					if (oSettings.stepInfo.stepMessagePopup) {
						if (!oSettings.stepInfo.stepMessagePopup.isOpen()) {
							oSettings.stepInfo.stepMessagePopup.close();
						}
						oSettings.stepInfo.stepMessagePopup.destroy();
						oSettings.stepInfo.stepMessagePopup = null;
					}

					this._refreshItems();
				}.bind(this)
			});
			
			this.procedureList.addStyleClass("sapVizKitStepNavigationProcedureList");

			// Create the item template for the procedure drop down list
			this.setAggregation("procedureItemTemplate", (
					new sap.ui.core.ListItem()
					.bindProperty("text","name")
					.bindProperty("key", "id")
					.bindProperty("tooltip","name")));

			// Create the play menu
			this.playMenuButton = (new sap.m.Select(this.getId() + "-playMenuButtonIcon", {
				selectedKey: "0",
				type: sap.m.SelectType.Default,
				tooltip: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAYOPTIONS"),
				enabled: true,
				autoAdjustWidth : false,
				items: [
					new sap.ui.core.ListItem({
						key: "0",
						icon: "sap-icon://media-play",
						text: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAY"),
						tooltip: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAY")
					}),
					new sap.ui.core.ListItem({
						key: "1",
						icon: "sap-icon://media-play",
						text: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAYALL"),
						tooltip: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAYALL")
					}),
					new sap.ui.core.ListItem({
						key: "2",
						icon: "sap-icon://media-play",
						text: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAYALLREMAINING"),
						tooltip: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PLAYALLREMAINING")
					}) ]
			}));

			this.playMenuButton.addStyleClass("sapVizKitStepNavigationPlayOptionsSelect");


			// Create the pause button
			this.pauseButton = new sap.m.Button(this.getId() + "-pauseButton", {
				type: sap.m.ButtonType.Transparent,
				icon: "sap-icon://media-pause",
				visible: false,
				tooltip: this.oResourceBundle.getText("STEP_NAV_PLAYMENU_PAUSE"),
				press:  function(e) {
					var oSettings = this.getSettings();
					this.pauseStep();
					oSettings.currentStepPaused = true;
					oSettings.isPlaying = false;
					this._togglePlayPause(true);
				}.bind(this)
			});

			this.showStepInfoButton = new sap.m.ToggleButton(this.getId() + "-showStepInfoButton",{
				icon: "sap-icon://hide",
				type: sap.m.ButtonType.Transparent,
				pressed: false,
				text: this.oResourceBundle.getText("STEP_NAV_STEPDESCRIPTIONHEADING"),
				tooltip: this.oResourceBundle.getText("STEP_NAV_STEPDESCRIPTIONHEADING"),
				press: function(oEvent){
					var target = oEvent.getSource();
					if (target.getPressed()) {
						this.setShowStepInfo(true);
						target.setIcon("sap-icon://show");
						target.setTooltip(this.oResourceBundle.getText("STEP_NAV_SHOWSTEPDESCRIPTIONBUTTON"));
					} else {
						this.setShowStepInfo(false);
						target.setIcon("sap-icon://hide");
						target.setTooltip(this.oResourceBundle.getText("STEP_NAV_HIDESTEPDESCRIPTIONBUTTON"));
					}
				}.bind(this)
			}); 


			this._layoutToolbar.addContent(this.playPreviousButton);
			this._layoutToolbar.addContent(this.playOptionButton);
			this._layoutToolbar.addContent(this.pauseButton);
			this._layoutToolbar.addContent(this.playMenuButton);
			this._layoutToolbar.addContent(this.procedureList);
			this._layoutToolbar.addContent(this.showStepInfoButton);
			this._layoutToolbar.addContent(new sap.m.ToolbarSpacer());
			this._layoutToolbar.addContent(this.playNextButton);

			this._layout.setHeaderToolbar(this._layoutToolbar);
		},

		getScroller: function(){
			var id = this.getId() + "-scroller";
			var cnt = sap.ui.getCore().byId(id);
			var lo = this.getLayout();
			return lo.getContent()[lo.indexOfContent(cnt)];
		},

		getProcedureList: function(){
			var id = this.getId() + "-procedureList";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		},

		getPlayMenuButton: function(){
			var id = this.getId() + "-playMenuButtonIcon";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		}, 

		getPlayOptionButton: function(){
			var id = this.getId() + "-playOptionButton";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		}, 

		getPauseButton: function(){
			var id = this.getId() + "-pauseButton";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		},

		getPlayNextButton: function(){
			var id = this.getId() + "-playNextButton";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		},

		getPlayPreviousButton: function(){
			var id = this.getId() + "-playPreviousButton";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		},

		getShowStepInfoButton: function(){
			var id = this.getId() + "-showStepInfoButton";
			var ht = this.getLayout().getHeaderToolbar();
			var cnt = sap.ui.getCore().byId(id);
			return ht.getContent()[ht.indexOfContent(cnt)];
		},

		exit : function() {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}
			if (Control.prototype.exit) {
				Control.prototype.exit.apply(this);
			}
		},

		/**
		 * Control runtime settings (intended as internal/read-only).
		 * 
		 * @private
		 */
		_settings: function(){
			return {
				enabled: false,
				toggle: {
					addCss: function(key, property,onValue, offValue) {
						if (!this.targets[key]) {
							this.targets[key] = {
									"type" : "css",
									"property" : property,
									"onValue": onValue,
									"offValue": offValue
							};
						}
					},

					addMethod: function (target, method, onValue, offValue, useJQuery) {
						var key = target.getId();
						if (!this.targets[key]) {
							this.targets[key] = {
									"type": "method",
									"target": target,
									"method": method,
									"onValue": onValue,
									"offValue": offValue,
									"useJQuery": useJQuery
							};
						}
					},

					targets: {}
				},

				currentProcedureIndex: 0,
				currentProcedureId: "",
				currentProcedure: null, //Managed and used by popup step info
				currentStepId: null,
				currentStep: null, //Managed and used by popup step info
				currentStepPaused: false,
				isPlaying: false,
				currentStepFinished: true,
				playAllActive: false,
				showToolbar: true,
				showThumbnails: true,
				portfolioMode: false,
				reset: function() {
					this.currentStep = null;
					this.currentProcedure = null;
					this.currentProcedureIndex = 0;
					this.currentProcedureId = "";
					this.currentStepId = null;
					this.currentStepPaused = false;
					this.currentStepFinished = true;
					this.playAllActive = false;
					this.portfolioMode = false;
				},

				stepInfo: {
					lastTop: null,
					lastLeft: null,
					stepMessagePopup: null,
					openPopup: function (popupTitle, popupContent, target) {
						if (!this.stepMessagePopup) {
							this.stepMessagePopup = new sap.m.ResponsivePopover({
								placement: "Top",
								showCloseButton: true,
								verticalScrolling: true, 
								contentHeight: "10%",
								contentWidth: "30%"
							});	
							this.stepMessagePopup.addStyleClass("sapVizKitStepNavigationPopoverStepInfo");
						}
						this.stepMessagePopup.setTitle(popupTitle);
						this.stepMessagePopup.removeAllContent();
						this.stepMessagePopup.addContent(popupContent);
						this.stepMessagePopup.openBy(target);
					}
				}
			};
		},

		/**
		 * Rebuilds the content of the Step Navigation control from the current Scene.
		 * 
		 * @return {boolean} Returns <code>true</code> if the content of the Step Navigation control was rebuilt successfully.
		 * @public
		 */
		refresh: function(oScene){
			jQuery.sap.log.info("StepNavigation refresh() called.");
			if (this.getVisible() && (this["_getStepThumbnails"] && this._scene != null)) {
				var oProcedureList = this.getProcedureList();
				var oSettings = this.getSettings();
				oSettings.reset();
				oProcedureList.setSelectedItem(oProcedureList.getFirstItem());

				//Get Steps and decide whether to enable/disable controls
				var data = this._getStepThumbnails();

				//Destroy the step info popup if it exists
				if (oSettings.stepInfo.stepMessagePopup) {
					if (!oSettings.stepInfo.stepMessagePopup.isOpen()) {
						oSettings.stepInfo.stepMessagePopup.close();
					}
					oSettings.stepInfo.stepMessagePopup.destroy();
					oSettings.stepInfo.stepMessagePopup = null;
				}

				//
				this.oModel.setData(data);
				sap.ui.getCore().setModel(this.oModel);
				this._togglePlayPause(true);
				this._refreshControl();
			} else {
				if (this.getVisible()) {
					this._refreshControl();
				}
			}
			return true; 
		},

		/**
		 * Clears the content of the Step Navigation control.
		 * 
		 * @return {boolean} Returns <code>true</code> if the method was called successfully.
		 * @public
		 */
		clear : function(){
			jQuery.sap.log.info("StepNavigation clear() called.");
			return true;
		},

		onBeforeRendering : function() {
			if (this._resizeListenerId) {
				ResizeHandler.deregister(this._resizeListenerId);
				this._resizeListenerId = null;
			}

			//**********************************************************************
			//**** CONFIGURE THE DROP DOWN LIST OF PROCEDURES					****
			//**********************************************************************
			if (this.getShowToolbar()) {
				var oProcedureList = this.getProcedureList();
				oProcedureList.setModel(this.oModel);
				var oProcedureItemTemplate = this.getProcedureItemTemplate();
				oProcedureList.bindItems("/procedures", oProcedureItemTemplate);
			}
		},

		onAfterRendering : function() {
			if (this._canvas) {
				var domRef = this.getDomRef();
				domRef
				.appendChild(this._canvas);
				this._resizeListenerId = ResizeHandler
				.register(
						this,
						this._handleResize
						.bind(this));
				this._bestFit();
				this
				.fireResize({
					size: {
						width : domRef.clientWidth,
						height : domRef.clientHeight
					}
				});
			}

			//Events like the Toggle Step Info button are causing a re-render. The following workaround 
			//ensures that the play/pause button do not get reset to incorrect defaults. This should be handled differently and will be updated in the future.
			var oSettings = this.getSettings(); 
			this._togglePlayPause(!oSettings.isPlaying);
			if (oSettings.currentStepId){
				this._highlightStep(oSettings.currentStepId);
			}
		},

		/**
		 * @private
		 */
		_handleResize: function(event) {
			this.fireResize({
				oldSize: event.oldSize,
				size: event.size
			});
			this._update();
		},

		/**
		 * @private
		 */
		_reset: function() {
			this._x = 0;
			this._y = 0;
			this._s = 1.0;
			this._r = 0;
		},

		/**
		 * @private
		 */
		_update: function() {
			var x = this._x
			- (this._imageW - this._canvas.clientWidth)
			/ 2;
			var y = this._y
			- (this._imageH - this._canvas.clientHeight)
			/ 2;
			var transform = "matrix(" + this._s
			+ ",0,0," + this._s + ","
			+ x + "," + y + ")";

			this._img.style.transform = transform;
			this._img.style.webkitTransform = transform;
			this._img.style.msTransform = transform;
			this._img.style.MozTransform = transform;
			this._img.style.OTransform = transform;
		},

		_bestFit: function() {
			this._reset();
			var sx = this._canvas.clientWidth
			/ this._img.width;
			var sy = this._canvas.clientHeight
			/ this._img.height;
			this._s = sx < sy ? sx : sy;
			if (this._s == 0) {
				this._s = 1.0;
			}
			this._x = 0;
			this._y = 0;
			this._update();
		},

		/**
		 * Toggle Play/Pause button visibility.
		 * @private
		 */
		_togglePlayPause: function (pauseActive) {
			//var oSettings = this.getSettings();
			this.togglePlayPauseActive = true; 
			if (this.getSettings().showToolbar) {
				if (pauseActive) {
					this.getPauseButton().setVisible(false);
					this.getPlayOptionButton().setVisible(true);
				} else {
					this.getPauseButton().setVisible(true);
					this.getPlayOptionButton().setVisible(false);
				}
			}
		},

		/**
		 * Used internally to refresh and update the controls and their data. 
		 * 
		 * @private
		 */
		_refreshControl: function () {
			//var that = this;
			var oProcedureList = this.getProcedureList();
			var oProcedureItemTemplate = this.getProcedureItemTemplate(); 
			var oScroller = this.getScroller();
			var oSettings = this.getSettings();

			//Destroy the step info popup if it exists
			if (oSettings.stepInfo.stepMessagePopup) {
				if (!oSettings.stepInfo.stepMessagePopup.isOpen()) {
					oSettings.stepInfo.stepMessagePopup.close();
				}
				oSettings.stepInfo.stepMessagePopup.destroy();
				oSettings.stepInfo.stepMessagePopup = null;
				this.getShowStepInfoButton().setText(this.oResourceBundle.getText("STEP_NAV_STEPDESCRIPTIONHEADING"));
			}

			oProcedureList.unbindItems();  
			if (this.oModel.oData.procedures.length > 0) {
				var first = this.oModel.oData.procedures[0];
				if (this.getShowToolbar()) {
					oProcedureList.bindItems("/procedures", oProcedureItemTemplate);
					oProcedureList.selectedKey = first.id;
					oProcedureList.enabled = true;
				}
				this._refreshItems();
			} else {
				if (this.getShowToolbar()) {
					oProcedureList.bindItems("/procedures", oProcedureItemTemplate);
					oProcedureList.enabled = false;
				}

				if (this.getShowThumbnails()) {
					oScroller.destroyContent();
				}
			}
		},

		/**
		 * Refreshes the step thumbnail list items. 
		 * 
		 * @private
		 */
		_refreshItems: function () {
			var that = this;
			var steps = [];
			var oProcedureList = this.getProcedureList();
			var oSettings = that.getSettings();
			var oScroller = that.getScroller();
			var itemLayout = new sap.m.HBox();

			if (that.getShowThumbnails()) {
				//Clear the current controller layout
				oScroller.removeAllContent(); 
			}

			//Get the procedure info
			if (!oSettings.currentProcedure) {
				oSettings.currentProcedure = that.oModel.oData.procedures[oSettings.currentProcedureIndex];
				oProcedureList.setSelectedItem(oProcedureList.getFirstItem());
			}

			if (oSettings.currentProcedureId != '' || that.oModel.oData.procedures.length > 0) {
				if (that.getShowThumbnails()) {
					steps = that.oModel.oData.procedures[oSettings.currentProcedureIndex].steps;
					var imagePress = function(ev) {
						oSettings.currentStepPaused = false;
						var cnt = sap.ui.getCore().byId(ev.getSource().getId());
						that.playStep(cnt.getCustomData()[0].getValue("stepId"));
						oSettings.playAllActive = false;
						that._togglePlayPause(false);
					};

					for (var i = 0; i < steps.length; i++) {
						var img = new sap.m.Image({
							alt: steps[i].name,
							src: "data:image/" + steps[i].thumbnailType + ";base64," + steps[i].thumbnailData,
							densityAware: false,
							tooltip: steps[i].name, 
							press: imagePress.bind(that)
						});

						img.data("stepId", steps[i].id); //Use for jQuery to change style - possibly refactor to iterate through sap.m.Image objects instead
						img.addCustomData(new sap.ui.core.CustomData({key:"stepId", value:steps[i].id}));
						img.addStyleClass("sapVizKitStepNavigationStepItem");
						itemLayout.addItem(img);
					}
					oScroller.addContent(itemLayout);
				}
			}
		},

		/**
		 * Highlights a step - used to indicate that a step has recently played or is playing. 
		 * 
		 * @private
		 */
		_highlightStep: function (stepId) {
			var that = this;
			if (that.getVisible()) {
				var oScroller = that.getScroller(); 
				var oSettings = that.getSettings();

				//Logic for connecting popup to step changed event
				var stepInfo = that.getStep(0, oSettings.currentProcedureIndex, stepId);
				if (!oSettings.currentProcedure) {
					oSettings.currentProcedure = that.oModel.oData.procedures[that.oSettings.currentProcedureIndex];
				}

				//Content for the popup
				//var popupProcedure = oSettings.currentProcedure.name;
				var title = stepInfo.name;
				var content = new sap.m.VBox({
					items: [new sap.m.Text({text:stepInfo.description})]
				});
				content.addStyleClass("sapVizKitStepNavigationPopoverContent");

				var oShowStepInfoButton = that.getShowStepInfoButton();
				//oShowStepInfoButton.setText(title); 
				if (that.getShowStepInfo()) {
					oSettings.stepInfo.openPopup(title, content, oShowStepInfoButton);		
				} else if (oSettings.stepInfo.stepMessagePopup && oSettings.stepInfo.stepMessagePopup.isOpen()) {
					oSettings.stepInfo.stepMessagePopup.close();
				}

				//Highlight the selected thumbnail
				if (that.getShowThumbnails()) {
					var oThumbnailItems = oScroller.getContent()[0].getItems(); 
					for (var i = 0; i < oThumbnailItems.length; i++) {
						if (oThumbnailItems[i].getCustomData()[0].getValue("stepId") == stepId) {
							oThumbnailItems[i].addStyleClass("selected");
							oThumbnailItems[i].$()[0].scrollIntoView();
						} else {
							oThumbnailItems[i].removeStyleClass("selected");
						}

					}

				}
			}
		},

		/**
		 * Returns the procedures list with steps for the current scene, and appends base64 data as thumbnailData and an
		 * image type as thumbnailType.
		 * 
		 * @return {JSON} <this> For example:
		 * <code>{sceneId : string, hasThumbnails : boolean, "procedures" : [id:string, name: string, steps: [{id: string, name: string, thumnailData: string, thumbnailType: string}], "portfolios": [] }</code>
		 * @public
		 */
		getProceduresAndSteps: function() {
			return this._getStepThumbnails();
		},

		/**
		 * Obtains the procedures and portfolios list for the current scene and appends base64 data as thumbnailData and an
		 * image type as thumbnailType.
		 * 
		 * @return {JSON} procs
		 * @private
		 */
		_getStepThumbnails: function() {
			var that = this;
			var procs = that._retrieveProcedures();
			if (procs.sceneId != null) {
				var thumbDataRaw;
				var ending;
				var imgType;
				var step;

				//Get thumbnails for procedures
				for (var prockey in procs.procedures) {
					var oProc = procs.procedures[prockey];
					for (var stepKey in oProc.steps) {
						step = oProc.steps[stepKey];
						thumbDataRaw = that.oDvl.Scene.RetrieveThumbnail(procs.sceneId, step.id);
						ending = thumbDataRaw.substring(thumbDataRaw.length - 2);

						//Check the prefix to detect whether this is a PNG or something else 
						var prefix = thumbDataRaw.substring(0, 3);
						if (prefix == "iVB") {
							imgType = "png";
						} else if (prefix != "eff" && prefix != "err") { //eff is the jDVL prefix for an error code returned by the core - not valid base64
							imgType = "jpg";
						} else if (prefix == "eff" || prefix == "err") {
							// Error retrieving
							imgType = null;
							thumbDataRaw = null;
						}

						//Check the ending for padding and trim if found
						if (/,$/.test(ending) || /,,$/.test(ending)) {
							thumbDataRaw = thumbDataRaw.substring(0, thumbDataRaw.length - 4);
							ending = thumbDataRaw.substring(thumbDataRaw.length - 2);
						}

						procs.procedures[prockey].steps[stepKey].thumbnailData = thumbDataRaw;
						procs.procedures[prockey].steps[stepKey].thumbnailType = imgType;
					}
				}

				//Get thumbnails for portfolios
				for ( var portkey in procs.portfolios) {
					var oPort = procs.portfolios[portkey];
					for (var portStepKey in oPort.steps) {
						step = oPort.steps[portStepKey];
						thumbDataRaw = that.oDvl.Scene.RetrieveThumbnail(procs.sceneId, step.id);
						ending = thumbDataRaw.substring(thumbDataRaw.length - 2);

						//Check the prefix to detect whether this is a PNG or something else 
						var prefix = thumbDataRaw.substring(0, 3);
						if (prefix == "iVB") {
							imgType = "png";
						} else if (prefix != "eff") { //eff is the jDVL prefix for an error code returned by the core - not valid base64
							imgType = "jpg";
						} else if (prefix == "eff") {
							// Error retrieving
							imgType = null;
						}

						procs.portfolios[portkey].steps[portStepKey].thumbnailData = thumbDataRaw;
						procs.portfolios[portkey].steps[portStepKey].thumbnailType = imgType;
					}
				}
				procs.hasThumbnails = true;
			}
			that._procedures = procs;
			return procs;
		},

		/**
		 * Returns or retrieves the list of procedures and portfolios for the current scene.
		 * 
		 * @param {string} sceneId ID of the scene from which to retrieve procedures and portfolios.
		 * @return {JSON} procs
		 * @private
		 */
		_retrieveProcedures: function(sceneId) {
			var that = this;
			var procs = {};
			if (!that._procedures) {
				procs = {
						sceneId : null,
						hasThumbnails : false,
						"procedures" : [],
						"portfolios" : []
				};
			} else {
				procs = that._procedures;
			}

			if (that._scene && (procs.sceneId != (sceneId || that._scene._dvlSceneId))) {
				var s = sceneId || that._scene._dvlSceneId;
				if (s != null) {
					var ps = that.oDvl.Scene.RetrieveProcedures(s);
					if (ps != null) {
						procs.hasThumbnails = false;
						procs.sceneId = that._scene._dvlSceneId;
						procs.procedures = ps.procedures;
						procs.portfolios = ps.portfolios;
					} else {
						procs = {
								sceneId : null,
								hasThumbnails : false,
								"procedures" : [],
								"portfolios" : []
						};
					}
				}
			}

			return procs;
		},

		/**
		 * Gets a step based on a positive or negative integer, which is used as an index relative to the index of the current step. 
		 * An index value of <code>0</code> can be used to retrieve the details of the current step.
		 * 
		 * @param {number}
		 *          relIndex Positive or negative integer representing the number to add or subtract from the index of the
		 *          current step to return the desired step; for example, //next 1, current 0, previous -1
		 * @param {number} [procedureIndex] Optional integer representing the index of the target procedure in the procedures list.
		 * @param {string} specificStepId 
		 * @return {JSON} step 
		 * @public
		 */
		getStep: function(relIndex, procedureIndex, specificStepId) {
			var that = this;
			var sc = that.oDvl.Settings.LastLoadedSceneId;
			if (sc != null) {
				procedureIndex = procedureIndex != null ? procedureIndex : 0;
				var curs = specificStepId ? specificStepId : that.instanceSettings.currentStepId;
				var step = null;
				var p = that._retrieveProcedures(sc);
				var curProc = p.procedures[procedureIndex];

				// If current or next step requested with no current step requested then return first
				if (curProc && curProc.steps.length > 0) {
					step = curProc.steps[0];
				}

				if (curs != "") {
					// Look for the current step in the specified procedure return the requested relative step
					for (var si = 0; si < curProc.steps.length; si++) {
						var _s = curProc.steps[si];
						if (_s.id == curs) {
							var x = si + relIndex;
							if (x < curProc.steps.length && x >= 0) {
								step = curProc.steps[x];
							} else {
								step = null;
							}
							break;
						}
					}
				}
			}
			return step;
		},

		/**
		 * Pauses the step that is currently playing.
		 * 
		 * @return {void}
		 * @public
		 */
		pauseStep: function() {
			var that = this;
			var s = that.oDvl.Settings.LastLoadedSceneId;
			if (s != null) {
				that.oDvl.Scene.PauseCurrentStep(s);
			}
		},

		/**
		 * Gets the total number of steps for a specified procedure, or for all procedures.
		 * 
		 * @param {string} [procedureId] An optional ID for a procedure for which to retrieve a count. 
		 * If a value for <code>procedureId</code> is specified, then get a count of the steps for the specified procedure. 
		 * Otherwise, get the total number of steps in all of the procedures for the Scene.
		 * @return {number}
		 * @private
		 */
		_stepCount: function(procedureId) {
			var that = this;
			var sc = that.oDvl.Settings.LastLoadedSceneId;
			var stepCount = 0;
			if (sc != null) {
				var p = that._retrieveProcedures(sc);
				for (var pi = 0; pi < p.procedures.length; pi++) {
					if (p.procedures[pi].id == procedureId) {
						stepCount = p.procedures[pi].steps.length;
						break;
					} else if (procedureId == null) {
						stepCount += p.procedures[pi].steps.length;
					}
				}
			}
			return stepCount;
		},

		/**
		 * Cycles through steps and procedures for the last loaded scene (<code>lastLoadedScene</code>), and returns the step preceding the current step (currentStepId.
		 * 
		 * @param {number} [procedureIndex] Optional integer representing the index of the target procedure in the procedures list.
		 * @return {JSON} 
		 * @public
		 */
		getPreviousStep: function(procedureIndex) {
			var that = this;
			return that.getStep(-1, procedureIndex);
		},

		/**
		 * Cycles through steps and procedures for the lastLoadedScene and returns the step that follows after the currentStepId.
		 * 
		 * @param {number} [procedureIndex] Optional integer representing the index of the target procedure in the procedures list.
		 * @return {JSON}
		 * @public
		 */
		getNextStep: function(procedureIndex) {
			var that = this;
			return that.getStep(1, procedureIndex);
		},

		/**
		 * Plays the specified procedure step.
		 * 
		 * @param {string} stepId The ID of the procedure step to play.
		 * @param {boolean} fromTheBeginning Default: true If <code>true</code>, tells the Viewer to play the step from the first frame.
		 * @param {boolean} continueToTheNext Default: false If <code>true</code>, tells the Viewer to play the next step in sequence.
		 * @return {void}
		 * @public
		 */
		playStep: function(stepId, fromTheBeginning, continueToTheNext) {
			var that = this;
			var s = that.oDvl.Settings.LastLoadedSceneId;
			if (s != null) {
				that.instanceSettings.currentStepId = stepId;

				// call ActivateStep(sceneId, dvlid, fromTheBeginning, continueToTheNext)
				that.oDvl.Scene.ActivateStep(s, stepId, fromTheBeginning != null ? fromTheBeginning : true,
						continueToTheNext != null ? continueToTheNext : false); 
			}
		},

		/**
		 * Plays all the steps in the specified procedure.
		 * 
		 * @param {string} [procedureId] The ID of the procedure for which to play all steps. If <code>procedureId == null</code>, then only the first step is played.
		 * @return {void}
		 * @public
		 */
		playAllSteps: function(procedureId) {
			var that = this;
			var sc = that.oDvl.Settings.LastLoadedSceneId;
			if (sc != null) {
				var ps = that._retrieveProcedures(sc);
				var procedureIndex = 0;
				if (procedureId != null && ps.procedures.length > 1){
					for (var ip = 0; ip < ps.procedures.length; ip++) {
						if (ps.procedures[ip].id == procedureId) {
							procedureIndex = ip;
							break;
						}
					}	
				}

				if (ps.procedures.length > 0) {
					var s = ps.procedures[procedureIndex].steps[0];
					if (s) {
						that.instanceSettings.currentStepId = s.id;
						that.oDvl.Scene.ActivateStep(sc, s.id, true, true);
					}
				}
			}
		}
	});

	return StepNavigation;

});
