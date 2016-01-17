/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.navpopover.SemanticObjectController.
sap.ui.define(['jquery.sap.global', 'sap/ui/comp/library', 'sap/ui/core/Element'],
	function(jQuery, library, Element) {
	"use strict";


	
	/**
	 * Constructor for a new navpopover/SemanticObjectController.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The SemanticObjectController allows the user to register against semantic object navigation events as well as define semantic objects which should be ignored.
	 * @extends sap.ui.core.Element
	 *
	 * @author Benjamin Spieler
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.navpopover.SemanticObjectController
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var SemanticObjectController = Element.extend("sap.ui.comp.navpopover.SemanticObjectController", /** @lends sap.ui.comp.navpopover.SemanticObjectController.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
	
			/**
			 * Comma-separated list of field names that must not be displayed as links.
			 * 
			 * Note that no validation will be done. Please ensure that you do not add any spaces or special characters.
			 * @since 1.28.0
			 */
			ignoredFields : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * If set to 'true', the SemanticObjectController will retrieve all navigation targets once in order to initially deactivate links for which no targets exist.
			 * Setting this value to 'true' will trigger an additional roundtrip.
			 * @since 1.28.0
			 */
			prefetchNavigationTargets : {type : "boolean", group : "Misc", defaultValue : false},
	
			/**
			 * Maps the field names to the related semantic objects. When accessing this property for the first time, the mapping will be calculated from the metadata within the provided model.
			 * @since 1.28.0
			 */
			fieldSemanticObjectMap : {type : "object", group : "Misc", defaultValue : null},
	
			/**
			 * The entity set name. If this name is not defined, the SemanticObjectController tries to retrieve the name from a parent.
			 * 
			 * Note that this is not a dynamic UI5 property
			 * @since 1.28.0
			 */
			entitySet : {type : "string", group : "Misc", defaultValue : null}
		},
		events : {
	
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
					*  The ID of the control that fired this event.
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
					*  The ID of the control that fired this event.
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
			 * This event is fired after a navigation link on the navigation popover has been clicked.
			 * This event is only fired, if the user left-clicks the link. Right-clicking the link and selecting 'Open in New Window' etc. in the context menu does not fire the event.
			 * @since 1.28.0
			 */
			navigate : {
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
				*  The ID of the control that fired this event.
			 	*/
				originalId: { type: "string" }				
				}		
			}, 
	
			/**
			 * Event is fired if the prefechtNavigationTargets property of the SemanticObjectController is set to true and the navigation targets have been fetched successfully.
			 * @since 1.28.0
			 */
			prefetchDone : {
				parameters: {		
					/**
					* A map containing all semantic objects keys for which at least one navigation target was found. The value for each semantic object key is an array containing the available actions found for this semantic object.
					*/
					semanticObjects: { type: "object" }									
					}	
			}
		}
	}});
	
	SemanticObjectController.prototype.init = function() {
		this._proxyOnBeforePopoverOpens = jQuery.proxy(this._onBeforePopoverOpens, this);
		this._proxyOnTargetsObtained = jQuery.proxy(this._onTargetsObtained, this);
		this._proxyOnNavigate = jQuery.proxy(this._onNavigate, this);
		this._aRegisteredControls = [];
	};
	
	/**
	 * Adds the given control from the SemanticObjectControler and registers all relevant events
	 * 
	 * @param {sap.ui.comp.navpopover.SmartLink} oSemanticSmartControl the SmartLink which should be added.
	 * @public
	 */
	SemanticObjectController.prototype.registerControl = function(oSemanticSmartControl) {
		if (oSemanticSmartControl.attachBeforePopoverOpens && !oSemanticSmartControl.hasListeners("beforePopoverOpens")) {
			oSemanticSmartControl.attachBeforePopoverOpens(this._proxyOnBeforePopoverOpens);
		}
		if (oSemanticSmartControl.attachNavigationTargetsObtained && !oSemanticSmartControl.hasListeners("navigationTargetsObtained")) {
			oSemanticSmartControl.attachNavigationTargetsObtained(this._proxyOnTargetsObtained);
		}
	
		if (oSemanticSmartControl.attachInnerNavigate && !oSemanticSmartControl.hasListeners("innerNavigate")) {
			oSemanticSmartControl.attachInnerNavigate(this._proxyOnNavigate);
		}
	
		this.setIgnoredState(oSemanticSmartControl);
		this._aRegisteredControls.push(oSemanticSmartControl);
	};
	
	/**
	 * Removes the given control from the SemanticObjectControler and unregisters all relevant events
	 * 
	 * @param {sap.ui.comp.navpopover.SmartLink} oSemanticSmartControl the SmartLink which should be removed.
	 * @public
	 */
	SemanticObjectController.prototype.unregisterControl = function(oSemanticSmartControl) {
		if (oSemanticSmartControl.detachBeforePopoverOpens) {
			oSemanticSmartControl.detachBeforePopoverOpens(this._proxyOnBeforePopoverOpens);
		}
		if (oSemanticSmartControl.detachNavigationTargetsObtained) {
			oSemanticSmartControl.detachNavigationTargetsObtained(this._proxyOnTargetsObtained);
		}
	
		if (oSemanticSmartControl.detachInnerNavigate) {
			oSemanticSmartControl.detachInnerNavigate(this._proxyOnNavigate);
		}
	
		this._aRegisteredControls.pop(oSemanticSmartControl);
	};
	
	/**
	 * Eventhandler before navigation popover opens
	 * 
	 * @param {object} oEvent the event parameters.
	 * @private
	 */
	SemanticObjectController.prototype._onBeforePopoverOpens = function(oEvent) {
		var oParameters = oEvent.getParameters();
	
		if (this.hasListeners("beforePopoverOpens")) {
			this.fireBeforePopoverOpens({
				semanticObject: oParameters.semanticObject,
				semanticAttributes: oParameters.semanticAttributes,
				setSemanticAttributes: oParameters.setSemanticAttributes,
				setAppStateKey: oParameters.setAppStateKey,
				originalId: oParameters.originalId,
				open: oParameters.open
			});
		} else {
			oParameters.open();
		}
	};
	
	/**
	 * Eventhandler after navigation targets have been retrieved.
	 * 
	 * @param {object} oEvent the event parameters.
	 * @private
	 */
	SemanticObjectController.prototype._onTargetsObtained = function(oEvent) {
		var oParameters = oEvent.getParameters();
		if (this.hasListeners("navigationTargetsObtained")) {
			var oSource = oEvent.getSource();
			this.fireNavigationTargetsObtained({
				semanticObject: oSource.getSemanticObject(),
				semanticAttributes: oSource.getSemanticAttributes(),
				actions: oParameters.actions,
				mainNavigation: oParameters.mainNavigation,
				ownNavigation: oParameters.ownNavigation,
				originalId: oParameters.originalId,
				show: oParameters.show
			});
		} else {
			oParameters.show();			
		}
	};
	
	/**
	 * Eventhandler after navigation has been triggered.
	 * 
	 * @param {object} oEvent the event parameters.
	 * @private
	 */
	SemanticObjectController.prototype._onNavigate = function(oEvent) {
		var oParameters = oEvent.getParameters();
		this.fireNavigate({
			text: oParameters.text,
			href: oParameters.href,
			originalId: oParameters.originalId,
			semanticObject: oParameters.semanticObject,
			semanticAttributes: oParameters.semanticAttributes
		});
	};
	
	/**
	 * Checks if the given SmartLink should be enabled or disabled and sets the state
	 * 
	 * @param {sap.ui.comp.navpopover.SmartLink} oSmartLink the SmartLink which should be enabled or disabled.
	 * @public
	 */
	SemanticObjectController.prototype.setIgnoredState = function(oSmartLink) {
		var bIsIgnored = this._fieldIsIgnored(oSmartLink.getFieldName()) || !this._linkIsAvailable(oSmartLink.getSemanticObject());
		oSmartLink.setIgnoreLinkRendering(bIsIgnored);
	};
	
	/**
	 * Checks if the given fieldname is within the ignored list
	 * 
	 * @param {string} sFieldName the fieldname.
	 * @returns {boolean} true if the field is ignored
	 * @private
	 */
	SemanticObjectController.prototype._fieldIsIgnored = function(sFieldName) {
		if (this._aIgnoredSegmanticObjects) {
			return this._aIgnoredSegmanticObjects.indexOf(sFieldName) > -1;
		}
		return false;
	};
	
	/**
	 * Checks if the given semantic object name has a navigation link
	 * 
	 * @param {string} sSemanticObject the SemanticObject.
	 * @returns {boolean} true if the semantic object has known navigation links
	 * @private
	 */
	SemanticObjectController.prototype._linkIsAvailable = function(sSemanticObject) {
		if (this._oAvailableLinks) {
			if (!this._oAvailableLinks[sSemanticObject]) {
				return false;
			}
		}
		return true;
	};
	
	SemanticObjectController.prototype.setIgnoredFields = function(sIgnoredFields) {
		if (sIgnoredFields) {
			this._aIgnoredSegmanticObjects = sIgnoredFields.split(",");
		} else {
			this._aIgnoredSegmanticObjects = null;
		}
	
		this.setProperty("ignoredFields", sIgnoredFields);
	
		this._evaluateEnableState();
	};
	
	SemanticObjectController.prototype.setPrefetchNavigationTargets = function(bPrefetch) {
		this.setProperty("prefetchNavigationTargets", bPrefetch);
	
		if (bPrefetch) {
			this._prefetchNavigationTargets();
		} else {
			this._oAvailableLinks = null;
			this._evaluateEnableState();
		}
	};
	
	SemanticObjectController.prototype.getFieldSemanticObjectMap = function() {
		var oMap = this.getProperty("fieldSemanticObjectMap");
		if (!oMap) {
			var sEntitySet = this.getEntitySet();
	
			if (!sEntitySet) {
				jQuery.sap.log.warning("FieldSemanticObjectMap is not set on SemanticObjectController, retrieval without EntitySet not possible");
				return null;
			}
	
			var oModel = this.getModel();
			jQuery.sap.require("sap.ui.comp.odata.MetadataAnalyser");
			var oMetadataAnalyzer = new sap.ui.comp.odata.MetadataAnalyser(oModel);
			oMap = oMetadataAnalyzer.getFieldSemanticObjectMap(sEntitySet);
	
			if (oMap) {
				this.setProperty("fieldSemanticObjectMap", oMap, true);
			}
		}
	
		return oMap;
	};
	
	SemanticObjectController.prototype.getEntitySet = function() {
		var sEntitySet = this.getProperty("entitySet");
	
		if (!sEntitySet) {
	
			var oParent = this.getParent();
			while (oParent) {
				if (oParent.getEntitySet) {
					sEntitySet = oParent.getEntitySet();
					if (sEntitySet) {
						this.setProperty("entitySet",sEntitySet, true);
						break;
					}
				}
	
				oParent = oParent.getParent();
			}
		}
	
		return sEntitySet;
	};
	
	/**
	 * Retrieves all navigation targets to identify semantic objects for which a link should be displayed
	 * 
	 * @private
	 */
	SemanticObjectController.prototype._prefetchNavigationTargets = function() {
		var fGetService = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
		if (!fGetService) {
			return;
		}
	
		this._oAvailableLinks = {};
		var oCrossAppNav = fGetService("CrossApplicationNavigation");
		var oURLParsing = fGetService("URLParsing");
		var oPromise = oCrossAppNav.getSemanticObjectLinks('');
	
		oPromise.fail(jQuery.proxy(function() {
			// activate links by removing empty AvailableLinks map
			this._oAvailableLinks = null;
			jQuery.sap.log.error("'getSemanticObjectLinks' failed");
			this._evaluateEnableState();
		}, this));
	
		oPromise.done(jQuery.proxy(function(aLinks) {
			var i, iLength;
			if (aLinks  && aLinks.length){
				iLength = aLinks.length;
				for (i = 0; i < iLength; i++) {
					var sId = aLinks[i].intent;
					var oShellHash = oURLParsing.parseShellHash(sId);
					if (oShellHash && oShellHash.semanticObject) {
						this._addActionToSemanticObject(oShellHash.semanticObject, oShellHash.action);				
					}
				}
			}
			this._evaluateEnableState();
			this.firePrefetchDone({
				semanticObjects: this._oAvailableLinks
			});
		}, this));
	};
	
	/**
	 * adds the given action to the action list of the given semantic object
	 * @param {string} sSemanticObject the SemanticObject.
	 * @param {string} sAction the Action.
	 *
	 * @private
	 */
	SemanticObjectController.prototype._addActionToSemanticObject = function(sSemanticObject, sAction) {
		if (!this._oAvailableLinks[sSemanticObject]){
			this._oAvailableLinks[sSemanticObject] = [];
		}
		
		this._oAvailableLinks[sSemanticObject].push(sAction);
	};
	
	/**
	 * Loops over all registered controls and evaluates if their enabled or not
	 * 
	 * @private
	 */
	SemanticObjectController.prototype._evaluateEnableState = function() {
		var i;
		var iLength = this._aRegisteredControls.length;
		for (i = 0; i < iLength; i++) {
			this.setIgnoredState(this._aRegisteredControls[i]);
		}
	};
	

	return SemanticObjectController;

}, /* bExport= */ true);
