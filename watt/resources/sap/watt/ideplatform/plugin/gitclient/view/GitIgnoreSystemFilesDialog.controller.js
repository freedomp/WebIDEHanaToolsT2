jQuery.sap.require({
	modName : "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type : "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitIgnoreSystemFilesDialog", {
	_oDeferred : undefined,
	_i18n : undefined,
	_sIgnoreSystemFilesMessage : undefined,

	onInit : function() {
		this._oContext = this.getView().getViewData().context;
		this._i18n = this._oContext.i18n;

		this.oModel = new sap.ui.model.json.JSONModel();
		var oView = this.getView();
		this._sIgnoreSystemFilesMessage = this._i18n.getText("i18n", "gitIgnoreSystemFilesDialog_commit_description");
		this.oModel.setData({ ignoreSystemFilesMessage : this._sIgnoreSystemFilesMessage});
		oView._oIgnoreSystemFilesDialog.setModel(this.oModel);

		this._oContext.i18n.applyTo(this.getView()._oIgnoreSystemFilesDialog);
	},

	_onCancel : function() {
		this.getView()._oIgnoreSystemFilesDialog.close();
		this._oDeferred.resolve("CANCEL");
	},

	_onOk : function() {
		this.getView()._oIgnoreSystemFilesDialog.close();
		var sIgnoreSystemFilesMessage = this.getView()._oIgnoreSystemFilesDialog.getModel().getData().ignoreSystemFilesMessage;
		sIgnoreSystemFilesMessage = sIgnoreSystemFilesMessage !== "" ? sIgnoreSystemFilesMessage : this._sIgnoreSystemFilesMessage;
		this._oDeferred.resolve(sIgnoreSystemFilesMessage);
	},
	
	open : function() {
		this._oDeferred = Q.defer();
		var oView = this.getView();
		oView._oIgnoreSystemFilesDialog.open();
		
		this.oModel.setProperty("/ignoreSystemFilesMessage",this._sIgnoreSystemFilesMessage);
		
		return this._oDeferred.promise;
	}
});