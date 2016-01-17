define(
	[
		"sap/watt/lib/lodash/lodash",
		"./W5gUtils"
	],
	function (_, W5gUtils) {
		"use strict";

// Private variables and methods
// Begin
		var
			/**
			 * Unbind item key
			 *
			 * @const
			 * @type {string}
			 * @private
			 */
			UNBIND_KEY = "UNBINDKEY",

			/**
			 * The key for storing data binding related information in the project.json file
			 *
			 * @const
			 * @type {string}
			 * @private
			 */
			PROJECT_DATA_BINDING = "dataBinding",

			/**
			 * project service object
			 *
			 * @type {object}
			 * @private
			 */
			_oProjectService = null;
// End
// Private variables and methods

		/**
		 * WYSIWYG data binding utilities.
		 */
		var BindingUtils = {
			/**
			 * Initializes the utils
			 *
			 * @param {object} oContext W5g service context
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");
				_oProjectService = _.get(oContext, "service.setting.project");
				jQuery.sap.assert(_oProjectService, "project service does not exists in the given context");
			}),

			/**
			 * Gets unbind item key
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.getUnbindKey
			 * @function
			 * @public
			 */
			getUnbindKey: function() {
				return UNBIND_KEY;
			},

			/**
			 * Retrieves data binding information from 'project.json' file
			 *
			 * @param {Document} oDocument document resource
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.getDataBindingSetting
			 * @function
			 * @public
			 */
			getDataBindingSetting: function(oDocument) {
				jQuery.sap.assert(_oProjectService, "BindingUtils is not initialized");

				return _oProjectService.getProjectSettings(PROJECT_DATA_BINDING, oDocument).then(function (oDataBinding) {
					return oDataBinding || {};
				}).fail(function (oError) {
					jQuery.sap.log.error(oError);
					return {};
				});
			},

			/**
			 * Stores data binding information for the given document in the 'project.json' file
			 *
			 * @param {Document} oDocument document resource
			 * @param {object} oDataBinding info (json object)
			 * @param {string} sEntitySet value
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.setDataBindingSetting
			 * @function
			 * @public
			 */
			setDataBindingSetting: function(oDocument, oDataBinding, sEntitySet) {
				jQuery.sap.assert(_oProjectService, "BindingUtils is not initialized");

				oDataBinding = oDataBinding || {};
				if (sEntitySet !== undefined) {
					oDataBinding[BindingUtils.getDataBindingSettingKey(oDocument)] = {
						"entitySet": sEntitySet
					};
				}
				return _oProjectService.setProjectSettings(PROJECT_DATA_BINDING, oDataBinding, oDocument);
			},

			/**
			 * Gets a unique key for the given document
			 *
			 * @param {object} oDocument document
			 * @return {Q} promise
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.getDataBindingSettingKey
			 * @function
			 * @public
			 */
			getDataBindingSettingKey: function(oDocument) {
				return oDocument ? oDocument.getEntity().getProjectRelativePath() : ".";
			},

			/**
			 * Returns the binding info for the given property or aggregation.
			 *
			 * @param {object} oControl control or parent aggregation info
			 * @param {string=} sPropertyOrAggregation the name of the property or aggregation
			 * @return {object} Binding info if any
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.getBindingInfo
			 * @function
			 * @public
			 */
			getBindingInfo: function (oControl, sPropertyOrAggregation) {
				if (arguments.length === 1) {
					//oControl is a parent aggregation info
					sPropertyOrAggregation = oControl.aggregationName;
					oControl = oControl.parent;
				}
				if (!oControl) {
					return null;
				}

				var mBindingInfo = oControl.getBindingInfo(sPropertyOrAggregation);
				if (mBindingInfo) {
					if (mBindingInfo.parts) {
						mBindingInfo = mBindingInfo.parts[0];
					}
				}
				return mBindingInfo;
			},

			/**
			 * Returns the binding info of the closest ancestor which is a template
			 *
			 * @param {sap.ui.core.Control} oControl control
			 * @return {object} Binding info if any
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.getClosestBindingInfo
			 * @function
			 * @public
			 */
			getClosestBindingInfo: function (oControl) {
				var oInfo = W5gUtils.getWYSIWYGParentAggregationInfo(oControl),
					oBindingInfo = BindingUtils.getBindingInfo(oInfo);

				return oBindingInfo || oInfo.parent && BindingUtils.getClosestBindingInfo(oInfo.parent);
			},

			/**
			 * Gets the entity with the given <code>sKey</code> from <code>aEntities</code>
			 *
			 * @param {Array<object>} aEntities array of entities
			 * @param {string} sKey entity key
			 * @return {object} Returns the matched entity object if any
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.getEntityByKeySet
			 * @function
			 * @public
			 */
			getEntityByKeySet: function(aEntities, sKey) {
				sKey = BindingUtils.normalizeDataSetPath(sKey);
				return _.find(aEntities, function (oEntry) {
					return oEntry.key === sKey;
				});
			},

			/**
			 * Normalizes data set key
			 *
			 * @param {string} sPath Data set key
			 * @return {string} normalized data set key
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.BindingUtils.normalizeDataSetPath
			 * @function
			 * @public
			 */
			normalizeDataSetPath: function(sPath) {
				if (!sPath || sPath === UNBIND_KEY || jQuery.sap.startsWith(sPath, "/")) {
					return sPath;
				}
				return "/" + sPath;
			}
		};

		return BindingUtils;
	}
);
