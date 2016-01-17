jQuery.sap.require({
	modName : "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type : "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitUseStashDialog", {
	_oDeferred : undefined,
	_oGit : undefined,
	_i18n : undefined,
	_aStash : undefined,
		
	onInit : function() {
		this._oContext = this.getView().getViewData().context;
		this._i18n = this._oContext.i18n;
		this._i18n.applyTo(this.getView()._oUseStashDialog);
	},

	_onCancel : function() {
		this.getView()._oUseStashDialog.close();
		this._oDeferred.resolve("CANCEL");
	},
	
	_onApply : function(){
		this._onOk(true, this._aStash.Children[0].ApplyLocation);
	},
	
	_onPop : function(){
		this._onOk(true);
	},
	
	_onDrop : function(){
		this._onOk(false, this._aStash.Children[0].ApplyLocation);
	},

	_onOk : function(bApply, sApplyLocation) {
		this.getView()._oUseStashDialog.close();
		this._oDeferred.resolve({ apply: bApply, applyLocation : sApplyLocation });
	},
	
	open : function(aStash) {
		this._oDeferred = Q.defer();
		var oView = this.getView();
		this._aStash = aStash;
		var sUseStashMessage = this._i18n.getText("i18n", "gITUseStashDialog_text", ["{0}", aStash.Children[0].Message]);
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({ useStashMessage : sUseStashMessage });
		oView._oUseStashDialog.setModel(oModel);
		oView._oErrorTextArea.setText("");
		oView._oUseStashDialog.open();
	
		return this._oDeferred.promise;
	}
});