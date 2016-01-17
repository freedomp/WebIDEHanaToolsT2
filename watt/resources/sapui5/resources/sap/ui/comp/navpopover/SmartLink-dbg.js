/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.navpopover.SmartLink.
sap.ui.define(['jquery.sap.global', 'sap/m/Link', 'sap/ui/comp/library', './NavigationPopover', 'sap/ui/comp/navpopover/LinkData'],
	function(jQuery, Link, library, NavigationPopover, LinkData) {
	"use strict";


	
	/**
	 * Constructor for a new navpopover/SmartLink.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given 
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The SmartLink control uses a semantic object to display {@link sap.ui.comp.navpopover.NavigationPopover NavigationPopover} for further navigation steps.
	 * @extends sap.m.Link
	 *
	 * @author Benjamin Spieler
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.navpopover.SmartLink
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SmartLink = Link.extend("sap.ui.comp.navpopover.SmartLink", /** @lends sap.ui.comp.navpopover.SmartLink.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
	
			/**
			 * The semantic object which is used to fill the navigation popover.
			 * @since 1.28.0
			 */
			semanticObject : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * The semantic object controller controls events for several SmartLink controls. If the controller is not manually set, the SmartLink tries to find a SemanticObjectController in the parent hierarchy.
			 * @since 1.28.0
			 */
			semanticObjectController : {type : "any", group : "Misc", defaultValue : null},
	
			/**
			 * The metadata fieldname for this SmartLink.
			 * @since 1.28.0
			 */
			fieldName : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * The semantic objects's display name.
			 * @since 1.28.0
			 */
			semanticObjectLabel : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Function that enables the SmartLink to create an alternative control, which is displayed if no navigation targets are available. The function has no parameters and has to return an instance of sap.ui.core.Control.
			 * @since 1.28.0
			 */
			createControlCallback : {type : "object", group : "Misc", defaultValue : null},
	
			/**
			 * If set to 'false', the SmartLink will not replace its field name with the according semantic object name during the calculation of the semantic attributes. This enables the usage of several SmartLinks on the same semantic object.
			 */
			mapFieldToSemanticObject : {type : "boolean", group : "Misc", defaultValue : true},
	
			/**
			 * If this property is set to 'true', the link itself will not be rendered, instead the control provided via the innerControl aggregation or the createControlCallback property will be rendered.
			 * @since 1.28.0
			 */
			ignoreLinkRendering : {type : "boolean", group : "Misc", defaultValue : false}
		},
		aggregations : {
	
			/**
			 * Inner control that is created if the SmartLink is disabled (eg. no navigation targets are available)
			 * @since 1.28.0
			 */
			innerControl : {type : "sap.ui.core.Control", multiple : false}
		},
		events : {
	
			/**
			 * Event is fired before the semantic object navigation popup opens and before navigation targets are getting retrieved. Event can be used to set the required business attributes.
			 * @since 1.28.0
			 */
			beforePopoverOpens : {
				parameters: {					
					/**
					*  The semantic object for which the navigation targets must be retrieved.
				 	*/
					semanticObject: { type: "string" },
					
					/**
					*  Map containing the semantic attributes calculated based on the binding that will be used to retrieve the navigation targets.
				 	*/
					semanticAttributes: { type: "object" },
					
					/**
					*  The ID of the SmartLink.
				 	*/
					originalId: { type: "string" },
					
					/**
					*  This callback function enables you to define a changed semantic attributes map. 
					*  Signatures:
					*  <code>setSemanticAttributes(oSemanticAttributesMap)</code>
					*  Parameter:
					*  <ul>
					*  	<li>{object} oSemanticAttributesMap - The new map containing the semantic attributes to be used.</li>
					*  </ul>
				 	*/
					setSemanticAttributes: { type: "function" },
					
					/**
					*  This callback function sets an application state key that is used over the cross-application navigation. 
					*  Signatures:
					*  <code>setAppStateKey(sAppStateKey)</code>
					*  Parameter:
					*  <ul>
					*  	<li>{string} sAppStateKey - The application state key.</li>
					*  </ul>					
				 	*/
					setAppStateKey: { type: "function" },
					
					/**
					*  This callback function triggers the retrieval of navigation targets and results in the opening of the navigation popover.
					*  Signatures:
					*  <code>open()</code>
					*  If the beforePopoverOpens event has been registered, the 'open' function has to be called in order to open the navigation popover.
				 	*/
					open: { type: "function" }
				}
			}, 
	
			/**
			 * Event is fired after navigation targets for a semantic object have been retrieved. The event can be used to change the navigation targets.
			 * @since 1.28.0
			 */
			navigationTargetsObtained : {
				parameters: {
					/**
					*  Array of available navigation targets. Each entry in this array contains a 'text' and 'href' property.
				 	*/
					actions: { type: "sap.ui.comp.navpopover.LinkData[]" },
					
					/**
					*  The main navigation, containing a 'text' and 'href' property.
				 	*/
					mainNavigation: { type: "sap.ui.comp.navpopover.LinkData" },
					
					/**
					*  The navigation object for the current application, containing a 'text' and 'href' property.
					*  This navigation option is by default not visible on the popover.
				 	*/
					ownNavigation: { type: "sap.ui.comp.navpopover.LinkData" },
					
					/**
					*  The semantic object for which the navigation targets have been retrieved.
				 	*/
					semanticObject: { type: "string" },
					
					/**
					*  The ID of the SmartLink.
				 	*/
					originalId: { type: "string" },
					
					/**
					*  This callback function shows the actual navigation popover. 
					*  Signatures:
					*  <code>show()</code>
					*  <code>show(oMainNavigation, aAvailableActions, oExtraContent)</code>
					*  <code>show(sMainNavigationId, oMainNavigation, aAvailableActions, oExtraContent)</code>
					*  Parameters:
					*  <ul>
					*  	<li>{string} sMainNavigationId - The visible text for the main navigation. If empty, the navigationPopover will try to get the ID from the given sourceObject.</li>
					*  	<li>{sap.ui.comp.navpopover.LinkData} oMainNavigation - The main navigation link data containing a 'text" and 'href' property.</li>
					*  	<li>{sap.ui.comp.navpopover.LinkData[]} aAvailableActions - Array containing the cross application navigation links.</li>
					*   <li>{sap.ui.core.Control} oExtraContent - Custom control that will be placed on the popover.</li>
					*  </ul>					      
					*  If the navigationTargetsObtained event has been registered, the 'show' function has to be called in order to open the navigation popover.
				 	*/
					show: { type: "function" }
				}
			}, 
	
			/**
			 * This event is fired after a navigation link on the navigation popover has been clicked.
			 * This event is only fired, if the user left-clicks the link. Right-clicking the link and selecting 'Open in New Window' etc. in the context menu does not fire the event.
			 * @since 1.28.0
			 */
			innerNavigate : {
				parameters: {		
					/**
					*  The UI text shown in the clicked link.
					*/
					text: { type: "string" },
					
					/**
					*  The navigation target of the clicked link.
					*/
					href: { type: "string" },
					
					/**
					*  The semantic object used to retrieve this target.
				 	*/
					semanticObject: { type: "string" },
					
					/**
					*  Map containing the semantic attributes used to retrieve this target.
				 	*/
					semanticAttributes: { type: "object" },
					
					/**
					*  The ID of the SmartLink.
				 	*/
					originalId: { type: "string" }				
					}		
			}
		}
	}});
	
	
	SmartLink.prototype.init = function() {
		// sap.m.Link.prototype.init.call(this);
		this.attachPress(this._linkPressed);
		this.addStyleClass("sapUiCompSmartLink");
		this._oSemanticAttributes = null;
	};
	
	/**
	 * Eventhandler for link's press event
	 * 
	 * @param {object} oEvent the event parameters.
	 * @private
	 */
	SmartLink.prototype._linkPressed = function(oEvent) {
		if (this._processingLinkPressed){
			window.console.warn("SmartLink is still processing last press event. This press event is omitted.");
			return; //avoid multiple link press events while data is still fetched
		}
		
		if (this.getIgnoreLinkRendering()){
			window.console.warn("SmartLink should ignore link rendering. Press event is omitted.");
			return;	//actual link is not rendered -> ignore press event
		}
		
		this._processingLinkPressed = true;
	
		var sAppStateKey;
		this._calculateSemanticAttributes();
		
		var that = this;
		var fOpen = function() {
			that._createPopover();
	
			if (that._oSemanticAttributes) {			
				that._oPopover.setSemanticAttributes(that._oSemanticAttributes);
			}
			
			if (sAppStateKey){
				that._oPopover.setAppStateKey(sAppStateKey);
			}
	
			that._oPopover.retrieveNavTargets();
		};
	
		if (this.hasListeners("beforePopoverOpens")) {
			this.fireBeforePopoverOpens({
				semanticObject: this.getSemanticObject(),
				semanticAttributes: that._oSemanticAttributes,
				setSemanticAttributes: function(oMap) {
					that._oSemanticAttributes = oMap;
				},
				setAppStateKey: function(sKey){
					sAppStateKey = sKey;
				},
				originalId: this.getId(),
				open: fOpen
			});
		} else {
			fOpen();
		}
	};
	
	/**
	 * Eventhandler for NavigationPopover's targetObtained event, exposes event or - if not registered - directly opens the dialog
	 * 
	 * @private
	 */
	SmartLink.prototype._onTargetsObtainedOpenDialog = function() {
		var that = this;
	
		if (!this._oPopover.getMainNavigation()) { // main navigation could not be resolved, so only set link text as MainNavigation
			this._oPopover.setMainNavigation(new LinkData({
				text: this.getText()
			}));
		}
	
		this.fireNavigationTargetsObtained({
			actions: this._oPopover.getAvailableActions(),
			mainNavigation: this._oPopover.getMainNavigation(),
			ownNavigation: this._oPopover.getOwnNavigation(),
			semanticObject: this.getSemanticObject(),
			semanticAttributes: this.getSemanticAttributes(),
			originalId: this.getId(),
			show: function(sMainNavigationId, oMainNavigation, aAvailableActions, oExtraContent) {			
				if (sMainNavigationId != null && typeof sMainNavigationId === "string"){
					that._oPopover.setMainNavigationId(sMainNavigationId);
				} else {
					oExtraContent = aAvailableActions;
					aAvailableActions = oMainNavigation;
					oMainNavigation = sMainNavigationId;				
				}
				
				if (oMainNavigation) {
					that._oPopover.setMainNavigation(oMainNavigation);
				}
	
				if (aAvailableActions) {
					that._oPopover.removeAllAvailableActions();
					if (aAvailableActions && aAvailableActions.length) {
						var i, length = aAvailableActions.length;
						for (i = 0; i < length; i++) {
							that._oPopover.addAvailableAction(aAvailableActions[i]);
						}
					}
				}
	
				if (oExtraContent) {
					that._oPopover.setExtraContent(oExtraContent);
				}
	
				that._oPopover.show();
				that._processingLinkPressed = false;
			}
		});
	
		if (!this.hasListeners("navigationTargetsObtained")) {
			this._oPopover.show();
			this._processingLinkPressed = false;
		}
	};
	
	/**
	 * Eventhandler for NavigationPopover's navigate event, exposes event
	 * 
	 * @param {object} oEvent - the event parameters
	 * @private
	 */
	SmartLink.prototype._onInnerNavigate = function(oEvent) {
		var aParameters = oEvent.getParameters();
		this.fireInnerNavigate({
			text: aParameters.text,
			href: aParameters.href,
			originalId: this.getId(),
			semanticObject: this.getSemanticObject(),
			semanticAttributes: this.getSemanticAttributes()
		});
	};
	
	/**
	 * Creates the NavigationPopover.
	 * 
	 * @private
	 */
	SmartLink.prototype._createPopover = function() {
		if (!this._oPopover) {
			var oComponent = this._getComponent();
			this._oPopover = new NavigationPopover({
				title: this.getSemanticObjectLabel(),
				semanticObjectName: this.getSemanticObject(),
				targetsObtained: jQuery.proxy(this._onTargetsObtainedOpenDialog, this),
				navigate: jQuery.proxy(this._onInnerNavigate, this),
				component: oComponent
			});
	
			this._oPopover.setSource(this);
		}
	};
	
	/**
	 * Finds the parental component.
	 * 
	 * @private
	 * @returns {sap.ui.core.Component} the found parental component or null
	 */
	SmartLink.prototype._getComponent = function() {	
		var oParent = this.getParent();
		while (oParent) {
			
			if (oParent instanceof sap.ui.core.Component){
				return oParent;
			}
			oParent = oParent.getParent();
		}
	
		return null;
	};
	
	/**
	 * Gets the current binding context and creates a copied map where all empty and unnecessary data is deleted from.
	 * 
	 * @private
	 */
	SmartLink.prototype._calculateSemanticAttributes = function() {
		var oResult = null;
		var oContext = this.getBindingContext();
		if (oContext) {
			oResult = {};
			var oSourceObject = oContext.getObject(oContext.getPath());
			var oKey, oValue;		
			var that = this;
			var fMap;
			
			if (this.getMapFieldToSemanticObject()){  //map all available fields to their semanticObjects
				fMap = function(oKey){
					return that._mapFieldToSemanticObject(oKey);
				};
			} else {										//map all available fields to their semanticObjects excluding SmartLink's own SemanticObject
				var sSemanticObject = this.getSemanticObject();
				fMap = function(oKey){
					var sFoundSemanticObject = that._mapFieldToSemanticObject(oKey);
					if (sFoundSemanticObject === sSemanticObject){
						return oKey;
					}
					return sFoundSemanticObject;
				};
			}
	
			// copy the source object and ignore empty values / metadata
			for (oKey in oSourceObject) {
				if (oKey !== "__metadata") {
					oValue = oSourceObject[oKey];
					if (oValue) {
						oKey = fMap(oKey);
						oResult[oKey] = oValue;
					}
				}
			}
		}
	
		this._oSemanticAttributes = oResult;
	};
	
	/**
	 * Gets the semantic object calculated at the last Link press event
	 * 
	 * @returns {object} Map containing the copy of the available binding context.
	 * @public
	 */
	SmartLink.prototype.getSemanticAttributes = function() {
		if (this._oSemanticAttributes === null) {
			this._calculateSemanticAttributes();
		}
		return this._oSemanticAttributes;
	};
	
	/**
	 * Maps the given field to the corresponding semantic object if available
	 * 
	 * @param {string} oField - the field name which should be mapped to a semantic object;
	 * @returns {string} The corresponding semantic object, or if semantic object is not available, the original field.
	 * @private
	 */
	SmartLink.prototype._mapFieldToSemanticObject = function(oField) {
		var oSOController = this.getSemanticObjectController();
		if (oSOController) {
			var oMap = oSOController.getFieldSemanticObjectMap();
			if (oMap) {
				var oSemanticObject = oMap[oField];
				if (oSemanticObject) {
					return oSemanticObject;
				}
			}
		}
		return oField;
	};
	
	SmartLink.prototype.setFieldName = function(sFieldName) {
		this.setProperty("fieldName", sFieldName);
	
		var oSemanticController = this.getSemanticObjectController();
		if (oSemanticController) {
			oSemanticController.setIgnoredState(this);
		}
	};
	
	SmartLink.prototype.setSemanticObjectController = function(oController) {
		var oOldController = this.getProperty("semanticObjectController");
		if (oOldController) {
			oOldController.unregisterControl(this);
		}
	
		this.setProperty("semanticObjectController", oController, true);
	
		if (oController) {
			oController.registerControl(this);
		}
	};
	
	SmartLink.prototype.getSemanticObjectController = function() {
		var oController = this.getProperty("semanticObjectController");
	
		if (!oController) {
	
			var oParent = this.getParent();
			while (oParent) {
				if (oParent.getSemanticObjectController) {
					oController = oParent.getSemanticObjectController();
					if (oController) {
						this.setSemanticObjectController(oController);
						break;
					}
				}
	
				oParent = oParent.getParent();
			}
		}
	
		return oController;
	};
	
	/**
	 * Gets the current value assigned to the field with the SmartLink's semantic object name.
	 * 
	 * @returns {object} The semantic object's value.
	 * @public
	 */
	SmartLink.prototype.getSemanticObjectValue = function() {
		var oSemanticAttributes = this.getSemanticAttributes();
		if (oSemanticAttributes) {
			var sSemanticObjectName = this.getSemanticObject();
			return oSemanticAttributes[sSemanticObjectName];
		}
	
		return null;
	};
	
	SmartLink.prototype.setText = function(sText) {
		if (this._isRenderingInnerControl()) {
			//SmartLink renders inner control => overwrite base setText as it changes the DOM directly
			this.setProperty("text", sText, true);	
		} else {
			Link.prototype.setText.call(this, sText);
		}
	};
	
	SmartLink.prototype._isRenderingInnerControl = function() {
		return this.getIgnoreLinkRendering() && this._getInnerControl() != null;
	};
	
	/**
	 * Gets the inner control which is provided by the CreateControlCallback
	 * 
	 * @returns {sap.ui.core.Control} The control.
	 * @private
	 */
	SmartLink.prototype._getInnerControl = function() {
		var oInnerControl = this.getAggregation("innerControl");
		if (!oInnerControl) {
			var fCreate = this.getCreateControlCallback();
			if (fCreate) {
				oInnerControl = fCreate();
				this.setAggregation("innerControl", oInnerControl, true);
			}
		}
	
		return oInnerControl;
	};
	
	/**
	 * Gets the inner control's value, if no inner control is available, the SmartLink's text will be returned
	 * 
	 * @returns {object} the value
	 * @public
	 */
	SmartLink.prototype.getInnerControlValue = function() {
		if (this._isRenderingInnerControl()){
			var oInnerControl = this._getInnerControl();
		
			if (oInnerControl){
				if (oInnerControl.getText){
					return oInnerControl.getText();
				}
			
			if (oInnerControl.getValue){		
					return oInnerControl.getValue();
				}
			}		
		}
		
		return this.getText();
	};
	
	/**
	 * Called before rendering
	 * 
	 */
	SmartLink.prototype.onBeforeRendering = function() {
		//ensure that the semantic object controller exists, do this first as retrieving the SemanticObjectController can lead to setting the ignoreLinkRendering flag
		this.getSemanticObjectController();
		
		//if link should not be rendered, but no inner control is available, deactivate SmartLink
		if (this.getIgnoreLinkRendering() && this._getInnerControl() == null){
			this.setEnabled(false);
		} else {
			this.setEnabled(true);
		}
	};
	
	SmartLink.prototype.exit = function() {				
		this.setSemanticObjectController(null); //disconnect from SemanticObjectController	
	};
	

	return SmartLink;

}, /* bExport= */ true);
