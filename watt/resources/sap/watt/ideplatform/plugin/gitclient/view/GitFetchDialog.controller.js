jQuery.sap.require({
	modName: "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type: "controller"
});

sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitFetchDialog", {
	_oContext: undefined,

	onInit: function() {

		this._oContext = this.getView().getViewData().context;
		this._oContext.i18n.applyTo(this.getView()._oFetchDialog);
	},

	open: function(aFetchResults) {

		var aFetchedData = this._populateModel(aFetchResults);

		var oFetchChangesModel = new sap.ui.model.json.JSONModel();
		oFetchChangesModel.setData({
			modelFetchChangesData: aFetchedData
		});
		this.getView()._oFetchTable.setModel(oFetchChangesModel);
		this.getView()._oFetchDialog.open();
	},

	_populateModel: function(aFetchResults) {
		var aFetchedData = {
			branches: []
		};

		for (var i = 0; i < aFetchResults.length; i++) {
			aFetchedData.branches[i] = {
				summary: aFetchResults[i].branch
			};
			for (var j = 0; j < aFetchResults[i].changes.length; j++) {
				var oChange = aFetchResults[i].changes[j];

				aFetchedData.branches[i][j] = {
					changeId: oChange.Name,
					summary: oChange.Message,
					author: oChange.AuthorName,
					date: oChange.Time
				};
				if ((oChange.Diffs) && (oChange.Diffs.length > 0)) {
					for (var k = 0; k < oChange.Diffs.length; k++) {
							aFetchedData.branches[i][j][k] = {
								summary:  ( oChange.Diffs[k].ChangeType === "DELETE" ? oChange.Diffs[k].OldPath : oChange.Diffs[k].NewPath ) + "[" + oChange.Diffs[k].ChangeType[0] + "]"
							};

					}
				}
			}
		}

		return aFetchedData;

	},

	//On  OK press - Fetch
	_executeFetch: function(oEvent) {
		this.getView()._oFetchDialog.close();
	}

});