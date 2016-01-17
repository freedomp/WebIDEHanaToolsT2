/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.filterbar.FilterBar.
sap.ui.define(['jquery.sap.global', 'sap/m/MultiInput', 'sap/m/ActionSheet', 'sap/m/Bar', 'sap/m/Button', 'sap/m/ButtonType', 'sap/m/CheckBox', 'sap/m/CustomListItem', 'sap/m/Dialog', 'sap/m/Label', 'sap/m/LabelDesign', 'sap/m/Link', 'sap/m/List', 'sap/m/ListSeparators', 'sap/m/ListType', 'sap/m/Panel', 'sap/m/PlacementType', 'sap/m/SearchField', 'sap/m/Text', 'sap/m/Toolbar', 'sap/m/ToolbarSpacer', 'sap/ui/Device', './VariantConverterFrom', './VariantConverterTo', 'sap/ui/comp/library', 'sap/ui/comp/smartvariants/PersonalizableInfo', 'sap/ui/comp/smartvariants/SmartVariantManagement', 'sap/ui/comp/smartvariants/SmartVariantManagementUi2', 'sap/ui/comp/variants/VariantManagement', 'sap/ui/core/Icon', 'sap/ui/core/TextAlign', 'sap/ui/core/Title', 'sap/ui/core/ValueState', 'sap/ui/layout/Grid', 'sap/ui/layout/GridData', 'sap/ui/layout/HorizontalLayout', 'sap/ui/layout/ResponsiveFlowLayout', 'sap/ui/layout/ResponsiveFlowLayoutData', 'sap/ui/layout/VerticalLayout', 'sap/ui/layout/form/Form', 'sap/ui/layout/form/FormContainer', 'sap/ui/layout/form/FormElement', 'sap/ui/layout/form/ResponsiveGridLayout', 'sap/ui/layout/form/FormRenderer'],
	function(jQuery, MultiInput, ActionSheet, Bar, Button, ButtonType, CheckBox, CustomListItem, Dialog, Label, LabelDesign, Link, List, ListSeparators, ListType, Panel, PlacementType, SearchField, Text, Toolbar, ToolbarSpacer, Device, VariantConverterFrom, VariantConverterTo, library, PersonalizableInfo, SmartVariantManagement, SmartVariantManagementUi2, VariantManagement, Icon, TextAlign, Title, ValueState, Grid, GridData, HorizontalLayout, ResponsiveFlowLayout, ResponsiveFlowLayoutData, VerticalLayout, Form, FormContainer, FormElement, ResponsiveGridLayout, FormRenderer) {
	"use strict";


	
	/**
	 * Constructor for a new FilterBar.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The control displays filters in a user-friendly manner to populate values for a query. The FilterBar consists of a row containing the {@link sap.ui.comp.variants.VariantManagement VariantManagement} control, the related buttons, 
	 * and an area underneath displaying the filters.
	 * The filters are arranged in a logical row that is divided depending on the space available and the width of the filters.
	 * The area containing the filters can be hidden or shown using the Hide Filter Bar / Show Filter Bar button. The Go button triggers the search event, and the Filters button shows the filter dialog.<br> 
	 * In this dialog, the consumer has full control over the filter bar.
	 * The filters in this dialog are displayed in one column and organized in groups. The filter items of the <code>filterItems</code> aggregation are grouped in the Basic group . 
	 * Each filter can be marked as visible in the filter bar by selecting Add to Filter Bar. In addition, the items in the <code>filterGroupItems</code> aggregation can be marked as part of the current variant.
	 * The FilterBar also supports a different UI layout when used inside a value help dialog. In this case the FilterBar consists of two logical areas, one containing the general search button and in the Advanced Search area.
	 * The Advanced Search is a collapsible area displaying the advanced filters in two columns.
	 * @extends sap.ui.layout.Grid
	 *
	 * @author Franz Mueller
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.filterbar.FilterBar
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) design-time meta model
	 */
	var FilterBar = Grid.extend("sap.ui.comp.filterbar.FilterBar", /** @lends sap.ui.comp.filterbar.FilterBar.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
	
			/**
			 * Key used to access personalization data.
			 */
			persistencyKey : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * The advanced mode overwrites the standard behavior and is used in the value help scenario.
			 */
			advancedMode : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Collapses/expands the advanced area.
			 * @deprecated Since version 1.30.0. Replaced by property <code>filterBarExpanded</code>
			 * This property is mapped to the filterBarExpanded property.
			 * @since 1.30.0
			 */
			expandAdvancedArea : {type : "boolean", group : "Misc", defaultValue : false, deprecated: true},
	
			/**
			 * Enables/disables the Search button.
			 * @deprecated Since version 1.32.0. 
			 */
			searchEnabled : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Shows/hides the filter row.
			 * @since 1.26.1
			 */
			filterBarExpanded : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * If this property is set, then the label for filters will be prefixed with the group title.
			 * @since 1.28.0
			 */
			considerGroupTitle : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Handles visibility of the Clear button on the Filters dialog.
			 * @since 1.26.1
			 */
			showClearButton : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Handles visibility of the Restore button on the Filters dialog.
			 * @since 1.26.1
			 */
			showRestoreButton : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Handles visibility of the Go button on the filter bar.
			 * @since 1.28.0
			 */
			showGoOnFB : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * Handles visibility of the Restore button on the filter bar.
			 * @since 1.28.0
			 */
			showRestoreOnFB : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Handles visibility of the Clear button on the filter bar.
			 * @since 1.28.0
			 */
			showClearOnFB : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Handles visibility of the Go button on the filter bar.
			 * @since 1.26.1
			 * @deprecated Since version 1.28.0. Replaced by property <code>showGoOnFB</code> 
			 */
			showGoButton : {type : "boolean", group : "Misc", defaultValue : null, deprecated: true}			
		},
		aggregations : {
	
			/**
			 * Filters belonging to the basic group.
			 */
			filterItems : {type : "sap.ui.comp.filterbar.FilterItem", multiple : true, singularName : "filterItem"}, 
	
			/**
			 * Filters belonging to groups other than the basic group.
			 */
			filterGroupItems : {type : "sap.ui.comp.filterbar.FilterGroupItem", multiple : true, singularName : "filterGroupItem"}			
		},
		associations : {		
			
			/**
			 * Populates the basic search area on the filter bar and the Filters dialog.
			 * @since 1.30.0			  
			 */
			basicSearch : {type : "sap.m.SearchField", multiple : false}
		},
		events : {

			/**
			 * This event is fired when the Cancel button on the Filters dialog is pressed and the variant is marked as dirty.
			 */
			cancel : {}, 
			
			/**
			 * This event is fired when the Restore button is pressed.
			 */
			reset : {
				parameters : {					
					/**
					 * Visible controls
					 */
					selectionSet : {type : "sap.ui.core.Control[]"}
				}				
			}, 
	
			/**
			 * This event is fired when the Go button is pressed.
			 */
			search : {
				parameters : {					
					/**
					 * Visible controls
					 */
					selectionSet : {type : "sap.ui.core.Control[]"}
				}					
			}, 

			/**
			 * This event is fired before a variant is saved. The event can be used to adapt the data of the custom filters, which will be saved as variant later.
			 */
			beforeVariantSave : {
				parameters : {					
					/**
					 * Context of the event. Can also be <code>null</code> or <code>undefined</code>
					 */
					context : {type : "string"}
				}					
			}, 
			
			/**
			 * This event is fired before a variant is fetched.
			 * @since 1.28.13			 
			 */
			beforeVariantFetch : {}, 		
	
			/**
			 * This event is fired after a variant has been loaded and applied to the FilterBar. The event can be used to adapt custom filters with data from the variant.
			 */
			afterVariantLoad : {
				parameters : {					
					/**
					 * Context of the event. Can also be <code>null</code> or <code>undefined</code>
					 */
					context : {type : "string"}
				}				
			}, 
	
			/**
			 * This event is fired when a filter has changed.
			 */
			filterChange : {}, 
	
			/**
			 * This event is fired when the Clear button is pressed. The consumer has to clear all filters.
			 */
			clear : {
				parameters : {					
					/**
					 * Visible controls
					 */
					selectionSet : {type : "sap.ui.core.Control[]"}
				}					
			}, 
	
			/**
			 * This event is fired when the filter bar is initialized.
			 */
			initialise : {}, 
	
			/**
			 * This event is fired after a variant has been saved. ID of the saved variant.
			 */
			afterVariantSave : {}
		}
	}});
	
	
	/**
	 * Resets the aggregation FilterItems.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#removeAllFilterItems
	 * @function
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Resets the aggregation FilterGroupItems.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#removeAllFilterGroupItems
	 * @function
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Returns filters of the FilterBar.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#getAllFilterItems
	 * @function
	 * @param {boolean} bConsiderOnlyVisibleFields If set to <code>true</code> only visible filters are returned 
	 * @type sap.ui.comp.filterbar.FilterItem[]
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Registration of a callback function. The provided callback function will be executed before a variant is saved and has to provide all relevant fields and values in JSON.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#registerFetchData
	 * @function
	 * @param {function} fCallBack Provided by the FilterBar consumer.  
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Registration of a callback function. The provided callback function is executed when a variant has to be applied. The callback function will receive the corresponding data set containing all relevant data in JSON.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#registerApplyData
	 * @function
	 * @param {function} fCallBack Provided by the FilterBar consumer.	 
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Registration of a callback function. The provided callback function is executed to obtain the filters with values.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#registerGetFiltersWithValues
	 * @function
	 * @param {function} fCallBack Provided by the FilterBar consumer
	 * @type sap.ui.comp.filterbar.FilterItem[]
	 * @public
	 * @since 1.26.1
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */	
	
	
	/**
	 * Returns the associated control for a filter item.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#determineControlByFilterItem
	 * @function
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem Filter from the aggregations 
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Returns the associated control based on the filter's name and optional group name.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#determineControlByName
	 * @function
	 * @param {string} sName Name of the filter
	 * @param {string} sGroupName Group name of the filter; <code>null</code> for filter that belong to basic group
	 * @type sap.ui.core.Control
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Resets the current variant management selection which is required for the navigation scenario.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#clearVariantSelection
	 * @function
	 * @type void
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
		
	
	/**
	 * Retrieves the mandatory filters.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#determineMandatoryFilterItems
	 * @function
	 * @type sap.ui.comp.filterbar.FilterItem[]
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Retrieves the current variant ID. For standard variant an empty string will be returned.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#getCurrentVariantId
	 * @function
	 * @type string
	 * @public
	 * @since 1.28.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Sets the current variant ID.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#setCurrentVariantId
	 * @function
	 * @param {string} sVariantId The variant key
	 * @param {boolean} bDoNotApplyVariant If set to <code>true</code>, the <code>applyVariant</code> method is not executed yet. Relevant during navigation, when called before the initialise event has been executed.
	 * @type void
	 * @public
	 * @since 1.28.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Retrieves the filter bar data as selection variant for UI navigation in JSON format.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#getDataSuiteFormat
	 * @function
	 * @param {boolean} bConsiderAllFilters If set to <code>false</code> only visible filters will be retrieved
	 * @type string
	 * @public
	 * @since 1.28.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	
	/**
	 * Sets the selection variant for UI navigation to filter bar.
	 *
	 * @name sap.ui.comp.filterbar.FilterBar#setDataSuiteFormat
	 * @function
	 * @param {string} sSuiteData Represents the selection variant for UI navigation
	 * @param {boolean} bReplace Indicates a clean-up before appliance
	 * @type void
	 * @public
	 * @since 1.28.0
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	
	FilterBar.INTERNAL_GROUP = "__$INTERNAL$";
	
	/**
	 * Initializes the FilterBar control.
	 * 
	 * @private
	 */
	FilterBar.prototype.init = function() {
	
		this._oBasicAreaLayout = null;
		this._oVariantManagement = null;
		this._oCollectiveSearch = null;		
	
		this._aBasicAreaSelection = null;
		this._mAdvancedAreaFilter = null;
	
		this._fRegisteredFetchData = null;
		this._fRegisteredApplyData = null;
		this._fRegisterGetFiltersWithValues = null;
		this._oHideShowButton = null;
		this._oSearchButton = null;
		this._oFiltersButton = null;
		this._oClearButtonOnFB = null;
		this._oRestoreButtonOnFB = null;
	
		this._oDialog = null;
		this._oFilterDialog = null;
		this._oActionSheet = null;
		
		this._oBasicSearchField = null;		
	
		this._oVariant = {};
	
		this._filterChangeSemaphore = true;
	
		this._fRegisteredFilterChangeHandlers = null;
		this._fInitialiseVariants = null;
	
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp");
	
		this.addStyleClass("sapUiCompFilterBar");
		if (this._isPhone()) {
			this.addStyleClass("sapUiCompFilterBarPhone");
		} else {
			this.addStyleClass("sapUiCompFilterBarNonPhone");
		}
	
		this.addStyleClass("sapUiCompFilterBarMarginBottom");
		this.addStyleClass("sapUiCompFilterBarPaddingPanel");
	
		this._oToolbar = this._createToolbar();
		this._oToolbar.setLayoutData(new GridData({
			span: "L12 M12 S12"
		}));
		this.addContent(this._oToolbar);
	
		// Basic
		this._oBasicAreaLayout = this._createBasicAreaLayout();
		this._oBasicAreaLayout.setLayoutData(new GridData({
			span: "L12 M12 S12"
		}));
		this.addContent(this._oBasicAreaLayout);
		
		// Advanced
		this._oAdvancedPanel = new Panel();
		this._oAdvancedPanel.setLayoutData(new GridData({
			span: "L12 M12 S12"
		}));
	
		//this._oAdvancedPanel.setExpandable(false);
	
		this._oAdvancedPanel.setVisible(false);
		this._oAdvancedAreaForm = this._createAdvancedAreaForm();
		this._oAdvancedPanel.addContent(this._oAdvancedAreaForm);
	
	
		this.addContent(this._oAdvancedPanel);		
		
		// register event handler for resizing
		jQuery(window).on("resize.basicsearch", jQuery.proxy(this._fHandleResize, this));
	
		this.oModel = new sap.ui.model.json.JSONModel({});
		this.setModel(this.oModel, "FilterBar");
	

		this.setFilterBarExpanded((this._isTablet() || this._isPhone()) ? false : this.getFilterBarExpanded());

	};
	
	/**
	 * Handles the visibility for the Clear button in the filter bar. On phone devices, the value is always treated as false.
	 * 
	 * @public
	 * @since 1.28.0
	 * @param {boolean} bFlag State of visibility
	 */
	FilterBar.prototype.setShowClearOnFB = function(bFlag) {
	
		if (!this._isPhone()) {
			this.setProperty("showClearOnFB", bFlag);
			this._oClearButtonOnFB.setVisible(bFlag);
		}
	};
	
	/**
	 * Handles the visibility of the Restore button in the filter bar. On phone devices, the value is always treated as false.
	 * 
	 * @public
	 * @since 1.28.0
	 * @param {boolean} bFlag State of visibility
	 */
	FilterBar.prototype.setShowRestoreOnFB = function(bFlag) {
	
		if (!this._isPhone()) {
			this.setProperty("showRestoreOnFB", bFlag);
			this._oRestoreButtonOnFB.setVisible(bFlag);
		}
	};
	
	/**
	 * Handles the visibility of the Go button on filter bar.
	 * 
	 * @public
	 * @since 1.28.0
	 * @param {boolean} bFlag State of visibility
	 */
	FilterBar.prototype.setShowGoOnFB = function(bFlag) {
	
		this.setProperty("showGoOnFB", bFlag);
	
		this._oSearchButton.setVisible(bFlag);
	};
	
	/**
	 * Handles the visibility for the Go button on filter bar. This property is deprecated, please use instead the property <code>showGoOnFB</code>.
	 * 
	 * @private
	 * @since 1.26.1
	 * @param {boolean} bFlag State of visibility
	 */
	FilterBar.prototype.setShowGoButton = function(bFlag) {

		this.setShowGoOnFB(bFlag);
	};
	
	/**
	 * Handles the visibility for the Go button on filter bar. This property is deprecated, please use instead the property <code>showGoOnFB</code>.
	 * 
	 * @private
	 * @since 1.26.1
	 * @returns {boolean} bFlag State of visibility 
	 */
	FilterBar.prototype.getShowGoButton = function() {

		return this.getShowGoOnFB();
	};
	
	/**
	 * Sets the current variant ID.
	 * 
	 * @public
	 * @since 1.28.0
	 * @param {string} sVariantId ID of the variant
	 * @param {boolean} bDoNotApplyVariant If set to <code>true</code>, the <code>applyVariant</code> method is not executed yet. Relevant during navigation, when called before the initialise event has been executed.	
	 */
	FilterBar.prototype.setCurrentVariantId = function(sVariantId, bDoNotApplyVariant) {

		if (this._oVariantManagement) {
			this._oVariantManagement.setCurrentVariantId(sVariantId, bDoNotApplyVariant);
		}
	};
	
	/**
	 * Retrieves the current variant ID.
	 * 
	 * @public
	 * @since 1.28.0
	 * @returns {string} ID of the current variant
	 */
	FilterBar.prototype.getCurrentVariantId = function() {

		var sKey = "";
	
		if (this._oVariantManagement) {
			sKey = this._oVariantManagement.getCurrentVariantId();
		}
	
		return sKey;
	};
	
	/**
	 * Retrieves the current variant as selection variant for UI navigation
	 * 
	 * @public
	 * @since 1.28.0
	 * @param {boolean} bConsiderAllFilters If set to <code>false</code> only visible filters are retrieved
	 * @returns {string} JSON string representing the selection variant for UI navigation; <code>null</code> otherwise
	 */
	FilterBar.prototype.getDataSuiteFormat = function(bConsiderAllFilters) {
	
		var sSuiteVariant = null;
		var sKey, sContent, aFiltersInfo;
	
		if (this._oVariantManagement) {
			sKey = this.getCurrentVariantId();
	
			if (this.getFilterDataAsString) {
				aFiltersInfo = this._determineVariantFiltersInfo(bConsiderAllFilters);
	
				sContent = this.getFilterDataAsString(bConsiderAllFilters);
				if (sContent) {
					var oConverter = new VariantConverterTo();
					sSuiteVariant = oConverter.convert(sKey, aFiltersInfo, sContent, this);
				}
			}
		}
	
		return sSuiteVariant;
	};
		
	
	/**
	 * Sets the selection variant for UI navigation to FilterBar.
	 * 
	 * @public
	 * @since 1.28.0
	 * @param {string} sSuiteData Represents the selection variants for UI navigation
	 * @param {boolean} bReplace Replaces existing filter data
	 */
	FilterBar.prototype.setDataSuiteFormat = function(sSuiteData, bReplace) {

		var oConverter, oContent;
		var bModified;
		
		if (sSuiteData) {

			oConverter = new VariantConverterFrom();
			oContent = oConverter.convert(sSuiteData, this);
			if (oContent) {

				bModified = this._getConsiderFilterChanges();				
				
				if (oContent.payload && this.setFilterDataAsString) {
					this._setConsiderFilterChanges(false);				
					this.setFilterDataAsString(oContent.payload, bReplace);			
				}			

				if (oContent.variantId && this._oVariantManagement) {
						this._oVariantManagement.setInitialSelectionKey(oContent.variantId);		
				}								
				
				this._setConsiderFilterChanges(bModified);					
			}			
		}
	};
	
	/**
	 * Sets the persistency key.
	 * 
	 * @public
	 * @param {string} sPersistenceKey ID for persistency
	 */
	FilterBar.prototype.setPersistencyKey = function(sPersistenceKey) {

		this.setProperty("persistencyKey", sPersistenceKey);
	
		if (this._oVariantManagement) {
			this._oVariantManagement.setVisible(true);
		}
	};
	
	/**
	 * Resets the current selection in the variant management control to standard. 
	 * 
	 * @public
	 */
	FilterBar.prototype.clearVariantSelection = function() {

		if (this._oVariantManagement) {
			this._oVariantManagement.clearVariantSelection();
		}
	};

	
	/**
	 * Enables/disables the Search button.
	 * @private
	 * 
	 * @param {boolean} bValue Sets the enable state of the Search button
	 */
	FilterBar.prototype.setSearchEnabled = function(bValue) {
		
		this.setProperty("searchEnabled", bValue);
	
		if (this._oSearchButton) {
			this._oSearchButton.setEnabled(bValue);
		}
	};
	FilterBar.prototype.getSearchEnabled = function() {
		return this.getProperty("searchEnabled");
	};

	/**
	 * Sets the type of the Search to Emphasize. 
	 * 
	 * @private
	 * @since 1.28
	 * @param {boolean} bSetEmphasize Sets the type to Emphasize or Default
	 */
	FilterBar.prototype.setSearchButtonEmphType = function(bSetEmphasize) {

	};
	
	/**
	 * Sets the simplified mode.	 
	 * 
	 * @param {boolean} bFlag Sets the simplified mode
	 * @private
	 */
	FilterBar.prototype.setSimplifiedMode = function(bFlag) {

		// the simplified mode is with beginning of 1.25 always implicitly used.
		// The former setter-method method stays in place, so that the former usages do not have to be adapted.
	};
	
	/**
	 * Retrieves the simplified mode. 
	 * @returns {boolean} Indicates if the current advanced mode is set
	 * @private
	 */
	FilterBar.prototype.getSimplifiedMode = function() {
	
		if (this.getAdvancedMode()) {
			return false;
		}
	
		return true;
	};
	
	/**
	 * Sets the advanced area to collapsed or expanded mode.
	 * 
	 * @private
	 * @param {boolean} bFlag Sets the advanced area to expanded/collapsed
	 */
	FilterBar.prototype.setExpandAdvancedArea = function(bFlag) {
		
		this.setFilterBarExpanded(bFlag);
	};
	
	/**
	 * Determines if the advanced area is displayed collapsed or expanded.
	 * 
	 * @private
	 * @returns {boolean} The state of the advanced area
	 */
	FilterBar.prototype.getExpandAdvancedArea = function() {
			
		return this.getFilterBarExpanded();
	};
			
	
	/**
	 * The advanced mode is only relevant for the value help scenario. UI representation is different from the standard filter bar. 
	 * 
	 * @public
	 * @param {boolean} bFlag Sets the advanced mode
	 */
	FilterBar.prototype.setAdvancedMode = function(bFlag) {
		
		this.setProperty("advancedMode", bFlag);
		
		if (bFlag) {		
			
			if (this._oVariantManagement) {
				this._oVariantManagement.setVisible(false);
			}
			
			if (this._oToolbar) {
				this._oToolbar.addStyleClass("sapUiCompFilterBarToolbarBasicSearchNoVariant");
			}
			
			if (this._oBasicSearchField) {
				if (this._oToolbar.indexOfContent(this._oBasicSearchField) < 0) {
					this._oToolbar.insertContent(this._oBasicSearchField, 1);
				}
			}			
			
		} else {
			/* eslint-disable no-lonely-if */			
			if (this.getPersistencyKey()) {
				if (this._oVariantManagement) {
					this._oVariantManagement.setVisible(true);
				}
				if (this._oToolbar) {
					this._oToolbar.removeStyleClass("sapUiCompFilterBarToolbarBasicSearchNoVariant");
				}				
			}
			/* eslint-enable no-lonely-if */			
		}		

		//this.setFilterBarExpanded((this._isTablet() || this._isPhone())? false : this.getFilterBarExpanded());		
		
		this._oFiltersButton.setVisible(!bFlag);	
		
		this._oHideShowButton.setVisible((bFlag && this._isPhone()) ? false : true);		
		
		this._oBasicAreaLayout.setVisible(!bFlag);
		this._oAdvancedPanel.setVisible(bFlag);		
	};
	
	
	FilterBar.prototype._setCollectiveSearch = function(oCollectiveSearch) {
		if (this.getAdvancedMode() && oCollectiveSearch) {
			if (this._oToolbar) {
				if (this._oVariantManagement) {
					this._oToolbar.removeContent(this._oVariantManagement);
					this._oVariantManagement = null;
				}
				
				if (this._oCollectiveSearch) {
					this._oToolbar.removeContent(this._oCollectiveSearch);
				}
				this._oCollectiveSearch = oCollectiveSearch;				
				this._oToolbar.insertContent(this._oCollectiveSearch, 0);
				
				this._oToolbar.removeStyleClass("sapUiCompFilterBarToolbarBasicSearchNoVariant");				
			}
		}	
	};
	
	/**
	 * Adds a basic search field to the toolbar. 
	 * 
	 * @public
	 * @param {sap.m.SearchField} oBasicSearchField Control
	 */
	FilterBar.prototype.setBasicSearch = function(oBasicSearchField) {
		this.setAssociation("basicSearch", oBasicSearchField, true);
				
		if (this._oBasicSearchField) {
			this._oToolbar.removeContent(this._oBasicSearchField);
		}
		
		if (oBasicSearchField && (!this._isPhone() || this.getAdvancedMode())) {		
			this._oToolbar.insertContent(oBasicSearchField, 1);
		}
		
		this._oBasicSearchField = oBasicSearchField;
	};
		
	
	/**
	 * Adds a <code>FilterItem</code> element to the aggregation <code>filterItems</code>.
	 * 
	 * @public
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem Belongs to the basic group
	 */
	FilterBar.prototype.addFilterItem = function(oFilterItem) {

		var sName, oControl, oFilterGroupItem;

		if (!oFilterItem) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterItem()" + " Expected argument 'oFilterItem' may not be null nor empty");
		}

		sName = oFilterItem.getName();
		if (!sName) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterItem()" + " Expected argument 'oFilterItem.name' may not be null nor empty");
		}

		oControl = oFilterItem.getControl();
		if (!oControl) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterItem()" + " Expected argument 'oFilterItem.control' may not be null nor empty");
		}

		this.addAggregation("filterItems", oFilterItem, true);

		// has to be initialized before the call to the container creation
		if (!this._aBasicAreaSelection) {
			this._aBasicAreaSelection = [];
		}

		var oObj = {
		            control: oFilterItem.getControl(),
		            filterItem: oFilterItem
		};
		this._aBasicAreaSelection.push(oObj);
		

		oFilterGroupItem = new sap.ui.comp.filterbar.FilterGroupItem({
			label: oFilterItem.getLabel(),
			labelTooltip: oFilterItem.getLabelTooltip(),
			name: oFilterItem.getName(),
			mandatory: oFilterItem.getMandatory(),
			visible: oFilterItem.getVisible(),
			visibleInFilterBar: oFilterItem.getVisibleInFilterBar(),
			partOfCurrentVariant: true,
			control: oFilterItem.getControl(),
			groupName: FilterBar.INTERNAL_GROUP,
			groupTitle: ""
		});

		if (oFilterItem.data('isCustomField')) {
			oFilterGroupItem.data('isCustomField', true);
		}

		oFilterItem.attachChange(this._filterItemChange.bind(this, null));

		this.addFilterGroupItem(oFilterGroupItem);

	};
	
	/**
	 * Adds a <code>FilterGroupItem</code> element to the aggregation <code>filterGroupItems</code>.
	 * 
	 * @public
	 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterGroupItem Belongs to any group other than basic
	 */
	FilterBar.prototype.addFilterGroupItem = function(oFilterGroupItem) {

		var sName, sGroupName, oObj, oContainer;
		
		if (!oFilterGroupItem) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterGroupItem()" + " Expected argument 'oFilterGroupItem' may not be null nor empty");
		}

		this.addAggregation("filterGroupItems", oFilterGroupItem, true);

		sGroupName = oFilterGroupItem.getGroupName();
		if (!sGroupName) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterGroupItems()" + " GroupName may not be null nor empty");
		}

		sName = oFilterGroupItem.getName();
		if (!sName) {
			throw new Error("sap.ui.comp.filterbar.FilterBar.prototype.addFilterGroupItems()" + " Name may not be null nor empty");
		}

		if (!this._mAdvancedAreaFilter) {
			this._mAdvancedAreaFilter = {};
		}
		if (!this._mAdvancedAreaFilter[sGroupName]) {
			this._mAdvancedAreaFilter[sGroupName] = {};
			this._mAdvancedAreaFilter[sGroupName].filterItem = oFilterGroupItem;
			this._mAdvancedAreaFilter[sGroupName].items = [];
		}

		oObj = { control: oFilterGroupItem.getControl(),
		         filterItem: oFilterGroupItem
		       };

		if (this.getAdvancedMode() || oFilterGroupItem.getVisibleInFilterBar()) {	
			oFilterGroupItem.setVisibleInFilterBar(true);
		} else {
			oFilterGroupItem.setVisibleInFilterBar(false);
		}

		this._mAdvancedAreaFilter[sGroupName].items.push(oObj);

		oContainer = this._addControlToBasicAreaFormContainer(oFilterGroupItem);
		if (oContainer) {
			oObj.container = oContainer;

			oContainer.setVisible(oFilterGroupItem.getVisible() && oFilterGroupItem.getVisibleInFilterBar());
			if (oFilterGroupItem.getVisibleInFilterBar()) {
				oFilterGroupItem.setPartOfCurrentVariant(oFilterGroupItem.getVisibleInFilterBar());
			}

			oFilterGroupItem.attachChange(this._filterGroupItemChange.bind(this));
		}

		if (this.getAdvancedMode()) {
			this._rerenderAA();
		}
	};
	
	/**
	 * Event-handler is called when the property of a filter item has changed.
	 * 
	 * @private
	 * @param {object} oContainer the container of the filter item's control and label
	 * @param {object} oEvent the event
	 */
	FilterBar.prototype._filterItemChange = function(oContainer, oEvent) {
	
		var oItem;
		var bFlag;
		var sPropertyName;		
			
		if (oEvent && oEvent.oSource && (oEvent.oSource instanceof sap.ui.comp.filterbar.FilterItem)) {
	
			sPropertyName = oEvent.getParameter("propertyName");
		
			if (sPropertyName === "visibleInFilterBar" || sPropertyName === "visible" || sPropertyName === "label" || sPropertyName === "mandatory") {
				oItem = this._determineItemByName(oEvent.oSource.getName(), FilterBar.INTERNAL_GROUP);
	
				if (oItem && oItem.filterItem) {
					if ((sPropertyName === "visible")) {
						bFlag = oEvent.oSource.getVisible();
						oItem.filterItem.setVisible(bFlag);
					} else if (sPropertyName === "visibleInFilterBar") {
						bFlag = oEvent.oSource.getVisibleInFilterBar();
						var bChangePossible = this._checkChangePossibleVisibleInFilterBar(oItem.filterItem, bFlag);
						if (bChangePossible) {
							oItem.filterItem.setVisibleInFilterBar(bFlag);
						} else {
							oEvent.oSource.setVisibleInFilterBar(true);
						}
	
					} else if (sPropertyName === "label") {
						oItem.filterItem.setLabel(oEvent.oSource.getLabel());
					} else if (sPropertyName === "mandatory") {
						bFlag = oEvent.oSource.getMandatory();
						oItem.filterItem.setMandatory(bFlag);
					}
				}
			}
		}
	};
	
	/**
	 * Event handler called when the property of a filter group item has changed.
	 * 
	 * @private
	 * @param {object} oEvent the event
	 */
	FilterBar.prototype._filterGroupItemChange = function(oEvent) {
	
		var oItem;
		var sPropertyName;
		
			
		if (oEvent && oEvent.oSource) {
			sPropertyName = oEvent.getParameter("propertyName");
							
			if (sPropertyName === "visibleInFilterBar" || sPropertyName === "visible") {
	
				oItem = this._determineItemByName(oEvent.oSource.getName(), oEvent.oSource.getGroupName());
				if (oItem) {
					if (sPropertyName === "visibleInFilterBar") {
						var bFlag = oEvent.oSource.getVisibleInFilterBar();
	
						var bChangePossible = this._checkChangePossibleVisibleInFilterBar(oEvent.oSource, bFlag);
						if (!bChangePossible) {
							oEvent.oSource.setVisibleInFilterBar(true);
							bFlag = true;
						}
	
						if (bFlag) {
							oEvent.oSource.setPartOfCurrentVariant(true);
						}
	
						if (!this.getAdvancedMode()) {
							this._rerenderItem(oItem);
							this._adaptLinkText(oEvent.oSource.getGroupName());
						}
	
					} else if (sPropertyName === "visible") {
						
						if (this.getAdvancedMode() && oItem.container) {
							oItem.container.setVisible(true);							
						} else {						
							this._updateToolbarText();
							this._rerenderGroup(oItem, oEvent.oSource.getGroupName());
						}
					}
				}
			} else if (sPropertyName === "groupTitle") {
				if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[oEvent.oSource.getGroupName()]) {
					if (this._mAdvancedAreaFilter[oEvent.oSource.getGroupName()].formcontainer) {
						this._mAdvancedAreaFilter[oEvent.oSource.getGroupName()].formcontainer.setTitle(oEvent.oSource.getGroupTitle());
					} else {
						this._adaptGroupTitle(oEvent.oSource.getGroupName());
					}
				}
			} else if (sPropertyName === "label") {
				if (!this._mAdvancedAreaFilter[oEvent.oSource.getGroupName()].formcontainer) { // do not adapt in case the advanced filters dialog is
					// active
					this._adaptGroupTitleForFilter(oEvent.oSource);
				}
			} else if (sPropertyName === "mandatory") {
				if (this._oFilterDialog) { // adapt only in case the advanced filters dialog is active
					this._adaptMandatoryForFilter(oEvent.oSource);
				}
			}
			
			if (this.getAdvancedMode()) {			
				this._rerenderAA();
			}				
		}
	};
	
	/**
	 * VisibleInFilterBar-property may not be changed to false, when the filter is mandatory and has no value
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem in question
	 * @param {boolean} bFlag - represents the value of visibleInFilterBar
	 * @returns {boolean} allowed or not allowed change
	 */
	FilterBar.prototype._checkChangePossibleVisibleInFilterBar = function(oFilterItem, bFlag) {
	
		if (oFilterItem && oFilterItem.getMandatory() && !bFlag) {
			var bHasValue = this._hasFilterValue(oFilterItem);
			if (!bHasValue) {
				oFilterItem.setVisibleInFilterBar(true);
				return false;
			}
		}
	
		return true;
	};
	
	/**
	 * In case the visibility was changed, check if the link text has to be adapted.
	 * 
	 * @private
	 * @param {string} sGroupName the group name
	 */
	FilterBar.prototype._adaptLinkText = function(sGroupName) {
	
		if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].link) {
			this._setLinkText(sGroupName, this._mAdvancedAreaFilter[sGroupName].link);
		}
	};
	
	/**
	 * Checks if a filter has a value.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem the filter
	 * @returns {boolean} returns if the filter has a value or not
	 */
	FilterBar.prototype._hasFilterValue = function(oFilterItem) {
	
		var aFilters = this._getFiltersWithValues();
		return this._checkFilterForValue(aFilters, oFilterItem);
	};
	
	/**
	 * Handles dynamic change of the mandatory property.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem the filter
	 */
	FilterBar.prototype._adaptMandatoryForFilter = function(oFilterItem) {
	
		var oItem;
		var sGroupName = oFilterItem.getGroupName();
	
		if (oFilterItem) {
			oItem = this._determineItemByName(oFilterItem.getName(), sGroupName);
			if (oItem && oItem.checkbox && oItem.checkbox.getVisible()) {
	
				var bEnabled = true;
				if (oFilterItem.getMandatory()) {
					var bHasValue = this._hasFilterValue(oFilterItem);
					if (!bHasValue) {
						bEnabled = false;
						oFilterItem.setVisibleInFilterBar(true);
					}
				}
	
				oItem.checkbox.setEnabled(bEnabled);
			}
		}
	};
	
	/**
	 * In case considerGroupTitle is set then all labels of filters of a specific group will post-fixed with the group title.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterItem the filter
	 */
	FilterBar.prototype._adaptGroupTitleForFilter = function(oFilterItem) {
	
		var sLabel;
		var oLabel;
	
		if (oFilterItem) {
			sLabel = oFilterItem.getLabel();
			oLabel = oFilterItem.getLabelControl(this.getId());
			if (this.getConsiderGroupTitle()) {
				if (oLabel && oFilterItem.getGroupTitle()) {
					oLabel.setText(sLabel + " (" + oFilterItem.getGroupTitle() + ')');
				}
			} else {
				oLabel.setText(sLabel);
			}
		}
	};
	
	/**
	 * In case considerGroupTitle is set then all labels of filters of a specific group will post-fixed with the group title.
	 * 
	 * @private
	 * @param {string} sGroupName filter group name
	 */
	FilterBar.prototype._adaptGroupTitle = function(sGroupName) {
	
		var i;
		var oItem;
	
		if (this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
			for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
				oItem = this._mAdvancedAreaFilter[sGroupName].items[i];
				if (oItem && oItem) {
					this._adaptGroupTitleForFilter(oItem.filterItem);
				}
			}
		}
	};
	
	/**
	 * In case considerGroupTitle is set then all labels of all filters of all groups will be post-fixed with the group title.
	 * 
	 * @private
	 * @param {string} sGroupName the group name
	 */
	FilterBar.prototype._adaptGroupsTitle = function() {
	
		var n = null;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n && n !== FilterBar.INTERNAL_GROUP) {
					this._adaptGroupTitle(n);
				}
			}
		}
	
	};
	
	/**
	 * Registration of a callback function. The provided callback function is executed to obtain the filters with values.
	 * 
	 * @public
	 * @since 1.26.1
	 * @param {function} fCallBack Called when a variant must be applied
	 */
	FilterBar.prototype.registerGetFiltersWithValues = function(fCallBack) {

		this._fRegisterGetFiltersWithValues = fCallBack;
	};
	
	/**
	 * Registration of a callback function. The provided callback function is executed when saving a variant is triggered and must provide all relevant fields and values in JSON.
	 * 
	 * @public
	 * @param {function} fCallBack Called when a variant must be fetched
	 */
	FilterBar.prototype.registerFetchData = function(fCallBack) {

		this._fRegisteredFetchData = fCallBack;
	};
	
	/**
	 * Registration of a callback function. The provided callback function is executed when a variant must be applied. The callback function will receive the corresponding data set containing all relevant data in JSON, as initially provided by the callback for fetchData.
	 * 
	 * @public
	 * @param {function} fCallBack Called when a variant must be applied
	 */
	FilterBar.prototype.registerApplyData = function(fCallBack) {
	
		this._fRegisteredApplyData = fCallBack;
	};
	
	
	FilterBar.prototype._isTINAFScenario = function() {
			
		if (this._oVariantManagement) {
			
		   if (this._oVariantManagement instanceof SmartVariantManagement) {
				return true;
		   }
		} else {
			
			/* eslint-disable no-lonely-if */			
			//scenario: VH dialog: VM replaced with collective search control
			if (this._oCollectiveSearch && this.getAdvancedMode()) {
				return true;
			}
			/* eslint-enable no-lonely-if */
		}
	
		return false;
	};
	
	/**
	 * This method has to be called by the consumer to indicate that the data model is available.
	 * 
	 * @public
	 */
	FilterBar.prototype.fireInitialise = function() {
	
		if (this._isTINAFScenario()) {
			this._fireInitialiseEvent();
		} else {
			this._initializeVariantManagement();
		}
	};
	
	/**
	 * Initializes the variant management, when the prerequisites are full filled. In this case the initialise-event will be triggered lated, after the
	 * variant management initialization. Triggers the initialise-event immediately, in case the pre-requisits are not full filled.
	 * 
	 * @private
	 */
	FilterBar.prototype._initializeVariantManagement = function() {
	
		// initialise SmartVariant stuff only if it is necessary! (Ex: has a persistencyKey)
		if (this._oVariantManagement && this.getPersistencyKey()) {
	
			this._fInitialiseVariants = jQuery.proxy(this._initialiseVariants, this);
			this._oVariantManagement.attachInitialise(this._fInitialiseVariants);
	
			this._oVariantManagement.initialise();
	
		} else {
			this._fireInitialiseEvent();
		}
	};
	
	FilterBar.prototype._fireInitialiseEvent = function() {

		this.fireEvent("initialise");
	
		this._updateToolbarText();			
	};
	
	/**
	 * Is triggered, whenever the flex layer is initialized.
	 * 
	 * @private
	 */
	FilterBar.prototype._initialiseVariants = function() {

		this._fireInitialiseEvent();
		if (this._oVariantManagement) { // mark any changes as irrelevant
			this._oVariantManagement.currentVariantSetModified(false);
		}
	};
	
	/**
	 * Informs the consumer of the filter bar that a new variant was applied.
	 * 
	 * @private
	 * @param {string} sContext may be undefined, has the values 'RESET' or 'CANCEL' and indicates the initial trigger source
	 */
	FilterBar.prototype.fireAfterVariantLoad = function(sContext) {
	
		this._rerenderFilters();
			 
		var oEvent = { context: sContext };
		this.fireEvent("afterVariantLoad", oEvent);
	};
	
	
	/**
	 * Informs the consumer of the filter bar, that a variant is about to be saved.
	 * 
	 * @private
     * @param {string} sContext may be undefined, have the value <code>STANDARD</code> and indicates the initial trigger source	 
	 */	
	FilterBar.prototype.fireBeforeVariantSave = function(sContext) {
		
		var oEvent = { context: sContext };		
		
		var bFlag = this._getConsiderFilterChanges(); 
		
		if (sContext) {
			this._setConsiderFilterChanges(false);
		}
		
		this.fireEvent("beforeVariantSave", oEvent);
		
		if (sContext) {
			this._setConsiderFilterChanges(bFlag);
		}		
	};	
	
	
	/**
	 * Removes all entries in the aggregation filterItems.
	 * 
	 * @public
	 */
	FilterBar.prototype.removeAllFilterItems = function() {
	
		var i;
		var aFilters;
	
		this._aBasicAreaSelection = null;
	
		var aControls = this._oBasicAreaLayout.getContent();
		if (aControls) {
			for (i = 0; i < aControls.length; i++) { // 'variant management' ... 'plus', ' more-less', buttons container
				this._oBasicAreaLayout.removeContent(aControls[i]);
			}
		}
	
		aFilters = this.getFilterItems();
		if (this._mAdvancedAreaFilter) {
			if ((this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP]) && (this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items)) {
				for (i = 0; i < this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items.length; i++) {
					if (this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items[i].filterItem) {
						aFilters.push(this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP].items[i].filterItem);
					}
				}
	
				delete this._mAdvancedAreaFilter[FilterBar.INTERNAL_GROUP];
			}
	
			if (Object.keys(this._mAdvancedAreaFilter).length === 0) {
				this._mAdvancedAreaFilter = null;
			}
		}
	
		// this.removeAggregation("filterItems");
	
		this._destroyItems(aFilters);
	};
	
	/**
	 * Removes all entries in the aggregation filterGroupItems.
	 * 
	 * @public
	 */
	FilterBar.prototype.removeAllFilterGroupItems = function() {
	
		var n = null, i;
		var aFilters = [];
	
		for (n in this._mAdvancedAreaFilter) {
			if (n) {
				if (this._mAdvancedAreaFilter[n] && this._mAdvancedAreaFilter[n].items) {
					for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
						if (this._mAdvancedAreaFilter[n].items[i].filterItem) {
							aFilters.push(this._mAdvancedAreaFilter[n].items[i].filterItem);
						}
					}
	
					delete this._mAdvancedAreaFilter[n];
				}
			}
	
			if (Object.keys(this._mAdvancedAreaFilter).length === 0) {
				this._mAdvancedAreaFilter = null;
			}
		}
	
		// this.removeAggregation("filterGroupItems");
		this._destroyItems(aFilters);
	};
	
	/**
	 * Removes the association basicSearch.
	 * 
	 * @public
	 * @since 1.30.0
	 */
	FilterBar.prototype.removeBasicSearch = function() {
		this.setBasicSearch(null);			
	};
	
	/**
	 * Retrieves filters belonging to the current variant.
	 * 
	 * @public
	 * @param {boolean} bConsiderOnlyVisibleFields Indicates that only visible filters are retrieved
	 * @returns {array} filters Of the current variant
	 */
	FilterBar.prototype.getAllFilterItems = function(bConsiderOnlyVisibleFields) {

		var i, n = null;
		var aFilters = [];
		var oElement, oItem;
		
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					oElement = this._mAdvancedAreaFilter[n];
					if (oElement.items) {
						for (i = 0; i < oElement.items.length; i++) {
							oItem = oElement.items[i];
							if (oItem && oItem.filterItem && oItem.filterItem.getVisible()) {
								if (bConsiderOnlyVisibleFields) {
									if (oItem.filterItem.getVisibleInFilterBar() || oItem.filterItem.getPartOfCurrentVariant()) {
										aFilters.push(oItem.filterItem);
									}
								} else {
									aFilters.push(oItem.filterItem);
								}
							}
						}
					}
				}
			}
		}
	
		return aFilters;
	};
	
	/**
	 * Clears an eventual error state on all filter.
	 * 
	 * @private
	 */
	FilterBar.prototype._clearErrorState = function() {
	
		var i;
		var oControl;
	
		var aFilterItems = this.determineMandatoryFilterItems();
		if (aFilterItems) {
			for (i = 0; i < aFilterItems.length; i++) {
				oControl = this.determineControlByFilterItem(aFilterItems[i]);
				if (oControl && oControl.setValueState) {
					oControl.setValueState(ValueState.None);
				}
			}
		}
	};
	
	
	/**
	 * Destroys the passed filters.
	 * 
	 * @private
	 * @param {array} aFilterItems aggregation items
	 */
	FilterBar.prototype._destroyItems = function(aFilterItems) {
	
		if (aFilterItems && aFilterItems.length) {
			for (var i = 0; i < aFilterItems.length; i++) {
				aFilterItems[i].destroy();
			}
		}
	};
	
	/**
	 * Handles the visibility of the filters, during the variant appliance, according to the persisted information. 
	 * 
	 * @private
	 * @param {array} aPersData information about the filter fields
	 */
	FilterBar.prototype._reapplyVisibility = function(aPersData) {
	
		var i, n = null;
		var oItem;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					var oGroup = this._mAdvancedAreaFilter[n];
					if (oGroup && oGroup.items) {
						for (i = 0; i < oGroup.items.length; i++) {
							oItem = oGroup.items[i];
							if (oItem && oItem.filterItem) {
								this._setPersVisibility(aPersData, oItem.filterItem);
							}
						}
	
						if (n !== FilterBar.INTERNAL_GROUP) {
							this._adaptLinkText(n);
						}
					}
				}
			}
		}
	};
	
	/**
	 * Determines if the current filter is marks as visible via the personalization
	 * 
	 * @private
	 * @param {array} aPersData array of filters as obtain by the persistence layer
	 * @param {sap.ui.comp.filterBar.FilterItem} oFilterItem current filterItem
	 */
	FilterBar.prototype._setPersVisibility = function(aPersData, oFilterItem) {

		var sGroupName, sName;
		var oFilterInfo;
	
		if (oFilterItem) {
			sName = oFilterItem.getName();
			sGroupName = oFilterItem.getGroupName();
	
			oFilterInfo = this._checkForFilterInfo(aPersData, sName, sGroupName);
			if (this._isTINAFScenario()) {
				if (oFilterInfo) {
					oFilterItem.setVisibleInFilterBar((oFilterInfo.visibleInFilterBar));
					oFilterItem.setPartOfCurrentVariant((oFilterInfo.partOfCurrentVariant));
				}
			} else {
				/* eslint-disable no-lonely-if */
				if (oFilterInfo && (oFilterInfo.visibleInFilterBar !== undefined)) { // new format
					oFilterItem.setVisibleInFilterBar((oFilterInfo.visibleInFilterBar));
					oFilterItem.setPartOfCurrentVariant((oFilterInfo.partOfCurrentVariant));
				} else { // old format
					if ((sGroupName !== FilterBar.INTERNAL_GROUP) && oFilterInfo && (oFilterInfo.group === sGroupName)) {
	
						oFilterItem.setVisibleInFilterBar((oFilterInfo !== null));
					}
				}
				/* eslint-enable no-lonely-if */
			}
			
			if (sGroupName === FilterBar.INTERNAL_GROUP) {  // basic fields are always partOfCurentVariant
				oFilterItem.setPartOfCurrentVariant(true);
			}				
		}
	};
	
	/**
	 * Determines the filter info from the persistence data for a specific filter.
	 * 
	 * @private
	 * @param {array} aPersData array of filters as obtain by the persistence layer
	 * @param {string} sName Name of the filter
	 * @param {string} sGroupName Group name of the filter
	 * @returns {object} filter info object
	 */
	FilterBar.prototype._checkForFilterInfo = function(aPersData, sName, sGroupName) {
	
		var i;
		var oFilterInfo = null;
	
		if (aPersData && aPersData.length) {
			for (i = 0; i < aPersData.length; i++) {
				if ((aPersData[i].name === sName) && (aPersData[i].group === sGroupName)) {
					oFilterInfo = aPersData[i];
					break;
				}
			}
		}
	
		return oFilterInfo;
	};
	
	/**
	 * Creates the variant management control.
	 * 
	 * @private
	 * @returns {sap.ui.comp.smartvariants.SmartVariantManagementUi2} the instance of variant management
	 */
	FilterBar.prototype._createVariantManagement = function() {
	
		var oVarMgm = new SmartVariantManagementUi2({
		// showExecuteOnSelection: true,
		// showShare: true
		});
	
		var oPersInfo = new PersonalizableInfo({
			type: "filterBar",
			keyName: "persistencyKey"
		});
		oPersInfo.setControl(this);
	
		oVarMgm.addPersonalizableControl(oPersInfo);
	
		oVarMgm.addStyleClass("sapUiCompFilterBarMarginLeft");
		return oVarMgm;
	};
	
	/**
	 * Retrieve all filters with values.
	 * 
	 * @private
	 * @returns {array} of filters with values
	 */
	FilterBar.prototype._getFiltersWithValues = function() {
	
		if (this._fRegisterGetFiltersWithValues) {
			try {
				return this._fRegisterGetFiltersWithValues();
			} catch (ex) {
				jQuery.sap.log.error("callback for obtaining the filter count throws an exception");
			}
		}
	
		return null;
	};
	
	/**
	 * Retrieve the count for visible filters with values.
	 * 
	 * @private
	 * @returns {number} count of visible filters with values
	 */
	FilterBar.prototype._getFiltersWithValuesCount = function() {
	
		var i, n = 0;
	
		var aFilters = this._getFiltersWithValues();
		if (aFilters) {
			for (i = 0; i < aFilters.length; i++) {
				if (aFilters[i].getVisible() && (aFilters[i].getVisibleInFilterBar() || aFilters[i].getPartOfCurrentVariant())) {
					n++;
				}
			}
		}
	
		return n;
	};
	
	/**
	 * Determines if at least one filter is visible.
	 * 
	 * @private
	 * @param {array} aFilterItemsWithValues contains all filters with values
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem filter to check
	 * @returns {boolean} indicated whether at least one filter is visible
	 */
	FilterBar.prototype._checkFilterForValue = function(aFilterItemsWithValues, oFilterItem) {
	
		var i;
		if (aFilterItemsWithValues) {
			for (i = 0; i < aFilterItemsWithValues.length; i++) {
				if (aFilterItemsWithValues[i] === oFilterItem) {
					return true;
				}
			}
		}
	
		return false;
	};

	
	FilterBar.prototype._handleVisibilityOfToolbar = function() {

		if (this.getAdvancedMode()) {

			var bFlag = false;

			var aContent = this._oToolbar.getContent();
			for (var i = 0; i < aContent.length; i++) {
				if (aContent[i] instanceof ToolbarSpacer) {
					continue;
				}

				if (aContent[i].getVisible && aContent[i].getVisible()) {
					bFlag = true;
					break;
				}
			}

			this._oToolbar.setVisible(bFlag);
		}
	};
	
	
	/**
	 * Toggles the filterbar mode Hide/Show.
	 * 
	 * @private
	 */
	FilterBar.prototype._toggleHideShow = function() {

		this.setFilterBarExpanded(!this.getFilterBarExpanded());
	};
	
	/**
	 * Updates the 'Filters'-button text with the count of filters with values
	 * 
	 * @private
	 */
	FilterBar.prototype._updateToolbarText = function() {
	
		var nFilterCount = this._getFiltersWithValuesCount();
		var sText = nFilterCount ? (this._oRb.getText("FILTER_BAR_ACTIVE_FILTERS", [
			nFilterCount
		])) : (this._oRb.getText("FILTER_BAR_ACTIVE_FILTERS_ZERO"));
		this._oFiltersButton.setText(sText);
	};
	
	/**
	 * Sets filterbar in collapsed/expanded mode.
	 * 
	 * @public
	 * @since 1.26.1
	 * @param {boolean} bShowExpanded Mode
	 */
	FilterBar.prototype.setFilterBarExpanded = function(bShowExpanded) {

		if (this.getAdvancedMode()) {

			this.setProperty("filterBarExpanded", bShowExpanded);
			
			if (bShowExpanded) {
				this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_VH_HIDE"));
			} else {
				this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_VH_SHOW"));
			}
			//this._oHideShowButton.setVisible(true);			
			this._oSearchButton.setVisible(this.getShowGoOnFB());			

			this._oAdvancedPanel.setVisible(bShowExpanded);			
			
		} else {			

			var bExpanded = this._isPhone() ? false : bShowExpanded;

			this.setProperty("filterBarExpanded", bExpanded);

			if (this._isPhone()) {
				this._oHideShowButton.setVisible(false);
				this._oSearchButton.setVisible(this.getShowGoOnFB());

				this._oBasicAreaLayout.setVisible(false);

			} else {

				if (bExpanded) {
					this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_HIDE"));
				} else {
					this._oHideShowButton.setText(this._oRb.getText("FILTER_BAR_SHOW"));
				}
				this._oHideShowButton.setVisible(true);
				this._oSearchButton.setVisible(this.getShowGoOnFB());
				this._oBasicAreaLayout.setVisible(bExpanded);
			}

		}
		
		this._updateToolbarText();
	};
	
	/**
	 * Eventhandler for visibility change in the 'Filters'-dialog.
	 * 
	 * @private
	 * @param {sap.m.Checkbox } oCheckBox on which the select-state was changed
	 * @param {sap.ui.comp.filterbar.FilterItem } oFilterItem manipulated by the checkbox
	 */
	FilterBar.prototype._selectionChangedInFilterDialog = function(oCheckBox, oFilterItem) {
	
		oFilterItem.setVisibleInFilterBar(oCheckBox.getSelected());
	
		if (this._getConsiderFilterChanges() && this._oVariantManagement && this._oVariantManagement.getEnabled()) {
			this._oVariantManagement.currentVariantSetModified(true);
		}
		
		this._bDirtyViaDialog = true;
	};
	
	/**
	 * Cross-checks if a mandatory filter has a value.
	 * 
	 * @private
	 * @param {object } oEvent general event object
	 */
	FilterBar.prototype._mandatoryFilterChange = function(oEvent) {
	
		if (!oEvent) {
			return;
		}
	
		var params = oEvent.getParameters();
		if (!params || !params.oSource) {
			return;
		}
	
		var oItem = this._determineByControl(params.oSource);
		if (oItem && oItem.checkbox) {
	
			var oFilterItem = oItem.filterItem;
	
			if (!oFilterItem.getMandatory()) {
				return;
			}
	
			var bHasValue = this._hasFilterValue(oFilterItem);
			if (oFilterItem.getVisibleInFilterBar()) {
				if (bHasValue) {
					oItem.checkbox.setEnabled(true);
				} else {
					oItem.checkbox.setEnabled(false);
				}
			} else {
				/* eslint-disable no-lonely-if */
				if (!bHasValue) {
					oFilterItem.setVisibleInFilterBar(true);
					oItem.checkbox.setSelected(true);
					oItem.checkbox.setEnabled(false);
				}
				/* eslint-enable no-lonely-if */
			}
		}
	};
	
	/**
	 * Called from 'Filters'-dialog and creates the form containing all filters.
	 * 
	 * @private
	 * @returns {sap.ui.layout.form.Form} the filter form
	 */
	FilterBar.prototype._createFiltersAndAdaptBasicArea = function() {
	
		var oForm;
	
		this._setConsiderFilterChanges(false);
		this._recreateBasicAreaContainer(true);
	
		oForm = this._createFilters();
		this._setConsiderFilterChanges(true);
	
		return oForm;
	};
	
	/**
	 * Determines how many filters of a specific group are yet not part of the current variant.
	 * 
	 * @private
	 * @param {string} sGroupName name of the current group
	 * @returns {number} count of filters, for the current group, yet not part of the current variant
	 */
	FilterBar.prototype._determineNotAssignedFiltersCount = function(sGroupName) {

		var nCount = 0, i;
		var oFilterItem;
	
		if (this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
			for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
				oFilterItem = this._mAdvancedAreaFilter[sGroupName].items[i].filterItem;
				if (!oFilterItem.getVisible()) {
					continue;
				}
				if (!oFilterItem.getPartOfCurrentVariant() && !oFilterItem.getVisibleInFilterBar()) {
					nCount++;
				}
			}
		}
	
		return nCount;
	};
	
	/**
	 * Handles the visibility of the passed oItem; adapts the more-link text; handles the visibility for the form-container.
	 * 
	 * @private
	 * @param {object} oItem representing a filter
	 * @param {string} sGroupName name of the current group
	 */
	FilterBar.prototype._rerenderGroup = function(oItem, sGroupName) {
	
		var i;
		var oFilterItem;
	
		this._rerenderItem(oItem);
		this._adaptLinkText(sGroupName);
	
		if (oItem.formelement) {
	
			if (this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items && this._mAdvancedAreaFilter[sGroupName].formcontainer) {
				for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
	
					oFilterItem = this._mAdvancedAreaFilter[sGroupName].items[i].filterItem;
					if (oFilterItem && oFilterItem.getVisible()) {
						this._mAdvancedAreaFilter[sGroupName].formcontainer.setVisible(true);
						return;
					}
				}
	
				this._mAdvancedAreaFilter[sGroupName].formcontainer.setVisible(false);
			}
		}
	};
	
	/**
	 * Sets the group's 'More'- link text containing the info about not yet assigned filters to the current group.
	 * 
	 * @private
	 * @param {string} sGroupName name of the group
	 * @param {sap.m.Link } oLink control
	 * @param {number } nNotAssignedFilterCount count of not yet assigned filters
	 */
	FilterBar.prototype._setLinkTextAndCount = function(sGroupName, oLink, nNotAssignedFilterCount) {

		var sText;
	
		if (nNotAssignedFilterCount) {
			sText = this._oRb.getText("FILTER_BAR_SHOW_MORE_FILTERS", [
				nNotAssignedFilterCount
			]);
		} else {
			sText = this._oRb.getText("FILTER_BAR_SHOW_CHANGE_FILTERS");
		}
	
		oLink.setText(sText);
	};
	
	/**
   * Sets the group's 'More'- link text containing the info about not yet assigned filters to the current group.
	 * 
	 * @private
	 * @param {string} sGroupName name of the group
	 * @param {sap.m.Link } oLink control
	 */
	FilterBar.prototype._setLinkText = function(sGroupName, oLink) {
	
		var nNotAssignedFilterCount = this._determineNotAssignedFiltersCount(sGroupName);
	
		this._setLinkTextAndCount(sGroupName, oLink, nNotAssignedFilterCount);
	};
	
	/**
	 * Creates a link control for the current group. The link will open the 'Add/Remove Filters'- dialog
	 * 
	 * @private
	 * @param {string} sGroupName name of the group
	 * @param {Title} oGroupTitle title of the group to which the link should belong 
	 * @returns {sap.m.Link} link control
	 */
	FilterBar.prototype._createLink = function(sGroupName, oGroupTitle) {
	
		var that = this;
		var oLink = new Link();
		this._setLinkText(sGroupName, oLink);
	
		oLink.attachPress(function() {			
			that._createAddRemoveFiltersDialog(sGroupName, oLink);
		});
	
		if (oGroupTitle) {
			oLink.addAriaLabelledBy(oGroupTitle);
		}
		
		return oLink;
	};
	
	/**
	 * Checks if running on phone.
	 * 
	 * @private
	 * @returns {boolean} true if phone, false other wise
	 */
	FilterBar.prototype._isPhone = function() {
	
		return (Device.system.phone) ? true : false;
	};
	
	/**
	 * Checks if running on tablet.
	 * 
	 * @private
	 * @returns {boolean} true if phone, false other wise
	 */
	FilterBar.prototype._isTablet = function() {	
		return (Device.system.tablet && !Device.system.desktop) ? true : false;		
	};
	
	
	FilterBar.prototype._createForm = function(oAdvancedLayout) {
		var that = this;
		var FiltersForm = null;

		
		FiltersForm = Form.extend('sap.ui.comp.filterbar.Form', { 
			metadata: {
			},
			renderer: function(oRm, oControl) {
				FormRenderer.render.apply(this, arguments);					
			}				
		});
		(function() {
			FiltersForm.prototype.contentOnAfterRendering = function() {
								
				Form.prototype.contentOnAfterRendering.apply(this, arguments);
				
				that._adaptStyleSheet();					
				
				if (!that._isPhone()) {
					that._repositionAddToFilterBarLabel();
				}
			};
		}());

		return new FiltersForm({
			editable: true,
			layout: oAdvancedLayout
		});
	};
	

	FilterBar.prototype._adaptStyleSheet = function() {

		var i, sOverFlowValue;
		var oItem, oTitleElement, n = null;
			
		for (n in this._mAdvancedAreaFilter) {
			if (n && this._mAdvancedAreaFilter[n].items) {

				for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
					oItem = this._mAdvancedAreaFilter[n].items[i];

					if (oItem && oItem.control && oItem.control instanceof MultiInput) {

						oTitleElement = oItem.control.$();
						if (oTitleElement) {
							sOverFlowValue = oTitleElement.parent().css("overflow");
							if (sOverFlowValue !== "visible") {
								oTitleElement.parent().css({"overflow": "visible"});
							}
						}
					}
				}
			}
		}

	};
	
	/**
	 * Creates the form containing all visible filters belonging to the current variant
	 * 
	 * @private
	 * @returns {sap.ui.layout.form.Form} form with all filters
	 */
	FilterBar.prototype._createFilters = function() {

		var that = this;
		var n = null, i;
		var sGroupName;
		var oFormContainer = null, oFormElement, aFormElements, oItem;
		var oLink, oLabel, oGroupTitle;
		var oCheckBox = null;
		var bHasValue;
		var oAddToFilterBarLabel = null;
		var bFirstGroup = true;
		var nInvisibleCount;

		var oAdvancedLayout = new ResponsiveGridLayout();
		oAdvancedLayout.setColumnsL(1);
		oAdvancedLayout.setColumnsM(1);				


		var oForm = this._createForm(oAdvancedLayout);

		oForm.addStyleClass("sapUiCompFilterBarDialogForm");

		if (this._oVariantManagement) {
			var idx = this._oToolbar.indexOfContent(this._oVariantManagement);
			if (idx >= 0) {
				var oClonedVM = this._oVariantManagement.clone();
				oClonedVM._setSelectionByKey(this._oVariantManagement.getSelectionKey());
				this._oToolbar.removeContent(this._oVariantManagement);
				this._oToolbar.insertContent(oClonedVM, idx);

				this._oVariant.key = this._oVariantManagement.getSelectionKey();
				this._oVariant.modified = this._oVariantManagement.currentVariantGetModified();

				oFormContainer = new FormContainer();

				this._oVariantManagement.setLayoutData(new GridData({
					span: "L10 M10 S12"
				}));
				oFormElement = new FormElement({
					fields: this._oVariantManagement
				});

				oFormContainer.addFormElement(oFormElement);				

				if (!this._isPhone()) { // label 'Add To Filterbar'

					oAddToFilterBarLabel = new Label({
						// text: this._oRb.getText("FILTER_BAR_SHOW_IN_FILTERBAR")
					});

					oAddToFilterBarLabel.setLayoutData(new GridData({
						span: "L2 M2 S2"
					}));
					oAddToFilterBarLabel.addStyleClass("sapUiCompFilterBarAddFilterLabel");
					this._oAddToFilterBarLabel = oAddToFilterBarLabel;

					oFormElement = new FormElement({
						label: oAddToFilterBarLabel
					});

					oFormContainer.addFormElement(oFormElement);
				}

				oForm.addFormContainer(oFormContainer);
			}

			oForm.addStyleClass("sapUiCompFilterBarGroupTitle");
		}

		// basic serach field
		if (this._oBasicSearchField) {
			if (!oFormContainer) {
				oFormContainer = new FormContainer();
			}

			if (!this._isPhone()) {
				this._oToolbar.removeContent(this._oBasicSearchField);
				this._oBasicSearchFieldClone = this._oBasicSearchField.clone(); 		

				this._oToolbar.insertContent(this._oBasicSearchFieldClone, 1);				
			} else {
				/* eslint-disable no-lonely-if */				
				if (this.getAdvancedMode()) {
					this._oBasicSearchFieldClone = this._oBasicSearchField.clone(); 		
				}
				/* eslint-enable no-lonely-if */				
			}

			if (this._isPhone()) {
				this._oBasicSearchField.setLayoutData(new GridData({
					span: "L8 M8 S12"
				}));
			} else {
				this._oBasicSearchField.setLayoutData(new GridData({
					span: "L8 M8 S11",
					indent: "L0 M3 S0"
				}));
			}			

			if (this._isPhone() && this.getAdvancedMode()) {
				oFormElement = new FormElement({
					fields: [this._oBasicSearchFieldClone]
				});	
			} else {
				oFormElement = new FormElement({
					fields: [this._oBasicSearchField]
				});		
			}
			
			oFormContainer.addFormElement(oFormElement);				
		}

		// filters	
		var aFilters = this._getFiltersWithValues();
		this._fRegisteredFilterChangeHandlers = function(oEvent) {
			that._mandatoryFilterChange(oEvent);
		};
		this.attachFilterChange(this._fRegisteredFilterChangeHandlers);
		
		this._oVariant.content = this.fetchVariant();
		this._oInitialVariant = {};
		jQuery.extend(true, this._oInitialVariant, this._oVariant);		
			
		for (n in this._mAdvancedAreaFilter) {
			if (n && this._mAdvancedAreaFilter[n].items) {

				if (n === FilterBar.INTERNAL_GROUP) {
					sGroupName = this._oRb.getText("FILTER_BAR_BASIC_GROUP");
				} else {
					sGroupName = this._mAdvancedAreaFilter[n].filterItem.getGroupTitle();
				}

				oGroupTitle = new Title({text:sGroupName});
				oFormContainer = new FormContainer({
					title: oGroupTitle
				});

				if (bFirstGroup && sGroupName === "" && oAddToFilterBarLabel) {
					oAddToFilterBarLabel.removeStyleClass("sapUiCompFilterBarAddFilterLabel");
					oAddToFilterBarLabel.addStyleClass("sapUiCompFilterBarAddFilterLabelNoGroup");
				}

				bFirstGroup = false;
				nInvisibleCount = 0;

				this._mAdvancedAreaFilter[n].formcontainer = oFormContainer;

				for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
					oItem = this._mAdvancedAreaFilter[n].items[i];

					if (oItem.control.getWidth) {
						oItem.width = oItem.control.getWidth();

						if (oItem.control.setWidth) {
							oItem.control.setWidth("100%");
						}
					}

					oLabel = oItem.filterItem.getLabelControl(this.getId());

					if (this.getConsiderGroupTitle()) {
						oLabel.setText(oItem.filterItem.getLabel());
					}

					oCheckBox = new CheckBox({
						tooltip: this._oRb.getText("FILTER_BAR_SHOW_IN_FILTERBAR")
					});
					oCheckBox.setSelected(oItem.filterItem.getVisibleInFilterBar());
					if (oItem.filterItem.getMandatory()) {
						bHasValue = this._checkFilterForValue(aFilters, oItem.filterItem);
						if (!bHasValue && oItem.filterItem.getVisibleInFilterBar()) {
							oCheckBox.setEnabled(false);
						}
					}
					oCheckBox.attachSelect(jQuery.proxy(this._selectionChangedInFilterDialog, this, oCheckBox, oItem.filterItem));

					if (this._isPhone()) {
						oLabel.setLayoutData(new GridData({
							span: "L3 M3 S12"
						}));
						oItem.control.setLayoutData(new GridData({
							span: "L8 M8 S12"
						}));

						oCheckBox.setVisible(false);

					} else {
						oLabel.setLayoutData(new GridData({
							span: "L3 M3 S12"
						}));
						oItem.control.setLayoutData(new GridData({
							span: "L8 M8 S11"
						}));
						oCheckBox.setLayoutData(new GridData({
							span: "L1 M1 S1"
						}));
					}

					oFormElement = new FormElement({
						label: oLabel,
						fields: [
						         oItem.control, oCheckBox
						         ]
					});
					oFormElement.setVisible(oItem.filterItem.getVisible() && (oItem.filterItem.getVisibleInFilterBar() || oItem.filterItem.getPartOfCurrentVariant()));
					if (!oItem.filterItem.getVisible()) {
						nInvisibleCount++;
					}

					oItem.formelement = oFormElement;
					oItem.checkbox = oCheckBox;

					oFormContainer.addFormElement(oFormElement);
				}

				//More link
				aFormElements = oFormContainer.getFormElements();
				if (aFormElements && aFormElements.length > 0) {

					if ((n !== FilterBar.INTERNAL_GROUP) && !this.getAdvancedMode()) {
						oLink = this._createLink(n, oGroupTitle);
						if (oLink) {

							if (this._isPhone()) {
								oLink.setLayoutData(new GridData({
									span: "L8 M8 S12"
								}));
							} else {
								oLink.setLayoutData(new GridData({
									span: "L8 M8 S12",
									indent: "L3 M3 S0"
								}));
							}

							oFormElement = new FormElement({
								fields: [
								         oLink
								         ]
							});

							this._mAdvancedAreaFilter[n].link = oLink;

							oFormContainer.addFormElement(oFormElement);
						}

						if (nInvisibleCount === aFormElements.length) {
							oFormContainer.setVisible(false);
						}
					}

					oForm.addFormContainer(oFormContainer);
				}
			}
		}

		return oForm;

	};

	/**
	 * Creates the content of the basic area, either by replacing the controls with their clones, or removing the clones and moving the original controls back to it.
	 * 
	 * @private
	 * @param {boolean} bUseClone indicates if clones or 'original' controls should be placed inside the basic area
	 */
	FilterBar.prototype._recreateBasicAreaContainer = function(bUseClone) {
	
		var n = null, i;
		var oControl, oLabel;
		var oFilterGroupItem, oContainer;
	
		if (this._oVariantManagement) {
			var aContent = this._oToolbar.getContent();
			this._oToolbar.removeContent(aContent[0]);
			this._oToolbar.insertContent(this._oVariantManagement, 0);
		}
		
		if (this._oBasicSearchField) {
			if (!this._isPhone()) {
				if (this._oBasicSearchFieldClone) {
					this._oToolbar.removeContent(this._oBasicSearchFieldClone);
					this._oBasicSearchFieldClone = null;				
				}
				if (this._oToolbar.indexOfContent(this._oBasicSearchField) < 0) {
					this._oToolbar.insertContent(this._oBasicSearchField, 1);
				}
			} else {
				/* eslint-disable no-lonely-if */				
				if (this.getAdvancedMode()) {
					this._oBasicSearchFieldClone = null;
				}
				/* eslint-enable no-lonely-if */				
			}
		}
		
		this._oBasicAreaLayout.removeAllContent();
	
		for (n in this._mAdvancedAreaFilter) {
			if (n && this._mAdvancedAreaFilter[n].items) {
	
				for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
					oFilterGroupItem = this._mAdvancedAreaFilter[n].items[i].filterItem;
	
					if (bUseClone) {
						if (!oFilterGroupItem.getVisible() || !oFilterGroupItem.getVisibleInFilterBar()) {
							continue; // handle only visible filters
						}
						oControl = this._mAdvancedAreaFilter[n].items[i].control.clone();
						oLabel = oFilterGroupItem.getLabelControl(this.getId()).clone();
	
						if (this.getConsiderGroupTitle()) {
							// in advanced filters dialog the label should not contain group title
							oFilterGroupItem.getLabelControl(this.getId()).setText(oFilterGroupItem.getLabel());
						}
					} else {
						oControl = this._mAdvancedAreaFilter[n].items[i].control;
						oLabel = oFilterGroupItem.getLabelControl(this.getId());
	
						if (this._mAdvancedAreaFilter[n].items[i].width) {
							oControl.setWidth(this._mAdvancedAreaFilter[n].items[i].width);
						}
					}
	
					oContainer = this._addControlToBasicAreaContainer(oFilterGroupItem, oControl, oLabel);
					if (oContainer) {
						oContainer.setVisible(oFilterGroupItem.getVisible() && oFilterGroupItem.getVisibleInFilterBar());
						this._mAdvancedAreaFilter[n].items[i].container = oContainer;
					}
				}
			}
		}
	};
	
	/**
	 * Search was executed. Check afterwards if any filer is in error state. Close dialog only in case non of the filters is in error state.
	 * 
	 * @private
	 * @param {sap.ui.layout.form.Form} oForm representing the filters
	 */
	FilterBar.prototype._searchRequested = function(oForm) {
	
		if (this.search()) {
			this._oFilterDialog.close();		
		}
	};
	
	/**
	 * Close the 'Filters'-dialog and restores the filterbar.
	 * 
	 * @private
	 * @param {sap.ui.layout.form.Form} oForm representing the filters
	 */
	FilterBar.prototype._closeDialogAndRestoreFilterBar = function(oForm) {

		this._sSearchCriteriaInFiltersDialog = null;
	
		this._oVariant = {};
	
		oForm.removeAllFormContainers();
	
		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null;
		}
		
		this._recreateBasicAreaContainer();
		
		//this._oBasicAreaLayout.rerender(); // seems to be required from 1.32...		
	
		this._deleteProperties();
		this._adaptGroupsTitle();
	
		if (this._fRegisteredFilterChangeHandlers) {
	
			this.detachFilterChange(this._fRegisteredFilterChangeHandlers);
			this._fRegisteredFilterChangeHandlers = null;
		}
		
		this._updateToolbarText();
			
	};
	
	FilterBar.prototype._variantSave = function(oEvent) {
	
		var sKey;
		this._oVariant = {};
	
		this.fireBeforeVariantSave();
	
		if (this._oVariantManagement && this._oFilterDialog) {
			sKey = this._oVariantManagement.getSelectionKey();
			this._oVariant.key = sKey;
			this._oVariant.modified = false;
			this._oVariant.content = this._oVariantManagement.getVariantContent(this, sKey);
		}
	};
	
	FilterBar.prototype._afterVariantSave = function(oEvent) {
	
		this.fireAfterVariantSave();
	};
	
	FilterBar.prototype._variantSavePressed = function(oEvent) {
	
		if (this._oVariantManagement) {
	
			var sKey = this._oVariantManagement.getSelectionKey();
			var oCurrentItem = this._oVariantManagement.getItemByKey(this._oVariantManagement.getSelectionKey());
				
			if (!this._oVariantManagement._isIndustrySolutionModeAndVendorLayer() && 
				((sKey === this._oVariantManagement.getStandardVariantKey()) || (oCurrentItem && oCurrentItem.getReadOnly && oCurrentItem.getReadOnly()))) {
				this._oVariantManagement._openSaveAsDialog();
			} else {
				this._oVariantManagement._variantSavePressed();
			}
		}
	};
	
	FilterBar.prototype._findFirstVisibleGroup = function() {
		var n = null;
		
		for (n in this._mAdvancedAreaFilter) {
			if (n && this._mAdvancedAreaFilter[n].formcontainer && this._mAdvancedAreaFilter[n].formcontainer.getVisible()) {
				return this._mAdvancedAreaFilter[n].formcontainer.getTitle();
			}
		}
		
		return null;
	};
	
	FilterBar.prototype._repositionAddToFilterBarLabel = function() {

		if (!this._isPhone()) {
			
			var oTitle = this._findFirstVisibleGroup();

			if (oTitle && this._oAddToFilterBarLabel) {

				var oTitleElement = oTitle.$();
				if (oTitleElement) {

					var oTitlePosition = oTitleElement.offset();
					var oLabelElement = this._oAddToFilterBarLabel.$();
					if (oLabelElement) {
						var oLabelOffset = oLabelElement.offset();
						if (oLabelOffset && oTitlePosition) {
							oLabelOffset.top = oTitlePosition.top + 5;
							oLabelOffset.right = 32;
							oLabelElement.offset(oLabelOffset);
						}
					}
				}
			}

			if (this._oAddToFilterBarLabel && !this._oAddToFilterBarLabel.getText()) {
				this._oAddToFilterBarLabel.setText(this._oRb.getText("FILTER_BAR_SHOW_IN_FILTERBAR"));
			}
		}
	};
	
	FilterBar.prototype._cancelFilterDialog = function() {
	
		if (this._oInitialVariant && this._oInitialVariant.content  && this._bDirtyViaDialog) {
			this._applyVariant(this._oInitialVariant.content, "CANCEL");
	
			if (this._oVariantManagement) {
				this._oVariantManagement._setSelectionByKey(this._oInitialVariant.key);
				this._oVariantManagement.currentVariantSetModified(this._oInitialVariant.modified);
			}
			
			this.fireCancel();			
		}
	};
	
	/**
	 * Creates and shows the 'Filters'-dialog.
	 * 
	 * @private
	 */
	FilterBar.prototype._showFilterDialog = function() {
	
		var that = this;
	
		this._oFilterDialog = new Dialog({
			stretch: Device.system.phone
		});
		this._oFilterDialog.setParent(this);
	
		this._oFilterDialog.addStyleClass("sapUiPopupWithPadding");
	
		if (this.$().closest(".sapUiSizeCompact").length > 0) {
			this._oFilterDialog.addStyleClass("sapUiSizeCompact");
		}
	
		this._oFilterDialog.addStyleClass("sapUiCompFilterBarDialog");
		if (!this._isPhone()) {
			this._oFilterDialog.addStyleClass("sapUiCompFilterBarDialogNonPhone");
		}
	
		// oDialog.afterClose
		this._oFilterDialog.setTitle(this._oRb.getText("FILTER_BAR_ADV_FILTERS_DIALOG"));
	
		this._oFilterDialog.addStyleClass("sapMH4FontSize");
		this._oFilterDialog.addStyleClass("sapMH4Style");
	
		this._oFilterDialog.setVerticalScrolling(true);
	
		var oSubHeader = new Bar();
		var oSearchField = new SearchField({placeholder: this._oRb.getText("FILTER_BAR_SEARCH")});
		oSearchField.attachLiveChange(function(oEvent) {
			if (that._oFilterDialog) {
				that._triggerSearchInFilterDialog(oEvent);
			}
		});
	
		oSubHeader.addContentRight(oSearchField);
		this._oFilterDialog.setSubHeader(oSubHeader);
	
		var oForm = this._createFiltersAndAdaptBasicArea();
		if (!oForm) {
			jQuery.sap.log.error("Content for Advanced Filters Dialog could not be created");
			return;
		}
		this._oFilterDialog.addContent(oForm);
		
		
		this._bOKFiltersDialogTriggered	= false;
		
		this._oFilterDialog.attachBeforeClose(function() {	
			if (!that._bOKFiltersDialogTriggered) {
				that._cancelFilterDialog();
			}			
			that._closeDialogAndRestoreFilterBar(oForm);			
		});		

		this._oFilterDialog.attachAfterClose(function() {	
			that._oBasicAreaLayout.rerender(); // seems to be required from 1.32...	
			
			that._oInitialVariant = null;			
			that._oFilterDialog.destroy();
			that._oFilterDialog = null;				
		});				
		
		this._oFilterDialog.setInitialFocus(oSearchField);
	
		this._addFilterDialogButtons(oForm);
	
		if (!this._isPhone()) {
			this._oFilterDialog.setContentWidth("42rem");
		}
	
		var nHeight = jQuery(document).height() / 16;
		this._oFilterDialog.setContentHeight((nHeight - 17) + "rem");
	
		this._bDirtyViaDialog = false;				
		this._oFilterDialog.open();
	};
	
	FilterBar.prototype._addFilterDialogButtons = function(oForm) {

		var that = this;
		var oModel, aButtons = [];
		var oVariantSaveButton = null, oClearButton, oRestoreButton, oSearchButton, oCancelButton;
		var oActionsButton;

		var nButtonTextSize = 0, nMaxButtonTextSize = 50;
		
		// search button
		oSearchButton = new Button({
			text: this._oRb.getText("FILTER_BAR_GO"),
			press: function() {				
				that._bOKFiltersDialogTriggered = true;				
				oSearchButton.focus();
				that._searchRequested(oForm);
			},
			type: ButtonType.Emphasized
		});
		this._oFilterDialog.addButton(oSearchButton);
		nButtonTextSize += oSearchButton.getText().length;		


		if (!this.getAdvancedMode()) {

			// variant save button
			if (this._oVariantManagement && this._oVariantManagement.getVisible() && this._oVariantManagement.oVariantSave) {
				oVariantSaveButton = new Button({
					text: this._oRb.getText("VARIANT_MANAGEMENT_SAVE"),
					enabled: this._oVariantManagement.oVariantSave.getEnabled(),
					press: function() {
						that._variantSavePressed();
					}
				});

				oModel = this._oVariantManagement.getModel("save_enablement");

				oVariantSaveButton.setModel(oModel);
				oVariantSaveButton.bindProperty("enabled", "/enabled");

				aButtons.push(oVariantSaveButton.clone());
				oVariantSaveButton.addStyleClass("sapUiHideOnPhone");
				this._oFilterDialog.addButton(oVariantSaveButton);
				
				nButtonTextSize += oVariantSaveButton.getText().length;
			}

			// clear button
			oClearButton = new Button({			
				text: this._oRb.getText("FILTER_BAR_CLEAR"),
				visible: this.getShowClearButton(),
				press: function() {
					that.clear();
				}
			});

			if (oClearButton.getVisible()) {
				aButtons.push(oClearButton.clone());
				nButtonTextSize += oClearButton.getText().length;				
			}
			oClearButton.addStyleClass("sapUiHideOnPhone");
			this._oFilterDialog.addButton(oClearButton);

			// restore button
			oRestoreButton = new Button({
				text: this._oRb.getText("FILTER_BAR_RESTORE"),
				visible: this.getShowRestoreButton(),
				press: function() {
					that.reset();

					if (that._oVariantManagement) {
						that._oVariantManagement.currentVariantSetModified(false);
					}
				}
			});

			if (oModel) {
				oRestoreButton.setEnabled( this._oVariantManagement.oVariantSave.getEnabled());
				oRestoreButton.setModel(oModel);
				oRestoreButton.bindProperty("enabled", "/enabled");
			}

			if (oRestoreButton.getVisible()) {
				aButtons.push(oRestoreButton.clone());
				nButtonTextSize += oRestoreButton.getText().length;				
			}
			oRestoreButton.addStyleClass("sapUiHideOnPhone");
			this._oFilterDialog.addButton(oRestoreButton);		


			// Cancel button
			oCancelButton = new Button({	
				text: this._oRb.getText("FILTER_BAR_CANCEL"),
				press: function() {
					//that._cancelFilterDialog();
					that._oFilterDialog.close();		
				}
			});
			this._oFilterDialog.addButton(oCancelButton);
			nButtonTextSize += oCancelButton.getText().length;	
			
			if (!this._isPhone() && nButtonTextSize > nMaxButtonTextSize) {
				
				if (oVariantSaveButton) {
					oVariantSaveButton.addStyleClass("sapUiCompFilterBarButtonHide");
				}				
				oClearButton.addStyleClass("sapUiCompFilterBarButtonHide");				
				oRestoreButton.addStyleClass("sapUiCompFilterBarButtonHide");								
			}
			

			if (aButtons.length > 0) {

				// Actions
				this._oActionSheet = new ActionSheet({
					showCancelButton: true,
					buttons: aButtons,
					placement: PlacementType.Top
				});
				oActionsButton = new Button({
					icon: "sap-icon://overflow",
					press: function() {
						that._oActionSheet.openBy(this);
					},
					tooltip: this._oRb.getText("FILTER_BAR_ACTIONS")
				});			
				
				if (nButtonTextSize <= nMaxButtonTextSize) {
					oActionsButton.addStyleClass("sapUiVisibleOnlyOnPhone");
				}

				this._oFilterDialog.addButton(oActionsButton);
			}

		}
	};
	

	FilterBar.prototype._createButtons = function(oToolbar) {

		var that = this;

		this._oHideShowButton = new Button({
			text: this._oRb.getText("FILTER_BAR_HIDE"),
			type: ButtonType.Transparent
		});
		this._oHideShowButton.attachPress(function() {
			that._toggleHideShow();
		});
		oToolbar.addContent(this._oHideShowButton);

		// clear button
		this._oClearButtonOnFB = new Button({
			visible: this.getShowClearOnFB(),
			text: this._oRb.getText("FILTER_BAR_CLEAR"),
			type: ButtonType.Transparent
		});
		this._oClearButtonOnFB.attachPress(function() {
			that.clear();
		});
		oToolbar.addContent(this._oClearButtonOnFB);


		this._oRestoreButtonOnFB = new Button({
			visible: this.getShowRestoreOnFB(),
			text: this._oRb.getText("FILTER_BAR_RESTORE"),
			type: ButtonType.Transparent
		});
		this._oRestoreButtonOnFB.attachPress(function() {
			that.reset();
			if (that._oVariantManagement) {
				that._oVariantManagement.currentVariantSetModified(false);
			}				
		});
		oToolbar.addContent(this._oRestoreButtonOnFB);


		this._oFiltersButton = new Button({
			text: this._oRb.getText("FILTER_BAR_ACTIVE_FILTERS_ZERO"),
			type: ButtonType.Transparent
		});

		this._oFiltersButton.attachPress(function() {
			that._showFilterDialog();
		});
		oToolbar.addContent(this._oFiltersButton);

		this._oSearchButton = new Button({
			visible: this.getShowGoOnFB(),
			text: this._oRb.getText("FILTER_BAR_GO"),
			type: ButtonType.Emphasized
		});
		this._oSearchButton.attachPress(function() {
			that._oSearchButton.focus();
			that.search();
		});
		oToolbar.addContent(this._oSearchButton);
	};	
	
	
	/**
	 * Creates the variant management.
	 * 
	 * @private
	 * @returns {sap.ui.comp.variants.VariantManagement} the VM control
	 */
	FilterBar.prototype._createVariantLayout = function() {
	
		this._oVariantManagement = this._createVariantManagement();
		this._oVariantManagement.setVisible(false);
	
		this._fSaveVariant = jQuery.proxy(this._variantSave, this);
		this._oVariantManagement.attachSave(this._fSaveVariant);
	
		this._fAfterSaveVariant = jQuery.proxy(this._afterVariantSave, this);
		this._oVariantManagement.attachAfterSave(this._fAfterSaveVariant);
	
		return this._oVariantManagement;
	};
	
	/**
	 *  Creates the layout for the basic area.
	 * 
	 * @private
	 * @returns {sap.m.Toolbar} the toolbar
	 */
	FilterBar.prototype._createToolbar = function() {

		var oToolbar = new Toolbar();
	
		var oVariantLayout = this._createVariantLayout();
		oToolbar.addContent(oVariantLayout);
	
		oToolbar.addContent(new ToolbarSpacer());
		
		this._createButtons(oToolbar);
	
		oToolbar.addStyleClass("sapUiCompFilterBarToolbar");
		oToolbar.addStyleClass("sapUiCompFilterBarToolbarMarker");
		return oToolbar;
	};
	
	/**
	 * Creates the layout for the basic area.
	 * 
	 * @private
	 * @returns {sap.ui.layout.HorizontalLayout} the layout for the selected fields
	 */
	FilterBar.prototype._createBasicAreaLayout = function() {
	
		// form for selection parameters
		var oBasicAreaLayout = new HorizontalLayout();
		oBasicAreaLayout.setAllowWrapping(true);
	
		oBasicAreaLayout.addStyleClass("sapUiCompFilterBarWidth100");
		oBasicAreaLayout.addStyleClass("sapUiCompFilterBarBasicArea");
		return oBasicAreaLayout;
	};
	
	/**
	 * Creates the form for the advanced area, where all the filters will be placed. Only relevant for the value help scenario.
	 * 
	 * @private
	 * @returns {sap.ui.layout.form.Form} the form for the filter fields
	 */
	FilterBar.prototype._createAdvancedAreaForm = function() {

		var oAdvancedLayout = new ResponsiveGridLayout();
	
		oAdvancedLayout.addStyleClass("sapUiCompFilterBarPaddingForm");
	
		oAdvancedLayout.setColumnsL(3);
		oAdvancedLayout.setColumnsM(2);
		var oForm = new Form({
			editable: true
		});
		oForm.setLayout(oAdvancedLayout);
	
		return oForm;
	};
	
	/**
	 * Adds a selection field to a FormContainer and this FormContainer to the basic area form.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterItem filter
	 * @returns {sap.ui.layout.VerticalLayout} the container
	 */
	FilterBar.prototype._addControlToBasicAreaFormContainer = function(oFilterItem) {
	
		var oControl = oFilterItem.getControl();
		if (!oControl) {
			jQuery.sap.log.error("no Control obtained");
			return null;
		}
	
		var oLabel = oFilterItem.getLabelControl(this.getId());
		if (!oLabel) {
			jQuery.sap.log.error("no Label obtained");
			return null;
		}
	

		this._adaptGroupTitleForFilter(oFilterItem);
	
	
		return this._addControlToBasicAreaContainer(oFilterItem, oControl, oLabel);
	};
	
	/**
	 * Adds a selection field to a FormContainer and the FormContainer to the basic area form
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterBar} oFilterItem the filter item
	 * @param {sap.ui.core.Control} oControl the filter control
	 * @param {sap.m.Label} oLabel the label of the filter
	 * @returns {sap.ui.layout.VerticalLayout} the container
	 */
	FilterBar.prototype._addControlToBasicAreaContainer = function(oFilterItem, oControl, oLabel) {

		var oVLayout = new VerticalLayout();
		oVLayout.setLayoutData(new ResponsiveFlowLayoutData({
			margin: true
		}));

		// if no width is set, use default width
		if (oControl.getWidth) {
			// if ((oControl.getWidth() === "100%") || (oControl.getWidth() === "")) {
			oVLayout.setWidth("12rem");
			// }
		}


		if (oLabel) {
			oVLayout.addContent(oLabel);
			oLabel.setLabelFor(oControl);
		}

		oVLayout.addContent(oControl);
		
		oVLayout.addStyleClass("sapUiCompFilterBarPaddingRight");
		oVLayout.addStyleClass("sapUiCompFilterBarPaddingTop");
		
		if (!this.getAdvancedMode()) {
			this._oBasicAreaLayout.addContent(oVLayout);
		}

		return oVLayout;
	};
	
	
	FilterBar.prototype._rerenderAA = function() {
		
		this._oAdvancedAreaForm.removeAllFormContainers();
	
		var aControls = this._flattenMap();		
		this._layOutAA(aControls);
	};
	
	
	/**
	 * Recreates the layout for all visible filters in the advanced area.
	 * 
	 * @private
	 * @param {array} aControls list of visible advanced area filter elements
	 */
	FilterBar.prototype._layOutAA = function(aControls) {

		if (this._mAdvancedAreaFilter && Object.keys(this._mAdvancedAreaFilter).length > 1) {
			this._layOutAAMultipleGroup(aControls);
		} else {
			this._layOutAASingleGroup(aControls);
		}
	};	
	
	/**
	 * Recreates the layout for all visible filters in the advanced area. Each Group will be rendered in a FormContainer.
	 * 
	 * @private
	 * @param {array} aControls list of visible advanced area filter elements
	 */
	FilterBar.prototype._layOutAAMultipleGroup = function(aControls) {

		var i, j, nGroups = 0;
		var oFormContainer = null;
	
		for (i = 0; i < aControls.length; i++) {
			if (aControls[i].control === null) {
				nGroups++;
			}
		}
	
		var oAdvancedLayout = this._oAdvancedAreaForm.getLayout();
		if (oAdvancedLayout) {
			if (nGroups >= 3) {
				oAdvancedLayout.setLabelSpanL(5);
				oAdvancedLayout.setLabelSpanM(5);
				oAdvancedLayout.setColumnsL(3);
				oAdvancedLayout.setColumnsM(2);
			} else if (nGroups === 2) {
				oAdvancedLayout.setLabelSpanL(4);
				oAdvancedLayout.setLabelSpanM(5);
				oAdvancedLayout.setColumnsL(2);
				oAdvancedLayout.setColumnsM(2);
			} else if (nGroups === 1) {
	
				// + dummy group
				oAdvancedLayout.setLabelSpanL(4);
				oAdvancedLayout.setLabelSpanM(5);
				oAdvancedLayout.setColumnsL(2);
				oAdvancedLayout.setColumnsM(2);
			}
		}
			
			
		for (i = 0; i < aControls.length; i++) {			
			if (aControls[i].control === null) {
				oFormContainer = new FormContainer();
	
				if (Object.keys(this._mAdvancedAreaFilter).length > 1) { // hide group when only one group is present
					
					oFormContainer.setTitle(aControls[i].filterItem.getGroupTitle());
				}
				this._oAdvancedAreaForm.addFormContainer(oFormContainer);
	
				j = i + 1;
				while (j < aControls.length && (aControls[j].control)) {
					this._addControlToAdvancedArea(aControls[j].filterItem, aControls[j].control, oFormContainer);
					j++;
				}
	
				i = j - 1;
			}
		}
	
		if (nGroups === 1) {
			this._oAdvancedAreaForm.addFormContainer(new FormContainer()); // dummy
		}
	};
	
	/**
	 * If only one group with multiple filter fields is available, it will be layouted in two columns. a dummy group will be created and the controls will be destributed between them.
	 * 
	 * @private
	 * @param {array} aControls list of visible advanced area filter elements. First element is a group
	 */
	FilterBar.prototype._layOutAASingleGroup = function(aControls) { // adapt to LMS
	
		var i, idx, nCount, bMod;
		var nFields = aControls.length - 1;
		var nNewGroups = nFields > 2 ? 2 : 1;
		
		if (nNewGroups > 1) {
			nCount = Math.floor(nFields / nNewGroups);
			bMod = ((nCount * nNewGroups) < nFields);
	
			for (i = 1; i < nNewGroups; i++) {
				idx = i * nCount;
				if (bMod) {
					++idx;
				}
	
				if ((idx + i) < aControls.length) {
					aControls.splice(idx + i, 0, aControls[0]); // add dummy group
				}
			}
		}
	
		this._layOutAAMultipleGroup(aControls);
	};	
	
	/**
	 * Converts the map containing the advanced area filters to an array for simpler handling; only visible filter items are considered.
	 * 
	 * @private
	 * @returns {array} oControl the visible filter fields
	 */
	FilterBar.prototype._flattenMap = function() {

		var n = null, i;
		var aControls = [];
		var bGroupIsAdded;
	
		if (this._mAdvancedAreaFilter) {
	
			for (n in this._mAdvancedAreaFilter) {
	
				if (n && this._mAdvancedAreaFilter[n].items) {
	
					bGroupIsAdded = false;
					for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
						var oItem = this._mAdvancedAreaFilter[n].items[i];
	
						if (oItem.filterItem && oItem.filterItem.getVisibleInFilterBar() && oItem.filterItem.getVisible()) {
	
							if (!bGroupIsAdded) {
								bGroupIsAdded = true;
	
								aControls.push({
									control: null,
									filterItem: this._mAdvancedAreaFilter[n].filterItem
								});
							}
	
							aControls.push({
								control: oItem.control,
								filterItem: oItem.filterItem
							});
						}
					}
				}
			}
		}
	
		return aControls;
	};
	
	
	/**
	 * Executes search in the 'Add/Remove Filters' dialog.
	 * 
	 * @private
	 * @param {string} sValue the search string
	 */
	FilterBar.prototype._triggerSearchByValue = function(sValue) {
	
		var i, sText, sTooltip;
		var aCells;
		var bIsVisible;
	
		sValue = sValue.replace(/^\s+|\s+$/g, "").toLowerCase();
	
		if (this._aListItems) {
	
			var iSelectedItems = 0;
			for (i = this._aListItems.length - 1; i >= 0; i--) {
	
				aCells = this._aListItems[i].getContent();
				if (aCells.length === 2) {
					sText = aCells[1].getText();
					sTooltip = this._aListItems[i].data("quickinfo");
					// we want to show an item if it's either an item matching the search or if it's a group item with at least one item selected.
					if ((sText.toLowerCase().indexOf(sValue) >= 0 || (sTooltip && sTooltip.toLowerCase().indexOf(sValue) >= 0)) || (this._aListItems[i].hasStyleClass("sapUiCompFilterBarGroupListItem") && iSelectedItems > 0)) {
	
						bIsVisible = true;
						if (this._aListItems[i].hasStyleClass("sapUiCompFilterBarGroupListItem")) {
	
							if (!iSelectedItems) {
								bIsVisible = false; // matching text for group, but not hits in items
							}
	
						} else {
							iSelectedItems++; // a matching non-group item
						}
						this._aListItems[i].setVisible(bIsVisible);
					} else {
						this._aListItems[i].setVisible(false); // no hit
					}
				}
			}
		}
	};
	
	
	/**
	 * Reacts to search field selection. 
	 * 
	 * @private
	 * @param {object} oEvent containing the search string
	 */
	FilterBar.prototype._triggerSearch = function(oEvent) {
	
		if (!oEvent) {
			return;
		}
	
		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}
	
		var sValue = parameters.newValue ? parameters.newValue : "";
	
		this._triggerSearchByValue(sValue);
	};
	
	/**
	 * Reacts to search field selection. Hide all non matching list entries.
	 * 
	 * @private
	 * @param {string} sValue the search string
	 */
	FilterBar.prototype._triggerSearchByValueInFilterDialog = function(sValue) {
	
		var n = null, i;
		var sText, sTooltip;
		var oGroupElement, oFilterItem;
		var nCountInvisibleElements;
		var nCountNonPartOfCurrentVariant;
	
		sValue = sValue.replace(/^\s+|\s+$/g, "").toLowerCase();
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
	
						nCountInvisibleElements = 0;
						nCountNonPartOfCurrentVariant = 0;
	
						for (i = 0; i < oGroupElement.items.length; i++) {
							if (oGroupElement.items[i] && oGroupElement.items[i].filterItem && oGroupElement.items[i].formelement) {
	
								oFilterItem = oGroupElement.items[i].filterItem;
	
								if (oFilterItem.getVisible()) {
	
									if (sValue) {
	
										// if (oFilterItem.getPartOfCurrentVariant()) {
										sText = oFilterItem.getLabel();
										sTooltip = oFilterItem.getLabelTooltip();
	
										if ((sText.toLowerCase().indexOf(sValue) >= 0 || (sTooltip && sTooltip.toLowerCase().indexOf(sValue) >= 0))) {
											if (oFilterItem.getPartOfCurrentVariant()) {
												oGroupElement.items[i].formelement.setVisible(true);
											} else {
												++nCountNonPartOfCurrentVariant;
											}
										} else {
											++nCountInvisibleElements;
											oGroupElement.items[i].formelement.setVisible(false);
										}
	
									} else {
										// reset to a state without considering search
										oGroupElement.items[i].formelement.setVisible(oFilterItem.getVisibleInFilterBar() || oFilterItem.getPartOfCurrentVariant());
										if (oGroupElement.link && !oGroupElement.link.getVisible()) {
											oGroupElement.link.setVisible(true);
										}
									}
								} else {
									++nCountInvisibleElements;
								}
							}
						}
	
						if (oGroupElement && oGroupElement.formcontainer) {
							if (nCountInvisibleElements === oGroupElement.items.length) {
								oGroupElement.formcontainer.setVisible(false);
							} else {
								oGroupElement.formcontainer.setVisible(true);

								if (oGroupElement.link) {
									oGroupElement.link.setVisible((sValue && (nCountNonPartOfCurrentVariant === 0)) ? false : true);

									if (sValue && (nCountNonPartOfCurrentVariant > 0)) {
										this._setLinkTextAndCount(n, oGroupElement.link, nCountNonPartOfCurrentVariant);
									} else {
										this._setLinkText(n, oGroupElement.link);
									}
								}
							}
						}
					}
				}
			}
		}
	};
	
	/**
	 * Reacts to search from 'Filters'- dialog. Hide all non matching list entries.
	 * 
	 * @private
	 * @param {object} oEvent containing the search string
	 */
	FilterBar.prototype._triggerSearchInFilterDialog = function(oEvent) {
	
		if (!oEvent) {
			return;
		}
	
		var parameters = oEvent.getParameters();
		if (!parameters) {
			return;
		}
	
		var sValue = parameters.newValue ? parameters.newValue : "";
	
		this._sSearchCriteriaInFiltersDialog = sValue;
	
		this._triggerSearchByValueInFilterDialog(sValue);
	};
	
	/**
	 * Generate for a passed group all the filters in the 'Add/Remove Filters'-dialog
	 * 
	 * @private
	 * @param {string} sGroupName filter group name
	 * @returns {array} the list of advanced area filter fields
	 */
	FilterBar.prototype._generateListItems = function(sGroupName) {
	
		var i;
		var oListItem, aAdvacedElements;
		var aListItems = [];
		var oLabel, oCheckBox;
		var bCompactMode = false;
	
		if (this.$().closest(".sapUiSizeCompact").length > 0) {
			bCompactMode = true;
		}
	
		if (sGroupName && this._mAdvancedAreaFilter) {
	
			aAdvacedElements = this._mAdvancedAreaFilter[sGroupName];
	
			if (aAdvacedElements && aAdvacedElements.items) {
	
			
//				if (this.Dialog) {
//					this._oDialog.setTitle(this._oRb.getText("SELECT_FILTER_FIELDS"));
//					//aAdvacedElements.filterItem.getGroupTitle() 
//				}
					
				for (i = 0; i < aAdvacedElements.items.length; i++) {
					var oItem = aAdvacedElements.items[i];
	
					if (oItem && oItem.filterItem) {
	
						if (!oItem.filterItem.getVisible()) {
							continue;
						}
	
						oListItem = new CustomListItem();	
						oListItem.setVisible(true);
	
						// details
						if (!bCompactMode) {
							oListItem.addStyleClass("sapUiCompFilterBarListItem");
						} else {
							oListItem.addStyleClass("sapUiCompFilterBarListItemCompact");
						}
						oListItem.data("quickinfo", oItem.filterItem.getLabelTooltip());
	
						oCheckBox = new CheckBox();
						oCheckBox.setSelected(oItem.filterItem.getPartOfCurrentVariant());
						if (((oItem.filterItem.getMandatory() && oItem.checkbox && !oItem.checkbox.getEnabled()) || oItem.filterItem.getVisibleInFilterBar())) {
							oCheckBox.setEnabled(false);
						}
	
						oItem.initialPartOfCurrentVariant = oItem.filterItem.getPartOfCurrentVariant();
	
						oCheckBox.attachSelect(jQuery.proxy(this._selectionChangedInAddFiltersDialog, this, oCheckBox, oItem));
	
						oListItem.addContent(oCheckBox);
	
						oLabel = new Label({
							text: oItem.filterItem.getLabel(),
							tooltip: oItem.filterItem.getLabelTooltip()
						});
						oListItem.addContent(oLabel);
						aListItems.push(oListItem);
					}
				}
			}
		}
	
		return aListItems;
	};
	
	/**
	 * Adapts the visibility of the filter containers.
	 * 
	 * @private
	 * @param {object} oItem representing the filter item
	 */
	FilterBar.prototype._rerenderItem = function(oItem) {
	
		if (oItem) {
			if (oItem.container) {
				oItem.container.setVisible(oItem.filterItem.getVisible() && oItem.filterItem.getVisibleInFilterBar());
			}
	
			if (oItem.formelement) {
				oItem.formelement.setVisible(oItem.filterItem.getVisible() && (oItem.filterItem.getVisibleInFilterBar() || oItem.filterItem.getPartOfCurrentVariant()));
				if (oItem.checkbox) {
					oItem.checkbox.setSelected(oItem.filterItem.getVisibleInFilterBar());
				}
			}
		}
	};
	
	/**
	 * Adapt the visibility for all filter containers.
	 * 
	 * @private
	 */
	FilterBar.prototype._rerenderFilters = function() {
	
		var i;
		var n = null;
		var oItem = null;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n && this._mAdvancedAreaFilter[n] && this._mAdvancedAreaFilter[n].items) {
					for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
						oItem = this._mAdvancedAreaFilter[n].items[i];
						this._rerenderItem(oItem);
					}
				}
			}
		}
	
		this._updateToolbarText();
	};
	
	/**
	 * Adapts the visibility for all filter containers.
	 * 
	 * @private
	 */
	FilterBar.prototype.rerenderFilters = function() {

		this._rerenderFilters();
	};
	
	/**
	 * Cleans-up and closes the 'Add/Remove Filters'- dialog.
	 * 
	 * @private
	 * @param {string} sGroupName name of the group for which the filters will be displayed
	 * @param {sap.m.Link} oLink control from filters dialog
	 */
	FilterBar.prototype._closeAddRemoveFiltersDialog = function(sGroupName, oLink) {
	
		if (sGroupName && oLink) {
			if (this._sSearchCriteriaInFiltersDialog && this._oFilterDialog) {
				this._triggerSearchByValueInFilterDialog(this._sSearchCriteriaInFiltersDialog);
			} else {
				this._setLinkText(sGroupName, oLink);
			}
		}
	
		//this._oDialog.close();
	};
	
	/**
	 * Eventhandler for the 'Cancel'-button on the 'Add/Remove Filters'- dialog. 
	 * 
	 * @private
	 * @param {string} sGroupName name of the group for which the filters will be displayed
	 */
	FilterBar.prototype._cancelAddRemoveFiltersDialog = function(sGroupName) {

		var i;
		var oItem;
	
		if (sGroupName && this._mAdvancedAreaFilter && this._mAdvancedAreaFilter[sGroupName] && this._mAdvancedAreaFilter[sGroupName].items) {
			for (i = 0; i < this._mAdvancedAreaFilter[sGroupName].items.length; i++) {
				oItem = this._mAdvancedAreaFilter[sGroupName].items[i];
				if (oItem.initialPartOfCurrentVariant !== undefined && oItem.filterItem) {
					if (oItem.filterItem.getPartOfCurrentVariant() !== oItem.initialPartOfCurrentVariant) {
						oItem.filterItem.setPartOfCurrentVariant(oItem.initialPartOfCurrentVariant);
	
						this._rerenderItem(oItem);
	
						this._notifyAboutChangedFilters(oItem.initialPartOfCurrentVariant, oItem.control);
					}
				}
			}
		}
	
		if (this._oVariantManagement && (this._oVariant.modified2 !== undefined)) {
			this._oVariantManagement.currentVariantSetModified(this._oVariant.modified2);
		}
	};
	
	/**
	 * Creates the 'Add/Remove Filters' - dialog.
	 * 
	 * @private
	 * @param {string} sGroupName filter group name
	 * @param {sap.m.Link} oLink more/clear filters link
	 */
	FilterBar.prototype._createAddRemoveFiltersDialog = function(sGroupName, oLink) {

		var i;
		var that = this;
	
		if (!sGroupName) {
			return;
		}
	
		this._oDialog = new Dialog({
			stretch: Device.system.phone
		});
		this._oDialog.addStyleClass("sapUiPopupWithPadding");
		this._oDialog.addStyleClass("sapUiCompAddRemoveFilterDialog");
	
		if (this.$().closest(".sapUiSizeCompact").length > 0) {
			this._oDialog.addStyleClass("sapUiSizeCompact");
		}
	
		this._oDialog.setTitle(this._oRb.getText("SELECT_FILTER_FIELDS"));
	
		this._oDialog.addStyleClass("sapMH4FontSize");
		this._oDialog.addStyleClass("sapMH4Style");
	
		this._oDialog.setVerticalScrolling(true);
	
		var oSubHeader = new Bar();
		var oSearchField = new SearchField({placeholder: this._oRb.getText("FILTER_BAR_SEARCH")});
		this._oSearchField = oSearchField;
		oSearchField.attachLiveChange(function(oEvent) {
			that._triggerSearch(oEvent);
		});
	
		oSubHeader.addContentRight(oSearchField);
		this._oDialog.setSubHeader(oSubHeader);
	
		var oList = new List();
		oList.setShowSeparators(ListSeparators.None);
		this._oDialog.addContent(oList);
	
		this._aListItems = this._generateListItems(sGroupName);
	
		for (i = 0; i < this._aListItems.length; i++) {
			oList.addItem(this._aListItems[i]);
		}
	
		if (this._oVariant && this._oVariantManagement) {
			this._oVariant.modified2 = this._oVariantManagement.currentVariantGetModified();
		}

		this._bOKButtonAddRemoveFilterDialogTriggered = false;		
		
		// OK button
		var oOKButton = new Button({
			text: this._oRb.getText("FILTER_BAR_OK")
		});
		oOKButton.attachPress(function() {			
			//that._closeAddRemoveFiltersDialog(sGroupName, oLink);
			that._bOKButtonAddRemoveFilterDialogTriggered = true;
			that._oDialog.close();			
		});
		this._oDialog.addAggregation("buttons", oOKButton);
	
		this._oDialog.setInitialFocus(this._oSearchField);
	
		this._oDialog.setContentHeight("23.25rem"); // 30.25 - 2*2.5rem - 2rem
	
		if (this._sSearchCriteriaInFiltersDialog) {
			this._triggerSearchByValue(this._sSearchCriteriaInFiltersDialog);
		}
	
		// Cancel button
		var oCancelButton = new Button({		
			text: this._oRb.getText("FILTER_BAR_CANCEL"),
			press: function() {			
//				that._cancelAddRemoveFiltersDialog(sGroupName);
//				that._closeAddRemoveFiltersDialog(sGroupName, oLink);
				that._oDialog.close();					
			}
		});
		this._oDialog.addAggregation("buttons", oCancelButton);
		
		this._oDialog.attachBeforeClose(function() {	
			if (!that._bOKButtonAddRemoveFilterDialogTriggered) {
				that._cancelAddRemoveFiltersDialog(sGroupName);
			}
			
			that._closeAddRemoveFiltersDialog(sGroupName, oLink);			
		});

		this._oDialog.attachAfterClose(function() {	
			that._oDialog.destroy();
			that._oDialog = null;			
		});			
	
		this._oDialog.open();
	};
	
	/**
	 * Handles the selection change of the checkbox in the 'Add/Remove Filters' - dialog.
	 * 
	 * @private
	 * @param {sap.m.Checkbox} oCheckBox representing visible in filter bar
	 * @param {object} oItem internal object associated with this checkbox
	 */
	FilterBar.prototype._selectionChangedInAddFiltersDialog = function(oCheckBox, oItem) {

		var bVisible = oCheckBox.getSelected();
	
		if (!bVisible && ((oItem.filterItem.getMandatory() && !oItem.checkbox.getEnabled()) || oItem.filterItem.getVisibleInFilterBar())) {
			oCheckBox.setSelected(true);
			return; // only enabled entries (mandatory with values) can be removed from the filters dialog
		}
	
		oItem.filterItem.setPartOfCurrentVariant(bVisible);
	
		this._rerenderItem(oItem);
	
		this._notifyAboutChangedFilters(bVisible, oItem.control);
	};
	
	/**
	 * Sets the semaphore for variant change.
	 * 
	 * @private
	 * @param {boolean} bFlag setting the semaphore state
	 */
	FilterBar.prototype._setConsiderFilterChanges = function(bFlag) {
	
		this._filterChangeSemaphore = bFlag;
	};
	
	/**
	 * Retrieves the semaphore for variant change.
	 * 
	 * @private
	 * @returns {boolean} the semaphore state
	 */
	FilterBar.prototype._getConsiderFilterChanges = function() {

		return this._filterChangeSemaphore;
	};
	
	/**
	 * Notifies about a filter change.
	 * 
	 * @private
	 * @param {object} oEvent general event object
	 * @param {boolean} bDoNotPropagate if set do not raise the filterChange event
	 */
	FilterBar.prototype.fireFilterChange = function(oEvent) {

		this._updateToolbarText();
	
		if (this._getConsiderFilterChanges() && this._oVariantManagement && this._oVariantManagement.getEnabled()) {
			this._oVariantManagement.currentVariantSetModified(true);
		}
	
		if (this._oFilterDialog && !(this._oFilterDialog.isOpen())) {
			return;
		}
	
		this._bDirtyViaDialog = true;
		this.fireEvent("filterChange", oEvent);
	};
	
	/**
	 * Prepares event object and fire the 'filterChange' event.
	 * 
	 * @private
	 * @param {boolean} bVisible indicated whether an filter was added or removed
	 * @param {sap.ui.core.Control} oControl which was either added or removed
	 */
	FilterBar.prototype._notifyAboutChangedFilters = function(bVisible, oControl) {
	
		var oObj;
	
		if (bVisible) {
			oObj = {
				"added": oControl
			};
		} else {
			oObj = {
				"deleted": oControl
			};
		}
	
		this.fireFilterChange(oObj);
	
	};
		
	/**
	 * Prepares the information of all filters for the variant persistency. 
	 * 
	 * @private
	 * @param {boolean} bConsiderInvisibleFilters indicates if invisible filters should be considered
	 * @returns {array} of variant specific filter info
	 */
	FilterBar.prototype._determineVariantFiltersInfo = function(bConsiderInvisibleFilters) {
	
		var i;
		var n = null, oItem;
	
		var aFilters = null;
	
		if (this._mAdvancedAreaFilter) {
	
			for (n in this._mAdvancedAreaFilter) {
	
				if (n) {
					if (this._mAdvancedAreaFilter[n].items) {
	
						for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
							oItem = this._mAdvancedAreaFilter[n].items[i];
	
							if (bConsiderInvisibleFilters || oItem.filterItem.getVisible()) {
								if (!aFilters) {
									aFilters = [];
								}
								aFilters.push({
									group: oItem.filterItem.getGroupName(),
									name: oItem.filterItem.getName(),
									partOfCurrentVariant: oItem.filterItem.getPartOfCurrentVariant(),
									visibleInFilterBar: oItem.filterItem.getVisibleInFilterBar()
								});
							}
						}
					}
				}
			}
		}
	
		return aFilters;
	};
	
	/**
	 * Adds a filter to the form container.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem the corresponding filter item
	 * @param {sap.ui.core.Control} oControl the control itself
	 * @param {sap.ui.layout.form.FormContainer} oFormContainer in which the control will be added
	 */
	FilterBar.prototype._addControlToAdvancedArea = function(oFilterItem, oControl, oFormContainer) {
	
		var oFormElement = new FormElement({
			label: oFilterItem.getLabelControl(this.getId()),
			fields: [
				(oControl !== null) ? oControl : new Text()
			]
		});
	
		oFormContainer.addFormElement(oFormElement);
	};
	
	/**
	 * Determines if an item is relevant for the query, based on its visibility.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem which is beeing checked
	 * @returns {boolean} true for relevant, false for not relevat
	 */
	FilterBar.prototype._determineVisibility = function(oFilterItem) {

		var bVisible = false;
	
		if (oFilterItem) {
			bVisible = oFilterItem.getVisible() && (oFilterItem.getVisibleInFilterBar() || oFilterItem.getPartOfCurrentVariant());
		}
	
		return bVisible;
	};
	
	
	/**
	 * Returns an array of all visible filters.
	 * 
	 * @private
	 * @returns {array} all visible advanced items
	 */
	FilterBar.prototype._retrieveVisibleAdvancedItems = function() {
	
		var i, n = null, oItem;
		var aAdvancedItems = [];
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {	
					if (this._mAdvancedAreaFilter[n] && this._mAdvancedAreaFilter[n].items) {
						for (i = 0; i < this._mAdvancedAreaFilter[n].items.length; i++) {
							oItem = this._mAdvancedAreaFilter[n].items[i];
							if (oItem) {
								// if (oItem.filterItem.getVisibleInFilterBar() || oItem.filterItem.getPartOfCurrentVariant()) {
								if (this._determineVisibility(oItem.filterItem)) {
									aAdvancedItems.push(oItem);
								}
							}
						}
					}
				}
			}
		}
	
		return aAdvancedItems;
	};
	
	/**
	 * Retrieves the controls for all visible filters.
	 * 
	 * @private
	 * @returns {array} all visible controls from the basic and advanced area area
	 */
	FilterBar.prototype._retrieveCurrentSelectionSet = function() {
	
		var i;
		var aControls = [];

		var aItems = this._retrieveVisibleAdvancedItems();
		
		for (i = 0; i < aItems.length; i++) {
			if (aItems[i].control) {
				aControls.push(aItems[i].control);
			}
		}
		
		return aControls;
	};
	
	/**
	 * Executes the search event. Controls of all visible filters will be passed as event-parameters.
	 * 
	 * @private
	 * @returns {boolean} indicates the validation result. true means no validation errors.
	 */
	FilterBar.prototype.search = function() {
	
		var parameter = {};
		parameter.selectionSet = this._retrieveCurrentSelectionSet();
	
		this.fireSearch(parameter);
	
		return true;
	};
	
	/**
	 * Executes the clear event. Controls of all visible filters will be passed as event-parameters.
	 * 
	 * @private
	 */
	FilterBar.prototype.clear = function() {
	
		var parameter = {};
		parameter.selectionSet = this._retrieveCurrentSelectionSet();
	
		this._clearErrorState();
	
		this.fireClear(parameter);		
		
		this._updateToolbarText();		
	};
	
	/**
	 * Executes the reset event. Controls of all visible filters will be passed as event-parameters.
	 * 
	 * @private
	 */
	FilterBar.prototype.reset = function() {
	
		var parameter = {};
		parameter.selectionSet = this._retrieveCurrentSelectionSet();
	
		this.fireReset(parameter);

		this._resetVariant();
	};	
	
	/**
	 * Obtains from the variant management the current selected entry ands applies the corresponding variant. In case nothing was selected variant management returns null -> no variant will be applied.
	 * 
	 * @private
	 */
	FilterBar.prototype._resetVariant = function() {
	
		var oVariant = null;
	
		if (this._oVariantManagement) { // in case a variant is currently selected, re-apply this variant
			var sKey = this._oVariantManagement.getSelectionKey();
			if (sKey) {
	
				oVariant = this._oVariantManagement.getVariantContent(this, sKey);
				if (this._oVariant) {
					this._oVariant.content = oVariant; 
					this._oVariant.modified = false;					
				}
	
				if (oVariant) {
					this._applyVariant(oVariant, "RESET");
				}
			}
		}
		
		//this._bDirtyViaDialog = false;
	};
	
	
	/**
	 * Retrieve the data for a specific variant and apply it.
	 * 
	 * @private
	 * @param {object} oVariant the variant
	 * @param {string} sContext may be undefined, RESET or CANCEL and indicates the source of the appliance
	 */
	FilterBar.prototype._applyVariant = function(oVariant, sContext) {
	
		var aPersFields = null;
		var aFieldsAndValues;
		var bExecuteOnSelection = false;
	
		if (oVariant) {
	
			this._setConsiderFilterChanges(false);
	
			aFieldsAndValues = oVariant.filterBarVariant;
			aPersFields = oVariant.filterbar;
	
			this._applyVariantFields(aFieldsAndValues);
			this._reapplyVisibility(aPersFields);
	
			this.fireAfterVariantLoad(sContext);
			
			this._setConsiderFilterChanges(true);			
			
			this._updateToolbarText();			
	
			if (oVariant.executeOnSelection) {
				bExecuteOnSelection = oVariant.executeOnSelection;
			}
	
			if (bExecuteOnSelection) {
				this.search();
			} else {
				this._clearErrorState();
			}
		}
	};
	
	/**
	 * Triggers the registered callBack for fetching the current variant data.
	 * 
	 * @private
	 * @returns {Object} the data representing part of the variant content
	 */
	FilterBar.prototype._fetchVariantFiltersData = function() {
	
		if (this._fRegisteredFetchData) {
			try {
				return this._fRegisteredFetchData();
			} catch (ex) {
				jQuery.sap.log.error("callback for fetching data throws an exception");
			}
		} else {
			jQuery.sap.log.warning("no callback for fetch data supplied");
		}
	
		return null;
	};
	
	/**
	 * Triggers the registered callBack for applying the variant data.
	 * 
	 * @private
	 * @param {Object} oJson the data blob representing part of the variant content
	 * @returns {object} data to be stored as part of the variant content
	 */
	FilterBar.prototype._applyVariantFields = function(oJson) {
	
		if (this._fRegisteredApplyData) {
			try {
				return this._fRegisteredApplyData(oJson);
			} catch (ex) {
				jQuery.sap.log.error("callback for applying data throws an exception");
			}
		} else {
			jQuery.sap.log.warning("no callback for appy data supplied");
		}
	};
	
	/**
	 * Creates and returns the variant representation. 
	 * This method is executed from the SmartVariantManagement control.
	 * 
	 * @param {boolean} bConsiderInvisibleFilters Indicates if invisible filters should be considered
	 * @returns {object} JSON object
	 * @public
	 */
	FilterBar.prototype.fetchVariant = function(bConsiderInvisibleFilters) {
	
		var aFiltersInfo;
		var oVariant = {};
		
		this.fireBeforeVariantFetch();	
		
		aFiltersInfo = this._determineVariantFiltersInfo(bConsiderInvisibleFilters);
	
		oVariant.filterbar = (!aFiltersInfo) ? [] : aFiltersInfo;
		
		oVariant.filterBarVariant = this._fetchVariantFiltersData();
	
		return oVariant;
	};
	
	/**
	 * Applies the variant.
	 * This method is executed from the {@link sap.ui.comp.smartvariants.SmartVariantManagement SmartVariantManagement} control. 
	 * 
	 * @param {object} oVariant JSON object
	 * @param {string} sContext Describes in which context the variant is applied. The context is passed on to the application via the afterVariantLoad event   
	 * @public
	 */
	FilterBar.prototype.applyVariant = function(oVariant, sContext) {
	
		this._applyVariant(oVariant, sContext);
	};
	
	/**
	 * Retrieves the mandatory filters.
	 * 
	 * @public
	 * @returns {array} Of visible mandatory filters
	 */
	FilterBar.prototype.determineMandatoryFilterItems = function() {
	
		var i;
		var aMandatoryFilters = [];
		
		var aItems = this._retrieveVisibleAdvancedItems();
	
		for (i = 0; i < aItems.length; i++) {
			if (aItems[i].filterItem.getMandatory() === true) {
				if (aItems[i].control) {
					aMandatoryFilters.push(aItems[i].filterItem);
				}
			}
		}
	
		return aMandatoryFilters;
	};
	
	/**
	 * Retrieves the control associated to the filter.
	 * 
	 * @public
	 * @param {sap.ui.comp.filterbar.FilterItem} oFilterItem From the aggregations
	 * @returns {sap.ui.core.Control} The corresponding control. If no match is found <code>null</code> is returned.
	 */
	FilterBar.prototype.determineControlByFilterItem = function(oFilterItem) {
	
		var i, n = null;
		var oItem, oGroupElement;
	
		if (this._aBasicAreaSelection) {
			for (i = 0; i < this._aBasicAreaSelection.length; i++) {
				oItem = this._aBasicAreaSelection[i];
				if (oFilterItem === oItem.filterItem) {
					return oItem.control;
				}
			}
		}
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
						for (i = 0; i < oGroupElement.items.length; i++) {
							oItem = oGroupElement.items[i];
							if (oFilterItem === oItem.filterItem) {
								return oItem.control;
							}
						}
					}
				}
			}
		}
	
		return null;
	};
	
	/**
	 * Retrieves the control based on the name and group name.
	 * 
	 * @public
	 * @param {string} sName Name of the filter.
	 * @param {string} sGroupName Group name of the filter; <code>null</code> for filter that belongs to basic group.	 
	 * @returns {sap.ui.core.Control} The corresponding control, if no match is found, <code>null</code> is returned.
	 */
	FilterBar.prototype.determineControlByName = function(sName, sGroupName) {

		var oItem = this._determineItemByName(sName, sGroupName);
		if (oItem) {
			return oItem.control;
		}
		
		return null;
	};
	
	/**
	 * Retrieves the internal filter representation based on the name and (optional) group name.
	 * 
	 * @private
	 * @param {string} sName the control's name
	 * @param {string} sGrpName sGroupName is null for basic area
	 * @returns {object} the corresponding internal item. If no match is found null will returned.
	 */
	FilterBar.prototype._determineItemByName = function(sName, sGrpName) {
	
		var i;
		var oItem, oGroupElement;
		var sGroupName = sGrpName;
	
		if (!sName) {
			return null;
		}
	
		if (!sGroupName) {
			sGroupName = FilterBar.INTERNAL_GROUP;
		}
	
		if (this._mAdvancedAreaFilter) {
			// check the filter
			oGroupElement = this._mAdvancedAreaFilter[sGroupName];
			if (oGroupElement && oGroupElement.items) {
				for (i = 0; i < oGroupElement.items.length; i++) {
					oItem = oGroupElement.items[i];
					if (oItem && oItem.filterItem && (oItem.filterItem.getName() === sName)) {
						return oItem;
					}
				}
			}
		}
	
		return null;
	};
	
	/**
	 * Retrieves the filter corresponding to the name.
	 * 
	 * @private
	 * @param {string} sName the control's name
	 * @returns {sap.ui.comp.filterbar.FilterItem} the corresponding filter item. If no match is found null will returned.
	 */
	FilterBar.prototype.determineFilterItemByName = function(sName) {

		var n, oItem;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				oItem = this._determineItemByName(sName, n);
				if (oItem) {
					return oItem.filterItem;
				}
			}
		}
	
		return null;
	};
	
	/**
	 * Retrieves the internal represenation for a filter.
	 * 
	 * @private
	 * @param {sap.ui.comp.filterbar.FilterGroupItem} oFilterGroupItem group filter item
	 * @returns {object} the corresponding internal representation. If no match is found null will returned.
	 */
	FilterBar.prototype._determineByFilterGroupItem = function(oFilterGroupItem) {

		var n = null, i;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					var oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
						for (i = 0; i < oGroupElement.items.length; i++) {
							if (oGroupElement.items[i] && oGroupElement.items[i].filterItem === oFilterGroupItem) {
								return oGroupElement.items[i];
							}
						}
					}
				}
			}
		}
	
		return null;
	};
	
	/**
	 * Retrives for a givven control the corresponding filter.
	 * 
	 * @private
	 * @param {sap.ui.core.Control} oControl for a filter
	 * @returns {object} the corresponding internal representation. If no match is found null will returned.
	 */
	FilterBar.prototype._determineByControl = function(oControl) {

		var n = null, i;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					var oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
						for (i = 0; i < oGroupElement.items.length; i++) {
							if (oGroupElement.items[i] && oGroupElement.items[i].control === oControl) {
								return oGroupElement.items[i];
							}
						}
					}
				}
			}
		}
	
		return null;
	};
	
	/**
	 * Delete all 'Filters'-dialog specific informations.
	 * 
	 * @private
	 */
	FilterBar.prototype._deleteProperties = function() {

		var n = null, i;
	
		if (this._mAdvancedAreaFilter) {
			for (n in this._mAdvancedAreaFilter) {
				if (n) {
					var oGroupElement = this._mAdvancedAreaFilter[n];
					if (oGroupElement && oGroupElement.items) {
	
						if (oGroupElement.formcontainer) {
							delete oGroupElement.formcontainer;
						}
	
						if (oGroupElement.link) {
							delete oGroupElement.link;
						}
	
						for (i = 0; i < oGroupElement.items.length; i++) {
							if (oGroupElement.items[i] && oGroupElement.items[i].checkbox) {
								delete oGroupElement.items[i].checkbox;
							}
							if (oGroupElement.items[i] && oGroupElement.items[i].formelement) {
								delete oGroupElement.items[i].formelement;
							}
						}
					}
				}
			}
		}
	};
	
	/**
	 * Handles the correct positioning of the 'Add to FilteBar' checkbox in the 'Filters'-dialog. 
	 * 
	 * @private
	 */
	FilterBar.prototype._fHandleResize = function() {
		if (!this._isPhone() && this._oFilterDialog && this._mAdvancedAreaFilter ) {
			this._repositionAddToFilterBarLabel();
		}		
	};
	
	FilterBar.prototype.onAfterRendering = function() {
		this._fHandleResize();
	};
	
	/**
	 * Destroys the control.
	 * 
	 * @public
	 */
	FilterBar.prototype.destroy = function() {

		// unregister eventhandler for resizing
		jQuery(window).off("resize.basicsearch");
	
		if (this._oVariantManagement) {
	
			if (this._fInitialiseVariants) {
				this._oVariantManagement.detachInitialise(this._fInitialiseVariants);
				this._fInitialiseVariants = null;
			}
	
			if (this._fSaveVariant) {
				this._oVariantManagement.detachSave(this._fSaveVariant);
				this._fSaveVariant = null;
			}
	
			if (this._fAfterSaveVariant) {
				this._oVariantManagement.detachSave(this._fAfterSaveVariant);
				this._fAfterSaveVariant = null;
			}
		}
	
		Grid.prototype.destroy.apply(this, arguments);
	
		if (this._oDialog) {
			this._oDialog.destroy();
			this._oDialog = null;
		}
		
		if (this._oActionSheet) {
			this._oActionSheet.destroy();
			this._oActionSheet = null;
		}	
		
		if (this._oFilterDialog) {
			this._oFilterDialog.destroy();
			this._oFilterDialog = null;
		}
			
		this._aBasicAreaSelection = null;
		this._mAdvancedAreaFilter = null;
		this._oBasicAreaLayout = null;
		this._oVariantManagement = null;
	
		this._oCollectiveSearch = null;		
		
		this._oVariant = null;
	
		this._fRegisteredFetchData = null;
		this._fRegisteredApplyData = null;
		this._fRegisterGetFiltersWithValues = null;
		this._fRegisteredFilterChangeHandlers = null;
	
		this._oSearchButton = null;
		this._oFiltersButton = null;
		this._oHideShowButton = null;
		this._oClearButtonOnFB = null;
		this._oRestoreButtonOnFB = null;
	
		this._oAddToFilterBarLabel = null;
		
		this._oBasicSearchField = null;		
	};
	

	return FilterBar;

}, /* bExport= */ true);