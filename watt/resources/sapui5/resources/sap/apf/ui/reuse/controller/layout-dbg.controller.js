/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.controller("sap.apf.ui.reuse.controller.layout", {
	onInit : function() {
		//Application Title
		this.oCoreApi = this.getView().getViewData().oCoreApi;
		this.oUiApi = this.getView().getViewData().uiApi;
		this.oNavigationHandler = this.getView().getViewData().oNavigationHandler;
		var applicationTitleKey;
		// Check if app config properties are available
		if (this.oCoreApi.getApplicationConfigProperties()) {
			applicationTitleKey = this.oCoreApi.getApplicationConfigProperties().appName;
		}
		this.applicationTitle = this.oCoreApi.getTextNotHtmlEncoded(applicationTitleKey);
		this.getView().byId("applicationPage").setTitle(this.applicationTitle);
		//Initialize Message Handler
		var oMessageHandlerView = this.oUiApi.getNotificationBar();
		this.getView().byId("applicationPage").addContent(oMessageHandlerView);
		var fnCallbackMessageHandling = oMessageHandlerView.initializeHandler;
		//this.oCoreApi.activateOnErrorHandling(true);
		this.oCoreApi.setCallbackForMessageHandling(fnCallbackMessageHandling.bind(oMessageHandlerView));
		this.loadLayout();
	},
	/**
	 *@description Layout specific content settings
	 */
	loadLayout : function() {
		var chartView = this.oUiApi.getStepContainer();
		var analysisPath = this.oUiApi.getAnalysisPath();
		this.getView().byId("applicationPage").setTitle(this.applicationTitle);
		this.getView().byId("masterFooter").addStyleClass("applicationFooter");
		this.getView().byId("detailFooter").addStyleClass("applicationFooter");
		this.getView().byId("stepContainer").addContent(chartView);
		this.getView().byId("analysisPath").addContent(analysisPath);
		this.addOpenInButton();//adds the "Open In..." button to the footer for navigation targets
	},
	onAfterRendering : function() {
		var self = this;
		var showMasterButton = new sap.m.Button({
			text : this.oCoreApi.getTextNotHtmlEncoded("showAnalyticalPath"),
			press : function() {
				self.getView().byId("applicationView").showMaster();
			},
			lite : true,
			type : "Transparent"
		});
		this.getView().byId("applicationView").attachAfterMasterClose(function() {
			self.getView().byId("detailFooter").removeContentLeft(showMasterButton);
			self.addDetailFooterContentLeft(showMasterButton);
		});
		this.getView().byId("applicationView").attachAfterMasterOpen(function() {
			if (self.getView().byId('detailFooter')) {
				self.getView().byId("detailFooter").removeAllContentLeft();
			}
		});
		if (this.getView().byId("applicationView").isMasterShown() === false) {
			this.addDetailFooterContentLeft(showMasterButton);
		}
	},
	hideMaster : function() {
		if (sap.ui.Device.system.phone || sap.ui.Device.system.tablet) {
			this.getView().byId("applicationView").hideMaster();
			if (sap.ui.Device.system.phone) {
				this.getView().byId("applicationView").toDetail(this.getView().byId("stepContainer").getId());
			}
		}
	},
	showMaster : function() {
		this.getView().byId("applicationView").showMaster();
	},
	//            setDetailTitle : function(oControl) {
	//                            this.detailTitleRemoveAllContent();
	//                            this.getView().byId("headerDetail").addContentMiddle(oControl);
	//            },
	//            detailTitleRemoveAllContent : function() {
	//                            this.getView().byId("headerDetail").removeAllContentMiddle();
	//            },
	/**
	 *@description Adds content to Master Footer alignment: Left
	 *@param oControl
	 */
	addMasterFooterContentLeft : function(oControl) {
		this.getView().byId("masterFooter").addContentLeft(oControl);
	},
	/**
	 *@description Adds content to Master Footer alignment: Right
	 *@param oControl
	 */
	addMasterFooterContentRight : function(oControl) {
		if (this.getView().byId("masterFooter").getContentRight().length === 0) {
			this.getView().byId("masterFooter").insertContentRight(oControl);
		} else {
			this.addMasterFooterContent(oControl);
		}
	},
	/**
	 *@description Adds content to Master Footer alignment: Right
	 *@param oControl
	 */
	addMasterFooterContent : function(oControl) {
		var self = this;
		if (this.oActionListPopover === undefined) {
			this.oActionListPopover = new sap.m.Popover({
				showHeader : false,
				placement : sap.m.PlacementType.Top
			});
		}
		
		if(typeof oControl.getWidth === "function"){
			oControl.setWidth("100%");
		}
		if (this.footerContentButton === undefined) {
			this.getView().byId("masterFooter").getContentRight()[0].setWidth("71%"); //Max character length 14 for first content in this case
			this.footerContentButton = new sap.m.Button({
				text : '...',
				press : function(oEvent) {
					self.oActionListPopover.openBy(oEvent.getSource());
				},
				lite : true,
				type : "Transparent"
			});
		}
		this.oActionListPopover.addContent(oControl);
		this.getView().byId("masterFooter").insertContentRight(this.footerContentButton, 1);
	},
	/**
	 *@description Adds content to Detail Footer alignment: Left
	 *@param oContol
	 */
	addDetailFooterContentLeft : function(oControl) {
		this.getView().byId("detailFooter").addContentLeft(oControl);
	},
	/**
	 *@description Adds facetfilter to the layout view
	 *@param facetFilter {object} - UI5 control
	 */
	addFacetFilter : function(facetFilter) {
		this.getView().byId("subHeader").addItem(facetFilter);
	},
	/**
	 *@description Enables or disables OpenIn button depending on whether global and step specific navigation targets are available
	 *If there are no global navigation targets disable OpenIn and if available enable OpenIn
	 *If there are step specific navigation targets in a current active step enable OpenIn
	 *On removal of a step or creation of new path or opening a new path disable/enable OpenIn
	 */
	enableDisableOpenIn : function() {
		var self = this;
		var oNavTargetsPromise = this.oNavigationHandler.getNavigationTargets();
		oNavTargetsPromise.then(function(navTargets) {
			if (self.oCoreApi.getActiveStep()) {//Incase there is an active step
				//Performing both undefined and length check because getAssignedNavigationTargets returns undefined for some old configurations
				var getNavTargetsOfStepLength = function() {
					return self.oCoreApi.getActiveStep().getAssignedNavigationTargets().length === 0 ? 0 : self.oCoreApi.getActiveStep().getAssignedNavigationTargets().length;
				};
				var navTargetsStepLength = self.oCoreApi.getActiveStep().getAssignedNavigationTargets() === undefined ? 0 : getNavTargetsOfStepLength();
				if (navTargetsStepLength !== 0 || navTargets.global.length !== 0) {//When there are either step specific targets for active step or global targets
					self.openInBtn.setEnabled(true);
				} else if (navTargetsStepLength === 0 && navTargets.global.length === 0) {//When neither global nor step specific targets available for active step
					self.openInBtn.setEnabled(false);
				}
			} else {//In case of no active step, check for global targets only
				if (navTargets.global.length === 0) {
					self.openInBtn.setEnabled(false);
				} else {
					self.openInBtn.setEnabled(true);
				}
			}
			self.openInBtn.rerender();//Re rendering the button after enabling or disabling because the control does not reflect these changes
		});
	},
	/**
	 *@description Adds the "Open In..." button to the footer and makes call for the popover
	 */
	addOpenInButton : function() {
		var self = this;
		if (this.oNavListPopover === undefined) {
			this.oNavListPopover = new sap.m.Popover({
				showHeader : false,
				placement : sap.m.PlacementType.Top
			});
		}
		//creates the button and appends it to the footer content
		this.openInBtn = new sap.m.Button({
			text : this.oCoreApi.getTextNotHtmlEncoded("openIn"),
			type : "Transparent",
			enabled : false,
			press : function(oEvent) {
				//call to view for NavigationTarget Action list	only on press of openIn button
				self.oNavTargetsView = sap.ui.view({
					viewName : "sap.apf.ui.reuse.view.navigationTarget",
					type : sap.ui.core.mvc.ViewType.JS,
					viewData : {
						oNavigationHandler : self.oNavigationHandler,
						oNavListPopover : self.oNavListPopover,//Required by navigationTarget.view in order to add the action list content to the pop over
						oOpenInButtonEventSource : oEvent.getSource(),//Required by navigationTarget.view in order to open the pop over after content is added
						oUiApi : self.oUiApi//Required by navigationTarget.view in order to set busy indicator
					}
				});
			}
		});
		this.getView().byId("detailFooter").insertContentRight(this.openInBtn, 1);
		this.enableDisableOpenIn();
	},
	handleNavBack : function(){
		window.history.go(-1); // Navigates back to te previous history set
	}
});
