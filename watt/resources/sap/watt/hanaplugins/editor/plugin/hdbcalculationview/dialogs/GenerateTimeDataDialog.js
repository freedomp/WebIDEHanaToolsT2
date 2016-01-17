/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader",  "../base/MetadataServices", "sap/hana/ide/common/plugin/consolelogger/service/ConsoleLogger"], function(ResourceLoader, MetadataServices, ioConsoleLogger) {
    "use strict";

    var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
    var myService = MetadataServices.SearchService;
    var GenerateTimeDataDialog = function(attributes) {
        this.context = attributes.context;

    };

    GenerateTimeDataDialog.prototype = {
        openDialog: function() {
            var that = this;
            var createButton, cancelButton, dialog;

            function cancelPressed() {
                dialog.close();

            }

            function okButtonPressed() {
                var attributes = {
                    startYear: fromYearTextField.getValue(),
                    endYear: toYearTextField.getValue(),
                    granularityType: granularityTypeDropdownBox.getValue(),
                    schemaName: variantSchemaDropdownBox.getValue(),
                    variantType: variantDropdownBox.getValue(),
                    calendarType: calenderTypeDropdownBox.getValue(),
                    firstDayOfWeek: dayTypeDropdownBox.getValue(),
                    context: that.context
                };
                var startYear = attributes.startYear;
                var endYear = attributes.endYear;

                //For Gegorian Calender    
                if (attributes.calendarType === "Gregorian") {
                    if (attributes.startYear == '' || attributes.endYear == '') {
                        oTV.setText("Please make sure all the mandatory fields are entered");
                    } else if (attributes.granularityType === "Year" ||
                        attributes.granularityType === "Month" ||
                        attributes.granularityType === "Week" ||
                        attributes.granularityType === "Day") {

                        if ((startYear <= endYear) && (startYear > 1900) && (startYear < 2200) && (endYear > 1900) && (endYear < 2200)) {
                            if (attributes.endYear - attributes.startYear <= 50) {
                                that.generateGregorianData(attributes);
                                dialog.close();
                            } else {
                                oTV.setText("Range for " + attributes.granularityType + " granularity is 50 years");
                            }
                        } else {
                            oTV.setText("Cannot generate time data; enter a valid period");
                        }
                    } else if (attributes.granularityType === "Hour") {
                        if ((startYear <= endYear) && (startYear > 1900) && (startYear < 2200) && (endYear > 1900) && (endYear < 2200)) {
                            if (attributes.endYear - attributes.startYear <= 30) {
                                that.generateGregorianData(attributes);
                                dialog.close();
                            } else {
                                oTV.setText("Range for " + attributes.granularityType + " granularity is 30 years");
                            }
                        } else {
                            oTV.setText("Cannot generate time data; enter a valid period");
                        }
                    } else if (attributes.granularityType === "Minute") {
                        if ((startYear <= endYear) && (startYear > 1900) && (startYear < 2200) && (endYear > 1900) && (endYear < 2200)) {
                            if (endYear - startYear <= 15) {
                                that.generateGregorianData(attributes);
                                dialog.close();
                            } else {
                                oTV.setText("Range for " + attributes.granularityType + " granularity is 15 years");
                            }
                        } else {
                            oTV.setText("Cannot generate time data; enter a valid period");
                        }
                    } else if (attributes.granularityType === "Second") {
                        if ((startYear <= endYear) && (startYear > 1900) && (startYear < 2200) && (endYear > 1900) && (endYear < 2200)) {
                            if (endYear - startYear <= 5) {
                                that.generateGregorianData(attributes);
                                dialog.close();
                            } else {
                                oTV.setText("Range for " + attributes.granularityType + " granularity is 5 years");
                            }
                        } else {
                            oTV.setText("Cannot generate time data; enter a valid period");
                        }
                    }
                    //For Fiscal Calender
                } else {
                    if (startYear == '' || endYear == '' || attributes.variantType == '') {
                        oTV.setText("Please make sure all the mandatory fields are entered");
                    } else if ((startYear <= endYear) && (startYear > 1900) && (startYear < 2200) && (endYear > 1900) && (endYear < 2200)) {
                        if (endYear - startYear <= 50) {
                            that.generateFiscalData(attributes);
                            dialog.close();
                        } else {
                            oTV.setText("Range for " + attributes.calendarType + " granularity is 50 years");
                        }
                    } else {
                        oTV.setText("Cannot generate time data; enter a valid period");
                    }

                }

            }

            var mtrixLayout = new sap.ui.commons.layout.MatrixLayout({
                visible: true, // boolean
                layoutFixed: false, // boolean
                width: "100%",
                columns: 2, // int
                widths: ["40%", "60%"]
            });
            var oCell = new sap.ui.commons.layout.MatrixLayoutCell({
                colSpan: 5
            });

            var oTV = new sap.ui.commons.TextView({
                text: '',
                semanticColor: sap.ui.commons.TextViewColor.Negative
            }).addStyleClass("error-msg");

            oCell.addContent(oTV);
            mtrixLayout.createRow(oCell);
            var fromYearRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var toYearRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var calenderTypeRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var granularityRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var variantSchemaRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var variantRow = new sap.ui.commons.layout.MatrixLayoutRow();
            var dayTypeRow = new sap.ui.commons.layout.MatrixLayoutRow();
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
                oTV.setText('');
                var currentType = calenderTypeDropdownBox.getValue();
                if (currentType === "Gregorian") {
                    granularityTypeDropdownBox.setValue("Year");
                    mtrixLayout.addRow(granularityRow);
                    mtrixLayout.removeRow(variantSchemaRow);
                    mtrixLayout.removeRow(variantRow);

                } else if (currentType === "Fiscal") {
                    /*myService.searchNew("T009", 'PATTERN', 100, true, true, true, function(data, textStatus) {
                        if (data) {
                            var text = JSON.stringify(data);
                            var metadata = data.metadata;
                        }
                    });*/
                    mtrixLayout.removeRow(granularityRow);
                    mtrixLayout.removeRow(dayTypeRow);
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


            var fromYearLabel = new sap.ui.commons.Label({
                design: sap.ui.commons.LabelDesign.Standard,
                textDirection: sap.ui.core.TextDirection.Inherit,
                wrapping: true,
                text: resourceLoader.getText("txt_from_year"),
                visible: true,
                textAlign: sap.ui.core.TextAlign.Begin,
                required: true
            });

            var fromYearTextField = new sap.ui.commons.TextField({
                value: "", // string
                textDirection: sap.ui.core.TextDirection.Inherit,
                valueState: sap.ui.core.ValueState.None,
                textAlign: sap.ui.core.TextAlign.Begin,
                imeMode: sap.ui.core.ImeMode.Auto,
                design: sap.ui.core.Design.Standard,
                accessibleRole: sap.ui.core.AccessibleRole.Textbox,
                placeholder: resourceLoader.getText("txt_gen_from_year"),
                width: "100%",
                minLength: 4,
                maxLength: 4
            }).addStyleClass("marginLs");

            fromYearTextField.attachBrowserEvent("keypress", function(e) {
                var key_codes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8];
                if (!($.inArray(e.which, key_codes) >= 0)) {
                    e.preventDefault();
                }

            });

            var toYearLabel = new sap.ui.commons.Label({
                design: sap.ui.commons.LabelDesign.Standard,
                textDirection: sap.ui.core.TextDirection.Inherit,
                wrapping: true,
                text: resourceLoader.getText("txt_to_year"),
                visible: true,
                textAlign: sap.ui.core.TextAlign.Begin,
                required: true
            });

            var toYearTextField = new sap.ui.commons.TextField({
                value: "", // string
                textDirection: sap.ui.core.TextDirection.Inherit,
                valueState: sap.ui.core.ValueState.None,
                textAlign: sap.ui.core.TextAlign.Begin,
                imeMode: sap.ui.core.ImeMode.Auto,
                design: sap.ui.core.Design.Standard,
                accessibleRole: sap.ui.core.AccessibleRole.Textbox,
                placeholder: resourceLoader.getText("txt_gen_to_year"),
                width: "100%",
                minLength: 4,
                maxLength: 4
            }).addStyleClass("marginLs");

            toYearTextField.attachBrowserEvent("keypress", function(e) {
                var key_codes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8];
                if (!($.inArray(e.which, key_codes) >= 0)) {
                    e.preventDefault();
                }
            });


            toYearRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: toYearLabel
            }));
            toYearRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: toYearTextField
            }));
            fromYearRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: fromYearLabel
            }));
            fromYearRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: fromYearTextField
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
                        text: "Day"
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
            granularityTypeDropdownBox.attachChange(function() {
                oTV.setText('');
                var currentType = granularityTypeDropdownBox.getValue();
                if (currentType === "Day" || currentType === "Week") {
                    mtrixLayout.addRow(dayTypeRow);
                    dayTypeDropdownBox.setValue("Sunday");
                } else if (currentType === "Year" || currentType === "Month" || currentType === "Hour" || currentType === "Minute" || currentType === "Second") {
                    mtrixLayout.removeRow(dayTypeRow);
                }
            });

            granularityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: granularityTypeLabel
            }));
            granularityRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: granularityTypeDropdownBox
            }));
            var dayTypeLabel = new sap.ui.commons.Label({
                design: sap.ui.commons.LabelDesign.Standard,
                textDirection: sap.ui.core.TextDirection.Inherit,
                wrapping: true,
                text: resourceLoader.getText("tit_genarate_daytype"),
                visible: true,
                textAlign: sap.ui.core.TextAlign.Begin,
                required: false
            });


            var dayTypeList = new sap.ui.commons.ListBox({
                items: [
                    new sap.ui.core.ListItem({
                        text: "Sunday"
                    }),
                    new sap.ui.core.ListItem({
                        text: "Monday"
                    }),
                    new sap.ui.core.ListItem({
                        text: "Tuesday"
                    }),
                    new sap.ui.core.ListItem({
                        text: "Wednesday"
                    }),
                    new sap.ui.core.ListItem({
                        text: "Thursday"
                    }),
                    new sap.ui.core.ListItem({
                        text: "Friday"
                    }),
                    new sap.ui.core.ListItem({
                        text: "Saturday"
                    })
                ]
            });

            var dayTypeDropdownBox = new sap.ui.commons.DropdownBox({
                value: "Gregorian",
                "association:listBox": dayTypeList,
                width: "100%"
            });


            dayTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: dayTypeLabel
            }));
            dayTypeRow.addCell(new sap.ui.commons.layout.MatrixLayoutCell({
                content: dayTypeDropdownBox
            }));
            dayTypeDropdownBox.attachChange(function() {
                oTV.setText('');
            });
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
                oTV.setText('');
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
                        result.responses[0].result.entries.unshift({
                            0: "ALL",
                            1: "ALL"
                        });
                        variantModel.setData(result.responses[0].result);
                        variantList.setModel(variantModel);
                    }

                });*/
            });

            /*myService.searchNew("T009", 'PATTERN', 100, true, true, true, function(data, textStatus) {
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
            });*/

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

            createButton = new sap.ui.commons.Button({
                text: resourceLoader.getText("txt_create"),
                style: sap.ui.commons.ButtonStyle.Emph,
                enabled: true,
                press: okButtonPressed
            });

            cancelButton = new sap.ui.commons.Button({
                text: resourceLoader.getText("txt_cancel"),
                style: sap.ui.commons.ButtonStyle.Emph,
                enabled: true,
                press: cancelPressed
            });
            dialog = new sap.ui.commons.Dialog({
                title: resourceLoader.getText("Generate Time Data"),
                applyContentPadding: true,
                showCloseButton: false,
                resizable: false,
                contentBorderDesign: sap.ui.commons.enums.BorderDesign.Thik,
                modal: true,
                accessibleRole: sap.ui.core.AccessibleRole.Dialog,
                content: mtrixLayout,
                buttons: [createButton, cancelButton],
                defaultButton: createButton,
                keepInWindow: true,
                height: "300px",
                width: "350px"
            });


            mtrixLayout.addRow(calenderTypeRow);
            mtrixLayout.addRow(fromYearRow);
            mtrixLayout.addRow(toYearRow);
            mtrixLayout.addRow(granularityRow);

            dialog.setInitialFocus(calenderTypeDropdownBox);
            dialog.open();
            return dialog;
        },

        generateGregorianData: function(attributes) {
            var aStatements = [];
            var stmt;
            if (attributes.granularityType === "Day" || attributes.granularityType === "Week") {
                stmt = "MDX UPDATE TIME DIMENSION " + attributes.granularityType + " " + attributes.startYear + " " + attributes.endYear + " FIRST_DAY_OF_WEEK " + attributes.firstDayOfWeek;
            } else {
                stmt = "MDX UPDATE TIME DIMENSION " + attributes.granularityType + " " + attributes.startYear + " " + attributes.endYear;
            }
            var oStatement = {
                statement: stmt,
                type: "SELECT"
            };
            var oSettings;
            var tunnel;

            /*CatalogDAO.sqlExecute(oStatement, oSettings, function(result, tunnel, roundtripTime) {
                if (result && result.entries && result.entries.length > 0) {
                    ioConsoleLogger.writeSuccessMessage("Time data generated successfully");
                } else {
                    ioConsoleLogger.writeErrorMessage(result.message);
                }
            }, tunnel);*/

        },

        generateFiscalData: function(attributes) {
            var aStatements = [];
            var stmt = "MDX UPDATE FISCAL CALENDAR " + attributes.schemaName + " " + attributes.variantType + " " + attributes.startYear + " " + attributes.endYear;
            var oStatement = {
                statement: stmt,
                type: "SELECT"
            };
            var oSettings;
            var tunnel;

           /* CatalogDAO.sqlExecute(oStatement, oSettings, function(result, tunnel, roundtripTime) {
                if (result && result.entries && result.entries.length > 0) {
                    ioConsoleLogger.writeSuccessMessage("Time data generated successfully");
                } else {
                    ioConsoleLogger.writeErrorMessage(result.message);
                }
            }, tunnel);*/



        }
    };


    return GenerateTimeDataDialog;
});
