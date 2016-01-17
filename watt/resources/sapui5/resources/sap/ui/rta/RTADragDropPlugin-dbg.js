/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.RTADragDropPlugin.
sap.ui.define([
	'jquery.sap.global', 
	'sap/ui/dt/plugin/ControlDragDrop',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/OverlayUtil',
	'./Utils'
],
function(jQuery,
		ControlDragDrop, 
		ElementUtil, 
		OverlayUtil,
		Utils) {
	"use strict";

	/**
	 * Constructor for a new RTADragDropPlugin.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The RTADragDropPlugin allows to create a set of Overlays above the root elements and
	 * theire public children and manage their events.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.RTADragDropPlugin
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RTADragDropPlugin = ControlDragDrop.extend("sap.ui.rta.RTADragDropPlugin", /** @lends sap.ui.rta.RTADragDropPlugin.prototype */ {		
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.rta",
			properties : {
			},
			associations : {
			},
			events : {
				moveElement : {},
				hideElement : {},
				openContextMenu : {}
			}
		}
	});
	
	/**
	 * @override
	 */
	RTADragDropPlugin.prototype.init = function() {
		ControlDragDrop.prototype.init.apply(this, arguments);
		this._fnOnKeyDown = this._onKeyDown.bind(this);
		jQuery(document).keydown(this._fnOnKeyDown);
	};
	
	/**
	 * @override
	 */
	RTADragDropPlugin.prototype.exit = function() {
		ControlDragDrop.prototype.exit.apply(this, arguments);
		jQuery(document).off("keydown", this._fnOnKeyDown);
		delete this._fnOnKeyDown;
	};

	/**
	 * Register an overlay
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTADragDropPlugin.prototype.registerOverlay = function(oOverlay) {
		oOverlay.attachBrowserEvent("click", this._onClick, this);
		oOverlay.attachEvent("selectableChange", this._onSelectableChange, this);

		oOverlay.attachBrowserEvent("contextmenu", this._onContextMenu, this);
		if (oOverlay.isDraggable()) {
			this._attachDraggableBrowserEvents(oOverlay);
		}
		
		if (Utils.isOverlayMutable(oOverlay)) {
			oOverlay.setSelectable(true);
		} else {
			oOverlay.setSelectable(false);
		}
		//if overlay is selectable by default, we should ensure tabindex
		if (!oOverlay.getDomRef()) {
			var _oDelegateSetTabIndex = {
				onAfterRendering : function(oEvent) {
					var oOverlay = oEvent.srcControl;
					if (oOverlay.isSelectable()) {
						oOverlay.$().attr("tabindex", 0);
					}
					oOverlay.removeEventDelegate(_oDelegateSetTabIndex);
				}
			};

			oOverlay.addEventDelegate(_oDelegateSetTabIndex);
		}

		ControlDragDrop.prototype.registerOverlay.apply(this, arguments);
	};


	/**
	 * Additionally to super->deregisterOverlay this method detatches the browser events
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTADragDropPlugin.prototype.deregisterOverlay = function(oOverlay) {
		ControlDragDrop.prototype.deregisterOverlay.apply(this, arguments);
		oOverlay.detachBrowserEvent("click", this._onClick, this);
		oOverlay.detachEvent("selectableChange", this._onSelectableChange, this);
		oOverlay.detachBrowserEvent("contextmenu", this._onContextMenu, this);
		this._detachDraggableBrowserEvents(oOverlay);
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	RTADragDropPlugin.prototype._attachDraggableBrowserEvents = function(oOverlay) {
		oOverlay.attachBrowserEvent("mouseover", this._onMouseOver, this);
		oOverlay.attachBrowserEvent("mouseleave", this._onMouseLeave, this);
	};
	
	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	RTADragDropPlugin.prototype._detachDraggableBrowserEvents = function(oOverlay) {
		oOverlay.detachBrowserEvent("mouseover", this._onMouseOver, this);
		oOverlay.detachBrowserEvent("mouseleave", this._onMouseLeave, this);
	};

	/**
	 * Handle context menu event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTADragDropPlugin.prototype._onContextMenu = function(oEvent) {
		//hide browser-context menu
		if (oEvent.preventDefault) {
			oEvent.preventDefault();
		}
		
		var oEventSrcOverlay = sap.ui.getCore().byId(oEvent.originalEvent.currentTarget.id);
		if (oEventSrcOverlay.isSelectable()) {
			oEventSrcOverlay.setSelected(true);
			this.fireOpenContextMenu({
				originalEvent : oEvent,
				overlay : oEventSrcOverlay
			});
			oEvent.stopPropagation();
		}
	};
	
	/**
	 * Handle keydown event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTADragDropPlugin.prototype._onKeyDown = function(oEvent) {
		var oOverlay = Utils.getFocusedOverlay();
		if (oEvent.keyCode === jQuery.sap.KeyCodes.DELETE) {
			this._hideElement();
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ENTER) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if ((oOverlay) && (!oOverlay.isSelected())) {
				oOverlay.setSelected(true);
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.F10) && (oEvent.shiftKey === true) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				oOverlay.setSelected(true);
				var iWidth = oOverlay.$().width() / 2;
				var iHeight = oOverlay.$().height() / 2;
				var iTop = oOverlay.$().offset().top;
				var iLeft = oOverlay.$().offset().left;
				var oOriginalEvent = jQuery.Event("click", {pageX: iLeft + iWidth, pageY: iTop + iHeight});
				this.fireOpenContextMenu({
					originalEvent : oOriginalEvent,
					overlay : oOverlay
				});
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_UP) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oParentOverlay = oOverlay.getParentElementOverlay();
				if ((oParentOverlay) && (oParentOverlay.isSelectable())) {
					oParentOverlay.focus();
				}
			}			
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_DOWN) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oFirstChildOverlay = Utils.getFirstFocusableChildOverlay(oOverlay);
				if (oFirstChildOverlay) {
					oFirstChildOverlay.focus();
				}
			}
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_LEFT) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oPrevSiblingOverlay = Utils.getPreviousFocusableSiblingOverlay(oOverlay);
				if (oPrevSiblingOverlay) {
					oPrevSiblingOverlay.focus();
				}
			}	
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.ARROW_RIGHT) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			if (oOverlay) {
				var oNextSiblingOverlay = Utils.getNextFocusableSiblingOverlay(oOverlay);
				if (oNextSiblingOverlay) {
					oNextSiblingOverlay.focus();
				}
			}	
		}
	};
	
	/**
	 * @private
	 */
	RTADragDropPlugin.prototype._hideElement = function() {
		var oDesignTime = this.getDesignTime();
		var aSelection = oDesignTime.getSelection();
		var oSelectedOverlay = aSelection[0];
		if (oSelectedOverlay) {
			var oElement = oSelectedOverlay.getElementInstance();
			this.fireHideElement({element:oElement});	
		}		
	};
	
	/**
	 * Additionally to super->onDragStart this method stores the parent's id in an instance variable
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTADragDropPlugin.prototype.onDragStart = function(oOverlay) {
		ControlDragDrop.prototype.onDragStart.apply(this, arguments);

		this.getDesignTime().getSelection().forEach(function(oOverlay) {
			oOverlay.setSelected(false);
		});

		oOverlay.$().addClass("sapUiRtaOverlayPlaceholder");

		var oParent = oOverlay.getParentElementOverlay().getElementInstance();
		this._oSourceParent = oParent;
	};
	
	/**
	 * Additionally to super->onDragEnd this method takes care about moving the element
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTADragDropPlugin.prototype.onDragEnd = function(oOverlay) {
		ControlDragDrop.prototype.onDragEnd.apply(this, arguments);

		oOverlay.$().removeClass("sapUiRtaOverlayPlaceholder");
		oOverlay.setSelected(true);
		oOverlay.focus();

		this._onOverlayMoved(oOverlay);		
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	RTADragDropPlugin.prototype._onOverlayMoved = function(oOverlay) {
		var oMoveEvent;
		if (ElementUtil.isInstanceOf(oOverlay.getElementInstance(), "sap.ui.comp.smartform.Group")) {
			oMoveEvent = this._createMoveEventInSmartForm("moveGroups", oOverlay);
		} else if (ElementUtil.isInstanceOf(oOverlay.getElementInstance(), "sap.ui.comp.smartform.GroupElement")) {
			oMoveEvent = this._createMoveEventInSmartForm("moveFields", oOverlay);
		}

		if (oMoveEvent) {
			this.fireMoveElement(oMoveEvent);
		}
	};
	
	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @private
	 */
	RTADragDropPlugin.prototype._createMoveEventInSmartForm = function(sType, oOverlay) {
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
	 * Calculate index in parent aggregation
	 * @param  {sap.ui.Element} oParent  	assiciated parent element
	 * @param  {string} sAggregationName 		public parent aggregation name
	 * @param  {sap.ui.Element} oElement	associated element
	 * @return {number}                  	index in parent aggregation
	 * @private
	 */
	RTADragDropPlugin.prototype._getIndexInParentAggregation = function(oParent, sAggregationName, oElement) {
		var aChildren = ElementUtil.getAggregation(oParent, sAggregationName);

		return aChildren.indexOf(oElement);
	};


	/**
	 * If overlay is draggable attach browser events o overlay. If not remove them.
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @override
	 */
	RTADragDropPlugin.prototype.onDraggableChange = function(oOverlay) {
		ControlDragDrop.prototype.onDraggableChange.apply(this, arguments);
		if (oOverlay.isDraggable()) {
			this._attachDraggableBrowserEvents(oOverlay);
		} else {
			this._detachDraggableBrowserEvents(oOverlay);
		}
	};

	/**
	 * @param  {sap.ui.dt.Overlay} oOverlay overlay object
	 * @return {boolean}          true if embedded, false if not
	 * @override
	 */
	RTADragDropPlugin.prototype.checkDraggable = function(oOverlay) {
		var bDraggable = ControlDragDrop.prototype.checkDraggable.apply(this, arguments);
		return bDraggable && Utils.isOverlayMutable(oOverlay);
	};

	/**
	 * Checks droppability for aggregation overlays
	 * @param  {sap.ui.dt.Overlay} oAggregationOverlay aggregation overlay object
	 * @return {boolean}                     true if aggregation overlay is droppable, false if not
	 * @override
	 */
	RTADragDropPlugin.prototype.checkDroppable = function(oAggregationOverlay) {
		var bDroppable = ControlDragDrop.prototype.checkDroppable.call(this, oAggregationOverlay);

		if (bDroppable) {
			var oOverlay = oAggregationOverlay.getParent();
			var oSmartForm = OverlayUtil.getClosestOverlayForType("sap.ui.comp.smartform.SmartForm", oOverlay);
			var oAllowedSmartForm = OverlayUtil.getClosestOverlayForType("sap.ui.comp.smartform.SmartForm", this.getDraggedOverlay());
			if (oSmartForm !== oAllowedSmartForm) {
				bDroppable = false;
			}
		}

		return bDroppable;
	};

	/**
	 * Handle click event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTADragDropPlugin.prototype._onClick = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		if (oOverlay.isSelectable()) {
			oOverlay.setSelected(!oOverlay.getSelected());
			
			oEvent.preventDefault();
			oEvent.stopPropagation();
		}	
	};

	/**
	 * @private
	 */
	RTADragDropPlugin.prototype._onSelectableChange = function(oEvent) {
		var oOverlay = oEvent.getSource();
		var bSelectable = oEvent.getParameter("selectable");
		if (bSelectable) {
			oOverlay.$().attr("tabindex", 0);
		} else {
			oOverlay.$().attr("tabindex", null);
		}
	};	

	/**
	 * Handle mouse over event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTADragDropPlugin.prototype._onMouseOver = function(oEvent) {
		var oOverlay = sap.ui.getCore().byId(oEvent.currentTarget.id);
		if (oOverlay !== this._oPreviousHoverTarget) {
			if (this._oPreviousHoverTarget) {
				this._oPreviousHoverTarget.$().removeClass("sapUiRtaOverlayHover");
			}
			this._oPreviousHoverTarget = oOverlay;
			oOverlay.$().addClass("sapUiRtaOverlayHover");
		}
		oEvent.preventDefault();
		oEvent.stopPropagation();
		
	};

	/**
	 * Handle mouse leave event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RTADragDropPlugin.prototype._onMouseLeave = function(oEvent) {
		if (this._oPreviousHoverTarget) {
			this._oPreviousHoverTarget.$().removeClass("sapUiRtaOverlayHover");
		}
		delete this._oPreviousHoverTarget;
		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	return RTADragDropPlugin;
}, /* bExport= */ true);
