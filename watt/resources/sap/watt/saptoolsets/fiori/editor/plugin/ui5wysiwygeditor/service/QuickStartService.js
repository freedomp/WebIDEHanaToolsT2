define(
	[
		"../utils/W5gUtils",
		"../utils/QuickStartProjectGenerationUtils"
	],
	function (W5gUtils, QuickStartProjectGenerationUtils) {
		"use strict";


		/*
		 * Promise which reflects the status of uploading metadata xml file to the project
		 * @type {*}
		 * @private
		 */
		var _oMetadataLoadedDeferred = null;

		/**
		 * Returns UI5 WYSIWYG editor context
		 *
		 * @returns {object} context
		 *
		 */

		var QuickStart = {

			getContext: function () {
				return this.context.service.ui5wysiwygeditor.context;
			},

			init: function () {
				QuickStartProjectGenerationUtils.init(this.getContext());
			},

			/**
			 * Handles event fired when metadata.xml is successfully uploaded to the project
			 */
			onMetadataUploaded: function () {
				if (_oMetadataLoadedDeferred) {
					_oMetadataLoadedDeferred.resolve();
				}
			},

			/**
			 * Responsible for generating the quick start template project and at the end, open it
			 * With Layout Editor
			 *
			 * @returns {*}
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.service.QuickStartService#quickStartWithLayoutEditor
			 * @function
			 * @public
			 */
			quickStartWithLayoutEditor: function () {

				var sViewName = "view1", that = this;
				_oMetadataLoadedDeferred = Q.defer();

				return QuickStartProjectGenerationUtils.getQuickStartProjectName().then(function (sProjectName) {
					//1) Create a new project based on our simple template
					return QuickStartProjectGenerationUtils.createQuickStartProject(sProjectName).then(function () {
						//Need to wait for the metadata.xml to be uploaded:
						return _oMetadataLoadedDeferred.promise.then(function () {
							//2) After the project was successfully created open it in Layout Editor
							return W5gUtils.openViewFromProject(that.context, sProjectName, sViewName);
						});
					});
				});
			}
		};

		return QuickStart;

	}
);
