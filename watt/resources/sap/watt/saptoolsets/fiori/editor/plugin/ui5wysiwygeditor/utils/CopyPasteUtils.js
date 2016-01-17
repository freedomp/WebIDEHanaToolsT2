define(
	[
		"sap/watt/lib/lodash/lodash",
		"./W5gUtils"
	],
	function (_, W5gUtils) {
		"use strict";
		var rCopySuffixPattern = /(_copy)(\d*)$/,
			rIdAttributePattern = /(id\s*=\s*"\w*")/,
			rIdValueGrouping = /id\s*=\s*"(\w*)"/;

		var CopyPasteUtils = {
			/**
			 * Compute the next candidate id
			 * @param {string} sOldId The old id
			 * @return {string}
			 * @public
			 */
			createNextId: function (sOldId) {
				var aResult = rCopySuffixPattern.exec(sOldId);
				if (aResult === null) {
					return sOldId + "_copy";
				}
				var sIndex = aResult[2];
				if (sIndex === "") {
					return sOldId + 2;
				}
				var iNewIndex = parseInt(sIndex, 10) + 1;
				return sOldId.substr(0, sOldId.length - sIndex.length) + iNewIndex;
			},

			/**
			 * Checks if an id is already used in the view of by previous id generation inside the same control
			 * @param {string} sId the checked id
			 * @param {Document} oRootXML
			 * @param {function} fnGetById
			 * @param {Array<string>} aGeneratedIds
			 * @return {boolean}
			 * @public
			 */
			isAlreadyUsed: function (sId, oRootXML, fnGetById, aGeneratedIds) {
				return !!oRootXML.getElementById(sId) || _.contains(aGeneratedIds, sId) || fnGetById(sId);
			},

			/**
			 * change all ids in the XML string representation so that they doesn't conflict with other controls in the view
			 * @param {string} sXMLRep XML string representation of the control
			 * @param {Document} oRootXML
			 * @param {function} fnGetById
			 * @return {string} XML string representation of the control with revised ids so there are no conflicts
			 * @public
			 */
			fixAllIds: function (sXMLRep, oRootXML, fnGetById) {
				var aListWithIds = sXMLRep.split(rIdAttributePattern);
				var aGeneratedIds = [];
				var manipulatedList = aListWithIds.map(function (sElement) {
					var aResult = rIdValueGrouping.exec(sElement);
					if (aResult === null) {
						return sElement;
					}
					var sId = aResult[1];
					while (CopyPasteUtils.isAlreadyUsed(sId, oRootXML, fnGetById, aGeneratedIds)) {
						sId = CopyPasteUtils.createNextId(sId);
					}
					aGeneratedIds.push(sId);
					return 'id="' + sId + '"';
				});
				return manipulatedList.join("");
			},

			/**
			 * is copy/cut of this control currently supported?
			 * @param {sap.ui.core.Control} oControl
			 * @param {Window} oWindow
			 * @return {*|boolean}
			 * @public
			 */
			isControlCopyUnsupported: function (oControl, oWindow) {
				return W5gUtils.isControlFragment(oControl) || oControl.getMetadata().getName() === "sap.m.Page" ||
					oControl instanceof oWindow.sap.ui.core.mvc.View;
			},

			/**
			 * fine tuning before control paste
			 * @param {sap.ui.core.Control} oControl
			 * @param {sap.ui.core.Control} oTarget
			 * @param {string} sTargetAggregationName
			 * @param {sap.ui.dt.DesignTime} oDesignTime
			 * @return {sap.ui.core.Control} oControl
			 * @public
			 */
			adjustControlBeforeAdd: function (oControl, oTarget, sTargetAggregationName, oDesignTime) {
				if (oControl && oTarget && oDesignTime) {
					var oDesignTimeMetadata = oDesignTime.getDesignTimeMetadata(),
						fnBeforeAdd = _.get(oDesignTimeMetadata, [
							oTarget.getMetadata().getName(), "aggregations", sTargetAggregationName, "beforeAdd"
						]);
					if (fnBeforeAdd) {
						fnBeforeAdd.call(oTarget, oControl);
					}
				}
				return oControl;
			}
		};

		return CopyPasteUtils;
	});
