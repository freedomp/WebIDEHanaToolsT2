/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides class sap.ui.rta.Main.
sap.ui.define([
	'sap/ui/base/ManagedObject', 
	'sap/ui/rta/ToolsMenu',
	'sap/ui/rta/ContextMenu', 
	'sap/ui/comp/smartform/flexibility/FormP13nHandler', 
	'sap/ui/dt/Preloader',
	'sap/ui/dt/ElementUtil',
	'sap/ui/dt/DesignTime',
	'sap/ui/dt/OverlayRegistry',
	'sap/ui/rta/RTARenamePlugin',
	'sap/ui/rta/RTADragDropPlugin',
	'sap/ui/rta/FlexAdapter',
	'sap/ui/rta/FieldRepository',
	'./Utils',
	'sap/ui/fl/Transports',
	'sap/ui/fl/Utils',
	'sap/m/MessageBox',
	'sap/ui/comp/smartform/GroupElement',
	'sap/ui/comp/smartform/Group'
	],
	function(
		ManagedObject, 
		ToolsMenu, 
		ContextMenu, 
		FormP13nHandler,
		DTPreloader,
		ElementUtil,
		DesignTime,
		OverlayRegistry,
		RTARenamePlugin,
		RTADragDropPlugin,
		FlexAdapter,
		FieldRepository,
		Utils,
		Transports,
		FlexUtils,
		MessageBox,
		GroupElement,
		Group
		) {
	"use strict";

	/**
	 * Constructor for a new sap.ui.rta.RuntimeAuthoring class.
	 *
	 * @class
	 * The runtime authoring allows to adapt the fields of a running application.
	 * @extends sap.ui.core.ManagedObject
	 *
	 * @author SAP SE
	 * @version 1.32.7
	 *
	 * @constructor
	 * @public
	 * @since 1.30
	 * @alias sap.ui.rta.RuntimeAuthoring
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RuntimeAuthoring = ManagedObject.extend("sap.ui.rta.RuntimeAuthoring", /** @lends sap.ui.rta.RuntimeAuthoring.prototype */{ 
		metadata : {
			// ---- control specific ----
			library : "sap.ui.rta",
			associations : {
				/** The root control which the runtime authoring should handle */
				"rootControl" : {
					type : "sap.ui.core.Control"
				}
			},
			properties : {
				/** The URL which is called when the custom field dialog is opened */ 
				"customFieldUrl" : "string",

				/** Whether the create custom field button should be shown */
				"showCreateCustomField" : "boolean"
			},
			events : {
				/** Fired when the runtime authoring is started */
				"start" : {},

				/** Fired when the runtime authoring is stopped */
				"stop" : {}
			}
		},
		_sAppTitle : null
		
	});

	/**
	 * Start Runtime Authoring
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function() {
		var that = this;

		this._aPopups = [];
		
		this._oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");

		// Create DesignTimec
		if (!this._oDesignTime) {
			this._rootControl = sap.ui.getCore().byId(this.getRootControl());
			that._oFlexAdapter = new FlexAdapter();
			that._oFlexAdapter.init(that._rootControl);

			var aElements = sap.ui.dt.ElementUtil.findAllPublicElements(this._rootControl);
			
			this._oRTADragDropPlugin = new RTADragDropPlugin({
				draggableTypes : ["sap.ui.comp.smartform.Group", "sap.ui.comp.smartform.GroupElement"]
			});
			this._oRTADragDropPlugin.attachEvent("moveElement", this._handleMoveElement, this);
			this._oRTADragDropPlugin.attachEvent("hideElement", this._handleHideElement, this);
			this._oRTADragDropPlugin.attachEvent("openContextMenu", this._handleOpenContextMenu, this);

			this._oRenamePlugin = new RTARenamePlugin({
				editableTypes : ["sap.ui.comp.smartform.Group", "sap.ui.comp.smartform.GroupElement"]
			});
			
			sap.ui.dt.Preloader.load(aElements).then(function() {
				that._oDesignTime = new DesignTime({
					rootElements : [that._rootControl],
					plugins : [
						that._oRTADragDropPlugin,
						that._oRenamePlugin
					]
				});
				// fire Start Event
				 that.fireStart();
			});
		}

		// Create ToolsMenu
		if (!this._oToolsMenu) {
			this._sAppTitle = this._getApplicationTitle();
			this._oToolsMenu = new ToolsMenu();
			this._oToolsMenu.setTitle(this._sAppTitle);
			this._oToolsMenu.setRootControl(this._rootControl);
			this._oToolsMenu.adaptButtonsVisibility();
			this._oToolsMenu.attachEvent('close', this.stop, this);
			this._oToolsMenu.attachEvent('transport', this._onTransport, this);
			this._oToolsMenu.attachEvent('restore', this._onRestore, this);
		}

		//Keyboard support
		this._fnOnKeyDown = this._onKeyDown.bind(this);
		jQuery(document).keydown(this._fnOnKeyDown);

		//set focus initially on top toolbar
		var oDelegate = {
			"onAfterRendering" : function() {
				this._oToolsMenu._oToolBarTop.focus();
				this._oToolsMenu._oToolBarTop.removeEventDelegate(oDelegate, this);
			}
		};
		this._oToolsMenu._oToolBarTop.addEventDelegate(oDelegate, this);
		
		this._openPopup = sap.ui.core.Popup.prototype.open;
		sap.ui.core.Popup.prototype.open = function () {
			if (that._aPopups.indexOf(this) === -1) {
				that._aPopups.push(this);
			}
			jQuery(document).unbind("keydown",that._fnOnKeyDown);
			var args = Array.prototype.slice.call(arguments);
			that._openPopup.apply(this, args);
		};
		
		this._closePopup = sap.ui.core.Popup.prototype.close;
		sap.ui.core.Popup.prototype.close = function () {
			var iIndex = that._aPopups.indexOf(this);
			if (iIndex !== -1) {
				that._aPopups.splice(iIndex, 1);
				if (that._aPopups.length === 0) {
					jQuery(document).keydown(that._fnOnKeyDown);
				}
			}
			var args = Array.prototype.slice.call(arguments);
			that._closePopup.apply(this, args);
		};
		
		// Show Toolbar(s)
		this._oToolsMenu.show();
	};

	/**
	 * Stop Runtime Authoring	
	 * @public
	 */
	RuntimeAuthoring.prototype.stop = function() {
		this.exit();
		// fire Stop Event
		this.fireStop();
	};

	/**
	 * Exit Runtime Authoring - destroy all controls
	 * @protected
	 */
	RuntimeAuthoring.prototype.exit = function() {
		if (this._oToolsMenu) { 
			this._oToolsMenu.destroy();
			this._oToolsMenu = null;
		}
		if (this._oFlexAdapter) {
			this._oFlexAdapter.destroy();
		}
		if (this._oDesignTime) {
			this._oDesignTime.destroy();
			this._oDesignTime = null;
		}
		if (this._fnOnKeyDown) {
			jQuery(document).unbind("keydown",this._fnOnKeyDown);
			this._fnOnKeyDown = null;
		}
		sap.ui.core.Popup.prototype.open = this._openPopup;
		sap.ui.core.Popup.prototype.close = this._closePopup;
	};

	/**
	 * Function to handle keyboard events
	 * @private
	 */
	RuntimeAuthoring.prototype._onKeyDown = function(oEvent) {
		// Handle keyboard Tab key
		if ((oEvent.keyCode === jQuery.sap.KeyCodes.TAB) && (oEvent.shiftKey === false) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			oEvent.preventDefault();
			this._focusNextElement();

		// Handle keyboard Shift + Tab key	
		} else if ((oEvent.keyCode === jQuery.sap.KeyCodes.TAB) && (oEvent.shiftKey === true) && (oEvent.altKey === false) && (oEvent.ctrlKey === false)) {
			oEvent.preventDefault();
			this._focusPrevElement();			
		}
	};

	/**
	 * Function to handle keyboard Tab key
	 * @private
	 */
	RuntimeAuthoring.prototype._focusNextElement = function() {
		var sFocusedElement = this._checkCurrentFocusedElement();

		if (sFocusedElement === "NOT RTA") {
			this._oToolsMenu._oToolBarTop.focus();
		} else if (sFocusedElement === "OVERLAY") {			
			this._handleNextOverlay();
		} else if (sFocusedElement.indexOf("TB") !== -1) {
			this._handleNextTbElement();
		}
	};
	
	/**
	 * Function to handle keyboard Shift + Tab key
	 * @private
	 */
	RuntimeAuthoring.prototype._focusPrevElement = function() {
		var sFocusedElement = this._checkCurrentFocusedElement();
		
		if (sFocusedElement === "NOT RTA") {
			this._oToolsMenu._oToolBarTop.focus();
		} else if (sFocusedElement === "OVERLAY") {
			this._handlePrevOverlay();
		} else if (sFocusedElement === "TOP TB") {
			this._handlePrevTbElement();
		} else if (sFocusedElement === "BOTTOM TB") {
			this._handlePrevOverlay();
		} else if (sFocusedElement === "TOP TB ELEMENT") {
			this._handlePrevTbElement();
		} else if (sFocusedElement === "BOTTOM TB ELEMENT") {
			this._handlePrevTbElement();
		}	
	};
	
	/**
	 * Function to determine current focused element
	 * @private
	 */
	RuntimeAuthoring.prototype._checkCurrentFocusedElement = function() {
		var sElement;
		var oElement = document.activeElement;
		
		this._aTbTopElements = this._oToolsMenu._oToolBarTop.getContent();
		var aTbTopElementIds = [];

		for (var i = this._aTbTopElements.length - 1; i >= 0; i--) {
			if (this._aTbTopElements[i].getId().indexOf("spacer") > -1) {
				this._aTbTopElements.splice(i, 1);
			}
		}

		var iTopElements = this._aTbTopElements.length;
		for (i = 0; i < iTopElements; i++) {
			aTbTopElementIds[i] = this._aTbTopElements[i].getId();
		}

		this._aTbBottomElements = this._oToolsMenu._oToolBarBottom.getContent();
		var aTbBottomElementIds = [];
		
		for (i = this._aTbBottomElements.length - 1; i >= 0; i--) {
			if (this._aTbBottomElements[i].getId().indexOf("spacer") > -1) {
				this._aTbBottomElements.splice(i, 1);
			}
		}

		var iBottomElements = this._aTbBottomElements.length;
		for (i = 0; i < iBottomElements; i++) {
			aTbBottomElementIds[i] = this._aTbBottomElements[i].getId();
		}

		var iActiveTopElement = aTbTopElementIds.indexOf(oElement.id);
		var iActiveBottomElement = aTbBottomElementIds.indexOf(oElement.id);
			
		// current focus is on overlay
		if ((oElement.getAttribute("class")) && (oElement.getAttribute("class").search("sapUiDtOverlay") > -1)) {
			this._sArea = "OVERLAY";
			sElement = "OVERLAY";
			return sElement;
		// current focus is on top toolbar
		} else if ((oElement.getAttribute("class")) && (oElement.getAttribute("class").search("sapUiRTAToolBarTop") > -1)) {
			this._sArea = "TOP";
			this._iActive = -1;
			this._aElements = this._aTbTopElements;
			sElement = "TOP TB";
			return sElement;
		// current focus is on bottom toolbar
		} else if ((oElement.getAttribute("class")) && (oElement.getAttribute("class").search("sapUiRTAToolBarBottom") > -1)) {
			this._sArea = "BOTTOM";
			this._iActive = -1;
			this._aElements = this._aTbBottomElements;
			sElement = "BOTTOM TB";
			return sElement;
		// current focus is on top toolbar element
		} else if (iActiveTopElement > -1) {
			this._sArea = "TOP";
			this._iActive = iActiveTopElement;
			this._aElements = this._aTbTopElements;
			sElement = "TOP TB ELEMENT";
			return sElement;
		// current focus is on bottom toolbar element
		} else if (iActiveBottomElement > -1) {
			this._sArea = "BOTTOM";
			this._iActive = iActiveBottomElement;
			this._aElements = this._aTbBottomElements;
			sElement = "BOTTOM TB ELEMENT";
			return sElement;
		// current focus is NOT on an RTA element
		} else {
			sElement = "NOT RTA";
			return sElement;
		}
	};

	/**
	 * Function to loop over toolbar elements
	 * @private
	 */
	RuntimeAuthoring.prototype._loopOverTbElements = function(bReverse, iStart) {	
		for (var iElem = iStart, 
				 iEnd = (bReverse) ? -1 : this._aElements.length, 
				 iCount = (bReverse) ? -1 : 1;
				 iElem != iEnd; iElem += iCount) {

			this._aElements[iElem].focus();
			if (this._aElements[iElem].getId() === document.activeElement.id) {
				break;
			}
			if (iElem === iEnd - iCount) {
				if (!bReverse) {
					(this._sArea === "TOP") ? this._handleNextOverlay() : this._oToolsMenu._oToolBarTop.focus();
				} else {
					if (((this._sArea === "TOP") && (this._iActive === -1)) || (this._sArea === "OVERLAY")) {
						this._oToolsMenu._oToolBarBottom.focus();
					} else if (((this._sArea === "TOP") && (this._iActive > 0)) || (this._sArea === "BOTTOM")) {
						this._oToolsMenu._oToolBarTop.focus();
					}
				}
			}
		}
	};	

	/**
	 * Function to set the focus on the next element after a focused toolbar element
	 * @private
	 */
	RuntimeAuthoring.prototype._handleNextTbElement = function() {
		if (this._iActive === this._aElements.length - 1) {
			(this._sArea === "TOP") ? this._handleNextOverlay() : this._oToolsMenu._oToolBarTop.focus();
		} else {
			this._loopOverTbElements(false, this._iActive + 1);
		}
	};

	/**
	 * Function to set the focus on the previous element before a focused toolbar element
	 * @private
	 */
	RuntimeAuthoring.prototype._handlePrevTbElement = function() {
		if (this._sArea === "TOP") {
			switch (this._iActive) {
				case -1:
					this._aElements = this._aTbBottomElements;
					if (this._aElements.length === 0) {
						this._oToolsMenu._oToolBarBottom.focus();
					} else {
						this._loopOverTbElements(true, this._aElements.length - 1);
					}
					break;
				case 0:
					this._oToolsMenu._oToolBarTop.focus();
					break;
				default:
					this._loopOverTbElements(true, this._iActive - 1);
			}				
		} else if (this._sArea === "OVERLAY") {
			this._aElements = this._aTbTopElements;
			if (this._aElements.length === 0) {
				this._oToolsMenu._oToolBarTop.focus();
			} else {
				this._loopOverTbElements(true, this._aElements.length - 1);
			}
		} else if (this._sArea === "BOTTOM") {
			this._loopOverTbElements(true, this._aElements.length - 1);
		}
	};	
		
	/**
	 * Function to set the focus on the next element after a focused overlay
	 * @private
	 */
	RuntimeAuthoring.prototype._handleNextOverlay = function() {
		var oOverlay;
		if (this._sArea === "TOP") {
			oOverlay = Utils.getFirstFocusableOverlay();
			(oOverlay) ? oOverlay.focus() : this._oToolsMenu._oToolBarBottom.focus();
		} else if (this._sArea === "OVERLAY") {
			oOverlay = Utils.getNextFocusableOverlay();
			(oOverlay) ? oOverlay.focus() : this._oToolsMenu._oToolBarBottom.focus();
		}
	};

	/**
	 * Function to set the focus on the previous element before a focused overlay
	 * @private
	 */
	RuntimeAuthoring.prototype._handlePrevOverlay = function() {
		var oOverlay;
		if (this._sArea === "BOTTOM") {
			oOverlay = Utils.getLastFocusableOverlay();
			if (oOverlay) {
				oOverlay.focus();
			} else {
				this._sArea = "OVERLAY";
				this._handlePrevTbElement();
			}
		} else if (this._sArea === "OVERLAY") {
			oOverlay = Utils.getPreviousFocusableOverlay();
			(oOverlay) ? oOverlay.focus() : this._handlePrevTbElement();
		}
	};
		
	/**
	 * Function to handle abap transport
	 * @private
	 */
	RuntimeAuthoring.prototype._onTransport = function() {
		
		this._ensureFormP13Handler();

		// To get all changes
		this._handler._oSmartForm = this._rootControl;
		var that = this;
		
		function handleCreateAndApplyChangesErrors(oError) {
			FlexUtils.log.error("SmartForm changes could not be applied or saved: " + oError);
			return that._handler._showApplySaveChangesErrorMessage(oError).then(function() {
				throw new Error('createAndApply failed');
			});
		}
		
		function handleAllErrors(oError) {
			if (oError.message === 'createAndApply failed') {
				return;
			}
			FlexUtils.log.error("transport error" + oError);
			return that._handler._showTransportErrorMessage(oError);
		}

		return this._handler._getFlexController().getComponentChanges().then(function(oChanges) {
			 return that._handler._convertToChangeArray(oChanges);
		}).then(function(aAllLocalChanges) {
			if (aAllLocalChanges.length > 0) {
				return that._handler._createAndApplyChanges(aAllLocalChanges);
			}
		})['catch'](handleCreateAndApplyChangesErrors).then(function() {
			return that._handler._getFlexController().getComponentChanges();
		}).then(function(aAllLocalChanges) {
			return !!aAllLocalChanges.length;
		}).then(function(bShouldTransport) {
			if (bShouldTransport) {
				return that._handler._openTransportSelection(null, true);
			} else {
				return that._handler._showTransportInapplicableMessage();
			}
		}).then(function(oTransportInfo) {
			if (oTransportInfo && oTransportInfo.transport && oTransportInfo.packageName !== "$TMP") {
				return that._transportAllLocalChanges(oTransportInfo);
			}
		})['catch'](handleAllErrors);
		 
	};

	/**
	 * Delete the changes for the whole application
	 * copied from FormP13Handler
	 * adapted that all the changes are deleted,
	 * not only those from the current SmartForm
	 * @private
	 * @param   {Array} aChanges - the changes of the whole application
	 * @returns {Promise} a Promise which handles the deletion
	 */
	RuntimeAuthoring.prototype._deleteChanges = function(aChanges) {
		
		var that = this;
		
		var oFlexController = that._handler._getFlexController();

		var iChangeIdx = aChanges.length - 1;
		return this._handler._setTransports(aChanges, iChangeIdx).then(function() {
			return oFlexController.discardChanges(aChanges);
		}).then(function() {
			return that._handler._showDiscardSuccessMessage();
		})["catch"](function(oError) {
			return that._handler._showDiscardErrorMessage(oError);
		});
	};
	
	/**
	 * Ensure that we have a FormP13Handler
	 * which is needed for example for transports and restoring
	 */
	RuntimeAuthoring.prototype._ensureFormP13Handler = function() {
	
		if (!this._handler) {
				this._handler = new FormP13nHandler();
				this._handler.init(this._rootControl);
			}
	};
	
	/**
	 * Discard all LREP changes and restore the default app state,
	 * opens a MessageBox where the user can confirm
	 * the restoring to the default app state
	 * @private
	 */
	RuntimeAuthoring.prototype._onRestore = function() {
		
		var that = this;
		
		var sMessage = this._oTextResources.getText("FORM_PERS_RESET_MESSAGE");
		var sTitle = this._oTextResources.getText("FORM_PERS_RESET_TITLE");
		
		this._ensureFormP13Handler();
		
		function fConfirmDiscardAllChanges(sAction) {

			if (sAction === "OK") {

				var oFlexController = that._handler._getFlexController();
				
				oFlexController.getComponentChanges().then(function(oChanges) {
					
					var aChanges = that._handler._convertToChangeArray(oChanges);
					return that._deleteChanges(aChanges);
					
				})["catch"](function(oError) {
					
					return that._handler._showDiscardErrorMessage();
				});
			}
		}

		MessageBox.confirm(sMessage, {
			title: sTitle,
			onClose: fConfirmDiscardAllChanges
		});
	};
	
	/**
	 * Prepare all changes and assign them to an existing transport
	 * @private
	 * 
	 * @param {object} oTransportInfo Information about the selected transport
	 * @returns {Promise} Promise which resolves without parameters
	 */
	RuntimeAuthoring.prototype._transportAllLocalChanges = function(oTransportInfo) {
		var that = this;
		return that._handler._getFlexController().getComponentChanges().then(function(aAllLocalChanges) {
			var aTransportData = that._handler._convertToChangeTransportData(aAllLocalChanges);

			// Pass list of changes to be transported with transport request to backend
			var oTransports = new Transports();
			var oTransportParams = {};
			oTransportParams.transportId = oTransportInfo.transport;
			oTransportParams.changeIds = aTransportData;
			return oTransports.makeChangesTransportable(oTransportParams).then(function() {
				// remove the $TMP package from all changes; has been done on the server as well,
				// but is not reflected in the client cache until the application is reloaded
				aAllLocalChanges.forEach(function(oChange) {
					if (oChange.getPackage() === '$TMP') {
						var oDefinition = oChange.getDefinition();
						oDefinition.packageName = '';
						oChange.setResponse(oDefinition);
					}
				});
			}).then(function() {
				return that._handler._showTransportSuccessMessage();
			});
		});
	};
	
	/**
	 * Function to handle moveing an element
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleMoveElement = function(oEvent) {
		var oData = oEvent.getParameters();
		this._oFlexAdapter.emitMoveEvent(oData.element, oData.change);
	};

	/**
	 * Function to handle hiding an element
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleHideElement = function(oEvent) {
		var oData = oEvent.getParameters();
		var that = this;
		if (Utils.isElementHideable(oData.element)){
			this._oFlexAdapter.emitHideEvent(oData.element);
		} else {
			this._openHideElementDialog(oData.element).then(function(bResult) {
				if (bResult) {
					that._oFlexAdapter.emitHideEvent(oData.element);
				}
			});
		}
	};

	RuntimeAuthoring.prototype._openHideElementDialog = function(oElement) {
		var that = this;
		var sMessage;
		var sTitle;
		return new Promise(function(resolve, reject) {
			var fConfirmHideElement = function(sAction) {
				if (sAction === "OK") {
					resolve(true);
				} else {
					resolve(false);
				}
			};
			if (oElement instanceof Group) {
				sMessage = that._oTextResources.getText("CTX_HIDE_GROUP_MESSAGE");
				sTitle = that._oTextResources.getText("CTX_HIDE_GROUP_TITLE");
			} else if (oElement instanceof GroupElement) {
				sMessage = that._oTextResources.getText("CTX_HIDE_FIELD_MESSAGE");
				sTitle = that._oTextResources.getText("CTX_HIDE_FIELD_TITLE");
			}
			MessageBox.confirm(sMessage, {
				title: sTitle,
				icon : "WARNING",
				onClose: fConfirmHideElement
			});
		 });
	};

	/**
	 * Function to handle opening the context menu
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleOpenContextMenu = function(oEvent) {
		var oOriginalEvent = oEvent.getParameter("originalEvent");
		var oOverlay = oEvent.getParameter("overlay");

		this._oContextMenu = new ContextMenu();
		this._oContextMenu.attachEvent("renameLabel", this._handleRenameLabel, this);
		this._oContextMenu.attachEvent("hideElement", this._handleHideElement, this);
		this._oContextMenu.attachEvent("addElement", this._handleAddElement, this);
		this._oContextMenu.attachEvent("addGroup", this._handleAddGroup, this);
		this._oContextMenu.attachEvent("adaptElement", this._handleAdaptElement, this);

		var oElement = oOverlay.getElementInstance();
		this._oContextMenu.setElement(oElement);
		this._oContextMenu.setOverlayDomRef(oOverlay);

		this._oContextMenu.openMenu({
			pageX: oOriginalEvent.pageX,
			pageY: oOriginalEvent.pageY
		});
	};

	/**
	 * Function to handle renaming a label
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleRenameLabel = function(oEvent) {
		var oOverlay = OverlayRegistry.getOverlay(oEvent.getParameter("element").getId());
		this._oRenamePlugin.setEditMode(oOverlay);
	};
	
	/**
	 * Function to handle adding an element
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleAddElement = function(oEvent) {
		var oElement = oEvent.getParameter("element");
		if (!this._oFieldRepository) {
			this._oFieldRepository = new FieldRepository({rootControl : this._rootControl});
			this._oFieldRepository.attachEvent("openCustomField", this._onOpenCustomField, this);
		}
		this._openFieldRepository(oElement);
	};
	
	/**
	 * Function to open the field repository
	 * @param  {sap.ui.core.Element} oElement on which the dialog will be opened
	 * @private
	 */
	RuntimeAuthoring.prototype._openFieldRepository = function(oElement) {
		var that = this;
		Utils.isCustomFieldAvailable(oElement).then(function(oResult) {
			if (oResult) {
				that._oFieldRepository.setShowCreateCustomField(true);
				that._oCurrentFieldExtInfo = oResult;
			}
		});
		this._oFieldRepository.open(oElement);
	};

	/**
	 * Function to handle adding an group
	 * @param  {sap.ui.base.Event} oEvent event object
	 * @private
	 */
	RuntimeAuthoring.prototype._handleAddGroup = function(oEvent) {
		var iIndex = 0;
		var that = this;
		var oData = oEvent.getParameters();
		var oTargetElement = oData.element;
		var oChange = null;
		
		if (oTargetElement.getMetadata().getName() === "sap.ui.comp.smartform.Group") {
			var aGroups = oTargetElement.getParent().getAggregation("formContainers");
			for (var i = 0; i < aGroups.length; i++) {
				if (aGroups[i].getId() === oTargetElement.getId()) {
					iIndex = i + 1;
					break;
				}
			}
			oChange = this._oFlexAdapter.emitAddEvent({
				selectorId : oTargetElement.getParent().getParent().getId(),
				index : iIndex
			}, FlexAdapter.M_TYPES.addGroup);
		} else if (oTargetElement.getMetadata().getName() === "sap.ui.comp.smartform.SmartForm") {
			iIndex = 0;
			oChange = this._oFlexAdapter.emitAddEvent({
				selectorId : oTargetElement.getId(),
				index : iIndex
			}, FlexAdapter.M_TYPES.addGroup);
		}
		var oOverlay = OverlayRegistry.getOverlay(oChange.newControlId);
		oOverlay.setSelected(true);
		var oDelegate = {"onAfterRendering": function(){
			that._oRenamePlugin.setEditMode(oOverlay);
			oOverlay.removeEventDelegate(oDelegate);
		}};
		oOverlay.addEventDelegate(oDelegate);
		
	};
	
	/**
	 * Function to handle to open the workaround dialog 
	 * @param  {sap.ui.core.Element} oElement
	 * @private
	 */
	RuntimeAuthoring.prototype._handleAdaptElement = function(oEvent) {
		var oElement = oEvent.getParameter("element"); 
		if (!this._handler) {
			this._handler = new FormP13nHandler();
		}
		this._handler.init(oElement);
		this._handler.show();
	};

	/**
	 * Get the Title of the Application from the manifest.json
	 * @private
	 * @returns {String} the application title or empty string
	 */
	RuntimeAuthoring.prototype._getApplicationTitle = function() {
		
		var sTitle = "";
		var oComponent = sap.ui.core.Component.getOwnerComponentFor(this._rootControl);
		if (oComponent){
			sTitle = oComponent.getMetadata().getManifestEntry("sap.app").title;
		}
		return sTitle;
	};

	return RuntimeAuthoring;

}, /* bExport= */ true);
