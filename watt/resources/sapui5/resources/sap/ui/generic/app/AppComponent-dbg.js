/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// ----------------------------------------------------------------------------------
// Provides base class sap.ui.generic.app.AppComponent for all generic app components
// ----------------------------------------------------------------------------------
sap.ui.define([
	'jquery.sap.global', 'sap/ui/core/UIComponent', 'sap/ui/generic/app/transaction/TransactionController', 'sap/ui/generic/app/navigation/NavigationController', 'sap/m/NavContainer'
], function(jQuery, UIComponent, TransactionController, NavigationController, NavContainer) {
	"use strict";

	/**
	 * Base Class for application components.
	 * 
	 * @class The AppComponent class creates and initializes a new application component. It boots up the SmartTemplate application, creates the
	 *        {@link sap.ui.generic.app.navigation.NavigationController NavigationController}, {@link sap.ui.generic.app.transaction.TransactionController TransactionController} and
	 *        {@link sap.m.NavContainer NavContainer}, which embeds Smart Template components defined in the app descriptor.
	 * @public
	 * @extends sap.ui.core.UIComponent
	 * @version 1.32.7
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.AppComponent
	 */
	var AppComponent = UIComponent.extend("sap.ui.generic.app.AppComponent", {
		metadata: {
			config: {
				"title": "SAP UI Application Component", // TODO: This should be set from App descriptor
				fullWidth: true
			},
			routing: {
				config: {
					routerClass: "sap.m.routing.Router",
					viewType: "XML",
					viewPath: "",
					clearTarget: false
				},
				routes: []
			},
			library: "sap.ui.generic.app"
		}
	});

	/**
	 * Initializes the AppComponent instance after creation.
	 * 
	 * @protected
	 */
	AppComponent.prototype.init = function() {
		var oModel;
		// call overwritten init (calls createContent)
		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

		oModel = this.getModel();
		if (oModel) {
			// workaround until Modules Factory is available
			this._oTransactionController = new TransactionController(oModel);
			this._oNavigationController = new NavigationController(this);
		}
	};

	/**
	 * Creates the content of the component.
	 * 
	 * @public
	 * @returns {Object} the root view
	 */
	AppComponent.prototype.createContent = function() {
		// assign message model
		this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");

		this._oNavContainer = new NavContainer({
			id: this.getId() + '-appContent'
		});

		if (sap.ui.Device.system.desktop) {
			this._oNavContainer.addStyleClass("sapUiSizeCompact");
		}

		// done
		return this._oNavContainer;
	};

	/**
	 * Returns the application configuration metadata that has been created and/or specified in the app descriptor.
	 * 
	 * @returns {Object} the application configuration
	 * @public
	 */
	AppComponent.prototype.getConfig = function() {
		var oConfig, oMeta;
		if (!this._oConfig) {
			oMeta = this.getMetadata();
			oConfig = oMeta.getManifestEntry('sap.ui.generic.app');
			this._oConfig = oConfig;
		}
		return this._oConfig;
	};

	/**
	 * Returns the reference to the transaction controller instance that has been created by AppComponent.
	 * 
	 * @returns {sap.ui.generic.app.transaction.TransactionController} the transaction controller instance
	 * @public
	 */
	AppComponent.prototype.getTransactionController = function() {
		return this._oTransactionController;
	};

	/**
	 * Returns the reference to the navigation controller instance that has been created by AppComponent.
	 * 
	 * @returns {sap.ui.generic.app.navigation.NavigationController} the navigation controller instance
	 * @public
	 */
	AppComponent.prototype.getNavigationController = function() {
		return this._oNavigationController;
	};

	/**
	 * Cleans up the component instance before destruction.
	 * 
	 * @protected
	 */
	AppComponent.prototype.exit = function() {
		if (this._oNavContainer) {
			this._oNavContainer.destroy();
		}
		this._oNavContainer = null;
		if (this._oTransactionController) {
			this._oTransactionController.destroy();
		}
		this._oTransactionController = null;
		if (this._oNavigationController) {
			this._oNavigationController.destroy();
		}
		this._oNavigationController = null;
	};

	return AppComponent;

}, /* bExport= */true);
