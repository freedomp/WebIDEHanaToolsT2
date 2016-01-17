/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.rta.ToolsMenu.
sap.ui.define([
	'jquery.sap.global', 
	'./library', 
	'sap/ui/core/Control', 
	'sap/m/Toolbar',
	'sap/m/ToolbarDesign',
	'sap/m/ToolbarLayoutData',
	'sap/m/ToolbarSpacer',
	'sap/m/Label',
	'sap/ui/fl/registry/Settings',
	'sap/ui/fl/Utils'
	],
	function(
		jQuery, 
		library, 
		Control, 
		Toolbar,
		ToolbarDesign,
		ToolbarLayoutData,
		ToolbarSpacer,
		Label,
		FlexSettings,
		Utils) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.ToolsMenu control.
	 *
	 * @class
	 * Contains all the necessary Toolbars for the Runtime Authoring
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.ToolsMenu
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ToolsMenu = Control.extend("sap.ui.rta.ToolsMenu", {
		metadata : {

			library : "sap.ui.rta",
			// ---- control specific ----
			aggregations : {
				"toolbars" : {
					type : "sap.m.Toolbar",
					multiple : true,
					singularName : "toolbar"
				}
			},
			events : {
				/**
				 * Event is fired when the Toolbars are closed (Exit button pressed)
				 */
				
				"close" : {},
				"restore": {},
				"transport" : {}
			}
		}

	});

	/**
	 * Initialization of the ToolsMenu Control
	 * @private
	 */
	ToolsMenu.prototype.init = function() {

		// Initialize Variables
		var oAdaptModeLabel = null;
		var oAppTitleLabel = null;
		var oButtonExit = null;
		var sText = null;
		var oLeftSpacer = null;
		var oRightSpacer = null;

		// Get messagebundle.properties for sap.ui.rta
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		// create TOP ToolBar
		if (!this._oToolBarTop) {

			// Label 'Adaptation Mode'
			sText = this._oRb.getText("TOOLBAR_TITLE");
			oAdaptModeLabel = new Label({
				text : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});

			// Label 'Application Name'
			sText = null;
			oAppTitleLabel = new Label({
				text : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			
			// Button 'Restore'
			sText = this._oRb.getText("BTN_RESTORE");
			this._oButtonRestore = new sap.m.Button({
				type:"Transparent",
				text : sText,
				visible: false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonRestore.data("Action", "RESTORE",true);
			this._oButtonRestore.attachEvent('press', this._onRestore, this);

			// Button 'Exit'
			sText = this._oRb.getText("BTN_EXIT");
			oButtonExit = new sap.m.Button({
				type:"Transparent",
				text : sText,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			oButtonExit.data("Action", "EXIT",true);
			oButtonExit.attachEvent('press', this.close, this);
			
			// Button 'Transport'
			sText = this._oRb.getText("BTN_TRANSPORT");
			this._oButtonTransport = new sap.m.Button({
				type:"Transparent",
				text : "Transport",
				visible : false,
				tooltip : sText,
				layoutData : new ToolbarLayoutData({
					shrinkable : false
				})
			});
			this._oButtonTransport.data("Action", "TRANSPORT", true);
			this._oButtonTransport.attachEvent('press', this._onTransport, this);
			// Space between Toolbar Elements
			oLeftSpacer = new ToolbarSpacer();
			oRightSpacer = new ToolbarSpacer();

			//create Toolbar
			this._oToolBarTop = new Toolbar({
				active : true,
				content : [
							oAdaptModeLabel,
							oLeftSpacer,
							oAppTitleLabel,
							oRightSpacer,
							this._oButtonRestore,
							this._oButtonTransport,
							oButtonExit
				]
			});

			this._oToolBarTop.addStyleClass("sapUiRTAToolBarTop");
			this.addToolbar(this._oToolBarTop);
		}

		// create Botttom ToolBar
		if (!this._oToolBarBottom) {
			//create Toolbar (empty so far)
			this._oToolBarBottom = new Toolbar({
				active : true,
				content : []
			});

			this._oToolBarBottom.addStyleClass("sapUiRTAToolBarBottom");
			this.addToolbar(this._oToolBarBottom);
		}

		this.placeAt(sap.ui.getCore().getStaticAreaRef());

	};
	
	ToolsMenu.prototype._onTransport = function() {
		this.fireTransport();
	};
	
	/**
	 * Check if the transports are available,
	 * transports are available in non-productive systems
	 * and no merge errors has occoured
	 * currently set's the visibility for Transport and Restore button
	 * @private
	 * @returns {Promise}
	 */
	ToolsMenu.prototype._checkTransportAvailable = function() {
		var that = this;
		return FlexSettings.getInstance(Utils.getComponentClassName(this._oRootControl)).then(function(oSettings) {
			if (!oSettings.isProductiveSystem() && !oSettings.hasMergeErrorOccured()) {
				that._oButtonTransport.setVisible(true);
				that._oButtonRestore.setVisible(true);
			}
		});
	};

	/**
	 * Makes the Toolbars visible
	 * @public
	 */
	ToolsMenu.prototype.show = function() {
		this._oToolBarTop.addStyleClass("sapUiRTAToolBarTopVisible");
		this._oToolBarTop.removeStyleClass("sapUiRTAToolBarTopInvisible");
		this._oToolBarBottom.addStyleClass("sapUiRTAToolBarBottomVisible");
		this._oToolBarBottom.removeStyleClass("sapUiRTAToolBarBottomInvisible");		
	};

	/**
	 * Makes the Toolbars invisible
	 * @public
	 */
	ToolsMenu.prototype.hide = function() {
		this._oToolBarTop.addStyleClass("sapUiRTAToolBarTopInvisible");
		this._oToolBarBottom.addStyleClass("sapUiRTAToolBarBottomInvisible");
	};

	/**
	 * Discard all the LREP changes and restore the default app state
	 * @private
	 */
	ToolsMenu.prototype._onRestore = function() {

		this.fireRestore();
	};
	
	/**
	 * Closing the ToolsMenu
	 * @public
	 */
	ToolsMenu.prototype.close = function() {
		var that = this;
		var oToolBarDOM = document.getElementsByClassName("sapUiRTAToolBarBottom")[0];
		var fnAnimationEnd = function() {
			that.fireClose();
		};

		// all types of CSS3 animationend events for different browsers
		oToolBarDOM.addEventListener("webkitAnimationEnd", fnAnimationEnd);
		oToolBarDOM.addEventListener("animationend", fnAnimationEnd);
		oToolBarDOM.addEventListener("oanimationend", fnAnimationEnd);

		this.hide();
	};

	/**
	 * Set the Application Title
	 * @param {string} sTitle Application Title
	 * @public
	 */
	// Method for setting the Application Title 
	ToolsMenu.prototype.setTitle = function(sTitle) {
		var oLabel = this._oToolBarTop.getContent()[2];
		oLabel.setText(sTitle);
	};
	
	/**
	 * Set the root control
	 * @param {sap.ui.core.Control} oControl - SAPUI5 control
	 * @public
	 */
	ToolsMenu.prototype.setRootControl = function(oControl) {
		this._oRootControl = oControl;
	};
	
	/**
	 * Adapt the visibility of the buttons in the ToolsMenu
	 * depending on which features the system offers
	 * @private
	 */
	ToolsMenu.prototype.adaptButtonsVisibility = function() {
		// Transport & Restore Button
		this._checkTransportAvailable();
	};

	return ToolsMenu;

}, /* bExport= */ true);
