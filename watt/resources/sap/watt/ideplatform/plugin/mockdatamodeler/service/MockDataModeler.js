define(
	["sap/watt/common/plugin/platform/service/ui/AbstractPart"],
	function(AbstractPart) {
		"use strict";

		var MockDataModeler = AbstractPart
			.extend(
				"sap.watt.common.plugin.mockdatamodeler.service.MockDataModeler", {
					_oMainDialogfragment: null,
					_oComplexTypefragment: null,
					_oMetadata: null,
					_oDocument: null,

					getFocusElement: function() {
						return this.getContent();
					},

					configure: function(mConfig) {
						this._aStyles = mConfig.styles;
						if (this._aStyles) {
							this.context.service.resource.includeStyles(this._aStyles).done();
						}
					},

					init: function(mConfig) {
						this._oMainDialogfragment = sap.ui.jsfragment(
							"sap.watt.ideplatform.plugin.mockdatamodeler.ui.MockDataModeler", this);

						this._oComplexTypefragment = sap.ui.jsfragment(
							"sap.watt.ideplatform.plugin.mockdatamodeler.ui.ComplexTypeMockData", this);

						var oData = {
							entitySets: [],
							mockData: [],
							selectedEntitySet: "",
							isInputValid: true,
							inputViolations: 0,
							validationText: "",
							isDeleteEnabled: false,
							isDirty: false,
							skip: "",
							isUseAsMockDataSource: true
						};
						this._oMainDialogfragment.setModel(new sap.ui.model.json.JSONModel(oData));

						oData = {
							complexMockData: [],
							selectedBindingContext: null,
							selectedComplexName: null,
							isInputValid: true,
							inputViolations: 0,
							validationText: ""
						};
						this._oComplexTypefragment.setModel(new sap.ui.model.json.JSONModel(oData));

						this.context.i18n.applyTo([this._oMainDialogfragment, this._oComplexTypefragment]);

						jQuery.sap.require('sap.ui.core.format.DateFormat');
						var locale = sap.ui.getCore().getConfiguration().getLocale();
						var formatter = sap.ui.core.format.DateFormat.getDateInstance(locale);
						var isUTC = false;
						jQuery.sap.require("sap.ui.model.type.DateTime");
						sap.ui.model.type.DateTime.extend("my.model.types.JsonDateTime", {
							formatValue: function(oValue) {
								var oDate;
								if (oValue) {
									if (/\/Date\([0-9]+\)\//.test(oValue)) {
										oDate = new Date(parseInt(oValue.substr(6), 10));
									} else {
										oDate = oValue;
									}
									return formatter.format(oDate, isUTC);
								}
							},
							parseValue: function(oValue) {
								if (!oValue) {
									return "";
								}
								var dt = new Date(oValue);
								if (isNaN(dt.getTime())) {
									throw new sap.ui.model.ValidateException();
								}
								return '/Date(' + dt.getTime() + ')/';
							},
							validateValue: function(oValue) {
								if (!oValue) {
									return true;
								}
								// additional validations
								if (!/\/Date\([0-9]+\)\//.test(oValue)) {
									throw new sap.ui.model.ValidateException();
								}
							}
						});
					},

					getContent: function() {
						return this._oMainDialogfragment;
					},

					close: function() {
						var that = this;
						var oModel = this._oMainDialogfragment.getModel();
						var bDirty = oModel.getProperty("/isDirty");
						if (bDirty) {
							this.context.service.usernotification.confirm(that.context.i18n.getText("i18n", "CONFIRM_CANCEL"))
								.then(function(oResponse) {
									if (oResponse.bResult) {
										that._oMainDialogfragment.close();
									}
								}).done();
						} else {
							that._oMainDialogfragment.close();
						}
					},

					open: function(oDocument) {
						var that = this;
						// clear model
						this._oMainDialogfragment.getModel().setProperty("/mockData", []);
						this._oMainDialogfragment.getModel().setProperty("/isDirty", false);
						this._oMainDialogfragment.getModel().setProperty("/isUseAsMockDataSource", true);
						this._oMainDialogfragment.getModel().setProperty("/isInputValid", true);
						this._oMainDialogfragment.getModel().setProperty("/validationText", "");

						this._oDocument = oDocument;
						var sAppType = that._checkAppType(that._oDocument.getEntity().getParentPath());

						// parse metadata document
						return this.context.service.odataProvider.getMetadataFromWorkspace(oDocument).then(function(oMetadata) {
							that._oMetadata = oMetadata;
							that._oMainDialogfragment.getModel().setProperty("/appType", sAppType);
							// get entitysets for the entitysets table
							return that.context.service.odataProvider.getEntitySets(that._oMetadata).then(function(aEntitysets) {
								if (aEntitysets.length === 0) {
									that.context.service.usernotification.alert(
									that.context.i18n.getText("i18n", "ERROR_MSG_PROP")).done();
									return;
								}
								that._oMainDialogfragment.getModel().setProperty("/entitySets", aEntitysets);
								that._oMainDialogfragment.open();
							});
						}).fail(
							function(oErr) {
								if(oErr.message.indexOf("This page contains the following errors:") !== -1){
									that.context.service.usernotification.alert(
									 that.context.i18n.getText("i18n", "ERROR_MSG_METAFILE")).done();
								}
								else
								{
									that.context.service.usernotification.alert(
									 that.context.i18n.getText("i18n", "ERROR_MSG_META")).done();
								}
							}).done();
					},

					onEntitySetSelection: function(oEvent) {
						var that = this;
						var iIndex = oEvent.getParameter("rowIndex");
						var oModel = that._oMainDialogfragment.getModel();
						var oEntitySet = oModel.getProperty("/entitySets")[iIndex];
						var bAppType = oModel.getProperty("/appType");
						oModel.setProperty("/selectedEntitySet", oEntitySet);
						oModel.setProperty("/skip", 0);
						oModel.setProperty("/validationText", "");
						oModel.setProperty("/isInputValid", true);
						var oMockdataTable = sap.ui.getCore().byId("mockdataTable");
						return this.context.service.odataProvider
							.getProperties(this._oMetadata, oEntitySet, false)
							.then(function(aProperties) {
								that.setMockDataColumns(aProperties, sap.ui.getCore().byId("mockdataTable"));

								var sPart = bAppType ? "/mockdata/" : "/";
								var sUrl = that._oDocument.getEntity().getParentPath() + sPart + oEntitySet.name + ".json";

								var aMockData = oModel.getProperty("/mockData/" + oEntitySet.name);
								//if ((aMockData === undefined ) || (aMockData && aMockData.length === 0)) {
								if (aMockData && aMockData.length === 0) {
									oModel.setProperty("/mockData/" + oEntitySet.name, null);
								}
								// either use the mockdata in the model, or look for a .json file in the parent folder
								return Q(
									oModel.getProperty("/mockData")[oEntitySet.name] ? null : that.context.service.filesystem.documentProvider
									.getDocument(sUrl).then(function(oDocument) {
										if (oDocument) {
											return oDocument.getContent().then(function(sData) {
												try {
													var oData = JSON.parse(sData);
												} catch (e) {
													oModel.setProperty("/validationText", that.context.i18n.getText("i18n", "JSON_PARSE_ERROR"));
													oModel.setProperty("/isInputValid", false);
													throw e;
												}

												if (oData.d) {
													if (oData.d.results) {
														oModel.setProperty("/mockData/" + oEntitySet.name, oData.d.results);
													}
												} else {
													oModel.setProperty("/mockData/" + oEntitySet.name, oData);
												}
											});
										} else {
											// Probably the MockData saved as entity type
											var sEntityType = oEntitySet.entityType;
											sUrl = that._oDocument.getEntity().getParentPath() + "/" + sEntityType.substring(sEntityType.lastIndexOf('.') + 1) + ".json";
											return that.context.service.filesystem.documentProvider.getDocument(sUrl).then(function(oEntTypeDocument) {
												if (oEntTypeDocument) {
													return oEntTypeDocument.getContent().then(function(sData) {
														try {
															var oData = JSON.parse(sData);
														} catch (e) {
															oModel.setProperty("/validationText", that.context.i18n.getText("i18n", "JSON_PARSE_ERROR"));
															oModel.setProperty("/isInputValid", false);
															throw e;
														}

														if (oData.d) {
															if (oData.d.results) {
																oModel.setProperty("/mockData/" + oEntitySet.name, oData.d.results);
															}
														} else {
															oModel.setProperty("/mockData/" + oEntitySet.name, oData);
														}
													});
												} else {
													oModel.setProperty("/mockData/" + oEntitySet.name, []);			
												}
											});
										}
										
									})).then(function() {}).fail(function(oError) {
									oModel.setProperty("/mockData/" + oEntitySet.name, []);
								}).fin(function() {
									oMockdataTable.bindRows("/mockData/" + oEntitySet.name);
									oMockdataTable.clearSelection();
								}).done();
							}).fail(function(oError) {
								that.context.service.usernotification.alert(
									that.context.i18n.getText("i18n", "ERROR_MSG_PROP")).done();
									that._oMainDialogfragment.close();
							}).done();
					},

					setMockDataColumns: function(aProperties, oTable) {
						var that = this;
						var oTemplate;
						oTable.destroyColumns();
						for (var i = 0; i < aProperties.length; i++) {
							var oProp = aProperties[i],
								sName = oProp.name,
								sLength = oProp.maxLength,
								sType = oProp.type,
								sNullable = oProp.nullable,
								iMaxLength = (isNaN(sLength)) ? 0 : parseInt(sLength, 10);
							oTemplate = new sap.ui.commons.TextField({
								//TODO apply after alignment with the MockServer
								//											maxLength : iMaxLength,
								placeholder: "{i18n>CELL_PLACEHOLDER}",
								change: function() {
									that._oMainDialogfragment.getModel().setProperty("/isDirty", true);
								}
							});
							// TODO open issue, how to handle nullable in the ui
							//										if (sNullable && sNullable === "false") {
							//											oTemplate
							//													.attachChange(function(oEvent) {
							//														var bEmpty = oEvent.getParameter("newValue").length === 0;
							//														oTemplate.setValueState(bEmpty ? sap.ui.core.ValueState.Error
							//																: sap.ui.core.ValueState.None);
							//													});
							//										}
							// complex type
							if (sType.indexOf('Edm.') !== 0) {
								oTemplate = new sap.ui.commons.Link({
									text: "{i18n>COMPLEX_LINK_TEXT}",
									press: [this.onEditComplexMockData, this]
								});
								oTemplate.data("complex", {
									name: sName,
									properties: aProperties[i].properties
								});
							} else {
								switch (sType) {
									case "Edm.Int16":
									case "Edm.Int32":
									case "Edm.Int64":
										oTemplate.bindProperty("value", {
											path: sName,
											type: new sap.ui.model.type.Integer()
										});
										oTemplate.attachChange(function(oEvent) {
											var oValue = oEvent.getParameter("newValue");
											var iInputViolations = oTable.getModel().getProperty("/inputViolations");
											if (isNaN(oValue)) {
												oEvent.getSource().setValueState('Error');
												iInputViolations++;
											} else {
												oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
												if (iInputViolations !== 0) {
													iInputViolations--;
												}
											}
											if (iInputViolations === 0) {
												oTable.getModel().setProperty("/validationText", "");
											} else {
												oTable.getModel().setProperty("/validationText",
													that.context.i18n.getText("i18n", "INVALID_VALUE_FORMAT"));
											}
											oTable.getModel().setProperty("/inputViolations", iInputViolations);
											oTable.getModel().setProperty("/isInputValid", iInputViolations === 0);
										});
										break;
									case "Edm.Decimal":
									case "Edm.Single":
										oTemplate.bindProperty("value", {
											path: sName,
											type: new sap.ui.model.type.Float()
										});
										oTemplate.attachChange(function(oEvent) {
											var oValue = oEvent.getParameter("newValue");
											// for numeric validation, remove all decimal and seperator delimitors,
											// the sapui5 float type complete them by himself
											oValue = oValue.replace(/,/g, "");
											oValue = oValue.replace(/\./g, "");
											var iInputViolations = oTable.getModel().getProperty("/inputViolations");
											if (isNaN(oValue)) {
												oEvent.getSource().setValueState('Error');
												iInputViolations++;
											} else {
												oEvent.getSource().setValueState(sap.ui.core.ValueState.None);
												if (iInputViolations !== 0) {
													iInputViolations--;
												}
											}
											if (iInputViolations === 0) {
												oTable.getModel().setProperty("/validationText", "");
											} else {
												oTable.getModel().setProperty("/validationText",
													that.context.i18n.getText("i18n", "INVALID_VALUE_FORMAT"));
											}
											oTable.getModel().setProperty("/inputViolations", iInputViolations);
											oTable.getModel().setProperty("/isInputValid", iInputViolations === 0);
										});
										break;
									case "Edm.DateTime":
									case "Edm.Date":
										oTemplate = new sap.ui.commons.DatePicker().addStyleClass("mockdataDatePicker");
										oTemplate.attachChange(
											function(oEvent) {
												var iInputViolations = oTable.getModel().getProperty("/inputViolations");
												if (oEvent.getParameter("invalidValue")) {
													oEvent.oSource.setValueState(sap.ui.core.ValueState.Error);
													iInputViolations++;
												} else {
													oEvent.oSource.setValueState(sap.ui.core.ValueState.None);
													if (iInputViolations !== 0) {
														iInputViolations--;
													}
												}
												if (iInputViolations === 0) {
													oTable.getModel().setProperty("/validationText", "");
												} else {
													oTable.getModel().setProperty("/validationText",
														that.context.i18n.getText("i18n", "INVALID_VALUE_FORMAT"));
												}
												oTable.getModel().setProperty("/isInputValid", iInputViolations === 0);
												oTable.getModel().setProperty("/inputViolations", iInputViolations);
												that._oMainDialogfragment.getModel().setProperty("/isDirty", true);
											}).bindProperty("value", {
											path: sName,
											type: new my.model.types.JsonDateTime()
										});
										break;
									case "Edm.Boolean":
										oTemplate = new sap.ui.commons.ToggleButton({
											pressed: {
												path: sName,
												type: new sap.ui.model.type.Boolean()
											},
											text: {
												path: sName
											},
											tooltip: {
												path: sName,
												formatter: function(bValue) {

													return bValue ? bValue.toString() : bValue;
												}
											}
										}).addStyleClass("riverSwitch");
										oTemplate.attachPress(function(oEvent) {
											this.rerender();
											that._oMainDialogfragment.getModel().setProperty("/isDirty", true);
										});
										break;
									default:
										oTemplate.bindProperty("value", sName);
								}
								sType = /^Edm\.(.*)/.exec(sType)[1];
							}

							oTable.addColumn(new sap.ui.table.Column({
								label: new sap.ui.commons.Label({
									text: sName + " (" + sType + ")",
									tooltip: that.context.i18n.getText("i18n", "COLUMN_TOOLTIP", [sName, sType])
									//"Property Name: " + sName + "\nProperty Type: " + sType
								}),
								template: oTemplate,
								width: "170px"
							}));
						}
					},

					onAddMockData: function(oEvent) {
						var oModel = this._oMainDialogfragment.getModel();
						var aMockData = oModel.getProperty("/mockData/" + oModel.getProperty("/selectedEntitySet").name);
						aMockData.push({});
						oModel.setProperty("/mockData/" + oModel.getProperty("/selectedEntitySet").name, aMockData);
						var oTable = sap.ui.getCore().byId("mockdataTable");
						if (aMockData.length - 1 < oTable.getVisibleRowCount()) {
							oTable.getRows()[aMockData.length - 1].rerender();
							oTable.getRows()[aMockData.length - 1].getCells()[0].focus();
						}
					},

					onEditComplexMockData: function(oEvent) {
						var oComplexData = oEvent.getSource().data("complex");
						var oModel = this._oMainDialogfragment.getModel();
						var oComplexTable = sap.ui.getCore().byId("complexdataTable");
						var oBindingContext = oEvent.getSource().getBindingContext();

						this.setMockDataColumns(oComplexData.properties, oComplexTable);

						var oMockData = oModel.getProperty(oBindingContext.getPath() + "/" + oComplexData.name);
						if (!oMockData) {
							oMockData = {};
						}

						var oComplexModel = oComplexTable.getModel();
						oComplexModel.setProperty("/complexMockData", [oMockData]);
						oComplexModel.setProperty("/selectedBindingContext", oBindingContext);
						oComplexModel.setProperty("/selectedComplexName", oComplexData.name);

						this._oComplexTypefragment.open();

					},

					onSaveComplexMockData: function(oEvent) {
						this._oComplexTypefragment.close();

						var oComplexModel = this._oComplexTypefragment.getModel();
						var aMockData = oComplexModel.getProperty("/complexMockData");
						var oBindingContext = oComplexModel.getProperty("/selectedBindingContext");
						var sName = oComplexModel.getProperty("/selectedComplexName");

						var oModel = this._oMainDialogfragment.getModel();
						oModel.setProperty(oBindingContext.getPath() + "/" + sName, aMockData[0]);
					},

					onDeleteMockData: function(oEvent) {
						var oModel = this._oMainDialogfragment.getModel();
						var oMockdataTable = sap.ui.getCore().byId("mockdataTable");
						var aIndices = oMockdataTable.getSelectedIndices();
						var aMockData = oModel.getProperty("/mockData/" + oModel.getProperty("/selectedEntitySet").name);
						for (var i = aIndices.length; i > 0; i--) {
							aMockData.splice(aIndices[i - 1], 1);
						}
						oModel.setProperty("/mockData/" + oModel.getProperty("/selectedEntitySet").name, aMockData);
						oModel.setProperty("/isDirty", true);
						oMockdataTable.clearSelection();
					},

					onRowSelection: function(oEvent) {
						var oTable = oEvent.getSource();
						var oModel = oTable.getModel();
						oModel.setProperty("/isDeleteEnabled", oTable.getSelectedIndex() !== -1);
					},

					onGenerateMockData: function(oEvent) {
						var oModel = this._oMainDialogfragment.getModel();
						var sEntityset = oModel.getProperty("/selectedEntitySet").name;
						var iSkip = parseInt(oModel.getProperty("/skip"), 10);
						jQuery.sap.require("sap.ui.core.util.MockServer");
						var oMockServer = new sap.ui.core.util.MockServer({
							rootUri: ""
						});
						this._oDocument.getContent().then(function(sContent) {
							sap.ui.core.util.MockServer.prototype._loadMetadata = function(sContent) {
								oMockServer._oMetadata = jQuery.sap.parseXML(sContent);
								return oMockServer._oMetadata;
							};
							oMockServer.simulate(sContent);
							oMockServer.start();
							oModel.setProperty("/skip", iSkip + 10);
							var oResponse = jQuery.sap.sjax({
								url: sEntityset + "?$top=10&$skip=" + iSkip,
								dataType: "json"
							});
							var aMockData = oModel.getProperty("/mockData/" + sEntityset);
							aMockData = aMockData ? aMockData : [];
							if (oResponse.success) { // && aMockData) {
								aMockData = aMockData.concat(oResponse.data.d.results);
								oModel.setProperty("/isDirty", true);
							}
							oModel.setProperty("/mockData/" + sEntityset, aMockData);
							sap.ui.core.util.MockServer.destroyAll();
						}).done();
					},

					onSaveMockData: function(oEvent) {
						var that = this;
						var oModel = this._oMainDialogfragment.getModel();
						var bAppType = oModel.getProperty("/appType");
						var oMockdataFolderDocument = "";
						that._oMainDialogfragment.close();
						var sFolder = this._oDocument.getEntity().getParentPath();
						
						this.context.service.usagemonitoring.report("mockDataEditor", "saved").done();
						return this.context.service.filesystem.documentProvider.getDocument(sFolder).then(
							function(oFolderDocument) {
								var aPromises = [];
								var aEntitySet = Object.keys(oModel.getProperty("/mockData"));
								return Q(
									oModel.getProperty("/isDirty") && (bAppType) ? that._createMockFolder(oFolderDocument) : null).then(function() {
										oMockdataFolderDocument = oModel.getProperty("/mockdataobject");
										for (var i = 0; i < aEntitySet.length; i++) {
											aPromises.push(that._createFile(oFolderDocument, aEntitySet[i], oMockdataFolderDocument));
										}
										var bChecked = oModel.getProperty("/isUseAsMockDataSource");
										aPromises.push(that.context.service.setting.project.getProjectSettings("mockpreview",
											that._oDocument).then(
											function(oSettings) {
												if (oSettings) {
													oSettings.loadJSONFiles = bChecked;
												} else {
													oSettings = {
														"loadJSONFiles": bChecked
													};
												}
												return that.context.service.setting.project.setProjectSettings(
													"mockpreview", oSettings, that._oDocument);
											}));
										return Q.all(aPromises);
									}
								);
							}).fail( function(oErr) {
								that.context.service.usernotification.alert(
									that.context.i18n.getText("i18n", "ERROR_MSG_GETDOC")).done();
							}).done();
					},

					_createFile: function(oFolderDocument, sEntitySet, oMockdataFolderDocument) {
						var oModel = this._oMainDialogfragment.getModel();
						var bAppType = oModel.getProperty("/appType");
						var aData = oModel.getProperty("/mockData/" + sEntitySet);
						var fileExists = false;
						return this.context.service.beautifier.beautify(JSON.stringify(aData)).then(
							function(output) {
								//if the change made on one of the tables has left the table empty
								if (aData.length === 0) {
									//check if file with name already exists
									return oFolderDocument.getCurrentMetadata(true).then(function(aRawData) {
										if (bAppType && oMockdataFolderDocument) {
											oFolderDocument = oMockdataFolderDocument;
										}
										if (aRawData.length > 1) {
											for (var i = 0; i < aRawData.length; i++) {
												if (aRawData[i].name === sEntitySet + ".json") {
													fileExists = true;
												}
											}
											if (!fileExists) {
												return Q();
											} else {
												return oFolderDocument.importFile(new Blob([output]), false, true, sEntitySet + ".json");
											}
										}
									});
								} else {
									if (bAppType && oMockdataFolderDocument) {
										oFolderDocument = oMockdataFolderDocument;
									}
									return oFolderDocument.importFile(new Blob([output]), false, true, sEntitySet + ".json");
								}
								fileExists = false;
							});
					},

					_checkAppType: function(sPath) {
						return new RegExp(".*/localService$").test(sPath);
					},

					_createMockFolder: function(oFolderDocument) {
						var that = this;
						if (oFolderDocument) {
							return oFolderDocument.getChild("mockdata").then(function(oMockdatachildObject) {

								return Q(oMockdatachildObject ? oMockdatachildObject : oFolderDocument.createFolder("mockdata")).then(function(oMockdataCObject) {
									that._oMainDialogfragment.getModel().setProperty("/mockdataobject", oMockdataCObject);
								});
							});
						}
					}

				});

		return MockDataModeler;

	});