jQuery.sap.declare("cus.sd.sofulfil.monitor.view.ContactsHelper");
jQuery.sap.require("my.app.context.stamscript");
jQuery.sap.require({
		modName: "my.app.context.view.Detail",
		type: "controller"
	});
	
var i;

sap.ui.core.mvc.Controller.extend("myFiori.view.Master", {
	
	handleSearch: function() {
		// add filter for search
		var filters = [];
		var searchString = this.getView().byId("searchField").getValue();
		if (searchString && searchString.length > 0) {
			filters = [ new sap.ui.model.Filter("SalesOrderNumber", sap.ui.model.FilterOperator.Contains, searchString) ];
		}
		
		// update list binding
		var list = this.getView().byId("list");
		var binding = list.getBinding("items");
		binding.filter(filters);
	},
	
	handleSelect: function(oEvent) {
		var oListItem = oEvent.getParameter("listItem") || oEvent.getSource();
		
		// trigger routing to BindingPath of this ListItem - this will update the data on the detail page
		sap.ui.core.UIComponent.getRouterFor(this).navTo("Detail",{from: "master", contextPath: oListItem.getBindingContext().getPath().substr(1)});
	}
	
	
});

var a = 1;
var b = 1;

if(a === b){
    var c = function alla(){
        //something
    };
}

while( a > b ){
  var abcObject = {
    method1: function(){
        var i;
    },
    method2: function(){
        var i;
    }
};  
}


var anonymus = function(){
  var abs;  
};
