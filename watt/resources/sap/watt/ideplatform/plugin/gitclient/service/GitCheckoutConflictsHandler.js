define({
	_oCheckoutConflictsFragment : null,
	_oCheckoutConflictsDeferred : null,
	_aBranches : null,
	_oEntity : null,

	getContent : function() {
		if (!this._oCheckoutConflictsFragment) {
			this._oCheckoutConflictsFragment = sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitCheckoutConflicts", this);
			this._oCheckoutConflictsFragment.setModel(new sap.ui.model.json.JSONModel());

			this.context.i18n.applyTo(this._oCheckoutConflictsFragment);
		}
	},

	_getBranches : function(oGit) {
		var that = this;
		//get local branches
		return this.context.service.git.getLocalBranches(oGit).then(function(oLocals) {
			that._aBranches = oLocals;
		}).fail(function(oError) {
			that.callMessageDialog(oError);
			that._oCheckoutConflictsDeferred.reject(oError);
		});
	},

	callMessageDialog : function(oError) {
		if (!oError.source || oError.source !== "git") {
			throw oError;
		}
		var sDetailedMessage = oError.detailedMessage ? "\n\n" + oError.detailedMessage : "";
		switch (oError.type) {
		case "Warning":
			this._oContext.service.usernotification.warning(oError.name + sDetailedMessage).done();
			break;
		case "Info":
			this._oContext.service.usernotification.info(oError.name + sDetailedMessage).done();
			break;
		default:
			//ERROR
			this._oContext.service.usernotification.alert(oError.name + sDetailedMessage).done();
		}
	},

	openDialog : function(oEntity, oData, aBranches) {
		var that = this;
		this._oEntity = oEntity;
		this._aBranches = aBranches;
		var oGit = oEntity.getBackendData().git;

		if (!this._oCheckoutConflictsFragment) {
			this.getContent();
		}

		Q(this._aBranches ? this._aBranches : this._getBranches(oGit)).then(function() {
			that._oCheckoutConflictsFragment.open();
		}).done();

		this._oCheckoutConflictsFragment.getModel().setData(oData);

		this._oCheckoutConflictsDeferred = Q.defer();
		return this._oCheckoutConflictsDeferred.promise;
	},

	cancel : function() {
		this._oCheckoutConflictsFragment.close();
		this._oCheckoutConflictsDeferred.resolve(false);
	},

	resetHard : function() {
		var that = this;
		var oGit = this._oEntity.getBackendData().git;
		this._oCheckoutConflictsFragment.close();
		this.context.service.git.getRemoteBranchOfCurrent(that._aBranches).then(
				function(sRemoteBranch) {
					return that.context.service.usernotification.confirm(
							that.context.i18n.getText("i18n", "gitDispatcher_resetInRebaseInteractiveConfirmation", [ "\n\n" ])).then(
							function(oResponse) {
								if (oResponse.bResult) {
									return that.context.service.git.resetBranch(oGit, "HARD", sRemoteBranch).then(function() {
										that._oCheckoutConflictsDeferred.resolve(true);
									});
								}
								that._oCheckoutConflictsDeferred.resolve(false);
							});

				}).fail(function(oError) {
			that._oCheckoutConflictsDeferred.reject(oError);
		}).done();
	}

});