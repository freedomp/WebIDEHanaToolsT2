/** Copyright © 2015 SAP SE or an affiliate company. All rights reserved.**/

define(["../../../util/TextInputHelper",
        "../../../util/HotKey",
        "../../../control/ListBox"
    ],
    function(TextInputHelper, HotKey) {

        "use strict";

        var MAX_ITEM_LENGTH = 1000;

        var COMMON_IMAGES_PATH = constants.sqldebugger.COMMON_IMAGES_PATH;

        var SearchDialog = function(oContext, mConfig) {
            this.context = oContext;
            this.initSeftConfig();
            this.configure(mConfig);
        };

        SearchDialog.prototype = {
            oLabelConfig: null,
            oSearch: null,
            oMatchingList: null,
            oButtonOK: null,
            oDialog: null,
            oResultLabel: null,

            _oOpenQueue: new Q.sap.Queue(),

            initSeftConfig: function() {
                this.oLabelConfig = {
                    dialogTitle: "Search Binding Services",
                    searchFieldLabel: this.context.i18n.getText("txt_search_field_label"),
                    matchingLabel: this.context.i18n.getText("txt_matching_label"),
                    resultLabel: this.context.i18n.getText("txt_result_label"),
                    waitingLabel: this.context.i18n.getText("txt_waiting_label"),
                    numberCharInputRequired: this.context.i18n.getText("txt_number_char_input_required"),
                    btnOkLabel: this.context.i18n.getText("txt_ok"),
                    btnCancelLabel: this.context.i18n.getText("txt_cancel"),
                    searchHint: this.context.i18n.getText("txt_search_hint")
                };

                this.oDialogConfig = {
                    title: this.oLabelConfig.dialogTitle,
                    resizable: true,
                    keepInWindow: true,
                    modal: true,
                    width: '40rem',
                    height: '29rem',
                    minWidth: '36rem',
                    minHeight: '29rem'
                };
            },

            configure: function(mConfig) {
                this.bMultiSelect = mConfig.multiSelect ? true : false;
                this.bShowIcon = mConfig.bShowIcon ? true : false;
                this.displaySecondaryValues = mConfig.displaySecondaryValues ? true : false;
                this.numberCharInputRequired = mConfig.numberCharInputRequired || 1;
                this.fnCallback = mConfig.fnCallback;
                this.initialSearchValue = mConfig.initialSearchValue || "";
            },

            //========================================
            // Open, initilize and populate data for UI
            //========================================
            open: function() {
                if (this.oDialog === null) {
                    this._createUI();
                }
                if (!this.oSearch.getValue()) {
                    this.oSearch.setValue();
                    this.updateList("");
                } else {
                    this.updateList(this.oSearch.getValue());
                }
                this.oDialog.setInitialFocus(this.oSearch);
                this.oDialog.open();
                this._focusSearchField();
            },

            _createUI: function() {
                var that = this;

                this.oDialog = new sap.ui.commons.Dialog(this.oDialogConfig);

                var fnCreateRow = function(oContent, oMatrixLayout) {
                    var oRow, oCell;
                    oCell = new sap.ui.commons.layout.MatrixLayoutCell({
                        colSpan: 4
                    });
                    oRow = new sap.ui.commons.layout.MatrixLayoutRow();
                    oRow.addCell(oCell);
                    oMatrixLayout.addRow(oRow);
                    oCell.addContent(oContent);
                };

                var oMatrix = new sap.ui.commons.layout.MatrixLayout({
                    layoutFixed: true,
                    width: '100%',
                    columns: 4
                });
                this.oDialog.addContent(oMatrix);

                // create the Search Label
                var oLabel = new sap.ui.commons.Label({
                    text: this.oLabelConfig.searchFieldLabel
                });
                fnCreateRow(oLabel, oMatrix);

                // create the Search Field
                this.oSearch = new sap.ui.commons.SearchField({
                    width: '100%',
                    value: this.initialSearchValue,
                    enableListSuggest: false,
                    enableClear: true,
                    startSuggestion: 0,
                    search: that.fnSelectedItem.bind(that),
                    suggest: function(oEvent) {
                        var sInputVal = oEvent.getParameter("value");
                        that.updateList(sInputVal);
                    }
                });
                this.oSearch.addEventDelegate({
                    onAfterRendering: function(oEvent) {
                        var oSrcControl = oEvent.srcControl;
                        if (oSrcControl instanceof sap.ui.commons.SearchField) {
                            jQuery.sap.byId(oSrcControl.getId() + "-tf-input").on("input", function(oEvt) {
                                that.oSearch.setValue($(oEvt.target).val());
                                that.oMatchingList.removeAllItems();
                                that.oResultLabel.setText(that.oLabelConfig.waitingLabel);
                            });
                        }
                    }
                });
                this.oSearch.attachBrowserEvent('keydown', function(oEvent) {
                    if (oEvent.keyCode === 27) { // ESC
                        that.oDialog.close();
                    }
                });
                HotKey.registerHotKey("down", jQuery.proxy(function() {
                    if (this.oMatchingList && this.oMatchingList.getItems().length > 0) {
                        this.oMatchingList.setSelectedIndex(0);
                        this.oButtonOK.setEnabled(true);
                        jQuery.sap.byId(this.oMatchingList.getId()).focus();
                    }
                }, this), this.oSearch);
                fnCreateRow(this.oSearch, oMatrix);

                // create the Result Label
                this.oResultLabel = new sap.ui.commons.Label({
                    text: this.oLabelConfig.matchingLabel
                });
                fnCreateRow(this.oResultLabel, oMatrix);

                // create the Matching List
                this.oMatchingList = new sap.hana.cst.common.control.ListBox({
                    displayIcons: this.bShowIcon,
                    allowMultiSelect: this.bMultiSelect,
                    displaySecondaryValues: this.displaySecondaryValues,
                    width: '100%',
                    visibleItems: 14
                });
                this.oMatchingList.attachBrowserEvent('dblclick', this.fnSelectedItem.bind(this));
                HotKey.registerHotKey("enter", this.fnSelectedItems.bind(this), this.oMatchingList);
                HotKey.registerHotKey("up", function() {
                    var iIdx, oList, iTotalItems;
                    oList = that.oMatchingList;
                    iTotalItems = oList.getItems().length;
                    if (iTotalItems > 0) {
                        iIdx = oList.getSelectedIndex();
                        if (iIdx > 0) {
                            oList.setSelectedIndex(iIdx - 1);
                        } else {
                            oList.setSelectedIndex(0);
                        }
                    }
                }, this.oMatchingList);
                HotKey.registerHotKey("down", function() {
                    var iIdx, oList, iTotalItems;
                    oList = that.oMatchingList;
                    iTotalItems = oList.getItems().length;
                    if (iTotalItems > 0) {
                        iIdx = oList.getSelectedIndex();
                        if (iIdx >= 0 && iIdx < iTotalItems - 1) {
                            oList.setSelectedIndex(iIdx + 1);
                        }
                    }
                }, this.oMatchingList);
                fnCreateRow(this.oMatchingList, oMatrix);

                // create Buttons
                var oButtonCancel = new sap.ui.commons.Button({
                    tooltip: this.oLabelConfig.btnCancelLabel,
                    text: this.oLabelConfig.btnCancelLabel,
                    press: function() {
                        that.oDialog.close();
                    }
                });
                this.oButtonOK = new sap.ui.commons.Button({
                    tooltip: this.oLabelConfig.btnOkLabel,
                    text: this.oLabelConfig.btnOkLabel,
                    enabled: false,
                    press: this.fnSelectedItems.bind(this)
                });
                this.oDialog.addButton(this.oButtonOK);
                this.oDialog.addButton(oButtonCancel);
            },

            //========================================
            // Utils
            //========================================
            _focusSearchField: function(bSelect) {
                if (bSelect === null || bSelect === undefined) {
                    bSelect = true;
                }
                var that = this;
                setTimeout(function() {
                    that.oSearch.focus();
                    if (bSelect) {
                        jQuery.sap.byId(that.oSearch.getId() + "-tf-input").select();
                    }
                }, 300);
            },

            _shortenDesc: function(statement) {
                if (statement) {
                    if (statement.length >= MAX_ITEM_LENGTH) {
                        statement = statement.substring(0, MAX_ITEM_LENGTH);
                        statement = statement.replace(/\n/ig, " ");
                        var k = statement.lastIndexOf(" ");
                        if (k >= 0) {
                            statement = statement.substring(0, k) + " ...";
                        } else {
                            statement = statement + " ...";
                        }
                    } else {
                        statement = statement.replace(/\n/ig, " ");
                    }
                }
                return statement;
            },

            _displayBusy: function(bVisible) {
                if (this.oMatchingList) {
                    this.oMatchingList.setBusy(bVisible);
                    if (bVisible) {
                        this.oResultLabel.setText(this.oLabelConfig.waitingLabel);
                    }
                }
            },

            _checkEnableOKButton: function() {
                if (this.oMatchingList.getItems().length > 0) {
                    this.oButtonOK.setEnabled(true);
                } else {
                    this.oButtonOK.setEnabled(false);
                }
            },

            //========================================
            // Handle item selected
            //========================================
            fnSelectedItem: function() {
                var selectedItem = this.oMatchingList.getSelectedItem();
                if (selectedItem !== null) {
                    this.onOpenSelectedItem(selectedItem.returnObject);
                    if (this.oDialog) {
                        this.oDialog.close();
                    }
                }
            },

            fnSelectedItems: function() {
                if (!this.bMultiSelectionMode) {
                    this.fnSelectedItem();
                }
                var selectedItems = this.oMatchingList.getSelectedItems();
                if (selectedItems !== null && selectedItems.length > 0) {
                    for (var i = 0; i < selectedItems.length; i++) {
                        this.onOpenSelectedItem(selectedItems[i].returnObject);
                    }
                    if (this.oDialog) {
                        this.oDialog.close();
                    }
                }
            },

            //========================================
            // Populate the search result and display them
            //========================================
            updateList: function(sInputVal) {
                var that = this;
                var sFindValue;
                if (sInputVal === "**") {
                    this._displayBusy(true);
                    sFindValue = "%";
                } else {
                    if (sInputVal.length >= this.numberCharInputRequired) {
                        sFindValue = "%" + sInputVal.toUpperCase() + "%";
                    } else if (sInputVal.length === 0) {
                        this.oResultLabel.setText(this.oLabelConfig.matchingLabel + " (" + this.oLabelConfig.searchHint + ")");
                        this.oMatchingList.destroyItems();
                    } else {
                        this.oResultLabel.setText(this.oLabelConfig.numberCharInputRequired + " " + this.numberCharInputRequired);
                        this.oMatchingList.destroyItems();
                    }
                }
                if (sFindValue) {
                    this._updateList(sFindValue, sInputVal).then(function(rs) {
                        if (!rs) {
                            rs = [];
                        } else if (!Array.isArray(rs)) {
                            rs = [rs];
                        }
                        that._displayResult(sInputVal, rs);
                    }).done();
                }
                this._checkEnableOKButton();
            },


            //========================================
            _updateList: function(sFindValue) {
                return this.context.service.xs2CtrlDAO.getBindingHDIServices(true, sFindValue).then(function(rs) {
                    if (rs && rs.services && rs.services.length > 0) {
                        return rs.services;
                    }
                    return false;
                });
            },

            _displayResult: function(sInputVal, rs) {
                var i, length, object,
                    oItem, iconPath, sText;

                if (!rs) {
                    return;
                }
                length = rs.length;

                this.oMatchingList.destroyItems();
                for (i = 0; i < length; i++) {
                    object = rs[i];
                    iconPath = this._getItemIconPath(object);
                    sText = this._getItemText(object);
                    oItem = new sap.hana.cst.common.control.ListItem({
                        text: sText,
                        findValue: sInputVal,
                        icon: iconPath,
                        tooltip: sText
                    });
                    if (this.displaySecondaryValues) {
                        oItem.setAdditionalText(this._getItemAdditionalText(object));
                    }
                    oItem.returnObject = object;
                    oItem.type = object.type;
                    this.oMatchingList.addItem(oItem);
                } //end for

                if (this.oMatchingList.getItems().length > 0) {
                    this.oMatchingList.setSelectedIndex(0);
                    this.oButtonOK.setEnabled(true);
                } else {
                    this.oButtonOK.setEnabled(false);
                }

                if (sInputVal === "**") {
                    this.oResultLabel.setText(this.oLabelConfig.matchingLabel);
                } else {
                    this.oResultLabel.setText(length + " " + this.oLabelConfig.resultLabel);
                }
                this._displayBusy(false);
            },

            _getItemText: function(object) {
                return object.name;
            },

            _getItemIconPath: function(object) {
                return COMMON_IMAGES_PATH + "ComposedServices.gif";
            },

            _getItemAdditionalText: function(object) {
                return;
            },

            onOpenSelectedItem: function(oReturnObject) {
                if (this.fnCallback && typeof this.fnCallback === "function") {
                    this.fnCallback(oReturnObject);
                }
            }

        };

        return SearchDialog;
    });