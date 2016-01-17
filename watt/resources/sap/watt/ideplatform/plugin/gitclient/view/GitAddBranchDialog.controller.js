jQuery.sap.require({
	modName : "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type : "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitAddBranchDialog", {
	_GIT_MULTIPLE_BRANCHES: "gitMultipleBranches",
	_oDeferred : undefined,
	_oGit : undefined,
	_i18n : undefined,

	onInit : function() {
		var that = this;
		this._oContext = this.getView().getViewData().context;
		this._i18n = this._oContext.i18n;

		var oData = {
			sNewBranchName : "",
			sBranchValue: "",
			sErrorMessage: "",
			bCanChangeBranchValue: true,
			results: []
		};
		
		this._oContext.service.git.isFeatureSupported(this._GIT_MULTIPLE_BRANCHES).then(function(bMultipleBranches) {
			that.bIsMultiSelectionBranches = bMultipleBranches;
		});
		
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: oData
		});
		this.getView().setModel(oModel);

		this.getView().bindElement("/modelData");

		this._oContext.i18n.applyTo(this.getView()._oBranchDialog);
	},

	_onCancel : function() {
		this.getView()._oBranchDialog.close();
		this._oDeferred.resolve(false);
	},

	_createNewBranch : function(oEvent, sBranchName) {
		if (!this._isFieldsValid()) {
			return;
		}
		var that = this;
		var oSelectedItem = sap.ui.getCore().byId(this.getView()._oDropdownBranches.getSelectedItemId());
		var aPromisses = [];
		var oModel = that.getView().getModel();
		var sNewBranchName = oModel.getProperty("/modelData/sNewBranchName");
		if (oSelectedItem.getAdditionalText() === "Remote") {
		    //in case we are comming from the OK button OR from check out conflicts
			if (!oEvent) {
				aPromisses.push(this._oContext.service.git.checkoutLocalBranch(that._oGit, sBranchName));
			} else {
				aPromisses.push(that._oContext.service.git.createLocalBranch(that._oGit,
					sNewBranchName, oSelectedItem.getText()).then(
					function() {
						return that._oContext.service.git.checkoutLocalBranch(that._oGit,
							sNewBranchName);
					}));
			}
		} else {
			aPromisses.push(this._oContext.service.git.checkoutLocalBranch(that._oGit, oSelectedItem.getText()).then(
					function() {
						return that._oContext.service.git.setNewBranchConfiguration(that._oGit,
							sNewBranchName, oSelectedItem.getText()).then(
								function() {
									return that._oContext.service.git.createLocalBranch(that._oGit,
										sNewBranchName).then(
											function() {
												return that._oContext.service.git.checkoutLocalBranch(that._oGit,
													sNewBranchName);
										});
								});
					}));
		}

		Q.all(aPromisses).spread(function() {
			that._oDeferred.resolve(true);
		}).fail(function(oError) {
			if (oError.status === 409 && oError.files.length > 0) {
				var oData = {
					files : oError.files,
					checkoutBranch : sNewBranchName
				};
				return that._oContext.service.gitconflicts.openDialog(that._oEntity, oData, that._oLocals).then(function(bSuccess) {
					if (bSuccess) {
						return that._createNewBranch(null, sNewBranchName);
					}
					that._oDeferred.resolve(false);
				});
			} else {
    			// The local branch is deleted if checkout fails
			    return that._deleteBranch(sNewBranchName).fin(function(){
                    that.callMessageDialog(oError);
                    that._oDeferred.reject(oError);
			    });
			}
		}).done();

		this.getView()._oBranchDialog.close();
	},

	_deleteBranch : function(sBranchName) {
		var that = this;
    	return that._oContext.service.git.getLocalBranches(that._oGit).then(function(aLocalBranches) {
    		for (var i = 0; i < aLocalBranches.length; i++) {
    			if (aLocalBranches[i].Name === sBranchName) {
    			    var aBranches = [];
    			    aBranches.push(aLocalBranches[i]);
    				return that._oContext.service.git.removeLocalBranches(aBranches, that._oEntity.getName());
    			}
    		}
    	});
	},
	
	_isFieldsValid : function() {
		var that = this;
		var oModel = that.getView().getModel();
		var sName = oModel.getProperty("/modelData/sNewBranchName");
		
		//the filed must be filled
		if (sName === "" || sName.indexOf(" ") > -1) {
			oModel.setProperty("/modelData/sErrorMessage",this._i18n.getText("i18n", "gITBranchesDialog_New_Branch_Error"));
			this.markAsInvalid(this.getView()._oNewBranchTextField);
			return false;
		}
		
		//it must be unique
		var aBranches = this.getView().getModel().getProperty("/modelData/results");
		for ( var i = 0; i < aBranches.length; i++) {
			if (aBranches[i].Name === sName) {
				oModel.setProperty("/modelData/sErrorMessage", this._i18n.getText("i18n", "gITBranchesDialog_New_Branch_Error_Exist"));
				this.markAsInvalid(this.getView()._oNewBranchTextField);
				return false;
			}
		}
		this.clearValidationMarks(this.getView()._oNewBranchTextField);
		oModel.setProperty("/modelData/sErrorMessage", "");
		return true;
	},

	_onDropBoxChange : function(oEvent) {
		var that = this;
		var oModel = that.getView().getModel();
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem.getAdditionalText() === "Remote") {
			oModel.setProperty("/modelData/sNewBranchName", oSelectedItem.getText().substring(oSelectedItem.getText().lastIndexOf("/") + 1));
			oModel.setProperty("/modelData/bCanChangeBranchValue", that.bIsMultiSelectionBranches ? true : false);
		} else {
			oModel.setProperty("/modelData/sNewBranchName", "");
			oModel.setProperty("/modelData/bCanChangeBranchValue", true);
		}
	},

	open : function(sBranchName, oEntity, fnConflictHandler) {
		var that = this;
		var oView = this.getView();
		this._oGit = oEntity.getBackendData().git;
		this._oEntity = oEntity;
		this._oDeferred = Q.defer();

		var oJSONModel = oView.getModel();

		oJSONModel.setProperty("/modelData/sNewBranchName", "");

		this.clearValidationMarks(oView._oNewBranchTextField);
		oJSONModel.setProperty("/modelData/sErrorMessage", "");

		//get local and remote branches
		Q.all([ this._oContext.service.git.getLocalBranches(this._oGit), this._oContext.service.git.getRemoteBranches(this._oGit) ])
				.spread(function(oLocals, oRemotes) {

					that._oLocals = oLocals;
					var oRemotesUpdate = [];

					if (!that.bIsMultiSelectionBranches){
						for ( var i = 0; i < oRemotes.length; i++) {
                            var isMatch = false;
                            var sLocalName = oRemotes[i].Name.substring(oRemotes[i].Name.lastIndexOf("/") + 1);
							for ( var j = 0; j < oLocals.length; j++) {
								if (oLocals[j].Name === sLocalName) {
                                    isMatch = true;
									break;
								}
							}
                            if ( !isMatch) {
                                oRemotesUpdate.push(oRemotes[i]);
                            }
						}

					}else{
                        oRemotesUpdate = oRemotes;
                    }

					oJSONModel.setProperty( "/modelData/results", oLocals.concat(oRemotesUpdate));
					oJSONModel.setProperty("/modelData/sBranchValue", sBranchName);
					oView._oBranchDialog.open();
				}).fail(function(oError) {
					that.callMessageDialog(oError);
					that._oDeferred.reject(oError);
				}).done();

		oJSONModel.setProperty("/modelData/sNewBranchName", "");
		oJSONModel.setProperty("/modelData/bCanChangeBranchValue", true);
		return this._oDeferred.promise;
	}
});