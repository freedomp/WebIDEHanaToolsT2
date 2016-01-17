/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides control sap.ui.vbm.VoAggregation.
sap.ui.define([
	'sap/ui/core/Element', './library'
], function(Element, library) {
	"use strict";

	/**
	 * Constructor for a new VoAggregation.
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Abstract VO aggregation container. This element implements the common part for all specific VO aggregations. It must not be used
	 *        directly, but is the base for further extension.
	 * @extends sap.ui.core.Element
	 * @constructor
	 * @public
	 * @alias sap.ui.vbm.VoAggregation
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var VoAggregation = Element.extend("sap.ui.vbm.VoAggregation", /** @lends sap.ui.vbm.VoAggregation.prototype */
	{
		metadata: {

			library: "sap.ui.vbm",
			properties: {

				/**
				 * Selection cardinality: minimum selected elements ("0" or "1" )
				 */
				minSel: {
					type: "string",
					group: "Misc",
					defaultValue: "0"
				},

				/**
				 * Selection cardinality: maximum selectable elements ( valid values are "0", "1", and "n" )
				 */
				maxSel: {
					type: "string",
					group: "Misc",
					defaultValue: "n"
				}
			},
			events: {

				/**
				 * This event is raised when a Design handle is moved.
				 */
				handleMoved: {},

				/**
				 * This event is raised when a Design handle is right clicked.
				 */
				handleContextMenu: {},

				/**
				 * This event is raised when a Design handle is clicked.
				 */
				handleClick: {},

				/**
				 * This event is raised when aggregated elements get selected
				 */
				select: {},

				/**
				 * This event is raised when aggregated elements get deselected
				 */
				deselect: {}
			}
		}
	});

	// /**
	// * This file defines behavior for the control,
	// */
	VoAggregation.prototype.init = function() {
		// do something for initialization...
		this.BindingDiff = [];
	};

	VoAggregation.prototype.handleSelectEvent = function(select, data) {
		if (select) {
			this.fireSelect({
				selected: data
			});
		} else {
			this.fireDeselect({
				deselected: data
			});
		}

	};

	VoAggregation.prototype.isEventRegistered = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			var oInstance = aVO[nJ];

			// if one registers for an event we can return........................//
			if (oInstance.mEventRegistry[name]) {
				return true;
			}
		}

		return false;
	};

	VoAggregation.prototype.findSelected = function(select, data) {
		var aVO = this.getItems();
		if (!aVO) {
			return null;
		}
		var aSel = [];
		if (jQuery.type(data) == 'object') {
			if (data["VB:s"] == (select ? "true" : "false")) {
				for (var nI = 0; nI < aVO.length; ++nI) {
					if (aVO[nI].sId == data["K"]) {
						aSel.push(aVO[nI]);
					}
				}

			}
		} else if (jQuery.type(data) == 'array') {
			for (var nJ = 0; nJ < data.length; ++nJ) {
				if (data[nJ]["VB:s"] == (select ? "true" : "false")) {
					for (var nK = 0; nK < aVO.length; ++nK) {
						if (aVO[nK].sId == data[nJ]["K"]) {
							aSel.push(aVO[nK]);
						}
					}
				}
			}
		}
		return aSel;
	};

	VoAggregation.prototype.findInstance = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		// name maybe <aggr>.<elem> or just <elem>
		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aVO[nJ].sId === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	VoAggregation.prototype.findInstanceByKey = function(name) {
		var aVO = this.getItems();
		if (!aVO) {
			return false;
		}

		// name maybe <aggr>.<elem> or just <elem>
		var key = (name.indexOf(".") !== -1) ? name.split(".")[1] : name;
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			// get the control.....................................................//
			if (aVO[nJ].sId === key || aVO[nJ].getKey() === key) {
				return aVO[nJ];
			}
		}

		return null;
	};

	VoAggregation.prototype.getActionArray = function() {
		var id = this.getId();
		var aActions = [];

		if (this.mEventRegistry["handleMoved"] || this.isEventRegistered("handleMoved")) {
			aActions.push({
				"id": id + "4",
				"name": "handleMoved",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleMoved"
			});
		}
		if (this.mEventRegistry["handleContextMenu"] || this.isEventRegistered("handleContextMenu")) {
			aActions.push({
				"id": id + "5",
				"name": "handleContextMenu",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleContextMenu"
			});
		}
		if (this.mEventRegistry["handleClick"] || this.isEventRegistered("handleClick")) {
			aActions.push({
				"id": id + "6",
				"name": "handleClick",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "HandleClick"
			});
		}
		if ((this.mEventRegistry["select"] || this.mEventRegistry["deselect"]) && !this.isEventRegistered("click")) {
			aActions.push({
				"id": id + "9",
				"name": "click",
				"refScene": "MainScene",
				"refVO": id,
				"refEvent": "Click"
			});
		}

		return aActions;
	};

	VoAggregation.prototype.getTemplateBindingInfo = function() {
		// read binding info to check what is bound and what is static
		var oBindingInfo = this.getBindingInfo("items");
		if (oBindingInfo && oBindingInfo.template) {
			return oBindingInfo.template.mBindingInfos;
		}
	};

	VoAggregation.prototype.getBindInfo = function() {
		var oBindInfo = {};
		var oTemplateBindingInfo = this.getTemplateBindingInfo();

		// Note: Without Template no static properties -> all bound in the sense of VB JSON!
		oBindInfo.HS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("hotScale") : true;
		oBindInfo.HDC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("hotDeltaColor") : true;
		oBindInfo.SC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("selectColor") : true;
		oBindInfo.FS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("fxsize") : true;
		oBindInfo.FD = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("fxdir") : true;
		oBindInfo.ET = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("entity") : true;
		oBindInfo.LT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelText") : true;
		oBindInfo.LBC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelBgColor") : true;
		oBindInfo.LBBC = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelBorderColor") : true;
		oBindInfo.AR = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelArrow") : true;
		oBindInfo.LP = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelPos") : true;
		oBindInfo.TT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("tooltip") : true;
		oBindInfo.DD = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dragData") : true;
		oBindInfo.M = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("changeable") : true;

		oBindInfo.DS = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dragSource") : true;
		oBindInfo.DT = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("dropTarget") : true;

		oBindInfo.LabelType = (oTemplateBindingInfo) ? oTemplateBindingInfo.hasOwnProperty("labelType") : true;

		oBindInfo.hasTemplate = (oTemplateBindingInfo) ? true : false;

		return oBindInfo;
	};

	// base implementation for object handling corresponding to VoBase
	VoAggregation.prototype.getTemplateObject = function() {
		var oTemp = {};
		oTemp['id'] = this.getId();

		// the data source name is equivalent to the controls id..................//
		oTemp['datasource'] = oTemp.id;

		var oBindInfo = this.mBindInfo = this.getBindInfo();
		var oVoTemplate = (oBindInfo.hasTemplate) ? this.getBindingInfo("items").template : null;

		this.bHasType = oBindInfo.LabelType || (oVoTemplate.mProperties["labelType"] !== sap.ui.vbm.SemanticType.None);

		// add base properties....................................................//
		if (oBindInfo.HS) {
			oTemp['hotScale.bind'] = oTemp.id + ".HS";
		} else {
			oTemp.hotScale = oVoTemplate.getHotScale();
		}
		if (oBindInfo.HDC) {
			oTemp['hotDeltaColor.bind'] = oTemp.id + ".HDC";
		} else {
			oTemp.hotDeltaColor = oVoTemplate.getHotDeltaColor();
		}
		if (oBindInfo.SC) {
			oTemp['selectColor.bind'] = oTemp.id + ".SC";
		} else {
			oTemp.selectColor = oVoTemplate.getSelectColor();
		}
		if (oBindInfo.FS) {
			oTemp['fxsize.bind'] = oTemp.id + ".FS";
		} else {
			oTemp.fxsize = oVoTemplate.getFxsize();
		}
		if (oBindInfo.FD) {
			oTemp['fxdir.bind'] = oTemp.id + ".FD";
		} else {
			oTemp.fxdir = oVoTemplate.getFxdir();
		}
		if (oBindInfo.ET) {
			oTemp['entity.bind'] = oTemp.id + ".ET";
		} else {
			oTemp.entity = oVoTemplate.getEntity();
		}
		if (oBindInfo.LT) {
			oTemp['labelText.bind'] = oTemp.id + ".LT";
		} else {
			oTemp.labelText = oVoTemplate.getLabelText();
		}
		if (this.bHasType) {
			oTemp['labelIcon.bind'] = oTemp.id + ".LIC";
			oTemp['labelIconBgrdCol.bind'] = oTemp.id + ".LICC";
			oTemp['labelIconTextCol.bind'] = oTemp.id + ".LICTC";
			oTemp['labelBgColor.bind'] = oTemp.id + ".LBC";
			oTemp['labelBorderColor.bind'] = oTemp.id + ".LBBC";
		} else {
			if (oBindInfo.LBC) {
				oTemp['labelBgColor.bind'] = oTemp.id + ".LBC";
			} else {
				oTemp.labelBgColor = oVoTemplate.getLabelBgColor();
			}
			if (oBindInfo.LBBC) {
				oTemp['labelBorderColor.bind'] = oTemp.id + ".LBBC";
			} else {
				oTemp.labelBorderColor = oVoTemplate.getLabelBorderColor();
			}
		}
		if (oBindInfo.AR) {
			oTemp['labelArrow.bind'] = oTemp.id + ".AR";
		} else {
			oTemp.labelArrow = oVoTemplate.getLabelArrow();
		}
		if (oBindInfo.LP) {
			oTemp['labelPos.bind'] = oTemp.id + ".LP";
		} else {
			oTemp.labelPos = oVoTemplate.getLabelPos();
		}
		if (oBindInfo.TT) {
			oTemp['tooltip.bind'] = oTemp.id + ".TT";
		} else {
			oTemp.tooltip = oVoTemplate.getTooltip();
		}
		if (oBindInfo.DD) {
			oTemp['dragdata.bind'] = oTemp.id + ".DD";
		} else {
			oTemp.dragdata = oVoTemplate.getDragData();
		}
		// oTemp['select.bind'] = oTemp.id + ".VB:s"; //selection is build in and always bound
		if (!oBindInfo.M) {
			oTemp['VB:c'] = oVoTemplate.getChangeable();
		}

		// set default alternative border color
		oTemp.altBorderDeltaColor = '#676767';

		return oTemp;
	};

	VoAggregation.prototype.getTypeObject = function() {
		var oType = {};

		// set the id.............................................................//
		oType['name'] = this.getId();

		oType['key'] = 'K';

		var sMinSel = this.getMinSel();
		if (sMinSel != "0" && sMinSel != "1") {
			sMinSel = "0";
		}
		var sMaxSel = this.getMaxSel();
		if (sMaxSel != "0" && sMaxSel != "1" && sMaxSel != "n" || sMaxSel == "n") {
			sMaxSel = "-1";
		}

		oType['minSel'] = sMinSel;
		oType['maxSel'] = sMaxSel;

		var oBindInfo = this.mBindInfo;

		// extend the object type.................................................//
		oType.A = [
			{
				"name": "K", // key
				"alias": "K",
				"type": "string"
			}, {
				"name": "VB:s", // selection flag
				"alias": "VB:s",
				"type": "boolean"
			}
		];
		if (oBindInfo.HS) {
			oType.A.push({
				"name": "HS", // hot scale
				"alias": "HS",
				"type": "vector"
			});
		}
		if (oBindInfo.HDC) {
			oType.A.push({
				"name": "HDC", // hot delta color
				"alias": "HDC",
				"type": "string"
			});
		}
		if (oBindInfo.SC) {
			oType.A.push({
				"name": "SC", // select color
				"alias": "SC",
				"type": "string"
			});
		}
		if (oBindInfo.FS) {
			oType.A.push({
				"name": "FS", // fix size
				"alias": "FS",
				"type": "boolean"
			});
		}
		if (oBindInfo.ET) {
			oType.A.push({
				"name": "ET", // entity
				"alias": "ET",
				"type": "string"
			});
		}
		if (oBindInfo.LT) {
			oType.A.push({
				"name": "LT", // label text
				"alias": "LT",
				"type": "string"
			});
		}
		if (this.bHasType) {
			oType.A.push({
				"name": "LBC", // label background color
				"alias": "LBC",
				"type": "color"
			});
			oType.A.push({
				"name": "LBBC", // label background border color
				"alias": "LBBC",
				"type": "color"
			});
			oType.A.push({
				"name": "LIC", // typed label's icon
				"alias": "LIC",
				"type": "string"
			});
			oType.A.push({
				"name": "LICC", // typed label's icon color
				"alias": "LICC",
				"type": "color"
			});
			oType.A.push({
				"name": "LICTC", // typed label's icon text color
				"alias": "LICTC",
				"type": "color"
			});
		} else {
			if (oBindInfo.LBC) {
				oType.A.push({
					"name": "LBC", // label background color
					"alias": "LBC",
					"type": "color"
				});
			}
			if (oBindInfo.LBBC) {
				oType.A.push({
					"name": "LBBC", // label background border color
					"alias": "LBBC",
					"type": "color"
				});
			}
		}
		if (oBindInfo.AR) {
			oType.A.push({
				"name": "AR", // label arrow
				"alias": "AR",
				"type": "boolean"
			});
		}
		if (oBindInfo.LIC) {
			oType.A.push({
				"name": "LIC", // label icon name
				"alias": "LIC",
				"type": "string"
			});
		}
		if (oBindInfo.LP) {
			oType.A.push({
				"name": "LP", // label position
				"alias": "LP",
				"type": "long"
			});
		}
		if (oBindInfo.TT) {
			oType.A.push({
				"name": "TT", // tooltip
				"alias": "TT",
				"type": "string"
			});
		}
		if (oBindInfo.DD) {
			oType.A.push({
				"name": "DD", // dragdata
				"alias": "DD",
				"type": "string"
			});
		}
		if (oBindInfo.DS || oBindInfo.DT) {
			oType.N = [];
			if (oBindInfo.DS) {
				oType.N.push({
					"name": "DS", // DragSource
					"A": {
						"name": "DGT", // DragType
						"alias": "A",
						"type": "string"
					}
				});
			}
			if (oBindInfo.DT) {
				oType.N.push({
					"name": "DT", // DropTarget
					"A": {
						"name": "DPT", // DropType
						"alias": "A",
						"type": "string"
					}
				});
			}
		}
		return oType;
	};

	VoAggregation.prototype.getDataObject = function() {
		var oData = {};

		// set the id of the table................................................//
		oData['name'] = this.getId();
		oData.E = [];

		var aVO = this.getItems();
		for (var nJ = 0, len = aVO.length; nJ < len; ++nJ) {
			oData.E.push(aVO[nJ].getDataElement());
		}

		return oData;
	};

	VoAggregation.prototype.getDragItemTemplate = function(id) {
		// DragSource of aggregation
		var oBindInfo = this.mBindInfo;
		var aDragSource = this.getDragSource();
		var aDragItem = [];
		for (var nJ = 0, len = aDragSource.length; nJ < len; ++nJ) {
			aDragItem.push({
				"type": aDragSource[nJ].getType()
			});
		}
		if (oBindInfo.DS) {
			aDragItem.push({
				"datasource": id + ".DS",
				"type.bind": id + ".DS.DGT"
			});
		}
		return aDragItem;
	};

	VoAggregation.prototype.getDropItemTemplate = function(id) {
		// DropTarget of aggregation
		var oBindInfo = this.mBindInfo;
		var aDropTarget = this.getDropTarget();
		var aDropItem = [];
		for (var nJ = 0, len = aDropTarget.length; nJ < len; ++nJ) {
			aDropItem.push({
				"type": aDropTarget[nJ].getType()
			});
		}
		if (oBindInfo.DT) {
			aDropItem.push({
				"datasource": id + ".DT",
				"type.bind": id + ".DT.DPT"
			});
		}
		return aDropItem;
	};

	/**
	 * Open a Detail Window
	 * 
	 * @param {sap.ui.vbm.VoBase} oVoInst VO instance for which the Detail Window should be opened
	 * @param {object} oParams Parameter object
	 * @param {string} oParams.caption Text for Detail Window caption
	 * @param {string} oParams.offsetX position offset in x-direction from the anchor point
	 * @param {string} oParams.offsetY position offset in y-direction from the anchor point
	 * @param {boolean} bUseClickPos Indicates whether the Detail Window should be located at the click position or object position
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VoAggregation.prototype.openDetailWindow = function(oVoInst, oParams, bUseClickPos) {
		var oParent = this.getParent();
		oParent.mDTWindowCxt.bUseClickPos = bUseClickPos;
		oParent.mDTWindowCxt.open = true;
		oParent.mDTWindowCxt.src = oVoInst;
		oParent.mDTWindowCxt.key = oVoInst.getKey();
		oParent.mDTWindowCxt.params = oParams;
		oParent.m_bWindowsDirty = true;
		oParent.invalidate(this);
	};

	/**
	 * Open a context menu
	 * 
	 * @param {string} sType Type of VO
	 * @param {sap.ui.vbm.VoBase} oVoInst VO instance for which the Detail Window should be opened
	 * @param {sap.ui.unified.Menu} oMenu the context menu to be opened
	 * @returns {void}
	 * @public
	 * @ui5-metamodel This method also will be described in the UI5 (legacy) designtime metamodel
	 */
	VoAggregation.prototype.openContextMenu = function(sType, oVoInst, oMenu) {
		this.oParent.openContextMenu(sType, oVoInst, oMenu);
	};

	VoAggregation.prototype.handleChangedData = function(aElements) {
		if (aElements && aElements.length) {
			for (var nI = 0, oElement, oInst; nI < aElements.length; ++nI) {
				oElement = aElements[nI];
				oInst = this.findInstance(oElement.K);
				if (oInst) {
					oInst.handleChangedData(oElement);
				}
			}
		}
	};

	VoAggregation.prototype.updateAggregation = function(sName) {
		if (sName === "items") {
			var oBindingInfo, oBinding;
			if ((oBindingInfo = this.mBindingInfos['items']) && (oBinding = oBindingInfo.binding)) {
				oBinding.enableExtendedChangeDetection(true);
				var aContexts = oBinding.getContexts();
				this.BindingDiff = (aContexts.diff) ? aContexts.diff : [];
			}
		}
		Element.prototype.updateAggregation.apply(this, arguments);
	};

	return VoAggregation;

});
