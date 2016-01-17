/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define([
        "../util/ResourceLoader",
        "../base/modelbase",
        "../viewmodel/commands"
    ],
    function(ResourceLoader, modelbase, commands) {
        "use strict";

        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");

        /**
         * @class
         */
        var ColumnViewPropertiesPane = function(undoManager, context) {
            this._undoManager = undoManager;
            this._context = context;
        };

        ColumnViewPropertiesPane.prototype = {

            _execute: function(command) {
                return this._undoManager.execute(command);
            },

            getContent: function() {
                var that = this;
                var layout = new sap.ui.layout.form.ResponsiveGridLayout();

                var schemaListBox = new sap.ui.commons.ListBox();
                var dataCategoryListBox = new sap.ui.commons.ListBox({
                    items: [
                        new sap.ui.core.ListItem({
                            key: "DEFAULT",
                            text: ""
                        }),
                        new sap.ui.core.ListItem({
                            key: "CUBE",
                            text: resourceLoader.getText("txt_cube")
                        }),
                    ]
                });
                var privilegesListBox = new sap.ui.commons.ListBox({
                    items: [
                        new sap.ui.core.ListItem({
                            key: "ANALYTIC_PRIVILEGE",
                            text: resourceLoader.getText("txt_analytic_privileges")
                        }),
                        new sap.ui.core.ListItem({
                            key: "SQL_ANALYTIC_PRIVILEGE",
                            text: resourceLoader.getText("txt_sql_analytic_privileges")
                        }),
                    ]
                });

                var form = new sap.ui.layout.form.Form({
                    layout: layout,
                    formContainers: [
                        new sap.ui.layout.form.FormContainer({
                            formElements: [
                                // use a ComboBox for the schema to allow for setting a schema that does not yet exist
                                new sap.ui.layout.form.FormElement({
                                    label: resourceLoader.getText("tit_default_schema"),
                                    fields: [
                                        new sap.ui.commons.ComboBox({
                                            listBox: schemaListBox,
                                            value: "{defaultSchema}",
                                            change: function(event) {
                                                var value = event.getParameter("newValue");
                                                that._execute(new commands.ChangeColumnViewPropertiesCommand({
                                                    defaultSchema: value
                                                }));
                                            }
                                        })
                                    ]
                                }),
                                new sap.ui.layout.form.FormElement({
                                    label: resourceLoader.getText("tit_data_category"),
                                    fields: [
                                        new sap.ui.commons.DropdownBox({
                                            listBox: dataCategoryListBox,
                                            selectedKey: "{dataCategory}",
                                            change: function(event) {
                                                var source = event.getSource();
                                                var key = source.getSelectedKey();
                                                that._execute(new commands.ChangeColumnViewPropertiesCommand({
                                                    dataCategory: key
                                                }));
                                            }
                                        })
                                    ]
                                }),
                                new sap.ui.layout.form.FormElement({
                                    label: resourceLoader.getText("tit_apply_privileges"),
                                    fields: [
                                        new sap.ui.commons.DropdownBox({
                                            listBox: privilegesListBox,
                                            selectedKey: "{applyPrivilegeType}",
                                            change: function(event) {
                                                var source = event.getSource();
                                                var key = source.getSelectedKey();
                                                that._execute(new commands.ChangeColumnViewPropertiesCommand({
                                                    applyPrivilegeType: key
                                                }));
                                            }
                                        })
                                    ]
                                }),
                                new sap.ui.layout.form.FormElement({
                                    label: resourceLoader.getText("tit_description"),
                                    fields: [
                                        new sap.ui.commons.TextArea({
                                            value: "{label}",
                                            change: function(event) {
                                                var value = event.getParameter("newValue");
                                                that._execute(new commands.ChangeColumnViewPropertiesCommand({
                                                    label: value
                                                }));
                                            }
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                });

                if (this._context.service) {
                    /*this._context.service.catalogDAO.getSchemas().then(function(result) {
                        if (!result || !result.schemas) return;
                        for (var i = 0; i < result.schemas.length; i++) {
                            schemaListBox.addItem(new sap.ui.core.ListItem({
                                key: result.schemas[i].schemaName,
                                text: result.schemas[i].schemaName
                            }));
                        }
                    });*/
                }

                return form;
            }

        };

        return ColumnViewPropertiesPane;

    });
