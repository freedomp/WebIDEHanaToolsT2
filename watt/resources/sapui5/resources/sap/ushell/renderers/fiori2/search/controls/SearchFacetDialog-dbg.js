/* global jQuery, sap, window */
(function() {
    "use strict";

    jQuery.sap.require('sap.m.Dialog');
    jQuery.sap.require('sap.ushell.renderers.fiori2.search.FacetItem');

    sap.m.Dialog.extend('sap.ushell.renderers.fiori2.search.controls.SearchFacetDialog', {

        constructor: function(options) {

            var that = this;

            //the position index of elements in parent aggregation:
            //first masterPage: masterPages[0]->scrollContainer->content[]
            that.facetListPosition = 0;
            //every detailPage->content[]
            that.settingContainerPosition = 0;
            that.separatorPosition = 1;
            that.attributeListPosition = 2;
            that.advancedPosition = 3;
            //settingContainer->content[]
            that.sortingSelectPosition = 0;
            that.showOnTopCheckBoxPosition = 1;

            //flag to recognize initial call or single facet call
            that.bSingleCall = false;

            options = jQuery.extend({}, {
                showHeader: false,
                //                title: sap.ushell.resources.i18n.getText("filters"),
                horizontalScrolling: false,
                verticalScrolling: false,
                beginButton: new sap.m.Button({
                    text: sap.ushell.resources.i18n.getText("okDialogBtn"),
                    press: function(oEvent) {
                        that.onOkClick(oEvent);
                        that.close();
                        that.destroy();
                    }
                }),
                endButton: new sap.m.Button({
                    text: sap.ushell.resources.i18n.getText("cancelDialogBtn"),
                    press: function(oEvent) {
                        that.close();
                        that.destroy();
                    }
                }),
                content: [that.createContainer()]
            }, options);

            that.selectedAttribute = options.selectedAttribute ? options.selectedAttribute : "";

            sap.m.Dialog.prototype.constructor.apply(this, [options]);
            this.addStyleClass('sapUiSizeCompact');
            this.addStyleClass('sapUshellSearchFacetDialog');
        },

        renderer: 'sap.m.DialogRenderer',

        createContainer: function() {
            var that = this;

            //create SplitContainer with masterPages
            that.oSplitContainer = new sap.m.SplitContainer({
                masterPages: that.masterPagesFactory()
            });

            //binding detailPages in SplitContainer
            that.oSplitContainer.bindAggregation("detailPages", "/facetDialog", function(sId, oContext) {
                return that.detailPagesFactory(sId, oContext);
            });

            that.oSplitContainer.addStyleClass('sapUshellSearchFacetDialogContainer');

            return that.oSplitContainer;
        },

        //create masterPages in splitContainer
        masterPagesFactory: function() {
            var that = this;

            //create facet list
            var oFacetList = new sap.m.List({
                mode: sap.m.ListMode.SingleSelectMaster,
                selectionChange: function(oEvent) {
                    that.onMasterPageSelectionChange(oEvent);
                }
            });
            oFacetList.bindAggregation("items", "/facetDialog", function(sId, oContext) {
                var oListItem = new sap.m.StandardListItem({
                    title: "{title}",
                    infoState: "Success"
                });

                //calculate seleted items
                var sFacetType = oContext.oModel.getProperty(oContext.sPath).facetType;
                var aItems = oContext.oModel.getProperty(oContext.sPath).items;
                var count = 0;
                for (var i = 0; i < aItems.length; i++) {
                    if (aItems[i].selected) {
                        count++;
                    }
                }
                if (count > 0) {
                    if (sFacetType === "attribute") {
                        oListItem.setCounter(count);
                    }
                    //                    oListItem.addStyleClass('searchFacetDialogListItemBold');
                }

                //"search for" must be bold
                if (sFacetType === "search") {
                    oListItem.addStyleClass('sapUshellSearchFacetDialogListItemBold');
                }

                return oListItem;
            });

            //create a scrollContainer, content is the facet list
            var oMasterPage = new sap.m.ScrollContainer({
                height: '100%',
                horizontal: false,
                vertical: true,
                content: [oFacetList]
            }).addStyleClass('sapUshellSearchFacetDialogMasterContainer');

            oMasterPage.addEventDelegate({
                onAfterRendering: function(oEvent) {
                    if (that.selectedAttribute) {
                        for (var i = 0; i < oFacetList.getItems().length; i++) {
                            var oListItem = oFacetList.getItems()[i];
                            var oBindingObject = oListItem.getBindingContext().getObject();
                            if (that.selectedAttribute === oBindingObject.dimension) {
                                oFacetList.setSelectedItem(oListItem);
                            }
                        }
                    }
                    if (!oFacetList.getSelectedItem()) {
                        oFacetList.setSelectedItem(oFacetList.getItems()[0]);
                    }
                    var oSelectedItem = oFacetList.getSelectedItem();
                    that.updateDetailPage(oSelectedItem);
                }
            });

            //masterPages has only one page
            var oMasterPages = [oMasterPage];
            return oMasterPages;
        },

        //event: select listItems in masterPage
        onMasterPageSelectionChange: function(oEvent) {
            var that = this;
            var oListItem = oEvent.mParameters.listItem;
            that.updateDetailPage(oListItem);
        },

        //create detailPage in splitContainer, using data binding
        detailPagesFactory: function(sId, oContext) {
            var that = this;
            var sFacetType = oContext.oModel.getProperty(oContext.sPath).facetType;
            var aItems = oContext.oModel.getProperty(oContext.sPath).items;
            var count = 0;
            for (var i = 0; i < aItems.length; i++) {
                if (aItems[i].selected) {
                    count++;
                }
            }

            //create a settings container with select and checkBox, initial is not visible
            var oSelect = new sap.m.Select({
                items: [
                    new sap.ui.core.Item({
                        text: sap.ushell.resources.i18n.getText("notSorted"),
                        key: "notSorted"
                    }),
                    new sap.ui.core.Item({
                        text: sap.ushell.resources.i18n.getText("sortByCount"),
                        key: "sortCount"
                    }),
                    new sap.ui.core.Item({
                        text: sap.ushell.resources.i18n.getText("sortByName"),
                        key: "sortName"
                    })
                ],
                selectedKey: "notSorted",
                change: function(oEvent) {
                    that.onSelectChange(oEvent);
                }
            }).addStyleClass('sapUshellSearchFacetDialogSettingsSelect');
            var oCheckBox = new sap.m.CheckBox({
                text: "Show Selected on Top",
                enabled: count > 0 ? true : false,
                select: function(oEvent) {
                    that.onCheckBoxSelect(oEvent);
                }
            });
            var oSettings = new sap.ui.layout.VerticalLayout({
                content: [oSelect, oCheckBox]
            }).addStyleClass('sapUshellSearchFacetDialogSettingsContainer');
            oSettings.setVisible(false);

            //create the attribute list for each facet
            var oList = new sap.m.List({
                includeItemInSelection: true,
                showNoData: false,
                showSeparators: sap.m.ListSeparators.None,
                selectionChange: function(oEvent) {
                    that.onDetailPageSelectionChange(oEvent);
                }
            }).addStyleClass('sapUshellSearchFacetDialogDetailPageList');
            if (sFacetType === "attribute") {
                oList.setMode(sap.m.ListMode.MultiSelect);
            } else {
                oList.setMode(sap.m.ListMode.SingleSelectMaster);
            }
            var oBindingInfo = {
                path: "items",
                factory: function(sId, oContext) {
                    var oBinding = oContext.oModel.getProperty(oContext.sPath);
                    var oListItem = new sap.m.StandardListItem({
                        title: "{label}",
                        tooltip: "{label}" + "  " + "{value}",
                        info: "{valueLabel}",
                        selected: oBinding.selected
                    });

                    //prepare the local filterConditions array in facet dialog, only by initial pespective call
                    if (!that.bSingleCall && oBinding.selected && !oContext.oModel.hasFilter(oBinding)) {
                        oContext.oModel.aFilters.push(oBinding);
                    }

                    return oListItem;
                }
            };
            //            if (sFacetType === "attribute") {
            //                oBindingInfo.sorter = new sap.ui.model.Sorter("value", true, false);
            //            }
            oBindingInfo.filters = new sap.ui.model.Filter("advanced", sap.ui.model.FilterOperator.NE, true);
            oList.bindAggregation("items", oBindingInfo);

            var oListContainer = new sap.m.ScrollContainer({
                height: '67.2%',
                horizontal: false,
                vertical: true,
                content: [oList]
            }).addStyleClass('sapUshellSearchFacetDialogDetailPageListContainer');

            //create the separator between setting and attribute list
            var oSeparatorItem = new sap.m.StandardListItem({});
            var oSeparator = new sap.m.List({
                items: [oSeparatorItem],
                showSeparators: sap.m.ListSeparators.None
            }).addStyleClass('sapUshellSearchFacetDialogDetailPageSeparator');

            //create advanced serach 
            var oCondition = oContext.oModel.getProperty(oContext.sPath).items[0].filterCondition;
            var sDataType = that.getAttributeDataType(oCondition);
            var oAdvancedCondition = that.advancedConditionFactory(sDataType);
            var oAdvancedContainer = new sap.m.ScrollContainer({
                height: '32%',
                horizontal: false,
                vertical: true,
                content: [oAdvancedCondition]
            }).addStyleClass('sapUshellSearchFacetDialogDetailPageAdvancedContainer');
            oAdvancedContainer.data('dataType', sDataType);
            that.updateAdvancedConditions(oAdvancedContainer, aItems, sDataType);

            //create a page, content include settings container and attribute list, head toolbar has a setting button and a search field
            var oPage = new sap.m.Page({
                showHeader: true,
                title: sap.ushell.resources.i18n.getText("filters"),
                subHeader: new sap.m.Toolbar({
                    content: [
                        new sap.m.SearchField({
                            //showSearchButton: false,
                            placeholder: sap.ushell.resources.i18n.getText("filterPlaceholder"),
                            liveChange: function(oEvent) {
                                that.onSearchFieldLiveChange(oEvent);
                            }
                        }),
                        new sap.m.ToggleButton({
                            icon: "sap-icon://sort",
                            press: function(oEvent) {
                                that.onSettingButtonPress(oEvent);
                            }
                        })
                    ]
                }),
                content: [oSettings, oSeparator, oListContainer, oAdvancedContainer]
            }).addStyleClass('sapUshellSearchFacetDialogDetailPage');
            if (sFacetType === "datasource") {
                oPage.destroySubHeader();
            }
            if (sFacetType === "search") {
                //'search for' has no setting button
                oPage.getSubHeader().removeContent(1);
                //set the search term in searchField
                var searchTerm = oContext.oModel.getProperty('/searchBoxTerm');
                oPage.getSubHeader().getContent()[0].setValue(searchTerm);
            }

            return oPage;
        },

        //create an advanced condition
        advancedConditionFactory: function(type) {
            var that = this;
            var oAdvancedCheckBox = new sap.m.CheckBox({
                select: function(oEvent) {
                    that.updateCountInfo(oEvent.getSource().getParent().getParent().getParent());
                }
            }).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionCheckBox');
            var oInputBox;
            switch (type) {
                case 'date':
                    oInputBox = new sap.m.DateRangeSelection({
                        width: '90%',
                        //delimiter: 'to'
                        change: function(oEvent) {
                            that.onDateRangeSelectionChange(oEvent);
                        }
                    }).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');
                    break;
                case 'string':
                    oInputBox = new sap.m.Input({
                        width: '90%',
                        liveChange: function(oEvent) {
                            that.onAdvancedInputChange(oEvent);
                        }
                    }).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');
                    break;
                case 'number':
                    var oInputBoxLeft = new sap.m.Input({
                        width: '46.5%',
                        liveChange: function(oEvent) {
                            that.onAdvancedNumberInputChange(oEvent);
                        },
                        type: sap.m.InputType.Number
                    }).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');
                    var oInputBoxRight = new sap.m.Input({
                        width: '46.5%',
                        liveChange: function(oEvent) {
                            that.onAdvancedNumberInputChange(oEvent);
                        },
                        type: sap.m.InputType.Number
                    }).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionInput');
                    var oLabel = new sap.m.Label({
                        text: '...'
                    }).addStyleClass('sapUshellSearchFacetDialogDetailPageConditionLabel');
                    oInputBox = new sap.ui.layout.HorizontalLayout({
                        allowWrapping: true,
                        content: [oInputBoxLeft, oLabel, oInputBoxRight]
                    });
                    break;
                default:
                    break;

            }
            //            var oButton = new sap.m.Button({
            //                icon: 'sap-icon://add-filter',
            //                press: function(oEvent) {
            //                    that.onAdvancedAddButtonPress(oEvent, type);
            //                }
            //            }).addStyleClass('searchFacetDialogDetailPageConditionButton');

            var oAdvancedCondition = new sap.ui.layout.HorizontalLayout({
                allowWrapping: true,
                content: [oAdvancedCheckBox, oInputBox]
            }).addStyleClass('sapUshellSearchFacetDialogDetailPageCondition');
            return oAdvancedCondition;
        },

        //event: select listItems in detailPages
        onDetailPageSelectionChange: function(oEvent) {
            var that = this;

            //first set the selected value in model
            var oSelectedItem = oEvent.mParameters.listItem;
            var sSelectedBindingPath = oSelectedItem.getBindingContext().sPath + "/selected";
            oSelectedItem.getBindingContext().oModel.setProperty(sSelectedBindingPath, oSelectedItem.getSelected());

            //update aFilters
            var oBindingObject = oSelectedItem.getBindingContext().getObject();
            if (oSelectedItem.getSelected()) {
                that.getModel().addFilter(oBindingObject);
            } else {
                that.getModel().removeFilter(oBindingObject);
            }

            //update the count info in masterPageList
            var oList = oEvent.oSource;
            var oDetailPage = oList.getParent().getParent();
            that.updateCountInfo(oDetailPage);

            //deselect setting check box
            var oSettings = oList.getParent().getParent().getContent()[that.settingContainerPosition];
            var oCheckbox = oSettings.getContent()[that.showOnTopCheckBoxPosition];
            var oSelect = oSettings.getContent()[that.sortingSelectPosition];
            if (oCheckbox.getSelected()) {
                oCheckbox.setSelected(false);
                oSelect.setSelectedKey("notSorted");
            }
            if (oList.getSelectedContexts().length > 0) {
                oCheckbox.setEnabled(true);
            } else {
                oCheckbox.setEnabled(false);
            }
        },

        //event: search in detailPages
        onSearchFieldLiveChange: function(oEvent) {
            var that = this;
            var sFilterTerm = oEvent.getSource().getValue();
            var oSelectedItem = that.getFacetList().getSelectedItem();
            that.updateDetailPage(oSelectedItem, sFilterTerm);
        },

        //event: click setting button
        onSettingButtonPress: function(oEvent) {
            var that = this;
            var bPressed = oEvent.oSource.getPressed();
            var oSettings = oEvent.oSource.getParent().getParent().getContent()[that.settingContainerPosition];
            var oSeparator = oEvent.oSource.getParent().getParent().getContent()[that.separatorPosition];
            var oListContainer = oEvent.oSource.getParent().getParent().getContent()[that.attributeListPosition];
            if (bPressed) {
                oSettings.setVisible(true);
                oSeparator.setShowSeparators(sap.m.ListSeparators.All);
                oListContainer.setHeight('54%');
            } else {
                oSettings.setVisible(false);
                oSeparator.setShowSeparators(sap.m.ListSeparators.None);
                oListContainer.setHeight('67.2%');
            }
        },

        //event: change select box in settings
        onSelectChange: function(oEvent) {
            var that = this;
            that.sortingAttributeList(oEvent.oSource.getParent().getParent());
        },

        //event: select check box in settings
        onCheckBoxSelect: function(oEvent) {
            var that = this;
            that.sortingAttributeList(oEvent.oSource.getParent().getParent());
        },

        //event: date range selection box changed
        onDateRangeSelectionChange: function(oEvent) {
            var that = this;
            var oDateRangeSelection = oEvent.getSource();
            var oAdvancedCondition = oDateRangeSelection.getParent();
            var oAdvancedCheckBox = oAdvancedCondition.getContent()[0];
            if (oDateRangeSelection.getDateValue() && oDateRangeSelection.getSecondDateValue()) {
                oAdvancedCheckBox.setSelected(true);
                that.insertNewAdvancedCondition(oAdvancedCondition, "date");
                that.updateCountInfo(oAdvancedCondition.getParent().getParent());
            } else {
                oAdvancedCheckBox.setSelected(false);
            }
        },

        //event: advanced string input box changed
        onAdvancedInputChange: function(oEvent) {
            var that = this;
            var oInput = oEvent.getSource();
            var oAdvancedCondition = oInput.getParent();
            var oAdvancedCheckBox = oAdvancedCondition.getContent()[0];
            if (oInput.getValue()) {
                oAdvancedCheckBox.setSelected(true);
                that.insertNewAdvancedCondition(oAdvancedCondition, "string");
                that.updateCountInfo(oAdvancedCondition.getParent().getParent());
            } else {
                oAdvancedCheckBox.setSelected(false);
            }
        },

        //event: advanced number input box changed
        onAdvancedNumberInputChange: function(oEvent) {
            var that = this;
            var oInput = oEvent.getSource();
            var oAdvancedCondition = oInput.getParent().getParent();
            var oAdvancedCheckBox = oAdvancedCondition.getContent()[0];
            if (oInput.getParent().getContent()[0].getValue() && oInput.getParent().getContent()[2].getValue()) {
                oAdvancedCheckBox.setSelected(true);
                that.insertNewAdvancedCondition(oAdvancedCondition, "number");
                that.updateCountInfo(oAdvancedCondition.getParent().getParent());
            } else {
                oAdvancedCheckBox.setSelected(false);
            }
        },

        //event: click ok button
        onOkClick: function(oEvent) {
            var that = this;
            var oModel = that.getModel();
            var oSearchModel = that.getModel('searchModel');
            oSearchModel.resetFilterConditions(false);
            var aDetailPages = that.oSplitContainer.getDetailPages();
            for (var m = 0; m < oModel.aFilters.length; m++) {
                var item = oModel.aFilters[m];
                if (!item.advanced) {
                    oSearchModel.addFilterCondition(item, false);
                }
            }
            for (var i = 0; i < aDetailPages.length; i++) {
                //attribute list
                //                var oList = aDetailPages[i].getContent()[that.attributeListPosition].getContent()[0];
                //                for (var j = 0; j < oList.getItems().length; j++) {
                //                    var oListItem = oList.getItems()[j];
                //                    var oListItemBindingObject = oListItem.getBindingContext().getObject();
                //                    if (oListItem.getSelected()) {
                //                        oSearchModel.addFilterCondition(oListItemBindingObject, false);
                //                    }
                //                }

                //advanced search area
                if (aDetailPages[i].getContent()[that.advancedPosition]) {
                    var oAdvancedContainer = aDetailPages[i].getContent()[that.advancedPosition];
                    var sDataType = oAdvancedContainer.data('dataType');
                    var oAdvancedConditionList = aDetailPages[i].getContent()[that.advancedPosition].getContent();
                    var k, oAdvancedCondition, oAdvancedCheckBox, fromCondition, toCondition, oConditionGroup, facetItem;
                    switch (sDataType) {
                        case 'date':
                            for (k = 0; k < oAdvancedConditionList.length; k++) {
                                oAdvancedCondition = oAdvancedConditionList[k];
                                oAdvancedCheckBox = oAdvancedCondition.getContent()[0];
                                var oDateRangeSelection = oAdvancedCondition.getContent()[1];
                                if (oAdvancedCheckBox.getSelected() && oDateRangeSelection.getDateValue() && oDateRangeSelection.getSecondDateValue()) {
                                    //format: 2015-07-14 00:00:00.0000000
                                    var oFormat = {
                                        "pattern": "yyyy-MM-dd HH:mm:ss.SSSSSSS"
                                    };
                                    var oSecondFormat = {
                                        "pattern": "yyyy-MM-dd 23:59:59.9999999"
                                    };
                                    var dateValue = sap.ui.core.format.DateFormat.getDateTimeInstance(oFormat).format(oDateRangeSelection.getDateValue());
                                    var secondDateValue = sap.ui.core.format.DateFormat.getDateTimeInstance(oSecondFormat).format(oDateRangeSelection.getSecondDateValue());
                                    fromCondition = oSearchModel.sina.createFilterCondition({
                                        attribute: that.getFacetList().getItems()[i].getBindingContext().getObject().dimension,
                                        operator: ">=",
                                        value: dateValue
                                    });
                                    toCondition = oSearchModel.sina.createFilterCondition({
                                        attribute: that.getFacetList().getItems()[i].getBindingContext().getObject().dimension,
                                        operator: "<=",
                                        value: secondDateValue
                                    });
                                    oConditionGroup = that.getModel().sina.createFilterConditionGroup();
                                    oConditionGroup.label = oDateRangeSelection.getValue();
                                    oConditionGroup.conditions[0] = fromCondition;
                                    oConditionGroup.conditions[1] = toCondition;
                                    facetItem = that.createAdvancedFacetItem(oConditionGroup, that.getFacetList().getItems()[i].getBindingContext().getObject().title);
                                    oSearchModel.addFilterCondition(facetItem, false);
                                }
                            }
                            break;
                        case 'string':
                            for (k = 0; k < oAdvancedConditionList.length; k++) {
                                oAdvancedCondition = oAdvancedConditionList[k];
                                oAdvancedCheckBox = oAdvancedCondition.getContent()[0];
                                var oAdvancedInput = oAdvancedCondition.getContent()[1];
                                if (oAdvancedCheckBox.getSelected() && oAdvancedInput.getValue()) {
                                    var oFilterCondition = oSearchModel.sina.createFilterCondition({
                                        attribute: that.getFacetList().getItems()[i].getBindingContext().getObject().dimension,
                                        operator: "=",
                                        value: oAdvancedInput.getValue()
                                    });
                                    facetItem = that.createAdvancedFacetItem(oFilterCondition, that.getFacetList().getItems()[i].getBindingContext().getObject().title);
                                    oSearchModel.addFilterCondition(facetItem, false);
                                }
                            }
                            break;
                        case 'number':
                            for (k = 0; k < oAdvancedConditionList.length; k++) {
                                oAdvancedCondition = oAdvancedConditionList[k];
                                oAdvancedCheckBox = oAdvancedCondition.getContent()[0];
                                var oAdvancedInputLeft = oAdvancedCondition.getContent()[1].getContent()[0];
                                var oAdvancedInputRight = oAdvancedCondition.getContent()[1].getContent()[2];
                                var oAdvancedLebel = oAdvancedCondition.getContent()[1].getContent()[1];
                                if (oAdvancedCheckBox.getSelected() && oAdvancedInputLeft.getValue() && oAdvancedInputRight.getValue()) {
                                    fromCondition = oSearchModel.sina.createFilterCondition({
                                        attribute: that.getFacetList().getItems()[i].getBindingContext().getObject().dimension,
                                        operator: ">=",
                                        value: oAdvancedInputLeft.getValue()
                                    });
                                    toCondition = oSearchModel.sina.createFilterCondition({
                                        attribute: that.getFacetList().getItems()[i].getBindingContext().getObject().dimension,
                                        operator: "<=",
                                        value: oAdvancedInputRight.getValue()
                                    });
                                    oConditionGroup = that.getModel().sina.createFilterConditionGroup();
                                    oConditionGroup.label = oAdvancedInputLeft.getValue() + oAdvancedLebel.getText() + oAdvancedInputRight.getValue();
                                    oConditionGroup.conditions[0] = fromCondition;
                                    oConditionGroup.conditions[1] = toCondition;
                                    facetItem = that.createAdvancedFacetItem(oConditionGroup, that.getFacetList().getItems()[i].getBindingContext().getObject().title);
                                    oSearchModel.addFilterCondition(facetItem, false);
                                }
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
            oSearchModel.filterChanged = true;
            oSearchModel._searchFireQuery();
        },

        //help function: get the facet list in masterPage
        getFacetList: function() {
            var that = this;
            return that.oSplitContainer.getMasterPages()[0].getContent()[this.facetListPosition];
        },

        //set count info in master page facet list
        updateCountInfo: function(oDetailPage) {
            var that = this;
            var oList = oDetailPage.getContent()[that.attributeListPosition].getContent()[0];
            var aContexts = oList.getSelectedContexts();
            var oAdvancedContainer = oList.getParent().getParent().getContent()[that.advancedPosition];
            var countAdvancedCondition = 0;
            for (var i = 0; i < oAdvancedContainer.getContent().length; i++) {
                var oConditionLayout = oAdvancedContainer.getContent()[i];
                var oCheckbox = oConditionLayout.getContent()[0];
                if (oCheckbox.getSelected()) {
                    countAdvancedCondition++;
                }
            }
            var oMasterPageList = that.getFacetList();
            var oMasterPageListItem = oMasterPageList.getSelectedItem();
            if (!oMasterPageListItem) {
                oMasterPageListItem = oMasterPageList.getItems()[0];
            }
            var sMasterBindingPath = oMasterPageListItem.getBindingContext().sPath;
            var sFacetType = oMasterPageListItem.getBindingContext().oModel.getProperty(sMasterBindingPath).facetType;
            if (sFacetType === "attribute") {
                var count = aContexts.length + countAdvancedCondition;
                if (count > 0) {
                    oMasterPageListItem.setCounter(count);
                } else {
                    oMasterPageListItem.setCounter(null);
                }
            }
            //            else if (sFacetType === "datasource") {
            //                var index = oEvent.oSource.indexOfAggregation("items", oSelectedItem);
            //                if (index > 0) {
            //                    oMasterPageListItem.addStyleClass('sapUshellSearchFacetDialogListItemBold');
            //                } else {
            //                    oMasterPageListItem.removeStyleClass('sapUshellSearchFacetDialogListItemBold');
            //                }
            //            }
        },

        //helper function: sorting the attribute list
        sortingAttributeList: function(oDetailPage) {
            var that = this;
            var oSettings = oDetailPage.getContent()[that.settingContainerPosition];
            var oSelect = oSettings.getContent()[that.sortingSelectPosition];
            var oCheckBox = oSettings.getContent()[that.showOnTopCheckBoxPosition];
            var oList = oDetailPage.getContent()[that.attributeListPosition].getContent()[0];
            var oBinding = oList.getBinding("items");
            var aSorters = [];

            if (oCheckBox.getSelected()) {
                aSorters.push(new sap.ui.model.Sorter("selected", true, false));
            }

            switch (oSelect.getSelectedKey()) {
                case "sortName":
                    aSorters.push(new sap.ui.model.Sorter("label", false, false));
                    break;
                case "sortCount":
                    aSorters.push(new sap.ui.model.Sorter("value", true, false));
                    break;
                default:
                    break;
            }

            oBinding.sort(aSorters);
        },

        //helper function: determinate the attribute list data type
        getAttributeDataType: function(oCondition) {
            //            if (oCondition.attribute && oCondition.operator === '=') {
            //                return 'string';
            //            } else {
            //                var sValue = oCondition.conditions[0].value;
            //                if (sap.ui.core.format.DateFormat.getDateTimeInstance({
            //                        "pattern": "yyyy-MM-dd hh:mm:ss.SSSSSSS"
            //                    }).parse(sValue)) {
            //                    return 'date';
            //                } else {
            //                    return 'number';
            //                }
            //            }
            var that = this;
            var dataType;
            if (oCondition.attribute) {
                if (that.getModel().aAttributesMetaData[oCondition.attribute]) {
                    dataType = that.getModel().aAttributesMetaData[oCondition.attribute].$$MetaData$$.dataType;
                }
            } else if (oCondition.conditions) {
                if (that.getModel().aAttributesMetaData[oCondition.conditions[0].attribute]) {
                    dataType = that.getModel().aAttributesMetaData[oCondition.conditions[0].attribute].$$MetaData$$.dataType;
                }
            }

            switch (dataType) {
                case "Double":
                    return "number";
                case "Timestamp":
                    return "date";
                case "String":
                    return "string";
                default:
                    return "string";
            }
        },

        //helper function: create a facet item for advanced search
        createAdvancedFacetItem: function(oFilterCondition, sFacetTitle) {
            var facetItem = new sap.ushell.renderers.fiori2.search.FacetItem({
                value: "",
                filterCondition: oFilterCondition,
                facetTitle: sFacetTitle,
                label: oFilterCondition.label ? oFilterCondition.label : oFilterCondition.value,
                selected: true,
                level: 0
            });
            return facetItem;
        },

        //helper function: insert new advanced condition
        insertNewAdvancedCondition: function(oAdvancedCondition, type) {
            var that = this;
            var oAdvancedContainer = oAdvancedCondition.getParent();
            var index = oAdvancedContainer.indexOfAggregation("content", oAdvancedCondition);
            if (index === (oAdvancedContainer.getAggregation("content").length - 1)) {
                var oNewAdvancedCondition = that.advancedConditionFactory(type);
                oAdvancedContainer.addContent(oNewAdvancedCondition);
            }
        },

        //update advanced conditions after detail page factory
        updateAdvancedConditions: function(oAdvancedContainer, aItems, type) {
            var that = this;
            var aConditions, oConditionLayout, oCheckBox, oInputBox;
            for (var i = aItems.length; i > 0; i--) {
                var item = aItems[i - 1];
                if (item.advanced) {
                    that.getModel().aFilters.push(item);

                    aConditions = oAdvancedContainer.getContent();
                    oConditionLayout = aConditions[aConditions.length - 1];

                    oCheckBox = oConditionLayout.getContent()[0];
                    oCheckBox.setSelected(true);
                    oInputBox = oConditionLayout.getContent()[1];
                    if (type === "number") {
                        var oInputBoxLeft = oInputBox.getContent()[0];
                        var oInputBoxRight = oInputBox.getContent()[2];
                        if (item.filterCondition.conditions) {
                            for (var j = 0; j < item.filterCondition.conditions.length; j++) {
                                var condition = item.filterCondition.conditions[j];
                                if (condition.operator === ">=") {
                                    oInputBoxLeft.setValue(condition.value);
                                }
                                if (condition.operator === "<=") {
                                    oInputBoxRight.setValue(condition.value);
                                }
                            }
                        }
                    } else {
                        oInputBox.setValue(item.label);
                    }
                    that.insertNewAdvancedCondition(oConditionLayout, type);
                }
            }
        },

        //helper function: collect all filters in dialog for single facet call
        applyFacetQueryFilter: function(excludedIndex) {
            var that = this;

            that.getModel().resetFacetQueryFilterConditions();

            var aDetailPages = that.oSplitContainer.getDetailPages();
            for (var i = 0; i < aDetailPages.length; i++) {
                if (i === excludedIndex) {
                    continue;
                }
                var oList = aDetailPages[i].getContent()[that.attributeListPosition].getContent()[0];
                for (var j = 0; j < oList.getItems().length; j++) {
                    var oListItem = oList.getItems()[j];
                    var oListItemBindingObject = oListItem.getBindingContext().getObject();
                    var filterCondition = oListItemBindingObject.filterCondition;
                    if (filterCondition.attribute || filterCondition.conditions) {
                        if (oListItem.getSelected()) {
                            if (!that.getModel().facetQuery.getFilter().hasFilterCondition(filterCondition)) {
                                that.getModel().facetQuery.addFilterCondition(filterCondition);
                            }
                        }
                    }
                }
            }
        },

        //according masterPageListItem, send a single facet pespective call, update the detail page
        updateDetailPage: function(oListItem, sFilterTerm) {
            var that = this;

            var oModel = oListItem.getBindingContext().oModel;
            var sBindingPath = oListItem.getBindingContext().sPath;

            var index = that.getFacetList().indexOfAggregation("items", oListItem);
            var oDetailPage = that.oSplitContainer.getDetailPages()[index];
            var oDetailPageAttributeList = oDetailPage.getContent()[that.attributeListPosition].getContent()[0];
            var sNaviId = oDetailPage.getId();
            oDetailPageAttributeList.setBusy(true);
            that.oSplitContainer.toDetail(sNaviId, "show");

            var oSelectedListItem = oModel.getProperty(sBindingPath);
            var properties = {
                sAttribute: oSelectedListItem.dimension,
                sBindingPath: sBindingPath,
                oList: oDetailPageAttributeList
            };

            //apply the facet query filter, except itself
            that.applyFacetQueryFilter(index);

            //add the filter term in search field
            if (sFilterTerm) {
                var filterCondition = oModel.sina.createFilterCondition({
                    attribute: oSelectedListItem.dimension,
                    operator: "=",
                    value: sFilterTerm + "*"
                });
                oModel.facetQuery.addFilterCondition(filterCondition);
            }

            //flag this call as single call
            that.bSingleCall = true;

            //send the single call
            oModel.facetDialogSingleCall(properties).done(function() {
                that.updateDetailPageListItemsSelected(oDetailPageAttributeList);
            });
        },

        //callback function: update selected property after model changed
        updateDetailPageListItemsSelected: function(oDetailPageAttributeList) {
            var that = this;
            var oAdvancedContainer = oDetailPageAttributeList.getParent().getParent().getContent()[that.advancedPosition];
            var sDataType = oAdvancedContainer.data('dataType');
            for (var j = 0; j < oDetailPageAttributeList.getItems().length; j++) {
                var oListItem = oDetailPageAttributeList.getItems()[j];
                var oListItemBindingObject = oListItem.getBindingContext().getObject();
                if (oDetailPageAttributeList.getModel().hasFilter(oListItemBindingObject)) {
                    oListItem.setSelected(true);
                    oDetailPageAttributeList.getModel().changeFilterAdvaced(oListItemBindingObject, false);
                    that.removeAdvancedCondition(oAdvancedContainer, oListItem, sDataType);
                } else {
                    oListItem.setSelected(false);
                }
                //update model selected property
                var sSelectedBindingPath = oListItem.getBindingContext().sPath + "/selected";
                oListItem.getBindingContext().oModel.setProperty(sSelectedBindingPath, oListItem.getSelected());
            }
            that.sortingAttributeList(oDetailPageAttributeList.getParent().getParent());
            oDetailPageAttributeList.setBusy(false);
        },

        //remove duplicate advanced condition
        removeAdvancedCondition: function(oAdvancedContainer, oListItem, type) {
            var aConditions = oAdvancedContainer.getContent();
            var oConditionLayout, oInputBox, index;

            for (var i = 0; i < aConditions.length; i++) {
                oConditionLayout = aConditions[i];
                oInputBox = oConditionLayout.getContent()[1];
                if (type === "string") {
                    var value = oInputBox.getValue();
                    var oListItemBindingObject = oListItem.getBindingContext().getObject();
                    if (value === oListItemBindingObject.filterCondition.value) {
                        index = i;
                        break;
                    }
                }
            }
            oAdvancedContainer.removeContent(index);
        }

    });
})();
