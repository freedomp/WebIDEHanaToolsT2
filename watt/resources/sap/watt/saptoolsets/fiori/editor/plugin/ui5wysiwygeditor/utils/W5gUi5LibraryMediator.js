define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * usernotification service object
			 *
			 * @type {Object}
			 * @private
			 */
			_oUserNotificationService = null,

			/**
			 * intellisence service object
			 *
			 * @type {Object}
			 * @private
			 */
			_oIntellisenceService = null,

			/**
			 * Project configured sapui5 version (expected format is '1.26.8')
			 *
			 * @type {string}
			 * @private
			 */
			_sProjectUI5Version,

			/**
			 * Object map, which keep references to loaded sapui5 versions by its version
			 *
			 * @type {Object}
			 * @private
			 */
			_mLoadedLibraries = {},

			/**
			 * Compiled sapui5 version string
			 *
			 * @type {string}
			 * @private
			 */
			_aLastUI5version = sap.ui.version.split(".");

		/**
		 * Alerts the given <code>sMessage</code>
		 *
		 * @param {string} sMessage message to show
		 * @return {Q} promise
		 *
		 * @name _alert
		 * @function
		 * @private
		 */
		function _alert(sMessage) {
			jQuery.sap.assert(_oUserNotificationService, "W5gUi5LibraryMediator is not initialized");
			
			return _oUserNotificationService && _oUserNotificationService.alert(sMessage);
		}

		/**
		 * Returns true if requested library version lower then sapui5 one of WebIDE compiled with
		 *
		 * @param {string} sVersion of verifying library
		 * @returns {boolean} whether this library version less than compiled one
		 *
		 * @name _isLibraryLowerThenCompiled
		 * @function
		 * @private
		 */
		function _isLibraryLowerThenCompiled(sVersion) {
			var aVersion = (sVersion || "").split(".");
			_.each(aVersion, function (sPart, n) {
				aVersion[n] = parseInt(sPart, 10);
			});
			var result = _compareVersions(aVersion, _aLastUI5version);
			return !!(isNaN(result) || result <= 0);
		}

		/**
		 * Compare versions. Expect for two arrays of numbers.
		 *
		 * @param {array} aV1 first numbers array for comparison (like :1,26,12)
		 * @param {array} aV2 second numbers array for comparison (like :1,6,52)
		 * @returns {number} comparison result, where v1 < v2 returns -1, v1 === v2 returns 0, v1 > v2 returns 1
		 *
		 * @name _compareVersions
		 * @function
		 * @private
		 */
		function _compareVersions(aV1, aV2) {
			var iMinLength = Math.min(aV1.length, aV2.length);
			for (var i = 0; i < iMinLength; i++) {
				if (aV1[i] === aV2[i]) {
					continue;
				}
				if (aV1[i] > aV2[i]) {
					return 1;
				}
				if (aV1[i] < aV2[i]) {
					return -1;
				}
				// one operand is NaN
				return NaN;
			}
			if (aV1.length === aV2.length) {
				return 0;
			}
			return (aV1.length < aV2.length) ? -1 : 1;
		}

		/**
		 * Trying to determinate and to load a specified sapui5 library according its metadata
		 *
		 * @param {Object} oLibraryInfo a metadata of required library
		 * @returns {Object} object which fed with a relevant metadata of required library
		 *
		 * @name _initLibrary
		 * @function
		 * @private
		 */
		function _initLibrary(oLibraryInfo) {
			if (!oLibraryInfo.name || !oLibraryInfo.version) {
				return Q();
			}
			return _initLibraryRes(oLibraryInfo).then(function (oMetaData) {
				_mLoadedLibraries[oLibraryInfo.version] = oMetaData;
				return oMetaData;
			}).fail(function (oError) {
				return _alert(oError.message);
			});
		}

		/**
		 * Determinate whether library should be loaded from HCP or by direct url access
		 *
		 * @param {Object} oLibraryInfo a metadata of required library
		 * @returns {boolean} true if library should be loaded from HCP repository
		 *
		 * @name _isDynamicLibrary
		 * @function
		 * @private
		 */
		function _isDynamicLibrary(oLibraryInfo) {
			return (oLibraryInfo.remPath && oLibraryInfo.remPath.search('/sapui5') >= 0);
		}

		/**
		 * Initialization of required sapui5 library info
		 *
		 * @param {Object} oLibraryInfo a metadata of required library
		 * @returns {Object} object which fed with a relevant metadata of required library
		 *
		 * @name _initLibraryRes
		 * @function
		 * @private
		 */
		function _initLibraryRes(oLibraryInfo) {
			if (_isDynamicLibrary(oLibraryInfo)) {
				return _loadFromHCP(oLibraryInfo);
			}
			return _loadPackage(oLibraryInfo);
		}

		/**
		 * Load and unzip of required sapui5 library from HCP repository
		 *
		 * @param {Object} oLibraryInfo a metadata of required library
		 * @returns {Object} Object which fed with a relevant metadata of required library
		 *
		 * @name _loadFromHCP
		 * @function
		 * @private
		 */
		function _loadFromHCP(oLibraryInfo) {
			return _oIntellisenceService.libmetadataprovider.getLibraryMetaFromHCP(oLibraryInfo.remPath, "sapui5", "xml")
				.then(function (oMetadatas) {
					var oData = [];
					_.each(oMetadatas, function (oMetadata) {
						_.each(oMetadata.files, function (oZipFile) {
							if (oZipFile && oZipFile._data && oZipFile.name) {
								if (oZipFile.name.search("meta.json") >= 0) {
									oData.push(JSON.parse(oZipFile.asText()));
								}
							}
						});
					});
					return {
						libId: oLibraryInfo.name + ";" + oLibraryInfo.version,
						meta: oData
					};
				}
			);
		}

		/**
		 * Load and unzip of required sapui5 library by url access
		 *
		 * @param {Object} oLibraryInfo a metadata of required library
		 * @returns {Object} Object which fed with a relevant metadata of required library
		 *
		 * @name _loadPackage
		 * @function
		 * @private
		 */
		function _loadPackage(oLibraryInfo) {
			var oDeferred = new Q.defer();
			var sPackageUrl = require.toUrl(oLibraryInfo.libMetadata);
			var oRequest = new XMLHttpRequest();
			oRequest.open("GET", sPackageUrl, true);
			//oRequest.msCaching = 'enabled';
			//oRequest.setRequestHeader("Cache-Control", "max-age=2592000"); //30days (60sec * 60min * 24hours * 30days)
			oRequest.responseType = "arraybuffer";
			oRequest.onload = function () {
				if (this.readyState === 4 && this.status < 300) {
					try {
						var aContent = [], oJsZip = new JSZip();
						oJsZip.load(this.response);
						_.each(oJsZip.files, function (oZipFile) {
							if (oZipFile) {
								try {
									aContent.push(JSON.parse(oZipFile.asText()));
								} catch (e) {
									// Unexpected empty files / directories / malformed JSONs crash W5G. This catch prevents it
									jQuery.sap.log.error("Zip file: " + oZipFile.name + " could not be parsed");
								}
							}
						});
						oDeferred.resolve({
							libId: oLibraryInfo.name + ";" + oLibraryInfo.version,
							meta: aContent
						});
					} catch (e) {
						jQuery.sap.log.error(e);
						oDeferred.reject(e);
					}
				} else {
					jQuery.sap.log.error(oLibraryInfo.libMetadata + " request failed. State is " + this.readyState + " Status is " + this.status);
					oDeferred.reject(new Error(oLibraryInfo.libMetadata));
				}
			};
			oRequest.onerror = function (error) {
				oDeferred.reject(error);
			};
			oRequest.send(null);

			return oDeferred.promise;
		}

		/**
		 * Retrieve the requested control metadata from the project's configured sapui5 library if exist there
		 *
		 * @param {string} sControl string represents a requested control name
		 * @returns {object} metadata data structure of the requested control or null if it does not exist
		 *
		 * @private
		 */
		function _getControlMetadata(sControl) {
			if (_mLoadedLibraries[_sProjectUI5Version]) {
				if (!_mLoadedLibraries[_sProjectUI5Version].flatMeta) {
					_mLoadedLibraries[_sProjectUI5Version].flatMeta = _.assign.apply(undefined, _.map(_mLoadedLibraries[_sProjectUI5Version].meta, "metadatas"));
				}
				return _mLoadedLibraries[_sProjectUI5Version].flatMeta && _mLoadedLibraries[_sProjectUI5Version].flatMeta[sControl];
			}
			//library info is unavailable
			return true;
		}

		/**
		 * Returns the only relevant control's items of configured sapui5 library version
		 *
		 * @param {sap.ui.core.Control} oControl control object
		 * @param {string} sItemName name of the requested items
		 * @returns {Object} an object with populated properties
		 * @function
		 * @private
		 */
		function _getAllSupportedControlItems(oControl , sItemName) {
			var oControlMetadata = oControl.getMetadata(),
				oAllItems = oControlMetadata ? oControlMetadata['getAll' + _.capitalize(sItemName)]() : {};
			var oSupportedItems = oAllItems;
			if (_mLoadedLibraries[_sProjectUI5Version]) {
				var oUnsupported = {};
				_scanItems(this, oControl, oUnsupported, sItemName);
				if (_.keys(oUnsupported).length) { //...performance stuff
					oSupportedItems = {};
					//...assemble the only relevant items .....
					_.each(_.keys(oAllItems), function (oItem) {
						if (!oUnsupported[oItem]) {
							oSupportedItems[oItem] = oAllItems[oItem];
						}
					});
				}
			}
			return oSupportedItems;
		}

		/**
		 * Over the entire control properties and verify they against the metadata
		 * properties list of required sapui5 version
		 *
		 * @param {Object} oContext reference to current instance of W5gUi5LibraryMediator
		 * @param {sap.ui.core.Control} oControl testee control object
		 * @param {string} sItemsName name of the items to scan
		 * @returns {Object} oUnsupported which fed with a relevant metadata of required library
		 *
		 * @name _scanItems
		 * @function
		 * @private
		 */
		function _scanItems(oContext, oControl, oUnsupported , sItemsName) {
			var oControlMetadata = oControl.getMetadata() || {};
			//if (oContext.isControlSupported(oControlMetadata._sClassName)) {
				var oMetadata = _getControlMetadata(oControlMetadata._sClassName);
				if (oMetadata) {
					var oItems = oMetadata[sItemsName] || {};
					//...unfortunately we have not list of ALL items from required ui5 library, but only
					//...control items itself (without it's parent items). Hence we can
					//...discover a difference in control's items recursively.
					_.each(_.keys(oControlMetadata['get' + _.capitalize(sItemsName)]()), function (oItem) {
						if (!oItems[oItem]) {
							oUnsupported[oItem] = oItem;
						}
					});
				}
			//} else {
			//	jQuery.sap.log.debug(["Error :: control ", oControlMetadata._sClassName, " is oUnsupported in ", _sProjectUI5Version, " sapUI5 version"].join(''));
			//}
			var oParent = oControl.getParent();
			if (oParent) {
				return _scanItems(oContext, oParent, oUnsupported, sItemsName);
			}
			return oUnsupported;
		}

// End
// Private variables and methods

		/**
		 * W5gUi5LibraryMediator component
		 *
		 * @type {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator}
		 */
		var W5gUi5LibraryMediator = {

			/**
			 * Initializing of component
			 *
			 * @param {object} oContext context.service object
			 * @returns
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator#init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				_oUserNotificationService = _.get(oContext, "service.usernotification");
				_oIntellisenceService = _.get(oContext, "service.intellisence");
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				jQuery.sap.assert(_oUserNotificationService, "usernotification service does not exists in the given context");
				jQuery.sap.assert(_oIntellisenceService, "intellisence service does not exists in the given context");

				_.each(_aLastUI5version, function (sPart, n) {
					_aLastUI5version[n] = parseInt(sPart, 10);
				});
			}),

			/**
			 * Loading of required sapui5 library metadata information
			 *
			 * @param
			 * @returns
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator#loadLibrary
			 * @function
			 * @public
			 */
			loadLibrary: function (oDocument) {
				jQuery.sap.assert(_oIntellisenceService, "W5gUi5LibraryMediator is not initialized");

				return _oIntellisenceService.getCalculatedLibraries(oDocument).then(function (oLibraries) {
					var aPromises = [];
					_.each(oLibraries, function (oLibrary) {
						//if (_isLibraryLowerThenCompiled(oLibrary.version)) {
						if (oLibrary && !_mLoadedLibraries[oLibrary.version]) {
							aPromises.push(_initLibrary(oLibrary));
						}
						//}
						_sProjectUI5Version = oLibrary.version;
					});
					return Q.all(aPromises).then(function (oLibs) {
						_.each(oLibs, function (oLib) {
							if (oLib) {
								jQuery.sap.log.debug("Library " + oLib.libId + " loaded");
							}
						});
					});
				}).fail(function (oError) {
					return _alert(oError.message);
				});
			},

			/**
			 * Gets the array of supported controls
			 *
			 * @param {sap.ui.dt.DesignTime} oDesignTime
			 * @return {Array<object>} the array of supported controls
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator#getSupportedControls
			 * @function
			 * @public
			 */
			getSupportedControls: function (oDesignTime) {
				var aSupportedControls = [];
				if (oDesignTime) {
					aSupportedControls = _.map(oDesignTime.getDesignTimeMetadata(), function (oDTMetadata, key) {
						return _.assign(
							{
								title: oDTMetadata.name || key.substring(key.lastIndexOf(".") + 1).replace(/([a-z])([A-Z])/g, '$1 $2')
							},
							oDTMetadata,
							{
								name: key
							}
						);
					});
					_.remove(aSupportedControls, function (oControl) {
						return !W5gUi5LibraryMediator.isControlSupported(oControl.name);
					});
				}
				return aSupportedControls;
			},

			/**
			 * Whether a requested control is supported by project's configured sapui5 library or not
			 *
			 * @param {string} sControl string represents a requested control name
			 * @returns {boolean} true in case of requested control is supported by project's configured sapui5 library
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator#isControlSupported
			 * @function
			 * @public
			 */
			isControlSupported: function (sControl) {
				return !!_getControlMetadata(sControl);
			},

			/**
			 * Returns the only relevant control's properties of configured sapui5 library version
			 *
			 * @param {sap.ui.core.Control} oControl control object
			 * @returns {Object} an object with populated properties
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator#getAllSupportedControlProperties
			 * @function
			 * @public
			 */
			getAllSupportedControlProperties: function (oControl) {
				return _getAllSupportedControlItems(oControl , 'properties');
			},

			/**
			 * Returns the only relevant control's events of configured sapui5 library version
			 *
			 * @param {sap.ui.core.Control} oControl control object
			 * @returns {Object} an object with populated events
			 *
			 * @name sap.watt.common.plugin.ui5wysiwygeditor.utils.W5gUi5LibraryMediator#getAllSupportedControlEvents
			 * @function
			 * @public
			 */
			getAllSupportedControlEvents: function (oControl) {
				return _getAllSupportedControlItems(oControl , 'events');
			},

// QUnit API Methods
// Begin
			__QUnit_setMockInitLibrary: function (oLibraryInfo, oMetadata) {
				_mLoadedLibraries[oLibraryInfo.version] = oMetadata;
			},
			__QUnit_getLastUI5version: function () {
				return _aLastUI5version;
			},
			__QUnit_getLoadedLibraries: function () {
				return _mLoadedLibraries;
			},
			__QUnit_getIsLibraryLowerThenCompiledFunction: function () {
				return _isLibraryLowerThenCompiled;
			}
// End
// QUnit API Methods

		};

		return W5gUi5LibraryMediator;
	}
);