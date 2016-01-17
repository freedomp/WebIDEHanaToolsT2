sap.ui.controller("sap.watt.ideplatform.plugin.basevalidator.view.ValidatorSetting", {
	/**
	 * @memberOf sap.watt.common.plugin.linter.view.ESLintSetting
	 */
	_oModel: new sap.ui.model.json.JSONModel(),
	_oValidatorsModel: new sap.ui.model.json.JSONModel(),

	_oRulesPath: null,
	_oBrowseButton: null,
	_oWorkspaceBrowseFragment: null,
	_sJSFileExtension: "js",
	_sFolderName: null,
	_oDialog: null,

	_oContext: null,
	_rulesManager: null,
	_currentrRulesManagerInst: null,
	_customRulesPath: null,
	_bisRulesManagerInitialized: null,
	_projectPath: null,
	_oCurrentSettings: null,
	_fileExtension: "js",
	_oValidatorRules: null,
	_invalidControls: [],

	onParseAdditionalPropertiesFails: function(oEvent) {
		var control = oEvent.getParameter("element");
		var row = control.getParent();
		var rowIndex = row.getIndex();
		var index = this._invalidControls.indexOf(rowIndex);
		if (index < 0) {
			this._invalidControls.push(rowIndex);
		}
		control.setValueState(sap.ui.core.ValueState.Error);
	},
	onValidationAdditionalPropertiesSuccess: function(oEvent) {
		var control = oEvent.getParameter("element");
		var row = control.getParent();
		var rowIndex = row.getIndex();
		var index = this._invalidControls.indexOf(rowIndex);
		if (index >= 0) {
			this._invalidControls.splice(index, 1);
		}
		control.setValueState(sap.ui.core.ValueState.None);
	},
	setProjectPath : function(sProjectPath){
		this._projectPath = sProjectPath;
	},

	_initRulesTableFiltersAndSorters : function(){
		var aColumns = this._oValidatorRules.getColumns();
		for(var ii=0; ii < aColumns.length; ii++){
			var oColumn = aColumns[ii];
			oColumn.setFiltered(false);
			oColumn.setSorted(false);
		}
	},

	onAfterRendering : function(){
		this._initRulesTableFiltersAndSorters();
	},

	onInit: function() {
		var that = this;
		var oView = this.getView();
		this._oContext = oView.getViewData().context;
		this._rulesManager = oView.getViewData().rulesManager;
		this._projectPath = oView.getViewData().projectPath;
		var aceEditor = this._getHeaderAceEditor();
		aceEditor.addEventDelegate({
			onAfterRendering: function() {
				aceEditor.getSession().setMode("ace/mode/json");
				// Do not use Worker!
				//that._aceEditor.getSession().setUseWorker(false);
				if (that._oCurrentSettings.header) {
					that._updateHeaderControl(that._oCurrentSettings.header)
						.then(function() {
							that._getHeaderAceEditor().getSession().addEventListener("change", function() {
								that._oCurrentSettings.header = that._getHeaderAceEditor().getValue();
								that._oModel.setData(that._oCurrentSettings);
							});
						});
				} else {
					that._getHeaderAceEditor().getSession().addEventListener("change", function() {
						that._oCurrentSettings.header = that._getHeaderAceEditor().getValue();
						that._oModel.setData(that._oCurrentSettings);
					});
				}
			}
		});

		this._oRulesPath = this.byId("PathToUserRules");
		this._oBrowseButton = this.byId("BrowseButton");
		this._oWorkspaceBrowseFragment = sap.ui.jsfragment("sap.watt.ideplatform.plugin.basevalidator.view.WorkspaceBrowse", this);

		//apply styles
		this._oValidatorRules = this.byId("ESLintRules");
		jQuery.each(this._oValidatorRules.getColumns(), function(idx, oColumn) {
			oColumn.getMenu().addStyleClass("linterMenu");
		});
		var aStyles = [{
			uri: "sap/watt/ideplatform/plugin/basevalidator/css/projectLinterSetting.css"
		}];
		this._oContext.service.resource.includeStyles(aStyles).done();
		//i18n resources
		this._oContext.i18n.applyTo([oView, this._oWorkspaceBrowseFragment]);

		sap.ui.model.SimpleType.extend("sap.validator.JSON", {
			formatValue: function(oValue) {
				if (oValue) {
					return JSON.stringify(oValue);
				}
			},
			parseValue: function(oValue) {
				try {
					if (oValue) {
						return JSON.parse(oValue);
					}
				} catch (err) {
					throw new sap.ui.model.ParseException("Invalid JSON Format: " + err.message);
				}
			},
			validateValue: function(oValue) {}
		});
		var additionalPropertiesUI = this.byId("additionalPropertiesUI");
		additionalPropertiesUI.bindProperty("value", "additionalProperties", new sap.validator.JSON());
	},
	onBeforeRendering: function() {
		this._oCurrentSettings = {};
		//bind validators list data
		var that = this;
		that._oContext.service.document.getDocumentByPath(that._projectPath).then(function (projectDoc) {
    		return that._oContext.service.basevalidator.getValidatorsList(that._fileExtension, projectDoc).then(function(validators) {
    			var validatorsList = {};
    			validatorsList.validators = [];
    			validatorsList.validators = validatorsList.validators.concat(validators);
    			that._oValidatorsModel.setData(validatorsList);
    			//bind validators dropdownbox to list of validators
    			that.getView().setModel(that._oValidatorsModel, "validatorsModel");
    			return that._bindConfigurations();
    		});
    	}).done();
	},
	onExit: function() {},
	onValidatorChange: function(oEvent) {
		this._bindConfigurations(oEvent.getParameters().selectedItem.getKey()).done();
	},
	_bindConfigurations: function(serviceId, defaultOnly) {
		var that = this;
		that._oCurrentSettings.rules = {};
		that._oCurrentSettings.header = "";
		return this._getConfigurations(serviceId, defaultOnly).then(function(aCurrentSettings) {
			if (aCurrentSettings) {
				that._oCurrentSettings.header = JSON.stringify(aCurrentSettings.configuration.header);
				if (that._getHeaderAceEditor().getSession() !== null) {
					that._updateHeaderControl(that._oCurrentSettings.header);
				}
				that._oCurrentSettings.rules = that._convertRulesJSONToArray(aCurrentSettings.configuration.rules);
				that._oCurrentSettings.services = aCurrentSettings.services;
				that._customRulesPath = aCurrentSettings.customRulesPath;
				that._oRulesPath.setValue(aCurrentSettings.customRulesPath);

				that._oModel.setData(that._oCurrentSettings);
				that.getView().setModel(that._oModel);
				that._oValidatorRules.bindRows("/rules");
				//that._getHeaderAceEditor().bindProperty("value", "/header");

				that._oValidatorRules.sort(that._oValidatorRules.getColumns()[1]);
				var validatorsListControl = that.byId("validatorsSelection");
				validatorsListControl.setSelectedKey(that._oCurrentSettings.services && that._oCurrentSettings.services[that._fileExtension]);

			}
		});
	},
	_getConfigurations: function(serviceId, defaultOnly) {
		var that = this;
		return that._oContext.service.document.getDocumentByPath(that._projectPath).then(function (projectDoc) {
    		return (serviceId ? that._oContext.service.basevalidator.getCurrentValidatorServiceProxyById(serviceId):
    		    that._oContext.service.basevalidator.getCurrentValidatorServiceProxyByExtension(that._fileExtension, projectDoc))
    			.then(function(validatorProxy) {
    				return that._rulesManager.get(that._oContext, validatorProxy, that._projectPath).then(function(rulesManagerInst) {
    					that._currentrRulesManagerInst = rulesManagerInst;
    					return rulesManagerInst.getValidatorConfigurationForDisplay(defaultOnly).then(function(aCurrentSettings) {
    						return validatorProxy.getCurentValidatorServiceIdentifier().then(function(serviceID) {
    							aCurrentSettings.services = aCurrentSettings.services || {};
    							aCurrentSettings.services[that._fileExtension] = serviceID;
    							return aCurrentSettings;
    						});
    					});
    				});
    			});
		});
	},

	onClearPathClicked: function(oEvent) {
		this._sFolderName = "";
		this.setPathData(oEvent);
	},

	onResetConfigurationClicked: function(oEvent) {
		var validatorsList = this.byId("validatorsSelection");
		this._bindConfigurations(validatorsList.getSelectedKey(), true).done();
	},
	//================ browse for rules folder =====================
	onWorkspaseBrowseClicked: function(oEvent) {
		var that = this;
		this._oDialog = sap.ui.getCore().byId("oWorkspaceBrowse");
		this.onRepositoryBrowserSelect().then(function(repositoryBrowserControl) {
			if (repositoryBrowserControl) {
				that._oDialog.destroyContent();
				that._oDialog.addContent(repositoryBrowserControl);
			}
		}).done();
		this._oDialog.open();
	},

	//Show the Repository Browser only js files
	onRepositoryBrowserSelect: function() {

		var that = this;
		var oContext = this.getView().getViewData().context;
		//create the Repository Browser with js files only
		return oContext.service.repositoryBrowserFactory.create(null, {
			filters: [that._sJSFileExtension]
		}).then(function(repositoryBrowserInstance) {
			//var oDocProvider = oContext.service.filesystem.documentProvider;
			//Set the selected file to be the origin file
			//return oDocProvider.getDocument(that._sComponentPath).then(function(oDocument) {
			//repositoryBrowserInstance.setSelection(oDocument, true);
			return repositoryBrowserInstance.getContent().then(function(oRepositoryBrowserControl) {
				if (oRepositoryBrowserControl) {
					that._oRepositoryBrowserControl = oRepositoryBrowserControl;
					oRepositoryBrowserControl.setHeight("400px");
					oRepositoryBrowserControl.setWidth("100%");
					oRepositoryBrowserControl.setLayoutData(new sap.ui.layout.GridData({
						span: "L12 M12 S12"

					}));
				}
				//Handle select
				if (oRepositoryBrowserControl && oRepositoryBrowserControl.getContent().length > 0) {
					oRepositoryBrowserControl.getContent()[0].attachSelect(that.onRepositorySelectFile, that);
				}
				return oRepositoryBrowserControl;
			});
			// 			});
		}).fail(
			function(oError) {
				that._throwErrorHandler(that.getContext().i18n.getText("i18n",
					"error_repository_browser"));
			});
	},

	//triggers when a file is selected
	onRepositorySelectFile: function(oEvent) {
		if ((!oEvent || !oEvent.getParameter)) {
			return;
		}
		var oSelectedNode = oEvent.getParameter("node");
		if (!oSelectedNode) {
			return;
		}
		var oSelectedDocument = oSelectedNode.oDocument;
		var btn = this._oDialog.getButtons()[0];
		if (oSelectedDocument.getEntity().isRoot() || oSelectedDocument.getEntity().getType() === "file") {
			btn.setEnabled(false);
			return;
		}
		btn.setEnabled(true);
		this._sFolderName = oSelectedDocument.getEntity().getParentPath() + "/" + oSelectedDocument.getEntity().getName();
	},

	setPathData: function(oEvent) {
		if (this._sFolderName !== this._customRulesPath) {
			var that = this;
			that._currentrRulesManagerInst.getUpdatedRules(this._sFolderName, this._convertRulesArrayToJSON(this._oCurrentSettings.rules))
				.then(function(aCurrentSettings) {
					that._oCurrentSettings.rules = that._convertRulesJSONToArray(aCurrentSettings);
					that._oModel.setData(that._oCurrentSettings);
					that.getView().setModel(that._oModel);
					that._oValidatorRules.bindRows("/rules");
					that._oValidatorRules.sort(that._oValidatorRules.getColumns()[1]);
					that._oRulesPath.setValue(that._sFolderName);
					that._customRulesPath = that._sFolderName;
				}).done();
		}
		if (this._oDialog !== null) {
			this._oDialog.close();
		}
	},

	getRulesManagerInst: function() {
		return this._currentrRulesManagerInst;
	},

	_convertRulesArrayToJSON: function(rulesArray) {
		var newObj = {};
		_.forEach(rulesArray, function(rule) {
			newObj[rule.ruleId] = rule;
		});
		return newObj;
	},

	_convertRulesJSONToArray: function(rules) {
		var newObj = [];
		_.forEach(rules, function(rule) {
			newObj.push(rule);
		});
		return newObj;
	},

	getConfiguredValues: function() {
		var validatorsList = this.byId("validatorsSelection");
		var settings = {};
		settings.customRulesPath = this._customRulesPath;
		settings.configuration = {};
		settings.configuration.rules = this._convertRulesArrayToJSON(this._oCurrentSettings.rules);
		//settings.configuration.header = JSON.parse(this._getHeaderAceEditor().getValue());
		settings.configuration.header = JSON.parse(this._oModel.getProperty("/header")); //JSON.parse(this._oCurrentSettings.header);
		settings.services = settings.services || {};
		settings.services[this._fileExtension] = validatorsList.getSelectedKey();
		return settings;
	},
	getErrorMessgae: function() {
		var sMessage = this._getAdditionalPropertiesErrorMessage();
		if (sMessage) {
			return sMessage;
		} else {
			return this._getHeaderEditorErrorMessage();
		}
	},

	cancel: function() {
		this._oDialog.close(); // close the dialog
	},

	_getHeaderAceEditor: function() {
		return this.byId("aceEditorValidatorSettings");
	},

	_getHeaderEditorErrorMessage: function() {
	  var context = this.getView().getViewData().context;
		if (this._getHeaderAceEditor().hasAnnotations()) {
			return context.i18n.getText("i18n", "proj_validator_setting_invalid_Header"); //"Error in header";
		}
		else {
		  //  check for unknow type of errors and return general error
		    try {
	            JSON.parse(this._getHeaderAceEditor().getValue());
	        } catch(e) {
	            if (e.message) {
	                return context.i18n.getText("i18n", "proj_validator_setting_invalid_Header", [e.message]);//"Error in header";
	            } else {
	                return context.i18n.getText("i18n", "proj_validator_setting_invalid_Header");//"Error in header";
	            }
	        }
		}
	},

	_getAdditionalPropertiesErrorMessage: function() {
		if (this._invalidControls.length > 0) {
			var context = this.getView().getViewData().context;
			return context.i18n.getText("i18n", "proj_validator_setting_invalid_additionalProperties"); //"Error in additional properties";
		}
	},

	_updateHeaderControl: function(sHeader) {
		var that = this;
		return this._oContext.service.beautifierProcessor.beautify(sHeader, "json")
			.then(function(sBeautifyHeader) {
				that._getHeaderAceEditor().setValue(sBeautifyHeader);
			});
	}

});