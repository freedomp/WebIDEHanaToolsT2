sap.ui.define(["sap/ui/commons/ComboBox", "./MultiSelectListBox", "sap/ui/core/Popup"],
	function(ComboBox, MultiSelectListBox, Popup) {
        "use strict";
        var _;
        var MultiComboBox = ComboBox.extend("sap.watt.ideplatform.plugin.gitclient.ui.MultiComboBox", {
            metadata: {
                library: "sap.watt.ideplatform.plugin.gitclient.ui",
                properties: {
                    selectedItemIds: {
                        type: "string[]",
                        group: "Data",
                        defaultValue: []
                    },
                    selectAllТitle: {
                        type: "string",
                        defaultValue: null
                    }
                },
                events: {
                    selectionChange: {
                        parameters: {
                            changedItem: {
                                type: "sap.ui.core.Item"
                            },
                            selected: {
                                type: "boolean"
                            }
                        }
                    },

                    /**
                     * Event is fired when user has finished a selection of items in a list box and list box has been closed.
                     */
                    selectionFinish: {
                        parameters: {

                            /**
                             * The selected items which are selected after list box has been closed.
                             */
                            selectedItems: {
                                type: "sap.ui.core.Item[]"
                            }
                        }
                    }
                },
                aggregations : {
                	myGridLayout : {type : "sap.ui.layout.VerticalLayout", multiple : false, visibility : "hidden"}
                }
            },

            renderer: {},

            init: function () {
                require(["sap/watt/lib/lodash/lodash"], function (lodash) {
                    _ = lodash;
                });
                ComboBox.prototype.init.apply(this, arguments);
                this.selectedItems = [];
                this.selectedItemsOnOpen = [];
                this.bWasSelected = false;
            },

            _getPrivateGrid: function(bUpdateGrid) {
            	var oListBox;
                if (!this._oGrid) {
                    oListBox = this._getListBox(bUpdateGrid);

                    var oOkButton = new sap.ui.commons.Button({
                        text: "Ok",
                        press: [this._onOkSelection, this]
                    }).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall");

                    var oCancelButton = new sap.ui.commons.Button({
                        text: "Cancel",
                        press: [this._onCancelSelection, this]
                    }).addStyleClass("gitRightMargin gitPaneControllerSpacing riverControlSmall");

                    var oButtonsHorizontanLayout = new sap.ui.layout.HorizontalLayout({
                        allowWrapping: true,
                        content: [oOkButton, oCancelButton]
                    }).addStyleClass("gitBackgroundColorWhite gitPaneHorizontalRight gitPaneOuterHorizontalLayout");


                    this._oGrid = new sap.ui.layout.VerticalLayout(this.getId() + "-bl", {
                        vSpacing: 0,
                        content: [oListBox, oButtonsHorizontanLayout]
                    }).addStyleClass("gitBackgroundColorWhite rdeGit");


                    if (this.getDomRef()) {
                        // update ARIA info
                        this.$().attr("aria-owns", this.getId() + "-input " + this._oGrid.getId());
                    }

                    this.setAggregation("myGridLayout", this._oGrid, true);
                }

                if (bUpdateGrid) {

                    var oDomRef = this.getDomRef();
                    if (oDomRef) {
                        oListBox = this._oGrid.getContent()[0];
                        oListBox.setMinWidth(jQuery(oDomRef).rect().width + "px");
                        this._oGrid.setWidth(jQuery(oDomRef).rect().width + "px");
                    }
                }

                return this._oGrid;
            },

            _getSelectedValue: function() {
                var sValue = _.reduce(this.selectedItems, function (memo, item) {
                    if (memo !== "") {
                        memo += ";";
                    }
                    return memo + item.getText();
                }, "");
                return sValue;
            },

            _onOkSelection: function(){
                this._close();
            },

            _onCancelSelection: function(){
                this.bWasSelected = false;
                this.selectedItems = this.selectedItemsOnOpen;
                this.setValue(this._getSelectedValue(), true);
                this._close();
            }
        });

        MultiComboBox.prototype._handleSelect = function (oControlEvent) {
            var that = this;
            var bIsSelectAllMode = !!this.getSelectAllТitle();
            var iSelected = oControlEvent.getParameter("selectedIndex"),
                iSelectedId = oControlEvent.getParameter("selectedId"),
                oItem = oControlEvent.getParameter("selectedItem"),
                aItems = this._getListBox().getItems(),
                aSelectedItems = this._getListBox().getSelectedItems();

            if (!oItem && iSelectedId) {
                oItem = sap.ui.getCore().byId(iSelectedId);
                if (oItem.getParent() !== this._getListBox(false)) { // can this happen?
                    oItem = null;
                }
                iSelected = jQuery.inArray(oItem, aItems);
            }
            if (oItem && oItem.getEnabled()) {
                var bItemSelected = _.indexOf(aSelectedItems, oItem) !== -1;
                if (bIsSelectAllMode && iSelected === 0) {
                    if (bItemSelected) {
                        this.setValue(this.getSelectAllТitle(), true);
                        this.selectedItems = [oItem];
                    } else {
                        this.setValue("", true);
                        this.selectedItems = [];
                    }
                } else {
                    this.selectedItems = _.shuffle(aSelectedItems);
                    this.selectedItems = _.reject(this.selectedItems, function (item) {
                        return item.getText() === that.getSelectAllТitle();
                    });
                    this.setValue(this._getSelectedValue(), true);
                }
                this.fireSelectionChange({
                    selected: bItemSelected,
                    changedItem: oItem
                });
            }
            this._doSelect();
            this.bWasSelected = true;
            return oItem;
        };

        MultiComboBox.prototype._prepareOpen = function (oListBox) {
            var $Ref = jQuery(this.getInputDomRef()),
                oValue = $Ref.val(),
                aItems = oListBox.getItems(),
                bEmptyString = oValue === "",
                oItem;

            if (bEmptyString) {
                return;
            }
            this.selectedItems = [];
            switch (oValue) {
                case "All":
                    this.setValue(this.getSelectAllТitle(), true);
                    oListBox.setSelectedIndex(0);
                    this.selectedItems = [aItems[0]];
                    break;
                default:
                    var aValues = oValue.split(";");
                    var aSelIndices = [];

                    for (var i = 0; i < aValues.length; i++) {
                        oItem = _.find(aItems, function(item){
                            return item.getText() === aValues[i];
                        });
                        var iIndex = _.indexOf(aItems, oItem);
                        if (iIndex !== -1) {
                            aSelIndices.push(iIndex);
                            this.selectedItems.push(aItems[iIndex]);
                        }
                    }
                    oListBox.setSelectedIndices(aSelIndices);
            }

            this._doSelect();
            var iItemsLength = oListBox.getItems().length;
            var iMaxPopupItems = this.getMaxPopupItems();
            oListBox.setVisibleItems(iMaxPopupItems < iItemsLength ? iMaxPopupItems : -1);
            this.selectedItemsOnOpen = jQuery.extend({}, this.selectedItems);
        };

        MultiComboBox.prototype._getPrivateListBox = function () {
            if (this._oListBox) {
                return this._oListBox;
            }
            // else
            this._oListBox = new MultiSelectListBox(this.getId() + "-lb", {
                allowMultiSelect: true,
                selectAllТitle: this.getSelectAllТitle()
            });
            this.setAggregation("myListBox", this._oListBox, true);

            /*this._oListBox.attachEvent("itemsChanged",this._handleItemsChanged, this);
             this._oListBox.attachEvent("itemInvalidated",this._handleItemInvalidated, this);*/

            if (this.getDomRef()) {
                // update ARIA info
                this.$().attr("aria-owns", this.getId() + "-input " + this._oListBox.getId());
            }

            return this._oListBox;
        };

        MultiComboBox.prototype._getListBox = function (bUpdateListBox) {

            var oListBox = this._getPrivateListBox();

            if (bUpdateListBox) {
                oListBox.setAllowMultiSelect(true);
                oListBox.setDisplaySecondaryValues(this.getDisplaySecondaryValues());

                var oDomRef = this.getDomRef();
                if (oDomRef) {
                    oListBox.setMinWidth(jQuery(oDomRef).rect().width + "px");
                }
            }
            return oListBox;
        };

        MultiComboBox.prototype._isSetEmptySelectedKeyAllowed = function () {
            this.removeAllAggregation("selectedItems");
            this.setValue("", true);
            return true;
        };
        
        MultiComboBox.prototype.exit = function () {
        	ComboBox.prototype.exit.apply(this);
        	if (this.getAggregation("myGridLayout")){
				this.destroyAggregation("myGridLayout", true);
			}
			if (this._oGrid){
				this._oGrid.destroy();
			}
			this._oGrid = null;
        };

        MultiComboBox.prototype._handleClosed = function () {
            sap.ui.commons.ComboBox.prototype._handleClosed.apply(this);
            if (this.bWasSelected) {
                this.fireSelectionFinish({
                    selectedItems: this.selectedItems
                });
            }

        };

        MultiComboBox.prototype._open = function(iDuration){

            if (this.mobile) {
                return; // on mobile devices use native dropdown.
            }

            if (iDuration === undefined) {
                iDuration = -1;
            }

            if (!this.getEditable() || !this.getEnabled()) {
                return;
            }

            if (!this.oPopup) {
                this.oPopup = new Popup();
            }

            this._F4ForOpen = false;
            var oGrid = this._getPrivateGrid(!this.oPopup.isOpen());
            var oListBox = oGrid.getContent()[0];
            var oPopup = this.oPopup;
            this._prepareOpen(oListBox);
            if (!this._oListBoxDelegate) {
                this._oListBoxDelegate = {oCombo: this, onclick: function(oEvent){ // FIXME: is this code ever executed? ListBox selection triggers _handleSelect which closes the Popup and removes this delegate again before the delegates for onclick are called
                    // cover also the case of 'confirm initial proposal'
                    var itemId = jQuery(oEvent.target).closest("li").attr("id");
                    if (itemId) {
                        // could also be done via EventPool... but whose to use? Combo's? ListBox'?
                        var oNewEvent = new sap.ui.base.Event("_internalSelect", this.oCombo, {selectedId: itemId});
                        this.oCombo._handleSelect(oNewEvent);
                    }
                }};
            }
            oListBox.addDelegate(this._oListBoxDelegate);
            // and update the given popup instance
            oPopup.setContent(oGrid);
            oPopup.setAutoClose(true);
            oPopup.setAutoCloseAreas([this.getDomRef()]);
            oPopup.setDurations(0, 0); // no animations
            oPopup.setInitialFocusId(this.getId() + '-input'); // to prevent popup to set focus to the ListBox -> stay in input field

            // now, as everything is set, ensure HTML is up-to-date
            // This is separated in a function because controls which inherit the Combobox (e.g. SearchField) might override this
            // Here is also the possibility to interrupt the open procedure of the list (e.g. when the list is empty)
            var bSkipOpen = this._rerenderListBox(oListBox);
            if (bSkipOpen) {
                return;
            }

            oPopup.attachOpened(this._handleOpened, this);
            // attachClosed moved to _handleOpened

            var eDock = Popup.Dock;
            oPopup.open(iDuration, eDock.BeginTop, eDock.BeginBottom, this/*.getDomRef()*/,
                /*offset*/null, /*collision*/ null, /*followOf*/ Popup.CLOSE_ON_SCROLL);
            jQuery(oGrid.getFocusDomRef()).attr("tabIndex", "-1");
            //attachSelect moved to _handleOpened

            jQuery(this.getDomRef()).attr("aria-expanded", true);

        };

        return MultiComboBox;
}, true);