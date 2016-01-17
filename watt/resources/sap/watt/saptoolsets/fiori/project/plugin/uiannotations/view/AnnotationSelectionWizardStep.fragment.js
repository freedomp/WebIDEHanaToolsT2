sap.ui
	.jsfragment(
		"sap.watt.saptoolsets.fiori.project.plugin.uiannotations.view.AnnotationSelectionWizardStep", {
			createContent: function(oController) {
				var oTextView = new sap.ui.commons.TextView("annotationStepDescTV",{
					text: "{i18n>annotationSelectionWizardStep_stepDescription}",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}).addStyleClass("oTextView");
				
				var oServiceAnnoTextView = new sap.ui.commons.TextView({
					text: "{i18n>annotationSelectionWizardStep_oSelectedAnnotation}",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					}),
					visible:  {
						path: "/aAnntoationUrls",
						formatter: function(aAnntoationUrls) {
								if( aAnntoationUrls  && aAnntoationUrls.length > 0){
									return true;
								}
								return false;
							},
							useRawValues: true
					}
				}).addStyleClass("oTextView");

				var oAddAnnotationsMenuButton = new sap.ui.commons.MenuButton({
					lite: true,
					text: "{i18n>annotationSelectionWizardStep_button_add_annotation_files}",
					icon: "sap-icon://add"
				}).addStyleClass("oMenuButton");

				//Create the menu
				var oAnnotationsSourcesMenu = new sap.ui.commons.Menu("menu1");

				var oMenuItem1 = new sap.ui.commons.MenuItem("item_from_service", {
					text: "{i18n>annotationSelectionWizardStep_add_from_service}"
				});
				oAnnotationsSourcesMenu.addItem(oMenuItem1);
				var oMenuItem2 = new sap.ui.commons.MenuItem("item_file_system", {
					text: "{i18n>annotationSelectionWizardStep_add_from_filesystem}"
				});
				oAnnotationsSourcesMenu.addItem(oMenuItem2);
				var oMenuItem3 = new sap.ui.commons.MenuItem("item_workspace", {
					text: "{i18n>annotationSelectionWizardStep_add_from_workspace}"
				});
				oAnnotationsSourcesMenu.addItem(oMenuItem3);
				var oMenuItem4 = new sap.ui.commons.MenuItem("item_annotation_url", {
					text: "{i18n>annotationSelectionWizardStep_add_from_pasteUrl}"
				});
				oAnnotationsSourcesMenu.addItem(oMenuItem4);

				var that = this;
				oAddAnnotationsMenuButton.setMenu(oAnnotationsSourcesMenu);
				oAddAnnotationsMenuButton.attachItemSelected(function(oEvent) {
					switch (oEvent.getParameter("itemId")) {
						case "item_from_service":
							that.openFromServiceDialog(that, oController);
							break;
						case "item_file_system":
							that.openFromFileSystemDialog(that, oController);
							break;
						case "item_workspace":
							that.openFromWorkspaceDialog(that, oController);
							break;
						case "item_annotation_url":
							that.openFromAnnotationUrlDialog(that, oController);
							break;
					}
				});

				var mainGrid = new sap.ui.layout.Grid({
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				});

				//Create an instance of the table control
				this.oAnnotationsTable = new sap.ui.table.Table("annotationsTbl", {
					width: "80%",
					enableColumnReordering: false,
					visibleRowCount: 5
				}).addStyleClass("oTable");
				this.oAnnotationsTable.addExtension(oAddAnnotationsMenuButton);

				this.oAnnotationsTable.addDelegate({
					onAfterRendering: function() {
						this.$().find('TR').each(function() {

							var icon = $(this).find('.hoverVisible');
							$(this).hover(function() {
								icon.css({
									"opacity": "1"
								});
							}, function() {
								icon.css('opacity', 0);
							});
						});
						// to bring the oTextView closer the step title (as if it the step description)
						$('.sapUiRespGridBreak > .sapUiRespGrid > .sapUiRespGridSpanL12:contains("Annotation Selection")').css("margin-bottom", "0.5rem");
					}
				}, this.oAnnotationsTable);

				var oTemplate = new sap.ui.commons.layout.HorizontalLayout({

					content: [
                    new sap.ui.commons.Button({
							lite: true,
							icon: "sap-icon://less",
							press: function(oEvent) {
								var iRowIndex = oEvent.getSource().getParent().getParent().getIndex();
								oController.removeAnnotationFromModel(iRowIndex);
							},
							visible: {
								path: "uiModel>bIsMetaData",
								formatter: function(bIsMetaData) {
									return !bIsMetaData;
								},
								useRawValues: true
							}
						}).addStyleClass('hoverVisible'),
                    new sap.ui.commons.Button({
							lite: true,
							icon: "sap-icon://arrow-top",
							press: function(oEvent) {
								var iRowIndex = oEvent.getSource().getParent().getParent().getIndex();
								oController.changeAnnotationPriority(iRowIndex, iRowIndex - 1);

							},
							visible: {
								path: "uiModel>bIsMetaData",
								formatter: function(bIsMetaData) {
									return !bIsMetaData;
								},
								useRawValues: true
							}
						}).addStyleClass('hoverVisible'),
                    new sap.ui.commons.Button({
							lite: true,
							icon: "sap-icon://arrow-bottom",
							press: function(oEvent) {
								var iRowIndex = oEvent.getSource().getParent().getParent().getIndex();
								oController.changeAnnotationPriority(iRowIndex, iRowIndex + 1);

							},
							visible: {
								path: "uiModel>bIsMetaData",
								formatter: function(bIsMetaData) {
									return !bIsMetaData;
								},
								useRawValues: true
							}
						}).addStyleClass('hoverVisible')


                ]
				}).addStyleClass("alignRight");

				var oColumnIndex = new sap.ui.table.Column({
					width: "15%",
					label: new sap.ui.commons.Label({
						text: "{i18n>annotationSelectionWizardStep_Rank}"
					}),
					template: new sap.ui.commons.TextView({
						text: "{uiModel>rowIndex}"
					})
				});

				this.oAnnotationsTable.addColumn(oColumnIndex);

				var oColumn0 = new sap.ui.table.Column({
					width: "35%",
					label: new sap.ui.commons.Label({
						text: "{i18n>annotationSelectionWizardStep_Name}"
					}),
					template: new sap.ui.commons.Link({
						text: "{uiModel>name}",
						href: "{uiModel>url}",
						target: "_blank"
					})
				});

				this.oAnnotationsTable.addColumn(oColumn0);

				var oColumn1 = new sap.ui.table.Column({
					width: "20%",
					label: new sap.ui.commons.Label({
						text: "{i18n>annotationSelectionWizardStep_Source}"
					}),

					template: new sap.ui.commons.TextView({
						text: "{uiModel>source}"
					})
				});
				this.oAnnotationsTable.addColumn(oColumn1);

				//Define the columns and the control templates to be used
				var oColumn2 = new sap.ui.table.Column({
					width: "30%",
					template: oTemplate
				});
				this.oAnnotationsTable.addColumn(oColumn2);

				//Create a model and bind the table rows to this model
				//				this.oAnnotationsTable.setColumnHeaderVisible(false);

				var oLayout2 = new sap.ui.layout.VerticalLayout("Layout2", {
					layoutData: new sap.ui.layout.GridData({
						span: "L9 M9 S9"
					}),
					content: [oTextView,oServiceAnnoTextView, this.oAnnotationsTable]
				});
				mainGrid.addContent(oLayout2);

				return mainGrid;
			},

			openFromServiceDialog: function(context, oController) {
				var oDialog1 = new sap.ui.commons.Dialog({
					resizable : false,
					width : "30%"
				});
				var oAnnotationsFromServiceModel = new sap.ui.model.json.JSONModel();
				var btnOK;
				oDialog1.setTitle(this.oController.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_Add_From_Service_title"));
				var dataObject = {
					data: oController.getModel().getProperty("/aAnntoationUrls")
				};
				if (!dataObject.data) {
					dataObject.data = [];
				}
				// create the row repeater control
				var oRowRepeater = new sap.ui.commons.RowRepeater();
				var sErrorMsgNoAnnotationsFiles = this.oController.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_NoData");
				oRowRepeater.setNoData(new sap.ui.commons.TextView({
					text: sErrorMsgNoAnnotationsFiles
				}));
				oRowRepeater.setDesign("Transparent");

				var oRowTemplate = new sap.ui.commons.layout.MatrixLayout({
					layoutFixed: true,
					columns: 1,
					width: "100%"

				});

				var matrixRow, matrixCell, control;
				matrixRow = new sap.ui.commons.layout.MatrixLayoutRow();
				// selected checkbox
				control = new sap.ui.commons.CheckBox();
				control.bindProperty("checked", {
					path: "selected",
					mode: sap.ui.model.BindingMode.TwoWay
				});
				control.bindProperty("text", "Description");
				control.attachChange(function(oEvent) {
					var sBindingPathInModel = oEvent.getSource().getBindingContext().sPath;
					var oViewInModel = this.getModel().getObject(sBindingPathInModel);
					if (oEvent.getParameters().checked) {
						oViewInModel.selected = true;
						oAnnotationsFromServiceModel.setProperty("/bAtLeastOneFileWasSelected", true);
						this.getModel().refresh();
					} else {
						oViewInModel.selected = false;
						var bAtLeastOneFileWasSelected = false;
						for (var i = 0; i < this.getModel().oData.data.length; i++) {
							if (this.getModel().oData.data[i].selected) {
								bAtLeastOneFileWasSelected = true;
							}
						}
						oAnnotationsFromServiceModel.setProperty("/bAtLeastOneFileWasSelected", bAtLeastOneFileWasSelected);
						this.getModel().refresh();
					}
				});

				control.setWidth("100%");
				matrixCell = new sap.ui.commons.layout.MatrixLayoutCell();
				matrixCell.addContent(control);
				matrixCell.setPadding(sap.ui.commons.layout.Padding.Both);
				matrixRow.addCell(matrixCell);

				oAnnotationsFromServiceModel.setData(dataObject);

				oRowRepeater.setModel(oAnnotationsFromServiceModel);
				oRowTemplate.addRow(matrixRow);
				oRowRepeater.bindRows("/data", oRowTemplate);

				oDialog1.addContent(oRowRepeater);
				btnOK = new sap.ui.commons.Button({
					text: "OK",
					enabled: {
						path: "/bAtLeastOneFileWasSelected",
						formatter: function(bOKBtnShouldBeEnable) {
							if (bOKBtnShouldBeEnable === undefined) {
								var bAtLeastOneFileWasSelected = false;
								if (this.getModel().oData.data) {
									for (var i = 0; i < this.getModel().oData.data.length; i++) {
										if (this.getModel().oData.data[i].selected) {
											bAtLeastOneFileWasSelected = true;
										}
									}
								}
								return bAtLeastOneFileWasSelected;
							}
							return bOKBtnShouldBeEnable;
						}
					},
					press: function() {
						oController.onAddServAnnotationOkButtonPressed();
						oDialog1.close();
					}

				});
				btnOK.setModel(oAnnotationsFromServiceModel);

				oDialog1.addButton(btnOK);
				oDialog1.addButton(new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						oDialog1.close();
					}
				}));
				oDialog1.setModal(true);
				oDialog1.open();
			},

			openFromFileSystemDialog: function(context, oController) {
				var oDialog1 = new sap.ui.commons.Dialog({
					resizable : false,
					width : "30%"
				});
				oDialog1.setTitle(this.oController.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_Add_From_FileSystem_title"));
				var btnOK;
				oDialog1.addContent(new sap.ui.commons.TextView({
					text: "{i18n>annotationSelectionWizardStep_select_a_file}"
				}));

				var oFileUploader = new sap.ui.commons.FileUploader({
					value: "{uiModel>sFileUploaderText}",
					fileType: ["xml"],
					mimeType: ["text/xml"],
					uploadOnChange: true,
					width: "100%",
					change: function(oEvent) {
						oController.onFileUploaderChange(oEvent);
						if (btnOK) {
							btnOK.setEnabled(true);
						}
					},
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}).addStyleClass("selecteAnnotationFileUploader");

				oDialog1.addContent(oFileUploader);
				btnOK = new sap.ui.commons.Button({
					text: "OK",
					enabled: false,
					press: function() {
						oController.onFileUploadOkPresses();
						oDialog1.close();
					}
				});
				oDialog1.addButton(btnOK);
				oDialog1.addButton(new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						oDialog1.close();
					}
				}));
				oDialog1.setModal(true);
				oDialog1.open();
			},

			openFromWorkspaceDialog: function(context, oController) {
				var oDialog1 = new sap.ui.commons.Dialog({
					resizable : false,
					width : "30%"
				});
				oDialog1.setTitle(this.oController.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_Add_From_Workspace_title"));
				var btnOK;
				var oRepositoryBrowserVisibilityContainer = new sap.watt.saptoolsets.fiori.project.plugin.uiannotations.ui.VisibilityContainer({
					visible: true,
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					})
				}).addStyleClass("selecteAnnotationRepositoryBrowser selecteAnnotationStepBottomMargin");

				oController.onRepositoryBrowserSelect().then(function(oGrid) {
					if (oGrid) {
						oRepositoryBrowserVisibilityContainer.addContent(oGrid);
						oDialog1.addContent(oRepositoryBrowserVisibilityContainer);

						oGrid.getContent()[0].attachSelectionChange(function(oEvent) {

							var aSelectedNode = oEvent.getParameter("nodes");
							var sFileName = aSelectedNode[0].getText();
							var regex = new RegExp("([a-zA-Z]:(\\w+)*\\[a-zA-Z0_9]+)?\.(xml)$");
							if (regex.test(sFileName) && btnOK) {
								btnOK.setEnabled(true);
							} else {
								btnOK.setEnabled(false);
							}
						});

						btnOK = new sap.ui.commons.Button({
							text: "OK",
							enabled: false,
							press: function() {
								oController.onRepositoryBrowserOKPressed();
								oDialog1.close();
							}
						});
						oDialog1.addButton(btnOK);
						oDialog1.addButton(new sap.ui.commons.Button({
							text: "Cancel",
							press: function() {
								oDialog1.close();
							}
						}));
						oDialog1.setModal(true);
						oDialog1.open();
					}
				}).done();
			},

			openFromAnnotationUrlDialog: function(context, oController) {
				var oDialog1 = new sap.ui.commons.Dialog({
					resizable : false,
					width : "30%"
				});
				oDialog1.setModal(true);
				oDialog1.setTitle(this.oController.getContext().i18n.getText("i18n", "annotationSelectionWizardStep_Add_From_url_title"));
				var oPasteURLComboBox;
				var oPasteUrlTextField;
				var btnOK;
				var oErrorTextView = new sap.ui.commons.TextView({
					width: "100%",
					wrapping: false,
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					}),
					semanticColor: sap.ui.commons.TextViewColor.Negative
				}).addStyleClass("errorTextView");

				oPasteURLComboBox = new sap.ui.commons.DropdownBox({
					width: "100%",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M12 S12"
					}),
					placeholder: "{i18n>annotationSelectionWizardStep_select_system}",
					visible: true,
					change: function(oEvent) {
						oController._onDestinationComboBoxChange(oEvent);
						if (oEvent.getParameter("newValue") && oPasteUrlTextField.getValue().trim().length > 0) {
							btnOK.setEnabled(true);
						} else {
							btnOK.setEnabled(false);
						}
					}
				});

				// oDialog1.addContent(oPasteURLComboBox);
				if (oPasteURLComboBox.getItems() && oPasteURLComboBox.getItems().length === 0) {
					oController._populateConnections(oPasteURLComboBox);
				}

				oPasteUrlTextField = new sap.ui.commons.TextField({
					width: "100%",
					layoutData: new sap.ui.layout.GridData({
						span: "L12 M9 S12"
					}),
					placeholder: "{i18n>annotationSelectionWizardStep_paste_url_here}",
					tooltip: "{i18n>annotationSelectionWizardStep_urltextfield_placeholder}",
					value: "{uiModel>sPasteUrlTextFieldValue}",
					visible: true,
					liveChange: function(oEvent) {
						oController._onPasteURL(oEvent);
						if (oEvent.getParameter("liveValue")) {
							btnOK.setEnabled(true);
						} else {
							btnOK.setEnabled(false);
						}

					}
				}).addStyleClass("selecteAnnotationStepBottomMargin");
				oController._resetInputState(oPasteUrlTextField);

				var oGridForm = new sap.ui.layout.Grid({
					content: [oErrorTextView, oPasteURLComboBox, oPasteUrlTextField]
				});
				oDialog1.addContent(oGridForm);
				btnOK = new sap.ui.commons.Button({
					text: "OK",
					enabled: false,
					press: function() {
						oController.onPasteUrlPressOk().then(function(result) {
							if (result && !result.isValid && result.errMsg) {
								oErrorTextView.setText(result.errMsg);
							} else {
								oErrorTextView.setText("");
								oDialog1.close();
							}
						}).fail(function(result){
							oErrorTextView.setText(result.errMsg);
						});

					}
				});
				oDialog1.addButton(btnOK);
				oDialog1.addButton(new sap.ui.commons.Button({
					text: "Cancel",
					press: function() {
						oDialog1.close();
					}
				}));
				oDialog1.open();
			}
		});