/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.RTARenamePlugin.
sap.ui.define([
	'jquery.sap.global', 
	'sap/ui/dt/Plugin',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'./Utils',
    'sap/ui/fl/FlexControllerFactory'
],
function(jQuery,
		Plugin, 
		ElementUtil, 
		OverlayUtil,
		Utils,
		FlexControllerFactory) {
	"use strict";

	/**
	 * Constructor for a new RTARenamePlugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The RTARenamePlugin allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.RTARenamePlugin
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RTARenamePlugin = Plugin.extend("sap.ui.rta.RTARenamePlugin", /** @lends sap.ui.rta.RTARenamePlugin.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {			
			},
			associations : {
			},
			events : {
				/** Fired when renaming is possible*/
				"editable" : {},

				/** Fired when renaming is switched off */
				"nonEditable" : {}
			}
		}
	});
	
	
	/**
	 * @override
	 */
	RTARenamePlugin.prototype.exit = function() {
		Plugin.prototype.exit.apply(this, arguments);
		jQuery(document).off("keydown", this._fnOnKeyDown);
		delete this._fnOnKeyDown;
		delete this._aSelection;
	};
	
	/**
	 * @override
	 */
	RTARenamePlugin.prototype.setDesignTime = function(oDesignTime) {
		this._aSelection = [];

		var oOldDesignTime = this.getDesignTime();
		if (oOldDesignTime) {
			oOldDesignTime.detachSelectionChange(this._onDesignTimeSelectionChange, this);
		}

		Plugin.prototype.setDesignTime.apply(this, arguments);

		if (oDesignTime) {
			oDesignTime.attachSelectionChange(this._onDesignTimeSelectionChange, this);
			this._aSelection = oDesignTime.getSelection();
		}
	};

	/**
	 * Register an overlay
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTARenamePlugin.prototype.registerOverlay = function(oOverlay) {
		oOverlay.attachEvent("editableChange", this._manageClickEvent, this);

		if (this.checkEditable(oOverlay)) {
			oOverlay.setEditable(true);
		}
	};


	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTARenamePlugin.prototype.deregisterOverlay = function(oOverlay) {
		oOverlay.detachEvent("editableChange", this._manageClickEvent, this);
		oOverlay.detachBrowserEvent("click", this._onClick, this);
	};
	
	
	/**
	 * Handle click event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTARenamePlugin.prototype._onClick = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		
		this.setEditMode(oOverlay);
		
		oEvent.preventDefault();
	};

	/**
	 * Set element to editable
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	RTARenamePlugin.prototype.setEditMode = function(oOverlay) {
		this._oEditedOverlay = oOverlay;
		this._hideOverlays(true, {
			currentTarget : {
				id : oOverlay.getId()
			}
		});
	};

	/**
	 * Hide or show overlays
	 * @param  {boolean} hide overlays
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTARenamePlugin.prototype._hideOverlays = function(bHide, oEvent) {
		var oTarget = sap.ui.getCore().byId(oEvent.currentTarget.id);
		var $oTarget;
		var oRet = {};
		
		if (!bHide) {
			oRet =	{
				value : oTarget.$()[0].innerText,
				type : this._oEditedOverlay.getElementInstance().getMetadata().getName()
			}; 
			$oTarget = oTarget.$();
			jQuery("#overlay-container").show();
			$oTarget.removeAttr("contenteditable");
			if ($oTarget.hasClass("sapUiRtaEditLabel")){
				$oTarget.removeClass("sapUiRtaEditLabel");
			} else {
				$oTarget.removeClass("sapUiRtaEditTitle");
			}
			$oTarget[0].blur();
			$oTarget[0].onfocus = null;
			$oTarget[0].onblur = null;
			$oTarget[0].onkeydown = null; 
			this.fireNonEditable();
		} else {
			var $oTarget = this._getTargetFor(oTarget);
			jQuery("#overlay-container").hide();
			$oTarget.attr("contenteditable", "true");
			if ($oTarget.hasClass("sapMLabel")){
				$oTarget.addClass("sapUiRtaEditLabel");
			} else {
				$oTarget.addClass("sapUiRtaEditTitle");
			}
			setTimeout(function() {
				$oTarget[0].focus();
			},0);
			$oTarget[0].onfocus = jQuery.proxy(this._onEditableElementFocus, this);
			$oTarget[0].onblur = jQuery.proxy(this._onEditableElementBlur, this);
			$oTarget[0].onkeydown = jQuery.proxy(this._onEditableElementKeydown, this);
			this._oOldFieldValue = $oTarget[0].innerText;
			this.fireEditable();
		}
		
		return oRet;
	};
	
	/**
	 * CalcTarget
	 * @param  {object} object
	 * @private
	 */
	RTARenamePlugin.prototype._getTargetFor = function(oTargetOverlay) {
		var sName = oTargetOverlay.getElementInstance().getMetadata().getName();
		var $oRet;
		switch (sName) {
		case "sap.ui.comp.smartform.Group":
			$oRet = oTargetOverlay.getElementInstance().getTitle().$();
			break;
		case "sap.ui.comp.smartform.GroupElement":
			$oRet = oTargetOverlay.getElementInstance().getLabel().$();
			break;
		default:
			break;
		}
		return $oRet;
	};
	
	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	RTARenamePlugin.prototype._createRenameEventInSmartForm = function(sType, oOverlay) {
		var oElement = oOverlay.getElementInstance();
		var oTargetParent = oOverlay.getParentElementOverlay().getElementInstance();
		var sPublicParentAggregationName = oOverlay.getParentAggregationOverlay().getAggregationName();

		var sSourceParentId = this._oSourceParent.getId();
		var sTargetParentId = oTargetParent.getId();
		var iTargetIndex = this._getIndexInParentAggregation(oTargetParent, sPublicParentAggregationName, oElement);

		var oChangeData = {
			changeType: sType,
			selector: {
				id : sSourceParentId
			},
			targetId : sTargetParentId !== sSourceParentId ? sTargetParentId : null
		};
		oChangeData[sType] = [{
			id: oElement.getId(),
			index: iTargetIndex
		}];

		return {
			element : this._oSourceParent, 
			change: oChangeData
		};
	};
	
	/**
	 * React on selection change from designTime
	 * @param  {event} oEvent fired
	 * @override
	 */
	RTARenamePlugin.prototype._onDesignTimeSelectionChange = function(oEvent) {
		var that = this;
		var aSelection = oEvent.getParameter("selection");

		// merge all overlays from old and current selection together
		aSelection.forEach(function(oOverlay) {
			if (that._aSelection.indexOf(oOverlay) === -1) {
				that._aSelection.push(oOverlay);
			}
		});
		that._aSelection.forEach(this._manageClickEvent, this);
	};

	/**
	 * If overlay is editable and selected, attach click event to it
	 * @param  {event|sap.ui.dt.Overlay} vEventOrElement event with source overlay or overlay object
	 * @override
	 */
	RTARenamePlugin.prototype._manageClickEvent = function(vEventOrElement) {
		var oOverlay = vEventOrElement.getSource ? vEventOrElement.getSource() : vEventOrElement;
		if (oOverlay.isSelected() && oOverlay.isEditable() && oOverlay.isDraggable()) {
			oOverlay.attachBrowserEvent("click", this._onClick, this);
		} else {
			oOverlay.detachBrowserEvent("click", this._onClick, this);
		}
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean}          true if embedded, false if not
	 * @override
	 */
	RTARenamePlugin.prototype.checkEditable = function(oOverlay) {
		return Utils.isOverlayMutable(oOverlay);
	};

	/**
	 * Handle keydown event on an editable element
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTARenamePlugin.prototype._onEditableElementKeydown = function(oEvent) {
		if (oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) {
			oEvent.preventDefault();
			var oChangeData = this._hideOverlays(false, oEvent);
			this._applyChange(oEvent, oChangeData);
		} else if (oEvent.keyCode === jQuery.sap.KeyCodes.ESCAPE) {
			oEvent.preventDefault();
			this._oEditedOverlay.setSelected(true);
			this._hideOverlays(false, oEvent);
			var oTarget = sap.ui.getCore().byId(oEvent.currentTarget.id);
			oTarget.getDomRef().innerText = this._oOldFieldValue;
		}
	};
	
	/**
	 * Handle focus event on an editable element
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTARenamePlugin.prototype._onEditableElementBlur = function(oEvent) {
		var tmpOverlaySelected = this._oEditedOverlay;
		setTimeout(function() {
			tmpOverlaySelected.setSelected(true);
			tmpOverlaySelected.focus();
		}, 0);
		var oChangeData = this._hideOverlays(false, oEvent);
		if (oChangeData) {
			var sel = window.getSelection();
			sel.removeAllRanges();
			this._applyChange(oEvent, oChangeData);
		}
	};
	
	RTARenamePlugin.prototype._applyChange = function(oEvent, oChangeData) {
		//the change handler expects the GroupElement and not the field
		if (this._oOldFieldValue != oChangeData.value) {
			var sId = this._oEditedOverlay.getElementInstance().getId();
			var oControl = sap.ui.getCore().byId(sId);
			var oFlexController = FlexControllerFactory.createForControl(oControl);
			var oChange = this._createLabelChange(sId, oChangeData.value, oChangeData.type);
			oFlexController.createAndApplyChange(oChange, oControl);
			oFlexController.saveAll();
		}
	};
	
	/**
	 * Handle focus event on an editable element
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTARenamePlugin.prototype._onEditableElementFocus = function(e) {
		var el = e.target;
		var range = document.createRange();
		range.selectNodeContents(el);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	};
	
	/**
	 * Creates a property bag for a label change
	 * 
	 * @param {string} sId - control id.
	 * @param {string} sLabel - new label.
	 * @param {string} sType - node type (form|group|field).
	 * @returns{object} change property bag (see sap.ui.fl.Change#createInitialFileContent oPropertyBag).
	 * @private
	 */
	RTARenamePlugin.prototype._createLabelChange = function(sId, sLabel, sType) {

		var oLabelChange = {};

		oLabelChange.selector = {};
		oLabelChange.selector.id = sId;

		switch (sType) {
			case "form":
				oLabelChange = {};
				break;
			case "sap.ui.comp.smartform.Group":
				oLabelChange.changeType = "renameGroup";
				oLabelChange.groupLabel = sLabel;
				break;
			case "sap.ui.comp.smartform.GroupElement":
				oLabelChange.changeType = "renameField";
				oLabelChange.fieldLabel = sLabel;
				break;
			default:
				oLabelChange = {};
				break;
		}

		return oLabelChange;

	};
	
	return RTARenamePlugin;
}, /* bExport= */ true);
	