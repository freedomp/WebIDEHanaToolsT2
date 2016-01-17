define(
	[
		"../utils/DocuUtils"
	],
	function (DocuUtils) {
		"use strict";

		jQuery.sap.declare("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPaletteModel");
		jQuery.sap.require("sap.ui.model.json.JSONModel");

// Private variables and methods
// Begin
		/**
		 * Returns 1 if <code>o1</code> must be before <code>o2</code>,
		 * -1 if <code>o2</code> must be before <code>o1</code>,
		 * 0 if order of <code>o1</code> and <code>o1</code> does not matter
		 *
		 * All comparisons done using given property <code>sProp</code>
		 *
		 * @param {object} o1 a control property entry
		 * @param {object} o2 a control property entry
		 * @param sProp comparison property name
		 * @return {number}
		 *
		 * @name _sortByName
		 * @function
		 * @private
		 */
		function _sort(o1, o2, sProp) {
			if (o1[sProp] > o2[sProp]) {
				return 1;
			}
			if (o1[sProp] < o2[sProp]) {
				return -1;
			}
			return 0;
		}

		/**
		 * Returns 1 if <code>o1</code> must be before <code>o2</code>,
		 * -1 if <code>o2</code> must be before <code>o1</code>,
		 * 0 if order of <code>o1</code> and <code>o1</code> does not matter
		 *
		 * All comparisons done using property "title"
		 *
		 * @param {object} o1 a control property entry
		 * @param {object} o2 a control property entry
		 * @returns {number}
		 *
		 * @name _sortByName
		 * @function
		 * @private
		 */
		function _sortByTitle(o1, o2) {
			return _sort(o1, o2, "title");
		}

		/**
		 * Returns 1 if <code>o1</code> must be before <code>o2</code>,
		 * -1 if <code>o2</code> must be before <code>o1</code>,
		 * 0 if order of <code>o1</code> and <code>o1</code> does not matter
		 *
		 * All comparisons done using property "name"
		 *
		 * @param {object} o1 a control property entry
		 * @param {object} o2 a control property entry
		 * @returns {number}
		 *
		 * @name _sortByName
		 * @function
		 * @private
		 */
		function _sortByName(o1, o2) {
			return _sort(o1, o2, "name");
		}

// End
// Private variables and methods

		/**
		 * Constructor for a new W5gPaletteModel.
		 *
		 * @param {object} oData either the URL where to load the JSON from or a JS object
		 *
		 * @class
		 * The model describing WYSIWYG palette control
		 * @extends sap.ui.model.json.JSONModel
		 *
		 * @constructor
		 * @public
		 * @alias sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPaletteModel
		 */
		var PaletteModel = sap.ui.model.json.JSONModel.extend("sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPaletteModel");

		/**
		 * Sets the underlying control for the model.
		 *
		 * @public
		 * @param {Array<object>} aControls the controls to use
		 * @returns {sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPaletteModel} this to allow method chaining
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.models.W5gPaletteModel#setControls
		 * @function
		 * @public
		 */
		PaletteModel.prototype.setControls = function (aControls) {
			var that = this,
				oDataObject = {
					data: []
				};
			aControls
				.sort(_sortByTitle)
				.forEach(function (oControl) {
					if (oControl.category !== undefined) {
						oControl.visible = true;
						var oCategory = null;
						jQuery.each(oDataObject.data, function () {
							if (this.name === oControl.category) {
								oCategory = this;
								return false;
							}
						});
						if (!oCategory) {
							oCategory = {
								name: oControl.category,
								collapsed: true,
								controls: []
							};
							oDataObject.data.push(oCategory);
						}
						oCategory.controls.push(oControl);
					}
				});

			DocuUtils.enrichControlInfos(aControls.filter(function (oControl) {
				return !!oControl.category;
			})).then(function () {
				that.checkUpdate(false);
			}).done();

			oDataObject.data.sort(_sortByName);

			// the first category is expanded per default
			if (oDataObject.data.length) {
				oDataObject.data[0].collapsed = false;
			}

			this.setData(oDataObject);
			return this;
		};

		/**
		 * Applies current filter
		 *
		 * @param {string} sFilter filter value
		 *
		 * @name sap.watt.saptoolsets.fiori.editor.plugin.ui5wysiwygeditor.control.palette.PaletteModel#applyFilter
		 * @function
		 * @public
		 */
		PaletteModel.prototype.applyFilter = function (sFilter) {
			var oData = this.getData(),
				bEmptyFilter = sFilter.length === 0,
				sLowerCaseFilter = sFilter.toLowerCase(),
				bCollapse, bVisible, sName;
			var existed = jQuery.extend(true, {}, oData.data);

			oData.data.forEach(function (oCategory) {
				bCollapse = true;
				oCategory.controls.forEach(function (oControl) {
					bVisible = bEmptyFilter;
					if (!bEmptyFilter) {
						// do not take the complete control name as filter criteria,
						// otherwise all controls will be found when filter is "sap" or a simple dot
						sName = oControl.name.substr(oControl.name.lastIndexOf(".") + 1);
						bVisible = sName.toLowerCase().indexOf(sLowerCaseFilter) !== -1 ||
							oControl.title.toLowerCase().indexOf(sLowerCaseFilter) !== -1;
						bCollapse &= !bVisible;
					}
					oControl.visible = bVisible;
				});
				oCategory.collapsed = !!bCollapse;
			});
			if (bEmptyFilter && oData.data.length > 0) {
				// if the filter is initial the first category is expanded per default, no filtering in that case
				if (oData.data[0]){
					oData.data[0].collapsed = false;
				}
			}
			if (!jQuery.sap.equal(jQuery.extend(true, {}, oData.data), existed)) {
				this.checkUpdate(true);
			}
		};

		return PaletteModel;
	}
);
