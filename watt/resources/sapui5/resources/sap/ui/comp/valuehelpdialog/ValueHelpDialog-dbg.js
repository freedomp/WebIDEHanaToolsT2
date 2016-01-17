/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.valuehelpdialog.ValueHelpDialog.
sap.ui.define(['jquery.sap.global', 'sap/m/Dialog', 'sap/m/MessageBox', 'sap/m/MultiInput', 'sap/m/Token', 'sap/ui/comp/library', './ItemsCollection', 'sap/ui/core/Control', 'sap/ui/core/format/DateFormat', 'sap/ui/core/format/NumberFormat', 'sap/m/VBox', 'sap/m/HBox', 'sap/m/ButtonType', 'sap/ui/comp/util/FormatUtil'], 
	function(jQuery, Dialog, MessageBox, MultiInput, Token, library, ItemsCollection, Control, DateFormat, NumberFormat, VBox, HBox, ButtonType, FormatUtil) {
	"use strict";

	/**
	 * Constructor for a new valuehelpdialog/ValueHelpDialog.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given 
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ValueHelpDialog control can be used to implement a value help for an input field.
	 * @extends sap.m.Dialog
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.valuehelpdialog.ValueHelpDialog
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var ValueHelpDialog = Dialog.extend("sap.ui.comp.valuehelpdialog.ValueHelpDialog", /** @lends sap.ui.comp.valuehelpdialog.ValueHelpDialog.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
			/**
			 * Defines the value for the basic search field.
			 * The value is set into the basic search field of the filter bar used.
			 * @since 1.24
			 */
			basicSearchText : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Enables multi-selection in the table used.
			 * @since 1.24
			 */
			supportMultiselect : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Enables the ranges (conditions) feature in the dialog.
			 * @since 1.24
			 */
			supportRanges : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * If this property is set to true, the value help dialog only supports the ranges (conditions) feature.
			 * @since 1.24
			 */
			supportRangesOnly : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Defines the key of the column used for the internal key handling. The value of the column is used for the token key and also to identify the row in the table.
			 * @since 1.24
			 */
			key : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Defines the list of additional keys of the column used for the internal key handling.
			 * @since 1.24
			 */
			keys : {type : "string[]", group : "Misc", defaultValue : null},

			/**
			 * Defines the key of the column used for the token text.
			 * @since 1.24
			 */
			descriptionKey : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Defines the maximum number of include ranges.
			 * @since 1.24
			 */
			maxIncludeRanges : {type : "string", group : "Misc", defaultValue : '-1'}, // TODO string -->int
	
			/**
			 * Defines the maximum number of exclude ranges.
			 * @since 1.24
			 */
			maxExcludeRanges : {type : "string", group : "Misc", defaultValue : '-1'},  // TODO string -->int
	
			/**
			 * Represents the display format of the range values. With the <code>displayFormat</code> value UpperCase, the entered value of the range (condition) is converted to uppercase letters.
			 * @since 1.24
			 */
			displayFormat : {type : "string", group : "Misc", defaultValue : null}, 
	
			/**
			 * Represents how the item token text should be displayed in ValueHelpDialog.
			 * Use one of the valid sap.ui.comp.smartfilterbar.ControlConfiguration.DISPLAYBEHAVIOUR values.
			 * @since 1.24
			 */
			tokenDisplayBehaviour : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Sets the dialog into a filter mode, which only shows ranges (conditions) and hides the tokens.
			 * @since 1.24
			 */
			filterMode : {type : "boolean", group : "Misc", defaultValue : false}
		},
		aggregations : {
	
			/**
			 *  Allows you to add a {@link sap.ui.comp.filterbar.FilterBar FilterBar} or {@link sap.ui.comp.smartfilterbar.SmartFilterBar SmartFilterBar} control to the value help dialog.
			 */
			filterBar : {type : "sap.ui.comp.filterbar.FilterBar", multiple : false}
		},
		events : {
	
			/**
			 * This event is fired when the OK button is pressed.
			 * @since 1.24
			 */
			ok : {
				parameters: {					
					/**
					*  The array of tokens created or modified on the ValueHelpDialog.
				 	*/
					tokens: { type : "sap.m.Token[]" }
				}				
			}, 
	
			/**
			 * This event is fired when the Cancel button is pressed.
			 * @since 1.24
			 */
			cancel : {},
			
			/**
			 * This event is fired when the user selects an item in the items table.
			 * The event will only be raised when the dialog gets a table instance from outside via setTable. 
			 * @since 1.32
			 */
			selectionChange : {  
				parameters: {					
					/**
					*  The RowSelectionChange event parameter from the hosted table that contains the selected items.
				 	*/
					tableSelectionParams : { type : "object" },
					
					/**
					*  Returns an array of objects which represents all selected row tokens. 
					*  The object contains the token key, the row object data from the model, and the information if the token is selected.
					*  <code>
					*  [{sKey, oRow, bSelect}, ...]
					*  </code>  
				 	*/
					updateTokens : { type : "object[]" }, 
					
					/**
					*  Can be set to true to execute the default behaviour of the ValueHelpDialog.
				 	*/
					useDefault : { type : "boolean", defaultValue : false }
				}				
			},

			/**
			 * This event is fired when the user removes one or multiple existing token(s) from the dialog.
			 * The event will only be raised when the dialog gets a table instance from outside via setTable. 
			 * @since 1.32
			 */
			tokenRemove: {  
				parameters: {					
					/**
					*  The array of token keys that has been removed.
				 	*/
					tokenKeys : { type : "string[]" },
					
					/**
					*  Can be set to true to execute the default behaviour of ValueHelpDialog. 
				 	*/
					useDefault : { type : "boolean", defaultValue : false }
				}				
				
			},

			/**
			 * This event is fired when the table gets an update and all existing tokens must be selected in the table. 
			 * The event will only be raised when the dialog gets a table instance from outside via setTable. 
			 * @since 1.32
			 */
			updateSelection: {
				parameters: {					
					/**
					*  The array of existing token keys for which the selection in the table has to be updated.
				 	*/
					tokenKeys : { type : "string[]" },
					
					/**
					*  Can be set to true to execute the default behavior of ValueHelpDialog. 
				 	*/
					useDefault : { type : "boolean", defaultValue : false }
				}				
				
			}
		}
	}});
	
	// EXC_ALL_CLOSURE_003
	
	ValueHelpDialog.prototype.setSupportMultiselect = function(bEnabled) {
		this.setProperty("supportMultiselect", bEnabled);

		this._updatePropertySupportMultiselect(bEnabled);

		this._oTokenizerGrid.setVisible(bEnabled);
		this._oButtonOk.setVisible(bEnabled);
		return this;
	};
	
	ValueHelpDialog.prototype._updatePropertySupportMultiselect = function(bEnabled) {
		if (!this._oTable) {
			return;
		}
		
		if (!this._isPhone()) {
			if (this._oTable.setSelectionMode) {
				this._oTable.setSelectionMode(bEnabled ? sap.ui.table.SelectionMode.MultiToggle : sap.ui.table.SelectionMode.Single);
			}
		} else {
			if (this._oTable.setMode) {
				this._oTable.setMode(bEnabled ? sap.m.ListMode.MultiSelect : sap.m.ListMode.SingleSelectLeft);
			}
		}
		
		return this;
	};
	
	
	ValueHelpDialog.prototype.setSupportRanges = function(bEnabled) {
		this.setProperty("supportRanges", bEnabled);
		
		this._updateNavigationControl();
		
		return this;
	};


	ValueHelpDialog.prototype.setSupportRangesOnly = function(bEnabled) {
		this.setProperty("supportRangesOnly", bEnabled);

		this._updateNavigationControl(); 
		return this;
	};

	
	// Sets the Title of the dialog. 
	// The value is used for the different titles which we display during runtime on the dialog header. 
	// The dialog title changes depending on the content. 
	ValueHelpDialog.prototype.setTitle = function(sTitle) {
		this.setProperty("title", sTitle);
	
		this._updateDlgTitle();
	};
	

	ValueHelpDialog.prototype.setFilterBar = function(oCtrl) {
		this.setAggregation("filterBar", oCtrl);
	
		var oGrid = this._oTableGrid; 
		
		if (oGrid && oCtrl) {
			if (this._isPhone()) {
				if (this._oFilterBar) {
					// Remove the old filterbar.
					this._oVBox.removeItem(this._oFilterBar);
				}
				
			} else {
				if (this._oFilterBar) {
					// Remove the old filterbar.
					oGrid.removeContent(this._oFilterBar);
				}
			}
			
			this._oFilterBar = oCtrl;
			if (this._oFilterBar) {
				
				this._oFilterBar.addStyleClass("compVHSearch");
				
				if (this._isPhone()) {
					// Let the Search Field on a phone show the search icon. 
					var oSearchField = sap.ui.getCore().byId(this._oFilterBar.getBasicSearch());
					if (oSearchField instanceof sap.m.SearchField) {
						oSearchField.setShowSearchButton(true);
						oSearchField.attachSearch( jQuery.proxy( function(oEvent) {
							if (oEvent.mParameters.refreshButtonPressed !== undefined) { // Workaround to ignore the remove icon click on the Search control.
								this.getFilterBar().search();
							}
						}, this)); 						
					}
					this._oFilterBar.setShowGoOnFB(false);					

					
					// Add the Collective Search as first item into the VBox. 
					this._oColSearchBox.setLayoutData(new sap.m.FlexItemData({
						shrinkFactor: 0
					}));					
					this._oVBox.insertItem( this._oColSearchBox, 0);

					// The Filterbar with the Basic Search is the second item. 
					this._oFilterBar.setLayoutData(new sap.m.FlexItemData({
						shrinkFactor: 0
					}));					
					this._oVBox.insertItem( this._oFilterBar, 1);
					
					// On the phone listen on the Search event to show the LIST_VIEW.
					this._oFilterBar.attachSearch(jQuery.proxy( function(oEvent) {
						this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW);
					}, this));
					
					
					if (this._currentViewMode === sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW) {
						// update the Filterbar states
						this._oFilterBar.setVisible(true); 
						this._oFilterBar.setFilterBarExpanded(false);
						this._oFilterBar._handleVisibilityOfToolbar();

						var bShowAdvancedSearch = this._oFilterBar.getFilterGroupItems() && this._oFilterBar.getFilterGroupItems().length > 0;
						this._oAdvancedSearchLink.setVisible(bShowAdvancedSearch); 
					}
				} else {
					// for Tablet and Desktop add the Filterbar into the mainGrid and place the CollectiveSearch inside the Filterbar.
					this._oFilterBar._setCollectiveSearch(this._oColSearchBox);
					oGrid.insertContent(this._oFilterBar, 0); 
				}
			}
	
			// Try to fill the basic search text into the SmartFilterBar and set the initial Focus.
			if (this._oFilterBar._oBasicSearchField) {
				var oBasicSearchField = this._oFilterBar._oBasicSearchField;
				oBasicSearchField.setValue(this.getBasicSearchText());
	
				this.setInitialFocus(oBasicSearchField);
			}
		}
	};
	
	ValueHelpDialog.prototype.getFilterBar = function() {
		return this._oFilterBar;
	};
	
	ValueHelpDialog.prototype.setBasicSearchText = function(sText) {
		this.setProperty("basicSearchText", sText);
	
		if (this._oFilterBar && this._oFilterBar._oBasicSearchField) {
			this._oFilterBar._oBasicSearchField.setValue(sText);
		}
	};
	
	
	/**
	 * Sets the array of tokens. The sap.m.Tokens are added to the dialog tokenizer Selected Items or Excluded Items. 
	 * Normal tokens are added to the Selected Items tokenizer only and are selected in the table.
	 * 
	 * <code>
	 * new sap.m.Token({key: "0001", text:"SAP A.G. (0001)"}); 
	 * </code>
	 *
	 * Tokens with the extra data with value 'range' are handled as range tokens or exclude range tokens.
	 * 
	 * <code> 
	 * new sap.m.Token({key: "i1", text: "ID: a..z"}).data("range", { "exclude": false, "operation": sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.BT, "keyField": "CompanyCode", "value1": "a", "value2": "z"});
	 * </code> 
	 * 
	 * The selected items or range tokens are returned in the event parameters of the Ok event.
	 * 
	 * @public
	 * @since 1.24
	 * @param {sap.m.Token[]} aTokens 
	 * 							An array of token controls
	 */
	ValueHelpDialog.prototype.setTokens = function(aTokens) {
		if (aTokens.length) {
			var n = 0, sKey;
			for (var i = 0; i < aTokens.length; i++) {
				var token = aTokens[i];
				if (token.data("range")) {
					var range = token.data("range");
					sKey = token.getKey();
					if (!sKey) {
						sKey = "range_" + n;
						n++;
					}
					var theTokenText = this._getFormatedRangeTokenText(range.operation, range.value1, range.value2, range.exclude, range.keyField);
					this._addToken2Tokenizer(sKey, theTokenText, range.exclude ? this._oExcludedTokens : this._oSelectedTokens);
	
					this._oSelectedRanges[sKey] = range;
				} else {
					sKey = token.getKey();
					var sText = token.getText();
					var sLongKey = token.data("longKey");
					var oRowData = token.data("row");
					if (!sLongKey) {
						sLongKey = sKey;
					}
					this._oSelectedItems.add(sLongKey, oRowData ? oRowData : token.getText());
	
					this._oSelectedTokens.addToken(new Token({
						key: sLongKey,
						text: sText,
						tooltip: sText
					}));
				}
			}
		} else {
			this._oSelectedItems.removeAll();
			this._oSelectedRanges = {};
		}
	};
	
	ValueHelpDialog.prototype.open = function() {

		if (!this._oTable) { 
			this._createDefaultTable();
		}

		// take the current visibility of the title and button for the visibility of the colSearchBox 
		this.bCollectiveSearchActive = this.oSelectionTitle.getVisible() && this.oSelectionButton.getVisible();
		if (this._oColSearchBox) {
			this._oColSearchBox.setVisible(this.bCollectiveSearchActive);
		}
	
		if (!this._isPhone()) {
			if (this.getSupportRangesOnly() || this.getFilterMode()) {
				this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW);
			}

			// set the default dialog width for Tablet/Desktop
			this.setContentWidth(this._getDefaultContentWidth());
		} else {
			this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_MAIN_VIEW);
		}

		Dialog.prototype.open.apply(this);
	};
	
	/**
	 * Gives access to the internal table instance.
	 * 
	 * @public
	 * @returns {object} the used table instance
	 * @since 1.28
	 */
	ValueHelpDialog.prototype.getTable = function() {
		if (!this._oTable) { 
			this._createDefaultTable();
		}	
		
		return this._oTable;
	};
	
	/**
	 * Sets the table used in the value help dialog. If not used, the dialog creates a sap.ui.table.Table or sap.m.Table instance internally.
	 * 
	 * @public
	 * @since 1.32
	 * @param {object} aTable The used table control instance
	 */
	ValueHelpDialog.prototype.setTable = function( oTable) {
		if (oTable instanceof sap.ui.comp.smarttable.SmartTable) {
			this._oTable = oTable.getTable();
		} else {
			this._oTable = oTable;
		}
		this.theTable = this._oTable; // support old public theTable property for usage outside the class
		
		this._initializeTable();
		this._oTableGrid.addContent(oTable);
	};
	
	/**
	 * return the default ContentWidth for the dialog
	 * 
	 * @private
	 * @returns {string} The width in px
	 */
	ValueHelpDialog.prototype._getDefaultContentWidth = function() {
		var nColumns = 0;
		if (this._oTable) {
			nColumns = this._oTable.getColumns().length;
		}
		var nWidth = Math.max(1080, nColumns * 130);
		return nWidth + "px";
	};
	
	/**
	 * Resets the table binding and changes the table NoDataText to "Please press Search Button".
	 * 
	 * @private
	 * @since 1.24
	*/
	ValueHelpDialog.prototype.resetTableState = function() {
		if (this._oTable) {
			if (this._oTable.unbindRows) {
				this._oTable.unbindRows();
			}
			this._oTable.setNoDataText(this._oRb.getText("VALUEHELPDLG_TABLE_PRESSSEARCH"));
		}
	};
	
	/**
	 * Changes the table NoDataText to "Please press Search Button".
	 * 
	 * @private
	 * @since 1.24
	 */
	ValueHelpDialog.prototype.TableStateSearchData = function() {
		if (this._oTable) {
			this._oTable.setNoDataText(this._oRb.getText("VALUEHELPDLG_TABLE_PRESSSEARCH"));
		}
	};
	
	/**
	 * Changes the table NoDataText to "No Data found!".
	 * 
	 * @private
	 * @since 1.24
	 */
	ValueHelpDialog.prototype.TableStateDataFilled = function() {
		if (this._oTable) {
			this._oTable.setNoDataText(this._oRb.getText("VALUEHELPDLG_TABLE_NODATA"));
		}
	};
	
	/**
	 * Changes the table NoDataText to "Searching...".
	 * 
	 * @private
	 * @since 1.28
	 */
	ValueHelpDialog.prototype.TableStateDataSearching = function() {
		if (this._oTable) {
			this._oTable.setNoDataText(this._oRb.getText("VALUEHELPDLG_TABLE_SEARCHING"));
		}
	};
	
	/**
	 * Initializes the control.
	 * @private
	 */
	ValueHelpDialog.prototype.init = function() {
		Dialog.prototype.init.apply(this);
		
		this.setStretch(this._isPhone());
		this.setResizable(!this._isPhone());
		this.setDraggable(!this._isPhone());
		
		this.bCollectiveSearchActive = false;
		
		// init the Dialog itself
		this.addStyleClass("compValueHelpDialog");
	
		// init some resources
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
		this._sTableTitle1 = this._oRb.getText("VALUEHELPDLG_TABLETITLE1");
		this._sTableTitle2 = this._oRb.getText("VALUEHELPDLG_TABLETITLE2");
		this._sTableTitleNoCount = this._oRb.getText("VALUEHELPDLG_TABLETITLENOCOUNT");
	
		this._currentViewMode = null; // sap.ui.comp.valuehelpdialog._ValueHelpViewMode
		this._oSelectedItems = new ItemsCollection();
		this._oSelectedRanges = {};
	
		this._createHeaderBar();
		
		this._createCollectiveSearch();

		this._createTokenizer();
		this._updateTokenizer();
	
		this._oVBox = new VBox( { fitContainer: true });
		this.addContent(this._oVBox);
		
		this._oTableGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			vSpacing: 0,
			hSpacing: 0,
			content: [ this._oFilterBar ]
		}); 
		
		this._oMainGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			vSpacing: 0,
			hSpacing: 0,
			content: [
				this._oTableGrid 
			]
		});

		this._createNavigationControl(); 
		this._updateNavigationControl(); 
		
		this._oMainGrid.setLayoutData(new sap.m.FlexItemData({
			growFactor: 1,
			shrinkFactor: 0
		}));
		this._oVBox.addItem(this._oMainGrid);

		if (this.getMaxIncludeRanges() === "-1" && this.getMaxExcludeRanges() !== "0" && !this.getFilterMode()) {
			this._oVBox.addItem(this._oTokenizerGrid);
		}

		this._createFooterControls();
		

		// vertical scrolling of the dialog content is disabled to get the expected layout of the used VBox in the content.
		// scrolling itself is enabled  via css overflow-y: auto
		this.setVerticalScrolling(false);
		this.setHorizontalScrolling(false);
		
		// to support touch scrolling we have to set the event to marked, otherwise when using a sap.m.App touch events are not handled.
		if (!sap.ui.Device.system.desktop) {
			this._oVBox.attachBrowserEvent("touchmove", function(event) {
		        event.setMarked();
		    });
		}
		
		if (!this._isPhone()) {
			this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW);
		}
	};
	
	
	/**
	 * Update the visible view of the dialog.
	 * The method is changing the visibility of the used controls to only show the required parts of the view. 
	 * 
	 * @private 
	 * @param {sap.ui.comp.valuehelpdialog._ValueHelpViewMode} newViewMode View mode which should be shown 
	 */	
	ValueHelpDialog.prototype._updateView = function(newViewMode) {
		if (this._currentViewMode === newViewMode) {  
			return;
		}
		
		switch (newViewMode) {
			case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW:
				this._validateRanges(jQuery.proxy(function() {
					// when valid show the Items Table
					this._oTokenizerGrid.setVisible(this.getSupportMultiselect());
					this._oMainGrid.removeAllContent();
					if (this._oTabBar && this._oTabBar.getSelectedKey() !== sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW) {
						this._oTabBar.setSelectedKey(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW); 
					}
					this._oMainGrid.addContent(this._oTableGrid);
					this._updateDlgTitle();
				}, this), jQuery.proxy(function() {
					// if not valid go back to the Ranges Tab
					this._oTabBar.setSelectedKey(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW); 
				}, this));
				break;

			case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW:

				if (this.getSupportRanges()) {
					this.bCollectiveSearchActive = this.oSelectionTitle.getVisible() && this.oSelectionButton.getVisible();
					this._oMainGrid.removeAllContent();
					if (this._oTabBar && this._oTabBar.getSelectedKey() !== sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW) {
						this._oTabBar.setSelectedKey(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW); 
					}
					this._oMainGrid.addContent(this._getRanges());
					this._oButtonOk.setVisible(this.getSupportRangesOnly() || this.getSupportMultiselect());

					this._oTokenizerGrid.setVisible(this.getSupportMultiselect());
					if (!(this.getMaxIncludeRanges() === "-1" && this.getMaxExcludeRanges() !== "0" && !this.getFilterMode())) {
						this._oTokenizerGrid.setVisible(false);
					}
				}
				break;
			
			case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_MAIN_VIEW:
				this._oColSearchBox.setVisible(false);
				this._oMainListMenu.setVisible(true);
				this._updateNavigationControl();
				this._oAdvancedSearchLink.setVisible(false);
				if (this._oFilterBar) {
					this._oFilterBar.setVisible(false); this._oFilterBar.setFilterBarExpanded(false);
				}
				this._oTable.setVisible(false);
			  
				this._oTokenizerGrid.setVisible(this.getSupportMultiselect());
				if (!(this.getMaxIncludeRanges() === "-1" && this.getMaxExcludeRanges() !== "0" && !this.getFilterMode())) {
					this._oTokenizerGrid.setVisible(false);
				}

				if (this._oRanges) {
					this._oRanges.setVisible(false);
				}
			  
				this._oButtonGo.setVisible(false);
				this._oButtonClear.setVisible(false);
				this._oButtonOk.setVisible(true);
				this._oButtonCancel.setVisible(true);
				this._oBackButton.setVisible(false);
				
				this._bNoneMainView = false;
				if (!this._oTokenizerGrid.getVisible() && !(this._oSelectItemLI.getVisible() && this._oDefineConditionsLI.getVisible())) {
					this._bNoneMainView = true;  // used to not show the backbutton on the list and condition view
					if (this._oSelectItemLI.getVisible()) {
						// make the Selection Table visible by default
						this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW);
					}
					if (this._oDefineConditionsLI.getVisible()) {
						// make the condition screen visible by default
						this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_CONDITIONS_VIEW);
					}
					return;
				}
				
				break;
				
			case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW:
				this._oColSearchBox.setVisible(this.bCollectiveSearchActive);
				this._oMainListMenu.setVisible(false);
				var bShowAdvancedSearch = this._oFilterBar && this._oFilterBar.getFilterGroupItems() && this._oFilterBar.getFilterGroupItems().length > 0;
				this._oAdvancedSearchLink.setVisible(bShowAdvancedSearch); 
				if (this._oFilterBar) {
					this._oFilterBar.setVisible(true); this._oFilterBar.setFilterBarExpanded(false);
				}
				this._oTable.setVisible(true);
				this._oTokenizerGrid.setVisible(false);
				if (this._oRanges) {
					this._oRanges.setVisible(false);
				}
				
				this._oButtonGo.setVisible(false);
				this._oButtonClear.setVisible(false);
				this._oButtonOk.setVisible(this.getSupportMultiselect());
				this._oButtonCancel.setVisible(true);
				this._oBackButton.setVisible(!this._bNoneMainView);
				break;
				
			case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_SEARCH_VIEW:
				this._oColSearchBox.setVisible(false);
				this._oMainListMenu.setVisible(false);
				if (this._oFilterBar) {
					this._oFilterBar.setVisible(true); this._oFilterBar.setFilterBarExpanded(true);
				}
				this._oAdvancedSearchLink.setVisible(false); 
				this._oTable.setVisible(false);
				this._oTokenizerGrid.setVisible(false);
				if (this._oRanges) {
					this._oRanges.setVisible(false);
				}
				
				this._oButtonGo.setVisible(true);
				this._oButtonClear.setVisible(true);
				this._oButtonOk.setVisible(false);
				this._oButtonCancel.setVisible(true);
				this._oBackButton.setVisible(true);
				break;
				
			case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_CONDITIONS_VIEW:
				this._oColSearchBox.setVisible(false);
				this._oMainListMenu.setVisible(false);
				if (this._oFilterBar) {
					this._oFilterBar.setVisible(false);
				}
				this._oAdvancedSearchLink.setVisible(false); 
				this._oTable.setVisible(false);
				this._oTokenizerGrid.setVisible(false);
				if (!this._oRanges) {
					this._oMainGrid.addContent(this._getRanges());
				}
				this._oRanges.setVisible(true);
				
				this._oButtonGo.setVisible(false);
				this._oButtonClear.setVisible(false);
				this._oButtonOk.setVisible(true);
				this._oButtonCancel.setVisible(true);
				this._oBackButton.setVisible(!this._bNoneMainView);
				break;
				
			default:
				break;
		}

		if (this._oMainListMenu && this._oVBox) {

			// check if the Toolbar of the FilterBar is empty and make the toolbar invisible
			if (this._oFilterBar) {
				this._oFilterBar._handleVisibilityOfToolbar();
			}

			this._oVBox.rerender();
		}

		this._currentViewMode = newViewMode;
		this._updateDlgTitle();
	};
	
	/**
	 * select or deselect the row in the table with the given key
	 * 
	 * @private
	 * @param {string} sKey the key of the row
	 * @param {boolean} bSelect specifies if the row should be selected or deselected
	 */
	ValueHelpDialog.prototype._changeTableRowSelectionForKey = function(sKey, bSelect) {
		var i;
		var oTable = this._oTable;

		this._bIgnoreSelectionChange = true;

		if (sap.ui.table.Table && oTable instanceof sap.ui.table.Table) {
			var rows = oTable.getBinding("rows");
		
			if (rows.aKeys) {
				for (i = 0; i < rows.aKeys.length; i++) {
					if (rows.aKeys[i] === sKey) {
						if (bSelect) {
							oTable.addSelectionInterval(i, i);
						} else {
							oTable.removeSelectionInterval(i, i);
						}
						break;
					}
				}
			} else {
				this.oRows = oTable.getBinding("rows");
				if (this.oRows.aIndices) {
					for (i = 0; i < this.oRows.aIndices.length; i++) {
						var oContext = oTable.getContextByIndex(this.oRows.aIndices[i]);
						if (oContext) {
							var oRow = oContext.getObject();
							if (oRow[this.getKey()] === sKey) {
								if (bSelect) {
									oTable.addSelectionInterval(i, i);
								} else {
									oTable.removeSelectionInterval(i, i);
								}
								break;
							}
						}
					}
				}
			}
		} else {

			// Handle selection update of the m.table
			for (i = 0; i < oTable.getItems().length; i++) {
				var oColListItem = oTable.getItems()[i];
				var oRowData = oColListItem.getBindingContext().getObject();
				if (oRowData[this.getKey()] === sKey) {
					oTable.setSelectedItem(oColListItem, bSelect);						
					break;
				}
			}				
			
		}
	
		this._bIgnoreSelectionChange = false;
		
	};
	
	/**
	 * Updates the selection of rows in the table. This function must be called after a first binding or binding update of the table.
	 * It will set a table row as selected if a token for this row exists.
	 * 
	 * @public
	 * @since 1.24
	*/
	ValueHelpDialog.prototype.update = function() {
		var i, j, oRow, oContext;
		var aItems = this._oSelectedItems.getItems();
		var eventArgs = { 
			tokenKeys: aItems,
			useDefault: false
		};

		this._bIgnoreSelectionChange = true;

		if (this._hasListeners("updateSelection")) {
			this.fireUpdateSelection(eventArgs);
			
//			if (eventArgs.useDefault) {
//				sap.m.MessageToast.show("useDefault");
//			}
			
		} else {
			eventArgs.useDefault = true;
		}
		
		if (eventArgs.useDefault) {
			if (sap.ui.table.Table && this._oTable instanceof sap.ui.table.Table) {
				
				this.oRows = this._oTable.getBinding("rows");
				this._oTable.clearSelection();
			
				if (this.oRows.aKeys) {
					var aKeys = this.getKeys();
					var sRowKeyPartPrefix = aKeys && aKeys.length > 1 ? this.getKey() + "=" : "";

					// in case of an oDataModel binding the aKeys exist and the row will be found via the keys.
					for (j = 0; j < aItems.length; j++) {
						var sKey = aItems[j];
						var sRowKeyPart = sRowKeyPartPrefix + "'" + sKey + "'";
			
						for (i = 0; i < this.oRows.aKeys.length; i++) {
							var sRowKey = this.oRows.aKeys[i];
							var bIsRow = sRowKey === sKey;
							if (bIsRow || // either the rowKey is equal the token key or we search if the main key with the value is part of the rowKey 
								sRowKey.indexOf(sRowKeyPart) >= 0) {
			
								if (!bIsRow) { // in this case we will update the old key and use the longKey from the rows
									this._oSelectedItems.remove(sKey); // remove the old  key
									// and update the Token key
									var token = this._getTokenByKey(sKey, this._oSelectedTokens);
									if (token) {
										token.setKey(sRowKey);
									}
								}
								
								// update the row data in the selectedItems List
								oContext = this._oTable.getContextByIndex(i);
								if (oContext) {
									oRow = oContext.getObject();
									this._oSelectedItems.add(sRowKey, oRow);
								}
			
								// make the row selected
								this._oTable.addSelectionInterval(i, i);
								break;
							}
						}
					}
				} else {
					if (this.oRows.aIndices) {
						this._oTable.clearSelection();
						
						for (j = 0; j < aItems.length; j++) {
							var key = aItems[j];
							for (i = 0; i < this.oRows.aIndices.length; i++) {
								oContext = this._oTable.getContextByIndex(this.oRows.aIndices[i]);
								if (oContext) {
									oRow = oContext.getObject();
									if (oRow[this.getKey()] === key) {
										this._oSelectedItems.add(oRow[this.getKey()], oRow);
										this._oTable.addSelectionInterval(i, i);
										break;
									}
								}
							}
						}
					}
				}
			
			} else {
				// Handle selection update of the m.table
				var oTable = this._oTable;
				for (j = 0; j < aItems.length; j++) {
					var sKey = aItems[j];
					for (i = 0; i < oTable.getItems().length; i++) {
						var oColListItem = oTable.getItems()[i];
						var oRowData = oColListItem.getBindingContext().getObject();
						if (oRowData[this.getKey()] === sKey) {
							oTable.setSelectedItem(oColListItem, true);						
							break;
						}
					}				
				}
	
			}
		}
		
		this._bIgnoreSelectionChange = false;
		
		this._updateTitles();
	};
	
	/**
	 * Create the header bar, the controls for the header and adds it into the custom header.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._createHeaderBar = function() {
		this._oTitle = new sap.m.Text({
			wrapping: false
		}).addStyleClass("compVHTitleText").unbindText(); // Text is not set via binding, but by calling setText
	
		var oBackButton = null;
		if (this._isPhone()) {
			oBackButton = new sap.m.Button({
				visible: false,
				type: ButtonType.Back,
				press:  jQuery.proxy( function(oEvent) {
					if (this._currentViewMode === sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_SEARCH_VIEW) {
						this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW);
					} else {
						this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_MAIN_VIEW);
					}
				}, this)
			});
			
			this._oBackButton = oBackButton; 
		}
		
		this.setCustomHeader(new sap.m.Bar({
			contentLeft: oBackButton,
			contentMiddle: this._oTitle
		}));
	};
	
	
	/**
	 * Creates the collective search elements which are placed beside the filter bar.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._createCollectiveSearch = function() {
		// the oSelectionText and oSelectionButton are accessed outside the dialog!!!
		this.oSelectionTitle = new sap.m.Text({
			visible: false,
			wrapping: false
		}).addStyleClass("compVHColSearchText"); 
	
		this.oSelectionButton = new sap.m.Button({
			icon: "sap-icon://arrow-down", 
			type: sap.m.ButtonType.Transparent,
			visible: false
		}).addStyleClass("compVHColSearchBtn");
		
		this._oColSearchBox = new HBox( { 
			fitContainer: true,
			visible: this.oSelectionButton.getVisible(),
			items: [this.oSelectionTitle, this.oSelectionButton]
		}); 
	};
	
	/**
	 * Creates the footer buttons.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._createFooterControls = function() {
		this._oButtonOk = new sap.m.Button({
			text: this._oRb.getText("VALUEHELPDLG_OK"),
			press: jQuery.proxy(this._onCloseAndTakeOverValues, this),
			visible: this.getSupportMultiselect()
		});

		this._oButtonCancel = new sap.m.Button({
			text: this._oRb.getText("VALUEHELPDLG_CANCEL"),
			press: jQuery.proxy(this._onCancel, this)
		});

		if (this._isPhone()) {
			this._oButtonGo = new sap.m.Button({
				text: this._oRb.getText("VALUEHELPDLG_GO"), 
				type: sap.m.ButtonType.Emphasized,
				press: jQuery.proxy(this._onGo, this),
				visible: false 
			});
		
			this._oButtonClear = new sap.m.Button({
				text: this._oRb.getText("VALUEHELPDLG_CLEAR"), 
				press: jQuery.proxy(this._onClear, this),
				visible: false
			});

			this.addButton(this._oButtonGo);
			this.addButton(this._oButtonClear);
		} 
		this.addButton(this._oButtonOk);
		this.addButton(this._oButtonCancel);
	};
	
	/**
	 * Creates the tokenizer part of the dialog.
	 * 
	 * @private
	 * @returns {sap.ui.layout.Grid} with all elements
	 */
	ValueHelpDialog.prototype._createTokenizer = function() {
		if (this._oTokenizerGrid) {
			return this._oTokenizerGrid;
		}
	
		this._oSelectedTokenTitle = new sap.m.Text().addStyleClass("compVHSelectedItemsText");
	
		this._oSelectedTokens = new sap.m.Tokenizer({
			tokenChange: jQuery.proxy( function(oControlEvent) {
				if (this._ignoreRemoveToken) {
					return;
				}
	
				if (oControlEvent.getParameter("type") === sap.m.MultiInput.TokenChangeType.TokensChanged) {
					var aRemovedTokens = oControlEvent.getParameter("removedTokens");
					var aTokenKeys = [];
					
					for ( var j = 0; j < aRemovedTokens.length; j++) {
						var oToken = aRemovedTokens[j];
						var sKey = oToken.getKey();
		
						if (this._oSelectedRanges && this._oSelectedRanges[sKey]) {
							// remove range
							this._removeRangeByKey(sKey, false);
							this._updateTitles();
						} else {
							aTokenKeys.push(sKey);

							// remove single selected item
							this._oSelectedItems.remove(sKey);
							this._removeTokenFromTokenizer(sKey, this._oSelectedTokens);
						}
					}
					
					var eventArgs = { 
						tokenKeys: aTokenKeys,
						useDefault: false
					};

					if (this._hasListeners("tokenRemove")) {
						this._bIgnoreSelectionChange = true;
						this.fireTokenRemove(eventArgs);
						this._bIgnoreSelectionChange = false;
						
//						if (eventArgs.useDefault) {
//							sap.m.MessageToast.show("useDefault");
//						}

					} else {
						eventArgs.useDefault = true;
					}
					
					if (eventArgs.useDefault) {
						aTokenKeys.forEach(jQuery.proxy(function(sTokenKey) {
							this._changeTableRowSelectionForKey(sTokenKey, false);	
						}, this));
					}
					
					// try to set the focus to other token - Workaround because the Tokenizer does not set the focus to other token
					if (aRemovedTokens.length === 1) {
						setTimeout( jQuery.proxy( function() {
							if (this._oSelectedTokens.getTokens()) {
								var i = this._oSelectedTokens.getTokens().length - 1;
								if (i >= 0) {
									this._oSelectedTokens.getTokens()[i].focus();
								}
							}
						}, this));
					}

					this._updateTitles();
				} 

			}, this)
		}).addStyleClass("compVHTokensDiv");
		
		// this "remove all" button is a workaround and should be part of the Tokenizer itself
		this._oRemoveAllSelectedItemsBtn = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI("sys-cancel"),
			tooltip: this._oRb.getText("VALUEHELPVALDLG_REMOVETOKENS_TOOLTIP"),
			press: jQuery.proxy( function() {
				this._oSelectedTokens.removeAllTokens();
	
				for ( var sKey in this._oSelectedRanges) {
					this._removeRangeByKey(sKey, false);
				}
	
				this._oSelectedItems.removeAll();
				this._bIgnoreSelectionChange = true;
				if (this._oTable.clearSelection) { 
					this._oTable.clearSelection();
				}
				if (this._oTable.removeSelections) {
					this._oTable.removeSelections();
				}
				this._bIgnoreSelectionChange = false;
	
				this._updateTitles();
				this._onResize();
			}, this)
		}).addStyleClass("compVHRemoveAllBtn");
	
		var oHContainer1 = new sap.ui.layout.HorizontalLayout({
			content: [
				this._oSelectedTokens, this._oRemoveAllSelectedItemsBtn
			]
		}).addStyleClass("compVHTokenizerHLayout");
	
		this._oIncludeTokenGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 0,
			vSpacing: 0,
			content: [
				this._oSelectedTokenTitle, oHContainer1
			]
		});
	
		this._oExcludedTokenTitle = new sap.m.Text().addStyleClass("compVHSelectedItemsText");
	
		this._oExcludedTokens = new sap.m.Tokenizer({
			tokenChange: jQuery.proxy( function(oControlEvent) {
				if (this._ignoreRemoveToken) {
					return;
				}
	
				if (oControlEvent.getParameter("type") === MultiInput.TokenChangeType.Removed) {
					var sKey = oControlEvent.getParameter("token").getKey();
					this._removeRangeByKey(sKey, true);
					this._updateTitles();
				}
			}, this)
		}).addStyleClass("compVHTokensDiv");

		// this "remove all" button is a workaround and should be part of the Tokenizer itself
		this._oRemoveAllExcludeItemsBtn = new sap.m.Button({
			type: sap.m.ButtonType.Transparent,
			icon: sap.ui.core.IconPool.getIconURI("sys-cancel"),
			tooltip: this._oRb.getText("VALUEHELPVALDLG_REMOVETOKENS_TOOLTIP"),
			press: jQuery.proxy( function() {
				this._oExcludedTokens.removeAllTokens();
	
				for ( var sKey in this._oSelectedRanges) {
					this._removeRangeByKey(sKey, true);
				}
				this._updateTitles();
				this._onResize();
			}, this)
		}).addStyleClass("compVHRemoveAllBtn");
	
		var oHContainer2 = new sap.ui.layout.HorizontalLayout({
			content: [
				this._oExcludedTokens, this._oRemoveAllExcludeItemsBtn
			]
		}).addStyleClass("compVHTokenizerHLayout");
	
		this._oExcludeTokenGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 0,
			vSpacing: 0,
			content: [
				this._oExcludedTokenTitle, oHContainer2
			]
		});
	
		// only on tablet and desktop we use the expandable panel
		this._oTokenizerPanel = new sap.m.Panel({
			expanded: sap.ui.Device.system.desktop,
			expandable: true, //this._isPhone() ? false : true,
			expandAnimation: true,
			headerText: "",
			width: "auto",
			content: [this._oIncludeTokenGrid, this._oExcludeTokenGrid],
			expand: jQuery.proxy(function (oEvent) { 
				this._updateTokenizer();

				var that = this;
				setTimeout(function() {
					that._onResize();
				}, 100);
				
				if (oEvent.mParameters.expand && !(this._oTable instanceof sap.m.Table)) {
					// when we open the tokens scroll the dialog content to the end
					var sId = "#" + this.getId() + "-scrollCont";
					var oScrollDiv = this.$().find(sId); 
					if (oScrollDiv && oScrollDiv.scrollTop) {
						oScrollDiv.stop().animate({
							  scrollTop: "1000" //oScrollDiv.prop("scrollHeight") - oScrollDiv.height()
						}, 1000);
					}
				}
			}, this)
		}).addStyleClass("compVHBackgroundTransparent").addStyleClass("compVHTokensPanel");
	
		if (this._isPhone()) {
			//workaround to get a vertical layout of the Tokens in the tokenizer 
			this._oSelectedTokens.addStyleClass("sapMTokenizerMultiLine");
			this._oExcludedTokens.addStyleClass("sapMTokenizerMultiLine");
		}
		
		this._oTokenizerGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			hSpacing: 0,
			vSpacing: 0,
			content: this._oTokenizerPanel
		}).addStyleClass("compVHDarkBackground");
		
		return this._oTokenizerGrid;
	};
	
	/**
	 * Add/Modify a token in a tokenizer control.
	 * 
	 * @private
	 * @param {string} sKey of the token
	 * @param {string} sText the token text
	 * @param {sap.m.Tokenizer} oTokenizer the Tokenizer which contain the token
	 */
	ValueHelpDialog.prototype._addToken2Tokenizer = function(sKey, sText, oTokenizer) {
		var token = this._getTokenByKey(sKey, oTokenizer);

		var sTooltip = (typeof sText === "string") ? sText : "";
		
		if (token) {
			// update existing token
			token.setText(sText);
			token.setTooltip(sTooltip);
		} else {
			// create a new token
			oTokenizer.addToken(new Token({
				key: sKey,
				text: sText,
				tooltip: sTooltip
			}));
			this._updateTokenizer();
		}
	};
	
	/**
	 * Search a token by key in the given tokenizer.
	 * 
	 * @private
	 * @param {string} sKey of the token
	 * @param {sap.m.Tokenizer} oTokenizer the Tokenizer which contain the token
	 * @returns {sap.m.Token} the found token instance or null
	 */
	ValueHelpDialog.prototype._getTokenByKey = function(sKey, oTokenizer) {
		var aTokens = oTokenizer.getTokens();
		for (var i = 0; i < aTokens.length; i++) {
			var token = aTokens[i];
			if (token.getKey() === sKey) {
				return token;
			}
		}
		return null;
	};
	
	/**
	 * Removes a token from the selected or excluded tokenizer.
	 * 
	 * @private
	 * @param {string} sKey of the token
	 */
	ValueHelpDialog.prototype._removeToken = function(sKey) {
		if (!this._removeTokenFromTokenizer(sKey, this._oSelectedTokens)) {
			this._removeTokenFromTokenizer(sKey, this._oExcludedTokens);
		}
	};
	
	/**
	 * Removes a token from a tokenizer.
	 * 
	 * @private
	 * @param {string} sKey of the token
	 * @param {sap.m.Tokenizer} oTokenizer the Tokenizer which contain the token
	 * @returns {boolean} true when the token hase been foudna removed, else false
	 */
	ValueHelpDialog.prototype._removeTokenFromTokenizer = function(sKey, oTokenizer) {
		var token = this._getTokenByKey(sKey, oTokenizer);
		if (token) {
			this._ignoreRemoveToken = true;
			oTokenizer.removeToken(token);
			this._ignoreRemoveToken = false;
			this._updateTokenizer();
			return true;
		}
		return false;
	};
	
	/**
	 * Updating the tokenizer title and RemoveAll buttons. 
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._updateTokenizer = function() {
		var bExpanded = false;
		if (this._oTokenizerPanel) {
			bExpanded = this._oTokenizerPanel.getExpanded();
			this._oSelectedTokenTitle.setVisible(false);
		}
		
		var n1 = this._oSelectedTokens.getTokens().length;
		var n2 = this._oExcludedTokens.getTokens().length;

		var sSelectedItemsTitle = this._oRb.getText("VALUEHELPDLG_SELECTEDITEMS");
		var sNoneSelectedItemsTitle = this._oRb.getText("VALUEHELPDLG_NONESELECTEDITEMS");

		var sSelectedItemsText = sSelectedItemsTitle.replace("{0}", n1.toString());
		var sExcludedItemsText = this._oRb.getText("VALUEHELPDLG_EXCLUDEDITEMS", n2.toString());
		var sText = n1 === 0 ? sNoneSelectedItemsTitle : sSelectedItemsText;
		
		if (this._oTokenizerPanel) {
			if (!bExpanded) {
				if (this._isPhone()) { 
					sSelectedItemsText = this._oRb.getText("VALUEHELPDLG_SELECTEDITEMS_SHORT", n1.toString());
					sExcludedItemsText = this._oRb.getText("VALUEHELPDLG_EXCLUDEDITEMS_SHORT", n2.toString());
				}
				sText = "";
				if (n1 !== 0) { sText = sSelectedItemsText; }  
				if (n2 !== 0) { sText += (n1 !== 0 ? " / " : "") + sExcludedItemsText; }
				if (sText === "") { sText = sNoneSelectedItemsTitle; }
			} else {
				if (n1 === 0 && n2 !== 0) { 
					sText = sExcludedItemsText;
					sExcludedItemsText = "";
				}
			}
			this._oTokenizerPanel.setHeaderText(sText);
		} else {
			this._oSelectedTokenTitle.setText(sText);
		}
		this._oRemoveAllSelectedItemsBtn.setEnabled(n1 !== 0);
	
		this._oExcludedTokenTitle.setText(sExcludedItemsText);
	
		
		if (n1 === 0 && n2 !== 0) {
			// hide all when only exclude items exist 
			this._oIncludeTokenGrid.addStyleClass("displayNone");
			if (!this._isPhone()) {
				this._oExcludedTokenTitle.addStyleClass("displayNone");
			}
		}else {
			this._oIncludeTokenGrid.removeStyleClass("displayNone");
			this._oExcludedTokenTitle.removeStyleClass("displayNone");
		}
		
		if (n2 === 0) {
			this._oExcludeTokenGrid.addStyleClass("displayNone");
		} else {
			this._oExcludeTokenGrid.removeStyleClass("displayNone");
		}
	};
	
	
	/**
	 * Create the TabBar or on Phone the ListItems as navigation control.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._createNavigationControl = function() {
		if (!this._isPhone()) {
			this._oTabBar = new sap.m.IconTabBar({
				upperCase: true,
				expandable: false,
				items: [
					new sap.m.IconTabFilter({
						visible: true,
						text: this._oRb.getText("VALUEHELPDLG_ITEMSTABLE"),
						key: sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW
					}),
					new sap.m.IconTabFilter({
						visible: true,
						text: this._oRb.getText("VALUEHELPDLG_RANGES"),
						key: sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW
					})
				],
				select: jQuery.proxy( function(oControlEvent) {
					this._updateView(oControlEvent.getParameters().key);
				}, this)
			});
	
			this._oTabBar.setLayoutData(new sap.m.FlexItemData({
				shrinkFactor: 0
			}));
			this._oVBox.addItem(this._oTabBar);

		} else {
		
			this._oSelectItemLI = new sap.m.StandardListItem({
				type: sap.m.ListType.Navigation,
			    title: this._oRb.getText("VALUEHELPDLG_ITEMSTABLE")
			}).data("key", sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW);
			
			this._oDefineConditionsLI = new sap.m.StandardListItem({
				type: sap.m.ListType.Navigation,
				title: this._oRb.getText("VALUEHELPDLG_RANGES")
			}).data("key", sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_CONDITIONS_VIEW);
			
			this._oMainListMenu = new sap.m.List({
				mode: sap.m.ListMode.None,
				items: [this._oSelectItemLI, this._oDefineConditionsLI],
				itemPress:  jQuery.proxy( function(oEvent) {
					if (oEvent) {
						this._updateView(oEvent.mParameters.listItem.data("key"));
					}
				}, this)
			});
			
			this._oMainListMenu.setLayoutData(new sap.m.FlexItemData({
				shrinkFactor: 0
			}));
			this._oVBox.addItem(this._oMainListMenu);

			
			this._oAdvancedSearchLink = new sap.m.Link(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_SEARCH_VIEW, {
				text: this._oRb.getText("VALUEHELPDLG_ADVANCEDSEARCH"),
				press: jQuery.proxy(function() { 
					this._updateView(sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_SEARCH_VIEW); 
				}, this)
			}).addStyleClass("compVHAdvancedSearchLink");
			
			this._oAdvancedSearchLink.setLayoutData(new sap.m.FlexItemData({
				shrinkFactor: 0
			}));
			this._oVBox.addItem(this._oAdvancedSearchLink);
		}
	};
	
	
	/**
	 * Update the TabBar or on Phone the Listitems.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._updateNavigationControl = function() {
		var bListTabVisible = !this.getSupportRangesOnly();
		var bRangesTabVisible = this.getSupportRangesOnly() || this.getSupportRanges();

		if (this._oTabBar) {
			
			var aTabItems = this._oTabBar.getItems();
			aTabItems[0].setVisible(bListTabVisible );
			aTabItems[1].setVisible(bRangesTabVisible);

			this._oTabBar.setVisible(bListTabVisible && bRangesTabVisible);
			this._updateDlgTitle();
		}
		
		if (this._oMainListMenu) {
			this._oSelectItemLI.setVisible(bListTabVisible);
			this._oDefineConditionsLI.setVisible(bRangesTabVisible);
		}
		
	};
	

	
	/**
	 * Remove a single range from the UI and the internal selectedRanges list.
	 * 
	 * @private
	 * @param {string} sKey the key of the range
	 * @param {boolean} isExclude specifies if the removed range must be an included or excluded range
	 */
	ValueHelpDialog.prototype._removeRangeByKey = function(sKey, isExclude) {
		var range = this._oSelectedRanges[sKey];
		if (range.exclude === isExclude) {
			if (!range._oGrid) {
				delete this._oSelectedRanges[sKey];
				
				if (this._oFilterPanel) {
					if (range.exclude) {
						this._oFilterPanel._oExcludeFilterPanel.removeCondition(sKey);
					} else {
						this._oFilterPanel._oIncludeFilterPanel.removeCondition(sKey);
					}
				}
			}
		}
	};
	
	
	// ################################################################################
	// Start Ranges handling
	// ################################################################################
	
	/**
	 * Create and returns the ranges grid
	 * 
	 * @private
	 * @returns {sap.ui.layout.Grid} the ranges grid
	 */
	ValueHelpDialog.prototype._getRanges = function() {
		if (!this._oRanges) {
			this._oRanges = this._createRanges();
		}
		return this._oRanges;
	};
	
	/**
	 * Create a new instance of ranges grid with all inner controls.
	 * 
	 * @private
	 * @returns {sap.ui.layout.Grid} the ranges grid
	 */
	ValueHelpDialog.prototype._createRanges = function() {

		jQuery.sap.require("sap.m.P13nConditionPanel");
		jQuery.sap.require("sap.m.P13nFilterPanel");
	
		this._oFilterPanel = new sap.m.P13nFilterPanel({
			maxIncludes: this.getMaxIncludeRanges(),
			maxExcludes: this.getMaxExcludeRanges(),
			containerQuery: true,
			addFilterItem: jQuery.proxy(function(oEvent) {
				// sap.m.MessageToast.show("AddFilterItem");
	
				var params = oEvent.mParameters;
				var oRange = {
					exclude: params.filterItemData.getExclude(),
					keyField: params.filterItemData.getColumnKey(),
					operation: params.filterItemData.getOperation(),
					value1: params.filterItemData.getValue1(),
					value2: params.filterItemData.getValue2()
				};
				this._oSelectedRanges[params.key] = oRange;
	
				// the new added filterItemData instance must be passed back into the filterpanel aggregation, otherwise the index of the add, update or remove events is not correct. 
				this._oFilterPanel.addFilterItem(params.filterItemData);
	
				var sTokenText = this._getFormatedRangeTokenText(oRange.operation, oRange.value1, oRange.value2, oRange.exclude, oRange.keyField);
				this._addToken2Tokenizer(params.key, sTokenText, oRange.exclude ? this._oExcludedTokens : this._oSelectedTokens);
				this._updateTokenizer();
			}, this),
			removeFilterItem: jQuery.proxy(function(oEvent) {
				// sap.m.MessageToast.show("RemoveFilterItem");
	
				var params = oEvent.mParameters;
				delete this._oSelectedRanges[params.key];
				this._removeToken(params.key);
				this._updateTokenizer();
			}, this),
			updateFilterItem: jQuery.proxy(function(oEvent) {
				// sap.m.MessageToast.show("UpdateFilterItem");
	
				var params = oEvent.mParameters;
				var oRange = this._oSelectedRanges[params.key];
				oRange.exclude = params.filterItemData.getExclude();
				oRange.keyField = params.filterItemData.getColumnKey();
				oRange.operation = params.filterItemData.getOperation();
				oRange.value1 = params.filterItemData.getValue1();
				oRange.value2 = params.filterItemData.getValue2();
				
				var sTokenText = this._getFormatedRangeTokenText(oRange.operation, oRange.value1, oRange.value2, oRange.exclude, oRange.keyField);
				this._addToken2Tokenizer(params.key, sTokenText, oRange.exclude ? this._oExcludedTokens : this._oSelectedTokens);
				this._updateTokenizer();
			}, this)
		});
	
		if (this._aIncludeRangeOperations) {
			this._oFilterPanel.setIncludeOperations(this._aIncludeRangeOperations);
		}
		if (this._aExcludeRangeOperations) {
			this._oFilterPanel.setExcludeOperations(this._aExcludeRangeOperations);
		}
	
		// this._oFilterPanel.setKeyFields([{key: "KeyField1", text: "Field1"}, {key: "KeyField2", text: "Field2", type : "date", isDefault: true}]);
		if (this._aRangeKeyFields) {
			this._aRangeKeyFields.forEach( function(item) {
				this._oFilterPanel.addItem(new sap.m.P13nItem({
					columnKey: item.key,
					text: item.label,
					type: item.type,
					maxLength: item.maxLength,
					scale: item.scale,
					precision: item.precision,
					isDefault: item.isDefault
				}));
			}, this);
		}

		if (this._oSelectedRanges) {
			for ( var rangeId in this._oSelectedRanges) {
				var rangeData = this._oSelectedRanges[rangeId];
				this._oFilterPanel.addFilterItem(new sap.m.P13nFilterItem({
					key: rangeId,
					exclude: rangeData.exclude,
					columnKey: rangeData.keyField,
					operation: rangeData.operation,
					value1: rangeData.value1,
					value2: rangeData.value2
				}));
			}
		}
		
		var oRangeFieldsGrid = new sap.ui.layout.Grid({
			width: "100%",
			defaultSpan: "L12 M12 S12",
			vSpacing: 0,
			hSpacing: 0,
			content: [
				this._oFilterPanel
			]
		});
	
		this._sValidationDialogTitle = this._oRb.getText("VALUEHELPVALDLG_TITLE");
		this._sValidationDialogMessage = this._oRb.getText("VALUEHELPVALDLG_MESSAGE");
		this._sValidationDialogFieldMessage = this._oRb.getText("VALUEHELPVALDLG_FIELDMESSAGE");
	
		return oRangeFieldsGrid;
	};
	
	/**
	 * Check if the entered/modified ranges are correct, marks invalid fields yellow (Warning state) and opens a popup message dialog to give the user the
	 * feedback that some values are wrong or missing.
	 * 
	 * @private
	 * @params {function} fnCallback which we call when all ranges are valid or the user ignores the wrong/missing fields by pressing Ok on a message
	 *         dialog
	 */
	ValueHelpDialog.prototype._validateRanges = function(fnCallback, fnCancelCallback) {
		if (this._oRanges && this._oTabBar && this._oTabBar.getSelectedKey() !== sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW) {
	
			// show warnings on invalid fields.
			var bIsIncludeRangesValid = this._oFilterPanel.validateConditions();
	
			if (!bIsIncludeRangesValid) {
				// open a simple confirm box
				MessageBox.show(this._sValidationDialogMessage, {
					icon: MessageBox.Icon.WARNING,
					title: this._sValidationDialogTitle,
					actions: [
						MessageBox.Action.OK, MessageBox.Action.CANCEL
					],
					styleClass: !!this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : "",
					onClose: function(sResult) {
						if (sResult === MessageBox.Action.OK && fnCallback) {
							fnCallback();
						}
						if (sResult === MessageBox.Action.CANCEL && fnCancelCallback) {
							fnCancelCallback();
						}
					}
				});
				return;
			}
	
		}
	
		fnCallback();
	};
	
	// ################################################################################
	// Start Selected Items handling
	// ################################################################################
	
	/**
	 * Setter for the singleRowCallback function.
	 * 
	 * @private
	 * @deprecated
	 * @since 1.30
	 */
	ValueHelpDialog.prototype.setUpdateSingleRowCallback = function(fSingleRowCallback) {
		this.fSingleRowCallback = fSingleRowCallback;
	
		this._updateNavigationControl();
	};
	
	
	// ################################################################################
	// Start main Table handling
	// ################################################################################
	
	ValueHelpDialog.prototype._createDefaultTable = function() {
		this._bTableCreatedInternal = true;
		
		if (!this._isPhone()) {
			sap.ui.getCore().loadLibrary("sap.ui.table");
			jQuery.sap.require("sap.ui.table.Table");
			
			this.setTable( new sap.ui.table.Table());
		} else {
			this.setTable( new sap.m.Table());
			this.TableStateSearchData();
		}
	};
	
	/**
	 * initialize the table instance
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._initializeTable = function() {
		
		if (sap.ui.table.Table && this._oTable instanceof sap.ui.table.Table) {
			
			this._oTable.setTitle( sap.ui.Device.system.desktop ? this._sTableTitleNoCount : null);
			if (this._bTableCreatedInternal) {
				this._oTable.setSelectionBehavior( sap.ui.table.SelectionBehavior.Row);
			}
			this._oTable.setSelectionMode( this.getSupportMultiselect() ? sap.ui.table.SelectionMode.MultiToggle : sap.ui.table.SelectionMode.Single);
			this._oTable.setNoDataText( this._oRb.getText("VALUEHELPDLG_TABLE_PRESSSEARCH"));
			this._oTable.setVisibleRowCountMode( sap.ui.table.VisibleRowCountMode.Auto);
			this._oTable.setMinAutoRowCount( sap.ui.Device.system.desktop ? 5 : 4);
			
			this._oTable.attachRowSelectionChange( jQuery.proxy(function(oControlEvent) {
				if (this._bIgnoreSelectionChange) {
					return;
				}

				var eventArgs = {
					tableSelectionParams: oControlEvent.mParameters,
					updateTokens: [], //[{sKey, oRow, bSelect}, {}],
					useDefault: false
				};
				
				if (this._hasListeners("selectionChange")) {
					this._bIgnoreSelectionChange = true;
					this.fireSelectionChange(eventArgs);
					this._bIgnoreSelectionChange = false;
					
//					if (eventArgs.useDefault) {
//						sap.m.MessageToast.show("useDefault");
//					}
					
					eventArgs.updateTokens.forEach(jQuery.proxy( function(currentValue) {
						this._addRemoveTokenByKey(currentValue.sKey, currentValue.oRow, currentValue.bSelected);						
					}, this));
					
				} else {
					eventArgs.useDefault = true;
				}
				
				if (eventArgs.useDefault) {
					// collect all the new selected or removed items
					var oTable = oControlEvent.getSource();
					var aIndices = oControlEvent.getParameter("rowIndices");
					var i, n = aIndices.length;
					var index;
					var oContext;
					var oRow;
		
					// check if we can select all items, if not we show an error dialog
					for (i = 0; i < n; i++) {
						index = aIndices[i];
						oContext = oTable.getContextByIndex(index);
						oRow = oContext ? oContext.getObject() : null;
		
						if (!oRow) {
							MessageBox.show(this._oRb.getText("VALUEHELPDLG_SELECTIONFAILED"), {
								icon: MessageBox.Icon.ERROR,
								title: this._oRb.getText("VALUEHELPDLG_SELECTIONFAILEDTITLE"),
								actions: [
									MessageBox.Action.OK
								],
								styleClass: !!this.$().closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : ""
							});
							return;
						}
					}
		
					var bUsePath = false;
					if (oTable.getBinding("rows").aKeys) {
						bUsePath = true;
					}
		
					for (i = 0; i < n; i++) {
						index = aIndices[i];
						oContext = oTable.getContextByIndex(index);
						oRow = oContext ? oContext.getObject() : null;
		
						if (oRow) {
							var sKey;
							if (bUsePath) {
								sKey = oContext.sPath.substring(1);
							} else {
								sKey = oRow[this.getKey()];
							}
		
							this._addRemoveTokenByKey(sKey, oRow, oTable.isIndexSelected(index));
						}
					}
				}
				
				this._updateTitles();
	
				if (!this.getSupportMultiselect()) {
					// in case of single select we fireOk
					this._onCloseAndTakeOverValues();
				}
			}, this));
			
			this._oTable.addStyleClass("compVHMainTable");
		
			if (!(this._oTable.getParent() instanceof sap.ui.comp.smarttable.SmartTable)) { // && !(this._oTable instanceof sap.ui.table.AnalyticalTable) && !(this._oTable instanceof sap.ui.table.TreeTable)) {
				this._oTable.bindAggregation("columns", "columns>/cols", jQuery.proxy( function(sId, oContext) {
					var ctrl, oTooltip;
			
					// Tooltip is only possible for certain (string) fields
					// ignore it for all types other than string!
					if (oContext.getProperty("type") === "string") {
						oTooltip = {
							path: oContext.getProperty("template")
						};
					}
			
					if (oContext.getProperty("type") === "boolean") {
						ctrl = new sap.m.CheckBox({
							enabled: false,
							selected: {
								path: oContext.getProperty("template")
							}
						});
					} else {
						ctrl = new sap.m.Text({
							wrapping: false,
							text: {
								path: oContext.getProperty("template"),
								type: oContext.getProperty("oType")
							},
							tooltip: oTooltip
						});
					}
			
					if (this._oTable instanceof sap.ui.table.AnalyticalTable) {
						return new sap.ui.table.AnalyticalColumn(sId, {
							label: "{columns>label}",
							tooltip: "{columns>label}",
							template: ctrl,
							width: "{columns>width}",
							hAlign: ctrl instanceof sap.m.CheckBox ? sap.ui.core.HorizontalAlign.Center : sap.ui.core.HorizontalAlign.Begin,
							filterProperty: oContext.getProperty("filter")
						});
						
					} else {
						return new sap.ui.table.Column(sId, {
							label: "{columns>label}",
							tooltip: "{columns>label}",
							template: ctrl,
							width: "{columns>width}",
							hAlign: ctrl instanceof sap.m.CheckBox ? sap.ui.core.HorizontalAlign.Center : sap.ui.core.HorizontalAlign.Begin,
							// sorting is removed at the moment
							// sortProperty: oContext.getProperty("sort"),
							// sorted: oContext.getProperty("sorted"),
							filterProperty: oContext.getProperty("filter")
						});
					}
				}, this));
			}
		} else {
			
			this._oTable.setMode(this.getSupportMultiselect() ? sap.m.ListMode.MultiSelect : sap.m.ListMode.SingleSelectLeft);
			this._oTable.setGrowing(true);
			
			this._oTable.attachSelectionChange( jQuery.proxy(function(oControlEvent) {
				if (this._bIgnoreSelectionChange) {
					return;
				}

				var eventParams = oControlEvent.mParameters;

				var eventArgs = {
					tableSelectionParams: oControlEvent.mParameters,
					updateTokens: [], //[{sKey, oRow, bSelect}, {}],
					useDefault: false
				};

				if (this._hasListeners("selectionChange")) {
					this._bIgnoreSelectionChange = true;
					this.fireSelectionChange(eventArgs);
					this._bIgnoreSelectionChange = false;
					
//					if (eventArgs.useDefault) {
//						sap.m.MessageToast.show("useDefault");
//					}
					
					eventArgs.updateTokens.forEach(jQuery.proxy( function(currentValue) {
						this._addRemoveTokenByKey(currentValue.sKey, currentValue.oRow, currentValue.bSelected);						
					}, this));
									
				} else {
					eventArgs.useDefault = true;
				}
				
				if (eventArgs.useDefault) {
					var bSelected = eventParams.selected;
					var i, n = eventParams.listItems.length;

					for (i = 0; i < n; i++) {					
						var oColListItem = eventParams.listItems[i];
						var oContext = oColListItem.getBindingContext();
						var oRow = oContext ? oContext.getObject() : null;
						
						if (oRow) {
							var sKey = oRow[this.getKey()];
							this._addRemoveTokenByKey(sKey, oRow, bSelected);
						}					
					}
				}
			
				if (!this.getSupportMultiselect()) {
					// in case of single select we fireOk
					this._onCloseAndTakeOverValues();
				}
			}, this));


			if (!(this._oTable.getParent() instanceof sap.ui.comp.smarttable.SmartTable)) {  //this._bTableCreatedInternal) {
				this._oTable.bindAggregation("columns", "columns>/cols", jQuery.proxy( function(sId, oContext) {
					var colLabel = oContext.getProperty("label");
					var bDemandPopin = this._oTable.getColumns().length >= 2;
					
					return new sap.m.Column({ 
						header: new sap.m.Label({ text: colLabel }), 
						demandPopin: bDemandPopin, 
						//popinDisplay: sap.m.PopinDisplay.Inline,
						minScreenWidth: bDemandPopin ? (this._oTable.getColumns().length + 1) * 10 + "rem" : "1px" 
					});
				}, this));
	
				
//				this._oTable.bindAggregation("items", "/", jQuery.proxy(function(sId, oContext) { 
//					var aCols = this._oTable.getModel("columns").getData().cols;
//				
//					return new sap.m.ColumnListItem({
//						cells: aCols.map(function (column) {
//							var colname = column.template;
//							return new sap.m.Label({ text: "{" + colname + "}" });
//						})
//					});
//				}, this));
			}
		}
	};

	
	ValueHelpDialog.prototype._addRemoveTokenByKey = function(sKey, oRow, bAdd) {
		if (bAdd) {
			this._oSelectedItems.add(sKey, oRow);
			this._addToken2Tokenizer(sKey, this._getFormatedTokenText(sKey), this._oSelectedTokens);
		} else {
			this._oSelectedItems.remove(sKey);
			this._removeTokenFromTokenizer(sKey, this._oSelectedTokens);
		}
	};
	
	
	/**
	 * Handler for the Ok close handling. The function prepares the list of all selected items and token and fires the Ok event.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._onCloseAndTakeOverValues = function() {
		var that = this;
	
		var fnCallback = function() {
			var range;
			var aTokens = that._oSelectedItems.getSelectedItemsTokenArray(that.getKey(), that.getDescriptionKey(), that.getTokenDisplayBehaviour());

			if (that._oSelectedRanges) {
				var i = 0;
				// if the user has changed the ranges we return the new ranges from the selectedRanges
				for ( var rangeId in that._oSelectedRanges) {
					range = that._oSelectedRanges[rangeId];
					var sTokenValue = range.tokenValue;
					if (!sTokenValue) {
						sTokenValue = that._getFormatedRangeTokenText(range.operation, range.value1, range.value2, range.exclude, range.keyField);
					}

					if (!range._oGrid || range._oGrid.select.getSelected()) {
						aTokens.push(new Token({
							key: "range_" + i,
							text: sTokenValue,
							tooltip: typeof sTokenValue === "string" ? sTokenValue : null  // Token text must be of type string
						}).data("range", {
							"exclude": range.exclude,
							"operation": range.operation,
							"keyField": range.keyField,
							"value1": range.value1,
							"value2": range.value2
						}));

						i++;
					}
				}
			}

			that.fireOk({
				"tokens": aTokens
			});
		};

		this._validateRanges(fnCallback);
	};
	
	/**
	 * Handler for the cancel button. The function fires the Cancel event.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._onCancel = function() {
		this.fireCancel();
	};

	/**
	 * Handler for the Go button. Go button is used on Phone Device and calls the search of the integrated filterbar
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._onGo = function() {
		this._oFilterBar.search();
	};

	/**
	 * Handler for the Clear button. Clear button is used on Phone Device and calls the clear of the integrated filterbar.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._onClear = function() {
		this._oFilterBar.clear();
	};
	
	/**
	 * Update all titles (table and tokenizer).
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._updateTitles = function() {
		this._updateTableTitle();
		this._updateTokenizer();
	};
	
	/**
	 * Update the dialog title.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._updateDlgTitle = function() {
		var sMsgKey = "";
		var sMsg;

		if (this._oTitle) {

			if (this._oTabBar && !this._oTabBar.getVisible() && !this.getFilterMode()) {
				// title handling on a normal dialog (on Dekstop and Tablet) when the tabBar is not visible
				if (this._oTabBar.getSelectedKey() === sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW) {
					sMsgKey = "VALUEHELPDLG_TITLE";
				} else { 
					if (this._oTabBar.getSelectedKey() === sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_CONDITIONS_VIEW) {
						if (this.getMaxIncludeRanges() === "1" && this.getMaxExcludeRanges() === "0") {
							sMsgKey = "VALUEHELPDLG_SINGLECONDITION_TITLE";
						} else {
							sMsgKey = "VALUEHELPDLG_RANGESTITLE";
						}
					}
				}

			} else {
				if (this._isPhone() && !this.getFilterMode()) {
					// on a phone we show the title which depends on the current viewmode
					switch (this._currentViewMode) {
						  case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_MAIN_VIEW:
							  sMsgKey = "";
							  break;
						  case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_LIST_VIEW:
							  sMsgKey = "VALUEHELPDLG_ITEMSTABLE";
							  break;
						  case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_SEARCH_VIEW:
							  sMsgKey = "VALUEHELPDLG_ADVANCEDSEARCH";
							  break;
						  case sap.ui.comp.valuehelpdialog._ValueHelpViewMode.PHONE_CONDITIONS_VIEW:
							  if (this.getMaxIncludeRanges() === "1" && this.getMaxExcludeRanges() === "0") {
								  sMsgKey = "VALUEHELPDLG_SINGLECONDITION_TITLE";
							  } else {
								  sMsgKey = "VALUEHELPDLG_RANGES";
							  }
							  break;
						  default:
							  break;
					}

				}
			}
			

			if (!sMsg)  {
				sMsg = this.getTitle();
			}

			if (sMsgKey)  {
				sMsg = this._oRb.getText(sMsgKey, sMsg);
			}

			if (sMsg)  {
				this._oTitle.setText(sMsg);
			}
		}
	};
	
	/**
	 * Update title of the main table.
	 * 
	 * @private
	 */
	ValueHelpDialog.prototype._updateTableTitle = function() {
		var length = 0;
		this.oRows = this._oTable.getBinding("rows");
		var bSupportCount = false; // at the moment we do not support the Items Count in the table header
		if (bSupportCount && this.getModel() && this.getModel().isCountSupported) {
			bSupportCount = this.getModel().isCountSupported();
		}
	
		if (bSupportCount) {
			if (this.oRows) {
				length = this.oRows.getLength();
			}
			this._setTableTitle(this._sTableTitle1.replace("{0}", length));
		} else {
			this._setTableTitle(this._sTableTitleNoCount);
		}
	};
	
	/**
	 * Setting the title of the table will remove the focus on a table cell. 
	 * Because of this we check if the Title control exist and set the Text of the title instead. 
	 */
	ValueHelpDialog.prototype._setTableTitle = function(sTitle) {
		if (sap.ui.Device.system.desktop && !(this._oTable instanceof sap.m.Table)) {
			if (this._oTable.getTitle()) {
				this._oTable.getTitle().setText(sTitle); 
			} else {
				this._oTable.setTitle(sTitle);
			}
		}
	};
	
	ValueHelpDialog.prototype.onAfterRendering = function() {
		Dialog.prototype.onAfterRendering.apply(this);
	
		if (this._oTable) {
			this._updateTitles();

			if (!this._isPhone() &&  this.getContentHeight() === "") {
				// if the content height is not set we fetch the current clientHeight from the ScrollContainer and set it as fixed height
				var oResizeDomRef = this.getDomRef("scroll");
				var _iResizeDomHeight = oResizeDomRef.clientHeight;
				this.setContentHeight(_iResizeDomHeight + "px");
			}
			
		}
		
		// Add resize handler for Table height update
		this._sContainerResizeListener = sap.ui.core.ResizeHandler.register(this._oMainGrid, jQuery.proxy(this._onResize, this));
		this._onResize();
	};
	
	ValueHelpDialog.prototype.onBeforeRendering = function() {
		Dialog.prototype.onBeforeRendering.apply(this);
		this._cleanup();
	};

	ValueHelpDialog.prototype._cleanup = function() {
		sap.ui.core.ResizeHandler.deregister(this._sContainerResizeListener);
		this._sContainerResizeListener = null;
	};
	
	
	// Overwriting the Dialog._getDialogOffset function. In our case we will return some other left and top margin values!
	ValueHelpDialog.prototype._getDialogOffset = function(windowWidth) {
		var iWindowWidth = windowWidth || this._$Window.width();
		var screenSizes = {
			small: 600,
			large: 1024
		};
		var remToPixelMargin = function (rem) {
			var iRemInPx = parseInt(window.getComputedStyle(document.body).fontSize, 10);
			return (rem * iRemInPx) * 2;
		};
		var rem = 1;
		
		if (iWindowWidth > screenSizes.small && iWindowWidth < screenSizes.large) {
			rem = 2;
		} else if (iWindowWidth >= screenSizes.large) {
			rem = 2;
		}

		return {
			top: remToPixelMargin(rem), 
			left: remToPixelMargin(rem) 
		};
	};

	
	ValueHelpDialog.prototype._onResize = function() {
		if (this._isPhone() || !this._oTabBar || this._oTabBar.getSelectedKey() !== sap.ui.comp.valuehelpdialog._ValueHelpViewMode.DESKTOP_LIST_VIEW) {
			// do nothing when we are on the Condition Tab
			return;
		}

		var maxH = this.getDomRef("scroll").clientHeight;
		
		var oVBox = this._oVBox.getDomRef();
		var iTabsHeight = oVBox.children[0].clientHeight; // height of Tabs
		var iTokensHeight = oVBox.children[2].children.length === 0 ? 0 : oVBox.children[2].children[0].clientHeight; // height of Tokens
		
		var oTableGrid = this._oTableGrid.getDomRef();
		
		if (oTableGrid.children[1]) {
			var iFilterBarHeight = oTableGrid.children[0].clientHeight;	// height of Filterbar
			var newH = maxH - iTabsHeight - iTokensHeight - iFilterBarHeight - 1;
			var minHeight = sap.ui.Device.system.desktop ? 360 : 270;
			newH = Math.max(newH, minHeight);
			//		if (window.console) {
			//			window.console.log(" newH ---> " + newH);
			//		}
			oTableGrid.children[1].style.height = newH + "px";
		}
	};
	
	ValueHelpDialog.prototype.fireAfterOpen = function(p) {
		Dialog.prototype.fireAfterOpen.apply(this);
	
		if (this._oTable) {
			// we have to rerender the table on the value help dialog when we open the dialog to avoid some table render layout problems.
			this._oTable.invalidate();
		}
	
		if (this.getSupportRangesOnly() || this.getFilterMode()) {
			var h = this._iResizeDomHeight;
			if (!(this.getMaxIncludeRanges() === "1" && this.getMaxExcludeRanges() === "0")) {
				h = Math.max(h, 200);
			}
			this.setContentHeight(h + "px");
			this.setContentWidth(this._iResizeDomWidth + "px");
		}
	};
	
	ValueHelpDialog.prototype.exit = function() {
	
		this._cleanup();

		var destroyHelper = function(o) {
			if (o && o.destroy) {
				o.destroy();
			}
			return null;
		};
	
		this._oTokenizerGrid = destroyHelper(this._oTokenizerGrid);
		this._oRanges = destroyHelper(this._oRanges);
		this._oFilterPanel = destroyHelper(this._oFilterPanel);
		if (this._bTableCreatedInternal) {
			this._oTable = destroyHelper(this._oTable);
		}
		this._oTable = null;
		this.theTable = null;

		this._oTabBar = destroyHelper(this._oTabBar);
		this._oMainListMenu = destroyHelper(this._oMainListMenu);
		this._oVBox = destroyHelper(this._oVBox);
		this._oVarManagment = destroyHelper(this._oVarManagment);
		
		this._aRangeKeyFields = destroyHelper(this._aRangeKeyFields);
		this._aIncludeRangeOperations = destroyHelper(this._aIncludeRangeOperations);
		this._aExcludeRangeOperations = destroyHelper(this._aExcludeRangeOperations);
	
		this._oFilterBar = destroyHelper(this._oFilterBar);
	
		this._oRb = destroyHelper(this._oRb);
		this._sTableTitle1 = destroyHelper(this._sTableTitle1);
		this._sTableTitle2 = destroyHelper(this._sTableTitle2);
		this._sTableTitleNoCount = destroyHelper(this._sTableTitleNoCount);
	
		this._sValidationDialogTitle = destroyHelper(this._sValidationDialogTitle);
		this._sValidationDialogMessage = destroyHelper(this._sValidationDialogMessage);
		this._sValidationDialogFieldMessage = destroyHelper(this._sValidationDialogFieldMessage);
	
		this._oSelectedItems = destroyHelper(this._oSelectedItems);
		this._oSelectedRanges = destroyHelper(this._oSelectedRanges);
		
		this._oButtonOk = destroyHelper(this._oButtonOk);	
		this._oButtonCancel = destroyHelper(this._oButtonCancel);
		if (this._oButtonGo) {
			this._oButtonGo = destroyHelper(this._oButtonGo);
		}
		if (this._oButtonClear) {
			this._oButtonClear = destroyHelper(this._oButtonClear);
		}
	};
	
	
	/**
	 * Sets a RangeKeyFields array.
	 * This method allows you to specify the KeyFields for the ranges. You can set an array of objects with Key and Label properties to define the key fields.
	 * 
	 * @public
	 * @since 1.24
	 * @param {object[]} aRangeKeyFields
	 * 					An array of range KeyFields <code>[{key: "CompanyCode", label: "ID"}, {key:"CompanyName", label : "Name"}]</code>
	 */
	ValueHelpDialog.prototype.setRangeKeyFields = function(aRangeKeyFields) {
		this._aRangeKeyFields = aRangeKeyFields;
	};
	
	ValueHelpDialog.prototype.getRangeKeyFields = function() {
		return this._aRangeKeyFields;
	};
	
	/**
	 * Sets the array for the supported include range operations.
	 * 
	 * @public
	 * @since 1.24
	 * @param {sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation[]} aOperation 
	 * 		An array of range operations
	 */
	ValueHelpDialog.prototype.setIncludeRangeOperations = function(aOperation) {
		this._aIncludeRangeOperations = aOperation;
	
		if (this._oFilterPanel) {
			this._oFilterPanel.setIncludeOperations(this._aIncludeRangeOperations);
		}
	};
	
	/**
	 * Sets the array for the supported exclude range operations.
	 * 
	 * @public
	 * @since 1.24
	 * @param {sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation[]} aOperation
	 * 		An array of range operations
	 */
	ValueHelpDialog.prototype.setExcludeRangeOperations = function(aOperation) {
		this._aExcludeRangeOperations = aOperation;
	
		if (this._oFilterPanel) {
			this._oFilterPanel.setExcludeOperations(this._aExcludeRangeOperations);
		}
	};
	
	/**
	 * Creates and returns the token text for the selected item.
	 * 
	 * @private
	 * @param {string} sKey the key of the selectedItems item
	 * @returns {string} the token text for the selected items with the sKey
	 */
	ValueHelpDialog.prototype._getFormatedTokenText = function(sKey) {
		var oItem = this._oSelectedItems.getItem(sKey);
		var sTokenText = oItem[this.getDescriptionKey()];
		var sDisplayKey = oItem[this.getKey()];
		if (sTokenText === undefined) {
			if (typeof oItem === "string") {
				sTokenText = oItem;
			} else {
				sTokenText = sKey;
			}
		} else {
			if (sTokenText === "") {
				sTokenText = sKey;
			} else {
				// format the token text 
				sTokenText = FormatUtil.getFormattedExpressionFromDisplayBehaviour(this.getTokenDisplayBehaviour() ? this.getTokenDisplayBehaviour() : sap.ui.comp.smartfilterbar.ControlConfiguration.DISPLAYBEHAVIOUR.descriptionAndId, sDisplayKey, sTokenText);
			}
		}
	
		return sTokenText;
	};
	
	/**
	 * Creates and returns the token text for a range.
	 * 
	 * @private
	 * @param {string} sOperation the operation type sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation
	 * @param {string} sValue1 text of the first range field
	 * @param {string} sValue2 text of the seoncd range field
	 * @param {boolean} bExclude indicates if the range is a Exclude range
	 * @param {string} sKeyField id
	 * @returns {string} the range token text
	 */
	ValueHelpDialog.prototype._getFormatedRangeTokenText = function(sOperation, sValue1, sValue2, bExclude, sKeyField) {
		var sTokenText = "";
		var oCurrentKeyField;
		var oFormatter;
		
		if (this._aRangeKeyFields) {
			// search the current KeyField 
			for (var i = 0; i < this._aRangeKeyFields.length; i++) {
				oCurrentKeyField = this._aRangeKeyFields[i];
				if (typeof oCurrentKeyField !== "string") {
					if (oCurrentKeyField.key === sKeyField) {
						break;
					}
				}
			}
		}
	
		if (oCurrentKeyField) {
			switch (oCurrentKeyField.type) {
				case "numeric":
					var oFloatFormatOptions;
					if (oCurrentKeyField.precision || oCurrentKeyField.scale) {
						oFloatFormatOptions = {};
						if (oCurrentKeyField.precision) {
							oFloatFormatOptions["maxIntegerDigits"] = parseInt(oCurrentKeyField.precision, 10);
						}
						if (oCurrentKeyField.scale) {
							oFloatFormatOptions["maxFractionDigits"] = parseInt(oCurrentKeyField.scale, 10);
						}
					}
					oFormatter = NumberFormat.getFloatInstance(oFloatFormatOptions);
					break;
				case "date":
					oFormatter = DateFormat.getDateInstance();
					sValue1 = new Date(sValue1);
					sValue2 = new Date(sValue2);					
					break;
			}
			
			if (oFormatter) {
				if (sValue1) {
					sValue1 = oFormatter.format(sValue1);
				}
				if (sValue2) {
					sValue2 = oFormatter.format(sValue2);
				}
			}
		}
		
		if (sValue1 !== "") {
			switch (sOperation) {
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Initial:
					sTokenText = "=''";
					break;
					
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ:
					sTokenText = "=" + sValue1;
					break;
					
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.GT:
					sTokenText = ">" + sValue1;
					break;
					
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.GE:
					sTokenText = ">=" + sValue1;
					break;
	
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.LT:
					sTokenText = "<" + sValue1;
					break;
	
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.LE:
					sTokenText = "<=" + sValue1;
					break;
	
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.Contains:
					sTokenText = "*" + sValue1 + "*";
					break;
	
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.StartsWith:
					sTokenText = sValue1 + "*";
					break;
	
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EndsWith:
					sTokenText = "*" + sValue1;
					break;
	
				case sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.BT:
					if (sValue2 !== "") {
						sTokenText = sValue1 + "..." + sValue2;
						break;
					}
			}
	
		}
	
		if (bExclude && sTokenText !== "") {
			sTokenText = "!(" + sTokenText + ")";
		}
	
		if (this._aRangeKeyFields && this._aRangeKeyFields.length > 1 && oCurrentKeyField && oCurrentKeyField.label && sTokenText !== "") {
			sTokenText = oCurrentKeyField.label + ": " + sTokenText;
		}
	
		return sTokenText;
	};
	
	ValueHelpDialog.prototype._isPhone = function() {
		return sap.ui.Device.system.phone;
	};
	
	ValueHelpDialog.prototype._hasListeners = function(sEventName) {
		if (this._bTableCreatedInternal) {
			return false;
		}
		
		return this.hasListeners(sEventName);
	};
	
	sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation = {
		BT: "BT",
		EQ: "EQ",
		Contains: "Contains",
		StartsWith: "StartsWith",
		EndsWith: "EndsWith",
		LT: "LT",
		LE: "LE",
		GT: "GT",
		GE: "GE",
		Initial: "Initial"
	};

	sap.ui.comp.valuehelpdialog._ValueHelpViewMode = {
		DESKTOP_LIST_VIEW: "DESKTOP_LIST_VIEW",
		DESKTOP_CONDITIONS_VIEW: "DESKTOP_CONDITIONS_VIEW",
		PHONE_MAIN_VIEW: "PHONE_MAIN_VIEW",
		PHONE_SEARCH_VIEW: "PHONE_SEARCH_VIEW",
		PHONE_LIST_VIEW: "PHONE_LIST_VIEW",
		PHONE_CONDITIONS_VIEW: "PHONE_CONDITIONS_VIEW"
	};

	return ValueHelpDialog;

}, /* bExport= */ true);
