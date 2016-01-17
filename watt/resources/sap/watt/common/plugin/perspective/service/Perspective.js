define(["sap/watt/common/plugin/platform/service/ui/AbstractPart","sap/watt/lib/lodash/lodash", "../control/Shell"], function(AbstractPart, _) {
	"use strict";


	var oPerspectiveController =  AbstractPart.extend("sap.watt.common.plugin.perspective.service.Perspective", {

		_SETTINGS_VERSION : 1, //Attention: increase this number if you change the settings format!
		_shell : undefined,
		_mAreaById : {},
		_mAreaByIdByPerspective : {},
		_mDefaultViewsByPerspectivesId : {},
		_mPerspectivesId : {},
		_activePerspective : undefined, // the currently displayed perspective
		_bEmitSplitterEvents : false, // notification is disabled until perspective is build
		_oPreferenceModel : undefined,
		_mPreparedPerspectives : {},
		_mContentById : {},
		_bIsMaximizedActionDone: false,// true if the maximaized cause from double click on the tab and not by closing all the panes manually.
		_aSplitters : [],
		_mServicesByName : {},
		_perspectiveLoadError : false,
		_oRendererQueue : new Q.sap.Queue(),

		init : function() {

			var that = this;

			this._setSplitterEventsEnabled(false);

			// extend the default Splitter control to allow resize - events
			sap.ui.commons.Splitter.extend("sap.watt.common.plugin.perspective.Splitter", {

				renderer : "sap.ui.commons.SplitterRenderer"

			});

			sap.watt.common.plugin.perspective.Splitter.prototype.resizeSplitterElements = function() {

				//sap.watt.common.plugin.perspective.Splitter.prototype.init.apply(this, arguments);
				var self = this;
				var s, a, w, h, b, c, iSbSize;
				var r = sap.ui.getCore().getConfiguration().getRTL();

				var _isHidden = function() {
					return (self.customWattData) ? (self.customWattData.secondPane === "hidden") : false;
				};

				//var sHidden = bIsFirstPane ? this.customWattData.firstPane : this.customWattData.secondPane;

				if (this.spOrientation === sap.ui.commons.Orientation.Vertical) {
					w = jQuery(this.splitterDIV).width();
					iSbSize = (this.sBarPosition >= 100 && _isHidden()) ? 0 : this.sbSize;
					s = (iSbSize * 100) / w;
					s = (s > 1) ? 1 : s;
					if (this.sBarPosition > 100 || this.sBarPosition + s > 100) {
						this.sBarPosition = 100 - s;
						b = 0;
					} else {
						b = 100 - s - this.sBarPosition;
					}
					jQuery(this.firstPane).css('width', this.sBarPosition + '%');
					jQuery(this.splitterBar).css('width', iSbSize + 'px');
					jQuery(this.secondPane).css('width', b + '%');
				} else {
					h = jQuery(this.splitterDIV).height();
					iSbSize = (this.sBarPosition >= 100 && _isHidden()) ? 0 : this.sbSize;
					a = (iSbSize * 100) / h;
					a = (a > 1) ? 1 : a;
					if (this.sBarPosition > 100 || this.sBarPosition + a > 100) {
						this.sBarPosition = 100 - a;
						c = 0;
					} else {
						c = 100 - a - this.sBarPosition;
					}
					jQuery(this.firstPane).css('height', this.sBarPosition + '%');
					jQuery(this.splitterBar).css('height', iSbSize + 'px');
					jQuery(this.secondPane).css('height', c + '%');
				}

				this.setProperty('splitterPosition', this.sBarPosition + '%', true);
				if (jQuery(this.splitterDIV).height() === 0) {
					jQuery(this.splitterDIV).css('height', '100%');
					jQuery(this.splitterBar).css('height', '100%');
				}

				// No way to find a late point in time to enable the notifications, so use a threshold here:
				if (that._isSplitterEventsEnabled()) {
					var oSplitterPositionsResult = that._getSplitterPositions();
					oSplitterPositionsResult.beforeMaximized = that._beforeMaximized;
					that._oPreferenceModel.storeSession(that._getCurrentPerspective(), oSplitterPositionsResult).done();
					that.context.event.fireSplitterPositionChanged().done();
				}
			};
		},

		configure : function(mConfig) {

			var that = this;
			this._defaultPerspective = mConfig.defaultPerspective;
			this._aStyles = mConfig.styles;

			jQuery.each(mConfig.perspectives, function(iIndex, oActPerspective) {
				that._mPerspectivesId[oActPerspective.id] = oActPerspective;
			});

			// Read all the Part implementations (services)
			jQuery.each(mConfig.views, function(iIndex, oView) {
				that._mServicesByName[oView.id] = oView;
				oView.service.attachEvent("visibilityChanged", that._onVisibilityChange, that);
			});

			jQuery.each(mConfig.areas, function(iIndex, oActItem) {
				var sActItemId = oActItem.id;
				var sActPerspectiveId = oActItem.perspective;

				that._mDefaultViewsByPerspectivesId[sActPerspectiveId] = that._mDefaultViewsByPerspectivesId[sActPerspectiveId] || {};
				that._mDefaultViewsByPerspectivesId[sActPerspectiveId][sActItemId] = oActItem;

				that._mAreaById[sActItemId] = {};
				that._mAreaByIdByPerspective[sActPerspectiveId] = that._mAreaByIdByPerspective[sActPerspectiveId] || {};
				that._mAreaByIdByPerspective[sActPerspectiveId][sActItemId] = {};

				var sServiceName = oActItem.view;

				if (sServiceName) {
					oActItem.visible = (oActItem.visible && oActItem.visible === "false") ? false : true;
					if (that._mServicesByName[sServiceName]) {
						that._mAreaById[sActItemId]["service"] = sServiceName;
						that._mAreaByIdByPerspective[sActPerspectiveId][sActItemId]["service"] = sServiceName;
					} else {
						throw new Error("Perspective: configuration error. View with id " + oActItem.view + " not found");
					}
				} else {
					// if no service is defined hide the area
					oActItem.visible = false;
				}

			});

			jQuery.each(this._mDefaultViewsByPerspectivesId, function(sPerspId, oO) {
				if (!that._mPerspectivesId[sPerspId]) {
					throw new Error("Perspective: Contribution to undefined perspective named \"" + sPerspId + "\"");
				}
			});

			mConfig.preferenceService = mConfig.preferenceService || {};
			mConfig.preferenceService.service = this.context.service.preferences;
			mConfig.preferenceService.node = mConfig.preferenceService.node || "sap.watt.common.service.ui.Perspective";

			this._oPreferenceModel = new PreferenceModel(mConfig.preferenceService, this._SETTINGS_VERSION);

		},
		
		isPerspectiveRegistered: function(sPerspectiveId){
			if(this._mPerspectivesId[sPerspectiveId]){
				return true;
			}
			return false;
		},

		getContent : function() {

			var that = this;
			if (this._aStyles) {
				var oResult = this.context.service.resource.includeStyles(this._aStyles).then(function() {
					return that.renderPerspective(that._getCurrentPerspective());
				});
			} else {
				var oResult = this.renderPerspective(this._getCurrentPerspective());
			}

			return oResult.then(function(){
				return that._shell;
			});

		},
		
		report : function(sEventType, sData){
			this.context.service.usagemonitoring.report("Perspective", sEventType, sData).done();
		},

		resetToDefault : function(sPerspective) {
			var that = this;
			sPerspective = sPerspective || this._getCurrentPerspective();
			this._perspectiveLoadError = false; // cleanup error state
			var aPromises = [];
			that._oPreferenceModel.setNetEnabled(false); // disable pref. tracking

			if (this._mAreaByIdByPerspective[sPerspective]) {
				jQuery.each(this._mAreaByIdByPerspective[sPerspective], function(sId, oArea) {
					var sServiceName = oArea.service;
					var oService = that._nameToService(sServiceName);
					if (!oService) {
						sServiceName = that._mAreaById[sId].service;
						oService = oService = that._nameToService(sServiceName);
					}
					if (oService) {
						var bVisible = oArea.initialSplitterPosition ? (oArea.initialSplitterPosition !== "hidden") : false;
						aPromises.push(oService.setVisible(bVisible));
					}
				});
			}

			return Q.all(aPromises).then(function(){
				return that._initSplitterPositions(that._getCurrentPerspective(), null).then(function() {
					if (sPerspective) {
						that._oPreferenceModel.storeSession(sPerspective, {});
					} else {
						that._oPreferenceModel.removeSession();
					}
				});
			}).then(function(){
				that._oPreferenceModel.setNetEnabled(true); //enable preference tracking
			});

		},

		getCurrentPerspective : function() {
			return this._getCurrentPerspective();
		},

		// Transform a service name into service instance
		_nameToService : function(sServiceName){
			if (sServiceName) {
				return this._mServicesByName[sServiceName] ? this._mServicesByName[sServiceName].service: undefined;
			}
			return undefined;
		},

		_resetCurrentPerspective : function() {
			return this._activePerspective = this._defaultPerspective;
		},

		_getCurrentPerspective : function() {
			return this._activePerspective || this._defaultPerspective;
		},

		_getPerspective : function(sPerspective) {

			var that = this;
			var aOrder = [];

			sPerspective = sPerspective || this._defaultPerspective;

			if (this._mPreparedPerspectives[sPerspective]) {
				// already created
				return Q(this._mPreparedPerspectives[sPerspective]);

			} else {

				var oItems = this._mDefaultViewsByPerspectivesId[sPerspective];
				var layoutStruc = {};
				var subLevel;
				var partsLength;
				var aContents = [];
				var oActService = undefined;
				var aOrderToProcessItems = [];

				// Prepare a list of promises (services)
				// attention: first entry is no promise
				aContents.push(sPerspective);

				if (oItems) {
					// Use the configured defaults:
					jQuery.each(oItems, function(sId, oItem) {

						aOrderToProcessItems.push(sId);

						if (oItem.view && oItem.visible) {
							var oPromise = that._mServicesByName[oItem.view].service.getContent().fail(function(oError){
								// Don't just let the perspective crash. Instead create an empty component.
								that._perspectiveLoadError = true;
								console.error("Perspective: cannot aquire content from ui part '" + oItem.view + "'", oError);
								return new sap.ui.core.HTML({
									content : "<div>Unavailable service: <strong>'" + oItem.view + "'</div>",
									sanitizeContent : true
								});
							});
							aContents.push(oPromise);
						} else {
							aContents.push(null);
						}
					});
				}

				// Pre- load the services to enhance rendering
				return Q.spread(aContents, function(args) {

					var sPerspective = arguments[0];
					var i = 1;
					for ( var sId in oItems) {
						that._mContentById[sId] = arguments[i++];
					}

					jQuery.each(aOrderToProcessItems, function(iIndex, sId) {
						var item = oItems[sId];
						var aParts = item.position.split(":");
						subLevel = layoutStruc;
						partsLength = aParts.length;

						for (var level = 0; level < partsLength; level++) {

							var aDimension = aParts[level].split("/");
							var container = aDimension[0];
							var size = (aDimension.length > 1) ? aDimension[1] : undefined;
							subLevel[container] = subLevel[container] || {
								content : {}
							};
							if (size) {
								subLevel[container].size = size;
							}
							if (level === partsLength - 1) {
								//this is the lowest level for current item
								subLevel[container].content.cssclass = item.cssclass;
								subLevel[container].content.id = item.id;
								subLevel[container].content.visible = item.visible;
							} else {
								subLevel = subLevel[container].content;
							}

						}
					});

					/* check for more than 2 splitter containers in one direction and restructure */
					layoutStruc = that._createBiPartition(layoutStruc);

					// create nested splitters
					var splitter = that._splitterCreate(layoutStruc, that._mContentById);
					that._mPreparedPerspectives[sPerspective] = splitter;

					return splitter;

				});

			}

		},

		// Render a service at layout area 'sId' without further checks
		_renderAt : function(sId, sServiceName) {

			var that = this;

			var oServiceByName = that._mServicesByName[sServiceName];
			var oControlRef = this._getAreaById(sId);
			var oItems = this._mDefaultViewsByPerspectivesId[this._getCurrentPerspective()];
			var actItem = oItems ? oItems[sId] : undefined;

			if (actItem) {
				return oServiceByName.service.getContent().then(function(oContent) {

					if (!oContent) {
						throw new Error("Service '" + sServiceName +"' delivered no content");
					}

					// to prevent from many delegations of focus handler after each rendering of service
					if (!oContent.__bAfterRenderingFocusAttached) {
						oContent.__bAfterRenderingFocusAttached = true;
						oContent.addEventDelegate({
							onAfterRendering : function() {
								that.context.service.focus.attachFocus(oServiceByName.service).done();
							}
						});
					}

					// Try to find specific cssclass...
					var oCssClass = oServiceByName ? oServiceByName.cssclass : undefined;

					// .... if not found try to use the default class
					oCssClass = oCssClass ? oCssClass : oItems[sId].cssclass;

					if (oCssClass) {
						oContent.addStyleClass(oCssClass);
					}
					// in any case add the default style
					oContent.addStyleClass("sapWattSplitterPane");

					that._addSplitterContent(oControlRef.splitter, oControlRef.component, oContent);
					that._mContentById[sId] = oContent;
					that._mAreaById[sId]["service"] = sServiceName;
					return true;

				}).then(function() {
					var oLastKnown = that._oPreferenceModel.getLastKnown(that._getCurrentPerspective());
					var oPosition = oLastKnown ? oLastKnown[sId] : undefined;
					return that._setVisible(sId, true, oPosition).then(function (){
						return true;
					});
				}).fail(function(oError) {
					that._perspectiveLoadError = true;
					var oContent = new sap.ui.core.HTML({
						content : "<div>Unavailable service: <strong>'" + sServiceName + "'</div>",
						sanitizeContent : true
					});
					that._addSplitterContent(oControlRef.splitter, oControlRef.component, oContent);
					console.error("Perspective: cannot aquire content from ui part '" + sServiceName + "'", oError);
					return true; // Show the dummy content
				});
			} else {
				return Q(false);
			}

		},

		_handleViewProblem : function(oContext, sQuestion) {
			var that = this;
			return oContext.context.service.usernotification.alert(sQuestion).then(function(){
				that._perspectiveLoadError = false;
				oContext._resetCurrentPerspective();
				return oContext.resetToDefault();
			});
		},


		placeServiceAt : function(sId, sViewId) {
			var that = this;
			return this._placeServiceAt(sId, sViewId).then(function(oResult) {
				if (that._activePerspective) {
					return that.context.event.firePerspectiveChanged({
						"from" : that._activePerspective,
						"to" : that._activePerspective
					}).then(function() {
						return oResult;
					});
				} else {
					return oResult;
				}
			});
		},

		_placeServiceAt : function(sId, sViewId) {

			var sServiceName = this._checkServiceName(sViewId);
			if (!sServiceName) {
				return Q();
			}

			var oResult = null;
			var oPart = this._nameToService(sServiceName);
			if (oPart) {

				var oControlRef = this._getAreaById(sId);
				if (!this._mContentById[sId]) {// Layout area is actually empty

					return this._renderAt(sId, sServiceName);

				} else if (oControlRef.service !== sViewId) {// Layout area contains a different service

					// remove content at old position
					var sOldId = this._getAreaForService(sServiceName);
					if (sOldId) {
						var sOldRef = this._mAreaById[sOldId];
						this._removeSplitterContent(sOldRef.splitter, sOldRef.component);
						this._mAreaById[sOldId].service = null;
					}

					//remove old content at target position
					this._removeSplitterContent(oControlRef.splitter, oControlRef.component);

					return this._renderAt(sId, sServiceName);

				}
			}// else: service already rendered in this area, so do nothing

			return oResult ? oResult : new Q(true);

		},

		getServiceAt : function(sId) {
			var sServiceName = this._getServiceAt(sId);
			var oServicebyName = sServiceName ? this._mServicesByName[sServiceName] : undefined;
			return oServicebyName ? oServicebyName.service : undefined;
		},

		getViewIdAt : function(sId) {
			var sServiceName = this._getServiceAt(sId);
			return sServiceName ? sServiceName : undefined;
		},

		_getAreaById: function(sId) {
			var oControlRef = this._mAreaById[sId];
			if (!oControlRef) {
				throw new Error("Illegal argument: viewId '" + sId + "' is not defined");
			}
			return oControlRef;
		},

		_getServiceAt : function(sId) {
			var oControlRef = this._getAreaById(sId);
			return (oControlRef && oControlRef.service) ? oControlRef.service : undefined;
		},

		getAreaForService : function(sViewId) {
			var sServiceName = this._checkServiceName(sViewId);
			if (!sServiceName) {
				console.warn("Perpsective.getAreaForService(): view \"" + sViewId + "\" is not configured.");
				return null;
			}
			return this._getAreaForService(sServiceName);
		},

		// Check object for a name string or a service instance that can be mapped to a name
		_checkServiceName : function(oService) {
			var sServiceName = undefined;
			if (typeof (oService) === "string") {
				sServiceName = oService;
			} else if (oService && oService.instanceOf) { // is a Proxy
				sServiceName = oService.getProxyMetadata().getName();
				sServiceName = this._mServicesByName[sServiceName] ? sServiceName : undefined;
			}
			return sServiceName;
		},

		setAreaMaximized : function(sId, bMaximized) {
			return this._setAreaMaximized(sId, bMaximized);
		},

		isAreaMaximized : function(sId) {
			return this._isAreaMaximized(sId);
		},

		setAreaVisible : function(sId, bVisible) {
			var that = this;
			var oPosition = undefined;
			if (bVisible) {
				var oLastKnown = that._oPreferenceModel.getLastKnown(that._getCurrentPerspective());
				oPosition = oLastKnown ? oLastKnown[sId] : undefined;
			}
			return this._setVisible(sId, bVisible, oPosition).then(function(oResult) {

				var oSplitterPositionsResult = that._getSplitterPositions();
				oSplitterPositionsResult.beforeMaximized = that._beforeMaximized;
				var oResult = that._oPreferenceModel.storeSession(that._getCurrentPerspective(), oSplitterPositionsResult);
				if (that._activePerspective) {
					oResult = oResult.then(function(){
						return that.context.event.firePerspectiveChanged({
							"from" : that._activePerspective,
							"to" : that._activePerspective
						});
					});
				}
				return oResult;
			});
		},

		isAreaVisible : function(sId) {
			return this._isAreaVisible(sId);
		},

		_isAreaVisible : function(sId) {

			// Incident 1472018442: method was called before perspective was rendered
			var oControlRef = this._getAreaById(sId);
			var oSplitter = oControlRef ? oControlRef.splitter : undefined;
			var bIsFirstPane = oControlRef ? oControlRef.component === 1 : true;
			var sHidden = (oSplitter && bIsFirstPane) ? oSplitter.customWattData.firstPane : oSplitter.customWattData.secondPane;

			return !sHidden;

		},

		_isAreaMaximized : function(sPerspectiveArea) {
			var isMaximaize = true;
			var oUserSettingsAsJSon = this._oPreferenceModel._mUserPreferencesAsJson[this._getCurrentPerspective()];
			if(oUserSettingsAsJSon && oUserSettingsAsJSon.content){
				jQuery.each(oUserSettingsAsJSon.content, function(sId, sServiceName) {
					 /*Loop all areas in The cash that are in content property (mean they are currently open)
					 if one of open areas is not the area that we are checking it mean it is not maximized*/
					if(sPerspectiveArea !== sId){
						// in jquery.each this is the syntax for break
						isMaximaize = false;
						return false;
					}
				});
				return isMaximaize;
			}
			//In case sPerspectiveArea/oUserSettingsAsJSon/this._getCurrentPerspective() is undefined we return false;
			else{
				return false;
			}
		},

		_setAreaMaximized : function(sPerspectiveArea, bMaximized) {
			var that = this;
			var oContent = that._mContentById[sPerspectiveArea];
			var oElement = oContent ? oContent.getDomRef() : null;
			if (oElement) { // if we are already rendered

				if (bMaximized) {

					// stroe in orion userPrefernces before maximize
					var oClonedSplitterPositions =_.cloneDeep(that._getSplitterPositions());
					that._beforeMaximized = oClonedSplitterPositions;

					var oUserSettingsAsJSon = this._oPreferenceModel._mUserPreferencesAsJson[that._getCurrentPerspective()];
					if (oUserSettingsAsJSon) {
						var aPromises = [];
						jQuery.each(oUserSettingsAsJSon.content, function (sId, sServiceName) {
							var oService = that._mServicesByName[sServiceName];
							if (sPerspectiveArea !== sId) {
								aPromises.push(oService.service.setVisible(false));
							}
						});
						return Q.all(aPromises).then(function () {
							// enable preference persistency after everything is in its place
							that._oPreferenceModel.setNetEnabled(true);
							that._bIsMaximizedActionDone = true;
						});
					}
					else {
						return that.resetToDefault(that._activePerspective);
					}


					// Area need to be normalized
				} else {

					 /*if _bIsMaximizedActionDone is true it means that the full screen caused from MaximizedAction (for example :doubleclick on the tab)
					 and it should retruned  to normal size according to user perfernce which stored in the backend*/
					if (that._bIsMaximizedActionDone) {
						// begin session with prefernc parameters before Maximized
						return that._oPreferenceModel.beginSession(that._getCurrentPerspective()).then(function (oUserSettingsAsJSon) {

							if (oUserSettingsAsJSon && oUserSettingsAsJSon.beforeMaximized) {
									var aPromises = [];
									jQuery.each(oUserSettingsAsJSon.beforeMaximized.content, function (sId, sServiceName) {
										var oService = that._mServicesByName[sServiceName];
										if (oService) {
											aPromises.push(oService.service.setVisible(true));
										}
									});


								//TODO needs to be removed after open/colse button will be implemented for workspace pane.
								/*temporary solution for forcing the workspace to always open in default position after normalized:
								workspace(repositorybrowser will always be opened after normalized/minimized
								even if it wasn't open before the maximized and wasn't in the the oUserSettingsAsJSon ).*/

								_.forEach(oUserSettingsAsJSon.beforeMaximized, function(n, key) {
									if(key !== "content"){
										if (that._alwaysOpenAsDefaultAfterNormailze(key) === true) {
											var oActArea = that._mAreaById[key];
											if (oActArea) {
												var sServiceName = oActArea.service;
												var oService = that._mServicesByName[sServiceName];
												aPromises.push(oService.service.setVisible(true));
												var sPosition = oActArea.initialSplitterPosition;
												oUserSettingsAsJSon.beforeMaximized[key] = sPosition;
											}
										}
									}
								});

									// Init spliter position accroding to last user prefences beforeMaximized.
									return Q.all(aPromises).then(function () {
										return that._initSplitterPositions(that._activePerspective, oUserSettingsAsJSon.beforeMaximized);
									}).then(function () {
										that._bIsMaximizedActionDone = false;
									});
								} else {
									return that.resetToDefault(that._activePerspective);
								}

						});
					}
					/*if _bIsMaximaidFromDoubleClick is true it means that the full screen cause from closing manually all panes
					 Then by definition it should rest to default (only repositorybrowser should be opend);*/
					else {
						return that.resetToDefault(that._activePerspective);
					}
				}
			}
		},

		_initSplitterPositions : function(perspective, oUserPrefs, isOnLoadState) {

			// This method will change several splitter positions, 
			// so prevent from creating a eventing storm by switching off splitter events
			this._setSplitterEventsEnabled(false);

			var that = this;
			var aSplitters = this._getAllSplitters();
			var aPromises = [];

			for (var i = 0; i < aSplitters.length; i++) {

				aPromises.push(this._initializeSplitter(aSplitters[i], oUserPrefs, isOnLoadState).done());

			}

			return Q.spread(aPromises, function() {
				that._setSplitterEventsEnabled(true);
			}).then(function() {
				return that.context.event.fireSplitterPositionChanged();
			});

		},

		// Check wether the ui part residing in layout area 'sArea' can be restored or not
		_isPartOfAreaRestorable : function(sArea) {
			var sServiceName = this._mAreaById[sArea].service;
			// if there is no service, it cannot be restored
			if (sServiceName) {
				var oServiceDescriptor = this._mServicesByName[sServiceName];
				var bRestore = oServiceDescriptor ? oServiceDescriptor.restore : undefined;
				return bRestore === undefined ? true : (bRestore === "true");
			} else {
				return false;
			}
		},

		//Open the view also if it was hidden beforeMaximize
		_alwaysOpenAsDefaultAfterNormailze : function(sArea) {
			var sServiceName = this._mAreaById[sArea].service;
			// if there is no service it can not be configured as opened
			if (sServiceName) {
				var oServiceDescriptor = this._mServicesByName[sServiceName];
				var bBeDefaultAfterNormailze = oServiceDescriptor ? oServiceDescriptor.alwaysOpenAsDefaultAfterNormalized : undefined;
				return bBeDefaultAfterNormailze === undefined ? false : (bBeDefaultAfterNormailze === "true");
			} else {
				return false;
			}
		},

		// returns Promise
		_initializeSplitter : function(oSplitter, oUserPrefs,isOnLoadState ) {

			var that = this;
			// Expose the names of the layout areas
			// TODO: create a clean api, don't just dig somwhere deep into the control tree
			var sFirstPaneId = oSplitter.customWattData.firstPaneId;
			var sSecondPaneId = oSplitter.customWattData.secondPaneId;

			// extract the user preference values
			var firstPanePrefs = oUserPrefs && sFirstPaneId ? oUserPrefs[sFirstPaneId] : undefined;
			var secondPanePrefs = oUserPrefs && sSecondPaneId ? oUserPrefs[sSecondPaneId] : undefined;

			// overwrite user prefs in case a ui part ist tagged as not restorable
			if (sFirstPaneId  && isOnLoadState && !this._isPartOfAreaRestorable(sFirstPaneId)) {
				firstPanePrefs = "hidden"; // todo: extract a constant
				secondPanePrefs = secondPanePrefs ? "100%" : undefined;
			}
			if (sSecondPaneId  && isOnLoadState && !this._isPartOfAreaRestorable(sSecondPaneId)) {
				secondPanePrefs = "hidden"; // todo: extract a constant
				firstPanePrefs = firstPanePrefs ? "100%" : undefined;
			}

			var oActArea = undefined;
			var oPromise = Q();
			if (firstPanePrefs) {
				oPromise = this._setVisible(oSplitter.customWattData.firstPaneId, undefined, firstPanePrefs);
			} else {
				oActArea = undefined;
				oActArea = this._mAreaById[oSplitter.customWattData.firstPaneId];
				// Set splitter position to the configured default values
				if (oActArea) {
					var sPosition = oActArea.initialSplitterPosition;
					var isVisible = sPosition && (sPosition !== "hidden");
					var oService = that._mServicesByName[oActArea.service];
					/*Call setVisible of the service because we wabt the service to be updated of it's state (open/close).
					It is importenet because if it won't be updated it wiil cause bugs when we will try to open close panes after reset to default action */
					oPromise = oService.service.setVisible(isVisible).then(function(){
						return that._setVisible(oSplitter.customWattData.firstPaneId, undefined, oActArea.initialSplitterPosition);
					});
				}
			}

			return oPromise.then(function() {
				if (secondPanePrefs) {
					return that._setVisible(oSplitter.customWattData.secondPaneId, undefined, secondPanePrefs);
				} else {
					oActArea = undefined;
					oActArea = that._mAreaById[oSplitter.customWattData.secondPaneId];
					if (oActArea) {
						return that._setVisible(oSplitter.customWattData.secondPaneId, undefined, firstPanePrefs ? firstPanePrefs
							: oActArea.initialSplitterPosition);
					} else {
						return Q();
					}
				}
			});

		},

		_setSplitterEventsEnabled : function(bEnabled) {
			this._bEmitSplitterEvents = bEnabled;
		},

		_isSplitterEventsEnabled : function() {
			return this._bEmitSplitterEvents;
		},

		renderPerspective : function(sPerspective) {
			var that = this;
			return this._oRendererQueue.next(function() {
				return that._renderPerspective(sPerspective);
			});

		},
		_renderPerspective : function(sPerspective) {

			var that = this;
			var oResult = undefined;
			var sOldPerspective = this._activePerspective;
			this._mContentById = {};

			this._activePerspective = sPerspective;
			if (this._activePerspective != sOldPerspective) {

				oResult = this._getPerspective(this._activePerspective).then(function(oPerspective) {

					if (!that._shell) {
						that._shell = new sap.watt.common.plugin.perspective.control.Shell({
							id : "mainShell",
							content : oPerspective
						});
					} else {
						that._shell.removeAllContent();
						that._shell.addContent(oPerspective);
						that._setSplitterEventsEnabled(false);
						sap.ui.getCore().applyChanges();//can also be done by that._shell.rerender();
						that._setSplitterEventsEnabled(true);
					}

					return that._oPreferenceModel.beginSession(sPerspective).then(function(oUserSettingsAsJSon) {

						if (oUserSettingsAsJSon) {
							var aPromises = [];
							jQuery.each(oUserSettingsAsJSon.content, function(sId, sServiceName) {
								var oService = that._mServicesByName[sServiceName];
								if (oService && oService.restore !== "false") {
									aPromises.push(oService.service.setVisible(true));
								}
							});
							return Q.all(aPromises).then(function(){
								return that._initSplitterPositions(that._activePerspective, oUserSettingsAsJSon, true);
							}).then(function(){
								// enable preference persistency after everything is in its place
								that._oPreferenceModel.setNetEnabled(true);
							});
						} else {
							return that.resetToDefault(that._activePerspective);
						}

					});

				}).fail(function(oError) {
					return that.resetToDefault(that._activePerspective);
				});

			}

			oResult = oResult ? oResult : Q();

			var sDefaultName = undefined;
			var mDefaultViews = that._mDefaultViewsByPerspectivesId[that._activePerspective];
			for (var oView in mDefaultViews) {
				var oAct = mDefaultViews[oView];
				if (oAct.visible) {
					sDefaultName = oAct.view;
					break;
				}
			}
			var defaultFocusOwner = sDefaultName ? that._mServicesByName[sDefaultName] : undefined;
			if (defaultFocusOwner && defaultFocusOwner.service) {
				oResult = oResult.then(function(){
					return that.context.service.focus.setFocus(defaultFocusOwner.service);
				});
			}

			return oResult.then(function(){
				if (that._perspectiveLoadError) {
					return that._handleViewProblem(that, that.context.i18n.getText("i18n", "perspective_message_load_issue"));
				} else {
					return Q();
				}
			}).then(function(){
				return that.context.event.firePerspectiveChanged({
					"from" : sOldPerspective,
					"to" : that._activePerspective
				});
			});
		},

		_measurePartition : function(layoutStruc) {

			var aProps = Object.keys(layoutStruc);
			var sumSize = 0;
			var noSizeNumber = 0;
			for (var i = 0; i < aProps.length; i++) {
				var item = layoutStruc[aProps[i]];
				if (item.size) {
					sumSize += parseInt(item.size, 10);
				} else {
					noSizeNumber++;
				}
			}
			noSizeNumber = noSizeNumber === 0 ? 1 : noSizeNumber;

			return (sumSize < 100) ? ((100 - sumSize) / noSizeNumber) : 0;

		},

		_createBiPartition : function(layoutStruc) {

			//get number of nested splitters needed in one direction
			var aProps = Object.keys(layoutStruc);
			var splitterNo = aProps.length;
			var item;
			var first, second;

			//replace branches
			var restSize;
			var splitterSize;
			var sumSize = 0;
			var iReservedPerItem = this._measurePartition(layoutStruc);

			for (var i = 0; i < splitterNo; i++) {

				item = item || layoutStruc[aProps[i]];
				if (!(item.content && item.content.id)) {
					//there are nested splitters already -> recursion
					item.content = this._createBiPartition(item.content);
				}

				//calculate actual item size
				var actItemSize = item.size ? parseInt(item.size, 10) : iReservedPerItem;

				//splitterPos needs to be adjusted to within remainig size
				restSize = 100 - sumSize;
				splitterSize = (restSize > 0) ? (actItemSize * 100 / restSize) : 100;

				sumSize += actItemSize;

				//don't go through this for the first and last entry or if there are less then 3 items
				if (i > 0 && splitterNo > 2 && i < splitterNo - 1) {
					//determine if we have horizontal or vertical layout
					if (aProps[i].match(/[a-zA-Z]/)) {
						first = "A";
						second = "B";
					} else {
						first = "1";
						second = "2";
					}

					//clone item
					var curItem = jQuery.extend(true, {}, item);
					item.size = undefined;
					item.content = {};
					item.content[first] = curItem;
					item.content[first].size = splitterSize + "%";

					//clone next item
					var nextItem = jQuery.extend(true, {}, layoutStruc[aProps[i + 1]]);
					item.content[second] = nextItem;
					if (i === splitterNo - 2) {
						//last item size
						item.content[second].size = undefined;
					}
					//delete next item (now as clone is replaced)
					delete layoutStruc[aProps[i + 1]];
					item = nextItem;

				} else {
					item = null;
				}
			}
			return layoutStruc;
		},

		_getNewSplitter : function() {
			var oResult = new sap.watt.common.plugin.perspective.Splitter({
				showScrollBars : false,
				width : "100%",
				height : "100%",
				splitterPosition : "100%"
			});
			this._aSplitters.push(oResult);
			return oResult;
		},

		_getAllSplitters : function() {
			return this._aSplitters;
		},

		_splitterCreate : function(oStructure, mContentById) {
			var orientation;
			var content, size;
			var oContentControl;
			var oSplitter;

			if (Object.keys(oStructure).length > 1) {

				oSplitter = this._getNewSplitter();

			} else {

				sap.ui.core.Control.extend("Box", {
					metadata : {
						aggregations : {
							"content" : {
								type : "sap.ui.core.Control",
								multiple : true,
								singularName : "content"
							}
						}
					},

					renderer : function(oRm, oControl) {
						oRm.write("<div style='width:100%;height:100%;'");
						oRm.writeControlData(oControl);
						oRm.write(">");
						var aContent = oControl.getContent();
						for (var i = 0; i < aContent.length; i++) {
							oRm.renderControl(aContent[i]);
						}
						oRm.write("</div>");
					}
				});

				oSplitter = new Box();

			}

			var that = this;
			var number = 0;
			var mSize = null;
			for ( var i in oStructure) {
				number++;
				//if level's name is a number we need a vertical splitter, a letter indicates a horizontal one
				orientation = orientation
				|| ((i.match(/[a-zA-Z]/)) ? sap.ui.commons.Orientation.Horizontal : sap.ui.commons.Orientation.Vertical);

				if (oSplitter instanceof sap.ui.commons.Splitter) {
					oSplitter.setSplitterOrientation(orientation);
				}

				content = oStructure[i].content;

				mSize = this._getDefinedSize(oStructure, i);

				if (content.id) {

					//var oContPromise =  content.service ? content.service.getContent() : null;
					var oContent = mContentById[content.id];
					//add  service content
					defineSplitter(oContent, mSize, content.cssclass, number, oSplitter, content.id, content.visible);

				} else {
					//recursion
					oContentControl = this._splitterCreate(content, mContentById);
					setContent(oSplitter, oContentControl, number, mSize.size, content.cssclass, content.id);
				}

			}

			oSplitter._perspectiveName = that._activePerspective;
			oSplitter.getPerspectiveName = function() {
				return that._perspectiveName;
			};
			return oSplitter;

			function defineSplitter(oContent, mSize, cssclass, iNumber, oSplitter, sId, bVisible) {

				oSplitter.customWattData = oSplitter.customWattData || {};

				// create reference for later easy access by id
				that._addAreaReference(sId, oSplitter, iNumber, mSize.size);

				//render the content				
				setContent(oSplitter, oContent, iNumber, cssclass);
				var sSize = bVisible ? that._getActSize(oSplitter, bVisible, iNumber, mSize.size) : "hidden";

				// if an area shall be hidden initially, don't overrule this
				if (!oSplitter.customWattData.initialHidden) {
					if (!bVisible) {
						oSplitter.customWattData.initialHidden = true;
					}
					if (oSplitter instanceof sap.ui.commons.Splitter) {
						// set the initialspliterpositions deferred at end of getContent()
						that._mAreaById[sId].initialSplitterPosition = sSize;
						if (sSize !== "hidden") {
							oSplitter.setSplitterPosition(sSize);
						}
					}
				}
				if (iNumber === 1) {
					oSplitter.customWattData.firstPaneId = sId;
					oSplitter.customWattData.firstPane = sSize;
				} else {
					oSplitter.customWattData.secondPaneId = sId;
					oSplitter.customWattData.secondPane = sSize;
				}

				// this attaches a focus handler to each of the content areas when they are actually rendered
				if (oContent) {
					oContent.addEventDelegate({
						onAfterRendering : function() {
							var sServiceName = that._mAreaById[sId]["service"];
							var oService = that._nameToService(sServiceName);
							if (oService) {
								that.context.service.focus.attachFocus(oService).done();
							}
						}
					});
				}
			}

			function setContent(splitter, content, number, cssclass, sId) {

				// create a placeholder if no content is available yet
				content = content || new sap.ui.core.HTML({
					content : "<div></div>",
					sanitizeContent : true
				});

				if (cssclass) {
					content.addStyleClass(cssclass);
				}
				if (splitter instanceof sap.ui.commons.Splitter) {
					if (number === 1) {
						splitter.addFirstPaneContent(content);
					} else {
						splitter.addSecondPaneContent(content);
					}
				} else {
					splitter.addContent(content);
				}

			}
		},

		_addAreaReference : function(sId, oSplitter, iNumber, definedSize) {
			// create reference for later easy access by id
			if (!this._mAreaById[sId]) {
				this._mAreaById[sId] = {};
			}
			this._mAreaById[sId]["splitter"] = oSplitter;
			this._mAreaById[sId]["component"] = iNumber;
			this._mAreaById[sId]["size"] = definedSize;
		},

		// Returns the size of the area and whether or not it is defined (or otherwise computed)
		_getDefinedSize : function(oStructure, sIndex) {
			var sResult = {
				size : "50%",
				defined : true
			};
			var aKeys = Object.keys(oStructure);
			if (aKeys.length === 2) {

				if (oStructure[aKeys[0]].size) {
					// first element: use the size directly
					sResult.size = oStructure[aKeys[0]].size;
				} else if (oStructure[aKeys[1]].size) {
					// second element: compute inverse size
					sResult.size = (100 - parseInt(oStructure[aKeys[1]].size, 10)) + "%";
				}

				var oSide = oStructure[sIndex];
				sResult.defined = oSide.size ? true : false;

			}
			return sResult;
		},

		_removeSplitterContent : function(oSplitter, iItem) {
			if (iItem === 1) {
				oSplitter.removeAllFirstPaneContent();
			} else {
				oSplitter.removeAllSecondPaneContent();
			}
		},

		_addSplitterContent : function(oSplitter, iItem, oContent) {

			if (iItem === 1) {
				oSplitter.addFirstPaneContent(oContent);
			} else {
				oSplitter.addSecondPaneContent(oContent);
			}

		},

		_getAreaForService : function(sServiceName) {
			for ( var sId in this._mAreaById) {
				if (this._mAreaById.hasOwnProperty(sId)) {
					if (this._mAreaById[sId].service == sServiceName) {
						return sId;
					}
				}
			}
			return null;
		},

		_getSplitterPositions : function() {

			var oResult = {
				content : {}
			};
			var aSplitters = this._getAllSplitters();
			for (var i = 0; i < aSplitters.length; i++) {

				var oSplitter = aSplitters[i];
				/*
				Check if active perspective is the perspective which related to the actual splitter in the loop.
				Only if true then build the result object (splitterPosition object).
				The oResult object should contain in the end of all loop iterations only the splitter positions which relevant to the active perspective
				*/
				if(oSplitter._perspectiveName === this._activePerspective){
					var sFirstPaneId = oSplitter.customWattData ? oSplitter.customWattData.firstPaneId : undefined;
					var sSecondPaneId = oSplitter.customWattData ? oSplitter.customWattData.secondPaneId : undefined;

					if (sFirstPaneId) {
						if (oSplitter.customWattData.firstPane === "hidden") {
							oResult[sFirstPaneId] = "hidden";
						} else {
							oResult[sFirstPaneId] = oSplitter.getSplitterPosition();
							var sService = this._getServiceAt(sFirstPaneId);
							if (sService) {
								var oServiceDef = this._mServicesByName[sService];
								if (oServiceDef && !(oServiceDef.settings === "false")){
									oResult.content[sFirstPaneId] = sService;
								}
							}
						}
					}

					if (sSecondPaneId) {
						if (oSplitter.customWattData.secondPane === "hidden") {
							oResult[sSecondPaneId] = "hidden";
						} else {
							oResult[sSecondPaneId] = oSplitter.getSplitterPosition();
							var sService = this._getServiceAt(sSecondPaneId);
							if (sService) {
								var oServiceDef = this._mServicesByName[sService];
								if (oServiceDef && !(oServiceDef.settings === "false")){
									oResult.content[sSecondPaneId] = sService;
								}
							}
						}
					}

					if (sFirstPaneId && sSecondPaneId) {
						// if both informations given, remove the redundancy
						if (oResult[sFirstPaneId] === "hidden") {
							delete oResult[sSecondPaneId];
						} else if (oResult[sSecondPaneId] === "hidden") {
							delete oResult[sFirstPaneId];
						} else {
							delete oResult[sSecondPaneId];
						}
					}
				}
			}

			return oResult;

		},

		_setVisible : function(sId, bVisible, sPosition) {

			var that = this;
			var oControlRef = this._getAreaById(sId);
			var isVisible = bVisible || (sPosition && (sPosition !== "hidden"));
			var oSplitter = oControlRef.splitter;
			var bIsFirstPane = oControlRef.component === 1;

			var sActPosition = sPosition ? sPosition : that._getActSize(oSplitter, isVisible, oControlRef.component, oControlRef.size);

			if (isVisible) {

				if (!this._mContentById[sId]) {
					// service becomes visible for the first time
					return this.placeServiceAt(sId, oControlRef.service).then(function() {
						if (bIsFirstPane) {
							delete oSplitter.customWattData.firstPane;
						} else {
							delete oSplitter.customWattData.secondPane;
						}
						oSplitter.setSplitterPosition(sActPosition);
						oSplitter.setSplitterBarVisible(true);
					});

				} else {

					// Set the target size defined in the configuration properties
					oSplitter.setSplitterPosition(sActPosition);
					oSplitter.setSplitterBarVisible(true);
					if (bIsFirstPane) {
						delete oSplitter.customWattData.firstPane;
					} else {
						delete oSplitter.customWattData.secondPane;
					}

					return Q();

				}
			} else {

				oSplitter.setSplitterBarVisible(false);
				if (bIsFirstPane) {
					oSplitter.customWattData.firstPane = "hidden";
					oSplitter.setSplitterPosition("0%");
					jQuery(oSplitter.secondPane).css('width', '100%');
//					oSplitter.removeAllFirstPaneContent();
				} else {
					oSplitter.customWattData.secondPane = "hidden";
					oSplitter.setSplitterPosition("100%");
//					oSplitter.removeAllSecondPaneContent();
				}
//				delete this._mContentById[sId];
//				delete this._mAreaById[sId]["service"];

				return Q();
			}

		},

		_getActSize : function(oSplitter, bVisible, iNumber, sPosition) {
			var oCustomData = oSplitter.customWattData;
			if (iNumber === 1) {
				if (oCustomData && oCustomData.secondPane === "hidden") {
					return "100%";
				} else {
					return bVisible ? sPosition : "0%";
				}
			} else {
				if (oCustomData && oCustomData.firstPane === "hidden") {
					return "100%";
				} else {
					return bVisible ? sPosition : "100%";
				}
			}
		},

		_isFirstPane : function(oSplitter, oContent) {
			if (oSplitter.getFirstPaneContent()[0] === oContent) {
				return true;
			} else if (oSplitter.getSecondPaneContent()[0] === oContent) {
				return false;
			}
		},

		_onVisibilityChange : function(oEvent) {
			var that = this;
			var sServiceName = oEvent.source.getProxyMetadata().getName();
			var sAreaId = this._getAreaForService(sServiceName);
			var oResultPromise = undefined;
			if (sAreaId) {
				oResultPromise = this.setAreaVisible(sAreaId, oEvent.params.visible);
			} else if (oEvent.params.visible) {
				var oService = this._mServicesByName[sServiceName];
				if (oService) {
					// Check for an service at that place.
					var oServiceAtPlace =this._getServiceAt(oService.area);
					oServiceAtPlace = (oServiceAtPlace && oServiceAtPlace != sServiceName) ?
						this._mServicesByName[oServiceAtPlace] : undefined;
					if (oServiceAtPlace) {
						// If there is already a service hide it at first
						oResultPromise = oServiceAtPlace.service.isVisible().then(function(bVisible){
							if (bVisible) {
								that._oPreferenceModel.setNetEnabled(false); // don't track close and open
								return oServiceAtPlace.service.setVisible(false).then(function(){
									return that.placeServiceAt(oService.area, sServiceName).then(function(){
										that._oPreferenceModel.setNetEnabled(true); // re-enable to track new layouit area state
										return that.setAreaVisible(oService.area, oEvent.params.visible);
									});
								});
							} else {
								return that.placeServiceAt(oService.area, sServiceName).then(function(){
									return that.setAreaVisible(oService.area, oEvent.params.visible);
								});
							}
						});
					} else {
						oResultPromise = that.placeServiceAt(oService.area, sServiceName).then(function(){
							return that.setAreaVisible(oService.area, oEvent.params.visible);
						});
					}
				}
			}
			return oResultPromise ? oResultPromise : Q();
		}

	});

	// This object handles the user specific settings of the perspective service
	var PreferenceModel = function(oPreferenceService, sVersion) {

		// an empty model implementation 
		var mDummy = {

			_mUserPreferencesAsJson : {},
			_bEnabled : false, // by default the persistency is disabled; shall be enabled not too early to prevent write operations at startup

			beginSession : function(sPerspective) {
				that._mUserPreferencesAsJson[sPerspective] = {};
				return Q();
			},

			storeSession : function(sPerspective, oUserSettingsAsJson) {
				this._mUserPreferencesAsJson[sPerspective + "_lastKnown"] = this._extractLastKnown(
					this._mUserPreferencesAsJson[sPerspective], oUserSettingsAsJson);
				this._mUserPreferencesAsJson[sPerspective] = oUserSettingsAsJson;
				return Q();
			},

			removeSession : function() {
				return Q();
			},

			// LastKnown is necessary for HANA IDE to keep areas sizes stable
			getLastKnown : function(sPerspective) {
				return this._mUserPreferencesAsJson[sPerspective + "_lastKnown"];
			},

			_extractLastKnown : function(mOldUserSettingsAsJson, mNewUserSettingsAsJson) {
				var mOld = mOldUserSettingsAsJson || {};
				var mNew = mNewUserSettingsAsJson || {};
				var oResult = {};
				jQuery.each(mNew, function(iIndex, oNewItem) {
					if (iIndex === "content") { return true; } // continue
					if (oNewItem != "hidden") {
						oResult[iIndex] = oNewItem;
					} else {
						var oCorrespondingOldItem = mOld[iIndex];
						if (oNewItem === "hidden" && oCorrespondingOldItem != "hidden") {
							oResult[iIndex] = oCorrespondingOldItem;
						}
					}
				});
				return oResult;
			},

			/*
			 * Enabled/disables persistency of the settings
			 * @param {object} bEnabled true for enable, false for disable persistency
			 */
			setNetEnabled : function(bEnabled) {
				this._bEnabled = bEnabled;
			},

			/*
			 * Check enabling of persistency
			 * @return true if enabled, false if disabled
			 */
			getNetEnabled : function() {
				return this._bEnabled;
			}

		};

		var mFunc = jQuery.extend({}, mDummy, {

			_fPersistenceSrv : undefined,
			_sPersistenceNode : undefined,
			_mUserPreferencesAsJson : {},
			_formatVersion : undefined,

			/*
			 * Reads user settings fro backand and returns a promise
			 * @returns {object} a promise
			 */
			beginSession : function(sPerspective) {
				var that = this;
				return this._fPersistenceSrv.get(this._sPersistenceNode).then(function(mUserSettingsAsJson) {
					// Discard settings if version indicator is different!
					if (mUserSettingsAsJson && mUserSettingsAsJson.version === that._formatVersion) {
						that._mUserPreferencesAsJson[sPerspective] = mUserSettingsAsJson[sPerspective];
					}
					return that._mUserPreferencesAsJson[sPerspective];
				}).fail(function(oError){
					that._mUserPreferencesAsJson[sPerspective] = {};
					return null;
				});
			},

			/* 
			 * Store the user settings
			 * @param {object} oUserSettingsAsJson the user settings as a json object
			 */
			storeSession : function(sPerspective, oUserSettingsAsJson) {
				var oResult = Q();
				// Cache current user settings
				if (this.getNetEnabled()) {
					this._mUserPreferencesAsJson.version = this._formatVersion;
					// the diff for json obejcts is now build in to the preference service
					this._mUserPreferencesAsJson[sPerspective + "_lastKnown"] = this._extractLastKnown(
						this._mUserPreferencesAsJson[sPerspective], oUserSettingsAsJson);
					this._mUserPreferencesAsJson[sPerspective] = oUserSettingsAsJson;
					// Write through to orion
					oResult = this._fPersistenceSrv.set(this._mUserPreferencesAsJson, this._sPersistenceNode).fail(function(oError) {
						console.error("perspective: user settings could not be written! " + oError);
					});
				}
				return oResult;
			},

			/* 
			 * Removes the user settings
			 */
			removeSession : function() {
				this._mUserPreferencesAsJson= {};
				return this._fPersistenceSrv.remove(this._sPersistenceNode).fail(function(oError) {
					console.error("perspective: user settings could not be removed! " + oError);
				});
			}

		});

		if (oPreferenceService && oPreferenceService.service) {
			mFunc._fPersistenceSrv = oPreferenceService.service;
			mFunc._sPersistenceNode = oPreferenceService.node;
			mFunc._formatVersion = sVersion;
			return mFunc;
		} else {
			return mDummy;
		}

	};

	return oPerspectiveController;

});