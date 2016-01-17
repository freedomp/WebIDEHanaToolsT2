jQuery.sap.require("sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton");
jQuery.sap.require({
	modName: "sap.watt.ideplatform.plugin.gitclient.view.GitBase",
	type: "controller"
});
sap.watt.ideplatform.plugin.gitclient.view.GitBase.extend("sap.watt.ideplatform.plugin.gitclient.view.GitPane", {

	_i18n: undefined,
	_oRepositoryBrowserDocument: null,
	_GIT_STASH_SUPPORTED: "gitStashSupported",
    
    _DEFAULT_LOG_LOCATION: "from_pane",

	onInit: function() {
		var that = this;
		this._oContext = this.getView().getViewData().context;
		this._oMenuGroup = this.getView().getViewData().menuGroup;
		this._i18n = this._oContext.i18n;
	
		var oData = { 
				repositoryName: "",
				oEntity: undefined,
				isGit: false,
				isStashable: false,
				hasDataInStageTable : false,
				isStashAvailable : false,
				isGerrit: false,
				isRemoveBranch: false,
				isCommit: false,
				aBranches: [],
				isRebaseInteractive: false,
				isCherryPickingOrMerging: false,
				isConflict: false,
				remoteBranch: undefined,
				isContinue: false,
				sRepositoryCommitsStatus: "",
				isRevertAllEnabled: false,
				sCommitDescription: "",
				sBranchValue : "",
                isGerritSupported : true,
                isGitUserAndEmailSupported : true,
                isBranchSupport : true,
                isCompareSupport : true,
				results: []
		};
		var oModel = new sap.ui.model.json.JSONModel();
		oModel.setData({
			modelData: oData
		});
		this.getView().setModel(oModel);
		this.getView().bindElement("/modelData");
		this.getView()._oStageTable.setModel(new sap.ui.model.json.JSONModel(), "stageTableModel");
		this.animation = [];
		var oAnimationData = {
				PULL: false,
				FETCH: false,
				FETCHGERRIT: false,
				REBASE: false,
				RESET: false,
				CONTINUEOPERATION: false,
				SKIPOPERATION: false,
				ABORTOPERATION: false
		};
		this.getView().setModel(new sap.ui.model.json.JSONModel(oAnimationData), "animation");

		this._oContext.i18n.applyTo(this.getView()._oPanel);


        this._oContext.service.git.isFeatureSupported("compare").then(function(isCompareSupported) {
            if (!isCompareSupported)
            {
                oModel.setProperty('/modelData/isCompareSupport', false);
            }
        }).done();

        this._oContext.service.git.isFeatureSupported("gitBranches").then(function(isGitBranchesSupported) {
            if (!isGitBranchesSupported)
            {
                oModel.setProperty('/modelData/isBranchSupport', false);
            }
        }).done();

        this._oContext.service.git.isFeatureSupported("GitUserAndEmail").then(function(iGitUserAndEmailSupported) {
            if (!iGitUserAndEmailSupported)
            {
                oModel.setProperty('/modelData/isGitUserAndEmailSupported', false);
            }
        }).done();

		this._oContext.service.git.isFeatureSupported("Gerrit").then(function(isGerritSupported) {
			if (!isGerritSupported)
			{
				oModel.setProperty('/modelData/isGerritSupported', false);
			}
		}).done();
		
		this._oContext.service.git.isFeatureSupported(this._GIT_STASH_SUPPORTED).then(function(bGitStashSupported) {
			that.bGitStashSupported = bGitStashSupported;
			oModel.setProperty("/modelData/isStashable", that.bGitStashSupported);
		}).done();
	},

	_stageQueuePromis: new Q.sap.Queue(),

	_onCheckFile: function(oEvent) {
		var that = this;
		var oBindingContext = oEvent.getSource().getBindingContext("stageTableModel");
		var oFileBindingContext = oBindingContext.getModel().getProperty(oBindingContext.getPath());
		var oGit = oFileBindingContext.Git;
        oGit.update = oFileBindingContext.Status === "D";
		if (oEvent.getParameter('checked')) {
			this._stageQueuePromis.next(function() {
				return that._oContext.service.git.stageFile(oGit).then(function() {
					var bDuplicate = that._isDuplicateStagedFile(oBindingContext, oFileBindingContext);
					return Q((oFileBindingContext.Status === "C" || oFileBindingContext.Status === "U" || bDuplicate) ? that.updateStagingTable(true) :
						that.getDocument().then(function(oDocument) {
							return that._oContext.service.decoration.updateDecorations(oDocument, true);
						}));
				}).fail(function(oError) {
					that.callMessageDialog(oError);
				});
			});
		} else {
			this._stageQueuePromis.next(function() {
				return that._oContext.service.git.unStageFile(oGit).then(function() {
					var bDuplicate = that._isDuplicateStagedFile(oBindingContext, oFileBindingContext);
					return Q((bDuplicate || oFileBindingContext.Status === "N")? that.updateStagingTable(true) : that.getDocument().then(function(oDocument) {
						return that._oContext.service.decoration.updateDecorations(oDocument, true);
					}));
				}).fail(function(oError) {
					that.callMessageDialog(oError);
				});
			});
		}
	},

	_isDuplicateStagedFile: function(oBindingContext, oFileBindingContext) {
		var aStagingTableFiles = oBindingContext.getModel().getData().results;
		var iCount = 0;
		for (var i = 0; i < aStagingTableFiles.length; i++) {
			if (oFileBindingContext.Name === aStagingTableFiles[i].Name) {
				iCount++;
				if (iCount > 1) {
					return true;
				}
			}
		}
		return false;
	},

	_onBranchChange: function(oEvent) {
		var that = this;
		var oModel = this.getView().getModel();
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		if (!oEntity) {
			return;
		}
		var oGit = oEntity.getBackendData().git;
		var sBranchName = oEvent.getParameter('newValue');
		oModel.setProperty('/modelData/isGit', false);
		var oSource = oEvent.getSource();
		oSource.setEnabled(false);
		this._oContext.service.git.checkoutLocalBranch(oGit, sBranchName).then(function() { //TODO check if updateStagingTable in necessary
			return Q.all([that.updateStagingTable(true), that.updateUnsyncedCommits(), that._updatePushMenu()]).then(function() {
				oModel.setProperty('/modelData/isGit', true);
				oSource.setEnabled(true);
			});
		}).fail(
			function(oError) {
				if (oError.status === 409 || ( oError.status === 500 && oError.message.indexOf("Checkout conflict") > -1)) {
                    that._oContext.service.usernotification.alert(that._i18n.getText("i18n", "gitPane_switch_branch_failed_due_to_conflicts", [sBranchName])).done();
				} else {
					that.callMessageDialog(oError);
				}
				return that._doUpdateBranches();
			}).done();
	},

	_onCreateNewBranch: function() {
		var that = this;
		var oView = this.getView();
		var oEntity = oView.getModel().getProperty('/modelData/oEntity');
		if (!oEntity) {
			return;
		}
		var oModel = oView.getModel();
		oModel.setProperty('/modelData/isGit', false);
		oView.getNewBranchDialog().getController().open(oView.getModel().getProperty("/modelData/sBranchValue"), oEntity).then(function(bSuccess) {
			return Q(bSuccess ? Q.all([that.updateStagingTable(true), that.updateBranches()]) : that.updateBranches()).then(function() {
				oModel.setProperty('/modelData/isGit', true);
			});
		}).fail(function(oError) {
			return that._doUpdateBranches();
		}).done();
	},

	_onDeleteBranch: function() {
		var that = this;
		var oView = this.getView();
		oView.getDeleteBranchDialog().getController().open(oView.getModel().getProperty("/modelData/sBranchValue"),
				oView.getModel().getProperty('/modelData/oEntity'), oView.getModel().getProperty("/modelData/aBranches")).then(
						function(bSuccess) {
							if (bSuccess) {
								that.updateBranches();
							}
						}).done();
	},

	_onPull: function() {
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		this._oContext.service.gitdispatcher.pull(oEntity).done();
	},

	_onFetchFromUpstream: function() {
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		this._oContext.service.gitdispatcher.fetchFromUpstream(oEntity).done();
	},

	_onMerge: function() {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		var bGerrit = this.getView().getModel().getProperty('/modelData/isGerrit');
		this._setAnimation(oEntity, "MERGE", true);
		this._oContext.service.gitdispatcher.merge(oEntity, bGerrit).fin(function() {
			that._setAnimation(oEntity, "MERGE", false);
		}).done();
	},

	_onRebase: function() {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		this._setAnimation(oEntity, "REBASE", true);
		this._oContext.service.gitdispatcher.rebase(oEntity).fin(function() {
			that._setAnimation(oEntity, "REBASE", false);
		}).done();
	},

	_onContinue: function(oEvent) {
		var that = this;
		var sOperationName = oEvent.getSource().data("rebaseInteractive");
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		this._setAnimation(oEntity, sOperationName + "OPERATION", true);
		var oGit = oEntity.getBackendData().git;
        var bUserAndEmailSupport = that.getView().getModel().getProperty('/modelData/isGitUserAndEmailSupported');

        if ( bUserAndEmailSupport){
            oPromise =  that._oContext.service.gitdispatcher.verifyUserInfo(oEntity);
        }else{
            oPromise = Q();
        }

        oPromise.then(function(){
		//this._oContext.service.gitdispatcher.verifyUserInfo(oEntity).then(function() {
			return that._oContext.service.git.rebaseInteractive(oGit, sOperationName).then(function() {
				//continue OK
				that.getView().getModel().setProperty('/modelData/isRebaseInteractive', false);
				return that._oContext.service.git.getLocalBranches(oGit).then(function(aLocalBranches) {
					for (var i = 0; i < aLocalBranches.length; i++) {
						if (aLocalBranches[i].Current) {
							return that._oContext.service.git.commitAfterContinue(aLocalBranches[i], "HEAD");
						}
					}
				});
			}).fin(function() {
				that.updateBranches().done();
				that.updateStagingTable(true).done();
			});
		}).fail(function(oError) {
			if (oError) {
				that.callMessageDialog(oError);
			}
		}).fin(function() {
			that._setAnimation(oEntity, sOperationName + "OPERATION", false);
		}).done();
	},

     _onRebaseInteractiveAbort: function(oEvent){
       var sourceData = oEvent.getSource().data("rebaseInteractive");
        this._onRebaseInteractive(sourceData);
    },
    
    
    _onRebaseInteractiveSkipPatch: function(oEvent){
        var that = this;
        var sourceData = oEvent.getSource().data("rebaseInteractive");
 
        var confirmTitle = that._oContext.i18n.getText("i18n", "gitPane_confirm_skip_path");
        
        that._oContext.service.usernotification.confirm(confirmTitle).then(function(oResponse) {
			if (oResponse.bResult) {
			     that._onRebaseInteractive(sourceData);
			}
        }).done();
    },
    
	_onRebaseInteractive: function(sourceData) {
		var that = this;
	
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		this._setAnimation(oEntity, sourceData + "OPERATION", true);
		this._oContext.service.git.rebaseInteractive(oEntity.getBackendData().git, sourceData).then(function() {
			that.getView().getModel().setProperty('/modelData/isRebaseInteractive', false);
			//Need to update all the pane branches/unsynced commits/staging table
			that.updatePane(oEntity, true);
		}).fail(function(oError) {
			that.updateStagingTable(true).done();
			that.updateBranches().done();
			that.callMessageDialog(oError);
		}).fin(function() {
			that._setAnimation(oEntity, sourceData + "OPERATION", false);
		}).done();

	},

	_onReset: function() {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		var oModel = this.getView().getModel();
		this._setAnimation(oEntity, "RESET", true);
		this._oContext.service.gitdispatcher.reset(oEntity,
				oModel.getProperty('/modelData/isRebaseInteractive') || oModel.getProperty('/modelData/isCherryPickingOrMerging')).fin(
						function() {
							that._setAnimation(oEntity, "RESET", false);
						}).done();
	},

	_onFetchFromGerrit: function() {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		that._setAnimation(oEntity, "FETCHGERRIT", true);
		this._oContext.service.gitdispatcher.fetchFromGerrit(oEntity).fail(function(oError) {
			that.callMessageDialog(oError);
			return that._doUpdateBranches();
		}).fin(function() {
			that._setAnimation(oEntity, "FETCHGERRIT", false);
			that.getDocument().then(function(oDocument) {
				return that._oContext.service.decoration.updateDecorations(oDocument, true);
			});
		}).done();
	},

	_setAnimation: function(oEntity, sOperation, bValue) {
		if (!oEntity || !sOperation) { // || typeof bValue !== "boolean" ???
			return;
		}
		var oAminationModel = this.getView().getModel("animation");
		oAminationModel.setProperty("/" + sOperation, bValue);
		if (!this.animation[oEntity.getName()]) {
			this.animation[oEntity.getName()] = [];
		}
		this.animation[oEntity.getName()][sOperation] = bValue;
	},

	_onStageTableRowDoubleClick: function(oEvent) {
		var that = this;
		var oControl = jQuery(oEvent.target).control()[0];

        if (that.getView().getModel().getProperty("/modelData/isCompareSupport")) {
            if (oControl.getModel("stageTableModel") && oControl.getBindingContext("stageTableModel") && oControl.getBindingContext(
                    "stageTableModel").getPath) {
                var oSelectedRowModel = oControl.getModel("stageTableModel").getProperty(oControl.getBindingContext("stageTableModel").getPath());
                if (oSelectedRowModel.Status === "M" || oSelectedRowModel.Status === "C") {
                    var sFileName = oSelectedRowModel.Path;
                    var bStaged = oSelectedRowModel.Stage;

                    this._oContext.service.filesystem.documentProvider.getDocument(
                        URI(that.getView().getModel().getProperty("/modelData/oEntity").getFullPath() + "/" + sFileName).toString()).then(
                        function (oNewFileDocument) {
                            return that._oContext.service.gitdispatcher.openCompareEditor(oNewFileDocument, bStaged, oSelectedRowModel.Status === "C");
                        }).fail(function (oError) {
                            that.callMessageDialog(oError);
                        }).done();
                }

            }
        }
	},

	_onStageTableRowContext: function(oEvent) {
		var that = this;
		var oElement = oEvent.target;

		oEvent.preventDefault();

		while (oElement && !oElement.attributes.id) {
			oElement = oElement.parentElement;
		}
		if (oElement && oElement.attributes && oElement.attributes.id) {
			var oStagingTableRow = sap.ui.getCore().byId(oElement.attributes.id.value);
			if (oStagingTableRow && oStagingTableRow.getBindingContext("stageTableModel")) {
				var oStagingTableRowData = oStagingTableRow.getModel("stageTableModel").getProperty(oStagingTableRow.getBindingContext(
				"stageTableModel").getPath());
				that._oContext.service.filesystem.documentProvider.getDocument(
						URI(that.getView().getModel().getProperty("/modelData/oEntity").getFullPath() + "/" + oStagingTableRowData.Name).toString()).then(
								function(oStagingTableDocument) {
									//change selection of document in gitclient, open context, menu to delete file if asked
									return that._oContext.service.gitclient.setSelection({
									    stageTableRow: oStagingTableRowData,
									    document: oStagingTableDocument
									}).then(function() {
										return that._oContext.service.contextMenu.open(that._oMenuGroup, oEvent.pageX, oEvent.pageY);
									});
								}).fail(function(oError) {
									that.callMessageDialog(oError);
								}).done();

			}
		}
	},

	_onDiscardAll: function() {
		var that = this;
		var oGit = this.getView().getModel().getProperty('/modelData/oEntity').getBackendData().git;
		var oTable = this.getView()._oStageTable;

		var aItems = oTable.getModel("stageTableModel").oData.results;
		var aPaths = [];
		for (var i = 0; i < aItems.length; i++) {
			if (!aItems[i].Stage) {
				aPaths.push(aItems[i].Name);
			}
		}

		this.callConfirmationDialog(this._i18n.getText("i18n", "gitDispatcher_resetInRebaseInteractiveConfirmation", ["\n\n"])).then(
				function(bResult) {
					if (bResult) {
						var oModel = that.getView().getModel();
						oModel.setProperty('/modelData/isGit', false);
						return that._stageQueuePromis.next(function() {
							that._oContext.service.git.discardFiles(oGit, aPaths).then(function() {
								return that.updateStagingTable(true).then(function() {
									oModel.setProperty('/modelData/isGit', true);
								});
							}).fail(function(oError) {
								that.callMessageDialog(oError);
							});
						});
					}
				}).fail(function(oError) {
					that.callMessageDialog(oError);
				}).done();
	},

	_onRevertFile: function(oEvent) {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		var oGit = oEntity.getBackendData().git;
		var oBindingContext = oEvent.getSource().getBindingContext("stageTableModel");
		var oModel = oBindingContext.getModel();
		this._oContext.service.usernotification.confirm(
				that._oContext.i18n.getText("i18n", "gitDispatcher_resetInRebaseInteractiveConfirmation", ["\n\n"])).then(
						function(oResponse) {
							if (oResponse.bResult) {
								that._stageQueuePromis.next(function() {
									return that._oContext.service.git.discardFiles(oGit, [oModel.getProperty(
											oBindingContext.getPath()).Name]).then(function() {
												return that.updateStagingTable(true);
											}).fail(function(oError) {
												that.callMessageDialog(oError);
											});
								});
							}
						}).fail(function(oError) {
							that.callMessageDialog(oError);
						}).done();
	}, 

	_onTextAreaChange: function(oEvent) {
		var oGitPaneModel = this.getView().getModel();
		oGitPaneModel.setProperty('/modelData/isCommit', oEvent.getParameter("liveValue") !== "" && !oGitPaneModel.getProperty(
		'/modelData/isConflict'));
	},



	_onCommit: function(oEvent) {
		var that = this;
		//1. get git url from the get repository
		var bAmend = this.getView()._oAmendCheckBox.getChecked();
		var sLogAction = oEvent === "CommitAndPush" ? "commit and push" : "commit";
		var oModel = this.getView().getModel();
		var sMessage = oModel.getProperty('/modelData/sCommitDescription'); //TODO verify input before commit
		var bChangeId = oModel.getProperty('/modelData/isGerrit');
		var oEntity = oModel.getProperty('/modelData/oEntity');
		var oGit = oModel.getProperty('/modelData/oEntity').getBackendData().git;
        var bUserAndEmailSupport = oModel.getProperty('/modelData/isGitUserAndEmailSupported');

		var fnCommit = function() {
            var oPromise;
            if ( bUserAndEmailSupport){
                oPromise =  that._oContext.service.gitdispatcher.verifyUserInfo(oEntity);
            }else{
                oPromise = Q();
            }
            return oPromise.then(function(oUserInfo){
                return that._oContext.service.git.commit(oGit, sMessage, oUserInfo, bAmend, bChangeId).then(function() {
                    that._resetAmendState();
                    that._oContext.service.usagemonitoring.report("git", sLogAction, that._DEFAULT_LOG_LOCATION).done();
                    return Q.all([that.updateStagingTable(true), that.updateUnsyncedCommits()]);
                });

            });


		};

		if (oEvent === "CommitAndPush") {
			return fnCommit();
		} else {
			oModel.setProperty('/modelData/isGit', false);
			fnCommit().fail(function(oError) {
				if (oError) {
					that.callMessageDialog(oError);
				}
			}).fin(function() {
				oModel.setProperty('/modelData/isGit', true);
			}).done();
		}
	},

	_onStash: function() {
		var oModel = this.getView().getModel();
		var oEntity = oModel.getProperty('/modelData/oEntity');
		this._oContext.service.gitdispatcher.stash(oEntity).done();
	},

	_onUseStash: function() {
		var that = this;
		var oModel = this.getView().getModel();
		var oEntity = oModel.getProperty('/modelData/oEntity');
		that._setAnimation(oEntity, "USESTASH", true);
		this._oContext.service.gitdispatcher.useStash(oEntity).fin(
				function() {
					that._setAnimation(oEntity, "USESTASH", false);
				}).done();
	},

	_resetAmendState: function() {
		this.getView().getModel().setProperty('/modelData/sCommitDescription', "");
		this.getView()._oAmendCheckBox.setChecked(false);
	},

	_onAmendChecked: function(oEvent) {
		var oModel = this.getView().getModel();
		if (oEvent.getParameter('checked')) {
			var that = this;
			var oGit = oModel.getProperty('/modelData/oEntity').getBackendData().git;
			// get last commit
			this._oContext.service.git.getLastCommit(oGit).then(function(oLastCommit) {
				that.getView().getModel().setProperty('/modelData/sCommitDescription', oLastCommit.Message);
				oModel.setProperty('/modelData/isCommit', true);
			}).fail(function(oError) {
				that.callMessageDialog(oError);
			}).done();
			//TODO save the last commit in the model?? consider branch switching
		} else {
			// clear message box
			oModel.setProperty('/modelData/isCommit', false);
			this.getView().getModel().setProperty('/modelData/sCommitDescription', "");
		}
	},

	_onPushTo: function(oEvent) {
		this._onInternalPush("pushTo");
	},

	_onPush: function() {
		this._onInternalPush("push");
	},

	_onInternalPush : function(dispatcherPushFunctionName){
		var that = this;
		var oModel =  this.getView().getModel();
		var oEntity = oModel.getProperty('/modelData/oEntity');
		var bTag = true;
		this._oContext.service.gitdispatcher[dispatcherPushFunctionName].call(that, oEntity, oModel.getProperty('/modelData/isGerrit'), null, bTag).done();
	},


	_onCommitAndPush: function(oEvent) {
		var that = this;
		var sPushType = oEvent.getSource().data().commitAndPush;
		var oModel = this.getView().getModel();

		oModel.setProperty('/modelData/isGit', false);
		this._onCommit("CommitAndPush").then(function() {
			oModel.setProperty('/modelData/isGit', true);
			if (sPushType === "push") {
				return that._onPush();
			} else {
				return that._onPushTo();
			}
		}).fail(function(oError) {
			if (oError) {
				that.callMessageDialog(oError);
			}
		}).done();
	},

	_registerChildren: function(oParent) {
		var that = this;
		var oGit = this.getView().getModel().getProperty('/modelData/oEntity').getBackendData().git;
		var oTable = this.getView()._oStageTable;
		var aChildren = oTable.getRows();
		var aItems = oTable.getModel("stageTableModel").getData().results;
		var oModel = this.getView().getModel();
		var nSelectedChildren = 0;

		//update the current status
		for (var i = 0; i < aItems.length; i++) {
			if (aItems[i].Stage) {
				nSelectedChildren++;
			}
		}
		if (nSelectedChildren === 0) {
			oParent.toggle("Unchecked");
			oModel.setProperty('/modelData/isRevertAllEnabled', true);
		} else if (nSelectedChildren === aItems.length) {
			oParent.toggle("Checked");
			oModel.setProperty('/modelData/isRevertAllEnabled', false);
		} else {
			oParent.toggle("Mixed");
			oModel.setProperty('/modelData/isRevertAllEnabled', true);
		}

		//add handler to the cells
		for (var i = 0; i < aChildren.length; i++) {
			aChildren[i].getCells()[2].attachChange(function() {
				this.getChecked() ? nSelectedChildren++ : nSelectedChildren--;
				if (nSelectedChildren === 0) {
					oParent.toggle("Unchecked");
					oModel.setProperty('/modelData/isRevertAllEnabled', true);
				} else if (nSelectedChildren === aItems.length) {
					oParent.toggle("Checked");
					oModel.setProperty('/modelData/isRevertAllEnabled', false);
				} else {
					oParent.toggle("Mixed");
					oModel.setProperty('/modelData/isRevertAllEnabled', true);
				}
			});
		}
		if (this._fnHandler){
			oParent.detachChange(this._fnHandler);
		}
		
		this._fnHandler = function() {
			if (this.getSelectionState() === "Checked") {
				nSelectedChildren = aItems.length;
				var bConflicted = false;
				var bUntracked = false;
				var aPaths = [];
				//mark all as staged
				for (var i = 0; i < aItems.length; i++) {
					aPaths.push(aItems[i].Name);
					aItems[i].Stage = true;
					if (aItems[i].Status === "C") {
						bConflicted = true;
					}
					if (aItems[i].Status === "U") {
						bUntracked = true;
					}
				}

				//stageAll
				that._stageQueuePromis.next(function() {
					return that._oContext.service.git.stageMultipleFiles(oGit, aPaths).then(function() {
						return Q((bConflicted || bUntracked)? that.updateStagingTable(true) :
							that.getDocument().then(function(oDocument) {
								return that._oContext.service.decoration.updateDecorations(oDocument, true);
							}));
					}).fail(function(oError) {
						that.callMessageDialog(oError);
					});
				});
				oModel.setProperty('/modelData/isRevertAllEnabled', false);
			} else {
				nSelectedChildren = 0;
				var bNew = false;
				for (var i = 0; i < aItems.length; i++) {
					aItems[i].Stage = false;
					if (aItems[i].Status === "N") {
						bNew = true;
					}
				}
				//unstageAll
				that._stageQueuePromis.next(function() {
					return that._oContext.service.git.unstageAll(oGit).then(function() {
						return Q(bNew ? that.updateStagingTable(true) :
							that.getDocument().then(function(oDocument) {
							return that._oContext.service.decoration.updateDecorations(oDocument, true);
						}));
					}).fail(function(oError) {
						that.callMessageDialog(oError);
					});
				});
				oModel.setProperty('/modelData/isRevertAllEnabled', true);
			}

			oTable.getModel("stageTableModel").setData({
				results: aItems
			});
		};

		oParent.attachChange(this._fnHandler);
	},

	_isSelectionChanged: function(oEntity) {
		return oEntity === this.getView().getModel().getProperty("/modelData/oEntity");
	},

	_doUpdateBranches: function() {
		var oModel = this.getView().getModel();
		oModel.setProperty('/modelData/isGit', false);
		return this.updateBranches().then(function() {
			oModel.setProperty('/modelData/isGit', true);
		});
	},

	updatePane: function(oEntity, bForce) {
		var oModel = this.getView().getModel();
		var that = this;
		oModel.setProperty('/modelData/isGit', false);
		this._updateAnimatedButtons(oEntity);
		Q.all([this._updateMainPane(oEntity), this.updateStagingTable(bForce), this.updateBranches(), this._updatePushMenu()]).spread(
				function(bMainPane, bStating, bBrnaches) {
					if (that._isSelectionChanged(oEntity)) {
						oModel.setProperty('/modelData/isGit', true);
					}
				}).fail(function(oError) {
					that.callMessageDialog(oError);
				}).done();
	},
	
	_isStashSupportedInternal: function(oGit){
		if (!this.bGitStashSupported){
			return Q(false);
		}
		
		return this._oContext.service.git.isStashSupported(oGit).then(function(bStashSupported){
			return Q(bStashSupported);
		});
	},

	_updateMainPane: function(oEntity) {
		var that = this;
		// update main model
		var oModel = this.getView().getModel();
		oModel.setProperty('/modelData/repositoryName', oEntity.getName());
		oModel.setProperty('/modelData/oEntity', oEntity);
		oModel.setProperty('/modelData/isGerrit', false);
		oModel.setProperty('/modelData/isRebaseInteractive', false);
		oModel.setProperty('/modelData/isCherryPickingOrMerging', false);

		var oGit = oEntity.getBackendData().git;
		return that._isStashSupportedInternal(oGit).then(function(bStashSupported){
			oModel.setProperty('/modelData/isStashable', bStashSupported);

			that._resetAmendState();
			// update createchangeid
			return that._oContext.service.git.getRepositoryConfigurations(oGit).then(function(aSettings) {
				if (!that._isSelectionChanged(oEntity)) {
					return;
				}
				for (var i = 0; i < aSettings.length; i++) {
					var bIsGerrit;
					if (aSettings[i].Key === "gerrit.createchangeid") {
						if ( typeof aSettings[i].Value === "string"){
							bIsGerrit = aSettings[i].Value === "true";
						}else if (aSettings[i].Value.constructor === Array)  {
							bIsGerrit = aSettings[i].Value[0] === "true";
						}

						oModel.setProperty('/modelData/isGerrit', bIsGerrit);
						break;
					}
				}
			}).fail(function(oError) {
				that.callMessageDialog(oError);
			});
		});
	},

	updateStagingTable: function(bForce, aStagingTableFiles) {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		if (!oEntity) {
			return Q();
		}
		//update staging table
		return Q(aStagingTableFiles ? aStagingTableFiles : that._oContext.service.gitclient.getStatus(oEntity, bForce)).then(function(
				oResponse) {
			if (!that._isSelectionChanged(oEntity)) {
				return Q();
			}
			var oStageTable = that.getView()._oStageTable;

			oStageTable.getModel("stageTableModel").setData({
				results: oResponse
			});

			/*if (!aStagingTableFiles) {
				oStageTable.bindRows("stageTableModel>/results");
				oStageTable.sort(oStageTable.getColumns()[1]);
			}*/
			that.getView()._oStageAllCheckBox.setSelectionState("Unchecked");
			if (oResponse.length > 0) {
				that._registerChildren(that.getView()._oStageAllCheckBox);
			} else {
				that.getView().getModel().setProperty('/modelData/isRevertAllEnabled', false);
			}
			that.getView().getModel().setProperty("/modelData/hasDataInStageTable", oResponse.length > 0);
			that._handleRepositoryState(oEntity.getName(), oResponse);
			
			if (that.bGitStashSupported){
				that._oContext.service.git.isStashSupported(oEntity.getBackendData().git).then(function(bStashSupported){
					if (bStashSupported){
						that._oContext.service.gitdispatcher.isStashAvailable(oEntity).then(function(bStashAvailable){
							that.getView().getModel().setProperty('/modelData/isStashAvailable', bStashAvailable);
						}).done();
					}
				}).done();
			}

			if (bForce) {
				return that.getDocument().then(function(oDocument) {
					return that._oContext.service.decoration.updateDecorations(oDocument, true);
				});
			}
		}).fail(function(oError) {
			that.callMessageDialog(oError);
		});
	},

	_handleRepositoryState: function(sRepositoryName, oResponse) {
		//handle repository name
		var oGitPaneModel = this.getView().getModel();
		var that = this;
		var fnSetMergeInConflictOrCherryPickInConflict = function() {
			oGitPaneModel.setProperty('/modelData/repositoryName', that._i18n.getText("i18n", "gitPane_Conflicts", [sRepositoryName]));
			oGitPaneModel.setProperty('/modelData/isCherryPickingOrMerging', true);
			oGitPaneModel.setProperty('/modelData/isCommit', false);
			oGitPaneModel.setProperty('/modelData/isConflict', true);
			oGitPaneModel.setProperty('/modelData/isRevertAllEnabled', false);
		};
		var fnSetMergeResolvedOrCherryPickResolved = function() {
			oGitPaneModel.setProperty('/modelData/repositoryName', that._i18n.getText("i18n", "gitPane_Merged", [sRepositoryName]));
			oGitPaneModel.setProperty('/modelData/isCherryPickingOrMerging', true);
			oGitPaneModel.setProperty('/modelData/isCommit', !!oGitPaneModel.getProperty('/modelData/sCommitDescription'));
			oGitPaneModel.setProperty('/modelData/isConflict', false);
		};
		switch (oResponse.repositoryState) {
		case "RebaseInProgress":
			oGitPaneModel.setProperty('/modelData/repositoryName', this._i18n.getText("i18n", "gitPane_Rebase_in_progress", [sRepositoryName]));
			oGitPaneModel.setProperty('/modelData/isRebaseInteractive', true);
			oGitPaneModel.setProperty('/modelData/isCommit', false);
			oGitPaneModel.setProperty('/modelData/isConflict', true);
			oGitPaneModel.setProperty('/modelData/isRevertAllEnabled', false);
			var bContinue = true;
			for (var i = 0; i < oResponse.length; i++) {
				var oFileResponse = oResponse[i];
				if (oFileResponse.Status === 'C') {
					bContinue = false;
					break;
				}
				if (oFileResponse.Stage) {
					bContinue = true;
				}
			}
			oGitPaneModel.setProperty('/modelData/isContinue', bContinue);
			break;
		case "MergeInConflict":
			fnSetMergeInConflictOrCherryPickInConflict();
			break;
		case "CherryPickInConflict":
			oGitPaneModel.setProperty('/modelData/sCommitDescription', oResponse.CherryPickCommitDescription);
			fnSetMergeInConflictOrCherryPickInConflict();
			break;
		case "CherryPickResolved":
			oGitPaneModel.setProperty('/modelData/sCommitDescription', oResponse.CherryPickCommitDescription);
			fnSetMergeResolvedOrCherryPickResolved();
			break;
		case "MergeResolved":
			fnSetMergeResolvedOrCherryPickResolved();
			break;

		default:
			//SAFE status
			oGitPaneModel.setProperty('/modelData/repositoryName', sRepositoryName);
			oGitPaneModel.setProperty('/modelData/isRebaseInteractive', false);
			oGitPaneModel.setProperty('/modelData/isCherryPickingOrMerging', false);
			oGitPaneModel.setProperty('/modelData/isConflict', false);
			oGitPaneModel.setProperty('/modelData/isCommit', !!oGitPaneModel.getProperty('/modelData/sCommitDescription'));
		}
	},

	updateUnsyncedCommits: function() {
		var that = this;
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		if (!oEntity) {
			return Q();
		}
		var oModel = this.getView().getModel();
		return this._oContext.service.git.getCommitsCount(oEntity.getBackendData().git).then(function(oCount) {
			var sIncoming = oCount.Incoming ? String.fromCharCode(8595) + oCount.Incoming : ""; //↑
			var sOutgoing = oCount.Outgoing ? String.fromCharCode(8593) + oCount.Outgoing : ""; //↓
			var sName = sOutgoing + "  " + sIncoming;
			oModel.setProperty('/modelData/sRepositoryCommitsStatus', sName);
		}).fail(function(oError) {
			that.callMessageDialog(oError);
		});
	},

	updateBranches: function(bOnlyBranches) {
		var that = this;
		var oModel = this.getView().getModel();
		// update branches dropdown
		var oEntity = this.getView().getModel().getProperty("/modelData/oEntity");
		if (!oEntity) {
			return;
		}
		oModel.setProperty("/modelData/results", []);
		oModel.setProperty("/modelData/sBranchValue", "");
		var oGit = oEntity.getBackendData().git;

		return this._oContext.service.git.getLocalBranches(oGit).then(function(oResponse) {
			if (!that._isSelectionChanged(oEntity)) {
				return;
			}
			oModel.setProperty("/modelData/aBranches", oResponse);

			that.getView().getModel().setProperty("/modelData/isRemoveBranch", oResponse.length > 1);
			//update the push menu in case of fetch from gerrit
			var aRequests = [that._oContext.service.git.getCurrentBranchName(oResponse), that._updatePushMenu(oResponse)];
			if (!bOnlyBranches) {
				aRequests.push(that.updateUnsyncedCommits());
			}
			return Q.all(aRequests).spread(function(sBranchName) {
				if (!that._isSelectionChanged(oEntity)) {
					return;
				}
				if (sBranchName) {
					oModel.setProperty("/modelData/results", oResponse);
					oModel.setProperty("/modelData/sBranchValue", sBranchName);

				}
			});

		}).fail(function(oError) {
			that.callMessageDialog(oError);
			return that._doUpdateBranches();
		});
	},

	_updatePushMenu: function(aLocalBranches) {
		var that = this;
		var oModel = this.getView().getModel();
		var oEntity = this.getView().getModel().getProperty('/modelData/oEntity');
		if (!oEntity) {
			return;
		}
		var oGit = oEntity.getBackendData().git;
		return Q(aLocalBranches ? aLocalBranches : this._oContext.service.git.getLocalBranches(oGit)).then(
				function(aBranches) {
					//TODO use getRemoteBranchOfCurrent from git.js
					return that._oContext.service.git.getRemoteBranchOfCurrent(aBranches).then(function(sBranchName) {
						oModel.setProperty("/modelData/remoteBranch", sBranchName);
					});
				});

	},

	_updateAnimatedButtons: function(oEntity) {
		var oAnimationModel = this.getView().getModel("animation");
		var bEntity = !!oEntity && !!this.animation[oEntity.getName()];
		oAnimationModel.setProperty("/PULL", bEntity && !!this.animation[oEntity.getName()]["PULL"]);
		oAnimationModel.setProperty("/REBASE", bEntity && !!this.animation[oEntity.getName()]["REBASE"]);
		oAnimationModel.setProperty("/RESET", bEntity && !!this.animation[oEntity.getName()]["RESET"]);
		oAnimationModel.setProperty("/FETCH", bEntity && !!this.animation[oEntity.getName()]["FETCH"]);
		oAnimationModel.setProperty("/FETCHGERRIT", bEntity && !!this.animation[oEntity.getName()]["FETCHGERRIT"]);
		oAnimationModel.setProperty("/CONTINUEOPERATION", bEntity && !!this.animation[oEntity.getName()]["CONTINUEOPERATION"]);
		oAnimationModel.setProperty("/SKIPOPERATION", bEntity && !!this.animation[oEntity.getName()]["SKIPOPERATION"]);
		oAnimationModel.setProperty("/ABORTOPERATION", bEntity && !!this.animation[oEntity.getName()]["ABORTOPERATION"]);
	},

	getDocument: function() {
		var oEntity = this.getView().getModel().getProperty("/modelData/oEntity");
		if (!oEntity) {
			return Q();
		}
		return this._oContext.service.filesystem.documentProvider.getDocument(oEntity.getFullPath());
	},

	cleanPane: function() {
		var oView = this.getView();
		var oModel = oView.getModel();
		oModel.setProperty('/modelData/oEntity', null);
		oModel.setProperty('/modelData/isGit', false);
		oModel.setProperty('/modelData/isStashable', false);
		oModel.setProperty('/modelData/hasDataInStageTable', false);
		oModel.setProperty('/modelData/isStashAvailable', false);
		oModel.setProperty('/modelData/repositoryName', "");
		oModel.setProperty('/modelData/isRebaseInteractive', false);
		oModel.setProperty('/modelData/sRepositoryCommitsStatus', "");
		oModel.setProperty('/modelData/isCherryPickingOrMerging', false);
		oModel.setProperty('/modelData/isRevertAllEnabled', false);
		oModel.setProperty('/modelData/isConflict', false);
		oModel.setProperty("/modelData/isCommit", false);
		oModel.setProperty("/modelData/results", []);
		oModel.setProperty("/modelData/sBranchValue", "");
		this._updateAnimatedButtons();
		var oStageTable = oView._oStageTable;
		
		oStageTable.getModel("stageTableModel").setData({
				results: null
		});
		
		oModel.setProperty('/modelData/sCommitDescription', "");
	}
});
