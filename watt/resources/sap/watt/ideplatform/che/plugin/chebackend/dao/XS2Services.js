define([ "../io/Request" ], function(Request) {
	"use strict";
	var XS2Services = {

        /** Returns available XS2 services
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} sProvider the list will be filtered by the value of this field. (e.g hana)
		 * @param {string} sPlan the list will be filtered by the value of this field (e.g hdi-hana)
		 * @return {Promise} a deferred promise that will provide XS2 services intsnaces
		*/
		getAvailableServices : function(sProvider, sPlan) {
            return Request.send("/admin/services?provider=" + sProvider + "&plan=" + sPlan, "GET", {});
		},

         /** Creates a new XS2 service instance
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
	 	 * @param {string} sName the name of the service instance
		 * @param {string} sType the type of the service you want to create (e.g hana)
		 * @param {string} sPlan the plan of the service you want to create (e.g hdi-hana)
		*/
        createService : function(sName, sProvider, sPlan) {
            return Request.send("/admin/services", "POST", {}, {
                serviceName: sName,
                serviceProvider: sProvider,
                servicePlan: sPlan
            });
		},
		/** Delete an XS2 service instance
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
	 	 * @param {string} sName the name of the service instance
		*/
        deleteService : function(sName) {
            return Request.send("/admin/services?serviceName=" + sName, "DELETE", {});
		},

        getAllRequireServices : function(sWorkspaceId, sPath) {
            var url = "/mta/" + sWorkspaceId + "/xsa/services/" + sPath;
            return Request.send(url, "GET", {});
        }

	};

	return XS2Services;

});