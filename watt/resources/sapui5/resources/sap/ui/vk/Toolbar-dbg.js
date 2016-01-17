/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// Provides control sap.ui.vk.SceneTree.
sap.ui.define([
	"jquery.sap.global", "./library", "sap/ui/core/Control", "sap/ui/model/json/JSONModel"
], function(jQuery, library, Control, JSONModel) {
	"use strict";

	/**
	 * Constructor for a new Toolbar control.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * Some class description goes here.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.32.3
	 *
	 * @constructor   
	 * @public
	 * @alias sap.ui.vk.Toolbar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 * @experimental Since 1.32.0 This class is experimental and might be modified or removed in future versions.
	 */
	var Toolbar = Control.extend("sap.ui.vk.Toolbar", /** @lends sap.ui.vk.Toolbar.prototype */ {
		metadata: {
			library: "sap.ui.vk",
			properties: {
				/**
				 * Used to set the title of the Toolbar
				 * @private
				 */
				title: {
					type: "string",
					group: "Appearance",
					defaultValue: ""
				}
			},
			events: {
			},
			associations: {
				/**
				 * A toolbar instance is associated with an instance of the Viewer
				 * 
				 * @private
				 */
				viewer: { 
					type: "sap.ui.vk.Viewer",
					cardinality: "0..1"
						}
			},
			aggregations: {
				_toolbar: {
					type: "sap.m.Toolbar",
					multiple: false,
					visibility: "visible"
				}, 
				_helpButton: {
					type: "sap.m.Button",
					multiple: false,
					visibility: "visible"
				}, 
				_stepNavigationButton: {
					type: "sap.m.ToggleButton",
					multiple: false,
					visibility: "visible"
				},
				_sceneTreeButton: {
					type: "sap.m.ToggleButton",
					multiple: false,
					visibility: "visible"
				},
				_enterFullScreenButton: {
					type: "sap.m.ToggleButton",
					multiple: false,
					visibility: "visible"
				},
				_exitFullScreenButton: {
					type: "sap.m.Button",
					multiple: false,
					visibility: "visible"
				},
				_toolbarTitle: {
					type: "sap.m.Title",
					multiple: false,
					visibility: "visible"
				} 
			}
		},
		
		/*
		 * Toggles the step navigation control visibility and updates its button
		 */
		_onSceneTree: function() {
			this.oViewer = sap.ui.getCore().byId(this.getViewer());
			if (this.oViewer != null){
				var newStateSceneTreeButton = this._sceneTreeButton.getPressed();
				this.oViewer.setShowSceneTree(newStateSceneTreeButton);
				
			}
		},
		
		_onStepNavigation: function() {
			this.oViewer = sap.ui.getCore().byId(this.getViewer());
			if (this.oViewer != null){
				var newStateStepNavigationButton = this._stepNavigationButton.getPressed();
				this.oViewer.setShowStepNavigation(newStateStepNavigationButton);
				
			}
		},
		
		_onFullScreen: function() {
			this.oViewer = sap.ui.getCore().byId(this.getViewer());
			if (this.oViewer != null){
				var newStateFullScreenButton = this._enterFullScreenButton.getPressed();
				this.oViewer.setEnableFullScreen(newStateFullScreenButton);
			}
		},
		
		_fullScreenHandler: function(event) {
			var bFull = event.mParameters.isFullScreen;
			this._enterFullScreenButton.setPressed(bFull);
			
			if (bFull) {
				this._enterFullScreenButton.setIcon("sap-icon://exit-full-screen");
			} else {
				this._enterFullScreenButton.setIcon("sap-icon://full-screen");
			}
		},
		
		init: function() {
			if (Control.prototype.init) {
				Control.prototype.init.apply(this);
			}
			this.oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.vk.i18n");
			var _toolbarSpacer = new sap.m.ToolbarSpacer();

			var _helpButton = new sap.m.Button({
				icon: "sap-icon://sys-help",
				type: sap.m.ButtonType.Transparent,
				tooltip : this.oResourceBundle.getText("VIEWER_HELPBUTTONTOOLTIP")
			}); 
			this.setAggregation("_helpButton", _helpButton); 
			
			this._stepNavigationButton = new sap.m.ToggleButton({
				icon: "sap-icon://step",
				type: sap.m.ButtonType.Transparent,
				enabled: false,
				tooltip : this.oResourceBundle.getText("STEP_NAV_MENUBUTTONTOOLTIP"),
				press: this._onStepNavigation.bind(this)
			}); 
			this.setAggregation("_stepNavigationButton", this._stepNavigationButton); 
			
			this._sceneTreeButton = new sap.m.ToggleButton({
				icon: "sap-icon://tree",
				type: sap.m.ButtonType.Transparent,
				tooltip : this.oResourceBundle.getText("SCENETREE_MENUBUTTONTOOLTIP"),
				press: this._onSceneTree.bind(this)
			}); 
			this.setAggregation("_sceneTreeButton", this._sceneTreeButton); 
			
			this._enterFullScreenButton = new sap.m.ToggleButton({
				icon: "sap-icon://full-screen",
				type: sap.m.ButtonType.Transparent,
				tooltip : this.oResourceBundle.getText("VIEWER_FULLSCREENBUTTONTOOLTIP"),
				press: this._onFullScreen.bind(this)
			}); 
			this.setAggregation("_enterFullScreenButton", this._enterFullScreenButton); 
			
			var _exitFullScreenButton = new sap.m.Button({
				icon: "sap-icon://exit-full-screen",
				type: sap.m.ButtonType.Transparent,
				tooltip : this.oResourceBundle.getText("VIEWER_FULLSCREENBUTTONTOOLTIP")
			}); 
			this.setAggregation("_exitFullScreenButton", _exitFullScreenButton); 
			
			
			this._toolbarTitle = new sap.m.Title();
			this.setAggregation("_toolbarTitle", this._toolbarTitle);
			
			this._toolbar = new sap.m.Toolbar({
				design: sap.m.ToolbarDesign.Solid, 
				content: [this._toolbarTitle,
				          _toolbarSpacer, 
				          new sap.m.ToolbarSeparator(), 
				          this._sceneTreeButton, 
				          new sap.m.ToolbarSeparator(),
				          this._stepNavigationButton,
				          new sap.m.ToolbarSeparator(),
				          this._enterFullScreenButton
				          ] 
			});

			this.setAggregation("_toolbar", this._toolbar, true);
		},
		
		exit: function() {
			this.oViewer = sap.ui.getCore().byId(this.getViewer()); 
			if (this.oViewer) {
				this.oViewer.detachFullScreen(this._fullScreenHandler.bind(this));
			}
		},
		
		onBeforeRendering: function() {
			this._toolbar.setVisible(true);
			this._toolbarTitle.setText(this.getTitle());
		},
		
		refresh: function () {
			this.oViewer = sap.ui.getCore().byId(this.getViewer()); 
			this._stepNavigationButton.setPressed(this.oViewer.getShowStepNavigation());
			this._stepNavigationButton.setEnabled(this.oViewer.getEnableStepNavigation());
			this._sceneTreeButton.setPressed(this.oViewer.getShowSceneTree());
			this._sceneTreeButton.setEnabled(this.oViewer.getEnableSceneTree());
			
			this.oViewer.attachFullScreen(this._fullScreenHandler.bind(this));
			return true; 
		},
		
		onAfterRendering: function() {
			this.refresh();
		}
	});

	return Toolbar;

}, /* bExport= */ true);
