/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/**
 *@class navigationTarget
 *@memberOf sap.apf.ui.reuse.controller
 *@name navigationTarget
 *@description controller for view.navigationTarget
 */
sap.ui.controller("sap.apf.ui.reuse.controller.navigationTarget", {
	
	onInit : function () {
		
		this.oNavigationHandler  = this.getView().getViewData().oNavigationHandler;

	},
	/**
	 *@memberOf sap.apf.ui.reuse.controller.navigationTarget
	 *@method handleNavigation  
	 *@param selected Navigation Target 
	 *@description Launches the APF Core API for navigating externally to another application 
	 */
	handleNavigation : function(selectedNavTarget){
		
		this.oNavigationHandler.navigateToApp(selectedNavTarget);
	}
});