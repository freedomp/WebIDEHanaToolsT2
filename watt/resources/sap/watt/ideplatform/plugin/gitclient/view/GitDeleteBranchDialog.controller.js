jQuery.sap.require({
	modName: "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type: "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitDeleteBranchDialog", {
	_oDeferred: null,
	_sRepositoryName: null,
	_oTriStateEvent: null,
	_aBranchesToDelete: {},

	onInit: function() {
		this._oContext = this.getView().getViewData().context;
		var oData = {
			sBranchName: "",
			isBranchSelected: false,
			aLocalBranches: []
		};

		this._oContext.i18n.applyTo(this.getView()._oDeleteBranchDialog);

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			oData: oData
		});
		this.getView()._oDeleteBranchDialog.setModel(oModel);
		this.getView()._oDeleteBranchDialog.bindElement("/oData");

		//the  _registerChildren uses the checkboxs in the table 
		//that are availble only after the rendering and not in the open of the dialog
		this.getView()._oTable.addEventDelegate({
			onAfterRendering: this._registerChildren
		}, this);
	},

	open: function(sBranchName, oEntity, aBranches) {
		var oDialog = this.getView()._oDeleteBranchDialog;
		this._sRepositoryName = oEntity.getName();
		this._oGit = oEntity.getBackendData().git;
		this._aBranchesToDelete = {};
		this._oDeferred = Q.defer();
		oDialog.getModel().setProperty('/oData/sBranchName', sBranchName);
		oDialog.getModel().setProperty('/oData/isBranchSelected', false);
		oDialog.getModel().setProperty('/oData/isInProcess', false);

		oDialog.getModel().setProperty('/oData/aLocalBranches', []);
		oDialog.getModel().setProperty('/oData/aLocalBranches', aBranches);

		this._cleanSelection();

		oDialog.open();
		return this._oDeferred.promise;
	},

	_registerChildren: function() {
		var that = this;
		var oView = this.getView();
		var sCurrentBranch = oView._oTable.getModel().getProperty("/oData/sBranchName");
		var aItems = oView._oTable.getModel().getProperty("/oData/aLocalBranches").filter(function(oBranch) {
			return oBranch.Name !== sCurrentBranch;
		});
		var aChildren = oView._oTable.getRows().filter(function(oRow) {
			return oRow.getCells()[0].getEnabled();
		});
		var oParent = oView._oParentCheckBox;
		var nSelectedChildren = 0;


        //attached only to the visable rows
		for (var i = 0; i < aChildren.length; i++) {
			aChildren[i].getCells()[0].attachChange(function(oEvent) {
				if (this.getChecked()) {
					nSelectedChildren += 1;
				} else {
					nSelectedChildren -= 1;
				}

				that._changeBranchState(oEvent);

				if (nSelectedChildren === 0) {
					oParent.toggle("Unchecked");
				} else if (nSelectedChildren === aItems.length) {
					oParent.toggle("Checked");
				} else {
					oParent.toggle("Mixed");
				}
			});
		}

		oParent.detachChange(this._oTriStateEvent);
		this._oTriStateEvent = function() {
			if (this.getSelectionState() === "Checked") {
				for (var i = 0; i < aItems.length; i++) {
					var oItem = aItems[i];
					oItem.Checked = true;
					that._aBranchesToDelete[oItem.Name] = oItem;
				}
				nSelectedChildren = aItems.length;
				that.getView()._oDeleteBranchDialog.getModel().setProperty('/oData/isBranchSelected', true);
			} else {
				for (var i = 0; i < aItems.length; i++) {
					aItems[i].Checked = false;
					delete that._aBranchesToDelete[aItems[i].Name];
				}
				nSelectedChildren = 0;
				that.getView()._oDeleteBranchDialog.getModel().setProperty('/oData/isBranchSelected', false);
			}
		};
		oParent.attachChange(this._oTriStateEvent);
	},

	_cleanSelection: function() {
		var aItems = this.getView()._oTable.getModel().getProperty("/oData/aLocalBranches");
		for (var i = 0; i < aItems.length; i++) {
			aItems[i].Checked = false;
		}
		this.getView()._oParentCheckBox.setSelectionState("Unchecked");
	},

	_onCancel: function() {
		this.getView()._oDeleteBranchDialog.close();
		this._oDeferred.resolve(false);
	},

	_changeBranchState: function(oEvent) {
		var oCheckBox = oEvent.getSource();
		var oBranch = oCheckBox.getModel().getProperty(oCheckBox.getBindingContext().getPath());
		if (oEvent.getParameter("checked")) {
			this._aBranchesToDelete[oBranch.Name] = oBranch;
			this.getView()._oDeleteBranchDialog.getModel().setProperty('/oData/isBranchSelected', true);
		} else {
			delete this._aBranchesToDelete[oBranch.Name];
			if (jQuery.isEmptyObject(this._aBranchesToDelete)) {
				this.getView()._oDeleteBranchDialog.getModel().setProperty('/oData/isBranchSelected', false);
			}
		}
	},

	_deleteBranch: function(oEvent) {
		var that = this;
		var oService = this._oContext.service;
		if (jQuery.isEmptyObject(this._aBranchesToDelete)) {
			this._oDeferred.resolve(false);
			return;
		}
		
		//get all branches
		var aBranches = [];
		var aKeys = Object.keys(this._aBranchesToDelete);
		for (var i = 0; i < aKeys.length; i++) {
			var sKey = aKeys[i];
			if (this._aBranchesToDelete.hasOwnProperty(sKey)) {
				aBranches.push(this._aBranchesToDelete[sKey]);

			}
		}
		
		this.getView()._oDeleteBranchDialog.getModel().setProperty('/oData/isInProcess', true);
		oService.git.removeLocalBranches(aBranches,  this._sRepositoryName, this._oGit).then(function() {
			that._oDeferred.resolve(true);
			oService.usernotification.liteInfo(
				that._oContext.i18n.getText("i18n", "gitPane_RemoveBranch", true)).done();
		}).fail(function(oError) {
			that.callMessageDialog(oError);
			that._oDeferred.resolve(false);
		}).fin(function() {
			that.getView()._oDeleteBranchDialog.close();
			that.getView()._oDeleteBranchDialog.getModel().setProperty('/oData/isInProcess', false);
		}).done();

	}
});