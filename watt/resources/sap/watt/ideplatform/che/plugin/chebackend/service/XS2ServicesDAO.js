define(["../dao/XS2Services", "./UserSettingsDAO", "../util/PathMapping"], function(XS2Services, UserSettingsDAO, mPathMapping) {
	"use strict";
	var XS2ServicesDAO = {

		_mWorkspace : mPathMapping.workspace,

		SERVICE_INSTANCE_NAME_ALREADY_EXISTS: "SERVICE_INSTANCE_NAME_ALREADY_EXISTS",
		ILLEGAL_SERVICE_INSTANCE_NAME: "ILLEGAL_SERVICE_INSTANCE_NAME",
		SERVICE_DOES_NOT_EXIST: "SERVICE_DOES_NOT_EXIST",

		SERVICE_NAME_ILLEGAL_CHARACTERS: /[^\w-]/,

		init: function() {
			this.SERVICE_INSTANCE_NAME_ALREADY_EXISTS = this.context.i18n.getText("i18n", "XS2ServicesDAO_errorServiceInstanceNAmeAlreadyExists");
			this.ILLEGAL_SERVICE_INSTANCE_NAME = this.context.i18n.getText("i18n", "XS2ServicesDAO_IllegalServiceInstanceName");
			this.SERVICE_DOES_NOT_EXIST = this.context.i18n.getText("i18n", "XS2ServicesDAO_ServiceDoesNotExist");
		},

		/** Returns available XS2 services
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} sProvider the list will be filtered by the value of this field. (e.g hana)
		 * @param {string} sPlan the list will be filtered by the value of this field (e.g hdi-hana)
		 * @return {Promise} a deferred promise that will provide XS2 services instances
		 */
		getAvailableServices: function(sProvider, sPlan) {
			return XS2Services.getAvailableServices(sProvider, sPlan).fail(function(oError) {
				// unexpected error
				throw new Error(oError.message);
			});
		},

		/** Creates a new XS2 service instance
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} sName the name of the service instance
		 * @param {string} sProvider the type of the service you want to create (e.g hana)
		 * @param {string} sPlan the plan of the service you want to create (e.g hdi-hana)
		 */
		createService: function(sName, sProvider, sPlan) {
			var oDeferred = Q.defer();

			if (this._isServiceNameLegal(sName)) {
				var that = this;
				XS2Services.createService(sName, sProvider, sPlan).then(function() {
					oDeferred.resolve();
				}).fail(function(oError) {
					if (oError.status == "409") {
						oDeferred.reject(new Error(that.SERVICE_INSTANCE_NAME_ALREADY_EXISTS));
					} else {
						// unexpected error
						oDeferred.reject(new Error(oError.message));
					}
				}).done();
			} else {
				oDeferred.reject(new Error(this.ILLEGAL_SERVICE_INSTANCE_NAME));
			}

			return oDeferred.promise;
		},
		
		/** Delete an XS2 service instance
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
	 	 * @param {string} sName the name of the service instance
		*/
        deleteService : function(sName) {
			var oDeferred = Q.defer();

			if (this._isServiceNameLegal(sName)) {
				var that = this;
				XS2Services.deleteService(sName).then(function() {
					oDeferred.resolve();
				}).fail(function(oError) {
					if (oError.status == "404") {
						oDeferred.reject(new Error(that.SERVICE_DOES_NOT_EXIST));
					} else {
						// unexpected error
						oDeferred.reject(new Error(oError.message));
					}
				}).done();
			} else {
				oDeferred.reject(new Error(this.ILLEGAL_SERVICE_INSTANCE_NAME));
			}

			return oDeferred.promise;
		},
		
		/** Attach an XS2 service to a given project
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} sServiceName the name of the service instance
		 * @param {string} sServiceProvider the type of the service (e.g hana)
		 * @param {string} oDocument the current document
		 */
		attachServiceToProject: function(sServiceName, sServiceProvider, oDocument) {
			return UserSettingsDAO.set(sServiceProvider, sServiceName, oDocument);
		},
		
		/** Return active XS2 service name of a given project
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} oDocument the current document
		 * @param {string} sServiceProvider the type of the service (e.g hana)
		 * @return {Promise} a deferred promise that will provide an XS2 service name
		 */
		getProjectActiveServiceName: function(oDocument, sServiceProvider) {
			return UserSettingsDAO.get(sServiceProvider, oDocument);
		},

		/** Return all required XS2 service name of a given module according to project's mta.yaml
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} sPath the full path to the module , e.g. "/mtaProject/js"
		 * @return {Promise} a deferred promise that will provide a json object with all the required resources (services)
		 */
		getAllRequireServices: function(sPath){
			return XS2Services.getAllRequireServices(this._mWorkspace.id, sPath);
		},

		/** Check if service name is legal
		 * @memberOf sap.watt.uitools.chebackend.dao.XS2ServicesDAO
		 * @param {string} sName the service name
		 * @return {boolean} indicates if service name is legal
		 */
		_isServiceNameLegal: function(sName) {
			return !this.SERVICE_NAME_ILLEGAL_CHARACTERS.test(sName);
		}		

	};

	return XS2ServicesDAO;

});