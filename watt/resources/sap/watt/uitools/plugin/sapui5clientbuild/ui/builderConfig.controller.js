sap.ui.controller("sap.watt.uitools.plugin.sapui5clientbuild.ui.builderConfig", {

	_aProjectMetadata: null,

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf com.sap.watt.ide.core.src.main.webapp.resources.sap.watt.uitools.plugin.sapui5clientbuild.ui.builderConfig
	 */
	onInit: function() {
		var that = this;
		var oView = this.getView();
		var oViewData = oView.getViewData();
		oViewData.context.i18n.applyTo(oView);

		return oViewData.projectDocument.getCurrentMetadata(true).then(function(aProjectMetadata) {
			that._aProjectMetadata = aProjectMetadata;
			var oModel = new sap.ui.model.json.JSONModel();
			var oData = oViewData.buildSettings;
			if (oData.sourceFolder) {
				oData.isDeepStructure = true;
			} else {
				oData.isDeepStructure = false;
			}
			oModel.setData(oData);
			oView.setModel(oModel);
			var oComboBoxSourceFolder = that.byId("sourceFolder");
			for (var i = 0; i < that._aProjectMetadata.length; i++) {
				var sPath = that._aProjectMetadata[i].path.substring(oViewData.projectDocument.getEntity().getName().length + 2);
				if (that._aProjectMetadata[i].folder) {
					oComboBoxSourceFolder.addItem(new sap.ui.core.ListItem({
						text: sPath
					}));
				}
			}
			that._setExcludedObjects();
		});
	},

	_setExcludedObjects: function() {
		var oView = this.getView();
		var oViewData = oView.getViewData();
		var oComboBoxExcludedFolder = this.byId("excludedFolder");
		var oComboBoxExcludedFile = this.byId("excludedFile");
		var sSourceFolder = oView.getModel().getData().sourceFolder;
		for (var i = 0; i < this._aProjectMetadata.length; i++) {
			var sPath = this._aProjectMetadata[i].path.substring(oViewData.projectDocument.getEntity().getName().length + 2);
			if (sPath.indexOf(sSourceFolder) !== -1) { //Excluded files/folders should be part of source folder
				sPath = sPath.substring(sSourceFolder.length + 1);
				if (this._aProjectMetadata[i].folder) {
					oComboBoxExcludedFolder.getTemplate().addItem(new sap.ui.core.ListItem({
						text: sPath
					}));
				} else {
					oComboBoxExcludedFile.getTemplate().addItem(new sap.ui.core.ListItem({
						text: sPath
					}));
				}
			}
		}
	},

	addRowExcludedFolders: function() {
		this._addRow("excludedFolders");
	},

	addRowExcludedFiles: function() {
		this._addRow("excludedFiles");
	},

	_addRow: function(sProperty) {
		var oModel = this.getView().getModel();
		var oData = oModel.getData();
		if (!oData.hasOwnProperty(sProperty)) {
			oData[sProperty] = [];
		}
		oData[sProperty].push("");
		oModel.updateBindings();
	},

	removeRowExcludedFolders: function() {
		this._removeRow("excludedFolders");
	},

	removeRowExcludedFiles: function() {
		this._removeRow("excludedFiles");
	},

	_removeRow: function(sProperty) {
		var oModel = this.getView().getModel();
		var sIndex = this.byId(sProperty).getSelectedIndex();
		oModel.getData()[sProperty].splice(sIndex, 1);
		oModel.updateBindings();
	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf com.sap.watt.ide.core.src.main.webapp.resources.sap.watt.uitools.plugin.sapui5clientbuild.ui.builderConfig
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf com.sap.watt.ide.core.src.main.webapp.resources.sap.watt.uitools.plugin.sapui5clientbuild.ui.builderConfig
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf com.sap.watt.ide.core.src.main.webapp.resources.sap.watt.uitools.plugin.sapui5clientbuild.ui.builderConfig
	 */
	//	onExit: function() {
	//
	//	}

});