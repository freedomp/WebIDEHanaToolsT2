/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(
		[ "../model/AnalyticPrivilegeModel",
				"sap/watt/ideplatform/che/plugin/chebackend/dao/File" ],
		function(AnalyticPrivilegeModel, FileService) {
			var extension = ".hdbanalyticprivilege";
			var extensionLength = extension.length;

			var NewAnalyticPrivilegeDialog = function(attributes) {
				this.fileService = FileService;
				this.folderDocument = attributes.folderDocument;
				this.fileDocument = attributes.fileDocument;
				this.entries = attributes.entries;
				this.context = attributes.context;
				this._onCreate = attributes.createCallback;
				this.namespace;
				this.fillNameSpace();
			};
			NewAnalyticPrivilegeDialog.prototype = {};

			NewAnalyticPrivilegeDialog.prototype.stripExtension = function(name) {
				var nameLength = name.length;
				if (nameLength > extensionLength
						&& name.substring(nameLength - extensionLength) === extension) {
					return name.substring(0, nameLength - extensionLength);
				} else {
					return name;
				}
			};
			NewAnalyticPrivilegeDialog.prototype.fillNameSpace = function() {
				var that = this;
				if (this.folderDocument) {
					var folderPath = this.folderDocument.getEntity()
							.getBackendData().getProjectUrl();
					var projectPath = folderPath.substring(0, folderPath
							.indexOf(this.folderDocument.getEntity()
									.getBackendData().getLocationUrl()));
					var fullFilePath = projectPath
							+ "/file"
							+ this.folderDocument.getEntity().getBackendData()
									.getLocationUrl();
					var names = fullFilePath.split("/");
					var srcFolderPath;
					if (names.length > 2) {
						for (var i = 1; i < names.length; i++) {
							if (names[i] !== "src") {
								if (srcFolderPath)
									srcFolderPath = srcFolderPath + "/"
											+ names[i];
								else
									srcFolderPath = names[i];
							} else {
								srcFolderPath = srcFolderPath + "/" + names[i];
							}
						}
					}
					var result = this.fileService.readFileContent(
							srcFolderPath + "/.hdinamespace", false).then(
							function(result) {
								that.namespace = JSON.parse(result).name;
							}).done();
				}

			};
			NewAnalyticPrivilegeDialog.prototype.alreadyExists = function(sName) {
				var that = this;
				sName = sName.toLowerCase() + extension;
				if (that.entries) {
					for (var i = 0; i < that.entries.length; i++) {
						if (that.entries[i].getEntity().getName().toLowerCase() === sName) {
							return true;
						}
					}
					return false;
				}
			};

			NewAnalyticPrivilegeDialog.prototype.openToolTip = function(
					message, control) {

				var tooltip = new sap.ui.commons.Callout({
				// open: onOpen
				});
				tooltip.addContent(new sap.ui.commons.TextView({
					semanticColor : sap.ui.commons.TextViewColor.Negative,
					design : sap.ui.commons.TextViewDesign.Bold,
					text : message,
					editable : false
				}));
				control.setTooltip(tooltip);
				// open the popup
				window.setTimeout(function() {
					var tip = control.getTooltip();
					if (tip instanceof sap.ui.commons.Callout) { // check
																	// whether
																	// the tip
																	// is still
																	// registered
																	// to
																	// prevent
																	// hanging
																	// tips that
																	// never
																	// close
						tip.openPopup(control);
					}
				}, 200);
			};

			NewAnalyticPrivilegeDialog.prototype.openDialog = function() {
				// TODO do we need to destroy the ui instances manually to
				// prevent memory leeks
				if (this.oDialog) {
					this.resetDialog();
				} else {
					this.createDialog();
				}
				this.oDialog.open();
			};
			NewAnalyticPrivilegeDialog.prototype.resetDialog = function() {
				this.oNameText.setValue(null);
			};

			NewAnalyticPrivilegeDialog.prototype.createDialog = function() {
				var that = this;

				this.oNameText = new sap.ui.commons.TextField({
					width : "100%",
					change : function(event) {
						var value = that.stripExtension(that.oNameText
								.getValue());
						if (value === "" || that.alreadyExists(value)) {
							that.oCreateButton.setEnabled(false);
						} else {
							if (that.oLabelText
									&& that.oLabelText.getValue() === "") {
								that.oLabelText.setValue(value);
							}
							that.oCreateButton.setEnabled(true);
						}
					},
					liveChange : function(event) {
						var value = that.oNameText.getLiveValue();
						if (value === "") {
							that.oCreateButton.setEnabled(false);
							that.openToolTip("{i18n>tol_name_empty}", event
									.getSource());
							event.getSource().setValueState(
									sap.ui.core.ValueState.Error);
							that.oCreateButton.setEnabled(false);
						} else if (that.alreadyExists(that
								.stripExtension(value))) {
							that.openToolTip("{i18n>tol_name_exists}", event
									.getSource());
							event.getSource().setValueState(
									sap.ui.core.ValueState.Error);
							that.oCreateButton.setEnabled(false);
						} else if (that.stripExtension(value).match(
								/^[\w]{1}[\w\.\-]*$/) === null) {
							that.openToolTip("{i18n>tol_name_unvalid}", event
									.getSource());
							event.getSource().setValueState(
									sap.ui.core.ValueState.Error);
							that.oCreateButton.setEnabled(false);
						} else {
							that.oCreateButton.setEnabled(true);
							event.getSource().setTooltip(null);
							event.getSource().setValueState(
									sap.ui.core.ValueState.None);
						}
					}
				});

				this.oNameText.onAfterRendering = function() {
					// TODO focus on open is not working

					that.oNameText.getDomRef().focus();
					that.oNameText.getFocusDomRef().focus();
					that.oNameText.getFocusInfo();
					that.oNameText.getInputDomRef().focus();
					var container = this.$();

					that.oNameText.addStyleClass("nameTextField");
					$(".nameTextField").focus();
					that.oNameText.focus();
					// container.focus();

					$(".newAnalyticPrivilegeDialogComboBox").css("margin-left",
							"5px");
				};

				var oNameLabel = new sap.ui.commons.Label({
					design : sap.ui.commons.LabelDesign.Standard,
					textDirection : sap.ui.core.TextDirection.Inherit,
					wrapping : true,
					text : "{i18n>txt_name}",
					visible : true,
					textAlign : sap.ui.core.TextAlign.Begin,
					// labelFor: this.oNameText,
					required : true
				});

				this.oLabelText = new sap.ui.commons.TextField({
					width : "100%"
				});
				var oLabelLabel = new sap.ui.commons.Label({
					design : sap.ui.commons.LabelDesign.Standard,
					textDirection : sap.ui.core.TextDirection.Inherit,
					wrapping : true,
					text : "{i18n>txt_label}",
					visible : true,
					textAlign : sap.ui.core.TextAlign.Begin,
					required : false
				// labelFor: this.oLabelText,

				});
				/*
				* this.oTypeComboBox = new sap.ui.commons.ComboBox({ editable :
				* true, value : "{i18n>txt_type_classical}", width : "100%" });
				* this.oTypeComboBox.addStyleClass("newAnalyticPrivilegeDialogComboBox");
				* this.oTypeComboBox.addEventDelegate({ onkeypress:
				* function(oEvent) { oEvent.preventDefault(); } });
				* 
				* 
				* var oItem = new sap.ui.core.ListItem({ text :
				* "{i18n>txt_type_classical}", key :
				* AnalyticPrivilegeModel.PrivilegeType.ANALYTIC_PRIVILEGE });
				* this.oTypeComboBox.addItem(oItem);
				* 
				* oItem = new sap.ui.core.ListItem({ text :
				* "{i18n>txt_type_sql}", key :
				* AnalyticPrivilegeModel.PrivilegeType.SQL_ANALYTIC_PRIVILEGE
				* }); this.oTypeComboBox.addItem(oItem);
				* 
				* var oTypeLabel = new sap.ui.commons.Label({ design:
				* sap.ui.commons.LabelDesign.Standard, textDirection:
				* sap.ui.core.TextDirection.Inherit, wrapping: true, text:
				* "{i18n>txt_type}", visible: true, textAlign:
				* sap.ui.core.TextAlign.Begin, required: false //labelFor:
				* this.oType... });
				*/
				var oLayout = new sap.ui.commons.layout.MatrixLayout({
					visible : true, // boolean
					layoutFixed : false, // boolean
					width : "100%",
					columns : 2, // int
					widths : [ "27%", "73%" ]
				});
				oLayout.createRow(oNameLabel, this.oNameText);
				oLayout.createRow(oLabelLabel, this.oLabelText);
				// oLayout.createRow(oTypeLabel, this.oTypeComboBox);

				this.oCreateButton = new sap.ui.commons.Button(
						{
							text : "{i18n>txt_create}",
							style : sap.ui.commons.ButtonStyle.Emph,
							enabled : false,
							press : function() {

								var sName = that.stripExtension(that.oNameText
										.getValue());
								var sFileName;
								if (sName !== that.oNameText.getValue()) {
									sFileName = that.oNameText.getValue();
								} else {
									sFileName = sName + extension;
								}

								var sLabel = that.oLabelText.getValue();
								// var sType =
								// that.oTypeComboBox.getSelectedKey();
								var sType = AnalyticPrivilegeModel.PrivilegeType.SQL_ANALYTIC_PRIVILEGE

								that.oDialog.close();

								that._onCreate(sName, sLabel, sType,that.namespace);
							}
						});

				var oCancelButton = new sap.ui.commons.Button({
					text : "{i18n>txt_cancel}",
					style : sap.ui.commons.ButtonStyle.Emph,
					press : function() {
						that.oDialog.close();
					}
				});

				this.oDialog = new sap.ui.commons.Dialog(
						{

							title : "{i18n>tit_new_analytic_privilege}",
							applyContentPadding : true,
							showCloseButton : false,
							resizable : false,
							contentBorderDesign : sap.ui.commons.enums.BorderDesign.Thik,
							modal : true,
							accessibleRole : sap.ui.core.AccessibleRole.Dialog,
							content : oLayout,
							buttons : [ this.oCreateButton, oCancelButton ],
							defaultButton : this.oCreateButton,
							keepInWindow : true,
							initialFocus : this.oNameText
						});

				jQuery.sap.require("jquery.sap.resources");
				var i18nModel = new sap.ui.model.resource.ResourceModel(
						{
							bundleUrl : "/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbanalyticprivilege/i18n/messageBundle.hdbtextbundle"
						});
				this.oDialog.setModel(i18nModel, "i18n");
				this.oNameText.focus();

			};
			return NewAnalyticPrivilegeDialog;
		});
