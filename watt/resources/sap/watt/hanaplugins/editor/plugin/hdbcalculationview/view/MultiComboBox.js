/*Copyright © 2015 SAP SE or an affiliate company. All rights reserved.*/
// Provides control sap.hana.ide.editor.plugin.analytics.view.MultiComboBox.
sap.ui.define(["sap/ui/commons/ComboBox", "sap/ui/commons/ComboBoxRenderer"],
    function(ComboBox, ComboBoxRenderer) {
        'use strict';
        var MultiCombobox = ComboBox.extend("sap.watt.hanaplugins.editor.plugin.hdbcalculationview.view.MultiCombobox", {
            metadata:{
                properties : {
                    /**
                     * Defines the list of selected items.
                     */
                    selectedKeys : {type : "string[]", group : "Data", defaultValue : []}
                },
                aggregations : {
                    /**
                     * Getter for aggregation items. Allows setting ListItems that shall be displayed in the list.
                     */
                    items : {type : "sap.ui.core.ListItem", multiple : true, singularName : "item", bindable : "bindable"}
                }
            },
 
            /**
             * Using default renderer.
             */
            renderer : {},
 
            /**
             * Overriding private _open method to create custom dropdown view.
             * Rather than populating Popup control with ListItems a veritical layout
             * of checkboxes is used.
             */
            _open : function(iDuration) {
                if (this.mobile) {
                    return; // on mobile devices use native dropdown.
                }
                if (iDuration === undefined) {
                    iDuration = -1;
                }
                // Creating Popup control if doesn't exists.
                if (!this.oPopup) {
                    this.oPopup = new sap.ui.core.Popup();
                }
                var comboBoxId = this.getId();
                var oPopup = this.oPopup;
                var items = this.getItems();
                var selectedItems = this.getSelections();
                var oLayout = new sap.ui.commons.layout.VerticalLayout();
                oLayout.addStyleClass("MultiComboboxPopup");
 
                // Adding a combobox for each item into veritcal layout.
                for (var i in items) {
                    var oCheckbox = new sap.ui.commons.CheckBox({
                        text : items[i].getText(),
                        // Checking if item is in selected list. If it is present then
                        // setting checked to true.
                        checked : (selectedItems.indexOf(items[i].getKey()) !== -1),
                        // Toggles selection of checkbox on each change.
                        change : function(oEvent) {
                            var combobox = sap.ui.getCore().byId(comboBoxId);
                            var items = combobox.getItems();
                            var key;
                            for (var j in items) {
                                if (items[j].getText() === this.getText()) {
                                    key = items[j].getKey();
                                    break;
                                }
                            }
                            combobox.toggleSelection(key);
                        }
                    });
                    oLayout.insertContent(oCheckbox);
                }
 
                // Adding layout to pop and displaying it.
                oPopup.setContent(oLayout);
                oPopup.setAutoClose(true);
                oPopup.setAutoCloseAreas([this.getDomRef()]);
                oPopup.setFollowOf(sap.ui.core.Popup.CLOSE_ON_SCROLL);
                oPopup.setDurations(0, 0); // no animations
                oPopup.setInitialFocusId(this.getId() + '-input'); // to prevent popup to set focus to the ListBox -> stay in input field
 
                oPopup.attachOpened(this._handleOpened, this);
                // attachClosed moved to _handleOpened
 
                var eDock = sap.ui.core.Popup.Dock;
                oPopup.open(iDuration, eDock.BeginTop, eDock.BeginBottom, this/*.getDomRef()*/, null, null, true);
 
                jQuery(this.getDomRef()).attr("aria-expanded", true);
            }
        });
 
        /**
         * Returns the list of selected Items
         * @public
         */
        MultiCombobox.prototype.getSelections = function() {
            return this.getProperty('selectedKeys');
        };
 
        /**
         * Sets the list of selected Items
         * @param {Array} selectedKeys List of selected items.
         * @public
         **/
        MultiCombobox.prototype.setSelections = function(selectedKeys) {
            var itemsCount = this.getItems().length;
            var displayText = selectedKeys.length+" Types selected";
            if (itemsCount === selectedKeys.length)
                displayText = "All Types Selected";
            this.setProperty('selectedKeys', selectedKeys);
            this.setValue(displayText);
        };
 
        /**
         * Toggles the selection of given item
         * @param {String} itemName Name to the item.
         * @public
         */
        MultiCombobox.prototype.toggleSelection = function(itemKey) {
            var selectedItems = this.getSelections();
            if (selectedItems.indexOf(itemKey) === -1) {
                selectedItems.push(itemKey);
            } else {
                selectedItems.splice(selectedItems.indexOf(itemKey), 1);
            }
            this.setSelections(selectedItems);
        };
 
        /**
         * Sets the items avalaible for selection.
         * @param {Array} items List of item name.
         * @public
         */
        MultiCombobox.prototype.setItems = function(items) {
            for (var i in items) {
                this.insertItem(new sap.ui.core.ListItem(items[i]));
            }
        };
 
        return MultiCombobox;
    }, true);
