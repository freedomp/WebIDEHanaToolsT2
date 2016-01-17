/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

// ------------------------------------------------------------------------------------------------------------
// Provides class sap.ui.generic.app.navigation.NavigationController to handle navigation/routing related tasks
// ------------------------------------------------------------------------------------------------------------
sap.ui.define([
	'jquery.sap.global', 'sap/ui/base/Object', 'sap/ui/core/ComponentContainer', 'sap/ui/core/routing/HashChanger', 'sap/ui/core/routing/History', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator', 'sap/m/MessageBox', 'sap/m/MessagePage', 'sap/m/Link'
], function(jQuery, BaseObject, ComponentContainer, HashChanger, History, Filter, FilterOperator, MessageBox, MessagePage, Link) {
	"use strict";

	/**
	 * Handles all navigation and routing-related tasks for the application.
	 * 
	 * @class The NavigationController class creates and initializes a new navigation controller with the given
	 *        {@link sap.ui.generic.app.AppComponent AppComponent}.
	 * @param {sap.ui.generic.app.AppComponent} oComponent The AppComponent instance
	 * @public
	 * @extends sap.ui.base.Object
	 * @version 1.32.7
	 * @since 1.30.0
	 * @alias sap.ui.generic.app.navigation.NavigationController
	 */
	var NavigationController = BaseObject.extend("sap.ui.generic.app.navigation.NavigationController", {
		metadata: {
			library: "sap.ui.generic.app"
		},
		constructor: function(oComponent) {
			if (!oComponent || !oComponent.getRouter()) {
				throw "No component with router passed";
			}
			// inherit from base object.
			BaseObject.apply(this, arguments);
			this.oRouter = oComponent.getRouter();
			this.oViews = {};
			this.oComponent = oComponent;
			this._oNavContainer = this.oComponent._oNavContainer;
			this._sNavigationTargetId = this._oNavContainer.getId();

			this.oRouter.attachRouteMatched(this._handleRouteMatched, this);
			this.oRouter.attachBypassed(this._handleBypassed, this);

			// TODO: this has to be clarified and fixed
			this.oRouter._oViews._getViewWithGlobalId = function(oView) {
				// Test only
				if (!this.oViews[oView.viewName]) {
					var oRoute = this.oRouter.getRoute(oView.viewName);
					if (oRoute && oRoute._oConfig) {
						this.oViews[oView.viewName] = this._createComponentInstance(oRoute._oConfig);
					} else {
						this.oViews[oView.viewName] = sap.ui.view({
							viewName: oView.viewName,
							type: oView.type,
							height: "100%"
						});
					}
				}
				return this.oViews[oView.viewName];
			}.bind(this);
			this._oHashChanger = HashChanger.getInstance();
			this._generateRoutingMetadata();
			this._initialise();
		}
	});

	NavigationController._sChanges = "Changes";

	/**
	 * Initialises the necessary info
	 * 
	 * @private
	 */
	NavigationController.prototype._initialise = function() {
		var oData;
		oData = this.oComponent.getComponentData();
		if (oData) {
			this._oStartupParameters = oData.startupParameters;
		}
		// check if there entitySet and startup parameters are present and no hash exists!
		if (this._sEntitySet && this._oStartupParameters && !this._oHashChanger.getHash()) {
			this._processStartupParameters();
		} else {
			this._initialiseRouting();
		}
	};

	/**
	 * checks the startup parameters for triggering navigation
	 * 
	 * @private
	 */
	NavigationController.prototype._processStartupParameters = function() {
		var oModel;
		// wait for the ODataMetaModel to be loaded
		oModel = this.oComponent.getModel();
		oModel.getMetaModel().loaded().then(function() {
			var oEntitySet, oEntityType, fCheckKeys, bCheckKeys, aSemanticKey, sHash;
			fCheckKeys = function(aKeys, mParams) {
				var i, iLength, bSuccess = false, oKey, sKeyProperty;
				if (mParams && aKeys) {
					iLength = aKeys.length;
					for (i = 0; i < iLength; i++) {
						// assume key handling shall be successful
						bSuccess = true;
						oKey = aKeys[i];
						// Keys are located either at name (resource/entity key) or PropertyPath (SemanticKey annotation)
						sKeyProperty = oKey.name || oKey.PropertyPath;
						if (!mParams[sKeyProperty] || mParams[sKeyProperty].length > 1) {
							// if no key params or multiple key params are present set unsuccessful and break
							bSuccess = false;
							break;
						}
					}
				}
				return bSuccess;
			};

			oEntitySet = oModel.getMetaModel().getODataEntitySet(this._sEntitySet);
			if (oEntitySet) {
				oEntityType = oModel.getMetaModel().getODataEntityType(oEntitySet.entityType);
			}
			if (oEntityType) {
				bCheckKeys = fCheckKeys(oEntityType.key.propertyRef, this._oStartupParameters);
			}

			if (bCheckKeys) {
				// if entity key check passes, a full technical key can be created
				sHash = oModel.createKey(this._sEntitySet, this._oStartupParameters);
				if (sHash) {
					this._oHashChanger.replaceHash(sHash);
				}
			} else {
				// get the semantic key annotation
				aSemanticKey = oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
				bCheckKeys = fCheckKeys(aSemanticKey, this._oStartupParameters);

				if (bCheckKeys) {
					this._readObject(aSemanticKey, this._oStartupParameters, oModel);
					// read will trigger the initialisation as needed
					return;
				}
			}
			this._initialiseRouting();
		}.bind(this));
	};

	/**
	 * Creates necessary routing info and initialises the Router
	 * 
	 * @private
	 */
	NavigationController.prototype._initialiseRouting = function() {
		var sHash;
		this._oHistory = new History(this._oHashChanger);
		if (!this._oHashChanger.getHash()) {
			sHash = "";
			// no route is set yet, check if start entity was passed via parameter
			if (this._oStartupParameters && this._oStartupParameters.route && this._oStartupParameters.route.length === 1) {
				sHash = this._oStartupParameters.route[0];
				this._oHashChanger.replaceHash(sHash);
			}
		}
		this.oRouter.initialize();
	};

	/**
	 * Creates necessary routing metadata from configuration and adds it to the Router
	 * 
	 * @private
	 */
	NavigationController.prototype._generateRoutingMetadata = function() {
		var oConfig = this.oComponent.getConfig(), oTopRouteConfig, oTopRoute;
		if (!oConfig.pages || !oConfig.pages.length || oConfig.pages.length === 0) {
			throw new Error("Route Configuration missing");
		} else if (oConfig.pages.length > 1) {
			throw new Error("Currently only one Top route supported");
		} else {
			// create Top-Route
			// currently only one top route supported
			oTopRouteConfig = oConfig.pages[0];

			// Store the top route's entitySet, since it could be used later
			this._sEntitySet = oTopRouteConfig.entitySet;

			oTopRoute = this._createRoute(oTopRouteConfig, "root", 0);
			this.oRouter.addRoute(oTopRoute);

			this._createQueryRoute(oTopRoute);

			this._createChildRoutes(oTopRouteConfig, 0, null);
		}
	};

	/**
	 * Creates child route from the specified route configuration
	 * 
	 * @private
	 * @param {Object} oRoute - the route configuration
	 * @param {Number} iLevel - the level
	 * @param {Object} oParent - the parent route (if any)
	 */
	NavigationController.prototype._createChildRoutes = function(oRoute, iLevel, oParent) {
		var i, iLen;
		if (oRoute.pages) {
			iLen = oRoute.pages.length;
			for (i = 0; i < iLen; i++) {
				this._createRoutes(oRoute.pages[i], (iLevel + 1), oParent);
			}
		}
	};

	/**
	 * Creates all necessary route(s) metadata from configuration and adds it to the Router instance
	 * 
	 * @private
	 * @param {Object} oRoute - the route configuration
	 * @param {Number} iLevel - the level
	 * @param {Object} oParent - the parent route (if any)
	 */
	NavigationController.prototype._createRoutes = function(oRoute, iLevel, oParent) {
		var oNewRoute = this._createRoute(oRoute, oRoute.component.list ? "aggregation" : "detail", iLevel, oParent);
		this.oRouter.addRoute(oNewRoute);
		this._createQueryRoute(oNewRoute);
		this._createChildRoutes(oRoute, iLevel, oNewRoute);
	};

	/**
	 * Creates a Query route from the specified route and adds it to the router
	 * 
	 * @private
	 * @param {Object} oRoute - the route configuration
	 */
	NavigationController.prototype._createQueryRoute = function(oRoute) {
		var oQueryRoute = jQuery.extend({}, oRoute);
		oQueryRoute.name = oRoute.name + "query";
		oQueryRoute.pattern = oRoute.pattern + "{?query}";
		this.oRouter.addRoute(oQueryRoute);
	};

	/**
	 * Creates and returns a route metadata from configuration
	 * 
	 * @private
	 * @param {Object} oRoute - the route configuration
	 * @param {string} sOperation - the operation for which the route has to be created
	 * @param {Number} iLevel - the level
	 * @param {Object} oParentRoute - the parent route (if any)
	 * @returns {Object} the created route metadata
	 */
	NavigationController.prototype._createRoute = function(oRoute, sOperation, iLevel, oParentRoute) {
		var sPathPattern, oNewRoute;
		sPathPattern = oRoute.navigationProperty || oRoute.entitySet;

		oNewRoute = jQuery.extend({}, oRoute);
		oNewRoute.path = "/" + oRoute.entitySet;
		oNewRoute.operation = sOperation;
		oNewRoute.viewLevel = iLevel;
		// TODO: use only component name here?
		oNewRoute.template = oRoute.component ? (oRoute.component.name || oRoute.component) : oRoute.template;

		switch (sOperation) {
			case "root":
				oNewRoute.name = 'root';
				oNewRoute.pattern = '';
				break;
			case "aggregation":
				oNewRoute.name = sPathPattern + "~aggregation";
				oNewRoute.pattern = sPathPattern;
				oNewRoute.path = oParentRoute.path || oNewRoute.path;
				oNewRoute.entitySet = oParentRoute.entitySet || oNewRoute.entitySet;
				break;
			default:
				oNewRoute.name = sPathPattern;
				oNewRoute.pattern = sPathPattern + "({keys" + iLevel + "})";
				break;
		}

		if (oParentRoute) {
			oNewRoute.name = oParentRoute.name + "/" + oNewRoute.name;
			oNewRoute.pattern = oParentRoute.pattern + "/" + oNewRoute.pattern;
			oNewRoute.parentEntitySet = oParentRoute.entitySet;
		}
		oNewRoute.view = oNewRoute.name; // TODO: simplify this
		oNewRoute.controlId = this._sNavigationTargetId;
		oNewRoute.controlAggregation = "pages";
		return oNewRoute;
	};

	/**
	 * Creates a new ComponentContainer with template from routing configuration
	 * 
	 * @private
	 * @param {Object} oRouteConfig - the route configuration
	 * @returns {sap.ui.core.ComponentContainer} instance of the component container
	 */
	NavigationController.prototype._createComponentInstance = function(oRouteConfig) {
		var sTemplate, sEntitySet, oComponentContainer, oSettings;
		sTemplate = oRouteConfig.template;
		sEntitySet = oRouteConfig.entitySet;

		oSettings = {
			appComponent: this.oComponent,
			isLeaf: !oRouteConfig.pages || !oRouteConfig.pages.length,
			subPages: oRouteConfig.pages,
			entitySet: sEntitySet,
			navigationProperty: oRouteConfig.navigationProperty,
			componentData: {
				preprocessorsData: {}
			}
		};

		if (oRouteConfig.component.settings) {
			// consider component specific settings from app descriptor
			jQuery.extend(oSettings, oRouteConfig.component.settings);
		}

		try {
			oComponentContainer = new ComponentContainer({
				name: sTemplate,
				propagateModel: true,
				width: '100%',
				height: '100%',
				handleValidation: true,
				settings: oSettings
			});
			return oComponentContainer;
		} catch (e) {
			throw new Error("Component " + sTemplate + " could not be loaded");
		}
	};

	/**
	 * Event hander fired by router once it finds a match
	 * 
	 * @private
	 * @param {Object} oEvt - the event object
	 */
	NavigationController.prototype._handleRouteMatched = function(oEvt) {
		var oView, oRouteConfig, sKey, oKeys, sPath;
		oView = oEvt.getParameter("view");
		oRouteConfig = oEvt.getParameter("config");

		// remove all messages before setting a new binding context
		sap.ui.getCore().getMessageManager().removeAllMessages();

		// If the path from a binding context exists --> use it instead of checking for operation in route config
		if (this._oTargetContextPath) {
			sPath = this._oTargetContextPath;
			// delete the path from binding context, so it not read again
			delete this._oTargetContextPath;
			// 
		} else if (oRouteConfig.operation !== "root") {// check for operation
			// The view is for an instance
			sPath = this._getContextPath(oRouteConfig);
			oKeys = oEvt.getParameter("arguments");
			delete oKeys["?query"];
			if (oKeys) {
				for (sKey in oKeys) {
					// replace each key in pattern with corresponding key in argument
					sPath = sPath.replace("{" + sKey + "}", oKeys[sKey]);
				}
			}
		}

		// Bind the view from the path
		this._activateView(oView, sPath);
	};

	/**
	 * calls onActivate on the specified view, if it exists
	 * 
	 * @private
	 * @param {Object} oView - the view
	 * @param {string} sPath - the path in the model
	 * @param {boolean} bDelayedActivate - optional boolean flag, true if activate is (re-)triggered delayed
	 */
	NavigationController.prototype._activateView = function(oView, sPath, bDelayedActivate) {
		var oOldPage, oOldComponent, oComponent, oViewEventDelegate;
		if (oView) {
			// Check if a component exists
			if (oView.getComponentInstance) {
				oComponent = oView.getComponentInstance();
				// if no component exists --> delay handling for activation/binding by attaching to the rendering delegate
				if (!oComponent) {
					oViewEventDelegate = {
						onBeforeRendering: function() {
							// at this point of time the component should exists;
							// --> if so, retrigger the activate call
							oView.removeEventDelegate(oViewEventDelegate, this);
							if (oView.getComponentInstance && oView.getComponentInstance()) {
								this._activateView(oView, sPath, true);
							}
						}
					};
					oView.addEventDelegate(oViewEventDelegate, this);
					return;
				}
			}

			// Check if an old/active view exists
			// try to use previous page - since it should be the old one by default
			oOldPage = this._oNavContainer.getPreviousPage();
			// if activate was not delayed and the view is not same as the current page - use the current page; since we still might not haven
			// transitioned to the new page
			if (!bDelayedActivate && (oOldPage || oView !== this._oNavContainer.getCurrentPage())) {
				oOldPage = this._oNavContainer.getCurrentPage();
			}
			// trigger onDeactivate on the old component instance
			if (oOldPage && oOldPage.getComponentInstance) {
				oOldComponent = oOldPage.getComponentInstance();
				if (oOldComponent && oOldComponent.onDeactivate) {
					oOldComponent.onDeactivate();
				}
			}

			// trigger onActivate on the component instance
			if (oComponent) {
				if (oComponent.onActivate) {
					oComponent.onActivate(sPath);
				}
				if (!oComponent.getPreventBinding()) {
					this._bindView(oView, sPath);
				}
			}
		}
	};

	/**
	 * binds the view with the specified path
	 * 
	 * @private
	 * @param {Object} oView - the view
	 * @param {string} sPath - the path in the model
	 */
	NavigationController.prototype._bindView = function(oView, sPath) {
		var oEntity;
		if (oView && sPath) {
			// check if path refers to an entry created in the local model only
			// TODO: replace this lines with standard UI5 method once available
			oEntity = oView.getModel().getProperty(sPath);
			if (oEntity && oEntity.__metadata && oEntity.__metadata.created) {
				// in this case no bindElement can be used but setBindingContext instead
				// always unbind first
				oView.unbindElement();
				oView.setBindingContext(oView.getModel().getContext(sPath));
			} else {
				oView.bindElement({
					path: sPath,
					events: {
						dataReceived: this._handleDataReceived.bind(this)
					},
					batchGroupId: NavigationController._sChanges,
					changeSetId: NavigationController._sChanges
				});
			}
		}

	};

	/**
	 * Sets/Replaces the hash via the router/hash changer
	 * 
	 * @private
	 * @param {string} sHash - the hash string
	 * @param {boolean} bReplace - whether the hash should be replaced
	 */
	NavigationController.prototype._navigate = function(sHash, bReplace) {
		if (!sHash) {
			sHash = ""; // when no hash is passed, undefined seems to be used in the URL
		}
		if (bReplace) {
			this.oRouter.oHashChanger.replaceHash(sHash);
		} else {
			this.oRouter.oHashChanger.setHash(sHash);
		}
	};

	/**
	 * Navigates to the root view.
	 * 
	 * @public
	 * @param {boolean} bReplace If this is true the navigation/hash will be replaced
	 */
	NavigationController.prototype.navigateToRoot = function(bReplace) {
		this._navigate("", bReplace);
	};

	/**
	 * Navigates back to the previous view.
	 * 
	 * @public
	 * @param {boolean} bReplace If this is true the navigation/hash will be replaced
	 */
	NavigationController.prototype.navigateBack = function(bReplace) {
		this._navigate(this._oHistory ? this._oHistory.getPreviousHash() : "", bReplace);
	};

	/**
	 * Navigates to the specified context.
	 * 
	 * @public
	 * @param {Object} oTargetContext - The context to navigate to
	 * @param {string} sNavigationProperty - The navigation property
	 * @param {boolean} bReplace If this is true the navigation/hash will be replaced
	 */
	NavigationController.prototype.navigateToContext = function(oTargetContext, sNavigationProperty, bReplace) {
		var sHash = this.oRouter.oHashChanger.getHash(), sPath, fTruncateHash;

		if (oTargetContext) {
			// get the navigation path from binding context
			sPath = this._getNavigationPath(oTargetContext, sNavigationProperty);

			if (sNavigationProperty) {
				fTruncateHash = function(sHash, sMatch, iDelta) {
					var iIndex;
					if (sHash && sMatch) {
						if (isNaN(iDelta)) {
							iDelta = 0;
						}
						iIndex = sHash.indexOf(sMatch);
						if (iIndex > -1) {
							sHash = sHash.substring(0, iIndex - iDelta);
						}
					}
					return sHash;
				};
				// add a leading "/" is none exists
				if (sNavigationProperty.indexOf("/") < 0) {
					sNavigationProperty = "/" + sNavigationProperty;
				}
				// hash contains EntitySet(Key)/NavProp() -> only EntitySet(Key) is required
				sHash = fTruncateHash(sHash, sNavigationProperty);
				// get hash path until "?"
				sHash = fTruncateHash(sHash, "?");

				// just concatenate current hash with selected path e.g. Root(Key) + / + NavProp(Key)
				if (sHash) {
					sPath = sHash + "/" + sPath;
				}
			}

			// Store the context path and use it in _handleNavigation, so no data retrieval is done!
			this._oTargetContextPath = oTargetContext.getPath();

			// navigate to context
			this._navigate(sPath, bReplace);
		}
	};

	/**
	 * get the navigation path from binding context
	 * 
	 * @private
	 * @param {Object} oTargetContext - the binding context
	 * @param {string} sNavigationProperty - the navigation property that should replace the entity
	 * @returns {string} the resolved path
	 */
	NavigationController.prototype._getNavigationPath = function(oTargetContext, sNavigationProperty) {
		var sPath, aPath, sEntitySet;
		// Get the path from binding context without "/"
		sPath = oTargetContext.getPath().substring(1);
		// Get the entityset from path
		aPath = sPath.split('(');
		if (aPath[0]) {
			sEntitySet = aPath[0];
		}
		// Replace the entitySet with navigationProperty in the path, if it is specified
		if (sNavigationProperty) {
			sPath = sPath.replace(sEntitySet, sNavigationProperty);
			if (sPath.indexOf("/") === 0) {
				sPath = sPath.substring(1);
			}
		}
		return sPath;
	};

	/**
	 * get the context path from navigation path/pattern
	 * 
	 * @private
	 * @param {Object} oRouteConfig - the route configuration
	 * @returns {String} the context path
	 */
	NavigationController.prototype._getContextPath = function(oRouteConfig) {
		var sPath, sPathPattern, iIndex;
		if (oRouteConfig) {
			// get the pattern from route configuration
			sPath = oRouteConfig.pattern;
			// get the current path pattern from either navigation property or the entitySet
			sPathPattern = oRouteConfig.navigationProperty || oRouteConfig.entitySet;
			if (sPath && sPathPattern) {
				iIndex = sPath.indexOf("{?query}");
				// if the query is not at the beginning there is a query suffix
				if (iIndex > 0) {
					// get the current path by ignoring the query suffix
					sPath = sPath.substring(0, iIndex);
				}
				// reset the index
				iIndex = -1;
				// Look for path pattern with ({key
				sPathPattern += "({keys";
				iIndex = sPath.indexOf(sPathPattern);
				// if the pattern is not at the beginning there is a parent path prefix
				if (iIndex > 0) {
					// get the current path by ignoring the parent prefix
					sPath = sPath.substring(iIndex);
				}
				// replace the navigation property with entity set to form the binding context path
				if (oRouteConfig.navigationProperty) {
					sPath = sPath.replace(oRouteConfig.navigationProperty, oRouteConfig.entitySet);
				}
				// context always needs to start with a "/"
				sPath = "/" + sPath;
			}
		}
		return sPath;
	};

	/**
	 * Navigates to the message page and shows the specified content.
	 * 
	 * @public
	 * @param {Object} mParameters - The parameters for message page
	 */
	NavigationController.prototype.navigateToMessagePage = function(mParameters) {
		var sEntitySet, sTitle, bReplaceURL, sText, oEntitySet, oEntityType, oHeaderInfo, sIcon = null, oMetaModel, oRB;
		if (mParameters) {
			sEntitySet = mParameters.entitySet;
			sTitle = mParameters.title;
			sText = mParameters.text;
			sIcon = mParameters.icon;
			bReplaceURL = mParameters.replaceURL;
		}

		if (sEntitySet) {
			oMetaModel = this.oComponent.getModel().getMetaModel();
			if (oMetaModel) {
				oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
				oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
				oHeaderInfo = oEntityType['com.sap.vocabularies.UI.v1.HeaderInfo'];
			}
			if (oHeaderInfo && oHeaderInfo.TypeImageUrl && oHeaderInfo.TypeImageUrl.String) {
				sIcon = oHeaderInfo.TypeImageUrl.String;
			}
		}
		if (this.oMessagePage) {
			this.oMessagePage.destroy();
		}
		if (!this._sLinkText) {
			oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");
			this._sLinkText = oRB.getText("RETURN_TO_MAIN");
		}
		this.oMessagePage = new MessagePage({
			title: sTitle,
			text: sText,
			icon: sIcon,
			customDescription: new Link({
				text: this._sLinkText,
				press: this.navigateBack.bind(this, bReplaceURL)
			})
		});

		this._oNavContainer.addPage(this.oMessagePage);
		this._oNavContainer.to(this.oMessagePage);
	};

	/**
	 * Event handler fired by router when no matching route is found
	 * 
	 * @private
	 * @param {Object} oEvt - the event object
	 */
	NavigationController.prototype._handleBypassed = function(oEvt) {
		var oRB;
		if (!this._sNavigationTitle) {
			oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");
			this._sNavigationTitle = oRB.getText("UNKNOWN_NAVIGATION_TARGET");
		}

		this.navigateToMessagePage({
			title: this._sNavigationTitle,
			replaceURL: true
		});
	};

	/**
	 * Event handler fired by router when no matching route is found
	 * 
	 * @private
	 * @param {Object} oEvent - the event object
	 */
	NavigationController.prototype._handleDataReceived = function(oEvent) {
		var oData = null, oRB;
		if (oEvent) {
			oData = oEvent.getParameter("data");
			// When not data parameter is received there is usually an exception
			// TODO: show backend error messages
			if (!oData) {
				if (!this._sDataLoadFailedTitle || !this._sDataLoadFailedText) {
					oRB = sap.ui.getCore().getLibraryResourceBundle("sap.ui.generic.app");
					this._sDataLoadFailedTitle = oRB.getText("ERROR_LOAD_DATA_TITLE");
					this._sDataLoadFailedText = oRB.getText("ERROR_LOAD_DATA_TEXT");
				}
				this.navigateToMessagePage({
					title: this._sDataLoadFailedTitle,
					text: this._sDataLoadFailedText
				});
			}
		}
	};

	/**
	 * Returns a map of views currently existing in the navigation controller.
	 * 
	 * @protected
	 * @returns {Object} the views from the navigation controller
	 */
	NavigationController.prototype.getViews = function() {
		return this.oViews;
	};

	/**
	 * Returns the NavContainer instance used in the application.
	 * 
	 * @protected
	 * @returns {sap.m.NavContainer} the NavContainer instance
	 */
	NavigationController.prototype.getNavContainer = function() {
		return this._oNavContainer;
	};

	/**
	 * perform a read with the specified data and trigger further initialisation of router
	 * 
	 * @private
	 * @param {Array} aKeys - the keys used to create the filter
	 * @param {Object} mParams - object containing parameters
	 * @param {Object} oModel- the odata model instance
	 */
	NavigationController.prototype._readObject = function(aKeys, mParams, oModel) {
		var i, iLen, sProperty, sValue, aFilters = [];
		if (aKeys && mParams && oModel) {
			iLen = aKeys.length;
			for (i = 0; i < iLen; i++) {
				// get property from property path
				sProperty = aKeys[i].PropertyPath;
				// get value from parameter array (should have only 1)
				sValue = mParams[sProperty][0];
				aFilters.push(new Filter(sProperty, FilterOperator.EQ, sValue));
			}
			oModel.read('/' + this._sEntitySet, {
				filters: aFilters,
				success: function(oResult) {
					var oRow, i, iLength, sKey;
					if (oResult && oResult.results) {
						iLength = oResult.results.length;
						for (i = 0; i < iLength; i++) {
							oRow = oResult.results[i];
							if (oRow && oRow.IsActiveEntity) {
								break;
							}
							oRow = null;
						}
						if (!oRow) {
							oRow = oResult.results[0];
						}
					}
					if (oRow) {
						sKey = oModel.getKey(oRow);
					}
					if (sKey) {
						this._oHashChanger.replaceHash(sKey);
					}
					this._initialiseRouting();
				}.bind(this),
				error: function(oError) {
					// just continue with initialisation in case of errors
					this._initialiseRouting();
				}.bind(this)
			});
		}

	};

	/**
	 * Cleans up the resources.
	 * 
	 * @public
	 */
	NavigationController.prototype.destroy = function() {
		BaseObject.prototype.destroy.apply(this, arguments);
		if (this._oHistory && this._oHistory.destroy) {
			this._oHistory.destroy();
		}
		this._oHistory = null;
		this.oRouter = null;
		this.oViews = null;
		this.oComponent = null;
		this._sLinkText = null;
		this._sNavigationTitle = null;
		this._sDataLoadFailedText = null;
		this._sDataLoadFailedTitle = null;
	};

	return NavigationController;

}, /* bExport= */true);
