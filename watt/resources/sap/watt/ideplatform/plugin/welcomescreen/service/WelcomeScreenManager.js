define([ "sap/watt/core/Proxy" ], function(Proxy) {
	"use strict";
	
	/**
	 * =============================
	 * CONTAINER METHODS
	 * =============================
	 */
	var WelcomeScreenContainer = function(sId, mConfig, oContext, oProxy) {
		this._sId = sId;
		this._mConfig = mConfig;
		this._oContext = oContext;
		this._oProxy = oProxy;
	};

	WelcomeScreenContainer.prototype.getContainer = function() {
		return this._oProxy.getContainer();
	};
	
	WelcomeScreenContainer.prototype.getSection = function() {
	    return this._mConfig.section;
	};
	
	WelcomeScreenContainer.prototype.getPriority = function() {
	    return this._mConfig.priority;
	};

	/**
	 * =============================
	 * REGISTRY METHODS
	 * =============================
	 */
	var WelcomeScreenManager = {};
    
	WelcomeScreenManager._mContainers = {};

	WelcomeScreenManager.register = function(sId, mConfig, oContext) {
		if (this._mContainers[sId]) {
			oContext.service.log.error("WelcomeScreen", sId + " Container already registered", [ "user" ]).done();
		} else {
			var mNewConfig = {
				id : null,
				container : null,
				priority : null,
				section : null
			};

			if (typeof mConfig === "string") {
				mNewConfig.container = mConfig;
			} else {
				mNewConfig = jQuery.extend(this._mConfig, mConfig);
			}

			var that = this;
			if (mNewConfig.container instanceof Proxy) {
				var oWelcomeScreenContainer = new WelcomeScreenContainer(sId, mNewConfig, oContext, mNewConfig.container);
				that._mContainers[sId] = oWelcomeScreenContainer;
				return oWelcomeScreenContainer;
			} else {
				throw new Error(oContext.i18n.getText("i18n", "WelcomeScreen_instance_of_Proxy"));
			}
		}
	};

	return {

		/**
		 * Register a container to be displayed on the welcome screen
		 *
		 * @param mConfig {object} the settings of the WelcomeScreenContainer to register
		 */
		configure : function(mConfig) {
			var that = this;
			jQuery.each(mConfig.containers, function(iIndex, container) {
				WelcomeScreenManager.register(container.id, container, that.context);
			});
		},

		/**
		 * Retrieve all the registered containers
		 *
		 * @return {object} a map holds all the containers by their IDs
		 */
		getWelcomeContainers : function() {
			return WelcomeScreenManager._mContainers;
		}

	};
});