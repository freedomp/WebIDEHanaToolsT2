/**
 * Created by I065595 on 06/08/2015.
 */
define(
	[
		"sap/watt/lib/lodash/lodash"
	],
	function (_) {
		"use strict";

		var
			/**
			 * filesystem.documentProvider service object
			 *
			 * @type {object}
			 * @private
			 */
			_oDocumentProviderService = null,

			/**
			 * generation service object
			 *
			 * @type {object}
			 * @private
			 */
			_oGenerationService = null,

			/**
			 * template service object
			 *
			 * @type {object}
			 * @private
			 */
			_oTemplateService = null,

			/**
			 * dialogprogress service object
			 *
			 * @type {object}
			 * @private
			 */
			_oProgressService = null,

			/**
			 * usernotification service object
			 *
			 * @type {object}
			 * @private
			 */
			_oUserNotificationService = null,


			/**
			 * The name of the new generated project.
			 * If it is already exist it will be used as a prefix to a running index.
			 *
			 * @type {string}
			 * @private
			 */
			_sProjectNamePrefix = "QuickStartApplication",

			/**
			 * i18n service object
			 *
			 * @type {object}
			 * @private
			 */
			_oI18nService = null,

			/**
			 * Interval ID for the last automatically progress interval
			 *
			 * @type {number}
			 * @private
			 */
			_iIntervalId = null;


		/**
		 * Returns the project names exist in the worksapce
		 *
		 * @returns {Array} - array with the project names in the workspace
		 *
		 * @name _getProjectNamesInWorksapce
		 * @function
		 * @private
		 */
		function _getProjectNamesInWorksapce() {
			jQuery.sap.assert(_oDocumentProviderService, "QuickStartProjectGenerationUtils is not initialized");

			var aProjectNamesInWorkspace = [];

			// get root
			return _oDocumentProviderService.getRoot().then(function (oRoot) {
				// get root content
				return oRoot.getCurrentMetadata().then(function (aContent) {
					// go over the content
					for (var index in aContent) {
						aProjectNamesInWorkspace.push(aContent[index].name);
					}
					return aProjectNamesInWorkspace;
				});
			});
		}

		/**
		 * Returns the name of the generated project.
		 *
		 * @param {string} sProjectNamePrefix - The prefix of the final project name
		 * @param {number} iIndex - the running index which will be used as the suffix of the project in case a project with the same name exists
		 * @param {Array} aProjNames - the project name exist in the workspace
		 * @returns {string} - the project name
		 *
		 * @name _findQuickStartProjectName
		 * @function
		 * @private
		 */
		function _findQuickStartProjectName(aProjNames) {

			var bFound = false, iIndex = 2;

			if (aProjNames.indexOf(_sProjectNamePrefix) === -1) {
				return _sProjectNamePrefix;
			}
			while (!bFound) {
				if (aProjNames.indexOf(_sProjectNamePrefix + iIndex) !== -1) { //This name exist in the workspace
					iIndex++;
				}
				else { //Found a name which does not exist in workspace
					return _sProjectNamePrefix + iIndex;
				}
			}
		}

		var QuickStartProjectGenerationUtils = {

			/**
			 * Initializes QuickStartProjectGenerationUtils
			 * This method is invoked only once
			 *
			 * @param {object} oContext service context object
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.QuickStartProjectGenerationUtils.init
			 * @function
			 * @public
			 */
			init: _.once(function (oContext) {
				jQuery.sap.assert(oContext, "oContext must be a valid service context");

				_oDocumentProviderService = _.get(oContext, "service.filesystem.documentProvider");
				jQuery.sap.assert(_oDocumentProviderService, "filesystem.documentProvider service does not exist in the given context");

				_oGenerationService = _.get(oContext, "service.generation");
				jQuery.sap.assert(_oGenerationService, "generation service does not exist in the given context");

				_oTemplateService = _.get(oContext, "service.template");
				jQuery.sap.assert(_oTemplateService, "template service does not exist in the given context");

				_oProgressService = _.get(oContext, "service.dialogprogress");
				jQuery.sap.assert(_oProgressService, "progress service does not exist in the given context");

				_oUserNotificationService = _.get(oContext, "service.usernotification");
				jQuery.sap.assert(_oUserNotificationService, "progress usernotification does not exist in the given context");

				_oI18nService = _.get(oContext, "i18n");
				jQuery.sap.assert(_oI18nService, "i18n service does not exists in the given context");
			}),


			/**
			 * Calculates the project name of the quick start project based on a predefined prefix and a running index
			 *
			 * @returns {string} - the project name of the new quick start project
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.QuickStartProjectGenerationUtils.getQuickStartProjectName
			 * @function
			 * @public
			 */
			getQuickStartProjectName: function () {

				return _getProjectNamesInWorksapce().then(function (aProjNames) {
					return _findQuickStartProjectName(aProjNames);
				});
			},


			/**
			 * Responsible for the creation of a new project with the given name, and then generating into it content
			 * based on the quick start template
			 *
			 * @param {string} sProjectName - the project name
			 * @returns {Promise} a deferred promise that will provide the JSON representation of the created project folder
			 *
			 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.utils.QuickStartProjectGenerationUtils.createQuickStartProject
			 * @function
			 * @public
			 */
			createQuickStartProject: function (sProjectName) {

				var oQuickStartTemplate, n = 10,
					sTemplateId = "wysiwygtemplate.quickStart",
					oModel = {
						"quickStart": {
							"parameters": {
								"ProjectNamespace": {
									"value": sProjectName
								}
							}
						}
					};

				jQuery.sap.assert(_oTemplateService && _oDocumentProviderService && _oGenerationService, "QuickStartProjectGenerationUtils is not initialized");

				return _oProgressService.show(_oI18nService.getText("w5g_editor_command_quickStart_generation_wait"))
					.then(function () {
						return _oProgressService.setProgress(n).then(function () {

							return _oTemplateService.getTemplates().then(function (mTemplates) {
								oQuickStartTemplate = mTemplates[sTemplateId];

								_iIntervalId = setInterval(function () {
									n += 20;
									if (n > 100) {
										clearInterval(_iIntervalId);
									}
									_oProgressService.setProgress(n);
								}, 2000);

								return _oGenerationService.generateProject(sProjectName, oQuickStartTemplate, oModel, false).then(function () {
									clearInterval(_iIntervalId);
								});

							}).fail(function (oError) {
								_oUserNotificationService.alert(oError.message).done();
							}).fin(function () {
								_oProgressService.hide().done();
							});
						});
					});
			}
		};

		return QuickStartProjectGenerationUtils;
	});
