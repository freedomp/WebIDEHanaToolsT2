define(
	[
		"sap/watt/lib/lodash/lodash",
		"./BindingUtils"
	],
	function (_, BindingUtils) {
		"use strict";

// Private variables and methods
// Begin
	var
		/**
		 * XML regExp
		 *
		 * @const
		 * @type {RegExp}
		 * @private
		 */
		_oXMLRegExp = /^xml$/i,

		/**
		 * Whether metadata is loaded
		 *
		 * @type {boolean}
		 * @private
		 */
		_bMetadataLoaded = false,

		/**
		 * A map of arrays of event listeners
		 *
		 * @type {Object.<string, Array<object>>}
		 * @private
		 */
		_mMetadataListeners = {
			loaded: [],
			changed: []
		},

		/**
		 * The map of supported resource change event types
		 *
		 * @const
		 * @type {map<string, string>}
		 * @private
		 */
		SUPPORTED_RESOURCE_CHANGES = {
			renamed: "renamed",
			deleted: "deleted"
		},

		/**
		 * The key for storing WYSIWYG related information in the user preferences
		 *
		 * @const
		 * @type {string}
		 * @private
		 */
		USER_PREF_W5G = "sap.watt.saptoolsets.fiori.editor.ui5wysiwygeditor",

		/**
		 * preferences service object
		 *
		 * @type {object}
		 * @private
		 */
		_oPreferencesService = null,

		/**
		 * content service object
		 *
		 * @type {object}
		 * @private
		 */
		_oContentService = null,

		/**
		 * metadataHandler service object
		 *
		 * @type {object}
		 * @private
		 */
		_oMetadataHandlerService = null,

		/**
		 * odataProvider service object
		 *
		 * @type {object}
		 * @private
		 */
		_oODataProviderService = null,

		/**
		 * Metadata cache
		 *
		 * <ul>
		 * <li>'project' of type <code>string</code>
		 *            the current project name
		 * </li>
		 * <li>'path' of type <code>string</code>
		 *            the current metadata path
		 * </li>
		 * <li>'content' of type <code>string</code>
		 *            the current metadata content
		 * </li>
		 * <li>'entities' of type <code>Array(object)</code>
		 *            the entity sets parsed using current metadata
		 * </li>
		 * <li>'noMetadata' of type <code>boolean</code>
		 *            Whether the current project has no metadata
		 * </li>
		 * </ul>
		 *
		 * @type {{project: string, path: string, content: string, entities: string, noMetadata: boolean}}
		 * @private
		 */
		_oMetadataCache = {};

		/**
		 * Resets metadata cache
		 *
		 * @param {boolean=} bAll Whether to reset the current project property
		 *
		 * @name _resetMetadataCache
		 * @function
		 * @private
		 */
		function _resetMetadataCache(bAll) {
			_oMetadataCache = {
				project: bAll ? null : _oMetadataCache.project,
				path: null,
				content: null,
				entities: null,
				noMetadata: false
			};
		}

		/**
		 * Attaches event listener to specified metadata event
		 *
		 * @param {string} sEventName event name
		 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
		 *            oListener-instance (if present)
		 * @param {object=} oListener The object, that wants to be notified, when the event occurs
		 *
		 * @name attachMetadataEvent
		 * @function
		 * @private
		 */
		function attachMetadataEvent(sEventName, fnFunction, oListener) {
			jQuery.sap.assert(typeof fnFunction === "function", "ResourcesHelper.attach" + sEventName + ": fnFunction must be a function");
			jQuery.sap.assert(!oListener || typeof oListener === "object", "ResourcesHelper.attach" + sEventName + ": oListener must be empty or an object");

			var aListeners = _mMetadataListeners[sEventName];
			if (!_.where(aListeners, {oListener: oListener, fnFunction: fnFunction}).length) {
				aListeners.push({
					oListener: oListener,
					fnFunction: fnFunction
				});
			}
		}

		/**
		 * Removes all arrays from given object <code>oObject</code>
		 *
		 * @param {object} oObject object
		 * @param {boolean} bUseExtensions
		 * @return {object} Returns the given object <code>oObject</code> to allow method chaining
		 *
		 * @name _removeArrayPropertiesFromObject
		 * @function
		 * @private
		 */
		function _removeArrayPropertiesFromObject(oObject, bUseExtensions) {
			for (var sProperty in oObject) {
				if (oObject.hasOwnProperty(sProperty) && jQuery.isArray(oObject[sProperty])) {
					if (bUseExtensions && sProperty === "extensions") {
						oObject[sProperty].forEach(function(oExtension) {
							if (oExtension.namespace === "http://www.sap.com/Protocols/SAPData") {
								oObject["sap:" + oExtension.name] = oExtension.value;
							}
						});
					}
					delete oObject[sProperty];
				}
			}
			return oObject;
		}

		/**
		 * Gets properties and navigation properties for the given <code>oEntitySet</code> entity set
		 *
		 * @param {object} oMetadata service metadata
		 * @param {object} oEntitySet entity set
		 * @return {promise}
		 *
		 * @name _getAllProperties
		 * @function
		 * @private
		 */
		function _getAllProperties(oMetadata, oEntitySet) {
			return Q.all([
				_oODataProviderService.getProperties(oMetadata, oEntitySet),
				_oODataProviderService.getNavigations(oMetadata, oEntitySet)
			]).spread(function (aProperties, aNavProperties) {
				return {
					properties: aProperties || [],
					navProperties: aNavProperties || []
				};
			});
		}
// End
// Private variables and methods

		/**
		 * WYSIWYG resources helper.
		 */
		var ResourcesHelper = {
			/**
			 * Initializes the utils
			 *
			 * @param {object} oContext W5g service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");

				var oDocumentService = _.get(oContext, "service.document");
				_oMetadataHandlerService = _.get(oContext, "service.metadataHandler");
				_oODataProviderService = _.get(oContext, "service.odataProvider");
				_oPreferencesService = _.get(oContext, "service.preferences");
				_oContentService = _.get(oContext, "service.content");
				jQuery.sap.assert(_oMetadataHandlerService, "metadataHandler service does not exists in the given context");
				jQuery.sap.assert(_oODataProviderService, "odataProvider service does not exists in the given context");
				jQuery.sap.assert(oDocumentService, "document service does not exists in the given context");
				jQuery.sap.assert(_oPreferencesService, "preferences service does not exists in the given context");
				jQuery.sap.assert(_oContentService, "content service does not exists in the given context");

				oDocumentService.attachEvent("changed", ResourcesHelper.onResourceChanged);
				oDocumentService.attachEvent("created", ResourcesHelper.onMetadataChanged);
				oDocumentService.attachEvent("deleted", ResourcesHelper.onMetadataChanged);
				oDocumentService.attachEvent("changed", ResourcesHelper.onMetadataChanged);

				_resetMetadataCache(true);
			}),

			/**
			 * Handles 'changed', 'created' and 'deleted' events of 'document' service.
			 *
			 * @param {object} oEvent an event object
			 *
			 * @name onMetadataChanged
			 * @function
			 * @private
			 */
			onMetadataChanged: function(oEvent) {
				if (_oMetadataCache.project && oEvent && oEvent.source && oEvent.source._sName === "document" && oEvent.params) {
					var oDocument = oEvent.params.document;

					if (_oMetadataCache.path === oDocument.getEntity().getFullPath()) {
						if (oEvent.name === "deleted") {
							_resetMetadataCache();
							ResourcesHelper.fireMetadataChanged();
						} else if (_oMetadataCache.entities && oEvent.name === "changed" && oEvent.params.changeType === "content") {
							oDocument.getContent().then(function(sContent) {
								if (_oMetadataCache.content !== sContent) {
									_oMetadataCache.content = sContent;
									_oMetadataCache.entities = null;
								}
							}).done();
						}
					} else if (oEvent.name === "created" && _oXMLRegExp.test(oDocument.getEntity().getFileExtension())) {
						oDocument.getProject().then(function (oProjDoc) {
							if (_oMetadataCache.project === oProjDoc.getEntity().getName()) {
								_resetMetadataCache();
								ResourcesHelper.fireMetadataChanged();
							}
						}).done();
					}
				}
			},

			/**
			 * Handles 'changed' event of 'document' service.
			 * Updates the project.json file is necessary
			 *
			 * @param {object} oEvent an event object
			 *
			 * @name _onResourceChanged
			 * @function
			 * @private
			 */
			onResourceChanged: function(oEvent) {
				if (ResourcesHelper.isSupportedResourceChangeEvent(oEvent)) {
					var oDocument = oEvent.params.document,
						oNewDocument = oEvent.params.newDocument,
						sChangeType = oEvent.params.changeType;

					BindingUtils.getDataBindingSetting(oDocument).then(function (oDataBinding) {
						var sKey = BindingUtils.getDataBindingSettingKey(oDocument),
							oDocumentBinding = oDataBinding[sKey],
							sViewResourcePath = (oDocumentBinding || {}).entitySet;

						if (oDocumentBinding) {
							delete oDataBinding[sKey];
							if (SUPPORTED_RESOURCE_CHANGES.deleted === sChangeType) {
								oNewDocument = oDocument;
								sViewResourcePath = undefined;
							}

							return Q.all([oDocument.getProject(), oNewDocument.getProject()]).then(function (aProjects) {
								if (aProjects[0].getKeyString() === aProjects[1].getKeyString()) {
									return BindingUtils.setDataBindingSetting(oNewDocument, oDataBinding, sViewResourcePath);
								}
							});
						}
					}).fail(function (oError) {
						jQuery.sap.log.error(oError);
					}).done();
				}
			},

			/**
			 * Loads project metadata.
			 *
			 * @param {object} oDocument
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.loadMetadata
			 * @function
			 * @private
			 */
			loadMetadata: function(oDocument) {
				jQuery.sap.assert(_oMetadataHandlerService && _oODataProviderService, "ResourcesHelper is not initialized");

				return Q().then(function() {
					_bMetadataLoaded = false;

					return oDocument.getProject().then(function (oProjDoc) {
						var sProjName = oProjDoc.getEntity().getName();
						if (_oMetadataCache.project === sProjName && (_oMetadataCache.entities || _oMetadataCache.noMetadata)) {
							return _oMetadataCache.entities;
						}

						_oMetadataCache.project = sProjName;
						_oMetadataCache.noMetadata = false;

						return _oMetadataHandlerService.getMetadataDocuments(oProjDoc).then(function (aMetadataDocs) {
							if (jQuery.isArray(aMetadataDocs) && aMetadataDocs[0]) {
								jQuery.sap.assert(aMetadataDocs.length === 1, "ResourcesHelper.loadMetadata: more than one metadata in the project '" + sProjName + "'");

								var oEntity = aMetadataDocs[0].getEntity(),
									sFullPath = oEntity && oEntity.getFullPath();

								return _oODataProviderService.getMetadataFromWorkspace(sFullPath).then(function (oMetadata) {
									if (oMetadata) {
										return aMetadataDocs[0].getContent().then(function(sContent) {
											_oMetadataCache.path = sFullPath;
											_oMetadataCache.content = sContent;
										}).then(function() {
											return _oODataProviderService.getEntitySets(oMetadata).then(function (aEntitySets) {
												var aPromises = aEntitySets.map(function (oEntitySet) {
													return _getAllProperties(oMetadata, oEntitySet);
												});
												return Q.all(aPromises).then(function (aPropertiesOfDataSets) {
													var mNavEntities = {},
														mEntities = {},
														oEntitySet;
													aPropertiesOfDataSets.forEach(function (oAllProperties, iIndex) {
														//go over the entitySet and remove all properties of type array
														//before adding the properties of the entity
														oEntitySet = _removeArrayPropertiesFromObject(aEntitySets[iIndex]);
														mEntities[oEntitySet.name] = oEntitySet;
														oEntitySet.properties = oAllProperties.properties;
														oEntitySet.key = "/" + oEntitySet.name;

														oAllProperties.properties.forEach(function (oProperty) {
															_removeArrayPropertiesFromObject(oProperty, true);
															oProperty.key = oProperty.name;
														});
														oAllProperties.navProperties.forEach(function (oProperty) {
															mNavEntities[oEntitySet.name + "/" + oProperty.name] = oProperty.targetEntitySetName;
														});
													});

													return aEntitySets.concat(_.map(mNavEntities, function(sTargetName, sPath) {
														return {
															properties: mEntities[sTargetName].properties,
															key: "/" + sPath,
															name: sPath + " (" + sTargetName + ")"
														};
													}));
												});
											});
										});
									}
								});
							}

							_resetMetadataCache(); //else
							_oMetadataCache.noMetadata = true;
						}).fail(function (oError) {
							_resetMetadataCache();
							jQuery.sap.log.error("No metadata document : " + oError);
						});
					});
				}).then(function (aEntitySets) {
					_oMetadataCache.entities = aEntitySets;
					return _oMetadataCache.entities;
				}).finally(ResourcesHelper.fireMetadataLoaded);
			},

			/**
			 * Whether the given <code>oEvent</code> is supported resource change event
			 *
			 * @param {object} oEvent an event object
			 * @return {boolean} Return true if the given <code>oEvent</code> is supported resource change event
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.isSupportedResourceChangeEvent
			 * @function
			 * @public
			 */
			isSupportedResourceChangeEvent: function (oEvent) {
				if (!oEvent || !oEvent.source || oEvent.source._sName !== "document" || oEvent.name !== "changed" || !oEvent.params) {
					return false;
				}
				return !!SUPPORTED_RESOURCE_CHANGES[oEvent.params.changeType];
			},

			/**
			 * Whether metadata is loaded
			 *
			 * @return {boolean} Returns true if metadata is loaded
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.isMetadataLoaded
			 * @function
			 * @public
			 */
			isMetadataLoaded: function () {
				return _bMetadataLoaded;
			},

			/**
			 * Whether metadata need to be reloaded
			 *
			 * @return {boolean} Returns true if metadata need to be reloaded
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.isMetadataReloadNeeded
			 * @function
			 * @public
			 */
			isMetadataReloadNeeded: function () {
				return _bMetadataLoaded && !_oMetadataCache.noMetadata && !_oMetadataCache.entities;
			},

			/**
			 * Notifies all listeners about metadata has been loaded.
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.fireMetadataLoaded
			 * @function
			 * @private
			 */
			fireMetadataLoaded: function() {
				_bMetadataLoaded = true;

				jQuery.each(_mMetadataListeners.loaded, function () {
					this.fnFunction.call(this.oListener || ResourcesHelper);
				});

				_mMetadataListeners.loaded = [];
			},

			/**
			 * Notifies all listeners about metadata has been changed.
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.fireMetadataChanged
			 * @function
			 * @private
			 */
			fireMetadataChanged: function() {
				_oContentService.getCurrentEditor().then(function(oEditor) {
					if (oEditor && oEditor._sName == "ui5wysiwygeditor") {
						jQuery.each(_mMetadataListeners.changed, function () {
							this.fnFunction.call(this.oListener || ResourcesHelper);
						});
					}
				}).done();
			},

			/**
			 * Adds a event registration for the MetadataChanged event.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present)
			 * @param {object=} oListener The object, that wants to be notified, when the event occurs
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.attachMetadataChanged
			 * @function
			 * @public
			 */
			attachMetadataChanged: function (fnFunction, oListener) {
				attachMetadataEvent("changed", fnFunction, oListener);
			},

			/**
			 * Adds a one time event registration for the MetadataLoaded event.
			 * When the event occurs, the handler function is called and removed from registration.
			 *
			 * @param {function} fnFunction The function to call, when the event occurs. This function will be called on the
			 *            oListener-instance (if present)
			 * @param {object=} oListener The object, that wants to be notified, when the event occurs
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.attachMetadataLoadedOnce
			 * @function
			 * @public
			 */
			attachMetadataLoadedOnce: function (fnFunction, oListener) {
				attachMetadataEvent("loaded", fnFunction, oListener);
			},

			/**
			 * Retrieves WYSIWYG related information from the user preferences
			 *
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.retrieveUserPreferences
			 * @function
			 * @public
			 */
			retrieveUserPreferences: function() {
				jQuery.sap.assert(_oPreferencesService, "ResourcesHelper is not initialized");

				return _oPreferencesService.get(USER_PREF_W5G).then(function (mSettings) {
					return mSettings || {};
				}).fail(function (oError) {
					jQuery.sap.log.error("could not read WYSIWYG settings! " + oError);
					return {};
				});
			},

			/**
			 * Updates WYSIWYG related information in the user preferences
			 *
			 * @param {map<string, object>} mSettings settings key-value pairs
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ResourcesHelper.updateUserPreferences
			 * @function
			 * @public
			 */
			updateUserPreferences: function(mSettings) {
				jQuery.sap.assert(_oPreferencesService, "ResourcesHelper is not initialized");
				jQuery.sap.assert(mSettings && !jQuery.isEmptyObject(mSettings), "mSettings must be not empty object");

				return ResourcesHelper.retrieveUserPreferences().then(function (mOldSettings) {
					if (!jQuery.sap.equal(mSettings, mOldSettings, true)) {
						mOldSettings = jQuery.extend({}, mOldSettings, mSettings);
						return _oPreferencesService.set(mOldSettings, USER_PREF_W5G).fail(function (oError) {
							jQuery.sap.log.error("could not write WYSIWYG settings! " + oError);
						});
					}
				});
			}
		};

		return ResourcesHelper;
	}
);
