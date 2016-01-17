/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */
/*global Promise */
// Provides control sap.ui.rta.ContextMenu.
sap.ui.define([
	'jquery.sap.global', 
	'./library',  
	'sap/ui/unified/Menu', 
	'sap/ui/unified/MenuItem',
	'sap/ui/core/Popup',
	'sap/ui/dt/ElementUtil',
	'./Utils',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/Group',
	'sap/ui/comp/smartform/SmartForm'
	],
	function(jQuery, 
			library, 
			Menu, 
			MenuItem, 
			Popup, 
			ElementUtil,
			Utils,
			GroupElement,
			Group,
			SmartForm) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.ContextMenu control.
	 *
	 * @class
	 * Context - Menu for Runtime Authoring
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.ContextMenu
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ContextMenu = Menu.extend("sap.ui.rta.ContextMenu", {
		metadata : {
			library : "sap.ui.rta",
			associations : {
				element : {
					type : "sap.ui.core.Element",
					multiple : false
				}
			},
			events : {
				renameLabel : {},
				hideElement : {},
				addElement : {},
				addGroup : {},
				adaptElement : {}
			}
		},
		renderer: {} //Standard renderer method is not overridden
	});

	/**
	 * Initialize the context menu
	 *
	 * @private
	 */
	ContextMenu.prototype.init = function() {
		Menu.prototype.init.apply(this, arguments);
		this.attachItemSelect(this._onItemSelected, this);
		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this._fnOnKeyDown = this._onKeyDown.bind(this);
		jQuery(document).keydown(this._fnOnKeyDown);
		this.attachBrowserEvent("contextmenu", this._onContextMenu, this);
		this._oOverlayDomRef = document.body;
	};

	/**
	 * Exit method. Called when the object gets destroyed
	 */
	ContextMenu.prototype.exit = function() {
		Menu.prototype.exit.apply(this, arguments);
		this._oRb = null;
		jQuery(document).off("keydown", this._fnOnKeyDown);
		delete this._fnOnKeyDown;
		this.detachBrowserEvent("contextmenu");
	};

	/**
	 * Set overlay which invoked the context menu
	 * 
	 * @param {string|sap.ui.core.Element} vOverlay variable object instance of the overlay
	 */
	ContextMenu.prototype.setOverlayDomRef = function(vOverlay) {
		this._oOverlayDomRef = vOverlay.getDomRef();
	};

	/**
	 * Returns an instance of the current selected element
	 */
	ContextMenu.prototype.getElementInstance = function() {
		return sap.ui.getCore().byId(this.getElement());
	};

	/**
	 * Set element for which the context menu is to be displayed
	 *
	 * @param {string|sap.ui.core.Element} vElement variable object instance of the element
	 */
	ContextMenu.prototype.setElement = function(vElement) {
		this.setAssociation("element", vElement, true);
		var aMenuItems = [];
		var oElement = this.getElementInstance();
	
		if (oElement instanceof GroupElement) {
			aMenuItems.push({text: "CTX_RENAME_LABEL", enabled: true});
			aMenuItems.push({text: "CTX_ADD_FIELD", enabled: true});
			var bHasBoundFields = Utils.hasGroupElementBoundFields(oElement);
			aMenuItems.push({text: "CTX_HIDE_FIELD", enabled: bHasBoundFields});
			aMenuItems.push({text: "CTX_ADAPT", startSection: true, enabled: true});
		}
		if (oElement instanceof Group) {
			aMenuItems.push({text: "CTX_RENAME_GROUP", enabled: true});
			aMenuItems.push({text: "CTX_ADD_FIELD", enabled: true});
			aMenuItems.push({text: "CTX_ADD_GROUP", enabled: true});
			var bHasUnboundFields = Utils.hasGroupUnBoundFields(oElement);
			aMenuItems.push({text: "CTX_HIDE_GROUP", enabled: !bHasUnboundFields});
			aMenuItems.push({text: "CTX_ADAPT", startSection: true, enabled: true});
		}
		if (oElement instanceof SmartForm) {
			aMenuItems.push({text: "CTX_ADD_GROUP", enabled: true});
			aMenuItems.push({text: "CTX_ADAPT", enabled: true});
		}
		
		this._createMenuItems(aMenuItems);
	};


	
	/**
	 * Create menu items for a list of passed in elements
	 * @param  {sap.ui.core.Element[]} aMenuItems array of menu items a context menu entry must be created for
	 * @private
	 */
	ContextMenu.prototype._createMenuItems = function(aMenuItems) {
		// Get messagebundle.properties for sap.ui.rta
		this._oRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		this.destroyItems();
		for (var i = 0; i < aMenuItems.length; i++) {
			var oMenuItem = new MenuItem({text: this._oRb.getText(aMenuItems[i].text), enabled: aMenuItems[i].enabled});
			oMenuItem.data({id : aMenuItems[i].text});
			if (aMenuItems[i].startSection){
				oMenuItem.setStartsSection(true); 
			}
			this.addItem(oMenuItem);
		}
	};
	
	/**
	 * @param {sap.ui.core.Element} oElement The element which exists in the smart form
	 * @return {sap.ui.comp.smartform.SmartForm} the closest smart form found
	 * @private
	 */
	ContextMenu.prototype._getSmartFormForElement = function(oElement) {
		while (oElement && !ElementUtil.isInstanceOf(oElement, "sap.ui.comp.smartform.SmartForm")) {
			oElement = oElement.getParent();
		}

		return oElement;
	};


	/**
	 * Called when an item gets selected
	 * 
	 * @param  {sap.ui.base.Event} oEvent event object
	 * 
	 * @override
	 * @private
	 */
	ContextMenu.prototype._onItemSelected = function(oEvent) {
		var sId = oEvent.getParameter("item").data("id");
		var oElement = this.getElementInstance();
		switch (sId) {
		case "CTX_ADD_FIELD":
			this.fireAddElement({element : oElement});
			break;
		case "CTX_ADD_GROUP":
			this.fireAddGroup({element : oElement});
			break;
		case "CTX_RENAME_LABEL" :
		case "CTX_RENAME_GROUP" :
			this.fireRenameLabel({element : oElement});
			break;
		case "CTX_HIDE_FIELD":
		case "CTX_HIDE_GROUP":
			this.fireHideElement({element : oElement});
			break;
		case "CTX_ADAPT":
			var oSmartForm = this._getSmartFormForElement(oElement);
			this.fireAdaptElement({element : oSmartForm});
			break;
		default:
			break;
		}
	};


	/**
	 * Function called when custom field button was pressed
	 * @param  {sap.ui.base.Event} oEvent event object
	 */
	ContextMenu.prototype._onOpenCustomField = function(oEvent) {
		// open field ext ui
		var oCrossAppNav = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
		var sHrefForFieldExtensionUi = (oCrossAppNav && oCrossAppNav.hrefForExternal({
			target: {
				semanticObject: "CustomField",
				action: "develop"
			},
			params: {
				businessContexts: this._oCurrentFieldExtInfo.BusinessContexts,
				serviceName: this._oCurrentFieldExtInfo.ServiceName,
				serviceVersion: this._oCurrentFieldExtInfo.ServiceVersion
			}
		}));

		window.open(sHrefForFieldExtensionUi, "_blank");
	};

	/**
	 * Method for calculating the x, y-offset for opening the 
	 * context menu at the current mouse position
	 * 
	 * @param  {number} iPageX               mouse x position
	 * @param  {number} iPageY               mouse y position
	 */
	ContextMenu.prototype._open = function(iPageX, iPageY) {
		
		// first check if there are some context menu entries 
		if (this.getItems().length === 0) {
			return;
		}

		// calculate the offset (depending on context-menu size)
		var mouseX = iPageX;
		var mouseY = iPageY;
		var X = mouseX;
		var Y = mouseY;
		var bodyX = jQuery('body').width();
		var bodyY = jQuery('body').height();

		if (!this.getDomRef()) {
			this.open(false, undefined, undefined, undefined, undefined, -2000 + " " + -2000, "none");
		}

		var contextMenuWidth = this.$().context.clientWidth;
		var contextMenuHeight = this.$().context.clientHeight;
		var xFlipOffset = (bodyX - mouseX < contextMenuWidth) ? contextMenuWidth : 0;
		var yFlipOffset = (bodyY - mouseY < contextMenuHeight) ? contextMenuHeight : 0;

		X = ((bodyX / 2 - mouseX) * -1) + contextMenuWidth / 2 + 2 - xFlipOffset;
		Y = ((bodyY / 2 - mouseY) * -1) + contextMenuHeight / 2 + 2 - yFlipOffset;

		var yOffset = mouseY - contextMenuHeight;
		if (yOffset < 0 && yFlipOffset !== 0) {
			Y = Y - yOffset;
		}

		this.close();
		this.open(true, this._oOverlayDomRef, undefined, undefined, document.body, X + " " + Y, "flip");
	};

	/**
	 * Handler Method for event open menu
	 *
	 * @param  {object} oContextInfo Information on the context
	 */
	ContextMenu.prototype.openMenu = function(oContextInfo) {
		this._open(oContextInfo.pageX, oContextInfo.pageY);
	};

	/**
	 * Handle keydown event
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._onKeyDown = function(oEvent) {
		if (!this.bOpen){
			jQuery(document).off("keydown", this._fnOnKeyDown);
			delete this._fnOnKeyDown;
			return;
		}
		if ((oEvent.keyCode === jQuery.sap.KeyCodes.F10) && (oEvent.shiftKey === true) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			oEvent.preventDefault();
		}
	};

	/**
	 * Handle Context Menu
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	ContextMenu.prototype._onContextMenu = function(oEvent) {
		if (!this.bOpen){
			this.detachBrowserEvent("contextmenu");
			return;
		}
		if (oEvent.preventDefault) {
			oEvent.preventDefault();
		}
	};

	return ContextMenu;

}, /* bExport= */ true);
