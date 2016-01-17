/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader",
        "../model/model",
        //"sap/watt/uitools/plugin/chebackend/dao/File"
        "sap/watt/ideplatform/che/plugin/chebackend/dao/File"
        ],
        function(ResourceLoader, viewmodel, FileService) {
	"use strict";

	var extension = ".hdbcds";
	var extensionLength = extension.length;
	// var myService = MetadataServices.searchService;

	var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/cds");

	var NewCDSFileDialog = function(attributes) {
		this.folderDocument = attributes.folderDocument;
		this.fileDocument = attributes.fileDocument;
		this.entries = attributes.entries;
		this.context = attributes.context;
		this.fileService = FileService;
		this.getNameSpace();
	};

	function stripExtension(name) {
		var nameLength = name.length;
		if (nameLength > extensionLength && name.substring(nameLength - extensionLength) === extension) {
			return name.substring(0, nameLength - extensionLength);
		} else {
			return name;
		}
	}

	NewCDSFileDialog.prototype = {

			openDialog: function() {

				if (sap.ui.getCore().byId("createCDSFileDialog")) {
					sap.ui.getCore().byId("createCDSFileDialog").destroy();
				}

				var that = this;
				var createButton, cancelButton, dialog, rootContainerOptions, starJoin, nameText, cdsFileTypeRadioGrp;

				function cancelPressed() {
					dialog.close();
					if (that.fileDocument) {
						that.context.service.content.close(that.fileDocument, that.context.self).done();
					}
				}

				function okButtonPressed() {
					var name = stripExtension(nameText.getValue());
					var fileName;
					if (name !== nameText.getValue()) {
						fileName = nameText.getValue();
					} else {
						fileName = name + extension;
					}

					var cdsFileType = cdsFileTypeRadioGrp.getSelectedItem().getKey();
					var containerType = rootContainerOptions.getChecked() ? "Context" : "Entity";
					var attributes = {
							cdsFileType: cdsFileType,
							containerType: containerType,
							name: name,
							fileName: encodeURIComponent(fileName),
							scriptParametersCaseSensitive: true
					};
					dialog.close();
					// that.createContent(attributes);
					that.createFile(attributes, that);
				}

				var model = new sap.ui.model.json.JSONModel();
				model.setData({
					isNewFileDialog : typeof that.fileDocument === "undefined"
				});

				var mtrixLayout = new sap.ui.commons.layout.MatrixLayout({
					visible: true, // boolean
					layoutFixed: false, // boolean
					width: "100%",
					columns: 2, // int
					widths: ["27%", "73%"]
				}).addStyleClass("customProperties");

				var nameLabel = new sap.ui.commons.Label({
					design: sap.ui.commons.LabelDesign.Standard,
					textDirection: sap.ui.core.TextDirection.Inherit,
					wrapping: true,
					text: resourceLoader.getText("tit_name"),
					visible: true,
					textAlign: sap.ui.core.TextAlign.Begin,
					required: true
				});

				nameText = new sap.ui.commons.TextField("", {
					width: "100%",
					change: function(event) {
						var value = stripExtension(nameText.getValue());
						if (value === "" || that.alreadyExists(value)) {
							createButton.setEnabled(false);
						}
						if (that.validateName(value)) {
							createButton.setEnabled(false);
						} else {
							/*
							 * if (descriptionTextField &&
							 * descriptionTextField.getValue() === "") {
							 * descriptionTextField.setValue(value); }
							 */
							createButton.setEnabled(true);
						}
					},
					liveChange: function(event) {
						var value = nameText.getLiveValue();
						if (value === "") {
							createButton.setEnabled(false);
							that.openToolTip(resourceLoader.getText("msg_column_invalid_empty"), event.getSource());
							event.getSource().setValueState(sap.ui.core.ValueState.Error);
						} else if (that.alreadyExists(stripExtension(value))) {
							that.openToolTip(resourceLoader.getText("msg_name_exist"), event.getSource());
							event.getSource().setValueState(sap.ui.core.ValueState.Error);
							createButton.setEnabled(false);
						} else if (that.validateName(stripExtension(value))) {
							that.openToolTip(that.validateName(stripExtension(value)), event.getSource());
							event.getSource().setValueState(sap.ui.core.ValueState.Error);
							createButton.setEnabled(false);
						} else {
							createButton.setEnabled(true);
							event.getSource().setTooltip(null);
							event.getSource().setValueState(sap.ui.core.ValueState.None);
						}
					},
					enabled: typeof that.fileDocument === "undefined"
				}).addStyleClass("calcName");
				nameText.onAfterRendering = function() {
					nameText.getDomRef().focus();
					nameText.getFocusDomRef().focus();
					nameText.getFocusInfo();
					nameText.getInputDomRef().focus();
					var container = this.$();
					container.focus();
				};

				var cdsFileTypeLabel = new sap.ui.commons.Label({
					design: sap.ui.commons.LabelDesign.Standard,
					textDirection: sap.ui.core.TextDirection.Inherit,
					wrapping: true,
					// text: resourceLoader.getText("tit_type"),
					text: "Editor",
					visible: true,
					textAlign: sap.ui.core.TextAlign.Begin,
					required: true
				});

				cdsFileTypeRadioGrp = new sap.ui.commons.RadioButtonGroup({
					columns: 2,
					width: "100%",
					select: function(event) {
						if (cdsFileTypeRadioGrp.getSelectedItem().getKey() === "Graphical") {
							/*if (mtrixLayout.indexOfRow(containerOptionsRow) === -1) {
								mtrixLayout.addRow(containerOptionsRow);
							}*/
							if(rootContainerOptions.getWidth() === "0%"){
								rootContainerOptions.setWidth("100%"); 
							}
						} else {
							//mtrixLayout.removeRow(containerOptionsRow);
							rootContainerOptions.setWidth("0%"); 
						}
					}
				});

				cdsFileTypeRadioGrp.addItem(new sap.ui.core.Item({
					text: "Graphical",
					enabled: true,
					textDirection: sap.ui.core.TextDirection.Inherit,
					key: "Graphical"

				}));
				cdsFileTypeRadioGrp.addItem(new sap.ui.core.Item({
					text: "Text",
					enabled: true,
					textDirection: sap.ui.core.TextDirection.Inherit,
					key: "Text"
				}));

				var rootContainerLabel = new sap.ui.commons.Label("", {
					text: resourceLoader.getText("tit_root_container")
				});

				/*
				 * rootContainerOptions = new sap.ui.commons.ComboBox();
				 * 
				 * rootContainerOptions.addItem(new sap.ui.core.ListItem({ text:
				 * "Context", key: "Context", enabled: true, textDirection:
				 * sap.ui.core.TextDirection.Inherit }));
				 * 
				 * rootContainerOptions.addItem(new sap.ui.core.ListItem({ text:
				 * "Entity", key: "Entity", enabled: true, textDirection:
				 * sap.ui.core.TextDirection.Inherit }));
				 * 
				 * rootContainerOptions.setSelectedKey("Context");
				 */

				rootContainerOptions = new sap.ui.commons.CheckBox({
					checked: true,
					text: resourceLoader.getText("tit_with_context")
				});

				var containerOptionsRow = new sap.ui.commons.layout.MatrixLayoutRow("", {});
				containerOptionsRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell("", {
					content: []
				}));
				containerOptionsRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell("", {
					content: rootContainerOptions
				}));

				mtrixLayout.createRow(nameLabel, nameText);

				if(typeof that.fileDocument === "undefined"){
					mtrixLayout.createRow(cdsFileTypeLabel, cdsFileTypeRadioGrp);
				}
				mtrixLayout.addRow(containerOptionsRow);

				createButton = new sap.ui.commons.Button({
					style: sap.ui.commons.ButtonStyle.Emph,
					enabled: false,
					press: okButtonPressed
				}).addStyleClass("calcCreateBtn").bindProperty("text",
						{
					parts : [{
						path : "/isNewFileDialog"
					}],
					formatter : function(isNewFileDialog) {
						if (isNewFileDialog) {
							return resourceLoader.getText("txt_create");
						} else {
							return resourceLoader.getText("txt_ok");
						}
					}
						});

				cancelButton = new sap.ui.commons.Button({
					text: resourceLoader.getText("txt_cancel"),
					style: sap.ui.commons.ButtonStyle.Emph,
					enabled: true,
					press: cancelPressed
				}).addStyleClass("calcCancelBtn");

				dialog = new sap.ui.commons.Dialog("createCDSFileDialog", {
					//title: resourceLoader.getText("tit_new_cds_file"),
					//minHeight : "25%",
					applyContentPadding: true,
					showCloseButton: false,
					resizable: false,
					contentBorderDesign: sap.ui.commons.enums.BorderDesign.Thik,
					modal: true,
					accessibleRole: sap.ui.core.AccessibleRole.Dialog,
					content: mtrixLayout,
					buttons: [createButton, cancelButton],
					defaultButton: createButton,
					keepInWindow: true
				}).bindProperty("title",
						{
					parts : [{
						path : "/isNewFileDialog"
					}],
					formatter : function(isNewFileDialog) {
						if (isNewFileDialog) {
							return resourceLoader.getText("tit_new_cds_file");
						} else {
							return resourceLoader.getText("tit_open_cds_file");
						}
					}
						});
				dialog.setInitialFocus(nameText);
				dialog.setModel(model);

				// dialog.setWidth("25%");
				// dialog.setHeight("50%");

				if (that.fileDocument) {
					var nameValue = that.fileDocument.getEntity().getName();
					var index = nameValue.lastIndexOf(extension);
					if (index > 0) {
						nameValue = nameValue.substring(0, index);
					}
					nameText.setValue(nameValue);
					createButton.setEnabled(true);
				}

				that.context.i18n.applyTo(dialog);
				dialog.open();
				return dialog;
			},

			createContent: function(attributes) {
				var that = this;
				var model = new viewmodel.CDSModel(true);
			},

			alreadyExists: function(sName) {
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
			},

			validateName: function(sName) {
				// var that = this;
				if (!this.checkValidUnicodeChar(sName)) {
					return resourceLoader.getText("msg_column_invalid_unicode", this.getInvalidUnicodeCharacters());
				}
				return undefined;
			},

			INVALID_RESOURCE_CHARACTERS: ['\\', '/', ':', '*', '?', '"', '<', '>', '|', '.', '&', ';', '\'', '$', '%', ',', '!', '#', '+', '~', '`',
			                              '[', ']', '!', '@', '^', '=', '-', '(', ')', '{', '}'],

			                              checkValidUnicodeChar: function(string) {
			                            	  for (var i = 0; i < string.length; i++) {
			                            		  var ch = string.charAt(i);
			                            		  if (ch === ' ' || ch === '\n') {
			                            			  return false;
			                            		  }
			                            		  for (var j = 0; j < this.INVALID_RESOURCE_CHARACTERS.length; j++) {
			                            			  var invalidCh = this.INVALID_RESOURCE_CHARACTERS[j];
			                            			  if (invalidCh === ch) {
			                            				  return false;
			                            			  }
			                            		  }
			                            	  }
			                            	  return true;
			                              },

			                              getInvalidUnicodeCharacters: function() {
			                            	  var invalidCharString = "";
			                            	  for (var i = 0; i < this.INVALID_RESOURCE_CHARACTERS.length; i++) {
			                            		  invalidCharString = invalidCharString + this.INVALID_RESOURCE_CHARACTERS[i];
			                            		  if (i !== this.INVALID_RESOURCE_CHARACTERS.length - 1) {
			                            			  invalidCharString = invalidCharString.concat(' ');
			                            		  }
			                            	  }
			                            	  return invalidCharString;
			                              },

			                              openToolTip: function(message, control) {
			                            	  var tooltip = new sap.ui.commons.Callout({
			                            		  // open: onOpen
			                            	  });
			                            	  tooltip.addContent(new sap.ui.commons.TextView({
			                            		  semanticColor: sap.ui.commons.TextViewColor.Negative,
			                            		  design: sap.ui.commons.TextViewDesign.Bold,
			                            		  text: new String(message),
			                            		  editable: false
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
			                              },

			                              createInputforcalc: function(searchProperties, model) {
			                            	  /*
			                            	   * var targetNode =
			                            	   * model.columnView.viewNodes.get(searchProperties.nameOfProject);
			                            	   * if (targetNode) { var source; var sourceName; if
			                            	   * (searchProperties) { source =
			                            	   * model.createOrMergeEntity(searchProperties); if (source) {
			                            	   * source.isProxy = true; } sourceName =
			                            	   * source.getFullyQualifiedName(); if (source.physicalSchema &&
			                            	   * searchProperties.context) { var callback = function(value) {
			                            	   * if (value) { source.schemaName = value; } };
			                            	   * SchemaMappingService.schemaMapping.deriveAuthoringSchemaFor(source.physicalSchema,
			                            	   * searchProperties.context.packageName,
			                            	   * searchProperties.context, callback); } } if (source) { var
			                            	   * input = targetNode.createInput(); this.inputKey =
			                            	   * input.$getKeyAttributeValue(); input.setSource(source);
			                            	   * return input; } }
			                            	   */

			                              },

			                              createElementCalc: function(elementProperties, model, nameOfNode) {
			                            	  this.objectAttributes = elementProperties.objectAttributes;
			                            	  this.typeAttributes = elementProperties.typeAttributes;
			                            	  this.mappingAttributes = elementProperties.mappingAttributes;
			                            	  this.calculationAttributes = elementProperties.calculationAttributes;
			                            	  this.counter = elementProperties.counter;
			                            	  this.uniqueName = elementProperties.uniqueName;
			                            	  this.input = elementProperties.input;
			                            	  this.mappingKey = undefined;
			                            	  this.getAggregationBehavior = function(dataType) {
			                            		  if (dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType === "INTEGER" ||
			                            				  dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT") {
			                            			  return "SUM";
			                            		  } else if (dataType === "DATE" || dataType === "TIME" || dataType === "TIMESTAMP") {
			                            			  return "MIN";
			                            		  }
			                            	  };

			                            	  var that = this;
			                            	  var element;
			                            	  var viewNode = model.columnView.viewNodes.get(nameOfNode);
			                            	  if (viewNode) {
			                            		  if (this.input) {
			                            			  var sourceElement = this.input.getSource().elements.get(this.mappingAttributes.sourceName);
			                            			  if (sourceElement) {
			                            				  if (sourceElement.aggregationBehavior && !(this.input.getSource().type === "DATA_BASE_TABLE" || this.input._source instanceof viewmodel
			                            						  .ViewNode)) {
			                            					  this.objectAttributes.aggregationBehavior = sourceElement.aggregationBehavior;
			                            				  } else {
			                            					  if (sourceElement.inlineType && viewNode.isDefaultNode()) {
			                            						  var dataType = sourceElement.inlineType.primitiveType;
			                            						  this.objectAttributes.aggregationBehavior = this.getAggregationBehavior(dataType);
			                            					  }
			                            				  }
			                            			  }
			                            		  }
			                            		  if (!this.objectAttributes.aggregationBehavior || (model.columnView.dataCategory === "DIMENSION" && viewNode.isDefaultNode())) {
			                            			  this.objectAttributes.aggregationBehavior = viewmodel.AggregationBehavior.NONE;
			                            		  }
			                            		  this.objectAttributes.aggregationBehavior = this.objectAttributes.aggregationBehavior.toLowerCase();
			                            		  if (this.objectAttributes.aggregationBehavior === viewmodel.AggregationBehavior.NONE && !this.calculationAttributes && !this.counter &&
			                            				  viewNode.isDefaultNode()) {
			                            			  this.objectAttributes.drillDownEnablement = "DRILL_DOWN";
			                            		  }
			                            		  element = viewNode.createElement(this.objectAttributes, null, this.nextElementName);
			                            		  if (this.typeAttributes) {
			                            			  element.createOrMergeSimpleType(this.typeAttributes);
			                            		  }
			                            		  if (this.calculationAttributes) {
			                            			  element.createCalculationDefinition(this.calculationAttributes);
			                            		  }
			                            		  if (this.mappingAttributes) {
			                            			  if (this.mappingAttributes.length) {
			                            				  // create target in union
			                            				  this.constantMappingList = [];
			                            				  for (var i = 0; i < this.mappingAttributes.length; i++) {
			                            					  var unionMapping = this.mappingAttributes[i].input.createMapping(this.mappingAttributes[i].values);
			                            					  unionMapping.type = this.mappingAttributes[i].values.type;
			                            					  unionMapping.sourceElement = this.mappingAttributes[i].sourceName ? this.mappingAttributes[i].input.getSource().elements.get(this.mappingAttributes[
			                            					                                                                                                                                                      i].sourceName) : undefined;
			                            					  unionMapping.targetElement = element;
			                            					  that.constantMappingList.push({
			                            						  inputKey: this.mappingAttributes[i].input.$getKeyAttributeValue(),
			                            						  mappingKey: unionMapping.$getKeyAttributeValue()
			                            					  });
			                            				  }
			                            			  } else if (this.input) {
			                            				  var mapping = this.input.createMapping();
			                            				  this.mappingKey = mapping.$getKeyAttributeValue();
			                            				  mapping.targetElement = element;
			                            				  if (this.mappingAttributes.hasOwnProperty("sourceName")) {
			                            					  mapping.sourceElement = sourceElement;
			                            					  mapping.type = "ElementMapping";
			                            				  }
			                            			  }
			                            		  }
			                            		  if (this.counter) {
			                            			  element.createExceptionAggregationStep(this.counter);
			                            		  }
			                            	  }
			                            	  return element;
			                              },

			                              createFile: function(attributes, that) {
			                            	  var content;
			                            	  if (that.fileDocument) {
			                            		  content = this.getCdsContent(that.fileDocument, attributes, that);
			                            		  if (content) {
			                            			  /*
			                            			   * return
			                            			   * that.fileDocument.setContent(content).then(function() {
			                            			   * return
			                            			   * that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider) {
			                            			   * //return
			                            			   * utilityProvider.saveDocumentInactive(that.fileDocument,
			                            			   * true); }); }).done();
			                            			   */

			                            			  return that.fileDocument.setContent(content).then(function() {
			                            				  // return
			                            				  // that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider)
			                            				  // {
			                            				  return Q.all([
			                            				                // utilityProvider.saveDocumentInactive(fileDocument,
			                            				                // true),
			                            				                that.context.service.editor.getAllEditors(fileDocument).then(function(editors) {
			                            				                	var oContentService = that.context.service.content;
			                            				                	var textEditor = editors[1];
			                            				                	return oContentService.open(fileDocument, textEditor.service);
			                            				                }),
			                            				                that.context.service.repositorybrowser.setSelection(fileDocument, true)
			                            				                ]);
			                            				  // });
			                            			  });

			                            		  }
			                            	  } else {
			                            		  // create the file with content and open the document
			                            		  that.folderDocument.createFile(attributes.name + extension).then(function(fileDocument) {
			                            			  if (fileDocument) {
			                            				  content = that.getCdsContent(fileDocument, attributes, that);
			                            				  // var json = {};
			                            				  if (content) { // Graphical
			                            					  /*
			                            					  // json.defaultEditor = "Graphical";
			                            					  // that.context.service.preferences.set(json,
			                            					  // "sap.hana.ide.editor.cds");
			                            					  return fileDocument.setContent(content).then(function() {
			                            						  // return
			                            						  // that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider)
			                            						  // {
			                            						  return Q.all([
			                            						                fileDocument.save(),
			                            						                // utilityProvider.saveDocumentInactive(fileDocument,
			                            						                // true),
			                            						                that.context.service.document.open(fileDocument),
			                            						                that.context.service.repositorybrowser.setSelection(fileDocument, true)
			                            						                ]);
			                            						  // });
			                            					  });*/

			                            					  return fileDocument.setContent(content).then(function() {
			                            						  // return
			                            						  // that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider)
			                            						  // {
			                            						  return Q.all([
			                            						                // utilityProvider.saveDocumentInactive(fileDocument,
			                            						                // true),
			                            						                fileDocument.save(),
			                            						                that.context.service.editor.getAllEditors(fileDocument).then(function(editors) {
			                            						                	var oContentService = that.context.service.content;
			                            						                	var textEditor = editors[0];
			                            						                	return oContentService.open(fileDocument, textEditor.service);
			                            						                }),
			                            						                that.context.service.repositorybrowser.setSelection(fileDocument, true)
			                            						                ]);
			                            						  // });
			                            					  });

			                            				  } else { // Text Editor

			                            					  // json.defaultEditor = "Text";
			                            					  // that.context.service.preferences.set(json,
			                            					  // "sap.hana.ide.editor.cds");
			                            					  return fileDocument.setContent("").then(function() {
			                            						  // return
			                            						  // that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider)
			                            						  // {
			                            						  return Q.all([
			                            						                // utilityProvider.saveDocumentInactive(fileDocument,
			                            						                // true),
			                            						                that.context.service.editor.getAllEditors(fileDocument).then(function(editors) {
			                            						                	var oContentService = that.context.service.content;
			                            						                	var textEditor = editors[1];
			                            						                	return oContentService.open(fileDocument, textEditor.service);
			                            						                }),
			                            						                that.context.service.repositorybrowser.setSelection(fileDocument, true)
			                            						                ]);
			                            						  // });
			                            					  });
			                            				  }
			                            			  }
			                            		  }).fail(function(error) {
			                            			  that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_create_file_error") + "\n" + error).done();
			                            		  });
			                            	  }

			                              },

			                              getCdsContent: function(fileDocument, attributes, that) {
			                            	  var keyString = fileDocument.getKeyString();
			                            	  var packagePath = keyString.substr(keyString.indexOf("/") + 1, keyString.length); // remove
			                            	  // 'file:/'
			                            	  // from
			                            	  // beginning
			                            	  // of
			                            	  // string
			                            	  var filePath = packagePath.substr(0, packagePath.lastIndexOf(".")).replace(/\//g, "."); // get
			                            	  // string
			                            	  // till
			                            	  // before
			                            	  // the
			                            	  // extension
			                            	  // and
			                            	  // replace
			                            	  // all
			                            	  // slash
			                            	  // with
			                            	  // dots

			                            	  var namespace;
			                            	  if(this.namespace){
			                            		  namespace = this.namespace;
			                            	  } else if(that.context.namespace){
			                            		  namespace = that.context.namespace;
			                            	  }
			                            	  //var namespace = filePath.substr(0, filePath.lastIndexOf(".")); // get
			                            	  // only
			                            	  // package
			                            	  // path,
			                            	  // remove
			                            	  // file
			                            	  // name

			                            	  var fileName = fileDocument.getTitle().substr(0, fileDocument.getTitle().lastIndexOf(".")); // remove
			                            	  // extension
			                            	  // and
			                            	  // get
			                            	  // only
			                            	  // file
			                            	  // name

			                            	  var content;
			                            	  if (attributes.cdsFileType === "Graphical") {
			                            		  if (attributes.containerType === "Context") {
			                            			  content = "namespace " + namespace + ";\n\ncontext " + fileName + "{\n\n};";
			                            		  } else {
			                            			  content = "namespace " + namespace + ";\n\nentity " + fileName + "{\n\n};";
			                            		  }
			                            	  }
			                            	  /*
			                            	   * else { //when user chooses 'Script' editor: TODO render the
			                            	   * control to cds text editor service //content = "";
			                            	   * that.context.service.content.close(that.fileDocument,
			                            	   * that.context.self).done(); }
			                            	   */

			                            	  return content;
			                              },

			                              getNameSpace : function(){ 
			                            	  var that = this;
			                            	  var namespace = "";
			                            	  if (this.folderDocument) {
			                            		  var folderPath = this.folderDocument.getEntity().getBackendData().getProjectUrl();
			                            		  var projectPath = folderPath.substring(0,folderPath.indexOf(this.folderDocument.getEntity().getBackendData().getLocationUrl()));
			                            		  var fullFilePath = projectPath + "/file" + this.folderDocument.getEntity().getBackendData().getLocationUrl();
			                            		  var names = fullFilePath.split("/");

			                            		  var locationName = this.folderDocument.getEntity().getBackendData().getLocationUrl();
			                            		  var locationNames = locationName.split("/");
			                            		  var projectName = locationNames[1];
			                            		  var moduleName = locationNames[2];
			                            		  var workspaceId = names[2];

			                            		  that.serviceName = workspaceId + "-/" + projectName + "-" + moduleName;

			                            		  var srcFolderPath;
			                            		  if (names.length > 2) {
			                            			  for (var i = 1; i < names.length; i++) {
			                            				  if(names[i] !== "src"){
			                            					  if (srcFolderPath){
			                            						  srcFolderPath = srcFolderPath + "/" + names[i];
			                            					  }
			                            					  else{
			                            						  srcFolderPath = names[i];
			                            					  }
			                            				  }else{
			                            					  srcFolderPath = srcFolderPath + "/" + names[i];
			                            				  }
			                            			  }
			                            		  }              
			                            		  var result = this.fileService.readFileContent(srcFolderPath+"/.hdinamespace",false).then(function(result){
			                            			  that.namespace = JSON.parse(result).name;
			                            		  }).done();                                            

			                            	  }
			                              }

	};
	return NewCDSFileDialog;
});