/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

(c) Copyright 2009-2015 SAP SE. All rights reserved
 */

// Provides control sap.ui.comp.navpopover.NavigationPopover.
sap.ui.define(['jquery.sap.global', 'sap/m/CustomListItem', 'sap/m/Link', 'sap/m/MessageBox', 'sap/m/Popover', 'sap/ui/comp/library', 'sap/ui/core/Title', 'sap/ui/layout/form/SimpleForm', 'sap/m/VBox'],
	function(jQuery, CustomListItem, Link, MessageBox, Popover, library, Title, SimpleForm, VBox) {
	"use strict";


	
	/**
	 * Constructor for a new navpopover/NavigationPopover.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given 
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The NavigationPopover allows navigating to different destinations by providing links on a popover.<br>
	 * The links are fetched using the {@link sap.ushell.services.CrossApplicationNavigation CrossApplicationNavigation} service of the unified shell.<br>
	 * 
	 * This class gets instantiated by {@link sap.ui.comp.navpopover.SmartLink SmartLink}. It is recommended to use {@link sap.ui.comp.navpopover.SmartLink SmartLink} instead of creating NavigationPopover manually.
	 * @extends sap.m.Popover
	 *
	 * @author Benjamin Spieler, Franz Müller
	 *
	 * @constructor
	 * @public
	 * @alias sap.ui.comp.navpopover.NavigationPopover
	 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
	 */
	var NavigationPopover = Popover.extend("sap.ui.comp.navpopover.NavigationPopover", /** @lends sap.ui.comp.navpopover.NavigationPopover.prototype */ { metadata : {
	
		library : "sap.ui.comp",
		properties : {
	
			/**
			 * popover title
			 * @since 1.28.0
			 */
			title : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * the name of the semantic object
			 * @since 1.28.0
			 */
			semanticObjectName : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * describes the semantic attributes. The attribute has to be a map
			 * @since 1.28.0
			 */
			semanticAttributes : {type : "object", group : "Misc", defaultValue : null},
	
			/**
			 * The application state key passed to retrieve the navigation targets.
			 * @since 1.28.0
			 */
			appStateKey : {type : "string", group : "Misc", defaultValue : null},
	
			/**
			 * Sets the visible text for the main navigation. If empty, the navigationPopover will try to get the Id from the given sourceObject.
			 */
			mainNavigationId : {type : "string", group : "Misc", defaultValue : null}
		},
		aggregations : {
	
			/**
			 * A list of available actions shown to the user. An action entry contains a text string and a href string.
			 * @since 1.28.0
			 */
			availableActions : {type : "sap.ui.comp.navpopover.LinkData", multiple : true, singularName : "availableAction"}, 
	
			/**
			 * The main navigation displayed first on the popover.
			 * @since 1.28.0
			 */
			mainNavigation : {type : "sap.ui.comp.navpopover.LinkData", multiple : false},
			
			/**
			 * The navigation target leading to the current application.
			 * @since 1.28.0
			 */
			ownNavigation : {type : "sap.ui.comp.navpopover.LinkData", multiple : false}
		},
		associations : {
	
			/**
			 * source control for which the popup should be displayed
			 * @since 1.28.0
			 */
			source : {type : "sap.ui.core.Control", multiple : false}, 
	
			/**
			 * ExtraContent is displayed between the main navigation and the additional available links.
			 * @since 1.28.0
			 */
			extraContent : {type : "sap.ui.core.Control", multiple : false}, 
	
			/**
			 * The parent component.
			 */
			component : {type : "sap.ui.core.Element", multiple : false}
		},
		events : {
	
			/**
			 * the navigation targets were obtained
			 * @since 1.28.0
			 */
			targetsObtained : {}, 
	
			/**
			 * Event is triggered when a link is pressed.
			 * @since 1.28.0
			 */
			navigate : {}
		}
	}});
	
	
	
	NavigationPopover.prototype.init = function() {
		Popover.prototype.init.call(this);
	
		this.addStyleClass("navigationPopover");
	
		this.setContentWidth("380px");
		this.setHorizontalScrolling(false);
		this.setPlacement(sap.m.PlacementType.Auto);
		
		this._oHeaderForm = new SimpleForm({
			maxContainerCols: 1,
			visible: true
		});		 
		
		this._oMainNavigationText = new Title();		
		this._oMainNavigationLink = new Link();
		this._oMainNavigationLink.attachPress(jQuery.proxy(this._onLinkPress, this));
		
		this._oHeaderForm.addContent(this._oMainNavigationText);	
		this._oHeaderForm.addContent(this._oMainNavigationLink);
	
		this._oForm = new SimpleForm({
			maxContainerCols: 1,
			visible: false
		});	
	
		this._oNavigationLinkContainer = new VBox();
	
		this._oForm.addContent(new Title({
			text: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_LINKLIST_TEXT")
		}));
		this._oForm.addContent(this._oNavigationLinkContainer);
	
		this.addContent(this._oHeaderForm);	
		this.addContent(this._oForm);
	};
	
	NavigationPopover.prototype.addAvailableAction = function(oLinkData) {
		this.addAggregation("availableActions", oLinkData);
	};
	
	/**
	 * creates the link controls and sets them into the popover's content
	 * 
	 * @private
	 */
	NavigationPopover.prototype._createLinks = function() {
		var i;
		var oLink;
		var sValue;		
		var sHref;
		var oLinkData;
		var oComponent = this._getComponent();
		var oXApplNavigation = this._getNavigationService();				
	
		this._oNavigationLinkContainer.removeAllItems();
			
		sValue = this.getMainNavigationId();
		if (!sValue){
			var oSmartLink = this._getSourceControl();
			if (oSmartLink) {
				sValue = oSmartLink.getSemanticObjectValue();
			}
		}
		
		this._oMainNavigationText.setText(sValue);	
	
		var oMainNav = this.getMainNavigation();
		if (oMainNav) {
			sHref = oMainNav.getHref();
			if (sHref) {
				this._oHeaderForm.removeStyleClass("navpopoversmallheader");			
				this._oMainNavigationLink.setText(oMainNav.getText());	
				
				if (oXApplNavigation){
					sHref = oXApplNavigation.hrefForExternal({ target : { shellHash : sHref} }, oComponent);					
				}
				this._oMainNavigationLink.setHref(sHref);
				this._oMainNavigationLink.setVisible(true);			
			} else {
				this._oHeaderForm.addStyleClass("navpopoversmallheader");
				this._oMainNavigationLink.setText("");
				this._oMainNavigationLink.setVisible(false);
			}		
		}
	
		var aActions = this.getAvailableActions();
		if (aActions) {
			for (i = 0; i < aActions.length; i++) {
				oLink = new Link();
				oLinkData = aActions[i];				
								
				if (oLinkData) {					
					oLink.setText(oLinkData.getText());
					oLink.attachPress(jQuery.proxy(this._onLinkPress, this));
					
					sHref = oLinkData.getHref();
					if (oXApplNavigation){
						sHref = oXApplNavigation.hrefForExternal({ target : { shellHash : sHref} }, oComponent);
					}
					oLink.setHref(sHref);
				}				
	
				this._oNavigationLinkContainer.addItem(oLink);
			}
		}
	
		this._setListVisibility();
	};
	
	NavigationPopover.prototype.insertAvailableAction = function(oLinkData, iIndex) {
		this.insertAggregation("availableActions", oLinkData, iIndex);
	};
	
	NavigationPopover.prototype.removeAvailableAction = function(oLinkData) {
		var iIndexOfRemovedItem;
	
		if (typeof (oLinkData) === "number") { // oLinkData can also be an index to be removed
			iIndexOfRemovedItem = oLinkData;
		} else {
			iIndexOfRemovedItem = this.getAvailableActions().indexOf(oLinkData);
		}
	
		if (iIndexOfRemovedItem >= 0) {
			this._oNavigationLinkContainer.removeItem(iIndexOfRemovedItem);
		}
	
		var oReturnValue = this.removeAggregation("availableActions", oLinkData);
		this._setListVisibility();
		return oReturnValue;
	};
	
	NavigationPopover.prototype.removeAllAvailableActions = function() {
		this._oNavigationLinkContainer.removeAllItems();
		this.removeAllAggregation("availableActions");
		this._setListVisibility();
	};
	
	/**
	 * sets the visibility of the link list depending on the number of available links (0 = invisible)
	 * 
	 * @private
	 */
	NavigationPopover.prototype._setListVisibility = function() {
		var iAvailableActions = this.getAvailableActions().length;
		this._oForm.setVisible(iAvailableActions > 0);
	};	
	
	/**
	 * EventHandler for all link press on this popover
	 * 
	 * @param {object}
	 *            oEvent - the event parameters
	 *
	 * @private
	 */
	NavigationPopover.prototype._onLinkPress = function(oEvent){
		var oSource = oEvent.getSource();
		this.fireNavigate({text: oSource.getText(), href: oSource.getHref()});		
	};
	
	NavigationPopover.prototype.setSemanticObjectName = function(sSemanticalObject) {
		this.setProperty("semanticObjectName", sSemanticalObject);
	
		this.removeAllAvailableActions();
		this.setMainNavigation(null);
	};
	
	/**
	 * retrieve the navigation service
	 * 
	 * @private
	 * @returns {object} the navigation service
	 */
	NavigationPopover.prototype._getNavigationService = function() {
		return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
	};
	
	/**
	 * retrieve the url service
	 * 
	 * @private
	 * @returns {object} the url service
	 */
	NavigationPopover.prototype._getUrlService = function() {
		return sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("URLParsing");
	};
	
	/**
	 * determines the potential navigation targets for the semantical object and visualize the popover
	 * 
	 * @public
	 * @param {string}
	 *            sSemanticalObject name of the semantical object
	 */
	NavigationPopover.prototype.retrieveNavTargets = function() {
		var sSemanticalObject = this.getSemanticObjectName();
		var mSemanticAttributes = this.getSemanticAttributes();
		var sAppStateKey = this.getAppStateKey();
		this._retrieveNavTargets(sSemanticalObject, mSemanticAttributes, sAppStateKey);
	};
	
	/**
	 * determines the potential navigation targets for the semantical object and visualize the popover
	 * 
	 * @private
	 * @param {string}
	 *            sSemanticalObject name of the semantical object
	 * @param {map}
	 *            mSemanticAttributes map of (name, values) pair for to fine-tune the result
	 * @param {string}
	 *            sAppStateKey Application state key
	
	 */
	NavigationPopover.prototype._retrieveNavTargets = function(sSemanticalObject, mSemanticAttributes, sAppStateKey) {
	
		var that = this;
	
		this.setMainNavigation(null);
		this.removeAllAvailableActions();
	
		var oXApplNavigation = this._getNavigationService();
		if (!oXApplNavigation) {
			jQuery.sap.log.error("Service 'CrossApplicationNavigation' could not be obtained");
			
			//still fire targetsObtained event: easier for testing and the eventhandlers still could provide static links
			this.fireTargetsObtained();
			return;
		}
			
		var bIgnoreFormFactor = false;

		var oComponent = this._getComponent();				
		
		var oPromise = oXApplNavigation.getSemanticObjectLinks(sSemanticalObject, mSemanticAttributes, bIgnoreFormFactor, oComponent, sAppStateKey);
		oPromise.fail(jQuery.proxy(function() {
			// Reset actions
			jQuery.sap.log.error("'getSemanticObjectLinks' failed");
		}, this));
	
		oPromise.done(jQuery.proxy(function(aLinks) {
			var i, sId, sText;
			var oURLParsing, oShellHash;
			var oLinkData;
			var bHasFactSheet = false;			
	
			if (aLinks && aLinks.length) {
				oURLParsing = that._getUrlService();
				
				var sCurrentHash = oXApplNavigation.hrefForExternal();				
				if (sCurrentHash && sCurrentHash.indexOf("?") !== -1){ //sCurrentHash can contain query string, cut it off!
					sCurrentHash = sCurrentHash.split("?")[0];
				}
	
				for (i = 0; i < aLinks.length; i++) {
					sId = aLinks[i].intent; 
					
					sText = aLinks[i].text;
					
					oLinkData = new sap.ui.comp.navpopover.LinkData({
						text: sText,
						href: sId
					});
					
					if (sId.indexOf(sCurrentHash) === 0) {
	                    // Prevent current app from being listed
	                    // NOTE: If the navigation target exists in
	                    // multiple contexts (~XXXX in hash) they will all be skipped
						this.setOwnNavigation(oLinkData);
	                    continue;
	                }	
						
					// Check if a FactSheet exists for this SemanticObject (to skip the first one found)
					oShellHash = oURLParsing.parseShellHash(sId);
					if (oShellHash.action && (oShellHash.action === 'displayFactSheet') && !bHasFactSheet) {
						// Prevent this first FactSheet from being listed --> TODO why ?
						oLinkData.setText(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_FACTSHEET"));
						that.setMainNavigation(oLinkData);
						bHasFactSheet = true;
					} else {
						that.addAvailableAction(oLinkData);
					}
				}
			}
	
			that.fireTargetsObtained();
	
		}, this));
	
	};
	
	/**
	 * returns the component object
	 * 
	 * @private
	 * 
	 * @returns {object} the component
	 * 	
	 */
	NavigationPopover.prototype._getComponent = function(){
		var oComponent = this.getComponent();
		if (typeof oComponent === "string"){
			oComponent = sap.ui.getCore().getComponent(oComponent);
		}
		return oComponent;
	};	
	
	/**
	 * displays the popover. This method should be called, once all navigation targets are adapted by the application
	 * 
	 * @public
	 */
	NavigationPopover.prototype.show = function() {
	
		var oSourceControl = this._getSourceControl();
		if (!oSourceControl) {
			jQuery.sap.log.error("no source assigned");
			return;
		}
	
		var oMainNav = this.getMainNavigation();
		var aActions = this.getAvailableActions();
		if (!(oMainNav && (oMainNav.getHref())) && !(aActions && (aActions.length > 0))) { // if no fact sheet exists and no actions and no extra content, then do not show popover
			jQuery.sap.log.error("no navigation targets found");
			
			if (!this.getExtraContent()) {
				jQuery.sap.log.error("NavigationPopover is empty");
				MessageBox.show(sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_DETAILS_NAV_NOT_POSSIBLE"), {
					icon: MessageBox.Icon.ERROR,
					title: sap.ui.getCore().getLibraryResourceBundle("sap.ui.comp").getText("POPOVER_MSG_NAV_NOT_POSSIBLE"),
					styleClass: (this.$() && this.$().closest(".sapUiSizeCompact").length) ? "sapUiSizeCompact" : ""
				});
	
				return;			
			}
		}
	
		this._createLinks();
	
		this.openBy(oSourceControl);
	};
	
	/**
	 * retrieves the control for which the popover should be displayed
	 * 
	 * @private
	 * @returns { sap.ui.core.Control} returns the source control
	 */
	NavigationPopover.prototype._getSourceControl = function() {
		var oSourceControl = null;
		var sControlId = this.getSource();
	
		if (sControlId) {
			oSourceControl = sap.ui.getCore().byId(sControlId);
		}
	
		return oSourceControl;
	};
	
	NavigationPopover.prototype.setExtraContent = function(oControl){
		var oOldContent = this.getExtraContent();
		if (oOldContent && oControl && oOldContent === oControl.getId()){
			return;
		}
		
		if (oOldContent){
			var oOldControl = sap.ui.getCore().byId(oOldContent);
			this.removeContent(oOldControl);
		} 
		
		this.setAssociation("extraContent", oControl);
		
		if (oControl){
			this.insertContent(oControl, 1);
		}
	};

	return NavigationPopover;

}, /* bExport= */ true);
