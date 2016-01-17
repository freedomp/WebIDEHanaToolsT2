define(["sap/watt/core/Proxy", "sap/watt/lib/lodash/lodash"], function(Proxy, _) {

	var Template = function(sId, mConfig, oContext, oProxy) {
		this._sId = sId;
		this._mConfig = mConfig;
		this._oContext = oContext;
		this._oProxy = oProxy;
		this._mResources = {};
	};

	/**
	 * Applies template logic after generating the template resources according to the template
	 * model and bundling the generated resources into the provided zip file
	 *
	 * @param {object}	[oFinalZip]	a JSZip object containing the generated project resources after applying the model
	 * 							   	parameters on the template resources
	 * @param {object}	[model]		JSON object which includes all the data provided by all the wizard steps that are
	 * 								used for generating the template
	 * @returns {Array}	an array of two objects: the project zip (the one received as parameter or an updated one) and
	 * 					the template model (the one received as parameter or an updated one).
	 */
	Template.prototype.onAfterGenerate = function(oFinalZip, model) {
		return this._oProxy.onAfterGenerate(oFinalZip, model).then(function(result) {
			// make sure parameters return as is, when method doesn't return anything
			if (result === undefined) {
				return [oFinalZip, model];
			} else {
				return [result[0], result[1]];
			}
		});
	};

	/**
	 * Applies template logic before generating the template resources in the provided zip file.
	 * It is executed before passing the model to the template resources, and is therefore ideal for model
	 * manipulations.
	 *
	 * @param {object}	[oFinalZip]	a JSZip object containing the generated project resources that are about to be
	 * 								generated as provided by the template
	 * @param {object}	[model]		JSON object which includes all the data provided by all the wizard steps that are
	 * 								used for generating the template
	 * @returns {Array}	an array of two objects: the project zip (the one received as parameter or an updated one) and
	 * 					the template model (the one received as parameter or an updated one).
	 */
	Template.prototype.onBeforeTemplateGenerate = function(templateZip, model) {
		return this._oProxy.onBeforeTemplateGenerate(templateZip, model).then(function(result) {
			// make sure parameters return as is, when method doesn't return anything
			if (result === undefined) {
				return [templateZip, model];
			} else {
				return [result[0], result[1]];
			}
		});
	};

	/**
	 * Configures the wizard steps that appear after the template is selected in the wizard.
	 * These steps are defined in the wizardSteps property of the template configuration entry
	 * (located in the plugin.json file of the plugin containing the template).
	 *
	 * @returns {Array}	an array of wizard steps
	 */
	Template.prototype.configWizardSteps = function() {
		var aWizardStepNames = this.getWizardSteps();

		if (aWizardStepNames !== undefined && aWizardStepNames.length > 0) {
			var that = this;
			var oContext = Template._getTemplateContext(this);
			var aPromises = [];

			for (var i = 0; i < aWizardStepNames.length; i++) {
				var sStepName = aWizardStepNames[i];
				if (oContext.service[sStepName].instanceOf("sap.watt.common.service.ui.WizardFinishStep") && i < aWizardStepNames.length - 1) {
					return Q.reject(new Error("Wizard finish step must be configured only as a last step"));
				}
				aPromises.push(oContext.service[sStepName].getContent());
			}

			return Q.all(aPromises).then(function(aAdditionalWizardSteps) {
				return that._oProxy.configWizardSteps.apply(that, aAdditionalWizardSteps).then(function() {
					// return value is always the array of original arguments (a configured in template configuration)
					return aAdditionalWizardSteps;
				});
			});
		} else {
			return Q();
		}
	};

	Template.prototype.onBeforeTemplateCustomizationLoaded = function(wizardModel, templateModel) {
		return this._oProxy.onBeforeTemplateCustomizationLoaded(wizardModel, templateModel).then(function(aModels) {
			if (aModels) {
				return aModels;
			} else {
				return [wizardModel, templateModel];
			}
		});
	};

	Template.prototype.getWizardStepService = function(iStepIndex) {
		var aWizardStepNames = this.getWizardSteps();
		var oContext = Template._getTemplateContext(this);
		var sStepName = aWizardStepNames[iStepIndex];
		return oContext.service[sStepName];
	};

	/**
	 * Checks that the template can be selected in the wizard within the context of the user selections.
	 * It is used for preventing the user from selecting the template when it is not appropriate according to previous
	 * selections in the generation wizard
	 *
	 * @param {object}	[model]		JSON object which includes all the data provided by all the wizard steps that are
	 * 								used for generating the template
	 * @returns {Boolean}	True if a template can be selected
	 */
	Template.prototype.validateOnSelection = function(model) {
		return this._oProxy.validateOnSelection(model).then(function(result) {
			// default value is true when method doesn't return anything
			if (result === undefined) {
				return true;
			} else {
				return result;
			}
		});
	};

	/**
	 *The current validation infrastructure checks that the template can be selected in the wizard
	 *within the context of the user selections (using project type validation).
	 *It is used for preventing the user from selecting the template when it is not appropriate according to previous
	 *selections in the generation wizard (or in the workspace). Use this method to add more validations, if needed.
	 *
	 * this method
	 *
	 * @param {object}	[model]		JSON object which includes all the data provided by all the wizard steps that are
	 * 								used for generating the template
	 * @returns {Boolean}	True if a template can be selected
	 */
	Template.prototype.customValidation = function(model) {
		return this._oProxy.customValidation(model).then(function(result) {
			// default value is true when method doesn't return anything
			if (result === undefined) {
				return true;
			} else {
				return result;
			}
		});
	};

	Template.prototype.getI18nResources = function() {
		// caching of resources - no need to create each time
		if (Object.keys(this._mResources).length > 0) {
			return this._mResources;
		}

		var oContext = Template._getTemplateContext(this);

		if (oContext && oContext.i18n) {
			var mBundles = oContext.i18n.bundles;
			for (var sBundle in mBundles) {
				var oModel = new sap.ui.model.resource.ResourceModel({
					bundleUrl: mBundles[sBundle],
					bundleLocale: oContext.i18n.locale
				});
				this._mResources[sBundle] = oModel;
			}
		}
		return this._mResources;
	};

	Template.prototype.getType = function() {
		return this._mConfig.templateType;
	};

	Template.prototype.getSupportedProjectTypes = function() {
		return this._mConfig.supportedProjectTypes;
	};

	Template.prototype.getTargetProjectTypes = function() {
		return this._mConfig.targetProjectTypes;
	};

	Template.prototype.getWizardSteps = function() {
		return this._mConfig.wizardSteps;
	};

	Template.prototype.getIcon = function() {
		return this._mConfig.icon;
	};

	Template.prototype.getName = function() {
		return this._mConfig.name;
	};

	Template.prototype.getRequiresNeoApp = function() {
		return this._mConfig.requiresNeoApp;
	};

	Template.prototype.getInternalOnly = function() {
		return this._mConfig.internalOnly;
	};

	Template.prototype.getEnabled = function() {
		return this._mConfig.enabledLocal;
	};

	Template.prototype.getDescription = function() {
		return this._mConfig.description;
	};

	Template.prototype.getPath = function() {
		return this._mConfig.path;
	};

	Template.prototype.getFileName = function() {
		return this._mConfig.fileName;
	};

	Template.prototype.getModelFileName = function() {
		return this._mConfig.modelFileName;
	};

	Template.prototype.getModelRoot = function() {
		return this._mConfig.modelRoot;
	};

	Template.prototype.getAdditionalData = function() {
		return this._mConfig.additionalData;
	};

	Template.prototype.getVersion = function() {
		return this._mConfig.version;
	};

	Template.prototype.getVersionLabel = function() {
		return this._mConfig.versionLabel;
	};

	Template.prototype.getPreviewImage = function() {
		return this._mConfig.previewImage;
	};

	Template.prototype.getTemplateCustomizationImage = function() {
		return this._mConfig.templateCustomizationImage;
	};

	Template.prototype.getTemplateClass = function() {
		return this._mConfig.template;
	};

	Template.prototype.getRequiredTemplates = function() {
		return this._mConfig.requiredTemplates;
	};

	Template.prototype.getRequiredModules = function() {
		return this._mConfig.requiredModules;
	};

	Template.prototype.getRequiredModulePaths = function() {
		return this._mConfig.requiredModulePaths;
	};

	Template.prototype.getId = function() {
		return this._mConfig.id;
	};

	Template.prototype.getMetadataPath = function() {
		return this._mConfig.metadataPath;
	};

	Template.prototype.isCoreTemplate = function() {
		return this._mConfig.coreTemplate;
	};

	Template.prototype.getOrderPriority = function() {
		//orerPriority must be positive
		if (this._mConfig.orderPriority && (this._mConfig.orderPriority < 0)) {
			this._mConfig.orderPriority = 0;
		}
		//make sure core templates will get higher priority then external templates
		if (this._mConfig.coreTemplate) {
			return this._mConfig.orderPriority;
		} else {
			//External development template gets lower priority (higher order number) than core templates (0-1000)
			if (this._mConfig.orderPriority) {
				return this._mConfig.orderPriority + 1000;
			}
			return this._mConfig.orderPriority;
		}
	};

	Template.prototype.getBeautifyFilesFlag = function() {
		return this._mConfig.beautifyFiles;
	};

	Template.prototype._error = function(sMessage) {
		Template._error(this._sId, sMessage);
	};

	var Category = function(sId, mConfig) {
		this._sId = sId;
		this._mConfig = mConfig;
	};

	Category.prototype.getId = function() {
		return this._mConfig.id;
	};

	Category.prototype.getName = function() {
		return this._mConfig.name;
	};

	Category.prototype.getDescription = function() {
		return this._mConfig.description;
	};

	Category.prototype._error = function(sMessage) {
		Category._error(this._sId, sMessage);
	};

	/**
	 * =============================
	 * STATIC METHODS
	 * =============================
	 */
	Template._mTemplates = {};
	Template._mTemplatesByCategory = {};

	// returns the template context
	Template._getTemplateContext = function(oTemplate) {
		var oContext = oTemplate._oProxy.context;
		var oImpl = oTemplate._oProxy._oImpl;
		// after proxy is initialized in the first time, the context is deleted from the proxy and moved to the implementation object
		if ((oContext === undefined) && (oImpl !== null) && (oImpl !== undefined)) {
			oContext = oImpl.context;
		}
		return oContext;
	};

	Template.register = function(sId, mConfig, oContext) {

		var mNewConfig = {
			template: null,
			id: null,
			description: null,
			path: null,
			fileName: null,
			previewImage: null,
			templateCustomizationImage: null,
			requiredTemplates: null,
			modelFileName: null,
			modelRoot: null,
			icon: null,
			category: null,
			templateType: null,
			supportedProjectTypes: null,
			name: null,
			requiresNeoApp: false,
			internalOnly: false,
			version: null,
			versionLabel: null,
			wizardSteps: null,
			orderPriority: null,
			requiredModules: null,
			requiredModulePaths: null,
			coreTemplate: false,
			beautifyFiles: true
		};

		if (typeof mConfig === "string") {
			mNewConfig.template = mConfig;
		} else {
			mNewConfig = jQuery.extend(this._mConfig, mConfig);
		}

		// set default values
		if (!mNewConfig.name) {
			mNewConfig.name = sId;
		}
		if (!mNewConfig.description) {
			mNewConfig.description = "";
		}
		if (!mNewConfig.templateType) {
			mNewConfig.templateType = "project";
		}
		if (!mNewConfig.version) {
			mNewConfig.version = "0.0.0";
		}
		if (!mNewConfig.versionLabel) {
			mNewConfig.versionLabel = "";
		}
		if (!_.isArray(mNewConfig.category)) {
			var aCategory = [];
			var sCategory = "general";

			if (mNewConfig.category) {
				sCategory = mNewConfig.category;
			}
			aCategory.push(sCategory);
			mNewConfig.category = aCategory;
		}
		if (mNewConfig.requiresNeoApp === undefined) {
			mNewConfig.requiresNeoApp = false;
		}
		if (mNewConfig.internalOnly === undefined) {
			mNewConfig.internalOnly = false;
		}
		if (mNewConfig.beautifyFiles === undefined) {
			mNewConfig.beautifyFiles = true;
		}

		if (mNewConfig.template instanceof Proxy) {

			if (!this._isVersionValid(mNewConfig.version)) {
				oContext.service.log.error("Template", sId + " has a wrong version " + mNewConfig.version +
					", template id should be with a semantic versioning (MAJOR.MINOR.PATCH)", ["user"]).done();
			}

			var oTemplate = new Template(sId, mNewConfig, oContext, mNewConfig.template);
			var bInternal = !sap.watt.getEnv("internal") && oTemplate.getInternalOnly();

			if (!(bInternal || (sap.watt.getEnv("server_type") === "local_hcproxy" && oTemplate.getEnabled() === false))) {
				this._addTemplateToModel(sId, oTemplate);
				return oTemplate;
			}
		} else {
			throw new Error("Template needs to be instance of Proxy");
		}
	};

	Template.onBeforeTemplateGenerate = function(sTemplateId) {
		return this._getTemplate(sTemplateId).onBeforeTemplateGenerate();
	};

	Template.onAfterGenerate = function(sTemplateId) {
		return this._getTemplate(sTemplateId).onAfterGenerate();
	};

	Template._isVersionValid = function(sVersion) {

		if (sVersion) {
			var regExp = /^(\d+\.)+(\d+\.)+(\d+)$/;
			if (!regExp.test(sVersion)) {
				return false;
			}

			return true;
		} else {
			return false;
		}
	};

	Template._addTemplateToModel = function(sId, oTemplate) {
		if (!this._mTemplates[sId]) {
			this._mTemplates[sId] = [];
		}

		var aTemplateVersions = this._mTemplates[sId];
		var iPos = this._getTemplatePosByVersion(aTemplateVersions, oTemplate.getVersion());
		// check if template with the same version allready exists.
		if (iPos > -1) {
			aTemplateVersions.splice(iPos, 1);
		}

		aTemplateVersions.push(oTemplate);

		// sort the array from the new version to the last version
		aTemplateVersions.sort(this._sortVersions);
	};

	Template._sortVersions = function(templateA, templateB) {

		var bValidVersionA = Template._isVersionValid(templateA.getVersion());
		var bValidVersionB = Template._isVersionValid(templateB.getVersion());

		// if version A is not valid push templateA to the end of the array
		if (!bValidVersionA && bValidVersionB) {
			return 1;
		}

		// if version B is not valid push templateB to the end of the array
		if ((!bValidVersionB && bValidVersionA) || (!bValidVersionB && !bValidVersionA)) {
			return -1;
		}

		if (templateA.getVersion() < templateB.getVersion()) {
			return 1;
		}
		if (templateA.getVersion() > templateB.getVersion()) {
			return -1;
		}
		return 0;
	};

	Template._isTemplateIdExistsInCategory = function(aTemplates, oTemplate) {
		for (var i = 0, len = aTemplates.length; i < len; i++) {
			if (aTemplates[i].getId() === oTemplate.getId()) {
				return true;
			}
		}
		return false;
	};

	Template._populateAllRequiredTemplatesRecursive = function(oTemplate, aRequiredTemplates) {
		// check if template doesn't already exist in the array
		if (jQuery.inArray(oTemplate, aRequiredTemplates) === -1) {
			aRequiredTemplates.push(oTemplate);
			// check if template requires other templates
			if (oTemplate._mConfig.requiredTemplates) {
				for (var i = 0; i < oTemplate._mConfig.requiredTemplates.length; i++) {
					var additionalTemplate = Template._getTemplate(oTemplate._mConfig.requiredTemplates[i]);
					this._populateAllRequiredTemplatesRecursive(additionalTemplate, aRequiredTemplates);
				}
			}
		}
	};

	Template._getTemplateVersions = function(sTemplateId) {
		return this._mTemplates[sTemplateId];
	};

	Template._getTemplate = function(sTemplateId, sVersion) {

		var aTemplates = this._mTemplates[sTemplateId];
		var oTemplate;

		if (!aTemplates) {
			this._error(sTemplateId, "Template not implemented");
		} else {
			// if sVersion is undefined then return the latest version from the sortable array, else return the selected template version
			oTemplate = aTemplates[0];

			if (sVersion) {
				var iPos = Template._getTemplatePosByVersion(aTemplates, sVersion);
				if (iPos > -1) {
					oTemplate = aTemplates[iPos];
				}
			}
		}
		return oTemplate;
	};

	Template._getTemplatePosByVersion = function(aTemplates, sVersion) {

		for (var i = 0; i < aTemplates.length; i++) {
			if (sVersion === aTemplates[i].getVersion()) {
				return i;
			}
		}

		return -1;
	};

	Template._error = function(sTemplateId, sMessage) {
		// TODO: Should we only throw errors when IDE is in debug mode?
		var aMessage = [];
		if (sTemplateId) {
			aMessage.push("Template: " + sTemplateId);
		}
		if (sMessage) {
			aMessage.push("Message: " + sMessage);
		}
		throw new Error(aMessage.join(" | "));
	};

	var sFavoriteCategoryId = "Favorite";
	Category._mCategories = {};

	Category.register = function(sId, mConfig, oContext) {

		if (Category._mCategories[sId]) {
			oContext.service.log.error("Template", sId + " Category already registered", ["user"]).done();
		} else {

			var sCategoryId = "general";
			var sCategoryName = oContext.i18n.getText("i18n", "category_generalName");
			var sCategoryDescription = oContext.i18n.getText("i18n", "category_generalDescription");
			Category._createCategory(sCategoryId, sCategoryName, sCategoryDescription);

			sCategoryId = "Common";
			sCategoryName = oContext.i18n.getText("i18n", "category_commonName");
			sCategoryDescription = oContext.i18n.getText("i18n", "category_commonDescription");
			Category._createCategory(sCategoryId, sCategoryName, sCategoryDescription);

			sCategoryId = "Favorite";
			sCategoryName = oContext.i18n.getText("i18n", "category_favoritesName");
			sCategoryDescription = oContext.i18n.getText("i18n", "category_favoritesDescription");
			Category._createCategory(sCategoryId, sCategoryName, sCategoryDescription);

			var mNewConfig = {
				id: null,
				name: null,
				description: null
			};

			mNewConfig = jQuery.extend(this._mConfig, mConfig);

			// set default values
			if (!mNewConfig.id) {
				mNewConfig.id = sId;
			}
			if (!mNewConfig.name) {
				mNewConfig.name = "";
			}
			if (!mNewConfig.description) {
				mNewConfig.description = "";
			}
			var oCategory = new Category(sId, mNewConfig);
			Category._mCategories[sId] = oCategory;
		}
	};

	Category._createCategory = function(sCategoryId, sCategoryName, sCategoryDescription) {

		if (!Category._mCategories[sCategoryId]) {
			var mConfig = {
				id: sCategoryId,
				name: sCategoryName,
				description: sCategoryDescription
			};
			var oCategory = new Category(mConfig.id, mConfig);
			Category._mCategories[mConfig.id] = oCategory;
		}
	};

	Category._getGeneralCategoryIndex = function(aCategories) {
		var generalCategoryIndex = -1;
		for (var index = 0, len = aCategories.length; index < len; index++) {
			if (aCategories[index].category.getId() === "general") {
				generalCategoryIndex = index;
				break;
			}
		}
		return generalCategoryIndex;
	};

	Category._getCategory = function(sCategoryId) {

		var oCategory = Category._mCategories[sCategoryId];
		if (!oCategory) {
			this._error(sCategoryId, "Category not implemented");
		}

		return oCategory;
	};

	Category._error = function(sCategoryId, sMessage) {
		// TODO: Should we only throw errors when IDE is in debug mode ?
		var aMessage = [];
		if (sCategoryId) {
			aMessage.push("Category: " + sCategoryId);
		}
		if (sMessage) {
			aMessage.push("Message: " + sMessage);
		}
		throw new Error(aMessage.join(" | "));
	};

	return {

		/**
		 * Register a template based on the settings defined in its plugin.json
		 *
		 * @param mConfig {object} the settings of the template to register
		 */
		configure: function(mConfig) {

			var that = this;

			jQuery.each(mConfig.categories, function(iIndex, mCategory) {
				Category.register(mCategory.id, mCategory, that.context);
			});

			jQuery.each(mConfig.templates, function(iIndex, mTemplate) {
				Template.register(mTemplate.id, mTemplate, that.context);
			});
		},

		/**
		 * Retrieve all the templates organized by their categories
		 *
		 * @param templateType {string} (optional) the type of templates to retrieve ('project' or 'component')
		 * @return {object} a map holds all the templates by their categories
		 */
		_getTemplatesByCategory: function(templateType) {
			var mResult = {};
			for (var category in Template._mTemplatesByCategory) {
				var templateInCategory = [];
				for (var i = 0, leng = Template._mTemplatesByCategory[category].length; i < leng; i++) {
					var oTemplate = Template._mTemplatesByCategory[category][i];
					if (templateType === undefined || oTemplate.getType() === templateType) {
						templateInCategory.push(oTemplate);
					}
				}
				if (templateInCategory.length > 0) {
					mResult[category] = templateInCategory;
				}
			}

			return mResult;
		},

		_createTemplatesByCategoryModel: function() {

			if (jQuery.isEmptyObject(Template._mTemplatesByCategory)) {
				for (var sTemplateId in Template._mTemplates) {

					var oLatestTemplateVersion = Template._mTemplates[sTemplateId][0];
					var templateCategory = oLatestTemplateVersion._mConfig.category;

					for (var i = 0; i < templateCategory.length; i++) {
						var sTemplateCategory = templateCategory[i];
						// add the category array if doesn't exist
						if (!Template._mTemplatesByCategory[sTemplateCategory]) {
							Template._mTemplatesByCategory[sTemplateCategory] = [];
						}

						// push the template to the Template._mTemplatesByCategory model
						var aTemplatesByCategory = Template._mTemplatesByCategory[sTemplateCategory];
						if (!Template._isTemplateIdExistsInCategory(aTemplatesByCategory, oLatestTemplateVersion)) {
							aTemplatesByCategory.push(oLatestTemplateVersion);
						}
					}
				}
			}
		},

		_getFavoriteTemplatesByType: function(templateType) {
			var aTemplatesByCategory = [];
			var sNode = "sap.watt.ideplatform.generationwizard.favoritesTemplates." + templateType;

			return this.context.service.preferences.get(sNode).then(function(oFavoritesTemplates) {
				if (oFavoritesTemplates && oFavoritesTemplates.templates && oFavoritesTemplates.templates.length > 0) {

					for (var i = 0; i < oFavoritesTemplates.templates.length; i++) {
						var aTemplates = Template._mTemplates[oFavoritesTemplates.templates[i]];
						// if the template id not avialble in this scope  (e.g. old template id)
						if (aTemplates && aTemplates.length > 0) {
							var oTemplate = aTemplates[0];
							aTemplatesByCategory.push(oTemplate);
							// Checks is the Favourite category not exists in the template's category already.
							var index = oTemplate._mConfig.category.indexOf(sFavoriteCategoryId);
							if (index === -1) {
								oTemplate._mConfig.category.push(sFavoriteCategoryId);
							}
						}
					}
				}
				return aTemplatesByCategory;

			});
		},

		/**
		 * Retrieve all the templates organized by their categories
		 * Hide templates that are marked internalOnly of in external mode
		 *
		 * @param templateType {string} (optional) the type of templates to retrieve ('project' or 'component')
		 * bIncludesFavoriteCategory {boolean} (optional) flag - if return or not Favorite Category
		 * @return {object} an array holds all the templates by their categories
		 */
		getTemplatesPerCategories: function(templateType, bIncludesFavoriteCategory) {
			var that = this;
			var aCategories = new Array();
			var aTemplates = new Array();

			this._createTemplatesByCategoryModel();
			if (bIncludesFavoriteCategory === undefined) {
				bIncludesFavoriteCategory = true;
			}

			var mTemplatesByCategory = that._getTemplatesByCategory(templateType);

			for (var categoryId in mTemplatesByCategory) {
				var category = Category._mCategories[categoryId];

				if (category === undefined) {

					var generalCategoryIndex = Category._getGeneralCategoryIndex(aCategories);
					if (generalCategoryIndex === -1) {
						category = Category._mCategories["general"];
						aTemplates = mTemplatesByCategory[categoryId];
						aCategories.push({
							"category": category,
							"templates": aTemplates
						});
					} else {
						aTemplates = mTemplatesByCategory[categoryId];
						for (var i = 0, leng = aTemplates.length; i < leng; i++) {
							// Add the template to the array
							aCategories[generalCategoryIndex].templates.push(aTemplates[i]);
						}
					}

				} else {
					aTemplates = mTemplatesByCategory[categoryId];
					var aValidTemplates = [];
					for (var oTemplate = 0, lengt = aTemplates.length; oTemplate < lengt; oTemplate++) {
						// Add the template to the array
						aValidTemplates.push(aTemplates[oTemplate]);
					}
					if (aValidTemplates.length > 0) {
						aCategories.push({
							"category": category,
							"templates": aValidTemplates
						});
					}
				}

				// 1 get the "general" category from aCategories array
				// if not exist , create it and push it to the array
				// if exist --? get it and add the templates to it
			}

			if (bIncludesFavoriteCategory) {
				return this._getFavoriteTemplatesByType(templateType).then(function(aFavoriteTemplates) {
					var oFavoriteCategory = that.getCategoryById(sFavoriteCategoryId);

					aCategories.push({
						"category": oFavoriteCategory,
						"templates": aFavoriteTemplates
					});

					return aCategories;
				}, function() {
					that.context.service.log.error("Template", "Failed to get favorite templates from user preferences", ["user"]).done();
					return aCategories;
				});
			} else {
				return aCategories;
			}
		},

		/**
		 * Retrieve all the registered templates
		 *
		 * @param sTemplateType {String} the desired template type
		 * @return {object} a map holds all the template settings by the template names
		 */
		getTemplates: function(sTemplateType) {
			var mTemplateResults = {};
			var oTemplate, key;

			if (sTemplateType) {
				for (key in Template._mTemplates) {
					if (Template._mTemplates.hasOwnProperty(key)) {
						oTemplate = Template._mTemplates[key][0]; // a sortable array - return the template with the latest version
						if (oTemplate.getType() === sTemplateType) {
							mTemplateResults[key] = oTemplate;
						}
					}
				}
			} else {
				for (key in Template._mTemplates) {
					oTemplate = Template._mTemplates[key][0]; // a sortable array - return the template with the latest version
					mTemplateResults[key] = oTemplate;
				}
			}

			return mTemplateResults;
		},

		/**
		 * Retrieve all the templates that are required by a given template
		 *
		 * @param oTemplate {object} the template to find which other templates it requires
		 * @return {object} a map holds all the required templates by the template ids
		 */
		getAllRequiredTemplates: function(oTemplate) {
			var aRequiredTemplates = [];
			Template._populateAllRequiredTemplatesRecursive(oTemplate, aRequiredTemplates);
			return aRequiredTemplates;
		},

		/**
		 * Get the settings of a template with the given id
		 *
		 * @param sTemplate {string} the desired template id
		 * @param sVersion {string} optional - the template version
		 * @return {object} the settings of the desired template
		 */
		getTemplate: function(sTemplate, sVersion) {
			return Template._getTemplate(sTemplate, sVersion);
		},

		/**
		 * Retrieve all template versions by given template id
		 *
		 * @param sTemplate {string} the desired template id
		 * @return {object} array of templates of the desired template
		 */
		getTemplateVersions: function(sTemplate) {
			return Template._getTemplateVersions(sTemplate);
		},

		/**
		 * Retrieve all the registered Categories which are not empty
		 *
		 * @return {object} a map holds all the Category settings by the Category names
		 */
		getCategories: function() {
			return this.getTemplatesPerCategories().then(function(aCategories) {
				var nonEmptyCategories = [];
				if (aCategories) {
					for (var i = 0, len = aCategories.length; i < len; i++) {
						var category = aCategories[i];
						if (category.templates.length > 0) {
							nonEmptyCategories.push(Category._mCategories[category.category._sId]);
						}
					}
				}
				return nonEmptyCategories;
			});
		},

		/**
		 * Retrieve all the registered Categories
		 *
		 * @return {object} a map holds all the Category settings by the Category names
		 */
		getRegisteredCategories: function() {
			return Category._mCategories;
		},

		/**
		 * Get the settings of a Category with the given id
		 *
		 * @param sCategory {string} the desired Category id
		 * @return {object} the settings of the desired Category
		 */
		getCategoryById: function(sCategory) {
			return Category._getCategory(sCategory);
		}
	};

});