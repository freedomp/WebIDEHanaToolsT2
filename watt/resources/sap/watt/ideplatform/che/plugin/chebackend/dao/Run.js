define(["../io/Request"], function(Request) {
	"use strict";
	var Run = {
		/** 
		 * @private
		 * @memberOf sap.watt.uitools.chebackend.dao.Run
		 * @type {sap.watt.uitools.chebackend.io.Request}
		 */
		_io: Request,

		//TODO: need to connect, login, logout to Che, or can it be assumed that File.js takes care of this?
		//TODO: consider using HATEAOS instead of constructing urls.

		/** Initiates a run process on the Che server
		 * @memberOf sap.watt.uitools.chebackend.dao.run
		 * @param {string} sWorkspaceId The ID (not name) of the workspace in which the project resides
		 * @param {string} sProjectId The ID of the project to run
		 * @return {Promise} a deferred promise that will provide the run's ID
		 */
		doRun: function(sWorkspaceId, sProjectId, oReqBody) {
			var runUrl = "/runner/" + sWorkspaceId + "/run?project=" + sProjectId;
			return this._io.send(runUrl, "POST", {}, oReqBody);
		},

		doStop: function(sWorkspaceId, sRunId) {
			var stopRunUrl = "/runner/" + sWorkspaceId + "/stop/" + sRunId;
			return this._io.send(stopRunUrl, "POST", {}, {});
		},

		getStatus: function(oResponse) {
			if (oResponse) {
				var sRunStatusUrl = "/runner/" + oResponse.workspace + "/status/" + oResponse.processId;
				return this._io.send(sRunStatusUrl, "GET");
			} else {
				throw new Error("Missing params");
			}
		},

		getLog: function(sWorkspaceId, sProcessId) {
			var sRunLogUrl = "/runner/" + sWorkspaceId + "/logs/" + sProcessId;
			return this._io.send(sRunLogUrl, "GET");
		},

		getProcesses: function(sWorkspaceId, sProjectId) {
			var sRunProcessesUrl = "/runner/" + sWorkspaceId + "/processes/?project=" + sProjectId;
			return this._io.send(sRunProcessesUrl, "GET");
		},

		doRefresh: function(sWorkspaceId, sProjectId, oReqBody) {
			var refreshUrl = "/runner/" + sWorkspaceId + "/refresh?project=" + sProjectId;
			return this._io.send(refreshUrl, "POST", {}, oReqBody);
		}

	};

	return Run;

});