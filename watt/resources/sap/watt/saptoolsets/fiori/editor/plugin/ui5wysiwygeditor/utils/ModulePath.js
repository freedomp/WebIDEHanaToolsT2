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
			 * @const
			 * @type {string}
			 * @private
			 */
			RESOURCE_ROOTS_ATTR = "data-sap-ui-resourceroots",
			/**
			 * project handler service object
			 *
			 * @type {object}
			 * @private
			 */
			_oUI5ProjectHandler = null;

		/**
		 * Get module paths data from manifest.json (app descriptor).
		 *
		 * @param {object} oDocument
		 * @param {string} sPathToAppDescriptor
		 * @param {string} sAppNamespace
		 * @param {object} oUi5Attr
		 * @returns {{parentFolder: string, resourcesroots : object<string, string>}}
		 * @private
		 */
		function _getModulePathFromAppDescriptor(oDocument, sPathToAppDescriptor, sAppNamespace, oUi5Attr) {
			var oEntity = oDocument.getEntity();
			var sLocation = oEntity.getBackendData().location;
			var sFullPath = oEntity.getFullPath();
			var rPathAtTheEnd = new RegExp(sFullPath + '$');
			var sLocationPrefix = sLocation.replace(rPathAtTheEnd, "");
			var sManifestLocation = sLocationPrefix + sPathToAppDescriptor + '/';
			var resourceRoots = {};
			resourceRoots[sAppNamespace] = "./";
			if (oUi5Attr) {
				_.assign(resourceRoots, oUi5Attr.resourceRoots);
			}
			return {parentFolder: sManifestLocation, resourcesroots: resourceRoots};
		}

		/**
		 * fallback - Get module paths data from html index files
		 *
		 * @param {object} oDocument
		 * @returns {{parentFolder: string, resourcesroots : object<string, string>}|null}
		 */
		function _getModulePathsFromIndex(oDocument) {
			if (oDocument.isProject()) {
				return null;
			}
			var that = this;
			return oDocument.getParent().then(function (oFolder) {
				return oFolder.getFolderContent().then(function (content) {
					var indexHtmlDocument = _.find(content, function (oFolderChildDocument) {
						var docName = oFolderChildDocument.getEntity().getName().toUpperCase();
						return "index.html".toUpperCase() === docName || "localIndex.html".toUpperCase() === docName;
					});
					if (indexHtmlDocument) {
						return indexHtmlDocument.getContent().then(function (sContent) {
							var sJsonContent = jQuery('<div/>').append(jQuery(sContent)).find("script[" + RESOURCE_ROOTS_ATTR + "]").attr(RESOURCE_ROOTS_ATTR);
							return (sJsonContent) ? {
								parentFolder: oFolder.getEntity().getBackendData().location,
								resourcesroots: JSON.parse(sJsonContent)
							} : null;
						});
					}
					return _getModulePathsFromIndex(oFolder);
				});
			});
		}

// End
// Private variables and methods

		return {
			/**
			 * Initializes the utils
			 *
			 * @param {object} oContext W5g service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.ModulePath.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				_oUI5ProjectHandler = _.get(oContext, "service.ui5projecthandler");
				jQuery.sap.assert(_oUI5ProjectHandler, "project service does not exists in the given context");
			}),

			/**
			 * Get module paths data from manifest.json (app descriptor) or fallback to html index files.
			 *
			 * @param {object} oDocument
			 * @returns {{parentFolder: string, resourcesroots : object<string, string>}|null}
			 * */
			getModulePaths: function (oDocument) {
				var that = this;
				return Q.all([
					_oUI5ProjectHandler.getHandlerFilePath(oDocument),
					_oUI5ProjectHandler.getAppNamespace(oDocument)
				]).spread(function (sPathToAppDescriptor, sAppNamespace) {
					if (sPathToAppDescriptor && sAppNamespace) {
						return _oUI5ProjectHandler.getAttribute(oDocument, "sap.ui5").then(function (oUi5Attr) {
							return oUi5Attr;
						}).catch(function () {
							// probably manifest doesn't exist. Do nothing
						}).then(function (oUi5Attr) {
							return _getModulePathFromAppDescriptor(oDocument, sPathToAppDescriptor, sAppNamespace, oUi5Attr);
						});
					} else {
						return _getModulePathsFromIndex(oDocument);
					}
				}).catch(function () {
					return _getModulePathsFromIndex(oDocument);
				});
			}
		};
	}
);
