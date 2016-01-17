sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitPane", {
	_oGrid: undefined,
	_oNewBranchView: undefined,
	_oDeleteBranchView: undefined,

	getControllerName: function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitPane";
	},

	createContent: function(oController) {
		if (!this._oPanel) {
			this._oPanel = new sap.ui.commons.Panel({
				showCollapseIcon: false,
				width: "100%",
				areaDesign: "Transparent",
				height: "100%",
				borderDesign: sap.ui.commons.enums.BorderDesign.None,
				applyContentPadding: false,
				title: new sap.ui.core.Title({
					text: "{i18n>gitPane_git}"
				})
			}).addStyleClass("gitPaneColoring");

			this._oContext = this.getViewData().context;
			this._oGrid = new sap.ui.layout.Grid("GitPaneGrid", {
				vSpacing: 0,		
				layoutData: new sap.ui.layout.GridData({
					span: "L12 M12 S12"
				}),
				containerQuery: true
			}).addStyleClass("gitBackgroundColor rdeGit");
			this._createActionsSection(oController);
			this._createCommitSection(oController);
			this._oPanel.addContent(this._oGrid);
		}

		return this._oPanel;
	},

	_createActionsSection: function(oController) {

		var oRepositoryNameHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});
		var oRepositoryHeading = new sap.ui.commons.Label({
			text: "{i18n>gitPane_repository}",
			design: sap.ui.commons.LabelDesign.Bold
		}).addStyleClass("gitRightMargin");
		oRepositoryNameHorizontalLayout.addContent(oRepositoryHeading);

		var oRepositoryName = new sap.ui.commons.Label("RepositoryName", {
			text: "{repositoryName}"
		}).addStyleClass("gitRightMargin");
		oRepositoryNameHorizontalLayout.addContent(oRepositoryName);
		this._oGrid.addContent(oRepositoryNameHorizontalLayout);

		var oRepositoryCommitsStatus = new sap.ui.commons.Label({
			text: "{sRepositoryCommitsStatus}",
			visible: {
				path: "sRepositoryCommitsStatus",
				formatter: function(sRepositoryCommitsStatus) {
					if (!sRepositoryCommitsStatus) {
						return false;
					}
					return (sRepositoryCommitsStatus !== "  ");
				}
			}
		}).addStyleClass("gitRightMargin gitAmountIndicator");
		oRepositoryNameHorizontalLayout.addContent(oRepositoryCommitsStatus);
		this._oGrid.addContent(oRepositoryNameHorizontalLayout);

		this._createBranchSection(oController);

		var oActionButtonsUpperHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitPaneHorizontalCenter gitPaneOuterHorizontalLayout");

		var oActionButtonsLowerHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitPaneHorizontalCenter gitPaneInnerHorizontalLayout");

		var oPullButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			visible: {
				parts: ["isRebaseInteractive", "isCherryPickingOrMerging"],
				formatter: function(isRebaseInteractive, isCherryPickingOrMerging) {
					return !isRebaseInteractive && !isCherryPickingOrMerging;
				}
			},
			id: "git_pull_btn",
			tooltip: "{i18n>gitPane_button_pull}",
			text: "{i18n>gitPane_button_pull}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/arrow_down",
			wait: "{animation>/PULL}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onPull, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsUpperHorizontalLayout.addContent(oPullButton);

		var oFetchUpButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			visible: {
				path: "isRebaseInteractive",
				formatter: function(isRebaseInteractive) {
					return !isRebaseInteractive;
				}
			},
			id: "git_fetch_btn",
			tooltip: "{i18n>gitPane_button_fetch}",
			text: "{i18n>gitPane_button_fetch}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/fetch",
			wait: "{animation>/FETCH}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onFetchFromUpstream, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsUpperHorizontalLayout.addContent(oFetchUpButton);

		var oRebaseButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			visible: {
				parts: ["isRebaseInteractive", "isCherryPickingOrMerging"],
				formatter: function(isRebaseInteractive, isCherryPickingOrMerging) {
					return !isRebaseInteractive && !isCherryPickingOrMerging;
				}
			},
			id: "git_rebase_btn",
			tooltip: "{i18n>gitPane_button_rebase}",
			text: "{i18n>gitPane_button_rebase}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/rebase",
			wait: "{animation>/REBASE}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onRebase, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsUpperHorizontalLayout.addContent(oRebaseButton);

		var oMergeButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			visible: {
				parts: ["isRebaseInteractive", "isCherryPickingOrMerging"],
				formatter: function(isRebaseInteractive, isCherryPickingOrMerging) {
					return !isRebaseInteractive && !isCherryPickingOrMerging;
				}
			},
			id: "git_merge_btn",
			tooltip: "{i18n>gitPane_merge_button_tooltip}",
			text: "{i18n>gitPane_button_merge}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/merge",
			wait: "{animation>/MERGE}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onMerge, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsLowerHorizontalLayout.addContent(oMergeButton);

		//Rebase Interactive
		var oContinueButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			visible: "{isRebaseInteractive}",
			tooltip: "{i18n>gitPane_button_continue}",
			text: "{i18n>gitPane_button_continue}",
			enabled: {
				parts: ["isGit", "isContinue"],
				formatter: function(isGit, isContinue) {
					return isGit && isContinue;
				}
			},
			id: "git_rebase_continue_btn",
			icon: "sap-icon://watt/continue",
			wait: "{animation>/CONTINUEOPERATION}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onContinue, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments").data("rebaseInteractive", "CONTINUE");
		oActionButtonsLowerHorizontalLayout.addContent(oContinueButton);

		var oSkipPatchButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			id: "git_skip_patch_btn",
			visible: "{isRebaseInteractive}",
			tooltip: "{i18n>gitPane_button_skippatch}",
			text: "{i18n>gitPane_button_skippatch}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/skip",
			wait: "{animation>/SKIPOPERATION}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onRebaseInteractiveSkipPatch, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments").data("rebaseInteractive", "SKIP");
		oActionButtonsLowerHorizontalLayout.addContent(oSkipPatchButton);

		var oAbortButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			id: "git_rebase_abort_btn",
			visible: "{isRebaseInteractive}",
			tooltip: "{i18n>gitPane_button_abort}",
			text: "{i18n>gitPane_button_abort}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/abort",
			wait: "{animation>/ABORTOPERATION}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onRebaseInteractiveAbort, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments").data("rebaseInteractive", "ABORT");
		oActionButtonsLowerHorizontalLayout.addContent(oAbortButton);
		
		var _oUseStashButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
		 visible: {	
                parts: ["isRebaseInteractive", "isCherryPickingOrMerging", "isStashable"],
                formatter: function(isRebaseInteractive, isCherryPickingOrMerging, isStashable) {
                    return !isRebaseInteractive && !isCherryPickingOrMerging && isStashable;
                }	
            },
			id: "git_show_stash_btn",
			tooltip: "{i18n>gitPane_button_useStash}",
			text: "{i18n>gitPane_button_useStash}",
			enabled: {
		    	parts: ["isGit", "isStashAvailable"],
				formatter: function(isGit, isStashAvailable) {
					return isGit && isStashAvailable;
				}
		    },
			icon: "sap-icon://watt/reset",
			wait: "{animation>/USESTASH}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onUseStash, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsLowerHorizontalLayout.addContent(_oUseStashButton);

		var oResetButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			id: "git_reset_btn",
			visible: "{isReset}",
			tooltip: "{i18n>gitPane_button_reset}",
			text: "{i18n>gitPane_button_reset}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/reset",
			wait: "{animation>/RESET}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onReset, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsLowerHorizontalLayout.addContent(oResetButton);

		var oFetchFromGerritButton = new sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton({
			id: "git_fetch_from_gerrit_btn",
			tooltip: "{i18n>gitPane_fetch_from_gerrit_button}",
			visible: {
				parts: ["isGerritSupported", "isRebaseInteractive", "isCherryPickingOrMerging"],
				formatter: function(isGerritSupported, isRebaseInteractive, isCherryPickingOrMerging) {
					return isGerritSupported && !isRebaseInteractive && !isCherryPickingOrMerging && !!sap.watt.getEnv("internal");
				}
			},
			text: "{i18n>gitPane_fetch_from_gerrit_button}",
			enabled: "{isGit}",
			icon: "sap-icon://watt/fetch_from_gerrit",
			wait: "{animation>/FETCHGERRIT}",
			waitingText: "{i18n>gitPane_button_busy}",
			press: [oController._onFetchFromGerrit, oController]

		}).addStyleClass("gitRightMargin gitPaneControllerSpacing gitPaneButtonEnhancments");
		oActionButtonsLowerHorizontalLayout.addContent(oFetchFromGerritButton);

		oActionButtonsUpperHorizontalLayout.addContent(oActionButtonsLowerHorizontalLayout);
		this._oGrid.addContent(oActionButtonsUpperHorizontalLayout);

	},

	_createBranchSection: function(oController) {

		var oHorizontalBranchHandling = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		var oBranchLabel = new sap.ui.commons.Label({
			text: "{i18n>gitPane_branch}",
			design: sap.ui.commons.LabelDesign.Bold
		}).addStyleClass("gitRightMargin");
		oHorizontalBranchHandling.addContent(oBranchLabel);

		var _oDropdownBranches = new sap.ui.commons.DropdownBox({
			id: "git_branch_dd",
			tooltip: "{i18n>gitPane_branch}",
			displaySecondaryValues: true,
			change: [oController._onBranchChange, oController],
			value: "{sBranchValue}",
			enabled: {
				parts: ["isGit", "isRebaseInteractive"],
				formatter: function(isGit, isRebaseInteractive) {
					return !!isGit && !isRebaseInteractive;
				}
			}
		}).addStyleClass("flatControlSmall");
		
		var _oListItemTemplate = new sap.ui.core.ListItem({
			text: "{Name}"
		});
		
		var oSorter = new sap.ui.model.Sorter("Name", false);
		
		_oDropdownBranches.bindItems("results", _oListItemTemplate, oSorter);
		
		oHorizontalBranchHandling.addContent(_oDropdownBranches);

		

		var oAddBranchButton = new sap.ui.commons.Button({
			id: "git_add_branch_btn",
			icon: "sap-icon://add",
			lite: true,
			tooltip: "{i18n>gitPane_add_branch_tooltip}",
            visible : "{isBranchSupport}",
			enabled: {
				parts: ["isGit", "isRebaseInteractive"],
				formatter: function(isGit, isRebaseInteractive) {
					return !!isGit && !isRebaseInteractive ;
				}
			},
			press: [oController._onCreateNewBranch, oController]
		}).addStyleClass("gitPadding gitPaneIconButtons");
		oHorizontalBranchHandling.addContent(oAddBranchButton);

		var oRemoveBranchButton = new sap.ui.commons.Button({
			id: "git_remove_branch_btn",
			icon: "sap-icon://less",
			lite: true,
			tooltip: "{i18n>gitPane_delete_branch_tooltip}",
            visible : "{isBranchSupport}",
			enabled: {
				parts: ["isGit", "isRemoveBranch", "isRebaseInteractive" ],
				formatter: function(isGit, isRemoveBranch, isRebaseInteractive ) {
					return !!isGit && !!isRemoveBranch && !isRebaseInteractive;
				}
			},
			press: [oController._onDeleteBranch, oController]
		}).addStyleClass("gitPadding gitPaneIconButtons");

		oHorizontalBranchHandling.addContent(oRemoveBranchButton);
		this._oGrid.addContent(oHorizontalBranchHandling);
	},

	_createCommitSection: function(oController) {

		var oCommitHeading = new sap.ui.commons.Label({
			text: "{i18n>gitPane_commit_heading}",
			width: "100%",
			design: sap.ui.commons.LabelDesign.Bold,
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8",
				linebreak: true
			})
		}).addStyleClass("gitTopMargin");
		this._oGrid.addContent(oCommitHeading);

		this._oStageAllCheckBox = new sap.ui.commons.TriStateCheckBox({
			id: "git_stage_all_checkbox",
			text: "{i18n>gitPane_stageall}",
			enabled:  {
		    	parts: ["isGit", "hasDataInStageTable"],
				formatter: function(isGit, isStashEnable) {
					return isGit && isStashEnable;
				}
		    }
		}).addStyleClass("gitPaneIconButtons gitPaneStageAll");

		this._oRevertAllButton = new sap.ui.commons.Button({
			id: "git_discard_all_btn",
			icon: "sap-icon://undo",
			text: "{i18n>gitPane_discard_all}",
			enabled: "{isRevertAllEnabled}",
			lite: true,
			press: [oController._onDiscardAll, oController]
		}).addStyleClass("gitPaneIconButtons");

		this._oToolbar = new sap.ui.commons.Toolbar();
		this._oToolbar.addRightItem(this._oStageAllCheckBox);
		this._oToolbar.addRightItem(this._oRevertAllButton);
		this._oToolbar.addStyleClass("gitPaneToolbar");

		this._oStageTable = new sap.ui.table.Table({
			id : 'gitStageTable', // sap.ui.core.ID
			visibleRowCount: 8,
			selectionMode: sap.ui.table.SelectionMode.None,
			enableColumnReordering: false,
			toolbar: this._oToolbar,
			showNoData: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitPaneTextSizing gitPaneTableHover ");

		this._oStageTable.attachBrowserEvent("contextmenu", oController._onStageTableRowContext, oController);
		this._oStageTable.attachBrowserEvent("dblclick", oController._onStageTableRowDoubleClick, oController);
		
		this._oStageTable.bindRows("stageTableModel>/results");
		this._oStageTable.sort(this._oStageTable.getColumns()[1]);

		
		this._oGrid.addContent(this._oStageTable);

		this._oStageTable.addColumn(new sap.ui.table.Column({
			label: "{i18n>gitPane_commit_column_status}",
			template: new sap.ui.commons.Label({
				text: "{stageTableModel>Status}",
				tooltip: {
					parts: ["stageTableModel>FullStatus"],
					formatter: function(sFullStatus) {
						if (!sFullStatus){
							return;
						}
						if (!this.getModel("i18n")) {
							return;
						}
						return this.getModel("i18n").getResourceBundle().getText("gitPane_staging_table_" + sFullStatus);
					}
				}
			}),
			width: "40px"
		}));

		this._oStageTable.addColumn(new sap.ui.table.Column({
			label: "{i18n>gitPane_commit_column_name}",
			template: new sap.ui.commons.Label({
				text: {
					parts: ["stageTableModel>Name"],
					formatter: function(sName) {
						if (sName) {
							return oController.calculateShortFileFoldername(sName);
						}
					}

				},
				tooltip: "{stageTableModel>Name}"
			}),
			sortProperty: "stageTableModel>Name"
		}));

		this._oStageTable.addColumn(new sap.ui.table.Column({
			label: "{i18n>gitPane_commit_column_stage}",
			template: new sap.ui.commons.CheckBox({
				checked: "{stageTableModel>Stage}",
				change: [oController._onCheckFile, oController]
			}),
			width: "44px",
			hAlign: "Center"
		}));

		this._oStageTable.addColumn(new sap.ui.table.Column({
			label: "{i18n>gitPane_commit_column_discard}",
			template: new sap.ui.commons.Button({
				enabled: {
					parts: ["stageTableModel>Stage", "isRevertAllEnabled"],
					formatter: function(bStage, isRevertAllEnabled) {
						return !bStage && isRevertAllEnabled;
					}
				},
				width: "100%",
				icon: "sap-icon://undo",
				lite: true,
				press: [oController._onRevertFile, oController]
			}),
			width: "50px",
			hAlign: "Center"
		}));
		//commit
		var oCommitSummaryLabel = new sap.ui.commons.Label({
			text: "{i18n>gitPane_commit_description}",
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S8",
				linebreak: true
			})
		}).addStyleClass("gitPaneControllerSpacing");
		this._oGrid.addContent(oCommitSummaryLabel);

		var oDescriptionArea = new sap.ui.commons.TextArea({
			id: "git_commit_desc_area",
			width: "100%",
			rows: 6,
			value: "{sCommitDescription}",
			placeholder: "{i18n>gitPane_commit_description_here}",
			tooltip: "{i18n>gitPane_commit_description}",
			enabled: "{isGit}",
			liveChange: [oController._onTextAreaChange, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitPaneControllerSpacing");

		this._oGrid.addContent(oDescriptionArea);

		var oContext = this.getViewData().context;

		var oChangeIDLabel = new sap.ui.commons.Label({

			visible: !!sap.watt.getEnv("internal"),
			text: {
                parts:  ["isGerrit","isGerritSupported"],
				formatter: function(isGerrit, isGerritSupported) {
                    if(!isGerritSupported) {
                        return "";
                    }
					if (isGerrit) {
						return oContext.i18n.getText("i18n", "gitPane_add_change_id_for_gerrit");
					}
					return oContext.i18n.getText("i18n", "gitPane_doNotAdd_change_id_for_gerrit");
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S6"
			}),
			width: "100%"
		}).addStyleClass("gitPaneControllerSpacing gitPaneChangeIdLabel");
		this._oGrid.addContent(oChangeIDLabel);

		this._oAmendCheckBox = new sap.ui.commons.CheckBox({
			id: "git_amend_commit_btn",
			text: "{i18n>gitPane_amend_changes}",
			enabled: {
				parts: ["isGit", "isRebaseInteractive"],
				formatter: function(isGit, isRebaseInteractive) {
					return isGit && !isRebaseInteractive;
				}
			},
			change: [oController._onAmendChecked, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S6"
			}),
			width: "100%"
		}).addStyleClass("gitPaneControllerSpacing");
		this._oGrid.addContent(this._oAmendCheckBox);

		//Commit and Push Button
		//Create a Commit and Push MenuButton Control
		var oCommitAndPushMenuButton = new sap.ui.commons.MenuButton({
			id: "git_commit_and_push_btn",
			tooltip: "{i18n>gitPane_button_commitAndPush}",
			//width: "100%",
			text: "{i18n>gitPane_button_commitAndPush}",
			enabled: {
				parts: ["isGit", "isCommit"],
				formatter: function(isGit, isCommit) {
					return !!isGit && !!isCommit;
				}
			}
			/*,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M4 S6"
			})*/
		}).addStyleClass("gitRightMargin riverControlSmall sapUiBtnS gitPaneControllerSpacing");

		var oCommitAndPushHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S7"
			})
		}).addStyleClass("gitPaneHorizontalLeft gitPaneOuterHorizontalLayout");

		//Commit Button
		this._oCommitButton = new sap.ui.commons.Button({
			id: "git_commit_btn",
			text: "{i18n>gitPane_button_commit}",
			enabled: {
				parts: ["isGit", "isCommit"],
				formatter: function(isGit, isCommit) {
					return !!isGit && !!isCommit;
				}
			},
			/*layoutData: new sap.ui.layout.GridData({
				span: "L2 M3 S6",
				indent: "L5 M2",
				linebreakS: true
			}),
			width: "100%",*/
			press: [oController._onCommit, oController]
		}).addStyleClass("gitRightMargin riverControlSmall sapUiBtnS gitPaneControllerSpacing");
		
		

		//Create the push menu
		var oCommitAndPushMenu = new sap.ui.commons.Menu();

		var oI18n = this.getViewData().context.i18n;
		//Create the items and add them to the menu
		var oCommitAndPushToRemoteMenuItem = new sap.ui.commons.MenuItem({
			id: "git_commit_and_push_to_current_branch_item",
			text: {
				path: "remoteBranch",
				formatter: function(sRemoteBranch) {
					var sRemote = sRemoteBranch || oI18n.getText("i18n", "git_pushMenu_currentRemoteBranch"); //Current Branch’s Remote 
					return sRemote;
				}
			},
			enabled: {
				parts: ["isGit", "remoteBranch"],
				formatter: function(isGit, sRemoteBranch) {
					return isGit && !!sRemoteBranch;
				}
			},
			select: [oController._onCommitAndPush, oController]
		}).data("commitAndPush", "push");

		oCommitAndPushMenu.addItem(oCommitAndPushToRemoteMenuItem);
		var oCommitAndPushToMenuItem = new sap.ui.commons.MenuItem({
			id: "git_commit_and_push_to_remote_branch_item",
			text: oI18n.getText("i18n", "git_pushMenu_RemoteBranch"), //Remote Branch
			select: [oController._onCommitAndPush, oController]
		}).data("commitAndPush", "pushTo");
		oCommitAndPushMenu.addItem(oCommitAndPushToMenuItem);
		oCommitAndPushMenuButton.setMenu(oCommitAndPushMenu);

		//Push menu Button
		//Create Push MenuButton Control
		var oPushMenuButton = new sap.ui.commons.MenuButton({
			id: "git_push_menu_btn",
			tooltip: "{i18n>gitPane_button_push}",
			//width: "100%",
			text: "{i18n>gitPane_button_push}",
			enabled: "{isGit}"
			/*,
			layoutData: new sap.ui.layout.GridData({
				span: "L2 M3 S6"

			})*/
		}).addStyleClass("gitRightMargin riverControlSmall sapUiBtnS gitPaneControllerSpacing");
		

		//Create the Push menu
		var oPushMenu = new sap.ui.commons.Menu();

		//Create the items and add them to the menu
		var oPushToRemoteMenuItem = new sap.ui.commons.MenuItem({
			id: "git_push_to_current_branch_item",
			text: {
				path: "remoteBranch",
				formatter: function(sRemoteBranch) {
					var sRemote = sRemoteBranch || oI18n.getText("i18n", "git_pushMenu_currentRemoteBranch"); //Current Branch’s Remote 
					return sRemote;
				}
			},
			enabled: {
				parts: ["isGit", "remoteBranch"],
				formatter: function(isGit, sRemoteBranch) {
					return isGit && !!sRemoteBranch;
				}
			},
			select: [oController._onPush, oController]
		});

		oPushMenu.addItem(oPushToRemoteMenuItem);
		var oPushToMenuItem = new sap.ui.commons.MenuItem({
			id: "git__push_to_remote_branch_item",
			text: oI18n.getText("i18n", "git_pushMenu_RemoteBranch"), //Remote Branch
			select: [oController._onPushTo, oController]
		});
		oPushMenu.addItem(oPushToMenuItem);
		oPushMenuButton.setMenu(oPushMenu);
		
		//Stash Button
		var _oStashButton = new sap.ui.commons.Button({
			id: "git_stash_btn",
			text: "{i18n>gitPane_button_stash}",
			press: [oController._onStash, oController],
		    visible: "{isStashable}",
		    enabled: {
		    	parts: ["isGit", "hasDataInStageTable"],
				formatter: function(isGit, isStashEnable) {
					return isGit && isStashEnable;
				}
		    }
		}).addStyleClass("gitRightMargin riverControlSmall sapUiBtnS gitPaneControllerSpacing"); 

		var oCommitSectionButtonsHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L6 M6 S5",
				indent: "L3 M3"
			})
		}).addStyleClass("gitPaneHorizontalRight gitPaneOuterHorizontalLayout");

		oCommitAndPushHorizontalLayout.addContent(oCommitAndPushMenuButton);
		this._oGrid.addContent(oCommitAndPushHorizontalLayout);
		oCommitSectionButtonsHorizontalLayout.addContent(this._oCommitButton);
		oCommitSectionButtonsHorizontalLayout.addContent(oPushMenuButton);
	    oCommitSectionButtonsHorizontalLayout.addContent(_oStashButton);
		this._oGrid.addContent(oCommitSectionButtonsHorizontalLayout);
	},

	getNewBranchDialog: function() {
		if (!this._oNewBranchView) {
			this._oNewBranchView = sap.ui.view({
				viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitAddBranchDialog",
				type: sap.ui.core.mvc.ViewType.JS,
				viewData: {
					context: this.getViewData().context
				}
			});
		}
		return this._oNewBranchView;
	},
	getDeleteBranchDialog: function() {
		if (!this._oDeleteBranchView) {
			this._oDeleteBranchView = sap.ui.view({
				viewName: "sap.watt.ideplatform.plugin.gitclient.view.GitDeleteBranchDialog",
				type: sap.ui.core.mvc.ViewType.JS,
				viewData: {
					context: this.getViewData().context
				}
			});
		}
		return this._oDeleteBranchView;
	}
});