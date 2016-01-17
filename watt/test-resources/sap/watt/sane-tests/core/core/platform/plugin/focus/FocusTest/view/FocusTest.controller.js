sap.ui.controller("focus.test.FocusTest.view.FocusTest", {
	
	doIt : function(oEvent) { 
		alert(oEvent.getSource().getId() + " does it!"); 
	}
});
