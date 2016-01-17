sap.ui.define(["sap/ui/test/Opa5", "uitests/pageobjects/webIDEBase"], function(Opa5, WebIDEBase) {

	var i18nModel = new sap.ui.model.resource.ResourceModel({
		bundleUrl: "sap/watt/ideplatform/plugin/gitclient/i18n/i18n.properties"
	});

	var _isGItPaneOpened = function(fnSuccess) {
		return this.waitFor({
			success: function(oShell) {
				var $gitPaneContent = this.getWindow().$(".gitPaneColoring");
				var bIsOpened = $gitPaneContent.length && ($gitPaneContent.width() > 0);
				fnSuccess.call(this, bIsOpened);
			}
		});
	};
	
	return Opa5.createPageObjects({

		inTheCloneDialog: {

			baseClass: WebIDEBase,

			actions: {

				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("command_clone_git_repository")
						}),

						success: function(aDialog) {
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				},

				iClickCancel: function() {

					return this.waitFor({
						pollingInterval: 4000,
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("command_clone_git_repository")
						}),

						success: function(aDialog) {
							return this.waitFor({
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_cancel")
								}),
								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!(aDialog[0].isOpen()), "Clicked on Cancel");
										},
										errorMessage: "No Cancel button available"
									});

								}

							});
						}
					}); //success
				},

				iEnterURL: function(sName) {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.TextField",
						matchers: new sap.ui.test.matchers.Properties({
							placeholder: i18nModel.getProperty("gITCloneDialog_insert_repository_url")
						}),
						success: function(aInputField) {
							aInputField[0].setValue(sName);
							aInputField[0].fireChange({
								newValue: sName
							});
						},
						errorMessage: "No input field available"
					});
				}

			},
			assertions: {

				isCloneDialogOpen: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("command_clone_git_repository")
						})
					});
				},

				iSeeAllRelevantFields: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.TextField",
						matchers: new sap.ui.test.matchers.Properties({
							placeholder: i18nModel.getProperty("gITCloneDialog_insert_repository_url")
						}),

						success: function(aTextFieldHost) {
							return this.waitFor({
								controlType: "sap.ui.commons.TextField",
								matchers: new sap.ui.test.matchers.Properties({
									placeholder: i18nModel.getProperty("gITCloneDialog_insert_path")
								}),
								success: function(aTextFieldPath) {
									ok(aTextFieldHost[0].getLiveValue(), "repository URl is populated");
									ok(aTextFieldPath[0].getLiveValue(), "path is populated");
								},
								errorMessage: "The fields are not populated"
							});
						} //success

					}); //wait for

				}, //function

				iSeeADialog: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("command_clone_git_repository")
						}),
						success: function(aDialog) {
							ok(aDialog[0], "the dialog is opened");
						},
						errorMessage: "There was no clone dialog"
					});

				} //function
			} //assertion
		}, //in the clone dialog

		inTheGitPreferenceDialog: {

			baseClass: WebIDEBase,

			actions: {

				iClickSave: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							id: "applyButton"
						}),

						success: function(aButton) {
							ok(aButton[0], "Save button");
							aButton[0].firePress();

						},
						errorMessage: "No Save button available"
					}); //success
				},

				iPressOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_INFO"

						}),

						success: function(aDialog) {

							return this.waitFor({
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									id: "MSG_INFO--btn-OK"
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({

										success: function() {
											ok(true, "Information dialog is closed");
										},
										errorMessage: "Git Preferences Information Dialog not closed"
									});
								},
								errorMessage: "No OK button available"
							});
						}
					}); //success
				},

				iPressCancelConfirm: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_CONFIRM--btn-CANCEL"
						}),

						success: function(aButton) {
							ok(aButton[0], "the cancel button is pressed");
							this.simulate.click(aButton[0]);
						},
						errorMessage: "No Cancel button available"

					}); //success
				},

				iPressOKConfirm: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_CONFIRM--btn-OK"
						}),

						success: function(aButton) {
							ok(aButton[0], "the OK button is pressed");
							this.simulate.click(aButton[0]);
						},
						errorMessage: "No OK button available"

					}); //success
				},

				iPressGitSettings: function() {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							id: "git.preferances"
						}),
						success: function(aButton) {
							this.simulate.click(aButton[0]);
							ok(aButton[0], "Git Settings pressed");

						},
						errorMessage: "No button found"
					});
				},

				iEnterEmail: function(sName) {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.Label",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gITSettingsDialog_Git_Email_Address")
						}),
						success: function(aLabel) {
							ok(aLabel[0], "Email label");
							var textID = aLabel[0].getAssociation("labelFor");
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.TextField",
								matchers: new sap.ui.test.matchers.Properties({
									id: textID
								}),
								success: function(aTextField) {
									ok(aTextField[0], "Email label");
									aTextField[0].setValue(sName);
								},

								errorMessage: "No input field available"
							});
						},
						errorMessage: "No email label available"
					});
				},

				iEnterUserName: function(sName) {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.Label",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gITSettingsDialog_Git_User_Name")
						}),
						success: function(aLabel) {
							ok(aLabel[0], "Name label");
							var textID = aLabel[0].getAssociation("labelFor");
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.TextField",
								matchers: new sap.ui.test.matchers.Properties({
									id: textID
								}),
								success: function(aTextField) {
									ok(aTextField[0], "Name label");
									aTextField[0].setValue(sName);
								},

								errorMessage: "No input field available"
							});
						},
						errorMessage: "No username label available"
					});
				}

			},
			assertions: {

				isGitSettingsPageOpen: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Label",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gITSettings_Title")
						}),
						success: function(aLabel) {
							ok(aLabel[0], "the label is seen");

						},
						errorMessage: "No label available"
					});
				},

				isInfoDialogOpen: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_INFO"
						}),
						success: function(aDialog) {
							ok(aDialog[0], "the info dialog is opened");

						},
						errorMessage: "No info dialog available"
					});

				},

				isConfirmationDialogOpen: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_CONFIRM"
						}),

						success: function(aDialog) {
							ok(aDialog[0], "the confirmation dialog is opened");

						},
						errorMessage: "the confirmation dialog is opened"
					});
				}

			} //assertion
		}, //in the git preferences

		inTheGitPane : {

			baseClass: WebIDEBase,

			actions: {

				iPressOnAddBrach: function() {

					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							icon: "sap-icon://add"
						}),

						success: function(aButton) {
							aButton[0].firePress();
							//ok(aButton[0], "Clicked on Add Branch");
							//this.simulate.click(aButton[0]);
						},

						errorMessage: "No Add branch button available"
					});
				},
				
				iPressOnFetch: function() {

					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton",
						matchers: new sap.ui.test.matchers.Properties({
							icon: "sap-icon://watt/fetch"
						}),

						success: function(aButton) {
							aButton[0].firePress();
						},

						errorMessage: "No Fetch button available"
					});
				},
				
				iPressOnRebase: function() {

					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton",
						matchers: new sap.ui.test.matchers.Properties({
							icon: "sap-icon://watt/rebase"
						}),

						success: function(aButton) {
							aButton[0].firePress();
						},

						errorMessage: "No Rebase button available"
					});
				},

				iPressOnRemoveBranch: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							icon: "sap-icon://less"
						}),

						success: function(aButton) {
							ok(aButton[0], "Clicked on Add Branch");
							this.simulate.click(aButton[0]);
						},

						errorMessage: "No Remove branch button available"
					});
				},

				iPressOnReset: function() {
				    var buttonName = "Reset";

					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.watt.ideplatform.plugin.gitclient.ui.AnimatedButton",
						matchers: new sap.ui.test.matchers.Properties({
						    icon: "sap-icon://watt/reset"
						}),

						success: function(aButton) {
							ok(aButton[0], "Clicked on " + buttonName +" Button ");
							this.simulate.click(aButton[0]);
							
							return this.waitFor({
							    pollingInterval: 1000,
							    
							    success: function() {
							        ok(true, "Clicked on " + buttonName);
							    },
							    
							    errorMessage: buttonName + " button not available"
							});
						},

						errorMessage: buttonName + " button not available"
					});
				},

				iPressOnStageAll: function() {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.TriStateCheckBox",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gitPane_stageall")
						}),

						success: function(aCheckBox) {
							ok(aCheckBox[0], "Clicked on Stage All check box");
							aCheckBox[0].setSelectionState("Checked");
							aCheckBox[0].fireChange();
						},

						errorMessage: "No Stage all button available"
					});
				},

				iAddCommitDescription: function(sText) {

					return this.waitFor({
						controlType: "sap.ui.commons.TextArea",
						matchers: new sap.ui.test.matchers.Properties({
							placeholder: i18nModel.getProperty("gitPane_commit_description_here")
						}),

						success: function(aTextArea) {

							ok((aTextArea[0].setValue(sText)), "Write in commit description");
							aTextArea[0].fireLiveChange();
						},

						errorMessage: "No Description text area available"
					});
				},

				iPressOnCommit: function() {

					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gitPane_button_commit")
						}),

						success: function(aButton) {
							ok(aButton[0], "Clicked on Commit Button ");
							this.simulate.click(aButton[0]);

							return this.waitFor({
							    pollingInterval: 1000,
							    
							    success: function() {
							        ok(true, "Clicked on Commit");
							    },
							    
							    errorMessage: "Commit button not available"
							});
						},

						errorMessage: "No Commit button available"
					});
				},

				iPressOnPush: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.MenuButton",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gitPane_button_push")
						}),

						success: function(aButton) {
							ok(aButton[0], "Clicked Push Button");
							this.simulate.click(aButton[0]);
						},

						errorMessage: "No Push button available"
					});
				},

				iPressOnPushRemoteBranch: function() {

					return this.waitFor({
						pollingInterval: 8000,
						controlType: "sap.ui.commons.MenuItem",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("git_pushMenu_currentRemoteBranch")
						}),

						success: function(aButton) {
							ok(aButton[0], "Clicked Push Remote Branch Button");
							aButton[0].fireSelect();
						},

						errorMessage: "No Push Remote Branch Button available"
					});
				},
				
				iPressOnPushMasterBranch: function() {

					return this.waitFor({
						pollingInterval: 8000,
						controlType: "sap.ui.commons.MenuItem",
						matchers: new sap.ui.test.matchers.Properties({
							text: "origin/master"
						}),

						success: function(aButton) {
							ok(aButton[0], "Clicked Push Master Branch Button");
							aButton[0].fireSelect();
						},

						errorMessage: "No Push Master Branch Button available"
					});
				},

				iPressOnAmend: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.CheckBox",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("gitPane_amend_changes")
						}),

						success: function(aCheckBox) {
							ok(aCheckBox[0], "Clicked on Add Branch");
							aCheckBox[0].setChecked(true);
							//aCheckBox[0].fireChange();
						},

						errorMessage: "No button available"
					});
				},

				iChangeBranch: function(sName) {

					return this.waitFor({
						controlType: "sap.ui.commons.DropdownBox",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: i18nModel.getProperty("gitPane_branch")

						}),

						success: function(aDropdownBox) {

							ok(aDropdownBox[0], "Git Pane is opened");
							this.simulate.click(aDropdownBox[0]);
							this.simulate.click(aDropdownBox[0]);
							aDropdownBox[0].setValue(sName);
							aDropdownBox[0].fireChange({
								newValue: sName
							});
							this.simulate.press("jQuery.sap.KeyCodes.ENTER");

						},

						errorMessage: "No drop box was found"
					});
				}
			},
			assertions: {

				iSeeGitPane: function(bState) {
					return _isGItPaneOpened.call(this, function(bIsOpened) {
						if (bState && !bIsOpened) {
							ok("the git pane is opened");
						} else if (!bState && bIsOpened) {
							ok("the git pane is closed");
						} else {
							ok(true, "The git pane is opened");
						}
					});
				},

				iSeeAddBranchDialog: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITBranchesDialog_create_new_branch")
						}),

						success: function(aDialog) {
							ok(aDialog[0], "the dialog is opened");
						},
						errorMessage: "There was no dialog"
					});
				}, //function

				isBranchChosen: function(sName) {
					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.ui.commons.DropdownBox",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: i18nModel.getProperty("gitPane_branch")
						}),
						success: function(aDropdownBox) {
							ok((aDropdownBox[0]._sTypedChars === sName), "the Branch is chosen");
						},
						errorMessage: "No input field available"
					});
				},

				iHaveNumberOfBranches: function(iNumber) {
					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.ui.commons.DropdownBox",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: i18nModel.getProperty("gitPane_branch")
						}),
						success: function(aDropdownBox) {
							ok((aDropdownBox[0].getItems().length === iNumber), "there are " + iNumber + " branches");
						},
						errorMessage: "wrong number of branches"
					});
				},

				iDontSeeCommitDescription: function() {
					return this.waitFor({
						controlType: "sap.ui.commons.TextArea",
						matchers: new sap.ui.test.matchers.Properties({
							placeholder: i18nModel.getProperty("gitPane_commit_description_here")
						}),

						success: function(aTextArea) {
							ok(!aTextArea[0].getValue(), "Commit description is empty");
						},

						errorMessage: "Commit description is not empty"
					});
				},
				
				iSeeNumberOfFilesInStageTable: function(iNumber) {
					return this.waitFor({
						pollingInterval: 6000,
						controlType: "sap.ui.table.Table",
						matchers: new sap.ui.test.matchers.Properties({
							id: "gitStageTable"
						}),
						success: function(aTable) {
                    		var aStagingTableFiles = aTable[0].getBinding().getModel().getData().results;
							ok((aStagingTableFiles.length === iNumber), "There are " + iNumber + " files");
						},
						errorMessage: "wrong number of files"
					});
				},
				
				iSeeFetchDialog: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITFetchDialog_changes_fetched")
						}),

						success: function(aDialog) {
							ok(aDialog[0], "the Fetch Data Dialog is opened");
						},
					    errorMessage: "No Fetch Data dialog is opened"
					});
				},
				
				iSeeRebaseDialog: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: "Rebase \"master\" onto a Different Branch"
						}),

						success: function(aDialog) {
							ok(aDialog[0], "the Rebase Dialog is opened");
						},
					    errorMessage: "No Rebase dialog is opened"
					});
				},
				
				iSeeTagsOnCommit: function(sTags){
                    return this.waitFor({
						controlType: "sap.ui.layout.Grid",
						matchers: new sap.ui.test.matchers.Properties({
							id: "gitHistoryTagsGrid_id"
						}),

						success: function(oGrid) {
							ok(oGrid[0] && oGrid[0].getContent().length > 1, "Tags Exists");
							var oTagsTextLabel = oGrid[0].getContent()[1];
							ok(oTagsTextLabel.getText() === sTags, "Tags Contain Correct Values");
						},
                        errorMessage: "No Tags On Commit"
					});
				}
			} //assertion
		}, //inTheGitPane
		
		inTheGitHistoryPane : {

			baseClass: WebIDEBase,

			actions: {
			    iSeeGitLogPane: function() {
					return this.waitFor({
						controlType: "sap.ui.commons.Panel",
						matchers: new sap.ui.core.Title({
            				text: i18nModel.getProperty("gitLogPane_Log")
            			}),

						success: function(aDialog) {
							ok(aDialog[0], "the Git History Pane is opened");
						},
					    errorMessage: "No Git History Pane is opened"
					});
				},
				
				iClickTag: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: i18nModel.getProperty("gitLogPane_Tag")
						}),

						success: function(aButton) {
							ok(aButton[0], "Tag button");
							aButton[0].firePress();

						},
						errorMessage: "No Tag button available"
					}); //success
				}
			},
			assertions: {
                iHaveHistoryRecords: function() {
					return this.waitFor({
						controlType: "sap.watt.ideplatform.plugin.gitclient.ui.GitVersionGraph",
						matchers: new sap.ui.test.matchers.Properties({
							path: "/commitsTree"
						}),
						success: function(aHistoryGraph) {
							ok((aHistoryGraph[0].getCommitsTree().length > 0 ), "there are " + aHistoryGraph[0].getCommitsTree().length + " of history commits");
						},
						errorMessage: "wrong number of history records"
					});
				},
				
				iSeeANewDetailDialog: function(sDialogTitle) {
					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty(sDialogTitle)
						}),
						success: function(aDialog) {
							ok(aDialog[0], "the dialog is opened");
						},
						errorMessage: "There was no clone dialog"
					});

				},
				
				iSeeTagIconWithTooltip: function(sTooltip) {
					return this.waitFor({
						controlType: "sap.ui.commons.Label",
						matchers: new sap.ui.test.matchers.Properties({
							icon: "sap-icon://tag"
						}),
						success: function(aLabel) {
                            var bFound = false;
                            for (var i = 0; i < aLabel.length; i++) {
                                var oRichTooltip = aLabel[i].getTooltip();
                                if (oRichTooltip.getText() === sTooltip) {
                                    bFound = true;
                                    break;
                                }
                            }
                            ok(bFound, "the Tag Icon is seen");
						},
						errorMessage: "Tag Icon isn't available"
					});

				}
				
			}
		},
		
		inNewDetailDialog :{
		    baseClass: WebIDEBase,
		    
		    actions: {
				iClickOK: function(sDialogTitle) {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty(sDialogTitle)
						}),

						success: function(aDialog) {
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				},
				
				iEnterText: function(sText) {
					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.TextField",
						success: function(aInputField) {
							aInputField[0].setValue(sText);
							aInputField[0].fireChange({
								newValue: sText
							});
						},
						errorMessage: "No input field available"
					});
				}
		    }
		},

		inTheAddBranchDialog: {

			baseClass: WebIDEBase,

			actions: {

				isAddBranchDialogOpen: function() {
					return this.waitFor({
						title: "Create a New Branch"
					});
				},

				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITBranchesDialog_create_new_branch")
						}),

						success: function(aDialog) {
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				},

				iClickCancel: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("button_cancel")
						}),

						success: function(aButton) {
							ok(true, "Clicked on Cancel");
							this.simulate.click(aButton[0]);
						},

						errorMessage: "No button available"
					});
				},

				iEnterBranchName: function(sName) {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.TextField",
						matchers: new sap.ui.test.matchers.Properties({
							placeholder: "Insert new branch name here"
						}),
						success: function(aInputField) {
							aInputField[0].setValue(sName);
							aInputField[0].fireChange({
								newValue: sName
							});
						},
						errorMessage: "No input field available"
					});
				}

			}
		}, //inTheAddBranchDialog

		inTheRemoveBranchDialog: {

			baseClass: WebIDEBase,

			actions: {

				isAddBranchDialogOpen: function() {
					return this.waitFor({
						title: "Delete Branch"
					});
				},

				iClickDelete: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITDeleteBranchDialog_delete_branch")
						}),

						success: function(aDialog) {
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_delete")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on Delete");
										},
										errorMessage: "No Delete button available"
									});
								}
							});
						}
					}); //success
				},

				iClickCancel: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("button_cancel")
						}),

						success: function(aButton) {
							ok(true, "Clicked on Cancel");
							this.simulate.click(aButton[0]);
						},

						errorMessage: "No button cancel available"
					});
				},

				iChooseBranchName: function(sName) {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.TriStateCheckBox",
						
						success: function(aTCheckBox) {
						    aTCheckBox[0].setSelectionState("Checked");
						    ok((aTCheckBox[0].fireChange()), "the Branch is chosen");
						},
						errorMessage: "No checkbox available"
					});
				}

			},
			assertions: {

				isBranchChosen: function(sName) {
					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.DropdownBox",
						matchers: new sap.ui.test.matchers.Properties({
							tooltip: i18nModel.getProperty("gitPane_branch")
						}),
						success: function(aDropdownBox) {
							ok((aDropdownBox[0]._sTypedChars === sName), "the Branch is chosen");
						},
						errorMessage: "No input field available"
					});
				},

				iSeeRemoveBranchDialog: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITDeleteBranchDialog_delete_branch")
						}),

						success: function(aDialog) {
							ok(aDialog[0], "the dialog remove branch is opened");
						},
						errorMessage: "There was no remove branch dialog"
					});
				} //function

			} //assertion
		}, //inTheRemoveBranchDialog

		inThePushDialog: {

			baseClass: WebIDEBase,

			actions: {

				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							id: "FetchAuthenticationDialog"
						}),

						success: function(aDialog) {

							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				},

				iClickCancel: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							text: i18nModel.getProperty("button_cancel")
						}),

						success: function(aButton) {
							ok(true, "Clicked on Cancel");
							this.simulate.click(aButton[0]);
						},

						errorMessage: "No button available"
					});
				},

				iEnterUserPassword: function(sUserName, sPassword) {
				    
				    var _sUserName = sUserName || "gitclienttester";
				    var _sPassword = sPassword || "SAPWebIDE1";

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.TextField",
						/* matchers : new sap.ui.test.matchers.Properties({
                                 placeholder: "Insert new branch name here"
                            })*/
						success: function(aInputField) {

							aInputField[0].setValue(_sUserName);
							aInputField[0].fireChange({
								newValue: _sUserName
							});

							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.PasswordField",
								matchers: new sap.ui.test.matchers.Properties({
									placeholder: i18nModel.getProperty("fetchAuthentication_insert_password_here")
								}),

								success: function(aPasswordField) {
									aPasswordField[0].setValue(_sPassword);
									aPasswordField[0].fireChange({
										newValue: _sPassword
									});

								},
								errorMessage: "No input field available"
							});

						},
						errorMessage: "No input field available"
					});
				}

			},
			assertions: {

				isAuthenticationDialogOpen: function() {
					return this.waitFor({
						//pollingInterval : 3000,  
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							id: "FetchAuthenticationDialog"
						}),

						success: function(aDialog) {

							ok(aDialog[0], "the Authentication Dialog is opened");
						},

						errorMessage: "No Authentication dialog is opened"
					});
				}
			} //assertion
		}, //inThePushBranchDialog

		inTheResetDialog: {

			baseClass: WebIDEBase,

			actions: {

				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITRebaseDialog_reset_title")
						}),

						success: function(aDialog) {
							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				},

				iSelectResetType: function(sResetType) {

					return this.waitFor({
						pollingInterval: 3000,
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITRebaseDialog_reset_title")
						}),

						success: function(aDialog) {
							return this.waitFor({
                                controlType: "sap.ui.commons.RadioButtonGroup",
								matchers: new sap.ui.test.matchers.Properties({
                                    selectedIndex: 0
								}),
								success: function(aRBG) {
								    var rgb = aRBG[0];
								    var item;
								    if (sResetType === "Mixed") {
								        item = rgb.getItems()[0];
    									ok((item.getText() === i18nModel.getProperty("gITRebaseDialog_reset_type_mixed")), "Reset type on mixed");
								    } else if (sResetType === "Hard") {
								        item = rgb.getItems()[1];
    									ok((item.getText() === i18nModel.getProperty("gITRebaseDialog_reset_type_hard")), "Reset type on hard");
								    }
        							rgb.setSelectedItem(item);
									return this.waitFor({
										pollingInterval: 1000,

										success: function() {
        							        ok(true, "Clicked on rest type" + sResetType);
										},
										errorMessage: "Reset Type radio button not available"
									});

								}

							});
						}
					}); //success
				},
				
				iPressOKConfirm: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Button",
						matchers: new sap.ui.test.matchers.Properties({
							id: "MSG_CONFIRM--btn-OK"
						}),

						success: function(aButton) {
							ok(aButton[0], "the OK button is pressed");
							this.simulate.click(aButton[0]);
						},
						errorMessage: "No OK button available"

					}); //success
				}
				

			},
			assertions: {

				isResetDialogOpen: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITRebaseDialog_reset_title")
						})
					});
				}

			} //assertion
		}, //inTheResetDialog

		inTheFetchDialog:{
		    
		    baseClass: WebIDEBase,
		    
			actions: {
			    
				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: i18nModel.getProperty("gITFetchDialog_changes_fetched")
						}),

						success: function(aDialog) {

							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				}
			}
		},
		
		inTheRebaseDialog:{
		    
		    baseClass: WebIDEBase,

			actions: {
			    
				iClickOK: function() {

					return this.waitFor({
						controlType: "sap.ui.commons.Dialog",
						matchers: new sap.ui.test.matchers.Properties({
							title: "Rebase \"master\" onto a Different Branch"
						}),

						success: function(aDialog) {

							return this.waitFor({
								pollingInterval: 3000,
								controlType: "sap.ui.commons.Button",
								matchers: new sap.ui.test.matchers.Properties({
									text: i18nModel.getProperty("button_ok")
								}),

								success: function(aButton) {
									this.simulate.click(aButton[0]);
									return this.waitFor({
										pollingInterval: 6000,

										success: function() {
											ok(!aDialog[0].isOpen(), "Clicked on OK");
										},
										errorMessage: "No OK button available"
									});
								}
							});
						}
					}); //success
				}
			}
		}
		
	});

});