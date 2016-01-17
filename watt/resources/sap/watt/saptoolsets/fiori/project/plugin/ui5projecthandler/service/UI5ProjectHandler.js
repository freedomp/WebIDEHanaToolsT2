define([ "sap.watt.saptoolsets.fiori.project.ui5projecthandler/util/AppDescriptorHandler",
		"sap.watt.saptoolsets.fiori.project.ui5projecthandler/util/ComponentHandler",
		"sap.watt.saptoolsets.fiori.project.ui5projecthandler/util/ConfigurationHandler",
		"sap.watt.saptoolsets.fiori.project.ui5projecthandler/util/GenericHandler",
		"sap/watt/lib/lodash/lodash"],
	function(AppDescriptorHandler, ComponentHandler, ConfigurationHandler, GenericHandler, _) {
		"use strict";

		return sap.ui.base.Object.extend("sap.watt.saptoolsets.fiori.project.ui5projecthandler.service.UI5ProjectHandler", {

			projectGuidelinesTypes : {
				DESCRIPTOR: null,
				SCAFFOLDING_CONF: null,
				SCAFFOLDING_COMP: null
			},

			guidelinesFileNames : {
				DESCRIPTOR: null,//"manifest.json",
				SCAFFOLDING_COMP: null,//"Component.js",
				SCAFFOLDING_CONF: null//"Configuration.js"
			},

			init : function() {
				this.projectGuidelinesTypes.DESCRIPTOR = AppDescriptorHandler;
				this.projectGuidelinesTypes.SCAFFOLDING_CONF = ConfigurationHandler;
				this.projectGuidelinesTypes.SCAFFOLDING_COMP = ComponentHandler;

				this.guidelinesFileNames.DESCRIPTOR = AppDescriptorHandler.getHandlerFileName();
				this.guidelinesFileNames.SCAFFOLDING_CONF = ConfigurationHandler.getHandlerFileName();
				this.guidelinesFileNames.SCAFFOLDING_COMP = ComponentHandler.getHandlerFileName();
			},

			configure : function(){
				//needs for extended implementation
				return Q();
			},

			/**
			 * Returns JSON content of the given attribute under handler file document
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sAttributeName]	a string representing of Attribute name
			 * 											(e.g. "sap.app", "dataSources")
			 * @returns {object}						a JSON content of the attribute
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getAttribute : function(oDocument, sAttributeName) {
				return this._handle(oDocument, "getAttribute", arguments);
			},

			/**
			 * Returns the name of the handler file
			 *
			 * @param 	{object}	oDocument			a document file in a project
			 *
			 * @returns {string}						Handler file name as a string
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * */
			getHandlerFileName : function (oDocument) {
				return this._handle(oDocument, "getHandlerFileName", arguments);
			},

			/**
			 * Returns string path of handler file document without handler file name
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 *
			 * @returns {string}						handler file path
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getHandlerFilePath : function(oDocument) {
				return this._handle(oDocument, "getHandlerFilePath",arguments);
			},

			/**
			 * Returns the handler file document
			 *
			 * @param 	{object}	oDocument			a document file in a project
			 *
			 * @returns {object}						Handler file document
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * */
			getHandlerDocument : function(oDocument) {
				return this._getProjectGuidelinesSelection(oDocument)
					.then(function(oProjectGuidelines) {
						return oProjectGuidelines.handlerDoc;
					});
			},

			/**
			 * Returns Application namespace
			 * [The method always takes the namespace from the Component.js file document
			 * as it exists in all supported projects, and always contains the true value]
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 *
			 * @returns {string}						string of application namespace
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getAppNamespace : function(oDocument) {
				var that = this;
				var aArguments = arguments;
				return this._getSelectedDocument().then(function(oSelectedDocument) {
					aArguments[0] = oDocument || oSelectedDocument;
					return that._getProjectGuidelinesTypeHandler(aArguments[0]).then(function (oProjectGuidelines) {

						if (oProjectGuidelines.handlerDoc.getEntity().getName() === that.guidelinesFileNames.SCAFFOLDING_COMP) {
							oProjectGuidelines = that._createProjectGuidelinesObj(
								that.projectGuidelinesTypes.SCAFFOLDING_COMP, oProjectGuidelines.handlerDoc);
							return that._dispatch("getAppNamespace", oProjectGuidelines, aArguments);
						} else {
							return GenericHandler.getDescriptorFileFromCompLocation(oProjectGuidelines.handlerDoc,
								that.guidelinesFileNames.SCAFFOLDING_COMP).then(function (oComponentDoc) {
									oProjectGuidelines = that._createProjectGuidelinesObj(
										that.projectGuidelinesTypes.SCAFFOLDING_COMP, oComponentDoc);
									return that._dispatch("getAppNamespace", oProjectGuidelines, aArguments);
								});
						}
					});
				});
			},

			/**
			 * Returns JSON object of all data source objects under handler file document
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @returns {object}						a JSON content of the data sources
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getDataSources : function(oDocument) {
				return this._handle(oDocument, "getDataSources", arguments);
			},

			/**
			 * Returns string array of all data source names under handler file document
			 *
			 * @param 	{object}	oDocument			a document file in a project
			 * @returns {Array}							a string array of all data source names
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getAllDataSourceNames : function(oDocument) {
				return this._handle(oDocument, "getAllDataSourceNames", arguments);
			},

			/**
			 * Returns JSON of data source object that equal to the given data source name
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceName]	a string representing data source name
			 * @returns {object}						a JSON content of the data source
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getDataSourcesByName : function(oDocument, sDataSourceName) {
				return this._handle(oDocument, "getDataSourcesByName", arguments);
			},

			/**
			 * Returns JSON object of annotations objects (containing all annotation data) that belong to the given
			 * data source name
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceName]	a string representing data source name
			 * @returns {Array}							JSON array of the data source's annotations
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getDataSourceAnnotationsByName : function(oDocument, sDataSourceName) {
				return this._handle(oDocument, "getDataSourceAnnotationsByName", arguments);
			},


			/**
			 * Returns JSON Array of data source object that equal to the given data source type
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceType]	a string representing data source name
			 * @returns {Array}							a JSON content of the data source
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getDataSourcesByType : function(oDocument, sDataSourceType) {
				return this._handle(oDocument, "getDataSourcesByType", arguments);
			},

			/**
			 * Returns JSON of source template by a given document in the project
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @returns {object}						a JSON content of the data source
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getSourceTemplate : function(oDocument) {
				return this._handle(oDocument, "getSourceTemplate", arguments);
			},

			/**
			 * Returns JSON object of all dependencies objects under handler file document
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @returns {object}						a JSON content of the dependencies
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getDependencies : function(oDocument) {
				return this._handle(oDocument, "getDependencies", arguments);
			},

			/**
			 * Returns JSON object with all extensions implemented in the project
			 *
			 * @param	{object}	oDocument			a document file in a project
			 * @returns	{object}						a JSON with all the project extensions
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getAllExtensions : function (oDocument) {
				return this._handle(oDocument, "getAllExtensions", arguments);
			},

			/**
			 * Checks if project is using the scaffolding base class (sap.ca.scfld.md) in the project
			 *
			 * @param	{object}	[oDocument]			a document file in a project
			 * @returns	{boolean}						a JSON with all the project extensions
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			isScaffoldingBased: function(oDocument) {
				return this._handle(oDocument, "isScaffoldingBased", arguments);
			},

			/**
			 * Adds JSON content of data source object under the given data source name in the handler file
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceName]	a string representing data source name
			 * @param 	{object}	[oContent]			a JSON content of the data source
			 * @param 	{boolean}	[bOverwrite]		true to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 * @throws 	DataSourceNameNotDefined		The data source name is not defined.
			 * @throws 	ContentNotDefined				The content is not defined.
			 * @throws 	DataSourceNameExistInManifest	The data source name already exist.
			 */
			addDataSource : function(oDocument, sDataSourceName, oContent, bOverwrite) {
				return this._handle(oDocument, "addDataSource", arguments);
			},

			/**
			 * Adds JSON content of annotation object that belong to the given data source name.
			 * Also adds reference under data source
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceName]	a string representing data source name
			 * @param 	{object}	[oContent]			a JSON content of the annotation to be added.
			 * 											For example:
			 {
				"anno1" : {
					"uri" : "/sap/bc/bsp/sap/BSCBN_ANF_EAM/BSCBN_EQUIPMENT_SRV.anno.XML",
					"type" : "ODataAnnotation",
					"settings" : {
						"localUri" : "model/annotations.xml"
					}
				}
			}
			 *
			 * @param 	{boolean}	[bOverwrite]		true to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 *
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 * @throws 	DataSourceNameNotDefined		The data source name is not defined.
			 * @throws 	ContentNotDefined				The content is not defined.
			 * @throws 	DataSourceNotExistInManifest	The given data source does not exist.
			 * @throws 	DataSourceWrongType				The given data source is not from OData type.
			 * @throws 	AnnotationExistInManifest		The annotation already exist under data sources.
			 */
			addDataSourceAnnotation : function(oDocument, sDataSourceName, oContent, bOverwrite) {
				return this._handle(oDocument, "addDataSourceAnnotation", arguments);
			},

			/**
			 * Adds JSON content of new extension to the handler file
			 *
			 * @param 	{object}	oDocument			A document file in a project
			 * @param 	{string}	sExtensionType		The extension type
			 * @param 	{string}	sViewName]			Name of the extended view
			 * @param 	{object}	oContent			The JSON content of the extension
			 * @param 	{boolean}	[bOverwrite]		True to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist
			 * @throws	ExtensionNotDefined				The given extension type is not defined
			 * @throws	ViewNotDefined					The given view is not defined
			 */
			addExtension : function(oDocument, sExtensionType, sViewName, oContent, bOverwrite) {
				return this._handle(oDocument, "addExtension", arguments);
			},

			/**
			 * Adds JSON content of source template by a given document in the project
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{object}	[oContent]			a JSON content of the source template, for example:
			 {
				"id": "sap.ui.ui5-template-plugin.1worklist",
				"version": "1.0.0"
			}
			 * @param 	{boolean}	[bOverwrite]		true to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 * @throws 	ContentNotDefined				The content is not defined.
			 * @throws 	SourceTemplateExistInManifest	The source template already exist.
			 */
			addSourceTemplate : function(oDocument, oContent, bOverwrite) {
				return this._handle(oDocument, "addSourceTemplate", arguments);
			},

			/**
			 * Adds JSON content that represent the dependencies section of the handler file
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{object}	[oContent]			a JSON content of the dependencies, for example:
			 {
				"minUI5Version": "1.30.0",
					"libs": {
						"sap.ui.core": {
							"minVersion": "1.30.0"
						},
						"sap.ui.commons": {
							"minVersion": "1.30.0"
						}
					}
			}
			 * @param 	{boolean}	[bOverwrite]		true to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 * @throws 	ContentNotDefined				The content is not defined.
			 * @throws 	DependenciesExistInManifest		Dependencies already exist.
			 */
			addDependencies : function(oDocument, oContent, bOverwrite) {
				return this._handle(oDocument, "addDependencies", arguments);
			},


			/**
			 * Removes JSON content of data source object that equal to the given data source name.
			 * Disclaimer! Does not remove references to it in descriptor file
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceName]	a string representing data source name
			 * @returns {boolean}						Succeeded to remove content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 * @throws 	DataSourceNameNotDefined		The data source name is not defined.
			 * @throws 	DataSourceNotExistInManifest	The data source name does not exist.
			 * @throws 	DependenciesExistInManifest		Dependencies already exist.
			 */
			removeDataSource : function(oDocument, sDataSourceName) {
				return this._handle(oDocument, "removeDataSource", arguments);
			},

			/**
			 * Removes annotation reference name from 'annotations' section under the given data source name
			 * Disclaimer! Does not remove the annotation data source itself.
			 *
			 * @param 	{object}	[oDocument]				a document file in a project
			 * @param 	{string}	[sDataSourceName]		a string representing data source name
			 * @param 	{string}	[sAnnotationName]		a string representing annotation name
			 * @returns {boolean}							Succeeded to remove content
			 * @throws 	Error								No project selected
			 * @throws 	FileDoesNotExist					Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder			Parent not exist or not a not a folder
			 * @throws 	DataSourceNameNotDefined			The data source name is not defined.
			 * @throws 	AnnotationNameNotDefined			The annotation name does not exist.
			 * @throws 	DataSourceWrongType					The given data source is not from OData type.
			 * @throws 	DataSourceNotContainGiveAnnotation	The given service name does not contain the given annotation.
			 * @throws 	DataSourceNotContainAnnotations		The given service name does not contain any annotations.
			 * @throws 	DataSourceNotContainSettings		The given service name does not contain settings.
			 * @throws 	DataSourceNotExistInManifest		The data source name does not exist.
			 *
			 *
			 */
			removeDataSourceAnnotation : function(oDocument, sDataSourceName, sAnnotationName) {
				return this._handle(oDocument, "removeDataSourceAnnotation", arguments);
			},

			/**
			 * Removes the specified extension from the "extensions" section
			 *
			 * @param 	{object}	oDocument			a document file in a project
			 * @param 	{string}	sExtensionType		The extension type
			 * @param 	{string}	sViewName			Name of the extended view
			 * @param 	{string}	[sExtendedElement]	Name of the extended element - optional
			 * @returns {boolean}						Succeeded to remove content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
		 	 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			removeExtension : function(oDocument, sExtensionType, sViewName, sExtendedElement) {
				// Extended element is an optional parameter,
				// The builtin "arguments" array does not contain it if not explicitly defined
				var aArgs = Array.prototype.slice.call(arguments);
				if ((_.isNull(sExtendedElement) || _.isUndefined(sExtendedElement)) && aArgs.length < 4) {
					aArgs.push(null);
				}
				return this._handle(oDocument, "removeExtension", aArgs);
			},

			/**
			 * Checks if project is using app descriptor manifest.json guidelines
			 *
			 * @param	{object}	[oDocument]			a document file in a project
			 * @returns	{boolean}						returns true if project has manifest guidelines
			 */
			isManifestProjectGuidelinesType: function(oDocument) {
				var that = this;
				return this._getProjectGuidelinesSelection(oDocument)
					.then(function(oProjectGuidelines) {
						return oProjectGuidelines.handler === that.projectGuidelinesTypes.DESCRIPTOR;
					}).fail(function() {
						return false;
					});
			},

			/**
			 * Checks if project is using configuration.js guidelines
			 *
			 * @param	{object}	[oDocument]			a document file in a project
			 * @returns	{boolean}						returns true if project has configuration guidelines
			 */
			isConfigProjectGuidelinesType: function(oDocument) {
				var that = this;
				return this._getProjectGuidelinesSelection(oDocument)
					.then(function(oProjectGuidelines) {
						return oProjectGuidelines.handler === that.projectGuidelinesTypes.SCAFFOLDING_CONF;
					}).fail(function() {
						return false;
					});
			},

			/**
			 * Checks if project is using component.js guidelines
			 *
			 * @param	{object}	[oDocument]			a document file in a project
			 * @returns	{boolean}						returns true if project has component guidelines
			 */
			isComponentProjectGuidelinesType: function(oDocument) {
				var that = this;
				return this._getProjectGuidelinesSelection(oDocument)
					.then(function(oProjectGuidelines) {
						return oProjectGuidelines.handler === that.projectGuidelinesTypes.SCAFFOLDING_COMP;
					}).fail(function() {
						return false;
					});
			},

			/**
			 * Adds JSON content of new model to the handler file
			 *
			 * @param 	{object}	oDocument			A document file in a project
			 * @param 	{string}	sModelName			Name of the model
			 * @param 	{object}	oContent			The JSON content of the model
			 * @param 	{boolean}	[bOverwrite]		True to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist
			 */
			addModel : function(oDocument, sModelName, oContent, bOverwrite) {
				return this._handle(oDocument, "addModel", arguments);
			},

			/**
			 * Returns JSON object of all model objects under handler file document
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @returns {object}						a JSON content of the models
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getModels : function(oDocument) {
				return this._handle(oDocument, "getModels", arguments);
			},

			/**
			 * Adds JSON content of new config to the handler file
			 *
			 * @param 	{object}	oDocument			A document file in a project
			 * @param 	{string}	sConfigName			Name of the config
			 * @param 	{object}	oContent			The JSON content of the model
			 * @param 	{boolean}	[bOverwrite]		True to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist
			 */
			addConfig : function(oDocument, sConfigName, oContent, bOverwrite) {
				return this._handle(oDocument, "addConfig", arguments);
			},

			/**
			 * Adds an extension data source to a scaffolding data source. The data source is added either to manifest.json or component.js
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @param 	{string}	[sDataSourceName]	a string representing data source name
			 * @param 	{string}	[sUri]				a string representing data source uri
			 * @param 	{string}	[sLocalUri]			a string representing data source local uri
			 * @param 	{boolean}	[bIsDefault]		true if the new data source should be set as default
			 * @param 	{boolean}	[bOverwrite]		true to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 * @throws 	DataSourceNameNotDefined		The data source name is not defined.
			 * @throws 	ContentNotDefined				The content is not defined.
			 * @throws 	DataSourceNameExistInManifest	The data source name already exist.
			 */
			addExtensionForScaffoldingDataSource: function(oDocument, sDataSourceName, sUri, sLocalUri, bIsDefault, bOverwrite) {
				return this._handle(oDocument, "addExtensionForScaffoldingDataSource", arguments);
			},

			/**
			 * Adds i18n model under the models section in the handler file
			 *
			 * @param 	{object}	oDocument			A document file in a project
			 * @param 	{string}	sUri				Path to the i18n folder
			 * @param 	{boolean}	[bOverwrite]		True to overwrite the existing content
			 * @returns {boolean}						Succeeded to add content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist
			 */
			addi18nExtensionModel : function(oDocument, sUri, bOverwrite) {
				return this._handle(oDocument, "addi18nExtensionModel", arguments);
			},


			/**
			 * Sets the "sap.platform.hcp" attribute an app descriptor file with the provided content.
			 * The content is expected to contain a "uri" attribute that includes the path for the manifest.json
			 * file. The path doesn't include the manifest.json itself.
			 *
			 * @param oDocument 	    [oDocument]	 		a document file in a project
			 * @param oContent 	[object]	 		object containing the content of the HCP block
			 */
			setHCPPlatformBlock : function(oDocument, oContent) {
				return this._handle(oDocument, "setHCPPlatformBlock", arguments);
			},

			/**
			 * Sets the "sap.platform.abap" attribute in the manifest.json file in an app descriptor file
			 * to be an object containing oContent
			 * @param oDocument 	[oDocument]	 		a document file in a project
			 * @param {object} 	oContent 		the content to assign to "sap.platform.abap" attribute
			 *
			 */
			setABAPPlatformBlock : function(oDocument, oContent) {
				return this._handle(oDocument, "setABAPPlatformBlock", arguments);
			},

			/**
			 * Returns JSON object of all config objects under handler file document
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @returns {object}						a JSON content of the configs
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getConfigs : function(oDocument) {
				return this._handle(oDocument, "getConfigs", arguments);
			},

			/**
			 * Adds i18n path in the handler file document
			 *
			 * @param 	{object}	oDocument			A document file in a project
			 * @param 	{string}	sUri				Path to the i18n properties file
			 * @param 	{boolean}	[bOverwrite]		True to overwrite the existing content
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			addI18nPath : function(oDocument, sUri, bOverwrite) {
				return this._handle(oDocument, "addI18nPath", arguments);
			},

			/**
			 * Returns the i18n path in the handler file document
			 *
			 * @param 	{object}	[oDocument]			a document file in a project
			 * @returns {string}						a path to the i18n properties file
			 * @throws 	Error							No project selected
			 * @throws 	FileDoesNotExist				Descriptor file does not exist.
			 * @throws 	ParentDoesNotExistOrFolder		Parent not exist or not a not a folder
			 */
			getI18nPath : function(oDocument) {
				var that = this;
				var aArguments = arguments;
				return this._getSelectedDocument().then(function(oSelectedDocument) {
					aArguments[0] = oDocument || oSelectedDocument;
					return that._getProjectGuidelinesTypeHandler(aArguments[0]).then(function (oProjectGuidelines) {
						if (oProjectGuidelines.handler === that.projectGuidelinesTypes.SCAFFOLDING_CONF) {
							// i18n path cannot be taken from Configuration.js. In this case use the Component.js instead
							return GenericHandler.getDescriptorFileFromCompLocation(oProjectGuidelines.handlerDoc,
								that.guidelinesFileNames.SCAFFOLDING_COMP).then(function (oComponentDoc) {
									oProjectGuidelines = that._createProjectGuidelinesObj(
										that.projectGuidelinesTypes.SCAFFOLDING_COMP, oComponentDoc);
									return that._dispatch("getI18nPath", oProjectGuidelines, aArguments);
							});
						}
						return that._dispatch("getI18nPath", oProjectGuidelines, aArguments);
					});
				});
			},

			_handle : function(oDocument, sMethodName, aArguments){
				var that = this;
				return this._getSelectedDocument().then(function(oSelectedDocument) {
					aArguments[0] = oDocument || oSelectedDocument;
					return that._getProjectGuidelinesTypeHandler(aArguments[0]).then(function (oProjectGuidelines) {
						return that._dispatch(sMethodName, oProjectGuidelines, aArguments);
					});
				});

			},

			_getProjectGuidelinesSelection : function(oDocument){
				var that = this;
				return this._getSelectedDocument().then(function(oSelectedDocument) {
					var oDoc = oDocument || oSelectedDocument;
					return that._getProjectGuidelinesTypeHandler(oDoc).then(function (oProjectGuidelines) {
						return oProjectGuidelines;
					});
				});
			},

			_getGuidelineForExternalDoc : function (oDocument, oContext, self) {

				var that = self ? self : this;
				var oFileName = oDocument.getEntity().getName();
				var oGuideline;
				switch (oFileName) {
					case this.guidelinesFileNames.DESCRIPTOR:
						oGuideline = this.projectGuidelinesTypes.DESCRIPTOR;
						break;
					case this.guidelinesFileNames.SCAFFOLDING_COMP:
						oGuideline = this.projectGuidelinesTypes.SCAFFOLDING_COMP;
						break;
					case this.guidelinesFileNames.SCAFFOLDING_CONF:
						oGuideline = this.projectGuidelinesTypes.SCAFFOLDING_CONF;
						break;
					default:
						var oError = new Error(oContext.i18n.getText("i18n", "projectHandler_unknownProjectGuidelines"));//"Unknown project guidelines");
						oError.name = "UnknownProjectGuidelines";
						throw oError;
				}
				return Q(that._createProjectGuidelinesObj(oGuideline, oDocument));
			},

			getDescriptorProjectGuidelines: function (oAppComponentFile, that, oManifestFile) {
				return oAppComponentFile.getContent().then(function (sComponentContent) {
					if (that._isComponentDirectToManifest(sComponentContent)) {
						return AppDescriptorHandler.getAppType(oManifestFile, that.context)
							.then(function (sAppType) {
								if (sAppType === "application") {
									return that._createProjectGuidelinesObj(that.projectGuidelinesTypes.DESCRIPTOR,
										oManifestFile);
								} else {
									var oError = new Error(that.context.i18n.getText("i18n",
										"projectHandler_manifestFileIsNotValid"));
									oError.name = "FileIsNotValid";
									throw oError;
								}
							});
					} else {
						var oError = new Error(that.context.i18n.getText("i18n",
							"projectHandler_directionError"));//"Component does not direct to manifest.json");
						oError.name = "directionError";
						throw oError;
					}
				});
			},

			// Decides which project type guidelines we are using according to the given document
			_getProjectGuidelinesByAppComponent: function (oProjectDocument, aProjMetadataContent, that) {
				return GenericHandler.getAppComponent(oProjectDocument, aProjMetadataContent,
					ComponentHandler.getHandlerFileName(), that.context).then(function (oAppComponentFile) {
						if (!oAppComponentFile) {
							var oError = new Error(that.context.i18n.getText("i18n",
								"projectHandler_unknownProjectGuidelines"));//"Unknown project guidelines");
							oError.name = "UnknownProjectGuidelines";
							throw oError;
						}

						// if "sap-mobile-hybrid.js" exists, this is hybrid mobile project.
						// only return Component's handler if needed
						var oHybridBootstrapFile = GenericHandler.getFileFromFolder(aProjMetadataContent,
							"sap-mobile-hybrid.js");//"sap-mobile-hybrid.js");
						if (oHybridBootstrapFile) {
							return that._createProjectGuidelinesObj(that.projectGuidelinesTypes.SCAFFOLDING_COMP,
								oAppComponentFile);
						}

						return GenericHandler.getDescriptorFileFromCompLocation(oAppComponentFile,
							that.guidelinesFileNames.DESCRIPTOR).then(function (oManifestFile) {
								if (oManifestFile) {
									return that.getDescriptorProjectGuidelines(oAppComponentFile, that, oManifestFile);
								} else { // manifest.json does not exist
									return GenericHandler.getDescriptorFileFromCompLocation(oAppComponentFile,
										that.guidelinesFileNames.SCAFFOLDING_CONF).then(function (oConfigurationFile) {
											if (oConfigurationFile) {
												return that._createProjectGuidelinesObj(that.projectGuidelinesTypes.SCAFFOLDING_CONF,
													oConfigurationFile);
											} else {
												return that._createProjectGuidelinesObj(that.projectGuidelinesTypes.SCAFFOLDING_COMP,
													oAppComponentFile);
											}
										});
								}
							});
					});
			},
			// Returns an object with the right handler and the handler file "{handler, handlerFile}"
			_getProjectGuidelinesTypeHandler : function(oDocument) {
				var that = this;
				if (oDocument) {
					// When dealing with external documents, look no further than the provided document
					var oExtDocInfo = oDocument.getExtInfo();
					if(oExtDocInfo && oExtDocInfo.external) {
						return this._getGuidelineForExternalDoc(oDocument, that.context, that);
					}

					return that._getProject(oDocument).then(function (oProjectDocument) {
						return oProjectDocument.getCurrentMetadata(true).then(function (aProjMetadataContent) {
							if (_.isEmpty(aProjMetadataContent)) {
								var oError = new Error(that.context.i18n.getText("i18n",
									"projectHandler_unknownProjectGuidelines"));//"Unknown project guidelines");
								oError.name = "UnknownProjectGuidelines";
								throw oError;
							}
							return that._getProjectGuidelinesByAppComponent(oProjectDocument, aProjMetadataContent, that);
						});
					});
				} else {
					var oError = new Error(that.context.i18n.getText("i18n", "projectHandler_noProjectSelected"));//"No project selected");
					oError.name = "NoProjectSelected";
					throw oError;
				}
			},

			_isComponentDirectToManifest : function(sComponentContent){
				var sRegex = /"?manifest"?\s*:\s*"json"/;
				return sRegex.test(sComponentContent);
			},

			// Dispatch a given function to the proper handler according to the given Project Guidelines Type.
			// Call it with the given function's args
			_dispatch : function(sMethodName, oProjectGuidelines, aArgs) {
				if (!_.isEmpty(aArgs)) {
					var that = this;
					var argsArray = Array.prototype.slice.call(aArgs);
					// Updates oDocument to be the handler file
					argsArray[0] = oProjectGuidelines.handlerDoc;
					// Adds context object as last parameter
					argsArray.push(that.context);

					// Currently only app descriptor is implemented
					return oProjectGuidelines.handler[sMethodName].apply(that, argsArray);
				}
			},

			// Returns the selected document
			_getSelectedDocument : function(){
				var selectionService = this.context.service.selection;
				return selectionService.getSelection().then(function(aSelection) {
					var oSelection = aSelection[0];
					if (oSelection && oSelection.document) {
						return oSelection.document;
					}
				});
			},

			_getProject : function(oDocument) {
				return oDocument.getProject();
			},

			_createProjectGuidelinesObj : function(oHandler, oHandlerDoc) {
				return { handler : oHandler, handlerDoc : oHandlerDoc};
			}

		});
	});
