define(
	[
		"../../utils/W5gUtils",
		"./PaletteItem",
		"../../models/W5gPaletteModel",
		"../../utils/W5gUi5LibraryMediator"
	],
	function (W5gUtils, PaletteItem, PaletteModel, W5gUi5LibraryMediator) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette");
		jQuery.sap.require("sap.ui.commons.SearchField");

// Private variables and methods
// Begin
		var
			/**
			 * Current filter value
			 *
			 * @type {string}
			 * @private
			 */
			_sFilter = "",

			/**
			 * Filters map
			 *
			 * @type {object<string, string>}
			 * @private
			 */
			_mFilterForEditor = {},

			/**
			 * Current document if any
			 * @type {null}
			 * @private
			 */
			_currentDocument = null;

		/**
		 * Notifies the <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette</code> about changed filter
		 *
		 * @this {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette}
		 *
		 * @param oEvent an event object
		 *
		 * @name _onFilter
		 * @function
		 * @private
		 */
		function _onFilter(oEvent) {
			_setFilter(this, oEvent.getParameter("value"), true);
			this.getAggregation("searchField").focus();
		}

		/**
		 * Compare existing categories collection vs incoming controls array
		 *
		 * @param {Array<object>} aCategories existed 'sections' aggregation
		 * @param {Array<object>} aControls array of palette controls
		 * @private
		 * @return {boolean}
		 *
		 * @name _isPaletteControlsEqual
		 * @function
		 */
		function _isPaletteControlsEqual(aCategories, aControls) {
			var iSize = 0;
			_.each(_.pluck(aCategories, 'controls'), function (oItem) {
				iSize += oItem.length;
			});
			if (iSize !== aControls.length) {
				return false;
			}
			var result = true;
			_.each(aCategories, function(oCategory){
				result &= _.all(oCategory.controls, function(oValue){
					return _.find(aControls, function(oControl){
						return oControl.name === oValue.name &&
							oControl.category === oValue.category;
					});
				});
			});
			return result;
		}

		/**
		 * Sets filter for <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette</code>
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette palette
		 * @param {string} sFilter filter value
		 * @param {boolean=} bEvent true if this value has been set by ui control
		 *
		 * @name _setFilter
		 * @function
		 * @private
		 */
		function _setFilter(oPalette, sFilter, bEvent) {
			_sFilter = sFilter;
			if (!bEvent) {
				oPalette.getAggregation("searchField").setValue(_sFilter);
			}

			oPalette.getModel().applyFilter(sFilter);
		}

		/**
		 * Rebind sections aggregation to the model.
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette palette
		 *
		 * @name _rebindSectionAggregation
		 * @function
		 * @private
		 */
		function _rebindSectionAggregation(oPalette) {
			oPalette.getAggregation("sections").forEach(function (section){
				(section.getContent() || []).forEach(function(item){
					item.rebind(oPalette);
				});
			});
		}

		/**
		 * Binds sections aggregation to the model.
		 *
		 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oPalette palette
		 *
		 * @name _bindSectionsAggregation
		 * @function
		 * @private
		 */
		function _bindSectionsAggregation(oPalette) {
			if (!oPalette.getDesignTime()) {
				oPalette.destroyAggregation("sections");
				return;
			}

			oPalette.bindAggregation("sections", "/data", new sap.ui.commons.Panel({
				showCollapseIcon: true,
				title: new sap.ui.commons.Title({
					text: "{name}"
				}),
				content: {
					path: "controls",
					factory: function () {
						return new PaletteItem({
							name: "{name}",
							title: "{title}",
							icon: "{icon}",
							visible: "{visible}",
							window: oPalette.getWindow(),
							designTime: oPalette.getDesignTime()
						});
					}
				},
				visible: {
					parts: ["controls"],
					formatter: function (aControls) {
						return !!(aControls || []).length;
					}
				},
				collapsed: "{collapsed}",
				areaDesign: sap.ui.commons.enums.AreaDesign.Plain,
				borderDesign: sap.ui.commons.enums.BorderDesign.None
			}).addStyleClass("sapWysiwygSectionPanel"));
		}

// End
// Private variables and methods

		/**
		 * Constructor for a new Palette.
		 *
		 * @param {string=} sId id for the new control, generated automatically if no id is given
		 * @param {object=} mSettings initial settings for the new control
		 *
		 * @class
		 * WYSIWYG palette control
		 * @extends sap.ui.core.Control
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette
		 */
		var Palette = sap.ui.core.Control.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette",
			/** @lends sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette.prototype */ {
			metadata: {
				properties: {
					/**
					 * Reference to design time object if any.
					 */
					"designTime": {"type": "object", "group": "Misc", "defaultValue": null},
					/**
					 * Reference to iframe window object if any.
					 */
					"window": {"type": "object", "group": "Misc", "defaultValue": null}
				},
				aggregations: {
					/**
					 * Hidden, for internal use only.
					 */
					"searchField": {"type": "sap.ui.commons.SearchField", "multiple": false, "visibility": "hidden"},

					/**
					 * Aggregates the sections that are contained in the
					 * <code>sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette</code>.
					 */
					"sections": {"type": "sap.ui.commons.Panel", "multiple": true, "singularName": "panel"}
				}
			},
			constructor: function () {
				sap.ui.core.Control.apply(this, arguments);

				this.setAggregation("searchField", new sap.ui.commons.SearchField(this.getId() + "-filter",{
					enableListSuggest: false,
					showListExpander: false,
					enableFilterMode: true,
					enableClear: true,
					startSuggestion: 0,
					suggest: [_onFilter, this]
				}).addStyleClass("sapWysiwygFilter"))
				.addEventDelegate({
					oncontextmenu: function (oEvent) {
						//prevent the default browser context menu appearance
						oEvent.preventDefault();
					}
				});
				_bindSectionsAggregation(this);
			},

			/**
			 * Renders the HTML for the given control <code>oControl</code>, using the provided render manager <code>oRm</code>
			 *
			 * @param {sap.ui.core.RenderManager} oRm
			 *          The render manager that can be used for writing to the render output buffer.
			 * @param {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette} oControl
			 *          An object representation of the control that should be rendered.
			 */
			renderer: function (oRm, oControl) {
				var oSearchField = oControl.getAggregation("searchField");
				oRm.renderControl(oSearchField);
				oRm.write("<span");
				oRm.writeControlData(oControl);
				oRm.addClass("sapWysiwygPalette");
				oRm.writeClasses();
				oRm.write(">");
				(oControl.getAggregation("sections") || []).forEach(function (oPanel) {
					oRm.renderControl(oPanel);
				});

				oRm.write("</span>");
			}
		});


		/**
		 * Adds placeholder to search field
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette#onAfterRendering
		 * @function
		 * @public
		 */
		Palette.prototype.onAfterRendering = function () {
			W5gUtils.addPlaceHolderToSearchField(this.getAggregation("searchField"), "palette_search_field_placeholder");
		};

		/**
		 * Cleans up the element instance before destruction.
		 *
		 * @override sap.ui.core.Element#exit
		 */
		Palette.prototype.exit = function () {
			this.reset();
		};

		/**
		 * Resets design time object and palette model.
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette#reset
		 * @function
		 * @public
		 */
		Palette.prototype.reset = function () {
			this.setDesignTime(null);
			this.setWindow(null);
		};

		/**
		 * Restores filter
		 *
		 * @param oDocument document object
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette#restoreFilter
		 * @function
		 * @public
		 */
		Palette.prototype.restoreFilter = function (oDocument) {
			if (oDocument) {
				if (oDocument !== _currentDocument) {
					if (_currentDocument) {
						// _currentDocument is not defined if palette is opened first time or wysiwyg editor is closed
						// store the filter value of the previously opened wysiwyg editor
						_mFilterForEditor[_currentDocument.getKeyString()] = _sFilter;
					}
					_currentDocument = oDocument;
					_sFilter = _mFilterForEditor[oDocument.getKeyString()] || "";
				}
				_setFilter(this, _sFilter);
			}
		};

		/**
		 * Cleans up the filter
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette#cleanUpFilter
		 * @function
		 * @public
		 */
		Palette.prototype.cleanUpFilter = function () {
			if (_mFilterForEditor && _currentDocument) {
				delete _mFilterForEditor[_currentDocument.getKeyString()];
				_currentDocument = null;
			}
			_sFilter = "";
			this.getAggregation("searchField").setValue(_sFilter);
		};

		/**
		 * Sets palette controls using design time object
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette#onCanvasLoaded
		 * @function
		 * @public
		 */
		Palette.prototype.onCanvasLoaded = function () {
			// TODO The event could be registered, when the designTime is set -> make onCanvasLoaded private
			this._setPaletteModel(W5gUi5LibraryMediator.getSupportedControls(this.getDesignTime()));
		};

		/**
		 * Sets palette model content
		 *
		 * @param {Array<object>} aPaletteControls array of palette controls
		 * @private
		 *
		 * @name _setPaletteModel
		 * @function
		 */
		Palette.prototype._setPaletteModel = function (aPaletteControls) {
			var oModel = this.getModel();
			if (!(oModel instanceof PaletteModel)) {
				oModel = new PaletteModel();
				this.setModel(oModel);
			}
			if(!oModel.getData().data || !_isPaletteControlsEqual(oModel.getData().data, aPaletteControls)) {
				oModel.setControls(aPaletteControls);
				_bindSectionsAggregation(this);
			} else if (oModel.getData().data) {
				_rebindSectionAggregation(this);
			}
		};

		/**
		 * Handles mouse clicks
		 *
		 * @param {object} oEvent an event object
		 *
		 * @public
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.Palette#onclick
		 * @function
		 */
		Palette.prototype.onclick = function (oEvent) {
			if (oEvent.target.getAttribute("role") === "heading") {
				var oPanel = oEvent.srcControl;
				oPanel.setCollapsed(!oPanel.getCollapsed());
			}
		};

		return Palette;
	}
);
