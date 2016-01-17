/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader", "../viewmodel/model",
        "../viewmodel/RepositoryXmlRenderer", "../base/XmlSerializer",
        "../view/CalcViewEditorUtil",
        "../viewmodel/ModelProxyResolver",
        "../base/MetadataServices",
        "sap/watt/ideplatform/che/plugin/chebackend/dao/File"
    ],
    function(ResourceLoader, viewmodel, RepositoryXmlRenderer, XmlSerializer, CalcViewEditorUtil, ModelProxyResolver, MetadataServices,FileService) {
        "use strict";

        var extension = ".hdbcalculationview";
        var extensionLength = extension.length;
        var myService = MetadataServices.SearchService;

        function stripExtension(name) {
            var nameLength = name.length;
            if (nameLength > extensionLength && name.substring(nameLength - extensionLength) === extension) {
                return name.substring(0, nameLength - extensionLength);
            } else {
                return name;
            }
        }
        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var NewCalculationViewDialog = function(attributes) {
                                                this.fileService = FileService;
            this.folderDocument = attributes.folderDocument;
            this.fileDocument = attributes.fileDocument;
            this.entries = attributes.entries;
            this.context = attributes.context;
                                                this.fillNameSpace();
        };
        NewCalculationViewDialog.prototype = {
                                                
                                                fillNameSpace:function(){
                var that = this;
                                                                if (this.folderDocument) {
                                                                                var folderPath = this.folderDocument.getEntity().getBackendData().getProjectUrl();
                                                                                var projectPath = folderPath.substring(0,folderPath.indexOf(this.folderDocument.getEntity().getBackendData().getLocationUrl()));
                                                                                var fullFilePath = projectPath + "/file" + this.folderDocument.getEntity().getBackendData().getLocationUrl();
                                                                                var names = fullFilePath.split("/");
                                                                                var srcFolderPath;
                                                                                if (names.length > 2) {
                                                                                                for (var i = 1; i < names.length; i++) {
                                                                                                                if(names[i] !== "src"){
                                                                                                                if (srcFolderPath)
                                                                                                                                srcFolderPath = srcFolderPath + "/" + names[i];
                                                                                                                else
                                                                                                                                srcFolderPath = names[i];
                                                                                                                }else{
                                                                                                                                                srcFolderPath = srcFolderPath + "/" + names[i];
                                                                                                                }
                                                                                                }
                                                                                }              
                                                                                var result = this.fileService.readFileContent(srcFolderPath+"/.hdinamespace",false).then(function(result){
                                                                                                that.namespace = JSON.parse(result).name;
                                                                                }).done();                                            
                                                                }
            },


            openDialog: function() {
                
                  if (sap.ui.getCore().byId("createViewDialog")) {
                    sap.ui.getCore().byId("createViewDialog").destroy();
                }
                
                var that = this;
                var createButton, cancelButton, dialog, descriptionTextField, dataCatagiri, starJoin, nameText, radioButtonGroup, paraMeterCaseSensitive;

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

                    var attributes = {
                        description: descriptionTextField.getValue(),
                        //isGraphical: radioButtonGroup.getSelectedIndex() === 0 ? true : false,
                                                                                                isGraphical: true,
                        dataCatagory: dataCatagiri.getValue(),
                       // starJoin: starJoin.getChecked(),
                        starJoin: false,
                                                                                                name: name,
                        fileName: encodeURIComponent(fileName),
                        scriptParametersCaseSensitive:true,// paraMeterCaseSensitive.getChecked(),
                        //standard or time based calc
                        dimensionType: subTypeDropdownBox.getValue(),
                        isAutoCreate: autoCreateCheckBox.getChecked(),
                        calenderType: calenderTypeDropdownBox.getValue(),
                        granularity: granularityTypeDropdownBox.getValue(),
                        variantSchema: variantSchemaDropdownBox.getValue(),
                        variant: variantDropdownBox.getValue()

                    };
                    if (!attributes.dataCatagory) {
                        attributes.dataCatagory = "DEFAULT"; // leaving it blank will cause trouble when opening the file from a HANA Studio project
                    }
                    dialog.close();
                    dialog.destroy();
                    that.createContent(attributes);
                }
                var mtrixLayout = new sap.ui.commons.layout.MatrixLayout({
                    visible: true, // boolean
                    layoutFixed: false, // boolean
                    width: "100%",
                    columns: 2, // int
                    widths: ["27%", "73%"]
                }).addStyleClass("customProperties");
                var subTypeRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var parameterCaseSenRow = new sap.ui.commons.layout.MatrixLayoutRow("", {});
                var dataCataGoryRow = new sap.ui.commons.layout.MatrixLayoutRow("", {});
                var starJoinRow = new sap.ui.commons.layout.MatrixLayoutRow("", {});
                var granularityRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var calenderTypeRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var variantSchemaRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var variantRow = new sap.ui.commons.layout.MatrixLayoutRow();
                var autoCreateRow = new sap.ui.commons.layout.MatrixLayoutRow();

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
                        } if(that.validateName(value)){
                            createButton.setEnabled(false);
                        }else {
                            if (descriptionTextField && descriptionTextField.getValue() === "") {
                                descriptionTextField.setValue(value);
                            }
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

                var descriptionLabel = new sap.ui.commons.Label({
                    design: sap.ui.commons.LabelDesign.Standard,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    wrapping: true,
                    text: resourceLoader.getText("tit_label"),
                    visible: true,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    required: false
                });

                descriptionTextField = new sap.ui.commons.TextField({
                    value: "", // string
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    valueState: sap.ui.core.ValueState.None,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    imeMode: sap.ui.core.ImeMode.Auto,
                    design: sap.ui.core.Design.Standard,
                    accessibleRole: sap.ui.core.AccessibleRole.Textbox,
                    placeholder: resourceLoader.getText("txt_description_view"),
                    width: "100%"
                });

                //adding subtype calculation ui (standard or time)

                //calculation subtype Label("Subtype")
                var subTypeLabel = new sap.ui.commons.Label({
                    design: sap.ui.commons.LabelDesign.Standard,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    wrapping: true,
                    text: resourceLoader.getText("tit_cal_subtype"),
                    visible: true,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    required: false
                });

                //calculation subtype drop down list("Standard","Time")
                var subTypeList = new sap.ui.commons.ListBox({
                    items: [
                        new sap.ui.core.ListItem({
                            text: "STANDARD"
                        }),
                       /* new sap.ui.core.ListItem({
                            text: "TIME"
                        })*/
                    ]
                });
                // calculation subtype DropdownBox
                var subTypeDropdownBox = new sap.ui.commons.DropdownBox({
                    value: "Standard",
                    "association:listBox": subTypeList,
                    width: "100%"
                });

                //on change of subtype value
                subTypeDropdownBox.attachChange(function() {
                    var currentType = subTypeDropdownBox.getValue();
                    if (currentType === "TIME") {
                        mtrixLayout.addRow(autoCreateRow);
                        autoCreateCheckBox.setChecked(true);
                        calenderTypeDropdownBox.setValue("Gregorian");
                        granularityTypeDropdownBox.setValue("Year");
                        mtrixLayout.removeRow(parameterCaseSenRow);
                        mtrixLayout.removeRow(dataCataGoryRow);
                        mtrixLayout.removeRow(starJoinRow);
                       // radioButtonGroup.setEnabled(false);
                        mtrixLayout.addRow(calenderTypeRow);
                        mtrixLayout.addRow(granularityRow);
                        dataCatagiri.setValue("DIMENSION");

                    } else if (currentType === "STANDARD") {
                        mtrixLayout.removeRow(autoCreateRow);
                        mtrixLayout.removeRow(parameterCaseSenRow);
                        mtrixLayout.addRow(dataCataGoryRow);
                        mtrixLayout.addRow(starJoinRow);
                     //   radioButtonGroup.setEnabled(true);
                      //  radioButtonGroup.setSelectedIndex(0);
                        mtrixLayout.removeRow(calenderTypeRow);
                        mtrixLayout.removeRow(granularityRow);
                        mtrixLayout.removeRow(variantSchemaRow);
                        mtrixLayout.removeRow(variantRow);
                        dataCatagiri.setValue("CUBE");
                        starJoin.setEnabled(true);
                    }
                });
                subTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: subTypeLabel
                }));
                subTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: subTypeDropdownBox
                }));

                //calculation calende  type Label("calenderTypeLabel")
                var calenderTypeLabel = new sap.ui.commons.Label({
                    design: sap.ui.commons.LabelDesign.Standard,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    wrapping: true,
                    text: resourceLoader.getText("tit_cal_calendertype"),
                    visible: true,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    required: false
                });

                //calculation calender type drop down list("Gregorian","Fiscal")
                var calenderTypeList = new sap.ui.commons.ListBox({
                    items: [
                        new sap.ui.core.ListItem({
                            text: "Gregorian"
                        }),
                        new sap.ui.core.ListItem({
                            text: "Fiscal"
                        })
                    ]
                });
                // calculation calender type  DropdownBox
                var calenderTypeDropdownBox = new sap.ui.commons.DropdownBox({
                    value: "Gregorian",
                    "association:listBox": calenderTypeList,
                    width: "100%"
                });

                //on change of calender type value
                calenderTypeDropdownBox.attachChange(function() {
                    var currentType = calenderTypeDropdownBox.getValue();
                    if (currentType === "Gregorian") {
                        granularityTypeDropdownBox.setValue("Year");
                        mtrixLayout.addRow(granularityRow);
                        mtrixLayout.removeRow(variantSchemaRow);
                        mtrixLayout.removeRow(variantRow);

                    } else if (currentType === "Fiscal") {
                        mtrixLayout.removeRow(granularityRow);
                        mtrixLayout.addRow(variantSchemaRow);
                        mtrixLayout.addRow(variantRow);
                    }
                });
                calenderTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: calenderTypeLabel
                }));
                calenderTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: calenderTypeDropdownBox
                }));

                //calculation Granularity  Label("Granularity Label")
                var granularityTypeLabel = new sap.ui.commons.Label({
                    design: sap.ui.commons.LabelDesign.Standard,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    wrapping: true,
                    text: resourceLoader.getText("tit_cal_granularity"),
                    visible: true,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    required: false
                });

                //calculation calender type drop down list
                var granularityTypeList = new sap.ui.commons.ListBox({
                    items: [
                        new sap.ui.core.ListItem({
                            text: "Year"
                        }),
                        new sap.ui.core.ListItem({
                            text: "Month"
                        }),
                        new sap.ui.core.ListItem({
                            text: "Week"
                        }),
                        new sap.ui.core.ListItem({
                            text: "Date"
                        }),
                        new sap.ui.core.ListItem({
                            text: "Hour"
                        }),
                        new sap.ui.core.ListItem({
                            text: "Minute"
                        }), new sap.ui.core.ListItem({
                            text: "Second"
                        })

                    ]
                });

                // calculation calender type  DropdownBox
                var granularityTypeDropdownBox = new sap.ui.commons.DropdownBox({
                    value: "Year",
                    "association:listBox": granularityTypeList,
                    width: "100%"
                });
                granularityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: granularityTypeLabel
                }));
                granularityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: granularityTypeDropdownBox
                }));

                //varian schemay  Label
                var variantSchemaLabel = new sap.ui.commons.Label({
                    design: sap.ui.commons.LabelDesign.Standard,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    wrapping: true,
                    text: resourceLoader.getText("tit_cal_variantSchm"),
                    visible: true,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    required: false
                });
                var attributeListItem = new sap.ui.core.ListItem({});

                attributeListItem.bindProperty("text", {
                    path: "schema",
                    formatter: function(element) {
                        return element ? element : "";
                    }
                });

                //varian schema drop down list
                var variantSchemaList = new sap.ui.commons.ListBox({
                    items: {
                        path: "/metadata",
                        template: attributeListItem
                    }
                });

                // varian schema   DropdownBox
                var variantSchemaDropdownBox = new sap.ui.commons.DropdownBox({

                    "association:listBox": variantSchemaList,
                    width: "100%"
                });
                variantSchemaDropdownBox.attachChange(function() {
                    var aStatements = [];
                    var stmt = "SELECT \"MANDT\",\"PERIV\" FROM \"" + variantSchemaDropdownBox.getValue() + "\".\"T009\"";
                    aStatements.push({
                        statement: encodeURI(stmt),
                        type: "SELECT"
                    });
                    //var maxResult = 100;
                   /* that.context.service.catalogDAO.sqlMultiExecute(aStatements, 500, function(result) {
                        variantList.destroyItems();
                        if (result && result.responses[0] && result.responses[0].result.entries) {
                            var variantModel = new sap.ui.model.json.JSONModel();
                            variantModel.setData(result.responses[0].result);
                            variantList.setModel(variantModel);
                        }

                    });*/
                });

             /*   myService.searchNew("T009", 'PATTERN', 100, true, true, true, function(data, textStatus) {
                    var schemaModel = new sap.ui.model.json.JSONModel();
                    var temp = [];
                    for (var i = 0; i < data.metadata.length; i++) {
                        if (data.metadata[i].objectName === "T009") {
                            temp.push(data.metadata[i]);
                        }
                    }
                    var fltData = {
                        metadata: temp
                    }
                    schemaModel.setData(fltData);
                    variantSchemaList.setModel(schemaModel);
                    var aStatements = [];
                    if (temp[0]) {
                        var stmt = "SELECT \"MANDT\",\"PERIV\" FROM \"" + temp[0].schema + "\".\"T009\"";
                        aStatements.push({
                            statement: encodeURI(stmt),
                            type: "SELECT"
                        });
                        //var maxResult = 100;
                        that.context.service.catalogDAO.sqlMultiExecute(aStatements, 500, function(result) {
                            if (result && result.responses[0] && result.responses[0].result.entries) {
                                var variantModel = new sap.ui.model.json.JSONModel();
                                variantModel.setData(result.responses[0].result);
                                variantList.setModel(variantModel);
                            }

                        });
                    }
                }); */

                variantSchemaRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: variantSchemaLabel
                }));
                variantSchemaRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: variantSchemaDropdownBox
                }));
                //varian   Label("varian")
                var variantLabel = new sap.ui.commons.Label({
                    design: sap.ui.commons.LabelDesign.Standard,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    wrapping: true,
                    text: resourceLoader.getText("tit_cal_variant"),
                    visible: true,
                    textAlign: sap.ui.core.TextAlign.Begin,
                    required: false
                });

                var variantListItem = new sap.ui.core.ListItem({});
                variantListItem.bindProperty("additionalText", {
                    path: "0",
                    formatter: function(element) {
                        return element ? element : "";
                    }
                });
                variantListItem.bindProperty("text", {
                    path: "1",
                    formatter: function(element) {
                        return element ? element : "";
                    }
                });
                /*  variantListItem.bindProperty("text", {
                    path: "schema",
                    formatter: function(element) {
                        return element ? element : "";
                    }
                });*/
                //varian schema drop down list
                var variantList = new sap.ui.commons.ListBox({
                    items: {
                        path: "/entries",
                        template: variantListItem
                    }
                });

                // varian    DropdownBox
                var variantDropdownBox = new sap.ui.commons.DropdownBox({
                    "association:listBox": variantList,
                    width: "100%",
                    displaySecondaryValues: true
                });
                variantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: variantLabel
                }));
                variantRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: variantDropdownBox
                }));

                var autoCreateCheckBox = new sap.ui.commons.CheckBox({
                    text: resourceLoader.getText("tit_cal_autocreat"),
                    tooltip: resourceLoader.getText("tit_cal_autocreat"),
                    checked: true
                });
                autoCreateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: new sap.ui.commons.Label({})
                }));
                autoCreateRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: autoCreateCheckBox
                }));
             /*   radioButtonGroup = new sap.ui.commons.RadioButtonGroup({
                    columns: 2,
                    width: "100%",
                    select: function() {
                        if (radioButtonGroup.getSelectedIndex() === 0) {
                            dataCatagiri.setEnabled(true);
                            mtrixLayout.removeRow(parameterCaseSenRow);
                            mtrixLayout.addRow(dataCataGoryRow);
                            mtrixLayout.addRow(starJoinRow);
                        } else {
                        	subTypeDropdownBox.setEnabled(false);
                            dataCatagiri.setEnabled(false);
                            mtrixLayout.removeRow(dataCataGoryRow);
                            mtrixLayout.removeRow(starJoinRow);
                            mtrixLayout.addRow(parameterCaseSenRow);
                        }
                    }
                });
                radioButtonGroup.addItem(new sap.ui.core.Item({
                    text: "Graphical",
                    enabled: true,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    key: "Key1"

                }));
                radioButtonGroup.addItem(new sap.ui.core.Item({
                    text: "Script",
                    enabled: true,
                    textDirection: sap.ui.core.TextDirection.Inherit,
                    key: "Key2"
                })); */
                dataCatagiri = new sap.ui.commons.ComboBox("", {
                    selectedItemId: "CUBE",
                    selectedKey: "CUBE",
                    editable: true,
                    width: "100%",
                    change: function() {
                        if (this.getSelectedKey() === "CUBE") {
                           // starJoin.setEnabled(true);
                        } else {
                           // starJoin.setChecked(false);
                           // starJoin.setEnabled(false);
                        }
                    }
                });


                var dataCategoryLabel = new sap.ui.commons.Label("", {
                    text: resourceLoader.getText("tit_data_category")
                });

                dataCatagiri.addItem(new sap.ui.core.ListItem({
                    text: "", // string
                    enabled: true, // boolean
                    textDirection: sap.ui.core.TextDirection.Inherit
                }));

                dataCatagiri.addItem(new sap.ui.core.ListItem({
                    text: "CUBE", // string
                    key: "CUBE",
                    enabled: true, // boolean
                    textDirection: sap.ui.core.TextDirection.Inherit
                }));
                dataCatagiri.addItem(new sap.ui.core.ListItem({
                    text: "DIMENSION",
                    key: "DIMENSION",
                    enabled: true,
                    textDirection: sap.ui.core.TextDirection.Inherit
                }));

                dataCataGoryRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell("", {
                    content: dataCategoryLabel
                }));
                dataCataGoryRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell("", {
                    content: dataCatagiri
                }));

               /* starJoin = new sap.ui.commons.CheckBox();
                starJoin.setText("With Star Join");*/
                starJoinRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: new sap.ui.commons.Label()
                }));

                starJoinRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                    content: starJoin
                }));

                // paraMeterCaseSensitive = new sap.ui.commons.CheckBox("", {});
                // paraMeterCaseSensitive.setChecked(true);
                // paraMeterCaseSensitive.setText(resourceLoader.getText("tit_parameter_case_sensitive"));

                parameterCaseSenRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell("", {
                    content: new sap.ui.commons.Label("", {})
                }));

                // parameterCaseSenRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell("", {
                //     content: paraMeterCaseSensitive
                // }));


                mtrixLayout.createRow(nameLabel, nameText);
                mtrixLayout.createRow(descriptionLabel, descriptionTextField);
                //adding sub type row to layout
                mtrixLayout.addRow(subTypeRow);
               // mtrixLayout.createRow(null, radioButtonGroup);
                mtrixLayout.addRow(dataCataGoryRow);
                mtrixLayout.addRow(starJoinRow);


                createButton = new sap.ui.commons.Button({
                    text: resourceLoader.getText("txt_create"),
                    style: sap.ui.commons.ButtonStyle.Emph,
                    enabled: false,
                    press: okButtonPressed
                }).addStyleClass("calcCreateBtn");

                cancelButton = new sap.ui.commons.Button({
                    text: resourceLoader.getText("txt_cancel"),
                    style: sap.ui.commons.ButtonStyle.Emph,
                    enabled: true,
                    press: cancelPressed
                }).addStyleClass("calcCancelBtn");



                dialog = new sap.ui.commons.Dialog("createViewDialog",{
                    title: resourceLoader.getText("tit_new_calculation_view"),
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
                });
                dialog.setInitialFocus(nameText);

                //   dialog.setWidth("25%");
                // dialog.setHeight("50%");

                if (that.fileDocument) {
                    var nameValue = that.fileDocument.getEntity().getName();
                    var index = nameValue.lastIndexOf(".calculationview");
                    if (index > 0) {
                        nameValue = nameValue.substring(0, index);
                    }
                    nameText.setValue(nameValue);
                    descriptionTextField.setValue(nameValue);
                    createButton.setEnabled(true);
                }

                that.context.i18n.applyTo(dialog);
                dialog.open();
                return dialog;
            },

            createContent: function(attributes) {
                var TABLE = {
                    TABLE_NAME_YEAR: "M_TIME_DIMENSION_YEAR",
                    TABLE_COL_YEAR: "YEAR,YEAR_INT",
                    TABLE_SCHEMA_NAME: "_SYS_BI",
                    TABLE_NAME_MONTH: "M_TIME_DIMENSION_MONTH",
                    TABLE_COL_MONTH: "YEAR,HALFYEAR,QUARTER,MONTH",
                    TABLE_NAME_WEEK: "M_TIME_DIMENSION_WEEK",
                    TABLE_COL_WEEK: "YEAR,HALFYEAR,QUARTER,MONTH,WEEK",
                    TABLE_NAME_DIMENSION: "M_TIME_DIMENSION",
                    TABLE_COL_DATE: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT",
                    TABLE_COL_HOUR: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,HOUR,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT,HOUR_INT,TZNTSTMPS,TZNTSTMPL",
                    TABLE_COL_MINUTE: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,HOUR,MINUTE,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT,HOUR_INT,MINUTE_INT,TZNTSTMPS,TZNTSTMPL",
                    TABLE_COL_SECOND: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,HOUR,MINUTE,SECOND,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT,HOUR_INT,MINUTE_INT,SECOND_INT,TZNTSTMPS,TZNTSTMPL",
                    TABLE_NAME_FISCAL: "M_FISCAL_CALENDAR",
                    TABLE_COL_FISCAL: "CALENDAR_VARIANT,DATE,DATE_SQL,FISCAL_YEAR,FISCAL_PERIOD",

                    //FOR SECOUND PROJECTION NODE OUTPUT COLUMN
                    TABLE_COL_DATE2: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,HOUR,MINUTE,SECOND,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT",
                    TABLE_COL_HOUR2: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,HOUR,MINUTE,SECOND,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT,HOUR_INT,TZNTSTMPS,TZNTSTMPL",
                    TABLE_COL_MINUTE2: "DATETIMESTAMP,DATE_SQL,DATETIME_SAP,DATE_SAP,YEAR,QUARTER,MONTH,WEEK,WEEK_YEAR,DAY_OF_WEEK,DAY,HOUR,MINUTE,SECOND,CALQUARTER,CALMONTH,CALWEEK,YEAR_INT,QUARTER_INT,MONTH_INT,WEEK_INT,WEEK_YEAR_INT,DAY_OF_WEEK_INT,DAY_INT,HOUR_INT,MINUTE_INT,TZNTSTMPS,TZNTSTMPL",


                    //keys          
                    TABLE_KEY_YEAR: "YEAR",
                    TABLE_KEY_MONTH: "YEAR,MONTH",
                    TABLE_KEY_WEEK: "YEAR,WEEK",
                    TABLE_KEY_DATE: "DATE_SAP",
                    TABLE_KEY_HOUR: "DATETIME_SAP,HOUR",
                    TABLE_KEY_MINITE: "DATETIME_SAP,MINUTE",
                    TABLE_KEY_SECOND: "DATETIME_SAP,SECOND",
                    TABLE_KEY_FISCAL: "CALENDAR_VARIANT,DATE"

                };
                var FILTER = {
                    FILTER_HOUR: "(\"SECOND\"='00') AND (\"MINUTE\"='00')",
                    FILTER_DATE: "(\"HOUR\"='00') AND (\"SECOND\"='00') AND (\"MINUTE\"='00')",
                    FLITER_MINUTE: "(\"SECOND\"='00')",
                    FLUTER_FISCAL: "(\"CALENDAR_VARIANT\"="
                };
                //@ LeveledHierarchy

                var HIRARCHIES = {
                    HIE_YEAR: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }],
                    HIE_MONTH: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "HALFYEAR",
                        levelType: viewmodel.LevelType.timeHalfYear,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "QUARTER",
                        levelType: viewmodel.LevelType.timeQuarters,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MONTH",
                        levelType: viewmodel.LevelType.timeMonths,
                        sortDirection: viewmodel.SortDirection.ASC
                    }],
                    HIE_WEEK: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "HALFYEAR",
                        levelType: viewmodel.LevelType.timeHalfYear,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "QUARTER",
                        levelType: viewmodel.LevelType.timeQuarters,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MONTH",
                        levelType: viewmodel.LevelType.timeMonths,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "WEEK",
                        levelType: viewmodel.LevelType.timeWeeks,
                        sortDirection: viewmodel.SortDirection.ASC
                    }],
                    HIE_DATE: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "QUARTER",
                        levelType: viewmodel.LevelType.timeQuarters,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MONTH",
                        levelType: viewmodel.LevelType.timeMonths,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "WEEK",
                        levelType: viewmodel.LevelType.timeWeeks,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "DAY",
                        levelType: viewmodel.LevelType.timeDays,
                        sortDirection: viewmodel.SortDirection.ASC
                    }],
                    HIE_HOUR: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "QUARTER",
                        levelType: viewmodel.LevelType.timeQuarters,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MONTH",
                       levelType: viewmodel.LevelType.timeMonths,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "WEEK",
                        levelType: viewmodel.LevelType.timeWeeks,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "DAY",
                        levelType: viewmodel.LevelType.timeDays,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "HOUR",
                        levelType: viewmodel.LevelType.timeHours,
                        sortDirection: viewmodel.SortDirection.ASC
                    }],
                    HIE_MINITE: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "QUARTER",
                        levelType: viewmodel.LevelType.timeQuarters,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MONTH",
                       levelType: viewmodel.LevelType.timeMonths,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "WEEK",
                        levelType: viewmodel.LevelType.timeWeeks,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "DAY",
                        levelType: viewmodel.LevelType.timeDays,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "HOUR",
                        levelType: viewmodel.LevelType.timeHours,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MINUTE",
                        levelType: viewmodel.LevelType.timeMinutes,
                        sortDirection: viewmodel.SortDirection.ASC
                    }],
                    HIE_SECOND: [{
                        elementName: "YEAR",
                        levelType: viewmodel.LevelType.timeYears,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "QUARTER",
                        levelType: viewmodel.LevelType.timeQuarters,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MONTH",
                        levelType: viewmodel.LevelType.timeMonths,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "WEEK",
                        levelType: viewmodel.LevelType.timeWeeks,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "DAY",
                        levelType: viewmodel.LevelType.timeDays,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "HOUR",
                        levelType: viewmodel.LevelType.timeHours,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "MINUTE",
                        levelType: viewmodel.LevelType.timeMinutes,
                        sortDirection: viewmodel.SortDirection.ASC
                    }, {
                        elementName: "SECOND",
                        levelType: viewmodel.LevelType.timeSeconds,
                        sortDirection: viewmodel.SortDirection.ASC
                    }]
                };

                var that = this;

                var model = new viewmodel.ViewModel(true);
                var columnView = model.createColumnView({
//                  schemaVersion: "2.3" ,  In DEV X Schema Version will be 3.0
                    schemaVersion: "3.0",
                    name: attributes.name,
                    id: that.namespace + "::" + attributes.name,
                    namespace:that.namespace,
                    dataCategory: attributes.dataCatagory,
                    dimensionType: attributes.dimensionType,
                    clientDependent: "false",
                    applyPrivilegeType: "SQL_ANALYTIC_PRIVILEGE",
                    scriptParametersCaseSensitive: attributes.scriptParametersCaseSensitive,
                    label: attributes.description
                });
                var viewNode;
                if (attributes.dimensionType === "TIME") {
                    attributes.dataCatagory = "DIMENSION";
                    attributes.isGraphical = true;
                }
                if (attributes.isGraphical) {
                    if (attributes.dataCatagory === "DIMENSION") {
                        viewNode = columnView.createViewNode({
                            type: "Projection",
                            name: "Projection"
                        }, null, true);
                    } else if (attributes.dataCatagory === "CUBE") {
                        if (attributes.starJoin) {
                            viewNode = columnView.createViewNode({
                                type: "JoinNode",
                                name: "Star Join"
                            }, null, true);
                        } else {
                            viewNode = columnView.createViewNode({
                                type: "Aggregation",
                                name: "aggregation"
                            }, null, true);
                        }
                    } else {
                        viewNode = columnView.createViewNode({
                            type: "Projection",
                            name: "Projection"
                        }, null, true);
                    }
                } else {
                    viewNode = columnView.createViewNode({
                        type: "Script",
                        name: "Script_View",
                        language: "SQLSCRIPT",
                        definition: "/********* Begin Procedure Script ************/ \n" +
                            "BEGIN \n" +
                            "   var_out = select 1 as COL from DUMMY; \n" +
                            "\n" +
                            "END /********* End Procedure Script ************/"
                    }, null, true);
                    var element = viewNode.createElement({
                        name: "COL",
                        aggregationBehavior: "COUNT",
                        label: "COL"
                    });
                    element.createOrMergeSimpleType({
                        isDerived: false,
                        primitiveType: "INTEGER"
                    });
                }


                if (attributes.dimensionType === "TIME" && attributes.isAutoCreate) {
                    var input;

                    //creating calc based on Gregorian calender 
                    if (attributes.calenderType === "Gregorian") {
                        //create cals based on year granularity
                        if (attributes.granularity === "Year") {
                            //M_TIME_DIMENSION_YEAR 
                            input = {
                                tableName: TABLE.TABLE_NAME_YEAR,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_YEAR,
                                key: TABLE.TABLE_KEY_YEAR,
                                hasFilterExpressions: false,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_YEAR
                            };
                            // ModelProxyResolver.ProxyResolver.resolve(that.model, that.context, updateCombo);
                        }
                        //create cals based on Month granularity
                        else if (attributes.granularity === "Month") {
                            //M_TIME_DIMENSION_MONTH 
                            input = {
                                tableName: TABLE.TABLE_NAME_MONTH,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_MONTH,
                                key: TABLE.TABLE_KEY_MONTH,
                                hasFilterExpressions: false,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_MONTH
                            };
                        }
                        //create cals based on Week granularity
                        else if (attributes.granularity === "Week") {
                            //M_TIME_DIMENSION_WEEK 
                            input = {
                                tableName: TABLE.TABLE_NAME_WEEK,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_WEEK,
                                key: TABLE.TABLE_KEY_WEEK,
                                hasFilterExpressions: false,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_WEEK
                            };
                        }
                        //create cals based on Date granularity
                        else if (attributes.granularity === "Date") {
                            //M_TIME_DIMENSION
                            input = {
                                tableName: TABLE.TABLE_NAME_DIMENSION,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_DATE2,
                                projectNode2ColList: TABLE.TABLE_COL_DATE,
                                key: TABLE.TABLE_KEY_DATE,
                                hasFilterExpressions: true,
                               filterExpressions: FILTER.FILTER_DATE,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_DATE
                            };
                        }
                        //create cals based on Hour granularity
                        else if (attributes.granularity === "Hour") {
                            //M_TIME_DIMENSION
                            input = {
                                tableName: TABLE.TABLE_NAME_DIMENSION,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_HOUR2,
                                projectNode2ColList: TABLE.TABLE_COL_HOUR,
                                key: TABLE.TABLE_KEY_HOUR,
                                hasFilterExpressions: true,
                                filterExpressions: FILTER.FILTER_HOUR,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_HOUR
                            };
                        }
                        //create cals based on Minute granularity
                        else if (attributes.granularity === "Minute") {
                            //M_TIME_DIMENSION
                            input = {
                                tableName: TABLE.TABLE_NAME_DIMENSION,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_MINUTE2,
                                projectNode2ColList: TABLE.TABLE_COL_MINUTE,
                                key: TABLE.TABLE_KEY_MINITE,
                                hasFilterExpressions: true,
                                filterExpressions: FILTER.FLITER_MINUTE,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_MINITE
                            };
                        }
                        //create cals based on Second granularity
                        else if (attributes.granularity === "Second") {
                            //M_TIME_DIMENSION
                            input = {
                                tableName: TABLE.TABLE_NAME_DIMENSION,
                                schemaName: TABLE.TABLE_SCHEMA_NAME,
                                list: TABLE.TABLE_COL_SECOND,
                                key: TABLE.TABLE_KEY_SECOND,
                                hasFilterExpressions: false,
                                hasHirarchy: true,
                                hirarchy: HIRARCHIES.HIE_SECOND
                            };
                        }
                        that.createTimeBasedCalc(that, model, attributes, input);
                    } else if (attributes.calenderType === "Fiscal") {
                        //M_FISCAL_CALEDAR 
                        input = {
                            tableName: TABLE.TABLE_NAME_FISCAL,
                            schemaName: TABLE.TABLE_SCHEMA_NAME,
                            list: TABLE.TABLE_COL_FISCAL,
                            projectNode2ColList: TABLE.TABLE_COL_FISCAL,
                            key: TABLE.TABLE_KEY_FISCAL,
                            hasFilterExpressions: true,
                            filterExpressions: FILTER.FLUTER_FISCAL + "'" + attributes.variant + "')",
                            hasHirarchy: false
                        };
                        that.createTimeBasedCalc(that, model, attributes, input);
                    }
                    viewNode.createLayout({
                        xCoordinate: "40",
                        yCoordinate: "85"
                    });
                    viewNode.layout.expanded = true;
                } else {
                    viewNode.createLayout({
                        xCoordinate: "40",
                        yCoordinate: "85"
                    });
                    viewNode.layout.expanded = true;
                    that.creatFile(model, attributes, that);
               }
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
                //  var that = this;
                if (!this.checkValidUnicodeChar(sName)) {
                    return resourceLoader.getText("msg_column_invalid_unicode", this.getInvalidUnicodeCharacters());
                }
                return undefined;
            },
            
             INVALID_RESOURCE_CHARACTERS: ['\\', '/', ':', '*', '?', '"', '<', '>', '|', '.', '&', ';', '\'', '$', '%', ',', '!', '#', '+', '~', '`', '[', ']', '!', '@', '^', '=', '-', '(', ')', '{', '}'],
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
                    if (tip instanceof sap.ui.commons.Callout) { // check whether the tip is still registered to prevent hanging tips that never close
                        tip.openPopup(control);
                    }
                }, 200);
            },
            createInputforcalc: function(searchProperties, model) {
                var targetNode = model.columnView.viewNodes.get(searchProperties.nameOfProject);
                if (targetNode) {
                    var source;
                    var sourceName;
                    if (searchProperties) {
                        source = model.createOrMergeEntity(searchProperties);
                        if (source) {
                            source.isProxy = true;
                        }
                        sourceName = source.getFullyQualifiedName();
                        if (source.physicalSchema && searchProperties.context) {
                            var callback = function(value) {
                                if (value) {
                                    source.schemaName = value;
                                }
                            };
                           // SchemaMappingService.schemaMapping.deriveAuthoringSchemaFor(source.physicalSchema, searchProperties.context.packageName, searchProperties.context, callback);
                        }
                    }
                    if (source) {
                        var input = targetNode.createInput();
                        this.inputKey = input.$getKeyAttributeValue();
                        input.setSource(source);
                        return input;
                    }
                }

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
                    if (dataType === "BIGINT" || dataType === "DECIMAL" || dataType === "DOUBLE" || dataType === "FLOAT" || dataType === "INTEGER" || dataType === "REAL" || dataType === "SMALLDECIMAL" || dataType === "SMALLINT" || dataType === "TINYINT") {
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
                            if (sourceElement.aggregationBehavior && !(this.input.getSource().type === "DATA_BASE_TABLE" || this.input._source instanceof viewmodel.ViewNode)) {
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
                    if (this.objectAttributes.aggregationBehavior === viewmodel.AggregationBehavior.NONE && !this.calculationAttributes && !this.counter && viewNode.isDefaultNode()) {
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
                                unionMapping.sourceElement = this.mappingAttributes[i].sourceName ? this.mappingAttributes[i].input.getSource().elements.get(this.mappingAttributes[i].sourceName) : undefined;
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
            creatFile: function(model, attributes, that) {
                var doc = RepositoryXmlRenderer.renderScenario(model);
                var content = XmlSerializer.serializeToString(doc);
                if (that.fileDocument) {
                    // file already exists, set and save the file content
                    return that.fileDocument.setContent(content).then(function() {
                    	 that.context.service.document.open(that.fileDocument),
                         that.context.service.repositorybrowser.setSelection(that.fileDocument, true)
                    }).done();
                } else {
                    // create the file with content and open the document
                    that.folderDocument.createFile(attributes.name + ".hdbcalculationview").then(function(fileDocument) {
                        if (fileDocument) {
                            return fileDocument.setContent(content).then(function() {
                                                                                                                return Q.all([
                                                                                                                                                                fileDocument.save(),
                                                                                                                                                                //utilityProvider.writeToCurrentFile(content),
                                      //  utilityProvider.saveDocumentInactive(fileDocument, true),
                                        that.context.service.document.open(fileDocument),
                                        that.context.service.repositorybrowser.setSelection(fileDocument, true)
                                    ]);
                              /*  return that.context.service.ideutils.getGeneralUtilityProvider().then(function(utilityProvider) {
                                    return Q.all([
                                        utilityProvider.saveDocumentInactive(fileDocument, true),
                                        that.context.service.document.open(fileDocument),
                                        that.context.service.repositorybrowser.setSelection(fileDocument, true)
                                    ]);
                                });*/
                            });
                        }
                    }).fail(function(error) {
                        that.context.service.usernotification.alert(that.context.i18n.getText("i18n", "msg_create_file_error") + "\n" + error).done();
                    });
                }
            },
            createListOfOutputElements: function(model, list, that, nameOfNode) {
                var input = model.columnView.viewNodes.get(nameOfNode).inputs._values[0];
                var elements = input.getSource().elements;
                for (var i = 0; i < list.length; i++) {
                    var element = {
                        input: input,
                        mappingAttributes: {
                            sourceName: elements.get(list[i]).name,
                            targetName: elements.get(list[i]).name,
                            type: "ElementMapping"
                        },
                        objectAttributes: {
                            label: elements.get(list[i]).name,
                            name: elements.get(list[i]).name
                        },
                        typeAttributes: {
                            length: elements.get(list[i]).inlineType.length,
                            primitiveType: elements.get(list[i]).inlineType.primitiveType
                        }
                    };
                    that.createElementCalc(element, model, nameOfNode);
                }
            },
            createTimeBasedCalc: function(that, model, attributes, input) {
                var table = {
                    context: that.context,
                    name: input.tableName,
                    packageName: "",
                    physicalSchema: input.schemaName,
                    schemaName: input.schemaName,
                    type: "DATA_BASE_TABLE",
                    nameOfProject: "Projection"
                };
                if (input.hasFilterExpressions) {
                    var viewNode = model.columnView.createViewNode({
                        type: "Projection",
                        name: "Projection_1"
                    }, null, false);
                    viewNode.createLayout({
                        xCoordinate: "40",
                        yCoordinate: "185"
                    });
                    viewNode.layout.expanded = true;
                    table.nameOfProject = "Projection_1";
                }
                that.createInputforcalc(table, model);
                var list = (input.list).split(",");
                var afterCreatingInput = function() {
                    //craete the view element
                    that.createListOfOutputElements(model, list, that, table.nameOfProject);
                    if (input.hasFilterExpressions) {
                        var defInput = model.columnView.getDefaultNode().createInput();
                        defInput.setSource(model.columnView.viewNodes.get("Projection_1"));
                        if (input.filterExpressions) {
                            model.columnView.viewNodes.get("Projection_1").createFilterExpression({
                                formula: input.filterExpressions,
                                expressionLanguage: "SQL"
                            });
                        }
                        var list2 = (input.projectNode2ColList).split(",");
                        that.createListOfOutputElements(model, list2, that, "Projection");
                    }
                    if (input.hasHirarchy) {
                        var hie = model.columnView.createInlineHierarchy({
                            name: "Gregorian_Hierarchy",
                            type: viewmodel.HierarchyType.LEVELED,
                            label: "Gregorian_Hierarchy",
                            rootNodeVisibility: viewmodel.RootNodeVisibility.ADD_ROOT_NODE
                        });
                        var hirarchy = input.hirarchy;
                        for (var i = 0; i < hirarchy.length; i++) {
                            hie.createLevel({
                                element: model.columnView.getDefaultNode().elements.get(hirarchy[i].elementName),
                                levelType: hirarchy[i].levelType,
                                sortDirection: viewmodel.SortDirection.ASC,
                                orderElement: model.columnView.getDefaultNode().elements.get(hirarchy[i].elementName)
                            });
                        }
                    }
                    //creating xml file for view 
                    that.setKeyElements(model, input.key);
                    that.creatFile(model, attributes, that);
                };
                ModelProxyResolver.ProxyResolver.resolve(model, that.context, afterCreatingInput);
            },
            setKeyElements: function(model, key) {
                var node = model.columnView.getDefaultNode();
                if (node) {
                    var keys = key.split(",");
                    for (var i = 0; i < keys.length; i++) {
                        node.keyElements._keys.push(keys[i]);
                        node.keyElements._values[keys[i]] = node.elements._values[keys[i]];
                    }
                }
            }
        };
        return NewCalculationViewDialog;
    }); 
