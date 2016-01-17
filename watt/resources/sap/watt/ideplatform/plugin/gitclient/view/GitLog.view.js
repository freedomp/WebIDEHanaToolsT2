jQuery.sap.require("sap.watt.ideplatform.plugin.gitclient.ui.GitVersionGraph");
jQuery.sap.require("sap.watt.ideplatform.plugin.gitclient.ui.MultiComboBox");
jQuery.sap.require("sap.watt.ideplatform.plugin.gitclient.ui.VisibilityContainer");
sap.ui.jsview("sap.watt.ideplatform.plugin.gitclient.view.GitLog", {

	getControllerName: function() {
		return "sap.watt.ideplatform.plugin.gitclient.view.GitLog";
	},

	createContent: function(oController) {
		this._oContext = this.getViewData().context;
		var that = this;

		//Panel
		var oPanel = new sap.ui.commons.Panel({
			showCollapseIcon: false,
			width: "100%",
			areaDesign: "Transparent",
			height: "100%",
			borderDesign: sap.ui.commons.enums.BorderDesign.None,
			applyContentPadding: false,
			title: new sap.ui.core.Title({
				text: "{i18n>gitLogPane_Log}"
			})
		});

		//Graph and table Grid
		var oContentGrid = new sap.ui.layout.Grid({
			vSpacing: 0,
			height: "100%"
		}).addStyleClass("gitBackgroundColor");

		//Repository Header:
		var oHeaderTopGrid = new sap.ui.layout.Grid({
			hSpacing: 0,
			vSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		//Branch Drop box section
		var oBranchSectionHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitLogHorizontalLayoutHeight gitLogMarginBottomSmall gitTopMargin");

		var oListItemTemplate = new sap.ui.core.ListItem({
			text: "{Name}",
			additionalText: {
				path: "Type",
				formatter: function(sType) {
					switch (sType) {
						case "Branch":
							return that._oContext.i18n.getText("i18n", "gITBranchesDialog_local");
						case "RemoteTrackingBranch":
							return that._oContext.i18n.getText("i18n", "gITBranchesDialog_remote");
					}
				}
			}
		});

        //Branch DropDownbox if branch
        var  oBranchMultiDropDownBox = new sap.watt.ideplatform.plugin.gitclient.ui.MultiComboBox(this.createId("gitLogDropDownBox"), {
			tooltip: "{i18n>gITBranchesDialog_branch}",
			selectAllТitle: "{i18n>gitLog_SelectAllBranchesTitle}",
			width: "70%",
			displaySecondaryValues: true,
			enabled: "{isLogEnabled}",
			value: "{sCurrentBranchName}",
			visible : "{bIsMultiSelectionBranches}",
			selectionFinish: [oController._onDropDownBoxChangeMultiSelection, oController]
		}).addStyleClass("gitRightMargin flatControlSmall");

		oBranchMultiDropDownBox.bindItems("aAvailableBranches", oListItemTemplate);
        var oBranchLabel = new sap.ui.commons.Label({
            text: "{i18n>gitLogPane_Branch_Name}"
        }).addStyleClass("gitRightMargin");

		oBranchSectionHorizontalLayout.addContent(oBranchLabel);
		oBranchSectionHorizontalLayout.addContent(oBranchMultiDropDownBox);

		oHeaderTopGrid.addContent(oBranchSectionHorizontalLayout);

		//Folder File HL
		var oFolderNameHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitLogHorizontalLayoutHeight gitLogMarginBottomSmall gitLogHorizontalFlex gitLogHorizontalOverflow");

		var oFolderName = new sap.ui.commons.Label({
			width: "100%",
			wrapping: true,
			text: "{sFolderFileName}",
			tooltip: "{sFolderFileName}"
		}).addStyleClass("gitBottomMargin gitLogHorizontalOverflow");

		var oFolderLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLogPane_Folder_Name}",
			visible: "{bFolder}",
			labelFor: oFolderName
		}).addStyleClass("gitRightMargin gitBottomMargin");

		var oFileLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLogPane_File_Name}",
			visible: "{bFile}",
			labelFor: oFolderName
		}).addStyleClass("gitRightMargin gitBottomMargin");
		oFolderNameHorizontalLayout.addContent(oFileLabel);
		oFolderNameHorizontalLayout.addContent(oFolderLabel);
		oFolderNameHorizontalLayout.addContent(oFolderName);
		oHeaderTopGrid.addContent(oFolderNameHorizontalLayout);

		//Details Section Grid
		var oCommitDetailsSectionGrid = new sap.ui.layout.Grid({
			hSpacing: 0,
			vSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		//Git Massage Layout 
        var oTagIconLabel = new sap.ui.commons.Label({
			icon: {
				parts: ["Tags"],
				formatter: function(aTags) {
					var sIcon;
					if (aTags && aTags.length > 0) {
						sIcon = "sap-icon://tag";
					}
					return sIcon;
				}
			},
			visible: {
				parts: ["Tags"],
				formatter: function(aTags) {
					if (aTags && aTags.length > 0) {
						return true;
					}
					return false;
				}
			},
			tooltip: {
				parts: ["Tags"],
				formatter: function(aTags) {
					var sToolTip;
					if (aTags && aTags.length > 0) {
                        var sText = that._getTagsStr(aTags);

                        var oRichTooltip = new sap.ui.commons.RichTooltip({
                            text : sText,
                            title: "{i18n>gitLog_Tags}"
                        }).addStyleClass("gitLogTagIconRtt");
                        return oRichTooltip;
                    }
					return sToolTip;
				}
			}
		}).addStyleClass("gitLogTagIcon gitLogPaddingZero");
        var oMessageLabel = new sap.ui.commons.Label({
			text: {
				parts: ["Message"],
				formatter: function(sMessage) {
					var sTitle = "";
					if (sMessage) {
						sTitle = sMessage.split("\n\nChange-Id")[0];
					}
					return sTitle;
				}
			}
		}).addStyleClass("gitLogPaddingZero");
        var oMessageLayout = new sap.ui.layout.HorizontalLayout({
        	content: [oTagIconLabel, oMessageLabel]
        });
        
		//Git Version Control 
		var oGitVersionColumns = [
 	        new sap.ui.table.Column({
        		template: new sap.watt.ideplatform.plugin.gitclient.ui.VisibilityContainer({
        			content: [oMessageLayout],
        			layoutData: new sap.ui.layout.GridData({
        				span: "L12 M12 S12",
        				linebreak: false
        			})
        		})
 			})
	    ];

		var oGitVersionControl = new sap.watt.ideplatform.plugin.gitclient.ui.GitVersionGraph(this.createId("gitVersionControl"), {
			width: "100%",
			height: "100%",
			path: "/commitsTree",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			}),
			select: [oController._onGitVersionSelection, oController],
			searchCount: [oController._onGitVersionSearchCountChange, oController]
		});
		oGitVersionControl.setColumns(oGitVersionColumns);
		oGitVersionControl.bindProperty("commitsTree", "/commitsTree");

		oContentGrid.addContent(oGitVersionControl);

		var oNextPageButton = new sap.ui.commons.Button({
			tooltip: "{i18n>gitLogAccordionSection_More_Tooltip}",
			visible: "{isMore}",
			text: "{i18n>gitLogAccordionSection_More}",
			width: "100%",
			press: [oController._onNextPage, oController],
			layoutData: new sap.ui.layout.GridData({
				span: "L4 M4 S4",
				indent: "L8 M8 S8"
			})
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall");

		oContentGrid.addContent(oNextPageButton);

		var oSearchField = new sap.ui.commons.SearchField({
			width: "40%",
			enableListSuggest: false,
			value: "{sSearchValue}",
			enableClear: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			}),
			enabled: "{isLogEnabled}",
			startSuggestion: 0,
			search: function(oEvent) {
				oGitVersionControl.searchGitLog(oEvent.getParameter("query"));
			},
			suggest: function(oEvent) {
				oGitVersionControl.searchGitLog(oEvent.getParameter("value"));
			}
		}).addStyleClass("gitLogMarginLeft gitPaneControllerSpacing");

		var oNextSearchButton = new sap.ui.commons.Button({
			press: [oGitVersionControl.nextSearch, oGitVersionControl],
			icon: "sap-icon://slim-arrow-down",
			enabled: "{isLogEnabled}"
		}).addStyleClass("gitLogMarginLeft gitPaneControllerSpacing riverControlSmall");

		var oPrevSearchButton = new sap.ui.commons.Button({
			press: [oGitVersionControl.prevSearch, oGitVersionControl],
			icon: "sap-icon://slim-arrow-up",
			enabled: "{isLogEnabled}"
		}).addStyleClass("gitLogMarginLeft gitPaneControllerSpacing riverControlSmall");

		var oSearchCount = new sap.ui.commons.Label({
			text: "{sSearchItemsSelected}",
			visible: {
				path: "sSearchItemsSelected",
				formatter: function(sSearchItemsSelected) {
					return !!sSearchItemsSelected;
				}
			}
		}).addStyleClass("gitLogMarginLeft gitAmountIndicator gitLogAmoundIndicator");

		var oSearchHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			visible: {
				parts: ["bFile", "bFolder"],
				formatter: function(isFile, isFolder) {
					return isFile || isFolder;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitLogHorizontalLayoutWidth");

		var oSearchButtonsHorizontanLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			visible: {
				parts: ["bFile", "bFolder"],
				formatter: function(isFile, isFolder) {
					return isFile || isFolder;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		});

		oSearchHorizontalLayout.addContent(oSearchField);
		oSearchButtonsHorizontanLayout.addContent(oNextSearchButton);
		oSearchButtonsHorizontanLayout.addContent(oPrevSearchButton);
		oSearchButtonsHorizontanLayout.addContent(oSearchCount);
		oSearchHorizontalLayout.addContent(oSearchButtonsHorizontanLayout);
		oHeaderTopGrid.addContent(oSearchHorizontalLayout);

		var oLogButtonsHorizontalLayout = new sap.ui.layout.HorizontalLayout({
			allowWrapping: true,
			layoutData: new sap.ui.layout.GridData({
				span: "L11 M11 S11",
				linebreak: true
			})
		});

		var oTagButton = new sap.ui.commons.Button({
			tooltip: "{i18n>gitLogPane_Tag}",
			enabled: {
				parts: ["isLogEnabled", "isLogDetailsEnabled"],
				formatter: function(isLogEnabled, isLogDetailsEnabled) {
					return isLogEnabled && isLogDetailsEnabled;
				}
			},
			text: "{i18n>gitLogPane_Tag_Tooltip}",
			press: [oController._onTag, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall");
		oLogButtonsHorizontalLayout.addContent(oTagButton);

		var oCherryPickButton = new sap.ui.commons.Button({
			tooltip: "{i18n>gitLog_CherryPickToolTip}",
			enabled: {
				parts: ["isLogEnabled", "isLogDetailsEnabled"],
				formatter: function(isLogEnabled, isLogDetailsEnabled) {
					return isLogEnabled && isLogDetailsEnabled;
				}
			},
			text: "{i18n>gitLog_CherryPick}",
			press: [oController._onCherryPick, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall ");
		oLogButtonsHorizontalLayout.addContent(oCherryPickButton);

		var oRevertButton = new sap.ui.commons.Button({
			tooltip: "{i18n>gitLog_RevertToolTip}",
			enabled: {
				parts: ["isLogEnabled", "isLogDetailsEnabled"],
				formatter: function(isLogEnabled, isLogDetailsEnabled) {
					return isLogEnabled && isLogDetailsEnabled;
				}
			},
			text: "{i18n>gitLog_Revert}",
			press: [oController._onRevert, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall");
		oLogButtonsHorizontalLayout.addContent(oRevertButton);

		var oCheckOutButton = new sap.ui.commons.Button({
			tooltip: "{i18n>gitLog_CheckOutToolTip}",
			enabled: {
				parts: ["isLogEnabled", "isLogDetailsEnabled"],
				formatter: function(isLogEnabled, isLogDetailsEnabled) {
					return isLogEnabled && isLogDetailsEnabled;
				}
			},
			text: "{i18n>gitLogPane_CheckOut}",
			press: [oController._onCheckOutCommit, oController]
		}).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall");
		oLogButtonsHorizontalLayout.addContent(oCheckOutButton);

		//Message
		var oMessageTextLabel = new sap.ui.commons.Label({
			width: "100%",
			text: {
				parts: ["oLogDetailData/Message"],
				formatter: function(sMessage) {
					var sTitle = "";
					if (sMessage) {
						sTitle = sMessage.split("\n\nChange-Id")[0];
					}
					return sTitle;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12"
			})
		}).addStyleClass("gitLogDetailsMessageLabel gitLogLabelSelectable");
		oCommitDetailsSectionGrid.addContent(oMessageTextLabel);

		//Authored
		var oAuthoredTextLabel = new sap.ui.commons.Label({
			width: "100%",
			text: {
				parts: ["oLogDetailData/AuthorName", "oLogDetailData/AuthorEmail"],
				formatter: function(sAuthorName, sAuthorEmail) {
					if (sAuthorName && sAuthorEmail) {
						return sAuthorName + " (" + sAuthorEmail + ")";
					}
				}
			},
			tooltip: {
				parts: ["AuthorName", "AuthorEmail"],
				formatter: function(sAuthorName, sAuthorEmail) {
					if (sAuthorName && sAuthorEmail) {
						return sAuthorName + " (" + sAuthorEmail + ")";
					}
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S6"
			})
		}).addStyleClass("gitLogLabelHeight gitLogLabelSelectable");

		var oAuthoredLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLogAccordionSection_Authored}",
			width: "100%",
			labelFor: oAuthoredTextLabel,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S6",
				linebreak: true
			})
		}).addStyleClass("gitRightMargin gitLogLabelHeight");
		oCommitDetailsSectionGrid.addContent(oAuthoredLabel);
		oCommitDetailsSectionGrid.addContent(oAuthoredTextLabel);

		//Commited
		var oCommitedTextLabel = new sap.ui.commons.Label({
			width: "100%",
			text: {
				parts: ["oLogDetailData/CommitterName", "oLogDetailData/CommitterEmail"],
				formatter: function(sCommitterName, sCommitterEmail) {
					if (sCommitterName && sCommitterEmail) {
						return sCommitterName + " (" + sCommitterEmail + ")";
					}

				}
			},
			tooltip: {
				parts: ["oLogDetailData/CommitterName", "oLogDetailData/CommitterEmail"],
				formatter: function(sCommitterName, sCommitterEmail) {
					if (sCommitterName && sCommitterEmail) {
						return sCommitterName + " (" + sCommitterEmail + ")";
					}
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L9 M9 S6"
			})
		}).addStyleClass("gitLogLabelHeight gitLogLabelSelectable");

		var oCommitedLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLogAccordionSection_Commited}",
			width: "100%",
			labelFor: oCommitedTextLabel,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S6"
			})
		}).addStyleClass("gitRightMargin gitLogLabelHeight");
		oCommitDetailsSectionGrid.addContent(oCommitedLabel);
		oCommitDetailsSectionGrid.addContent(oCommitedTextLabel);

		//Creation date
		var oCreationDateTextLabel = new sap.ui.commons.Label({
			width: "100%",
			text: {
				path: "oLogDetailData/Time",
				formatter: function(timestamp) {
					if (timestamp) {
						var dFormatted = new Date(timestamp);
						return dFormatted.toLocaleString();
					}
				}
			},
			tooltip: {
				path: "oLogDetailData/Time",
				formatter: function(timestamp) {
					if (timestamp) {
						var dFormatted = new Date(timestamp);
						return dFormatted.toLocaleString();
					}
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S6"
			})
		}).addStyleClass("gitLogLabelHeight gitLogLabelSelectable");

		var oCreationDateLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLogAccordionSection_Date}",
			width: "100%",
			labelFor: oCreationDateTextLabel,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S5",
				linebreak: true
			})
		}).addStyleClass("gitRightMargin gitLogLabelHeight");
		oCommitDetailsSectionGrid.addContent(oCreationDateLabel);
		oCommitDetailsSectionGrid.addContent(oCreationDateTextLabel);

		//Commited
		var oCommitTextLabel = new sap.ui.commons.Label({
			width: "100%",
			text: "{oLogDetailData/Name}",
			tooltip: "{oLogDetailData/Name}",
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S6"
			})
		}).addStyleClass("gitLogLabelHeight gitLogLabelSelectable");

		var oCommitLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLogAccordionSection_Commit_ID}",
			width: "100%",
			labelFor: oCommitTextLabel,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S5"
			})
		}).addStyleClass("gitRightMargin gitLogLabelHeight");
		oCommitDetailsSectionGrid.addContent(oCommitLabel);
		oCommitDetailsSectionGrid.addContent(oCommitTextLabel);
		//Branch
		var oBranchTextLabel = new sap.ui.commons.Label({
			width: "100%",
			wrapping: true,
			visible :{
				path: "oLogDetailData/Branches",
				formatter: function(aBranches) {
					if (aBranches && aBranches.length > 0) {
						return true;
					}
					return false;
				}
			},
			text: {
				path: "oLogDetailData/Branches",
				formatter: function(aBranches) {
					if (!aBranches){
						return "";
					}
					return that._getStringFromArray(aBranches,"FullName");
				}
			},
			tooltip: {
				path: "oLogDetailData/Branches",
				formatter: function(aBranches) {
					if (!aBranches){
						return "";
					}
					return that._getStringFromArray(aBranches,"FullName");
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S6"
			})
		}).addStyleClass("gitLogLabelHeight gitLogTagTextLabelHeight gitMarginBottonWithGrid0Spacing gitLogLabelSelectable");

		var oBranchLabelPerCommit = new sap.ui.commons.Label({
			text: "{i18n>gitPane_branch}",
			width: "100%",
			labelFor: oBranchTextLabel,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S5"
			})
		}).addStyleClass("gitRightMargin gitLogLabelHeight");
		oCommitDetailsSectionGrid.addContent(oBranchLabelPerCommit);
		oCommitDetailsSectionGrid.addContent(oBranchTextLabel);
		//Tags
		var oTagsTextLabel = new sap.ui.commons.Label({
			width: "100%",
			wrapping: true,
			text: {
				parts: ["oLogDetailData/Tags"],
				formatter: function(aTags) {
					return that._getTagsStr(aTags);
				}
			},
			tooltip: {
				parts: ["oLogDetailData/Tags"],
				formatter: function(aTags) {
					return that._getTagsStr(aTags);
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L8 M8 S6"
			})
		}).addStyleClass("gitLogLabelHeight gitLogTagTextLabelHeight gitMarginBottonWithGrid0Spacing");

		var oTagsLabel = new sap.ui.commons.Label({
			text: "{i18n>gitLog_Tags}",
			width: "100%",
			labelFor: oTagsTextLabel,
			layoutData: new sap.ui.layout.GridData({
				span: "L3 M3 S5"
			})
		}).addStyleClass("gitRightMargin gitLogLabelHeight gitMarginBottonWithGrid0Spacing");

		var oTagsGrid = new sap.ui.layout.Grid("gitHistoryTagsGrid_id",{
			hSpacing: 0,
			vSpacing: 0,
			width: "100%",
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});

		oTagsGrid.addContent(oTagsLabel);
		oTagsGrid.addContent(oTagsTextLabel);

		var oTagsVisibilityContainer = new sap.watt.ideplatform.plugin.gitclient.ui.VisibilityContainer({
			content: [oTagsGrid],
			visible: {
				parts: ["oLogDetailData/Tags"],
				formatter: function(aTags) {
					if (aTags) {
						return aTags.length > 0;
					}
					return false;
				}
			},
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		});
		oCommitDetailsSectionGrid.addContent(oTagsVisibilityContainer);
		
		oCommitDetailsSectionGrid.addContent(oLogButtonsHorizontalLayout);

		//Files table
		var oLogFileTable = new sap.ui.table.Table({
			visibleRowCount: 4,
			selectionMode: sap.ui.table.SelectionMode.None,
			showNoData: false,
			layoutData: new sap.ui.layout.GridData({
				span: "L12 M12 S12",
				linebreak: true
			})
		}).addStyleClass("gitPaneTextSizing");
		oLogFileTable.bindRows("oLogDetailData/Diffs");
		oCommitDetailsSectionGrid.addContent(oLogFileTable);

		oLogFileTable.addColumn(new sap.ui.table.Column({
			label: "{i18n>gitLogAccordionSection_Status}",
			template: new sap.ui.commons.Label({
				text: "{Status}",
				tooltip: {
					path: "FullStatus",
					formatter: function(sFullStatus) {
						if (!this.getModel("i18n") || !sFullStatus) {
							return "";
						}
						return this.getModel("i18n").getResourceBundle().getText("gitLog_Files_Table_" + sFullStatus);
					}
				}
			}),
			width: "40px"
		}));

		oLogFileTable.addColumn(new sap.ui.table.Column({
			label: "{i18n>gitLogAccordionSection_Files}",
			template: new sap.ui.commons.Label({
				text: {
					path: "DiffLocation",
					formatter: function(sDiffLocation) {
						if (sDiffLocation) {
							var aFiles = sDiffLocation.split("/");
							if (aFiles.length > 0) {
								return aFiles[aFiles.length - 1];
							}
						}
						return "";
					}
				},
				tooltip: "{DiffLocation}"
			}),
			width: "70%"
		}));
		oLogFileTable.attachBrowserEvent("dblclick", oController._onFileTableRowDoubleClick, oController);

		var oSplitterContentDetails = new sap.ui.commons.Splitter({
			splitterOrientation: sap.ui.commons.Orientation.horizontal,
			width: "100%",
			height: "100%",
			firstPaneContent: [oContentGrid],
			secondPaneContent: [oCommitDetailsSectionGrid],
			splitterPosition: "60%",
			minSizeSecondPane: "20%"
		});

		var oSplitterTop = new sap.ui.commons.Splitter({
			splitterOrientation: sap.ui.commons.Orientation.horizontal,
			width: "100%",
			height: "100%",
			firstPaneContent: [oHeaderTopGrid],
			secondPaneContent: [oSplitterContentDetails],
			splitterPosition: "13%",
			minSizeSecondPane: "12%"
		});

		oPanel.addContent(oSplitterTop);
		return oPanel;
	},

	_getStringFromArray: function(aObjects, sKey) {
		var sText = "";
		if (aObjects && aObjects.length > 0) {
			var sTextVal = aObjects[0][sKey];
			if (sTextVal === undefined){
				return "";
			}
			sText = sTextVal;
			for (var i = 1; i < aObjects.length; i++) {
				var sTextWithValue = aObjects[i][sKey];
				if (sTextWithValue === undefined){
					continue;
				}
				sText = sText + ", " + sTextWithValue;
			}
		}
		return sText.replace(/refs\/heads\//g,"").replace(/refs\/remotes\//g,"");
	},

	_getTagsStr: function(aTags) {
		var sText = "";
		if (aTags && aTags.length > 0) {
            sText = aTags[0].Name;
            for (var i = 1; i < aTags.length; i++) {
                sText = sText + ", " + aTags[i].Name;
            }
        }
		return sText;
	}

});