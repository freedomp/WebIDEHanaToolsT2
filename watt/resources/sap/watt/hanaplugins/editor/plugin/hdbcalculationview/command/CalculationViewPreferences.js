/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
define(["../util/ResourceLoader"
    ],
    function(ResourceLoader) {
        "use strict";
        var resourceLoader = new ResourceLoader("/watt/resources/sap/watt/hanaplugins/editor/plugin/hdbcalculationview");
        var options = [{
            key: "performanceAnalysis",
            text: "Performance Analysis",
            jsonModel: {},
            values: [{
                key: "performanceAnalysisAlwaysOn",
                value: false,
                defaultValue: false
            }, {
                key: "performanceAnalysisThresholdValue",
                value: "5000",
                defaultValue: "5000"
            }]
        }];

        return {
            _goUserSettings: {},
            _goLogger: undefined,
            _goSelectedOption: options[0],

            _initialiseOptions: function() {
                //for all the options, fetch the values from the preference store
                //also, set the data for the jsonModel
                var that = this;
                options.forEach(function(opt) {
                    var data = {};
                    opt.values.forEach(function(val) {
                        val.value = that._getPreferenceValue(val.key) || val.defaultValue;
                        data[val.key] = val.value;
                    });
                    opt.jsonModel = new sap.ui.model.json.JSONModel(data);
                });
            },

            execute: function() {
                var that = this;
                return this._getUserSettings().then(function() {
                    that._initialiseOptions();
                    return that._showPreferencesPopup();
                });
            },

            _showPreferencesPopup: function() {
                var that = this;

                var loButtonApply = new sap.ui.commons.Button({
                    tooltip: "Apply",
                    text: "Apply",
                    press: function() {
                        that._applyPreferences();
                    }
                });

                var oGridForm = new sap.ui.layout.Grid({
                    hSpacing: 1,
                    vSpacing: 1,
                    content: that._addContent(),
                    width: "100%"
                });

                var loButtonCancel = new sap.ui.commons.Button({
                    tooltip: "Cancel",
                    text: "Cancel",
                    press: function() {
                        loThisDia.destroy();
                    }
                });
                var loButtonOK = new sap.ui.commons.Button({
                    tooltip: "OK",
                    text: "OK",
                    press: function() {
                        that._applyPreferences();
                        loThisDia.destroy();
                    }
                });
                var loButtonRestore = new sap.ui.commons.Button({
                    tooltip: "Restore Defaults",
                    text: "Restore Defaults",
                    press: function() {
                        that._restoreDefaults();
                    }
                });
                var loThisDia = new sap.ui.commons.Dialog({
                    title: resourceLoader.getText("txt_calculation_view_preferences"),
                    resizable: false,
                    contentBorderDesign: sap.ui.commons.enums.BorderDesign.Thick,
                    modal: true,
                    accessibleRole: sap.ui.core.AccessibleRole.Dialog,
                    content: oGridForm,
                    buttons: [loButtonRestore, loButtonApply, loButtonOK, loButtonCancel],
                    defaultButton: loButtonOK,
                    keepInWindow: true,
                    width: "30%",
                    maxWidth: "50%"
                });
                loThisDia.open();
            },

            _addContent: function() {
                var that = this;

                var optionsLbl = new sap.ui.commons.Label({
                    text: resourceLoader.getText('txt_select_setting'),
                    layoutData: new sap.ui.layout.GridData({
                        span: "L12 M12 S12"
                    })
                });

                var itemsList = [];
                options.forEach(function(opt) {
                    itemsList.push(new sap.ui.core.ListItem({
                        text: opt.text,
                        key: opt.key
                    }));
                });

                var selectedOptionLbl = new sap.ui.commons.FormattedTextView({
                    layoutData: new sap.ui.layout.GridData({
                        span: "L12 M12 S12"
                    }),
                    htmlText: '<strong>' + that._goSelectedOption.text + '</strong>'
                });

                var vLayout = new sap.ui.layout.VerticalLayout({
                    content: [this._getSelectedOptionContent(that._goSelectedOption.key)],
                    layoutData: new sap.ui.layout.GridData({
                        span: "L12 M12 S12"
                    })
                });

                var optionsDropdown = new sap.ui.commons.DropdownBox({
                    width: "100%",
                    tooltip: resourceLoader.getText('txt_select_setting'),
                    items: itemsList,
                    layoutData: new sap.ui.layout.GridData({
                        span: "L12 M12 S12"
                    }),
                    change: function(oEvent) {
                        for (var i = 0; i < options.length; i++) {
                            var opt = options[i];
                            if (oEvent.oSource.getSelectedKey() === opt.key) {
                                that._goSelectedOption = opt;
                                break;
                            }
                        }
                        selectedOptionLbl.setHtmlText('<strong>' + oEvent.oSource.getValue() + '</strong>');
                        vLayout.destroyContent();
                        var content = that._getSelectedOptionContent(oEvent.oSource.getSelectedKey());
                        if (content) {
                            vLayout.addContent(content);
                        }
                    }
                });
                optionsDropdown.setSelectedKey(that._goSelectedOption.key);

                return [optionsLbl, optionsDropdown, selectedOptionLbl, vLayout];
            },

            _getSelectedOptionContent: function(selectedOptionKey) {
                switch (selectedOptionKey) {
                    //performanceAnalysis
                    case options[0].key:
                        {
                            // CheckBox
                            var oCB = new sap.ui.commons.CheckBox({
                                text: resourceLoader.getText('txt_performance_analysis_always_on'),
                                checked: "{/" + options[0].values[0].key + "}",
                                layoutData: new sap.ui.layout.GridData({
                                    span: "L12 M12 S12"
                                }),
                                change: function(oEvent) {
                                    options[0].values[0].value = oCB.getChecked();
                                }
                            });
                            //threshold value
                            var thresholdValTxt = new sap.ui.commons.TextField({
                                width: "80%",
                                value: "{/" + options[0].values[1].key + "}",
                                layoutData: new sap.ui.layout.GridData({
                                    span: "L8 M6 S12"
                                }),
                                change: function(oEvent) {
                                    options[0].values[1].value = oEvent.oSource.getValue();
                                }
                            });
                            thresholdValTxt.attachBrowserEvent("keypress", function(e) {
                                var keyCodes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 0, 8];
                                if ($.inArray(e.which, keyCodes) < 0) {
                                    e.preventDefault();
                                }
                            });

                            var thresholdValLbl = new sap.ui.commons.Label({
                                text: resourceLoader.getText('txt_performance_analysis_threshold_value'),
                                labelFor: thresholdValTxt,
                                layoutData: new sap.ui.layout.GridData({
                                    span: "L4 M6 S12"
                                })
                            });
                            var note = new sap.ui.commons.FormattedTextView({
                                layoutData: new sap.ui.layout.GridData({
                                    span: "L12 M12 S12"
                                }),
                                htmlText: '<strong>' + resourceLoader.getText('txt_note') + '</strong>' + resourceLoader.getText('txt_performance_analysis_note')
                            });
                            var layout = new sap.ui.layout.Grid({
                                hSpacing: 1,
                                vSpacing: 1,
                                content: [oCB, thresholdValLbl, thresholdValTxt, note],
                                layoutData: new sap.ui.layout.GridData({
                                    span: "L12 M12 S12"
                                }),
                                width: "100%"
                            });
                            layout.setModel(options[0].jsonModel);
                            return layout;
                        }
                }
            },

            _applyPreferences: function() {
                for (var i = 0; i < this._goSelectedOption.values.length; i++) {
                    var val = this._goSelectedOption.values[i];
                    this._setPreferenceValue(val.key, val.value);
                }
             //   this._goLogger.writeSuccessMessage("Calculation View Preferences updated successfully");
            },
            _restoreDefaults: function() {
                var data = {};
                for (var i = 0; i < this._goSelectedOption.values.length; i++) {
                    var val = this._goSelectedOption.values[i];
                    val.value = val.defaultValue;
                    data[val.key] = val.defaultValue;
                }
                this._goSelectedOption.jsonModel.setData(data);
                this._goSelectedOption.jsonModel.updateBindings();
            },

            _getPreferenceValue: function(key) {
                return this._goUserSettings[key];
            },

            _setPreferenceValue: function(key, value) {
                var json = {};
                json[key] = value;
                this.context.service.preferences.set(json, "sap.hana.ide.editor.analytics");
            },

            _getUserSettings: function() {
                var that = this;
                return this.context.service.preferences.get("sap.hana.ide.editor.analytics").then(function(ioSettings) {
                    that._goUserSettings = ioSettings || {};
                });
            },

            isAvailable: function() {
                return true;
            },

            isEnabled: function() {
                return true;
            }
        };
    });
