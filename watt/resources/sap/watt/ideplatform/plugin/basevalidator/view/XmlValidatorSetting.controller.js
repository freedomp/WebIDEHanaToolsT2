sap.ui.controller("sap.watt.ideplatform.plugin.basevalidator.view.XmlValidatorSetting", {

	_oValidatorsModel : new sap.ui.model.json.JSONModel(),
    _oContext: null,
    _projectPath: null,
	_fileExtension: "xml",
	_oCurrentSettings: null,

	onInit : function() {
		var oView = this.getView();
		this._oContext = oView.getViewData().context;
		this._projectPath = oView.getViewData().projectPath;
		this.getView().setModel(this._oValidatorsModel, "validatorsModel");

		//i18n resources
		this._oContext.i18n.applyTo(oView);
	},

	setProjectPath : function(sProjectPath){
		this._projectPath = sProjectPath;
	},

	onAfterRendering  : function() {
        this._oCurrentSettings = {};
        //bind validators list data
	    var that = this;
		that._oContext.service.document.getDocumentByPath(that._projectPath).then(function (projectDoc) {
    		return that._oContext.service.basevalidator.getValidatorsList(that._fileExtension, projectDoc).then(function(validators) {
                var validatorsList = {};
                validatorsList.validators = [];
                validatorsList.validators = validatorsList.validators.concat(validators);
                that._oValidatorsModel.setData(validatorsList);
    			if(validatorsList.validators.length > 0){
    				var oControl = that._getValidatorsCombobox();
    				oControl.setSelectedKey(validatorsList.validators[0].serviceID);
    			}
    		});
		}).done();
	},
	onExit: function() {
	},
	onValidatorChange : function(oEvent) {
	},

	getConfiguredValues: function() {
		var validatorsList = this._getValidatorsCombobox();
		var settings = {};
		settings.services = settings.services || {};
		settings.services[this._fileExtension] = validatorsList.getSelectedKey();
		return settings;
	},

	_getValidatorsCombobox : function(){
		return this.byId("xmlValidatorsSelection");
	},

	getSelectedServiceId : function(){
		var validatorsList = this._getValidatorsCombobox();
		return validatorsList.getSelectedKey();
	}



});