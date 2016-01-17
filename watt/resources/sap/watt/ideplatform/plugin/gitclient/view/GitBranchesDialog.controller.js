jQuery.sap.require({
	modName : "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type : "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitBranchesDialog", {

	_sSelectedBranchName : undefined,
	_oGit : undefined,
	_oEntity : undefined,
	_i18n : undefined,
	_oDeferred : undefined,
	_oSelectedBranch : undefined,
	_branchesMap : {},

	onInit : function() {
		var oModel;
		this._oContext = this.getView().getViewData().context;
		this._i18n = this._oContext.i18n;
		this._i18n.applyTo(this.getView()._oBranchesDialog);

		var oData = {
			gitOp : "",
			bBypassCodeReview: false,
			bGerrit: false,
			branches : {
				0 : {
					branchName : this._i18n.getText("i18n", "gITRebaseDialog_local_branches"),
					visible : false
				},
				1 : {
					branchName : this._i18n.getText("i18n", "gITRebaseDialog_remote_branches"),
					visible : false
				}
			}
		};

		oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData : oData
		});
		this.getView()._oBranchesDialog.setModel(oModel);
		this.getView()._oBranchesDialog.bindElement("/modelData");
	},

	open : function(oBranches, oEntity, sDialogType, bIsGerrit) {
		var that = this;
		this._oGit = oEntity.getBackendData().git;
		this._oEntity = oEntity;
		this._dialogType = sDialogType;
		this._oLocalBranchesChildren = oBranches.localBranches || [];
		this._oRemoteBranchesChildren = oBranches.remoteBranches || [];
		var oModel = this.getView()._oBranchesDialog.getModel();

		oModel.setProperty("/modelData/bGerrit", bIsGerrit);
		oModel.setProperty("/modelData/bBypassCodeReview", false);
		var oTreeTableRebaseData = oModel.getProperty("/modelData/branches");
		//Init branches
		oTreeTableRebaseData = {
			1 : {
				branchName : this._i18n.getText("i18n", "gITRebaseDialog_remote_branches"),
				visible : false
			}
		};
		if (sDialogType !== "PUSH") {
			oTreeTableRebaseData["0"] = {
				branchName : this._i18n.getText("i18n", "gITRebaseDialog_local_branches"),
				visible : false
			};
		}

		oModel.setProperty('/modelData/gitOp', sDialogType);

		var fnCreateJSONTreeData = function(oBranchesChildren, iPosition) {

			for ( var i = 0; i < oBranchesChildren.length; i++) {
				var oBranch = oBranchesChildren[i];
				that._branchesMap[oBranch.Name] = oBranch;
				oTreeTableRebaseData[iPosition][i] = {
					branchName : oBranch.Name,
					currentBranch : oBranch.Current,
					visible : true
				};
			}
		};
		fnCreateJSONTreeData(this._oRemoteBranchesChildren, 1);
		if (sDialogType !== "PUSH") {
			fnCreateJSONTreeData(this._oLocalBranchesChildren, 0);
		}
		this.getView().getViewData().context.service.git.getCurrentBranchName(this._oLocalBranchesChildren).then(
				function(sCurrentBranch) {
					switch (sDialogType) {
					case "RESET":
						oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "gITRebaseDialog_reset_title"));
						that.getView()._oResetTypeRBG.setSelectedIndex(0);
						break;
					case "MERGE":
						oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "gITRebaseDialog_merge_title", [ sCurrentBranch ]));
						break;
					case "PUSH":
						oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "gitPushDialog_title"));
						break;
					default:
						// REBASE
						oModel.setProperty("/modelData/sDialogTitle", that._i18n.getText("i18n", "gITRebaseDialog_rebase_title",[ sCurrentBranch ]));
					}
				}).done();
		this.getView()._oOKButton.setEnabled(false);

		//sets the remote branch of current to be selected
		this.getView().getViewData().context.service.git.getRemoteBranchOfCurrent(this._oLocalBranchesChildren).then(
				function(sRemoteBranch) {
					for ( var i = 0; i < that._oRemoteBranchesChildren.length; i++) {
						var oRemoteBranch = oTreeTableRebaseData[1][i];
						oRemoteBranch.checked = oRemoteBranch.branchName === sRemoteBranch;
						if (oRemoteBranch.checked) {
							that.getView()._oOKButton.setEnabled(true);
							that._sSelectedBranchName = sRemoteBranch;
							that._oSelectedBranch = that._branchesMap[that._sSelectedBranchName];
							break;
						}
					}
					oModel.setProperty('/modelData/branches', oTreeTableRebaseData);
				}).done();
		this._oContext.event.fireOperationStopped({
			entity : oEntity,
			name : sDialogType
		}).done();
		this.getView()._oBranchesDialog.open();
		this._oDeferred = Q.defer();
		return this._oDeferred.promise;
	},

	_onSelectBranch : function(oEvent) {
		var oView = this.getView();
		this._sSelectedBranchName = oEvent.getSource().getText();

		oView._oOKButton.setEnabled(true);

		var oTable = sap.ui.getCore().byId("BranchesTreeTable");
		var aContexts = oTable.getBinding("rows").getContexts(0, oTable.getBinding().getLength());
		for ( var i = 0, l = aContexts.length; i < l; i++) {
			oTable.getModel().setProperty("checked", false, aContexts[i]);
		}
		oTable.getModel().setProperty("checked", true, oEvent.getSource().getBindingContext());
		var sBranchName = oTable.getModel().getProperty(oEvent.getSource().getBindingContext().getPath()).branchName;//TODO verify NPE
		this._oSelectedBranch = this._branchesMap[sBranchName];

	},

	_execute : function(oEvent) {
		var that = this;
		var oServices = this.getView().getViewData().context.service;
		var oModel = this.getView()._oBranchesDialog.getModel();
		var oPromis = null;
		this.getView()._oBranchesDialog.close();
		this._oContext.event.fireOperationStarted({
			entity : this._oEntity,
			name : this._dialogType
		}).done();
		switch (this._dialogType) {
		case 'RESET':
			var sResetType = that.getView()._oResetTypeRBG.getSelectedItem().getKey();
			if (sResetType === 'HARD') {
				this._oContext.event.fireOperationStopped({
					entity : this._oEntity,
					name : this._dialogType
				}).done();
				oPromis = oServices.usernotification.confirm(
						that._oContext.i18n.getText("i18n", "gitDispatcher_resetInRebaseInteractiveConfirmation", [ "\n\n" ])).then(
						function(oResponse) {
							if (oResponse.bResult) {
								that._oContext.event.fireOperationStarted({
									entity : that._oEntity,
									name : that._dialogType
								}).done();
								return oServices.git.resetBranch(that._oGit, sResetType, that._sSelectedBranchName).then(function(){
									that._updateResetUsageMonitoring();
								});
							}
						});
			} else {
				oPromis = oServices.git.resetBranch(that._oGit, sResetType, that._sSelectedBranchName).then(function(){
					that._updateResetUsageMonitoring();
				});
			}

			break;
		case 'REBASE':
			oServices.usagemonitoring.startPerf("git", "rebase").done();
			oPromis = oServices.git.rebase(this._oGit, this._sSelectedBranchName);
			break;
		case 'MERGE':
			oPromis = oServices.git.merge(this._oGit, this._sSelectedBranchName, undefined,oModel.getProperty('/modelData/bGerrit'));
			break;
		case 'PUSH':
			return that._oDeferred.resolve([this._oSelectedBranch, oModel.getProperty('/modelData/bBypassCodeReview')]);
		}

		oPromis.then(function() {
			that._oDeferred.resolve(true);
		}).fail(function(oError) {
			that.callMessageDialog(oError);
			if (oError.status === "RebaseInteractive") {
				that._oDeferred.resolve(false);
			} else {
				that._oDeferred.reject();
			}
		}).done();
	},
	
	_updateResetUsageMonitoring: function(){
		var that = this;
		var oServices = this.getView().getViewData().context.service;
		if (that._oSelectedBranch){
			oServices.git.getRemoteBranchOfCurrent(this._oLocalBranchesChildren).then(function(sRemoteBranch){
				var sMessage = "Reset against ";
				if (that._oSelectedBranch.Id !== undefined){
					sMessage += (sRemoteBranch === that._oSelectedBranch.Name ? "default" : "different") + " remote";	
					oServices.usagemonitoring.report("git", "reset_branch", sMessage).done();	
				}
				else{
					//reset from local to local 
					oServices.git.getRemoteBranchOfLocalBranch(that._oSelectedBranch).then(function(sSelRemoteBranch){
						sMessage += (sRemoteBranch === sSelRemoteBranch ? "default" : "different") + " local";		
						oServices.usagemonitoring.report("git", "reset_branch", sMessage).done();	
					}).done();
				}
			}).done();
		}
		oServices.usagemonitoring.report("git", "reset_type", that.getView()._oResetTypeRBG.getSelectedItem().getKey()).done();
	},

	cancelRebase : function() {
		this.getView()._oBranchesDialog.close();
		this._oDeferred.resolve(false);
	}

});