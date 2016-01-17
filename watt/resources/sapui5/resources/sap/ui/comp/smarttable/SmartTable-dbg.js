/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.smarttable.SmartTable.
sap.ui.define([
	'jquery.sap.global', 'sap/m/Column', 'sap/m/Label', 'sap/m/MessageBox', 'sap/m/Table', 'sap/m/Text', 'sap/m/OverflowToolbar', 'sap/m/ToolbarSeparator', 'sap/m/VBox', 'sap/ui/comp/library', 'sap/ui/comp/providers/TableProvider', 'sap/ui/comp/smartfilterbar/FilterProvider', 'sap/ui/comp/smartvariants/SmartVariantManagement', 'sap/ui/model/FilterOperator', 'sap/ui/model/json/JSONModel', 'sap/ui/table/AnalyticalColumn', 'sap/ui/table/AnalyticalTable', 'sap/ui/table/Column', 'sap/ui/table/Table', 'sap/ui/table/TreeTable', 'sap/ui/comp/personalization/Util'
], function(jQuery, Column1, Label, MessageBox, ResponsiveTable, Text, OverflowToolbar, ToolbarSeparator, VBox, library, TableProvider, FilterProvider, SmartVariantManagement, FilterOperator, JSONModel, AnalyticalColumn, AnalyticalTable, Column, Table, TreeTable, PersonalizationUtil) {
	"use strict";

	/**
	 * Constructor for a new smarttable/SmartTable.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class The SmartTable control creates a table based on OData metadata and the configuration specified. The entitySet attribute must be
	 *        specified to use the control. This attribute is used to fetch fields from OData metadata, from which columns will be generated; it can
	 *        also be used to fetch the actual table data.<br>
	 *        Based on the tableType property, this control will render a standard, analytical, or responsive table.<br>
	 *        <b><i>Note:</i></b><br>
	 *        Most of the attributes/properties are not dynamic and cannot be changed once the control has been initialized.
	 * @extends sap.m.VBox
	 * @author Pavan Nayak, Benjamin Spieler
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.smarttable.SmartTable
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartTable = VBox.extend("sap.ui.comp.smarttable.SmartTable", /** @lends sap.ui.comp.smarttable.SmartTable.prototype */
	{
		metadata: {

			library: "sap.ui.comp",
			properties: {

				/**
				 * The entity set name from which to fetch data and generate the columns. Note that this is not a dynamic UI5 property
				 * 
				 * @since 1.26.0
				 */
				entitySet: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * ID of the corresponding SmartFilter control; When specified, the SmartTable searches for the SmartFilter (also in the closest
				 * parent View) and attaches to the relevant events of the SmartFilter; to fetch data, show overlay etc.
				 * 
				 * @since 1.26.0
				 */
				smartFilterId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be ignored in the OData metadata by the SmartTable control.<br>
				 * <i>Note:</i><br>
				 * No validation is done. Please ensure that you do not add spaces or special characters.
				 * 
				 * @since 1.26.0
				 */
				ignoredFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be shown initially in the SmartTable as visible columns and in the order specified.<br>
				 * This property is mainly meant to be used when no LineItem annotation exists.<br>
				 * If you have fields in the XMLView they are always shown first; then, the columns are added based on the LineItem annotation and
				 * finally based on this property.<br>
				 * <i>Note:</i><br>
				 * If both this property and the LineItem annotation exist, the order of fields cannot be guaranteed to be as mentioned here.<br>
				 * No validation is done. Please ensure that you do not add spaces or special characters.
				 * 
				 * @since 1.32.0
				 */
				initiallyVisibleFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that must be always requested from the backend<br>
				 * This property is mainly meant to be used when there is no PresentationVariant annotation.<br>
				 * If both this property and the PresentationVariant annotation exist, the select request sent to the backend would be a combination
				 * of both.<br>
				 * <i>Note:</i><br>
				 * This property has no effect when AnalyticalTable is used.<br>
				 * No validation is done. Please ensure that you do not add spaces or special characters.
				 * 
				 * @since 1.32.0
				 */
				requestAtLeastFields: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * CSV of fields that is not shown in the personalization dialog.<br>
				 * <i>Note:</i><br>
				 * No validation is done. Please ensure that you do not add spaces or special characters.
				 * 
				 * @since 1.32.0
				 */
				ignoreFromPersonalisation: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies the type of table to be created in the SmartTable control.<br>
				 * <i>Note:</i><br>
				 * If you add a table to the content of the SmartTable in the view, this property has no effect.
				 * 
				 * @since 1.26.0
				 */
				tableType: {
					type: "sap.ui.comp.smarttable.TableType",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * The useVariantManagement attribute can be set to true or false depending on whether you want to use variants. As a prerequisite you
				 * need to specify the persistencyKey property.
				 * 
				 * @since 1.26.0
				 */
				useVariantManagement: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Can be set to true or false depending on whether you want to export data to MS Excel®.
				 * 
				 * @since 1.26.0
				 */
				useExportToExcel: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * The useTablePersonalisation attribute can be set to true or false depending on whether you want to define personalized table
				 * settings. If you want to persist the table personalization, you need to specify the persistencyKey property.
				 * 
				 * @since 1.26.0
				 */
				useTablePersonalisation: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * If the showRowCount attribute is set to true number of rows is shown along with the header text.
				 * 
				 * @since 1.26.0
				 */
				showRowCount: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Specifies header text that is shown in table
				 * 
				 * @since 1.26.0
				 */
				header: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * A style class which is defined for the toolbar of the table.
				 * 
				 * @since 1.26.0
				 */
				toolbarStyleClass: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Can be used to override the filter behavior. If set to true (default), instead of the filter input box a button is rendered. When
				 * pressing this button, the SmartTable control opens the filter panel directly in the table personalization dialog.
				 * 
				 * @since 1.26.0
				 */
				enableCustomFilter: {
					type: "boolean",
					group: "Misc",
					defaultValue: true
				},

				/**
				 * Key used to access personalization data.
				 * 
				 * @since 1.26.0
				 */
				persistencyKey: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * If set to true, the standard toolbar and custom toolbar will be merged into one toolbar. The combined toolbar will have a solid
				 * style.
				 * 
				 * @since 1.26.0
				 * @deprecated Since 1.29. This property has no effect
				 */
				useOnlyOneSolidToolbar: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * Retrieves or sets the current variant.
				 * 
				 * @since 1.28.0
				 */
				currentVariantId: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * This attribute can be used to specify if the controls created by the SmartTable control are editable.
				 * 
				 * @since 1.28.0
				 */
				editable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * When set to true, this enables automatic binding of the table using the tableBindingPath (if it exists) or entitySet property. This
				 * happens just after the <code>initialise</code> event has been fired.
				 * 
				 * @since 1.28.0
				 */
				enableAutoBinding: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * This attribute can be used to specify the path that is used during the binding of the table. If not specified, the entitySet
				 * attribute is used instead. (used only if binding is established internally/automatically - See enableAutoBinding)
				 * 
				 * @since 1.28.0
				 */
				tableBindingPath: {
					type: "string",
					group: "Misc",
					defaultValue: null
				},

				/**
				 * Specifies whether the editable property can be toggled via a button on the toolbar. (The automatic toggle of controls works only
				 * for the SmartField scenario)
				 * 
				 * @since 1.28.0
				 */
				editTogglable: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				},

				/**
				 * The demandPopin attribute can be set to true or false depending on whether you want to display columns as popins on the responsive
				 * table
				 * 
				 * @since 1.30.0
				 */
				demandPopin: {
					type: "boolean",
					group: "Misc",
					defaultValue: false
				}
			},
			aggregations: {

				/**
				 * A toolbar that can be added by the user to define their own custom buttons, icons, etc. If this is specified, the SmartTable
				 * control does not create an additional toolbar, but makes use of this one.
				 * 
				 * @since 1.26.0
				 */
				customToolbar: {
					type: "sap.m.Toolbar",
					multiple: false
				},

				/**
				 * The Semantic Object Controller allows the user to specify and overwrite functionality for semantic object navigation.
				 * 
				 * @since 1.28.0
				 */
				semanticObjectController: {
					type: "sap.ui.comp.navpopover.SemanticObjectController",
					multiple: false
				},

				/**
				 * The value for the noData aggregation can be either a string value or a control instance.<br>
				 * The control is shown, in case there is no data for the Table available. In case of a string value this will simply replace the no
				 * data text.<br>
				 * Currently the Responsive Table only supports string values.
				 * 
				 * @since 1.32.0
				 */
				noData: {
					type: "sap.ui.core.Control",
					altTypes: [
						"string"
					],
					multiple: false
				}
			},
			events: {

				/**
				 * Event fired once the control has been initialized.
				 * 
				 * @since 1.26.0
				 */
				initialise: {},

				/**
				 * Event fired just before the binding is being done.
				 * 
				 * @param {object} [bindingParams] the bindingParams object contains filters, sorters and other binding related information for the
				 *        table.
				 * @param {boolean} [bindingParams.preventTableBind] can be set to true by the listener to prevent binding from being done
				 * @param {object} [bindingParams.filters] the combined filter array containing a set of sap.ui.model.Filter instances from SmartTable
				 *        and SmartFilter - can be modified by users to influence filtering
				 * @param {object} [bindingParams.sorter] an array containing a set of sap.ui.model.Sorter instances from SmartTable (personalisation) -
				 *        can be modified by users to influence sorting
				 * @since 1.26.0
				 */
				beforeRebindTable: {},

				/**
				 * Event fired when display/edit button is clicked.
				 * 
				 * @since 1.28.0
				 */
				editToggled: {},

				/**
				 * Event fired when data is received after binding. The event is fired if the binding for the table is done by the SmartTable itself.
				 * 
				 * @since 1.28.0
				 */
				dataReceived: {},

				/**
				 * Event fired after variant management in the SmartTable has been initialized.
				 * 
				 * @since 1.28.0
				 */
				afterVariantInitialise: {},

				/**
				 * Event fired after a variant has been saved. This event can be used to retrieve the ID of the saved variant.
				 * 
				 * @param {string} [currentVariantId] id of the currently selected variant
				 * @since 1.28.0
				 */
				afterVariantSave: {},

				/**
				 * Event fired after a variant has been applied.
				 * 
				 * @param {string} [currentVariantId] id of the currently selected variant
				 * @since 1.28.0
				 */
				afterVariantApply: {},

				/**
				 * Event fired just before the overlay is being shown.
				 * 
				 * @param {object} [overlay] the overlay object contains information related to the table's overlay.
				 * @param {boolean} [overlay.show] can be set to false by the listener to prevent the overlay being shown.
				 * @since 1.32.0
				 */
				showOverlay: {}
			}
		}
	});

	// **
	// * This file defines behaviour for the control,
	// */
	SmartTable.prototype.init = function() {
		sap.m.FlexBox.prototype.init.call(this);
		this.addStyleClass("sapUiCompSmartTable");
		this.setFitContainer(true);
		this.setHeight("100%");
		this._bUpdateToolbar = true;
	};

	/**
	 * instantiates the SmartVariantManagementControl
	 * 
	 * @private
	 */
	SmartTable.prototype._createVariantManagementControl = function() {
		// Do not create variant management when it is not needed!
		if (this._oVariantManagement || (!this.getUseVariantManagement() && !this.getUseTablePersonalisation()) || !this.getPersistencyKey()) {
			return;
		}

		// always create VariantManagementControl, in case it is not used, it will take care of persisting the personalisation
		// without visualization

		var oPersInfo = new sap.ui.comp.smartvariants.PersonalizableInfo({
			type: "table",
			keyName: "persistencyKey",
			dataSource: "TODO"
		});

		oPersInfo.setControl(this);

		this._oVariantManagement = new sap.ui.comp.smartvariants.SmartVariantManagement({ // FIXME workaround to make sinon stubs work with AMD
			personalizableControls: oPersInfo,
			initialise: function(oEvent) {
				// Current variant could have been set already (before initialise) by the SmartVariant, in case of GLO/Industry specific variant
				// handling
				if (!this._oCurrentVariant) {
					this._oCurrentVariant = "STANDARD";
				}
				this.fireAfterVariantInitialise();
			}.bind(this),
			save: function(oEvent) {
				this._variantSaved();
			}.bind(this),
			afterSave: function() {
				this.fireAfterVariantSave({
					currentVariantId: this.getCurrentVariantId()
				});
			}.bind(this),
			showShare: false
		});

		this._oVariantManagement.initialise();
	};

	/**
	 * event handler for variantmanagement save event
	 * 
	 * @private
	 */
	SmartTable.prototype._variantSaved = function() {
		if (this._oPersController) {
			this._oPersController.setPersonalizationData(this._oCurrentVariant);
		}
	};

	SmartTable.prototype.setUseExportToExcel = function(bUseExportToExcel) {
		this.setProperty("useExportToExcel", bUseExportToExcel, true);
		this._bUpdateToolbar = true;
	};

	SmartTable.prototype.setUseTablePersonalisation = function(bUseTablePersonalisation) {
		this.setProperty("useTablePersonalisation", bUseTablePersonalisation, true);
		this._bUpdateToolbar = true;
	};

	SmartTable.prototype.setUseVariantManagement = function(bUseVariantManagement) {
		this.setProperty("useVariantManagement", bUseVariantManagement, true);
		if (this._oPersController) {
			this._oPersController.setResetToInitialTableState(!bUseVariantManagement);
		}
		this._bUpdateToolbar = true;
	};

	SmartTable.prototype.setToolbarStyleClass = function(sStyleClass) {
		this.setProperty("toolbarStyleClass", sStyleClass, true);
	};

	SmartTable.prototype.setCustomToolbar = function(oCustomToolbar) {
		if (this._oCustomToolbar) {
			this.removeItem(this._oCustomToolbar);
		}

		this._oCustomToolbar = oCustomToolbar;

		this._bUpdateToolbar = true;
	};

	SmartTable.prototype.getCustomToolbar = function() {
		return this._oCustomToolbar;
	};

	SmartTable.prototype.setHeader = function(sText) {
		this.setProperty("header", sText, true);
		this._refreshHeaderText();
	};

	SmartTable.prototype.setShowRowCount = function(bShow) {
		this.setProperty("showRowCount", bShow, true);
		this._refreshHeaderText();
	};

	SmartTable.prototype.setEditTogglable = function(bToggle) {
		this.setProperty("editTogglable", bToggle, true);
		this._bUpdateToolbar = true;
	};

	SmartTable.prototype.setEditable = function(bEdit) {
		this.setProperty("editable", bEdit, true);
	};

	SmartTable.prototype.setDemandPopin = function(bDemandPopin) {
		var bOldValue = this.getDemandPopin();
		if (bOldValue === bDemandPopin) {
			return;
		}

		this.setProperty("demandPopin", bDemandPopin, true);

		if (this.bIsInitialised) {
			if (bDemandPopin) {
				this._updateColumnsPopinFeature();
			} else {
				this._deactivateColumnsPopinFeature();
			}
		}
	};

	/**
	 * sets the header text
	 * 
	 * @private
	 */
	SmartTable.prototype._refreshHeaderText = function() {
		if (!this._headerText) {
			this._bUpdateToolbar = true;
			return;
		}

		var sText = this.getHeader();
		if (this.getShowRowCount()) {
			var iRowCount = parseInt(this._getRowCount(), 10);
			jQuery.sap.require("sap.ui.core.format.NumberFormat");
			var sValue = sap.ui.core.format.NumberFormat.getFloatInstance().format(iRowCount);

			sText += " (" + sValue + ")";
		}

		this._headerText.setText(sText);
	};

	/**
	 * creates the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._createToolbar = function() {
		var oCustomToolbar = null;
		if (!this._oToolbar) {
			oCustomToolbar = this.getCustomToolbar();
			if (oCustomToolbar) {
				this._oToolbar = oCustomToolbar;
			} else {
				this._oToolbar = new OverflowToolbar({
					design: sap.m.ToolbarDesign.Transparent
				});
				this._oToolbar.addStyleClass("sapUiCompSmartTableToolbar");
				if (this.getToolbarStyleClass()) {
					this._oToolbar.addStyleClass(jQuery.sap.encodeHTML(this.getToolbarStyleClass()));
				}
			}
			this._oToolbar.setLayoutData(new sap.m.FlexItemData({
				shrinkFactor: 0
			}));
			this.insertItem(this._oToolbar, 0);
		}
	};

	/**
	 * creates the toolbar content
	 * 
	 * @private
	 */
	SmartTable.prototype._createToolbarContent = function() {
		// insert the items in the custom toolbar in reverse order => insert always at position 0
		this._addVariantManagementToToolbar();
		this._addSeparatorToToolbar();
		this._addHeaderToToolbar();

		// add spacer to toolbar
		this._addSpacerToToolbar();

		// First show Display/Edit icon, then Personalisation and finally Excel Export
		this._addEditTogglableToToolbar();
		this._addTablePersonalisationToToolbar();
		this._addExportToExcelToToolbar();

		// seems like toolbar only contains spacer and is actually not needed - remove it
		if (this._oToolbar && (this._oToolbar.getContent().length === 0 || (this._oToolbar.getContent().length === 1 && this._oToolbar.getContent()[0] instanceof sap.m.ToolbarSpacer))) {
			this.removeItem(this._oToolbar);
			this._oToolbar.destroy();
			this._oToolbar = null;
		}
	};

	/**
	 * Adds the button to change between edit and read only mode
	 * 
	 * @private
	 */
	SmartTable.prototype._addEditTogglableToToolbar = function() {
		if (this.getEditTogglable()) {
			if (!this._oEditButton) {
				this._oEditButton = new sap.m.Button({
					type: sap.m.ButtonType.Default,
					icon: this.getEditable() ? "sap-icon://display" : "sap-icon://edit",
					tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("TABLE_EDITTOGGLE_TOOLTIP"),
					press: jQuery.proxy(function() {
						var bEditable = this.getEditable();
						// toggle property editable and set it on the smart table
						bEditable = !bEditable;
						this.setEditable(bEditable, true);
						this._oEditButton.setIcon(bEditable ? "sap-icon://display" : "sap-icon://edit");
						// notify any listeners
						this.fireEditToggled({
							editable: bEditable
						});
					}, this)
				});
			}
			if (this._oEditButton) {
				this._oToolbar.addContent(this._oEditButton);
			}
		} else if (this._oEditButton) {
			this._oToolbar.removeContent(this._oEditButton);
		}
	};

	/**
	 * adds the header line to the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._addHeaderToToolbar = function() {
		if (this.getHeader()) {
			if (!this._headerText) {
				this._headerText = new Text();
				this._headerText.addStyleClass("sapMH4Style");
				this._headerText.addStyleClass("sapUiCompSmartTableHeader");
			}
			this._refreshHeaderText();
			this._oToolbar.insertContent(this._headerText, 0);
		} else if (this._headerText) {
			this._oToolbar.removeContent(this._headerText);
		}
	};

	/**
	 * adds a separator between header and variantmanagement to the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._addSeparatorToToolbar = function() {
		if (this.getHeader() && this.getUseVariantManagement()) {
			this._oSeparator = new ToolbarSeparator();
			this._oToolbar.insertContent(this._oSeparator, 0);
			// Also set the height to 3rem when no height is explicitly specified (in non-condensed mode)
			if (!this._oToolbar.getHeight()) {
				this._oToolbar.addStyleClass("sapUiCompSmartTableToolbarHeight");
			}
		} else if (this._oSeparator) {
			this._oToolbar.removeContent(this._oSeparator);
		}
	};

	/**
	 * adds the VarientManagement to the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._addVariantManagementToToolbar = function() {
		if (this.getUseVariantManagement()) {
			this._oToolbar.insertContent(this._oVariantManagement, 0);
		} else if (this._oVariantManagement) {
			this._oToolbar.removeContent(this._oVariantManagement);
		}
	};

	/**
	 * adds a spacer to the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._addSpacerToToolbar = function() {
		var bFoundSpacer = false, aItems = this._oToolbar.getContent(), i, iLength;
		if (aItems) {
			iLength = aItems.length;
			i = 0;
			for (i; i < iLength; i++) {
				if (aItems[i] instanceof sap.m.ToolbarSpacer) {
					bFoundSpacer = true;
					break;
				}
			}
		}

		if (!bFoundSpacer) {
			this._oToolbar.addContent(new sap.m.ToolbarSpacer());
		}
	};

	/**
	 * adds the Table Personalisation button to the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._addTablePersonalisationToToolbar = function() {
		if (this.getUseTablePersonalisation()) {
			if (!this._oTablePersonalisationButton) {
				this._oTablePersonalisationButton = new sap.m.Button({
					type: sap.m.ButtonType.Default,
					icon: "sap-icon://action-settings",
					tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("TABLE_PERSOBTN_TOOLTIP"),
					press: jQuery.proxy(function(oEvent) {
						this._oPersController.openDialog();
					}, this)
				});
			}
			this._oToolbar.addContent(this._oTablePersonalisationButton);
		} else if (this._oTablePersonalisationButton) {
			this._oToolbar.removeContent(this._oTablePersonalisationButton);
		}
	};

	/**
	 * adds the Export to Excel button to the toolbar
	 * 
	 * @private
	 */
	SmartTable.prototype._addExportToExcelToToolbar = function() {
		if (this.getUseExportToExcel() && this._bTableSupportsExcelExport) {
			var that = this;
			if (!this._oUseExportToExcel) {
				this._oUseExportToExcel = new sap.m.Button({
					type: sap.m.ButtonType.Default,
					icon: "sap-icon://excel-attachment",
					tooltip: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("TABLE_EXPORT_TEXT"),
					press: function(oEvent) {

						var fDownloadXls = function() {
							var oRowBinding = that._getRowBinding();
							var sUrl = oRowBinding.getDownloadUrl("xlsx");
							// sUrl = that._adjustUrlToVisibleColumns(sUrl);
							sUrl = that._removeExpandParameter(sUrl);
							window.open(sUrl);
						};

						var iRowCount = that._getRowCount();

						if (iRowCount > 10000) {
							MessageBox.confirm(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("DOWNLOAD_CONFIRMATION_TEXT", iRowCount), {
								actions: [
									MessageBox.Action.YES, MessageBox.Action.NO
								],
								onClose: function(oAction) {
									if (oAction === MessageBox.Action.YES) {
										fDownloadXls();
									}
								}
							});
						} else {
							fDownloadXls();
						}
					}
				});
				this._setExcelExportEnableState();
			}

			this._oToolbar.addContent(this._oUseExportToExcel);
		} else if (this._oUseExportToExcel) {
			this._oToolbar.removeContent(this._oUseExportToExcel);
		}
	};

	/**
	 * replaces the given Url's select parameter with a select parameter adjusted to the visible columns
	 * 
	 * @param {string} sUrl the original url
	 * @private
	 * @returns {string} the resolved url string
	 */
	SmartTable.prototype._adjustUrlToVisibleColumns = function(sUrl) {
		var aVisibleColumns = this._getVisibleColumnPaths();
		var sFinalUrl = sUrl.replace(new RegExp("([\\?&]\\$select=)[^&]+"), function(result, match) {
			if (aVisibleColumns && aVisibleColumns.length) {
				return match + jQuery.sap.encodeURL(aVisibleColumns.join(","));
			} else {
				return "";
			}
		});
		return sFinalUrl;
	};

	/**
	 * removes the given Url's expand parameter
	 * 
	 * @param {string} sUrl the original url
	 * @private
	 * @returns {string} the resolved url string
	 */
	SmartTable.prototype._removeExpandParameter = function(sUrl) {
		var sFinalUrl = sUrl.replace(new RegExp("([\\?&]\\$expand=[^&]+)(&?)"), function(result, match1, match2) {
			return match2 ? match1.substring(0, 1) : "";
		});
		return sFinalUrl;
	};

	/**
	 * gets table's row count
	 * 
	 * @private
	 * @returns {integer} the row count
	 */
	SmartTable.prototype._getRowCount = function() {
		var oRowBinding = this._getRowBinding();

		if (!oRowBinding) {
			return 0;
		}

		var iRowCount = 0;
		if (oRowBinding.getTotalSize) {
			iRowCount = oRowBinding.getTotalSize();
		} else {
			iRowCount = oRowBinding.getLength();
		}

		if (iRowCount < 0 || iRowCount === "0") {
			iRowCount = 0;
		}

		return iRowCount;
	};

	/**
	 * disables the export to excel button if no data is present, otherwise enables it
	 * 
	 * @private
	 */
	SmartTable.prototype._setExcelExportEnableState = function() {
		if (this._oUseExportToExcel) {
			var iRowCount = this._getRowCount();
			if (iRowCount > 0) {
				this._oUseExportToExcel.setEnabled(true);
			} else {
				// check if first row contains data (getRowCount relies on binding which reports 0 if backend does not support line count)
				var aRows;
				if (this._isMobileTable) {
					aRows = this._oTable.getItems();
				} else {
					aRows = this._oTable.getRows();
				}

				var bEnable = aRows != null && aRows.length > 0 && aRows[0].getBindingContext() != null;
				this._oUseExportToExcel.setEnabled(bEnable);
			}
		}
	};

	/**
	 * creates the personalization controller if not yet done
	 * 
	 * @private
	 */
	SmartTable.prototype._createPersonalizationController = function() {
		if (this._oPersController || !this.getUseTablePersonalisation()) {
			return;
		}

		var oSettings = this.data("p13nDialogSettings");
		if (typeof oSettings === "string") {
			try {
				oSettings = JSON.parse(oSettings);
			} catch (e) {
				oSettings = null;
				// Invalid JSON!
			}
		}

		oSettings = this._setIgnoreFromPersonalisationToSettings(oSettings);

		jQuery.sap.require("sap.ui.comp.personalization.Controller");
		this._oPersController = new sap.ui.comp.personalization.Controller({
			table: this._oTable,
			setting: oSettings,
			resetToInitialTableState: !this.getUseVariantManagement(),
			beforePotentialTableChange: jQuery.proxy(this._beforePersonalisationModelDataChange, this),
			afterPotentialTableChange: jQuery.proxy(this._afterPersonalisationModelDataChange, this),
			afterP13nModelDataChange: jQuery.proxy(this._personalisationModelDataChange, this)
		});
	};

	/**
	 * adds the ignoreFromPersonalisation fields to the given setting
	 * 
	 * @param {object} oSettings the former settings object
	 * @private
	 * @returns {object} the changed settings object
	 */
	SmartTable.prototype._setIgnoreFromPersonalisationToSettings = function(oSettings) {
		var aIgnoreFields = PersonalizationUtil.createArrayFromString(this.getIgnoreFromPersonalisation());
		if (aIgnoreFields.length) {
			if (!oSettings) {
				oSettings = {};
			}

			var fSetArray = function(sSubName) {
				if (!oSettings[sSubName]) {
					oSettings[sSubName] = {};
				}
				oSettings[sSubName].ignoreColumnKeys = aIgnoreFields;
			};

			fSetArray("filter");
			fSetArray("sort");
			fSetArray("group");
			fSetArray("columns");
		}
		return oSettings;
	};

	/**
	 * returns the row/items binding of the currently used internal table
	 * 
	 * @private
	 * @returns {sap.ui.model.Binding} the row/items binding
	 */
	SmartTable.prototype._getRowBinding = function() {
		if (this._oTable) {
			return this._oTable.getBinding(this._sAggregation);
		}
	};

	/**
	 * The entity set name from OData metadata, with which the table should be bound to
	 * 
	 * @param {string} sEntitySetName The entity set
	 * @public
	 */
	SmartTable.prototype.setEntitySet = function(sEntitySetName) {
		this.setProperty("entitySet", sEntitySetName);
		this._initialiseMetadata();
	};

	/**
	 * It could happen that the entity type information is set already in the view, but there is no model attached yet. This method is called once the
	 * model is set on the parent and can be used to initialise the metadata, from the model, and finally create the table controls.
	 * 
	 * @private
	 */
	SmartTable.prototype.propagateProperties = function() {
		VBox.prototype.propagateProperties.apply(this, arguments);
		this._initialiseMetadata();
	};

	/**
	 * Initialises the OData metadata necessary to create the table
	 * 
	 * @private
	 */
	SmartTable.prototype._initialiseMetadata = function() {
		if (!this.bIsInitialised) {
			var oModel = this.getModel();
			if (oModel) {
				// Check if ODataMetaModel was loaded
				// If not, delay the creation of table content/helpers until ODataMetaModel is loaded!
				// Do this only for async ODataModel
				if (oModel.bLoadMetadataAsync && oModel.getMetaModel() && oModel.getMetaModel().loaded) {
					if (!this._bMetaModelLoadAttached) {
						// wait for the ODataMetaModel loaded promise to be resolved
						oModel.getMetaModel().loaded().then(this._onMetadataInitialised.bind(this));
						this._bMetaModelLoadAttached = true;
					}
				} else {
					// Could be a non ODataModel or a synchronous ODataModel --> just create the necessary helpers
					this._onMetadataInitialised();
				}
			}
		}
	};

	/**
	 * Called once the necessary Model metadata is available
	 * 
	 * @private
	 */
	SmartTable.prototype._onMetadataInitialised = function() {
		this._bMetaModelLoadAttached = false;
		if (!this.bIsInitialised) {
			this._createTableProvider();
			if (this._oTableProvider) {
				this._aTableViewMetadata = this._oTableProvider.getTableViewMetadata();
				if (this._aTableViewMetadata) {
					if (!this._isMobileTable && this.getDemandPopin()) {
						this.setDemandPopin(false);
						jQuery.sap.log.error("use SmartTable property 'demandPopin' only  with responsive table, property has been set to false");
					}

					// Indicates the control is initialised and can be used in the initialise event/otherwise!
					this.bIsInitialised = true;
					this._bTableSupportsExcelExport = this._oTableProvider.getSupportsExcelExport();
					this._listenToSmartFilter();
					this._createVariantManagementControl(); // creates VariantMngmntCtrl if useVariantManagement OR useTablePersonalisation is true.
					// Control is only added to toolbar if useVariantManagement is set otherwise it acts as
					// hidden persistance helper
					this._createToolbarContent();
					this._createContent();
					this._createPersonalizationController();
					// Create a local JSONModel to handle editable switch
					this._oEditModel = new JSONModel({
						editable: this.getEditable()
					});
					this.bindProperty("editable", {
						path: "sm4rtM0d3l>/editable"
					});
					// Set the local model on the SmartTable
					this.setModel(this._oEditModel, "sm4rtM0d3l");

					this.fireInitialise();
					if (this.getEnableAutoBinding()) {
						this._reBindTable();
					}
				}
			}
		}
	};

	/**
	 * Creates an instance of the table provider
	 * 
	 * @private
	 */
	SmartTable.prototype._createTableProvider = function() {
		var oModel, sEntitySetName, sIgnoredFields;
		sEntitySetName = this.getEntitySet();
		sIgnoredFields = this.getIgnoredFields();
		oModel = this.getModel();

		// The SmartTable apparently also needs to work for non ODataModel models; hence we now create the table independent
		// of ODataModel.
		if (oModel && !this._bTableCreated) {
			this._aExistingColumns = [];
			this._aAlwaysSelect = [];
			this._oTemplate = null;
			this._createToolbar();
			this._createTable();
			this._bTableCreated = true;
		}

		if (oModel && sEntitySetName) {
			if (this._aExistingColumns.length) {
				if (sIgnoredFields) {
					sIgnoredFields += "," + this._aExistingColumns.toString();
				} else {
					sIgnoredFields = this._aExistingColumns.toString();
				}
			}
			this._oTableProvider = new sap.ui.comp.providers.TableProvider({ // FIXME workaround to make sinon stubs work with AMD
				entitySet: sEntitySetName,
				ignoredFields: sIgnoredFields,
				initiallyVisibleFields: this.getInitiallyVisibleFields(),
				isEditableTable: this.getEditable(),
				isAnalyticalTable: this._isAnalyticalTable,
				dateFormatSettings: this.data("dateFormatSettings"),
				currencyFormatSettings: this.data("currencyFormatSettings"),
				defaultDropDownDisplayBehaviour: this.data("defaultDropDownDisplayBehaviour"),
				useSmartField: this.data("useSmartField"),
				enableInResultForLineItem: this.data("enableInResultForLineItem"),
				model: oModel
			});
		}
	};

	/**
	 * Listen to changes on the corresponding SmartFilter (if any)
	 * 
	 * @private
	 */
	SmartTable.prototype._listenToSmartFilter = function() {
		var sSmartFilterId = null;
		// Register for SmartFilter Search
		sSmartFilterId = this.getSmartFilterId();

		this._oSmartFilter = this._findControl(sSmartFilterId);

		if (this._oSmartFilter) {

			this._oSmartFilter.attachSearch(jQuery.proxy(this._reBindTable, this));
			this._oSmartFilter.attachFilterChange(jQuery.proxy(function() {
				this._showOverlay(true);
			}, this));
			this._oSmartFilter.attachCancel(jQuery.proxy(function() {
				this._showOverlay(false);
			}, this));

			// Set initial empty text only if a valid SmartFilter is found
			this._setNoDataText(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_NO_DATA"));
		}
	};

	/**
	 * sets the ShowOverlay property on the inner table, fires the ShowOverlay event
	 * 
	 * @param {boolean} bShow true to display the overlay, otherwise false
	 * @private
	 */
	SmartTable.prototype._showOverlay = function(bShow) {
		if (bShow) {
			var oOverlay = {
				show: true
			};
			this.fireShowOverlay({
				overlay: oOverlay
			});
			bShow = oOverlay.show;
		}

		this._oTable.setShowOverlay(bShow);
	};

	/**
	 * searches for a certain control by its ID
	 * 
	 * @param {string} sId the control's ID
	 * @returns {sap.ui.core.Control} The control found by the given Id
	 * @private
	 */
	SmartTable.prototype._findControl = function(sId) {
		var oResultControl, oView;
		if (sId) {
			// Try to get SmartFilter from Id
			oResultControl = sap.ui.getCore().byId(sId);

			// Try to get SmartFilter from parent View!
			if (!oResultControl) {
				oView = this._getView();

				if (oView) {
					oResultControl = oView.byId(sId);
				}
			}
		}

		return oResultControl;
	};

	/**
	 * searches for the controls view
	 * 
	 * @returns {sap.ui.core.mvc.View} The found parental View
	 * @private
	 */
	SmartTable.prototype._getView = function() {
		if (!this._oView) {
			var oObj = this.getParent();
			while (oObj) {
				if (oObj instanceof sap.ui.core.mvc.View) {
					this._oView = oObj;
					break;
				}
				oObj = oObj.getParent();
			}
		}
		return this._oView;
	};

	/**
	 * This can be used to trigger binding on the table used in the SmartTable
	 * 
	 * @protected
	 */
	SmartTable.prototype.rebindTable = function() {
		this._reBindTable();
	};

	/**
	 * Re-binds the table
	 * 
	 * @private
	 */
	SmartTable.prototype._reBindTable = function() {
		var mTablePersonalisationData, i, iLen, aSmartFilters, aProcessedFilters = [], aFilters, oExcludeFilters, sRequestAtLeastFields, aAlwaysSelect, aSelect, aSorters, mParameters = {}, mBindingParams = {
			preventTableBind: false
		};

		mTablePersonalisationData = this._getTablePersonalisationData() || {};
		aFilters = mTablePersonalisationData.filters;
		oExcludeFilters = mTablePersonalisationData.excludeFilters;
		aSorters = mTablePersonalisationData.sorters;

		// Get Filters and parameters from SmartFilter
		if (this._oSmartFilter) {
			aSmartFilters = this._oSmartFilter.getFilters();
			mParameters = this._oSmartFilter.getParameters() || {};
		}

		// If filters from SmartFilter exist --> process them first with SmartTable exclude filters
		// since we need to manually AND multiple multi filters!
		if (aSmartFilters && aSmartFilters.length) {
			if (oExcludeFilters) {
				aProcessedFilters = [
					new sap.ui.model.Filter([
						aSmartFilters[0], oExcludeFilters
					], true)
				];
			} else {
				aProcessedFilters = aSmartFilters;
			}
		} else if (oExcludeFilters) {
			aProcessedFilters = [
				oExcludeFilters
			];
		}
		// Combine the resulting processed filters with SmartTable include filters
		if (aFilters) {
			aFilters = aProcessedFilters.concat(aFilters);
		} else {
			aFilters = aProcessedFilters;
		}

		sRequestAtLeastFields = this.getRequestAtLeastFields();
		if (sRequestAtLeastFields) {
			aAlwaysSelect = sRequestAtLeastFields.split(",");
		} else {
			aAlwaysSelect = [];
		}
		aAlwaysSelect.concat(this._aAlwaysSelect);
		aSelect = this._getVisibleColumnPaths();
		// handle fields that shall always be selected
		if (!aSelect || !aSelect.length) {
			aSelect = aAlwaysSelect;
		} else {
			iLen = aAlwaysSelect.length;
			for (i = 0; i < iLen; i++) {
				if (aSelect.indexOf(aAlwaysSelect[i]) < 0) {
					aSelect.push(aAlwaysSelect[i]);
				}
			}
		}
		if (aSelect && aSelect.length) {
			mParameters["select"] = aSelect.toString();
		}

		// Enable batch requests (used by AnalyticalTable)
		mParameters["useBatchRequests"] = true;

		if (!aSorters) {
			aSorters = [];
		}

		mBindingParams.filters = aFilters;
		mBindingParams.sorter = aSorters;
		mBindingParams.parameters = mParameters;

		// fire event to enable user modification of certain binding options (Ex: Filters)
		this.fireBeforeRebindTable({
			bindingParams: mBindingParams
		});

		if (!mBindingParams.preventTableBind) {
			aSorters = mBindingParams.sorter;
			aFilters = mBindingParams.filters;
			aSelect = mBindingParams.parameters["select"];
			if (!aSelect || !aSelect.length) {
				MessageBox.error(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_NO_COLS"), {
					styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
				});
				return;
			}
			this._oTable.setEnableBusyIndicator(false);
			this._oTable.setBusy(true);

			// All UI5 tables seem to be showing the no data text briefly before showing the actual results
			// Workaround by setting a space as the no data text (Empty string === default no data text!)
			// TODO: revisit this later
			this._setNoDataText(" ");

			// Reset Suppress refresh
			if (this._oTable._setSuppressRefresh) {
				this._oTable._setSuppressRefresh(false);
			}
			this._bDataLoadPending = true;
			this._oTable.bindRows({
				path: this.getTableBindingPath() || ("/" + this.getEntitySet()),
				filters: aFilters,
				sorter: aSorters,
				parameters: mParameters,
				template: this._oTemplate,
				events: {
					dataReceived: function(mEventParams) {
						this._onDataLoadComplete(mEventParams, true);
						// notify any listeners about dataReceived
						this.fireDataReceived(mEventParams);
					}.bind(this),
					change: this._onDataLoadComplete.bind(this)
				}
			});
			this._showOverlay(false);
			// Flag to indicate if table was bound (data fetch triggered) at least once
			this._bIsTableBound = true;
		}
	};

	/**
	 * Called once data is loaded in the binding (i.e. either backend fetch or once change event is fired)
	 * 
	 * @param {boolean} bForceUpdate - force update
	 * @private
	 */
	SmartTable.prototype._onDataLoadComplete = function(mEventParams, bForceUpdate) {
		if (this._bDataLoadPending || bForceUpdate) {
			this._bDataLoadPending = false;
			// Set No data text only if table has no results!
			if (!this._getRowCount()) {
				this._setNoDataText();
			}
			this._oTable.setBusy(false);
			this._oTable.setEnableBusyIndicator(true);
			this.updateTableHeaderState();
			this._disableSumRows();
		}
	};

	SmartTable.prototype.setNoData = function(oNoData) {
		// overwrite the original aggregation setter, otherwise parent relationship will be destroyed when a control is set to the inner table's
		// noData aggregation
		this._oNoData = oNoData;
	};

	SmartTable.prototype.getNoData = function() {
		return this._oNoData;
	};

	/**
	 * Sets the no data text to the internal table
	 * 
	 * @param {string} sOverwriteText - optional text to set on the table
	 * @private
	 */
	SmartTable.prototype._setNoDataText = function(sOverwriteText) {
		var fSetFunction = this._oTable.setNoData;
		if (!fSetFunction) {
			fSetFunction = this._oTable.setNoDataText;
		}

		if (!fSetFunction) {
			return;
		}

		var oNoData = sOverwriteText;
		if (!oNoData) {
			oNoData = this.getNoData();
		}

		if (!oNoData) {
			oNoData = sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("SMARTTABLE_NO_RESULTS");
		}

		fSetFunction.call(this._oTable, oNoData);
	};

	/**
	 * This can be called once data is received to update table header (count) and toolbar buttons(e.g. Excel Export) enabled state
	 * 
	 * @public
	 */
	SmartTable.prototype.updateTableHeaderState = function() {
		this._refreshHeaderText();
		this._setExcelExportEnableState();
	};

	/**
	 * Creates the content based on the metadata/configuration
	 * 
	 * @private
	 */
	SmartTable.prototype._createContent = function() {
		var i, iLen = 0, oField, oColumn, sId, aIndexedColumns;

		aIndexedColumns = this._parseIndexedColumns();

		iLen = this._aTableViewMetadata.length;
		for (i = 0; i < iLen; i++) {
			oField = this._aTableViewMetadata[i];
			if (oField.inResult) {
				this._aAlwaysSelect.push(oField.name);
			}
			this._registerContentTemplateEvents(oField.template);
			sId = this.getId() + "-" + oField.name;
			// Replace invalid chars in name (e.g: "/") with "_"
			sId = sId.replace(/[^A-Za-z0-9_.:]+/g, "_");
			oColumn = this._createColumn(oField, sId);
			// Set the persoData - relevant for personalisation
			oColumn.data("p13nData", {
				columnKey: oField.name,
				leadingProperty: oField.name, // used to fetch data, by adding this to $select param of OData request
				additionalProperty: oField.additionalProperty, // additional data to fetch in $select
				sortProperty: oField.sortable ? oField.name : undefined,
				filterProperty: oField.filterable ? oField.name : undefined,
				type: oField.filterType,
				maxLength: oField.maxLength,
				precision: oField.precision,
				scale: oField.scale,
				aggregationRole: oField.aggregationRole
			});

			if (oField.filterable && oColumn.setFilterProperty) {
				oColumn.setFilterProperty(oField.name);
			}

			if (oField.sortable && oColumn.setSortProperty) {
				oColumn.setSortProperty(oField.name);
			}

			// Add the column to the table
			this._oTable.addColumn(oColumn);
		}

		this._insertIndexedColumns(aIndexedColumns);

		this._updateColumnsPopinFeature();

		this._storeInitialColumnSettings();
	};

	/**
	 * searches for columns which contains a columnIndex custom data property. Removes those columns from the table and returns them
	 * 
	 * @returns {array} the found columns together with their index
	 * @private
	 */
	SmartTable.prototype._parseIndexedColumns = function() {
		var i, iLength, oColumn, aIndexedColumns, oCustomData, sIndex, iIndex, oTemplateCell;
		var aColumns = this._oTable.getColumns();
		var aCells = null;
		if (this._oTemplate && this._oTemplate.getCells) {
			aCells = this._oTemplate.getCells();
		}

		if (!aColumns) {
			return null;
		}

		aIndexedColumns = [];
		iLength = aColumns.length;

		for (i = 0; i < iLength; i++) {
			oColumn = aColumns[i];
			oCustomData = oColumn.data("p13nData");
			sIndex = null;
			if (oCustomData) {
				sIndex = oCustomData.columnIndex;
			}
			iIndex = -1;
			if (sIndex !== null && sIndex !== undefined) {
				iIndex = parseInt(sIndex, 10);
			}
			if (!isNaN(iIndex) && iIndex > -1) {
				if (aCells) {
					oTemplateCell = aCells[i];
					this._oTemplate.removeCell(oTemplateCell);
				} else {
					oTemplateCell = null;
				}

				aIndexedColumns.push({
					index: iIndex,
					column: oColumn,
					template: oTemplateCell
				});
				this._oTable.removeColumn(oColumn);
			}
		}

		aIndexedColumns.sort(function(col1, col2) {
			return col1.index - col2.index;
		});

		return aIndexedColumns;
	};

	/**
	 * inserts columns containing an index back to the table
	 * 
	 * @param {Array} aIndexedColumns - an array containing objects with index and columns
	 * @private
	 */
	SmartTable.prototype._insertIndexedColumns = function(aIndexedColumns) {
		var i, iLength, oColumn;

		if (!aIndexedColumns) {
			return;
		}

		iLength = aIndexedColumns.length;
		for (i = 0; i < iLength; i++) {
			oColumn = aIndexedColumns[i];
			this._oTable.insertColumn(oColumn.column, oColumn.index);
			if (oColumn.template) {
				this._oTemplate.insertCell(oColumn.template, oColumn.index);
			}
		}
	};

	/**
	 * on sap.m.Table, this function activates the popin feature for the visible columns
	 * 
	 * @private
	 */
	SmartTable.prototype._updateColumnsPopinFeature = function() {
		if (!this._isMobileTable || !this.getDemandPopin()) { // popin only available on mobile table
			return;
		}

		var aColumns = this._oTable.getColumns();
		if (!aColumns) {
			return;
		}

		// get only visible columns
		aColumns = aColumns.filter(function(col) {
			return col.getVisible();
		});

		// sort columns according to their order property
		aColumns.sort(function(col1, col2) {
			return col1.getOrder() - col2.getOrder();
		});

		var oColumn, iLength = aColumns.length;

		for (var i = 0; i < iLength; i++) {
			oColumn = aColumns[i];
			if (i < 2) { // ensure always two columns
				oColumn.setDemandPopin(false);
				oColumn.setMinScreenWidth("1px");
			} else {
				oColumn.setDemandPopin(true);
				oColumn.setPopinDisplay(sap.m.PopinDisplay.Inline);
				oColumn.setMinScreenWidth((i + 1) * 10 + "rem");
			}
		}
	};

	/**
	 * stores the initial column settings
	 * 
	 * @private
	 */
	SmartTable.prototype._storeInitialColumnSettings = function() {
		this._aInitialSorters = [];
		PersonalizationUtil.createSort2Json(this._oTable, this._aInitialSorters, PersonalizationUtil.createArrayFromString(this.getIgnoreFromPersonalisation()));
	};

	/**
	 * on sap.m.Table, this function deactivates the popin feature for all columns
	 * 
	 * @private
	 */
	SmartTable.prototype._deactivateColumnsPopinFeature = function() {
		if (!this._isMobileTable) { // popin only available on mobile table
			return;
		}

		var aColumns = this._oTable.getColumns();
		if (!aColumns) {
			return;
		}

		var oColumn, iLength = aColumns.length;

		for (var i = 0; i < iLength; i++) {
			oColumn = aColumns[i];
			oColumn.setDemandPopin(false);
			oColumn.setMinScreenWidth("1px");
		}
	};

	/**
	 * registers events on the template controls which are exposed by the SmartTable
	 * 
	 * @param {sap.ui.core.Control} oTemplateControl - the control on which to register the events
	 * @private
	 */
	SmartTable.prototype._registerContentTemplateEvents = function(oTemplateControl) {
		if (oTemplateControl instanceof sap.ui.comp.navpopover.SmartLink) {
			var oSemanticObjectController = this.getSemanticObjectController();
			oTemplateControl.setSemanticObjectController(oSemanticObjectController);
		}
	};

	/**
	 * stores a list of initially created columns (if any)
	 * 
	 * @private
	 */
	SmartTable.prototype._updateInitialColumns = function() {
		var aColumns = this._oTable.getColumns(), iLen = aColumns ? aColumns.length : 0, oColumn, oColumnData, sColumnKey;
		while (iLen--) {
			sColumnKey = null;
			oColumn = aColumns[iLen];
			// Retrieve path from the property
			if (oColumn) {
				oColumnData = oColumn.data("p13nData");
				if (typeof oColumnData === "string") {
					try {
						oColumnData = JSON.parse(oColumnData);
					} catch (e) {
						// Invalid JSON
					}
					// Set back the object for faster access later
					if (oColumnData) {
						oColumn.data("p13nData", oColumnData);
					}
				}
				if (oColumnData) {
					sColumnKey = oColumnData["columnKey"];
				}
				if (sColumnKey) {
					this._aExistingColumns.push(sColumnKey);
				}
			}
		}
	};

	/**
	 * gets the array of visible column path that is used to create the select query
	 * 
	 * @private
	 * @returns {Array|[]} array of column paths
	 */
	SmartTable.prototype._getVisibleColumnPaths = function() {
		var aSelect = [], aColumns = this._oTable.getColumns(), i, iLen = aColumns ? aColumns.length : 0, oColumn, oColumnData, sPath, sAdditionalPath;

		for (i = 0; i < iLen; i++) {
			oColumn = aColumns[i];
			sPath = null;
			if (oColumn.getVisible()) {
				if (oColumn.getLeadingProperty) {
					sPath = oColumn.getLeadingProperty();
				}

				oColumnData = oColumn.data("p13nData");
				if (oColumnData) {
					if (!sPath) {
						sPath = oColumnData["leadingProperty"];
					}
					sAdditionalPath = oColumnData["additionalProperty"];
				}

				if (sPath && aSelect.indexOf(sPath) < 0) {
					aSelect.push(sPath);
				}
				if (sAdditionalPath && aSelect.indexOf(sAdditionalPath) < 0) {
					aSelect.push(sAdditionalPath);
				}
			}
		}
		return aSelect;
	};

	/**
	 * Creates a table based on the configuration, if necessary. This also prepares the methods to be used based on the table type.
	 * 
	 * @private
	 */
	SmartTable.prototype._createTable = function() {
		var aContent = this.getItems(), iLen = aContent ? aContent.length : 0, oTable;
		this._sAggregation = "rows";
		// Check if a Table already exists in the content (Ex: from view.xml)
		while (iLen--) {
			oTable = aContent[iLen];
			if (oTable instanceof Table || oTable instanceof ResponsiveTable) {
				break;
			}
			oTable = null;
		}

		// If a Table exists determine its type else create one based on the tableType property!
		if (oTable) {
			this._oTable = oTable;
			if (oTable instanceof AnalyticalTable) {
				this._isAnalyticalTable = true;
			} else if (oTable instanceof ResponsiveTable) {
				this._isMobileTable = true;
				// get the item template from the view
				this._oTemplate = (oTable.getItems() && oTable.getItems().length > 0) ? oTable.getItems()[0] : new sap.m.ColumnListItem();
				oTable.removeAllItems();
			} else if (oTable instanceof TreeTable) {
				this._isTreeTable = true;
			}
			// If a table already exists --> get the list of columns to ignore
			this._updateInitialColumns();
		} else {
			// Create table based on tableType
			if (this.getTableType() === "AnalyticalTable") {
				this._isAnalyticalTable = true;
				this._oTable = new AnalyticalTable({
					enableCustomFilter: true
				});
			} else if (this.getTableType() === "ResponsiveTable") {
				this._isMobileTable = true;
				this._oTable = new ResponsiveTable({
					growing: true
				});
				this._oTemplate = new sap.m.ColumnListItem();
			} else if (this.getTableType() === "TreeTable") {
				this._isTreeTable = true;
				this._oTable = new TreeTable({
					selectionMode: sap.ui.table.SelectionMode.MultiToggle
				});
			} else {
				this._oTable = new Table({
					selectionMode: sap.ui.table.SelectionMode.MultiToggle
				});
			}

			if (this._oTable.setVisibleRowCountMode) {
				this._oTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Auto);
			}

			this.insertItem(this._oTable, 2);
		}
		if (!this._oTable.getLayoutData()) {
			this._oTable.setLayoutData(new sap.m.FlexItemData({
				growFactor: 1,
				baseSize: "0%"
			}));
		}

		this._oTable.addStyleClass("sapUiCompSmartTableInnerTable");

		this._oTable.setEnableBusyIndicator(true);
		this._oTable.setBusyIndicatorDelay(0);

		if (this._oTable.setEnableCustomFilter) {
			this._oTable.setEnableCustomFilter(this.getEnableCustomFilter());
		}

		// Always disable Column Visiblilty menu item
		if (this._oTable.setShowColumnVisibilityMenu) {
			this._oTable.setShowColumnVisibilityMenu(false);
		}

		if (this._oTable.getEnableCustomFilter && this._oTable.getEnableCustomFilter()) {
			// disable the cell filter if custom filter is enabled
			if (this._oTable.setEnableCellFilter) {
				this._oTable.setEnableCellFilter(false);
			}
			if (this._oTable.attachCustomFilter) {
				this._oTable.attachCustomFilter(jQuery.proxy(this._showTableFilterDialog, this));
			}
		}

		// Replace the prototype methods to suit the table being used!
		if (this._isAnalyticalTable) {
			this._createColumn = this._createAnalyticalColumn;
		} else if (this._isMobileTable) {
			this._sAggregation = "items";
			this._createColumn = this._createMobileColumn;
			// map bindItems to bindRows for Mobile Table to enable reuse of rebind mechanism
			this._oTable.bindRows = this._oTable.bindItems;
		}

		if (!this._isMobileTable) {
			this._oTable.attachEvent("_rowsUpdated", function() {
				this._setExcelExportEnableState();
			}, this);
		}
		// Always enable the better scroll behaviour - so that scroll/data request only happens once scrollbar is released
		if (this._oTable._setLargeDataScrolling) {
			this._oTable._setLargeDataScrolling(true);
		}
	};

	/**
	 * returns the internally used table object
	 * 
	 * @public
	 * @returns {object} the table
	 */
	SmartTable.prototype.getTable = function() {
		return this._oTable;
	};

	/**
	 * Shows the filter dialog via the Personalisation controller
	 * 
	 * @param {object} oEvent The event parameters
	 * @private
	 */
	SmartTable.prototype._showTableFilterDialog = function(oEvent) {
		if (this._oPersController) {
			this._oPersController.openDialog({
				filter: {
					visible: true,
					payload: {
						column: oEvent.getParameter("column")
					}
				}
			});
		}
	};

	/**
	 * sets the disable property on the DOM's input elements on existing sum rows
	 * 
	 * @private
	 */
	SmartTable.prototype._disableSumRows = function() {
		if (sap.ui.Device.browser.msie && sap.ui.Device.browser.version < 11) { // other browser work via pointer-events: none in CSS
			jQuery.sap.delayedCall(60, this, function() { // CSS classes are set in sap.ui.table.AnalyticalTable._updateTableContent ONLY if data is
				// available. Data gets set via sap.ui.table.Table.updateRows with a setDelay50 call, so
				// ensure this call is triggerd afterwards
				if (this.getEditable()) {
					this._oTable.$().find(".sapUiAnalyticalTableSum input").prop("disabled", true); // set the input elements on the sum line to
					// disabled
					this._oTable.$().find(".sapUiTableGroupHeader input").prop("disabled", true); // set the input elements on the group headers sum
					// line to disabled
				}
			});
		}
	};

	/**
	 * Creates and returns a Column that can be added to the table, based on the metadata provided by the TableProvider
	 * 
	 * @param {object} oField The column's metadata
	 * @param {string} sId The id to be set on the column
	 * @private
	 * @returns {Object} the column that is created
	 */
	SmartTable.prototype._createColumn = function(oField, sId) {
		var oColumn;
		oColumn = new Column(sId, {
			autoResizable: true,
			hAlign: oField.align,
			width: oField.width,
			visible: oField.isInitiallyVisible,
			label: new Label({
				textAlign: oField.align,
				text: oField.label
			}),
			sorted: oField.sorted,
			sortOrder: oField.sortOrder,
			tooltip: oField.quickInfo,
			showSortMenuEntry: oField.sortable,
			showFilterMenuEntry: oField.filterable,
			name: oField.fieldName,
			template: oField.template
		});
		return oColumn;
	};

	/**
	 * Creates and returns an AnalyticalColumn that can be added to the AnalyticalTable, based on the metadata provided by the TableProvider
	 * 
	 * @param {object} oField The column's metadata
	 * @param {string} sId The id to be set on the column
	 * @private
	 * @returns {Object} the column that is created
	 */
	SmartTable.prototype._createAnalyticalColumn = function(oField, sId) {
		var oColumn;
		oColumn = new AnalyticalColumn(sId, {
			autoResizable: true,
			hAlign: oField.align,
			width: oField.width,
			visible: oField.isInitiallyVisible,
			inResult: oField.inResult,
			label: new Label({
				textAlign: oField.align,
				text: oField.label
			}),
			tooltip: oField.quickInfo,
			sorted: oField.sorted,
			sortOrder: oField.sortOrder,
			showSortMenuEntry: oField.sortable,
			showFilterMenuEntry: oField.filterable,
			summed: oField.summed,
			leadingProperty: oField.name,
			template: oField.template
		});
		return oColumn;
	};

	/**
	 * Creates and returns a MobileColumn that can be added to the mobile table, based on the metadata provided by the TableProvider
	 * 
	 * @param {object} oField The column's metadata
	 * @param {string} sId The id to be set on the column
	 * @private
	 * @returns {Object} the column that is created
	 */
	SmartTable.prototype._createMobileColumn = function(oField, sId) {
		var oColumn;
		oColumn = (new Column1(sId, {
			hAlign: oField.align,
			visible: oField.isInitiallyVisible,
			header: new Text({
				text: oField.label
			}),
			tooltip: oField.quickInfo
		}));
		// Mobile table needs the content control to be passed as a template with the items aggregation
		if (oField.template && oField.template.setWrapping) {
			oField.template.setWrapping(true);
		}
		if (this._oTemplate) {
			this._oTemplate.addCell(oField.template);
		}
		return oColumn;
	};

	/**
	 * Interface function for SmartVariantManagment control, returns the current used variant data
	 * 
	 * @public
	 * @returns {json} The currently set variant
	 */
	SmartTable.prototype.fetchVariant = function() {
		if (this._oCurrentVariant === "STANDARD" || this._oCurrentVariant === null) {
			return {};
		}

		return this._oCurrentVariant;
	};

	/**
	 * Interface function for SmartVariantManagment control, sets the current variant
	 * 
	 * @param {Object} oVariantJSON - the variants json
	 * @param {string} sContext - describes the context in which the apply was executed
	 * @public
	 */
	SmartTable.prototype.applyVariant = function(oVariantJSON, sContext) {
		this._oCurrentVariant = oVariantJSON;
		if (this._oCurrentVariant === "STANDARD") {
			this._oCurrentVariant = null;
		}

		// Context STANDARD here specifies that this is a custom application variant for Globalisation/Industry!
		// This would be called just once in the beginning!
		if (sContext === "STANDARD") {
			this._oApplicationDefaultVariant = this._oCurrentVariant;
		}
		// if an application default variant exists --> extend all the other variants based on this!
		// Changes to the industry should be taken over --> but first we only take over non conflicting changes
		// if the user already has some changes --> just use those
		if (this._oApplicationDefaultVariant && !sContext) {
			this._oCurrentVariant = jQuery.extend(true, {}, this._oApplicationDefaultVariant, oVariantJSON);
		}

		// Set instance flag to indicate that we are currently in the process of applying the changes
		this._bApplyingVariant = true;
		// Suppress refresh to prevent backend roundtrips
		if (this._oTable._setSuppressRefresh) {
			this._oTable._setSuppressRefresh(true);
		}

		if (this._oPersController) {
			if (this._oCurrentVariant === null || jQuery.isEmptyObject(this._oCurrentVariant)) {
				this._oPersController.resetPersonalization(sap.ui.comp.personalization.ResetType.ResetFull);
			} else {
				this._oPersController.setPersonalizationData(this._oCurrentVariant);
			}
		}

		// Rebind Table only if data was set on it once or no smartFilter is attached!
		if (this._bIsTableBound || !this._oSmartFilter) {
			this._reBindTable();
		} else {
			this._showOverlay(true);
		}

		// Clear apply variant flag!
		this._bApplyingVariant = false;

		this.fireAfterVariantApply({
			currentVariantId: this.getCurrentVariantId()
		});
	};

	/**
	 * eventhandler fired before personalisation changes are applied to the table
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartTable.prototype._beforePersonalisationModelDataChange = function(oEvent) {

		// we set busy indicator since operation on the table (like setting visible to true) can take longer and the table provides no visual feedback
		this._oTable.setEnableBusyIndicator(false);
		this._oTable.setBusy(true);

		// Suppress refresh to prevent backend roundtrips
		if (this._oTable._setSuppressRefresh) {
			this._oTable._setSuppressRefresh(true);
		}
	};

	/**
	 * eventhandler fired after personalisation changes are potentially applied to the table. Event will be fired before the event
	 * "afterP13nModelDataChange"
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartTable.prototype._afterPersonalisationModelDataChange = function(oEvent) {
		this._updateColumnsPopinFeature();

		// we remove the temporary busy indicator - see sap.ui.comp.smarttable.SmartTable.prototype._beforePersonalisationModelDataChange
		this._oTable.setBusy(false);
		this._oTable.setEnableBusyIndicator(true);

	};

	/**
	 * eventhandler for personalisation changed
	 * 
	 * @param {object} oEvent The event arguments
	 * @private
	 */
	SmartTable.prototype._personalisationModelDataChange = function(oEvent) {
		this._oCurrentVariant = oEvent.getParameter("persistentData");
		if (this._bApplyingVariant) {
			return;
		}
		var oChangeInfo = oEvent.getParameter("changeType");
		var changeStatus = this._getChangeStatus(oChangeInfo);

		if (changeStatus === sap.ui.comp.personalization.ChangeType.Unchanged) {
			return;
		}

		if (!this.getUseVariantManagement()) {
			this._persistPersonalisation();
		} else if (this._oVariantManagement) {
			this._oVariantManagement.currentVariantSetModified(true);
		}

		if (changeStatus === sap.ui.comp.personalization.ChangeType.ModelChanged) {
			// Rebind Table only if data was set on it once or no smartFilter is attached!
			if (this._bIsTableBound || !this._oSmartFilter) {
				this._reBindTable();
			} else {
				this._showOverlay(true);
			}
		}
	};

	/**
	 * returns the current filter and sorting options from the table personalisation/variants
	 * 
	 * @private
	 * @param {object} oChangeInfo The change info given by the personalization controller
	 * @returns {sap.ui.comp.personalization.ChangeType} the merged change status
	 */
	SmartTable.prototype._getChangeStatus = function(oChangeInfo) {
		if (!oChangeInfo) {
			// change info not provided return ModelChanged to indicate that we need to update everything internally
			return sap.ui.comp.personalization.ChangeType.ModelChanged;
		}

		if (oChangeInfo.sort === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeInfo.filter === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeInfo.columns === sap.ui.comp.personalization.ChangeType.ModelChanged || oChangeInfo.group === sap.ui.comp.personalization.ChangeType.ModelChanged) {
			// model has changed and was not applied to table
			return sap.ui.comp.personalization.ChangeType.ModelChanged;
		}

		if (oChangeInfo.sort === sap.ui.comp.personalization.ChangeType.TableChanged || oChangeInfo.filter === sap.ui.comp.personalization.ChangeType.TableChanged || oChangeInfo.columns === sap.ui.comp.personalization.ChangeType.TableChanged || oChangeInfo.group === sap.ui.comp.personalization.ChangeType.TableChanged) {
			// change was already applied to table
			return sap.ui.comp.personalization.ChangeType.TableChanged;
		}

		return sap.ui.comp.personalization.ChangeType.Unchanged;
	};

	/**
	 * returns the current filter and sorting options from the table personalisation/variants
	 * 
	 * @private
	 * @returns {object} current variant's filter and sorting options
	 */
	SmartTable.prototype._getTablePersonalisationData = function() {
		if (!this._oCurrentVariant) {
			return null;
		}

		var aSorters = [], aFilters = [], aExcludeFilters = [], oExcludeFilters, oGroupItem, oGroupSorter, aSortData, oColumn, oColumnData, sGroupPath, sPath, sColumnsText = "";

		// group handling
		if (this._isMobileTable && this._oCurrentVariant.group && this._oCurrentVariant.group.groupItems) {
			oGroupItem = this._oCurrentVariant.group.groupItems[0];
			oColumn = this._getColumnByKey(oGroupItem.columnKey);
			if (oColumn) {
				sColumnsText = oColumn.getHeader().getText();
			}

			sPath = this._getPathFromColumnKeyAndProperty(oGroupItem.columnKey, "sortProperty");
			// Initialise the GroupPath to a new variable as it is being used in the formatter function
			sGroupPath = sPath;
			oGroupSorter = new sap.ui.model.Sorter(sGroupPath, oGroupItem.operation === "GroupDescending", function(oContext) {
				var sKey = oContext.getProperty(sGroupPath);
				return {
					key: sKey,
					text: sColumnsText ? sColumnsText + " : " + sKey : sKey
				};
			});

			aSorters.push(oGroupSorter);
		}

		// sort handling
		if (this._oCurrentVariant.sort) {
			aSortData = this._oCurrentVariant.sort.sortItems;
		} else {
			aSortData = this._aInitialSorters;
		}

		if (aSortData) {
			aSortData.forEach(function(oModelItem) {
				var bDescending = oModelItem.operation === "Descending";
				sPath = this._getPathFromColumnKeyAndProperty(oModelItem.columnKey, "sortProperty");
				if (oGroupSorter && oGroupSorter.sPath === sPath) {
					oGroupSorter.bDescending = bDescending;
				} else {
					aSorters.push(new sap.ui.model.Sorter(sPath, bDescending));
				}
			}, this);
		}

		// Filter Handling
		if (this._oCurrentVariant.filter) {
			this._oCurrentVariant.filter.filterItems.forEach(function(oModelItem) {
				var oValue1 = oModelItem.value1, oValue2 = oModelItem.value2;
				// Filter path has be re-calculated below
				sPath = null;
				oColumn = this._getColumnByKey(oModelItem.columnKey);
				if (oColumn) {
					if (oColumn.getFilterProperty) {
						sPath = oColumn.getFilterProperty();
					}
					oColumnData = oColumn.data("p13nData");
					if (oColumnData) {
						if (!sPath) {
							sPath = oColumnData["filterProperty"];
						}
						// Convert string values in filter model to date instances
						if (oColumnData["type"] === "date") {
							if (oValue1 && typeof (oValue1) === "string") {
								oValue1 = new Date(oValue1);
							}
							if (oValue2 && typeof (oValue2) === "string") {
								oValue2 = new Date(oValue2);
							}
						}
					}
				}

				if (oValue1 instanceof Date && this._oTableProvider && this._oTableProvider.getIsUTCDateHandlingEnabled()) {
					oValue1 = FilterProvider.getDateInUTCOffset(oValue1);
					oValue2 = oValue2 ? FilterProvider.getDateInUTCOffset(oValue2) : oValue2;
				}
				if (oModelItem.exclude) {
					aExcludeFilters.push(new sap.ui.model.Filter(sPath, FilterOperator.NE, oValue1));
				} else {
					aFilters.push(new sap.ui.model.Filter(sPath, oModelItem.operation, oValue1, oValue2));
				}
			}, this);

			if (aExcludeFilters.length) {
				oExcludeFilters = new sap.ui.model.Filter(aExcludeFilters, true);
			}
		}

		return {
			filters: aFilters,
			excludeFilters: oExcludeFilters,
			sorters: aSorters
		};
	};

	/**
	 * Returns the column for the given column key
	 * 
	 * @param {string} sColumnKey - the column key for the required column
	 * @returns {object} The found column or null
	 * @private
	 */
	SmartTable.prototype._getColumnByKey = function(sColumnKey) {
		var aColumns, oColumn, iLength, i, oCustomData;
		if (this._oTable) {
			aColumns = this._oTable.getColumns();
			iLength = aColumns.length;
			for (i = 0; i < iLength; i++) {
				oColumn = aColumns[i];
				oCustomData = oColumn.data("p13nData");
				if (oCustomData && oCustomData.columnKey === sColumnKey) {
					return oColumn;
				}
			}
		}

		return null;
	};

	/**
	 * Retrieves the path for the specified property and column key from the array of table columns
	 * 
	 * @param {string} sColumnKey - the column key specified on the table
	 * @param {string} sProperty - the property path that needs to be retrieved from the column
	 * @returns {string} The path that can be used by sorters, filters etc.
	 * @private
	 */
	SmartTable.prototype._getPathFromColumnKeyAndProperty = function(sColumnKey, sProperty) {
		var sPath = null, oColumn, oColumnData;
		oColumn = this._getColumnByKey(sColumnKey);

		// Retrieve path from the property
		if (oColumn) {
			if (sProperty == "sortProperty" && oColumn.getSortProperty) {
				sPath = oColumn.getSortProperty();
			} else if (sProperty == "filterProperty" && oColumn.getFilterProperty) {
				sPath = oColumn.getFilterProperty();
			} else if (sProperty == "leadingProperty" && oColumn.getLeadingProperty) {
				sPath = oColumn.getLeadingProperty();
			}

			if (!sPath) {
				oColumnData = oColumn.data("p13nData");
				if (oColumnData) {
					sPath = oColumnData[sProperty];
				}
			}
		}

		return sPath;
	};

	/**
	 * triggers (hidden) VariantManagementControl to persist personalisation this function is called in case no VariantManagementControl is used
	 * 
	 * @private
	 */
	SmartTable.prototype._persistPersonalisation = function() {
		var that = this;
		if (this._oVariantManagement) {
			this._oVariantManagement.getVariantsInfo(function(aVariants) {
				var sPersonalisationVariantKey = null;
				if (aVariants && aVariants.length > 0) {
					sPersonalisationVariantKey = aVariants[0].key;
				}

				var bOverwrite = sPersonalisationVariantKey !== null;

				var oParams = {
					name: "Personalisation",
					global: false,
					overwrite: bOverwrite,
					key: sPersonalisationVariantKey,
					def: true
				};
				that._oVariantManagement.fireSave(oParams);
			});
		}
	};

	/**
	 * returns the id of the currently selected variant.
	 * 
	 * @public
	 * @returns {string} id of the currently selected variant
	 */
	SmartTable.prototype.getCurrentVariantId = function() {
		var sKey = "";

		if (this._oVariantManagement) {
			sKey = this._oVariantManagement.getCurrentVariantId();
		}

		return sKey;
	};

	/**
	 * Set the current variant according to the sVariantId. In case an empty string or null or undefined was passed the STANDARD will be set. STANDARD
	 * will also be set, in case the passed sVariantId could not be found. In case neither a flexibility variant, nor the content for the standard
	 * variant could not be obtained, nor the personalisable control obtained nothing will be executed/changed
	 * 
	 * @public
	 * @param {string} sVariantId id of the currently selected variant
	 */
	SmartTable.prototype.setCurrentVariantId = function(sVariantId) {
		if (this._oVariantManagement) {
			this._oVariantManagement.setCurrentVariantId(sVariantId);
		} else {
			jQuery.sap.log.error("sap.ui.comp.smarttable.SmartTable.prototype.setCurrentVariantId: VariantManagement does not exist");
		}
	};

	/**
	 * Cleans up the control
	 * 
	 * @public
	 */
	SmartTable.prototype.exit = function() {
		if (this._oTableProvider && this._oTableProvider.destroy) {
			this._oTableProvider.destroy();
		}
		this._oTableProvider = null;
		if (this._oPersController && this._oPersController.destroy) {
			this._oPersController.destroy();
		}
		this._oPersController = null;
		if (this._oVariantManagement && this._oVariantManagement.destroy) {
			this._oVariantManagement.destroy();
		}
		if (this._oEditModel) {
			this._oEditModel.destroy();
		}

		if (this._oNoData && this._oNoData.destroy) {
			this._oNoData.destroy();
		}
		this.oNoData = null;
		this._oEditModel = null;
		this._oVariantManagement = null;
		this._oCurrentVariant = null;
		this._oApplicationDefaultVariant = null;
		this._aTableViewMetadata = null;
		this._aExistingColumns = null;
		this._aAlwaysSelect = null;
		this._oSmartFilter = null;
		this._oCustomToolbar = null;
		this._oToolbar = null;
		this._oUseExportToExcel = null;
		this._oTablePersonalisationButton = null;
		this._oTemplate = null;
		this._oView = null;
		this._oTable = null;
	};

	return SmartTable;

}, /* bExport= */true);
