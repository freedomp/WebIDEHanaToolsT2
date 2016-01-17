jQuery.sap.declare("s.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.app.Application");
sap.ca.scfld.md.ConfigurationBase.extend("s.Configuration", {
	oServiceParams: {
		serviceList: [
			{
				name: "RMTSAMPLEFLIGHT",
				serviceUrl: "/sap/opu/odata/iwfnd/RMTSAMPLEFLIGHT/", //oData service relative path
				isDefault: true
			},
			{
				name: 'CARTAPPROVAL_STANDARD',
				masterCollection: 'WorkflowTaskCollection',
				serviceUrl: '/sap/opu/odata/GBSRM/CARTAPPROVAL;v=2;o=',
				isDefault: false
			}
		]
	},
	getServiceParams: function () {
		return this.oServiceParams;
	},
	getAppConfig: function() {
		return this.oAppConfig;
	},
	getServiceList: function () {
		return this.oServiceParams.serviceList;
	}
});
