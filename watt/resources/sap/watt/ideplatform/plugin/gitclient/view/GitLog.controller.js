jQuery.sap.require({
	modName: "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type: "controller"
});

sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitLog", {
	_PAGE_SIZE: 50,
	_i18n: undefined,
	_DEFAULT_LOG_LOCATION: "from_pane",

	onInit: function() {
		var that = this;
		var oView = this.getView();
		this._oContext = oView.getViewData().context;
		this._i18n = this._oContext.i18n;
		var oData = {
			oEntity: null,
			//two parameters for 2 displayed objects (file,folder)
			bFile: false,
			bFolder: false,
			sFolderFileName: null,
			sCurrentBranchName: "",
			isLogEnabled: false,
			isLogDetailsEnabled: false,
			isMore: false,
			iPageNumber: -1,
			aAvailableBranches: [],
			oCurrentBranch: null,
			oLogDetailData: {},
			oLogGitResponse: {},
			sSearchValue: "",
			sSearchItemsSelected: "",
			bCleanCalled: false
		
		};

		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: oData,
			commitsTree: []
		});
		oModel.setSizeLimit(2000);

		oView.setModel(oModel);
		oView.bindElement("/modelData");

		var oLogDetailsDialogModel = new sap.ui.model.json.JSONModel();
		oLogDetailsDialogModel.setData({
			newLogDetailName: null,
			newLogDetailType: null,
			validationStatus: null
		});

		var oGitLogCreateNewDetailFragment = sap.ui.jsfragment("sap.watt.ideplatform.plugin.gitclient.view.GitLogCreateNewDetail", this);
		oGitLogCreateNewDetailFragment.setModel(oLogDetailsDialogModel);

		this._oContext.i18n.applyTo([oView, oGitLogCreateNewDetailFragment]);
	},

	updateGitLogPane: function(oEntity) {
		this.clearPane();
		var oModel = this.getView().getModel();
		oModel.setProperty("/modelData/bCleanCalled", false);
		var oGit = oEntity.getBackendData().git;
		var sType = oEntity.getType();
		var sName = oEntity.getFullPath();
		//Reset fields of pane to default values
		oModel.setProperty("/modelData/oEntity", oEntity);
		oModel.setProperty("/modelData/bFile", sType === "file");
		oModel.setProperty("/modelData/bFolder", sType === "folder");
		//Format the file full name to shorter version
		oModel.setProperty("/modelData/sFolderFileName", this.calculateShortFileFoldername(sName));
		oModel.setProperty("/modelData/iPageNumber", 1);
		this._updateAllModels(oGit);
	},

	clearPane: function() {
		var oModel = this.getView().getModel();
		oModel.setProperty("/modelData/bCleanCalled", true);
		oModel.setProperty("/modelData/isLogEnabled", false);
		oModel.setProperty("/modelData/sCurrentBranchName", "");
		oModel.setProperty("/modelData/sFolderFileName", "");
		oModel.setProperty("/modelData/oEntity", null);
		oModel.setProperty("/modelData/nPageNumber", 1);
		oModel.setProperty("/modelData/sSearchItemsSelected", "");
		this._clearGitVersionGraphControl();
	},

	validateInputNewLogDetail: function(sNewLogDetailName, ignoreEmpty) {
		var oDialog = sap.ui.getCore().byId("oGitLogCreateNewDetailDialog");
		var sNewLogDetailType = oDialog.getModel().getProperty("/newLogDetailType");
		var bCheck = true;
		if (!sNewLogDetailName) {
			bCheck = !ignoreEmpty;
		}
		oDialog.getModel().setProperty("/newLogDetailName", sNewLogDetailName);
		if (bCheck && (!sNewLogDetailName || !/^[a-zA-Z0-9_]+([\.\/]?[^^\.\\//!$@%^&*()+|~=`{}\[\]:";'<>?,])*$/.test(sNewLogDetailName))) {
			oDialog.getModel().setProperty(
				"/validationStatus",
				sNewLogDetailType === "Tag" ? this._oContext.i18n.getText("i18n", "gitLog_TagErrorInput") : this._oContext.i18n
				.getText("i18n", "gitLog_CheckOutCommitErrorInput"));
			return false;
		} else {
			oDialog.getModel().setProperty("/validationStatus", "");
			return true;
		}
	},

	createNewLogDetail: function(oEvent) {
		var that = this;
		var oDialog = sap.ui.getCore().byId("oGitLogCreateNewDetailDialog");
		var sNewLogDetailName = oDialog.getModel().getProperty("/newLogDetailName");
		var sNewLogDetailType = oDialog.getModel().getProperty("/newLogDetailType");
		if (!this.validateInputNewLogDetail(sNewLogDetailName)) {
			return;
		}
		oDialog.close();
		var oGitVersion = this.byId("gitVersionControl");
		var oModel = oGitVersion.getModel();
		var oSelected = oGitVersion.getSelected();
		var oService = this._oContext.service;
		if (oSelected) {
			var oLog = oModel.getProperty(oSelected.getBindingContext().getPath());

			switch (sNewLogDetailType) {
				case "Tag":
					oService.git.tag(oLog, sNewLogDetailName).then(function() {
						that._oContext.service.usagemonitoring.report("gitlog", "tag", that._DEFAULT_LOG_LOCATION).done();
						//update log pane
						var oGit = that.getView().getModel().getProperty("/modelData/oEntity").getBackendData().git;
						return that._updateGitCommit(oGit, oLog.Name, oSelected.getBindingContext().getPath()).then(function(){
							that._setTableSelection(oSelected.getIndex());
							oService.usernotification.liteInfo(that._oContext.i18n.getText("i18n", "gitLog_TagSuccess", [sNewLogDetailName]),
								true).done();
						});
					}).fail(function(oError) {
						that.callMessageDialog(oError);
					}).done();
					break;
				case "Branch":
					var oEntity = this.getView().getModel().getProperty("/modelData/oEntity");
					var oGit = oEntity.getBackendData().git;
					oService.git.checkoutLocalBranch(oGit, sNewLogDetailName, oLog).then(function() {
						that._oContext.service.usagemonitoring.report("gitlog", "checkout_branch", that._DEFAULT_LOG_LOCATION).done();
						oService.usernotification.liteInfo(that._oContext.i18n.getText("i18n", "gitLog_BranchCkeckoutSuccess", [sNewLogDetailName]),
							true).done();
					}).fail(function(oError) {
						that.callMessageDialog(oError);
					}).done();
					break;
			}

		}
	},

	cancel: function(oEvent) {
		sap.ui.getCore().byId("oGitLogCreateNewDetailDialog").close();
	},

	_getCommitName: function(oLog) {
		return (oLog.Message.split("\n\n")[0]);

	},

	_updateFileFolderModel: function(oGit) {
		this._updateGitVersion(oGit).done();
	},

	_updateAllModels: function(oGit) {
		var that = this;
		var oViewModel = this.getView().getModel();

		//Clean the availble branches model
		oViewModel.setProperty("/modelData/aAvailableBranches", []);

		//Create a promise to get all branches and update the graph control
		var aPromisses = [this._oContext.service.git.getLocalBranches(oGit)];
		aPromisses.push(that._oContext.service.git.getRemoteBranches(oGit));

		//aPromisses.push(that._updateGitVersion(oGit));
		Q.all(aPromisses).spread(function(oLocals, oRemotes) {
			if (!oViewModel.getProperty("/modelData/bCleanCalled")) {
				var aAllBranches = oLocals;
				if (oRemotes) {
					aAllBranches = oLocals.concat(oRemotes);
				}

				oViewModel.setProperty("/modelData/aAvailableBranches", aAllBranches);

				return that._oContext.service.git.getCurrentBranchName(aAllBranches).then(function(sCurrentBranch) {
					oViewModel.setProperty("/modelData/sCurrentBranchName", sCurrentBranch);
					//call git log and update the results in the graph control
					oGit = that._updateGitCommitLocation(oGit, sCurrentBranch);
					return that._updateGitVersion(oGit);
				});
			}
		}).fail(function(oError) {
			that.callMessageDialog(oError);
		}).done();
	},

	_onDropDownBoxChangeMultiSelection: function(oEvent) {
		var that = this;
		this._clearGitVersionGraphControl();

		var aSelectedItem = oEvent.getParameter("selectedItems");
		if (aSelectedItem.length === 0) {
			return;
		}

		var oModel = this.getView().getModel();
		var oGit = oModel.getProperty("/modelData/oEntity").getBackendData().git;
		var sCommitLocation = oGit.CommitLocation;
		var aAvailableBranches = oModel.getProperty("/modelData/aAvailableBranches");

		var aBranches = [];
		for (var i = 0; i < aSelectedItem.length; i++) {
			if (aSelectedItem[i].getText() !== this._i18n.getText("i18n", "gitLog_SelectAllBranchesTitle")) {
				var oItemGit = aSelectedItem[i].getModel().getProperty(aSelectedItem[i].getBindingContext().getPath());
				aBranches.push(oItemGit.FullName);
			}
		}

		oGit = that._updateGitCommitLocation(oGit,aBranches.length === 0 ? "" : aBranches.join("|"));
		return that._updateGitVersion(oGit);
	},

	_updateGitCommitLocation: function(oGit, sUpdateVal){
		var sCommitLocation = oGit.CommitLocation;
		var aCommitLocation = sCommitLocation.split("/");
		var iCommitIndex = aCommitLocation.indexOf("commit");
		if (iCommitIndex !== -1) {
			var bHasValues = aCommitLocation[iCommitIndex + 1] !== "file";
			if (!sUpdateVal) {
				if (bHasValues) {
					aCommitLocation.splice(iCommitIndex + 1, 1);
				}
			} else {
				if (bHasValues) {
					aCommitLocation[iCommitIndex + 1] = encodeURIComponent(encodeURIComponent(sUpdateVal));

				} else {
					aCommitLocation.splice(iCommitIndex + 1, 0, encodeURIComponent(encodeURIComponent(sUpdateVal)));
				}
			}
		}

		oGit.CommitLocation = aCommitLocation.join("/");
		return oGit;
	},

	_onDropDownBoxChange: function(oEvent) {
		var that = this;
		this._clearGitVersionGraphControl();
		var oSelectedItem = oEvent.getParameter("selectedItem");
		if (oSelectedItem && oSelectedItem.getBindingContext()) {
			var oItemGit = oSelectedItem.getModel().getProperty(oSelectedItem.getBindingContext().getPath());
			//Call API with new branch
			var oModel = this.getView().getModel();
			var sCommitLocation = oModel.getProperty("/modelData/oEntity").getBackendData().git.CommitLocation;
			var aAvailableBranches = oModel.getProperty("/modelData/aAvailableBranches");
			this._oContext.service.git.getCurrentBranch(aAvailableBranches).then(function(oCurrBranch) {
				if (oItemGit.Name !== "All") {
					//Encode the branch name twice as this is how orion expects the string,
					//replace the Commit location of the selected branch with the adjusted string of the file commit location
					oItemGit.CommitLocation = sCommitLocation.replace(encodeURIComponent(encodeURIComponent(oCurrBranch.Name)), encodeURIComponent(
						encodeURIComponent(oItemGit.FullName)));
				} else {
					oItemGit.CommitLocation = sCommitLocation.replace("/" + encodeURIComponent(encodeURIComponent(oCurrBranch.Name)), "");
				}
				return that._updateGitVersion(oItemGit);
			}).done();
		}
	},

	_setTableSelection: function(index) {
		var oGitVersion = this.byId("gitVersionControl");
		var oSelected = oGitVersion.getSelected();
		if (oSelected !== null && oSelected !== undefined) {
			oGitVersion.setSelectedIndex(index);
		}
	},

	_updateGitVersion: function(oGit) {

		var oModel = this.getView().getModel();
		var that = this;

		oModel.setProperty("/commitsTree", []);
		oModel.setProperty("/modelData/sSearchValue", "");
		oModel.setProperty("/modelData/isLogEnabled", false);
		oModel.setProperty("/modelData/oLogGitResponse", {});
		return this._oContext.service.git.getLog(oGit, 1, this._PAGE_SIZE).then(function(oResponse) {
			if (!oModel.getProperty("/modelData/bCleanCalled")) {
				oModel.setProperty("/commitsTree", oResponse.aFormattedLogData);
				oModel.setProperty("/modelData/isLogDetailsEnabled", oResponse.aFormattedLogData && oResponse.aFormattedLogData.length > 0);
				oModel.setProperty("/modelData/isLogEnabled", true);
				oModel.setProperty("/modelData/isMore", !!oResponse.sNextUrl);
				oModel.setProperty("/modelData/oLogGitResponse", oResponse);
				oModel.refresh();
			}
		}).fail(function(oError) {
			that.callMessageDialog(oError);
		});
	},

	_updateGitCommit: function(oGit, commitId, sSelPath) {
		var oModel = this.getView().getModel();
		var that = this;
		oGit = that._updateGitCommitLocation(oGit,commitId);
		oModel.setProperty("/modelData/isLogEnabled", false);
		return this._oContext.service.git.getLog(oGit, 1 ,1).then(function(oResponse) {
			if (oResponse.aFormattedLogData.length > 0) {
				oModel.setProperty(sSelPath, oResponse.aFormattedLogData[0]);
				oModel.setProperty("/modelData/oLogDetailData", oResponse.aFormattedLogData[0]);
				oModel.setProperty("/modelData/isLogEnabled", true);
				oModel.refresh();
			}
		}).fail(function(oError) {
			that.callMessageDialog(oError);
		});
	},

	_onGitVersionSelection: function(oEvent) {
		var oModel = this.getView().getModel();
		var oGitVersion = this.byId("gitVersionControl");
		oModel = oGitVersion.getModel();

		var oSelected = oEvent.getParameter("selected");
		if (oSelected) {
			var oLog = oModel.getProperty(oSelected.getPath());
			oModel.setProperty("/modelData/oLogDetailData", oLog);
		} else {
			oModel.setProperty("/modelData/oLogDetailData", {});
		}
		oModel.setProperty("/modelData/isLogDetailsEnabled", !!oSelected);
	},

	_onGitVersionSearchCountChange: function(oEvent) {
		var oModel = this.getView().getModel();
		var sSelectedCount = oEvent.getParameter("sCount");
		oModel.setProperty("/modelData/sSearchItemsSelected", sSelectedCount);
	},

	_clearGitVersionGraphControl: function() {
		var oModel = this.getView().getModel();
		oModel.setProperty("/modelData/isMore", false);
		oModel.setProperty("/commitsTree", []);
		oModel.setProperty("/modelData/isLogEnabled", false);
		oModel.setProperty("/modelData/oLogDetailData", {});
	},

	_onNextPage: function() {
		var oModel = this.getView().getModel();
		var that = this;
		var oGit = oModel.getProperty("/modelData/oEntity").getBackendData().git;
		this._clearGitVersionGraphControl();
		var sNextPageUri = oModel.getProperty("/modelData/oLogGitResponse").sNextUrl;
		var oNextPageUriAttr = new URI(sNextPageUri).search(true);
		var iPage = oNextPageUriAttr.page ? parseInt(oNextPageUriAttr.page, []) : null;
		var iPageSize = oNextPageUriAttr.pageSize ? parseInt(oNextPageUriAttr.pageSize, []) : null;
		return this._oContext.service.git.getLog(oGit, iPage, iPageSize).then(function(oResponse) {
			that._oContext.service.usagemonitoring.report("gitlog", "more_history", that._DEFAULT_LOG_LOCATION).done();
			oModel.setProperty("/commitsTree", oResponse.aFormattedLogData);
			oModel.setProperty("/modelData/isMore", !!oResponse.sNextUrl);
			oModel.setProperty("/modelData/oLogGitResponse", oResponse);
			oModel.setProperty("/modelData/isLogEnabled", oResponse.aFormattedLogData && oResponse.aFormattedLogData.length > 0);
			var oGitVersionControl = that.byId("gitVersionControl");
			oGitVersionControl.searchGitLog(oModel.getProperty("/modelData/sSearchValue"));
		});
	},

	_onRevert: function(oEvent) {
		var that = this;
		var oEntity = this.getView().getModel().getProperty("/modelData/oEntity");
		var oGit = oEntity.getBackendData().git;
		var oGitVersion = this.byId("gitVersionControl");
		var oModel = oGitVersion.getModel();
		var oSelected = oGitVersion.getSelected();
		var oService = this._oContext.service;
		if (oSelected) {
			var oLog = oModel.getProperty(oSelected.getBindingContext().getPath());
			oService.gitdispatcher.verifyUserInfo(oEntity).then(function() {
				return oService.git.revert(oGit, oLog).then(function() {
					that._oContext.service.usagemonitoring.report("gitlog", "revert", that._DEFAULT_LOG_LOCATION).done();
					that.updateGitLogPane(oEntity);
					that._setTableSelection(oSelected.getIndex() + 1);
					oService.usernotification.liteInfo(that._oContext.i18n.getText("i18n", "gitLog_RevertSuccess", [that._getCommitName(oLog)]), true)
						.done();
				});
			}).fail(function(oError) {
				if (oError) {
					that.callMessageDialog(oError);
				}
			}).done();
		}
	},

	_onTag: function(oEvent) {
		this._handleNewLogDetailDialogOpening("Tag");
	},

	_onCheckOutCommit: function(oEvent) {
		this._handleNewLogDetailDialogOpening("Branch");

	},

	_handleNewLogDetailDialogOpening: function(sNewDetailType) {
		var oDialog = sap.ui.getCore().byId("oGitLogCreateNewDetailDialog");
		oDialog.getModel().setProperty("/newLogDetailName", null);
		oDialog.getModel().setProperty("/validationStatus", null);
		oDialog.getModel().setProperty("/newLogDetailType", sNewDetailType);
		oDialog.open();
	},

	_onCherryPick: function(oEvent) {
		var that = this;
		var oEntity = this.getView().getModel().getProperty("/modelData/oEntity");
		var oGit = oEntity.getBackendData().git;
		var oGitNewService = this._oContext.service.git;
		var oGitVersion = this.byId("gitVersionControl");
		var oModel = oGitVersion.getModel();
		var oSelected = oGitVersion.getSelected();
		var oService = this._oContext.service;
		if (oSelected) {
			var oLog = oModel.getProperty(oSelected.getBindingContext().getPath());
			oService.gitdispatcher.verifyUserInfo(oEntity).then(function() {
				return oGitNewService.getLocalBranches(oGit).then(
					function(aLocalBranches) {
						return oGitNewService.getCurrentBranchName(aLocalBranches).then(
							function(sLocalBranchName) {
								return oService.usernotification.confirm(
										that._i18n.getText("i18n", "gitLog_CherryPickConfirmation", [that._getCommitName(oLog), sLocalBranchName]))
									.then(function(oResponse) {
										if (oResponse.bResult) {
											return oService.git.cherryPick(oGit, oLog).then(function() {
												that._oContext.service.usagemonitoring.report("gitlog", "cherry_pick", that._DEFAULT_LOG_LOCATION).done();
												oService.usernotification.liteInfo(that._oContext.i18n.getText("i18n", "gitLog_CherryPickSuccess", [that._getCommitName(
													oLog)]), true).done();
											});
										}
									});
							});
					});
			}).fail(function(oError) {
				if (oError) {
					that.callMessageDialog(oError);
				}
			}).done();
		}
	},

	_onFileTableRowDoubleClick: function(oEvent) {
		var that = this;
		var oControl = jQuery(oEvent.target).control()[0];
		var oSelectedRowModel = oControl.getModel().getProperty(oControl.getBindingContext().getPath());

		if (oSelectedRowModel.ChangeType === "DELETE" || oSelectedRowModel.ChangeType === "ADD") {
			this._oContext.service.usernotification.info(this._i18n.getText("i18n", "gitLog_DiffInfoNotPossibleDelete")).done();
			return;
		}
		if (oSelectedRowModel.ChangeType === "MODIFY") {
			var oDocumentProvider = this._oContext.service.filesystem.documentProvider;
			//Return a document for the file compared (does not matterthe document it is send because compare must have a document param)
			var oDocument = this.getView().getModel().getProperty("/modelData/oEntity");
			var sUrl = oDocument.getFullPath();
			if (oDocument.getType() === "folder") {
				var iIndex = oSelectedRowModel.DiffLocation.indexOf(oDocument.getFullPath());
				sUrl = oSelectedRowModel.DiffLocation.substring(iIndex);
			}

			oDocumentProvider.getDocument(URI(sUrl).toString()).then(
				function(oCurrFileDocument) {
					if (oCurrFileDocument) {
						//currently, we create copy the current document
						//TODO: remove this and create new document
						var oNewDocument = jQuery.extend(true, {}, oCurrFileDocument);
						var oNewEntity = jQuery.extend(true, {}, oCurrFileDocument.getEntity());
						var sSelectedAccordionCommitName = oControl.getModel().getProperty(
							oControl.getParent().getParent().getBindingContext().getPath()).oLogDetailData.Name;
						var sContentLocation = oSelectedRowModel.ContentLocation;
						var fnGetKeyString = function(sSelectedAccordionCommitName, sContentLocation) {
							return function() {
								return this.getType() + ":" + this.getFullPath() + ":" + this._sDAO + ":" + sSelectedAccordionCommitName + ":" +
									sContentLocation;
							};
						};
						oNewEntity.getKeyString = fnGetKeyString(sSelectedAccordionCommitName, sContentLocation);
						oNewDocument._mEntity = oNewEntity;

						return Q.all(
									[that._oContext.service.git.getFileHead(oSelectedRowModel, false),
											that._oContext.service.git.getFileNew(oSelectedRowModel, false)]).spread(
							function(sNewFileFromHead, sBaseFileFromHead) {
								oNewDocument.getContent = function() {
									return sNewFileFromHead;
								};
								return that._oContext.service.compare.compare(oNewDocument, sNewFileFromHead, sBaseFileFromHead,
									true);
							});
					}
				}).fail(function(oError) {
				that.callMessageDialog(oError);
			}).done();
		}
	}
});