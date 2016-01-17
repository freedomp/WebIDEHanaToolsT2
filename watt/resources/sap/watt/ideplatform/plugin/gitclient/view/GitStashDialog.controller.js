jQuery.sap.require({
	modName : "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type : "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitStashDialog", {
	_oDeferred : undefined,
	_oGit : undefined,
	_i18n : undefined,
	_sStashMessage : undefined,
	_sCurrentBranch : undefined,
	
	onInit : function() {
		this._oContext = this.getView().getViewData().context;
		this._i18n = this._oContext.i18n;

		this._oContext.i18n.applyTo(this.getView()._oStashDialog);
	},

	_onCancel : function() {
		this.getView()._oStashDialog.close();
		this._oDeferred.resolve("CANCEL");
	},

	_onOk : function() {
		this.getView()._oStashDialog.close();
		var sStashMessage = this.getView()._oStashDialog.getModel().getData().stashMessage;
		sStashMessage = sStashMessage !== "" ? sStashMessage : this._sStashMessage;
		sStashMessage = "On " + this._sCurrentBranch + ": " + sStashMessage;
		this._oDeferred.resolve(sStashMessage);
	},
	
	open : function(sLocalBranchName) {
		this._oDeferred = Q.defer();
		this._sCurrentBranch = sLocalBranchName;
		var oView = this.getView();
		var oModel = new sap.ui.model.json.JSONModel();
		this._sStashMessage = new Date().toUTCString();
		var sMessageLabel = this._i18n.getText("i18n", "gITStashDialog_message");
		sMessageLabel = sMessageLabel + sLocalBranchName;
		oModel.setData({ stashMessage : this._sStashMessage, messageLabel : sMessageLabel });
		oView._oStashDialog.setModel(oModel);
		oView._oErrorTextArea.setText("");
		oView._oStashDialog.open();
		
		return this._oDeferred.promise;
	}
});