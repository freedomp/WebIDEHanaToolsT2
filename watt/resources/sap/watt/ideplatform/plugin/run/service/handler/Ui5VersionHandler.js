define({
	_oDocument: null,
	_aUi5Version: null,
	_sUI5CurrentVersion: null,
	
	setServiceData:  function(oDocument, dropDownBoxItems, sUI5CurrentVersion){
		this._oDocument = oDocument;
		this._aUi5Version = dropDownBoxItems;
		this._sUI5CurrentVersion = sUI5CurrentVersion;
	},
	
	getDocument:  function() {
		return this._oDocument;
	},
	
	getUIVersions: function() {
		return this._aUi5Version;
	},
	
	rbSelectedUpdateModel: function(oEvent, selectRbIndex) {
		var sUi5ActiveVersion;
		var oModel = oEvent.getModel();
		
		// Set selected index
		oModel.setProperty("/isDefaultVersion", selectRbIndex);
		if (selectRbIndex !== 1) {
			// Since selceted index is 0, meaning use default version from neo-app.json - set ui5VerSource to null
			oModel.setProperty("/ui5VerSource", null);
		} else {
			// Since selceted index is 1, meaning use default version that was saved previously. If such doesn't exists, 
			// use as default version from neo-app.json file if such exists. If such also doesn't exists,
			// take the first version from the list 
			sUi5ActiveVersion = oModel.getProperty("/ui5ActiveVersion");
			if (!sUi5ActiveVersion || sUi5ActiveVersion === null || sUi5ActiveVersion === "") {
				if (this._sUI5CurrentVersion && this._sUI5CurrentVersion !== "") {
					// check that the active version exists in the version list
					if ((_.findIndex(this._aUi5Version , "value", this._sUI5CurrentVersion)) >= 0) {
						sUi5ActiveVersion = this._sUI5CurrentVersion;
					} else {
						sUi5ActiveVersion = this._aUi5Version[0].value;
					}	
				} else {
					sUi5ActiveVersion = this._aUi5Version[0].value;
				}
				oModel.setProperty("/ui5ActiveVersion", sUi5ActiveVersion);
			}
		}
	},
	
	dropdownBoxChangeUpdateModel: function(oEvent, sSelectedKey) {
		var model = oEvent.getModel();
		model.setProperty("/isDefaultVersion", 1);
		if (sSelectedKey && this._aUi5Version && this._aUi5Version.length > 0) {
			var oUi5Entry = _.find(this._aUi5Version, function(entry) {
				if (entry.value === sSelectedKey) {
					return entry;
				}
			});
			model.setProperty("/ui5VerSource", oUi5Entry.source);
		} else {
			model.setProperty("/ui5VerSource", null);
		}
	},
	
	rbGetSelectedIndex: function(oEvent) {
		var model = oEvent.getModel();
		var isDefaultVersion = model.getProperty("/isDefaultVersion");
		return isDefaultVersion;
	},
	
	updateModelDropdownField: function(oEvent) {
		var model = oEvent.getModel();
		var sUi5ActiveVersion = model.getProperty("/ui5ActiveVersion");
		// check that the active version exists in the version list 
		if ((_.findIndex(this._aUi5Version , "value", sUi5ActiveVersion)) >= 0) {
			sUi5ActiveVersion = sUi5ActiveVersion;
		} else {
			sUi5ActiveVersion = this._aUi5Version[0].value;
		}
		model.setProperty("/ui5ActiveVersion", sUi5ActiveVersion);
	}

});