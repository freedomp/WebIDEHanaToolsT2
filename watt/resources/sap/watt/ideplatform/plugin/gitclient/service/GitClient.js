define(
		["sap/watt/common/plugin/platform/service/ui/AbstractPart"],
	function(AbstractPart) {
		"use strict";

		var GitClient = AbstractPart.extend("sap.watt.ideplatform.plugin.gitclient.service.GitClient", {
			_oGitPaneView: undefined,
			_oSelectedDocument: undefined,
			_oContextMenuGroup: undefined,
			_oSelectedStageTableRow: undefined,
			_mStatus: {},
			_mDefer: {},

			init: function() {},

			configure: function(mConfig) {
				var that = this;

				return AbstractPart.prototype.configure.apply(this, arguments).then(function() {
					if (that._aStyles) {
						that.context.service.resource.includeStyles(that._aStyles).done();
					}
					if (mConfig.contextMenu) {
						return that.context.service.commandGroup.getGroup(mConfig.contextMenu).then(function(oGroup) {
							that._oContextMenuGroup = oGroup;
						});
					}
				});
			},

			getFocusElement: function() {
				return this.getContent();
			},

			getSelection: function() {
				var that = this;
				//This doesn't work on the staging table in case of a deleted file.
				//If we'd liek to enable any command on a deleted file we will need 
				//to change this and not check the document.
				if (that._oSelectedDocument && that._oSelectedStageTableRow) {
					return [{
                        stageTableRow: that._oSelectedStageTableRow,
                        document: that._oSelectedDocument
					}];
				}
				return [];
			},

			setSelection: function(oObject) {
				this._oSelectedStageTableRow = oObject.stageTableRow;
				this._oSelectedDocument = oObject.document;
			},

			getContent: function() {
				var that = this;
				if (!this._oGitPaneView) {
					this._oGitPaneView = sap.ui.view({
						viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitPane",
						type: sap.ui.core.mvc.ViewType.JS,
						viewData: {
							context: this.context,
							menuGroup: this._oContextMenuGroup
						}
					});
				}
				return that._oGitPaneView;
			},

			onAfterSetSelection: function(oEvent) {
				var oOwner = oEvent.params.owner;
				var aSelection = oEvent.params.selection;
				if (oOwner && (oOwner === this.context.service.repositorybrowser || oOwner.instanceOf("sap.watt.common.service.editor.Editor")) && aSelection){
				    if (aSelection.length > 1 && !this._analyzeMultiSelect(aSelection)){
				        this._oSelectedDocument = null;
				        this._oSelectedStageTableRow = null;
			            return;
				    }
				    if (aSelection[0] && aSelection[0].document && aSelection[0].document.getEntity().getBackendData()) {
					    this.doUpdate(aSelection[0].document, false);
				    }
				}
			},
			
			_analyzeMultiSelect: function (aSelection) {
			    var bRes = false;
		        var lastGit = null;
		        for (var i = 0; i < aSelection.length; i ++) {
		        	if (aSelection[i] && aSelection[i].document && aSelection[i].document.getEntity()){
		        	    if (i === 0){
                            lastGit = aSelection[i].document.getEntity().getBackendData() ? aSelection[i].document.getEntity().getBackendData().git : lastGit;
                            bRes = true;
		        	        continue;
		        	    }
		        	    var bNeedClean =  aSelection[i].document.getEntity().getBackendData().git && !lastGit;
		        	    bNeedClean = bNeedClean || (!aSelection[i].document.getEntity().getBackendData().git && lastGit);
		        	    if (aSelection[i].document.getEntity().getBackendData().git && lastGit){
		        	        bNeedClean =  aSelection[i].document.getEntity().getBackendData().git.CloneLocation !== lastGit.CloneLocation;
		        	    }
		        	    if (bNeedClean){
		        	        if (this.isVisible() && this._oGitPaneView){
							    this._oGitPaneView.getController().cleanPane();
		        	        }
							return false;
		        	    }
		        	}
		        }
		        return bRes;
			},

			onAfterStatusChanged: function(oEvent) {
			    if (oEvent.name === "externalChanged" && oEvent.params.operation !== "import") {
			        return; // externalChanged event should be handled only if it was fired by import service
			    }

				if (oEvent && oEvent.params && oEvent.params.document && oEvent.params.document.getEntity().getBackendData()) {
					var oDocument = oEvent.params.document;
					if (!oDocument.getEntity || oDocument.getEntity().isRoot()) {
						return;
					}
					var that = this;
				
					// avoid performing git status on delete on root project
					// If not root project (module), perform gist status
				    oDocument.getParent().then(function(parent) {
				    	var parentRoot = parent.getEntity().isRoot();

				    	//check if a repository was deleted
						if (oEvent.name === "deleted" && oDocument.getEntity().getBackendData().git && oDocument.isProject() && parentRoot) {
							this._oSelectedDocument = null;
							this._oSelectedStageTableRow = null;
							if (this._oGitPaneView) {
								this._oGitPaneView.getController().cleanPane();
							}
						} else {
							//git repository
							oDocument.getProject().then(function(oProjectDocument) {
								if (!oProjectDocument || !oProjectDocument.getEntity().getBackendData().git) {
									return;
								}
								if (that.isVisible() && that._oGitPaneView) {
									return that._oGitPaneView.getController().updateStagingTable(true);
								} else {
									return that.getStatus(oProjectDocument.getEntity(), true).then(function() {
										return Q(oEvent.name === "deleted" ? oDocument.getParent() : oDocument).then(function(oDocToStartDecorate) {
											return that._updateChain(oDocToStartDecorate, oEvent);
										});
									});
								}
							}).done();
						}
				    });
				}
			},

			isAvailable: function(oDocument) {
				//git repository
				if (!oDocument.getEntity) {
					return;
				}

				return oDocument.getProject().then(function(oProjectDocument) {
					if (!oProjectDocument) {
						return false;
					}
					return !!oProjectDocument.getEntity().getBackendData().git;
				});
			},

			isEnabled: function(aSelection) {
			    var bRes = this._analyzeMultiSelect(aSelection);
			    if (!bRes){
			        return false;
			    }
				if (this._oGitPaneView) {
				    
					var oModel = this._oGitPaneView.getModel();
					return !(oModel.getProperty('/modelData/isRebaseInteractive') || oModel
						.getProperty('/modelData/isCherryPickingOrMerging'));
				}
				return bRes;
			},

			doUpdate: function(oDocument, bForce) {
				oDocument = oDocument || this._oSelectedDocument;
				var that = this;
				//The document can be null in case of calling by Open command
				if (!(oDocument && oDocument.getEntity)) {
					return;
				}
				//git repository
				oDocument.getProject().then(function(oProjectDocument) {
					var bVisible = that.isVisible();
					//TODO check the dao differently
					if (!oProjectDocument || oProjectDocument.getEntity().getDAO() !== "workspace" || (oProjectDocument === that._oSelectedDocument &&
						!bForce)) {
						return;
					}
					if (!oProjectDocument.getEntity().getBackendData().git) {
						that._oSelectedDocument = null;
						that._oSelectedStageTableRow = null;
						if (bVisible && that._oGitPaneView) {
							that._oGitPaneView.getController().cleanPane();
						}
						return;
					}
					that._oSelectedDocument = oProjectDocument;
					if (bVisible && that._oGitPaneView) {
						that._oGitPaneView.getController().updatePane(oProjectDocument.getEntity(), bForce);
					}
				}).done();
			},

			updateUnsyncedCommits: function(oEvent) {
				var that = this;
				if (this.isVisible() && this._oGitPaneView) {
					this._oGitPaneView.getModel().setProperty('/modelData/isGit', false);
					this._oGitPaneView.getController().updateUnsyncedCommits(oEvent).then(function() {
						that._oGitPaneView.getModel().setProperty('/modelData/isGit', true);
					}).done();
				}
			},

			updateUnsyncedCommitsAndRefresh: function(oEvent) {
				var that = this;
				var sMessage = oEvent.params && oEvent.params.message ? oEvent.params.message : ""; 
				if (this.isVisible() && this._oGitPaneView) {
					this._oGitPaneView.getModel().setProperty('/modelData/isGit', false);
					this._oGitPaneView.getController().updateUnsyncedCommits(oEvent).then(function() {
					that._oGitPaneView.getModel().setProperty('/modelData/isGit', true);
					    if (sMessage) {
							that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n",
								sMessage, true)).done();
						}
					}).done();
				}
			},

			updateStagingTableAndUnsyncedCommitsAndRefresh: function(oEvent) {
				var that = this;
				var aPromisses = [];
				var bPane = this.isVisible() && this._oGitPaneView;
				if (bPane) {
					this._oGitPaneView.getModel().setProperty('/modelData/isGit', false);
					aPromisses.push(this._oGitPaneView.getController().updateUnsyncedCommits());
					aPromisses.push(this._oGitPaneView.getController().updateStagingTable(true));
				}
				Q.all(aPromisses).spread(function() {
					if (bPane) {
						that._oGitPaneView.getModel().setProperty('/modelData/isGit', true);
					}
				// 	return that.context.service.repositorybrowser.refresh().then(function() {
						return that._updateDecoration();
				// 	});
				}).done();

			},

			updateBranches: function(oEvent) {
				var that = this;
				var sMessage = oEvent.params && oEvent.params.message ? oEvent.params.message : "";
				if (this.isVisible() && this._oGitPaneView) {
					this._oGitPaneView.getModel().setProperty('/modelData/isGit', false);
					this._oGitPaneView.getController().updateBranches().then(function() {
						that._oGitPaneView.getModel().setProperty('/modelData/isGit', true);
						if (sMessage) {
							that.context.service.usernotification.liteInfo(that.context.i18n.getText("i18n",
								sMessage, true)).done();
						}
					}).done();
				}
			},

			updateBranchesAndStagingTableAndRefresh: function() {
				var that = this;
				if (this.isVisible() && this._oGitPaneView) {
					this._oGitPaneView.getModel().setProperty('/modelData/isGit', false);
					var aPromisses = [];
					aPromisses.push(this._oGitPaneView.getController().updateBranches());
					aPromisses.push(this._oGitPaneView.getController().updateStagingTable(true));
					Q.all(aPromisses).then(function() {
						that._oGitPaneView.getModel().setProperty('/modelData/isGit', true);
				// 		return that.context.service.repositorybrowser.refresh();
					}).done();
				}
			},

			cleanCommitDescription: function() {
				if (this.isVisible() && this._oGitPaneView) {
					this._oGitPaneView.getModel().setProperty('/modelData/sCommitDescription', "");
				}
			},

			updateStagingTable: function() {
				var that = this;
				if (this.isVisible() && this._oGitPaneView) {
					this._oGitPaneView.getModel().setProperty('/modelData/isGit', false);
					this._oGitPaneView.getController().updateStagingTable(true).then(function() {
						that._oGitPaneView.getModel().setProperty('/modelData/isGit', true);
					}).done();
				}
			},

			operationStarted: function(oEvent) {
				if (this._oGitPaneView) {
					this._oGitPaneView.getController()._setAnimation(oEvent.params.entity, oEvent.params.name, true);
				}
			},

			operationStopped: function(oEvent) {
				if (this._oGitPaneView) {
					this._oGitPaneView.getController()._setAnimation(oEvent.params.entity, oEvent.params.name, false);
				}
			},

			setVisible: function(bVisible) {
				var that = this;
				return AbstractPart.prototype.setVisible.apply(this, arguments).then(function() {
					if (bVisible) {
						that.doUpdate(null, true);
					}
					return Q();
				});
			},

			getStatus: function(oEntity, bForce) {
				var that = this;
				var sProjectName = this._getProjectName(oEntity);


				//Check if the project's status is already in the map and if it is not force to update it
				if (!bForce && this._mStatus[sProjectName]) {
					return Q(this._mStatus[sProjectName]);
				}

				//create defer for the first node of the project to support expanding the tree on start-up
				if (!this._mDefer[sProjectName]) {
					this._mDefer[sProjectName] = Q.defer();
				}
				//execute status request only for the project node
				//if (!oEntity.getParentPath() && (!this._mDefer[sProjectName].inProgress)) {
                if ( oEntity.isProject() && (!this._mDefer[sProjectName].inProgress)) {
					/*this flag is to avoid execution of request while wait for a response of the same request. 
					 * for example getting status of decorators while status for the pane was already executed*/
					this._mDefer[sProjectName].inProgress = true;
					this.context.service.git.getStatus(oEntity.getBackendData().git).then(function(aResponse) {
						that._mStatus[sProjectName] = aResponse.sort(function(a, b) {
							return (that._mPriority[a.FullStatus] - that._mPriority[b.FullStatus]) + (b.Stage - a.Stage);
						});
						//resolve all promises, may be multiple in case expanding the tree on start-up
						that._mDefer[sProjectName].resolve(that._mStatus[sProjectName]);
						//resolve can be perform only once, hence set it to null so the next time new defer will be created
						that._mDefer[sProjectName] = null;
					}).done();
				}
				return this._mDefer[sProjectName].promise;
			},

			_mPriority: {
				CONFLICT: 0,
				DELETED: 5,
				NEW: 10,
				MODIFIED: 15
			}, //Need to be in multiples of 5 in order to support stage in the calculation

			getStatusForNode: function(oDocument) {
				var that = this;
				return this.getStatus(oDocument.getEntity()).then(function(aResponse) {
					var sResponseLocation, sDocumentLocation = oDocument.getEntity().getBackendData().location;
					for (var i = 0; i < aResponse.length; i++) {
						sResponseLocation = aResponse[i].Location;
						if (sResponseLocation === sDocumentLocation || (sResponseLocation.indexOf(sDocumentLocation) > -1) && oDocument.getType() ===
							"folder") {
							return {
								status: aResponse[i].FullStatus,
								stage: aResponse[i].Stage
							};
						}
					}
				});
			},

			_updateDecoration: function(oDocToUpdate) {
				var that = this;
				if (oDocToUpdate) {
					return this.context.service.decoration.updateDecorations(oDocToUpdate, true);
				}
				if (this._oGitPaneView) {
					return this._oGitPaneView.getController().getDocument().then(function(oDocument) {
						return Q(oDocument ? oDocument : that.context.service.filesystem.documentProvider.getRoot()).then(function(oDoc) {
							return that.context.service.decoration.updateDecorations(oDoc, true);
						});
					});
				}
				return this.context.service.filesystem.documentProvider.getRoot().then(function(oDoc) {
					return that.context.service.decoration.updateDecorations(oDoc, true);
				});

			},

			//TODO consider extracting this method to the repositorybrowser service
			_updateChain: function(oDocument, oEvent) {
				var that = this;
				if (!oDocument.isProject()) {
					return this.context.service.decoration.updateDecorations(oDocument, false, oEvent).then(function() {
						return oDocument.getParent().then(function(oParent) {
							return that._updateChain(oParent, oEvent);
						});
					});
				} else {
					return this.context.service.decoration.updateDecorations(oDocument, false, oEvent);
				}
			},
			_getProjectName: function(oEntity) {
				return oEntity.getParentPath() ? oEntity.getParentPath().split('/')[1] : oEntity.getName();
			}
		});
		return GitClient;
	});